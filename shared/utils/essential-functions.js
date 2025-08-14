// Essential Functions - Cross-Component Utility Functions
// ARCHITECTURAL CORRECTION: Moved from shared/services/essential-functions.js to shared/utils/essential-functions.js
// REASON: Contains cross-component utility functions, DOM event handlers, and delegation logic - NOT service logic
// These functions are critical workarounds while modular system is being fixed

// DDR CLEANUP: toggleMenu() function removed - handled by menu-bar component via window.toggleMenu

// Essential Message Sending Function - Delegates to proper components
async function sendMessage() {
  console.log('🔧 essential-functions.js sendMessage() called - delegating to components...');
  
  // Priority 1: Try InputService component (preferred)
  if (window.InputContainerComponent && window.InputContainerComponent.getService()) {
    console.log('✅ Delegating to InputService component');
    const service = window.InputContainerComponent.getService();
    return await service.processMessage();
  }
  
  // Priority 2: Try WebSocket manager sendMessage (if available and connected)
  if (window.socket && window.isConnected) {
    console.log('✅ WebSocket available, checking for WebSocket sendMessage');
    // Get the WebSocket manager's sendMessage (avoid infinite recursion)
    const webSocketManager = window.webSocketManager;
    if (webSocketManager && webSocketManager.sendMessage && webSocketManager.sendMessage !== sendMessage) {
      console.log('✅ Delegating to WebSocket manager sendMessage');
      return webSocketManager.sendMessage();
    }
  }
  
  // Priority 3: Direct Electron API fallback (original implementation)
  console.log('⚠️ Using direct Electron API fallback');
  const messageInput = document.getElementById('message-input');
  if (!messageInput) {
    console.error('❌ Message input element not found');
    return;
  }

  const message = messageInput.value.trim();
  if (!message) {
    console.warn('⚠️ Message is empty');
    return;
  }

  try {
    messageInput.value = '';

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    // Display user message
    if (window.showMessage) {
      window.showMessage(userMessage);
    } else if (window.standaloneBubble && window.standaloneBubble.showMessage) {
      window.standaloneBubble.showMessage(userMessage);
    }

    // Show typing indicator
    let typingBubble = null;
    if (window.standaloneBubble && window.standaloneBubble.showTypingIndicator) {
      typingBubble = window.standaloneBubble.showTypingIndicator();
    }

    // Send to Gemini API
    const response = await window.electronAPI.sendMessageToGemini(message);

    // Hide typing indicator
    if (typingBubble) {
      if (window.standaloneBubble && window.standaloneBubble.hideBubble && typingBubble.id) {
        window.standaloneBubble.hideBubble(typingBubble.id);
      } else {
        typingBubble.remove();
      }
    }

    // Display assistant message
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      text: response.text || response.message || 'No response from Gemini',
      isUser: false,
      timestamp: new Date().toISOString()
    };

    if (window.showMessage) {
      window.showMessage(assistantMessage);
    } else if (window.standaloneBubble && window.standaloneBubble.showMessage) {
      window.standaloneBubble.showMessage(assistantMessage);
    }

  } catch (error) {
    console.error('❌ Error in sendMessage fallback:', error);
    
    if (typingBubble) {
      if (window.standaloneBubble && window.standaloneBubble.hideBubble && typingBubble.id) {
        window.standaloneBubble.hideBubble(typingBubble.id);
      } else {
        typingBubble.remove();
      }
    }

    const errorMessage = {
      id: (Date.now() + 2).toString(),
      text: 'Error: ' + (error.message || 'Failed to get response from Gemini'),
      isUser: false,
      timestamp: new Date().toISOString()
    };

    if (window.showMessage) {
      window.showMessage(errorMessage);
    } else if (window.standaloneBubble && window.standaloneBubble.showMessage) {
      window.standaloneBubble.showMessage(errorMessage);
    }
  }
}

// Make sendMessage globally available
window.sendMessage = sendMessage;

// DDR CLEANUP: Menu event handlers removed - handled by menu-bar component
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Essential functions loaded - menu functionality delegated to menu-bar component (shared/utils)');

  console.log('🔧 Menu submenu handlers setup complete');

  // Form submission handler
  const messageForm = document.getElementById('message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage();
    });
  }
});
