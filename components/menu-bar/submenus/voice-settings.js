/**
 * Voice Settings Component for Menu-Bar
 * Handles voice recognition settings, ElevenLabs API configuration, and audio settings
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// DDR CLEANUP: Voice configuration moved to components/voice/voice-config.js (SSOT)
// Using centralized voice configuration instead of duplicate local config
const VOICE_SETTINGS_CONFIG = window.VoiceConfig || {
  // Fallback config if VoiceConfig not loaded yet
  api: { defaultModel: 'eleven_flash_v2_5' },
  storage: { elevenLabsApiKey: 'elevenlabs_api_key' },
  selectors: { elevenLabsApiKeyInput: '#elevenlabs-api-key' },
  validation: { apiKeyMinLength: 20 }
};

/**
 * VoiceSettings - Comprehensive Voice Configuration Management
 * @class VoiceSettings
 */
class VoiceSettings {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      initialized: false,
      elevenLabsApiKey: null,
      voiceModel: VOICE_SETTINGS_CONFIG.api.defaultModel,
      isValidating: false,
      lastValidation: null
    };

    // Event listeners tracking
    this.#eventListeners = new Map();
    
    console.log('🎤 Voice Settings initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;

  /**
   * Initialize voice settings
   */
  async initialize() {
    try {
      console.log('🎤 Initializing Voice Settings...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Load saved settings
      await this.#loadSettings();

      // Initialize API status
      await this.#initializeApiStatus();

      this.#state.initialized = true;
      console.log('✅ Voice Settings initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Voice Settings:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    const elements = {
      elevenLabsApiKeyInput: document.querySelector(VOICE_SETTINGS_CONFIG.selectors.elevenLabsApiKeyInput),
      voiceModelSelect: document.querySelector(VOICE_SETTINGS_CONFIG.selectors.voiceModelSelect),
      saveElevenLabsBtn: document.querySelector(VOICE_SETTINGS_CONFIG.selectors.saveElevenLabsBtn),
      elevenLabsStatus: document.querySelector(VOICE_SETTINGS_CONFIG.selectors.elevenLabsStatus)
    };

    // Cache elements (some may be null if not present)
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    console.log(`🎤 Cached ${this.#elements.size} voice settings elements`);
  }

  /**
   * Setup event listeners
   */
  #setupEventListeners() {
    const saveElevenLabsBtn = this.#elements.get('saveElevenLabsBtn');
    const elevenLabsApiKeyInput = this.#elements.get('elevenLabsApiKeyInput');
    const voiceModelSelect = this.#elements.get('voiceModelSelect');

    // Save ElevenLabs API key button
    if (saveElevenLabsBtn) {
      const saveHandler = (e) => {
        e.preventDefault();
        this.saveElevenLabsApiKey();
      };
      saveElevenLabsBtn.addEventListener('click', saveHandler);
      this.#eventListeners.set('saveElevenLabs', { element: saveElevenLabsBtn, handler: saveHandler });
    }

    // ElevenLabs API key input validation
    if (elevenLabsApiKeyInput) {
      const inputHandler = (e) => {
        this.#validateApiKeyInput(e.target.value);
      };
      elevenLabsApiKeyInput.addEventListener('input', inputHandler);
      this.#eventListeners.set('elevenLabsInput', { element: elevenLabsApiKeyInput, handler: inputHandler });
    }

    // Voice model selection
    if (voiceModelSelect) {
      const modelHandler = (e) => {
        this.saveVoiceModel(e.target.value);
      };
      voiceModelSelect.addEventListener('change', modelHandler);
      this.#eventListeners.set('voiceModelSelect', { element: voiceModelSelect, handler: modelHandler });
    }

    console.log(`🎤 Setup ${this.#eventListeners.size} voice settings event listeners`);
  }

  /**
   * Load saved settings
   */
  async #loadSettings() {
    try {
      // Load ElevenLabs API key
      const savedApiKey = localStorage.getItem(VOICE_SETTINGS_CONFIG.storage.elevenLabsApiKey);
      if (savedApiKey) {
        this.#state.elevenLabsApiKey = savedApiKey;
        const apiKeyInput = this.#elements.get('elevenLabsApiKeyInput');
        if (apiKeyInput) {
          apiKeyInput.value = savedApiKey;
        }
      }

      // Load voice model
      const savedModel = localStorage.getItem(VOICE_SETTINGS_CONFIG.storage.voiceModel);
      if (savedModel) {
        this.#state.voiceModel = savedModel;
        const modelSelect = this.#elements.get('voiceModelSelect');
        if (modelSelect) {
          modelSelect.value = savedModel;
        }
      }

      console.log('🎤 Loaded voice settings from storage');
    } catch (error) {
      console.warn('⚠️ Failed to load voice settings:', error);
    }
  }

  /**
   * Initialize API status
   */
  async #initializeApiStatus() {
    try {
      if (window.electronAPI && window.electronAPI.getElevenLabsStatus) {
        const status = await window.electronAPI.getElevenLabsStatus();
        this.#updateApiStatus(status);
      } else {
        this.#showApiStatus('info', 'Voice API status unavailable (mock mode)');
      }
    } catch (error) {
      console.warn('⚠️ Failed to get initial voice API status:', error);
      this.#showApiStatus('error', 'Failed to check voice API status');
    }
  }

  /**
   * Validate API key input
   */
  #validateApiKeyInput(apiKey) {
    const config = VOICE_SETTINGS_CONFIG.validation;
    
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
   * Save ElevenLabs API key
   */
  async saveElevenLabsApiKey() {
    try {
      const apiKeyInput = this.#elements.get('elevenLabsApiKeyInput');
      if (!apiKeyInput) {
        console.error('ElevenLabs API key input not found');
        return;
      }

      const apiKey = apiKeyInput.value.trim();

      if (!apiKey) {
        this.#showApiStatus('error', 'ElevenLabs API key tidak boleh kosong');
        return;
      }

      // Validate API key format
      if (!this.#validateApiKeyInput(apiKey)) {
        return;
      }

      this.#state.isValidating = true;
      this.#showApiStatus('info', 'Validating ElevenLabs API key...');

      // Save to storage
      localStorage.setItem(VOICE_SETTINGS_CONFIG.storage.elevenLabsApiKey, apiKey);
      this.#state.elevenLabsApiKey = apiKey;

      // Validate with backend if available
      if (window.electronAPI && window.electronAPI.setElevenLabsApiKey) {
        const result = await window.electronAPI.setElevenLabsApiKey(apiKey);
        
        if (result.success) {
          this.#showApiStatus('success', 'ElevenLabs API key berhasil disimpan dan divalidasi');
        } else {
          this.#showApiStatus('error', result.message || 'Gagal memvalidasi ElevenLabs API key');
        }
      } else {
        this.#showApiStatus('success', 'ElevenLabs API key saved (mock mode)');
      }

    } catch (error) {
      console.error('❌ Error saving ElevenLabs API key:', error);
      this.#showApiStatus('error', 'Gagal menyimpan ElevenLabs API key');
    } finally {
      this.#state.isValidating = false;
    }
  }

  /**
   * Save voice model
   */
  async saveVoiceModel(model) {
    try {
      if (!model) {
        this.#showApiStatus('error', 'Voice model tidak boleh kosong');
        return;
      }

      // Save to storage
      localStorage.setItem(VOICE_SETTINGS_CONFIG.storage.voiceModel, model);
      this.#state.voiceModel = model;

      this.#showApiStatus('info', 'Saving voice model...');

      // Save to backend if available
      if (window.electronAPI && window.electronAPI.setVoiceModel) {
        const result = await window.electronAPI.setVoiceModel(model);
        
        if (result.success) {
          this.#showApiStatus('success', 'Voice model berhasil disimpan');
        } else {
          this.#showApiStatus('error', result.message || 'Gagal menyimpan voice model');
        }
      } else {
        this.#showApiStatus('success', 'Voice model saved (mock mode)');
      }

      console.log('🎤 Voice model saved:', model);

    } catch (error) {
      console.error('❌ Error saving voice model:', error);
      this.#showApiStatus('error', 'Gagal menyimpan voice model');
    }
  }

  /**
   * Show API status message
   */
  #showApiStatus(type, message) {
    const apiStatus = this.#elements.get('elevenLabsStatus');
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

    console.log(`🎤 Voice API Status (${type}): ${message}`);
  }

  /**
   * Update API status from backend
   */
  #updateApiStatus(status) {
    if (status.initialized && status.apiKey) {
      this.#showApiStatus('success', 'ElevenLabs API ready');
    } else if (status.apiKey) {
      this.#showApiStatus('warning', 'API key set but not initialized');
    } else {
      this.#showApiStatus('info', 'No ElevenLabs API key configured');
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      elevenLabsApiKey: this.#state.elevenLabsApiKey,
      voiceModel: this.#state.voiceModel,
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

    console.log('🎤 Voice Settings cleaned up');
  }
}

// Export for use in other modules
export default VoiceSettings;
