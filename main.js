const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const dotenv = require('dotenv');
const config = require('./config');
const geminiService = require('./gemini-service');
const mcpServer = require('./mcp-server');
const cameraService = require('./camera-service');
const widgetManager = require('./widget-manager');
const elevenLabsService = require('./elevenlabs-service');

// Load environment variables
dotenv.config();

// Path untuk file konfigurasi persisten
const userDataPath = app.getPath('userData');
const configFilePath = path.join(userDataPath, 'mamouse-config.json');

// Fungsi untuk menulis log ke file - versi yang menulis ke folder proyek
function logToFile(message, level = 'INFO') {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    // Tulis log ke file di folder proyek
    const projectLogPath = path.join(__dirname, 'debug-log.txt');
    fs.appendFileSync(projectLogPath, logMessage);

    // Tampilkan di konsol juga
    if (level === 'ERROR') {
      console.error(`[${level}] ${message}`);
    } else {
      console.log(`[${level}] ${message}`);
    }
  } catch (error) {
    console.error('Error saat menulis log:', error);
  }
}

// Fungsi untuk menyimpan konfigurasi ke file
function saveConfig(data) {
  try {
    console.log('Menyimpan konfigurasi...');

    // Pastikan direktori ada
    if (!fs.existsSync(userDataPath)) {
      try {
        fs.mkdirSync(userDataPath, { recursive: true });
        console.log('Direktori user data dibuat:', userDataPath);
      } catch (mkdirError) {
        console.error('Error saat membuat direktori user data:', mkdirError);
        return false;
      }
    }

    // Baca konfigurasi yang ada jika file sudah ada
    let existingConfig = {};
    if (fs.existsSync(configFilePath)) {
      try {
        const fileContent = fs.readFileSync(configFilePath, 'utf8');
        if (fileContent.trim() !== '') {
          existingConfig = JSON.parse(fileContent);
          console.log('Konfigurasi yang ada berhasil di-parse');
        }
      } catch (readError) {
        console.error('Error saat membaca file konfigurasi yang ada:', readError);
        // Lanjutkan dengan objek kosong jika terjadi error
      }
    } else {
      console.log('File konfigurasi belum ada, akan dibuat baru di:', configFilePath);
    }

    // Gabungkan konfigurasi yang ada dengan data baru secara mendalam (deep merge)
    const newConfig = deepMerge(existingConfig, data);

    // PENTING: Pastikan API key tidak kosong jika ada di data
    if (data.gemini && data.gemini.apiKey) {
      // Pastikan properti gemini ada di newConfig
      if (!newConfig.gemini) {
        newConfig.gemini = {};
        console.log('Membuat objek gemini dalam konfigurasi');
      }

      // Selalu gunakan API key dari data baru
      newConfig.gemini.apiKey = data.gemini.apiKey;
      console.log('API key diperbarui dalam konfigurasi');
    }

    // Tulis ke file
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
      console.log('Konfigurasi berhasil disimpan ke:', configFilePath);

      // Verifikasi bahwa file telah disimpan dengan benar
      if (fs.existsSync(configFilePath)) {
        const savedContent = fs.readFileSync(configFilePath, 'utf8');
        const savedConfig = JSON.parse(savedContent);

        // Periksa apakah API key tersimpan dengan benar
        if (data.gemini && data.gemini.apiKey) {
          const apiKeySaved = savedConfig.gemini && savedConfig.gemini.apiKey;
          console.log('Verifikasi API key:', apiKeySaved ? 'API key tersimpan' : 'API key tidak tersimpan');
        }
      }

      return true;
    } catch (writeError) {
      console.error('Error saat menulis file konfigurasi:', writeError);
      return false;
    }
  } catch (error) {
    console.error('Error umum saat menyimpan konfigurasi:', error);
    return false;
  }
}

// Fungsi untuk menggabungkan objek secara mendalam (deep merge)
function deepMerge(target, source) {
  // Buat salinan target untuk menghindari modifikasi langsung
  const output = Object.assign({}, target);

  // Jika source dan target adalah objek, gabungkan properti
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        // Jika properti ada di target dan keduanya adalah objek, lakukan deep merge
        if (key in target && isObject(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          // Jika tidak, salin properti dari source
          output[key] = source[key];
        }
      } else {
        // Jika bukan objek, salin properti dari source
        output[key] = source[key];
      }
    });
  }

  return output;
}

// Fungsi untuk memeriksa apakah nilai adalah objek
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Fungsi untuk memuat konfigurasi dari file
function loadConfig() {
  try {
    console.log('Memuat konfigurasi dari:', configFilePath);

    // Periksa apakah file konfigurasi ada
    if (fs.existsSync(configFilePath)) {
      try {
        // Baca isi file
        const fileContent = fs.readFileSync(configFilePath, 'utf8');

        // Periksa apakah file kosong
        if (fileContent.trim() === '') {
          console.log('File konfigurasi kosong, menggunakan objek kosong');
          return {};
        }

        // Parse isi file sebagai JSON
        try {
          const config = JSON.parse(fileContent);

          // Log informasi tentang API key jika ada
          if (config.gemini && config.gemini.apiKey) {
            console.log('API key ditemukan dalam konfigurasi');
          } else {
            console.log('API key tidak ditemukan dalam konfigurasi');
          }

          return config;
        } catch (parseError) {
          console.error('Error saat parsing file konfigurasi:', parseError);

          // Jika file tidak dapat di-parse, buat file baru
          try {
            fs.writeFileSync(configFilePath, '{}', 'utf8');
            console.log('File konfigurasi rusak, membuat file baru');
          } catch (writeError) {
            console.error('Gagal membuat file konfigurasi baru:', writeError);
          }

          return {};
        }
      } catch (readError) {
        console.error('Error saat membaca file konfigurasi:', readError);
        return {};
      }
    } else {
      console.log('File konfigurasi tidak ditemukan, membuat file baru');

      // Buat file konfigurasi baru
      try {
        // Pastikan direktori ada
        if (!fs.existsSync(userDataPath)) {
          fs.mkdirSync(userDataPath, { recursive: true });
        }

        // Buat file konfigurasi kosong
        fs.writeFileSync(configFilePath, '{}', 'utf8');
        console.log('File konfigurasi baru berhasil dibuat');
      } catch (createError) {
        console.error('Gagal membuat file konfigurasi baru:', createError);
      }

      return {};
    }
  } catch (error) {
    console.error('Error umum saat memuat konfigurasi:', error);
    return {};
  }
}

// Pastikan hanya satu instance aplikasi yang berjalan
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Aplikasi sudah berjalan. Keluar dari instance ini.');
  app.quit();
} else {
  // Tangani ketika instance kedua diluncurkan
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('Instance kedua terdeteksi, toggle window visibility');
    // Jika window ada, toggle visibility
    if (mainWindow) {
      toggleWindowVisibility();
    }
  });
}

// Simpan referensi global ke objek window
let mainWindow;
let wsServer;
let isWindowVisible = true; // Variabel untuk melacak status window
let floatingMode; // Instance dari FloatingMode

// Fungsi untuk toggle window (tampilkan/sembunyikan)
function toggleWindowVisibility() {
  if (!mainWindow) return;

  if (isWindowVisible) {
    // Jika window terlihat, tutup aplikasi
    app.quit();
  } else {
    // Untuk macOS
    if (process.platform === 'darwin') {
      app.dock.show();
    }

    mainWindow.show();
    mainWindow.focus();

    // Pastikan window berada di atas aplikasi lain
    mainWindow.setAlwaysOnTop(true);
    // Kembalikan ke pengaturan normal setelah window muncul
    setTimeout(() => {
      if (mainWindow) mainWindow.setAlwaysOnTop(true);
    }, 100);

    isWindowVisible = true;
  }
}

// Integrasi dengan Gemini API
const getAIResponse = async (message) => {
  try {
    // Cek apakah Gemini API sudah diinisialisasi
    if (!geminiService.isInitialized()) {
      // Coba inisialisasi dengan API key dari environment variable atau file konfigurasi
      let apiKey = process.env.GEMINI_API_KEY;

      // Jika tidak ada di environment variable, coba ambil dari file konfigurasi
      if (!apiKey) {
        const savedConfig = loadConfig();
        if (savedConfig.gemini && savedConfig.gemini.apiKey) {
          apiKey = savedConfig.gemini.apiKey;
          console.log('Menggunakan API key dari file konfigurasi persisten');

          // Simpan ke environment variable untuk digunakan selanjutnya
          process.env.GEMINI_API_KEY = apiKey;
        }
      }

      if (apiKey) {
        geminiService.setApiKey(apiKey);
      } else {
        console.warn('Gemini API key tidak ditemukan. Menggunakan respons simulasi.');
        return `Ini adalah respons simulasi untuk: "${message}" (Gemini API key tidak ditemukan)`;
      }
    }

    // Dapatkan respons dari Gemini API
    const response = await geminiService.getResponse(message);

    if (response.error) {
      console.error('Error dari Gemini API:', response.message);
      return `Maaf, terjadi kesalahan saat berkomunikasi dengan AI: ${response.message}`;
    }

    return response.text;
  } catch (error) {
    console.error('Error saat mendapatkan respons AI:', error);
    return `Maaf, terjadi kesalahan: ${error.message || 'Unknown error'}`;
  }
};

// Fungsi untuk mendapatkan respons streaming dari Gemini API
const getStreamingAIResponse = async (message, ws, messageId) => {
  try {
    logToFile(`[BUBBLE_DEBUG] Memproses permintaan streaming untuk pesan ID: ${messageId}`, 'DEBUG');
    logToFile(`[BUBBLE_DEBUG] Pesan: ${message}`, 'DEBUG');

    // Cek apakah Gemini API sudah diinisialisasi
    const isInitialized = geminiService.isInitialized();
    logToFile(`[BUBBLE_DEBUG] Status inisialisasi Gemini API: ${isInitialized ? 'Sudah diinisialisasi' : 'Belum diinisialisasi'}`, 'DEBUG');
    console.log(`Status inisialisasi Gemini API: ${isInitialized ? 'Sudah diinisialisasi' : 'Belum diinisialisasi'}`);

    if (!isInitialized) {
      console.log('Gemini API belum diinisialisasi, mencoba inisialisasi...');

      // Coba inisialisasi dengan API key dari environment variable atau file konfigurasi
      let apiKey = process.env.GEMINI_API_KEY;
      console.log(`API key dari environment variable: ${apiKey ? 'Ditemukan' : 'Tidak ditemukan'}`);

      // Jika tidak ada di environment variable, coba ambil dari file konfigurasi
      if (!apiKey) {
        logToFile('[BUBBLE_DEBUG] Mencoba mendapatkan API key dari file konfigurasi...', 'DEBUG');
        console.log('Mencoba mendapatkan API key dari file konfigurasi...');
        const savedConfig = loadConfig();
        logToFile(`[BUBBLE_DEBUG] Konfigurasi dimuat: ${savedConfig.gemini ? 'Ada konfigurasi Gemini' : 'Tidak ada konfigurasi Gemini'}`, 'DEBUG');
        logToFile(`[BUBBLE_DEBUG] Isi konfigurasi: ${JSON.stringify(savedConfig)}`, 'DEBUG');
        console.log('Konfigurasi dimuat:', savedConfig.gemini ? 'Ada konfigurasi Gemini' : 'Tidak ada konfigurasi Gemini');

        if (savedConfig.gemini && savedConfig.gemini.apiKey) {
          apiKey = savedConfig.gemini.apiKey;
          logToFile('[BUBBLE_DEBUG] Menggunakan API key dari file konfigurasi persisten', 'DEBUG');
          logToFile(`[BUBBLE_DEBUG] API key length: ${apiKey.length}`, 'DEBUG');
          console.log('Menggunakan API key dari file konfigurasi persisten');

          // Simpan ke environment variable untuk digunakan selanjutnya
          process.env.GEMINI_API_KEY = apiKey;
          logToFile('[BUBBLE_DEBUG] API key disimpan ke environment variable', 'DEBUG');
        } else {
          logToFile('[BUBBLE_DEBUG] API key tidak ditemukan di file konfigurasi', 'DEBUG');
          console.log('API key tidak ditemukan di file konfigurasi');
        }
      }

      if (apiKey) {
        console.log('Mencoba mengatur API key dan menginisialisasi Gemini API...');
        const setResult = geminiService.setApiKey(apiKey);
        console.log(`Hasil pengaturan API key: ${setResult ? 'Berhasil' : 'Gagal'}`);

        // Periksa lagi status inisialisasi
        const nowInitialized = geminiService.isInitialized();
        console.log(`Status inisialisasi setelah mengatur API key: ${nowInitialized ? 'Berhasil' : 'Gagal'}`);

        if (!nowInitialized) {
          console.warn('Gemini API masih belum diinisialisasi setelah mengatur API key. Menggunakan respons simulasi.');
          // Kirim respons simulasi sebagai streaming
          ws.send(JSON.stringify({
            type: 'streamChunk',
            messageId: messageId,
            chunk: `Ini adalah respons simulasi untuk: "${message}" (Gemini API gagal diinisialisasi)`,
            done: true
          }));
          return;
        }
      } else {
        console.warn('Gemini API key tidak ditemukan. Menggunakan respons simulasi.');
        // Kirim respons simulasi sebagai streaming
        ws.send(JSON.stringify({
          type: 'streamChunk',
          messageId: messageId,
          chunk: `Ini adalah respons simulasi untuk: "${message}" (Gemini API key tidak ditemukan)`,
          done: true
        }));
        return;
      }
    }

    console.log('Memulai streaming respons dari Gemini API...');

    // Dapatkan respons streaming dari Gemini API
    logToFile('[BUBBLE_DEBUG] Memanggil geminiService.getStreamingResponse...', 'DEBUG');
    console.log('Memanggil geminiService.getStreamingResponse...');
    await geminiService.getStreamingResponse(message, (chunk) => {
      try {
        const chunkData = JSON.stringify(chunk, (key, value) => {
          if (typeof value === 'function') return 'function';
          return value;
        });
        logToFile(`[BUBBLE_DEBUG] Callback chunk dipanggil dengan data: ${chunkData}`, 'DEBUG');
        console.log('Callback chunk dipanggil dengan data:', chunkData);

        if (!chunk) {
          console.error('Chunk kosong diterima dari Gemini API');
          // Kirim pesan error ke client
          ws.send(JSON.stringify({
            type: 'streamChunk',
            messageId: messageId,
            chunk: 'Tidak ada respons dari Gemini API (chunk kosong)',
            done: true
          }));
          return;
        }

        if (chunk.error) {
          console.error('Error dari Gemini API streaming:', chunk.message);
          ws.send(JSON.stringify({
            type: 'streamChunk',
            messageId: messageId,
            chunk: `Maaf, terjadi kesalahan saat berkomunikasi dengan AI: ${chunk.message}`,
            done: true
          }));
          return;
        }

        // Cek apakah ini adalah hasil dari tool call
        if (chunk.toolCall) {
          console.log('Mengirim hasil tool call ke client:', chunk.toolName);

          // Kirim hasil tool ke client
          try {
            const toolResultMessage = JSON.stringify({
              type: 'toolResult',
              messageId: messageId,
              toolName: chunk.toolName,
              toolParams: chunk.toolParams,
              toolResult: chunk.toolResult,
              done: false
            });
            console.log('Mengirim pesan tool result:', toolResultMessage.substring(0, 200) + (toolResultMessage.length > 200 ? '...' : ''));
            ws.send(toolResultMessage);
            console.log('Pesan tool result berhasil dikirim');
          } catch (sendError) {
            console.error('Error saat mengirim hasil tool ke client:', sendError);
          }
          return;
        }

        // Log chunk yang diterima
        console.log(`Chunk diterima: ${typeof chunk.text === 'string' ? chunk.text.substring(0, 50) + (chunk.text.length > 50 ? '...' : '') : 'Bukan string'}, done: ${chunk.done}`);

        // Pastikan chunk.text adalah string
        let chunkText = '';

        // Jika ini adalah chunk terakhir (done: true) dan chunk kosong, jangan tampilkan pesan error
        if (chunk.done === true && (!chunk.text || chunk.text === '' || (chunk.chunk !== undefined && chunk.chunk === ''))) {
          chunkText = ' '; // Gunakan spasi tunggal sebagai penanda selesai
          console.log('Chunk terakhir kosong, menggunakan spasi tunggal sebagai penanda selesai');
        }
        // Jika chunk.text adalah string
        else if (typeof chunk.text === 'string') {
          chunkText = chunk.text;
        }
        // Jika chunk.text tidak ada tapi chunk.chunk ada
        else if (chunk.text === undefined && chunk.chunk && typeof chunk.chunk === 'string') {
          chunkText = chunk.chunk;
          console.log('Menggunakan chunk.chunk sebagai fallback:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
        }
        // Jika chunk.text tidak ada tapi chunk.content ada
        else if (chunk.text === undefined && chunk.content && typeof chunk.content === 'string') {
          chunkText = chunk.content;
          console.log('Menggunakan chunk.content sebagai fallback:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
        }
        // Fallback ke string kosong jika tidak ada teks yang valid
        else {
          // Jika ini adalah chunk terakhir, gunakan spasi tunggal
          if (chunk.done === true) {
            chunkText = ' '; // Gunakan spasi tunggal sebagai penanda selesai
            console.log('Chunk terakhir tidak valid, menggunakan spasi tunggal sebagai penanda selesai');
          } else {
            chunkText = 'Tidak dapat mengekstrak teks dari respons Gemini API';
            console.warn('Tidak dapat mengekstrak teks dari chunk:', chunk);
          }
        }

        // Kirim chunk teks ke client
        try {
          const streamChunkMessage = JSON.stringify({
            type: 'streamChunk',
            messageId: messageId,
            chunk: chunkText,
            done: chunk.done
          });
          console.log('Mengirim pesan stream chunk:', streamChunkMessage.substring(0, 200) + (streamChunkMessage.length > 200 ? '...' : ''));
          ws.send(streamChunkMessage);
          console.log('Pesan stream chunk berhasil dikirim');
        } catch (sendError) {
          console.error('Error saat mengirim chunk ke client:', sendError);
        }

        if (chunk.done) {
          console.log(`Streaming selesai untuk pesan ID: ${messageId}`);
        }
      } catch (chunkError) {
        console.error('Error saat memproses chunk:', chunkError);
        try {
          ws.send(JSON.stringify({
            type: 'streamChunk',
            messageId: messageId,
            chunk: `Maaf, terjadi kesalahan saat memproses respons: ${chunkError.message || 'Unknown error'}`,
            done: true
          }));
        } catch (sendError) {
          console.error('Error saat mengirim pesan error ke client:', sendError);
        }
      }
    });

    console.log(`Permintaan streaming untuk pesan ID: ${messageId} selesai diproses`);
  } catch (error) {
    logToFile(`[BUBBLE_DEBUG] Error saat mendapatkan respons streaming AI: ${error.message}`, 'ERROR');
    logToFile(`[BUBBLE_DEBUG] Stack trace: ${error.stack}`, 'ERROR');
    console.error('Error saat mendapatkan respons streaming AI:', error);
    console.error('Detail error:', error.stack);

    try {
      const errorMessage = JSON.stringify({
        type: 'streamChunk',
        messageId: messageId,
        chunk: `Maaf, terjadi kesalahan: ${error.message || 'Unknown error'}`,
        done: true
      });
      logToFile(`[BUBBLE_DEBUG] Mengirim pesan error ke client: ${errorMessage}`, 'DEBUG');
      ws.send(errorMessage);
    } catch (sendError) {
      logToFile(`[BUBBLE_DEBUG] Error saat mengirim pesan error ke client: ${sendError.message}`, 'ERROR');
      console.error('Error saat mengirim pesan error ke client:', sendError);
    }
  }
};

// Simpan riwayat percakapan
const conversationHistory = [];

// Fungsi untuk membuat jendela baru
function createWindow() {
  // Buat jendela browser
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    frame: false, // Hilangkan frame default
    transparent: true, // Aktifkan transparansi
    backgroundColor: '#00000000', // Latar belakang transparan
    hasShadow: false, // Hilangkan shadow
    thickFrame: false, // Hilangkan frame tebal di Windows
    roundedCorners: false, // Hilangkan sudut bulat
    titleBarStyle: 'hidden', // Sembunyikan title bar
    resizable: false, // Nonaktifkan kemampuan resize untuk menghilangkan tanda panah resize
    alwaysOnTop: true, // Selalu di atas aplikasi lain
    skipTaskbar: false, // Tampilkan di taskbar agar aplikasi tetap berjalan di latar belakang
    webPreferences: {
      nodeIntegration: false, // Lebih aman dengan nodeIntegration dinonaktifkan
      contextIsolation: true, // Aktifkan context isolation untuk keamanan
      enableRemoteModule: false, // Nonaktifkan remote module untuk keamanan
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/Mamouse Icon.ico')
  });

  // Muat file HTML utama
  mainWindow.loadFile('index.html');

  // Pastikan tidak ada frame atau border
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);

  // Nonaktifkan kemampuan resize
  mainWindow.setResizable(false);

  // Tambahkan event listener untuk memastikan transparansi dan interaksi mouse yang benar
  mainWindow.once('ready-to-show', () => {
    // Pastikan latar belakang benar-benar transparan
    mainWindow.setBackgroundColor('#00000000');

    // Tampilkan jendela terlebih dahulu
    mainWindow.show();

    // PENTING: MULAI DENGAN IGNORE MOUSE EVENTS DINONAKTIFKAN
    // Ini memastikan semua elemen UI dapat diklik saat aplikasi pertama kali dibuka
    try {
      mainWindow.setIgnoreMouseEvents(false);
      console.log('Memulai dengan ignore mouse events dinonaktifkan untuk memastikan interaktivitas awal');
    } catch (error) {
      console.error('Error saat mengatur ignore mouse events awal:', error);
    }

    // Biarkan aplikasi dalam keadaan interaktif selama beberapa saat
    // Ini memberikan waktu untuk pengguna berinteraksi dengan elemen UI

    // Kirim pesan ke renderer process bahwa window sudah siap
    setTimeout(() => {
      mainWindow.webContents.send('window-ready');
      console.log('Mengirim sinyal window-ready ke renderer process');

      // Setelah window siap, aktifkan ignore mouse events dengan forward
      // Ini memungkinkan click-through pada area yang tidak interaktif
      try {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        console.log('Mengaktifkan click-through dengan forward: true');

        // Tambahkan interval untuk memastikan click-through tetap aktif
        setInterval(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('check-click-through');
          }
        }, 5000);
      } catch (error) {
        console.error('Error saat mengaktifkan click-through:', error);
      }
    }, 1000);
  });

  // Buka DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null;

    // Tutup server WebSocket jika ada
    if (wsServer) {
      wsServer.close();
    }

    // Tutup MCP server jika diaktifkan
    if (config.mcp && config.mcp.enabled) {
      console.log('Menutup MCP Server...');
      mcpServer.shutdown();
    }

    // Tutup Camera Service jika diaktifkan
    if (config.camera && config.camera.enabled) {
      console.log('Menutup Camera Service...');
      cameraService.shutdown();
    }

    // Tutup Widget Manager jika diaktifkan
    if (config.widgets && config.widgets.enabled) {
      console.log('Menutup Widget Manager...');
      widgetManager.shutdown();
    }
  });

  // Setup WebSocket server
  setupWebSocketServer();

  // Inisialisasi MCP server jika diaktifkan di konfigurasi
  if (config.mcp && config.mcp.enabled) {
    console.log('Menginisialisasi MCP Server...');
    mcpServer.initialize();
  }

  // Inisialisasi Camera Service jika diaktifkan di konfigurasi
  if (config.camera && config.camera.enabled) {
    console.log('Menginisialisasi Camera Service...');
    cameraService.initialize();
  }

  // Inisialisasi Widget Manager jika diaktifkan di konfigurasi
  if (config.widgets && config.widgets.enabled) {
    console.log('Menginisialisasi Widget Manager...');
    widgetManager.initialize();
  }
}

// Fungsi untuk setup WebSocket server
function setupWebSocketServer() {
  // Gunakan port tetap untuk menghindari konflik
  const fixedPort = 12345;
  createWebSocketServerWithFallback(fixedPort, 10); // Coba maksimal 10 port berbeda jika port tetap gagal
}

// Fungsi untuk membuat WebSocket server dengan fallback
function createWebSocketServerWithFallback(startPort, maxAttempts) {
  let currentPort = startPort;
  let attempts = 0;
  let isCreatingServer = false;

  // Fungsi untuk mencoba port berikutnya
  function tryNextPort() {
    attempts++;
    if (attempts > maxAttempts) {
      console.error(`Gagal membuat WebSocket server setelah ${maxAttempts} percobaan`);
      return;
    }

    // Gunakan port acak untuk percobaan berikutnya
    currentPort = Math.floor(Math.random() * 55000) + 10000;
    console.log(`Mencoba port alternatif: ${currentPort}`);

    // Tunggu sebentar sebelum mencoba port baru untuk menghindari race condition
    setTimeout(() => {
      attemptCreateServer(currentPort);
    }, 500);
  }

  // Fungsi untuk menutup server yang ada dengan aman
  function closeExistingServer() {
    return new Promise((resolve) => {
      if (!wsServer) {
        resolve();
        return;
      }

      try {
        // Periksa apakah server masih berjalan
        if (wsServer.clients && wsServer.clients.size > 0) {
          console.log(`Menutup ${wsServer.clients.size} koneksi klien yang aktif...`);

          // Tutup semua koneksi klien
          wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.close(1001, 'Server shutting down');
            }
          });
        }

        // Tambahkan event listener untuk mengetahui kapan server benar-benar ditutup
        wsServer.once('close', () => {
          console.log('WebSocket server berhasil ditutup');
          wsServer = null;
          resolve();
        });

        // Tutup server
        wsServer.close((err) => {
          if (err) {
            console.warn('Error saat menutup server:', err);
            wsServer = null;
          }
          resolve();
        });
      } catch (e) {
        console.warn('Error saat menutup server yang ada:', e);
        wsServer = null;
        resolve();
      }
    });
  }

  // Fungsi untuk mencoba membuat server pada port tertentu
  async function attemptCreateServer(port) {
    // Hindari percobaan bersamaan
    if (isCreatingServer) {
      console.log('Sudah ada percobaan membuat server yang sedang berlangsung, menunggu...');
      return;
    }

    isCreatingServer = true;

    try {
      // Tutup server yang mungkin sudah ada
      await closeExistingServer();

      // Buat WebSocket server baru
      console.log(`Mencoba membuat WebSocket server di port ${port}...`);
      wsServer = new WebSocket.Server({ port: port });

      // Simpan port yang berhasil digunakan ke global
      global.wsPort = port;
      console.log(`WebSocket server berhasil berjalan di port ${port}`);

      // Setup event handlers untuk WebSocket server
      setupWebSocketEventHandlers();

      // Tambahkan error handler untuk server
      wsServer.on('error', (err) => {
        console.error('WebSocket server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} sudah digunakan, mencoba port lain...`);
          isCreatingServer = false;
          tryNextPort();
        }
      });

      isCreatingServer = false;
    } catch (error) {
      console.log(`Error pada port ${port}: ${error.message}`);

      // Jika port sudah digunakan, coba port lain
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} sudah digunakan, mencoba port lain...`);
        isCreatingServer = false;
        tryNextPort();
      } else {
        console.error('Error tidak terduga:', error);
        // Coba port lain juga untuk error tidak terduga
        isCreatingServer = false;
        tryNextPort();
      }
    }
  }

  // Mulai percobaan pertama
  attemptCreateServer(currentPort);
}

// Fungsi untuk setup event handlers WebSocket
function setupWebSocketEventHandlers() {
  if (!wsServer) return;

  // Handle koneksi WebSocket
  wsServer.on('connection', (ws) => {
    const clientId = uuidv4();

    console.log(`Client terhubung: ${clientId}`);

    // Reset riwayat percakapan saat koneksi baru
    conversationHistory.length = 0;

    // Tidak perlu mengirim riwayat karena sudah direset

    // Tidak mengirim pesan selamat datang otomatis
    // Biarkan UI kosong sampai pengguna mengirim pesan pertama

    // Handle pesan dari klien
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        console.log(`Pesan diterima:`, message);

        switch (message.type) {
          case 'message':
            // Simpan pesan pengguna
            const userMessage = {
              id: uuidv4(),
              text: message.content,
              isUser: true,
              timestamp: Date.now()
            };

            conversationHistory.push(userMessage);

            // Kirim pesan pengguna ke klien
            ws.send(JSON.stringify({
              type: 'message',
              message: userMessage
            }));

            // Buat ID untuk pesan AI
            const aiMessageId = uuidv4();

            // Kirim pesan AI kosong dengan ID untuk inisialisasi
            const aiMessage = {
              id: aiMessageId,
              text: '', // Teks kosong yang akan diisi oleh streaming
              isUser: false,
              timestamp: Date.now(),
              streaming: true // Tandai bahwa pesan ini akan diisi melalui streaming
            };

            // Tambahkan ke riwayat percakapan
            conversationHistory.push(aiMessage);

            // Kirim pesan AI kosong ke klien untuk inisialisasi UI
            ws.send(JSON.stringify({
              type: 'message',
              message: aiMessage
            }));

            // Dapatkan respons streaming dari model AI
            getStreamingAIResponse(message.content, ws, aiMessageId);
            break;

          case 'startVoiceInput':
            // Kirim status voice input ke klien
            ws.send(JSON.stringify({
              type: 'voiceStatus',
              isListening: true
            }));
            break;

          case 'stopVoiceInput':
            // Kirim status voice input ke klien
            ws.send(JSON.stringify({
              type: 'voiceStatus',
              isListening: false
            }));
            break;

          case 'voiceResult':
            // Simpan pesan pengguna dari input suara
            const voiceMessage = {
              id: uuidv4(),
              text: message.transcript,
              isUser: true,
              timestamp: Date.now()
            };

            conversationHistory.push(voiceMessage);

            // Kirim pesan pengguna ke klien
            ws.send(JSON.stringify({
              type: 'message',
              message: voiceMessage
            }));

            // Buat ID untuk pesan AI
            const voiceAiMessageId = uuidv4();

            // Kirim pesan AI kosong dengan ID untuk inisialisasi
            const voiceAiMessage = {
              id: voiceAiMessageId,
              text: '', // Teks kosong yang akan diisi oleh streaming
              isUser: false,
              timestamp: Date.now(),
              streaming: true // Tandai bahwa pesan ini akan diisi melalui streaming
            };

            // Tambahkan ke riwayat percakapan
            conversationHistory.push(voiceAiMessage);

            // Kirim pesan AI kosong ke klien untuk inisialisasi UI
            ws.send(JSON.stringify({
              type: 'message',
              message: voiceAiMessage
            }));

            // Dapatkan respons streaming dari model AI
            getStreamingAIResponse(message.transcript, ws, voiceAiMessageId);
            break;

          default:
            console.log(`Tipe pesan tidak dikenal: ${message.type}`);
        }
      } catch (error) {
        console.error('Error memproses pesan:', error);
      }
    });

    // Handle penutupan koneksi
    ws.on('close', () => {
      console.log(`Client terputus: ${clientId}`);
    });
  });
}

// Handle IPC messages dari renderer process
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Handler untuk mendapatkan port WebSocket
ipcMain.on('get-ws-port', (event) => {
  // Kirim port yang digunakan ke renderer process
  event.returnValue = global.wsPort || 12345;
});

// Handler untuk mengaktifkan/menonaktifkan event mouse
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  if (mainWindow) {
    try {
      console.log(`Setting ignore mouse events: ${ignore}, options:`, options);

      // Jika options tidak didefinisikan dan ignore adalah true, tambahkan forward: true
      if (ignore === true && (!options || Object.keys(options).length === 0)) {
        options = { forward: true };
        console.log('Menambahkan forward: true ke options');
      }

      // Pastikan forward: true selalu digunakan saat ignore adalah true
      // Ini memastikan event mouse tetap diteruskan ke renderer process
      if (ignore === true && (!options || !options.forward)) {
        options = options || {};
        options.forward = true;
        console.log('Memastikan forward: true digunakan untuk click-through');
      }

      mainWindow.setIgnoreMouseEvents(ignore, options);
    } catch (error) {
      console.error('Error saat mengatur ignore mouse events:', error);

      // Fallback jika options tidak didukung
      if (error.message && error.message.includes('options')) {
        try {
          console.log(`Fallback: Setting ignore mouse events without options: ${ignore}`);
          mainWindow.setIgnoreMouseEvents(ignore);
        } catch (fallbackError) {
          console.error('Error saat mengatur ignore mouse events fallback:', fallbackError);
        }
      }
    }
  }
});

// Handler untuk mengatur API key Gemini
ipcMain.handle('set-gemini-api-key', async (event, apiKey) => {
  try {
    console.log('Menerima permintaan untuk mengatur API key Gemini');
    console.log('User data path:', userDataPath);
    console.log('Config file path:', configFilePath);

    // Validasi API key terlebih dahulu
    const validationResult = await geminiService.validateApiKey(apiKey);

    if (!validationResult.valid) {
      console.log('API key tidak valid:', validationResult.message);
      return {
        success: false,
        message: validationResult.message || 'API key tidak valid'
      };
    }

    // Jika valid, atur API key
    console.log('API key valid, mengatur API key...');
    const result = geminiService.setApiKey(apiKey);

    // Simpan API key ke environment variable
    process.env.GEMINI_API_KEY = apiKey;
    console.log('API key disimpan ke environment variable');

    // PENTING: Simpan API key ke file konfigurasi persisten
    const configData = {
      gemini: {
        apiKey: apiKey
      }
    };

    // Pastikan direktori konfigurasi ada
    if (!fs.existsSync(userDataPath)) {
      try {
        fs.mkdirSync(userDataPath, { recursive: true });
        console.log('Direktori user data dibuat:', userDataPath);
      } catch (mkdirError) {
        console.error('Error saat membuat direktori user data:', mkdirError);
      }
    }

    // Cek izin akses direktori
    try {
      const testFile = path.join(userDataPath, 'test-write-access.tmp');
      fs.writeFileSync(testFile, 'test', 'utf8');
      fs.unlinkSync(testFile);
      console.log('Direktori user data memiliki izin tulis');
    } catch (accessError) {
      console.error('Direktori user data tidak memiliki izin tulis:', accessError);
    }

    // Simpan konfigurasi
    console.log('Menyimpan konfigurasi dengan data:', JSON.stringify(configData));
    const configSaved = saveConfig(configData);
    console.log('Hasil penyimpanan konfigurasi:', configSaved ? 'Berhasil' : 'Gagal');

    if (!configSaved) {
      console.warn('Gagal menyimpan API key ke file konfigurasi persisten, mencoba metode fallback');

      // Coba simpan langsung ke file sebagai fallback
      try {
        // Baca konfigurasi yang ada jika file sudah ada
        let existingConfig = {};
        if (fs.existsSync(configFilePath)) {
          try {
            const fileContent = fs.readFileSync(configFilePath, 'utf8');
            if (fileContent.trim() !== '') {
              existingConfig = JSON.parse(fileContent);
              console.log('Konfigurasi yang ada berhasil dibaca');
            }
          } catch (readError) {
            console.error('Error saat membaca file konfigurasi yang ada:', readError);
            // Lanjutkan dengan objek kosong jika terjadi error
          }
        } else {
          console.log('File konfigurasi tidak ada, akan dibuat baru');
        }

        // Pastikan properti gemini ada
        if (!existingConfig.gemini) {
          existingConfig.gemini = {};
        }

        // Atur API key
        existingConfig.gemini.apiKey = apiKey;

        // Tulis ke file
        fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
        console.log('API key berhasil disimpan dengan metode fallback');

        // Verifikasi file telah ditulis
        if (fs.existsSync(configFilePath)) {
          const fileStats = fs.statSync(configFilePath);
          console.log('File konfigurasi berhasil dibuat, ukuran:', fileStats.size, 'bytes');
        }
      } catch (fallbackError) {
        console.error('Gagal menyimpan API key dengan metode fallback:', fallbackError);
      }
    }

    // Verifikasi bahwa konfigurasi telah disimpan dengan benar
    try {
      console.log('Memverifikasi penyimpanan API key...');
      const savedConfig = loadConfig();
      const apiKeySaved = savedConfig && savedConfig.gemini && savedConfig.gemini.apiKey;
      console.log('Verifikasi API key:', apiKeySaved ? 'Tersimpan' : 'Tidak tersimpan');

      if (apiKeySaved) {
        console.log('API key tersimpan dengan panjang:', apiKeySaved.length);
      } else {
        // Jika masih gagal, coba tulis ulang file konfigurasi
        console.log('API key tidak tersimpan, mencoba tulis ulang file konfigurasi');
        const simpleConfig = { gemini: { apiKey: apiKey } };
        fs.writeFileSync(configFilePath, JSON.stringify(simpleConfig, null, 2), 'utf8');

        // Verifikasi lagi
        const recheck = loadConfig();
        const recheckSaved = recheck && recheck.gemini && recheck.gemini.apiKey;
        console.log('Verifikasi ulang API key:', recheckSaved ? 'Tersimpan' : 'Masih gagal');
      }
    } catch (verifyError) {
      console.error('Error saat memverifikasi konfigurasi:', verifyError);
    }

    return {
      success: result,
      message: result ? 'API key berhasil diatur dan disimpan' : 'Gagal mengatur API key'
    };
  } catch (error) {
    console.error('Error saat mengatur API key:', error);
    return {
      success: false,
      message: `Error: ${error.message || 'Terjadi kesalahan saat mengatur API key'}`
    };
  }
});

// Handler untuk mengatur model Gemini
ipcMain.handle('set-gemini-model', async (event, model) => {
  try {
    console.log('Menerima permintaan untuk mengatur model Gemini:', model);

    // Atur model di geminiService
    const result = geminiService.setModel(model);

    // Simpan model ke environment variable
    process.env.GEMINI_MODEL = model;

    // Simpan model ke file konfigurasi persisten
    const configData = {
      gemini: {
        model: model
      }
    };

    // Pastikan direktori konfigurasi ada
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    // Simpan konfigurasi
    const configSaved = saveConfig(configData);

    if (!configSaved) {
      console.warn('Gagal menyimpan model ke file konfigurasi persisten');

      // Coba simpan langsung ke file sebagai fallback
      try {
        // Baca konfigurasi yang ada jika file sudah ada
        let existingConfig = {};
        if (fs.existsSync(configFilePath)) {
          try {
            const fileContent = fs.readFileSync(configFilePath, 'utf8');
            if (fileContent.trim() !== '') {
              existingConfig = JSON.parse(fileContent);
            }
          } catch (error) {
            // Lanjutkan dengan objek kosong jika terjadi error
          }
        }

        // Pastikan properti gemini ada
        if (!existingConfig.gemini) {
          existingConfig.gemini = {};
        }

        // Atur model
        existingConfig.gemini.model = model;

        // Tulis ke file
        fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
        console.log('Model berhasil disimpan dengan metode fallback');
      } catch (fallbackError) {
        console.error('Gagal menyimpan model dengan metode fallback:', fallbackError);
      }
    }

    return {
      success: result,
      message: result ? 'Model berhasil diatur dan disimpan' : 'Gagal mengatur model'
    };
  } catch (error) {
    console.error('Error saat mengatur model:', error);
    return {
      success: false,
      message: `Error: ${error.message || 'Terjadi kesalahan saat mengatur model'}`
    };
  }
});

// Handler untuk mendapatkan status Gemini API
ipcMain.handle('get-gemini-status', async (event) => {
  try {
    console.log('Menerima permintaan untuk mendapatkan status Gemini API');

    // Cek apakah Gemini API sudah diinisialisasi
    const isInitialized = geminiService.isInitialized();
    console.log(`Status inisialisasi Gemini API: ${isInitialized ? 'Sudah diinisialisasi' : 'Belum diinisialisasi'}`);

    // Cek apakah API key tersedia
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    console.log(`API key tersedia: ${hasApiKey ? 'Ya' : 'Tidak'}`);

    // Cek apakah model tersedia
    const model = geminiService.model || 'Tidak diatur';
    console.log(`Model Gemini: ${model}`);

    // Cek apakah tools diaktifkan
    const toolsEnabled = geminiService.toolsEnabled || false;
    console.log(`Tools diaktifkan: ${toolsEnabled ? 'Ya' : 'Tidak'}`);

    // Coba validasi API key jika tersedia tetapi belum diinisialisasi
    let validationMessage = null;
    if (hasApiKey && !isInitialized) {
      console.log('API key tersedia tetapi belum diinisialisasi, mencoba validasi...');
      try {
        const validationResult = await geminiService.validateApiKey(process.env.GEMINI_API_KEY);
        validationMessage = validationResult.message;
        console.log(`Hasil validasi: ${validationResult.valid ? 'Valid' : 'Tidak valid'}, Pesan: ${validationMessage}`);
      } catch (validationError) {
        console.error('Error saat validasi API key:', validationError);
        validationMessage = `Error validasi: ${validationError.message}`;
      }
    }

    return {
      initialized: isInitialized,
      apiKey: hasApiKey ? '********' : null,
      model: model,
      toolsEnabled: toolsEnabled,
      validationMessage: validationMessage,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error saat mendapatkan status Gemini API:', error);
    console.error('Detail error:', error.stack);

    return {
      initialized: false,
      apiKey: null,
      model: null,
      toolsEnabled: false,
      error: error.message || 'Terjadi kesalahan saat mendapatkan status Gemini API',
      timestamp: Date.now()
    };
  }
});

// Handler untuk mengaktifkan/menonaktifkan tools
ipcMain.handle('set-tools-enabled', async (event, enabled) => {
  try {
    const result = geminiService.setToolsEnabled(enabled);
    return {
      success: result,
      toolsEnabled: geminiService.toolsEnabled
    };
  } catch (error) {
    console.error('Error saat mengatur status tools:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur status tools'
    };
  }
});

// Handler untuk ElevenLabs API

// Handler untuk mengatur API key ElevenLabs
ipcMain.handle('set-elevenlabs-api-key', async (event, apiKey) => {
  try {
    // Validasi API key terlebih dahulu
    const validationResult = await elevenLabsService.validateApiKey(apiKey);

    if (!validationResult.valid) {
      return {
        success: false,
        message: validationResult.message || 'API key tidak valid'
      };
    }

    // Jika valid, atur API key
    const result = elevenLabsService.setApiKey(apiKey);

    // Simpan API key ke environment variable
    process.env.ELEVENLABS_API_KEY = apiKey;

    // Simpan API key ke file konfigurasi persisten
    const configSaved = saveConfig({
      elevenlabs: {
        apiKey: apiKey
      }
    });

    if (!configSaved) {
      console.warn('Gagal menyimpan API key ElevenLabs ke file konfigurasi persisten');
    }

    return {
      success: result,
      message: 'API key ElevenLabs berhasil diatur'
    };
  } catch (error) {
    console.error('Error saat mengatur API key ElevenLabs:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur API key ElevenLabs'
    };
  }
});

// Handler untuk mendapatkan status ElevenLabs API
ipcMain.handle('get-elevenlabs-status', async (event) => {
  return {
    initialized: elevenLabsService.isInitialized(),
    apiKey: process.env.ELEVENLABS_API_KEY ? '********' : null,
    voiceId: elevenLabsService.voiceId,
    model: elevenLabsService.model
  };
});

// Handler untuk mendapatkan daftar suara ElevenLabs
ipcMain.handle('get-elevenlabs-voices', async (event) => {
  try {
    const result = await elevenLabsService.getVoices();
    return result;
  } catch (error) {
    console.error('Error saat mendapatkan daftar suara ElevenLabs:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mendapatkan daftar suara'
    };
  }
});

// Handler untuk mengatur voice ID ElevenLabs
ipcMain.handle('set-elevenlabs-voice', async (event, voiceId) => {
  try {
    const result = elevenLabsService.setVoiceId(voiceId);

    // Simpan voice ID ke file konfigurasi persisten
    const configSaved = saveConfig({
      elevenlabs: {
        defaultVoiceId: voiceId
      }
    });

    if (!configSaved) {
      console.warn('Gagal menyimpan voice ID ElevenLabs ke file konfigurasi persisten');
    }

    return {
      success: result,
      message: 'Voice ID ElevenLabs berhasil diatur'
    };
  } catch (error) {
    console.error('Error saat mengatur voice ID ElevenLabs:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur voice ID ElevenLabs'
    };
  }
});

// Handler untuk menghasilkan speech dari teks
ipcMain.handle('generate-speech', async (event, text, options = {}) => {
  try {
    const result = await elevenLabsService.generateSpeech(text, options);
    return result;
  } catch (error) {
    console.error('Error saat menghasilkan speech:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menghasilkan speech'
    };
  }
});

// Handler untuk menghasilkan speech dari teks secara streaming
ipcMain.handle('generate-speech-stream', async (event, text, options = {}) => {
  try {
    // Buat ID unik untuk stream ini
    const streamId = uuidv4();

    // Buat fungsi callback untuk mengirim chunk ke renderer process
    const onChunk = (chunkData) => {
      // Jika window sudah ditutup, hentikan streaming
      if (event.sender.isDestroyed()) return;

      // Kirim chunk ke renderer process
      event.sender.send('speech-stream-chunk', {
        streamId,
        ...chunkData
      });
    };

    // Mulai streaming
    const result = await elevenLabsService.generateSpeechStream(text, options, onChunk);

    // Tambahkan streamId ke hasil
    return {
      ...result,
      streamId
    };
  } catch (error) {
    console.error('Error saat menghasilkan speech stream:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menghasilkan speech stream'
    };
  }
});

// Handler untuk menghentikan streaming
ipcMain.handle('stop-speech-stream', async (event, streamId) => {
  try {
    // Kirim pesan ke renderer process bahwa stream telah dihentikan
    event.sender.send('speech-stream-chunk', {
      streamId,
      done: true,
      stopped: true
    });

    return {
      success: true,
      message: 'Stream berhasil dihentikan'
    };
  } catch (error) {
    console.error('Error saat menghentikan speech stream:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menghentikan speech stream'
    };
  }
});

// Handler untuk mengatur kecepatan pemutaran
ipcMain.handle('set-tts-speed', async (event, speed) => {
  try {
    const result = elevenLabsService.setSpeed(speed);

    // Simpan kecepatan ke file konfigurasi persisten
    const configSaved = saveConfig({
      elevenlabs: {
        speed: speed
      }
    });

    if (!configSaved) {
      console.warn('Gagal menyimpan kecepatan TTS ke file konfigurasi persisten');
    }

    return {
      success: result,
      message: 'Kecepatan TTS berhasil diatur',
      speed: speed
    };
  } catch (error) {
    console.error('Error saat mengatur kecepatan TTS:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur kecepatan TTS'
    };
  }
});

// Handler untuk mengatur pitch suara
ipcMain.handle('set-tts-pitch', async (event, pitch) => {
  try {
    const result = elevenLabsService.setPitch(pitch);

    // Simpan pitch ke file konfigurasi persisten
    const configSaved = saveConfig({
      elevenlabs: {
        pitch: pitch
      }
    });

    if (!configSaved) {
      console.warn('Gagal menyimpan pitch TTS ke file konfigurasi persisten');
    }

    return {
      success: result,
      message: 'Pitch TTS berhasil diatur',
      pitch: pitch
    };
  } catch (error) {
    console.error('Error saat mengatur pitch TTS:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur pitch TTS'
    };
  }
});

// Handler untuk mengatur volume suara
ipcMain.handle('set-tts-volume', async (event, volume) => {
  try {
    const result = elevenLabsService.setVolume(volume);

    // Simpan volume ke file konfigurasi persisten
    const configSaved = saveConfig({
      elevenlabs: {
        volume: volume
      }
    });

    if (!configSaved) {
      console.warn('Gagal menyimpan volume TTS ke file konfigurasi persisten');
    }

    return {
      success: result,
      message: 'Volume TTS berhasil diatur',
      volume: volume
    };
  } catch (error) {
    console.error('Error saat mengatur volume TTS:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengatur volume TTS'
    };
  }
});

// Handler untuk mendapatkan daftar MCP servers
ipcMain.handle('get-mcp-servers', async (event) => {
  try {
    const savedConfig = loadConfig();
    return savedConfig.mcp?.servers || [];
  } catch (error) {
    console.error('Error saat mendapatkan daftar MCP servers:', error);
    return [];
  }
});

// Handler untuk mendapatkan MCP server berdasarkan ID
ipcMain.handle('get-mcp-server', async (event, id) => {
  try {
    const savedConfig = loadConfig();
    const servers = savedConfig.mcp?.servers || [];
    return servers[id] || null;
  } catch (error) {
    console.error('Error saat mendapatkan MCP server:', error);
    return null;
  }
});

// Handler untuk menambahkan MCP server baru
ipcMain.handle('add-mcp-server', async (event, server) => {
  try {
    const savedConfig = loadConfig();
    const servers = savedConfig.mcp?.servers || [];

    // Tambahkan server baru
    servers.push(server);

    // Simpan konfigurasi
    const success = saveConfig({
      mcp: {
        servers
      }
    });

    return {
      success,
      servers
    };
  } catch (error) {
    console.error('Error saat menambahkan MCP server:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menambahkan MCP server'
    };
  }
});

// Handler untuk memperbarui MCP server
ipcMain.handle('update-mcp-server', async (event, server) => {
  try {
    const savedConfig = loadConfig();
    const servers = savedConfig.mcp?.servers || [];

    // Perbarui server yang ada
    if (server.id >= 0 && server.id < servers.length) {
      servers[server.id] = {
        name: server.name,
        command: server.command,
        args: server.args,
        env: server.env
      };

      // Simpan konfigurasi
      const success = saveConfig({
        mcp: {
          servers
        }
      });

      return {
        success,
        servers
      };
    } else {
      return {
        success: false,
        error: 'ID server tidak valid'
      };
    }
  } catch (error) {
    console.error('Error saat memperbarui MCP server:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memperbarui MCP server'
    };
  }
});

// Handler untuk menghapus MCP server
ipcMain.handle('delete-mcp-server', async (event, id) => {
  try {
    const savedConfig = loadConfig();
    const servers = savedConfig.mcp?.servers || [];

    // Hapus server berdasarkan ID
    if (id >= 0 && id < servers.length) {
      servers.splice(id, 1);

      // Simpan konfigurasi
      const success = saveConfig({
        mcp: {
          servers
        }
      });

      return {
        success,
        servers
      };
    } else {
      return {
        success: false,
        error: 'ID server tidak valid'
      };
    }
  } catch (error) {
    console.error('Error saat menghapus MCP server:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat menghapus MCP server'
    };
  }
});

// Handler untuk memvalidasi API key Gemini tanpa menyimpannya
ipcMain.handle('validate-gemini-api-key', async (event, apiKey) => {
  try {
    console.log('Menerima permintaan untuk memvalidasi API key Gemini');

    if (!apiKey || apiKey.trim() === '') {
      console.log('API key kosong, mengembalikan error');
      return {
        valid: false,
        message: 'API key tidak boleh kosong'
      };
    }

    // Validasi API key
    console.log('Memvalidasi API key...');
    const validationResult = await geminiService.validateApiKey(apiKey);
    console.log('Hasil validasi API key:', validationResult);

    return validationResult;
  } catch (error) {
    console.error('Error saat memvalidasi API key:', error);
    console.error('Detail error:', error.stack);
    return {
      valid: false,
      message: `Error: ${error.message || 'Terjadi kesalahan saat memvalidasi API key'}`
    };
  }
});

// Handler untuk reset chat
ipcMain.handle('reset-gemini-chat', async (event) => {
  try {
    const result = geminiService.resetChat();

    // Reset conversation history
    conversationHistory.length = 0;

    return {
      success: result,
      message: result ? 'Chat berhasil direset' : 'Gagal mereset chat'
    };
  } catch (error) {
    console.error('Error saat mereset chat:', error);
    return {
      success: false,
      message: `Error: ${error.message || 'Terjadi kesalahan saat mereset chat'}`
    };
  }
});

// Fungsi untuk memuat konfigurasi Gemini dan ElevenLabs dari file
function loadGeminiConfig() {
  try {
    console.log('Memulai pemuatan konfigurasi Gemini dan ElevenLabs...');
    console.log('User data path:', userDataPath);
    console.log('Config file path:', configFilePath);

    // Pastikan direktori konfigurasi ada
    if (!fs.existsSync(userDataPath)) {
      console.log('Direktori user data tidak ditemukan, membuat direktori...');
      try {
        fs.mkdirSync(userDataPath, { recursive: true });
        console.log('Direktori user data berhasil dibuat:', userDataPath);
      } catch (mkdirError) {
        console.error('Gagal membuat direktori user data:', mkdirError);
      }
    }

    // Cek izin akses direktori
    try {
      const testFile = path.join(userDataPath, 'test-write-access.tmp');
      fs.writeFileSync(testFile, 'test', 'utf8');
      fs.unlinkSync(testFile);
      console.log('Direktori user data memiliki izin tulis');
    } catch (accessError) {
      console.error('Direktori user data tidak memiliki izin tulis:', accessError);
    }

    // Pastikan file konfigurasi ada
    if (!fs.existsSync(configFilePath)) {
      console.log('File konfigurasi tidak ditemukan, membuat file kosong');
      try {
        // Buat file konfigurasi kosong
        fs.writeFileSync(configFilePath, '{}', 'utf8');
        console.log('File konfigurasi kosong berhasil dibuat');
      } catch (error) {
        console.error('Gagal membuat file konfigurasi:', error);
      }
    } else {
      console.log('File konfigurasi ditemukan');

      // Cek apakah file dapat dibaca
      try {
        const fileContent = fs.readFileSync(configFilePath, 'utf8');
        console.log('File konfigurasi dapat dibaca, ukuran:', fileContent.length, 'karakter');

        // Cek apakah file dapat di-parse
        try {
          const parsedConfig = JSON.parse(fileContent);
          console.log('File konfigurasi berhasil di-parse');

          // Log isi konfigurasi (tanpa menampilkan API key lengkap)
          if (parsedConfig.gemini && parsedConfig.gemini.apiKey) {
            const apiKeyLength = parsedConfig.gemini.apiKey.length;
            console.log(`Konfigurasi berisi API key dengan panjang: ${apiKeyLength} karakter`);
          }
        } catch (parseError) {
          console.error('File konfigurasi tidak dapat di-parse, membuat ulang file:', parseError);
          fs.writeFileSync(configFilePath, '{}', 'utf8');
        }
      } catch (readError) {
        console.error('File konfigurasi tidak dapat dibaca:', readError);
      }
    }

    // Muat konfigurasi
    console.log('Memuat konfigurasi dari file...');
    const savedConfig = loadConfig();
    console.log('Konfigurasi dimuat:', savedConfig ? 'Berhasil' : 'Gagal');

    // Muat API key jika ada
    if (savedConfig && savedConfig.gemini && savedConfig.gemini.apiKey) {
      const apiKey = savedConfig.gemini.apiKey;
      console.log('API key ditemukan dalam konfigurasi, panjang:', apiKey.length);

      // Simpan ke environment variable
      process.env.GEMINI_API_KEY = apiKey;
      console.log('API key disimpan ke environment variable');

      // PENTING: Atur API key di geminiService
      console.log('Mengatur API key di geminiService...');
      const setResult = geminiService.setApiKey(apiKey);
      console.log('Hasil pengaturan API key:', setResult ? 'Berhasil' : 'Gagal');

      // Verifikasi bahwa API key telah diatur dengan benar
      const isInitialized = geminiService.isInitialized();
      console.log('Status inisialisasi Gemini API:', isInitialized ? 'Berhasil' : 'Gagal');

      if (!isInitialized) {
        console.log('Mencoba inisialisasi ulang dengan API key...');
        // Coba inisialisasi ulang
        geminiService.initialize();
        console.log('Status inisialisasi setelah mencoba ulang:', geminiService.isInitialized() ? 'Berhasil' : 'Masih gagal');

        // Coba validasi API key secara sinkron
        try {
          console.log('Memvalidasi API key...');
          geminiService.validateApiKey(apiKey)
            .then(result => {
              console.log('Hasil validasi API key:', result.valid ? 'Valid' : 'Tidak valid');
              if (!result.valid) {
                console.error('API key tidak valid:', result.message);
              } else {
                // Jika valid tapi belum terinisialisasi, coba set ulang
                if (!geminiService.isInitialized()) {
                  console.log('API key valid tapi belum terinisialisasi, mencoba set ulang...');
                  geminiService.setApiKey(apiKey);
                  console.log('Status setelah set ulang:', geminiService.isInitialized() ? 'Berhasil' : 'Masih gagal');
                }
              }
            })
            .catch(validationError => {
              console.error('Error saat validasi API key:', validationError);
            });
        } catch (error) {
          console.error('Error saat validasi API key:', error);
        }
      }
    } else {
      console.log('API key tidak ditemukan dalam konfigurasi');

      // Cek apakah ada di environment variable
      if (process.env.GEMINI_API_KEY) {
        console.log('API key ditemukan di environment variable, mencoba menggunakan...');
        const apiKey = process.env.GEMINI_API_KEY;

        // Atur API key di geminiService
        const setResult = geminiService.setApiKey(apiKey);
        console.log('Hasil pengaturan API key dari env:', setResult ? 'Berhasil' : 'Gagal');

        // Simpan ke file konfigurasi
        if (setResult) {
          console.log('Menyimpan API key dari environment variable ke file konfigurasi...');
          const configData = { gemini: { apiKey: apiKey } };
          saveConfig(configData);
        }
      }
    }

    // Muat model jika ada
    if (savedConfig && savedConfig.gemini && savedConfig.gemini.model) {
      const model = savedConfig.gemini.model;
      console.log('Model ditemukan dalam konfigurasi:', model);

      // Simpan ke environment variable
      process.env.GEMINI_MODEL = model;
      console.log('Model disimpan ke environment variable');

      // Atur model di geminiService jika API key sudah diatur
      if (geminiService.isInitialized()) {
        console.log('Mengatur model di geminiService...');
        const modelResult = geminiService.setModel(model);
        console.log('Hasil pengaturan model:', modelResult ? 'Berhasil' : 'Gagal');
      } else {
        console.log('Tidak dapat mengatur model karena Gemini API belum diinisialisasi');
      }
    } else {
      console.log('Model tidak ditemukan dalam konfigurasi, menggunakan default');
    }

    // Verifikasi status akhir
    const finalStatus = geminiService.isInitialized();
    console.log('Status akhir inisialisasi Gemini API:', finalStatus ? 'Berhasil' : 'Gagal');

    return finalStatus;
  } catch (error) {
    console.error('Error saat memuat konfigurasi Gemini:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Muat konfigurasi Gemini dan ElevenLabs dari file
  loadGeminiConfig();

  // Inisialisasi ElevenLabs dengan API key dari environment variable
  if (process.env.ELEVENLABS_API_KEY) {
    elevenLabsService.setApiKey(process.env.ELEVENLABS_API_KEY);
  }

  createWindow();

  // Tunggu sebentar sebelum mendaftarkan shortcut untuk memastikan aplikasi sudah siap
  setTimeout(() => {
    // Unregister dulu jika sudah ada (untuk menghindari duplikasi)
    globalShortcut.unregister('Alt+Space');

    // Daftarkan shortcut global Alt+Space
    const ret = globalShortcut.register('Alt+Space', () => {
      console.log('Alt+Space is pressed: Toggle window visibility');
      toggleWindowVisibility();
    });

    if (!ret) {
      console.error('Registrasi shortcut Alt+Space gagal');
      // Coba lagi dengan accelerator yang berbeda jika gagal
      const altRet = globalShortcut.register('CommandOrControl+Space', () => {
        console.log('CommandOrControl+Space is pressed as fallback: Toggle window visibility');
        toggleWindowVisibility();
      });

      if (altRet) {
        console.log('Fallback shortcut CommandOrControl+Space berhasil didaftarkan');
      }
    } else {
      console.log('Shortcut Alt+Space berhasil didaftarkan');
    }

    // Daftarkan shortcut untuk zoom in (Ctrl++)
    const zoomInRet = globalShortcut.register('CommandOrControl+=', () => {
      console.log('CommandOrControl+= is pressed: Zoom in');
      if (mainWindow && !mainWindow.isDestroyed()) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
      }
    });

    if (!zoomInRet) {
      console.error('Registrasi shortcut CommandOrControl+= (zoom in) gagal');
    } else {
      console.log('Shortcut CommandOrControl+= (zoom in) berhasil didaftarkan');
    }

    // Daftarkan shortcut untuk zoom out (Ctrl+-)
    const zoomOutRet = globalShortcut.register('CommandOrControl+-', () => {
      console.log('CommandOrControl+- is pressed: Zoom out');
      if (mainWindow && !mainWindow.isDestroyed()) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.setZoomFactor(Math.max(0.1, currentZoom - 0.1));
      }
    });

    if (!zoomOutRet) {
      console.error('Registrasi shortcut CommandOrControl+- (zoom out) gagal');
    } else {
      console.log('Shortcut CommandOrControl+- (zoom out) berhasil didaftarkan');
    }

    // Daftarkan shortcut untuk reset zoom (Ctrl+0)
    const zoomResetRet = globalShortcut.register('CommandOrControl+0', () => {
      console.log('CommandOrControl+0 is pressed: Reset zoom');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.setZoomFactor(1.0);
      }
    });

    if (!zoomResetRet) {
      console.error('Registrasi shortcut CommandOrControl+0 (reset zoom) gagal');
    } else {
      console.log('Shortcut CommandOrControl+0 (reset zoom) berhasil didaftarkan');
    }
  }, 1000); // Tunggu 1 detik
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handler untuk membuka URL eksternal
ipcMain.on('open-external-url', (event, url) => {
  try {
    console.log('Membuka URL eksternal:', url);

    // Validasi URL untuk keamanan
    if (!url || typeof url !== 'string') {
      console.error('URL tidak valid:', url);
      return;
    }

    // Pastikan URL dimulai dengan http:// atau https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.error('URL tidak aman:', url);
      return;
    }

    // Gunakan shell.openExternal untuk membuka URL di browser default
    const { shell } = require('electron');
    shell.openExternal(url);
  } catch (error) {
    console.error('Error saat membuka URL eksternal:', error);
  }
});

// Handler untuk log error dari renderer process
ipcMain.on('log-error', (event, errorMessage) => {
  try {
    console.error('Error dari renderer process:', errorMessage);

    // Di sini bisa ditambahkan kode untuk menyimpan error ke file log
    // atau mengirim error ke layanan monitoring
  } catch (error) {
    console.error('Error saat logging error dari renderer:', error);
  }
});

// Hapus semua shortcut saat aplikasi akan ditutup
app.on('will-quit', () => {
  // Unregister shortcut
  try {
    globalShortcut.unregister('Alt+Space');
    globalShortcut.unregister('CommandOrControl+Space');
    globalShortcut.unregister('CommandOrControl+=');
    globalShortcut.unregister('CommandOrControl+-');
    globalShortcut.unregister('CommandOrControl+0');
    globalShortcut.unregisterAll();
    console.log('Semua shortcut berhasil dihapus');
  } catch (error) {
    console.error('Gagal menghapus shortcut:', error);
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
