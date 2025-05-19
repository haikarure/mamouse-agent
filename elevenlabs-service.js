// ElevenLabs TTS Service untuk Mamouse Agent
const axios = require('./axios'); // Gunakan axios.js lokal
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const config = require('./config');

// Kelas untuk mengelola interaksi dengan ElevenLabs API
class ElevenLabsService {
  constructor(apiKey = process.env.ELEVENLABS_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.initialized = false;
    this.voiceId = config.elevenlabs?.defaultVoiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam (default)
    this.model = config.elevenlabs?.model || 'eleven_multilingual_v2';
    this.stability = config.elevenlabs?.stability || 0.5;
    this.similarityBoost = config.elevenlabs?.similarityBoost || 0.75;
    this.speed = config.elevenlabs?.speed || 1.0;
    this.pitch = config.elevenlabs?.pitch || 1.0;
    this.volume = config.elevenlabs?.volume || 1.0;
    this.cacheDir = path.join(app.getPath('userData'), 'tts-cache');

    // Pastikan direktori cache ada
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // Inisialisasi jika API key tersedia
    if (this.apiKey) {
      this.initialize();
    }
  }

  // Inisialisasi ElevenLabs API
  initialize() {
    try {
      if (!this.apiKey || this.apiKey.trim() === '') {
        console.error('ElevenLabs API key tidak tersedia atau tidak valid. Gunakan setApiKey() untuk mengatur API key.');
        this.initialized = false;
        return false;
      }

      console.log('ElevenLabs TTS Service berhasil diinisialisasi');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error saat menginisialisasi ElevenLabs TTS Service:', error);
      this.initialized = false;
      return false;
    }
  }

  // Mengatur API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    return this.initialize();
  }

  // Mengatur voice ID
  setVoiceId(voiceId) {
    this.voiceId = voiceId;
    return true;
  }

  // Mengatur model
  setModel(model) {
    this.model = model;
    return true;
  }

  // Mengatur parameter stabilitas
  setStability(stability) {
    this.stability = parseFloat(stability);
    return true;
  }

  // Mengatur parameter similarity boost
  setSimilarityBoost(similarityBoost) {
    this.similarityBoost = parseFloat(similarityBoost);
    return true;
  }

  // Mengatur kecepatan pemutaran
  setSpeed(speed) {
    this.speed = parseFloat(speed);
    return true;
  }

  // Mengatur pitch suara
  setPitch(pitch) {
    this.pitch = parseFloat(pitch);
    return true;
  }

  // Mengatur volume suara
  setVolume(volume) {
    this.volume = parseFloat(volume);
    return true;
  }

  // Mendapatkan daftar suara yang tersedia
  async getVoices() {
    try {
      if (!this.initialized) {
        throw new Error('ElevenLabs TTS Service belum diinisialisasi');
      }

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        voices: response.data.voices
      };
    } catch (error) {
      console.error('Error saat mendapatkan daftar suara:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat mendapatkan daftar suara'
      };
    }
  }

  // Menghasilkan audio dari teks
  async generateSpeech(text, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('ElevenLabs TTS Service belum diinisialisasi');
      }

      if (!text || text.trim() === '') {
        throw new Error('Teks tidak boleh kosong');
      }

      // Gunakan opsi yang diberikan atau nilai default
      const voiceId = options.voiceId || this.voiceId;
      const model = options.model || this.model;
      const stability = options.stability !== undefined ? options.stability : this.stability;
      const similarityBoost = options.similarityBoost !== undefined ? options.similarityBoost : this.similarityBoost;
      const speed = options.speed !== undefined ? options.speed : this.speed;
      const pitch = options.pitch !== undefined ? options.pitch : this.pitch;
      const volume = options.volume !== undefined ? options.volume : this.volume;
      const optimize = options.optimize !== undefined ? options.optimize : true;

      // Buat hash dari parameter untuk caching
      const hash = this.createHash(text, voiceId, model, stability, similarityBoost, speed, pitch, volume);
      const cachePath = path.join(this.cacheDir, `${hash}.mp3`);

      // Periksa cache
      if (fs.existsSync(cachePath) && optimize) {
        console.log('Menggunakan audio dari cache');
        return {
          success: true,
          audioPath: cachePath,
          fromCache: true
        };
      }

      // Buat request ke ElevenLabs API
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${voiceId}`,
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        data: {
          text: text,
          model_id: model,
          voice_settings: {
            stability: stability,
            similarity_boost: similarityBoost,
            style: 1.0,
            use_speaker_boost: true
          },
          speed: speed,
          pitch: pitch,
          volume: volume
        },
        responseType: 'arraybuffer'
      });

      // Simpan audio ke file
      fs.writeFileSync(cachePath, Buffer.from(response.data));

      return {
        success: true,
        audioPath: cachePath,
        fromCache: false
      };
    } catch (error) {
      console.error('Error saat menghasilkan speech:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat menghasilkan speech'
      };
    }
  }

  // Menghasilkan audio dari teks secara streaming
  async generateSpeechStream(text, options = {}, onChunk = () => {}) {
    try {
      if (!this.initialized) {
        throw new Error('ElevenLabs TTS Service belum diinisialisasi');
      }

      if (!text || text.trim() === '') {
        throw new Error('Teks tidak boleh kosong');
      }

      // Gunakan opsi yang diberikan atau nilai default
      const voiceId = options.voiceId || this.voiceId;
      const model = options.model || this.model;
      const stability = options.stability !== undefined ? options.stability : this.stability;
      const similarityBoost = options.similarityBoost !== undefined ? options.similarityBoost : this.similarityBoost;
      const speed = options.speed !== undefined ? options.speed : this.speed;
      const pitch = options.pitch !== undefined ? options.pitch : this.pitch;
      const volume = options.volume !== undefined ? options.volume : this.volume;
      const optimize = options.optimize !== undefined ? options.optimize : true;
      const chunkSize = options.chunkSize || 1024; // Ukuran chunk dalam bytes

      // Buat hash dari parameter untuk caching
      const hash = this.createHash(text, voiceId, model, stability, similarityBoost, speed, pitch, volume);
      const cachePath = path.join(this.cacheDir, `${hash}.mp3`);

      // Periksa cache jika optimize diaktifkan
      if (fs.existsSync(cachePath) && optimize) {
        console.log('Menggunakan audio streaming dari cache');

        // Baca file cache dan stream ke callback
        const fileStream = fs.createReadStream(cachePath, { highWaterMark: chunkSize });

        fileStream.on('data', (chunk) => {
          onChunk({
            chunk,
            done: false,
            fromCache: true
          });
        });

        return new Promise((resolve) => {
          fileStream.on('end', () => {
            onChunk({
              done: true,
              audioPath: cachePath,
              fromCache: true
            });
            resolve({
              success: true,
              audioPath: cachePath,
              fromCache: true
            });
          });

          fileStream.on('error', (error) => {
            console.error('Error saat streaming audio dari cache:', error);
            // Jika terjadi error saat membaca cache, lanjutkan dengan request API
            this.streamFromAPI(text, voiceId, model, stability, similarityBoost, speed, pitch, volume, cachePath, chunkSize, onChunk)
              .then(resolve)
              .catch((apiError) => {
                resolve({
                  success: false,
                  error: apiError.message || 'Terjadi kesalahan saat streaming audio'
                });
              });
          });
        });
      }

      // Jika tidak ada cache atau optimize dinonaktifkan, lakukan request API
      return this.streamFromAPI(text, voiceId, model, stability, similarityBoost, speed, pitch, volume, cachePath, chunkSize, onChunk);
    } catch (error) {
      console.error('Error saat menghasilkan speech stream:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat menghasilkan speech stream'
      };
    }
  }

  // Fungsi helper untuk streaming dari API
  async streamFromAPI(text, voiceId, model, stability, similarityBoost, speed, pitch, volume, cachePath, chunkSize, onChunk) {
    try {
      console.log('Streaming audio dari ElevenLabs API');

      // Buat request ke ElevenLabs API dengan streaming
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        data: {
          text: text,
          model_id: model,
          voice_settings: {
            stability: stability,
            similarity_boost: similarityBoost,
            style: 1.0,
            use_speaker_boost: true
          },
          output_format: 'mp3_44100_128',
          stream: true,
          speed: speed,
          pitch: pitch,
          volume: volume
        },
        responseType: 'stream'
      });

      // Buat write stream untuk menyimpan ke cache
      const writeStream = fs.createWriteStream(cachePath);

      // Buat buffer untuk mengumpulkan chunk sebelum mengirim ke callback
      let buffer = Buffer.alloc(0);

      // Proses stream
      response.data.on('data', (chunk) => {
        // Tulis ke cache
        writeStream.write(chunk);

        // Tambahkan chunk ke buffer
        buffer = Buffer.concat([buffer, chunk]);

        // Jika buffer sudah mencapai ukuran chunk yang diinginkan, kirim ke callback
        if (buffer.length >= chunkSize) {
          const chunkToSend = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize);

          onChunk({
            chunk: chunkToSend,
            done: false,
            fromCache: false
          });
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          // Tutup write stream
          writeStream.end();

          // Kirim sisa buffer jika ada
          if (buffer.length > 0) {
            onChunk({
              chunk: buffer,
              done: false,
              fromCache: false
            });
          }

          // Kirim sinyal selesai
          onChunk({
            done: true,
            audioPath: cachePath,
            fromCache: false
          });

          resolve({
            success: true,
            audioPath: cachePath,
            fromCache: false
          });
        });

        response.data.on('error', (error) => {
          writeStream.end();
          console.error('Error saat streaming audio dari API:', error);
          reject({
            success: false,
            error: error.message || 'Terjadi kesalahan saat streaming audio dari API'
          });
        });
      });
    } catch (error) {
      console.error('Error saat streaming dari API:', error);
      throw error;
    }
  }

  // Membuat hash dari parameter untuk caching
  createHash(text, voiceId, model, stability, similarityBoost, speed = this.speed, pitch = this.pitch, volume = this.volume) {
    const crypto = require('crypto');
    const data = `${text}|${voiceId}|${model}|${stability}|${similarityBoost}|${speed}|${pitch}|${volume}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  // Memeriksa apakah service sudah diinisialisasi
  isInitialized() {
    return this.initialized;
  }

  // Validasi API key
  async validateApiKey(apiKey) {
    try {
      // Simpan API key saat ini
      const currentApiKey = this.apiKey;

      // Gunakan API key yang akan divalidasi
      this.apiKey = apiKey;

      // Coba mendapatkan daftar suara untuk memvalidasi
      const response = await this.getVoices();

      if (!response.success) {
        // Kembalikan API key ke nilai sebelumnya
        this.apiKey = currentApiKey;
        return {
          valid: false,
          message: response.error || 'API key tidak valid'
        };
      }

      // API key valid, simpan
      return {
        valid: true,
        message: 'API key valid'
      };
    } catch (error) {
      // Kembalikan API key ke nilai sebelumnya jika terjadi error
      this.apiKey = currentApiKey;
      console.error('Error saat memvalidasi API key:', error);
      return {
        valid: false,
        message: error.message || 'Terjadi kesalahan saat memvalidasi API key'
      };
    }
  }
}

// Buat instance singleton
const elevenLabsService = new ElevenLabsService();

module.exports = elevenLabsService;
