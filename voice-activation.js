// Voice Activation System untuk Mamouse Agent
// Implementasi wake word detection menggunakan Web Speech API

class VoiceActivation {
  constructor(options = {}) {
    // Konfigurasi default
    this.options = {
      wakeWords: ['hey mamouse', 'hai mamouse', 'halo mamouse', 'ok mamouse'],
      language: 'id-ID',
      sensitivity: 0.7, // Sensitivitas deteksi (0.0 - 1.0)
      continuousListening: true, // Terus mendengarkan setelah wake word terdeteksi
      autoRestart: true, // Otomatis restart jika recognition berhenti
      maxRestarts: 5, // Maksimum jumlah restart otomatis
      restartDelay: 300, // Delay sebelum restart (ms)
      ...options
    };

    // State
    this.isListening = false;
    this.isActivated = false;
    this.recognition = null;
    this.restartCount = 0;
    this.lastRestartTime = 0;
    this.commandTimeout = null;
    this.callbacks = {
      onWakeWordDetected: null,
      onCommandDetected: null,
      onListeningStart: null,
      onListeningStop: null,
      onError: null
    };

    // Inisialisasi
    this.initialize();
  }

  // Inisialisasi voice activation
  initialize() {
    // Periksa dukungan Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition tidak didukung di browser ini');
      if (this.callbacks.onError) {
        this.callbacks.onError('Speech recognition tidak didukung di browser ini');
      }
      return false;
    }

    // Buat instance SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Konfigurasi recognition
    this.recognition.continuous = this.options.continuousListening;
    this.recognition.interimResults = true;
    this.recognition.lang = this.options.language;

    // Event handlers
    this.setupEventHandlers();

    return true;
  }

  // Setup event handlers untuk recognition
  setupEventHandlers() {
    // Event saat recognition dimulai
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice activation: Listening started');
      if (this.callbacks.onListeningStart) {
        this.callbacks.onListeningStart();
      }
    };

    // Event saat recognition berhenti
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice activation: Listening stopped');
      
      if (this.callbacks.onListeningStop) {
        this.callbacks.onListeningStop();
      }

      // Auto restart jika diperlukan
      if (this.options.autoRestart && !this.isActivated) {
        this.handleAutoRestart();
      }
    };

    // Event saat ada hasil recognition
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript.toLowerCase().trim())
        .join(' ');

      console.log('Voice activation transcript:', transcript);

      // Jika belum diaktifkan, periksa wake word
      if (!this.isActivated) {
        this.checkWakeWord(transcript);
      } 
      // Jika sudah diaktifkan, tangkap perintah
      else {
        this.handleCommand(transcript, event.results[0].isFinal);
      }
    };

    // Event saat terjadi error
    this.recognition.onerror = (event) => {
      console.error('Voice activation error:', event.error);
      
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }

      // Restart jika error no-speech atau network
      if (['no-speech', 'network'].includes(event.error) && this.options.autoRestart) {
        this.handleAutoRestart();
      }
    };
  }

  // Mulai mendengarkan
  start() {
    if (this.isListening) return;

    try {
      this.recognition.start();
      this.restartCount = 0;
      console.log('Voice activation started');
      return true;
    } catch (error) {
      console.error('Error starting voice activation:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error.message || 'Error starting voice activation');
      }
      return false;
    }
  }

  // Berhenti mendengarkan
  stop() {
    if (!this.isListening) return;

    try {
      this.recognition.stop();
      this.isActivated = false;
      console.log('Voice activation stopped');
      return true;
    } catch (error) {
      console.error('Error stopping voice activation:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error.message || 'Error stopping voice activation');
      }
      return false;
    }
  }

  // Periksa apakah transcript mengandung wake word
  checkWakeWord(transcript) {
    const wakeWords = this.options.wakeWords;
    
    // Periksa setiap wake word
    for (const wakeWord of wakeWords) {
      if (transcript.includes(wakeWord)) {
        this.handleWakeWordDetected(wakeWord, transcript);
        return;
      }
    }
  }

  // Handler saat wake word terdeteksi
  handleWakeWordDetected(wakeWord, transcript) {
    console.log(`Wake word detected: "${wakeWord}"`);
    this.isActivated = true;

    // Panggil callback
    if (this.callbacks.onWakeWordDetected) {
      this.callbacks.onWakeWordDetected(wakeWord, transcript);
    }

    // Jika continuous listening dinonaktifkan, stop dan restart recognition
    if (!this.options.continuousListening) {
      this.stop();
      setTimeout(() => {
        this.start();
      }, 500);
    }

    // Set timeout untuk reset aktivasi jika tidak ada perintah
    this.resetCommandTimeout();
  }

  // Handler untuk perintah setelah wake word
  handleCommand(transcript, isFinal) {
    // Reset timeout setiap kali ada input
    this.resetCommandTimeout();

    // Jika hasil final, kirim perintah
    if (isFinal) {
      console.log(`Command detected: "${transcript}"`);
      
      // Panggil callback
      if (this.callbacks.onCommandDetected) {
        this.callbacks.onCommandDetected(transcript);
      }

      // Reset aktivasi setelah perintah terdeteksi
      this.isActivated = false;
    }
  }

  // Reset timeout untuk menunggu perintah
  resetCommandTimeout() {
    // Clear timeout yang ada
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
    }

    // Set timeout baru
    this.commandTimeout = setTimeout(() => {
      console.log('Command timeout, resetting activation');
      this.isActivated = false;
    }, 10000); // 10 detik timeout
  }

  // Handler untuk auto restart
  handleAutoRestart() {
    const now = Date.now();
    const timeSinceLastRestart = now - this.lastRestartTime;

    // Jika restart terlalu cepat, tambah counter
    if (timeSinceLastRestart < 1000) {
      this.restartCount++;
    } else {
      this.restartCount = 0;
    }

    // Jika belum mencapai batas restart, coba restart
    if (this.restartCount < this.options.maxRestarts) {
      console.log(`Auto-restarting voice activation (attempt ${this.restartCount + 1}/${this.options.maxRestarts})`);
      this.lastRestartTime = now;
      
      setTimeout(() => {
        if (!this.isListening) {
          this.start();
        }
      }, this.options.restartDelay);
    } else {
      console.error(`Maximum restart attempts (${this.options.maxRestarts}) reached, stopping auto-restart`);
      if (this.callbacks.onError) {
        this.callbacks.onError('Maximum restart attempts reached');
      }
    }
  }

  // Set callback untuk wake word detection
  onWakeWordDetected(callback) {
    this.callbacks.onWakeWordDetected = callback;
    return this;
  }

  // Set callback untuk command detection
  onCommandDetected(callback) {
    this.callbacks.onCommandDetected = callback;
    return this;
  }

  // Set callback untuk listening start
  onListeningStart(callback) {
    this.callbacks.onListeningStart = callback;
    return this;
  }

  // Set callback untuk listening stop
  onListeningStop(callback) {
    this.callbacks.onListeningStop = callback;
    return this;
  }

  // Set callback untuk error
  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  // Ubah bahasa
  setLanguage(language) {
    this.options.language = language;
    this.recognition.lang = language;
    return this;
  }

  // Ubah wake words
  setWakeWords(wakeWords) {
    if (Array.isArray(wakeWords)) {
      this.options.wakeWords = wakeWords.map(word => word.toLowerCase());
    }
    return this;
  }

  // Tambah wake word
  addWakeWord(wakeWord) {
    if (typeof wakeWord === 'string') {
      this.options.wakeWords.push(wakeWord.toLowerCase());
    }
    return this;
  }
}

// Export class
window.VoiceActivation = VoiceActivation;
