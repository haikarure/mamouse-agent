/**
 * Menu Manager for Mamouse Agent
 * Handles menu display, animations, and user interactions
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Menu Configuration - Restored from backup
const MENU_CONFIG = {
  // Animation Settings
  animation: {
    slideIn: { duration: 600, class: 'active' },
    sectionFadeIn: { duration: 500, class: 'active' },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Element Selectors - Centralized for easy maintenance
  selectors: {
    slideMenu: '#slide-menu',
    menuButton: '#menu-btn',
    menuSections: '.menu-section',
    menuItems: '.menu-item[data-section]'
  },

  // Timing Settings
  timing: {
    pointerEventsDelay: 300,
    sectionTransition: 500
  }
};

/**
 * MenuManager - Comprehensive Menu Management System
 * @class MenuManager
 */
class MenuManager {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      activeSection: null,
      isMenuOpen: false,
      isAnimating: false,
      initialized: false
    };

    // Event listeners tracking
    this.#eventListeners = new Map();
    
    console.log('📋 Menu Manager initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;

  /**
   * Initialize menu manager
   */
  async initialize() {
    try {
      console.log('📋 Initializing Menu Manager...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Initialize menu sections
      this.#initializeMenuSections();

      this.#state.initialized = true;
      console.log('✅ Menu Manager initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Menu Manager:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    console.log('📋 Starting DOM element caching...');
    console.log('📋 Document ready state:', document.readyState);
    console.log('📋 Looking for selectors:', MENU_CONFIG.selectors);

    const elements = {
      slideMenu: document.querySelector(MENU_CONFIG.selectors.slideMenu),
      menuButton: document.querySelector(MENU_CONFIG.selectors.menuButton),
      menuSections: document.querySelectorAll(MENU_CONFIG.selectors.menuSections),
      menuItems: document.querySelectorAll(MENU_CONFIG.selectors.menuItems)
    };

    console.log('📋 Found elements:', {
      slideMenu: !!elements.slideMenu,
      menuButton: !!elements.menuButton,
      menuSections: elements.menuSections.length,
      menuItems: elements.menuItems.length
    });

    // Validate critical elements
    if (!elements.slideMenu) {
      console.error('❌ Slide menu element not found with selector:', MENU_CONFIG.selectors.slideMenu);
      throw new Error('Slide menu element not found');
    }

    if (!elements.menuButton) {
      console.error('❌ Menu button element not found with selector:', MENU_CONFIG.selectors.menuButton);
      throw new Error('Menu button element not found');
    }

    // Cache elements
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    console.log(`📋 Successfully cached ${this.#elements.size} menu elements`);
  }

  /**
   * Setup event listeners
   */
  #setupEventListeners() {
    const menuButton = this.#elements.get('menuButton');
    const menuItems = this.#elements.get('menuItems');

    // Menu button click handler
    if (menuButton) {
      const menuClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      };

      menuButton.addEventListener('click', menuClickHandler);
      this.#eventListeners.set('menuClick', { element: menuButton, handler: menuClickHandler });
    }

    // Menu item click handlers
    if (menuItems) {
      menuItems.forEach(item => {
        const section = item.getAttribute('data-section');
        const itemClickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMenuSection(section);
        };

        item.addEventListener('click', itemClickHandler);
        this.#eventListeners.set(`menuItem-${section}`, { element: item, handler: itemClickHandler });
      });
    }

    console.log(`📋 Setup ${this.#eventListeners.size} event listeners`);
  }

  /**
   * Initialize menu sections
   */
  #initializeMenuSections() {
    const menuSections = this.#elements.get('menuSections');
    
    if (menuSections) {
      console.log(`📋 Found ${menuSections.length} menu sections:`);
      menuSections.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.className}`);
        
        // Ensure sections are hidden initially
        section.classList.remove('active');
        section.style.display = 'none';
      });
    }
  }

  /**
   * Toggle main menu - Restored from backup behavior
   */
  toggleMenu() {
    if (this.#state.isAnimating) return;

    const slideMenu = this.#elements.get('slideMenu');
    if (!slideMenu) return;

    console.log('📋 Menu toggle requested');
    
    const isActive = slideMenu.classList.contains('active');
    this.#state.isAnimating = true;

    try {
      slideMenu.classList.toggle('active');
      const newState = slideMenu.classList.contains('active');
      this.#state.isMenuOpen = newState;

      console.log(`📋 Menu ${newState ? 'opened' : 'closed'}`);

      // Handle pointer events and overflow with delay - restored from backup
      setTimeout(() => {
        if (newState) {
          slideMenu.style.pointerEvents = 'auto';
          slideMenu.style.overflowY = 'auto';
        } else {
          slideMenu.style.pointerEvents = 'none';
          slideMenu.style.overflowY = 'hidden';
        }
        this.#state.isAnimating = false;
      }, MENU_CONFIG.timing.pointerEventsDelay);

    } catch (error) {
      console.error('❌ Error toggling menu:', error);
      this.#state.isAnimating = false;
    }
  }

  /**
   * Toggle menu section - Restored from backup behavior
   */
  toggleMenuSection(section) {
    if (!section) return;

    console.log(`📋 Toggle menu section: ${section}`);
    console.log(`📋 Current active section: ${this.#state.activeSection}`);

    // Get menu sections, reinitialize if needed
    let menuSections = this.#elements.get('menuSections');
    if (!menuSections || menuSections.length === 0) {
      console.warn('⚠️ Menu sections not found or empty, reinitializing...');
      this.#cacheElements();
      menuSections = this.#elements.get('menuSections');

      if (!menuSections || menuSections.length === 0) {
        console.error('❌ Menu sections still not found after reinitialization');

        // Last resort: direct DOM query
        menuSections = document.querySelectorAll('.menu-section');
        if (menuSections && menuSections.length > 0) {
          console.log('✅ Found menu sections via direct DOM query:', menuSections.length);
          this.#elements.set('menuSections', menuSections);
        } else {
          console.error('❌ Menu sections not found even with direct DOM query');
          return;
        }
      }
    }

    const targetClass = section + '-section';
    console.log(`📋 Looking for class: ${targetClass}`);
    console.log(`📋 Available menu sections:`, menuSections.length);

    // Find target section
    let targetSection = null;
    menuSections.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.className}`);
      if (s.classList.contains(targetClass)) {
        targetSection = s;
        console.log(`✅ Found target section:`, s);
      }
    });

    if (!targetSection) {
      console.error(`❌ Target section not found: ${targetClass}`);
      console.log('Available sections:', Array.from(menuSections).map(s => s.className));

      // Try alternative approach - direct query
      targetSection = document.querySelector(`.${targetClass}`);
      if (targetSection) {
        console.log(`✅ Found target section via direct query:`, targetSection);
      } else {
        console.error(`❌ Target section not found even with direct query: .${targetClass}`);
        return;
      }
    }

    if (this.#state.activeSection === section) {
      // Close the section if it's already open
      console.log(`🔄 Closing active section: ${section}`);
      targetSection.classList.remove('active');
      targetSection.style.display = 'none';
      this.#state.activeSection = null;
    } else {
      // Close all sections first
      console.log(`🔄 Closing all sections and opening: ${section}`);
      menuSections.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
      });

      // Open the selected section - restored from backup
      targetSection.classList.add('active');
      targetSection.style.display = 'block';
      targetSection.style.opacity = '1';
      targetSection.style.visibility = 'visible';
      this.#state.activeSection = section;

      console.log(`✅ Section ${section} activated`);
    }
  }

  /**
   * Get current active section
   */
  getActiveSection() {
    return this.#state.activeSection;
  }

  /**
   * Set active section programmatically
   */
  setActiveSection(section) {
    this.#state.activeSection = section;
  }

  /**
   * Close all sections
   */
  closeAllSections() {
    const menuSections = this.#elements.get('menuSections');
    if (menuSections) {
      menuSections.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
      });
    }
    this.#state.activeSection = null;
  }

  /**
   * Check if menu is open
   */
  isMenuOpen() {
    return this.#state.isMenuOpen;
  }

  /**
   * Get menu state
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Remove event listeners
    this.#eventListeners.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.#eventListeners.clear();

    // Clear cached elements
    this.#elements.clear();

    console.log('📋 Menu Manager cleaned up');
  }
}

// Export for use in other modules
export default MenuManager;
