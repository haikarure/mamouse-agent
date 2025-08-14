/**
 * Initialization Manager - Mengelola urutan inisialisasi aplikasi
 * Berisi logika untuk menginisialisasi semua manager dan komponen UI
 * MockApiManager extracted to shared/services/mock-service.js for better organization
 * MOVED: From shared/services/initialization-manager.js to core/initialization-manager.js for optimal architecture
 * RELOCATION: Moved to core/ directory as this handles core application initialization
 */

// Import MockApiManager from utils
if (typeof require !== 'undefined') {
  // Node.js environment - load via require
  const MockApiManager = require('../shared/utils/mock-service');
  if (typeof window !== 'undefined') {
    window.MockApiManager = MockApiManager;
  }
} else {
  // Browser environment - load via script tag (should be loaded before this file)
  // MockApiManager will be available as window.MockApiManager
}

class InitializationManager {
  constructor() {
    this.initialized = false;
    this.managers = {};

    // Initialize utilities
    this.utils = window.createUtilityManager ? window.createUtilityManager('InitializationManager') : null;

    if (this.utils) {
      this.utils.log('InitializationManager created');
    } else {
      console.log('InitializationManager created');
    }
  }

  /**
   * Inisialisasi utama aplikasi
   * Dipanggil saat DOMContentLoaded
   */
  async initialize() {
    if (this.initialized) {
      console.warn('InitializationManager sudah diinisialisasi');
      return;
    }

    console.log('🚀 Memulai inisialisasi aplikasi...');

    try {
      // Step 1: Connect to WebSocket server
      await this.initializeWebSocket();

      // Step 2: Initialize UI utilities
      await this.initializeUIUtilities();

      // Step 3: Initialize all managers in correct order
      await this.initializeManagers();

      // Step 4: Setup event listeners
      await this.setupEventListeners();

      // Step 5: Initialize API settings
      await this.initializeAPISettings();

      // Step 6: Setup UI components
      await this.setupUIComponents();

      // Step 7: Finalize initialization
      await this.finalizeInitialization();

      this.initialized = true;
      console.log('✅ Inisialisasi aplikasi berhasil diselesaikan');

    } catch (error) {
      console.error('❌ Error saat inisialisasi aplikasi:', error);
      console.error('Detail error:', error.stack);
      throw error;
    }
  }

  /**
   * Step 1: Initialize WebSocket connection
   */
  async initializeWebSocket() {
    console.log('📡 Menginisialisasi WebSocket...');
    
    if (window.connectWebSocket) {
      window.connectWebSocket();
      console.log('✅ WebSocket connection initiated');
    } else {
      console.warn('⚠️ connectWebSocket function not available');
    }
  }

  /**
   * Step 2: Initialize UI utilities
   */
  async initializeUIUtilities() {
    console.log('🎨 Menginisialisasi UI utilities...');

    // Initialize custom dropdown
    if (window.initializeCustomDropdown) {
      window.initializeCustomDropdown();
      console.log('✅ Custom dropdown initialized');
    } else {
      console.warn('⚠️ initializeCustomDropdown function not available');
    }
  }

  /**
   * Step 3: Initialize all managers in correct dependency order
   */
  async initializeManagers() {
    console.log('🔧 Menginisialisasi managers...');

    // Initialize color controller (no dependencies)
    this.managers.colorController = new ColorController();
    window.colorController = this.managers.colorController;
    console.log('✅ Color Controller initialized');

    // Initialize status manager (no dependencies)
    this.managers.statusManager = new StatusManager();
    window.statusManager = this.managers.statusManager;
    console.log('✅ Status Manager initialized');

    // Audio manager functionality moved to Voice Component
    // window.audioManager will be set by voice output manager
    console.log('✅ Audio Manager functionality moved to Voice Component');

    // Initialize mouse handler (depends on DOM elements)
    try {
      console.log('🔧 Starting MouseHandler initialization...');
      this.managers.mouseHandler = new MouseHandler();
      window.mouseHandler = this.managers.mouseHandler;
      this.managers.mouseHandler.initialize();
      console.log('✅ Mouse Handler initialized successfully');
    } catch (error) {
      console.error('❌ MouseHandler initialization failed:', error);
    }

    // Initialize voice component (depends on DOM elements)
    if (window.VoiceComponent) {
      await window.VoiceComponent.initialize();
      this.managers.voiceManager = window.VoiceComponent.getManager();
      this.managers.voiceService = window.VoiceComponent.getService();
      window.voiceManager = this.managers.voiceManager;
      window.voiceService = this.managers.voiceService;
      console.log('✅ Voice Component initialized');
    } else {
      console.error('❌ VoiceComponent not available');
    }

    // Initialize camera component (depends on DOM elements)
    if (window.CameraComponent) {
      await window.CameraComponent.initialize();
      this.managers.cameraManager = window.CameraComponent.getManager();
      this.managers.cameraService = window.CameraComponent.getService();
      window.cameraManager = this.managers.cameraManager;
      window.cameraService = this.managers.cameraService;
      console.log('✅ Camera Component initialized');
    } else {
      console.error('❌ CameraComponent not available');
    }

    // Initialize window component (depends on DOM elements)
    if (window.WindowComponent) {
      await window.WindowComponent.initialize();
      this.managers.windowManager = window.WindowComponent.getManager();
      window.windowManager = this.managers.windowManager;
      console.log('✅ Window Component initialized');
    } else {
      console.error('❌ WindowComponent not available');
    }

    // Initialize tool manager (no dependencies)
    this.managers.toolManager = new ToolManager();
    window.toolManager = this.managers.toolManager;
    console.log('✅ Tool Manager initialized');

    // Initialize menu bar component (depends on DOM elements)
    if (window.menuBarComponent) {
      await window.menuBarComponent.initialize();
      this.managers.menuManager = window.menuBarComponent.getManager();
      window.menuManager = this.managers.menuManager;
      console.log('✅ Menu Bar Component initialized');
    } else {
      // Fallback to old menu manager if component not available
      this.managers.menuManager = new MenuManager();
      window.menuManager = this.managers.menuManager;
      this.managers.menuManager.initialize();
      console.log('✅ Menu Manager (fallback) initialized');
    }

    // DDR CLEANUP: Message Manager removed - functionality handled by modern bubble component
    console.log('✅ Message Manager functionality handled by bubble component');

    // Initialize event manager (depends on DOM elements and other managers)
    this.managers.eventManager = new EventManager();
    window.eventManager = this.managers.eventManager;
    this.managers.eventManager.initialize();
    console.log('✅ Event Manager initialized');

    console.log('✅ Semua managers berhasil diinisialisasi');
  }

  /**
   * Step 4: Setup event listeners (handled by EventManager)
   */
  async setupEventListeners() {
    console.log('🎧 Event listeners sudah diatur oleh EventManager...');
    // Event listeners sudah diatur oleh EventManager di step 3 (initializeManagers)
    console.log('✅ Event listeners setup completed via EventManager');
  }

  /**
   * Step 5: Initialize API settings
   */
  async initializeAPISettings() {
    console.log('🔑 Menginisialisasi API settings...');

    // Ensure transparency
    if (this.managers.windowManager && this.managers.windowManager.ensureTransparency) {
      this.managers.windowManager.ensureTransparency();
      console.log('✅ Window transparency ensured');
    }

    // Initialize Gemini API settings
    if (window.initGeminiApiSettings) {
      window.initGeminiApiSettings();
      console.log('✅ Gemini API settings initialized');
    } else {
      console.warn('⚠️ initGeminiApiSettings function not available');
    }

    // ElevenLabs API settings removed - voice functionality disabled
    console.log('⚠️ ElevenLabs API settings skipped - voice functionality disabled');
  }

  /**
   * Step 6: Setup UI components
   */
  async setupUIComponents() {
    console.log('🎨 Mengatur UI components...');

    // Setup ripple effect
    if (window.setupRippleEffect) {
      window.setupRippleEffect();
      console.log('✅ Ripple effects setup completed');
    } else {
      console.warn('⚠️ setupRippleEffect function not available');
    }

    // Initialize input container component (depends on DOM elements)
    console.log('🔍 Checking InputContainerComponent availability:', !!window.InputContainerComponent);
    console.log('🔍 Available window properties:', Object.keys(window).filter(key => key.includes('Input')));

    if (window.InputContainerComponent) {
      console.log('📝 Initializing InputContainerComponent...');
      const initResult = await window.InputContainerComponent.initialize();
      console.log('📝 InputContainerComponent initialization result:', initResult);

      if (initResult) {
        // Set up backward compatibility
        window.inputContainer = window.InputContainerComponent.getManager();
        window.inputContainer.applyCompleteSetup = () => window.InputContainerComponent.applyCompleteSetup();
        window.inputContainer.setVoiceState = (conv, list) => window.InputContainerComponent.setVoiceState(conv, list);
        window.inputContainer.getElement = () => window.InputContainerComponent.getElement();
        window.inputContainer.isInitialized = window.InputContainerComponent.isInitialized();

        console.log('✅ Input Container Component initialized successfully');
      } else {
        console.error('❌ Input Container Component initialization failed');
      }
    } else {
      console.error('❌ InputContainerComponent not available');
      console.error('Available classes:', {
        InputContainerManager: typeof window.InputContainerManager,
        InputService: typeof window.InputService
      });
    }
  }

  /**
   * REMOVED: setupInputContainer() method - functionality moved to input-container.js
   * All input container setup is now handled by InputContainer class
   * This eliminates code duplication and establishes single source of truth
   */

  /**
   * Step 7: Finalize initialization
   */
  async finalizeInitialization() {
    console.log('🏁 Menyelesaikan inisialisasi...');

    // Add any final setup steps here
    console.log('✅ Finalization completed');
  }

  /**
   * Get initialization status
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get manager instance
   */
  getManager(name) {
    return this.managers[name] || null;
  }

  /**
   * Get all managers
   */
  getAllManagers() {
    return { ...this.managers };
  }
}

// === MOCK API MANAGER CLASS ===

// MockApiManager class moved to shared/services/mock-service.js

// All MockApiManager methods moved to shared/services/mock-service.js

// Export classes
window.InitializationManager = InitializationManager;
// MockApiManager exported from shared/services/mock-service.js

console.log('✅ Initialization Manager loaded (core) - MockApiManager extracted to shared/services/');
