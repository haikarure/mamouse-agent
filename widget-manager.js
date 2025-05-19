// Widget Manager untuk Mamouse Agent
// Mengelola widget dan informasi real-time

const { ipcMain } = require('electron');
const https = require('https');
const http = require('http');
const url = require('url');
const config = require('./config');

class WidgetManager {
  constructor() {
    this.widgets = new Map();
    this.initialized = false;
    this.apiKeys = {
      weather: config.widgets?.weather?.apiKey || '',
      news: config.widgets?.news?.apiKey || '',
      maps: config.widgets?.maps?.apiKey || '',
      stocks: config.widgets?.stocks?.apiKey || ''
    };
  }

  // Inisialisasi Widget Manager
  initialize() {
    if (this.initialized) return true;

    console.log('Menginisialisasi Widget Manager...');

    // Setup IPC handlers
    this.setupIPCHandlers();

    // Daftarkan widget default
    this.registerDefaultWidgets();

    this.initialized = true;
    console.log('Widget Manager berhasil diinisialisasi');
    return true;
  }

  // Setup IPC handlers untuk komunikasi dengan renderer process
  setupIPCHandlers() {
    // Handler untuk mendapatkan daftar widget
    ipcMain.handle('widgets:get-list', async () => {
      return this.getWidgetsList();
    });

    // Handler untuk mendapatkan data widget
    ipcMain.handle('widgets:get-data', async (event, widgetId, params) => {
      return this.getWidgetData(widgetId, params);
    });

    // Handler untuk mengatur API key
    ipcMain.handle('widgets:set-api-key', async (event, service, apiKey) => {
      return this.setApiKey(service, apiKey);
    });

    console.log('IPC handlers untuk Widget Manager berhasil diatur');
  }

  // Daftarkan widget default
  registerDefaultWidgets() {
    // Widget Cuaca
    this.registerWidget(
      'weather',
      'Cuaca',
      'Informasi cuaca terkini',
      '🌤️',
      this.getWeatherData.bind(this),
      {
        location: {
          type: 'string',
          description: 'Lokasi (kota atau koordinat)',
          required: true
        },
        units: {
          type: 'string',
          description: 'Satuan suhu (metric/imperial)',
          required: false,
          default: 'metric'
        }
      }
    );

    // Widget Berita
    this.registerWidget(
      'news',
      'Berita',
      'Berita terkini',
      '📰',
      this.getNewsData.bind(this),
      {
        query: {
          type: 'string',
          description: 'Kata kunci pencarian',
          required: false
        },
        category: {
          type: 'string',
          description: 'Kategori berita (business, entertainment, general, health, science, sports, technology)',
          required: false,
          default: 'general'
        },
        country: {
          type: 'string',
          description: 'Kode negara (id, us, gb, dll)',
          required: false,
          default: 'id'
        }
      }
    );

    // Widget Jadwal
    this.registerWidget(
      'calendar',
      'Kalender',
      'Informasi kalender dan jadwal',
      '📅',
      this.getCalendarData.bind(this),
      {
        date: {
          type: 'string',
          description: 'Tanggal (YYYY-MM-DD)',
          required: false
        }
      }
    );

    // Widget Kurs Mata Uang
    this.registerWidget(
      'currency',
      'Kurs Mata Uang',
      'Informasi nilai tukar mata uang',
      '💱',
      this.getCurrencyData.bind(this),
      {
        base: {
          type: 'string',
          description: 'Mata uang dasar (USD, EUR, IDR, dll)',
          required: false,
          default: 'USD'
        },
        target: {
          type: 'string',
          description: 'Mata uang target (USD, EUR, IDR, dll)',
          required: false,
          default: 'IDR'
        }
      }
    );

    // Widget Saham
    this.registerWidget(
      'stocks',
      'Saham',
      'Informasi harga saham',
      '📈',
      this.getStocksData.bind(this),
      {
        symbol: {
          type: 'string',
          description: 'Simbol saham (AAPL, MSFT, GOOG, dll)',
          required: true
        }
      }
    );

    // Widget Waktu Perjalanan
    this.registerWidget(
      'travel_time',
      'Waktu Perjalanan',
      'Estimasi waktu perjalanan',
      '🚗',
      this.getTravelTimeData.bind(this),
      {
        origin: {
          type: 'string',
          description: 'Lokasi asal',
          required: true
        },
        destination: {
          type: 'string',
          description: 'Lokasi tujuan',
          required: true
        },
        mode: {
          type: 'string',
          description: 'Mode transportasi (driving, walking, bicycling, transit)',
          required: false,
          default: 'driving'
        }
      }
    );

    console.log('Widget default berhasil didaftarkan');
  }

  // Daftarkan widget baru
  registerWidget(id, name, description, icon, handler, params = {}) {
    this.widgets.set(id, {
      id,
      name,
      description,
      icon,
      handler,
      params
    });

    console.log(`Widget "${name}" berhasil didaftarkan dengan ID: ${id}`);
    return true;
  }

  // Dapatkan daftar widget
  getWidgetsList() {
    const widgetsList = [];

    for (const [id, widget] of this.widgets.entries()) {
      widgetsList.push({
        id: widget.id,
        name: widget.name,
        description: widget.description,
        icon: widget.icon,
        params: widget.params
      });
    }

    return {
      success: true,
      widgets: widgetsList
    };
  }

  // Dapatkan data widget
  async getWidgetData(widgetId, params = {}) {
    try {
      const widget = this.widgets.get(widgetId);

      if (!widget) {
        return {
          success: false,
          error: `Widget dengan ID "${widgetId}" tidak ditemukan`
        };
      }

      // Validasi parameter
      for (const [paramName, paramConfig] of Object.entries(widget.params)) {
        if (paramConfig.required && !params[paramName] && !paramConfig.default) {
          return {
            success: false,
            error: `Parameter "${paramName}" diperlukan untuk widget "${widget.name}"`
          };
        }

        // Gunakan nilai default jika parameter tidak disediakan
        if (!params[paramName] && paramConfig.default) {
          params[paramName] = paramConfig.default;
        }
      }

      // Panggil handler widget
      const result = await widget.handler(params);
      return result;
    } catch (error) {
      console.error(`Error saat mendapatkan data widget ${widgetId}:`, error);
      return {
        success: false,
        error: error.message || `Terjadi kesalahan saat mendapatkan data widget ${widgetId}`
      };
    }
  }

  // Atur API key
  setApiKey(service, apiKey) {
    if (!this.apiKeys.hasOwnProperty(service)) {
      return {
        success: false,
        error: `Layanan "${service}" tidak valid`
      };
    }

    this.apiKeys[service] = apiKey;
    console.log(`API key untuk layanan "${service}" berhasil diatur`);

    return {
      success: true,
      message: `API key untuk layanan "${service}" berhasil diatur`
    };
  }

  // Handler untuk widget cuaca
  async getWeatherData(params) {
    try {
      const { location, units = 'metric' } = params;

      if (!location) {
        return {
          success: false,
          error: 'Parameter lokasi diperlukan'
        };
      }

      // Gunakan API key dari konfigurasi
      const apiKey = this.apiKeys.weather;

      if (!apiKey) {
        return {
          success: false,
          error: 'API key untuk layanan cuaca tidak tersedia'
        };
      }

      // Buat URL API
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${apiKey}`;

      // Panggil API
      const data = await this.fetchJson(apiUrl);

      if (!data || data.cod !== 200) {
        return {
          success: false,
          error: data?.message || 'Gagal mendapatkan data cuaca'
        };
      }

      // Format hasil
      const result = {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        humidity: data.main.humidity,
        wind: `${data.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`,
        pressure: `${data.main.pressure} hPa`,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility / 1000, // Convert to km
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        lastUpdated: new Date().toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data cuaca:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data cuaca'
      };
    }
  }

  // Handler untuk widget berita
  async getNewsData(params) {
    try {
      const { query, category = 'general', country = 'id' } = params;

      // Gunakan API key dari konfigurasi
      const apiKey = this.apiKeys.news;

      if (!apiKey) {
        return {
          success: false,
          error: 'API key untuk layanan berita tidak tersedia'
        };
      }

      // Buat URL API
      let apiUrl;

      if (query) {
        // Pencarian berdasarkan kata kunci
        apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKey}`;
      } else {
        // Berita utama berdasarkan kategori dan negara
        apiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&apiKey=${apiKey}`;
      }

      // Panggil API
      const data = await this.fetchJson(apiUrl);

      if (!data || data.status !== 'ok') {
        return {
          success: false,
          error: data?.message || 'Gagal mendapatkan data berita'
        };
      }

      // Format hasil
      const articles = data.articles.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt).toLocaleString(),
        imageUrl: article.urlToImage
      }));

      const result = {
        query: query || `Berita ${category} terkini`,
        totalResults: data.totalResults,
        articles,
        lastUpdated: new Date().toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data berita:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data berita'
      };
    }
  }

  // Handler untuk widget kalender
  async getCalendarData(params) {
    try {
      const { date } = params;

      // Gunakan tanggal saat ini jika tidak disediakan
      const targetDate = date ? new Date(date) : new Date();

      if (isNaN(targetDate.getTime())) {
        return {
          success: false,
          error: 'Format tanggal tidak valid'
        };
      }

      // Dapatkan informasi kalender
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const day = targetDate.getDate();

      // Dapatkan hari pertama bulan
      const firstDay = new Date(year, month, 1).getDay();

      // Dapatkan jumlah hari dalam bulan
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Buat array hari dalam bulan
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        days.push({
          day: i,
          weekday: dayDate.toLocaleDateString('id-ID', { weekday: 'short' }),
          isToday: i === day && month === new Date().getMonth() && year === new Date().getFullYear()
        });
      }

      // Format hasil
      const result = {
        date: targetDate.toLocaleDateString('id-ID', { dateStyle: 'full' }),
        year,
        month: targetDate.toLocaleDateString('id-ID', { month: 'long' }),
        day,
        weekday: targetDate.toLocaleDateString('id-ID', { weekday: 'long' }),
        firstDay,
        daysInMonth,
        days,
        lastUpdated: new Date().toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data kalender:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data kalender'
      };
    }
  }

  // Handler untuk widget kurs mata uang
  async getCurrencyData(params) {
    try {
      const { base = 'USD', target = 'IDR' } = params;

      // Buat URL API (menggunakan API gratis)
      const apiUrl = `https://open.er-api.com/v6/latest/${base}`;

      // Panggil API
      const data = await this.fetchJson(apiUrl);

      if (!data || data.result !== 'success') {
        return {
          success: false,
          error: data?.error || 'Gagal mendapatkan data kurs mata uang'
        };
      }

      // Periksa apakah mata uang target tersedia
      if (!data.rates[target]) {
        return {
          success: false,
          error: `Mata uang ${target} tidak tersedia`
        };
      }

      // Format hasil
      const rate = data.rates[target];
      const result = {
        base,
        target,
        rate,
        inverseRate: 1 / rate,
        lastUpdated: new Date(data.time_last_update_utc).toLocaleString(),
        nextUpdate: new Date(data.time_next_update_utc).toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data kurs mata uang:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data kurs mata uang'
      };
    }
  }

  // Handler untuk widget saham
  async getStocksData(params) {
    try {
      const { symbol } = params;

      if (!symbol) {
        return {
          success: false,
          error: 'Parameter simbol saham diperlukan'
        };
      }

      // Gunakan API key dari konfigurasi
      const apiKey = this.apiKeys.stocks;

      if (!apiKey) {
        return {
          success: false,
          error: 'API key untuk layanan saham tidak tersedia'
        };
      }

      // Buat URL API (menggunakan Alpha Vantage API)
      const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

      // Panggil API
      const data = await this.fetchJson(apiUrl);

      if (!data || data.Note || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
        return {
          success: false,
          error: data?.Note || data?.['Error Message'] || 'Gagal mendapatkan data saham'
        };
      }

      const quote = data['Global Quote'];

      // Format hasil
      const result = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        lastUpdated: new Date().toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data saham:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data saham'
      };
    }
  }

  // Handler untuk widget waktu perjalanan
  async getTravelTimeData(params) {
    try {
      const { origin, destination, mode = 'driving' } = params;

      if (!origin || !destination) {
        return {
          success: false,
          error: 'Parameter origin dan destination diperlukan'
        };
      }

      // Gunakan API key dari konfigurasi
      const apiKey = this.apiKeys.maps;

      if (!apiKey) {
        return {
          success: false,
          error: 'API key untuk layanan maps tidak tersedia'
        };
      }

      // Buat URL API (menggunakan Google Maps Distance Matrix API)
      const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;

      // Panggil API
      const data = await this.fetchJson(apiUrl);

      if (!data || data.status !== 'OK') {
        return {
          success: false,
          error: data?.error_message || 'Gagal mendapatkan data waktu perjalanan'
        };
      }

      // Periksa apakah ada hasil
      if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
        return {
          success: false,
          error: 'Tidak ada rute yang ditemukan'
        };
      }

      const element = data.rows[0].elements[0];

      if (element.status !== 'OK') {
        return {
          success: false,
          error: `Error: ${element.status}`
        };
      }

      // Format hasil
      const result = {
        origin: data.origin_addresses[0],
        destination: data.destination_addresses[0],
        distance: element.distance.text,
        distanceValue: element.distance.value, // dalam meter
        duration: element.duration.text,
        durationValue: element.duration.value, // dalam detik
        mode,
        lastUpdated: new Date().toLocaleString()
      };

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error saat mendapatkan data waktu perjalanan:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan data waktu perjalanan'
      };
    }
  }

  // Hentikan Widget Manager
  shutdown() {
    console.log('Menghentikan Widget Manager...');
    this.initialized = false;
    console.log('Widget Manager berhasil dihentikan');
  }

  // Utilitas untuk fetch JSON dari URL
  fetchJson(apiUrl, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(apiUrl);
      const httpModule = parsedUrl.protocol === 'https:' ? https : http;

      // Tambahkan timeout untuk mencegah permintaan menggantung
      const timeoutId = setTimeout(() => {
        request.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const request = httpModule.get(apiUrl, (response) => {
        // Hapus timeout jika respons diterima
        clearTimeout(timeoutId);

        // Periksa status code
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(`Status Code: ${response.statusCode}, URL: ${apiUrl}`));
        }

        // Siapkan variabel untuk menyimpan data
        const data = [];
        let dataSize = 0;
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

        // Event handler untuk menerima data
        response.on('data', (chunk) => {
          data.push(chunk);
          dataSize += chunk.length;

          // Cek ukuran data untuk mencegah serangan DoS
          if (dataSize > MAX_SIZE) {
            request.destroy();
            reject(new Error('Response too large, possible DoS attack'));
          }
        });

        // Event handler untuk akhir respons
        response.on('end', () => {
          try {
            // Parse JSON
            const result = JSON.parse(Buffer.concat(data).toString());
            resolve(result);
          } catch (error) {
            reject(new Error(`Error parsing JSON: ${error.message}`));
          }
        });

        // Event handler untuk error respons
        response.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      });

      // Event handler untuk error permintaan
      request.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Request error: ${error.message}, URL: ${apiUrl}`));
      });

      // Akhiri permintaan
      request.end();
    });
  }
}

// Buat instance singleton
const widgetManager = new WidgetManager();

module.exports = widgetManager;
