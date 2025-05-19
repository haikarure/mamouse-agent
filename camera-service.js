// Camera Service untuk Mamouse Agent
// Mengelola akses ke webcam dan analisis gambar

const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const geminiService = require('./gemini-service');

class CameraService {
  constructor() {
    this.initialized = false;
    this.cameraWindow = null;
    this.cameraActive = false;
    this.lastImagePath = null;
    this.lastImageData = null;
    this.analysisInProgress = false;
  }

  // Inisialisasi Camera Service
  initialize() {
    if (this.initialized) return true;

    console.log('Menginisialisasi Camera Service...');

    // Setup IPC handlers
    this.setupIPCHandlers();

    this.initialized = true;
    console.log('Camera Service berhasil diinisialisasi');
    return true;
  }

  // Setup IPC handlers untuk komunikasi dengan renderer process
  setupIPCHandlers() {
    // Handler untuk mengaktifkan kamera
    ipcMain.handle('camera:activate', async () => {
      return this.activateCamera();
    });

    // Handler untuk menonaktifkan kamera
    ipcMain.handle('camera:deactivate', async () => {
      return this.deactivateCamera();
    });

    // Handler untuk mengambil gambar
    ipcMain.handle('camera:capture', async () => {
      return this.captureImage();
    });

    // Handler untuk menganalisis gambar
    ipcMain.handle('camera:analyze', async (event, imageData) => {
      return this.analyzeImage(imageData);
    });

    // Handler untuk mendapatkan status kamera
    ipcMain.handle('camera:status', async () => {
      return {
        active: this.cameraActive,
        initialized: this.initialized
      };
    });

    console.log('IPC handlers untuk Camera Service berhasil diatur');
  }

  // Aktifkan kamera
  async activateCamera() {
    try {
      if (this.cameraWindow) {
        console.log('Kamera sudah aktif');
        return { success: true, message: 'Kamera sudah aktif' };
      }

      // Buat jendela tersembunyi untuk kamera
      this.cameraWindow = new BrowserWindow({
        width: 640,
        height: 480,
        show: false, // Jendela tersembunyi
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false // Diperlukan untuk akses ke kamera
        }
      });

      // Muat file HTML untuk kamera
      await this.cameraWindow.loadFile(path.join(__dirname, 'camera.html'));

      // Event handler saat jendela ditutup
      this.cameraWindow.on('closed', () => {
        this.cameraWindow = null;
        this.cameraActive = false;
      });

      this.cameraActive = true;
      console.log('Kamera berhasil diaktifkan');
      return { success: true, message: 'Kamera berhasil diaktifkan' };
    } catch (error) {
      console.error('Error saat mengaktifkan kamera:', error);
      return { success: false, error: error.message };
    }
  }

  // Nonaktifkan kamera
  async deactivateCamera() {
    try {
      if (!this.cameraWindow) {
        console.log('Kamera sudah tidak aktif');
        this.cameraActive = false;
        return { success: true, message: 'Kamera sudah tidak aktif' };
      }

      // Jalankan script untuk menghentikan stream kamera di renderer process
      if (!this.cameraWindow.isDestroyed()) {
        try {
          await this.cameraWindow.webContents.executeJavaScript('stopCamera()');
          console.log('Stream kamera berhasil dihentikan');
        } catch (scriptError) {
          console.warn('Error saat menjalankan script stopCamera():', scriptError);
          // Lanjutkan meskipun ada error
        }
      }

      // Tutup jendela kamera
      try {
        this.cameraWindow.close();
      } catch (closeError) {
        console.warn('Error saat menutup jendela kamera:', closeError);
        // Lanjutkan meskipun ada error
      }

      this.cameraWindow = null;
      this.cameraActive = false;

      // Bersihkan data gambar terakhir jika diperlukan
      // Komentar: Jangan hapus lastImageData dan lastImagePath di sini
      // karena mungkin masih diperlukan untuk analisis berikutnya

      console.log('Kamera berhasil dinonaktifkan');
      return { success: true, message: 'Kamera berhasil dinonaktifkan' };
    } catch (error) {
      console.error('Error saat menonaktifkan kamera:', error);

      // Pastikan flag direset meskipun terjadi error
      this.cameraWindow = null;
      this.cameraActive = false;

      return {
        success: false,
        error: error.message,
        message: 'Terjadi error saat menonaktifkan kamera, tetapi status sudah direset'
      };
    }
  }

  // Ambil gambar dari kamera
  async captureImage() {
    try {
      if (!this.cameraWindow || !this.cameraActive) {
        console.error('Kamera tidak aktif');
        return { success: false, error: 'Kamera tidak aktif' };
      }

      // Minta renderer process untuk mengambil gambar
      const result = await this.cameraWindow.webContents.executeJavaScript('captureImage()');

      if (!result.success) {
        console.error('Error saat mengambil gambar:', result.error);
        return { success: false, error: result.error };
      }

      // Simpan data gambar
      this.lastImageData = result.imageData;

      // Simpan gambar ke file jika diperlukan
      if (config.camera && config.camera.saveImages) {
        const imagesDir = path.join(__dirname, 'images');

        // Buat direktori jika belum ada
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Buat nama file dengan timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const imagePath = path.join(imagesDir, `capture-${timestamp}.png`);

        // Simpan gambar
        const base64Data = result.imageData.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));

        this.lastImagePath = imagePath;
        console.log('Gambar berhasil disimpan ke:', imagePath);
      }

      console.log('Gambar berhasil diambil');
      return {
        success: true,
        imageData: result.imageData,
        imagePath: this.lastImagePath
      };
    } catch (error) {
      console.error('Error saat mengambil gambar:', error);
      return { success: false, error: error.message };
    }
  }

  // Analisis gambar menggunakan Gemini API
  async analyzeImage(imageData) {
    try {
      if (this.analysisInProgress) {
        console.log('Analisis gambar sedang berlangsung');
        return { success: false, error: 'Analisis gambar sedang berlangsung' };
      }

      this.analysisInProgress = true;
      console.log('Memulai analisis gambar...');

      // Gunakan data gambar yang diberikan atau gambar terakhir
      const dataToAnalyze = imageData || this.lastImageData;

      if (!dataToAnalyze) {
        this.analysisInProgress = false;
        console.error('Tidak ada gambar untuk dianalisis');
        return { success: false, error: 'Tidak ada gambar untuk dianalisis' };
      }

      // Analisis gambar menggunakan Gemini API
      const result = await geminiService.analyzeImage(dataToAnalyze);

      this.analysisInProgress = false;

      if (result.error) {
        console.error('Error saat menganalisis gambar:', result.message);
        return { success: false, error: result.message };
      }

      console.log('Gambar berhasil dianalisis');
      return {
        success: true,
        analysis: result.text,
        imageData: dataToAnalyze
      };
    } catch (error) {
      this.analysisInProgress = false;
      console.error('Error saat menganalisis gambar:', error);
      return { success: false, error: error.message };
    }
  }

  // Hentikan Camera Service
  shutdown() {
    console.log('Menghentikan Camera Service...');

    try {
      // Nonaktifkan kamera jika masih aktif
      if (this.cameraWindow) {
        // Jalankan script untuk menghentikan stream kamera di renderer process
        if (!this.cameraWindow.isDestroyed()) {
          try {
            this.cameraWindow.webContents.executeJavaScript('stopCamera()');
          } catch (scriptError) {
            console.warn('Error saat menjalankan script stopCamera():', scriptError);
          }
        }

        // Tutup jendela kamera
        try {
          this.cameraWindow.close();
        } catch (closeError) {
          console.warn('Error saat menutup jendela kamera:', closeError);
        }

        this.cameraWindow = null;
      }

      this.cameraActive = false;

      // Bersihkan data gambar terakhir untuk mencegah memory leak
      this.lastImageData = null;
      this.lastImagePath = null;
      this.analysisInProgress = false;

      this.initialized = false;
      console.log('Camera Service berhasil dihentikan');
    } catch (error) {
      console.error('Error saat menghentikan Camera Service:', error);
      // Pastikan semua flag direset meskipun terjadi error
      this.cameraWindow = null;
      this.cameraActive = false;
      this.lastImageData = null;
      this.lastImagePath = null;
      this.analysisInProgress = false;
      this.initialized = false;
    }
  }
}

// Buat instance singleton
const cameraService = new CameraService();

module.exports = cameraService;
