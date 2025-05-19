// Konfigurasi untuk Mamouse Agent
const config = {
  // Konfigurasi WebSocket
  webSocket: {
    defaultPort: 12345,
    maxAttempts: 10
  },

  // Konfigurasi Gemini API
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-2.0-flash-001', // Model default yang berhasil divalidasi
    temperature: 0.7,
    maxOutputTokens: 2048,
    topK: 40,
    topP: 0.95,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  },

  // Konfigurasi ElevenLabs TTS
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    defaultVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam (default)
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarityBoost: 0.75,
    speed: 1.0, // Kecepatan pemutaran (0.5 - 2.0)
    pitch: 1.0, // Pitch suara (0.5 - 2.0)
    volume: 1.0, // Volume suara (0.0 - 1.0)
    autoplay: true, // Otomatis memutar audio saat menerima respons
    streamingMode: true, // Menggunakan streaming untuk TTS
    cacheEnabled: true, // Mengaktifkan caching audio
    voices: {
      adam: 'pNInz6obpgDQGcFmaJgB', // Adam
      antoni: 'ErXwobaYiN019PkySvjV', // Antoni
      arnold: 'VR6AewLTigWG4xSOukaG', // Arnold
      bella: 'EXAVITQu4vr4xnSDxMaL', // Bella
      charlie: 'IKne3meq5aSn9XLyUdCD', // Charlie
      clyde: '2EiwWnXFnvU5JabPnv8n', // Clyde
      daniel: 'onwK4e9ZLuTAKqWW03F9', // Daniel
      dave: 'CYw3kZ02Hs0563khs1Fj', // Dave
      dorothy: 'ThT5KcBeYPX3keUQqHPh', // Dorothy
      ethan: '5Q0t7uMcjvnagumLfvZi', // Ethan
      freya: 'jsCqWAovK2LkecY7zXl4', // Freya
      gigi: 'jBpfuIE2acCO8z3wKNLl', // Gigi
      grace: 'oWAxZDx7w5VEj9dCyTzz', // Grace
      harry: 'SOYHLrjzK2X1ezoPC6cr', // Harry
      james: 'ZQe5CZNOzWyzPSCn5a3c', // James
      jeremy: 'bVMeCyTHy58xNoL34h3p', // Jeremy
      josh: 'TxGEqnHWrfWFTfGW9XjX', // Josh
      matilda: 'XrExE9yKIg1WjnnlVkGX', // Matilda
      mimi: 'zrHiDhphv9ZnVXBqCLjz', // Mimi
      nicole: 'piTKgcLEGmPE4e6mEKli', // Nicole
      rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel
      sam: 'yoZ06aMxZJJ28mfd3POQ', // Sam
      thomas: 'GBv7mTt0atIp3Br8iCZE', // Thomas
      jarvis: 'IKne3meq5aSn9XLyUdCD' // Charlie (alias untuk Jarvis)
    }
  },

  // Konfigurasi MCP (Model Context Protocol)
  mcp: {
    enabled: true,
    debug: false,
    servers: [],
    computerControl: {
      enabled: true,
      allowScreenshot: true,
      allowKeyboardControl: true,
      allowMouseControl: true,
      allowAppLaunch: true,
      allowedApps: ['notepad', 'calc', 'chrome', 'firefox', 'explorer']
    }
  },

  // Konfigurasi Kamera
  camera: {
    enabled: true,
    saveImages: true,
    imageQuality: 0.9,
    maxWidth: 1280,
    maxHeight: 720,
    facingMode: 'user', // 'user' untuk kamera depan, 'environment' untuk kamera belakang
    analysisPrompt: 'Deskripsikan apa yang Anda lihat dalam gambar ini secara detail.'
  },

  // Konfigurasi Widget
  widgets: {
    enabled: true,
    weather: {
      apiKey: '', // OpenWeatherMap API key
      defaultLocation: 'Jakarta',
      units: 'metric' // metric atau imperial
    },
    news: {
      apiKey: '', // NewsAPI key
      defaultCategory: 'general',
      defaultCountry: 'id'
    },
    maps: {
      apiKey: '' // Google Maps API key
    },
    stocks: {
      apiKey: '' // Alpha Vantage API key
    }
  },

  // Konfigurasi aplikasi
  app: {
    name: 'Mamouse Agent',
    version: '1.0.0',
    description: 'Asisten AI personal dengan kemampuan multimodal'
  }
};

module.exports = config;
