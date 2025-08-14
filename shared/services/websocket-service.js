// WebSocket Service for Mamouse Agent
// Manages WebSocket server, client connections, and message routing

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/file-logger');
const { WEBSOCKET_CONFIG, ERROR_CODES } = require('../../core/constants');

/**
 * WebSocket Service for Mamouse Agent
 * Handles WebSocket server creation, client management, and message routing
 * @class WebSocketService
 */
class WebSocketService {
  constructor() {
    this.server = null;
    this.clients = new Map();
    this.conversationHistory = [];
    this.initialized = false;
    this.currentPort = null;
    this.isCreatingServer = false;
    
    // Message handlers
    this.messageHandlers = new Map();
    this.setupDefaultHandlers();
  }

  /**
   * Initialize WebSocket service
   * @param {Object} options - Configuration options
   * @returns {Promise<boolean>} Success status
   */
  async initialize(options = {}) {
    if (this.initialized) {
      logger.warn('WebSocket Service already initialized', 'WEBSOCKET');
      return true;
    }

    try {
      const config = {
        port: options.port || WEBSOCKET_CONFIG.defaultPort,
        maxAttempts: options.maxAttempts || 10,
        ...options
      };

      logger.info('Initializing WebSocket Service...', 'WEBSOCKET');
      
      // Create server with fallback
      const success = await this.createServerWithFallback(config.port, config.maxAttempts);
      
      if (success) {
        this.initialized = true;
        logger.info('✅ WebSocket Service initialized successfully', 'WEBSOCKET');
        return true;
      } else {
        logger.error('❌ Failed to initialize WebSocket Service', 'WEBSOCKET');
        return false;
      }
      
    } catch (error) {
      logger.error(`Error initializing WebSocket Service: ${error.message}`, 'WEBSOCKET');
      return false;
    }
  }

  /**
   * Create WebSocket server with port fallback
   * @param {number} startPort - Starting port number
   * @param {number} maxAttempts - Maximum attempts
   * @returns {Promise<boolean>} Success status
   */
  async createServerWithFallback(startPort, maxAttempts) {
    let currentPort = startPort;
    let attempts = 0;

    const tryNextPort = () => {
      if (++attempts > maxAttempts) {
        logger.error(`Failed to create WebSocket server after ${maxAttempts} attempts`, 'WEBSOCKET');
        return false;
      }

      // Generate random port in range
      currentPort = Math.floor(Math.random() * (65535 - 12345)) + 12345;
      logger.info(`Trying alternative port: ${currentPort}`, 'WEBSOCKET');
      
      return this.attemptCreateServer(currentPort);
    };

    const handlePortError = (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.warn(`Port ${currentPort} is in use, trying next port...`, 'WEBSOCKET');
        return tryNextPort();
      } else {
        logger.error(`WebSocket server error: ${error.message}`, 'WEBSOCKET');
        return false;
      }
    };

    return new Promise((resolve) => {
      const attemptCreateServer = async (port) => {
        if (this.isCreatingServer) return;
        this.isCreatingServer = true;

        try {
          await this.closeExistingServer();
          logger.info(`Attempting to create WebSocket server on port ${port}...`, 'WEBSOCKET');
          
          this.server = new WebSocket.Server({ port });
          this.currentPort = port;
          global.wsPort = port;
          
          logger.info(`✅ WebSocket server successfully running on port ${port}`, 'WEBSOCKET');
          this.setupEventHandlers();
          
          this.server.on('error', (error) => {
            this.isCreatingServer = false;
            if (!handlePortError(error)) {
              resolve(false);
            }
          });
          
          this.isCreatingServer = false;
          resolve(true);
          
        } catch (error) {
          this.isCreatingServer = false;
          if (!handlePortError(error)) {
            resolve(false);
          }
        }
      };

      // Start first attempt
      attemptCreateServer(currentPort);
    });
  }

  /**
   * Close existing server if it exists
   */
  async closeExistingServer() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.info('Previous WebSocket server closed', 'WEBSOCKET');
          resolve();
        });
      });
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.server) return;

    this.server.on('connection', (ws) => {
      const clientId = uuidv4();
      
      // Store client
      this.clients.set(clientId, {
        id: clientId,
        socket: ws,
        connected: true,
        connectedAt: Date.now()
      });

      logger.info(`Client connected: ${clientId}`, 'WEBSOCKET');
      
      // Clear conversation history for new connection
      this.conversationHistory.length = 0;

      // Handle messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          logger.bubbleDebug(`Message received from ${clientId}: ${message.type}`);
          
          await this.handleMessage(message, ws, clientId);
          
        } catch (error) {
          logger.error(`Error processing message from ${clientId}: ${error.message}`, 'WEBSOCKET');
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`, 'WEBSOCKET');
      });

      // Handle client errors
      ws.on('error', (error) => {
        logger.error(`Client error ${clientId}: ${error.message}`, 'WEBSOCKET');
        this.clients.delete(clientId);
      });
    });
  }

  /**
   * Setup default message handlers
   */
  setupDefaultHandlers() {
    // Message handler
    this.messageHandlers.set('message', async (message, ws, clientId) => {
      if (message.content && typeof message.content === 'string') {
        await this.processUserMessage(message.content, ws);
      } else {
        this.sendError(ws, 'Invalid message content');
      }
    });

    // Status handler
    this.messageHandlers.set('status', (message, ws, clientId) => {
      this.sendMessage(ws, {
        type: 'status',
        data: {
          connected: true,
          clientId: clientId,
          serverTime: Date.now(),
          conversationLength: this.conversationHistory.length
        }
      });
    });

    // History handler
    this.messageHandlers.set('history', (message, ws, clientId) => {
      this.sendMessage(ws, {
        type: 'history',
        data: this.conversationHistory
      });
    });
  }

  /**
   * Handle incoming message
   * @param {Object} message - Parsed message object
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} clientId - Client identifier
   */
  async handleMessage(message, ws, clientId) {
    const handler = this.messageHandlers.get(message.type);
    
    if (handler) {
      await handler(message, ws, clientId);
    } else {
      logger.warn(`Unknown message type: ${message.type}`, 'WEBSOCKET');
      this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Process user message and generate AI response
   * @param {string} messageText - User message text
   * @param {WebSocket} ws - WebSocket connection
   */
  async processUserMessage(messageText, ws) {
    const timestamp = Date.now();
    const aiMessageId = uuidv4();

    // Create message factory
    const createMessage = (overrides) => ({ 
      id: uuidv4(), 
      timestamp, 
      ...overrides 
    });

    // Create and send user message
    const userMessage = createMessage({ 
      text: messageText, 
      isUser: true 
    });
    
    this.conversationHistory.push(userMessage);
    this.sendMessage(ws, { 
      type: 'message', 
      message: userMessage 
    });

    // Create and send AI placeholder message
    const aiMessage = createMessage({ 
      id: aiMessageId, 
      text: '', 
      isUser: false, 
      streaming: true 
    });
    
    this.conversationHistory.push(aiMessage);
    this.sendMessage(ws, { 
      type: 'message', 
      message: aiMessage 
    });

    // Emit event for AI response processing
    this.emit('userMessage', {
      messageText,
      ws,
      aiMessageId,
      conversationHistory: this.conversationHistory
    });
  }

  /**
   * Send message to WebSocket client safely
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} data - Data to send
   */
  sendMessage(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        logger.error(`Error sending WebSocket message: ${error.message}`, 'WEBSOCKET');
      }
    }
  }

  /**
   * Safe WebSocket message sender (extracted from core-utilities.js)
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} data - Data to send
   * @returns {boolean} Success status
   */
  safeSendWebSocket(ws, data) {
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
        return true;
      } catch (error) {
        logger.error(`Error sending WebSocket message: ${error.message}`, 'WEBSOCKET');
        return false;
      }
    }
    logger.warn('WebSocket is not open, cannot send message', 'WEBSOCKET');
    return false;
  }

  /**
   * Send error chunk via WebSocket (extracted from core-utilities.js)
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} messageId - Message ID
   * @param {string} errorMessage - Error message to send
   * @returns {boolean} Success status
   */
  sendErrorChunk(ws, messageId, errorMessage) {
    return this.safeSendWebSocket(ws, JSON.stringify({
      type: 'streamChunk',
      messageId,
      chunk: errorMessage,
      done: true
    }));
  }

  /**
   * Send error message to client
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} errorMessage - Error message
   */
  sendError(ws, errorMessage) {
    this.sendMessage(ws, {
      type: 'error',
      error: errorMessage,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast message to all connected clients
   * @param {Object} data - Data to broadcast
   */
  broadcast(data) {
    this.clients.forEach((client) => {
      if (client.connected && client.socket.readyState === WebSocket.OPEN) {
        this.sendMessage(client.socket, data);
      }
    });
  }

  /**
   * Register custom message handler
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  registerHandler(type, handler) {
    this.messageHandlers.set(type, handler);
    logger.info(`Registered handler for message type: ${type}`, 'WEBSOCKET');
  }

  /**
   * Get server status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      running: !!this.server,
      port: this.currentPort,
      clientCount: this.clients.size,
      conversationLength: this.conversationHistory.length,
      uptime: this.initialized ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Get current port
   * @returns {number} Current port number
   */
  getPort() {
    return this.currentPort || WEBSOCKET_CONFIG.defaultPort;
  }

  /**
   * Cleanup WebSocket service
   */
  cleanup() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    this.clients.clear();
    this.conversationHistory.length = 0;
    this.initialized = false;
    this.currentPort = null;
    
    logger.info('🧹 WebSocket Service cleaned up', 'WEBSOCKET');
  }

  /**
   * Simple event emitter functionality
   */
  emit(event, data) {
    // This would be enhanced with a proper event emitter if needed
    logger.bubbleDebug(`Event emitted: ${event}`);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export service instance and utility functions
module.exports = webSocketService;

// Export utility functions for backward compatibility
module.exports.safeSendWebSocket = webSocketService.safeSendWebSocket.bind(webSocketService);
module.exports.sendErrorChunk = webSocketService.sendErrorChunk.bind(webSocketService);
