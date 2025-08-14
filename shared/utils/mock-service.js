// Mock Service Utilities for Mamouse Agent
// ARCHITECTURAL CORRECTION: Moved from shared/services/mock-service.js to shared/utils/mock-service.js
// REASON: Provides testing utilities and mock implementations - NOT production business service logic
// ARCHITECTURAL MIGRATION: Originally moved from shared/utils/testing-utilities.js
// Provides mock electronAPI service implementation for browser testing support

/**
 * Mock API Manager - Provides mock electronAPI service for browser testing
 * Contains mock implementations for all required electronAPI functions
 */
class MockApiManager {
  constructor() {
    this.isInitialized = false;
    this.mockData = {
      config: {},
      status: {
        initialized: true,
        apiKeyAvailable: true,
        services: ['gemini', 'websocket', 'camera']
      }
    };
  }

  /**
   * Initialize mock API service - Setup mock electronAPI
   */
  initialize() {
    if (this.isInitialized) {
      console.log('🔧 Mock API service already initialized');
      return;
    }

    console.log('🔧 Initializing Mock API service for browser testing...');

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('⚠️ Not in browser environment, skipping mock API setup');
      return;
    }

    // Check if electronAPI already exists (real Electron environment)
    if (window.electronAPI) {
      console.log('✅ Real electronAPI detected, skipping mock setup');
      return;
    }

    // Setup mock electronAPI
    this.setupMockElectronAPI();
    this.isInitialized = true;

    console.log('✅ Mock API service initialized successfully');
  }

  /**
   * Setup mock electronAPI object
   */
  setupMockElectronAPI() {
    window.electronAPI = {
      // IPC communication mocks
      invoke: this.handleMockInvoke.bind(this),
      send: this.handleMockSend.bind(this),
      on: this.handleMockOn.bind(this),
      removeAllListeners: this.handleMockRemoveAllListeners.bind(this),

      // Configuration mocks
      getConfig: async (key) => {
        console.log(`Mock getConfig: ${key}`);
        return this.getMockConfig(key);
      },

      setConfig: async (key, value) => {
        console.log(`Mock setConfig: ${key}`, value);
        return this.setMockConfig(key, value);
      },

      // API key management mocks
      getApiKey: async (service) => {
        console.log(`Mock getApiKey: ${service}`);
        return 'mock-api-key-' + service;
      },

      setApiKey: async (service, key) => {
        console.log(`Mock setApiKey: ${service}`, key);
        return { success: true, message: 'Mock API key set' };
      },

      // Status mocks
      getStatus: async () => {
        console.log('Mock getStatus');
        return {
          initialized: true,
          apiKeyAvailable: true,
          services: ['gemini', 'websocket', 'camera']
        };
      },

      // Window management mocks
      toggleWindow: async () => {
        console.log('Mock toggleWindow');
        return { success: true };
      },

      setIgnoreMouseEvents: async (ignore, options) => {
        console.log(`Mock setIgnoreMouseEvents: ${ignore}`, options);
        return { success: true };
      },

      // Gemini API mocks
      sendMessageToGemini: async (message) => {
        console.log(`Mock sendMessageToGemini: ${message}`);
        return {
          success: true,
          text: `Mock response to: ${message}`,
          timestamp: new Date().toISOString()
        };
      },

      setGeminiModel: async (model) => {
        console.log(`Mock setGeminiModel: ${model}`);
        return { success: true, message: 'Mock model set' };
      },

      setGeminiApiKey: async (apiKey) => {
        console.log(`Mock setGeminiApiKey: ${apiKey}`);
        return { success: true, message: 'Mock API key set' };
      },

      // Camera mocks
      getCameraDevices: async () => {
        console.log('Mock getCameraDevices');
        return [
          { deviceId: 'mock-camera-1', label: 'Mock Camera 1' },
          { deviceId: 'mock-camera-2', label: 'Mock Camera 2' }
        ];
      },

      setCameraDevice: async (deviceId) => {
        console.log(`Mock setCameraDevice: ${deviceId}`);
        return { success: true, message: 'Mock camera device set' };
      },

      // Voice mocks
      getVoiceDevices: async () => {
        console.log('Mock getVoiceDevices');
        return [
          { deviceId: 'mock-mic-1', label: 'Mock Microphone 1' },
          { deviceId: 'mock-mic-2', label: 'Mock Microphone 2' }
        ];
      },

      setVoiceDevice: async (deviceId) => {
        console.log(`Mock setVoiceDevice: ${deviceId}`);
        return { success: true, message: 'Mock voice device set' };
      },

      // File operations mocks
      openFile: async (options) => {
        console.log('Mock openFile', options);
        return { success: true, filePath: 'mock-file-path.txt' };
      },

      saveFile: async (options) => {
        console.log('Mock saveFile', options);
        return { success: true, filePath: 'mock-save-path.txt' };
      },

      // External URL mock
      openExternalUrl: async (url) => {
        console.log(`Mock openExternalUrl: ${url}`);
        return { success: true };
      },

      // Error logging mock
      logError: (errorMessage) => {
        console.log(`Mock logError: ${errorMessage}`);
      },

      // WebSocket port mock
      getWsPort: () => {
        console.log('Mock getWsPort');
        return 12345;
      }
    };

    console.log('🔧 Mock electronAPI object created');
  }

  /**
   * Handle mock invoke calls
   */
  handleMockInvoke(channel, ...args) {
    switch (channel) {
      case 'get-status':
        return Promise.resolve({
          initialized: true,
          apiKeyAvailable: true,
          services: ['gemini', 'websocket', 'camera']
        });

      case 'send-message':
        return Promise.resolve({
          success: true,
          messageId: 'mock-message-' + Date.now(),
          response: 'Mock response from Gemini API'
        });

      case 'get-config':
        return Promise.resolve(this.getMockConfig(args[0]));

      case 'set-config':
        return Promise.resolve(this.setMockConfig(args[0], args[1]));

      default:
        console.warn(`Unhandled mock invoke: ${channel}`);
        return Promise.resolve({ success: true, message: 'Mock response' });
    }
  }

  /**
   * Handle mock send calls
   */
  handleMockSend(channel, ...args) {
    switch (channel) {
      case 'window-ready':
        console.log('Mock window-ready event');
        break;

      case 'ui-interaction':
        console.log('Mock UI interaction', args);
        break;

      default:
        console.log(`Mock send: ${channel}`, args);
    }
  }

  /**
   * Handle mock event listeners
   */
  handleMockOn(channel, callback) {
    console.log(`Mock event listener registered: ${channel}`);
    
    // Simulate some events for testing
    setTimeout(() => {
      switch (channel) {
        case 'window-ready':
          callback();
          break;
        case 'status-update':
          callback({ status: 'ready', message: 'Mock status update' });
          break;
        default:
          console.log(`Mock event triggered: ${channel}`);
      }
    }, 100);
  }

  /**
   * Handle mock removeAllListeners
   */
  handleMockRemoveAllListeners(channel) {
    console.log(`Mock removeAllListeners: ${channel}`);
  }

  /**
   * Get mock configuration
   */
  getMockConfig(key) {
    const mockConfigs = {
      'gemini.apiKey': 'mock-gemini-api-key',
      'gemini.model': 'gemini-2.5-flash',
      'window.alwaysOnTop': true,
      'window.clickThrough': false,
      'camera.defaultDevice': 'mock-camera-1'
    };

    return mockConfigs[key] || null;
  }

  /**
   * Set mock configuration
   */
  setMockConfig(key, value) {
    console.log(`Mock config set: ${key} = ${value}`);
    this.mockData.config[key] = value;
    return { success: true, message: 'Mock config saved' };
  }

  /**
   * Check if mock API service is active
   */
  isActive() {
    return this.isInitialized && typeof window !== 'undefined' && window.electronAPI && !window.electronAPI.isReal;
  }

  /**
   * Get mock API service info
   */
  getInfo() {
    return {
      initialized: this.isInitialized,
      active: this.isActive(),
      mockData: this.mockData
    };
  }
}

// Create global instance
const mockApiManager = new MockApiManager();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mockApiManager.initialize();
    });
  } else {
    mockApiManager.initialize();
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.mockApiManager = mockApiManager;
  window.MockApiManager = MockApiManager;
}

// Node.js exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockApiManager;
}

console.log('✅ Mock Service Utilities loaded (shared/utils) - ARCHITECTURAL CORRECTION: Moved from shared/services/');
