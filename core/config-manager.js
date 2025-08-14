// Configuration Manager untuk Mamouse Agent
const fs = require('fs');
const path = require('path');
const { logger } = require('../shared/utils/file-logger');
const { validateConfigData } = require('../shared/utils/validation-utilities');
const { createContextLogger } = require('../shared/utils/logging-utilities');

// DDR CLEANUP: Duplicate logging functions replaced with centralized logging
const { log, logError, logStatus } = createContextLogger('CONFIG_MANAGER');

class ConfigManager {
  constructor(configFileName = 'mamouse-config.json') {
    // Initialize without Electron app dependency
    this.configFileName = configFileName;
    this.userDataPath = null;
    this.configFilePath = null;
    this.initialized = false;
  }

  /**
   * Initialize the config manager with proper paths
   * Should be called after Electron app is ready
   */
  initialize() {
    try {
      // Try to get Electron app path if available
      const { app } = require('electron');
      if (app && app.getPath) {
        this.userDataPath = app.getPath('userData');
      } else {
        // Fallback to current directory
        this.userDataPath = path.join(process.cwd(), 'user-data');
      }
    } catch (error) {
      // Fallback if Electron is not available
      this.userDataPath = path.join(process.cwd(), 'user-data');
    }

    this.configFilePath = path.join(this.userDataPath, this.configFileName);
    this.initialized = true;
    log(`ConfigManager initialized with path: ${this.configFilePath}`);
  }

  /**
   * Ensure the config manager is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      this.initialize();
    }
  }

  // Save configuration to file - Modernized with validation and better structure
  saveConfig(data) {
    try {
      // Ensure config manager is initialized
      this.ensureInitialized();

      // Validate input data using centralized validator
      if (!validateConfigData(data)) {
        log('Data konfigurasi tidak valid');
        return false;
      }

      // Ensure directory exists
      this.ensureDirectoryExists();

      // Load and merge configurations
      const existingConfig = this.loadExistingConfig();
      const newConfig = this.deepMerge(existingConfig, data);

      // Write config file atomically
      fs.writeFileSync(this.configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
      log(`Konfigurasi berhasil disimpan ke: ${this.configFilePath}`);

      return true;
    } catch (error) {
      logError(error, 'Error menyimpan konfigurasi: ');
      return false;
    }
  }

  // Helper method to ensure directory exists
  ensureDirectoryExists() {
    if (!fs.existsSync(this.userDataPath)) {
      fs.mkdirSync(this.userDataPath, { recursive: true });
    }
  }

  // Helper method to load existing config
  loadExistingConfig() {
    if (!fs.existsSync(this.configFilePath)) return {};

    const fileContent = fs.readFileSync(this.configFilePath, 'utf8');
    return fileContent.trim() ? JSON.parse(fileContent) : {};
  }

  // Deep merge objects - Modernized with better performance
  deepMerge(target, source) {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        const isTargetObject = key in target && this.isObject(target[key]);
        const isSourceObject = this.isObject(source[key]);

        output[key] = isTargetObject && isSourceObject
          ? this.deepMerge(target[key], source[key])
          : source[key];
      });
    }

    return output;
  }

  // Check if item is object
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Load configuration from file - Modernized with better error handling
  loadConfig() {
    try {
      // Ensure config manager is initialized
      this.ensureInitialized();

      if (!fs.existsSync(this.configFilePath)) {
        this.createEmptyConfig();
        return {};
      }

      const fileContent = fs.readFileSync(this.configFilePath, 'utf8');
      if (!fileContent.trim()) return {};

      try {
        return JSON.parse(fileContent);
      } catch (parseError) {
        logError(parseError, 'Error parsing file konfigurasi: ');
        this.createEmptyConfig();
        return {};
      }
    } catch (error) {
      logError(error, 'Error memuat konfigurasi: ');
      return {};
    }
  }

  // Create empty config file - Modernized to use ensureDirectoryExists
  createEmptyConfig() {
    this.ensureInitialized();
    this.ensureDirectoryExists();
    fs.writeFileSync(this.configFilePath, '{}', 'utf8');
  }

  // Load Gemini configuration - Modernized with 2025 patterns
  loadGeminiConfig(geminiService) {
    try {
      const { gemini } = this.loadConfig();
      if (!gemini) return false;

      // Modern destructuring and early returns
      const { apiKey, model } = gemini;

      if (apiKey) {
        process.env.GEMINI_API_KEY = apiKey;
        const setResult = geminiService.setApiKey(apiKey);
        logStatus(setResult, 'API key Gemini: Berhasil', 'API key Gemini: Gagal');
      }

      if (model) {
        process.env.GEMINI_MODEL = model;
        const modelResult = geminiService.setModel(model);
        logStatus(modelResult, 'Model Gemini: Berhasil', 'Model Gemini: Gagal');
      }

      const finalStatus = geminiService.isInitialized();
      logStatus(finalStatus, 'Inisialisasi Gemini API: Berhasil', 'Inisialisasi Gemini API: Gagal');

      return finalStatus;
    } catch (error) {
      logError(error, 'Error memuat konfigurasi Gemini: ');
      return false;
    }
  }

  // Get API key from environment or config file - Moved from app.js
  async getApiKey() {
    const envApiKey = process.env.GEMINI_API_KEY;
    logStatus(envApiKey, 'API key ditemukan dari environment', 'API key tidak ditemukan di environment');

    if (envApiKey) return envApiKey;

    log('Loading API key from configuration file...');
    const { gemini } = this.loadConfig();
    const configApiKey = gemini?.apiKey;

    if (configApiKey) {
      log('Menggunakan API key dari file konfigurasi persisten');
      process.env.GEMINI_API_KEY = configApiKey;
      return configApiKey;
    }

    return null;
  }

  /**
   * Get saved zoom level from configuration
   * @returns {number} Zoom level (defaults to 1.0 if not found)
   */
  getZoomLevel() {
    try {
      const config = this.loadConfig();
      const zoomLevel = config?.zoomLevel;

      // Validate zoom level range (0.25 to 3.0)
      if (typeof zoomLevel === 'number' && zoomLevel >= 0.25 && zoomLevel <= 3.0) {
        log(`Loaded saved zoom level: ${zoomLevel}`);
        return zoomLevel;
      }

      log('No valid saved zoom level found, using default: 1.0');
      return 1.0; // Default zoom level
    } catch (error) {
      logError(error, 'Error getting zoom level: ');
      return 1.0; // Fallback to default
    }
  }

  /**
   * Save zoom level to configuration
   * @param {number} zoomLevel - Zoom level to save
   * @returns {boolean} Success status
   */
  saveZoomLevel(zoomLevel) {
    try {
      // Validate zoom level
      if (typeof zoomLevel !== 'number' || zoomLevel < 0.25 || zoomLevel > 3.0) {
        logError(`Invalid zoom level: ${zoomLevel}, not saving`);
        return false;
      }

      const config = this.loadConfig();
      config.zoomLevel = zoomLevel;

      const success = this.saveConfig(config);
      if (success) {
        log(`Zoom level saved: ${zoomLevel}`);
      } else {
        logError('Failed to save zoom level');
      }

      return success;
    } catch (error) {
      logError(error, 'Error saving zoom level: ');
      return false;
    }
  }
}

module.exports = ConfigManager;
