// CONSOLIDATED Mouse Handler - Single source of truth for ALL mouse/click-through behavior
class MouseHandler {
  constructor() {
    console.log('🔧 MouseHandler constructor called');
    this.isIgnoringMouseEvents = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    console.log('🔧 MouseHandler constructor completed');
  }

  initialize() {
    // Check if required functions are available
    if (!window.isInteractiveElement || !window.electronAPI?.setIgnoreMouseEvents) {
      console.error('Required functions not available for mouse handler');
      return;
    }

    // Set initial pointer-events for interactive elements
    this.setupInitialPointerEvents();

    // Single mousemove listener to handle everything
    document.addEventListener('mousemove', (event) => {
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;

      // Check if over interactive element
      const isOverInteractive = window.isInteractiveElement(event.target);

      // Enable click-through only when NOT over interactive elements
      this.setClickThrough(!isOverInteractive);
    });

    console.log('Mouse handler initialized - click-through active');
  }

  setupInitialPointerEvents() {
    // DDR CLEANUP: Use shared constants instead of duplicate selectors
    // Interactive selectors consolidated in shared/ui/ui-constants.js for SSOT
    const interactiveSelectors = window.MAMOUSE_CONSTANTS?.SELECTORS?.INTERACTIVE || [
      // Fallback selectors if constants not loaded yet
      '.input-container', '.input-container *',
      '.window-controls', '.window-controls *',
      '.slide-menu', '.slide-menu *',
      'button', 'input', 'select', 'a',
      '.camera-modal', '.camera-modal *'
      // .bubble-content-area deliberately excluded - handled by bubble chat system
    ];

    interactiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.setProperty('pointer-events', 'auto', 'important');
      });
    });
  }

  setClickThrough(enabled) {
    if (this.isIgnoringMouseEvents === enabled) return;

    try {
      window.electronAPI.setIgnoreMouseEvents(enabled, enabled ? { forward: true } : undefined);
      this.isIgnoringMouseEvents = enabled;
    } catch (error) {
      console.error('Click-through error:', error);
    }
  }

  // Force re-evaluation of click-through state based on current mouse position
  reevaluateClickThrough() {
    if (!window.isInteractiveElement) return;

    const elementAtPoint = document.elementFromPoint(this.lastMouseX || 0, this.lastMouseY || 0);
    const isOverInteractive = window.isInteractiveElement(elementAtPoint);

    // Enable click-through only when NOT over interactive elements
    this.setClickThrough(!isOverInteractive);

    console.log(`🔄 Click-through re-evaluated: ${!isOverInteractive ? 'enabled' : 'disabled'} (mouse over ${elementAtPoint?.tagName || 'unknown'})`);
  }
}

// Export
if (typeof window !== 'undefined') {
  window.MouseHandler = MouseHandler;
}
