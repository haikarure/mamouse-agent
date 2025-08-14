// Input Container Component Entry Point
// This file serves as the main entry point for the input container component
// Following SSOT principles - all input container-related functionality is managed here

console.log('🔥 LOADING: input-container/index.js file is being loaded');

const InputContainerComponent = {
  // Component metadata
  name: 'InputContainer',
  version: '1.0.0',
  description: 'Input container component for Mamouse Agent',

  // Component modules
  manager: null,
  service: null,

  // Initialization status
  initialized: false,

  /**
   * Initialize the input container component
   * This method sets up all input container-related functionality
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Input Container component already initialized');
      return true;
    }

    try {
      console.log('📝 Initializing Input Container Component...');

      // Initialize input container manager (UI logic)
      if (window.InputContainerManager) {
        this.manager = new window.InputContainerManager();
        const managerResult = await this.manager.initialize();
        if (managerResult) {
          console.log('✅ Input Container Manager initialized');
        } else {
          console.error('❌ Input Container Manager initialization failed');
          return false;
        }
      } else {
        console.error('❌ InputContainerManager class not available');
        return false;
      }

      // Initialize input service (processing logic)
      if (window.InputService) {
        this.service = new window.InputService();
        const serviceResult = await this.service.initialize();
        if (serviceResult) {
          console.log('✅ Input Service initialized');
        } else {
          console.error('❌ Input Service initialization failed');
          return false;
        }
      } else {
        console.error('❌ InputService class not available');
        return false;
      }

      this.initialized = true;
      console.log('✅ Input Container Component fully initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Input Container Component:', error);
      return false;
    }
  },
  
  /**
   * Get the input container manager instance
   */
  getManager() {
    return this.manager;
  },
  
  /**
   * Get the input service instance
   */
  getService() {
    return this.service;
  },
  
  /**
   * Get the input container DOM element
   */
  getElement() {
    return this.manager ? this.manager.getElement() : null;
  },
  
  /**
   * Check if component is initialized
   */
  isInitialized() {
    return this.initialized;
  },
  
  // DDR CLEANUP: Voice state management moved to components/voice/ (SSOT)
  
  /**
   * Apply complete setup
   */
  applyCompleteSetup() {
    if (this.manager && this.manager.applyCompleteSetup) {
      return this.manager.applyCompleteSetup();
    }
    return false;
  },
  
  /**
   * Cleanup input container component
   */
  cleanup() {
    if (this.manager && this.manager.cleanup) {
      this.manager.cleanup();
    }
    if (this.service && this.service.cleanup) {
      this.service.cleanup();
    }
    this.initialized = false;
    console.log('📝 Input Container Component cleaned up');
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.InputContainerComponent = InputContainerComponent;

  // DDR CLEANUP: Simplified backward compatibility - initialization handled by initialization-manager.js
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputContainerComponent;
}

console.log('📝 Input Container Component entry point loaded');
console.log('🔍 Available classes:', {
  InputContainerManager: typeof window.InputContainerManager,
  InputService: typeof window.InputService,
  inputContainer: typeof window.inputContainer
});
