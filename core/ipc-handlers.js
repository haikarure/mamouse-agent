// IPC Handlers for Mamouse Agent
const { ipcMain, shell } = require('electron');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../shared/utils/file-logger');
const { validateApiKey, validateUrl } = require('../shared/utils/validation-utilities');
const { createResponse, createErrorResponse } = require('../shared/utils/text-response-utilities');
const { createContextLogger } = require('../shared/utils/logging-utilities');

// Helper functions for backward compatibility - using centralized logging
const { log, logError, logStatus } = createContextLogger('IPC_HANDLERS');

// Response utilities moved to shared/utils/text-response-utilities.js
const config = require('./config');

// Module dependencies
let mainWindow = null;
let geminiService = null;
let conversationHistory = null;
let saveConfig = null;

// Initialize IPC handlers - Modernized with destructuring
const initializeIpcHandlers = ({ mainWindow: mw, geminiService: gs, conversationHistory: ch, saveConfig: sc }) => {
  // Assign dependencies using modern destructuring
  [mainWindow, geminiService, conversationHistory, saveConfig] = [mw, gs, ch, sc];

  // Setup all handler categories
  setupWindowHandlers();
  setupGeminiHandlers();
  setupUtilityHandlers();
  setupElevenLabsHandlers(); // Re-enabled for Electron voice integration
};

// Window handlers
const setupWindowHandlers = () => {
  // WebSocket port handler
  ipcMain.on('get-ws-port', (event) => {
    event.returnValue = global.wsPort ?? config.webSocket.defaultPort;
  });

  // Mouse event handler
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    if (!mainWindow) return;

    try {
      log(`Setting ignore mouse events: ${ignore}, options:`, options);

      if (ignore === true) {
        options = { forward: true, ...options };
        log('Ensuring forward: true for click-through');
      }

      mainWindow.setIgnoreMouseEvents(ignore, options);
    } catch (error) {
      logError(error, 'Error setting ignore mouse events: ');

      // Fallback without options
      if (error.message?.includes('options')) {
        try {
          log(`Fallback: Setting ignore mouse events without options: ${ignore}`);
          mainWindow.setIgnoreMouseEvents(ignore);
        } catch (fallbackError) {
          logError(fallbackError, 'Fallback error: ');
        }
      }
    }
  });
}

// Gemini API handlers
const setupGeminiHandlers = () => {
  // API key handler - Modernized with 2025 patterns and reduced duplication
  ipcMain.handle('set-gemini-api-key', async (event, apiKey) => {
    try {
      log('Menerima permintaan untuk mengatur API key Gemini');

      // Combined validation with early return
      const localValidation = validateApiKey(apiKey);
      if (!localValidation.valid) {
        log(`API key tidak valid: ${localValidation.message}`);
        return createResponse(false, localValidation.message);
      }

      const validationResult = await geminiService.validateApiKey(apiKey);
      if (!validationResult.valid) {
        log(`API key tidak valid: ${validationResult.message}`);
        return createResponse(false, validationResult.message ?? 'API key tidak valid');
      }

      // Modern assignment and configuration
      log('API key valid, mengatur API key...');
      const result = geminiService.setApiKey(apiKey);
      process.env.GEMINI_API_KEY = apiKey;
      saveConfig({ gemini: { apiKey } });

      return createResponse(result, result ? 'API key berhasil diatur dan disimpan' : 'Gagal mengatur API key');
    } catch (error) {
      logError(error, 'Error saat mengatur API key: ');
      return createErrorResponse(error);
    }
  });

  // Model handler
  ipcMain.handle('set-gemini-model', async (event, model) => {
    try {
      log(`Menerima permintaan untuk mengatur model Gemini: ${model}`);

      const result = geminiService.setModel(model);
      process.env.GEMINI_MODEL = model;
      saveConfig({ gemini: { model } });

      return createResponse(result, result ? 'Model berhasil diatur dan disimpan' : 'Gagal mengatur model');
    } catch (error) {
      logError(error, 'Error saat mengatur model: ');
      return createErrorResponse(error);
    }
  });

  // Status handler
  ipcMain.handle('get-gemini-status', async (event) => {
    try {
      const isInitialized = geminiService.isInitialized();
      const hasApiKey = !!process.env.GEMINI_API_KEY;
      const model = geminiService.model ?? 'Tidak diatur';
      const toolsEnabled = geminiService.toolsEnabled ?? false;

      log(`Status: ${isInitialized ? 'Diinisialisasi' : 'Belum diinisialisasi'}, API Key: ${hasApiKey ? 'Ada' : 'Tidak ada'}`);

      // Validation check
      let validationMessage = null;
      if (hasApiKey && !isInitialized) {
        try {
          const validationResult = await geminiService.validateApiKey(process.env.GEMINI_API_KEY);
          validationMessage = validationResult.message;
        } catch (validationError) {
          logError(validationError, 'Error validasi API key: ');
          validationMessage = `Error validasi: ${validationError.message}`;
        }
      }

      return {
        initialized: isInitialized,
        apiKey: hasApiKey ? '********' : null,
        model,
        toolsEnabled,
        validationMessage,
        timestamp: Date.now()
      };
    } catch (error) {
      logError(error, 'Error mendapatkan status Gemini API: ');
      return {
        initialized: false,
        apiKey: null,
        model: null,
        toolsEnabled: false,
        error: error.message ?? 'Terjadi kesalahan saat mendapatkan status Gemini API',
        timestamp: Date.now()
      };
    }
  });

  // Message handler
  ipcMain.handle('send-message-to-gemini', async (event, message) => {
    try {
      log(`🔧 Sending message to Gemini: ${message}`);

      if (!geminiService) {
        throw new Error('Gemini service not available');
      }

      const response = await geminiService.getResponse(message);

      if (response?.error) {
        throw new Error(response.message ?? 'Gemini API error');
      }

      log('✅ Got response from Gemini');
      return {
        success: true,
        text: response?.text ?? response?.message ?? response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logError(error, '❌ Message handler error: ');
      return {
        success: false,
        error: error.message ?? 'Failed to get response from Gemini'
      };
    }
  });

  // Validation handler - Modernized with centralized validation
  ipcMain.handle('validate-gemini-api-key', async (event, apiKey) => {
    try {
      log('Memvalidasi API key Gemini');

      // Use centralized validation
      const localValidation = validateApiKey(apiKey);
      if (!localValidation.valid) {
        log('API key kosong');
        return { valid: false, message: localValidation.message };
      }

      const result = await geminiService.validateApiKey(apiKey);
      log(`Hasil validasi: ${result.valid ? 'Valid' : 'Invalid'}`);

      return result;
    } catch (error) {
      logError(error, 'Error validasi API key: ');
      return {
        valid: false,
        message: error.message ?? 'Terjadi kesalahan saat memvalidasi API key'
      };
    }
  });

  // Reset handler
  ipcMain.handle('reset-gemini-chat', async (event) => {
    try {
      const result = geminiService.resetChat();
      conversationHistory.length = 0;

      return {
        success: result,
        message: result ? 'Chat berhasil direset' : 'Gagal mereset chat'
      };
    } catch (error) {
      logError(error, 'Error mereset chat: ');
      return {
        success: false,
        message: error.message ?? 'Terjadi kesalahan saat mereset chat'
      };
    }
  });
}

// Utility handlers - Modernized with centralized validation
const setupUtilityHandlers = () => {
  // External URL handler - Using centralized validation
  ipcMain.handle('open-external-url', async (event, url) => {
    try {
      log(`Membuka URL eksternal: ${url}`);

      // Use centralized URL validation
      validateUrl(url);

      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      logError(error, 'Error membuka URL eksternal: ');
      return { success: false, error: error.message };
    }
  });

  // Error logging handler - Modernized
  ipcMain.on('log-error', (event, errorMessage) => {
    try {
      logError(errorMessage, 'Renderer process error: ');
    } catch (error) {
      logError(error, 'Error processing log error: ');
    }
  });
};

// ElevenLabs handlers - Direct integration (no separate backend needed)
const setupElevenLabsHandlers = () => {
  log('Setting up ElevenLabs IPC handlers (Direct Integration)');

  // Simple status check
  ipcMain.handle('get-elevenlabs-status', async (event) => {
    try {
      return createResponse({
        available: true,
        mode: 'direct_integration',
        status: 'ready'
      });
    } catch (error) {
      logError('Failed to get ElevenLabs status:', error);
      return createErrorResponse(error.message);
    }
  });

  log('ElevenLabs IPC handlers setup complete (Direct Integration mode)');
};

module.exports = {
  initializeIpcHandlers
};
