// DOM Helper Utility untuk Mamouse Agent
// Mengatasi duplikasi document.getElementById patterns di seluruh codebase
// NOTE: Moved from ui/utils/ to shared/utils/ for better architecture

class DOMHelper {
  constructor(moduleName = 'Unknown') {
    this.moduleName = moduleName;
    this.logger = window.createLogger ? window.createLogger(moduleName) : null;
  }

  /**
   * Get element by ID with error handling
   */
  getElementById(elementId, required = true) {
    const element = document.getElementById(elementId);
    
    if (!element && required) {
      if (this.logger) {
        this.logger.logElementNotFound(elementId);
      } else {
        console.error(`❌ ${this.moduleName}: Element '${elementId}' not found!`);
      }
      return null;
    }
    
    return element;
  }

  /**
   * Get element by ID with callback execution
   */
  withElement(elementId, callback, errorCallback = null) {
    const element = this.getElementById(elementId, true);
    
    if (element && typeof callback === 'function') {
      try {
        return callback(element);
      } catch (error) {
        if (this.logger) {
          this.logger.logError(`Error in callback for element '${elementId}'`, error);
        } else {
          console.error(`❌ ${this.moduleName}: Error in callback for element '${elementId}'`, error);
        }
        
        if (errorCallback && typeof errorCallback === 'function') {
          errorCallback(error);
        }
      }
    } else if (!element && errorCallback && typeof errorCallback === 'function') {
      errorCallback(new Error(`Element '${elementId}' not found`));
    }
    
    return null;
  }

  /**
   * Get multiple elements by IDs
   */
  getElements(elementIds, required = true) {
    const elements = {};
    const missing = [];
    
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        elements[id] = element;
      } else {
        missing.push(id);
        if (required) {
          if (this.logger) {
            this.logger.logElementNotFound(id);
          } else {
            console.error(`❌ ${this.moduleName}: Element '${id}' not found!`);
          }
        }
      }
    });
    
    return { elements, missing };
  }

  /**
   * Get element by selector with error handling
   */
  querySelector(selector, required = true) {
    const element = document.querySelector(selector);
    
    if (!element && required) {
      if (this.logger) {
        this.logger.logError(`Element with selector '${selector}' not found`);
      } else {
        console.error(`❌ ${this.moduleName}: Element with selector '${selector}' not found!`);
      }
      return null;
    }
    
    return element;
  }

  /**
   * Get elements by selector with error handling
   */
  querySelectorAll(selector) {
    const elements = document.querySelectorAll(selector);
    
    if (this.logger) {
      this.logger.log(`Found ${elements.length} elements with selector '${selector}'`);
    }
    
    return elements;
  }

  /**
   * Add event listener with error handling
   */
  addEventListener(elementId, event, callback, options = {}) {
    return this.withElement(elementId, (element) => {
      element.addEventListener(event, callback, options);
      
      if (this.logger) {
        this.logger.log(`Event listener '${event}' added to element '${elementId}'`);
      }
      
      return true;
    });
  }

  /**
   * Remove event listener with error handling
   */
  removeEventListener(elementId, event, callback, options = {}) {
    return this.withElement(elementId, (element) => {
      element.removeEventListener(event, callback, options);
      
      if (this.logger) {
        this.logger.log(`Event listener '${event}' removed from element '${elementId}'`);
      }
      
      return true;
    });
  }

  /**
   * Add class with error handling
   */
  addClass(elementId, className) {
    return this.withElement(elementId, (element) => {
      element.classList.add(className);
      return true;
    });
  }

  /**
   * Remove class with error handling
   */
  removeClass(elementId, className) {
    return this.withElement(elementId, (element) => {
      element.classList.remove(className);
      return true;
    });
  }

  /**
   * Toggle class with error handling
   */
  toggleClass(elementId, className) {
    return this.withElement(elementId, (element) => {
      element.classList.toggle(className);
      return element.classList.contains(className);
    });
  }

  /**
   * Check if element has class
   */
  hasClass(elementId, className) {
    return this.withElement(elementId, (element) => {
      return element.classList.contains(className);
    }) || false;
  }

  /**
   * Set element style with error handling
   */
  setStyle(elementId, property, value) {
    return this.withElement(elementId, (element) => {
      element.style[property] = value;
      return true;
    });
  }

  /**
   * Set multiple styles with error handling
   */
  setStyles(elementId, styles) {
    return this.withElement(elementId, (element) => {
      Object.keys(styles).forEach(property => {
        element.style[property] = styles[property];
      });
      return true;
    });
  }

  /**
   * Set element value with error handling
   */
  setValue(elementId, value) {
    return this.withElement(elementId, (element) => {
      element.value = value;
      return true;
    });
  }

  /**
   * Get element value with error handling
   */
  getValue(elementId, defaultValue = '') {
    return this.withElement(elementId, (element) => {
      return element.value || defaultValue;
    }) || defaultValue;
  }

  /**
   * Set element text content with error handling
   */
  setText(elementId, text) {
    return this.withElement(elementId, (element) => {
      element.textContent = text;
      return true;
    });
  }

  /**
   * Get element text content with error handling
   */
  getText(elementId, defaultText = '') {
    return this.withElement(elementId, (element) => {
      return element.textContent || defaultText;
    }) || defaultText;
  }

  /**
   * Set element HTML with error handling
   */
  setHTML(elementId, html) {
    return this.withElement(elementId, (element) => {
      element.innerHTML = html;
      return true;
    });
  }

  /**
   * Get element HTML with error handling
   */
  getHTML(elementId, defaultHTML = '') {
    return this.withElement(elementId, (element) => {
      return element.innerHTML || defaultHTML;
    }) || defaultHTML;
  }

  /**
   * Show element with error handling
   */
  show(elementId, display = 'block') {
    return this.setStyle(elementId, 'display', display);
  }

  /**
   * Hide element with error handling
   */
  hide(elementId) {
    return this.setStyle(elementId, 'display', 'none');
  }

  /**
   * Check if element exists
   */
  exists(elementId) {
    return !!document.getElementById(elementId);
  }

  /**
   * Wait for element to exist
   */
  waitForElement(elementId, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.getElementById(elementId);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element '${elementId}' not found after ${timeout}ms`));
        } else {
          setTimeout(checkElement, interval);
        }
      };
      
      checkElement();
    });
  }
}

// Factory function untuk membuat DOM helper instances
function createDOMHelper(moduleName) {
  return new DOMHelper(moduleName);
}

// Export untuk digunakan di file lain
window.DOMHelper = DOMHelper;
window.createDOMHelper = createDOMHelper;

console.log('DOM Helper utility loaded (shared/utils)');
