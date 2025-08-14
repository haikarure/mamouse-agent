/**
 * Event Manager - Mengelola semua event listeners aplikasi
 * Berisi logika untuk mengatur event listeners untuk window controls, API settings, dan form events
 */

class EventManager {
  constructor() {
    console.log('🔧 EventManager constructor called');
    this.initialized = false;
    this.eventListeners = [];

    // Initialize utilities
    this.utils = window.createUtilityManager ? window.createUtilityManager('EventManager') : null;

    // DUPLICATE REMOVED: Using safe logging helper
    this.utils?.safeLog('EventManager created') || console.log('✅ EventManager created successfully');
  }

  /**
   * Inisialisasi event manager
   */
  initialize() {
    console.log('🔧 EventManager.initialize() called');
    if (this.initialized) {
      // DUPLICATE REMOVED: Using safe logging helper
      this.utils?.safeLogWarning('EventManager sudah diinisialisasi') || console.warn('EventManager sudah diinisialisasi');
      return;
    }

    // DUPLICATE REMOVED: Using safe logging helper
    this.utils?.safeLog('🎧 Menginisialisasi Event Manager...') || console.log('🎧 Menginisialisasi Event Manager...');

    try {
      // Setup all event listeners
      this.setupModalEvents();
      this.setupAPISettingsEvents();
      this.setupFormEvents();
      this.setupMenuEvents();

      this.initialized = true;
      // DUPLICATE REMOVED: Using safe logging helper
      this.utils?.safeLogSuccess('Event Manager berhasil diinisialisasi') || console.log('✅ Event Manager berhasil diinisialisasi');

    } catch (error) {
      if (this.utils) {
        this.utils.handleError(error, 'inisialisasi Event Manager');
      } else {
        console.error('❌ Error saat inisialisasi Event Manager:', error);
        console.error('Detail error:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    if (this.utils) {
      this.utils.log('📋 Setting up modal events...');
    } else {
      console.log('📋 Setting up modal events...');
    }

    // Close modal when clicking outside
    const modalHandler = (e) => {
      // DUPLICATE REMOVED: Using safe element access helper
      const mcpModal = this.utils?.getElement('mcp-modal', false) || document.getElementById('mcp-modal');
      if (e.target === mcpModal && window.hideMcpModal) {
        window.hideMcpModal();
      }
    };

    window.addEventListener('click', modalHandler);
    this.eventListeners.push({ element: window, event: 'click', handler: modalHandler });
    if (this.utils) {
      this.utils.logSuccess('Modal click-outside event listener added');
    } else {
      console.log('✅ Modal click-outside event listener added');
    }
  }

  /**
   * Setup API settings events
   */
  setupAPISettingsEvents() {
    if (this.utils) {
      this.utils.log('🔑 Setting up API settings events...');
    } else {
      console.log('🔑 Setting up API settings events...');
    }

    // Gemini API save button
    // DUPLICATE REMOVED: Using safe element access helper
    const saveApiKeyBtn = this.utils?.getElement('save-api-key-btn', false) || document.getElementById('save-api-key-btn');
    if (saveApiKeyBtn) {
      const saveGeminiHandler = () => {
        if (window.saveGeminiApiKey) {
          window.saveGeminiApiKey();
        }
      };

      saveApiKeyBtn.addEventListener('click', saveGeminiHandler);
      this.eventListeners.push({ element: saveApiKeyBtn, event: 'click', handler: saveGeminiHandler });
      // DUPLICATE REMOVED: Using safe logging helper
      this.utils?.safeLogSuccess('Gemini API save button event listener added') || console.log('✅ Gemini API save button event listener added');
    } else {
      // DUPLICATE REMOVED: Using safe logging helper
      this.utils?.safeLogError('Save API key button not found!') || console.error('Save API key button not found!');
    }

    // DDR CLEANUP: ElevenLabs event listeners removed - voice functionality disabled
  }

  /**
   * Setup form events
   */
  setupFormEvents() {
    console.log('📝 Setting up form events...');

    // Message form
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
      const formHandler = (e) => {
        e.preventDefault();
        if (window.sendMessage) {
          window.sendMessage();
        }
      };

      messageForm.addEventListener('submit', formHandler);
      this.eventListeners.push({ element: messageForm, event: 'submit', handler: formHandler });
      console.log('✅ Message form event listener added');
    } else {
      console.error('Message form not found!');
    }
  }

  /**
   * Setup menu events
   */
  setupMenuEvents() {
    console.log('📋 Setting up menu events...');

    // Menu button
    const menuBtn = document.getElementById('menu-btn');
    const slideMenu = document.getElementById('slide-menu');

    console.log('🔍 DEBUG: menuBtn found:', !!menuBtn);
    console.log('🔍 DEBUG: slideMenu found:', !!slideMenu);

    if (menuBtn && slideMenu) {
      const menuHandler = () => {
        console.log('🎯 MENU CLICKED! Current active state:', slideMenu.classList.contains('active'));
        slideMenu.classList.toggle('active');
        console.log('🎯 MENU TOGGLED! New active state:', slideMenu.classList.contains('active'));

        setTimeout(() => {
          if (slideMenu.classList.contains('active')) {
            slideMenu.style.pointerEvents = 'auto';
            slideMenu.style.overflowY = 'auto';
            console.log('🎯 MENU ACTIVATED - pointer events enabled');

            // Add wheel event listener for menu scrolling - optimized to not interfere with bubble chat
            const wheelHandler = (e) => {
              // Only handle wheel events if they originate within the menu itself
              if (slideMenu.scrollHeight > slideMenu.clientHeight &&
                  slideMenu.contains(e.target)) {
                // Only stop propagation if the event is actually within the menu
                e.stopPropagation();
              }
            };
            slideMenu.addEventListener('wheel', wheelHandler, { passive: true });
          } else {
            slideMenu.style.pointerEvents = 'none';
            slideMenu.style.overflowY = 'hidden';
            console.log('🎯 MENU DEACTIVATED - pointer events disabled');
          }
        }, 300);
      };

      menuBtn.addEventListener('click', menuHandler);
      this.eventListeners.push({ element: menuBtn, event: 'click', handler: menuHandler });
      console.log('✅ Menu button event listener added successfully');
    } else {
      console.error('❌ Menu button or slide menu not found!');
      console.error('menuBtn:', menuBtn);
      console.error('slideMenu:', slideMenu);
    }



    // Menu items - with enhanced debugging
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(`🔍 Found ${menuItems.length} menu items:`, Array.from(menuItems).map(item => item.getAttribute('data-section')));

    menuItems.forEach(item => {
      const menuItemHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const section = item.getAttribute('data-section');
        console.log(`🎯 Menu item clicked: ${section}`);
        console.log(`🔍 MenuManager available:`, !!window.menuManager);
        console.log(`🔍 toggleMenuSection available:`, !!(window.menuManager && window.menuManager.toggleMenuSection));

        if (window.menuManager && window.menuManager.toggleMenuSection) {
          console.log(`🚀 Calling toggleMenuSection(${section})`);
          window.menuManager.toggleMenuSection(section);
        } else {
          console.error('❌ MenuManager or toggleMenuSection not available');
          console.error('window.menuManager:', window.menuManager);
        }
      };

      item.addEventListener('click', menuItemHandler);
      this.eventListeners.push({ element: item, event: 'click', handler: menuItemHandler });
    });
    console.log(`✅ ${menuItems.length} menu item event listeners added`);
  }

  /**
   * Get initialization status
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Remove all event listeners (for cleanup)
   */
  cleanup() {
    console.log('🧹 Cleaning up Event Manager...');
    
    this.eventListeners.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    });
    
    this.eventListeners = [];
    this.initialized = false;
    console.log('✅ Event Manager cleanup completed');
  }

  /**
   * Get event listeners count (for debugging)
   */
  getEventListenersCount() {
    return this.eventListeners.length;
  }
}

// Export class
window.EventManager = EventManager;

console.log('Event Manager loaded');
