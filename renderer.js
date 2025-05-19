// Renderer process
// Gunakan window.electronAPI yang diekspos dari preload.js untuk keamanan

// DOM Elements
const minimizeBtn = document.getElementById('window-minimize-btn');
const closeBtn = document.getElementById('window-close-btn');
const connectionStatus = document.getElementById('connection-status');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const menuBtn = document.getElementById('menu-btn');
const slideMenu = document.getElementById('slide-menu');
const closeMenuBtn = document.getElementById('close-menu-btn');
const inputContainer = document.getElementById('input-container');
const voiceVisualizer = document.getElementById('voice-visualizer');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const menuItems = document.querySelectorAll('.menu-item');
const menuSections = document.querySelectorAll('.menu-section');
const themeOptions = document.querySelectorAll('.theme-option');
const statusIndicator = document.getElementById('status-indicator');
const statusIndicatorIcon = document.getElementById('status-indicator-icon');
const statusIndicatorText = document.getElementById('status-indicator-text');

// Gemini API Elements
const geminiApiKeyInput = document.getElementById('gemini-api-key');
const geminiModelSelect = document.getElementById('gemini-model');

// ElevenLabs API Elements
const elevenLabsApiKeyInput = document.getElementById('elevenlabs-api-key');
const elevenLabsVoiceSelect = document.getElementById('elevenlabs-voice');
const ttsToggle = document.getElementById('tts-toggle');
const ttsToggleText = document.getElementById('tts-toggle-text');

// Dummy chatContainer untuk mencegah error
const chatContainer = {
  scrollTop: 0,
  scrollHeight: 0,
  classList: {
    add: function() {},
    remove: function() {},
    contains: function() { return false; }
  },
  style: {},
  addEventListener: function() {},
  appendChild: function() {},
  removeChild: function() {},
  querySelector: function() { return null; },
  querySelectorAll: function() { return []; },
  firstChild: null
};
const validateApiKeyBtn = document.getElementById('validate-api-key-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const saveModelBtn = document.getElementById('save-model-btn');
const resetChatBtn = document.getElementById('reset-chat-btn');
const toolsToggle = document.getElementById('tools-toggle');
const toggleText = document.querySelector('.toggle-text');
const apiStatus = document.getElementById('api-status');

// MCP Elements
const mcpServersList = document.getElementById('mcp-servers-list');
const addMcpServerBtn = document.getElementById('add-mcp-server-btn');
const mcpModal = document.getElementById('mcp-modal');
const closeModal = document.querySelector('.close-modal');
const mcpNameInput = document.getElementById('mcp-name');
const mcpCommandInput = document.getElementById('mcp-command');
const mcpArgsInput = document.getElementById('mcp-args');
const mcpEnvInput = document.getElementById('mcp-env');
const saveMcpServerBtn = document.getElementById('save-mcp-server-btn');
const cancelMcpServerBtn = document.getElementById('cancel-mcp-server-btn');

// WebSocket connection
let socket;
let isConnected = false;
let isListening = false;
let recognition;
let animationFrame;
let activeSection = null;
let statusIndicatorTimeout;

// Voice Activation
let voiceActivation = null;
let isVoiceActivationEnabled = true;
let isWakeWordDetected = false;

// Speech Recognition Language
let speechLanguage = 'id-ID';
let isAutoDetectLanguage = false;

// TTS variables
let isTtsEnabled = true;
let currentAudio = null;
let audioQueue = [];
let isAudioPlaying = false;
let activeStreams = {};
let audioContext = null;
let streamSources = {};

// Status Indicator Functions
function showStatusIndicator(type, message, duration = 3000) {
  // Clear any existing timeout
  if (statusIndicatorTimeout) {
    clearTimeout(statusIndicatorTimeout);
    statusIndicatorTimeout = null;
  }

  // Remove all status classes
  statusIndicator.classList.remove('listening', 'processing', 'error', 'success');

  // Add the appropriate class
  statusIndicator.classList.add(type);
  statusIndicator.classList.add('show');

  // Set the message
  statusIndicatorText.textContent = message;

  // Update the icon based on type
  let iconSvg = '';
  switch (type) {
    case 'listening':
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 19v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 23h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      break;
    case 'processing':
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
      break;
    case 'error':
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
      break;
    case 'success':
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12l3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      break;
    default:
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  statusIndicatorIcon.innerHTML = iconSvg;

  // Hide after duration
  statusIndicatorTimeout = setTimeout(() => {
    statusIndicator.classList.remove('show');
  }, duration);
}

function hideStatusIndicator() {
  if (statusIndicatorTimeout) {
    clearTimeout(statusIndicatorTimeout);
    statusIndicatorTimeout = null;
  }
  statusIndicator.classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Connect to WebSocket server
  connectWebSocket();

  // Initialize speech recognition
  initSpeechRecognition();

  // Load theme
  loadTheme();

  // Display mode dihapus sepenuhnya

  // Set up event listeners
  setupEventListeners();

  // Pastikan transparansi
  ensureTransparency();

  // Setup mouse event handling untuk elemen interaktif
  setupMouseEventHandling();

  // Initialize Gemini API settings
  initGeminiApiSettings();

  // Initialize ElevenLabs API settings
  initElevenLabsApiSettings();

  // Initialize MCP servers
  initMcpServers();

  // Initialize speech language settings
  initSpeechLanguageSettings();

  // Initialize Communication Hub settings
  initCommunicationHubSettings();

  // Setup ripple effect untuk semua tombol
  setupRippleEffect();

  // Pastikan input container sejajar saat startup
  if (inputContainer) {
    // Reset transformasi input container untuk memastikan tidak ada rotasi
    inputContainer.style.transform = 'translateX(-50%)';
    inputContainer.style.perspective = 'none';
    inputContainer.style.transformStyle = 'flat';
    inputContainer.style.rotate = '0deg';
    inputContainer.style.transformOrigin = 'center';

    // PENTING: Pastikan pointer-events diatur ke auto
    inputContainer.style.pointerEvents = 'auto';
    inputContainer.style.zIndex = '1000';

    // Tambahkan !important untuk memastikan tidak ada style lain yang menimpa
    // JANGAN gunakan setAttribute karena akan menimpa semua style termasuk pointer-events
    // Gunakan cssText sebagai gantinya dan pastikan pointer-events: auto disertakan
    inputContainer.style.cssText = 'transform: translateX(-50%) !important; rotate: 0deg !important; perspective: none !important; transform-style: flat !important; transform-origin: center !important; pointer-events: auto !important; z-index: 1000 !important;';

    // Force reflow untuk memastikan perubahan diterapkan
    void inputContainer.offsetHeight;

    console.log('Input container alignment fixed at startup');
  }
});

// Fungsi untuk memastikan posisi chat container dan input container sejajar
function ensureContainersAlignment() {
  // Pastikan chat container ada
  if (chatContainer && chatContainer.classList.contains('active')) {
    // Reset animasi terlebih dahulu
    chatContainer.style.animation = 'none';
    void chatContainer.offsetHeight; // Force reflow

    // Pastikan transformasi hanya horizontal tanpa rotasi
    chatContainer.style.transform = 'translateX(-50%)';
    chatContainer.style.rotate = '0deg';
    chatContainer.style.transformOrigin = 'center';

    // Hapus style animasi
    chatContainer.style.animation = '';

    console.log('Posisi chat container disejajarkan');
  }

  // Pastikan input container juga sejajar
  if (inputContainer) {
    // Reset transformasi input container untuk memastikan tidak ada rotasi
    inputContainer.style.transform = 'translateX(-50%)';
    inputContainer.style.rotate = '0deg';
    inputContainer.style.perspective = 'none';
    inputContainer.style.transformStyle = 'flat';
    inputContainer.style.transformOrigin = 'center';

    // Tambahkan !important untuk memastikan tidak ada style lain yang menimpa
    inputContainer.setAttribute('style', 'transform: translateX(-50%) !important; rotate: 0deg !important; perspective: none !important; transform-style: flat !important; transform-origin: center !important;');

    // Force reflow untuk memastikan perubahan diterapkan
    void inputContainer.offsetHeight;
  }
}

// Fungsi untuk memastikan transparansi dan draggability
function ensureTransparency() {
  // Hapus semua border dan background yang mungkin menyebabkan garis
  document.documentElement.style.backgroundColor = 'transparent';
  document.documentElement.style.border = 'none';
  document.documentElement.style.boxShadow = 'none';
  document.body.style.backgroundColor = 'transparent';
  document.body.style.border = 'none';
  document.body.style.boxShadow = 'none';

  // Tambahkan class khusus untuk memastikan transparansi
  document.documentElement.classList.add('transparent-window');
  document.body.classList.add('transparent-window');

  // Tambahkan style untuk class transparent-window dan draggability
  const style = document.createElement('style');
  style.textContent = `
    .transparent-window {
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      resize: none !important;
      pointer-events: none !important; /* Semua elemen tidak dapat menerima event mouse secara default */
    }

    /* Pendekatan global: semua elemen tidak dapat menerima event mouse secara default */
    html, body, .app-container, .app-window, .app-content, .drag-handle, .drag-area,
    .menu-bar, .chat-container, .slide-menu, .voice-visualizer-container {
      pointer-events: none !important;
    }

    /* PENTING: Pastikan semua container bubble juga tidak dapat menerima event mouse */
    .bubble-container, .bubble-wrapper, .chat-area, .message-container,
    .standalone-bubble-container, .bubble-area, .virtual-scroll-container {
      pointer-events: none !important;
    }

    /* PENTING: Input container dan semua elemen di dalamnya HARUS dapat menerima event mouse */
    .input-container {
      pointer-events: auto !important;
      z-index: 1000 !important;
    }

    .input-container * {
      pointer-events: auto !important;
    }

    /* Window controls juga harus dapat menerima event mouse */
    .window-controls, .window-controls * {
      pointer-events: auto !important;
    }

    /* Pastikan HANYA bubble content yang dapat menerima event mouse, bukan seluruh bubble */
    .standalone-bubble {
      pointer-events: none !important;
    }

    .bubble-content {
      pointer-events: auto !important;
    }

    /* Pastikan elemen interaktif tidak dapat di-drag */
    input, button, a, select, textarea, [role="button"], [tabindex="0"] {
      -webkit-app-region: no-drag !important;
      pointer-events: auto !important;
    }

    /* Pastikan chat container hanya menerima event mouse saat aktif */
    .chat-container.active, .chat-container.active * {
      pointer-events: auto !important;
    }

    /* Pastikan slide menu hanya menerima event mouse saat aktif */
    .slide-menu.active, .slide-menu.active * {
      pointer-events: auto !important;
    }

    /* Pastikan voice visualizer hanya menerima event mouse saat aktif */
    .voice-visualizer-container.active, .voice-visualizer-container.active * {
      pointer-events: auto !important;
    }

    /* Pastikan bubble-content-area dapat menerima event mouse untuk scrolling */
    .bubble-content-area {
      pointer-events: auto !important;
    }

    /* Pastikan bubble content terlihat */
    .bubble-content {
      background-color: var(--assistant-bubble-color) !important;
    }

    .user .bubble-content {
      background-color: var(--user-bubble-color) !important;
    }

    .assistant .bubble-content {
      background-color: var(--assistant-bubble-color) !important;
    }

    /* Menghilangkan tanda panah resize */
    html, body, .app-container, .app-window {
      resize: none !important;
      cursor: default !important;
    }

    /* Mencegah tanda panah resize di tepian */
    html::after,
    body::after,
    .app-container::after,
    .app-window::after {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9999;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      resize: none !important;
    }
  `;
  document.head.appendChild(style);

  // Pastikan input container dapat digeser
  setupDraggableElements();

  // Pastikan chat container terlihat jika ada pesan
  ensureChatContainerVisible();
}

// Fungsi untuk memastikan semua bubble tersembunyi saat startup
function ensureChatContainerVisible() {
  // Selalu sembunyikan semua bubble saat startup
  hideChatContainer();

  // Reset chat state
  if (chatState) {
    chatState.messages = [];
    chatState.userMessageId = null;
    chatState.assistantMessageId = null;
    chatState.isFirstMessage = true;
    chatState.userBubbleElement = null;
    chatState.responseBubbleElement = null;
  }

  console.log('All bubbles hidden at startup');
}

// Fungsi untuk memastikan elemen-elemen dapat digeser
function setupDraggableElements() {
  // Pastikan semua elemen tidak dapat di-drag secara default
  document.body.style.webkitAppRegion = 'no-drag';
  document.documentElement.style.webkitAppRegion = 'no-drag';

  // Variabel untuk melacak status
  let isDragging = false;
  let doubleClickDetected = false;
  let dragOverlay = null;

  // Fungsi untuk membuat overlay
  function createDragOverlay() {
    if (dragOverlay) return;

    dragOverlay = document.createElement('div');
    dragOverlay.id = 'drag-overlay';
    dragOverlay.style.position = 'fixed';
    dragOverlay.style.top = '0';
    dragOverlay.style.left = '0';
    dragOverlay.style.right = '0';
    dragOverlay.style.bottom = '0';
    dragOverlay.style.backgroundColor = 'rgba(0, 100, 255, 0.1)';
    dragOverlay.style.zIndex = '9000';
    dragOverlay.style.pointerEvents = 'none';
    dragOverlay.style.border = '2px dashed rgba(0, 100, 255, 0.5)';
    dragOverlay.style.borderRadius = '10px';
    dragOverlay.style.animation = 'pulse 1s infinite';
    document.body.appendChild(dragOverlay);
  }

  // Fungsi untuk menghapus overlay
  function removeDragOverlay() {
    if (dragOverlay && dragOverlay.parentNode) {
      dragOverlay.parentNode.removeChild(dragOverlay);
      dragOverlay = null;
    }
  }

  // Fungsi untuk mengaktifkan mode drag
  function enableDragMode() {
    document.body.style.webkitAppRegion = 'drag';
    document.body.style.cursor = 'move';
    document.body.classList.add('drag-mode');
    createDragOverlay();
    isDragging = true;
    console.log('Drag mode enabled');
  }

  // Fungsi untuk menonaktifkan mode drag
  function disableDragMode() {
    document.body.style.webkitAppRegion = 'no-drag';
    document.body.style.cursor = 'default';
    document.body.classList.remove('drag-mode');
    removeDragOverlay();
    isDragging = false;
    console.log('Drag mode disabled');
  }

  // Tambahkan event listener untuk double click pada menu button
  if (menuBtn) {
    menuBtn.addEventListener('dblclick', (e) => {
      console.log('Double click detected on menu button');
      doubleClickDetected = true;
      e.preventDefault();
      e.stopPropagation();

      // Tambahkan event listener untuk mousedown
      menuBtn.addEventListener('mousedown', onMenuButtonMouseDown);
    });

    // Fungsi untuk menangani mousedown pada menu button
    function onMenuButtonMouseDown(e) {
      if (doubleClickDetected) {
        console.log('Mouse down after double click');
        enableDragMode();

        // Tambahkan event listener untuk mouseup
        document.addEventListener('mouseup', onDocumentMouseUp);

        e.preventDefault();
        e.stopPropagation();
      }
    }

    // Fungsi untuk menangani mouseup pada document
    function onDocumentMouseUp(e) {
      console.log('Mouse up detected, disabling drag mode');
      disableDragMode();
      doubleClickDetected = false;

      // Hapus event listener
      menuBtn.removeEventListener('mousedown', onMenuButtonMouseDown);
      document.removeEventListener('mouseup', onDocumentMouseUp);

      e.preventDefault();
      e.stopPropagation();
    }
  } else {
    console.error('Menu button not found!');
  }
}

// Connect to WebSocket server
function connectWebSocket() {
  try {
    // Dapatkan port dari main process menggunakan API yang diekspos
    const port = window.electronAPI.getWsPort();
    console.log('Mencoba menghubungkan ke WebSocket server di port:', port);
    socket = new WebSocket(`ws://localhost:${port}`);
  } catch (error) {
    console.error('Error saat menghubungkan ke WebSocket server:', error);
    // Gunakan port default jika gagal mendapatkan port
    console.log('Menggunakan port default 12345');
    socket = new WebSocket('ws://localhost:12345');
  }

  socket.onopen = async () => {
    console.log('Connected to WebSocket server');
    isConnected = true;
    connectionStatus.style.display = 'none';

    // Periksa status Gemini API
    try {
      console.log('Memeriksa status Gemini API...');
      const status = await window.electronAPI.getGeminiStatus();
      console.log('Status Gemini API:', status);

      if (!status.initialized) {
        console.warn('Gemini API belum diinisialisasi!');
        showStatusIndicator('error', 'Gemini API belum diinisialisasi. Silakan atur API key di pengaturan.', 10000);
      } else if (!status.apiKey) {
        console.warn('Gemini API key tidak ditemukan!');
        showStatusIndicator('error', 'Gemini API key tidak ditemukan. Silakan atur API key di pengaturan.', 10000);
      } else {
        console.log('Gemini API siap digunakan dengan model:', status.model);
        showStatusIndicator('success', 'Gemini API siap digunakan', 3000);
      }
    } catch (error) {
      console.error('Error saat memeriksa status Gemini API:', error);
    }

    // Inisialisasi chat container
    initChatContainer();
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
    isConnected = false;
    connectionStatus.style.display = 'flex';

    // Try to reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  socket.onmessage = (event) => {
    try {
      console.log('Raw message received:', event.data);

      let data;
      try {
        data = JSON.parse(event.data);
        console.log('Message parsed successfully:', data);
      } catch (parseError) {
        console.error('Error parsing WebSocket message:', parseError);
        console.error('Error details:', parseError.stack);
        console.log('Raw message that failed to parse:', event.data);
        return;
      }

      if (!data || typeof data !== 'object') {
        console.error('Invalid message format, expected object but got:', typeof data);
        return;
      }

      if (!data.type) {
        console.error('Message missing required "type" field:', data);
        return;
      }

      console.log(`Processing message of type: ${data.type}`);

      if (data.type === 'message') {
        // Tambahkan log untuk debugging
        console.log('Menambahkan pesan ke chat:', data.message);

        if (!data.message) {
          console.error('Message data missing required "message" field:', data);
          return;
        }

        // Tambahkan log untuk memeriksa struktur pesan
        console.log('Struktur pesan:', JSON.stringify(data.message, null, 2));

        // Pastikan pesan memiliki properti yang diperlukan
        if (!data.message.id) {
          console.warn('Pesan tidak memiliki ID, menambahkan ID');
          data.message.id = Date.now().toString();
        }

        if (data.message.text === undefined) {
          console.warn('Pesan tidak memiliki teks, menambahkan teks kosong');
          data.message.text = '';
        }

        // Tambahkan log untuk debugging
        console.log('Menambahkan pesan ke chat dengan addMessageToChat');
        try {
          // Tambahkan delay kecil untuk memastikan DOM siap
          setTimeout(() => {
            addMessageToChat(data.message);
            console.log('Pesan berhasil ditambahkan ke chat');
          }, 50);
        } catch (addError) {
          console.error('Error saat menambahkan pesan ke chat:', addError);
          console.error('Detail error:', addError.stack);
        }
      } else if (data.type === 'streamChunk') {
        // Tangani chunk streaming
        console.log('Menerima chunk streaming:', data);

        if (!data.messageId) {
          console.error('StreamChunk missing required "messageId" field:', data);
          return;
        }

        // Pastikan chunk tidak undefined
        const chunk = data.chunk !== undefined ? data.chunk : '';
        const done = !!data.done;

        // Inisialisasi firstChunk jika belum ada
        if (chatState.firstChunk === undefined) {
          chatState.firstChunk = true;
        }

        console.log(`Memproses chunk untuk messageId: ${data.messageId}, done: ${done}, firstChunk: ${chatState.firstChunk}`);
        console.log('Chunk content:', chunk);

        // Tambahkan log untuk memeriksa apakah bubble respons ada
        console.log('Bubble respons saat ini:', chatState.responseBubbleElement ?
          `ID: ${chatState.responseBubbleElement.dataset.messageId}` : 'tidak ada');

        // Jika tidak ada bubble respons, buat pesan baru
        if (!chatState.responseBubbleElement || !document.body.contains(chatState.responseBubbleElement)) {
          console.log('Tidak ada bubble respons yang valid, membuat pesan baru');

          try {
            // Buat pesan asisten baru
            const assistantMessage = {
              id: data.messageId,
              text: chunk || 'Memproses...',
              isUser: false,
              timestamp: new Date().toISOString()
            };

            // Tampilkan pesan menggunakan standalone bubble
            console.log('Menampilkan pesan asisten baru dengan showMessage');

            // Tambahkan delay kecil untuk memastikan DOM siap
            setTimeout(() => {
              const assistantBubble = window.standaloneBubble.showMessage(assistantMessage);

              if (!assistantBubble) {
                console.error('showMessage mengembalikan null atau undefined');

                // Coba fallback dengan menambahkan langsung ke body
                try {
                  console.log('Mencoba fallback dengan menambahkan bubble langsung ke body');

                  // Buat elemen bubble secara manual
                  const fallbackBubble = document.createElement('div');
                  fallbackBubble.className = 'standalone-bubble assistant';
                  fallbackBubble.dataset.messageId = data.messageId;
                  fallbackBubble.dataset.timestamp = Date.now().toString();

                  // Atur style untuk memastikan terlihat
                  fallbackBubble.style.position = 'fixed';
                  fallbackBubble.style.top = '50vh';
                  fallbackBubble.style.left = '50%';
                  fallbackBubble.style.transform = 'translate(-50%, -50%)';
                  fallbackBubble.style.opacity = '1';
                  fallbackBubble.style.visibility = 'visible';
                  fallbackBubble.style.zIndex = '9999';
                  fallbackBubble.style.pointerEvents = 'auto';

                  // Buat konten
                  const content = document.createElement('div');
                  content.className = 'bubble-content';
                  content.textContent = chunk || 'Respons dari Gemini API';

                  // Tambahkan konten ke bubble
                  fallbackBubble.appendChild(content);

                  // Tambahkan ke body
                  document.body.appendChild(fallbackBubble);

                  chatState.responseBubbleElement = fallbackBubble;
                  console.log('Fallback bubble berhasil ditambahkan ke body');
                } catch (fallbackError) {
                  console.error('Error saat membuat fallback bubble:', fallbackError);
                }
              } else {
                chatState.responseBubbleElement = assistantBubble;
                console.log('Pesan asisten baru berhasil ditampilkan dengan ID:', assistantBubble.dataset.messageId);
              }
            }, 50);
          } catch (showError) {
            console.error('Error saat menampilkan pesan asisten baru:', showError);
            console.error('Detail error:', showError.stack);
          }
        }

        try {
          // Tambahkan delay kecil untuk memastikan DOM siap
          setTimeout(() => {
            updateStreamingMessage(data.messageId, chunk, done);
            console.log('Chunk berhasil diproses');
          }, 50);
        } catch (updateError) {
          console.error('Error saat memperbarui pesan streaming:', updateError);
          console.error('Error stack:', updateError.stack);

          // Coba buat bubble baru sebagai fallback jika update gagal
          try {
            console.log('Mencoba membuat bubble baru sebagai fallback setelah error update');

            // Tambahkan delay kecil untuk memastikan DOM siap
            setTimeout(() => {
              const fallbackBubble = window.standaloneBubble.showMessage({
                id: data.messageId,
                text: chunk || 'Respons dari Gemini API',
                isUser: false,
                timestamp: new Date().toISOString()
              });

              if (fallbackBubble) {
                chatState.responseBubbleElement = fallbackBubble;
                console.log('Fallback bubble berhasil dibuat');
              } else {
                console.error('Fallback bubble gagal dibuat');
              }
            }, 50);
          } catch (fallbackError) {
            console.error('Gagal membuat bubble fallback setelah error update:', fallbackError);
          }
        }

        // Tambahkan log setelah update
        console.log('Setelah update, bubble respons:', chatState.responseBubbleElement ?
          `ID: ${chatState.responseBubbleElement.dataset.messageId}` : 'tidak ada');

        // Jika TTS diaktifkan, putar audio
        if (isTtsEnabled) {
          try {
            // Dapatkan teks dari chunk atau konten lengkap
            const textToSpeak = data.content || chunk;

            if (textToSpeak && textToSpeak.trim() !== '') {
              // Jika ini adalah chunk terakhir, putar seluruh teks
              if (done) {
                console.log('Memulai TTS untuk respons akhir');
                playTTS(textToSpeak);
              }
              // Jika ini adalah chunk pertama dan cukup panjang, mulai streaming
              else if (chatState.firstChunk && textToSpeak.length > 50) {
                console.log('Memulai streaming TTS untuk chunk pertama');
                playTTS(textToSpeak, { streaming: true });
                chatState.firstChunk = false;
              }
              // Jika ini adalah chunk tengah yang cukup panjang, pertimbangkan untuk streaming
              else if (!chatState.firstChunk && textToSpeak.length > 100 && !isAudioPlaying && Object.keys(activeStreams).length === 0) {
                console.log('Memulai streaming TTS untuk chunk tengah');
                playTTS(textToSpeak, { streaming: true });
              }
            }
          } catch (ttsError) {
            console.error('Error saat memulai TTS:', ttsError);
          }
        }
      } else if (data.type === 'toolResult') {
        // Tangani hasil tool
        console.log('Menerima hasil tool:', data);

        if (!data.messageId || !data.toolName) {
          console.error('ToolResult missing required fields:', data);
          return;
        }

        try {
          // Tambahkan delay kecil untuk memastikan DOM siap
          setTimeout(() => {
            displayToolResult(data.messageId, data.toolName, data.toolParams, data.toolResult);
            console.log('Hasil tool berhasil ditampilkan');
          }, 50);
        } catch (toolError) {
          console.error('Error saat menampilkan hasil tool:', toolError);
          console.error('Error stack:', toolError.stack);
        }
      } else if (data.type === 'history') {
        // Inisialisasi chat container untuk riwayat baru
        console.log('Menerima riwayat chat:', data);

        try {
          initChatContainer();
          console.log('Chat container berhasil diinisialisasi');

          // Tambahkan pesan dari riwayat
          if (data.messages && data.messages.length > 0) {
            console.log(`Menambahkan ${data.messages.length} pesan dari riwayat`);

            // Tambahkan delay kecil untuk memastikan DOM siap
            setTimeout(() => {
              data.messages.forEach((message, index) => {
                try {
                  // Tambahkan delay bertahap untuk setiap pesan
                  setTimeout(() => {
                    addMessageToChat(message);
                  }, index * 50);
                } catch (addHistoryError) {
                  console.error('Error saat menambahkan pesan riwayat:', addHistoryError);
                }
              });
            }, 50);
          } else {
            console.log('Tidak ada pesan dalam riwayat');
          }
        } catch (historyError) {
          console.error('Error saat memproses riwayat chat:', historyError);
          console.error('Error stack:', historyError.stack);
        }
      } else if (data.type === 'voiceStatus') {
        console.log('Menerima status voice:', data);
        try {
          toggleVoiceVisualization(data.isListening);
        } catch (voiceError) {
          console.error('Error saat mengubah status visualisasi voice:', voiceError);
        }
      } else {
        console.warn(`Tipe pesan tidak dikenal: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      console.error('Error stack:', error.stack);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);

    // Show error status indicator
    showStatusIndicator('error', 'Connection error. Please try again.', 5000);
  };
}

// Initialize speech recognition
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = speechLanguage; // Gunakan bahasa yang dipilih pengguna

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('active');
    inputContainer.classList.add('listening');
    toggleVoiceVisualization(true);

    // Show status indicator
    showStatusIndicator('listening', 'Listening...', 10000);

    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'startVoiceInput'
      }));
    }
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove('active');
    inputContainer.classList.remove('listening');
    toggleVoiceVisualization(false);

    // Hide listening status indicator
    hideStatusIndicator();

    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'stopVoiceInput'
      }));
    }
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    const isFinal = event.results[0].isFinal;

    // Jika deteksi otomatis bahasa diaktifkan, coba deteksi bahasa dari hasil
    if (isAutoDetectLanguage && isFinal) {
      try {
        // Dapatkan bahasa dari hasil pengenalan suara jika tersedia
        const detectedLanguage = event.results[0][0].lang;

        if (detectedLanguage && detectedLanguage !== speechLanguage) {
          console.log(`Bahasa terdeteksi: ${detectedLanguage}, berbeda dari bahasa saat ini: ${speechLanguage}`);

          // Update bahasa
          setSpeechLanguage(detectedLanguage);

          // Update UI
          const speechLanguageSelect = document.getElementById('speech-language');
          if (speechLanguageSelect) {
            // Cek apakah bahasa terdeteksi ada dalam opsi
            const optionExists = Array.from(speechLanguageSelect.options).some(option => option.value === detectedLanguage);

            if (optionExists) {
              speechLanguageSelect.value = detectedLanguage;
            } else {
              console.log(`Bahasa terdeteksi ${detectedLanguage} tidak ada dalam opsi`);
            }
          }
        }
      } catch (error) {
        console.error('Error saat mendeteksi bahasa:', error);
      }
    }

    if (isFinal && socket && isConnected) {
      // Jangan hapus response bubble yang ada
      // Biarkan fungsi addMessageToChat yang menangani UI

      socket.send(JSON.stringify({
        type: 'voiceResult',
        transcript
      }));
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isListening = false;
    voiceBtn.classList.remove('active');
    inputContainer.classList.remove('listening');
    toggleVoiceVisualization(false);

    // Show error status indicator
    showStatusIndicator('error', `Speech recognition error: ${event.error}`, 5000);

    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'stopVoiceInput'
      }));
    }
  };

  // Inisialisasi voice activation setelah speech recognition
  initVoiceActivation();
}

// Initialize voice activation
function initVoiceActivation() {
  // Periksa apakah VoiceActivation tersedia
  if (!window.VoiceActivation) {
    console.error('VoiceActivation tidak tersedia. Pastikan voice-activation.js dimuat.');
    return;
  }

  // Buat instance VoiceActivation
  voiceActivation = new window.VoiceActivation({
    wakeWords: ['hey mamouse', 'hai mamouse', 'halo mamouse', 'ok mamouse'],
    language: speechLanguage,
    sensitivity: 0.7,
    continuousListening: true,
    autoRestart: true
  });

  // Setup callbacks
  voiceActivation
    .onWakeWordDetected((wakeWord, transcript) => {
      console.log(`Wake word terdeteksi: "${wakeWord}" dalam "${transcript}"`);
      isWakeWordDetected = true;

      // Tampilkan indikator status
      showStatusIndicator('listening', `Terdeteksi: "${wakeWord}". Mendengarkan perintah...`, 5000);

      // Aktifkan visualisasi suara
      toggleVoiceVisualization(true);

      // Tambahkan class untuk efek visual
      if (inputContainer) {
        inputContainer.classList.add('wake-word-detected');
      }

      // Mainkan suara notifikasi jika ada
      playWakeWordSound();
    })
    .onCommandDetected((command) => {
      console.log(`Perintah terdeteksi: "${command}"`);
      isWakeWordDetected = false;

      // Tampilkan indikator status
      showStatusIndicator('processing', `Memproses: "${command}"`, 3000);

      // Kirim perintah ke server
      if (socket && isConnected) {
        socket.send(JSON.stringify({
          type: 'voiceResult',
          transcript: command
        }));
      }

      // Nonaktifkan visualisasi suara
      toggleVoiceVisualization(false);

      // Hapus class untuk efek visual
      if (inputContainer) {
        inputContainer.classList.remove('wake-word-detected');
      }
    })
    .onListeningStart(() => {
      console.log('Voice activation: Listening started');

      // Tampilkan indikator status
      showStatusIndicator('listening', 'Mendengarkan wake word...', 3000);
    })
    .onListeningStop(() => {
      console.log('Voice activation: Listening stopped');

      // Sembunyikan indikator status
      hideStatusIndicator();

      // Nonaktifkan visualisasi suara
      toggleVoiceVisualization(false);

      // Hapus class untuk efek visual
      if (inputContainer) {
        inputContainer.classList.remove('wake-word-detected');
      }
    })
    .onError((error) => {
      console.error('Voice activation error:', error);

      // Tampilkan indikator status
      showStatusIndicator('error', `Error: ${error}`, 5000);
    });

  // Mulai voice activation jika diaktifkan
  if (isVoiceActivationEnabled) {
    startVoiceActivation();
  }
}

// Fungsi untuk memulai voice activation
function startVoiceActivation() {
  if (voiceActivation) {
    voiceActivation.start();
    console.log('Voice activation started');
    showStatusIndicator('listening', 'Mendengarkan wake word...', 3000);
  }
}

// Fungsi untuk menghentikan voice activation
function stopVoiceActivation() {
  if (voiceActivation) {
    voiceActivation.stop();
    console.log('Voice activation stopped');
    hideStatusIndicator();
  }
}

// Fungsi untuk mengubah bahasa pengenalan suara
function setSpeechLanguage(language) {
  if (!language) return;

  // Simpan bahasa baru
  speechLanguage = language;
  console.log(`Bahasa pengenalan suara diubah ke: ${language}`);

  // Update bahasa di recognition
  if (recognition) {
    recognition.lang = language;
    console.log(`Recognition language diubah ke: ${language}`);
  }

  // Update bahasa di voice activation
  if (voiceActivation) {
    voiceActivation.setLanguage(language);
    console.log(`Voice activation language diubah ke: ${language}`);
  }

  // Simpan pengaturan ke localStorage
  try {
    localStorage.setItem('speechLanguage', language);
    console.log('Pengaturan bahasa berhasil disimpan ke localStorage');
  } catch (error) {
    console.error('Error saat menyimpan pengaturan bahasa ke localStorage:', error);
  }

  // Tampilkan status
  showStatusIndicator('success', `Bahasa pengenalan suara diubah ke: ${language}`, 3000);

  return true;
}

// Fungsi untuk mengaktifkan/menonaktifkan deteksi otomatis bahasa
function toggleAutoDetectLanguage(enabled) {
  isAutoDetectLanguage = enabled;
  console.log(`Deteksi otomatis bahasa ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`);

  // Simpan pengaturan ke localStorage
  try {
    localStorage.setItem('autoDetectLanguage', enabled ? 'true' : 'false');
    console.log('Pengaturan deteksi otomatis bahasa berhasil disimpan ke localStorage');
  } catch (error) {
    console.error('Error saat menyimpan pengaturan deteksi otomatis bahasa ke localStorage:', error);
  }

  // Tampilkan status
  showStatusIndicator('success', `Deteksi otomatis bahasa ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`, 3000);

  return true;
}

// Fungsi untuk menginisialisasi pengaturan bahasa pengenalan suara
function initSpeechLanguageSettings() {
  console.log('Menginisialisasi pengaturan bahasa pengenalan suara');

  // Ambil elemen-elemen UI
  const speechLanguageSelect = document.getElementById('speech-language');
  const autoDetectLanguageToggle = document.getElementById('auto-detect-language-toggle');
  const autoDetectLanguageToggleText = document.getElementById('auto-detect-language-toggle-text');

  // Muat pengaturan dari localStorage
  try {
    // Muat pengaturan bahasa
    const savedLanguage = localStorage.getItem('speechLanguage');
    if (savedLanguage) {
      speechLanguage = savedLanguage;
      console.log(`Bahasa pengenalan suara dimuat dari localStorage: ${speechLanguage}`);

      // Update UI
      if (speechLanguageSelect) {
        speechLanguageSelect.value = speechLanguage;
      }
    }

    // Muat pengaturan deteksi otomatis bahasa
    const savedAutoDetect = localStorage.getItem('autoDetectLanguage');
    if (savedAutoDetect) {
      isAutoDetectLanguage = savedAutoDetect === 'true';
      console.log(`Deteksi otomatis bahasa dimuat dari localStorage: ${isAutoDetectLanguage}`);

      // Update UI
      if (autoDetectLanguageToggle) {
        autoDetectLanguageToggle.checked = isAutoDetectLanguage;

        if (autoDetectLanguageToggleText) {
          autoDetectLanguageToggleText.textContent = isAutoDetectLanguage ? 'Aktif' : 'Nonaktif';
        }
      }
    }
  } catch (error) {
    console.error('Error saat memuat pengaturan bahasa dari localStorage:', error);
  }

  // Tambahkan event listener untuk speech language select
  if (speechLanguageSelect) {
    speechLanguageSelect.addEventListener('change', () => {
      const selectedLanguage = speechLanguageSelect.value;
      if (selectedLanguage) {
        setSpeechLanguage(selectedLanguage);
      }
    });
  } else {
    console.error('Speech language select not found!');
  }

  // Tambahkan event listener untuk auto detect language toggle
  if (autoDetectLanguageToggle) {
    autoDetectLanguageToggle.addEventListener('change', () => {
      const isEnabled = autoDetectLanguageToggle.checked;

      // Update teks toggle
      if (autoDetectLanguageToggleText) {
        autoDetectLanguageToggleText.textContent = isEnabled ? 'Aktif' : 'Nonaktif';
      }

      // Aktifkan atau nonaktifkan deteksi otomatis bahasa
      toggleAutoDetectLanguage(isEnabled);
    });
  } else {
    console.error('Auto detect language toggle not found!');
  }

  console.log('Pengaturan bahasa pengenalan suara berhasil diinisialisasi');
}

// Fungsi untuk menginisialisasi pengaturan Communication Hub
function initCommunicationHubSettings() {
  console.log('Menginisialisasi pengaturan Communication Hub');

  // Variabel untuk menyimpan pengaturan
  let isGeminiEnabled = true;
  let isOpenAIEnabled = false;
  let isAnthropicEnabled = false;
  let isAutoFallbackEnabled = true;
  let isModelRotationEnabled = false;
  let isResponseCachingEnabled = true;
  let temperature = 0.7;
  let topP = 0.9;
  let maxTokens = 4000;

  // Ambil elemen-elemen UI
  const geminiToggle = document.getElementById('gemini-toggle');
  const openaiToggle = document.getElementById('openai-toggle');
  const anthropicToggle = document.getElementById('anthropic-toggle');
  const autoFallbackToggle = document.getElementById('auto-fallback-toggle');
  const modelRotationToggle = document.getElementById('model-rotation-toggle');
  const responseCachingToggle = document.getElementById('response-caching-toggle');
  const temperatureSlider = document.getElementById('temperature-slider');
  const temperatureValue = document.getElementById('temperature-value');
  const topPSlider = document.getElementById('top-p-slider');
  const topPValue = document.getElementById('top-p-value');
  const maxTokensInput = document.getElementById('max-tokens-input');
  const saveCommunicationSettingsBtn = document.getElementById('save-communication-settings-btn');
  const resetCommunicationSettingsBtn = document.getElementById('reset-communication-settings-btn');
  const communicationStatus = document.getElementById('communication-status');

  // Muat pengaturan dari localStorage
  try {
    // Muat pengaturan model
    const savedGeminiEnabled = localStorage.getItem('geminiEnabled');
    if (savedGeminiEnabled !== null) {
      isGeminiEnabled = savedGeminiEnabled === 'true';
      if (geminiToggle) geminiToggle.checked = isGeminiEnabled;
    }

    const savedOpenAIEnabled = localStorage.getItem('openaiEnabled');
    if (savedOpenAIEnabled !== null) {
      isOpenAIEnabled = savedOpenAIEnabled === 'true';
      if (openaiToggle) openaiToggle.checked = isOpenAIEnabled;
    }

    const savedAnthropicEnabled = localStorage.getItem('anthropicEnabled');
    if (savedAnthropicEnabled !== null) {
      isAnthropicEnabled = savedAnthropicEnabled === 'true';
      if (anthropicToggle) anthropicToggle.checked = isAnthropicEnabled;
    }

    // Muat pengaturan fallback dan rotasi
    const savedAutoFallback = localStorage.getItem('autoFallbackEnabled');
    if (savedAutoFallback !== null) {
      isAutoFallbackEnabled = savedAutoFallback === 'true';
      if (autoFallbackToggle) autoFallbackToggle.checked = isAutoFallbackEnabled;
    }

    const savedModelRotation = localStorage.getItem('modelRotationEnabled');
    if (savedModelRotation !== null) {
      isModelRotationEnabled = savedModelRotation === 'true';
      if (modelRotationToggle) modelRotationToggle.checked = isModelRotationEnabled;
    }

    const savedResponseCaching = localStorage.getItem('responseCachingEnabled');
    if (savedResponseCaching !== null) {
      isResponseCachingEnabled = savedResponseCaching === 'true';
      if (responseCachingToggle) responseCachingToggle.checked = isResponseCachingEnabled;
    }

    // Muat pengaturan parameter model
    const savedTemperature = localStorage.getItem('temperature');
    if (savedTemperature !== null) {
      temperature = parseFloat(savedTemperature);
      if (temperatureSlider) temperatureSlider.value = temperature;
      if (temperatureValue) temperatureValue.textContent = temperature;
    }

    const savedTopP = localStorage.getItem('topP');
    if (savedTopP !== null) {
      topP = parseFloat(savedTopP);
      if (topPSlider) topPSlider.value = topP;
      if (topPValue) topPValue.textContent = topP;
    }

    const savedMaxTokens = localStorage.getItem('maxTokens');
    if (savedMaxTokens !== null) {
      maxTokens = parseInt(savedMaxTokens);
      if (maxTokensInput) maxTokensInput.value = maxTokens;
    }

    console.log('Pengaturan Communication Hub berhasil dimuat dari localStorage');
  } catch (error) {
    console.error('Error saat memuat pengaturan Communication Hub dari localStorage:', error);
  }

  // Tambahkan event listener untuk toggle model
  if (geminiToggle) {
    geminiToggle.addEventListener('change', () => {
      isGeminiEnabled = geminiToggle.checked;
      localStorage.setItem('geminiEnabled', isGeminiEnabled);
      showCommunicationStatus('success', `Model Gemini ${isGeminiEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  if (openaiToggle) {
    openaiToggle.addEventListener('change', () => {
      isOpenAIEnabled = openaiToggle.checked;
      localStorage.setItem('openaiEnabled', isOpenAIEnabled);
      showCommunicationStatus('success', `Model OpenAI ${isOpenAIEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  if (anthropicToggle) {
    anthropicToggle.addEventListener('change', () => {
      isAnthropicEnabled = anthropicToggle.checked;
      localStorage.setItem('anthropicEnabled', isAnthropicEnabled);
      showCommunicationStatus('success', `Model Anthropic ${isAnthropicEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  // Tambahkan event listener untuk toggle fallback dan rotasi
  if (autoFallbackToggle) {
    autoFallbackToggle.addEventListener('change', () => {
      isAutoFallbackEnabled = autoFallbackToggle.checked;
      localStorage.setItem('autoFallbackEnabled', isAutoFallbackEnabled);
      showCommunicationStatus('success', `Auto Fallback ${isAutoFallbackEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  if (modelRotationToggle) {
    modelRotationToggle.addEventListener('change', () => {
      isModelRotationEnabled = modelRotationToggle.checked;
      localStorage.setItem('modelRotationEnabled', isModelRotationEnabled);
      showCommunicationStatus('success', `Model Rotation ${isModelRotationEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  if (responseCachingToggle) {
    responseCachingToggle.addEventListener('change', () => {
      isResponseCachingEnabled = responseCachingToggle.checked;
      localStorage.setItem('responseCachingEnabled', isResponseCachingEnabled);
      showCommunicationStatus('success', `Response Caching ${isResponseCachingEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }

  // Tambahkan event listener untuk slider dan input
  if (temperatureSlider && temperatureValue) {
    temperatureSlider.addEventListener('input', () => {
      temperature = parseFloat(temperatureSlider.value);
      temperatureValue.textContent = temperature;
    });

    temperatureSlider.addEventListener('change', () => {
      localStorage.setItem('temperature', temperature);
      showCommunicationStatus('success', `Temperature diatur ke ${temperature}`);
    });
  }

  if (topPSlider && topPValue) {
    topPSlider.addEventListener('input', () => {
      topP = parseFloat(topPSlider.value);
      topPValue.textContent = topP;
    });

    topPSlider.addEventListener('change', () => {
      localStorage.setItem('topP', topP);
      showCommunicationStatus('success', `Top P diatur ke ${topP}`);
    });
  }

  if (maxTokensInput) {
    maxTokensInput.addEventListener('change', () => {
      maxTokens = parseInt(maxTokensInput.value);
      localStorage.setItem('maxTokens', maxTokens);
      showCommunicationStatus('success', `Max Tokens diatur ke ${maxTokens}`);
    });
  }

  // Tambahkan event listener untuk tombol save dan reset
  if (saveCommunicationSettingsBtn) {
    saveCommunicationSettingsBtn.addEventListener('click', () => {
      // Simpan semua pengaturan ke localStorage
      localStorage.setItem('geminiEnabled', isGeminiEnabled);
      localStorage.setItem('openaiEnabled', isOpenAIEnabled);
      localStorage.setItem('anthropicEnabled', isAnthropicEnabled);
      localStorage.setItem('autoFallbackEnabled', isAutoFallbackEnabled);
      localStorage.setItem('modelRotationEnabled', isModelRotationEnabled);
      localStorage.setItem('responseCachingEnabled', isResponseCachingEnabled);
      localStorage.setItem('temperature', temperature);
      localStorage.setItem('topP', topP);
      localStorage.setItem('maxTokens', maxTokens);

      showCommunicationStatus('success', 'Pengaturan Communication Hub berhasil disimpan');
    });
  }

  if (resetCommunicationSettingsBtn) {
    resetCommunicationSettingsBtn.addEventListener('click', () => {
      // Reset semua pengaturan ke default
      isGeminiEnabled = true;
      isOpenAIEnabled = false;
      isAnthropicEnabled = false;
      isAutoFallbackEnabled = true;
      isModelRotationEnabled = false;
      isResponseCachingEnabled = true;
      temperature = 0.7;
      topP = 0.9;
      maxTokens = 4000;

      // Update UI
      if (geminiToggle) geminiToggle.checked = isGeminiEnabled;
      if (openaiToggle) openaiToggle.checked = isOpenAIEnabled;
      if (anthropicToggle) anthropicToggle.checked = isAnthropicEnabled;
      if (autoFallbackToggle) autoFallbackToggle.checked = isAutoFallbackEnabled;
      if (modelRotationToggle) modelRotationToggle.checked = isModelRotationEnabled;
      if (responseCachingToggle) responseCachingToggle.checked = isResponseCachingEnabled;
      if (temperatureSlider) temperatureSlider.value = temperature;
      if (temperatureValue) temperatureValue.textContent = temperature;
      if (topPSlider) topPSlider.value = topP;
      if (topPValue) topPValue.textContent = topP;
      if (maxTokensInput) maxTokensInput.value = maxTokens;

      // Simpan pengaturan default ke localStorage
      localStorage.setItem('geminiEnabled', isGeminiEnabled);
      localStorage.setItem('openaiEnabled', isOpenAIEnabled);
      localStorage.setItem('anthropicEnabled', isAnthropicEnabled);
      localStorage.setItem('autoFallbackEnabled', isAutoFallbackEnabled);
      localStorage.setItem('modelRotationEnabled', isModelRotationEnabled);
      localStorage.setItem('responseCachingEnabled', isResponseCachingEnabled);
      localStorage.setItem('temperature', temperature);
      localStorage.setItem('topP', topP);
      localStorage.setItem('maxTokens', maxTokens);

      showCommunicationStatus('success', 'Pengaturan Communication Hub berhasil direset ke default');
    });
  }

  console.log('Pengaturan Communication Hub berhasil diinisialisasi');
}

// Fungsi untuk menampilkan status Communication Hub
function showCommunicationStatus(type, message) {
  const communicationStatus = document.getElementById('communication-status');
  if (!communicationStatus) return;

  communicationStatus.textContent = message;
  communicationStatus.className = 'status-message ' + type;

  // Sembunyikan status setelah 3 detik
  setTimeout(() => {
    communicationStatus.className = 'status-message';
  }, 3000);
}

// Fungsi untuk memainkan suara notifikasi wake word
function playWakeWordSound() {
  try {
    // Buat audio context jika belum ada
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Buat oscillator untuk suara notifikasi sederhana
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2); // A4

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Error saat memainkan suara notifikasi:', error);
  }
}

// Fungsi loadDisplayMode dihapus karena menyebabkan masalah

// Fungsi setDisplayMode dihapus karena menyebabkan masalah

// Set up event listeners
function setupEventListeners() {
  // Window controls
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      console.log('Minimize button clicked');
      try {
        window.electronAPI.minimizeWindow();
      } catch (error) {
        console.error('Error saat meminimalkan window:', error);
        window.electronAPI.logError('Error saat meminimalkan window: ' + error.message);
      }
    });
  } else {
    console.error('Minimize button not found!');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('Close button clicked');
      try {
        window.electronAPI.closeWindow();
      } catch (error) {
        console.error('Error saat menutup window:', error);
        window.electronAPI.logError('Error saat menutup window: ' + error.message);
      }
    });
  } else {
    console.error('Close button not found!');
  }

  // MCP Server controls
  if (addMcpServerBtn) {
    addMcpServerBtn.addEventListener('click', showMcpModal);
  } else {
    console.error('Add MCP server button not found!');
  }

  if (closeModal) {
    closeModal.addEventListener('click', hideMcpModal);
  } else {
    console.error('Close modal button not found!');
  }

  if (cancelMcpServerBtn) {
    cancelMcpServerBtn.addEventListener('click', hideMcpModal);
  } else {
    console.error('Cancel MCP server button not found!');
  }

  if (saveMcpServerBtn) {
    saveMcpServerBtn.addEventListener('click', saveMcpServer);
  } else {
    console.error('Save MCP server button not found!');
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === mcpModal) {
      hideMcpModal();
    }
  });

  // Gemini API settings
  if (validateApiKeyBtn) {
    validateApiKeyBtn.addEventListener('click', validateGeminiApiKey);
  } else {
    console.error('Validate API key button not found!');
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', saveGeminiApiKey);
  } else {
    console.error('Save API key button not found!');
  }

  // Link untuk mendapatkan API key Gemini
  const getApiKeyLink = document.getElementById('get-api-key-link');
  if (getApiKeyLink) {
    getApiKeyLink.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const url = getApiKeyLink.getAttribute('href');
        if (url) {
          // Gunakan API yang diekspos dari preload.js
          window.electronAPI.openExternalUrl(url);
        } else {
          console.error('URL tidak ditemukan pada link API key');
        }
      } catch (error) {
        console.error('Error saat membuka link API key:', error);
        // Log error ke main process
        window.electronAPI.logError('Error saat membuka link API key: ' + error.message);
      }
    });
  } else {
    console.error('Get API key link not found!');
  }

  // Link untuk mendapatkan API key ElevenLabs
  const getElevenLabsApiKeyLink = document.getElementById('get-elevenlabs-api-key-link');
  if (getElevenLabsApiKeyLink) {
    getElevenLabsApiKeyLink.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const url = getElevenLabsApiKeyLink.getAttribute('href');
        if (url) {
          // Gunakan API yang diekspos dari preload.js
          window.electronAPI.openExternalUrl(url);
        } else {
          console.error('URL tidak ditemukan pada link ElevenLabs API key');
        }
      } catch (error) {
        console.error('Error saat membuka link ElevenLabs API key:', error);
        // Log error ke main process
        window.electronAPI.logError('Error saat membuka link ElevenLabs API key: ' + error.message);
      }
    });
  } else {
    console.error('Get ElevenLabs API key link not found!');
  }

  if (saveModelBtn) {
    saveModelBtn.addEventListener('click', saveGeminiModel);
  } else {
    console.error('Save model button not found!');
  }

  if (resetChatBtn) {
    resetChatBtn.addEventListener('click', resetGeminiChat);
  } else {
    console.error('Reset chat button not found!');
  }

  // Tools toggle
  if (toolsToggle) {
    toolsToggle.addEventListener('change', toggleTools);
  } else {
    console.error('Tools toggle not found!');
  }

  // TTS toggle
  if (ttsToggle) {
    ttsToggle.addEventListener('change', () => {
      isTtsEnabled = ttsToggle.checked;

      // Update teks toggle
      if (ttsToggleText) {
        ttsToggleText.textContent = isTtsEnabled ? 'Aktif' : 'Nonaktif';
      }

      // Jika dinonaktifkan, hentikan pemutaran audio yang sedang berjalan
      if (!isTtsEnabled) {
        stopTTS();
      }

      showApiStatus('success', `Text-to-Speech ${isTtsEnabled ? 'diaktifkan' : 'dinonaktifkan'}`, 'elevenlabs-status');
    });
  } else {
    console.error('TTS toggle not found!');
  }

  // Voice Activation toggle
  const voiceActivationToggle = document.getElementById('voice-activation-toggle');
  const voiceActivationToggleText = document.getElementById('voice-activation-toggle-text');

  if (voiceActivationToggle) {
    voiceActivationToggle.addEventListener('change', () => {
      isVoiceActivationEnabled = voiceActivationToggle.checked;

      // Update teks toggle
      if (voiceActivationToggleText) {
        voiceActivationToggleText.textContent = isVoiceActivationEnabled ? 'Aktif' : 'Nonaktif';
      }

      // Aktifkan atau nonaktifkan voice activation
      if (isVoiceActivationEnabled) {
        startVoiceActivation();
        showApiStatus('success', 'Voice Activation diaktifkan', 'elevenlabs-status');
      } else {
        stopVoiceActivation();
        showApiStatus('success', 'Voice Activation dinonaktifkan', 'elevenlabs-status');
      }
    });
  } else {
    console.error('Voice Activation toggle not found!');
  }

  // Wake Words input
  const wakeWordsInput = document.getElementById('wake-words');

  if (wakeWordsInput) {
    wakeWordsInput.addEventListener('change', () => {
      const wakeWords = wakeWordsInput.value.trim();

      if (wakeWords && voiceActivation) {
        // Split wake words by comma and trim each word
        const wakeWordsArray = wakeWords.split(',').map(word => word.trim()).filter(word => word);

        if (wakeWordsArray.length > 0) {
          voiceActivation.setWakeWords(wakeWordsArray);
          showApiStatus('success', 'Wake words berhasil diperbarui', 'elevenlabs-status');
        }
      }
    });
  } else {
    console.error('Wake Words input not found!');
  }

  // ElevenLabs API Key
  if (elevenLabsApiKeyInput) {
    // Validate and save API key
    const validateElevenLabsApiKeyBtn = document.getElementById('validate-elevenlabs-api-key-btn');
    if (validateElevenLabsApiKeyBtn) {
      validateElevenLabsApiKeyBtn.addEventListener('click', async () => {
        const apiKey = elevenLabsApiKeyInput.value.trim();
        if (!apiKey) {
          showApiStatus('error', 'API key tidak boleh kosong', 'elevenlabs-status');
          return;
        }

        try {
          showApiStatus('info', 'Memvalidasi API key...', 'elevenlabs-status');
          const result = await window.electronAPI.setElevenLabsApiKey(apiKey);

          if (result.success) {
            showApiStatus('success', 'API key valid dan berhasil disimpan', 'elevenlabs-status');

            // Refresh daftar suara
            initElevenLabsApiSettings();
          } else {
            showApiStatus('error', `Error: ${result.message || 'API key tidak valid'}`, 'elevenlabs-status');
          }
        } catch (error) {
          console.error('Error saat memvalidasi API key:', error);
          showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat memvalidasi API key'}`, 'elevenlabs-status');
        }
      });
    }
  }

  // ElevenLabs Voice Select
  if (elevenLabsVoiceSelect) {
    elevenLabsVoiceSelect.addEventListener('change', async () => {
      const voiceId = elevenLabsVoiceSelect.value;
      if (!voiceId) return;

      try {
        showApiStatus('info', 'Menyimpan pengaturan suara...', 'elevenlabs-status');
        const result = await window.electronAPI.setElevenLabsVoice(voiceId);

        if (result.success) {
          showApiStatus('success', 'Pengaturan suara berhasil disimpan', 'elevenlabs-status');
        } else {
          showApiStatus('error', `Error: ${result.error || 'Terjadi kesalahan saat menyimpan pengaturan suara'}`, 'elevenlabs-status');
        }
      } catch (error) {
        console.error('Error saat menyimpan pengaturan suara:', error);
        showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan pengaturan suara'}`, 'elevenlabs-status');
      }
    });
  }

  // Event listener untuk chat container dihapus karena kita menggunakan standalone bubbles

  // Event listener untuk tombol hide chat dihapus karena kita menggunakan standalone bubbles

  // Message form
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (message && socket && isConnected) {
      // Jangan hapus response bubble yang ada
      // Biarkan fungsi addMessageToChat yang menangani UI

      // Show processing status indicator
      showStatusIndicator('processing', 'Processing your request...', 10000);

      // Kirim pesan ke server
      socket.send(JSON.stringify({
        type: 'message',
        content: message
      }));

      // Kosongkan input
      messageInput.value = '';
    }
  });

  // Voice button
  voiceBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  // Menu button - hanya untuk single click
  menuBtn.addEventListener('click', (e) => {
    // Cek apakah ini adalah bagian dari double click
    if (e.detail === 1) { // Hanya single click
      // Tunggu sebentar untuk memastikan ini bukan bagian dari double click
      setTimeout(() => {
        slideMenu.classList.toggle('active');
        // Toggle pointer-events berdasarkan status aktif
        if (slideMenu.classList.contains('active')) {
          slideMenu.style.pointerEvents = 'auto';
          // Pastikan scrolling berfungsi dengan baik
          slideMenu.style.overflowY = 'auto';
          // Tambahkan event listener untuk wheel event pada slide menu
          slideMenu.addEventListener('wheel', (e) => {
            // Mencegah event wheel menyebar ke elemen lain jika slide menu sedang di-scroll
            if (slideMenu.scrollHeight > slideMenu.clientHeight) {
              e.stopPropagation();
            }
          });
        } else {
          slideMenu.style.pointerEvents = 'none';
          slideMenu.style.overflowY = 'hidden';
        }
      }, 300);
    }
  });

  // Close menu button
  closeMenuBtn.addEventListener('click', () => {
    slideMenu.classList.remove('active');
    slideMenu.style.pointerEvents = 'none';
    slideMenu.style.overflowY = 'hidden';
    // Hapus event listener wheel untuk mencegah memory leak
    slideMenu.removeEventListener('wheel', (e) => {
      if (slideMenu.scrollHeight > slideMenu.clientHeight) {
        e.stopPropagation();
      }
    });
  });

  // Menu items
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      toggleMenuSection(section);
    });
  });

  // Theme options
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      setTheme(theme);

      themeOptions.forEach(opt => {
        opt.classList.remove('active');
      });

      option.classList.add('active');
    });
  });

  // Display mode options dihapus karena menyebabkan masalah
}

// Variabel global untuk menyimpan state chat
const chatState = {
  messages: [], // Menyimpan semua pesan dalam percakapan saat ini
  userMessageId: null, // ID pesan pengguna saat ini
  assistantMessageId: null, // ID pesan asisten saat ini
  isFirstMessage: true, // Flag untuk menandai pesan pertama
  userBubbleElement: null, // Referensi ke elemen bubble pengguna
  responseBubbleElement: null, // Referensi ke elemen bubble respons
  autoHideTimer: null, // Timer untuk auto-hide chat container
  autoHideDelay: 10000 // Delay sebelum auto-hide (10 detik)
};

// Fungsi untuk menginisialisasi chat container
function initChatContainer() {
  // Reset state chat
  chatState.messages = [];
  chatState.userMessageId = null;
  chatState.assistantMessageId = null;
  chatState.isFirstMessage = true;
  chatState.userBubbleElement = null;
  chatState.responseBubbleElement = null;

  // Sembunyikan semua bubble
  hideChatContainer();

  console.log('Chat state initialized and bubbles cleared');
}

// Fungsi untuk membuat elemen bubble
function createBubbleElement(message, isTypingIndicator = false) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${message.isUser ? 'user' : 'assistant'}`;
  if (!message.isUser) bubble.classList.add('response-bubble');
  bubble.dataset.messageId = message.id;

  if (isTypingIndicator) {
    console.log('Membuat indikator mengetik (typing indicator)');

    // Buat indikator mengetik yang compact
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bubble-content typing-indicator';

    // Buat container untuk titik-titik animasi
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'typing-dots';

    // Buat tiga titik untuk animasi wave
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'typing-dot';
      // Tidak perlu teks untuk titik
      // Delay dan tinggi diatur melalui CSS
      dotsContainer.appendChild(dot);
    }

    // Tambahkan container titik ke indikator
    typingIndicator.appendChild(dotsContainer);

    // Tambahkan indikator ke bubble
    bubble.appendChild(typingIndicator);

    // Tambahkan style inline untuk memastikan ukuran awal yang compact
    bubble.style.width = 'auto';
    bubble.style.minWidth = 'fit-content';
    bubble.style.display = 'flex';
    bubble.style.overflow = 'visible';
  } else {
    // Buat konten pesan normal
    const content = document.createElement('div');
    content.className = 'bubble-content';
    content.textContent = message.text;

    bubble.appendChild(content);
  }

  return bubble;
}

// Fungsi untuk mengelola auto-hide chat container
function setupAutoHide() {
  // Batalkan timer yang ada jika ada
  if (chatState.autoHideTimer) {
    clearTimeout(chatState.autoHideTimer);
    chatState.autoHideTimer = null;
  }

  // Set timer baru untuk auto-hide
  chatState.autoHideTimer = setTimeout(() => {
    hideChatContainer();
  }, chatState.autoHideDelay);

  console.log('Auto-hide timer set for', chatState.autoHideDelay, 'ms');
}

// Fungsi untuk menampilkan chat container
function showChatContainer() {
  // Batalkan timer auto-hide yang ada
  if (chatState.autoHideTimer) {
    clearTimeout(chatState.autoHideTimer);
    chatState.autoHideTimer = null;
  }

  // Dengan standalone bubble, kita tidak perlu menampilkan chat container
  // Karena bubble akan muncul secara individual tanpa container

  // Pastikan input container sejajar
  if (inputContainer) {
    // Reset transformasi input container untuk memastikan tidak ada rotasi
    inputContainer.style.transform = 'translateX(-50%)';
    inputContainer.style.rotate = '0deg';
    inputContainer.style.perspective = 'none';
    inputContainer.style.transformStyle = 'flat';
    inputContainer.style.transformOrigin = 'center';

    // Tambahkan !important untuk memastikan tidak ada style lain yang menimpa
    inputContainer.setAttribute('style', 'transform: translateX(-50%) !important; rotate: 0deg !important; perspective: none !important; transform-style: flat !important; transform-origin: center !important;');

    // Force reflow untuk memastikan perubahan diterapkan
    void inputContainer.offsetHeight;
  }

  console.log('Using standalone bubbles instead of chat container');
}

// Fungsi untuk menyembunyikan chat container
function hideChatContainer() {
  // Batalkan timer auto-hide yang ada
  if (chatState && chatState.autoHideTimer) {
    clearTimeout(chatState.autoHideTimer);
    chatState.autoHideTimer = null;
  }

  // Dengan standalone bubble, kita akan menyembunyikan semua bubble
  if (window.standaloneBubble) {
    try {
      window.standaloneBubble.clearAllBubbles();
      console.log('All standalone bubbles cleared');
    } catch (error) {
      console.error('Error saat menghapus semua bubble:', error);
    }
  }

  // Pastikan input container tetap sejajar
  if (inputContainer) {
    try {
      // Reset transformasi input container untuk memastikan tidak ada rotasi
      inputContainer.style.transform = 'translateX(-50%)';
      inputContainer.style.rotate = '0deg';
      inputContainer.style.perspective = 'none';
      inputContainer.style.transformStyle = 'flat';
      inputContainer.style.transformOrigin = 'center';

      // Tambahkan !important untuk memastikan tidak ada style lain yang menimpa
      inputContainer.setAttribute('style', 'transform: translateX(-50%) !important; rotate: 0deg !important; perspective: none !important; transform-style: flat !important; transform-origin: center !important;');

      // Force reflow untuk memastikan perubahan diterapkan
      void inputContainer.offsetHeight;
    } catch (error) {
      console.error('Error saat mengatur style input container:', error);
    }
  }
}

// Fungsi untuk menambahkan pesan ke chat
function addMessageToChat(message) {
  console.log('Menambahkan pesan:', message);

  // Hide processing status indicator when assistant responds
  if (!message.isUser) {
    hideStatusIndicator();
  }

  // Pastikan window.standaloneBubble tersedia
  if (!window.standaloneBubble) {
    console.error('standaloneBubble tidak tersedia!');
    return;
  }

  // Jika pesan dari pengguna
  if (message.isUser) {
    // Cek apakah ini pesan yang sama dengan pesan terakhir
    if (chatState.userMessageId === message.id) {
      console.log('Pesan pengguna yang sama, tidak perlu update UI');
      return; // Jangan lakukan apa-apa jika pesan sama
    }

    // Simpan ID pesan terakhir
    chatState.userMessageId = message.id;

    // Tambahkan pesan ke state
    chatState.messages.push(message);

    try {
      // Tampilkan pesan pengguna menggunakan standalone bubble
      const userBubble = window.standaloneBubble.showMessage(message);

      // Simpan referensi ke elemen bubble
      chatState.userBubbleElement = userBubble;

      // Tampilkan indikator mengetik untuk respons
      const typingBubble = window.standaloneBubble.showTypingIndicator();

      // Simpan referensi ke elemen bubble respons
      chatState.responseBubbleElement = typingBubble;
    } catch (error) {
      console.error('Error saat menampilkan bubble pengguna:', error);
    }

  } else {
    // Jika pesan dari asisten
    // Cek apakah ini pesan yang sama dengan pesan terakhir
    if (chatState.assistantMessageId === message.id && !message.streaming) {
      console.log('Pesan asisten yang sama, tidak perlu update UI');
      return; // Jangan lakukan apa-apa jika pesan sama dan bukan streaming
    }

    // Simpan ID pesan terakhir
    chatState.assistantMessageId = message.id;

    // Tambahkan pesan ke state jika belum ada
    if (!chatState.messages.some(m => m.id === message.id)) {
      chatState.messages.push(message);
    }

    try {
      // Cek apakah ini pesan streaming
      if (message.streaming) {
        console.log('Menangani pesan streaming dengan ID:', message.id);

        // Cek apakah ada bubble respons
        if (chatState.responseBubbleElement) {
          console.log('Menggunakan bubble respons yang sudah ada untuk streaming');

          // Pastikan bubble masih ada di DOM
          if (!document.body.contains(chatState.responseBubbleElement)) {
            console.warn('Bubble respons tidak lagi ada di DOM, membuat bubble baru');
            const typingBubble = window.standaloneBubble.showTypingIndicator();
            chatState.responseBubbleElement = typingBubble;
          }

          // Update ID pesan pada bubble yang ada
          chatState.responseBubbleElement.dataset.messageId = message.id;
        } else {
          console.log('Tidak ada bubble respons, membuat typing indicator baru');
          // Buat bubble baru dengan indikator mengetik
          try {
            const typingBubble = window.standaloneBubble.showTypingIndicator();

            // Pastikan bubble berhasil dibuat
            if (!typingBubble) {
              console.error('Gagal membuat typing bubble, typingBubble adalah null atau undefined');
              // Coba buat bubble normal sebagai fallback
              const fallbackBubble = window.standaloneBubble.showMessage({
                id: message.id,
                text: 'Memproses...',
                isUser: false,
                timestamp: new Date().toISOString()
              });
              chatState.responseBubbleElement = fallbackBubble;
            } else {
              // Simpan referensi ke elemen bubble respons
              chatState.responseBubbleElement = typingBubble;
            }
          } catch (typingError) {
            console.error('Error saat membuat typing indicator:', typingError);

            // Coba buat bubble normal sebagai fallback
            try {
              const fallbackBubble = window.standaloneBubble.showMessage({
                id: message.id,
                text: 'Memproses...',
                isUser: false,
                timestamp: new Date().toISOString()
              });
              chatState.responseBubbleElement = fallbackBubble;
            } catch (fallbackError) {
              console.error('Error saat membuat bubble fallback:', fallbackError);
            }
          }
        }
      } else {
        // Jika bukan pesan streaming (pesan normal)
        if (chatState.responseBubbleElement) {
          console.log('Menampilkan respons asisten normal');

          // Pastikan bubble masih ada di DOM
          if (!document.body.contains(chatState.responseBubbleElement)) {
            console.warn('Bubble respons tidak lagi ada di DOM, membuat bubble baru');
            const assistantBubble = window.standaloneBubble.showMessage(message);
            chatState.responseBubbleElement = assistantBubble;
          } else {
            // Update konten bubble yang ada
            try {
              window.standaloneBubble.updateBubbleContent(
                chatState.responseBubbleElement.dataset.messageId,
                message.text
              );
              console.log('Konten bubble berhasil diperbarui');
            } catch (updateError) {
              console.error('Error saat memperbarui konten bubble:', updateError);

              // Coba buat bubble baru jika update gagal
              try {
                const assistantBubble = window.standaloneBubble.showMessage(message);
                chatState.responseBubbleElement = assistantBubble;
              } catch (newBubbleError) {
                console.error('Error saat membuat bubble baru:', newBubbleError);
              }
            }
          }
        } else {
          console.log('Tidak ada response bubble, membuat bubble baru');
          // Jika tidak ada response bubble, buat bubble baru
          try {
            const assistantBubble = window.standaloneBubble.showMessage(message);

            // Pastikan bubble berhasil dibuat
            if (!assistantBubble) {
              console.error('Gagal membuat assistant bubble, assistantBubble adalah null atau undefined');
            } else {
              // Simpan referensi ke elemen bubble
              chatState.responseBubbleElement = assistantBubble;
              console.log('Bubble asisten baru berhasil dibuat');
            }
          } catch (error) {
            console.error('Error saat membuat bubble asisten baru:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error saat menampilkan bubble asisten:', error);
      console.error('Detail error:', error.stack);
    }
  }
}

// Toggle voice visualization
function toggleVoiceVisualization(show) {
  if (show) {
    voiceVisualizer.style.display = 'flex';
    startVisualization();
  } else {
    voiceVisualizer.style.display = 'none';
    stopVisualization();
  }
}

// Menampilkan hasil tool di UI
function displayToolResult(messageId, toolName, toolParams, toolResult) {
  // Cari bubble pesan yang sesuai dengan messageId
  const messageBubble = document.querySelector(`.message-bubble[data-message-id="${messageId}"]`);

  if (!messageBubble) {
    console.error(`Bubble pesan dengan ID ${messageId} tidak ditemukan`);
    return;
  }

  // Buat elemen untuk menampilkan hasil tool
  const toolResultElement = document.createElement('div');
  toolResultElement.className = 'tool-result';

  // Tambahkan header tool
  const toolHeader = document.createElement('div');
  toolHeader.className = 'tool-header';

  // Tentukan ikon berdasarkan jenis tool
  let toolIcon = '🔧'; // Default icon
  if (toolName === 'get_weather') {
    toolIcon = '🌤️';
  } else if (toolName === 'web_search') {
    toolIcon = '🔍';
  } else if (toolName === 'get_current_time') {
    toolIcon = '⏰';
  } else if (toolName === 'take_screenshot') {
    toolIcon = '📷';
  } else if (toolName === 'open_application') {
    toolIcon = '🖥️';
  } else if (toolName === 'get_running_applications') {
    toolIcon = '📋';
  } else if (toolName === 'activate_camera') {
    toolIcon = '📹';
  } else if (toolName === 'deactivate_camera') {
    toolIcon = '📹';
  } else if (toolName === 'capture_image') {
    toolIcon = '📸';
  } else if (toolName === 'analyze_image') {
    toolIcon = '🔍';
  } else if (toolName === 'get_news') {
    toolIcon = '📰';
  } else if (toolName === 'get_calendar') {
    toolIcon = '📅';
  } else if (toolName === 'get_currency') {
    toolIcon = '💱';
  } else if (toolName === 'get_stocks') {
    toolIcon = '📈';
  } else if (toolName === 'get_travel_time') {
    toolIcon = '🚗';
  }

  toolHeader.innerHTML = `
    <span class="tool-icon">${toolIcon}</span>
    <span class="tool-name">${formatToolName(toolName)}</span>
  `;

  // Tambahkan konten tool berdasarkan jenis tool
  const toolContent = document.createElement('div');
  toolContent.className = 'tool-content';

  if (toolName === 'get_weather' && toolResult.success) {
    const weatherData = toolResult.result;
    toolContent.innerHTML = `
      <div class="weather-result">
        <div class="weather-location">${weatherData.location}</div>
        <div class="weather-main">
          <span class="weather-temp">${weatherData.temperature}°C</span>
          <span class="weather-condition">${weatherData.condition}</span>
        </div>
        <div class="weather-details">
          <div>Kelembaban: ${weatherData.humidity}%</div>
          <div>Angin: ${weatherData.wind}</div>
          <div>Diperbarui: ${weatherData.lastUpdated}</div>
        </div>
        ${weatherData.note ? `<div class="weather-note">${weatherData.note}</div>` : ''}
      </div>
    `;
  } else if (toolName === 'web_search' && toolResult.success) {
    const searchData = toolResult.result;
    let resultsHtml = '';

    searchData.results.forEach(result => {
      resultsHtml += `
        <div class="search-result-item">
          <a href="${result.url}" target="_blank" class="search-result-title">${result.title}</a>
          <div class="search-result-snippet">${result.snippet}</div>
        </div>
      `;
    });

    toolContent.innerHTML = `
      <div class="search-result">
        <div class="search-query">Hasil pencarian untuk: "${searchData.query}"</div>
        <div class="search-results">${resultsHtml}</div>
        ${searchData.note ? `<div class="search-note">${searchData.note}</div>` : ''}
      </div>
    `;
  } else if (toolName === 'get_current_time' && toolResult.success) {
    const timeData = toolResult.result;
    toolContent.innerHTML = `
      <div class="time-result">
        <div class="time-main">${timeData.time}</div>
        <div class="time-date">${timeData.date}</div>
        <div class="time-timezone">Zona Waktu: ${timeData.timezone}</div>
      </div>
    `;
  } else if (toolName === 'take_screenshot' && toolResult.success) {
    toolContent.innerHTML = createScreenshotWidget(toolResult.result);
  } else if (toolName === 'open_application' && toolResult.success) {
    toolContent.innerHTML = createApplicationWidget(toolResult.result);
  } else if (toolName === 'get_running_applications' && toolResult.success) {
    toolContent.innerHTML = createRunningAppsWidget(toolResult.result);
  } else if ((toolName === 'activate_camera' || toolName === 'deactivate_camera') && toolResult.success) {
    toolContent.innerHTML = createCameraStatusWidget(toolResult.result);
  } else if (toolName === 'capture_image' && toolResult.success) {
    toolContent.innerHTML = createCaptureImageWidget(toolResult.result);
  } else if (toolName === 'analyze_image' && toolResult.success) {
    toolContent.innerHTML = createImageAnalysisWidget(toolResult.result);
  } else if (toolName === 'get_weather' && toolResult.success) {
    toolContent.innerHTML = createWeatherWidget(toolResult.result);
  } else if (toolName === 'get_news' && toolResult.success) {
    toolContent.innerHTML = createNewsWidget(toolResult.result);
  } else if (toolName === 'get_calendar' && toolResult.success) {
    toolContent.innerHTML = createCalendarWidget(toolResult.result);
  } else if (toolName === 'get_currency' && toolResult.success) {
    toolContent.innerHTML = createCurrencyWidget(toolResult.result);
  } else if (toolName === 'get_stocks' && toolResult.success) {
    toolContent.innerHTML = createStocksWidget(toolResult.result);
  } else if (toolName === 'get_travel_time' && toolResult.success) {
    toolContent.innerHTML = createTravelTimeWidget(toolResult.result);
  } else {
    // Tampilkan hasil tool secara generik jika tidak ada format khusus
    toolContent.innerHTML = `
      <div class="generic-tool-result">
        <pre>${JSON.stringify(toolResult.result, null, 2)}</pre>
      </div>
    `;
  }

  // Tambahkan header dan konten ke elemen hasil tool
  toolResultElement.appendChild(toolHeader);
  toolResultElement.appendChild(toolContent);

  // Tambahkan elemen hasil tool ke bubble pesan
  messageBubble.appendChild(toolResultElement);

  // Tidak perlu scroll karena kita menggunakan standalone bubbles
}

// Fungsi untuk memperbarui pesan streaming
function updateStreamingMessage(messageId, chunk, done) {
  try {
    console.log(`Memperbarui pesan streaming ${messageId} dengan chunk:`, chunk, 'done:', done);

    // Pastikan window.standaloneBubble tersedia
    if (!window.standaloneBubble) {
      console.error('standaloneBubble tidak tersedia!');
      return;
    }

    // Cek apakah chunk valid
    if (!chunk && !done) {
      console.warn('Chunk tidak valid dan done=false, tidak ada yang perlu diperbarui');
      return;
    }

    // Cek apakah ada error dalam chunk
    if (chunk && chunk.error) {
      console.error('Error dalam chunk:', chunk.message || 'Unknown error');

      // Tampilkan pesan error di bubble
      try {
        // Jika tidak ada bubble respons, buat baru
        if (!chatState.responseBubbleElement) {
          console.log('Membuat bubble error baru karena tidak ada bubble respons');
          const errorBubble = window.standaloneBubble.showMessage({
            id: messageId,
            text: `Error: ${chunk.message || 'Terjadi kesalahan saat berkomunikasi dengan Gemini API'}`,
            isUser: false,
            timestamp: new Date().toISOString()
          });
          chatState.responseBubbleElement = errorBubble;
        } else {
          console.log('Mengupdate bubble yang ada dengan pesan error');
          // Update bubble yang ada dengan pesan error
          window.standaloneBubble.updateBubbleContent(
            chatState.responseBubbleElement.dataset.messageId || 'typing',
            `Error: ${chunk.message || 'Terjadi kesalahan saat berkomunikasi dengan Gemini API'}`
          );
          chatState.responseBubbleElement.dataset.messageId = messageId;
        }
      } catch (errorDisplayError) {
        console.error('Error saat menampilkan pesan error:', errorDisplayError);
      }

      return;
    }

    // Cek apakah ada bubble respons
    if (!chatState.responseBubbleElement) {
      console.log('Tidak ada bubble respons untuk diperbarui, membuat baru...');

      // Coba buat bubble respons baru jika tidak ada
      try {
        console.log('Membuat bubble respons baru dengan pesan langsung');
        // Buat bubble normal langsung dengan teks chunk
        const assistantBubble = window.standaloneBubble.showMessage({
          id: messageId,
          text: chunk || 'Memproses...',
          isUser: false,
          timestamp: new Date().toISOString()
        });

        if (!assistantBubble) {
          console.error('Gagal membuat assistant bubble, assistantBubble adalah null atau undefined');
          return;
        }

        chatState.responseBubbleElement = assistantBubble;
        console.log('Bubble respons baru berhasil dibuat dengan teks:', chunk);
      } catch (createError) {
        console.error('Gagal membuat bubble respons baru:', createError);
        console.error('Detail error:', createError.stack);
        return;
      }
    }

    // Cek apakah ini adalah chunk untuk pesan yang sedang ditampilkan
    if (chatState.responseBubbleElement.dataset.messageId !== messageId &&
        chatState.responseBubbleElement.dataset.messageId !== 'typing') {
      console.warn(`Bubble respons memiliki ID ${chatState.responseBubbleElement.dataset.messageId}, bukan ${messageId}. Mencoba update ID...`);
      chatState.responseBubbleElement.dataset.messageId = messageId;
    }

    // Update ID pesan pada bubble jika masih menggunakan ID typing
    if (chatState.responseBubbleElement.dataset.messageId === 'typing') {
      console.log('Mengubah ID bubble dari "typing" menjadi', messageId);
      chatState.responseBubbleElement.dataset.messageId = messageId;
    }

    // Dapatkan konten saat ini
    let currentContent = '';

    try {
      // Dapatkan elemen konten
      const contentElement = chatState.responseBubbleElement.querySelector('.bubble-content');

      if (!contentElement) {
        console.error('Elemen konten tidak ditemukan di bubble respons');
        return;
      }

      // Cek apakah ini adalah indikator mengetik
      const isTypingIndicator = contentElement.classList.contains('typing-indicator');
      console.log('Elemen konten adalah indikator mengetik:', isTypingIndicator);

      if (!isTypingIndicator) {
        // Jika bukan indikator mengetik, dapatkan teks saat ini
        currentContent = contentElement.textContent || '';
      }

      // Ekstrak teks dari chunk
      let chunkText = '';

      // Inisialisasi objek streamingContent jika belum ada
      if (!chatState.streamingContent) {
        chatState.streamingContent = {};
      }

      // Jika ini adalah chunk pertama, gunakan chunk sebagai konten awal
      if (chatState.streamingContent[messageId] === undefined) {
        console.log('Ini adalah chunk pertama untuk pesan ini, inisialisasi konten');
        chatState.streamingContent[messageId] = '';
      }

      // Jika chunk adalah null atau undefined tapi done=true, kita tetap lanjutkan
      // untuk mengubah indikator mengetik menjadi teks kosong
      if (!chunk && done) {
        console.log('Chunk kosong tapi done=true, mengubah indikator mengetik menjadi teks kosong');
        chunkText = '';
      }
      // Jika chunk adalah string langsung
      else if (typeof chunk === 'string') {
        console.log('Chunk adalah string langsung:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
        chunkText = chunk;
      }
      // Jika chunk adalah objek dengan properti chunk (dari gemini-service.js)
      else if (chunk && typeof chunk === 'object' && chunk.chunk) {
        console.log('Chunk adalah objek dengan properti chunk:', typeof chunk.chunk === 'string' ?
          chunk.chunk.substring(0, 50) + (chunk.chunk.length > 50 ? '...' : '') : 'bukan string');

        if (typeof chunk.chunk === 'string') {
          chunkText = chunk.chunk;
        } else if (typeof chunk.chunk === 'function') {
          try {
            chunkText = chunk.chunk();
          } catch (chunkFuncError) {
            console.error('Error saat memanggil fungsi chunk():', chunkFuncError);
            chunkText = String(chunk.chunk);
          }
        } else {
          chunkText = String(chunk.chunk);
        }
      }
      // Jika chunk adalah objek dengan properti text
      else if (chunk && typeof chunk === 'object' && chunk.text) {
        console.log('Chunk adalah objek dengan properti text:', typeof chunk.text === 'string' ?
          chunk.text.substring(0, 50) + (chunk.text.length > 50 ? '...' : '') : 'bukan string');

        // Cek apakah text adalah fungsi atau string
        if (typeof chunk.text === 'function') {
          try {
            chunkText = chunk.text();
            console.log('Hasil pemanggilan fungsi text():', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
          } catch (textFuncError) {
            console.error('Error saat memanggil fungsi text():', textFuncError);
            console.error('Detail error:', textFuncError.stack);
            chunkText = String(chunk.text);
          }
        } else {
          chunkText = chunk.text;
        }
      }
      // Jika chunk adalah objek dengan properti content
      else if (chunk && typeof chunk === 'object' && chunk.content) {
        console.log('Chunk adalah objek dengan properti content:', typeof chunk.content === 'string' ?
          chunk.content.substring(0, 50) + (chunk.content.length > 50 ? '...' : '') : 'bukan string');

        // Cek apakah content adalah fungsi atau string
        if (typeof chunk.content === 'function') {
          try {
            chunkText = chunk.content();
            console.log('Hasil pemanggilan fungsi content():', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
          } catch (contentFuncError) {
            console.error('Error saat memanggil fungsi content():', contentFuncError);
            console.error('Detail error:', contentFuncError.stack);
            chunkText = String(chunk.content);
          }
        } else {
          chunkText = chunk.content;
        }
      }
      // Jika chunk adalah objek dengan properti parts (array)
      else if (chunk && typeof chunk === 'object' && chunk.parts && Array.isArray(chunk.parts)) {
        console.log('Chunk adalah objek dengan properti parts, jumlah parts:', chunk.parts.length);

        // Ekstrak teks dari setiap part
        chunkText = chunk.parts.map(part => {
          if (typeof part === 'string') return part;
          if (part && part.text) {
            if (typeof part.text === 'function') {
              try {
                return part.text();
              } catch (partTextFuncError) {
                console.error('Error saat memanggil fungsi part.text():', partTextFuncError);
                return String(part.text);
              }
            } else {
              return part.text;
            }
          }
          return '';
        }).join('');

        console.log('Teks yang diekstrak dari parts:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
      }
      // Jika chunk adalah objek dengan properti candidates (dari generateContent)
      else if (chunk && typeof chunk === 'object' && chunk.candidates && Array.isArray(chunk.candidates) && chunk.candidates.length > 0) {
        console.log('Chunk adalah objek dengan properti candidates, jumlah candidates:', chunk.candidates.length);

        const candidate = chunk.candidates[0];
        if (candidate.content && candidate.content.parts) {
          chunkText = candidate.content.parts.map(part => {
            if (typeof part === 'string') return part;
            if (part && part.text) {
              return typeof part.text === 'function' ? part.text() : part.text;
            }
            return '';
          }).join('');
        }

        console.log('Teks yang diekstrak dari candidates:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
      }
      // Jika chunk adalah sesuatu yang lain, coba konversi ke string
      else if (chunk) {
        console.log('Chunk adalah tipe lain, mencoba konversi ke string:', chunk);
        try {
          chunkText = String(chunk);
          console.log('Hasil konversi chunk ke string:', chunkText.substring(0, 50) + (chunkText.length > 50 ? '...' : ''));
        } catch (stringifyError) {
          console.error('Error saat mengkonversi chunk ke string:', stringifyError);
          console.error('Detail error:', stringifyError.stack);
          chunkText = '[Error: Tidak dapat mengkonversi chunk ke string]';
        }
      }

      // Tambahkan chunk ke konten streaming
      chatState.streamingContent[messageId] += chunkText;

      // Dapatkan konten terbaru
      currentContent = chatState.streamingContent[messageId];

      console.log('Konten setelah ditambahkan chunk:', currentContent.substring(0, 50) + (currentContent.length > 50 ? '...' : ''));

      // Update konten bubble
      if (currentContent || done) {
        console.log('Memperbarui konten bubble dengan ID:', chatState.responseBubbleElement.dataset.messageId);

        try {
          // Jika konten kosong tapi streaming selesai, gunakan konten yang sudah ada
          if ((!currentContent || currentContent.trim() === '') && done) {
            // Cek apakah ada konten sebelumnya di bubble
            const existingContent = chatState.responseBubbleElement.querySelector('.bubble-content')?.textContent;

            if (existingContent && existingContent.trim() !== '' &&
                existingContent !== 'Memproses...' &&
                existingContent !== 'Tidak dapat mengekstrak teks dari respons Gemini API') {
              // Gunakan konten yang sudah ada di bubble
              currentContent = existingContent;
              console.log('Menggunakan konten yang sudah ada di bubble:', currentContent.substring(0, 50) + (currentContent.length > 50 ? '...' : ''));
            } else {
              // Jika tidak ada konten yang valid, gunakan pesan default yang lebih ramah
              currentContent = 'Halo! Ada yang bisa saya bantu?';
              console.log('Konten kosong tapi streaming selesai, menampilkan pesan default yang ramah');
            }
          }

          // Pastikan bubble masih ada di DOM
          if (!document.body.contains(chatState.responseBubbleElement)) {
            console.warn('Bubble tidak lagi ada di DOM, membuat bubble baru');
            const newBubble = window.standaloneBubble.showMessage({
              id: messageId,
              text: currentContent,
              isUser: false,
              timestamp: new Date().toISOString()
            });
            chatState.responseBubbleElement = newBubble;
            console.log('Bubble baru berhasil dibuat dengan konten:', currentContent.substring(0, 50) + (currentContent.length > 50 ? '...' : ''));
          } else {
            // Update konten bubble yang ada
            console.log('Mengupdate konten bubble yang ada');
            window.standaloneBubble.updateBubbleContent(
              chatState.responseBubbleElement.dataset.messageId,
              currentContent
            );
            console.log('Konten bubble berhasil diperbarui');
          }
        } catch (updateError) {
          console.error('Error saat memperbarui konten bubble:', updateError);
          console.error('Detail error:', updateError.stack);

          // Coba buat bubble baru sebagai fallback jika update gagal
          try {
            console.log('Mencoba membuat bubble baru sebagai fallback setelah error update');
            const fallbackBubble = window.standaloneBubble.showMessage({
              id: messageId,
              text: currentContent || 'Respons dari Gemini API',
              isUser: false,
              timestamp: new Date().toISOString()
            });
            chatState.responseBubbleElement = fallbackBubble;
          } catch (fallbackError) {
            console.error('Gagal membuat bubble fallback setelah error update:', fallbackError);
          }
        }
      }

      // Jika streaming selesai
      if (done) {
        console.log('Streaming selesai, memperbarui state pesan');

        try {
          // Update pesan di state
          const existingMessageIndex = chatState.messages.findIndex(m => m.id === messageId);
          if (existingMessageIndex !== -1) {
            chatState.messages[existingMessageIndex].text = currentContent;
            chatState.messages[existingMessageIndex].streaming = false;
            console.log('Pesan yang ada diperbarui di state');
          } else {
            chatState.messages.push({
              id: messageId,
              isUser: false,
              text: currentContent,
              streaming: false,
              timestamp: new Date().toISOString()
            });
            console.log('Pesan baru ditambahkan ke state');
          }

          // Simpan referensi ke bubble respons terakhir
          if (chatState.responseBubbleElement) {
            chatState.lastResponseBubbleElement = chatState.responseBubbleElement;
          }

          // Reset auto-hide timer jika diaktifkan
          if (chatState.autoHideEnabled) {
            setupAutoHide();
          }
        } catch (stateUpdateError) {
          console.error('Error saat memperbarui state pesan:', stateUpdateError);
          console.error('Detail error:', stateUpdateError.stack);
        }
      }
    } catch (innerError) {
      console.error('Error saat memproses konten streaming:', innerError);
      console.error('Detail error:', innerError.stack);
    }
  } catch (error) {
    console.error('Error saat memperbarui pesan streaming:', error);
    console.error('Detail error:', error.stack);
  }
}

// Format nama tool untuk tampilan
function formatToolName(toolName) {
  // Ubah snake_case menjadi Title Case dengan spasi
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Start visualization
function startVisualization() {
  // Periksa apakah canvas tersedia
  if (!visualizerCanvas) {
    console.error('Visualizer canvas tidak tersedia');
    return;
  }

  try {
    // Dapatkan konteks canvas
    const ctx = visualizerCanvas.getContext('2d');

    // Periksa apakah konteks berhasil didapatkan
    if (!ctx) {
      console.error('Tidak dapat mendapatkan konteks canvas 2D');
      return;
    }

    // Set ukuran canvas
    visualizerCanvas.width = visualizerCanvas.offsetWidth || 300;
    visualizerCanvas.height = visualizerCanvas.offsetHeight || 50;

    // Fungsi untuk menggambar visualisasi
    function drawVisualization() {
      try {
        // Bersihkan canvas
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

        // Konfigurasi visualisasi
        const barCount = 30;
        const barWidth = (visualizerCanvas.width / barCount) - 2;

        // Dapatkan warna dari CSS
        let accentColor = '#ff0066'; // Default fallback
        let primaryColor = '#00c6ff'; // Default fallback

        try {
          accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || accentColor;
          primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || primaryColor;
        } catch (styleError) {
          console.warn('Error saat mendapatkan warna dari CSS:', styleError);
        }

        // Gambar bar
        for (let i = 0; i < barCount; i++) {
          // Generate random height for each bar
          const randomHeight = Math.random() * visualizerCanvas.height * 0.8;

          try {
            // Create gradient for bars
            const gradient = ctx.createLinearGradient(0, 0, 0, visualizerCanvas.height);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(1, primaryColor);

            ctx.fillStyle = gradient;
          } catch (gradientError) {
            console.warn('Error saat membuat gradient:', gradientError);
            ctx.fillStyle = primaryColor; // Fallback ke warna solid
          }

          // Gambar bar
          ctx.fillRect(
            i * (barWidth + 2),
            visualizerCanvas.height - randomHeight,
            barWidth,
            randomHeight
          );
        }

        // Lanjutkan animasi
        animationFrame = requestAnimationFrame(drawVisualization);
      } catch (drawError) {
        console.error('Error saat menggambar visualisasi:', drawError);
        stopVisualization(); // Hentikan animasi jika terjadi error
      }
    }

    // Mulai animasi
    drawVisualization();
  } catch (error) {
    console.error('Error saat memulai visualisasi:', error);
  }
}

// Stop visualization
function stopVisualization() {
  try {
    // Batalkan animasi jika ada
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    // Bersihkan canvas jika tersedia
    if (visualizerCanvas) {
      const ctx = visualizerCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      }
    }
  } catch (error) {
    console.error('Error saat menghentikan visualisasi:', error);
  }
}

// Toggle menu section
function toggleMenuSection(section) {
  if (activeSection === section) {
    // Close the section if it's already open
    menuSections.forEach(s => {
      if (s.classList.contains(section + '-section')) {
        s.classList.remove('active');
      }
    });
    activeSection = null;
  } else {
    // Close all sections
    menuSections.forEach(s => {
      s.classList.remove('active');
    });

    // Open the selected section
    menuSections.forEach(s => {
      if (s.classList.contains(section + '-section')) {
        s.classList.add('active');
      }
    });

    activeSection = section;
  }
}

// Theme management
const themes = {
  default: {
    primaryColor: '#00a8ff',
    primaryColorRgb: '0, 168, 255',
    secondaryColor: '#3d5af1',
    secondaryColorRgb: '61, 90, 241',
    accentColor: '#ff3399',
    accentColorRgb: '255, 51, 153',
    tertiaryColor: '#8c1eff',
    tertiaryColorRgb: '140, 30, 255',
    backgroundColor: 'rgba(20, 25, 40, 0.55)',
    textColor: 'white',
    userBubbleColor: 'rgba(0, 168, 255, 0.55)',
    assistantBubbleColor: 'rgba(0, 168, 255, 0.45)',
    glassBorderColor: 'rgba(255, 255, 255, 0.12)',
    glassShadowColor: 'rgba(0, 0, 0, 0.15)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    glowPrimary: 'rgba(0, 168, 255, 0.5)',
    glowSecondary: 'rgba(140, 30, 255, 0.5)',
    glowAccent: 'rgba(255, 51, 153, 0.5)',
    backgroundImage: 'url("assets/background.jpg")'
  },
  chameleon: {
    primaryColor: '#00a8ff',
    primaryColorRgb: '0, 168, 255',
    secondaryColor: '#3d5af1',
    secondaryColorRgb: '61, 90, 241',
    accentColor: '#ff3399',
    accentColorRgb: '255, 51, 153',
    tertiaryColor: '#8c1eff',
    tertiaryColorRgb: '140, 30, 255',
    backgroundColor: 'rgba(20, 25, 40, 0.55)',
    textColor: 'white',
    userBubbleColor: 'rgba(0, 168, 255, 0.55)',
    assistantBubbleColor: 'rgba(0, 168, 255, 0.45)',
    glassBorderColor: 'rgba(255, 255, 255, 0.12)',
    glassShadowColor: 'rgba(0, 0, 0, 0.15)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    glowPrimary: 'rgba(0, 168, 255, 0.5)',
    glowSecondary: 'rgba(140, 30, 255, 0.5)',
    glowAccent: 'rgba(255, 51, 153, 0.5)',
    backgroundImage: 'none',
    isChameleon: true
  },
  dark: {
    primaryColor: '#9d4edd',
    primaryColorRgb: '157, 78, 221',
    secondaryColor: '#6a00f4',
    secondaryColorRgb: '106, 0, 244',
    accentColor: '#ff5e7d',
    accentColorRgb: '255, 94, 125',
    tertiaryColor: '#480ca8',
    tertiaryColorRgb: '72, 12, 168',
    backgroundColor: 'rgba(10, 10, 20, 0.8)',
    textColor: '#f0f0f0',
    userBubbleColor: 'rgba(157, 78, 221, 0.55)',
    assistantBubbleColor: 'rgba(157, 78, 221, 0.45)',
    glassBorderColor: 'rgba(157, 78, 221, 0.2)',
    glassShadowColor: 'rgba(0, 0, 0, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',
    glowPrimary: 'rgba(157, 78, 221, 0.5)',
    glowSecondary: 'rgba(72, 12, 168, 0.5)',
    glowAccent: 'rgba(255, 94, 125, 0.5)',
    backgroundImage: 'url("assets/background-dark.jpg")'
  },
  light: {
    primaryColor: '#ff6b6b',
    primaryColorRgb: '255, 107, 107',
    secondaryColor: '#ff9e6d',
    secondaryColorRgb: '255, 158, 109',
    accentColor: '#4ecdc4',
    accentColorRgb: '78, 205, 196',
    tertiaryColor: '#ff8364',
    tertiaryColorRgb: '255, 131, 100',
    backgroundColor: 'rgba(250, 250, 250, 0.75)',
    textColor: '#333333',
    userBubbleColor: 'rgba(255, 107, 107, 0.45)',
    assistantBubbleColor: 'rgba(255, 107, 107, 0.35)',
    glassBorderColor: 'rgba(255, 255, 255, 0.4)',
    glassShadowColor: 'rgba(0, 0, 0, 0.05)',
    glassHighlight: 'rgba(255, 255, 255, 0.3)',
    glowPrimary: 'rgba(255, 107, 107, 0.3)',
    glowSecondary: 'rgba(255, 131, 100, 0.3)',
    glowAccent: 'rgba(78, 205, 196, 0.3)',
    backgroundImage: 'url("assets/background-light.jpg")'
  },
  neon: {
    primaryColor: '#0aefff',
    primaryColorRgb: '10, 239, 255',
    secondaryColor: '#00ff9e',
    secondaryColorRgb: '0, 255, 158',
    accentColor: '#fb00ff',
    accentColorRgb: '251, 0, 255',
    tertiaryColor: '#7b00ff',
    tertiaryColorRgb: '123, 0, 255',
    backgroundColor: 'rgba(10, 10, 20, 0.75)',
    textColor: '#ffffff',
    userBubbleColor: 'rgba(10, 239, 255, 0.45)',
    assistantBubbleColor: 'rgba(10, 239, 255, 0.35)',
    glassBorderColor: 'rgba(10, 239, 255, 0.2)',
    glassShadowColor: 'rgba(0, 0, 0, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',
    glowPrimary: 'rgba(10, 239, 255, 0.6)',
    glowSecondary: 'rgba(123, 0, 255, 0.6)',
    glowAccent: 'rgba(251, 0, 255, 0.6)',
    backgroundImage: 'url("assets/background-neon.jpg")'
  },
  ocean: {
    primaryColor: '#00b4d8',
    primaryColorRgb: '0, 180, 216',
    secondaryColor: '#0077b6',
    secondaryColorRgb: '0, 119, 182',
    accentColor: '#ff9e00',
    accentColorRgb: '255, 158, 0',
    tertiaryColor: '#90e0ef',
    tertiaryColorRgb: '144, 224, 239',
    backgroundColor: 'rgba(0, 50, 85, 0.7)',
    textColor: '#ffffff',
    userBubbleColor: 'rgba(0, 180, 216, 0.55)',
    assistantBubbleColor: 'rgba(0, 180, 216, 0.45)',
    glassBorderColor: 'rgba(144, 224, 239, 0.2)',
    glassShadowColor: 'rgba(0, 0, 0, 0.25)',
    glassHighlight: 'rgba(255, 255, 255, 0.1)',
    glowPrimary: 'rgba(0, 180, 216, 0.5)',
    glowSecondary: 'rgba(144, 224, 239, 0.5)',
    glowAccent: 'rgba(255, 158, 0, 0.5)',
    backgroundImage: 'url("assets/background.jpg")'
  },
  sunset: {
    primaryColor: '#ff9e00',
    primaryColorRgb: '255, 158, 0',
    secondaryColor: '#ff5e7d',
    secondaryColorRgb: '255, 94, 125',
    accentColor: '#7209b7',
    accentColorRgb: '114, 9, 183',
    tertiaryColor: '#f72585',
    tertiaryColorRgb: '247, 37, 133',
    backgroundColor: 'rgba(40, 20, 30, 0.65)',
    textColor: '#ffffff',
    userBubbleColor: 'rgba(255, 158, 0, 0.55)',
    assistantBubbleColor: 'rgba(255, 158, 0, 0.45)',
    glassBorderColor: 'rgba(255, 158, 0, 0.15)',
    glassShadowColor: 'rgba(0, 0, 0, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    glowPrimary: 'rgba(255, 158, 0, 0.4)',
    glowSecondary: 'rgba(247, 37, 133, 0.4)',
    glowAccent: 'rgba(114, 9, 183, 0.4)',
    backgroundImage: 'url("assets/background-dark.jpg")'
  },
  forest: {
    primaryColor: '#2ecc71',
    primaryColorRgb: '46, 204, 113',
    secondaryColor: '#27ae60',
    secondaryColorRgb: '39, 174, 96',
    accentColor: '#f39c12',
    accentColorRgb: '243, 156, 18',
    tertiaryColor: '#3498db',
    tertiaryColorRgb: '52, 152, 219',
    backgroundColor: 'rgba(20, 40, 30, 0.65)',
    textColor: '#ffffff',
    userBubbleColor: 'rgba(46, 204, 113, 0.55)',
    assistantBubbleColor: 'rgba(46, 204, 113, 0.45)',
    glassBorderColor: 'rgba(46, 204, 113, 0.15)',
    glassShadowColor: 'rgba(0, 0, 0, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    glowPrimary: 'rgba(46, 204, 113, 0.4)',
    glowSecondary: 'rgba(52, 152, 219, 0.4)',
    glowAccent: 'rgba(243, 156, 18, 0.4)',
    backgroundImage: 'url("assets/background-light.jpg")'
  },
  midnight: {
    primaryColor: '#2c0735',
    primaryColorRgb: '44, 7, 53',
    secondaryColor: '#5204a8',
    secondaryColorRgb: '82, 4, 168',
    accentColor: '#00f2ff',
    accentColorRgb: '0, 242, 255',
    tertiaryColor: '#7400b8',
    tertiaryColorRgb: '116, 0, 184',
    backgroundColor: 'rgba(5, 5, 15, 0.85)',
    textColor: '#e0e0ff',
    userBubbleColor: 'rgba(82, 4, 168, 0.6)',
    assistantBubbleColor: 'rgba(82, 4, 168, 0.5)',
    glassBorderColor: 'rgba(0, 242, 255, 0.15)',
    glassShadowColor: 'rgba(0, 0, 0, 0.4)',
    glassHighlight: 'rgba(0, 242, 255, 0.05)',
    glowPrimary: 'rgba(82, 4, 168, 0.5)',
    glowSecondary: 'rgba(116, 0, 184, 0.5)',
    glowAccent: 'rgba(0, 242, 255, 0.6)',
    backgroundImage: 'url("assets/background-neon.jpg")'
  }
};

// Load theme
function loadTheme() {
  const savedTheme = localStorage.getItem('mamous-theme') || 'default';
  setTheme(savedTheme);

  // Set active theme in UI
  themeOptions.forEach(option => {
    if (option.getAttribute('data-theme') === savedTheme) {
      option.classList.add('active');
    }
  });
}

// Set theme
function setTheme(themeName) {
  if (!themes[themeName]) {
    themeName = 'default';
  }

  const theme = themes[themeName];

  // Apply theme to CSS variables
  document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
  document.documentElement.style.setProperty('--primary-color-rgb', theme.primaryColorRgb);
  document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
  document.documentElement.style.setProperty('--secondary-color-rgb', theme.secondaryColorRgb);
  document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  document.documentElement.style.setProperty('--accent-color-rgb', theme.accentColorRgb);
  document.documentElement.style.setProperty('--tertiary-color', theme.tertiaryColor);
  document.documentElement.style.setProperty('--tertiary-color-rgb', theme.tertiaryColorRgb);
  document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
  document.documentElement.style.setProperty('--text-color', theme.textColor);
  document.documentElement.style.setProperty('--user-bubble-color', theme.userBubbleColor);
  document.documentElement.style.setProperty('--assistant-bubble-color', theme.assistantBubbleColor);
  document.documentElement.style.setProperty('--glass-border-color', theme.glassBorderColor);
  document.documentElement.style.setProperty('--glass-shadow-color', theme.glassShadowColor);
  document.documentElement.style.setProperty('--glass-highlight', theme.glassHighlight);
  document.documentElement.style.setProperty('--glow-primary', theme.glowPrimary);
  document.documentElement.style.setProperty('--glow-secondary', theme.glowSecondary);
  document.documentElement.style.setProperty('--glow-accent', theme.glowAccent);
  document.documentElement.style.setProperty('--background-image', theme.backgroundImage);

  // Save theme to localStorage
  localStorage.setItem('mamous-theme', themeName);

  console.log(`Theme set to ${themeName}`);

  // Jika tema adalah chameleon, mulai interval untuk menyesuaikan warna
  if (theme.isChameleon) {
    startChameleonMode();
  } else {
    stopChameleonMode();
  }
}

// Fungsi untuk mengatur penanganan event mouse
function setupMouseEventHandling() {
  console.log('Setting up mouse event handling');

  // Variabel untuk melacak status
  let isIgnoringMouseEvents = true;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Tambahkan variabel global untuk akses dari luar fungsi
  window.lastMouseX = 0;
  window.lastMouseY = 0;

  // Daftar selector untuk elemen yang perlu diinteraksikan
  const interactiveSelectors = [
    '.input-container',           // Input container
    '.input-container *',         // Semua elemen di dalam input container
    '.standalone-bubble',         // Bubble chat
    '.standalone-bubble *',       // Semua elemen di dalam bubble chat
    '.slide-menu.active',         // Menu yang aktif
    '.slide-menu.active *',       // Semua elemen di dalam menu yang aktif
    '.modal.active',              // Modal yang aktif
    '.modal.active *',            // Semua elemen di dalam modal yang aktif
    '.scroll-controls',           // Kontrol scroll
    '.scroll-controls *',         // Semua elemen di dalam kontrol scroll
    '.window-controls',           // Window controls
    '.window-controls *',         // Semua elemen di dalam window controls
    '.voice-visualizer-container.active', // Voice visualizer saat aktif
    '.voice-visualizer-container.active *' // Semua elemen di dalam voice visualizer saat aktif
  ];

  // Fungsi untuk memeriksa apakah elemen adalah bagian dari elemen interaktif
  function isInteractiveElement(element) {
    if (!element) return false;

    // Periksa apakah elemen adalah bubble content yang sebenarnya, bukan container-nya
    if (element.classList.contains('bubble-content') ||
        element.closest('.bubble-content')) {
      return true;
    }

    // Periksa apakah elemen adalah input container atau elemen di dalamnya
    if (element.classList.contains('input-container') ||
        element.closest('.input-container')) {
      return true;
    }

    // Periksa apakah elemen adalah window controls atau elemen di dalamnya
    if (element.classList.contains('window-controls') ||
        element.closest('.window-controls')) {
      return true;
    }

    // Periksa apakah elemen adalah slide menu yang aktif atau elemen di dalamnya
    if ((element.classList.contains('slide-menu') && element.classList.contains('active')) ||
        element.closest('.slide-menu.active')) {
      return true;
    }

    // Periksa apakah elemen adalah scroll controls yang aktif atau elemen di dalamnya
    if ((element.classList.contains('scroll-controls') && element.classList.contains('active')) ||
        element.closest('.scroll-controls.active')) {
      return true;
    }

    // Periksa apakah elemen adalah elemen interaktif standar
    if (element.tagName === 'BUTTON' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'A' ||
        element.getAttribute('role') === 'button' ||
        element.getAttribute('tabindex') === '0') {
      return true;
    }

    // Periksa apakah elemen atau parent-nya cocok dengan salah satu selector
    for (const selector of interactiveSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    }

    return false;
  }

  // Fungsi untuk memastikan input container selalu dapat diinteraksikan
  function ensureInputContainerInteractive() {
    if (inputContainer) {
      console.log('Memastikan input container dapat diinteraksikan');

      // Pastikan pointer-events diatur ke auto dengan !important
      inputContainer.style.setProperty('pointer-events', 'auto', 'important');
      inputContainer.style.setProperty('z-index', '1000', 'important');

      // Pastikan semua elemen di dalam input container juga dapat diinteraksikan
      const inputChildren = inputContainer.querySelectorAll('*');
      inputChildren.forEach(child => {
        child.style.setProperty('pointer-events', 'auto', 'important');
      });

      // Nonaktifkan ignore mouse events untuk memastikan elemen dapat diklik
      try {
        window.electronAPI.setIgnoreMouseEvents(false);
        console.log('Memastikan ignore mouse events dinonaktifkan untuk interaktivitas');
        isIgnoringMouseEvents = false;
      } catch (error) {
        console.error('Error saat mengatur ignore mouse events:', error);
      }
    }
  }

  // Panggil fungsi untuk memastikan input container interaktif
  ensureInputContainerInteractive();

  // Tambahkan event listener untuk window-ready
  window.electronAPI.on('window-ready', () => {
    console.log('Window ready event diterima');

    // Pastikan input container interaktif setelah window siap
    ensureInputContainerInteractive();

    // Tambahkan delay untuk memastikan elemen UI sudah dimuat dengan benar
    setTimeout(() => {
      ensureInputContainerInteractive();
    }, 500);
  });

  // Tambahkan event listener untuk check-click-through
  window.electronAPI.on('check-click-through', () => {
    console.log('Check click-through event diterima');

    // Periksa apakah mouse berada di atas elemen interaktif
    const elementAtPoint = document.elementFromPoint(
      window.lastMouseX || 0,
      window.lastMouseY || 0
    );

    if (!isInteractiveElement(elementAtPoint)) {
      // Pastikan click-through diaktifkan jika mouse tidak di atas elemen interaktif
      try {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
        console.log('Memastikan click-through aktif untuk area non-interaktif');
      } catch (error) {
        console.error('Error saat mengatur ignore mouse events:', error);
      }
    }
  });

  // Simpan posisi mouse terakhir
  document.addEventListener('mousemove', (event) => {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    // Update variabel global
    window.lastMouseX = event.clientX;
    window.lastMouseY = event.clientY;

    // Debug: Log elemen di bawah kursor
    if (event.altKey && event.shiftKey) {
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      console.log('Element at point:', elementAtPoint);
      if (elementAtPoint) {
        console.log('Element classes:', elementAtPoint.className);
        console.log('Element style:', elementAtPoint.style.cssText);
        console.log('Element computed style pointer-events:', getComputedStyle(elementAtPoint).pointerEvents);

        // Log parent elements
        let parent = elementAtPoint.parentElement;
        let parentChain = [];
        while (parent) {
          parentChain.push({
            tag: parent.tagName,
            id: parent.id,
            class: parent.className,
            pointerEvents: getComputedStyle(parent).pointerEvents
          });
          parent = parent.parentElement;
        }
        console.log('Parent chain:', parentChain);
      }
    }
  });

  // Tambahkan event listener untuk mousemove
  document.addEventListener('mousemove', (event) => {
    // Periksa apakah mouse berada di atas elemen interaktif
    if (isInteractiveElement(event.target)) {
      // Jika mouse di atas elemen interaktif, nonaktifkan ignore mouse events
      if (isIgnoringMouseEvents) {
        try {
          window.electronAPI.setIgnoreMouseEvents(false);
          console.log('Mouse over interactive element, disabling click-through');
          isIgnoringMouseEvents = false;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      }
    } else {
      // Jika mouse tidak di atas elemen interaktif, aktifkan ignore mouse events dengan forward
      if (!isIgnoringMouseEvents) {
        try {
          window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          console.log('Mouse over non-interactive area, enabling click-through');
          isIgnoringMouseEvents = true;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      }
    }
  });

  // Tambahkan event listener untuk wheel (scroll)
  document.addEventListener('wheel', (event) => {
    // Periksa apakah scroll terjadi pada elemen interaktif
    if (isInteractiveElement(event.target)) {
      // Pastikan ignore mouse events dinonaktifkan selama scrolling
      if (isIgnoringMouseEvents) {
        try {
          window.electronAPI.setIgnoreMouseEvents(false);
          console.log('Scrolling on interactive element, disabling click-through');
          isIgnoringMouseEvents = false;

          // Setelah scrolling selesai, periksa kembali posisi mouse
          setTimeout(() => {
            const elementAtPoint = document.elementFromPoint(lastMouseX, lastMouseY);
            if (!isInteractiveElement(elementAtPoint)) {
              try {
                window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
                console.log('After scrolling, mouse over non-interactive area, enabling click-through');
                isIgnoringMouseEvents = true;
              } catch (error) {
                console.error('Error saat mengatur ignore mouse events:', error);
              }
            }
          }, 300); // Delay untuk memastikan scrolling selesai
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      }
    }
  });

  // Tambahkan observer untuk mendeteksi perubahan DOM (bubble baru atau menu dibuka/ditutup)
  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        // Periksa apakah ada perubahan class yang menunjukkan menu dibuka/ditutup
        // atau bubble chat baru ditambahkan
        if (mutation.target.classList &&
            (mutation.target.classList.contains('slide-menu') ||
             mutation.target.classList.contains('standalone-bubble'))) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      // Periksa posisi mouse saat ini
      const elementAtPoint = document.elementFromPoint(lastMouseX, lastMouseY);

      if (isInteractiveElement(elementAtPoint)) {
        try {
          window.electronAPI.setIgnoreMouseEvents(false);
          console.log('DOM changed, mouse over interactive element, disabling click-through');
          isIgnoringMouseEvents = false;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      } else {
        try {
          window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          console.log('DOM changed, mouse over non-interactive area, enabling click-through');
          isIgnoringMouseEvents = true;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      }
    }
  });

  // Mulai observasi pada seluruh document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Tambahkan event listener untuk menu button
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      // Saat menu dibuka, pastikan mouse events tidak diabaikan
      setTimeout(() => {
        if (slideMenu.classList.contains('active')) {
          try {
            window.electronAPI.setIgnoreMouseEvents(false);
            console.log('Menu opened, disabling click-through');
            isIgnoringMouseEvents = false;

            // Tambahkan event listener untuk scroll pada menu content
            const menuContent = document.querySelector('.menu-content');
            if (menuContent) {
              menuContent.addEventListener('scroll', (e) => {
                // Mencegah event scroll menyebar ke elemen lain
                e.stopPropagation();
              });
            }
          } catch (error) {
            console.error('Error saat mengatur ignore mouse events:', error);
          }
        }
      }, 100);
    });
  }

  // Tambahkan event listener untuk close menu button
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
      // Periksa posisi mouse saat menu ditutup
      setTimeout(() => {
        const elementAtPoint = document.elementFromPoint(lastMouseX, lastMouseY);

        if (!isInteractiveElement(elementAtPoint)) {
          try {
            window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
            console.log('Menu closed, mouse over non-interactive area, enabling click-through');
            isIgnoringMouseEvents = true;
          } catch (error) {
            console.error('Error saat mengatur ignore mouse events:', error);
          }
        }
      }, 100);
    });
  }

  // Tambahkan event listener untuk window blur
  window.addEventListener('blur', () => {
    console.log('Window lost focus');

    // Aktifkan click-through saat window kehilangan fokus
    setTimeout(() => {
      try {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
        console.log('Window lost focus, enabling click-through');
        isIgnoringMouseEvents = true;
      } catch (error) {
        console.error('Error saat mengatur ignore mouse events:', error);
      }
    }, 100);
  });

  // Tambahkan event listener untuk window focus
  window.addEventListener('focus', () => {
    console.log('Window gained focus');

    // Periksa posisi mouse saat window mendapatkan fokus
    setTimeout(() => {
      const elementAtPoint = document.elementFromPoint(lastMouseX, lastMouseY);

      if (isInteractiveElement(elementAtPoint)) {
        try {
          window.electronAPI.setIgnoreMouseEvents(false);
          console.log('Window gained focus, mouse over interactive element, disabling click-through');
          isIgnoringMouseEvents = false;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      } else {
        try {
          window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          console.log('Window gained focus, mouse over non-interactive area, enabling click-through');
          isIgnoringMouseEvents = true;
        } catch (error) {
          console.error('Error saat mengatur ignore mouse events:', error);
        }
      }
    }, 100);
  });

  // Tambahkan debug mode dengan Ctrl+Shift+D
  let debugMode = false;
  document.addEventListener('keydown', (event) => {
    // Toggle debug mode dengan Ctrl+Shift+D
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      debugMode = !debugMode;
      if (debugMode) {
        createDebugOverlay();
        console.log('Debug mode activated');

        // Tambahkan click handler untuk debugging
        document.addEventListener('click', debugClickHandler);
      } else {
        removeDebugOverlay();
        console.log('Debug mode deactivated');

        // Hapus click handler
        document.removeEventListener('click', debugClickHandler);
      }
    }
  });

  // Fungsi untuk menangani klik saat debug mode aktif
  function debugClickHandler(event) {
    console.log('Debug click at:', event.clientX, event.clientY);

    // Log semua elemen dari titik klik hingga root
    let element = event.target;
    let path = [];

    while (element) {
      path.push({
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        rect: element.getBoundingClientRect(),
        pointerEvents: getComputedStyle(element).pointerEvents
      });
      element = element.parentElement;
    }

    console.log('Click path:', path);

    // Highlight elemen yang diklik
    if (debugMode) {
      const overlay = document.getElementById('debug-overlay');
      if (overlay) {
        const highlight = document.createElement('div');
        highlight.style.position = 'absolute';
        highlight.style.top = event.clientY + 'px';
        highlight.style.left = event.clientX + 'px';
        highlight.style.width = '10px';
        highlight.style.height = '10px';
        highlight.style.borderRadius = '50%';
        highlight.style.backgroundColor = 'red';
        highlight.style.pointerEvents = 'none';
        highlight.style.zIndex = '10001';

        overlay.appendChild(highlight);

        // Hapus highlight setelah 2 detik
        setTimeout(() => {
          if (overlay.contains(highlight)) {
            overlay.removeChild(highlight);
          }
        }, 2000);
      }
    }
  }

  // Fungsi untuk membuat debug overlay
  function createDebugOverlay() {
    // Hapus overlay yang sudah ada jika ada
    removeDebugOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';

    document.body.appendChild(overlay);

    // Highlight semua elemen interaktif
    highlightInteractiveElements();

    // Tambahkan observer untuk memperbarui highlight saat DOM berubah
    const observer = new MutationObserver(() => {
      highlightInteractiveElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Simpan observer ke overlay untuk dihapus nanti
    overlay.observer = observer;
  }

  // Fungsi untuk menghapus debug overlay
  function removeDebugOverlay() {
    const overlay = document.getElementById('debug-overlay');
    if (overlay) {
      // Hentikan observer jika ada
      if (overlay.observer) {
        overlay.observer.disconnect();
      }
      overlay.remove();
    }
  }

  // Fungsi untuk highlight elemen interaktif
  function highlightInteractiveElements() {
    const overlay = document.getElementById('debug-overlay');
    if (!overlay) return;

    // Hapus semua highlight yang ada
    while (overlay.firstChild) {
      overlay.removeChild(overlay.firstChild);
    }

    // Highlight semua elemen interaktif
    const interactiveElements = [
      ...document.querySelectorAll('.input-container'),
      ...document.querySelectorAll('.bubble-content'),
      ...document.querySelectorAll('.standalone-bubble'),
      ...document.querySelectorAll('.window-controls'),
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('.slide-menu.active'),
      ...document.querySelectorAll('.scroll-controls.active')
    ];

    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const highlight = document.createElement('div');
      highlight.style.position = 'absolute';
      highlight.style.top = rect.top + 'px';
      highlight.style.left = rect.left + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';
      highlight.style.border = '2px solid red';
      highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      highlight.style.pointerEvents = 'none';
      highlight.style.zIndex = '10000';

      // Tambahkan label
      const label = document.createElement('div');
      label.style.position = 'absolute';
      label.style.top = '0';
      label.style.left = '0';
      label.style.backgroundColor = 'black';
      label.style.color = 'white';
      label.style.padding = '2px 5px';
      label.style.fontSize = '10px';
      label.style.whiteSpace = 'nowrap';
      label.textContent = el.className || el.tagName;

      highlight.appendChild(label);
      overlay.appendChild(highlight);
    });
  }

  // Pastikan input container interaktif setiap 5 detik
  setInterval(() => {
    ensureInputContainerInteractive();
  }, 5000);
}

// Fungsi untuk menginisialisasi pengaturan Gemini API
async function initGeminiApiSettings() {
  try {
    // Dapatkan status Gemini API dari main process menggunakan API yang diekspos
    const status = await window.electronAPI.getGeminiStatus();

    // Tampilkan status di UI
    if (status.initialized) {
      showApiStatus('success', 'Gemini API berhasil diinisialisasi');

      // Isi form dengan nilai yang ada
      if (status.apiKey) {
        geminiApiKeyInput.value = '********'; // Jangan tampilkan API key asli
      }

      if (status.model) {
        geminiModelSelect.value = status.model;
      }

      // Set status tools toggle
      if (status.toolsEnabled !== undefined) {
        toolsToggle.checked = status.toolsEnabled;
        toggleText.textContent = status.toolsEnabled ? 'Aktif' : 'Nonaktif';
      }
    } else {
      showApiStatus('info', 'Gemini API belum diinisialisasi. Silakan masukkan API key.');
    }
  } catch (error) {
    console.error('Error saat menginisialisasi pengaturan Gemini API:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menginisialisasi pengaturan Gemini API'}`);
  }
}

// Fungsi untuk mengaktifkan/menonaktifkan tools
async function toggleTools() {
  try {
    const enabled = toolsToggle.checked;
    toggleText.textContent = enabled ? 'Aktif' : 'Nonaktif';

    // Tampilkan status loading
    showApiStatus('info', `${enabled ? 'Mengaktifkan' : 'Menonaktifkan'} tools...`);

    // Kirim status ke main process menggunakan API yang diekspos
    const result = await window.electronAPI.setToolsEnabled(enabled);

    if (result.success) {
      showApiStatus('success', `Tools berhasil ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`);
    } else {
      showApiStatus('error', result.error || `Gagal ${enabled ? 'mengaktifkan' : 'menonaktifkan'} tools`);
      // Kembalikan toggle ke status sebelumnya jika gagal
      toolsToggle.checked = !enabled;
      toggleText.textContent = !enabled ? 'Aktif' : 'Nonaktif';
    }
  } catch (error) {
    console.error('Error saat mengatur status tools:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat mengatur status tools'}`);
    // Kembalikan toggle ke status sebelumnya jika terjadi error
    toolsToggle.checked = !toolsToggle.checked;
    toggleText.textContent = toolsToggle.checked ? 'Aktif' : 'Nonaktif';
  }
}

// Fungsi untuk menginisialisasi ElevenLabs API settings
async function initElevenLabsApiSettings() {
  try {
    // Dapatkan status ElevenLabs API dari main process menggunakan API yang diekspos
    const status = await window.electronAPI.getElevenLabsStatus();

    // Tampilkan status di UI
    if (status.initialized) {
      showApiStatus('success', 'ElevenLabs API berhasil diinisialisasi', 'elevenlabs-status');

      // Isi form dengan nilai yang ada
      if (status.apiKey) {
        if (elevenLabsApiKeyInput) {
          elevenLabsApiKeyInput.value = '********'; // Jangan tampilkan API key asli
        }
      }

      // Dapatkan daftar suara dan isi dropdown
      if (elevenLabsVoiceSelect) {
        try {
          const voices = await window.electronAPI.getElevenLabsVoices();
          if (voices.success) {
            // Kosongkan dropdown terlebih dahulu
            elevenLabsVoiceSelect.innerHTML = '';

            // Tambahkan opsi untuk setiap suara
            voices.voices.forEach(voice => {
              const option = document.createElement('option');
              option.value = voice.voice_id;
              option.textContent = voice.name;
              elevenLabsVoiceSelect.appendChild(option);
            });

            // Pilih suara yang aktif
            if (status.voiceId) {
              elevenLabsVoiceSelect.value = status.voiceId;
            }
          }
        } catch (voicesError) {
          console.error('Error saat mendapatkan daftar suara:', voicesError);
        }
      }

      // Set status TTS toggle
      if (ttsToggle) {
        ttsToggle.checked = isTtsEnabled;
        if (ttsToggleText) {
          ttsToggleText.textContent = isTtsEnabled ? 'Aktif' : 'Nonaktif';
        }
      }

      // Inisialisasi slider kecepatan, pitch, dan volume
      initVoiceSettingsSliders(status);
    } else {
      showApiStatus('info', 'ElevenLabs API belum diinisialisasi. Silakan masukkan API key.', 'elevenlabs-status');
    }
  } catch (error) {
    console.error('Error saat memeriksa status ElevenLabs API:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat memeriksa status ElevenLabs API'}`, 'elevenlabs-status');
  }
}

// Fungsi untuk menginisialisasi slider kecepatan, pitch, dan volume
function initVoiceSettingsSliders(status) {
  // Dapatkan elemen slider
  const speedSlider = document.getElementById('tts-speed');
  const pitchSlider = document.getElementById('tts-pitch');
  const volumeSlider = document.getElementById('tts-volume');
  const speedValue = document.getElementById('tts-speed-value');
  const pitchValue = document.getElementById('tts-pitch-value');
  const volumeValue = document.getElementById('tts-volume-value');
  const resetVoiceSettingsBtn = document.getElementById('reset-voice-settings-btn');

  // Set nilai slider dari status
  if (speedSlider && status.speed !== undefined) {
    speedSlider.value = status.speed;
    if (speedValue) speedValue.textContent = status.speed.toFixed(1);
  }

  if (pitchSlider && status.pitch !== undefined) {
    pitchSlider.value = status.pitch;
    if (pitchValue) pitchValue.textContent = status.pitch.toFixed(1);
  }

  if (volumeSlider && status.volume !== undefined) {
    volumeSlider.value = status.volume;
    if (volumeValue) volumeValue.textContent = status.volume.toFixed(1);
  }

  // Tambahkan event listener untuk slider kecepatan
  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      const speed = parseFloat(speedSlider.value);
      if (speedValue) speedValue.textContent = speed.toFixed(1);
    });

    speedSlider.addEventListener('change', async () => {
      const speed = parseFloat(speedSlider.value);
      try {
        showApiStatus('info', 'Menyimpan pengaturan kecepatan...', 'elevenlabs-status');
        const result = await window.electronAPI.setTtsSpeed(speed);

        if (result.success) {
          showApiStatus('success', 'Pengaturan kecepatan berhasil disimpan', 'elevenlabs-status');
        } else {
          showApiStatus('error', `Error: ${result.error || 'Terjadi kesalahan saat menyimpan pengaturan kecepatan'}`, 'elevenlabs-status');
        }
      } catch (error) {
        console.error('Error saat menyimpan pengaturan kecepatan:', error);
        showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan pengaturan kecepatan'}`, 'elevenlabs-status');
      }
    });
  }

  // Tambahkan event listener untuk slider pitch
  if (pitchSlider) {
    pitchSlider.addEventListener('input', () => {
      const pitch = parseFloat(pitchSlider.value);
      if (pitchValue) pitchValue.textContent = pitch.toFixed(1);
    });

    pitchSlider.addEventListener('change', async () => {
      const pitch = parseFloat(pitchSlider.value);
      try {
        showApiStatus('info', 'Menyimpan pengaturan pitch...', 'elevenlabs-status');
        const result = await window.electronAPI.setTtsPitch(pitch);

        if (result.success) {
          showApiStatus('success', 'Pengaturan pitch berhasil disimpan', 'elevenlabs-status');
        } else {
          showApiStatus('error', `Error: ${result.error || 'Terjadi kesalahan saat menyimpan pengaturan pitch'}`, 'elevenlabs-status');
        }
      } catch (error) {
        console.error('Error saat menyimpan pengaturan pitch:', error);
        showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan pengaturan pitch'}`, 'elevenlabs-status');
      }
    });
  }

  // Tambahkan event listener untuk slider volume
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      const volume = parseFloat(volumeSlider.value);
      if (volumeValue) volumeValue.textContent = volume.toFixed(1);
    });

    volumeSlider.addEventListener('change', async () => {
      const volume = parseFloat(volumeSlider.value);
      try {
        showApiStatus('info', 'Menyimpan pengaturan volume...', 'elevenlabs-status');
        const result = await window.electronAPI.setTtsVolume(volume);

        if (result.success) {
          showApiStatus('success', 'Pengaturan volume berhasil disimpan', 'elevenlabs-status');
        } else {
          showApiStatus('error', `Error: ${result.error || 'Terjadi kesalahan saat menyimpan pengaturan volume'}`, 'elevenlabs-status');
        }
      } catch (error) {
        console.error('Error saat menyimpan pengaturan volume:', error);
        showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan pengaturan volume'}`, 'elevenlabs-status');
      }
    });
  }

  // Tambahkan event listener untuk tombol reset
  if (resetVoiceSettingsBtn) {
    resetVoiceSettingsBtn.addEventListener('click', async () => {
      try {
        showApiStatus('info', 'Mereset pengaturan suara...', 'elevenlabs-status');

        // Reset slider ke nilai default
        if (speedSlider) {
          speedSlider.value = 1.0;
          if (speedValue) speedValue.textContent = '1.0';
          await window.electronAPI.setTtsSpeed(1.0);
        }

        if (pitchSlider) {
          pitchSlider.value = 1.0;
          if (pitchValue) pitchValue.textContent = '1.0';
          await window.electronAPI.setTtsPitch(1.0);
        }

        if (volumeSlider) {
          volumeSlider.value = 1.0;
          if (volumeValue) volumeValue.textContent = '1.0';
          await window.electronAPI.setTtsVolume(1.0);
        }

        showApiStatus('success', 'Pengaturan suara berhasil direset', 'elevenlabs-status');
      } catch (error) {
        console.error('Error saat mereset pengaturan suara:', error);
        showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat mereset pengaturan suara'}`, 'elevenlabs-status');
      }
    });
  }
}

// Fungsi untuk memutar audio TTS
async function playTTS(text, options = {}) {
  if (!isTtsEnabled) return;

  try {
    // Tampilkan indikator status
    showStatusIndicator('processing', 'Menghasilkan audio...', 5000);

    // Periksa apakah streaming diaktifkan
    const useStreaming = options.streaming !== undefined ? options.streaming : true;

    if (useStreaming) {
      // Gunakan streaming untuk pemutaran yang lebih cepat
      return playStreamingTTS(text, options);
    } else {
      // Gunakan metode non-streaming (download penuh)
      const result = await window.electronAPI.generateSpeech(text, options);

      if (!result.success) {
        console.error('Error saat menghasilkan audio:', result.error);
        showStatusIndicator('error', `Error: ${result.error}`, 5000);
        return;
      }

      // Tambahkan audio ke antrian
      audioQueue.push(result.audioPath);

      // Mulai pemutaran jika belum ada audio yang diputar
      if (!isAudioPlaying) {
        playNextAudio();
      }

      return result;
    }
  } catch (error) {
    console.error('Error saat memutar TTS:', error);
    showStatusIndicator('error', `Error: ${error.message || 'Terjadi kesalahan saat memutar TTS'}`, 5000);
  }
}

// Fungsi untuk memutar audio TTS dengan streaming
async function playStreamingTTS(text, options = {}) {
  if (!isTtsEnabled) return;

  try {
    // Tampilkan indikator status
    showStatusIndicator('processing', 'Menghasilkan audio streaming...', 5000);

    // Inisialisasi AudioContext jika belum ada
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Mulai streaming
    const result = await window.electronAPI.generateSpeechStream(text, options);

    if (!result.success) {
      console.error('Error saat memulai streaming audio:', result.error);
      showStatusIndicator('error', `Error: ${result.error}`, 5000);
      return;
    }

    // Simpan informasi stream
    const streamId = result.streamId;
    activeStreams[streamId] = {
      chunks: [],
      isPlaying: false,
      audioBuffers: [],
      currentSource: null,
      currentBuffer: 0,
      fromCache: false
    };

    // Daftarkan listener untuk chunk audio
    const chunkListener = (event, data) => {
      // Periksa apakah chunk ini untuk stream yang aktif
      if (data.streamId !== streamId) return;

      // Jika stream sudah dihentikan, jangan lakukan apa-apa
      if (data.stopped) {
        stopStreamingTTS(streamId);
        return;
      }

      // Jika chunk dari cache, tandai stream sebagai dari cache
      if (data.fromCache) {
        activeStreams[streamId].fromCache = true;
      }

      // Jika ini adalah chunk terakhir
      if (data.done) {
        console.log('Streaming selesai:', streamId);

        // Jika dari cache dan belum mulai memutar, mulai pemutaran
        if (activeStreams[streamId].fromCache && !activeStreams[streamId].isPlaying && activeStreams[streamId].chunks.length > 0) {
          playStreamingAudio(streamId);
        }

        // Hapus listener setelah streaming selesai
        window.electronAPI.removeSpeechStreamChunkListener(chunkListener);
        return;
      }

      // Tambahkan chunk ke array
      if (data.chunk) {
        activeStreams[streamId].chunks.push(data.chunk);

        // Jika ini adalah chunk pertama, mulai pemutaran
        if (activeStreams[streamId].chunks.length === 1 && !activeStreams[streamId].isPlaying) {
          playStreamingAudio(streamId);
        }
      }
    };

    // Daftarkan listener
    window.electronAPI.onSpeechStreamChunk(chunkListener);

    // Tampilkan indikator status
    showStatusIndicator('success', 'Streaming audio dimulai', 3000);

    return {
      success: true,
      streamId,
      message: 'Streaming audio dimulai'
    };
  } catch (error) {
    console.error('Error saat memutar streaming TTS:', error);
    showStatusIndicator('error', `Error: ${error.message || 'Terjadi kesalahan saat memutar streaming TTS'}`, 5000);
  }
}

// Fungsi untuk memutar audio streaming
async function playStreamingAudio(streamId) {
  if (!activeStreams[streamId]) return;

  // Tandai stream sebagai sedang diputar
  activeStreams[streamId].isPlaying = true;

  try {
    // Fungsi untuk memproses chunk audio
    const processChunk = async (chunk) => {
      // Konversi chunk ke ArrayBuffer
      const arrayBuffer = await new Response(new Blob([chunk])).arrayBuffer();

      // Decode audio data
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Tambahkan ke array buffer
        activeStreams[streamId].audioBuffers.push(audioBuffer);

        // Jika ini adalah buffer pertama, mulai pemutaran
        if (activeStreams[streamId].audioBuffers.length === 1) {
          playNextBuffer(streamId);
        }
      } catch (decodeError) {
        console.error('Error saat decode audio data:', decodeError);
      }
    };

    // Proses semua chunk yang sudah ada
    for (const chunk of activeStreams[streamId].chunks) {
      await processChunk(chunk);
    }

    // Kosongkan array chunks setelah diproses
    activeStreams[streamId].chunks = [];

    // Fungsi untuk memproses chunk baru
    activeStreams[streamId].processNewChunk = async (chunk) => {
      await processChunk(chunk);
    };
  } catch (error) {
    console.error('Error saat memutar streaming audio:', error);
    showStatusIndicator('error', `Error: ${error.message || 'Terjadi kesalahan saat memutar streaming audio'}`, 5000);
  }
}

// Fungsi untuk memutar buffer audio berikutnya
function playNextBuffer(streamId) {
  if (!activeStreams[streamId]) return;

  const stream = activeStreams[streamId];

  // Jika tidak ada buffer lagi, selesai
  if (stream.currentBuffer >= stream.audioBuffers.length) {
    // Jika masih ada chunk yang belum diproses, tunggu
    if (stream.chunks.length > 0) {
      return;
    }

    // Jika tidak ada chunk lagi dan semua buffer sudah diputar, hapus stream
    delete activeStreams[streamId];
    return;
  }

  // Ambil buffer berikutnya
  const audioBuffer = stream.audioBuffers[stream.currentBuffer];

  // Buat source baru
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  // Simpan referensi ke source
  stream.currentSource = source;
  streamSources[streamId] = source;

  // Tambahkan event listener untuk saat audio selesai
  source.onended = () => {
    // Hapus referensi ke source
    stream.currentSource = null;
    delete streamSources[streamId];

    // Increment counter
    stream.currentBuffer++;

    // Putar buffer berikutnya
    playNextBuffer(streamId);
  };

  // Putar audio
  source.start(0);
  console.log(`Memutar buffer ${stream.currentBuffer} untuk stream ${streamId}`);
}

// Fungsi untuk menghentikan pemutaran audio streaming
function stopStreamingTTS(streamId) {
  if (!activeStreams[streamId]) return;

  // Hentikan source yang sedang diputar
  if (streamSources[streamId]) {
    try {
      streamSources[streamId].stop();
    } catch (error) {
      console.error('Error saat menghentikan source:', error);
    }
    delete streamSources[streamId];
  }

  // Hapus stream
  delete activeStreams[streamId];

  console.log(`Streaming TTS ${streamId} dihentikan`);
}

// Fungsi untuk memutar audio berikutnya dalam antrian
function playNextAudio() {
  if (audioQueue.length === 0) {
    isAudioPlaying = false;
    return;
  }

  isAudioPlaying = true;
  const audioPath = audioQueue.shift();

  // Buat elemen audio baru
  currentAudio = new Audio(`file://${audioPath}`);

  // Tambahkan event listener untuk saat audio selesai
  currentAudio.addEventListener('ended', () => {
    // Hapus referensi ke audio saat ini
    currentAudio = null;

    // Putar audio berikutnya dalam antrian
    playNextAudio();
  });

  // Tambahkan event listener untuk error
  currentAudio.addEventListener('error', (e) => {
    console.error('Error saat memutar audio:', e);
    showStatusIndicator('error', 'Error saat memutar audio', 5000);

    // Hapus referensi ke audio saat ini
    currentAudio = null;

    // Putar audio berikutnya dalam antrian
    playNextAudio();
  });

  // Putar audio
  currentAudio.play()
    .then(() => {
      console.log('Audio mulai diputar');
    })
    .catch(error => {
      console.error('Error saat memutar audio:', error);
      showStatusIndicator('error', `Error: ${error.message || 'Terjadi kesalahan saat memutar audio'}`, 5000);

      // Hapus referensi ke audio saat ini
      currentAudio = null;

      // Putar audio berikutnya dalam antrian
      playNextAudio();
    });
}

// Fungsi untuk menghentikan pemutaran audio
function stopTTS() {
  // Hentikan audio non-streaming
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Kosongkan antrian
  audioQueue = [];
  isAudioPlaying = false;

  // Hentikan semua streaming audio
  Object.keys(activeStreams).forEach(streamId => {
    stopStreamingTTS(streamId);
  });

  // Hentikan semua source yang sedang diputar
  Object.keys(streamSources).forEach(streamId => {
    try {
      streamSources[streamId].stop();
    } catch (error) {
      console.error('Error saat menghentikan source:', error);
    }
    delete streamSources[streamId];
  });
}

// Fungsi untuk menampilkan status API
function showApiStatus(type, message, elementId = 'api-status') {
  const statusElement = document.getElementById(elementId);
  if (!statusElement) return;

  // Hapus semua class status
  statusElement.classList.remove('info', 'success', 'error', 'warning');

  // Tambahkan class sesuai tipe
  statusElement.classList.add(type);

  // Atur pesan
  statusElement.textContent = message;

  // Tampilkan status
  statusElement.style.display = 'block';
}

// Fungsi untuk menginisialisasi MCP servers
async function initMcpServers() {
  try {
    // Dapatkan daftar MCP servers dari main process menggunakan API yang diekspos
    const mcpServers = await window.electronAPI.getMcpServers();

    // Tampilkan daftar MCP servers
    renderMcpServersList(mcpServers);
  } catch (error) {
    console.error('Error saat menginisialisasi MCP servers:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menginisialisasi MCP servers'}`);
  }
}

// Fungsi untuk membuat widget screenshot
function createScreenshotWidget(result) {
  if (!result.success) {
    return `
      <div class="screenshot-error">
        <div class="error-message">Error: ${result.error || 'Gagal mengambil screenshot'}</div>
      </div>
    `;
  }

  return `
    <div class="screenshot-result">
      <div class="screenshot-image-container">
        <img src="${result.screenshot}" alt="Screenshot" class="screenshot-image" />
      </div>
      <div class="screenshot-info">
        <div class="screenshot-timestamp">Diambil pada: ${new Date().toLocaleString()}</div>
      </div>
    </div>
  `;
}

// Variabel untuk menyimpan interval chameleon
let chameleonInterval = null;

// Fungsi untuk memulai mode chameleon
function startChameleonMode() {
  // Hentikan interval sebelumnya jika ada
  stopChameleonMode();

  console.log('Memulai mode Chameleon...');

  // Ambil screenshot dan analisis warna setiap 3 detik
  chameleonInterval = setInterval(updateChameleonColors, 3000);

  // Jalankan sekali saat pertama kali diaktifkan
  updateChameleonColors();
}

// Fungsi untuk menghentikan mode chameleon
function stopChameleonMode() {
  if (chameleonInterval) {
    clearInterval(chameleonInterval);
    chameleonInterval = null;
    console.log('Mode Chameleon dihentikan');
  }
}

// Fungsi untuk mengupdate warna chameleon berdasarkan screenshot
async function updateChameleonColors() {
  try {
    console.log('Mengupdate warna Chameleon...');

    // Ambil screenshot melalui IPC
    const result = await window.electronAPI.takeScreenshot();

    if (!result.success) {
      console.error('Gagal mengambil screenshot untuk Chameleon:', result.error);
      return;
    }

    // Analisis warna dominan dari screenshot
    const dominantColors = await analyzeDominantColors(result.screenshot);

    // Terapkan warna dominan ke tema
    applyChameleonColors(dominantColors);

  } catch (error) {
    console.error('Error saat mengupdate warna Chameleon:', error);
  }
}

// Fungsi untuk menganalisis warna dominan dari gambar
function analyzeDominantColors(imageDataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function() {
      // Buat canvas untuk menganalisis gambar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Ukuran canvas yang lebih kecil untuk performa
      canvas.width = 50;
      canvas.height = 50;

      // Gambar ke canvas dengan ukuran yang lebih kecil
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Ambil data piksel
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Hitung rata-rata warna
      let r = 0, g = 0, b = 0;
      let pixelCount = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        pixelCount++;
      }

      // Rata-rata warna
      const avgR = Math.round(r / pixelCount);
      const avgG = Math.round(g / pixelCount);
      const avgB = Math.round(b / pixelCount);

      // Hitung warna kontras
      const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
      const isDark = brightness < 128;

      // Buat warna kontras
      const contrastR = isDark ? 255 : 0;
      const contrastG = isDark ? 255 : 0;
      const contrastB = isDark ? 255 : 0;

      // Buat warna aksen yang berbeda dari warna dominan
      const accentR = (avgR + 128) % 255;
      const accentG = (avgG + 128) % 255;
      const accentB = (avgB + 128) % 255;

      resolve({
        primary: { r: avgR, g: avgG, b: avgB },
        contrast: { r: contrastR, g: contrastG, b: contrastB },
        accent: { r: accentR, g: accentG, b: accentB },
        isDark
      });
    };

    img.src = imageDataUrl;
  });
}

// Fungsi untuk menerapkan warna chameleon ke tema
function applyChameleonColors(colors) {
  const { primary, contrast, accent, isDark } = colors;

  // Buat warna dalam format CSS
  const primaryColor = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
  const primaryColorRgb = `${primary.r}, ${primary.g}, ${primary.b}`;

  const secondaryColor = `rgb(${Math.round(primary.r * 0.8)}, ${Math.round(primary.g * 0.8)}, ${Math.round(primary.b * 0.8)})`;
  const secondaryColorRgb = `${Math.round(primary.r * 0.8)}, ${Math.round(primary.g * 0.8)}, ${Math.round(primary.b * 0.8)}`;

  const accentColor = `rgb(${accent.r}, ${accent.g}, ${accent.b})`;
  const accentColorRgb = `${accent.r}, ${accent.g}, ${accent.b}`;

  const tertiaryColor = `rgb(${Math.round((primary.r + accent.r) / 2)}, ${Math.round((primary.g + accent.g) / 2)}, ${Math.round((primary.b + accent.b) / 2)})`;
  const tertiaryColorRgb = `${Math.round((primary.r + accent.r) / 2)}, ${Math.round((primary.g + accent.g) / 2)}, ${Math.round((primary.b + accent.b) / 2)}`;

  const textColor = isDark ? 'white' : 'black';
  const backgroundColor = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.3)`;
  const userBubbleColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.5)`;
  const assistantBubbleColor = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`;

  // Terapkan warna ke CSS variables
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--primary-color-rgb', primaryColorRgb);
  document.documentElement.style.setProperty('--secondary-color', secondaryColor);
  document.documentElement.style.setProperty('--secondary-color-rgb', secondaryColorRgb);
  document.documentElement.style.setProperty('--accent-color', accentColor);
  document.documentElement.style.setProperty('--accent-color-rgb', accentColorRgb);
  document.documentElement.style.setProperty('--tertiary-color', tertiaryColor);
  document.documentElement.style.setProperty('--tertiary-color-rgb', tertiaryColorRgb);
  document.documentElement.style.setProperty('--text-color', textColor);
  document.documentElement.style.setProperty('--background-color', backgroundColor);
  document.documentElement.style.setProperty('--user-bubble-color', userBubbleColor);
  document.documentElement.style.setProperty('--assistant-bubble-color', assistantBubbleColor);

  console.log('Warna Chameleon diperbarui:', {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    tertiary: tertiaryColor,
    isDark
  });
}

// Fungsi untuk membuat widget aplikasi
function createApplicationWidget(result) {
  if (!result.success) {
    return `
      <div class="application-error">
        <div class="error-message">Error: ${result.error || 'Gagal membuka aplikasi'}</div>
      </div>
    `;
  }

  return `
    <div class="application-result">
      <div class="application-success">
        <div class="success-icon">✓</div>
        <div class="success-message">${result.message}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget daftar aplikasi yang berjalan
function createRunningAppsWidget(result) {
  if (!result.success) {
    return `
      <div class="running-apps-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan daftar aplikasi'}</div>
      </div>
    `;
  }

  let appsHtml = '';
  if (result.applications && result.applications.length > 0) {
    appsHtml = result.applications.slice(0, 20).map(app => `
      <div class="app-item">
        <div class="app-icon">🖥️</div>
        <div class="app-name">${app}</div>
      </div>
    `).join('');
  } else {
    appsHtml = '<div class="no-apps">Tidak ada aplikasi yang berjalan</div>';
  }

  return `
    <div class="running-apps-result">
      <div class="running-apps-list">
        ${appsHtml}
      </div>
      <div class="running-apps-info">
        <div class="apps-count">Total: ${result.applications ? result.applications.length : 0} aplikasi</div>
        ${result.applications && result.applications.length > 20 ?
          `<div class="apps-more">Menampilkan 20 dari ${result.applications.length} aplikasi</div>` : ''}
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget status kamera
function createCameraStatusWidget(result) {
  if (!result.success) {
    return `
      <div class="camera-error">
        <div class="error-message">Error: ${result.error || 'Gagal mengubah status kamera'}</div>
      </div>
    `;
  }

  return `
    <div class="camera-status-result">
      <div class="camera-status-success">
        <div class="success-icon">✓</div>
        <div class="success-message">${result.message}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget hasil capture image
function createCaptureImageWidget(result) {
  if (!result.success) {
    return `
      <div class="camera-error">
        <div class="error-message">Error: ${result.error || 'Gagal mengambil gambar'}</div>
      </div>
    `;
  }

  return `
    <div class="camera-capture-result">
      <div class="camera-image-container">
        <img src="${result.imageData}" alt="Captured Image" class="camera-image" />
      </div>
      <div class="camera-info">
        <div class="camera-timestamp">Diambil pada: ${new Date().toLocaleString()}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget hasil analisis gambar
function createImageAnalysisWidget(result) {
  if (!result.success) {
    return `
      <div class="camera-error">
        <div class="error-message">Error: ${result.error || 'Gagal menganalisis gambar'}</div>
      </div>
    `;
  }

  return `
    <div class="image-analysis-result">
      <div class="camera-image-container">
        <img src="${result.imageData}" alt="Analyzed Image" class="camera-image" />
      </div>
      <div class="analysis-result">
        <div class="analysis-title">Hasil Analisis:</div>
        <div class="analysis-text">${result.analysis}</div>
      </div>
      <div class="camera-info">
        <div class="camera-timestamp">Dianalisis pada: ${new Date().toLocaleString()}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget cuaca
function createWeatherWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data cuaca'}</div>
      </div>
    `;
  }

  const weatherData = result.result;

  return `
    <div class="weather-result">
      <div class="weather-header">
        <div class="weather-location">${weatherData.location}</div>
        <div class="weather-icon">
          <img src="${weatherData.icon}" alt="${weatherData.condition}" />
        </div>
      </div>
      <div class="weather-main">
        <div class="weather-temp">${weatherData.temperature}°C</div>
        <div class="weather-condition">${weatherData.condition}</div>
        <div class="weather-description">${weatherData.description}</div>
      </div>
      <div class="weather-details">
        <div class="weather-detail-item">
          <span class="detail-label">Terasa seperti:</span>
          <span class="detail-value">${weatherData.feelsLike}°C</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">Kelembaban:</span>
          <span class="detail-value">${weatherData.humidity}%</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">Angin:</span>
          <span class="detail-value">${weatherData.wind}</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">Tekanan:</span>
          <span class="detail-value">${weatherData.pressure}</span>
        </div>
        <div class="weather-detail-item">
          <span class="detail-label">Visibilitas:</span>
          <span class="detail-value">${weatherData.visibility} km</span>
        </div>
      </div>
      <div class="weather-sun-info">
        <div class="sun-info-item">
          <span class="sun-info-label">Matahari terbit:</span>
          <span class="sun-info-value">${weatherData.sunrise}</span>
        </div>
        <div class="sun-info-item">
          <span class="sun-info-label">Matahari terbenam:</span>
          <span class="sun-info-value">${weatherData.sunset}</span>
        </div>
      </div>
      <div class="weather-footer">
        <div class="weather-updated">Diperbarui: ${weatherData.lastUpdated}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget berita
function createNewsWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data berita'}</div>
      </div>
    `;
  }

  const newsData = result.result;
  let articlesHtml = '';

  if (newsData.articles && newsData.articles.length > 0) {
    articlesHtml = newsData.articles.map(article => `
      <div class="news-article">
        ${article.imageUrl ? `
          <div class="article-image">
            <img src="${article.imageUrl}" alt="${article.title}" onerror="this.style.display='none'" />
          </div>
        ` : ''}
        <div class="article-content">
          <div class="article-title">
            <a href="${article.url}" target="_blank">${article.title}</a>
          </div>
          <div class="article-source">${article.source} - ${article.publishedAt}</div>
          <div class="article-description">${article.description || 'Tidak ada deskripsi'}</div>
        </div>
      </div>
    `).join('');
  } else {
    articlesHtml = '<div class="no-articles">Tidak ada artikel yang ditemukan</div>';
  }

  return `
    <div class="news-result">
      <div class="news-header">
        <div class="news-query">${newsData.query}</div>
        <div class="news-count">Ditemukan ${newsData.totalResults} artikel</div>
      </div>
      <div class="news-articles">
        ${articlesHtml}
      </div>
      <div class="news-footer">
        <div class="news-updated">Diperbarui: ${newsData.lastUpdated}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget kalender
function createCalendarWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data kalender'}</div>
      </div>
    `;
  }

  const calendarData = result.result;

  // Buat grid hari
  let daysHtml = '';
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Header hari
  daysHtml += '<div class="calendar-days-header">';
  daysOfWeek.forEach(day => {
    daysHtml += `<div class="day-header">${day}</div>`;
  });
  daysHtml += '</div>';

  // Grid hari
  daysHtml += '<div class="calendar-days-grid">';

  // Tambahkan sel kosong untuk hari-hari sebelum hari pertama bulan
  for (let i = 0; i < calendarData.firstDay; i++) {
    daysHtml += '<div class="day-cell empty"></div>';
  }

  // Tambahkan sel untuk setiap hari dalam bulan
  calendarData.days.forEach(day => {
    const todayClass = day.isToday ? 'today' : '';
    daysHtml += `
      <div class="day-cell ${todayClass}">
        <div class="day-number">${day.day}</div>
        <div class="day-name">${day.weekday}</div>
      </div>
    `;
  });

  daysHtml += '</div>';

  return `
    <div class="calendar-result">
      <div class="calendar-header">
        <div class="calendar-date">${calendarData.date}</div>
      </div>
      <div class="calendar-body">
        ${daysHtml}
      </div>
      <div class="calendar-footer">
        <div class="calendar-updated">Diperbarui: ${calendarData.lastUpdated}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget kurs mata uang
function createCurrencyWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data kurs mata uang'}</div>
      </div>
    `;
  }

  const currencyData = result.result;

  return `
    <div class="currency-result">
      <div class="currency-header">
        <div class="currency-title">Kurs Mata Uang</div>
      </div>
      <div class="currency-body">
        <div class="currency-main">
          <div class="currency-rate">
            <span class="currency-base">1 ${currencyData.base}</span>
            <span class="currency-equals">=</span>
            <span class="currency-target">${currencyData.rate.toFixed(2)} ${currencyData.target}</span>
          </div>
          <div class="currency-inverse-rate">
            <span class="currency-base">1 ${currencyData.target}</span>
            <span class="currency-equals">=</span>
            <span class="currency-target">${currencyData.inverseRate.toFixed(4)} ${currencyData.base}</span>
          </div>
        </div>
      </div>
      <div class="currency-footer">
        <div class="currency-updated">Diperbarui: ${currencyData.lastUpdated}</div>
        <div class="currency-next-update">Pembaruan berikutnya: ${currencyData.nextUpdate}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget saham
function createStocksWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data saham'}</div>
      </div>
    `;
  }

  const stockData = result.result;
  const changeClass = stockData.change >= 0 ? 'positive' : 'negative';
  const changeIcon = stockData.change >= 0 ? '▲' : '▼';

  return `
    <div class="stocks-result">
      <div class="stocks-header">
        <div class="stocks-symbol">${stockData.symbol}</div>
        <div class="stocks-date">Tanggal perdagangan: ${stockData.latestTradingDay}</div>
      </div>
      <div class="stocks-body">
        <div class="stocks-price">${stockData.price.toFixed(2)}</div>
        <div class="stocks-change ${changeClass}">
          <span class="change-icon">${changeIcon}</span>
          <span class="change-value">${stockData.change.toFixed(2)}</span>
          <span class="change-percent">(${stockData.changePercent})</span>
        </div>
      </div>
      <div class="stocks-details">
        <div class="stocks-detail-item">
          <span class="detail-label">Volume:</span>
          <span class="detail-value">${stockData.volume.toLocaleString()}</span>
        </div>
        <div class="stocks-detail-item">
          <span class="detail-label">Penutupan sebelumnya:</span>
          <span class="detail-value">${stockData.previousClose.toFixed(2)}</span>
        </div>
      </div>
      <div class="stocks-footer">
        <div class="stocks-updated">Diperbarui: ${stockData.lastUpdated}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk membuat widget waktu perjalanan
function createTravelTimeWidget(result) {
  if (!result.success) {
    return `
      <div class="widget-error">
        <div class="error-message">Error: ${result.error || 'Gagal mendapatkan data waktu perjalanan'}</div>
      </div>
    `;
  }

  const travelData = result.result;

  // Tentukan ikon berdasarkan mode transportasi
  let modeIcon = '🚗'; // Default: driving
  if (travelData.mode === 'walking') {
    modeIcon = '🚶';
  } else if (travelData.mode === 'bicycling') {
    modeIcon = '🚲';
  } else if (travelData.mode === 'transit') {
    modeIcon = '🚌';
  }

  return `
    <div class="travel-time-result">
      <div class="travel-header">
        <div class="travel-mode-icon">${modeIcon}</div>
        <div class="travel-mode-name">${formatTravelMode(travelData.mode)}</div>
      </div>
      <div class="travel-route">
        <div class="travel-origin">${travelData.origin}</div>
        <div class="travel-arrow">→</div>
        <div class="travel-destination">${travelData.destination}</div>
      </div>
      <div class="travel-info">
        <div class="travel-time">
          <span class="info-label">Waktu:</span>
          <span class="info-value">${travelData.duration}</span>
        </div>
        <div class="travel-distance">
          <span class="info-label">Jarak:</span>
          <span class="info-value">${travelData.distance}</span>
        </div>
      </div>
      <div class="travel-footer">
        <div class="travel-updated">Diperbarui: ${travelData.lastUpdated}</div>
      </div>
    </div>
  `;
}

// Fungsi untuk memformat mode transportasi
function formatTravelMode(mode) {
  switch (mode) {
    case 'driving':
      return 'Berkendara';
    case 'walking':
      return 'Berjalan Kaki';
    case 'bicycling':
      return 'Bersepeda';
    case 'transit':
      return 'Transportasi Umum';
    default:
      return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

// Fungsi untuk menampilkan daftar MCP servers
function renderMcpServersList(servers) {
  // Kosongkan daftar
  mcpServersList.innerHTML = '';

  // Jika tidak ada server, tampilkan pesan
  if (!servers || servers.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'mcp-empty-message';
    emptyMessage.textContent = 'Belum ada MCP server yang dikonfigurasi. Klik tombol "Add MCP Server" untuk menambahkan server baru.';
    mcpServersList.appendChild(emptyMessage);
    return;
  }

  // Tampilkan setiap server
  servers.forEach((server, index) => {
    const serverItem = document.createElement('div');
    serverItem.className = 'mcp-server-item';
    serverItem.dataset.id = index;

    const serverInfo = document.createElement('div');
    serverInfo.className = 'mcp-server-info';

    const serverName = document.createElement('div');
    serverName.className = 'mcp-server-name';
    serverName.textContent = server.name;

    const serverCommand = document.createElement('div');
    serverCommand.className = 'mcp-server-command';
    serverCommand.textContent = `${server.command} ${server.args.join(' ')}`;

    serverInfo.appendChild(serverName);
    serverInfo.appendChild(serverCommand);

    const serverActions = document.createElement('div');
    serverActions.className = 'mcp-server-actions';

    const editButton = document.createElement('button');
    editButton.className = 'edit-server';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Edit server';
    editButton.addEventListener('click', () => editMcpServer(index));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-server';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Delete server';
    deleteButton.addEventListener('click', () => deleteMcpServer(index));

    serverActions.appendChild(editButton);
    serverActions.appendChild(deleteButton);

    serverItem.appendChild(serverInfo);
    serverItem.appendChild(serverActions);

    mcpServersList.appendChild(serverItem);
  });
}

// Fungsi untuk menampilkan modal tambah MCP server
function showMcpModal(serverToEdit = null) {
  // Reset form
  mcpNameInput.value = '';
  mcpCommandInput.value = '';
  mcpArgsInput.value = '';
  mcpEnvInput.value = '{}';

  // Jika ada server yang akan diedit, isi form dengan data server
  if (serverToEdit) {
    mcpNameInput.value = serverToEdit.name;
    mcpCommandInput.value = serverToEdit.command;
    mcpArgsInput.value = serverToEdit.args.join(', ');
    mcpEnvInput.value = JSON.stringify(serverToEdit.env || {}, null, 2);

    // Simpan ID server yang diedit
    mcpModal.dataset.editId = serverToEdit.id;
  } else {
    // Hapus ID server yang diedit jika ada
    delete mcpModal.dataset.editId;
  }

  // Tampilkan modal
  mcpModal.style.display = 'block';

  // Focus pada input nama
  mcpNameInput.focus();
}

// Fungsi untuk menyembunyikan modal tambah MCP server
function hideMcpModal() {
  mcpModal.style.display = 'none';
}

// Fungsi untuk menyimpan MCP server
async function saveMcpServer() {
  try {
    // Validasi input
    const name = mcpNameInput.value.trim();
    const command = mcpCommandInput.value.trim();
    const argsStr = mcpArgsInput.value.trim();
    const envStr = mcpEnvInput.value.trim();

    if (!name) {
      showApiStatus('error', 'Nama server tidak boleh kosong');
      return;
    }

    if (!command) {
      showApiStatus('error', 'Command tidak boleh kosong');
      return;
    }

    // Parse arguments
    const args = argsStr ? argsStr.split(',').map(arg => arg.trim()) : [];

    // Parse environment variables
    let env = {};
    try {
      env = envStr ? JSON.parse(envStr) : {};
    } catch (error) {
      showApiStatus('error', 'Format environment variables tidak valid. Gunakan format JSON.');
      return;
    }

    // Buat objek server
    const server = {
      name,
      command,
      args,
      env
    };

    // Cek apakah ini edit atau tambah baru
    const editId = mcpModal.dataset.editId;
    let result;

    try {
      if (editId !== undefined) {
        // Edit server yang sudah ada
        server.id = parseInt(editId);
        result = await window.electronAPI.updateMcpServer(server);
      } else {
        // Tambah server baru
        result = await window.electronAPI.addMcpServer(server);
      }
    } catch (error) {
      console.error('Error saat menyimpan MCP server:', error);
      showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan MCP server'}`);
      return;
    }

    if (result.success) {
      // Sembunyikan modal
      hideMcpModal();

      // Tampilkan pesan sukses
      showApiStatus('success', `MCP server berhasil ${editId !== undefined ? 'diperbarui' : 'ditambahkan'}`);

      // Perbarui daftar server
      renderMcpServersList(result.servers);
    } else {
      showApiStatus('error', result.error || `Gagal ${editId !== undefined ? 'memperbarui' : 'menambahkan'} MCP server`);
    }
  } catch (error) {
    console.error('Error saat menyimpan MCP server:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan MCP server'}`);
  }
}

// Fungsi untuk mengedit MCP server
async function editMcpServer(id) {
  try {
    // Dapatkan data server dari main process menggunakan API yang diekspos
    const server = await window.electronAPI.getMcpServer(id);

    if (server) {
      // Tampilkan modal dengan data server
      showMcpModal(server);
    } else {
      showApiStatus('error', 'MCP server tidak ditemukan');
    }
  } catch (error) {
    console.error('Error saat mengedit MCP server:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat mengedit MCP server'}`);
  }
}

// Fungsi untuk menghapus MCP server
async function deleteMcpServer(id) {
  try {
    // Konfirmasi penghapusan
    if (!confirm(`Apakah Anda yakin ingin menghapus MCP server ini?`)) {
      return;
    }

    // Hapus server dari main process menggunakan API yang diekspos
    const result = await window.electronAPI.deleteMcpServer(id);

    if (result.success) {
      // Tampilkan pesan sukses
      showApiStatus('success', 'MCP server berhasil dihapus');

      // Perbarui daftar server
      renderMcpServersList(result.servers);
    } else {
      showApiStatus('error', result.error || 'Gagal menghapus MCP server');
    }
  } catch (error) {
    console.error('Error saat menghapus MCP server:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menghapus MCP server'}`);
  }
}

// Fungsi untuk memvalidasi API key Gemini tanpa menyimpannya
async function validateGeminiApiKey() {
  try {
    const apiKey = geminiApiKeyInput.value.trim();

    if (!apiKey) {
      showApiStatus('error', 'API key tidak boleh kosong');
      return;
    }

    // Tampilkan status loading
    showApiStatus('info', 'Memvalidasi API key...');

    // Kirim API key ke main process untuk validasi menggunakan API yang diekspos
    const result = await window.electronAPI.validateGeminiApiKey(apiKey);

    if (result.valid) {
      showApiStatus('success', 'API key valid dan siap digunakan');
    } else {
      showApiStatus('error', result.message || 'API key tidak valid');
    }
  } catch (error) {
    console.error('Error saat memvalidasi API key:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat memvalidasi API key'}`);
  }
}

// Fungsi untuk menyimpan API key Gemini
async function saveGeminiApiKey() {
  try {
    const apiKey = geminiApiKeyInput.value.trim();

    if (!apiKey) {
      showApiStatus('error', 'API key tidak boleh kosong');
      return;
    }

    // Tampilkan status loading
    showApiStatus('info', 'Menyimpan API key...');

    // Kirim API key ke main process menggunakan API yang diekspos
    const result = await window.electronAPI.setGeminiApiKey(apiKey);

    if (result.success) {
      showApiStatus('success', 'API key berhasil disimpan');
    } else {
      showApiStatus('error', result.message || 'Gagal menyimpan API key');
    }
  } catch (error) {
    console.error('Error saat menyimpan API key:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan API key'}`);
  }
}

// Fungsi untuk menyimpan model Gemini
async function saveGeminiModel() {
  try {
    const model = geminiModelSelect.value;

    if (!model) {
      showApiStatus('error', 'Model tidak boleh kosong');
      return;
    }

    // Tampilkan status loading
    showApiStatus('info', 'Menyimpan model...');

    // Kirim model ke main process menggunakan API yang diekspos
    const result = await window.electronAPI.setGeminiModel(model);

    if (result.success) {
      showApiStatus('success', 'Model berhasil disimpan');
    } else {
      showApiStatus('error', result.message || 'Gagal menyimpan model');
    }
  } catch (error) {
    console.error('Error saat menyimpan model:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat menyimpan model'}`);
  }
}

// Fungsi untuk mereset chat
async function resetGeminiChat() {
  try {
    // Tampilkan status loading
    showApiStatus('info', 'Mereset chat...');

    // Kirim perintah reset chat ke main process menggunakan API yang diekspos
    const result = await window.electronAPI.resetGeminiChat();

    if (result.success) {
      showApiStatus('success', 'Chat berhasil direset');

      // Kosongkan chat container
      chatContainer.innerHTML = '';

      // Sembunyikan chat container
      hideChatContainer();
    } else {
      showApiStatus('error', result.message || 'Gagal mereset chat');
    }
  } catch (error) {
    console.error('Error saat mereset chat:', error);
    showApiStatus('error', `Error: ${error.message || 'Terjadi kesalahan saat mereset chat'}`);
  }
}

// Fungsi untuk menangani pesan streaming
function updateStreamingMessage(messageId, chunk, done) {
  console.log(`updateStreamingMessage: messageId=${messageId}, chunk length=${chunk.length}, done=${done}`);

  try {
    // Coba cari pesan dengan ID yang sesuai menggunakan standalone-bubble
    let messageBubble = document.querySelector(`.standalone-bubble[data-message-id="${messageId}"]`);

    // Jika tidak ditemukan, coba cari dengan class chat-bubble (untuk kompatibilitas)
    if (!messageBubble) {
      messageBubble = document.querySelector(`.chat-bubble[data-message-id="${messageId}"]`);
    }

    // Jika masih tidak ditemukan, gunakan responseBubbleElement dari chatState
    if (!messageBubble && chatState.responseBubbleElement) {
      console.log('Menggunakan responseBubbleElement dari chatState');
      messageBubble = chatState.responseBubbleElement;

      // Update message ID jika perlu
      if (messageBubble.dataset.messageId !== messageId) {
        console.log(`Memperbarui messageId dari ${messageBubble.dataset.messageId} menjadi ${messageId}`);
        messageBubble.dataset.messageId = messageId;
      }
    }

    // Jika masih tidak ditemukan, buat bubble baru
    if (!messageBubble) {
      console.log('Bubble tidak ditemukan, membuat bubble baru');

      try {
        // Buat pesan asisten baru
        const assistantMessage = {
          id: messageId,
          text: chunk || 'Memproses...',
          isUser: false,
          timestamp: new Date().toISOString()
        };

        // Tampilkan pesan menggunakan standalone bubble
        const assistantBubble = window.standaloneBubble.showMessage(assistantMessage);

        if (!assistantBubble) {
          console.error('Gagal membuat bubble baru, showMessage mengembalikan null atau undefined');
          return;
        }

        messageBubble = assistantBubble;
        chatState.responseBubbleElement = assistantBubble;
        console.log('Bubble baru berhasil dibuat dengan ID:', messageId);
      } catch (error) {
        console.error('Error saat membuat bubble baru:', error);
        console.error('Error stack:', error.stack);
        return;
      }
    }

    // Cari elemen konten bubble
    let contentElement = messageBubble.querySelector('.bubble-content');

    // Jika tidak ditemukan, buat elemen konten baru
    if (!contentElement) {
      console.log('Elemen konten tidak ditemukan, membuat elemen konten baru');
      contentElement = document.createElement('div');
      contentElement.className = 'bubble-content';
      messageBubble.appendChild(contentElement);
    }

    // Jika ini adalah indikator mengetik, ubah menjadi konten teks
    if (contentElement.classList.contains('typing-indicator')) {
      console.log('Mengubah typing indicator menjadi konten teks');

      // Hapus semua child nodes dari bubble
      while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
      }

      // Hapus class typing-indicator
      contentElement.classList.remove('typing-indicator');

      // Tambahkan teks chunk pertama
      contentElement.textContent = chunk;
    } else {
      // Tambahkan chunk ke konten yang sudah ada
      if (contentElement.textContent === 'Memproses...') {
        // Jika konten adalah placeholder, ganti dengan chunk
        contentElement.textContent = chunk;
      } else {
        // Tambahkan chunk ke konten yang sudah ada
        contentElement.textContent += chunk;
      }
    }

    // Jika streaming selesai, tandai pesan sebagai selesai
    if (done) {
      console.log('Streaming selesai, menandai pesan sebagai completed');
      messageBubble.classList.add('completed');

      // Update pesan di state
      const messageIndex = chatState.messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        chatState.messages[messageIndex].text = contentElement.textContent;
        chatState.messages[messageIndex].streaming = false;
      } else {
        // Tambahkan pesan ke state jika belum ada
        chatState.messages.push({
          id: messageId,
          text: contentElement.textContent,
          isUser: false,
          timestamp: new Date().toISOString(),
          streaming: false
        });
      }
    }

    // Pastikan bubble terlihat
    messageBubble.style.opacity = '1';
    messageBubble.style.visibility = 'visible';

    // Pastikan bubble memiliki pointer-events: auto
    messageBubble.style.pointerEvents = 'auto';

    // Scroll ke bawah untuk melihat pesan terbaru jika ada chatContainer
    if (typeof chatContainer !== 'undefined' && chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Jika menggunakan virtual scroll, scroll ke bawah
    if (window.virtualScroll && window.virtualScroll.scrollToBottom) {
      window.virtualScroll.scrollToBottom();
    }

    console.log('updateStreamingMessage berhasil diproses');
  } catch (error) {
    console.error('Error dalam updateStreamingMessage:', error);
    console.error('Error stack:', error.stack);

    // Coba fallback dengan membuat bubble baru
    try {
      console.log('Mencoba fallback dengan membuat bubble baru');

      // Buat pesan asisten baru
      const assistantMessage = {
        id: messageId,
        text: chunk || 'Respons dari Gemini API',
        isUser: false,
        timestamp: new Date().toISOString()
      };

      // Tampilkan pesan menggunakan standalone bubble
      const assistantBubble = window.standaloneBubble.showMessage(assistantMessage);

      if (assistantBubble) {
        chatState.responseBubbleElement = assistantBubble;
        console.log('Fallback bubble berhasil dibuat');
      }
    } catch (fallbackError) {
      console.error('Gagal membuat fallback bubble:', fallbackError);
    }
  }
}

// Fungsi untuk menampilkan status indicator
function showStatusIndicator(type, message, duration = 3000) {
  if (!statusIndicator) {
    console.error('Status indicator element tidak ditemukan');
    return;
  }

  console.log(`Menampilkan status indicator: ${type} - ${message} (durasi: ${duration}ms)`);

  // Set tipe status
  statusIndicator.className = 'status-indicator';
  statusIndicator.classList.add(type);

  // Tambahkan ikon berdasarkan tipe
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✓ ';
      break;
    case 'error':
      icon = '✗ ';
      break;
    case 'warning':
      icon = '⚠ ';
      break;
    case 'info':
      icon = 'ℹ ';
      break;
    case 'processing':
      icon = '⟳ ';
      break;
    case 'listening':
      icon = '🎤 ';
      break;
  }

  // Tambahkan ikon ke pesan
  statusIndicator.textContent = icon + message;

  // Tambahkan animasi berdasarkan tipe
  if (type === 'processing' || type === 'listening') {
    statusIndicator.classList.add('animated');
  } else {
    statusIndicator.classList.remove('animated');
  }

  // Tampilkan status indicator
  statusIndicator.style.display = 'block';
  statusIndicator.style.opacity = '1';

  // Sembunyikan setelah durasi tertentu
  if (statusIndicatorTimeout) {
    clearTimeout(statusIndicatorTimeout);
  }

  if (duration > 0) {
    statusIndicatorTimeout = setTimeout(() => {
      hideStatusIndicator();
    }, duration);
  }
}

// Fungsi untuk menyembunyikan status indicator
function hideStatusIndicator() {
  if (!statusIndicator) return;

  // Animasi fade out
  statusIndicator.style.opacity = '0';

  setTimeout(() => {
    statusIndicator.style.display = 'none';
  }, 300);
}

// Fungsi untuk menampilkan status API
function showApiStatus(type, message, duration = 5000) {
  if (!apiStatus) {
    console.error('API status element tidak ditemukan');
    return;
  }

  console.log(`Menampilkan status API: ${type} - ${message} (durasi: ${duration}ms)`);

  // Hapus semua class status
  apiStatus.classList.remove('success', 'error', 'info', 'warning', 'processing');

  // Tambahkan class sesuai tipe
  apiStatus.classList.add(type);

  // Tambahkan ikon berdasarkan tipe
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✓ ';
      break;
    case 'error':
      icon = '✗ ';
      break;
    case 'warning':
      icon = '⚠ ';
      break;
    case 'info':
      icon = 'ℹ ';
      break;
    case 'processing':
      icon = '⟳ ';
      break;
  }

  // Isi pesan dengan ikon
  apiStatus.textContent = icon + message;

  // Tambahkan animasi berdasarkan tipe
  if (type === 'processing') {
    apiStatus.classList.add('animated');
  } else {
    apiStatus.classList.remove('animated');
  }

  // Tampilkan status
  apiStatus.style.display = 'block';
  apiStatus.style.opacity = '1';

  // Sembunyikan status setelah durasi tertentu jika bukan error
  if (type !== 'error' && duration > 0) {
    setTimeout(() => {
      // Animasi fade out
      apiStatus.style.opacity = '0';
      setTimeout(() => {
        apiStatus.style.display = 'none';
      }, 300);
    }, duration);
  }
}

// Fungsi untuk mengatur efek ripple pada tombol
function setupRippleEffect() {
  // Daftar semua elemen yang akan mendapatkan efek ripple
  const buttons = document.querySelectorAll('.submit-button, .voice-button, .menu-button, .window-control-button, .btn, .hide-chat-btn');

  console.log('Setting up ripple effect for', buttons.length, 'buttons');

  buttons.forEach(button => {
    // Tambahkan class ripple-button
    button.classList.add('ripple-button');

    // Tambahkan event listener
    button.addEventListener('mousedown', createRipple);
  });

  function createRipple(event) {
    console.log('Creating ripple effect');

    const button = event.currentTarget;

    // Hapus ripple yang sudah ada pada tombol ini
    const oldRipples = button.querySelectorAll('.ripple');
    oldRipples.forEach(ripple => {
      button.removeChild(ripple);
    });

    // Buat elemen ripple
    const circle = document.createElement('span');
    circle.classList.add('ripple');

    // Hitung ukuran ripple
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Atur ukuran ripple
    circle.style.width = circle.style.height = `${diameter}px`;

    // Hitung posisi ripple relatif terhadap tombol
    const rect = button.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - radius;
    const offsetY = event.clientY - rect.top - radius;

    // Atur posisi ripple
    circle.style.left = `${offsetX}px`;
    circle.style.top = `${offsetY}px`;

    // Tambahkan ripple ke tombol
    button.appendChild(circle);

    // Hapus ripple setelah animasi selesai
    setTimeout(() => {
      if (circle.parentElement) {
        button.removeChild(circle);
      }
    }, 600);
  }
}