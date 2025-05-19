// Tools untuk Mamouse Agent
const https = require('https');
const http = require('http');
const url = require('url');
const { ipcMain } = require('electron');
const config = require('./config');
const widgetManager = require('./widget-manager');

// Kelas untuk mengelola tools
class ToolsManager {
  constructor() {
    this.tools = {};
    this.registerDefaultTools();
  }

  // Mendaftarkan tool baru
  registerTool(name, description, parameters, handler) {
    this.tools[name] = {
      name,
      description,
      parameters,
      handler
    };
    console.log(`Tool "${name}" berhasil didaftarkan`);
    return this;
  }

  // Mendapatkan daftar semua tools
  getTools() {
    return Object.values(this.tools);
  }

  // Mendapatkan definisi tools untuk Gemini API
  getToolDefinitions() {
    return this.getTools().map(tool => ({
      functionDeclarations: [{
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'OBJECT',
          properties: tool.parameters
        }
      }]
    }));
  }

  // Menjalankan tool berdasarkan nama dan parameter
  async executeTool(name, parameters) {
    try {
      // Validasi nama tool
      if (!name || typeof name !== 'string' || name.trim() === '') {
        console.error('Nama tool kosong atau tidak valid');
        return {
          success: false,
          toolName: '',
          error: 'Nama tool kosong atau tidak valid'
        };
      }

      // Validasi tool terdaftar
      if (!this.tools[name]) {
        console.error(`Tool "${name}" tidak ditemukan`);
        return {
          success: false,
          toolName: name,
          error: `Tool "${name}" tidak ditemukan`
        };
      }

      // Validasi parameter
      if (!parameters) {
        console.warn(`Parameter untuk tool "${name}" kosong, menggunakan objek kosong`);
        parameters = {};
      }

      console.log(`Menjalankan tool "${name}" dengan parameter:`, parameters);
      const result = await this.tools[name].handler(parameters);
      return {
        success: true,
        toolName: name,
        result
      };
    } catch (error) {
      console.error(`Error saat menjalankan tool "${name}":`, error);
      return {
        success: false,
        toolName: name || '',
        error: error.message || 'Terjadi kesalahan saat menjalankan tool'
      };
    }
  }

  // Mendaftarkan tools default
  registerDefaultTools() {
    // Tool untuk melakukan pencarian web
    this.registerTool(
      'web_search',
      'Melakukan pencarian informasi di web',
      {
        query: {
          type: 'STRING',
          description: 'Kata kunci pencarian'
        }
      },
      this.webSearch
    );

    // Tool untuk mendapatkan waktu saat ini
    this.registerTool(
      'get_current_time',
      'Mendapatkan waktu saat ini',
      {
        timezone: {
          type: 'STRING',
          description: 'Zona waktu (opsional, default: lokal)'
        }
      },
      this.getCurrentTime
    );

    // Daftarkan tools kontrol komputer jika diaktifkan di konfigurasi
    if (config.mcp && config.mcp.enabled && config.mcp.computerControl && config.mcp.computerControl.enabled) {
      this.registerComputerControlTools();
    }

    // Daftarkan tools kamera jika diaktifkan di konfigurasi
    if (config.camera && config.camera.enabled) {
      this.registerCameraTools();
    }

    // Daftarkan tools widget jika diaktifkan di konfigurasi
    if (config.widgets && config.widgets.enabled) {
      this.registerWidgetTools();
    }
  }

  // Mendaftarkan tools untuk kontrol komputer
  registerComputerControlTools() {
    console.log('Mendaftarkan tools kontrol komputer...');

    // Tool untuk mengambil screenshot
    if (config.mcp.computerControl.allowScreenshot) {
      this.registerTool(
        'take_screenshot',
        'Mengambil screenshot layar komputer',
        {},
        this.takeScreenshot
      );
    }

    // Tool untuk membuka aplikasi
    if (config.mcp.computerControl.allowAppLaunch) {
      this.registerTool(
        'open_application',
        'Membuka aplikasi di komputer',
        {
          appName: {
            type: 'STRING',
            description: 'Nama aplikasi yang akan dibuka (contoh: notepad, calc, chrome)'
          }
        },
        this.openApplication
      );
    }

    // Tool untuk mendapatkan daftar aplikasi yang berjalan
    this.registerTool(
      'get_running_applications',
      'Mendapatkan daftar aplikasi yang sedang berjalan',
      {},
      this.getRunningApplications
    );
  }

  // Mendaftarkan tools untuk kamera
  registerCameraTools() {
    console.log('Mendaftarkan tools kamera...');

    // Tool untuk mengaktifkan kamera
    this.registerTool(
      'activate_camera',
      'Mengaktifkan kamera',
      {},
      this.activateCamera
    );

    // Tool untuk menonaktifkan kamera
    this.registerTool(
      'deactivate_camera',
      'Menonaktifkan kamera',
      {},
      this.deactivateCamera
    );

    // Tool untuk mengambil gambar dari kamera
    this.registerTool(
      'capture_image',
      'Mengambil gambar dari kamera',
      {},
      this.captureImage
    );

    // Tool untuk menganalisis gambar
    this.registerTool(
      'analyze_image',
      'Menganalisis gambar dari kamera',
      {
        prompt: {
          type: 'STRING',
          description: 'Prompt untuk analisis gambar (opsional)'
        }
      },
      this.analyzeImage
    );
  }

  // Mendaftarkan tools untuk widget
  registerWidgetTools() {
    console.log('Mendaftarkan tools widget...');

    // Tool untuk mendapatkan informasi cuaca
    this.registerTool(
      'get_weather',
      'Mendapatkan informasi cuaca untuk lokasi tertentu',
      {
        location: {
          type: 'STRING',
          description: 'Nama kota atau lokasi (contoh: Jakarta, Indonesia)'
        },
        units: {
          type: 'STRING',
          description: 'Satuan suhu (metric/imperial, default: metric)'
        }
      },
      this.getWeatherWidget
    );

    // Tool untuk mendapatkan berita
    this.registerTool(
      'get_news',
      'Mendapatkan berita terkini',
      {
        query: {
          type: 'STRING',
          description: 'Kata kunci pencarian (opsional)'
        },
        category: {
          type: 'STRING',
          description: 'Kategori berita (business, entertainment, general, health, science, sports, technology)'
        },
        country: {
          type: 'STRING',
          description: 'Kode negara (id, us, gb, dll)'
        }
      },
      this.getNewsWidget
    );

    // Tool untuk mendapatkan informasi kalender
    this.registerTool(
      'get_calendar',
      'Mendapatkan informasi kalender',
      {
        date: {
          type: 'STRING',
          description: 'Tanggal (YYYY-MM-DD, opsional)'
        }
      },
      this.getCalendarWidget
    );

    // Tool untuk mendapatkan kurs mata uang
    this.registerTool(
      'get_currency',
      'Mendapatkan kurs mata uang',
      {
        base: {
          type: 'STRING',
          description: 'Mata uang dasar (USD, EUR, IDR, dll)'
        },
        target: {
          type: 'STRING',
          description: 'Mata uang target (USD, EUR, IDR, dll)'
        }
      },
      this.getCurrencyWidget
    );

    // Tool untuk mendapatkan informasi saham
    this.registerTool(
      'get_stocks',
      'Mendapatkan informasi harga saham',
      {
        symbol: {
          type: 'STRING',
          description: 'Simbol saham (AAPL, MSFT, GOOG, dll)'
        }
      },
      this.getStocksWidget
    );

    // Tool untuk mendapatkan waktu perjalanan
    this.registerTool(
      'get_travel_time',
      'Mendapatkan estimasi waktu perjalanan',
      {
        origin: {
          type: 'STRING',
          description: 'Lokasi asal'
        },
        destination: {
          type: 'STRING',
          description: 'Lokasi tujuan'
        },
        mode: {
          type: 'STRING',
          description: 'Mode transportasi (driving, walking, bicycling, transit)'
        }
      },
      this.getTravelTimeWidget
    );
  }

  // Handler untuk tool cuaca
  async getWeather(params) {
    return new Promise((resolve, reject) => {
      try {
        const location = params.location || 'Jakarta, Indonesia';
        const apiKey = process.env.WEATHER_API_KEY || 'demo'; // Gunakan 'demo' untuk testing
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;

        // Jika tidak ada API key, gunakan data dummy untuk demo
        if (apiKey === 'demo') {
          console.log('Menggunakan data cuaca dummy karena tidak ada API key');
          setTimeout(() => {
            resolve({
              location: location,
              temperature: 28,
              condition: 'Cerah',
              humidity: 75,
              wind: '10 km/h',
              lastUpdated: new Date().toLocaleString(),
              note: 'Ini adalah data dummy. Untuk data cuaca yang akurat, tambahkan WEATHER_API_KEY ke file .env'
            });
          }, 500);
          return;
        }

        // Lakukan request ke API cuaca
        https.get(apiUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`API Error: ${res.statusCode} ${data}`));
              return;
            }

            try {
              const weatherData = JSON.parse(data);
              resolve({
                location: `${weatherData.location.name}, ${weatherData.location.country}`,
                temperature: weatherData.current.temp_c,
                condition: weatherData.current.condition.text,
                humidity: weatherData.current.humidity,
                wind: `${weatherData.current.wind_kph} km/h`,
                lastUpdated: weatherData.current.last_updated
              });
            } catch (error) {
              reject(new Error(`Error parsing weather data: ${error.message}`));
            }
          });
        }).on('error', (error) => {
          reject(new Error(`Error fetching weather data: ${error.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Handler untuk tool pencarian web
  async webSearch(params) {
    return new Promise((resolve, reject) => {
      try {
        const query = params.query || '';
        if (!query) {
          reject(new Error('Query pencarian tidak boleh kosong'));
          return;
        }

        // Gunakan data dummy untuk demo
        console.log('Menggunakan data pencarian dummy');
        setTimeout(() => {
          resolve({
            query: query,
            results: [
              {
                title: `Hasil pencarian untuk "${query}" - Item 1`,
                snippet: `Ini adalah snippet hasil pencarian untuk "${query}". Informasi ini hanya sebagai contoh.`,
                url: `https://example.com/search?q=${encodeURIComponent(query)}`
              },
              {
                title: `Hasil pencarian untuk "${query}" - Item 2`,
                snippet: `Contoh hasil pencarian lainnya untuk "${query}". Dalam implementasi sebenarnya, ini akan berisi data dari API pencarian.`,
                url: `https://example.org/results?query=${encodeURIComponent(query)}`
              }
            ],
            note: 'Ini adalah data dummy. Untuk pencarian web yang sebenarnya, tambahkan SEARCH_API_KEY ke file .env'
          });
        }, 800);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Handler untuk tool waktu saat ini
  async getCurrentTime(params) {
    try {
      const timezone = params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();

      return {
        time: now.toLocaleTimeString('id-ID', { timeZone: timezone }),
        date: now.toLocaleDateString('id-ID', { timeZone: timezone }),
        timezone: timezone,
        timestamp: now.getTime()
      };
    } catch (error) {
      throw new Error(`Error mendapatkan waktu: ${error.message}`);
    }
  }

  // Handler untuk tool screenshot
  async takeScreenshot() {
    return new Promise((resolve, reject) => {
      try {
        // ipcMain tidak bisa di-invoke dari main process, gunakan mcpServer langsung
        const mcpServer = require('./mcp-server');
        mcpServer.takeScreenshot()
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                message: 'Screenshot berhasil diambil',
                screenshot: result.screenshot
              });
            } else {
              reject(new Error(`Error mengambil screenshot: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error mengambil screenshot: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error mengambil screenshot: ${error.message}`));
      }
    });
  }

  // Handler untuk tool membuka aplikasi
  async openApplication(params) {
    return new Promise((resolve, reject) => {
      try {
        const appName = params.appName || '';
        if (!appName) {
          reject(new Error('Nama aplikasi tidak boleh kosong'));
          return;
        }

        // Validasi aplikasi yang diizinkan
        const allowedApps = config.mcp.computerControl.allowedApps || [];
        const isAllowed = allowedApps.some(app => appName.toLowerCase().includes(app.toLowerCase()));

        if (!isAllowed) {
          reject(new Error(`Aplikasi "${appName}" tidak diizinkan. Aplikasi yang diizinkan: ${allowedApps.join(', ')}`));
          return;
        }

        // Gunakan mcpServer langsung
        const mcpServer = require('./mcp-server');
        mcpServer.openApplication(appName)
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                message: `Aplikasi "${appName}" berhasil dibuka`
              });
            } else {
              reject(new Error(`Error membuka aplikasi: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error membuka aplikasi: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error membuka aplikasi: ${error.message}`));
      }
    });
  }

  // Handler untuk tool mendapatkan daftar aplikasi yang berjalan
  async getRunningApplications() {
    return new Promise((resolve, reject) => {
      try {
        // Gunakan mcpServer langsung
        const mcpServer = require('./mcp-server');
        mcpServer.getRunningApplications()
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                applications: result.applications
              });
            } else {
              reject(new Error(`Error mendapatkan daftar aplikasi: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error mendapatkan daftar aplikasi: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error mendapatkan daftar aplikasi: ${error.message}`));
      }
    });
  }

  // Handler untuk tool mengaktifkan kamera
  async activateCamera() {
    return new Promise((resolve, reject) => {
      try {
        // Gunakan cameraService langsung
        const cameraService = require('./camera-service');
        cameraService.activateCamera()
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                message: result.message || 'Kamera berhasil diaktifkan'
              });
            } else {
              reject(new Error(`Error mengaktifkan kamera: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error mengaktifkan kamera: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error mengaktifkan kamera: ${error.message}`));
      }
    });
  }

  // Handler untuk tool menonaktifkan kamera
  async deactivateCamera() {
    return new Promise((resolve, reject) => {
      try {
        // Gunakan cameraService langsung
        const cameraService = require('./camera-service');
        cameraService.deactivateCamera()
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                message: result.message || 'Kamera berhasil dinonaktifkan'
              });
            } else {
              reject(new Error(`Error menonaktifkan kamera: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error menonaktifkan kamera: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error menonaktifkan kamera: ${error.message}`));
      }
    });
  }

  // Handler untuk tool mengambil gambar dari kamera
  async captureImage() {
    return new Promise((resolve, reject) => {
      try {
        // Gunakan cameraService langsung
        const cameraService = require('./camera-service');
        cameraService.captureImage()
          .then(result => {
            if (result.success) {
              resolve({
                success: true,
                message: 'Gambar berhasil diambil',
                imageData: result.imageData,
                imagePath: result.imagePath
              });
            } else {
              reject(new Error(`Error mengambil gambar: ${result.error}`));
            }
          })
          .catch(error => {
            reject(new Error(`Error mengambil gambar: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error mengambil gambar: ${error.message}`));
      }
    });
  }

  // Handler untuk tool menganalisis gambar
  async analyzeImage(params) {
    return new Promise((resolve, reject) => {
      try {
        // Ambil gambar terlebih dahulu jika belum ada
        // Gunakan cameraService langsung
        const cameraService = require('./camera-service');
        cameraService.captureImage()
          .then(captureResult => {
            if (!captureResult.success) {
              reject(new Error(`Error mengambil gambar: ${captureResult.error}`));
              return;
            }

            // Analisis gambar
            const customPrompt = params.prompt || null;

            // Gunakan cameraService langsung
            cameraService.analyzeImage(captureResult.imageData, customPrompt)
              .then(analysisResult => {
                if (analysisResult.success) {
                  resolve({
                    success: true,
                    analysis: analysisResult.analysis,
                    imageData: analysisResult.imageData
                  });
                } else {
                  reject(new Error(`Error menganalisis gambar: ${analysisResult.error}`));
                }
              })
              .catch(error => {
                reject(new Error(`Error menganalisis gambar: ${error.message}`));
              });
          })
          .catch(error => {
            reject(new Error(`Error mengambil gambar: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`Error menganalisis gambar: ${error.message}`));
      }
    });
  }

  // Handler untuk widget cuaca
  async getWeatherWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('weather', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data cuaca: ${error.message}`);
    }
  }

  // Handler untuk widget berita
  async getNewsWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('news', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data berita: ${error.message}`);
    }
  }

  // Handler untuk widget kalender
  async getCalendarWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('calendar', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data kalender: ${error.message}`);
    }
  }

  // Handler untuk widget kurs mata uang
  async getCurrencyWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('currency', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data kurs mata uang: ${error.message}`);
    }
  }

  // Handler untuk widget saham
  async getStocksWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('stocks', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data saham: ${error.message}`);
    }
  }

  // Handler untuk widget waktu perjalanan
  async getTravelTimeWidget(params) {
    try {
      const result = await widgetManager.getWidgetData('travel_time', params);
      return result;
    } catch (error) {
      throw new Error(`Error mendapatkan data waktu perjalanan: ${error.message}`);
    }
  }
}

// Buat instance singleton
const toolsManager = new ToolsManager();

module.exports = toolsManager;
