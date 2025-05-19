// Voice Interaction System
// Menangani interaksi suara, termasuk speech recognition dan text-to-speech

class VoiceInteraction {
  constructor(options = {}) {
    // Konfigurasi default
    this.options = {
      wakeWords: ['hey mamouse', 'hai mamouse', 'halo mamouse', 'ok mamouse'],
      language: 'id-ID',
      sensitivity: 0.7,
      continuousListening: true,
      autoRestart: true,
      maxRestarts: 5,
      restartDelay: 300,
      conversationTimeout: 10000, // 10 detik
      autoRespond: true,
      saveConversation: false,
      conversationFolder: '',
      ...options
    };

    // State
    this.isListening = false;
    this.isMuted = false;
    this.isWakeWordDetected = false;
    this.isProcessingVoice = false;
    this.recognition = null;
    this.restartCount = 0;
    this.lastRestartTime = 0;
    this.commandTimeout = null;
    this.conversationTimeoutId = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.visualizerCanvas = null;
    this.visualizerContext = null;
    this.visualizerData = null;
    this.animationFrame = null;
    this.currentConversation = [];
    this.voiceButton = document.getElementById('voice-btn');
    this.voiceVisualizer = document.getElementById('voice-visualizer');
    this.visualizerCanvas = document.getElementById('visualizer-canvas');
    this.statusIndicator = document.getElementById('status-indicator');
    this.statusIndicatorText = document.getElementById('status-indicator-text');
    this.messageInput = document.getElementById('message-input');
    this.messageForm = document.getElementById('message-form');

    // Callbacks
    this.callbacks = {
      onWakeWordDetected: null,
      onCommandDetected: null,
      onListeningStart: null,
      onListeningStop: null,
      onSpeechResult: null,
      onError: null,
      onMuteChange: null,
      onConversationEnd: null
    };

    // Inisialisasi
    this.initialize();
  }

  // Inisialisasi voice interaction
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

    // Setup event handlers
    this.setupEventHandlers();
    this.setupVoiceButton();
    this.setupVisualizer();

    return true;
  }

  // Setup event handlers untuk recognition
  setupEventHandlers() {
    // Event saat recognition dimulai
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice interaction: Listening started');
      
      // Update UI
      if (this.voiceButton) {
        this.voiceButton.classList.add('active');
      }
      
      if (this.voiceVisualizer) {
        this.voiceVisualizer.classList.add('active');
      }
      
      this.showStatusIndicator('listening', 'Listening...');
      
      // Start visualizer
      this.startVisualizer();
      
      if (this.callbacks.onListeningStart) {
        this.callbacks.onListeningStart();
      }
    };

    // Event saat recognition berhenti
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice interaction: Listening stopped');
      
      // Update UI
      if (this.voiceButton) {
        this.voiceButton.classList.remove('active');
      }
      
      if (this.voiceVisualizer) {
        this.voiceVisualizer.classList.remove('active');
      }
      
      this.hideStatusIndicator();
      
      // Stop visualizer
      this.stopVisualizer();
      
      if (this.callbacks.onListeningStop) {
        this.callbacks.onListeningStop();
      }

      // Auto restart jika diperlukan
      if (this.options.autoRestart && !this.isMuted && !this.isWakeWordDetected) {
        this.handleAutoRestart();
      }
    };

    // Event saat ada hasil recognition
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript.toLowerCase().trim())
        .join(' ');

      console.log('Voice interaction transcript:', transcript);

      // Jika belum diaktifkan, periksa wake word
      if (!this.isWakeWordDetected && this.options.wakeWords.some(word => transcript.includes(word))) {
        this.handleWakeWordDetected(transcript);
      } 
      // Jika sudah diaktifkan, tangkap perintah
      else if (this.isWakeWordDetected) {
        this.handleCommand(transcript, event.results[0].isFinal);
      }
      
      // Callback untuk hasil speech
      if (this.callbacks.onSpeechResult) {
        this.callbacks.onSpeechResult(transcript, event.results[0].isFinal);
      }
    };

    // Event saat terjadi error
    this.recognition.onerror = (event) => {
      console.error('Voice interaction error:', event.error);
      
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }

      // Restart jika error no-speech atau network
      if (['no-speech', 'network'].includes(event.error) && this.options.autoRestart && !this.isMuted) {
        this.handleAutoRestart();
      }
    };
  }

  // Setup tombol voice
  setupVoiceButton() {
    if (this.voiceButton) {
      this.voiceButton.addEventListener('click', () => {
        if (this.isMuted) {
          this.unmute();
        } else if (this.isListening) {
          this.mute();
        } else {
          this.start();
        }
      });
    }
  }

  // Setup visualizer
  setupVisualizer() {
    if (!this.visualizerCanvas) return;
    
    this.visualizerContext = this.visualizerCanvas.getContext('2d');
    
    // Resize canvas
    const resizeCanvas = () => {
      if (this.visualizerCanvas) {
        this.visualizerCanvas.width = this.visualizerCanvas.offsetWidth;
        this.visualizerCanvas.height = this.visualizerCanvas.offsetHeight;
      }
    };
    
    // Resize pada load dan saat window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  // Mulai visualizer
  startVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerContext) return;
    
    // Buat audio context jika belum ada
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.visualizerData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Minta akses mikrofon
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            this.drawVisualizer();
          })
          .catch(err => {
            console.error('Error accessing microphone:', err);
          });
      } catch (err) {
        console.error('Error creating audio context:', err);
      }
    } else {
      this.drawVisualizer();
    }
  }

  // Gambar visualizer
  drawVisualizer() {
    if (!this.analyser || !this.visualizerContext || !this.visualizerCanvas) return;
    
    this.analyser.getByteFrequencyData(this.visualizerData);
    
    const width = this.visualizerCanvas.width;
    const height = this.visualizerCanvas.height;
    const barWidth = width / this.analyser.frequencyBinCount * 2.5;
    const barSpacing = 1;
    
    this.visualizerContext.clearRect(0, 0, width, height);
    
    // Gradient untuk bar
    const gradient = this.visualizerContext.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 150, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 50, 255, 0.6)');
    
    // Gambar bar
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      const barHeight = this.visualizerData[i] / 255 * height * 0.8;
      const x = i * (barWidth + barSpacing) + width / 2 - (this.analyser.frequencyBinCount * (barWidth + barSpacing)) / 2;
      const y = height - barHeight;
      
      this.visualizerContext.fillStyle = gradient;
      this.visualizerContext.fillRect(x, y, barWidth, barHeight);
    }
    
    // Animasi frame
    this.animationFrame = requestAnimationFrame(() => this.drawVisualizer());
  }

  // Stop visualizer
  stopVisualizer() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.visualizerContext && this.visualizerCanvas) {
      this.visualizerContext.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);
    }
  }

  // Tampilkan status indicator
  showStatusIndicator(type, message, duration = 0) {
    if (!this.statusIndicator || !this.statusIndicatorText) return;
    
    // Remove all status classes
    this.statusIndicator.classList.remove('listening', 'processing', 'error', 'success');
    
    // Add the appropriate class
    this.statusIndicator.classList.add(type);
    this.statusIndicator.classList.add('show');
    
    // Set the message
    this.statusIndicatorText.textContent = message;
    
    // Hide after duration if specified
    if (duration > 0) {
      setTimeout(() => {
        this.hideStatusIndicator();
      }, duration);
    }
  }

  // Sembunyikan status indicator
  hideStatusIndicator() {
    if (!this.statusIndicator) return;
    this.statusIndicator.classList.remove('show');
  }

  // Mulai mendengarkan
  start() {
    if (this.isListening) return;

    try {
      this.recognition.start();
      this.restartCount = 0;
      this.isMuted = false;
      
      if (this.voiceButton) {
        this.voiceButton.classList.remove('muted');
      }
      
      console.log('Voice interaction started');
      return true;
    } catch (error) {
      console.error('Error starting voice interaction:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error.message || 'Error starting voice interaction');
      }
      return false;
    }
  }

  // Berhenti mendengarkan
  stop() {
    if (!this.isListening) return;

    try {
      this.recognition.stop();
      this.isWakeWordDetected = false;
      console.log('Voice interaction stopped');
      return true;
    } catch (error) {
      console.error('Error stopping voice interaction:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error.message || 'Error stopping voice interaction');
      }
      return false;
    }
  }

  // Mute mikrofon
  mute() {
    this.isMuted = true;
    this.stop();
    
    if (this.voiceButton) {
      this.voiceButton.classList.add('muted');
    }
    
    if (this.callbacks.onMuteChange) {
      this.callbacks.onMuteChange(true);
    }
    
    console.log('Voice interaction muted');
  }

  // Unmute mikrofon
  unmute() {
    this.isMuted = false;
    this.start();
    
    if (this.voiceButton) {
      this.voiceButton.classList.remove('muted');
    }
    
    if (this.callbacks.onMuteChange) {
      this.callbacks.onMuteChange(false);
    }
    
    console.log('Voice interaction unmuted');
  }

  // Handler saat wake word terdeteksi
  handleWakeWordDetected(transcript) {
    console.log('Wake word detected in:', transcript);
    this.isWakeWordDetected = true;
    
    // Update UI
    this.showStatusIndicator('listening', 'Listening for command...');
    
    // Panggil callback
    if (this.callbacks.onWakeWordDetected) {
      this.callbacks.onWakeWordDetected(transcript);
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
      
      // Tambahkan ke conversation
      this.currentConversation.push({
        role: 'user',
        text: transcript,
        timestamp: new Date().toISOString()
      });
      
      // Tampilkan di input
      if (this.messageInput) {
        this.messageInput.value = transcript;
      }
      
      // Kirim perintah
      if (this.options.autoRespond && this.messageForm) {
        this.messageForm.dispatchEvent(new Event('submit'));
      }
      
      // Panggil callback
      if (this.callbacks.onCommandDetected) {
        this.callbacks.onCommandDetected(transcript);
      }
      
      // Reset aktivasi setelah perintah terdeteksi
      this.isWakeWordDetected = false;
      
      // Set timeout untuk akhir percakapan
      this.setConversationTimeout();
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
      this.isWakeWordDetected = false;
      this.showStatusIndicator('info', 'Waiting for wake word...', 3000);
    }, 10000); // 10 detik timeout
  }

  // Set timeout untuk akhir percakapan
  setConversationTimeout() {
    // Clear timeout yang ada
    if (this.conversationTimeoutId) {
      clearTimeout(this.conversationTimeoutId);
    }
    
    // Set timeout baru
    this.conversationTimeoutId = setTimeout(() => {
      console.log('Conversation timeout, ending conversation');
      
      // Simpan percakapan jika diaktifkan
      if (this.options.saveConversation && this.currentConversation.length > 0) {
        this.saveConversationToFile();
      }
      
      // Reset percakapan
      this.currentConversation = [];
      
      // Panggil callback
      if (this.callbacks.onConversationEnd) {
        this.callbacks.onConversationEnd();
      }
    }, this.options.conversationTimeout);
  }

  // Simpan percakapan ke file
  saveConversationToFile() {
    // Implementasi penyimpanan percakapan
    console.log('Saving conversation:', this.currentConversation);
    
    // TODO: Implementasi penyimpanan ke file
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
      console.log(`Auto-restarting voice interaction (attempt ${this.restartCount + 1}/${this.options.maxRestarts})`);
      this.lastRestartTime = now;
      
      setTimeout(() => {
        if (!this.isListening && !this.isMuted) {
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
}
