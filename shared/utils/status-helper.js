// Status Helper Utility untuk Mamouse Agent
// Mengatasi duplikasi status manager patterns di seluruh codebase
// NOTE: Moved from ui/utils/ to shared/utils/ for better architecture

class StatusHelper {
  constructor(moduleName = 'Unknown') {
    this.moduleName = moduleName;
    this.logger = window.createLogger ? window.createLogger(moduleName) : null;
    this.defaultDuration = 3000;
    this.defaultElementId = 'api-status';
  }

  /**
   * Show status with automatic fallback to available methods
   */
  showStatus(type, message, duration = this.defaultDuration, elementId = this.defaultElementId) {
    const methods = [
      // Try StatusManager first
      () => {
        if (window.statusManager && typeof window.statusManager.showStatusIndicator === 'function') {
          window.statusManager.showStatusIndicator(type, message, duration);
          return true;
        }
        return false;
      },
      
      // Try showApiStatus function
      () => {
        if (window.showApiStatus && typeof window.showApiStatus === 'function') {
          window.showApiStatus(type, message, elementId);
          return true;
        }
        return false;
      },
      
      // Try direct DOM manipulation
      () => {
        const statusElement = document.getElementById(elementId);
        if (statusElement) {
          statusElement.textContent = message;
          statusElement.className = `status ${type}`;
          statusElement.style.display = 'block';
          
          if (duration > 0) {
            setTimeout(() => {
              statusElement.style.display = 'none';
            }, duration);
          }
          return true;
        }
        return false;
      },
      
      // Fallback to console
      () => {
        console.log(`Status [${type}]: ${message}`);
        return true;
      }
    ];

    // Try each method until one succeeds
    for (const method of methods) {
      try {
        if (method()) {
          if (this.logger) {
            this.logger.log(`Status displayed: [${type}] ${message}`);
          }
          return true;
        }
      } catch (error) {
        if (this.logger) {
          this.logger.logError('Error in status display method', error);
        } else {
          console.error(`❌ ${this.moduleName}: Error in status display method`, error);
        }
      }
    }

    return false;
  }

  /**
   * Hide status with automatic fallback to available methods
   */
  hideStatus(elementId = this.defaultElementId) {
    const methods = [
      // Try StatusManager first
      () => {
        if (window.statusManager && typeof window.statusManager.hideStatusIndicator === 'function') {
          window.statusManager.hideStatusIndicator();
          return true;
        }
        return false;
      },
      
      // Try hideApiStatus function
      () => {
        if (window.hideApiStatus && typeof window.hideApiStatus === 'function') {
          window.hideApiStatus();
          return true;
        }
        return false;
      },
      
      // Try direct DOM manipulation
      () => {
        const statusElement = document.getElementById(elementId);
        if (statusElement) {
          statusElement.style.display = 'none';
          return true;
        }
        return false;
      }
    ];

    // Try each method until one succeeds
    for (const method of methods) {
      try {
        if (method()) {
          if (this.logger) {
            this.logger.log('Status hidden');
          }
          return true;
        }
      } catch (error) {
        if (this.logger) {
          this.logger.logError('Error in status hide method', error);
        } else {
          console.error(`❌ ${this.moduleName}: Error in status hide method`, error);
        }
      }
    }

    return false;
  }

  /**
   * Convenience methods for common status types
   */
  showSuccess(message, duration = this.defaultDuration) {
    return this.showStatus('success', message, duration);
  }

  showError(message, duration = 5000) {
    return this.showStatus('error', message, duration);
  }

  showWarning(message, duration = 4000) {
    return this.showStatus('warning', message, duration);
  }

  showInfo(message, duration = this.defaultDuration) {
    return this.showStatus('info', message, duration);
  }

  showProcessing(message, duration = 10000) {
    return this.showStatus('processing', message, duration);
  }

  /**
   * Show API-specific status messages
   */
  showApiSuccess(apiName, operation = 'operation', duration = this.defaultDuration) {
    return this.showSuccess(`${apiName} ${operation} successful`, duration);
  }

  showApiError(apiName, operation = 'operation', error = null, duration = 5000) {
    const message = error 
      ? `${apiName} ${operation} failed: ${error.message || error}`
      : `${apiName} ${operation} failed`;
    return this.showError(message, duration);
  }

  showApiProcessing(apiName, operation = 'operation', duration = 10000) {
    return this.showProcessing(`${apiName} ${operation} in progress...`, duration);
  }

  /**
   * Show connection status
   */
  showConnected(serviceName = 'Service', duration = this.defaultDuration) {
    return this.showSuccess(`${serviceName} connected`, duration);
  }

  showDisconnected(serviceName = 'Service', duration = 5000) {
    return this.showError(`${serviceName} disconnected`, duration);
  }

  showConnecting(serviceName = 'Service', duration = 10000) {
    return this.showProcessing(`Connecting to ${serviceName}...`, duration);
  }

  /**
   * Show validation status
   */
  showValidationError(field, message, duration = 4000) {
    return this.showError(`${field}: ${message}`, duration);
  }

  showValidationSuccess(field, duration = this.defaultDuration) {
    return this.showSuccess(`${field} is valid`, duration);
  }

  /**
   * Show file operation status
   */
  showFileSuccess(operation, filename, duration = this.defaultDuration) {
    return this.showSuccess(`${operation} ${filename} successful`, duration);
  }

  showFileError(operation, filename, error = null, duration = 5000) {
    const message = error 
      ? `${operation} ${filename} failed: ${error.message || error}`
      : `${operation} ${filename} failed`;
    return this.showError(message, duration);
  }

  /**
   * Show component status
   */
  showComponentReady(componentName, duration = this.defaultDuration) {
    return this.showSuccess(`${componentName} component ready`, duration);
  }

  showComponentError(componentName, error = null, duration = 5000) {
    const message = error 
      ? `${componentName} component error: ${error.message || error}`
      : `${componentName} component error`;
    return this.showError(message, duration);
  }

  /**
   * Show loading status with auto-hide
   */
  showLoading(message = 'Loading...', duration = 0) {
    return this.showProcessing(message, duration);
  }

  /**
   * Show temporary status that auto-hides
   */
  showTemporary(type, message, duration = 2000) {
    return this.showStatus(type, message, duration);
  }

  /**
   * Show persistent status (no auto-hide)
   */
  showPersistent(type, message) {
    return this.showStatus(type, message, 0);
  }

  /**
   * Check if status system is available
   */
  isAvailable() {
    return !!(
      (window.statusManager && window.statusManager.showStatusIndicator) ||
      window.showApiStatus ||
      document.getElementById(this.defaultElementId)
    );
  }

  /**
   * Get status system info for debugging
   */
  getSystemInfo() {
    return {
      moduleName: this.moduleName,
      hasStatusManager: !!(window.statusManager && window.statusManager.showStatusIndicator),
      hasShowApiStatus: !!window.showApiStatus,
      hasStatusElement: !!document.getElementById(this.defaultElementId),
      defaultDuration: this.defaultDuration,
      defaultElementId: this.defaultElementId
    };
  }
}

// Factory function untuk membuat status helper instances
function createStatusHelper(moduleName) {
  return new StatusHelper(moduleName);
}

// Export untuk digunakan di file lain
window.StatusHelper = StatusHelper;
window.createStatusHelper = createStatusHelper;

console.log('Status Helper utility loaded (shared/utils)');
