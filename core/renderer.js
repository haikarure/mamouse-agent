// Renderer process
// Gunakan window.electronAPI yang diekspos dari preload.js untuk keamanan
// MOVED: From ui/renderer.js → shared/scripts/renderer.js → core/renderer.js for optimal architecture
// RELOCATION: Moved to core/ directory as this is core application initialization functionality

console.log('🔄 Renderer.js loaded - TESTING CONSOLE OUTPUT (core)');
console.log('🔍 Window object available:', !!window);
console.log('🔍 Document object available:', !!document);

// Mock electronAPI initialization moved to mock-api-manager.js
// Initialize mock API manager for browser testing
if (!window.electronAPI && window.MockApiManager) {
  window.mockApiManager = new MockApiManager();
  window.mockApiManager.initialize();
}

// DDR CLEANUP: DOM element references removed - not used anywhere in renderer.js
// Components handle their own DOM element access through their respective managers
// Use component.getElement() methods instead of global DOM references

// DDR CLEANUP: Gemini API elements removed - handled by menu-bar component submenus

// ElevenLabs API Elements removed - voice functionality disabled

// Initialize using InitializationManager
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔄 DOMContentLoaded event fired, starting initialization...');

  try {
    // Check if InitializationManager is available
    if (!window.InitializationManager) {
      console.error('❌ InitializationManager class not found! Falling back to manual initialization.');
      // Fallback to manual initialization if InitializationManager is not available
      await fallbackInitialization();
      return;
    }

    console.log('✅ InitializationManager class found, creating instance...');

    // Create and initialize the initialization manager
    window.initializationManager = new InitializationManager();
    await window.initializationManager.initialize();

    console.log('✅ Aplikasi berhasil diinisialisasi menggunakan InitializationManager');
  } catch (error) {
    console.error('❌ Error saat inisialisasi aplikasi:', error);
    console.error('Detail error:', error.stack);

    // Fallback: show error to user
    if (window.electronAPI && window.electronAPI.logError) {
      window.electronAPI.logError('Initialization error: ' + error.message);
    }

    // Try fallback initialization
    console.log('🔄 Attempting fallback initialization...');
    try {
      await fallbackInitialization();
    } catch (fallbackError) {
      console.error('❌ Fallback initialization also failed:', fallbackError);
    }
  }
});

// Fallback initialization function
async function fallbackInitialization() {
  console.log('🔄 Running fallback initialization...');

  // Connect to WebSocket server
  if (window.connectWebSocket) {
    window.connectWebSocket();
  }

  // Initialize custom dropdown
  if (window.initializeCustomDropdown) {
    window.initializeCustomDropdown();
  }

  // Initialize managers manually
  window.colorController = new ColorController();
  window.statusManager = new StatusManager();
  // DDR CLEANUP: VoiceOutput moved to voice component (SSOT)

  // Mouse handler already initialized by InitializationManager - skip duplicate

  // Voice input handler functionality moved to Voice Component
  // window.voiceInputHandler will be set by voice component initialization

  // Initialize window component
  if (window.WindowComponent) {
    await window.WindowComponent.initialize();
    window.windowManager = window.WindowComponent.getManager();
  } else {
    console.error('❌ WindowComponent not available in fallback');
  }

  window.toolManager = new ToolManager();

  // DDR CLEANUP: MenuManager removed - functionality handled by menu-bar component

  // DDR CLEANUP: MessageManager removed - functionality handled by modern bubble component

  // Set up event listeners
  if (window.setupEventListeners) {
    setupEventListeners();
  }

  // Ensure transparency
  if (window.windowManager && window.windowManager.ensureTransparency) {
    window.windowManager.ensureTransparency();
  }

  // DDR CLEANUP: API settings initialization removed - handled by menu-bar component

  // ElevenLabs API settings removed - voice functionality disabled

  // Setup ripple effect
  if (window.setupRippleEffect) {
    window.setupRippleEffect();
  }

  // DDR CLEANUP: Input container initialization handled by initialization-manager.js

  console.log('✅ Fallback initialization completed');
}

// All moved functions are now in their respective modules

// Set up event listeners (moved to event-manager.js)
function setupEventListeners() {
  console.log('setupEventListeners called - using EventManager');

  // Event listeners are now handled by EventManager
  if (window.eventManager && window.eventManager.isInitialized()) {
    console.log('✅ Event listeners already setup by EventManager');
  } else {
    console.warn('⚠️ EventManager not available, event listeners may not be setup');
  }
}

// DDR CLEANUP: chatState moved to components/bubble-chat/bubble-service.js
// The chatState is now managed by the bubble-chat component and exported via window.chatState
// This provides better separation of concerns and proper state management

// ===== CORE RENDERER FUNCTIONS =====
// ARCHITECTURAL MIGRATION: Extracted from shared/utils/renderer-utilities.js
// These are core application renderer functions that belong in the core layer

/**
 * Message handling function for core application
 * @param {string|Object} message - Message to add to chat
 * @returns {string|null} Message ID or null if failed
 */
function addMessageToChat(message) {
  // Direct call to modern bubble component
  if (window.standaloneBubble && window.standaloneBubble.showMessage) {
    return window.standaloneBubble.showMessage(message);
  }
  console.warn('⚠️ Bubble chat component not available');
  return null;
}

/**
 * Tool result display function for core application
 * @param {string} messageId - Message ID
 * @param {string} toolName - Tool name
 * @param {Object} toolParams - Tool parameters
 * @param {Object} toolResult - Tool result
 * @returns {*} Result from tool manager
 */
function displayToolResult(messageId, toolName, toolParams, toolResult) {
  if (window.toolManager && window.toolManager.displayToolResult) {
    return window.toolManager.displayToolResult(messageId, toolName, toolParams, toolResult);
  }
  console.warn('⚠️ Tool manager not available');
  return null;
}

/**
 * Streaming message update function for core application
 * @param {string} messageId - Message ID
 * @param {string|Object} chunk - Message chunk
 * @param {boolean} done - Whether streaming is done
 * @returns {*} Result from bubble component
 */
function updateStreamingMessage(messageId, chunk, done) {
  // Direct call to modern bubble component
  if (window.standaloneBubble && window.standaloneBubble.updateBubbleContent) {
    // Extract text from chunk (same logic as MessageManager)
    let chunkText = '';
    if (chunk) {
      if (typeof chunk === 'string') {
        chunkText = chunk;
      } else if (chunk.text) {
        chunkText = chunk.text;
      } else if (chunk.content) {
        chunkText = chunk.content;
      } else if (chunk.delta && chunk.delta.content) {
        chunkText = chunk.delta.content;
      }
    }

    // Update bubble content directly
    return window.standaloneBubble.updateBubbleContent(messageId, chunkText);
  }
  console.warn('⚠️ Bubble chat component not available for streaming update');
  return null;
}

// DDR CLEANUP: Voice TTS functions moved to components/voice/ (SSOT)
// Voice output functionality now handled by voice component

/**
 * Initialize core renderer functions by exporting to window
 * ARCHITECTURAL MIGRATION: Core renderer initialization
 */
function initializeCoreRenderer() {
  // Export core renderer functions globally
  window.addMessageToChat = addMessageToChat;
  window.displayToolResult = displayToolResult;
  window.updateStreamingMessage = updateStreamingMessage;

  // DDR CLEANUP: TTS functions moved to voice component (SSOT)

  console.log('✅ Core renderer functions initialized and exported to window');
}

// Initialize core renderer functions after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCoreRenderer);
} else {
  initializeCoreRenderer();
}

// DDR CLEANUP: chatState export moved to components/bubble-chat/index.js
// The chatState is now exported by the bubble-chat component for better architecture

// DDR CLEANUP: Backward compatibility aliases removed - not used anywhere in codebase

// All other functions have been moved to their respective modules
