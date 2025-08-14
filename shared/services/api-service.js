// API Service for Mamouse Agent
// Centralized API management and configuration

const { logger } = require('../utils/file-logger'); // Updated to use relocated file
const { validateApiKey, validateUrl } = require('../utils/validation-utilities');
const { API_CONFIG, ERROR_CODES } = require('../../core/constants');
const axios = require('axios'); // DDR Cleanup: Use npm axios instead of custom implementation

/**
 * API Service for Mamouse Agent
 * Manages API configurations, keys, and provides centralized API access
 * @class APIService
 */
class APIService {
  constructor() {
    this.apiKeys = new Map();
    this.apiConfigs = new Map();
    this.initialized = false;
    
    // Initialize with default configurations
    this.setupDefaultConfigs();
  }

  /**
   * Initialize API Service
   * @returns {boolean} Success status
   */
  initialize() {
    if (this.initialized) {
      logger.warn('API Service already initialized', 'API_SERVICE');
      return true;
    }

    try {
      logger.info('Initializing API Service...', 'API_SERVICE');
      
      // Load API keys from config
      this.loadApiKeysFromConfig();
      
      this.initialized = true;
      logger.info('✅ API Service initialized successfully', 'API_SERVICE');
      return true;
      
    } catch (error) {
      logger.error(`Failed to initialize API Service: ${error.message}`, 'API_SERVICE');
      return false;
    }
  }

  /**
   * Setup default API configurations
   */
  setupDefaultConfigs() {
    // Gemini API Configuration
    this.apiConfigs.set('gemini', {
      name: 'Google Gemini',
      baseUrl: API_CONFIG.gemini.baseUrl,
      models: API_CONFIG.gemini.models,
      headers: {
        'Content-Type': 'application/json'
      },
      rateLimit: {
        requests: 60,
        window: 60000 // 1 minute
      },
      timeout: 30000
    });

    // ElevenLabs API Configuration
    this.apiConfigs.set('elevenlabs', {
      name: 'ElevenLabs',
      baseUrl: API_CONFIG.elevenlabs.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      rateLimit: {
        requests: 100,
        window: 60000 // 1 minute
      },
      timeout: 60000
    });

    logger.info('Default API configurations set up', 'API_SERVICE');
  }

  /**
   * Load API keys from configuration
   */
  loadApiKeysFromConfig() {
    try {
      const config = require('../../core/config');
      
      // Load Gemini API key
      if (config.gemini?.apiKey) {
        this.setApiKey('gemini', config.gemini.apiKey);
      }

      // Load ElevenLabs API key
      if (config.elevenlabs?.apiKey) {
        this.setApiKey('elevenlabs', config.elevenlabs.apiKey);
      }

      logger.info('API keys loaded from configuration', 'API_SERVICE');
    } catch (error) {
      logger.warn(`Error loading API keys from config: ${error.message}`, 'API_SERVICE');
    }
  }

  /**
   * Set API key for a service
   * @param {string} service - Service name
   * @param {string} apiKey - API key
   * @returns {boolean} Success status
   */
  setApiKey(service, apiKey) {
    try {
      // Validate API key
      const validation = validateApiKey(apiKey);
      if (!validation.valid) {
        logger.error(`Invalid API key for ${service}: ${validation.message}`, 'API_SERVICE');
        return false;
      }

      this.apiKeys.set(service, {
        key: apiKey,
        setAt: Date.now(),
        validated: false
      });

      logger.info(`API key set for service: ${service}`, 'API_SERVICE');
      return true;

    } catch (error) {
      logger.error(`Error setting API key for ${service}: ${error.message}`, 'API_SERVICE');
      return false;
    }
  }

  /**
   * Get API key for a service
   * @param {string} service - Service name
   * @returns {string|null} API key or null if not found
   */
  getApiKey(service) {
    const apiKeyData = this.apiKeys.get(service);
    return apiKeyData ? apiKeyData.key : null;
  }

  /**
   * Validate API key for a service
   * @param {string} service - Service name
   * @param {string} apiKey - API key to validate (optional, uses stored key if not provided)
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey(service, apiKey = null) {
    try {
      const keyToValidate = apiKey || this.getApiKey(service);
      
      if (!keyToValidate) {
        return {
          valid: false,
          error: `No API key found for service: ${service}`
        };
      }

      const config = this.apiConfigs.get(service);
      if (!config) {
        return {
          valid: false,
          error: `Unknown service: ${service}`
        };
      }

      // Perform service-specific validation
      let validationResult;
      
      switch (service) {
        case 'gemini':
          validationResult = await this.validateGeminiKey(keyToValidate);
          break;
        case 'elevenlabs':
          validationResult = await this.validateElevenLabsKey(keyToValidate);
          break;
        default:
          validationResult = await this.validateGenericKey(service, keyToValidate);
      }

      // Update validation status
      if (validationResult.valid && this.apiKeys.has(service)) {
        const keyData = this.apiKeys.get(service);
        keyData.validated = true;
        keyData.validatedAt = Date.now();
      }

      return validationResult;

    } catch (error) {
      logger.error(`Error validating API key for ${service}: ${error.message}`, 'API_SERVICE');
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Gemini API key
   * DDR CLEANUP: Delegate to gemini-service.js to avoid duplicate validation logic
   * @param {string} apiKey - Gemini API key
   * @returns {Promise<Object>} Validation result
   */
  async validateGeminiKey(apiKey) {
    try {
      // Delegate to GeminiService for specialized validation
      const geminiService = require('./gemini-service');
      return await geminiService.validateApiKey(apiKey);
    } catch (error) {
      logger.error(`Error validating Gemini API key: ${error.message}`, 'API_SERVICE');
      return {
        valid: false,
        error: this.parseApiError(error, 'gemini')
      };
    }
  }

  /**
   * Validate ElevenLabs API key
   * @param {string} apiKey - ElevenLabs API key
   * @returns {Promise<Object>} Validation result
   */
  async validateElevenLabsKey(apiKey) {
    try {
      const testUrl = `${API_CONFIG.elevenlabs.baseUrl}/v1/user`;
      
      const response = await axios.get(testUrl, {
        headers: {
          'xi-api-key': apiKey
        },
        timeout: 10000
      });

      if (response.status === 200) {
        return {
          valid: true,
          message: 'ElevenLabs API key is valid'
        };
      } else {
        return {
          valid: false,
          error: `Invalid response: ${response.status}`
        };
      }

    } catch (error) {
      return {
        valid: false,
        error: this.parseApiError(error, 'elevenlabs')
      };
    }
  }

  /**
   * Validate generic API key
   * @param {string} service - Service name
   * @param {string} apiKey - API key
   * @returns {Promise<Object>} Validation result
   */
  async validateGenericKey(service, apiKey) {
    // For unknown services, just validate format
    const validation = validateApiKey(apiKey);
    return {
      valid: validation.valid,
      error: validation.valid ? null : validation.message,
      message: validation.valid ? `API key format is valid for ${service}` : null
    };
  }

  /**
   * Parse API error to user-friendly message
   * @param {Error} error - Error object
   * @param {string} service - Service name
   * @returns {string} User-friendly error message
   */
  parseApiError(error, service) {
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          return 'Invalid API key or unauthorized access';
        case 403:
          return 'API key does not have required permissions';
        case 429:
          return 'Rate limit exceeded, please try again later';
        case 500:
          return `${service} server error, please try again later`;
        default:
          return `API error: ${status} ${error.response.statusText}`;
      }
    } else if (error.code === 'ENOTFOUND') {
      return 'Network error: Unable to reach API server';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Request timeout: API server did not respond';
    } else {
      return error.message || 'Unknown API error';
    }
  }

  /**
   * Make authenticated API request
   * @param {string} service - Service name
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  async makeRequest(service, endpoint, options = {}) {
    try {
      const apiKey = this.getApiKey(service);
      if (!apiKey) {
        throw new Error(`No API key configured for service: ${service}`);
      }

      const config = this.apiConfigs.get(service);
      if (!config) {
        throw new Error(`Unknown service: ${service}`);
      }

      // Build request URL
      const url = endpoint.startsWith('http') ? endpoint : `${config.baseUrl}${endpoint}`;

      // Prepare headers
      const headers = {
        ...config.headers,
        ...options.headers
      };

      // Add service-specific authentication
      switch (service) {
        case 'gemini':
          // Gemini uses API key in URL parameter
          break;
        case 'elevenlabs':
          headers['xi-api-key'] = apiKey;
          break;
        default:
          headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Make request
      const requestOptions = {
        ...options,
        headers,
        timeout: config.timeout
      };

      logger.apiCall(options.method || 'GET', url, 'pending', 0, 'API_SERVICE');
      const startTime = Date.now();

      const response = await axios({
        url,
        ...requestOptions
      });

      const duration = Date.now() - startTime;
      logger.apiCall(options.method || 'GET', url, response.status, duration, 'API_SERVICE');

      return response;

    } catch (error) {
      logger.error(`API request failed for ${service}: ${error.message}`, 'API_SERVICE');
      throw error;
    }
  }

  /**
   * Get API service status
   * @returns {Object} Status information
   */
  getStatus() {
    const services = {};
    
    for (const [service, keyData] of this.apiKeys.entries()) {
      services[service] = {
        hasKey: true,
        validated: keyData.validated,
        setAt: keyData.setAt,
        validatedAt: keyData.validatedAt || null
      };
    }

    return {
      initialized: this.initialized,
      configuredServices: Array.from(this.apiConfigs.keys()),
      servicesWithKeys: Array.from(this.apiKeys.keys()),
      services: services
    };
  }

  /**
   * Remove API key for a service
   * @param {string} service - Service name
   * @returns {boolean} Success status
   */
  removeApiKey(service) {
    const removed = this.apiKeys.delete(service);
    if (removed) {
      logger.info(`API key removed for service: ${service}`, 'API_SERVICE');
    }
    return removed;
  }

  /**
   * Clear all API keys
   */
  clearAllKeys() {
    this.apiKeys.clear();
    logger.info('All API keys cleared', 'API_SERVICE');
  }

  /**
   * Cleanup API Service
   */
  cleanup() {
    this.apiKeys.clear();
    this.apiConfigs.clear();
    this.initialized = false;
    logger.info('🧹 API Service cleaned up', 'API_SERVICE');
  }
}

// Create singleton instance
const apiService = new APIService();

module.exports = apiService;
