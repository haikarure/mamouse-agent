/**
 * Gemini Settings Component for Menu-Bar
 * Handles Gemini API configuration, model selection, and validation
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Gemini Settings Configuration
const GEMINI_SETTINGS_CONFIG = {
  // API Configuration
  api: {
    defaultModel: 'gemini-2.5-flash',
    availableModels: [
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ]
  },

  // Storage Keys
  storage: {
    apiKey: 'gemini_api_key',
    model: 'gemini_model',
    settings: 'gemini_settings'
  },

  // Element Selectors
  selectors: {
    apiKeyInput: '#gemini-api-key',
    modelSelect: '#gemini-model',
    customModelSelect: '#gemini-model-custom',
    saveApiKeyBtn: '#save-api-key-btn',
    apiStatus: '#api-status'
  },

  // Validation
  validation: {
    apiKeyMinLength: 30,
    apiKeyPattern: /^[A-Za-z0-9_-]+$/
  }
};

/**
 * GeminiSettings - Comprehensive Gemini API Management
 * @class GeminiSettings
 */
class GeminiSettings {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      initialized: false,
      apiKey: null,
      model: GEMINI_SETTINGS_CONFIG.api.defaultModel,
      isValidating: false,
      lastValidation: null
    };

    // Event listeners tracking
    this.#eventListeners = new Map();
    
    console.log('📋 Gemini Settings initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;

  /**
   * Initialize Gemini settings
   */
  async initialize() {
    try {
      console.log('📋 Initializing Gemini Settings...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Load saved settings
      await this.#loadSettings();

      // Initialize API status
      await this.#initializeApiStatus();

      this.#state.initialized = true;
      console.log('✅ Gemini Settings initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Gemini Settings:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    const elements = {
      apiKeyInput: document.querySelector(GEMINI_SETTINGS_CONFIG.selectors.apiKeyInput),
      modelSelect: document.querySelector(GEMINI_SETTINGS_CONFIG.selectors.modelSelect),
      customModelSelect: document.querySelector(GEMINI_SETTINGS_CONFIG.selectors.customModelSelect),
      saveApiKeyBtn: document.querySelector(GEMINI_SETTINGS_CONFIG.selectors.saveApiKeyBtn),
      apiStatus: document.querySelector(GEMINI_SETTINGS_CONFIG.selectors.apiStatus)
    };

    // Cache elements (some may be null if not present)
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    console.log(`📋 Cached ${this.#elements.size} Gemini settings elements`);
  }

  /**
   * Setup event listeners
   */
  #setupEventListeners() {
    const saveApiKeyBtn = this.#elements.get('saveApiKeyBtn');
    const apiKeyInput = this.#elements.get('apiKeyInput');
    const modelSelect = this.#elements.get('modelSelect');

    // Save API key button
    if (saveApiKeyBtn) {
      const saveHandler = (e) => {
        e.preventDefault();
        this.saveApiKey();
      };
      saveApiKeyBtn.addEventListener('click', saveHandler);
      this.#eventListeners.set('saveApiKey', { element: saveApiKeyBtn, handler: saveHandler });
    }

    // API key input validation
    if (apiKeyInput) {
      const inputHandler = (e) => {
        this.#validateApiKeyInput(e.target.value);
      };
      apiKeyInput.addEventListener('input', inputHandler);
      this.#eventListeners.set('apiKeyInput', { element: apiKeyInput, handler: inputHandler });
    }

    // Model selection
    if (modelSelect) {
      const modelHandler = (e) => {
        this.saveModel(e.target.value);
      };
      modelSelect.addEventListener('change', modelHandler);
      this.#eventListeners.set('modelSelect', { element: modelSelect, handler: modelHandler });
    }

    console.log(`📋 Setup ${this.#eventListeners.size} Gemini settings event listeners`);
  }

  /**
   * Load saved settings
   */
  async #loadSettings() {
    try {
      // Load API key
      const savedApiKey = localStorage.getItem(GEMINI_SETTINGS_CONFIG.storage.apiKey);
      if (savedApiKey) {
        this.#state.apiKey = savedApiKey;
        const apiKeyInput = this.#elements.get('apiKeyInput');
        if (apiKeyInput) {
          apiKeyInput.value = savedApiKey;
        }
      }

      // Load model
      const savedModel = localStorage.getItem(GEMINI_SETTINGS_CONFIG.storage.model);
      if (savedModel) {
        this.#state.model = savedModel;
        const modelSelect = this.#elements.get('modelSelect');
        if (modelSelect) {
          modelSelect.value = savedModel;
        }
      }

      console.log('📋 Loaded Gemini settings from storage');
    } catch (error) {
      console.warn('⚠️ Failed to load Gemini settings:', error);
    }
  }

  /**
   * Initialize API status
   */
  async #initializeApiStatus() {
    try {
      if (window.electronAPI && window.electronAPI.getGeminiStatus) {
        const status = await window.electronAPI.getGeminiStatus();
        this.#updateApiStatus(status);
      } else {
        this.#showApiStatus('info', 'API status unavailable (mock mode)');
      }
    } catch (error) {
      console.warn('⚠️ Failed to get initial API status:', error);
      this.#showApiStatus('error', 'Failed to check API status');
    }
  }

  /**
   * Validate API key input
   */
  #validateApiKeyInput(apiKey) {
    const config = GEMINI_SETTINGS_CONFIG.validation;
    
    if (!apiKey || apiKey.length < config.apiKeyMinLength) {
      this.#showApiStatus('warning', 'API key too short');
      return false;
    }

    if (!config.apiKeyPattern.test(apiKey)) {
      this.#showApiStatus('warning', 'Invalid API key format');
      return false;
    }

    this.#showApiStatus('info', 'API key format valid');
    return true;
  }

  /**
   * Save Gemini API key
   */
  async saveApiKey() {
    try {
      const apiKeyInput = this.#elements.get('apiKeyInput');
      if (!apiKeyInput) {
        console.error('API key input not found');
        return;
      }

      const apiKey = apiKeyInput.value.trim();

      if (!apiKey) {
        this.#showApiStatus('error', 'API key tidak boleh kosong');
        return;
      }

      // Validate API key format
      if (!this.#validateApiKeyInput(apiKey)) {
        return;
      }

      this.#state.isValidating = true;
      this.#showApiStatus('info', 'Validating API key...');

      // Save to storage
      localStorage.setItem(GEMINI_SETTINGS_CONFIG.storage.apiKey, apiKey);
      this.#state.apiKey = apiKey;

      // Validate with backend if available
      if (window.electronAPI && window.electronAPI.setGeminiApiKey) {
        const result = await window.electronAPI.setGeminiApiKey(apiKey);
        
        if (result.success) {
          this.#showApiStatus('success', 'API key berhasil disimpan dan divalidasi');
        } else {
          this.#showApiStatus('error', result.message || 'Gagal memvalidasi API key');
        }
      } else {
        this.#showApiStatus('success', 'API key saved (mock mode)');
      }

    } catch (error) {
      console.error('❌ Error saving API key:', error);
      this.#showApiStatus('error', 'Gagal menyimpan API key');
    } finally {
      this.#state.isValidating = false;
    }
  }

  /**
   * Save Gemini model
   */
  async saveModel(model) {
    try {
      if (!model) {
        this.#showApiStatus('error', 'Model tidak boleh kosong');
        return;
      }

      // Save to storage
      localStorage.setItem(GEMINI_SETTINGS_CONFIG.storage.model, model);
      this.#state.model = model;

      this.#showApiStatus('info', 'Saving model...');

      // Save to backend if available
      if (window.electronAPI && window.electronAPI.setGeminiModel) {
        const result = await window.electronAPI.setGeminiModel(model);
        
        if (result.success) {
          this.#showApiStatus('success', 'Model berhasil disimpan');
        } else {
          this.#showApiStatus('error', result.message || 'Gagal menyimpan model');
        }
      } else {
        this.#showApiStatus('success', 'Model saved (mock mode)');
      }

      console.log('📋 Gemini model saved:', model);

    } catch (error) {
      console.error('❌ Error saving model:', error);
      this.#showApiStatus('error', 'Gagal menyimpan model');
    }
  }

  /**
   * Show API status message
   */
  #showApiStatus(type, message) {
    const apiStatus = this.#elements.get('apiStatus');
    if (!apiStatus) return;

    // Clear previous classes
    apiStatus.className = 'api-status';

    // Add type class
    apiStatus.classList.add(`api-status-${type}`);

    // Set message
    apiStatus.textContent = message;

    // Auto-hide info messages after 3 seconds
    if (type === 'info') {
      setTimeout(() => {
        if (apiStatus.textContent === message) {
          apiStatus.textContent = '';
          apiStatus.className = 'api-status';
        }
      }, 3000);
    }

    console.log(`📋 API Status (${type}): ${message}`);
  }

  /**
   * Update API status from backend
   */
  #updateApiStatus(status) {
    if (status.initialized && status.apiKey) {
      this.#showApiStatus('success', 'Gemini API ready');
    } else if (status.apiKey) {
      this.#showApiStatus('warning', 'API key set but not initialized');
    } else {
      this.#showApiStatus('info', 'No API key configured');
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      apiKey: this.#state.apiKey,
      model: this.#state.model,
      isValidating: this.#state.isValidating,
      lastValidation: this.#state.lastValidation
    };
  }

  /**
   * Get state
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.#state.initialized;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Remove event listeners
    this.#eventListeners.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
      element.removeEventListener('input', handler);
      element.removeEventListener('change', handler);
    });
    this.#eventListeners.clear();

    // Clear cached elements
    this.#elements.clear();

    console.log('📋 Gemini Settings cleaned up');
  }
}

// Export for use in other modules
export default GeminiSettings;
