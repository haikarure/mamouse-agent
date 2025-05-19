// Voice Bubble Handler
// Menangani animasi dan interaksi bubble chat untuk fitur suara

document.addEventListener('DOMContentLoaded', () => {
  // Variabel untuk menyimpan state
  let isAIResponding = false;
  let currentAIBubble = null;
  let currentWordIndex = 0;
  let wordElements = [];
  let speakingInterval = null;

  // Dapatkan elemen-elemen UI
  const bubbleContentArea = document.getElementById('bubble-content-area');
  const statusIndicator = document.getElementById('status-indicator');
  const statusIndicatorText = document.getElementById('status-indicator-text');
  const statusIndicatorIcon = document.getElementById('status-indicator-icon');

  // Event listener untuk voice typing
  document.addEventListener('voice-typing', (event) => {
    const { text, timestamp } = event.detail;

    // Cari bubble typing yang sudah ada
    let typingBubble = document.querySelector('.bubble.user.voice-typing');

    if (!typingBubble) {
      // Buat bubble baru jika belum ada
      typingBubble = createTypingBubble(text, timestamp);
      if (bubbleContentArea) {
        bubbleContentArea.appendChild(typingBubble);
        scrollToBottom();
      }
    } else {
      // Update teks jika bubble sudah ada
      const bubbleContent = typingBubble.querySelector('.bubble-content');
      if (bubbleContent) {
        bubbleContent.textContent = text;
      }
    }
  });

  // Event listener untuk voice command
  document.addEventListener('voice-command', (event) => {
    const { text, timestamp } = event.detail;

    // Hapus bubble typing yang ada
    const typingBubble = document.querySelector('.bubble.user.voice-typing');
    if (typingBubble && typingBubble.parentNode) {
      typingBubble.parentNode.removeChild(typingBubble);
    }

    // Buat bubble command baru
    const commandBubble = createCommandBubble(text, timestamp);
    if (bubbleContentArea) {
      bubbleContentArea.appendChild(commandBubble);
      scrollToBottom();
    }
  });

  // Event listener untuk AI responding
  document.addEventListener('ai-responding', () => {
    isAIResponding = true;

    // Update status indicator
    if (statusIndicator && statusIndicatorText) {
      statusIndicator.classList.remove('listening', 'processing', 'error', 'success');
      statusIndicator.classList.add('ai-responding', 'show');
      statusIndicatorText.textContent = 'AI is responding...';
    }
  });

  // Event listener untuk AI response
  document.addEventListener('ai-response', (event) => {
    const { text, timestamp } = event.detail;

    // Buat bubble response baru
    currentAIBubble = createAIResponseBubble(text, timestamp);
    if (bubbleContentArea) {
      bubbleContentArea.appendChild(currentAIBubble);
      scrollToBottom();
    }

    // Mulai animasi speaking
    startSpeakingAnimation(text);

    // Reset state
    isAIResponding = false;

    // Sembunyikan status indicator setelah beberapa detik
    setTimeout(() => {
      if (statusIndicator) {
        statusIndicator.classList.remove('show');
      }
    }, 3000);
  });

  // Fungsi untuk membuat bubble typing
  function createTypingBubble(text, timestamp) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble user voice-typing';
    bubble.dataset.timestamp = timestamp;

    const bubbleContent = document.createElement('div');
    bubbleContent.className = 'bubble-content';
    bubbleContent.textContent = text;

    bubble.appendChild(bubbleContent);
    return bubble;
  }

  // Fungsi untuk membuat bubble command
  function createCommandBubble(text, timestamp) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble user voice-bubble';
    bubble.dataset.timestamp = timestamp;

    const bubbleContent = document.createElement('div');
    bubbleContent.className = 'bubble-content';
    bubbleContent.textContent = text;

    bubble.appendChild(bubbleContent);
    return bubble;
  }

  // Fungsi untuk membuat bubble AI response
  function createAIResponseBubble(text, timestamp) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble ai voice-response speaking';
    bubble.dataset.timestamp = timestamp;

    const bubbleContent = document.createElement('div');
    bubbleContent.className = 'bubble-content';

    // Pisahkan teks menjadi kata-kata
    const words = text.split(' ');
    wordElements = [];

    // Buat elemen untuk setiap kata
    words.forEach((word, index) => {
      const wordElement = document.createElement('span');
      wordElement.className = 'word';
      wordElement.textContent = word + ' ';
      wordElement.style.animationDelay = `${index * 0.05}s`;
      bubbleContent.appendChild(wordElement);
      wordElements.push(wordElement);
    });

    bubble.appendChild(bubbleContent);
    return bubble;
  }

  // Fungsi untuk memulai animasi speaking
  function startSpeakingAnimation(bubble, words) {
    // Reset state
    currentWordIndex = 0;

    // Dapatkan semua elemen kata
    const wordElements = bubble.querySelectorAll('.word');

    // Bersihkan interval yang ada
    if (speakingInterval) {
      clearInterval(speakingInterval);
    }

    // Mulai interval baru
    speakingInterval = setInterval(() => {
      // Hapus class current dari semua kata
      wordElements.forEach(word => word.classList.remove('current'));

      // Tambahkan class current ke kata saat ini
      if (currentWordIndex < wordElements.length) {
        wordElements[currentWordIndex].classList.add('current');
        currentWordIndex++;

        // Tambahkan efek suara untuk setiap kata (opsional)
        if (Math.random() > 0.7) { // Hanya mainkan efek suara untuk beberapa kata
          playWordSound();
        }
      } else {
        // Selesai speaking
        clearInterval(speakingInterval);
        speakingInterval = null;

        // Hapus class speaking dari bubble
        bubble.classList.remove('speaking');

        // Tambahkan class completed
        bubble.classList.add('voice-completed');

        // Tambahkan efek akhir
        addCompletionEffect(bubble);
      }
    }, 150); // Kecepatan speaking yang lebih cepat
  }

  // Fungsi untuk memainkan efek suara kata
  function playWordSound() {
    // Implementasi sederhana untuk efek suara
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Atur jenis dan frekuensi oscillator
      oscillator.type = 'sine';
      oscillator.frequency.value = 440 + Math.random() * 220; // Random frequency

      // Atur volume (sangat kecil)
      gainNode.gain.value = 0.01;

      // Hubungkan node
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Mulai dan hentikan oscillator
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.error('Error playing word sound:', error);
    }
  }

  // Fungsi untuk menambahkan efek setelah selesai speaking
  function addCompletionEffect(bubble) {
    // Tambahkan efek kilau setelah selesai
    const glowEffect = document.createElement('div');
    glowEffect.className = 'completion-glow';
    bubble.appendChild(glowEffect);

    // Hapus efek setelah animasi selesai
    setTimeout(() => {
      if (bubble.contains(glowEffect)) {
        bubble.removeChild(glowEffect);
      }
    }, 1000);
  }

  // Fungsi untuk scroll ke bawah
  function scrollToBottom() {
    if (bubbleContentArea) {
      bubbleContentArea.scrollTop = bubbleContentArea.scrollHeight;
    }
  }

  // Tambahkan event listener untuk respons AI dari renderer.js
  // Ini hanya untuk demo, seharusnya terintegrasi dengan sistem yang ada
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ai-response') {
      const aiResponseEvent = new CustomEvent('ai-response', {
        detail: {
          text: event.data.text,
          timestamp: new Date().toISOString()
        }
      });
      document.dispatchEvent(aiResponseEvent);
    }
  });

  // Patch untuk showMessage di standalone-bubble.js
  // Ini akan menambahkan class voice-response ke bubble AI jika sedang dalam mode voice
  const originalShowMessage = window.standaloneBubble.showMessage;
  if (originalShowMessage) {
    window.standaloneBubble.showMessage = function(message) {
      // Jika message adalah respons AI dan sedang dalam mode voice
      if (!message.isUser && isAIResponding) {
        console.log('Voice bubble handler: AI responding, intercepting message', message);

        // Dispatch custom event untuk AI response
        const aiResponseEvent = new CustomEvent('ai-response', {
          detail: {
            text: message.text,
            timestamp: message.timestamp || new Date().toISOString()
          }
        });
        document.dispatchEvent(aiResponseEvent);

        // Tambahkan flag untuk menandai ini adalah voice response
        message.isVoice = true;

        // Panggil fungsi asli dengan flag tambahan
        const bubble = originalShowMessage(message);

        // Tambahkan class voice-response dan speaking
        if (bubble) {
          bubble.classList.add('voice-response', 'speaking');
        }

        return bubble;
      }

      // Panggil fungsi asli untuk kasus lainnya
      return originalShowMessage(message);
    };
  }

  // Patch untuk createStandaloneBubble di standalone-bubble.js
  // Ini akan menambahkan animasi kata per kata untuk bubble AI voice response
  const originalCreateStandaloneBubble = window.createStandaloneBubble;
  if (originalCreateStandaloneBubble) {
    window.createStandaloneBubble = function(message, isTypingIndicator) {
      // Jika message adalah voice response
      if (message && message.isVoice && !message.isUser && !isTypingIndicator) {
        console.log('Voice bubble handler: Creating voice response bubble', message);

        // Buat bubble dengan fungsi asli
        const bubble = originalCreateStandaloneBubble(message, isTypingIndicator);

        if (bubble) {
          // Tambahkan class voice-response dan speaking
          bubble.classList.add('voice-response', 'speaking');

          // Dapatkan elemen konten
          const content = bubble.querySelector('.bubble-content');
          if (content) {
            // Simpan teks asli
            const originalText = content.textContent || content.innerHTML;

            // Kosongkan konten
            content.innerHTML = '';

            // Pisahkan teks menjadi kata-kata
            const words = originalText.split(' ');

            // Buat elemen untuk setiap kata
            words.forEach((word, index) => {
              const wordElement = document.createElement('span');
              wordElement.className = 'word';
              wordElement.textContent = word + ' ';
              wordElement.style.animationDelay = `${index * 0.05}s`;
              content.appendChild(wordElement);
            });

            // Mulai animasi speaking
            setTimeout(() => {
              startSpeakingAnimation(bubble, words);
            }, 100);
          }
        }

        return bubble;
      }

      // Panggil fungsi asli untuk kasus lainnya
      return originalCreateStandaloneBubble(message, isTypingIndicator);
    };
  }
});
