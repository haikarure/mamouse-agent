// Icon Manager for Mamouse Agent
// ARCHITECTURAL MIGRATION: Extracted from shared/utils/icons.js
// UI-specific DOM manipulation and icon replacement functionality
// This handles UI-specific icon management, not pure utility functions

/**
 * Function to replace icon placeholders with actual SVG
 * EXTRACTED: From shared/utils/icons.js - UI-specific DOM manipulation
 */
function replaceIconPlaceholders() {
  // Check if icon utilities are available
  if (!window.Icons || !window.Icons.getIcon) {
    console.warn('⚠️ Icon utilities not available, skipping icon replacement');
    return;
  }

  const iconMappings = [
    // Main UI Icons
    { selector: '.icon-send', icon: 'send' },
    { selector: '.icon-microphone', icon: 'microphone' },
    { selector: '.icon-camera', icon: 'camera' },
    { selector: '.icon-menu', icon: 'menu' },
    { selector: '.icon-restart', icon: 'restart' },
    { selector: '.icon-clock', icon: 'clock' },

    // Menu Icons
    { selector: '.icon-settings', icon: 'settings' },
    { selector: '.icon-voice', icon: 'voice' },
    { selector: '.icon-palette', icon: 'palette' },
    { selector: '.icon-info', icon: 'info' }
  ];

  iconMappings.forEach(mapping => {
    const elements = document.querySelectorAll(mapping.selector);
    elements.forEach(element => {
      if (element && !element.innerHTML.trim()) {
        element.innerHTML = window.Icons.getIcon(mapping.icon);
        console.log(`✅ Replaced ${mapping.selector} with ${mapping.icon} icon`);
      }
    });
  });
}

/**
 * Initialize icon manager system
 * EXTRACTED: From shared/utils/icons.js - UI-specific initialization
 */
function initializeIconManager() {
  console.log('🎨 Icon Manager initialized');
  
  // Replace icon placeholders with actual SVG
  replaceIconPlaceholders();
  
  // Export icon manager functions globally
  window.IconManager = {
    replaceIconPlaceholders
  };
  
  console.log('✅ Icon Manager functions exported to window');
}

// Initialize icons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Icon Manager loading...');
  initializeIconManager();
});

// Fallback initialization for cases where DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // DOM is still loading, event listener will handle it
} else {
  // DOM is already loaded, initialize immediately
  console.log('🎨 Icon Manager loading (immediate)...');
  initializeIconManager();
}

// Export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    replaceIconPlaceholders,
    initializeIconManager
  };
}

console.log('✅ Icon Manager loaded (shared/ui) - ARCHITECTURAL MIGRATION: Extracted from shared/utils/icons.js');
