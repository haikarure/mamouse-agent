// Window Manager - UI Logic for Window Component
// Manages window transparency, drag functionality, and window-related UI interactions
// Migrated from ui/window-manager.js following SSOT principles

class WindowManager {
  constructor() {
    // DOM elements
    this.menuBtn = null;
    
    // State
    this.initialized = false;
    
    console.log('🪟 Window Manager initialized');
  }

  /**
   * Initialize window manager
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Window Manager already initialized');
      return;
    }
    
    try {
      // Get DOM elements
      this.menuBtn = document.getElementById('menu-btn');
      
      // Setup window functionality
      this.ensureTransparency();
      this.setupDraggableElements();
      
      this.initialized = true;
      console.log('✅ Window Manager DOM elements and functionality initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Window Manager:', error);
      throw error;
    }
  }

  /**
   * Ensure window transparency and prevent visual artifacts
   */
  ensureTransparency() {
    // Remove all borders and backgrounds that might cause visual artifacts
    document.documentElement.style.backgroundColor = 'transparent';
    document.documentElement.style.border = 'none';
    document.documentElement.style.boxShadow = 'none';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.border = 'none';
    document.body.style.boxShadow = 'none';

    // Add transparency class
    document.documentElement.classList.add('transparent-window');
    document.body.classList.add('transparent-window');

    // Inject critical transparency styles
    this.injectTransparencyStyles();
    
    console.log('🎯 Window transparency ensured');
  }
  
  /**
   * Inject critical transparency and anti-resize styles
   */
  injectTransparencyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Critical transparency styles */
      html, body {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        resize: none !important;
      }
      
      /* Prevent resize arrows at edges */
      html::after,
      body::after,
      .app-container::after,
      .app-window::after {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9999;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        resize: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup draggable elements functionality
   */
  setupDraggableElements() {
    // Ensure elements are not draggable by default
    document.body.style.webkitAppRegion = 'no-drag';
    document.documentElement.style.webkitAppRegion = 'no-drag';

    // State tracking
    let isDragging = false;
    let doubleClickDetected = false;
    let dragOverlay = null;

    // Create drag overlay
    const createDragOverlay = () => {
      if (dragOverlay) return;

      dragOverlay = document.createElement('div');
      dragOverlay.id = 'drag-overlay';
      dragOverlay.style.position = 'fixed';
      dragOverlay.style.top = '0';
      dragOverlay.style.left = '0';
      dragOverlay.style.width = '100%';
      dragOverlay.style.height = '100%';
      dragOverlay.style.backgroundColor = 'rgba(0, 168, 255, 0.1)';
      dragOverlay.style.border = '2px dashed rgba(0, 168, 255, 0.5)';
      dragOverlay.style.zIndex = '9999';
      dragOverlay.style.pointerEvents = 'none';
      dragOverlay.style.animation = 'pulse 1s infinite';
      document.body.appendChild(dragOverlay);
    };

    // Remove drag overlay
    const removeDragOverlay = () => {
      if (dragOverlay && dragOverlay.parentNode) {
        dragOverlay.parentNode.removeChild(dragOverlay);
        dragOverlay = null;
      }
    };

    // Enable drag mode
    const enableDragMode = () => {
      document.body.style.webkitAppRegion = 'drag';
      document.body.style.cursor = 'move';
      document.body.classList.add('drag-mode');
      createDragOverlay();
      isDragging = true;
      console.log('🪟 Drag mode enabled');
    };

    // Disable drag mode
    const disableDragMode = () => {
      document.body.style.webkitAppRegion = 'no-drag';
      document.body.style.cursor = 'default';
      document.body.classList.remove('drag-mode');
      removeDragOverlay();
      isDragging = false;
      console.log('🪟 Drag mode disabled');
    };

    // Setup double-click drag functionality on menu button
    if (this.menuBtn) {
      this.menuBtn.addEventListener('dblclick', (e) => {
        console.log('🪟 Double click detected on menu button');
        doubleClickDetected = true;
        e.preventDefault();
        e.stopPropagation();

        // Add mousedown listener
        this.menuBtn.addEventListener('mousedown', onMenuButtonMouseDown);
      });

      // Handle mousedown after double click
      const onMenuButtonMouseDown = (e) => {
        if (doubleClickDetected) {
          console.log('🪟 Mouse down after double click');
          enableDragMode();

          // Add mouseup listener
          document.addEventListener('mouseup', onDocumentMouseUp);

          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Handle mouseup to disable drag
      const onDocumentMouseUp = (e) => {
        console.log('🪟 Mouse up detected, disabling drag mode');
        disableDragMode();
        doubleClickDetected = false;

        // Remove event listeners
        this.menuBtn.removeEventListener('mousedown', onMenuButtonMouseDown);
        document.removeEventListener('mouseup', onDocumentMouseUp);

        e.preventDefault();
        e.stopPropagation();
      };
    } else {
      console.error('❌ Menu button not found for drag functionality!');
    }
  }

  /**
   * Check if window manager is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Cleanup window manager
   */
  cleanup() {
    // Remove any injected styles or event listeners if needed
    this.initialized = false;
    console.log('🪟 Window Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.WindowManager = WindowManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WindowManager;
}

console.log('🪟 Window Manager loaded');
