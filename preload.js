// Preload script untuk Mamouse Agent
const { contextBridge, ipcRenderer } = require('electron');

// Ekspos API ke renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // WebSocket
  getWsPort: () => ipcRenderer.sendSync('get-ws-port'),

  // Mouse events
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),

  // Gemini API
  setGeminiApiKey: (apiKey) => ipcRenderer.invoke('set-gemini-api-key', apiKey),
  setGeminiModel: (model) => ipcRenderer.invoke('set-gemini-model', model),
  getGeminiStatus: () => ipcRenderer.invoke('get-gemini-status'),
  validateGeminiApiKey: (apiKey) => ipcRenderer.invoke('validate-gemini-api-key', apiKey),
  resetGeminiChat: () => ipcRenderer.invoke('reset-gemini-chat'),

  // Tools
  setToolsEnabled: (enabled) => ipcRenderer.invoke('set-tools-enabled', enabled),

  // ElevenLabs API
  setElevenLabsApiKey: (apiKey) => ipcRenderer.invoke('set-elevenlabs-api-key', apiKey),
  getElevenLabsStatus: () => ipcRenderer.invoke('get-elevenlabs-status'),
  getElevenLabsVoices: () => ipcRenderer.invoke('get-elevenlabs-voices'),
  setElevenLabsVoice: (voiceId) => ipcRenderer.invoke('set-elevenlabs-voice', voiceId),
  generateSpeech: (text, options) => ipcRenderer.invoke('generate-speech', text, options),
  generateSpeechStream: (text, options) => ipcRenderer.invoke('generate-speech-stream', text, options),
  stopSpeechStream: (streamId) => ipcRenderer.invoke('stop-speech-stream', streamId),
  onSpeechStreamChunk: (callback) => ipcRenderer.on('speech-stream-chunk', callback),
  removeSpeechStreamChunkListener: (callback) => ipcRenderer.removeListener('speech-stream-chunk', callback),
  setTtsSpeed: (speed) => ipcRenderer.invoke('set-tts-speed', speed),
  setTtsPitch: (pitch) => ipcRenderer.invoke('set-tts-pitch', pitch),
  setTtsVolume: (volume) => ipcRenderer.invoke('set-tts-volume', volume),

  // MCP Servers
  getMcpServers: () => ipcRenderer.invoke('get-mcp-servers'),
  getMcpServer: (id) => ipcRenderer.invoke('get-mcp-server', id),
  addMcpServer: (server) => ipcRenderer.invoke('add-mcp-server', server),
  updateMcpServer: (server) => ipcRenderer.invoke('update-mcp-server', server),
  deleteMcpServer: (id) => ipcRenderer.invoke('delete-mcp-server', id),

  // MCP Functions
  takeScreenshot: () => ipcRenderer.invoke('mcp:take-screenshot'),
  typeText: (text) => ipcRenderer.invoke('mcp:type-text', text),
  mouseClick: (x, y, button) => ipcRenderer.invoke('mcp:mouse-click', x, y, button),
  runCommand: (command, args, options) => ipcRenderer.invoke('mcp:run-command', command, args, options),
  openApp: (appName) => ipcRenderer.invoke('mcp:open-app', appName),
  getRunningApps: () => ipcRenderer.invoke('mcp:get-running-apps'),

  // External URLs
  openExternalUrl: (url) => ipcRenderer.send('open-external-url', url),

  // Error handling
  logError: (error) => ipcRenderer.send('log-error', error),

  // Event listeners
  on: (channel, callback) => {
    // Whitelist channels yang diizinkan
    const validChannels = [
      'gemini-status-update',
      'mcp-server-update',
      'tools-status-update',
      'camera-status-update',
      'window-ready',
      'check-click-through'
    ];

    if (validChannels.includes(channel)) {
      // Konversi callback ke fungsi yang dapat digunakan dengan ipcRenderer
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);

      // Kembalikan fungsi untuk menghapus listener
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }

    return null;
  }
});

// CATATAN: Kode untuk mengekspos ipcRenderer langsung telah dihapus
// untuk meningkatkan keamanan. Gunakan API yang diekspos di atas sebagai gantinya.
// Jika ada fungsi yang diperlukan, tambahkan ke API di atas.
