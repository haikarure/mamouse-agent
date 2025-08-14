/**
 * Menu Service for Mamouse Agent
 * Handles menu operations and state management
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Menu Service Configuration
const MENU_SERVICE_CONFIG = {
  // Storage keys
  storage: {
    menuState: 'mamouse_menu_state',
    activeSection: 'mamouse_active_section',
    menuPreferences: 'mamouse_menu_preferences'
  },

  // Default preferences
  defaults: {
    autoClose: true,
    rememberLastSection: true,
    animationsEnabled: true
  }
};

/**
 * MenuService - Menu Operations and State Management
 * @class MenuService
 */
class MenuService {
  constructor() {
    // Service state
    this.#state = {
      initialized: false,
      preferences: { ...MENU_SERVICE_CONFIG.defaults },
      lastActiveSection: null,
      menuHistory: []
    };

    console.log('📋 Menu Service initialized');
  }

  // Private properties
  #state = null;

  /**
   * Initialize menu service
   */
  async initialize() {
    try {
      console.log('📋 Initializing Menu Service...');

      // Load preferences from storage
      await this.#loadPreferences();

      // Load last active section if enabled
      if (this.#state.preferences.rememberLastSection) {
        await this.#loadLastActiveSection();
      }

      this.#state.initialized = true;
      console.log('✅ Menu Service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Menu Service:', error);
      return false;
    }
  }

  /**
   * Load preferences from storage
   */
  async #loadPreferences() {
    try {
      const stored = localStorage.getItem(MENU_SERVICE_CONFIG.storage.menuPreferences);
      if (stored) {
        const preferences = JSON.parse(stored);
        this.#state.preferences = { ...MENU_SERVICE_CONFIG.defaults, ...preferences };
        console.log('📋 Loaded menu preferences:', this.#state.preferences);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load menu preferences:', error);
      this.#state.preferences = { ...MENU_SERVICE_CONFIG.defaults };
    }
  }

  /**
   * Save preferences to storage
   */
  async #savePreferences() {
    try {
      localStorage.setItem(
        MENU_SERVICE_CONFIG.storage.menuPreferences,
        JSON.stringify(this.#state.preferences)
      );
      console.log('📋 Saved menu preferences');
    } catch (error) {
      console.warn('⚠️ Failed to save menu preferences:', error);
    }
  }

  /**
   * Load last active section
   */
  async #loadLastActiveSection() {
    try {
      const stored = localStorage.getItem(MENU_SERVICE_CONFIG.storage.activeSection);
      if (stored) {
        this.#state.lastActiveSection = stored;
        console.log('📋 Loaded last active section:', stored);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load last active section:', error);
    }
  }

  /**
   * Save active section
   */
  async saveActiveSection(section) {
    try {
      if (section) {
        localStorage.setItem(MENU_SERVICE_CONFIG.storage.activeSection, section);
        this.#state.lastActiveSection = section;
        
        // Add to history
        this.#addToHistory(section);
        
        console.log('📋 Saved active section:', section);
      } else {
        localStorage.removeItem(MENU_SERVICE_CONFIG.storage.activeSection);
        this.#state.lastActiveSection = null;
        console.log('📋 Cleared active section');
      }
    } catch (error) {
      console.warn('⚠️ Failed to save active section:', error);
    }
  }

  /**
   * Add section to history
   */
  #addToHistory(section) {
    // Remove if already exists
    const index = this.#state.menuHistory.indexOf(section);
    if (index > -1) {
      this.#state.menuHistory.splice(index, 1);
    }

    // Add to beginning
    this.#state.menuHistory.unshift(section);

    // Keep only last 10 items
    if (this.#state.menuHistory.length > 10) {
      this.#state.menuHistory = this.#state.menuHistory.slice(0, 10);
    }
  }

  /**
   * Get menu preferences
   */
  getPreferences() {
    return { ...this.#state.preferences };
  }

  /**
   * Update menu preferences
   */
  async updatePreferences(newPreferences) {
    try {
      this.#state.preferences = { ...this.#state.preferences, ...newPreferences };
      await this.#savePreferences();
      console.log('📋 Updated menu preferences:', this.#state.preferences);
      return true;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Get last active section
   */
  getLastActiveSection() {
    return this.#state.lastActiveSection;
  }

  /**
   * Get menu history
   */
  getMenuHistory() {
    return [...this.#state.menuHistory];
  }

  /**
   * Clear menu history
   */
  clearHistory() {
    this.#state.menuHistory = [];
    console.log('📋 Cleared menu history');
  }

  /**
   * Save menu state
   */
  async saveMenuState(state) {
    try {
      const menuState = {
        isOpen: state.isMenuOpen || false,
        activeSection: state.activeSection || null,
        timestamp: Date.now()
      };

      localStorage.setItem(
        MENU_SERVICE_CONFIG.storage.menuState,
        JSON.stringify(menuState)
      );

      console.log('📋 Saved menu state:', menuState);
    } catch (error) {
      console.warn('⚠️ Failed to save menu state:', error);
    }
  }

  /**
   * Load menu state
   */
  async loadMenuState() {
    try {
      const stored = localStorage.getItem(MENU_SERVICE_CONFIG.storage.menuState);
      if (stored) {
        const menuState = JSON.parse(stored);
        console.log('📋 Loaded menu state:', menuState);
        return menuState;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load menu state:', error);
    }
    return null;
  }

  /**
   * Reset all menu data
   */
  async resetMenuData() {
    try {
      // Clear storage
      localStorage.removeItem(MENU_SERVICE_CONFIG.storage.menuState);
      localStorage.removeItem(MENU_SERVICE_CONFIG.storage.activeSection);
      localStorage.removeItem(MENU_SERVICE_CONFIG.storage.menuPreferences);

      // Reset state
      this.#state.preferences = { ...MENU_SERVICE_CONFIG.defaults };
      this.#state.lastActiveSection = null;
      this.#state.menuHistory = [];

      console.log('📋 Reset all menu data');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset menu data:', error);
      return false;
    }
  }

  /**
   * Get service state
   */
  getState() {
    return {
      initialized: this.#state.initialized,
      preferences: { ...this.#state.preferences },
      lastActiveSection: this.#state.lastActiveSection,
      historyCount: this.#state.menuHistory.length
    };
  }

  /**
   * Validate menu section
   */
  validateSection(section) {
    const validSections = ['api', 'settings', 'theme', 'about'];
    return validSections.includes(section);
  }

  /**
   * Get available menu sections
   */
  getAvailableSections() {
    return ['api', 'settings', 'theme', 'about'];
  }

  /**
   * Check if animations are enabled
   */
  areAnimationsEnabled() {
    return this.#state.preferences.animationsEnabled;
  }

  /**
   * Check if auto-close is enabled
   */
  isAutoCloseEnabled() {
    return this.#state.preferences.autoClose;
  }

  /**
   * Check if remember last section is enabled
   */
  isRememberLastSectionEnabled() {
    return this.#state.preferences.rememberLastSection;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Save current state before cleanup
    if (this.#state.initialized) {
      this.#savePreferences().catch(console.warn);
    }

    console.log('📋 Menu Service cleaned up');
  }
}

// Export for use in other modules
export default MenuService;
