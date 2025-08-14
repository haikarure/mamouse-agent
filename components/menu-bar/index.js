/**
 * Menu Bar Component Entry Point
 * Provides unified interface for menu functionality with backward compatibility
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

console.log('📋 Menu Bar Component script loaded!');
console.log('📋 Current document ready state:', document.readyState);

import MenuManager from './menu-manager.js';
import MenuService from './menu-service.js';
import GeminiSettings from './submenus/gemini-settings.js';
import VoiceSettings from './submenus/voice-settings.js';
import ColorSettings from './submenus/color-settings.js';
import AboutSection from './submenus/about-section.js';

/**
 * MenuBarComponent - Unified Menu Component Interface
 * @class MenuBarComponent
 */
class MenuBarComponent {
  constructor() {
    // Component instances
    this.manager = null;
    this.service = null;

    // Submenu components
    this.geminiSettings = null;
    this.voiceSettings = null;
    this.colorSettings = null;
    this.aboutSection = null;

    // Component state
    this.#state = {
      initialized: false,
      ready: false
    };

    console.log('📋 Menu Bar Component initialized');
  }

  // Private properties
  #state = null;

  /**
   * Initialize menu bar component
   */
  async initialize() {
    try {
      console.log('📋 Initializing Menu Bar Component...');

      // Initialize service first
      this.service = new MenuService();
      const serviceReady = await this.service.initialize();

      if (!serviceReady) {
        throw new Error('Failed to initialize menu service');
      }

      // Initialize manager
      this.manager = new MenuManager();
      const managerReady = await this.manager.initialize();

      if (!managerReady) {
        throw new Error('Failed to initialize menu manager');
      }

      // Initialize submenu components
      await this.#initializeSubmenuComponents();

      // Setup integration between manager and service
      this.#setupIntegration();

      this.#state.initialized = true;
      this.#state.ready = true;

      console.log('✅ Menu Bar Component initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Menu Bar Component:', error);
      return false;
    }
  }

  /**
   * Initialize submenu components
   */
  async #initializeSubmenuComponents() {
    try {
      console.log('📋 Initializing submenu components...');

      // Initialize Gemini Settings
      this.geminiSettings = new GeminiSettings();
      const geminiReady = await this.geminiSettings.initialize();
      if (!geminiReady) {
        console.warn('⚠️ Failed to initialize Gemini Settings');
      }

      // Initialize Voice Settings
      this.voiceSettings = new VoiceSettings();
      const voiceReady = await this.voiceSettings.initialize();
      if (!voiceReady) {
        console.warn('⚠️ Failed to initialize Voice Settings');
      }

      // Initialize Color Settings
      this.colorSettings = new ColorSettings();
      const colorReady = await this.colorSettings.initialize();
      if (!colorReady) {
        console.warn('⚠️ Failed to initialize Color Settings');
      }

      // Initialize About Section
      this.aboutSection = new AboutSection();
      const aboutReady = await this.aboutSection.initialize();
      if (!aboutReady) {
        console.warn('⚠️ Failed to initialize About Section');
      }

      console.log('✅ Submenu components initialized');
    } catch (error) {
      console.error('❌ Error initializing submenu components:', error);
    }
  }

  /**
   * Setup integration between manager and service
   */
  #setupIntegration() {
    // Override manager's toggleMenuSection to save state
    const originalToggleSection = this.manager.toggleMenuSection.bind(this.manager);
    this.manager.toggleMenuSection = async (section) => {
      originalToggleSection(section);
      
      // Save active section to service
      const activeSection = this.manager.getActiveSection();
      await this.service.saveActiveSection(activeSection);
    };

    // Override manager's toggleMenu to save state
    const originalToggleMenu = this.manager.toggleMenu.bind(this.manager);
    this.manager.toggleMenu = async () => {
      originalToggleMenu();
      
      // Save menu state to service
      const state = this.manager.getState();
      await this.service.saveMenuState(state);
    };

    console.log('📋 Setup manager-service integration');
  }

  /**
   * Get menu manager instance
   */
  getManager() {
    return this.manager;
  }

  /**
   * Get menu service instance
   */
  getService() {
    return this.service;
  }

  /**
   * Get submenu component instances
   */
  getGeminiSettings() {
    return this.geminiSettings;
  }

  getVoiceSettings() {
    return this.voiceSettings;
  }

  getColorSettings() {
    return this.colorSettings;
  }

  getAboutSection() {
    return this.aboutSection;
  }

  /**
   * Toggle main menu
   */
  toggleMenu() {
    if (this.manager) {
      return this.manager.toggleMenu();
    }
  }

  /**
   * Toggle menu section
   */
  toggleMenuSection(section) {
    if (this.manager) {
      return this.manager.toggleMenuSection(section);
    }
  }

  /**
   * Get active section
   */
  getActiveSection() {
    if (this.manager) {
      return this.manager.getActiveSection();
    }
    return null;
  }

  /**
   * Close all sections
   */
  closeAllSections() {
    if (this.manager) {
      return this.manager.closeAllSections();
    }
  }

  /**
   * Check if menu is open
   */
  isMenuOpen() {
    if (this.manager) {
      return this.manager.isMenuOpen();
    }
    return false;
  }

  /**
   * Get component state
   */
  getState() {
    return {
      ...this.#state,
      manager: this.manager ? this.manager.getState() : null,
      service: this.service ? this.service.getState() : null
    };
  }

  /**
   * Check if component is ready
   */
  isReady() {
    return this.#state.ready;
  }

  /**
   * Cleanup component
   */
  cleanup() {
    if (this.manager) {
      this.manager.cleanup();
    }

    if (this.service) {
      this.service.cleanup();
    }

    // Cleanup submenu components
    if (this.geminiSettings) {
      this.geminiSettings.cleanup();
    }

    if (this.voiceSettings) {
      this.voiceSettings.cleanup();
    }

    if (this.colorSettings) {
      this.colorSettings.cleanup();
    }

    if (this.aboutSection) {
      this.aboutSection.cleanup();
    }

    this.#state.initialized = false;
    this.#state.ready = false;

    console.log('📋 Menu Bar Component cleaned up');
  }
}

// Create global instance
const globalMenuBarComponent = new MenuBarComponent();

// Initialize component when DOM is ready
console.log('📋 Menu Bar Component: Document ready state:', document.readyState);

if (document.readyState === 'loading') {
  console.log('📋 Menu Bar Component: Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 Menu Bar Component: DOMContentLoaded fired, initializing...');
    const success = await globalMenuBarComponent.initialize();
    console.log('📋 Menu Bar Component initialized via DOMContentLoaded:', success);
  });
} else {
  // DOM is already ready
  console.log('📋 Menu Bar Component: DOM already ready, initializing with delay...');
  setTimeout(async () => {
    console.log('📋 Menu Bar Component: Starting delayed initialization...');
    const success = await globalMenuBarComponent.initialize();
    console.log('📋 Menu Bar Component initialized immediately:', success);
  }, 100); // Small delay to ensure DOM elements are available
}

// Export component
export default MenuBarComponent;

// ===== BACKWARD COMPATIBILITY LAYER =====
// Restore original global functions and objects

// Global menu toggle function - restored from backup essential-functions.js
window.toggleMenu = function() {
  if (globalMenuBarComponent.isReady()) {
    globalMenuBarComponent.toggleMenu();
  } else {
    // Fallback to original implementation
    const slideMenu = document.getElementById('slide-menu');
    if (slideMenu) {
      const isActive = slideMenu.classList.contains('active');
      slideMenu.classList.toggle('active');

      const newState = slideMenu.classList.contains('active');
      setTimeout(() => {
        if (newState) {
          slideMenu.style.pointerEvents = 'auto';
          slideMenu.style.overflowY = 'auto';
        } else {
          slideMenu.style.pointerEvents = 'none';
          slideMenu.style.overflowY = 'hidden';
        }
      }, 300);
    }
  }
};

// Global menu section toggle function - direct implementation
window.toggleMenuSection = function(section) {
  console.log(`🔍 Direct toggleMenuSection called with section: ${section}`);

  // Always use direct DOM manipulation for reliability
  toggleMenuSectionDirect(section);
};

// Global MenuManager class - backward compatibility
window.MenuManager = class MenuManagerCompat {
  constructor() {
    this.activeSection = null;
    this.menuSections = null;
    console.log('Menu Manager (compat) initialized');
  }

  initialize() {
    this.menuSections = document.querySelectorAll('.menu-section');
    console.log(`🔍 Menu Manager (compat) initialized with ${this.menuSections.length} sections`);
  }

  toggleMenuSection(section) {
    if (globalMenuBarComponent.isReady()) {
      globalMenuBarComponent.toggleMenuSection(section);
      this.activeSection = globalMenuBarComponent.getActiveSection();
    } else {
      // Fallback implementation
      console.log(`🎯 toggleMenuSection called with section: ${section}`);
      
      if (!this.menuSections) {
        this.initialize();
      }

      const targetClass = section + '-section';
      let targetSection = null;
      
      this.menuSections.forEach(s => {
        if (s.classList.contains(targetClass)) {
          targetSection = s;
        }
      });

      if (!targetSection) {
        console.error(`❌ Target section not found: ${targetClass}`);
        return;
      }

      if (this.activeSection === section) {
        targetSection.classList.remove('active');
        this.activeSection = null;
      } else {
        this.menuSections.forEach(s => {
          s.classList.remove('active');
        });
        targetSection.classList.add('active');
        this.activeSection = section;
      }
    }
  }

  getActiveSection() {
    if (globalMenuBarComponent.isReady()) {
      return globalMenuBarComponent.getActiveSection();
    }
    return this.activeSection;
  }

  setActiveSection(section) {
    this.activeSection = section;
  }

  closeAllSections() {
    if (globalMenuBarComponent.isReady()) {
      globalMenuBarComponent.closeAllSections();
    } else {
      if (this.menuSections) {
        this.menuSections.forEach(s => {
          s.classList.remove('active');
        });
      }
      this.activeSection = null;
    }
  }
};

// Create global menu manager instance for backward compatibility
window.menuManager = new window.MenuManager();

// Expose global component instance
window.menuBarComponent = globalMenuBarComponent;

// ===== SUBMENU BACKWARD COMPATIBILITY =====
// Expose submenu components globally for backward compatibility

// API Manager compatibility
window.APIManager = {
  initGeminiApiSettings: async () => {
    const geminiSettings = globalMenuBarComponent.getGeminiSettings();
    return geminiSettings ? geminiSettings.initialize() : false;
  },
  saveGeminiApiKey: async () => {
    const geminiSettings = globalMenuBarComponent.getGeminiSettings();
    return geminiSettings ? geminiSettings.saveApiKey() : false;
  },
  saveGeminiModel: async (model) => {
    const geminiSettings = globalMenuBarComponent.getGeminiSettings();
    return geminiSettings ? geminiSettings.saveModel(model) : false;
  },
  showApiStatus: (type, message) => {
    console.log(`API Status (${type}): ${message}`);
  }
};

// Individual function exports for backward compatibility
window.initGeminiApiSettings = window.APIManager.initGeminiApiSettings;
window.saveGeminiApiKey = window.APIManager.saveGeminiApiKey;
window.saveGeminiModel = window.APIManager.saveGeminiModel;
window.showApiStatus = window.APIManager.showApiStatus;

// Color Controller compatibility
window.ColorController = class ColorControllerCompat {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    const colorSettings = globalMenuBarComponent.getColorSettings();
    if (colorSettings) {
      this.initialized = colorSettings.isInitialized();
    }
  }

  applyPreset(presetName) {
    const colorSettings = globalMenuBarComponent.getColorSettings();
    if (colorSettings) {
      colorSettings.applyPreset(presetName);
    }
  }

  getCurrentColors() {
    const colorSettings = globalMenuBarComponent.getColorSettings();
    return colorSettings ? colorSettings.getSettings().currentColors : null;
  }
};

// Create global color controller instance
window.colorController = new window.ColorController();

// ===== DIRECT EVENT LISTENER SETUP =====
// Ensure menu item clicks work regardless of component state
function setupDirectMenuListeners() {
  console.log('📋 Setting up direct menu item event listeners...');

  const menuItems = document.querySelectorAll('.menu-item[data-section]');
  console.log(`📋 Found ${menuItems.length} menu items`);

  menuItems.forEach(item => {
    const section = item.getAttribute('data-section');
    console.log(`📋 Setting up listener for section: ${section}`);

    // Remove any existing listeners first
    item.removeEventListener('click', handleMenuItemClick);

    // Add new listener
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`🔍 Menu item clicked: ${section}`);

      // Direct DOM manipulation for immediate response
      toggleMenuSectionDirect(section);
    });
  });
}

// Direct menu section toggle function
function toggleMenuSectionDirect(section) {
  console.log(`🎯 Direct toggle for section: ${section}`);

  const targetClass = section + '-section';
  const targetSection = document.querySelector(`.${targetClass}`);

  if (!targetSection) {
    console.error(`❌ Target section not found: .${targetClass}`);
    return;
  }

  // Get all menu sections
  const allSections = document.querySelectorAll('.menu-section');

  // Check if target section is currently active
  const isActive = targetSection.classList.contains('active');

  if (isActive) {
    // Close the active section
    console.log(`🔄 Closing section: ${section}`);
    targetSection.classList.remove('active');
    targetSection.style.display = 'none';
  } else {
    // Close all sections first
    console.log(`🔄 Closing all sections and opening: ${section}`);
    allSections.forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });

    // Open the target section
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
    targetSection.style.opacity = '1';
    targetSection.style.visibility = 'visible';
  }
}

// Setup listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDirectMenuListeners);
} else {
  // DOM is already ready
  setTimeout(setupDirectMenuListeners, 100);
}

// Also setup listeners after a delay to ensure all components are loaded
setTimeout(setupDirectMenuListeners, 1000);

console.log('📋 Menu Bar Component loaded with backward compatibility');
