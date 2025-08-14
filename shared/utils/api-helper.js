// API Helper Utility untuk Mamouse Agent
// Mengatasi duplikasi window API check patterns di seluruh codebase
// NOTE: Moved from ui/utils/ to shared/utils/ for better architecture

class APIHelper {
  constructor(moduleName = 'Unknown') {
    this.moduleName = moduleName;
    this.logger = window.createLogger ? window.createLogger(moduleName) : null;
  }

  /**
   * Check if window API exists and execute callback
   */
  withAPI(apiPath, callback, fallbackCallback = null) {
    const api = this.getAPI(apiPath);
    
    if (api && typeof callback === 'function') {
      try {
        return callback(api);
      } catch (error) {
        if (this.logger) {
          this.logger.logError(`Error executing callback for API '${apiPath}'`, error);
        } else {
          console.error(`❌ ${this.moduleName}: Error executing callback for API '${apiPath}'`, error);
        }
        
        if (fallbackCallback && typeof fallbackCallback === 'function') {
          return fallbackCallback(error);
        }
      }
    } else {
      if (this.logger) {
        this.logger.logApiNotAvailable(apiPath);
      } else {
        console.error(`❌ ${this.moduleName}: ${apiPath} API not available`);
      }
      
      if (fallbackCallback && typeof fallbackCallback === 'function') {
        return fallbackCallback(new Error(`API '${apiPath}' not available`));
      }
    }
    
    return null;
  }

  /**
   * Get API from window object using dot notation
   */
  getAPI(apiPath) {
    const parts = apiPath.split('.');
    let current = window;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Check if API exists
   */
  apiExists(apiPath) {
    return this.getAPI(apiPath) !== null;
  }

  /**
   * Call API method with error handling
   */
  callAPI(apiPath, methodName, args = [], fallbackCallback = null) {
    return this.withAPI(apiPath, (api) => {
      if (typeof api[methodName] === 'function') {
        return api[methodName](...args);
      } else {
        throw new Error(`Method '${methodName}' not found in API '${apiPath}'`);
      }
    }, fallbackCallback);
  }

  /**
   * Common API patterns
   */
  
  // Status Manager helper
  withStatusManager(callback, fallbackCallback = null) {
    return this.withAPI('statusManager', callback, fallbackCallback);
  }

  // Theme Controller helper
  withThemeController(callback, fallbackCallback = null) {
    return this.withAPI('colorController', callback, fallbackCallback);
  }

  // Show status with error handling
  showStatus(type, message, duration = 3000, elementId = 'api-status') {
    return this.withStatusManager((statusManager) => {
      if (typeof statusManager.showStatusIndicator === 'function') {
        statusManager.showStatusIndicator(type, message, duration);
        return true;
      } else if (typeof statusManager.showStatus === 'function') {
        statusManager.showStatus(type, message, duration);
        return true;
      } else if (window.showApiStatus && typeof window.showApiStatus === 'function') {
        window.showApiStatus(type, message, elementId);
        return true;
      } else {
        throw new Error('No status display method available');
      }
    }, () => {
      // Fallback: log to console
      console.log(`Status [${type}]: ${message}`);
      return false;
    });
  }

  // Hide status with error handling
  hideStatus() {
    return this.withStatusManager((statusManager) => {
      if (typeof statusManager.hideStatusIndicator === 'function') {
        statusManager.hideStatusIndicator();
        return true;
      } else if (typeof statusManager.hideStatus === 'function') {
        statusManager.hideStatus();
        return true;
      } else if (window.hideApiStatus && typeof window.hideApiStatus === 'function') {
        window.hideApiStatus();
        return true;
      } else {
        throw new Error('No status hide method available');
      }
    }, () => {
      // Fallback: do nothing
      return false;
    });
  }

  // Voice Input Handler helper
  withVoiceInputHandler(callback, fallbackCallback = null) {
    return this.withAPI('voiceInputHandler', callback, fallbackCallback);
  }

  // Voice Output Manager helper
  withVoiceOutputManager(callback, fallbackCallback = null) {
    return this.withAPI('voiceOutputManager', callback, fallbackCallback);
  }

  // Window Manager helper
  withWindowManager(callback, fallbackCallback = null) {
    return this.withAPI('windowManager', callback, fallbackCallback);
  }

  // Input Container helper
  withInputContainer(callback, fallbackCallback = null) {
    return this.withAPI('inputContainer', callback, fallbackCallback);
  }

  // Message Manager helper
  withMessageManager(callback, fallbackCallback = null) {
    return this.withAPI('messageManager', callback, fallbackCallback);
  }

  /**
   * Batch API checks
   */
  checkAPIs(apiPaths) {
    const results = {};
    
    apiPaths.forEach(apiPath => {
      results[apiPath] = this.apiExists(apiPath);
    });
    
    return results;
  }

  /**
   * Wait for API to become available
   */
  waitForAPI(apiPath, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkAPI = () => {
        if (this.apiExists(apiPath)) {
          resolve(this.getAPI(apiPath));
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`API '${apiPath}' not available after ${timeout}ms`));
        } else {
          setTimeout(checkAPI, interval);
        }
      };
      
      checkAPI();
    });
  }
}

// Factory function untuk membuat API helper instances
function createAPIHelper(moduleName) {
  return new APIHelper(moduleName);
}

// Export untuk digunakan di file lain
window.APIHelper = APIHelper;
window.createAPIHelper = createAPIHelper;

console.log('API Helper utility loaded (shared/utils)');
