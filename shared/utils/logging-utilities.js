// Logging & Error Handling Utilities for Mamouse Agent
// CONSOLIDATION: Merged console-logger.js + error-handler.js for better organization
// Provides unified logging and error handling functionality across the application

// ===== LOGGER CLASS =====
// Extracted from console-logger.js - Browser-specific logging utilities

class Logger {
  constructor(moduleName = 'Unknown') {
    this.moduleName = moduleName;
    this.debugMode = false; // Can be enabled for debugging
  }

  /**
   * Log initialization message
   */
  logInitialized(componentName = this.moduleName) {
    console.log(`✅ ${componentName} initialized`);
  }

  /**
   * Log loaded message
   */
  logLoaded(componentName = this.moduleName) {
    console.log(`${componentName} loaded`);
  }

  /**
   * Log general info message
   */
  logInfo(message, ...args) {
    console.log(`[${this.moduleName}]`, message, ...args);
  }

  /**
   * Log debug message (only if debug mode enabled)
   */
  logDebug(message, ...args) {
    if (this.debugMode) {
      console.log(`🐛 [${this.moduleName}]`, message, ...args);
    }
  }

  /**
   * Log error with consistent format
   */
  logError(message, error = null, ...args) {
    console.error(`❌ ${this.moduleName}: ${message}`, ...args);
    if (error) {
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Error stack:', error.stack);
      }
    }
  }

  /**
   * Log success message
   */
  logSuccess(message, ...args) {
    console.log(`✅ ${this.moduleName}: ${message}`, ...args);
  }

  /**
   * Log API not available message
   */
  logApiNotAvailable(apiName) {
    console.warn(`⚠️ ${this.moduleName}: ${apiName} API not available`);
  }

  /**
   * Log component not found message
   */
  logComponentNotFound(componentName) {
    console.warn(`⚠️ ${this.moduleName}: ${componentName} component not found`);
  }

  /**
   * Log element not found message
   */
  logElementNotFound(elementId) {
    console.warn(`⚠️ ${this.moduleName}: Element '${elementId}' not found`);
  }

  /**
   * Log warning message
   */
  logWarning(message, ...args) {
    console.warn(`⚠️ ${this.moduleName}: ${message}`, ...args);
  }

  /**
   * Log with custom level
   */
  log(message, level = 'info', ...args) {
    const levelMap = {
      info: console.log,
      warn: console.warn,
      error: console.error,
      debug: this.debugMode ? console.log : () => {}
    };
    
    const logFn = levelMap[level] || console.log;
    logFn(`[${this.moduleName}]`, message, ...args);
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.debugMode = true;
    console.log(`🐛 Debug mode enabled for ${this.moduleName}`);
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    this.debugMode = false;
    console.log(`🐛 Debug mode disabled for ${this.moduleName}`);
  }
}

// ===== ERROR HANDLER CLASS =====
// Extracted from error-handler.js - Comprehensive error handling utilities

class ErrorHandler {
  constructor(moduleName = 'Unknown') {
    this.moduleName = moduleName;
    this.logger = window.createLogger ? window.createLogger(moduleName) : null;
    this.apiHelper = window.createAPIHelper ? window.createAPIHelper(moduleName) : null;
  }

  /**
   * Execute function with error handling
   */
  safeExecute(fn, errorCallback = null, context = null) {
    try {
      if (typeof fn === 'function') {
        return context ? fn.call(context) : fn();
      } else {
        throw new Error('Provided argument is not a function');
      }
    } catch (error) {
      this.handleError(error, 'safeExecute');
      
      if (errorCallback && typeof errorCallback === 'function') {
        try {
          return errorCallback(error);
        } catch (callbackError) {
          this.handleError(callbackError, 'errorCallback');
        }
      }
      
      return null;
    }
  }

  /**
   * Execute async function with error handling
   */
  async safeExecuteAsync(fn, errorCallback = null, context = null) {
    try {
      if (typeof fn === 'function') {
        const result = context ? fn.call(context) : fn();
        return await result;
      } else {
        throw new Error('Provided argument is not a function');
      }
    } catch (error) {
      this.handleError(error, 'safeExecuteAsync');
      
      if (errorCallback && typeof errorCallback === 'function') {
        try {
          return await errorCallback(error);
        } catch (callbackError) {
          this.handleError(callbackError, 'errorCallback');
        }
      }
      
      return null;
    }
  }

  /**
   * Handle error with consistent logging and status display
   */
  handleError(error, operation = 'unknown', showStatus = true) {
    const errorMessage = error?.message || 'Unknown error occurred';
    
    // Log error
    if (this.logger) {
      this.logger.logError(`Error in ${operation}`, error);
    } else {
      console.error(`❌ ${this.moduleName}: Error in ${operation}:`, error);
      if (error?.stack) {
        console.error('Error stack:', error.stack);
      }
    }

    // Show status if requested and API available
    if (showStatus && this.apiHelper) {
      this.apiHelper.showStatus('error', `Error: ${errorMessage}`, 5000);
    }
    
    return {
      error: true,
      message: errorMessage,
      operation: operation,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wrap function with error handling
   */
  wrap(fn, operation = 'wrapped function') {
    return (...args) => {
      return this.safeExecute(() => fn(...args), null, null);
    };
  }

  /**
   * Wrap async function with error handling
   */
  wrapAsync(fn, operation = 'wrapped async function') {
    return async (...args) => {
      return await this.safeExecuteAsync(() => fn(...args), null, null);
    };
  }

  /**
   * Try multiple functions until one succeeds
   */
  tryMultiple(functions, operation = 'tryMultiple') {
    for (let i = 0; i < functions.length; i++) {
      const result = this.safeExecute(functions[i], null, null);
      if (result !== null) {
        return result;
      }
    }
    
    this.handleError(new Error('All functions failed'), operation);
    return null;
  }

  /**
   * Try multiple async functions until one succeeds
   */
  async tryMultipleAsync(functions, operation = 'tryMultipleAsync') {
    for (let i = 0; i < functions.length; i++) {
      const result = await this.safeExecuteAsync(functions[i], null, null);
      if (result !== null) {
        return result;
      }
    }
    
    this.handleError(new Error('All async functions failed'), operation);
    return null;
  }

  /**
   * Retry function with exponential backoff
   */
  async retry(fn, maxRetries = 3, baseDelay = 1000, operation = 'retry') {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.safeExecuteAsync(fn, null, null);
      
      if (result !== null) {
        return result;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        if (this.logger) {
          this.logger.log(`Retrying ${operation} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    this.handleError(new Error(`Failed after ${maxRetries} attempts`), operation);
    return null;
  }

  /**
   * Create error boundary for React-like error handling
   */
  createErrorBoundary(fallbackFn = null) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = function(...args) {
        return this.safeExecute(() => originalMethod.apply(this, args), fallbackFn, this);
      };

      return descriptor;
    };
  }

  // Specific error handlers for common scenarios

  // API call error handling
  handleAPIError(error, apiName, operation = 'API call') {
    const message = `${apiName} ${operation} failed`;
    this.handleError(error, message, true);

    // Show user-friendly message
    if (this.apiHelper) {
      this.apiHelper.showStatus('error', `${apiName} error: ${error?.message || 'Unknown error'}`, 5000);
    }
  }

  // DOM operation error handling
  handleDOMError(error, elementId, operation = 'DOM operation') {
    const message = `${operation} on element '${elementId}' failed`;
    this.handleError(error, message, false); // Don't show status for DOM errors
  }

  // Network error handling
  handleNetworkError(error, url = 'unknown', operation = 'network request') {
    const message = `${operation} to '${url}' failed`;
    this.handleError(error, message, true);

    if (this.apiHelper) {
      this.apiHelper.showStatus('error', 'Network error. Please check your connection.', 5000);
    }
  }

  // Validation error handling
  handleValidationError(error, field = 'unknown', operation = 'validation') {
    const message = `${operation} for field '${field}' failed`;
    this.handleError(error, message, true);

    if (this.apiHelper) {
      this.apiHelper.showStatus('error', error?.message || 'Validation failed', 3000);
    }
  }

  // File operation error handling
  handleFileError(error, filename = 'unknown', operation = 'file operation') {
    const message = `${operation} on file '${filename}' failed`;
    this.handleError(error, message, true);

    if (this.apiHelper) {
      this.apiHelper.showStatus('error', `File error: ${error?.message || 'Unknown error'}`, 5000);
    }
  }

  // Component error handling
  handleComponentError(error, componentName = 'unknown', operation = 'component operation') {
    const message = `${operation} in component '${componentName}' failed`;
    this.handleError(error, message, true);

    if (this.apiHelper) {
      this.apiHelper.showStatus('error', `Component error: ${error?.message || 'Unknown error'}`, 5000);
    }
  }

  /**
   * Get error summary for debugging
   */
  getErrorSummary() {
    return {
      moduleName: this.moduleName,
      hasLogger: !!this.logger,
      hasAPIHelper: !!this.apiHelper,
      timestamp: new Date().toISOString()
    };
  }
}

// ===== FACTORY FUNCTIONS =====

// Factory function for creating logger instances
function createLogger(moduleName) {
  return new Logger(moduleName);
}

// Factory function for creating error handler instances
function createErrorHandler(moduleName) {
  return new ErrorHandler(moduleName);
}

// Context logger factory (from console-logger.js)
const createContextLogger = (context) => {
  // Try to use file logger if available (Node.js environment)
  if (typeof require !== 'undefined') {
    try {
      const { logger } = require('../services/file-logger');
      return {
        log: (message, level = 'info') => logger[level] ? logger[level](`[${context}] ${message}`) : logger.info(`[${context}] ${message}`),
        logError: (error, prefix = '') => logger.error(`[${context}] ${prefix}${error instanceof Error ? error.message : error}`),
        logStatus: (condition, successMessage, failMessage) => condition ? logger.info(`[${context}] ${successMessage}`) : logger.warn(`[${context}] ${failMessage}`)
      };
    } catch (e) {
      // Fall through to console fallback
    }
  }

  // Fallback to console for browser environment
  return {
    log: (message, level = 'info') => console[level] ? console[level](`[${context}] ${message}`) : console.log(`[${context}] ${message}`),
    logError: (error, prefix = '') => console.error(`[${context}] ${prefix}${error instanceof Error ? error.message : error}`),
    logStatus: (condition, successMessage, failMessage) => condition ? console.log(`[${context}] ${successMessage}`) : console.warn(`[${context}] ${failMessage}`)
  };
};

// ===== GLOBAL SETUP =====

// Browser-specific setup
if (typeof window !== 'undefined') {
  // Global error handler instance
  window.globalErrorHandler = new ErrorHandler('Global');

  // Export classes and functions for use in other modules
  window.Logger = Logger;
  window.ErrorHandler = ErrorHandler;
  window.createLogger = createLogger;
  window.createErrorHandler = createErrorHandler;

  // Global error event handlers
  window.addEventListener('error', (event) => {
    window.globalErrorHandler.handleError(event.error, 'Global Error', false);
  });

  window.addEventListener('unhandledrejection', (event) => {
    window.globalErrorHandler.handleError(event.reason, 'Unhandled Promise Rejection', false);
  });
}

// ===== EXPORTS =====

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Logger,
    ErrorHandler,
    createLogger,
    createErrorHandler,
    createContextLogger
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.createContextLogger = createContextLogger;
}

console.log('🔧 Logging & Error Handling Utilities loaded (consolidated from console-logger.js + error-handler.js)');
