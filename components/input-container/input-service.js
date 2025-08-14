// Input Service - Processing Logic for Input Container Component
// Handles input validation, message processing, and form submission logic
// Consolidated from various files following SSOT principles

console.log('🔥 LOADING: input-service.js file is being loaded');

class InputService {
  constructor() {
    // State
    this.initialized = false;
    
    // DOM element references
    this.messageInput = null;
    this.messageForm = null;
    
    console.log('📝 Input Service initialized');
  }

  /**
   * Initialize input service
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Input Service already initialized');
      return true;
    }
    
    try {
      // Get DOM element references
      this.messageInput = document.getElementById('message-input');
      this.messageForm = document.getElementById('message-form');
      
      if (!this.messageInput) {
        throw new Error('Message input element not found');
      }
      
      this.initialized = true;
      console.log('✅ Input Service initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Input Service:', error);
      return false;
    }
  }

  /**
   * Process message from input
   * Consolidated from sendMessage functions in multiple files
   */
  async processMessage() {
    if (!this.messageInput) {
      console.error('❌ Message input element not available');
      return false;
    }

    try {
      const message = this.messageInput.value.trim();
      
      // Validate message
      if (!this.validateMessage(message)) {
        return false;
      }

      // Clear input
      this.messageInput.value = '';

      // Process the message
      await this.sendMessage(message);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      return false;
    }
  }

  /**
   * Validate message input
   */
  validateMessage(message) {
    if (!message) {
      console.warn('⚠️ Message is empty, not sending');
      return false;
    }
    
    if (message.length > 10000) {
      console.warn('⚠️ Message too long, maximum 10000 characters');
      return false;
    }
    
    return true;
  }

  /**
   * Send message - consolidated from multiple implementations
   */
  async sendMessage(message) {
    console.log('📝 Processing message:', message);

    try {
      // Create user message object
      const userMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date().toISOString()
      };

      console.log('📝 Created user message object:', userMessage);

      // Display user message
      this.displayUserMessage(userMessage);

      // Show processing status
      this.showProcessingStatus();

      // Send to appropriate service
      await this.sendToService(message);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      this.hideProcessingStatus();
    }
  }

  /**
   * Display user message
   */
  displayUserMessage(userMessage) {
    try {
      console.log('📝 Attempting to display user message:', userMessage);

      // Debug: Check what display systems are available
      console.log('🔍 Available display systems:', {
        showMessage: !!window.showMessage,
        standaloneBubble: !!window.standaloneBubble,
        standaloneBubbleShowMessage: !!(window.standaloneBubble && window.standaloneBubble.showMessage),
        handleUserMessage: !!window.handleUserMessage
        // DDR CLEANUP: Removed messageManager debug info - no longer used
      });

      // Try message display systems in order of preference
      // DDR CLEANUP: Removed redundant messageManager fallback - use modern bubble component directly
      if (window.handleUserMessage) {
        console.log('✅ Using window.handleUserMessage');
        window.handleUserMessage(userMessage);
      } else if (window.standaloneBubble && window.standaloneBubble.showMessage) {
        console.log('✅ Using standaloneBubble.showMessage');
        window.standaloneBubble.showMessage(userMessage);
      } else if (window.showMessage) {
        console.log('✅ Using window.showMessage');
        window.showMessage(userMessage);
      } else {
        console.warn('⚠️ No message display system available');
        console.warn('Available window properties:', Object.keys(window).filter(key => key.includes('message') || key.includes('bubble') || key.includes('chat')));
      }
    } catch (error) {
      console.error('❌ Error displaying user message:', error);
    }
  }

  /**
   * Show processing status indicator
   */
  showProcessingStatus() {
    try {
      if (window.statusManager && window.statusManager.showStatusIndicator) {
        window.statusManager.showStatusIndicator('processing', 'Processing your request...', 10000);
      }
    } catch (error) {
      console.error('❌ Error showing processing status:', error);
    }
  }

  /**
   * Hide processing status indicator
   */
  hideProcessingStatus() {
    try {
      if (window.statusManager && window.statusManager.hideStatusIndicator) {
        window.statusManager.hideStatusIndicator();
      }
    } catch (error) {
      console.error('❌ Error hiding processing status:', error);
    }
  }

  /**
   * Send message to appropriate service
   */
  async sendToService(message) {
    try {
      // Try WebSocket first if available and connected
      if (this.tryWebSocketSend(message)) {
        return;
      }

      // Fallback to Electron API
      if (this.tryElectronAPISend(message)) {
        return;
      }

      // No service available
      console.error('❌ No message service available');
      this.hideProcessingStatus();

    } catch (error) {
      console.error('❌ Error sending to service:', error);
      this.hideProcessingStatus();
    }
  }

  /**
   * Try sending via WebSocket
   */
  tryWebSocketSend(message) {
    try {
      // Check if WebSocket is available and connected
      if (window.socket && window.isConnected) {
        console.log('✅ Sending message via WebSocket');
        
        window.socket.send(JSON.stringify({
          type: 'message',
          content: message
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ WebSocket send failed:', error);
      return false;
    }
  }

  /**
   * Try sending via Electron API
   */
  async tryElectronAPISend(message) {
    try {
      if (window.electronAPI && window.electronAPI.sendMessageToGemini) {
        console.log('✅ Sending message via Electron API');
        
        // Show typing indicator
        let typingBubble = null;
        if (window.standaloneBubble && window.standaloneBubble.showTypingIndicator) {
          typingBubble = window.standaloneBubble.showTypingIndicator();
        }

        const response = await window.electronAPI.sendMessageToGemini(message);

        // Hide typing indicator using proper component method
        if (typingBubble) {
          if (window.standaloneBubble && window.standaloneBubble.hideBubble && typingBubble.id) {
            window.standaloneBubble.hideBubble(typingBubble.id);
          } else {
            // Fallback to direct removal if component method not available
            typingBubble.remove();
          }
        }

        // Display the response in bubble chat
        if (response && response.success && response.text && window.standaloneBubble && window.standaloneBubble.showMessage) {
          console.log('✅ Displaying IPC response in bubble:', response.text);
          window.standaloneBubble.showMessage({
            id: `response-${Date.now()}`,
            text: response.text,
            isUser: false,
            timestamp: response.timestamp || new Date().toISOString()
          });
        } else {
          console.error('❌ Failed to display IPC response:', {
            response,
            hasSuccess: response?.success,
            hasText: response?.text,
            standaloneBubble: !!window.standaloneBubble
          });
        }

        this.hideProcessingStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Electron API send failed:', error);
      return false;
    }
  }

  // DDR CLEANUP: Removed unused utility methods (getMessageValue, clearMessageInput, focusMessageInput, isInitialized, cleanup)
  // These methods were not being used externally and added unnecessary complexity
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.InputService = InputService;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputService;
}

console.log('📝 Input Service loaded');
