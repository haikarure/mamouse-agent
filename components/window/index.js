// Window Component Entry Point
// This file serves as the main entry point for the window component
// Following SSOT principles - all window-related functionality is managed here

const WindowComponent = {
  // Component metadata
  name: 'Window',
  version: '1.0.0',
  description: 'Window management component for Mamouse Agent',
  
  // Component modules
  manager: null,
  service: null,
  
  // Initialization status
  initialized: false,
  
  /**
   * Initialize the window component
   * This method sets up all window-related functionality
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Window component already initialized');
      return true;
    }
    
    try {
      console.log('🪟 Initializing Window Component...');
      
      // Initialize window manager (UI logic)
      if (window.WindowManager) {
        this.manager = new window.WindowManager();
        await this.manager.initialize();
        console.log('✅ Window Manager initialized');
      }
      
      // Window service is handled by the main process
      // UI components only need to interact with the manager
      
      this.initialized = true;
      console.log('✅ Window Component fully initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Window Component:', error);
      return false;
    }
  },
  
  /**
   * Get the window manager instance
   */
  getManager() {
    return this.manager;
  },
  
  /**
   * Check if component is initialized
   */
  isInitialized() {
    return this.initialized;
  },
  
  /**
   * Cleanup window component
   */
  cleanup() {
    if (this.manager && this.manager.cleanup) {
      this.manager.cleanup();
    }
    this.initialized = false;
    console.log('🪟 Window Component cleaned up');
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.WindowComponent = WindowComponent;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WindowComponent;
}

console.log('🪟 Window Component entry point loaded');
