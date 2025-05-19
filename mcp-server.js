// MCP Server untuk Mamouse Agent
// Implementasi Model Context Protocol untuk kontrol komputer

const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { ipcMain, screen, desktopCapturer } = require('electron');

// Coba load nut.js, jika tidak tersedia, set nutjs ke null
let nutjs = null;
let nutjsAvailable = false;

try {
  // Periksa apakah package nut.js terinstal
  require.resolve('@nut-tree-fork/nut-js');

  // Jika tidak error, berarti package terinstal
  try {
    // Menggunakan @nut-tree-fork/nut-js sebagai alternatif RobotJS
    const { keyboard, mouse, Point } = require('@nut-tree-fork/nut-js');

    // Konfigurasi nut.js
    keyboard.config.autoDelayMs = 0;
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 1000;

    nutjs = { keyboard, mouse, Point };
    nutjsAvailable = true;

    console.log('Nut.js berhasil dimuat untuk kontrol keyboard dan mouse');
  } catch (initError) {
    console.warn('Nut.js terinstal tetapi gagal diinisialisasi:', initError.message);
    nutjsAvailable = false;
  }
} catch (error) {
  console.warn('Nut.js tidak tersedia. Fitur simulasi keyboard dan mouse tidak akan berfungsi.');
  console.warn('Untuk mengaktifkan fitur ini, instal nut.js: npm install @nut-tree-fork/nut-js');
  nutjsAvailable = false;
}

class MCPServer {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      debug: false,
      ...config
    };

    this.processes = new Map();
    this.initialized = false;
  }

  // Inisialisasi MCP Server
  initialize() {
    if (this.initialized) return true;

    console.log('Menginisialisasi MCP Server...');

    // Setup IPC handlers
    this.setupIPCHandlers();

    // Periksa status Nut.js
    if (nutjsAvailable && nutjs) {
      console.log('Nut.js tersedia untuk kontrol keyboard dan mouse');

      try {
        // Dapatkan ukuran layar
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        console.log(`Screen size: ${width}x${height}`);
      } catch (error) {
        console.error('Error saat mendapatkan ukuran layar:', error);
      }
    } else {
      console.warn('Nut.js tidak tersedia atau tidak diinisialisasi dengan benar');
      console.warn('Fitur kontrol keyboard dan mouse tidak akan berfungsi');
      console.warn('Untuk mengaktifkan fitur ini, instal nut.js: npm install @nut-tree-fork/nut-js');
    }

    this.initialized = true;
    console.log('MCP Server berhasil diinisialisasi');

    return true;
  }

  // Setup IPC handlers untuk komunikasi dengan renderer process
  setupIPCHandlers() {
    // Handler untuk menjalankan perintah sistem
    ipcMain.handle('mcp:run-command', async (event, command, args = [], options = {}) => {
      return this.runCommand(command, args, options);
    });

    // Handler untuk mengambil screenshot
    ipcMain.handle('mcp:take-screenshot', async () => {
      return this.takeScreenshot();
    });

    // Handler untuk simulasi keyboard
    ipcMain.handle('mcp:type-text', async (event, text) => {
      return this.typeText(text);
    });

    // Handler untuk simulasi mouse
    ipcMain.handle('mcp:mouse-click', async (event, x, y, button = 'left') => {
      return this.mouseClick(x, y, button);
    });

    // Handler untuk membuka aplikasi
    ipcMain.handle('mcp:open-app', async (event, appName) => {
      return this.openApplication(appName);
    });

    // Handler untuk mendapatkan daftar aplikasi yang berjalan
    ipcMain.handle('mcp:get-running-apps', async () => {
      return this.getRunningApplications();
    });

    console.log('IPC handlers untuk MCP berhasil diatur');
  }

  // Jalankan perintah sistem
  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (this.config.debug) {
          console.log(`Menjalankan perintah: ${command} ${args.join(' ')}`);
        }

        const process = spawn(command, args, options);
        const processId = Date.now().toString();
        this.processes.set(processId, process);

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
          stdout += data.toString();
          if (this.config.debug) {
            console.log(`[MCP] stdout: ${data}`);
          }
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
          if (this.config.debug) {
            console.error(`[MCP] stderr: ${data}`);
          }
        });

        process.on('close', (code) => {
          this.processes.delete(processId);
          if (code === 0) {
            resolve({ success: true, stdout, stderr, code });
          } else {
            resolve({ success: false, stdout, stderr, code });
          }
        });

        process.on('error', (error) => {
          this.processes.delete(processId);
          reject({ success: false, error: error.message });
        });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  }

  // Ambil screenshot
  async takeScreenshot() {
    return new Promise(async (resolve, reject) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
        const primaryDisplay = screen.getPrimaryDisplay();

        if (sources.length > 0) {
          const mainSource = sources.find(source => source.display_id === primaryDisplay.id.toString()) || sources[0];
          const screenshot = mainSource.thumbnail.toDataURL();
          resolve({ success: true, screenshot });
        } else {
          reject({ success: false, error: 'Tidak dapat mengambil screenshot' });
        }
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  }

  // Simulasi keyboard menggunakan Nut.js
  async typeText(text) {
    try {
      if (!nutjsAvailable || !nutjs) {
        return {
          success: false,
          error: 'Nut.js tidak tersedia atau tidak diinisialisasi dengan benar',
          fallback: 'Gunakan metode lain untuk input keyboard'
        };
      }

      // Nut.js menggunakan Promise-based API
      await nutjs.keyboard.type(text);
      return { success: true };
    } catch (error) {
      console.error('Error saat simulasi keyboard:', error);
      return {
        success: false,
        error: `Error saat simulasi keyboard: ${error.message}`,
        fallback: 'Gunakan metode lain untuk input keyboard'
      };
    }
  }

  // Simulasi mouse menggunakan Nut.js
  async mouseClick(x, y, button = 'left') {
    try {
      if (!nutjsAvailable || !nutjs) {
        return {
          success: false,
          error: 'Nut.js tidak tersedia atau tidak diinisialisasi dengan benar',
          fallback: 'Gunakan metode lain untuk kontrol mouse'
        };
      }

      // Validasi koordinat
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        return {
          success: false,
          error: `Koordinat tidak valid: x=${x}, y=${y}`,
          fallback: 'Pastikan koordinat adalah angka yang valid'
        };
      }

      // Buat Point untuk posisi mouse
      const point = new nutjs.Point(x, y);

      // Pindahkan mouse ke posisi
      await nutjs.mouse.move(point);

      // Klik mouse sesuai button
      if (button === 'left') {
        await nutjs.mouse.leftClick();
      } else if (button === 'right') {
        await nutjs.mouse.rightClick();
      } else if (button === 'middle') {
        await nutjs.mouse.click(2); // 2 = middle button di Nut.js
      } else {
        return {
          success: false,
          error: `Jenis tombol mouse tidak valid: ${button}`,
          fallback: 'Gunakan "left", "right", atau "middle"'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saat simulasi mouse:', error);
      return {
        success: false,
        error: `Error saat simulasi mouse: ${error.message}`,
        fallback: 'Gunakan metode lain untuk kontrol mouse'
      };
    }
  }

  // Buka aplikasi
  async openApplication(appName) {
    const platform = os.platform();

    try {
      let command;
      let args = [];

      if (platform === 'win32') {
        command = 'start';
        args = ['', appName];
        return this.runCommand('cmd', ['/c', ...command, ...args]);
      } else if (platform === 'darwin') {
        command = 'open';
        args = ['-a', appName];
        return this.runCommand(command, args);
      } else if (platform === 'linux') {
        return this.runCommand(appName, args);
      } else {
        return { success: false, error: `Platform ${platform} tidak didukung` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Dapatkan daftar aplikasi yang berjalan
  async getRunningApplications() {
    const platform = os.platform();

    try {
      let command;
      let args = [];

      if (platform === 'win32') {
        command = 'tasklist';
        args = ['/fo', 'csv', '/nh'];
      } else if (platform === 'darwin' || platform === 'linux') {
        command = 'ps';
        args = ['-e', '-o', 'comm='];
      } else {
        return { success: false, error: `Platform ${platform} tidak didukung` };
      }

      const result = await this.runCommand(command, args);
      return { success: true, applications: this.parseApplicationsList(result.stdout, platform) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Parse daftar aplikasi dari output command
  parseApplicationsList(output, platform) {
    if (platform === 'win32') {
      return output
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const parts = line.split('","');
          if (parts.length >= 1) {
            return parts[0].replace('"', '');
          }
          return null;
        })
        .filter(app => app !== null);
    } else {
      return output
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => path.basename(line.trim()));
    }
  }

  // Hentikan MCP Server
  shutdown() {
    console.log('Menghentikan MCP Server...');

    // Hentikan semua proses yang masih berjalan
    for (const [id, process] of this.processes.entries()) {
      try {
        process.kill();
        console.log(`Proses ${id} berhasil dihentikan`);
      } catch (error) {
        console.error(`Error saat menghentikan proses ${id}:`, error);
      }
    }

    this.processes.clear();
    this.initialized = false;

    console.log('MCP Server berhasil dihentikan');
  }
}

// Buat instance singleton
const mcpServer = new MCPServer();

module.exports = mcpServer;
