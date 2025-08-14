/**
 * Bubble Chat Component for Mamouse Agent
 * Main component integration and backward compatibility
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

import BubbleManager from './bubble-manager.js';
import BubbleService from './bubble-service.js';

/**
 * BubbleChatComponent - Main component class
 * @class BubbleChatComponent
 */
class BubbleChatComponent {
  constructor() {
    // Component instances
    this.manager = null;
    this.service = null;

    // Component state
    this.#state = {
      initialized: false,
      ready: false
    };

    console.log('💬 Bubble Chat Component initialized');
  }

  // Private properties
  #state = null;

  /**
   * Initialize the bubble chat component
   */
  async initialize() {
    if (this.#state.initialized) {
      console.warn('Bubble Chat component already initialized');
      return true;
    }

    try {
      console.log('💬 Initializing Bubble Chat Component...');

      // Initialize service first (state management)
      this.service = new BubbleService();
      const serviceReady = await this.service.initialize();

      if (!serviceReady) {
        throw new Error('Failed to initialize bubble service');
      }

      // Initialize manager (UI logic)
      this.manager = new BubbleManager();
      const managerReady = await this.manager.initialize();

      if (!managerReady) {
        throw new Error('Failed to initialize bubble manager');
      }

      // Setup integration between manager and service
      this.#setupIntegration();

      this.#state.initialized = true;
      this.#state.ready = true;

      console.log('✅ Bubble Chat Component initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Bubble Chat Component:', error);
      this.#state.initialized = false;
      this.#state.ready = false;
      return false;
    }
  }

  /**
   * Setup integration between manager and service
   */
  #setupIntegration() {
    // Integration logic can be added here if needed
    console.log('💬 Bubble Chat integration setup complete');
  }

  /**
   * Show message in bubble chat
   */
  showMessage(message) {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return null;
    }

    try {
      // Add message to service (state management)
      const messageObj = this.service.addMessage(message);
      if (!messageObj) {
        console.error('❌ Failed to add message to service');
        return null;
      }

      // Create and display bubble
      const bubble = this.manager.createBubble(messageObj);
      if (!bubble) {
        console.error('❌ Failed to create bubble');
        return null;
      }

      // Add bubble to chat area
      const success = this.manager.addBubble(bubble, messageObj.isUser);
      if (!success) {
        console.error('❌ Failed to add bubble to chat area');
        return null;
      }

      return bubble;

    } catch (error) {
      console.error('❌ Error showing message:', error);
      return null;
    }
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator(messageId = null) {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return null;
    }

    const typingMessage = {
      id: messageId || `typing_${Date.now()}`,
      text: '',
      isUser: false,
      isTyping: true,
      timestamp: new Date().toISOString()
    };

    return this.showMessage(typingMessage);
  }

  /**
   * Update bubble content (for streaming responses)
   */
  updateBubbleContent(bubbleId, text) {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return false;
    }

    try {
      // Update in service
      const updated = this.service.updateMessage(bubbleId, { 
        text: text, 
        isTyping: false 
      });

      if (!updated) {
        console.warn(`⚠️ Failed to update message in service: ${bubbleId}`);
      }

      // Update in manager
      return this.manager.updateBubbleContent(bubbleId, text);

    } catch (error) {
      console.error(`❌ Error updating bubble content ${bubbleId}:`, error);
      return false;
    }
  }

  /**
   * Hide bubble
   */
  hideBubble(bubbleId) {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return false;
    }

    return this.manager.removeBubble(bubbleId);
  }

  /**
   * Clear all bubbles
   */
  clearAllBubbles() {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return false;
    }

    try {
      // Clear from manager
      const managerCleared = this.manager.clearAllBubbles();
      
      // Clear from service
      const serviceCleared = this.service.clearMessages();

      return managerCleared && serviceCleared;

    } catch (error) {
      console.error('❌ Error clearing all bubbles:', error);
      return false;
    }
  }

  /**
   * Scroll to bottom
   */
  scrollToBottom() {
    if (!this.isReady()) {
      console.warn('⚠️ Bubble Chat component not ready');
      return;
    }

    this.manager.scrollToBottom();
  }

  /**
   * Get bubble manager instance
   */
  getManager() {
    return this.manager;
  }

  /**
   * Get bubble service instance
   */
  getService() {
    return this.service;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      initialized: this.#state.initialized,
      ready: this.#state.ready,
      manager: this.manager ? this.manager.getState() : null,
      service: this.service ? this.service.getState() : null
    };
  }

  /**
   * Check if component is ready
   */
  isReady() {
    return this.#state.ready && this.manager && this.service;
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.#state.initialized;
  }

  /**
   * Cleanup component
   */
  cleanup() {
    if (this.manager) {
      this.manager.cleanup();
    }

    if (this.service) {
      this.service.cleanup();
    }

    this.#state.initialized = false;
    this.#state.ready = false;

    console.log('💬 Bubble Chat Component cleaned up');
  }
}

// ===== GLOBAL COMPONENT INSTANCE =====
const globalBubbleChatComponent = new BubbleChatComponent();

// Initialize component when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await globalBubbleChatComponent.initialize();
    console.log('💬 Bubble Chat Component initialized via DOMContentLoaded');
  });
} else {
  // DOM is already ready
  setTimeout(async () => {
    await globalBubbleChatComponent.initialize();
    console.log('💬 Bubble Chat Component initialized immediately');
  }, 100); // Small delay to ensure DOM elements are available
}

// ===== BACKWARD COMPATIBILITY =====
// Expose global component instance
window.bubbleChatComponent = globalBubbleChatComponent;

// Standalone Bubble compatibility
window.standaloneBubble = {
  showMessage: (message) => {
    return globalBubbleChatComponent.showMessage(message);
  },
  showTypingIndicator: (messageId) => {
    return globalBubbleChatComponent.showTypingIndicator(messageId);
  },
  updateBubbleContent: (bubbleId, text) => {
    return globalBubbleChatComponent.updateBubbleContent(bubbleId, text);
  },
  hideBubble: (bubbleId) => {
    return globalBubbleChatComponent.hideBubble(bubbleId);
  },
  clearAllBubbles: () => {
    return globalBubbleChatComponent.clearAllBubbles();
  },
  // Debug functions
  verifyScrollIsolation: () => {
    console.log('💬 Scroll isolation verification - component architecture');
    return true;
  },
  testScrollTransition: () => {
    console.log('💬 Scroll transition test - component architecture');
    return true;
  }
};

// Virtual Scroll compatibility
window.virtualScroll = {
  addBubble: (bubble, isUser) => {
    if (globalBubbleChatComponent.isReady()) {
      return globalBubbleChatComponent.getManager().addBubble(bubble, isUser);
    }
    return false;
  },
  removeBubble: (bubbleId) => {
    if (globalBubbleChatComponent.isReady()) {
      return globalBubbleChatComponent.getManager().removeBubble(bubbleId);
    }
    return false;
  },
  scrollToBottom: () => {
    if (globalBubbleChatComponent.isReady()) {
      globalBubbleChatComponent.scrollToBottom();
    }
  }
};

// Global utility functions
window.showMessage = (message) => {
  return globalBubbleChatComponent.showMessage(message);
};

window.showTypingIndicator = (messageId) => {
  return globalBubbleChatComponent.showTypingIndicator(messageId);
};

window.updateBubbleContent = (bubbleId, text) => {
  return globalBubbleChatComponent.updateBubbleContent(bubbleId, text);
};

// DDR CLEANUP: Export chatState for backward compatibility with websocket-manager.js
// This provides access to the legacy chatState object moved from core/renderer.js
window.chatState = null; // Will be set when component is initialized

// Update chatState reference when component is ready
const updateChatStateReference = () => {
  if (globalBubbleChatComponent.isReady()) {
    window.chatState = globalBubbleChatComponent.getService().getChatState();
    console.log('💬 chatState reference updated for backward compatibility');
  } else {
    // Retry after a short delay
    setTimeout(updateChatStateReference, 100);
  }
};

// Start updating chatState reference
updateChatStateReference();

console.log('💬 Bubble Chat Component loaded with backward compatibility');

// Export for ES6 module usage
export default BubbleChatComponent;
