/**
 * Bubble Service for Mamouse Agent
 * Handles state management and data persistence for bubble chat
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Bubble Service Configuration
const BUBBLE_SERVICE_CONFIG = {
  // Storage keys
  storage: {
    messages: 'mamouse_chat_messages',
    preferences: 'mamouse_bubble_preferences',
    state: 'mamouse_bubble_state'
  },

  // Default preferences
  defaults: {
    autoScroll: true,
    maxMessages: 100,
    persistMessages: true,
    animationsEnabled: true
  },

  // Message types
  messageTypes: {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    TYPING: 'typing'
  }
};

/**
 * BubbleService - State management and data persistence
 * @class BubbleService
 */
class BubbleService {
  constructor() {
    // State management
    this.#state = {
      initialized: false,
      messages: [],
      preferences: { ...BUBBLE_SERVICE_CONFIG.defaults },
      currentConversationId: null,
      lastMessageId: null
    };

    // DDR CLEANUP: chatState moved from core/renderer.js to bubble-chat component
    // Legacy chat state for backward compatibility with websocket-manager.js
    this.chatState = {
      messages: [], // Menyimpan semua pesan dalam percakapan saat ini
      userMessageId: null, // ID pesan pengguna saat ini
      assistantMessageId: null, // ID pesan asisten saat ini
      isFirstMessage: true, // Flag untuk menandai pesan pertama
      userBubbleElement: null, // Referensi ke elemen bubble pengguna
      responseBubbleElement: null, // Referensi ke elemen bubble respons
      firstChunk: undefined // Used by websocket-manager.js for TTS streaming
    };

    console.log('💾 Bubble Service initialized');
  }

  // Private properties
  #state = null;

  /**
   * Initialize bubble service
   */
  async initialize() {
    try {
      console.log('💾 Initializing Bubble Service...');

      // Load preferences
      await this.#loadPreferences();

      // Load message history
      await this.#loadMessages();

      // Generate conversation ID if needed
      if (!this.#state.currentConversationId) {
        this.#state.currentConversationId = this.#generateConversationId();
      }

      this.#state.initialized = true;
      console.log('✅ Bubble Service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Bubble Service:', error);
      return false;
    }
  }

  /**
   * Add message to chat history
   */
  addMessage(message) {
    try {
      if (!message) {
        console.error('❌ Invalid message provided');
        return null;
      }

      // Create message object with required fields
      const messageObj = {
        id: message.id || this.#generateMessageId(),
        text: message.text || '',
        isUser: Boolean(message.isUser),
        timestamp: message.timestamp || new Date().toISOString(),
        conversationId: this.#state.currentConversationId,
        isTyping: Boolean(message.isTyping)
      };

      // Add to state
      this.#state.messages.push(messageObj);
      this.#state.lastMessageId = messageObj.id;

      // Manage message limit
      this.#manageMessageLimit();

      // Persist if enabled
      if (this.#state.preferences.persistMessages) {
        this.#saveMessages();
      }

      console.log(`💾 Added message: ${messageObj.id}`);
      return messageObj;

    } catch (error) {
      console.error('❌ Error adding message:', error);
      return null;
    }
  }

  /**
   * Update existing message
   */
  updateMessage(messageId, updates) {
    try {
      const messageIndex = this.#state.messages.findIndex(m => m.id === messageId);
      
      if (messageIndex === -1) {
        console.warn(`⚠️ Message not found for update: ${messageId}`);
        return null;
      }

      // Update message
      const message = this.#state.messages[messageIndex];
      Object.assign(message, updates, {
        updatedAt: new Date().toISOString()
      });

      // Persist if enabled
      if (this.#state.preferences.persistMessages) {
        this.#saveMessages();
      }

      console.log(`💾 Updated message: ${messageId}`);
      return message;

    } catch (error) {
      console.error(`❌ Error updating message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Get message by ID
   */
  getMessage(messageId) {
    return this.#state.messages.find(m => m.id === messageId) || null;
  }

  /**
   * Get all messages
   */
  getAllMessages() {
    return [...this.#state.messages];
  }

  /**
   * Get messages for current conversation
   */
  getConversationMessages() {
    return this.#state.messages.filter(m => m.conversationId === this.#state.currentConversationId);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    try {
      this.#state.messages = [];
      this.#state.lastMessageId = null;

      // Persist if enabled
      if (this.#state.preferences.persistMessages) {
        this.#saveMessages();
      }

      console.log('💾 Cleared all messages');
      return true;

    } catch (error) {
      console.error('❌ Error clearing messages:', error);
      return false;
    }
  }

  /**
   * Start new conversation
   */
  startNewConversation() {
    try {
      this.#state.currentConversationId = this.#generateConversationId();
      console.log(`💾 Started new conversation: ${this.#state.currentConversationId}`);
      return this.#state.currentConversationId;

    } catch (error) {
      console.error('❌ Error starting new conversation:', error);
      return null;
    }
  }

  /**
   * Get preferences
   */
  getPreferences() {
    return { ...this.#state.preferences };
  }

  /**
   * Update preferences
   */
  updatePreferences(newPreferences) {
    try {
      Object.assign(this.#state.preferences, newPreferences);
      this.#savePreferences();
      console.log('💾 Updated preferences');
      return true;

    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      initialized: this.#state.initialized,
      messageCount: this.#state.messages.length,
      currentConversationId: this.#state.currentConversationId,
      lastMessageId: this.#state.lastMessageId,
      preferences: { ...this.#state.preferences }
    };
  }

  /**
   * Load preferences from storage
   */
  async #loadPreferences() {
    try {
      const stored = localStorage.getItem(BUBBLE_SERVICE_CONFIG.storage.preferences);
      if (stored) {
        const preferences = JSON.parse(stored);
        Object.assign(this.#state.preferences, preferences);
        console.log('💾 Loaded preferences from storage');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  #savePreferences() {
    try {
      localStorage.setItem(
        BUBBLE_SERVICE_CONFIG.storage.preferences,
        JSON.stringify(this.#state.preferences)
      );
    } catch (error) {
      console.warn('⚠️ Failed to save preferences:', error);
    }
  }

  /**
   * Load messages from storage
   */
  async #loadMessages() {
    try {
      if (!this.#state.preferences.persistMessages) {
        return;
      }

      const stored = localStorage.getItem(BUBBLE_SERVICE_CONFIG.storage.messages);
      if (stored) {
        const messages = JSON.parse(stored);
        this.#state.messages = Array.isArray(messages) ? messages : [];
        
        // Set last message ID
        if (this.#state.messages.length > 0) {
          this.#state.lastMessageId = this.#state.messages[this.#state.messages.length - 1].id;
        }

        console.log(`💾 Loaded ${this.#state.messages.length} messages from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load messages:', error);
      this.#state.messages = [];
    }
  }

  /**
   * Save messages to storage
   */
  #saveMessages() {
    try {
      localStorage.setItem(
        BUBBLE_SERVICE_CONFIG.storage.messages,
        JSON.stringify(this.#state.messages)
      );
    } catch (error) {
      console.warn('⚠️ Failed to save messages:', error);
    }
  }

  /**
   * Manage message limit to prevent storage overflow
   */
  #manageMessageLimit() {
    const maxMessages = this.#state.preferences.maxMessages;
    
    while (this.#state.messages.length > maxMessages) {
      this.#state.messages.shift();
    }
  }

  /**
   * Generate unique message ID
   */
  #generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique conversation ID
   */
  #generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.#state.initialized;
  }

  /**
   * Get legacy chatState for backward compatibility
   * DDR CLEANUP: Provides access to chatState for websocket-manager.js
   */
  getChatState() {
    return this.chatState;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Save current state before cleanup
    if (this.#state.preferences.persistMessages) {
      this.#saveMessages();
    }
    this.#savePreferences();

    this.#state.initialized = false;
    console.log('💾 Bubble Service cleaned up');
  }
}

// Export for use in other modules
export default BubbleService;
