// Voice Button Manager
// Menangani interaksi dengan tombol mikrofon

document.addEventListener('DOMContentLoaded', () => {
  // Dapatkan elemen-elemen UI
  const voiceBtn = document.getElementById('voice-btn');
  const voiceButtonIcon = document.querySelector('.voice-button-icon');
  const voiceButtonIndicator = document.querySelector('.voice-button-indicator');
  const micIcon = document.querySelector('.mic-icon');
  const micOffIcon = document.querySelector('.mic-off-icon');
  const voiceVisualizer = document.getElementById('voice-visualizer');
  const visualizerCanvas = document.getElementById('visualizer-canvas');
  
  // Variabel state
  let isListening = false;
  let isMuted = false;
  let voiceInteraction = null;
  
  // Inisialisasi
  function initialize() {
    // Dapatkan referensi ke instance VoiceInteraction
    if (window.voiceInteraction) {
      voiceInteraction = window.voiceInteraction;
      console.log('Voice button: Connected to VoiceInteraction instance');
    } else {
      console.error('Voice button: VoiceInteraction instance not found');
    }
    
    // Tambahkan event listener untuk tombol mikrofon
    if (voiceBtn) {
      voiceBtn.addEventListener('click', toggleVoiceInput);
    }
    
    // Periksa status awal
    updateButtonState();
  }
  
  // Toggle voice input
  function toggleVoiceInput() {
    if (!voiceInteraction) {
      console.error('Voice button: Cannot toggle voice input, VoiceInteraction not available');
      return;
    }
    
    if (isMuted) {
      // Unmute
      voiceInteraction.unmute();
      isMuted = false;
    } else if (isListening) {
      // Mute
      voiceInteraction.mute();
      isMuted = true;
    } else {
      // Start
      voiceInteraction.start();
    }
    
    // Update UI
    updateButtonState();
  }
  
  // Update button state
  function updateButtonState() {
    if (!voiceBtn) return;
    
    if (isMuted) {
      // Muted state
      voiceBtn.classList.add('muted');
      voiceBtn.classList.remove('active');
      
      if (voiceButtonIndicator) {
        voiceButtonIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        voiceButtonIndicator.style.opacity = '1';
      }
    } else if (isListening) {
      // Active state
      voiceBtn.classList.add('active');
      voiceBtn.classList.remove('muted');
      
      if (voiceButtonIndicator) {
        voiceButtonIndicator.style.backgroundColor = 'var(--accent-color)';
        voiceButtonIndicator.style.opacity = '1';
      }
    } else {
      // Inactive state
      voiceBtn.classList.remove('active', 'muted');
      
      if (voiceButtonIndicator) {
        voiceButtonIndicator.style.opacity = '0';
      }
    }
  }
  
  // Fungsi untuk menampilkan visualizer
  function showVisualizer() {
    if (voiceVisualizer) {
      voiceVisualizer.classList.add('active');
    }
  }
  
  // Fungsi untuk menyembunyikan visualizer
  function hideVisualizer() {
    if (voiceVisualizer) {
      voiceVisualizer.classList.remove('active');
    }
  }
  
  // Fungsi untuk menangani event dari VoiceInteraction
  function setupVoiceInteractionEvents() {
    if (!voiceInteraction) return;
    
    // Listening start
    const originalOnListeningStart = voiceInteraction.callbacks.onListeningStart;
    voiceInteraction.callbacks.onListeningStart = () => {
      isListening = true;
      updateButtonState();
      showVisualizer();
      
      // Call original callback if exists
      if (originalOnListeningStart) {
        originalOnListeningStart();
      }
    };
    
    // Listening stop
    const originalOnListeningStop = voiceInteraction.callbacks.onListeningStop;
    voiceInteraction.callbacks.onListeningStop = () => {
      isListening = false;
      updateButtonState();
      hideVisualizer();
      
      // Call original callback if exists
      if (originalOnListeningStop) {
        originalOnListeningStop();
      }
    };
    
    // Mute change
    const originalOnMuteChange = voiceInteraction.callbacks.onMuteChange;
    voiceInteraction.callbacks.onMuteChange = (muted) => {
      isMuted = muted;
      updateButtonState();
      
      // Call original callback if exists
      if (originalOnMuteChange) {
        originalOnMuteChange(muted);
      }
    };
  }
  
  // Fungsi untuk menginisialisasi visualizer
  function initializeVisualizer() {
    if (!visualizerCanvas) return;
    
    const context = visualizerCanvas.getContext('2d');
    
    // Resize canvas
    function resizeCanvas() {
      if (visualizerCanvas) {
        visualizerCanvas.width = visualizerCanvas.offsetWidth;
        visualizerCanvas.height = visualizerCanvas.offsetHeight;
      }
    }
    
    // Resize pada load dan saat window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  // Tunggu hingga VoiceInteraction tersedia
  function waitForVoiceInteraction() {
    if (window.voiceInteraction) {
      voiceInteraction = window.voiceInteraction;
      setupVoiceInteractionEvents();
      console.log('Voice button: Connected to VoiceInteraction instance');
    } else {
      // Coba lagi setelah 500ms
      setTimeout(waitForVoiceInteraction, 500);
    }
  }
  
  // Inisialisasi
  initializeVisualizer();
  waitForVoiceInteraction();
});
