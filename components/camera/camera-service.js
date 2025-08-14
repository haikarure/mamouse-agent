// Camera Service for Mamouse Agent
// Manages webcam access and image analysis
// ARCHITECTURAL MIGRATION: Moved from shared/services/ to components/camera/ for perfect component isolation

const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('../../core/config');
const { CAMERA_CONFIG } = require('./camera'); // UNIFIED: Use unified camera component (same folder)
// geminiService import removed - no longer needed for image analysis

/**
 * Backend Camera Service for Mamouse Agent
 * Handles camera operations in the main Electron process
 * @class CameraService
 */
class CameraService {
  constructor() {
    this.initialized = false;
    this.cameraWindow = null;

    // Image capture functionality removed for clean slate redesign
  }

  /**
   * Initialize camera service and set up IPC handlers
   */
  initialize() {
    if (this.initialized) {
      console.log('Camera Service already initialized');
      return true;
    }

    try {
      console.log('Initializing Camera Service...');
      
      // Set up IPC handlers
      this.setupIPCHandlers();
      
      this.initialized = true;
      console.log('✅ Camera Service successfully initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Camera Service:', error);
      return false;
    }
  }

  /**
   * Set up IPC handlers for camera operations
   */
  setupIPCHandlers() {
    // Handle camera activation
    ipcMain.handle('camera-activate', async () => {
      return await this.activateCamera();
    });

    // Handle camera deactivation
    ipcMain.handle('camera-deactivate', async () => {
      return await this.deactivateCamera();
    });

    // Image capture and analysis handlers removed for clean slate redesign
    // ipcMain.handle('camera-capture', async () => {
    //   return await this.captureImage();
    // });

    // ipcMain.handle('camera-analyze', async (event, imageData) => {
    //   return await this.analyzeImage(imageData);
    // });

    // Handle camera status check
    ipcMain.handle('camera-status', () => {
      return this.getStatus();
    });

    console.log('📝 IPC handlers for Camera Service set up successfully');
  }

  // ensureImagesDirectory method removed - no automatic folder creation
  // This addresses the issue where images folder was created unnecessarily during app startup

  /**
   * Activate camera by creating a hidden BrowserWindow
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async activateCamera() {
    try {
      if (this.cameraWindow) {
        console.log('Camera already active');
        return { success: true, message: 'Camera already active' };
      }

      // MASSIVE DDR CLEANUP: Use simple window config instead of complex CAMERA_CONFIG
      this.cameraWindow = new BrowserWindow({
        width: 640,
        height: 480,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false
        }
      });

      // Load camera interface from component directory (same folder)
      const cameraHtmlPath = path.join(__dirname, 'camera.html');

      if (!fs.existsSync(cameraHtmlPath)) {
        throw new Error(`Camera HTML file not found: ${cameraHtmlPath}`);
      }

      await this.cameraWindow.loadFile(cameraHtmlPath);

      // Handle window closed
      this.cameraWindow.on('closed', () => {
        this.cameraWindow = null;
        console.log('📷 Camera window closed');
      });

      console.log('📷 Camera activated successfully');
      return { success: true, message: 'Camera activated successfully' };

    } catch (error) {
      console.error('❌ Error activating camera:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deactivate camera by closing the window
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async deactivateCamera() {
    try {
      if (this.cameraWindow) {
        this.cameraWindow.close();
        this.cameraWindow = null;
      }

      console.log('📷 Camera deactivated');
      return { success: true, message: 'Camera deactivated successfully' };

    } catch (error) {
      console.error('❌ Error deactivating camera:', error);
      return { success: false, error: error.message };
    }
  }

  // captureImage method removed for clean slate redesign
  // Image capture functionality will be reimplemented as needed

  // saveImage method removed for clean slate redesign
  // Image storage functionality will be reimplemented as needed

  // analyzeImage method removed for clean slate redesign
  // Image analysis functionality will be reimplemented as needed

  /**
   * Get camera service status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      active: !!this.cameraWindow
      // Image-related status properties removed for clean slate redesign
    };
  }

  /**
   * Cleanup camera service
   */
  cleanup() {
    if (this.cameraWindow) {
      this.cameraWindow.close();
      this.cameraWindow = null;
    }
    
    // Remove IPC handlers
    ipcMain.removeAllListeners('camera-activate');
    ipcMain.removeAllListeners('camera-deactivate');
    ipcMain.removeAllListeners('camera-status');
    // Removed handlers for camera-capture and camera-analyze (no longer exist)
    
    this.initialized = false;
    console.log('🧹 Camera Service cleaned up');
  }
}

// Create singleton instance
const cameraService = new CameraService();

module.exports = cameraService;
