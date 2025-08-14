// Input Container Manager - UI Logic for Input Container Component
// Manages input container UI interactions, styling, and state management
// Migrated from ui/input-container.js following SSOT principles

console.log('🔥 LOADING: input-container.js file is being loaded');

class InputContainerManager {
  constructor() {
    // DOM elements
    this.element = null;
    this.messageInput = null;
    this.messageForm = null;
    this.submitBtn = null;

    // State
    this.isInitialized = false;

    // Event listeners tracking
    this.eventListeners = new Map();

    // DDR CLEANUP: Removed over-engineered features (metrics, caching, debug mode) - not used externally
    
    console.log('📝 Input Container Manager initialized');
  }

  /**
   * Initialize input container manager
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Input Container Manager already initialized');
      return true;
    }
    
    try {
      // Get DOM elements
      this.element = document.getElementById('input-container');
      this.messageInput = document.getElementById('message-input');
      this.messageForm = document.getElementById('message-form');
      this.submitBtn = this.messageForm ? this.messageForm.querySelector('.submit-button') : null;

      if (!this.element) {
        throw new Error('Input container element not found');
      }
      
      // Setup input container functionality
      this.applyBasicStyling();
      this.setupEventListeners();
      this.setupButtonEventListeners();
      // DDR CLEANUP: Ripple effects handled by global setupRippleEffect() from ui-utils.js
      
      this.isInitialized = true;
      console.log('✅ Input Container Manager DOM elements and functionality initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Input Container Manager:', error);
      this._recordError(error, 'initialize');
      return false;
    }
  }

  /**
   * Get the input container DOM element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get the message input element
   */
  getMessageInput() {
    return this.messageInput;
  }

  /**
   * Get the message form element
   */
  getMessageForm() {
    return this.messageForm;
  }

  /**
   * Apply basic styling to input container
   */
  applyBasicStyling() {
    if (!this.element) return;
    
    try {
      this._log('debug', 'Applying basic styling...');
      this._applyCoreStyles();
      this._log('debug', 'Basic styling applied');
    } catch (error) {
      this._handleError(error, 'applyBasicStyling');
    }
  }

  /**
   * Apply core styles to input container
   */
  _applyCoreStyles() {
    if (!this.element) return;
    
    // Ensure proper z-index and positioning
    const currentZIndex = this._getComputedStyle().zIndex;
    if (currentZIndex === 'auto' || currentZIndex === '0') {
      this.element.style.zIndex = '99999';
    }
    
    // Ensure proper pointer events for interactivity
    this.element.style.pointerEvents = 'auto';
    
    // Ensure children can receive events
    const children = this.element.querySelectorAll('*');
    children.forEach(child => {
      child.style.pointerEvents = 'auto';
    });
  }

  /**
   * Get computed style of input container
   */
  _getComputedStyle() {
    return this.element ? window.getComputedStyle(this.element) : {};
  }

  /**
   * Setup event listeners for input container
   */
  setupEventListeners() {
    if (!this.element || !this.messageForm) return;
    
    try {
      // Form submission event
      const formHandler = (e) => {
        e.preventDefault();
        this._handleFormSubmission();
      };
      
      this.messageForm.addEventListener('submit', formHandler);
      this.eventListeners.set('form-submit', { 
        element: this.messageForm, 
        event: 'submit', 
        handler: formHandler 
      });
      
      console.log('✅ Input container event listeners setup');
      
    } catch (error) {
      this._handleError(error, 'setupEventListeners');
    }
  }

  /**
   * Handle form submission
   */
  _handleFormSubmission() {
    try {
      if (window.InputContainerComponent && window.InputContainerComponent.getService()) {
        const service = window.InputContainerComponent.getService();
        service.processMessage();
      } else if (window.sendMessage) {
        // Fallback to global sendMessage function
        window.sendMessage();
      } else {
        console.error('❌ No message processing service available');
      }
    } catch (error) {
      this._handleError(error, '_handleFormSubmission');
    }
  }

  /**
   * Setup button event listeners for input container buttons
   */
  setupButtonEventListeners() {
    try {
      // Voice button - DDR CLEANUP: Completely handled by Voice Component (SSOT)
      // Camera button - DDR CLEANUP: Completely handled by Camera Component (SSOT)
      // Menu button - DDR CLEANUP: Completely handled by Menu Component (SSOT)

      console.log('✅ Input container button event listeners setup - all buttons delegated to respective components');

    } catch (error) {
      this._handleError(error, 'setupButtonEventListeners');
    }
  }

  // DDR CLEANUP: All button click handlers removed - delegated to respective components (SSOT)
  // Voice button handling → Voice Component
  // Camera button handling → Camera Component
  // Menu button handling → Menu Component

  // DDR CLEANUP: Ripple effects methods removed - handled by global setupRippleEffect() from ui-utils.js

  /**
   * Apply complete setup
   */
  applyCompleteSetup() {
    if (!this.element) return false;
    
    try {
      this._log('debug', 'Applying complete setup...');
      this._applyCoreStyles();
      this._log('debug', 'Complete setup applied');
      return true;
    } catch (error) {
      this._handleError(error, 'applyCompleteSetup');
      return false;
    }
  }

  // DDR CLEANUP: Voice state management moved to components/voice/ (SSOT)
  // Voice state is now managed centrally by VoiceComponent

  /**
   * Check if input container manager is initialized
   */
  isElementAvailable() {
    return !!(this.element && this.element.parentNode);
  }

  // DDR CLEANUP: Removed over-engineered helper methods (_log, _handleError, _recordError) - simplified to direct console calls

  /**
   * Cleanup input container manager
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners.clear();

    this.isInitialized = false;
    console.log('📝 Input Container Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.InputContainerManager = InputContainerManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputContainerManager;
}

console.log('📝 Input Container Manager loaded');
