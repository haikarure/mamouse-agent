// Utility Manager for Mamouse Agent
// ARCHITECTURAL MIGRATION: Renamed from renderer-utilities.js to utility-manager.js
// CONSOLIDATION: Enhanced with utilities-index.js content for better organization
// Central utility management system providing unified access to all utility functions

// ===== UTILITY MANAGER SYSTEM =====
// Consolidated from utilities-index.js - Central utility management system

/**
 * Initialize all utilities for a module
 * Returns an object with all utility instances
 */
function initializeUtilities(moduleName) {
  const utilities = {};

  // Create utility instances
  if (window.createLogger) {
    utilities.logger = window.createLogger(moduleName);
  }

  if (window.createDOMHelper) {
    utilities.dom = window.createDOMHelper(moduleName);
  }

  if (window.createAPIHelper) {
    utilities.api = window.createAPIHelper(moduleName);
  }

  if (window.createErrorHandler) {
    utilities.error = window.createErrorHandler(moduleName);
  }

  if (window.createStatusHelper) {
    utilities.status = window.createStatusHelper(moduleName);
  }

  return utilities;
}

/**
 * Create a utility manager for a module
 * Provides convenient access to all utilities
 */
class UtilityManager {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.utilities = initializeUtilities(moduleName);
  }

  // Logger shortcuts
  log(message, ...args) {
    return this.utilities.logger?.logInfo(message, ...args);
  }

  logSuccess(message, ...args) {
    return this.utilities.logger?.logSuccess(message, ...args);
  }

  logError(message, error = null, ...args) {
    return this.utilities.logger?.logError(message, error, ...args);
  }

  logWarning(message, ...args) {
    return this.utilities.logger?.logWarning(message, ...args);
  }

  logInitialized(componentName = this.moduleName) {
    return this.utilities.logger?.logInitialized(componentName);
  }

  logLoaded(componentName = this.moduleName) {
    return this.utilities.logger?.logLoaded(componentName);
  }

  // DOM shortcuts
  getElement(elementId, required = true) {
    return this.utilities.dom?.getElementById(elementId, required);
  }

  withElement(elementId, callback, errorCallback = null) {
    return this.utilities.dom?.withElement(elementId, callback, errorCallback);
  }

  addClass(elementId, className) {
    return this.utilities.dom?.addClass(elementId, className);
  }

  removeClass(elementId, className) {
    return this.utilities.dom?.removeClass(elementId, className);
  }

  toggleClass(elementId, className) {
    return this.utilities.dom?.toggleClass(elementId, className);
  }

  setValue(elementId, value) {
    return this.utilities.dom?.setValue(elementId, value);
  }

  getValue(elementId, defaultValue = '') {
    return this.utilities.dom?.getValue(elementId, defaultValue);
  }

  setText(elementId, text) {
    return this.utilities.dom?.setText(elementId, text);
  }

  getText(elementId, defaultText = '') {
    return this.utilities.dom?.getText(elementId, defaultText);
  }

  // API shortcuts
  withAPI(apiPath, callback, fallbackCallback = null) {
    return this.utilities.api?.withAPI(apiPath, callback, fallbackCallback);
  }

  apiExists(apiPath) {
    return this.utilities.api?.apiExists(apiPath) || false;
  }

  withStatusManager(callback, fallbackCallback = null) {
    return this.utilities.api?.withStatusManager(callback, fallbackCallback);
  }

  // Error handling shortcuts
  handleError(error, operation = 'unknown', showStatus = true) {
    return this.utilities.error?.handleError(error, operation, showStatus);
  }

  // Status shortcuts
  showStatus(type, message, duration = 3000) {
    return this.utilities.status?.showStatus(type, message, duration);
  }

  hideStatus() {
    return this.utilities.status?.hideStatus();
  }

  showSuccess(message, duration = 3000) {
    return this.utilities.status?.showSuccess(message, duration);
  }

  showError(message, duration = 5000) {
    return this.utilities.status?.showError(message, duration);
  }

  showWarning(message, duration = 4000) {
    return this.utilities.status?.showWarning(message, duration);
  }

  // Safe logging methods (fallback to console if logger not available)
  safeLog(message, ...args) {
    if (this.utilities.logger) {
      return this.utilities.logger.logInfo(message, ...args);
    } else {
      console.log(`[${this.moduleName}]`, message, ...args);
      return true;
    }
  }

  safeLogSuccess(message, ...args) {
    if (this.utilities.logger) {
      return this.utilities.logger.logSuccess(message, ...args);
    } else {
      console.log(`✅ [${this.moduleName}]`, message, ...args);
      return true;
    }
  }

  safeLogError(message, error = null, ...args) {
    if (this.utilities.logger) {
      return this.utilities.logger.logError(message, error, ...args);
    } else {
      console.error(`❌ [${this.moduleName}]`, message, error, ...args);
      return true;
    }
  }

  safeLogWarning(message, ...args) {
    if (this.utilities.logger) {
      return this.utilities.logger.logWarning(message, ...args);
    } else {
      console.warn(`⚠️ [${this.moduleName}]`, message, ...args);
      return true;
    }
  }

  // Get all utilities
  getUtilities() {
    return this.utilities;
  }

  // Get specific utility
  getUtility(name) {
    return this.utilities[name];
  }

  // Check if utility is available
  hasUtility(name) {
    return !!this.utilities[name];
  }

  // Get utility manager info
  getInfo() {
    return {
      moduleName: this.moduleName,
      availableUtilities: Object.keys(this.utilities),
      utilityCount: Object.keys(this.utilities).length
    };
  }
}

/**
 * Factory function for creating utility manager instances
 */
function createUtilityManager(moduleName) {
  return new UtilityManager(moduleName);
}

// ===== UTILITY MANAGER SYSTEM ONLY =====
// ARCHITECTURAL MIGRATION: Renamed from renderer-utilities.js to utility-manager.js
// This file contains only pure utility management functions

/**
 * Initialize utility manager system by exporting functions to window
 * ARCHITECTURAL MIGRATION: Renamed from renderer-utilities.js to utility-manager.js
 * This initializes the centralized utility management system
 */
function initializeUtilityManager() {
  // Export utility manager system globally
  window.initializeUtilities = initializeUtilities;
  window.UtilityManager = UtilityManager;
  window.createUtilityManager = createUtilityManager;

  console.log('✅ Utility Manager System initialized and exported to window (utility-manager.js)');
}

module.exports = {
  // Utility manager system only
  initializeUtilities,
  UtilityManager,
  createUtilityManager,
  initializeUtilityManager
};

// Initialize utility manager system when loaded
if (typeof window !== 'undefined') {
  initializeUtilityManager();
}

console.log('✅ Utility Manager loaded (shared/utils/utility-manager.js) - ARCHITECTURAL MIGRATION: Renamed from renderer-utilities.js');
