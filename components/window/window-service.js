// Window Service - Backend Service for Window Component
// Handles Electron main process window operations
// Migrated from core/app.js following SSOT principles

const { BrowserWindow, globalShortcut, screen, app } = require('electron');
const path = require('path');
const { logger } = require('../../shared/utils/file-logger');

// Helper functions for backward compatibility
const log = (message, level = 'info') => {
  switch (level) {
    case 'warn':
      logger.warn(message, 'WINDOW_SERVICE');
      break;
    case 'error':
      logger.error(message, 'WINDOW_SERVICE');
      break;
    default:
      logger.info(message, 'WINDOW_SERVICE');
  }
};

const logError = (error, prefix = '') => {
  const message = error instanceof Error ? error.message : error;
  logger.error(`${prefix}${message}`, 'WINDOW_SERVICE');
};

class WindowService {
  constructor(config) {
    this.config = config;
    this.mainWindow = null;
    this.isWindowVisible = true;
    this.initialized = false;
    
    console.log('🪟 Window Service initialized');
  }

  /**
   * Initialize window service
   */
  initialize() {
    if (this.initialized) {
      console.warn('Window Service already initialized');
      return;
    }

    this.setupAppEventHandlers();
    this.initialized = true;
    console.log('✅ Window Service initialized');
  }

  /**
   * Get window configuration - Moved from core/config.js
   * DDR CLEANUP: Window-specific configuration moved to window component
   */
  getWindowConfig() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    return {
      width: 900,
      height: screenHeight,
      minWidth: 600,
      minHeight: 500,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      thickFrame: false,
      roundedCorners: false,
      titleBarStyle: 'hidden',
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: false,
      x: Math.floor((screenWidth - 900) / 2),
      y: 0,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: require('path').join(__dirname, '../../core/preload.js'),
        // Enable media access for voice functionality
        webSecurity: true,
        allowRunningInsecureContent: false,
        // Enable microphone and camera access
        experimentalFeatures: true,
        // Additional permissions for voice functionality
        additionalArguments: [
          '--enable-features=VaapiVideoDecoder',
          '--disable-features=VizDisplayCompositor'
        ]
      },
      icon: require('path').join(__dirname, '../../shared/assets/Mamouse Icon.ico')
    };
  }

  /**
   * Create main application window
   */
  createWindow() {
    try {
      // DDR CLEANUP: Use internal getWindowConfig() instead of config.getWindowConfig()
      this.mainWindow = new BrowserWindow(this.getWindowConfig());

      // Load main HTML file
      this.mainWindow.loadFile(path.join(__dirname, '../../core/index.html'));

      // Configure window
      this.configureWindow();
      
      // Setup window event handlers
      this.setupWindowEventHandlers();
      
      log('✅ Main window created successfully');
      return this.mainWindow;
      
    } catch (error) {
      logError(error, 'Failed to create main window: ');
      throw error;
    }
  }

  /**
   * Configure window settings
   */
  configureWindow() {
    if (!this.mainWindow) return;
    
    // Hide menu bar
    this.mainWindow.setAutoHideMenuBar(true);
    this.mainWindow.setMenuBarVisibility(false);
    
    console.log('🪟 Window configured');
  }

  /**
   * Setup window event handlers
   */
  setupWindowEventHandlers() {
    if (!this.mainWindow) return;

    // Window ready event
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      this.isWindowVisible = true;

      // Send window-ready signal to renderer
      setTimeout(() => {
        this.mainWindow.webContents.send('window-ready');
        log('Sent window-ready signal to renderer process');
      }, this.config.timing.WINDOW_READY_DELAY);
    });

    // Window closed event
    this.mainWindow.on('closed', () => {
      this.isWindowVisible = false;
      this.mainWindow = null;
      log('🪟 Main window closed');
    });

    console.log('🪟 Window event handlers setup');
  }

  /**
   * Setup application event handlers
   */
  setupAppEventHandlers() {
    // App ready handler
    app.on('ready', () => {
      this.registerShortcuts();
    });

    // Before quit handler
    app.on('will-quit', () => {
      try {
        globalShortcut.unregisterAll();
        log('All shortcuts unregistered');
      } catch (error) {
        logError(error, 'Error unregistering shortcuts: ');
      }
    });

    // Window all closed handler
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Before quit handler
    app.on('before-quit', () => {
      log('🧹 Cleaning up before app quit...');
    });

    // Activate handler (macOS)
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });

    console.log('🪟 App event handlers setup');
  }

  /**
   * Register global shortcuts
   */
  registerShortcuts() {
    setTimeout(() => {
      // Unregister existing shortcuts
      globalShortcut.unregister('Alt+Space');

      const toggleHandler = () => {
        log('Toggle window shortcut pressed');
        this.toggleWindowVisibility();
      };

      // Register primary shortcut
      try {
        const registered = globalShortcut.register('Alt+Space', toggleHandler);
        if (registered) {
          log('✅ Primary shortcut Alt+Space registered');
        } else {
          log('⚠️ Primary shortcut Alt+Space failed to register');
          
          // Try fallback shortcut
          const fallbackRegistered = globalShortcut.register('Ctrl+Space', toggleHandler);
          if (fallbackRegistered) {
            log('✅ Fallback shortcut Ctrl+Space registered');
          } else {
            logError(null, 'Failed to register any shortcuts');
          }
        }
      } catch (error) {
        logError(error, 'Error registering shortcuts: ');
      }
    }, this.config.timing.SHORTCUT_REGISTRATION_DELAY);
  }

  /**
   * Toggle window visibility
   */
  toggleWindowVisibility() {
    if (!this.mainWindow) return;

    if (this.isWindowVisible) {
      this.mainWindow.hide();
      this.manageDock(false);
    } else {
      this.manageDock(true);
      this.mainWindow.show();
      this.mainWindow.focus();
    }
    
    this.isWindowVisible = !this.isWindowVisible;
    log(`Window ${this.isWindowVisible ? 'shown' : 'hidden'}`);
  }

  /**
   * Manage dock visibility (macOS)
   */
  manageDock(show) {
    if (process.platform === 'darwin' && app.dock) {
      if (show) {
        app.dock.show();
      } else {
        app.dock.hide();
      }
    }
  }

  /**
   * Get main window instance
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * Check if window is visible
   */
  isVisible() {
    return this.isWindowVisible;
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Cleanup window service
   */
  cleanup() {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
    
    globalShortcut.unregisterAll();
    this.initialized = false;
    console.log('🪟 Window Service cleaned up');
  }
}

module.exports = WindowService;
