// WebSocket Manager untuk Mamouse Agent
// Mengelola komunikasi WebSocket dengan server dan message handling

// Variables untuk WebSocket
let socket = null;
let isConnected = false;

/**
 * Fungsi untuk menghubungkan ke WebSocket server
 */
function connectWebSocket() {
  const utils = window.createUtilityManager ? window.createUtilityManager('WebSocketManager') : null;

  try {
    // Dapatkan port dari main process menggunakan API yang diekspos
    const port = window.electronAPI.getWsPort();
    if (utils) {
      utils.log('Mencoba menghubungkan ke WebSocket server di port:', port);
    } else {
      console.log('Mencoba menghubungkan ke WebSocket server di port:', port);
    }
    socket = new WebSocket(`ws://localhost:${port}`);
  } catch (error) {
    if (utils) {
      utils.handleError(error, 'menghubungkan ke WebSocket server');
      utils.log('Menggunakan port default 12345');
    } else {
      console.error('Error saat menghubungkan ke WebSocket server:', error);
      console.log('Menggunakan port default 12345');
    }
    socket = new WebSocket('ws://localhost:12345');
  }

  socket.onopen = async () => {
    const utils = window.createUtilityManager ? window.createUtilityManager('WebSocketManager') : null;

    if (utils) {
      utils.logSuccess('Connected to WebSocket server');
    } else {
      console.log('Connected to WebSocket server');
    }

    isConnected = true;
    // Update global variables for input service compatibility
    window.socket = socket;
    window.isConnected = true;

    if (utils) {
      utils.withElement('connection-status', (connectionStatus) => {
        connectionStatus.style.display = 'none';
      });
    } else {
      const connectionStatus = document.getElementById('connection-status');
      if (connectionStatus) {
        connectionStatus.style.display = 'none';
      }
    }

    // Periksa status Gemini API
    try {
      console.log('Memeriksa status Gemini API...');
      const status = await window.electronAPI.getGeminiStatus();
      console.log('Status Gemini API:', status);

      if (!status.initialized) {
        console.warn('Gemini API belum diinisialisasi!');
      } else if (!status.apiKey) {
        console.warn('Gemini API key tidak ditemukan!');
      } else {
        console.log('Gemini API siap digunakan dengan model:', status.model);
      }
    } catch (error) {
      console.error('Error saat memeriksa status Gemini API:', error);
    }

    // Inisialisasi chat container
    if (window.initChatContainer) {
      window.initChatContainer();
    }
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
    isConnected = false;
    // Update global variables for input service compatibility
    window.socket = null;
    window.isConnected = false;
    const connectionStatus = document.getElementById('connection-status');
    if (connectionStatus) {
      connectionStatus.style.display = 'flex';
    }

    // Try to reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);

    // Show error status indicator
    if (window.statusManager) {
      window.statusManager.showStatusIndicator('error', 'Connection error. Please try again.', 5000);
    }
  };

  // Setup WebSocket message handler
  setupWebSocketMessageHandler();
}

/**
 * Fungsi untuk mengirim pesan melalui WebSocket - Updated to use InputService
 */
function sendMessage() {
  console.log('🔧 sendMessage() called from WebSocket manager');

  // Try to use the new InputService first
  if (window.InputContainerComponent && window.InputContainerComponent.getService()) {
    const service = window.InputContainerComponent.getService();
    return service.processMessage();
  }

  // Fallback to original WebSocket implementation
  const messageInput = document.getElementById('message-input');
  if (!messageInput) {
    console.error('❌ Message input element tidak ditemukan');
    return;
  }

  const message = messageInput.value.trim();
  console.log('🔍 Message content:', message);
  console.log('🔍 Socket status:', !!socket);
  console.log('🔍 Connection status:', isConnected);

  if (!message) {
    console.warn('⚠️ Message is empty, not sending');
    return;
  }

  if (!socket) {
    console.error('❌ WebSocket not initialized');
    return;
  }

  if (!isConnected) {
    console.error('❌ WebSocket not connected');
    return;
  }

  if (message && socket && isConnected) {
    console.log('✅ Sending message via WebSocket');

    // Show processing status indicator
    if (window.statusManager && window.statusManager.showStatusIndicator) {
      window.statusManager.showStatusIndicator('processing', 'Processing your request...', 10000);
    }

    // Kirim pesan ke server
    socket.send(JSON.stringify({
      type: 'message',
      content: message
    }));

    console.log('✅ Message sent successfully');

    // Kosongkan input
    messageInput.value = '';
  } else {
    console.error('❌ Cannot send message - missing requirements');
    console.error('Message:', !!message, 'Socket:', !!socket, 'Connected:', isConnected);
  }
}

/**
 * Fungsi untuk mengirim gambar ke chat untuk dianalisis
 * @param {string} imageData - Data gambar dalam format base64
 */
function sendImageToChat(imageData) {
  try {
    if (!imageData || !imageData.startsWith('data:image/')) {
      console.error('Data gambar tidak valid');
      window.statusManager.showStatusIndicator('error', 'Data gambar tidak valid', 3000);
      return;
    }

    if (!socket || !isConnected) {
      console.error('WebSocket tidak terhubung');
      window.statusManager.showStatusIndicator('error', 'Tidak terhubung ke server', 3000);
      return;
    }

    // Show processing status
    window.statusManager.showStatusIndicator('processing', 'Mengirim gambar untuk dianalisis...', 10000);

    // Send image to server for analysis
    socket.send(JSON.stringify({
      type: 'image',
      content: imageData,
      timestamp: new Date().toISOString()
    }));

    console.log('Gambar berhasil dikirim ke server untuk dianalisis');
    window.statusManager.showStatusIndicator('success', 'Gambar berhasil dikirim', 2000);

  } catch (error) {
    console.error('Error saat mengirim gambar ke chat:', error);
    window.statusManager.showStatusIndicator('error', 'Error saat mengirim gambar: ' + error.message, 5000);
  }
}

/**
 * Setup WebSocket message handler
 */
function setupWebSocketMessageHandler() {
  if (!socket) return;

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

      // Handle different message types
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      console.error('Error stack:', error.stack);
    }
  };
}

/**
 * Handle different types of WebSocket messages
 * @param {Object} data - Parsed message data
 */
function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'message':
      handleMessageType(data);
      break;
    case 'streamChunk':
      handleStreamChunkType(data);
      break;
    case 'toolResult':
      handleToolResultType(data);
      break;
    case 'history':
      handleHistoryType(data);
      break;
    case 'voiceStatus':
      handleVoiceStatusType(data);
      break;
    default:
      console.warn(`Tipe pesan tidak dikenal: ${data.type}`);
  }
}

// === MESSAGE HANDLERS ===

/**
 * Handle message type
 * @param {Object} data - Message data
 */
function handleMessageType(data) {
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
      if (window.addMessageToChat) {
        window.addMessageToChat(data.message);
        console.log('Pesan berhasil ditambahkan ke chat');
      }
    }, 50);
  } catch (addError) {
    console.error('Error saat menambahkan pesan ke chat:', addError);
    console.error('Detail error:', addError.stack);
  }
}

/**
 * Handle streamChunk type
 * @param {Object} data - StreamChunk data
 */
function handleStreamChunkType(data) {
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
  if (window.chatState && window.chatState.firstChunk === undefined) {
    window.chatState.firstChunk = true;
  }

  console.log(`Memproses chunk untuk messageId: ${data.messageId}, done: ${done}, firstChunk: ${window.chatState?.firstChunk}`);
  console.log('Chunk content:', chunk);

  // Handle streaming message update
  try {
    // Tambahkan delay kecil untuk memastikan DOM siap
    setTimeout(() => {
      if (window.updateStreamingMessage) {
        window.updateStreamingMessage(data.messageId, chunk, done);
        console.log('Chunk berhasil diproses');
      }
    }, 50);
  } catch (updateError) {
    console.error('Error saat memperbarui pesan streaming:', updateError);
    console.error('Error stack:', updateError.stack);
  }

  // Handle TTS if enabled
  if (window.isTtsEnabled) {
    try {
      // Dapatkan teks dari chunk atau konten lengkap
      const textToSpeak = data.content || chunk;

      if (textToSpeak && textToSpeak.trim() !== '') {
        // Jika ini adalah chunk terakhir, putar seluruh teks
        if (done) {
          console.log('Memulai TTS untuk respons akhir');
          if (window.playTTS) {
            window.playTTS(textToSpeak);
          }
        }
        // Jika ini adalah chunk pertama dan cukup panjang, mulai streaming
        else if (window.chatState?.firstChunk && textToSpeak.length > 50) {
          console.log('Memulai streaming TTS untuk chunk pertama');
          if (window.playTTS) {
            window.playTTS(textToSpeak, { streaming: true });
          }
          if (window.chatState) {
            window.chatState.firstChunk = false;
          }
        }
      }
    } catch (ttsError) {
      console.error('Error saat memulai TTS:', ttsError);
    }
  }
}

/**
 * Handle toolResult type
 * @param {Object} data - ToolResult data
 */
function handleToolResultType(data) {
  // Tangani hasil tool
  console.log('Menerima hasil tool:', data);

  if (!data.messageId || !data.toolName) {
    console.error('ToolResult missing required fields:', data);
    return;
  }

  try {
    // Tambahkan delay kecil untuk memastikan DOM siap
    setTimeout(() => {
      if (window.displayToolResult) {
        window.displayToolResult(data.messageId, data.toolName, data.toolParams, data.toolResult);
        console.log('Hasil tool berhasil ditampilkan');
      }
    }, 50);
  } catch (toolError) {
    console.error('Error saat menampilkan hasil tool:', toolError);
    console.error('Error stack:', toolError.stack);
  }
}

/**
 * Handle history type
 * @param {Object} data - History data
 */
function handleHistoryType(data) {
  // Inisialisasi chat container untuk riwayat baru
  console.log('Menerima riwayat chat:', data);

  try {
    if (window.initChatContainer) {
      window.initChatContainer();
      console.log('Chat container berhasil diinisialisasi');
    }

    // Tambahkan pesan dari riwayat
    if (data.messages && data.messages.length > 0) {
      console.log(`Menambahkan ${data.messages.length} pesan dari riwayat`);

      // Tambahkan delay kecil untuk memastikan DOM siap
      setTimeout(() => {
        data.messages.forEach((message, index) => {
          try {
            // Tambahkan delay bertahap untuk setiap pesan
            setTimeout(() => {
              if (window.addMessageToChat) {
                window.addMessageToChat(message);
              }
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
}

/**
 * Handle voiceStatus type
 * @param {Object} data - VoiceStatus data
 */
function handleVoiceStatusType(data) {
  console.log('Menerima status voice:', data);
  try {
    if (window.toggleVoiceVisualization) {
      window.toggleVoiceVisualization(data.isListening);
    }
  } catch (voiceError) {
    console.error('Error saat mengubah status visualisasi voice:', voiceError);
  }
}

// Export functions untuk digunakan di file lain
window.WebSocketManager = {
  connectWebSocket,
  sendMessage,
  sendImageToChat,
  getSocket: () => socket,
  getConnectionStatus: () => isConnected,
  handleMessageType,
  handleStreamChunkType,
  handleToolResultType,
  handleHistoryType,
  handleVoiceStatusType
};

// Export individual functions untuk backward compatibility
window.connectWebSocket = connectWebSocket;
window.sendMessage = sendMessage;
window.sendImageToChat = sendImageToChat;
window.handleMessageType = handleMessageType;
window.handleStreamChunkType = handleStreamChunkType;
window.handleToolResultType = handleToolResultType;
window.handleHistoryType = handleHistoryType;
window.handleVoiceStatusType = handleVoiceStatusType;

// Export socket and connection status directly for input service compatibility
// These will be updated when connection state changes
window.socket = null;
window.isConnected = false;

console.log('WebSocket Manager loaded');
