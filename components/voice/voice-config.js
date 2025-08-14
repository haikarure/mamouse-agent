// Voice Component Configuration - SSOT for all voice settings
// Consolidated from scattered voice configurations across the codebase
// DDR CLEANUP: Migrated from core/config.js, core/constants.js, and shared/config/

console.log('🔥 LOADING: voice-config.js - Voice Component Configuration');

const VoiceConfig = {
  // Core Voice Settings
  voice: {
    enabled: true,
    language: 'id-ID',
    elevenLabsSTT: true
  },

  // ElevenLabs API Configuration
  elevenlabs: {
    enabled: true,
    conversationalAI: true,
    baseUrl: 'https://api.elevenlabs.io/v1',
    defaultVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
    availableVoices: [
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
      { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
      { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' },
      { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' }
    ],
    defaultSettings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    },
    timeout: 15000
  },

  // Audio Configuration for Electron
  audio: {
    // Input settings
    input: {
      sampleRate: 44100,
      channels: 1,
      bitDepth: 16,
      bufferSize: 4096,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },

    // Output settings
    output: {
      sampleRate: 44100,
      channels: 2,
      bitDepth: 16,
      bufferSize: 4096,
      volume: 1.0
    },

    // Voice Activity Detection settings
    voiceDetection: {
      threshold: 0.01,
      smoothingTimeConstant: 0.8,
      minDecibels: -45,
      maxDecibels: -10,
      fftSize: 2048
    },

    // Audio processing settings
    processing: {
      chunkSize: 44100, // 1 second at 44.1kHz
      overlap: 0.25,
      format: {
        sampleRate: 44100,
        channels: 1,
        bitDepth: 16,
        encoding: 'pcm'
      }
    }
  },

  // WebSocket Configuration for ElevenLabs
  websocket: {
    connectionTimeout: 30000,
    reconnectAttempts: 5,
    reconnectDelay: 2000,
    maxMessageSize: 1024 * 1024, // 1MB
    binaryType: 'arraybuffer'
  },

  // Voice Models Configuration
  models: {
    defaultModel: 'eleven_flash_v2_5',
    availableModels: [
      'eleven_flash_v2_5',
      'eleven_turbo_v2_5', 
      'eleven_multilingual_v2',
      'eleven_v3'
    ]
  },

  // Storage Keys for Settings
  storage: {
    elevenLabsApiKey: 'elevenlabs_api_key',
    voiceModel: 'voice_model',
    voiceSettings: 'voice_settings'
  },

  // Element Selectors
  selectors: {
    voiceButton: '#voice-btn',
    elevenLabsApiKeyInput: '#elevenlabs-api-key',
    voiceModelSelect: '#voice-model',
    saveElevenLabsBtn: '#save-elevenlabs-btn',
    elevenLabsStatus: '#elevenlabs-api-status'
  },

  // Validation Rules
  validation: {
    apiKeyMinLength: 20,
    apiKeyPattern: /^[A-Za-z0-9_-]+$/
  },

  // Keyboard Shortcuts - DDR CLEANUP: Moved from core/constants.js (SSOT)
  shortcuts: {
    TOGGLE_VOICE: 'Ctrl+V',
    STOP_VOICE: 'Escape',
    MUTE_VOICE: 'Ctrl+Shift+M'
  },

  // Error Codes - DDR CLEANUP: Moved from core/constants.js (SSOT)
  errorCodes: {
    VOICE_NOT_SUPPORTED: 'VOICE_NOT_SUPPORTED',
    VOICE_PERMISSION_DENIED: 'VOICE_PERMISSION_DENIED',
    VOICE_NETWORK_ERROR: 'VOICE_NETWORK_ERROR',
    VOICE_TIMEOUT: 'VOICE_TIMEOUT',
    ELEVENLABS_API_ERROR: 'ELEVENLABS_API_ERROR',
    ELEVENLABS_QUOTA_EXCEEDED: 'ELEVENLABS_QUOTA_EXCEEDED'
  },

  // Python Integration - MIGRATION: Python files moved to voice component for SSOT
  python: {
    servicePath: 'components/voice/python/start_service.py',
    httpBridgeUrl: 'http://localhost:8765',
    defaultApiKey: 'sk_9131261681c86fe4479ae577c64df46fddb4efaecad98a26',
    defaultAgentId: 'agent_01k0e81qeref59p5h71h1zdbh7'
  }
};

// Export configuration
if (typeof window !== 'undefined') {
  window.VoiceConfig = VoiceConfig;
  console.log('✅ Voice Configuration loaded and available globally');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceConfig;
}

console.log('📝 Voice Component Configuration initialized (SSOT)');
