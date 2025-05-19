// Gemini API Service untuk Mamouse Agent
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');
const toolsManager = require('./tools');
const fs = require('fs');
const path = require('path');

// Fungsi untuk menulis log ke file - versi sederhana yang tidak bergantung pada app
function logToFile(message, level = 'INFO') {
  try {
    // Gunakan console.log saja untuk sementara
    console.log(`[${level}] ${message}`);

    // Kita tidak menggunakan file logging untuk sementara karena masalah dengan app
  } catch (error) {
    console.error('Error saat menulis log ke file:', error);
  }
}

// Kelas untuk mengelola interaksi dengan Gemini API
class GeminiService {
  constructor(apiKey = config.gemini.apiKey) {
    this.apiKey = apiKey;
    this.model = config.gemini.model;
    this.genAI = null;
    this.modelInstance = null;
    this.chatSession = null;
    this.initialized = false;
    this.toolsEnabled = true; // Flag untuk mengaktifkan/menonaktifkan tools

    // Inisialisasi jika API key tersedia
    if (this.apiKey) {
      this.initialize();
    }
  }

  // Inisialisasi Gemini API
  initialize() {
    try {
      console.log('Memulai inisialisasi Gemini API...');
      logToFile('[BUBBLE_DEBUG] Memulai inisialisasi Gemini API...', 'DEBUG');

      // Validasi API key
      if (!this.apiKey || this.apiKey.trim() === '') {
        console.error('Gemini API key tidak tersedia atau tidak valid. Gunakan setApiKey() untuk mengatur API key.');
        logToFile('[BUBBLE_DEBUG] Gemini API key tidak tersedia atau tidak valid', 'ERROR');
        this.initialized = false;
        return false;
      }

      console.log('API key tersedia, panjang:', this.apiKey.length);
      logToFile(`[BUBBLE_DEBUG] API key tersedia, panjang: ${this.apiKey.length}`, 'DEBUG');

      // Reset state sebelum inisialisasi ulang
      this.genAI = null;
      this.modelInstance = null;
      this.chatSession = null;

      // Inisialisasi Google Generative AI dengan API key
      try {
        console.log('Mencoba membuat instance GoogleGenerativeAI...');
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        console.log('Instance GoogleGenerativeAI berhasil dibuat');
      } catch (apiError) {
        console.error('Error saat menginisialisasi Google Generative AI:', apiError);
        console.error('Detail error:', apiError.stack);

        // Cek jenis error untuk memberikan informasi yang lebih spesifik
        let errorMessage = 'Terjadi kesalahan saat menginisialisasi Gemini API';

        if (apiError.message) {
          if (apiError.message.includes('API key')) {
            errorMessage = 'API key tidak valid atau telah kedaluwarsa';
          } else if (apiError.message.includes('network')) {
            errorMessage = 'Masalah koneksi jaringan, periksa koneksi internet Anda';
          } else {
            errorMessage = apiError.message;
          }
        }

        console.error('Pesan error:', errorMessage);
        this.initialized = false;
        return false;
      }

      // Validasi model
      if (!this.model || this.model.trim() === '') {
        console.warn('Nama model tidak valid, menggunakan model default');
        this.model = config.gemini.model;
      }

      console.log('Mencoba mendapatkan model dengan nama:', this.model);

      // Konfigurasi model
      const modelConfig = {
        model: this.model,
        generationConfig: {
          temperature: config.gemini.temperature || 0.7,
          maxOutputTokens: config.gemini.maxOutputTokens || 2048,
          topK: config.gemini.topK || 40,
          topP: config.gemini.topP || 0.95
        }
      };

      // Tambahkan safetySettings jika tersedia
      if (config.gemini.safetySettings) {
        modelConfig.safetySettings = config.gemini.safetySettings;
        console.log('Safety settings ditambahkan ke konfigurasi model');
      }

      console.log('Konfigurasi model:', JSON.stringify(modelConfig, null, 2));

      // Tambahkan tools jika diaktifkan
      if (this.toolsEnabled) {
        try {
          console.log('Mengaktifkan tools untuk Gemini API');
          modelConfig.tools = toolsManager.getToolDefinitions();
          console.log('Tools berhasil ditambahkan ke konfigurasi model');
        } catch (toolsError) {
          console.error('Error saat mendapatkan definisi tools:', toolsError);
          console.error('Detail error:', toolsError.stack);
          // Lanjutkan tanpa tools jika terjadi error
          console.warn('Melanjutkan tanpa tools karena terjadi error');
          this.toolsEnabled = false;
        }
      } else {
        console.log('Tools dinonaktifkan, tidak ditambahkan ke konfigurasi model');
      }

      // Gunakan API yang benar untuk versi library saat ini
      try {
        console.log('Mencoba mendapatkan model generatif...');
        this.modelInstance = this.genAI.getGenerativeModel(modelConfig);
        console.log('Model generatif berhasil didapatkan');
      } catch (modelError) {
        console.error('Error saat mendapatkan model generatif:', modelError);
        console.error('Detail error:', modelError.stack);
        this.initialized = false;
        return false;
      }

      // Buat chat session baru
      try {
        console.log('Mencoba membuat chat session baru');
        this.chatSession = this.modelInstance.startChat({
          history: []
        });
        console.log('Chat session berhasil dibuat');
      } catch (chatError) {
        console.error('Error saat membuat chat session:', chatError);
        console.error('Detail error:', chatError.stack);

        // Coba lanjutkan tanpa chat session
        console.warn('Mencoba melanjutkan tanpa chat session awal');
        this.chatSession = null;

        // Tetap tandai sebagai berhasil, chat session akan dibuat saat diperlukan
        this.initialized = true;
        console.log(`Gemini API berhasil diinisialisasi dengan model: ${this.model} (tanpa chat session awal)`);
        return true;
      }

      this.initialized = true;
      console.log(`Gemini API berhasil diinisialisasi dengan model: ${this.model}`);
      return true;
    } catch (error) {
      console.error('Gagal menginisialisasi Gemini API:', error);
      console.error('Detail error:', error.stack);
      this.initialized = false;
      return false;
    }
  }

  // Mengatur API key baru
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    return this.initialize();
  }

  // Validasi API key
  async validateApiKey(apiKey) {
    try {
      // Simpan API key saat ini
      const currentApiKey = this.apiKey;
      const wasInitialized = this.initialized;

      console.log('Memulai validasi API key...');

      // Gunakan API key yang akan divalidasi
      this.apiKey = apiKey;

      // Coba inisialisasi dengan API key baru
      const initResult = this.initialize();
      console.log('Hasil inisialisasi:', initResult);

      if (!initResult) {
        console.log('Gagal menginisialisasi dengan API key yang diberikan');
        // Kembalikan API key ke nilai sebelumnya
        this.apiKey = currentApiKey;
        if (wasInitialized) {
          this.initialize();
        }
        return {
          valid: false,
          message: 'Gagal menginisialisasi Gemini API dengan API key yang diberikan'
        };
      }

      // Coba panggil API dengan prompt sederhana untuk memvalidasi
      const testPrompt = 'Hello, this is a test prompt to validate the API key.';

      console.log('Mencoba memvalidasi API key dengan prompt:', testPrompt);

      try {
        const result = await this.modelInstance.generateContent(testPrompt);
        console.log('Berhasil mendapatkan respons dari API');

        // Jika berhasil mendapatkan respons, API key valid
        if (result) {
          // Kembalikan API key ke nilai sebelumnya jika ini hanya validasi
          if (currentApiKey !== apiKey && !wasInitialized) {
            this.apiKey = currentApiKey;
            this.initialize();
          }

          return {
            valid: true,
            message: 'API key valid'
          };
        } else {
          console.log('Respons tidak valid:', result);
          // Kembalikan API key ke nilai sebelumnya
          this.apiKey = currentApiKey;
          if (wasInitialized) {
            this.initialize();
          }

          return {
            valid: false,
            message: 'API key tidak valid atau tidak dapat digunakan untuk mengakses Gemini API'
          };
        }
      } catch (apiError) {
        console.error('Error saat memanggil Gemini API:', apiError);

        // Kembalikan API key ke nilai sebelumnya
        this.apiKey = currentApiKey || '';
        if (wasInitialized) {
          this.initialize();
        }

        // Periksa pesan error untuk memberikan informasi yang lebih spesifik
        let errorMessage = 'API key tidak valid';

        if (apiError.message) {
          console.error('Detail error:', apiError.message);

          if (apiError.message.includes('API key not valid')) {
            errorMessage = 'API key tidak valid';
          } else if (apiError.message.includes('quota')) {
            errorMessage = 'Kuota API key telah habis';
          } else if (apiError.message.includes('permission')) {
            errorMessage = 'API key tidak memiliki izin yang cukup';
          } else if (apiError.message.includes('rate limit')) {
            errorMessage = 'Rate limit terlampaui, coba lagi nanti';
          } else if (apiError.message.includes('not found')) {
            errorMessage = 'Model tidak ditemukan, coba model lain';
          } else {
            errorMessage = apiError.message; // Tampilkan pesan error asli untuk debugging
          }
        }

        return {
          valid: false,
          message: `Error: ${errorMessage}`,
          error: apiError.message
        };
      }
    } catch (error) {
      console.error('Error umum saat validasi API key:', error);

      // Kembalikan API key ke nilai sebelumnya jika terjadi error
      this.apiKey = currentApiKey || '';
      if (wasInitialized) {
        this.initialize();
      }

      // Log error lengkap untuk debugging
      console.log('Detail error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      return {
        valid: false,
        message: `Error: ${error.message || 'Terjadi kesalahan yang tidak diketahui'}`,
        error: error.message
      };
    }
  }

  // Mengatur model yang digunakan
  setModel(model) {
    this.model = model;
    return this.initialize();
  }

  // Mendapatkan respons dari Gemini API
  async getResponse(message) {
    // Validasi input
    if (!message || typeof message !== 'string') {
      console.error('Input tidak valid:', message);
      return {
        error: true,
        message: 'Input tidak valid. Pesan harus berupa string.'
      };
    }

    // Cek inisialisasi
    if (!this.initialized) {
      console.log('Gemini API belum diinisialisasi, mencoba inisialisasi ulang...');
      if (!this.initialize()) {
        console.error('Gagal menginisialisasi Gemini API');
        return {
          error: true,
          message: 'Gemini API belum diinisialisasi. Pastikan API key sudah diatur dengan benar.'
        };
      }
    }

    try {
      // Cek apakah chat session ada
      if (!this.chatSession) {
        console.log('Chat session tidak ditemukan, membuat session baru...');
        try {
          this.chatSession = this.modelInstance.startChat({
            history: []
          });
        } catch (sessionError) {
          console.error('Error saat membuat chat session baru:', sessionError);
          return {
            error: true,
            message: `Error saat membuat chat session: ${sessionError.message}`
          };
        }
      }

      // Kirim pesan ke Gemini API
      console.log('Mengirim pesan ke Gemini API...');
      const result = await this.chatSession.sendMessage(message);

      if (!result || !result.response) {
        console.error('Respons dari Gemini API tidak valid:', result);
        return {
          error: true,
          message: 'Respons dari Gemini API tidak valid atau kosong'
        };
      }

      const response = result.response;

      return {
        error: false,
        text: response.text(),
        candidates: response.candidates
      };
    } catch (error) {
      console.error('Error saat mendapatkan respons dari Gemini API:', error);

      // Cek jenis error untuk memberikan pesan yang lebih spesifik
      let errorMessage = 'Terjadi kesalahan saat berkomunikasi dengan Gemini API';

      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'API key tidak valid atau telah kedaluwarsa';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Kuota API telah habis';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit terlampaui, coba lagi nanti';
        } else if (error.message.includes('network')) {
          errorMessage = 'Masalah koneksi jaringan, periksa koneksi internet Anda';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        error: true,
        message: `Error: ${errorMessage}`,
        originalError: error.message
      };
    }
  }

  // Mengaktifkan atau menonaktifkan tools
  setToolsEnabled(enabled) {
    this.toolsEnabled = enabled;
    console.log(`Tools ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    // Reinisialisasi untuk menerapkan perubahan
    return this.initialize();
  }

  // Mendapatkan respons streaming dari Gemini API
  async getStreamingResponse(message, onChunk) {
    logToFile('[BUBBLE_DEBUG] getStreamingResponse dipanggil dengan pesan: ' + message.substring(0, 50) + '...', 'DEBUG');

    // Validasi callback
    if (typeof onChunk !== 'function') {
      console.error('Callback onChunk tidak valid');
      logToFile('[BUBBLE_DEBUG] Callback onChunk tidak valid', 'ERROR');
      return;
    }

    // Validasi input
    if (!message || typeof message !== 'string') {
      console.error('Input tidak valid:', message);
      logToFile('[BUBBLE_DEBUG] Input tidak valid: ' + JSON.stringify(message), 'ERROR');
      onChunk({
        error: true,
        message: 'Input tidak valid. Pesan harus berupa string.',
        done: true
      });
      return;
    }

    // Cek inisialisasi
    if (!this.initialized) {
      console.log('Gemini API belum diinisialisasi, mencoba inisialisasi ulang...');
      logToFile('[BUBBLE_DEBUG] Gemini API belum diinisialisasi, mencoba inisialisasi ulang...', 'WARN');
      try {
        if (!this.initialize()) {
          console.error('Gagal menginisialisasi Gemini API');
          logToFile('[BUBBLE_DEBUG] Gagal menginisialisasi Gemini API', 'ERROR');
          logToFile(`[BUBBLE_DEBUG] API key length: ${this.apiKey ? this.apiKey.length : 0}`, 'DEBUG');
          logToFile(`[BUBBLE_DEBUG] API key valid: ${this.apiKey && this.apiKey.trim() !== ''}`, 'DEBUG');
          onChunk({
            error: true,
            message: 'Gemini API belum diinisialisasi. Pastikan API key sudah diatur dengan benar.',
            done: true
          });
          return;
        }
        console.log('Gemini API berhasil diinisialisasi ulang');
        logToFile('[BUBBLE_DEBUG] Gemini API berhasil diinisialisasi ulang', 'INFO');
      } catch (initError) {
        console.error('Error saat menginisialisasi ulang Gemini API:', initError);
        logToFile(`[BUBBLE_DEBUG] Error saat menginisialisasi ulang Gemini API: ${initError.message}`, 'ERROR');
        logToFile(`[BUBBLE_DEBUG] Stack trace: ${initError.stack}`, 'ERROR');
        onChunk({
          error: true,
          message: `Error saat menginisialisasi ulang Gemini API: ${initError.message}`,
          done: true
        });
        return;
      }
    }

    try {
      // Cek apakah chat session ada
      if (!this.chatSession) {
        console.log('Chat session tidak ditemukan, membuat session baru...');
        logToFile('[BUBBLE_DEBUG] Chat session tidak ditemukan, membuat session baru...', 'INFO');
        try {
          // Cek apakah modelInstance ada
          if (!this.modelInstance) {
            logToFile('[BUBBLE_DEBUG] Model instance tidak ditemukan, mencoba inisialisasi ulang...', 'WARN');
            if (!this.initialize()) {
              logToFile('[BUBBLE_DEBUG] Gagal menginisialisasi ulang untuk mendapatkan model instance', 'ERROR');
              onChunk({
                error: true,
                message: 'Gagal membuat chat session: Model instance tidak tersedia',
                done: true
              });
              return;
            }
            logToFile('[BUBBLE_DEBUG] Model instance berhasil dibuat setelah inisialisasi ulang', 'INFO');
          }

          const chatConfig = {
            history: [],
            generationConfig: {
              temperature: config.gemini.temperature || 0.7,
              maxOutputTokens: config.gemini.maxOutputTokens || 2048,
              topK: config.gemini.topK || 40,
              topP: config.gemini.topP || 0.95
            }
          };

          logToFile(`[BUBBLE_DEBUG] Mencoba membuat chat session dengan konfigurasi: ${JSON.stringify(chatConfig)}`, 'DEBUG');
          this.chatSession = this.modelInstance.startChat(chatConfig);
          console.log('Chat session berhasil dibuat');
          logToFile('[BUBBLE_DEBUG] Chat session berhasil dibuat', 'INFO');
        } catch (sessionError) {
          console.error('Error saat membuat chat session baru:', sessionError);
          console.error('Detail error:', sessionError.stack);
          logToFile(`[BUBBLE_DEBUG] Error saat membuat chat session baru: ${sessionError.message}`, 'ERROR');
          logToFile(`[BUBBLE_DEBUG] Stack trace: ${sessionError.stack}`, 'ERROR');
          onChunk({
            error: true,
            message: `Error saat membuat chat session: ${sessionError.message}`,
            done: true
          });
          return;
        }
      }

      // Kirim pesan ke Gemini API dengan streaming
      console.log('Mengirim pesan streaming ke Gemini API...');
      logToFile('[BUBBLE_DEBUG] Mengirim pesan streaming ke Gemini API...', 'INFO');
      let result;
      try {
        logToFile('[BUBBLE_DEBUG] Memanggil chatSession.sendMessageStream...', 'DEBUG');
        result = await this.chatSession.sendMessageStream(message);
        console.log('Berhasil mendapatkan respons streaming dari Gemini API');
        logToFile('[BUBBLE_DEBUG] Berhasil mendapatkan respons streaming dari Gemini API', 'INFO');
      } catch (streamError) {
        console.error('Error saat mengirim pesan streaming ke Gemini API:', streamError);
        console.error('Detail error:', streamError.stack);
        logToFile(`[BUBBLE_DEBUG] Error saat mengirim pesan streaming ke Gemini API: ${streamError.message}`, 'ERROR');
        logToFile(`[BUBBLE_DEBUG] Stack trace: ${streamError.stack}`, 'ERROR');

        // Coba buat chat session baru dan coba lagi
        try {
          console.log('Mencoba membuat chat session baru dan mengirim ulang pesan...');
          this.chatSession = this.modelInstance.startChat({
            history: [],
            generationConfig: {
              temperature: config.gemini.temperature || 0.7,
              maxOutputTokens: config.gemini.maxOutputTokens || 2048,
              topK: config.gemini.topK || 40,
              topP: config.gemini.topP || 0.95
            }
          });

          result = await this.chatSession.sendMessageStream(message);
          console.log('Berhasil mendapatkan respons streaming setelah membuat chat session baru');
        } catch (retryError) {
          console.error('Error saat mencoba ulang dengan chat session baru:', retryError);
          onChunk({
            error: true,
            message: `Error saat mengirim pesan ke Gemini API: ${streamError.message}`,
            done: true
          });
          return;
        }
      }

      if (!result || !result.stream) {
        console.error('Respons streaming dari Gemini API tidak valid:', result);
        onChunk({
          error: true,
          message: 'Respons streaming dari Gemini API tidak valid atau kosong',
          done: true
        });
        return;
      }

      // Proses setiap chunk dari respons streaming
      console.log('Memulai pemrosesan respons streaming...');
      logToFile('[BUBBLE_DEBUG] Memulai pemrosesan respons streaming...', 'INFO');
      for await (const chunk of result.stream) {
        try {
          console.log('Menerima chunk dari Gemini API:', chunk);
          logToFile('[BUBBLE_DEBUG] Menerima chunk dari Gemini API', 'DEBUG');

          // Cek apakah ada functionCalls (metode baru di API)
          if (chunk.functionCalls && typeof chunk.functionCalls === 'function') {
            console.log('FunctionCalls terdeteksi (metode baru)');
            try {
              // Coba mendapatkan functionCalls
              let functionCalls;
              try {
                functionCalls = chunk.functionCalls();
                console.log('Hasil functionCalls():', functionCalls);
              } catch (callsError) {
                console.error('Error saat memanggil functionCalls():', callsError);
                console.error('Detail error:', callsError.stack);

                // Coba ekstrak teks sebagai fallback
                try {
                  if (chunk.text && typeof chunk.text === 'function') {
                    const text = chunk.text();
                    console.log('Menggunakan text() sebagai fallback:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

                    onChunk({
                      error: false,
                      chunk: text,
                      done: false
                    });
                  } else if (typeof chunk === 'object') {
                    // Coba ekstrak teks dari berbagai properti
                    let extractedText = '';

                    if (chunk.candidates && chunk.candidates.length > 0 &&
                        chunk.candidates[0].content &&
                        chunk.candidates[0].content.parts &&
                        chunk.candidates[0].content.parts.length > 0) {

                      extractedText = chunk.candidates[0].content.parts
                        .filter(part => part.text)
                        .map(part => part.text)
                        .join('');

                      if (extractedText) {
                        console.log('Teks berhasil diekstrak dari candidates:', extractedText.substring(0, 50) + (extractedText.length > 50 ? '...' : ''));

                        onChunk({
                          error: false,
                          chunk: extractedText,
                          done: false
                        });
                      }
                    }
                  }
                } catch (textError) {
                  console.error('Error saat mencoba fallback ke text():', textError);
                }

                continue; // Lanjutkan ke chunk berikutnya
              }

              // Jika functionCalls berhasil didapatkan dan valid
              if (Array.isArray(functionCalls) && functionCalls.length > 0) {
                for (const call of functionCalls) {
                  if (!call || !call.name) {
                    console.error('Function call tidak valid dalam functionCalls:', call);
                    continue;
                  }

                  const toolName = call.name;
                  let toolParams = {};

                  try {
                    if (call.args) {
                      toolParams = call.args;
                    }

                    console.log(`Menjalankan tool "${toolName}" dari functionCalls dengan parameter:`, toolParams);

                    // Eksekusi tool
                    const toolResult = await toolsManager.executeTool(toolName, toolParams);

                    // Kirim hasil tool ke client
                    onChunk({
                      error: false,
                      toolCall: true,
                      toolName: toolName,
                      toolParams: toolParams,
                      toolResult: toolResult,
                      done: false
                    });

                    // Format data yang benar untuk sendMessageStream dengan functionResponse
                    const functionResponseData = {
                      functionResponse: {
                        name: toolName,
                        response: {
                          name: toolName,
                          content: JSON.stringify(toolResult)
                        }
                      }
                    };

                    console.log('Mengirim function response ke model:', JSON.stringify(functionResponseData, null, 2));

                    // Gunakan format yang benar sesuai dengan versi library
                    await this.chatSession.sendMessageStream(functionResponseData);
                  } catch (toolError) {
                    console.error(`Error saat menjalankan tool "${toolName}" dari functionCalls:`, toolError);
                    onChunk({
                      error: true,
                      toolCall: true,
                      toolName: toolName,
                      message: `Error saat menjalankan tool: ${toolError.message}`,
                      done: false
                    });
                  }
                }
                continue; // Lanjutkan ke chunk berikutnya setelah memproses semua function calls
              } else {
                console.log('functionCalls() tidak mengembalikan array yang valid atau kosong');
              }
            } catch (functionCallsError) {
              console.error('Error saat memproses functionCalls:', functionCallsError);
              console.error('Detail error:', functionCallsError.stack);
            }
          }

          // Kode untuk function call lama telah dinonaktifkan
          // Kita hanya menggunakan functionCalls (metode baru) untuk menangani function calls

          if (chunk.text || (chunk.candidates && chunk.candidates.length > 0)) {
            // Proses chunk teks normal
            try {
              // Coba ekstrak teks dari berbagai sumber
              let chunkText = '';

              console.log('Struktur chunk:', JSON.stringify(chunk, (key, value) => {
                if (typeof value === 'function') return '[Function]';
                return value;
              }, 2).substring(0, 500));

              // Metode 1: Menggunakan chunk.text jika tersedia
              if (chunk.text) {
                if (typeof chunk.text === 'function') {
                  try {
                    chunkText = chunk.text();
                    console.log('Berhasil memanggil fungsi text():', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                  } catch (textFuncError) {
                    console.error('Error saat memanggil fungsi text():', textFuncError);
                    console.error('Detail error:', textFuncError.stack);

                    // Fallback ke String() jika text() gagal
                    try {
                      chunkText = String(chunk.text);
                      console.log('Menggunakan String() sebagai fallback:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                    } catch (stringError) {
                      console.error('Error saat menggunakan String() fallback:', stringError);
                    }
                  }
                } else {
                  chunkText = chunk.text;
                  console.log('Chunk.text adalah string langsung:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                }
              }

              // Metode 2: Ekstrak dari candidates jika text tidak tersedia atau kosong
              if ((!chunkText || chunkText.trim() === '') && chunk.candidates && chunk.candidates.length > 0) {
                console.log('Mencoba ekstrak teks dari candidates');
                try {
                  const candidate = chunk.candidates[0];

                  // Cek berbagai struktur yang mungkin ada di candidates
                  if (candidate.content && candidate.content.parts) {
                    const parts = candidate.content.parts;
                    for (const part of parts) {
                      if (part.text) {
                        if (typeof part.text === 'function') {
                          try {
                            chunkText += part.text();
                          } catch (partTextError) {
                            console.error('Error saat memanggil part.text():', partTextError);
                            chunkText += String(part.text);
                          }
                        } else {
                          chunkText += part.text;
                        }
                      }
                    }
                    console.log('Teks berhasil diekstrak dari candidates.content.parts:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                  } else if (candidate.text) {
                    // Coba ekstrak langsung dari candidate.text
                    if (typeof candidate.text === 'function') {
                      try {
                        chunkText = candidate.text();
                      } catch (candidateTextError) {
                        console.error('Error saat memanggil candidate.text():', candidateTextError);
                        chunkText = String(candidate.text);
                      }
                    } else {
                      chunkText = candidate.text;
                    }
                    console.log('Teks berhasil diekstrak dari candidate.text:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                  } else if (candidate.parts && Array.isArray(candidate.parts)) {
                    // Coba ekstrak dari candidate.parts
                    for (const part of candidate.parts) {
                      if (typeof part === 'string') {
                        chunkText += part;
                      } else if (part && part.text) {
                        if (typeof part.text === 'function') {
                          try {
                            chunkText += part.text();
                          } catch (partTextError) {
                            chunkText += String(part.text);
                          }
                        } else {
                          chunkText += part.text;
                        }
                      }
                    }
                    console.log('Teks berhasil diekstrak dari candidate.parts:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                  }
                } catch (candidatesError) {
                  console.error('Error saat ekstrak dari candidates:', candidatesError);
                }
              }

              // Metode 3: Ekstrak dari response jika ada
              if (!chunkText || chunkText.trim() === '') {
                try {
                  if (chunk.response && chunk.response.text) {
                    if (typeof chunk.response.text === 'function') {
                      try {
                        chunkText = chunk.response.text();
                      } catch (responseTextError) {
                        chunkText = String(chunk.response.text);
                      }
                    } else {
                      chunkText = chunk.response.text;
                    }
                    console.log('Teks berhasil diekstrak dari response.text:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                  }
                } catch (responseError) {
                  console.error('Error saat ekstrak dari response:', responseError);
                }
              }

              // Pastikan chunkText adalah string
              if (typeof chunkText !== 'string') {
                try {
                  chunkText = String(chunkText);
                  console.log('Mengkonversi chunkText ke string:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                } catch (stringError) {
                  console.error('Error saat mengkonversi ke string:', stringError);
                  chunkText = '';
                }
              }

              // Jika masih kosong, coba ekstrak dengan cara lain
              if (!chunkText || chunkText.trim() === '') {
                console.log('Teks masih kosong, mencoba ekstrak dengan cara lain');

                // Coba ekstrak dari JSON.stringify
                try {
                  const stringified = JSON.stringify(chunk);
                  if (stringified.includes('"text":')) {
                    const textMatch = stringified.match(/"text":"([^"]+)"/);
                    if (textMatch && textMatch[1]) {
                      chunkText = textMatch[1];
                      console.log('Teks berhasil diekstrak dari JSON.stringify:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                    }
                  } else if (stringified.includes('"parts":')) {
                    // Coba ekstrak dari parts
                    const partsMatch = stringified.match(/"parts":\s*\[\s*\{\s*"text":\s*"([^"]+)"/);
                    if (partsMatch && partsMatch[1]) {
                      chunkText = partsMatch[1];
                      console.log('Teks berhasil diekstrak dari parts dalam JSON:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
                    }
                  }
                } catch (jsonError) {
                  console.error('Error saat mencoba ekstrak teks dari JSON:', jsonError);
                }
              }

              // Jika masih kosong, gunakan fallback
              if (!chunkText || chunkText.trim() === '') {
                chunkText = 'Tidak dapat mengekstrak teks dari respons Gemini API. Silakan coba lagi.';
                console.log('Menggunakan teks fallback karena teks kosong');
              }

              console.log('Chunk teks berhasil diproses, panjang:', chunkText.length);

              // Kirim chunk ke client dengan properti 'chunk' bukan 'text'
              // Ini untuk memastikan kompatibilitas dengan renderer.js
              onChunk({
                error: false,
                chunk: chunkText, // Gunakan 'chunk' bukan 'text'
                done: false
              });
            } catch (textError) {
              console.error('Error saat memproses chunk teks:', textError);
              console.error('Detail error:', textError.stack);
              console.log('Tipe chunk.text:', typeof chunk.text);
              console.log('Chunk lengkap:', JSON.stringify(chunk, (key, value) => {
                if (typeof value === 'function') return 'function';
                return value;
              }));

              // Coba kirim pesan fallback jika gagal memproses teks
              onChunk({
                error: false,
                chunk: 'Tidak dapat mengekstrak teks dari respons Gemini API',
                done: false
              });
            }
          } else {
            // Jika chunk tidak memiliki properti text atau functionCall
            console.warn('Chunk tidak memiliki properti text atau functionCall:', JSON.stringify(chunk, (key, value) => {
              if (typeof value === 'function') return 'function';
              return value;
            }));

            // Coba ekstrak teks dari chunk dengan cara lain
            try {
              let extractedText = '';

              // Coba berbagai properti yang mungkin berisi teks
              if (chunk.parts && chunk.parts.length > 0) {
                console.log('Mencoba ekstrak teks dari chunk.parts');
                extractedText = chunk.parts.map(part => {
                  if (typeof part === 'string') return part;
                  if (part && part.text) {
                    if (typeof part.text === 'function') {
                      try {
                        return part.text();
                      } catch (textFuncError) {
                        console.error('Error saat memanggil part.text():', textFuncError);
                        return String(part.text);
                      }
                    } else {
                      return part.text;
                    }
                  }
                  return '';
                }).join('');
              } else if (chunk.content) {
                console.log('Mencoba ekstrak teks dari chunk.content');
                if (typeof chunk.content === 'function') {
                  try {
                    extractedText = chunk.content();
                  } catch (contentFuncError) {
                    console.error('Error saat memanggil chunk.content():', contentFuncError);
                    extractedText = String(chunk.content);
                  }
                } else {
                  extractedText = chunk.content;
                }
              } else if (chunk.response && chunk.response.text) {
                console.log('Mencoba ekstrak teks dari chunk.response.text');
                if (typeof chunk.response.text === 'function') {
                  try {
                    extractedText = chunk.response.text();
                  } catch (responseFuncError) {
                    console.error('Error saat memanggil chunk.response.text():', responseFuncError);
                    extractedText = String(chunk.response.text);
                  }
                } else {
                  extractedText = chunk.response.text;
                }
              } else if (chunk.candidates && Array.isArray(chunk.candidates) && chunk.candidates.length > 0) {
                console.log('Mencoba ekstrak teks dari chunk.candidates');
                const candidate = chunk.candidates[0];
                if (candidate.content && candidate.content.parts) {
                  extractedText = candidate.content.parts.map(part => {
                    if (typeof part === 'string') return part;
                    if (part && part.text) {
                      return typeof part.text === 'function' ? part.text() : part.text;
                    }
                    return '';
                  }).join('');
                }
              }

              if (extractedText) {
                console.log('Berhasil mengekstrak teks dari chunk:', extractedText.substring(0, 50) + (extractedText.length > 50 ? '...' : ''));

                onChunk({
                  error: false,
                  chunk: extractedText, // Gunakan 'chunk' bukan 'text'
                  done: false
                });
              } else {
                console.warn('Tidak dapat mengekstrak teks dari chunk');

                // Coba konversi chunk ke string sebagai upaya terakhir
                try {
                  const stringifiedChunk = JSON.stringify(chunk);
                  if (stringifiedChunk && stringifiedChunk !== '{}' && stringifiedChunk !== '[]') {
                    console.log('Menggunakan stringified chunk sebagai fallback');
                    onChunk({
                      error: false,
                      chunk: `[Tidak dapat memproses respons: ${stringifiedChunk}]`,
                      done: false
                    });
                  }
                } catch (stringifyError) {
                  console.error('Error saat stringify chunk:', stringifyError);
                }
              }
            } catch (extractError) {
              console.error('Error saat mencoba mengekstrak teks dari chunk:', extractError);
              console.error('Detail error:', extractError.stack);
            }
          }
        } catch (chunkError) {
          console.error('Error saat memproses chunk:', chunkError);
          console.error('Detail error:', chunkError.stack);
          onChunk({
            error: true,
            message: `Error saat memproses chunk: ${chunkError.message}`,
            done: false
          });
        }
      }

      // Tandai bahwa streaming sudah selesai
      console.log('Streaming selesai, mengirim sinyal done: true');
      logToFile('[BUBBLE_DEBUG] Streaming selesai, mengirim sinyal done: true', 'INFO');

      // Kirim pesan terakhir dengan done=true
      try {
        // Coba dapatkan teks lengkap dari respons
        let finalText = '';

        if (result && result.response) {
          try {
            if (typeof result.response.text === 'function') {
              finalText = result.response.text();
              console.log('Berhasil mendapatkan teks lengkap dari respons.text()');
            } else if (result.response.text) {
              finalText = result.response.text;
              console.log('Berhasil mendapatkan teks lengkap dari respons.text');
            }
          } catch (finalTextError) {
            console.error('Error saat mendapatkan teks lengkap:', finalTextError);
          }
        }

        // Jika berhasil mendapatkan teks lengkap, kirim sebagai chunk terakhir
        if (finalText) {
          console.log('Mengirim teks lengkap sebagai chunk terakhir');
          onChunk({
            error: false,
            chunk: finalText,
            done: true
          });
        } else {
          // Jika tidak berhasil mendapatkan teks lengkap, kirim chunk dengan teks "done"
          // Ini untuk menghindari masalah dengan chunk kosong yang menyebabkan error
          console.log('Mengirim chunk "done" sebagai chunk terakhir');
          onChunk({
            error: false,
            chunk: " ", // Gunakan spasi tunggal sebagai penanda selesai
            done: true
          });
        }
      } catch (finalChunkError) {
        console.error('Error saat mengirim chunk terakhir:', finalChunkError);
        onChunk({
          error: false,
          chunk: " ", // Gunakan spasi tunggal sebagai penanda selesai
          done: true
        });
      }

      logToFile('[BUBBLE_DEBUG] Sinyal done: true berhasil dikirim', 'DEBUG');
    } catch (error) {
      console.error('Error saat mendapatkan respons streaming dari Gemini API:', error);

      // Cek jenis error untuk memberikan pesan yang lebih spesifik
      let errorMessage = 'Terjadi kesalahan saat berkomunikasi dengan Gemini API';

      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'API key tidak valid atau telah kedaluwarsa';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Kuota API telah habis';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit terlampaui, coba lagi nanti';
        } else if (error.message.includes('network')) {
          errorMessage = 'Masalah koneksi jaringan, periksa koneksi internet Anda';
        } else {
          errorMessage = error.message;
        }
      }

      onChunk({
        error: true,
        message: `Error: ${errorMessage}`,
        originalError: error.message,
        done: true
      });
    }
  }

  // Reset chat session
  resetChat() {
    if (this.initialized) {
      this.chatSession = this.modelInstance.startChat({
        history: []
      });
      return true;
    }
    return false;
  }

  // Cek status inisialisasi
  isInitialized() {
    return this.initialized;
  }

  // Analisis gambar menggunakan Gemini API
  async analyzeImage(imageData) {
    if (!this.initialized) {
      if (!this.initialize()) {
        return {
          error: true,
          message: 'Gemini API belum diinisialisasi. Pastikan API key sudah diatur dengan benar.'
        };
      }
    }

    try {
      // Pastikan model yang digunakan mendukung input gambar
      // Gemini 1.5 mendukung input multimodal
      if (!this.model.includes('gemini-1.5')) {
        console.log('Model saat ini tidak mendukung input gambar, beralih ke gemini-1.5-pro-latest');

        // Simpan model saat ini
        const currentModel = this.model;

        // Beralih ke model yang mendukung input gambar
        this.model = 'gemini-1.5-pro-latest';

        // Inisialisasi ulang dengan model baru
        const initResult = this.initialize();

        if (!initResult) {
          // Kembalikan ke model sebelumnya jika gagal
          this.model = currentModel;
          this.initialize();

          return {
            error: true,
            message: 'Gagal beralih ke model yang mendukung input gambar'
          };
        }
      }

      // Buat model vision untuk analisis gambar
      const visionModel = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: config.gemini.temperature,
          maxOutputTokens: config.gemini.maxOutputTokens,
          topK: config.gemini.topK,
          topP: config.gemini.topP
        },
        safetySettings: config.gemini.safetySettings
      });

      // Buat prompt untuk analisis gambar
      const prompt = config.camera.analysisPrompt || 'Deskripsikan apa yang Anda lihat dalam gambar ini secara detail.';

      // Buat input multimodal dengan gambar dan prompt
      const imageParts = [
        {
          inlineData: {
            data: imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
            mimeType: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
          }
        },
        {
          text: prompt
        }
      ];

      // Analisis gambar
      console.log('Menganalisis gambar dengan prompt:', prompt);
      const result = await visionModel.generateContent({
        contents: [{ role: 'user', parts: imageParts }]
      });

      const response = result.response;

      return {
        error: false,
        text: response.text(),
        candidates: response.candidates
      };
    } catch (error) {
      console.error('Error saat menganalisis gambar:', error);
      return {
        error: true,
        message: `Error: ${error.message || 'Terjadi kesalahan saat menganalisis gambar'}`
      };
    }
  }
}

// Buat instance singleton
const geminiService = new GeminiService();

module.exports = geminiService;
