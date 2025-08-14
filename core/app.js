const { app, BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // DDR FIX: Added missing import for uuidv4
const dotenv = require('dotenv');
const config = require('./config');
const geminiService = require('../shared/services/gemini-service');
const cameraService = require('../components/camera/camera-service'); // ARCHITECTURAL MIGRATION: Moved to camera component folder
const webSocketService = require('../shared/services/websocket-service');
const apiService = require('../shared/services/api-service');
const mcpServer = require('../shared/services/mcp-server');
const toolsManager = require('../shared/services/tool-manager-service');
const messageService = require('../shared/services/message-service'); // EXTRACTED: Message processing service
// ElevenLabs services moved to frontend (renderer process)
// DDR CLEANUP: ElevenLabs services moved to components/voice/ (SSOT)
const { initializeIpcHandlers } = require('./ipc-handlers');
const { logger } = require('../shared/utils/file-logger');
const ConfigManager = require('./config-manager');
const WindowService = require('../components/window/window-service');
const WindowZoom = require('../components/window/window-zoom'); // EXTRACTED: Window zoom functionality
const { createContextLogger } = require('../shared/utils/logging-utilities');

// Load environment variables
dotenv.config();

// Configuration Manager will be initialized after app is ready
let configManager = null;

// Constants moved to config.js for better organization

// Window configuration moved to config.js

// Utility functions moved to shared/utils/text-response-utilities.js

// Helper functions for backward compatibility - using centralized logging
const { log, logError, logStatus } = createContextLogger('APP');

// DDR CLEANUP: Duplicate getApiKey() function removed - use configManager.getApiKey() instead

// API key loading moved to config-manager.js

// Initialize all shared services
const initializeSharedServices = async () => {
  logger.info('Initializing shared services...', 'APP');

  try {
    // Initialize API Service first
    const apiInitResult = apiService.initialize();
    if (apiInitResult) {
      logger.info('✅ API Service initialized successfully', 'APP');
    } else {
      logger.warn('⚠️ API Service failed to initialize', 'APP');
    }

    // Initialize WebSocket Service
    const wsInitResult = await webSocketService.initialize();
    if (wsInitResult) {
      logger.info('✅ WebSocket Service initialized successfully', 'APP');
    } else {
      logger.warn('⚠️ WebSocket Service failed to initialize', 'APP');
    }

    // Initialize Message Service
    const messageInitResult = messageService.initialize(geminiService, configManager);
    if (messageInitResult) {
      logger.info('✅ Message Service initialized successfully', 'APP');
    } else {
      logger.warn('⚠️ Message Service failed to initialize', 'APP');
    }

    // Initialize Camera Service if enabled
    if (config.camera?.enabled) {
      const cameraInitResult = cameraService.initialize();
      if (cameraInitResult) {
        logger.info('✅ Camera Service initialized successfully', 'APP');
      } else {
        logger.warn('⚠️ Camera Service failed to initialize', 'APP');
      }
    } else {
      logger.info('📝 Camera Service disabled in configuration', 'APP');
    }

    // Initialize MCP Server
    const mcpInitResult = mcpServer.initialize();
    if (mcpInitResult) {
      logger.info('✅ MCP Server initialized successfully', 'APP');
    } else {
      logger.warn('⚠️ MCP Server failed to initialize', 'APP');
    }

    // ElevenLabs Services moved to frontend (renderer process)
    // Frontend will handle ElevenLabs conversation directly using browser APIs
    logger.info('📝 ElevenLabs services handled in frontend (renderer process)', 'APP');

    // Initialize Tools Manager
    const toolsInitResult = toolsManager.initialize();
    if (toolsInitResult) {
      logger.info('✅ Tools Manager initialized successfully', 'APP');
    } else {
      logger.warn('⚠️ Tools Manager failed to initialize', 'APP');
    }

    logger.info('🎉 Shared services initialization complete', 'APP');

  } catch (error) {
    logger.error(`Error initializing shared services: ${error.message}`, 'APP');
  }
};

// Shutdown all shared services
const shutdownSharedServices = () => {
  logger.info('Shutting down shared services...', 'APP');

  try {
    // Shutdown Message Service
    messageService.cleanup();
    logger.info('✅ Message Service shutdown complete', 'APP');

    // Shutdown Camera Service
    if (config.camera?.enabled) {
      cameraService.cleanup();
      logger.info('✅ Camera Service shutdown complete', 'APP');
    }

    // Shutdown MCP Server
    mcpServer.shutdown();
    logger.info('✅ MCP Server shutdown complete', 'APP');

    // Shutdown Tools Manager
    toolsManager.cleanup();
    logger.info('✅ Tools Manager shutdown complete', 'APP');

    // Shutdown WebSocket Service
    webSocketService.cleanup();
    logger.info('✅ WebSocket Service shutdown complete', 'APP');

    // Shutdown API Service
    apiService.cleanup();
    logger.info('✅ API Service shutdown complete', 'APP');

    logger.info('🧹 All shared services shutdown complete', 'APP');

  } catch (error) {
    logger.error(`Error shutting down shared services: ${error.message}`, 'APP');
  }
};

// Global variables
let mainWindow = null;
let isWindowVisible = true;

// Initialize Window Service and Zoom
const windowService = new WindowService(config);
const windowZoom = new WindowZoom();

// Single instance management
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log('Aplikasi sudah berjalan. Keluar dari instance ini.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('Instance kedua terdeteksi, toggle window visibility');
    if (mainWindow) toggleWindowVisibility();
  });
}

// Window management - Delegated to WindowService
const toggleWindowVisibility = () => {
  windowService.toggleWindowVisibility();
  // Update local state for backward compatibility
  isWindowVisible = windowService.isVisible();
};

// EXTRACTED: Message processing functions moved to shared/services/message-service.js
// Use messageService.processUserMessage() and messageService.getStreamingAIResponse() instead

// EXTRACTED: conversationHistory moved to shared/services/message-service.js
// Use messageService.getConversationHistory() to access conversation history

// Create main window - Delegated to WindowService
const createWindow = () => {
  // Create window using WindowService
  mainWindow = windowService.createWindow();

  // Update local state for backward compatibility
  isWindowVisible = windowService.isVisible();

  // DDR CLEANUP: Voice permissions setup moved to components/voice/voice-service.js (SSOT)
  // Voice permissions will be setup when voice component initializes

  // Initialize IPC handlers
  initializeIpcHandlers({
    mainWindow,
    geminiService,
    conversationHistory: messageService.getConversationHistory(),
    messageService, // EXTRACTED: Pass message service for message processing
    saveConfig: (data) => configManager.saveConfig(data)
  });

  // DDR CLEANUP: setupWebSocketMessageHandler() call removed - handled by websocket-service.js

  // Initialize shared services
  initializeSharedServices();

  // Setup additional window event handlers for non-window functionality
  setupAdditionalWindowHandlers();
}

// DDR CLEANUP: setupVoicePermissions() moved to components/voice/voice-service.js (SSOT)
// Voice permissions are now handled by the voice component during initialization

// Setup additional window event handlers for non-window functionality
const setupAdditionalWindowHandlers = () => {
  if (!mainWindow) return;

  // Window closed event handler for cleanup
  mainWindow.on('closed', function () {
    isWindowVisible = false;
    mainWindow = null;

    // Shutdown shared services
    shutdownSharedServices();
  });
};

// DDR CLEANUP: setupWebSocketMessageHandler() function removed - redundant with websocket-service.js
// Message handling is now properly managed by websocket-service.js with registered handlers



// EXTRACTED: processUserMessage moved to shared/services/message-service.js
// Use messageService.processUserMessage() instead

// DDR CLEANUP: setupWebSocketEventHandlers() function removed - dead code (wsServer undefined)
// WebSocket event handling is now properly managed by websocket-service.js



// EXTRACTED: Zoom functionality moved to components/window/window-zoom.js
// Use windowZoom.initialize() and windowZoom.setupZoomShortcuts() instead

// App ready handler
app.on('ready', () => {
  // Initialize Configuration Manager after app is ready
  configManager = new ConfigManager();
  configManager.initialize();

  // Initialize WindowService
  windowService.initialize();

  configManager.loadGeminiConfig(geminiService);
  createWindow();

  // Initialize window zoom functionality with config manager for auto-save
  windowZoom.initialize(mainWindow, configManager);
});

// App event handlers are now managed by WindowService
// Keep only non-window specific handlers here
