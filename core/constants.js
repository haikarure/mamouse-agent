// Global constants for Mamouse Agent
// Centralized constants to maintain SSOT principle
// MOVED: From shared/utils/constants.js to core/constants.js for optimal architecture
// RELOCATION: Moved to core/ directory as this contains core application configuration

// ===== APPLICATION CONSTANTS =====
const APP_CONFIG = {
  name: 'Mamouse Agent',
  version: '1.0.0',
  description: 'AI-powered desktop assistant with voice and chat capabilities'
};

// ===== WINDOW CONSTANTS =====
const WINDOW_CONFIG = {
  defaultWidth: 800,
  defaultHeight: 600,
  minWidth: 400,
  minHeight: 300,
  maxWidth: 1920,
  maxHeight: 1080,
  defaultOpacity: 0.95
  // DDR CLEANUP: fadeAnimationDuration moved to ui-constants.js ANIMATIONS.ANIMATION_DURATION
};

// ===== WEBSOCKET CONSTANTS =====
const WEBSOCKET_CONFIG = {
  defaultPort: 12345,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  connectionTimeout: 10000
};

// ===== API CONSTANTS =====
// DDR CLEANUP NOTE: API_CONFIG should ideally be moved to shared/services/api-service.js
// However, it's currently used by api-service.js, so keeping here temporarily for stability
// TODO: Refactor api-service.js to use internal configuration instead of importing from core
const API_CONFIG = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    availableModels: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ],
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    timeout: 30000
  },
  // DDR CLEANUP: Minimal ElevenLabs config for APIService compatibility
  // Full ElevenLabs configuration in components/voice/voice-config.js (SSOT)
  elevenlabs: {
    baseUrl: 'https://api.elevenlabs.io/v1',
    timeout: 15000
  }
};

// ===== CAMERA CONSTANTS =====
// DDR CLEANUP: CAMERA_CONFIG moved to components/camera/camera-manager.js to eliminate duplication
// Camera-specific configurations should be with the camera component
// Use CameraComponent.getConfig() or camera component's internal config instead

// ===== VOICE CONSTANTS =====
// DDR CLEANUP: VOICE_CONFIG moved to components/voice/voice-service.js to eliminate duplication
// Voice-specific configurations should be with the voice component
// Use VoiceComponent.getConfig() or voice component's internal config instead

// ===== UI CONSTANTS =====
// DDR CLEANUP: UI constants moved to shared/utils/ui-constants.js to avoid duplication
// Use window.MAMOUSE_CONSTANTS.ANIMATIONS and window.MAMOUSE_CONSTANTS.TIMEOUTS instead

// ===== LOGGING CONSTANTS =====
const LOG_CONFIG = {
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  categories: {
    GENERAL: 'GENERAL',
    GEMINI_SERVICE: 'GEMINI_SERVICE',
    CAMERA_SERVICE: 'CAMERA_SERVICE',
    VOICE_SERVICE: 'VOICE_SERVICE',
    WEBSOCKET: 'WEBSOCKET',
    IPC: 'IPC',
    UI: 'UI',
    BUBBLE_DEBUG: 'BUBBLE_DEBUG',
    PERFORMANCE: 'PERFORMANCE',
    API: 'API',
    USER_ACTION: 'USER_ACTION',
    SYSTEM: 'SYSTEM'
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBackupFiles: 5
};

// ===== FILE SYSTEM CONSTANTS =====
const FILE_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  allowedAudioTypes: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  allowedVideoTypes: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  tempDirectory: 'temp',
  cacheDirectory: 'cache',
  logsDirectory: 'logs',
  imagesDirectory: 'images'
};

// ===== VALIDATION CONSTANTS =====
const VALIDATION_CONFIG = {
  apiKey: {
    minLength: 30,
    maxLength: 200
  },
  message: {
    minLength: 1,
    maxLength: 10000
  },
  filename: {
    maxLength: 255,
    invalidChars: /[<>:"/\\|?*]/g
  },
  url: {
    maxLength: 2048,
    protocols: ['http:', 'https:']
  }
};

// ===== ERROR CODES =====
const ERROR_CODES = {
  // API Errors
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  API_NETWORK_ERROR: 'API_NETWORK_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',
  
  // DDR CLEANUP: Camera errors moved to components/camera/camera-constants.js (SSOT)
  // Use CAMERA_CONSTANTS.ERROR_CODES instead

  // DDR CLEANUP: Voice errors moved to components/voice/voice-config.js (SSOT)
  
  // File Errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_PERMISSION_DENIED: 'FILE_PERMISSION_DENIED',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE'
};

// ===== SUCCESS MESSAGES =====
const SUCCESS_MESSAGES = {
  API_KEY_SAVED: 'API key saved successfully',
  MESSAGE_SENT: 'Message sent successfully',
  CAMERA_STARTED: 'Camera started successfully',
  VOICE_STARTED: 'Voice recognition started',
  FILE_UPLOADED: 'File uploaded successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
};

// ===== KEYBOARD SHORTCUTS =====
// DDR CLEANUP: Voice shortcuts moved to components/voice/voice-config.js (SSOT)
const SHORTCUTS = {
  TOGGLE_MENU: 'Ctrl+M',
  SEND_MESSAGE: 'Enter',
  CAMERA_CAPTURE: 'Ctrl+C',
  CLEAR_CHAT: 'Ctrl+L',
  FOCUS_INPUT: 'Ctrl+I',
  TOGGLE_WINDOW: 'Alt+Space'
};

// ===== THEME CONSTANTS =====
// DDR CLEANUP: THEME_CONFIG colors moved to shared/ui/ui-constants.js to eliminate duplication
// Use window.MAMOUSE_CONSTANTS.COLORS for color values instead
const THEME_CONFIG = {
  fonts: {
    primary: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    monospace: 'Consolas, Monaco, "Courier New", monospace'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  }
};

module.exports = {
  APP_CONFIG,
  WINDOW_CONFIG,
  WEBSOCKET_CONFIG,
  API_CONFIG,
  // CAMERA_CONFIG removed - DDR Cleanup: moved to components/camera/camera-manager.js
  // VOICE_CONFIG removed - DDR Cleanup: moved to components/voice/voice-service.js
  // UI_CONFIG removed - DDR Cleanup: moved to shared/utils/ui-constants.js
  LOG_CONFIG,
  FILE_CONFIG,
  VALIDATION_CONFIG,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  SHORTCUTS,
  THEME_CONFIG
};
