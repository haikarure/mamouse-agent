// UI Constants untuk Mamouse Agent
// CONSOLIDATED: All duplicate UI constants from across the codebase
// SEPARATED: UI-specific constants (colors, elements, animations) from app-level constants
// MOVED: From shared/utils/ui-constants.js to shared/ui/ui-constants.js for optimal architecture
// RELOCATION: Moved to shared/ui/ directory as this contains UI-specific constants

// ===== COLOR CONSTANTS =====
// DUPLICATE REMOVED: These colors were scattered across multiple files
const COLORS = {
  // Primary colors (used in multiple files)
  primary: '#005a9e',
  secondary: '#1f6bb3',
  accent: '#4a9fd9',
  tertiary: '#3a9bd9',
  
  // Background colors (used in camera.js, ui-utils.js)
  background: '#1e1e1e',
  backgroundSecondary: '#2a2a2a',
  
  // Text colors (used in multiple files)
  text: '#ffffff',
  textSecondary: '#cccccc',
  
  // Status colors (used in status-helper.js, ui-utils.js)
  success: '#00aa44',
  error: '#ff4444',
  warning: '#ffaa00',
  info: '#0088cc',
  processing: '#4a9fd9'
};

// ===== ELEMENT ID CONSTANTS =====
// DUPLICATE REMOVED: These IDs were scattered across multiple files
const ELEMENT_IDS = {
  // Camera elements (used in camera.js, ui-utils.js)
  CAMERA_ABOVE_INPUT: 'camera-above-input',
  CAMERA_VIDEO_ABOVE: 'camera-video-above',
  CAMERA_CANVAS_ABOVE: 'camera-canvas-above',
  CAMERA_ERROR_ABOVE: 'camera-error-above',
  CAMERA_BTN: 'camera-btn',
  
  // Input elements (used in multiple files)
  INPUT_CONTAINER: 'input-container',
  GEMINI_API_KEY: 'gemini-api-key',
  GEMINI_MODEL: 'gemini-model',
  
  // Status elements (used in multiple files)
  API_STATUS: 'api-status',
  STATUS_INDICATOR: 'status-indicator',
  STATUS_INDICATOR_ICON: 'status-indicator-icon',
  STATUS_INDICATOR_TEXT: 'status-indicator-text'
};

// ===== ANIMATION CONSTANTS =====
// DUPLICATE REMOVED: These values were duplicated across multiple files
const ANIMATIONS = {
  // Duration constants (used in camera.js, ui-utils.js)
  FADE_IN_DURATION: 600,
  FADE_OUT_DURATION: 500,
  TEST_FADE_DURATION: 2000,
  ANIMATION_RESET_TIMEOUT: 5000,

  // DDR CLEANUP: Consolidated from constants.js UI_CONFIG
  ANIMATION_DURATION: 300,
  RIPPLE_ANIMATION_DURATION: 600,

  // Class names (used in camera.js, css files)
  CLASSES: {
    FADE_IN: 'fade-in',
    FADE_OUT: 'fade-out',
    ACTIVE: 'active',
    LOADING: 'loading'
  }
};

// ===== TIMEOUT CONSTANTS =====
// DUPLICATE REMOVED: These timeouts were scattered across multiple files
const TIMEOUTS = {
  // API timeouts (used in multiple files)
  API_TIMEOUT: 5000,
  STATUS_DISPLAY: 3000,
  ERROR_DISPLAY: 5000,
  PROCESSING_DISPLAY: 10000,

  // Camera timeouts (used in camera.js)
  CAMERA_STREAM_TIMEOUT: 10000,

  // Utility timeouts (used in api-helper.js)
  API_WAIT_INTERVAL: 100,

  // DDR CLEANUP: Consolidated from constants.js UI_CONFIG
  TOOLTIP_DELAY: 500,
  NOTIFICATION_DURATION: 3000
};

// ===== CSS SELECTOR CONSTANTS =====
// DUPLICATE REMOVED: These selectors were duplicated across multiple files
const SELECTORS = {
  // Interactive elements (used in ui-utils.js, mouse-handler.js)
  INTERACTIVE: [
    '.input-container',
    '.input-container *',
    '.window-controls',
    '.window-controls *',
    '.slide-menu.active',
    '.slide-menu.active *',
    '.bubble-content',
    '.bubble-content *',
    '.scroll-controls.active',
    '.scroll-controls.active *',
    '.voice-visualizer-container.active',
    '.voice-visualizer-container.active *',
    '.camera-btn',
    '.camera-above-input',
    '.camera-above-input *'
  ],
  
  // Button selectors (used in ui-utils.js)
  RIPPLE_BUTTONS: '.submit-button, .voice-button, .menu-button, .camera-button, .window-control-button, .btn, .hide-chat-btn'
};

// ===== EXPORT CONSTANTS =====
// Export untuk digunakan di file lain
window.MAMOUSE_CONSTANTS = {
  COLORS,
  ELEMENT_IDS,
  ANIMATIONS,
  TIMEOUTS,
  SELECTORS
};

// Individual exports untuk backward compatibility
window.COLORS = COLORS;
window.ELEMENT_IDS = ELEMENT_IDS;
window.ANIMATIONS = ANIMATIONS;
window.TIMEOUTS = TIMEOUTS;
window.SELECTORS = SELECTORS;

// CONSOLIDATED: Single constants loading message
console.log('✅ Mamouse UI Constants Loaded: Colors, Element IDs, Animations, Timeouts, Selectors');
