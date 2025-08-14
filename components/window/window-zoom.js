// Window Zoom Functionality for Mamouse Agent
// EXTRACTED: From core/app.js for proper component architecture
// Handles zoom shortcuts and zoom level management

const { globalShortcut } = require('electron');
const config = require('../../core/config');
const { createContextLogger } = require('../../shared/utils/logging-utilities');

// Helper functions for logging
const { log, logError, logStatus } = createContextLogger('WINDOW_ZOOM');

/**
 * Window Zoom Manager
 * Handles zoom functionality for the main window
 * @class WindowZoom
 */
class WindowZoom {
  constructor() {
    this.mainWindow = null;
    this.initialized = false;
    this.configManager = null;
    this.saveTimeout = null; // For debounced saving
  }

  /**
   * Initialize zoom functionality
   * @param {BrowserWindow} mainWindow - Main window instance
   * @param {ConfigManager} configManager - Config manager instance (optional)
   * @returns {boolean} Success status
   */
  initialize(mainWindow, configManager = null) {
    try {
      this.mainWindow = mainWindow;
      this.configManager = configManager;
      this.setupZoomShortcuts();

      // Restore zoom level when DOM is ready (best practice for Electron)
      if (this.configManager && this.mainWindow) {
        this.mainWindow.webContents.once('dom-ready', () => {
          this.loadSavedZoomLevel();
        });
      }

      this.initialized = true;
      log('Window zoom functionality initialized successfully');
      return true;
    } catch (error) {
      logError(error, 'Error initializing window zoom: ');
      return false;
    }
  }

  /**
   * Register shortcut helper
   * EXTRACTED: From core/app.js registerShortcut() function
   * @param {string} accelerator - Keyboard shortcut
   * @param {string} description - Description for logging
   * @param {Function} callback - Callback function
   * @returns {boolean} Registration success
   */
  registerShortcut(accelerator, description, callback) {
    const ret = globalShortcut.register(accelerator, callback);
    logStatus(ret,
      `Shortcut ${accelerator} (${description}) berhasil didaftarkan`,
      `Registrasi shortcut ${accelerator} (${description}) gagal`
    );
    return ret;
  }

  /**
   * Setup zoom shortcuts
   * EXTRACTED: From core/app.js setupZoomShortcuts() function
   */
  setupZoomShortcuts() {
    if (!this.mainWindow) {
      logError('Main window not available for zoom shortcuts');
      return;
    }

    // Safe zoom helper - Modernized
    const safeZoom = (action, logMsg) => {
      log(logMsg);
      if (this.mainWindow && !this.mainWindow?.isDestroyed()) action();
    };

    // Zoom shortcuts - Using config constants
    this.registerShortcut('CommandOrControl+=', 'zoom in', () =>
      safeZoom(() => this.zoomIn(), 'Zoom in shortcut pressed')
    );

    this.registerShortcut('CommandOrControl+-', 'zoom out', () =>
      safeZoom(() => this.zoomOut(), 'Zoom out shortcut pressed')
    );

    this.registerShortcut('CommandOrControl+0', 'reset zoom', () =>
      safeZoom(() => this.resetZoom(), 'Reset zoom shortcut pressed')
    );

    log('Zoom shortcuts setup completed');
  }

  /**
   * Load saved zoom level from config and apply it
   * @returns {boolean} Success status
   */
  loadSavedZoomLevel() {
    try {
      if (!this.configManager) {
        log('No config manager available for loading zoom level');
        return false;
      }

      const savedZoomLevel = this.configManager.getZoomLevel();
      const currentZoom = this.getCurrentZoom();

      // Always restore saved zoom level if it's different from current
      if (savedZoomLevel && savedZoomLevel !== currentZoom) {
        const success = this.setZoom(savedZoomLevel, false); // Don't auto-save when restoring
        if (success) {
          log(`Restored saved zoom level: ${savedZoomLevel} (was ${currentZoom})`);
        }
        return success;
      }

      log(`Zoom level already matches saved value: ${savedZoomLevel}`);
      return true;
    } catch (error) {
      logError(error, 'Error loading saved zoom level: ');
      return false;
    }
  }

  /**
   * Save current zoom level to config (debounced)
   * @param {number} zoomLevel - Zoom level to save
   */
  saveCurrentZoomLevel(zoomLevel) {
    if (!this.configManager) return;

    if (this.saveTimeout) clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.configManager.saveZoomLevel(zoomLevel);
    }, 500);
  }

  /**
   * Get current zoom level
   * @returns {number} Current zoom factor
   */
  getCurrentZoom() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return config.zoom.DEFAULT;
    }
    return this.mainWindow.webContents.getZoomFactor();
  }

  /**
   * Set zoom level
   * @param {number} zoomFactor - Zoom factor to set
   * @param {boolean} autoSave - Whether to auto-save the zoom level (default: true)
   * @returns {boolean} Success status
   */
  setZoom(zoomFactor, autoSave = true) {
    try {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) {
        logError('Main window not available for zoom setting');
        return false;
      }

      // Clamp zoom factor to valid range
      const clampedZoom = Math.max(config.zoom.MIN, Math.min(2.0, zoomFactor));
      this.mainWindow.webContents.setZoomFactor(clampedZoom);
      log(`Zoom level set to: ${clampedZoom}`);

      // Auto-save zoom level
      if (autoSave) {
        this.saveCurrentZoomLevel(clampedZoom);
      }

      return true;
    } catch (error) {
      logError(error, 'Error setting zoom level: ');
      return false;
    }
  }

  /**
   * Reset zoom to default
   * @returns {boolean} Success status
   */
  resetZoom() {
    const currentZoom = this.getCurrentZoom();
    log(`Resetting zoom from ${currentZoom} to default level ${config.zoom.DEFAULT}`);
    return this.setZoom(config.zoom.DEFAULT, true); // Auto-save enabled
  }

  /**
   * Zoom in by step amount
   * @returns {boolean} Success status
   */
  zoomIn() {
    const currentZoom = this.getCurrentZoom();
    const newZoom = currentZoom + config.zoom.STEP;
    log(`Zooming in from ${currentZoom} to ${newZoom}`);
    return this.setZoom(newZoom, true); // Auto-save enabled
  }

  /**
   * Zoom out by step amount
   * @returns {boolean} Success status
   */
  zoomOut() {
    const currentZoom = this.getCurrentZoom();
    const newZoom = currentZoom - config.zoom.STEP;
    log(`Zooming out from ${currentZoom} to ${newZoom}`);
    return this.setZoom(newZoom, true); // Auto-save enabled
  }

  /**
   * Get zoom status
   * @returns {Object} Zoom status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      currentZoom: this.getCurrentZoom(),
      defaultZoom: config.zoom.DEFAULT,
      minZoom: config.zoom.MIN,
      zoomStep: config.zoom.STEP
    };
  }

  /**
   * Cleanup zoom functionality
   */
  cleanup() {
    try {
      // Clear any pending save timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }

      // Unregister shortcuts
      globalShortcut.unregister('CommandOrControl+=');
      globalShortcut.unregister('CommandOrControl+-');
      globalShortcut.unregister('CommandOrControl+0');

      this.mainWindow = null;
      this.configManager = null;
      this.initialized = false;
      log('Window zoom cleanup completed');
    } catch (error) {
      logError(error, 'Error during zoom cleanup: ');
    }
  }
}

module.exports = WindowZoom;
