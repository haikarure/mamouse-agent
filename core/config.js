// Configuration for Mamouse Agent
// DDR CLEANUP: screen import removed - not used anywhere in this file

const config = {
  // WebSocket configuration
  webSocket: {
    defaultPort: 12345,
    maxAttempts: 10
  },

  // Timing constants - Moved from app.js
  timing: {
    WINDOW_READY_DELAY: 1000,
    SHORTCUT_REGISTRATION_DELAY: 1000,
    PORT_RETRY_DELAY: 500,
    PORT_RANGE_MIN: 10000,
    PORT_RANGE_MAX: 65000
  },

  // Zoom constants - Moved from app.js
  zoom: {
    STEP: 0.1,
    MIN: 0.1,
    DEFAULT: 1.0
  },

  // Gemini API configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxOutputTokens: 2048,
    topK: 40,
    topP: 0.95,
    safetySettings: [
      'HARM_CATEGORY_HARASSMENT',
      'HARM_CATEGORY_HATE_SPEECH',
      'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'HARM_CATEGORY_DANGEROUS_CONTENT'
    ].map(category => ({ category, threshold: 'BLOCK_MEDIUM_AND_ABOVE' }))
  },

  // Camera configuration moved to services/camera-service.js for better organization
  camera: {
    enabled: true // Only keep the main enable/disable flag here
  },

  // DDR CLEANUP: Voice configuration moved to components/voice/voice-config.js (SSOT)
  // All voice and ElevenLabs settings now centralized in voice component

  // Application metadata
  app: {
    name: 'Mamouse Agent',
    version: '1.0.0',
    description: 'Asisten AI personal dengan kemampuan multimodal'
  },

  // Window configuration is now handled by components/window/window-service.js
  // This maintains better separation of concerns and component architecture
};

module.exports = config;
