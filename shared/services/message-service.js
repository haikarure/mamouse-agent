// Message Service for Mamouse Agent
// EXTRACTED: From core/app.js for proper service architecture
// Handles message processing, conversation history, and AI response streaming

const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/file-logger');
const { 
  extractChunkText, 
  truncateText, 
  handleServiceError 
} = require('../utils/text-response-utilities');
const { sendErrorChunk, safeSendWebSocket } = require('./websocket-service');
const { createContextLogger } = require('../utils/logging-utilities');

// Helper functions for logging
const { log, logError, logStatus } = createContextLogger('MESSAGE_SERVICE');

/**
 * Message Service for handling conversation and AI responses
 * @class MessageService
 */
class MessageService {
  constructor() {
    this.conversationHistory = [];
    this.initialized = false;
    this.geminiService = null;
    this.configManager = null;
  }

  /**
   * Initialize the message service
   * @param {Object} geminiService - Gemini service instance
   * @param {Object} configManager - Config manager instance
   * @returns {boolean} Success status
   */
  initialize(geminiService, configManager = null) {
    try {
      this.geminiService = geminiService;
      this.configManager = configManager;
      this.initialized = true;
      log('Message Service initialized successfully');
      return true;
    } catch (error) {
      logError(error, 'Error initializing Message Service: ');
      return false;
    }
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history array
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.conversationHistory.length = 0;
    log('Conversation history cleared');
  }

  /**
   * Add message to conversation history
   * @param {Object} message - Message object
   */
  addToHistory(message) {
    this.conversationHistory.push(message);
  }

  /**
   * Process user message and initiate AI response
   * EXTRACTED: From core/app.js processUserMessage() function
   * @param {string} messageText - User message text
   * @param {WebSocket} ws - WebSocket connection
   */
  processUserMessage(messageText, ws) {
    const timestamp = Date.now();
    const aiMessageId = uuidv4();

    // Modern object creation with shared properties
    const createMessage = (overrides) => ({ id: uuidv4(), timestamp, ...overrides });

    // Create and send user message
    const userMessage = createMessage({ text: messageText, isUser: true });
    this.conversationHistory.push(userMessage);
    safeSendWebSocket(ws, JSON.stringify({ type: 'message', message: userMessage }));

    // Create and send AI placeholder message
    const aiMessage = createMessage({ id: aiMessageId, text: '', isUser: false, streaming: true });
    this.conversationHistory.push(aiMessage);
    safeSendWebSocket(ws, JSON.stringify({ type: 'message', message: aiMessage }));

    // Start streaming response
    this.getStreamingAIResponse(messageText, ws, aiMessageId);
  }

  /**
   * Get streaming AI response from Gemini API
   * EXTRACTED: From core/app.js getStreamingAIResponse() function
   * @param {string} message - User message
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} messageId - Message ID for tracking
   */
  async getStreamingAIResponse(message, ws, messageId) {
    try {
      if (ws?.readyState !== WebSocket.OPEN) {
        logError('WebSocket is not open, cannot process streaming request');
        return;
      }

      logger.bubbleDebug(`Memproses permintaan streaming untuk pesan ID: ${messageId}`);
      logger.bubbleDebug(`Pesan: ${message}`);

      const isInitialized = this.geminiService.isInitialized();
      logger.bubbleDebug(`Status inisialisasi Gemini API: ${isInitialized ? 'Sudah diinisialisasi' : 'Belum diinisialisasi'}`);

      if (!isInitialized) {
        log('Gemini API belum diinisialisasi, mencoba inisialisasi...');

        // Get API key from config manager
        const apiKey = await this.getApiKey();
        if (!apiKey) {
          log('Gemini API key tidak ditemukan. Menggunakan respons simulasi.', 'warn');
          sendErrorChunk(ws, messageId, `Respons simulasi: "${message}" (API key tidak ditemukan)`);
          return;
        }

        const setResult = this.geminiService.setApiKey(apiKey);
        logStatus(setResult, 'Hasil pengaturan API key: Berhasil', 'Hasil pengaturan API key: Gagal');

        const nowInitialized = this.geminiService.isInitialized();
        logStatus(nowInitialized, 'Status inisialisasi: Berhasil', 'Status inisialisasi: Gagal');

        if (!nowInitialized) {
          log('Gemini API masih belum diinisialisasi. Menggunakan respons simulasi.', 'warn');
          sendErrorChunk(ws, messageId, `Respons simulasi: "${message}" (Gemini API gagal diinisialisasi)`);
          return;
        }
      }

      log('Memulai streaming respons dari Gemini API...');
      logger.bubbleDebug('Memanggil geminiService.getStreamingResponse...');
      await this.geminiService.getStreamingResponse(message, (chunk) => {
        try {
          if (!chunk) {
            logError('Chunk kosong diterima dari Gemini API');
            sendErrorChunk(ws, messageId, 'Tidak ada respons dari Gemini API (chunk kosong)');
            return;
          }

          if (chunk?.error) {
            logError(`Error dari Gemini API streaming: ${chunk?.message}`);
            sendErrorChunk(ws, messageId, `Maaf, terjadi kesalahan saat berkomunikasi dengan AI: ${chunk?.message}`);
            return;
          }

          if (chunk?.toolCall) {
            const toolSent = safeSendWebSocket(ws, JSON.stringify({
              type: 'toolResult',
              messageId,
              toolName: chunk?.toolName,
              toolParams: chunk?.toolParams,
              toolResult: chunk?.toolResult,
              done: false
            }));
            logStatus(toolSent, `Tool result sent: ${chunk?.toolName}`, `Failed to send tool result: ${chunk?.toolName}`);
            return;
          }

          const chunkText = extractChunkText(chunk);
          log(`Chunk diterima: ${truncateText(chunkText)}, done: ${chunk?.done}`);

          const chunkSent = safeSendWebSocket(ws, JSON.stringify({
            type: 'streamChunk',
            messageId,
            chunk: chunkText,
            done: chunk?.done
          }));

          logStatus(chunkSent, `Stream chunk sent (${chunkText.length} chars)`, 'Failed to send stream chunk');
          if (chunk?.done) log(`Streaming selesai untuk pesan ID: ${messageId}`);
        } catch (chunkError) {
          handleServiceError(chunkError, 'memproses chunk');
          sendErrorChunk(ws, messageId, `Maaf, terjadi kesalahan saat memproses respons: ${chunkError.message ?? 'Unknown error'}`);
        }
      });

      log(`Permintaan streaming untuk pesan ID: ${messageId} selesai diproses`);
    } catch (error) {
      logger.error(`Error saat mendapatkan respons streaming AI: ${error.message}`, 'BUBBLE_DEBUG');
      logger.error(`Stack trace: ${error.stack}`, 'BUBBLE_DEBUG');

      const errorSent = sendErrorChunk(ws, messageId, `Maaf, terjadi kesalahan: ${error.message ?? 'Unknown error'}`);
      if (!errorSent) {
        logger.error('Gagal mengirim pesan error ke client - WebSocket tidak tersedia', 'BUBBLE_DEBUG');
      }
    }
  }

  /**
   * Get API key from config manager
   * @returns {Promise<string|null>} API key or null
   */
  async getApiKey() {
    if (this.configManager) {
      return await this.configManager.getApiKey();
    }
    return process.env.GEMINI_API_KEY || null;
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      conversationCount: this.conversationHistory.length,
      hasGeminiService: !!this.geminiService,
      hasConfigManager: !!this.configManager
    };
  }

  /**
   * Cleanup service
   */
  cleanup() {
    this.conversationHistory.length = 0;
    this.geminiService = null;
    this.configManager = null;
    this.initialized = false;
    log('Message Service cleanup complete');
  }
}

// Create singleton instance
const messageService = new MessageService();

module.exports = messageService;
