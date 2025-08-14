// Preload script untuk Mamouse Agent
const { contextBridge, ipcRenderer } = require('electron');

// Valid channels configuration
const VALID_CHANNELS = [
  'gemini-status-update',
  'camera-status-update',
  'window-ready',
  'elevenlabs-message',
  'elevenlabs-status'
];

// Expose secure API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
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
  sendMessageToGemini: (message) => ipcRenderer.invoke('send-message-to-gemini', message),

  // External URLs
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),

  // Error handling
  logError: (error) => ipcRenderer.send('log-error', error),

  // ElevenLabs integration (Direct)
  getElevenLabsStatus: () => ipcRenderer.invoke('get-elevenlabs-status'),

  // Event listener with validation
  on: (channel, callback) => {
    if (!VALID_CHANNELS.includes(channel)) return null;

    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => ipcRenderer.removeListener(channel, subscription);
  }
});
