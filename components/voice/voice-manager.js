// Voice Manager - UI Logic for Voice Component
// Manages voice input UI interactions, button states, and visual feedback
// Migrated from ui/voice-input.js following SSOT principles

console.log('🔥 LOADING: voice-manager.js file is being loaded');

class VoiceManager {
  constructor() {
    // DOM elements
    this.voiceButton = null;
    this.voiceIcon = null;

    // Simplified State Management (Boolean flags like Jarvis)
    this.isListening = false;
    this.conversationMode = false; // DDR CLEANUP: Added missing property referenced in getVoiceState()
    this.isInitialized = false;

    // Event listeners tracking
    this.eventListeners = new Map();

    // Utilities
    this.utils = window.createUtilityManager ? window.createUtilityManager('VoiceManager') : null;

    console.log('📝 Voice Manager initialized (Simplified)');
  }

  /**
   * Initialize voice manager
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Voice Manager already initialized');
      return true;
    }

    try {
      console.log('🔧 Initializing Voice Manager...');
      console.log('🔧 DOM ready state:', document.readyState);

      // Wait for DOM to be ready if needed
      if (document.readyState !== 'complete') {
        console.log('🔧 Waiting for DOM to be ready...');
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
          }
        });
      }

      // Get DOM elements with detailed logging
      console.log('🔧 Looking for voice button...');
      this.voiceButton = this.utils?.getElement('voice-btn') || document.getElementById('voice-btn');
      console.log('🔧 Voice button found:', !!this.voiceButton);

      if (this.voiceButton) {
        console.log('🔧 Voice button ID:', this.voiceButton.id);
        console.log('🔧 Voice button classes:', this.voiceButton.className);
        this.voiceIcon = this.voiceButton.querySelector('svg');
        console.log('🔧 Voice icon found:', !!this.voiceIcon);
      }

      if (!this.voiceButton) {
        console.error('❌ Voice button not found with ID: voice-btn');
        console.error('❌ Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.id || b.className));
        return false;
      }

      // Setup event listeners
      this.setupEventListeners();

      // Apply initial styling
      this.updateVoiceButton();

      this.isInitialized = true;
      console.log('✅ Voice Manager initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Voice Manager:', error);
      console.error('❌ Error stack:', error.stack);
      return false;
    }
  }

  /**
   * Setup event listeners for voice button
   */
  setupEventListeners() {
    if (!this.voiceButton) return;

    try {
      console.log('🔧 Setting up voice button event listeners...');
      console.log('🔧 Voice button element:', this.voiceButton);

      // Voice button click handler with detailed logging
      const clickHandler = (e) => {
        console.log('🎯 MICROPHONE BUTTON CLICKED!');
        console.log('🎯 Event details:', e);
        console.log('🎯 Current listening state:', this.isListening);

        e.preventDefault();
        e.stopPropagation();

        console.log('🎯 Calling toggleVoiceInput()...');
        this.toggleVoiceInput();
      };

      this.voiceButton.addEventListener('click', clickHandler);
      this.eventListeners.set('voice-click', {
        element: this.voiceButton,
        event: 'click',
        handler: clickHandler
      });

      console.log('✅ Voice button event listeners setup successfully');
      console.log('✅ Button ID:', this.voiceButton.id);
      console.log('✅ Button classes:', this.voiceButton.className);

    } catch (error) {
      console.error('❌ Error setting up voice event listeners:', error);
    }
  }

  /**
   * Toggle voice input (Simplified like Jarvis - Direct boolean toggle)
   */
  toggleVoiceInput() {
    try {
      console.log('🔄 toggleVoiceInput() called');
      console.log('🔄 Current state before toggle:', this.isListening);

      // Direct toggle like Jarvis approach
      this.isListening = !this.isListening;
      console.log('🔄 New state after toggle:', this.isListening);

      this.updateVoiceButton();
      console.log('🔄 Button updated');

      // Check if VoiceComponent exists
      console.log('🔄 Checking VoiceComponent...');
      console.log('🔄 window.VoiceComponent exists:', !!window.VoiceComponent);

      if (window.VoiceComponent) {
        console.log('🔄 Getting voice service...');
        const service = window.VoiceComponent.getService();
        console.log('🔄 Voice service:', service);

        if (service) {
          console.log('🔄 Calling service.handleVoiceToggle()...');
          service.handleVoiceToggle(this.isListening);
          console.log('🔄 Service.handleVoiceToggle() called successfully');
        } else {
          console.error('❌ Voice service not available');
        }
      } else {
        console.error('❌ VoiceComponent not available');
      }

      console.log(`🎤 Voice ${this.isListening ? 'ON' : 'OFF'} (Direct toggle)`);
      return true;
    } catch (error) {
      console.error('❌ Error toggling voice input:', error);
      console.error('❌ Error stack:', error.stack);
      return false;
    }
  }

  // REMOVED: toggleMic() - Redundant with simplified toggleVoiceInput()

  /**
   * Update voice button appearance (Simplified like Jarvis)
   */
  updateVoiceButton() {
    if (!this.voiceButton) return;

    try {
      // Simple active/inactive toggle
      if (this.isListening) {
        this.voiceButton.classList.add('active');
        this.voiceButton.classList.remove('inactive');
      } else {
        this.voiceButton.classList.remove('active');
        this.voiceButton.classList.add('inactive');
      }

      // Update icon if available
      this.updateVoiceIcon();

      console.log(`🎤 Button updated: ${this.isListening ? 'ACTIVE' : 'INACTIVE'}`);

    } catch (error) {
      console.error('❌ Error updating voice button:', error);
    }
  }

  /**
   * Update conversation state with visual feedback
   */
  updateConversationState(state) {
    try {
      if (!this.voiceButton) return;

      // Remove all conversation state classes
      this.voiceButton.classList.remove('connecting', 'processing', 'transcribing', 'responding', 'error', 'interrupted');

      // Add appropriate state class
      switch (state) {
        case 'connected':
          this.voiceButton.classList.add('active');
          this.voiceButton.title = 'Voice conversation active - speak now';
          break;
        case 'connecting':
          this.voiceButton.classList.add('connecting');
          this.voiceButton.title = 'Connecting to voice AI...';
          break;
        case 'transcribing':
          this.voiceButton.classList.add('processing', 'transcribing');
          this.voiceButton.title = 'Processing your speech...';
          break;
        case 'responding':
          this.voiceButton.classList.add('processing', 'responding');
          this.voiceButton.title = 'AI is responding...';
          break;
        case 'playing':
          this.voiceButton.classList.add('processing');
          this.voiceButton.title = 'Playing AI response...';
          break;
        case 'listening':
          this.voiceButton.classList.add('active');
          this.voiceButton.title = 'Listening for your voice...';
          break;
        case 'error':
          this.voiceButton.classList.add('error');
          this.voiceButton.title = 'Voice conversation error';
          break;
        case 'interrupted':
          this.voiceButton.classList.add('interrupted');
          this.voiceButton.title = 'Conversation interrupted';
          break;
        case 'disconnected':
          this.voiceButton.classList.remove('active');
          this.voiceButton.title = 'Start voice conversation';
          break;
      }

      console.log(`🎨 Voice button state updated: ${state}`);

    } catch (error) {
      console.error('❌ Error updating conversation state:', error);
    }
  }

  /**
   * Update voice activity visualization
   */
  updateVoiceActivity(level, active) {
    try {
      if (!this.voiceButton) return;

      // Add/remove voice activity class
      if (active && level > 20) {
        this.voiceButton.classList.add('voice-active');
        // Update CSS custom property for activity level
        this.voiceButton.style.setProperty('--voice-activity-level', level / 255);
      } else {
        this.voiceButton.classList.remove('voice-active');
        this.voiceButton.style.removeProperty('--voice-activity-level');
      }

      // Update voice visualizer if available
      this.updateVoiceVisualizer(level, active);

    } catch (error) {
      console.error('❌ Error updating voice activity:', error);
    }
  }

  /**
   * Update voice visualizer with activity data
   */
  updateVoiceVisualizer(level, active) {
    try {
      const visualizer = document.getElementById('voice-visualizer');
      const canvas = document.getElementById('visualizer-canvas');

      if (!visualizer || !canvas) return;

      // Show/hide visualizer based on activity
      if (active && this.isListening) {
        visualizer.style.display = 'block';
        visualizer.classList.add('active');

        // Draw simple waveform visualization
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'var(--primary-color)';

        // Simple bar visualization based on activity level
        const barHeight = (level / 255) * height * 0.8;
        const barWidth = width * 0.1;
        const x = (width - barWidth) / 2;
        const y = (height - barHeight) / 2;

        ctx.fillRect(x, y, barWidth, barHeight);

      } else {
        visualizer.classList.remove('active');
        if (!this.isListening) {
          visualizer.style.display = 'none';
        }
      }

    } catch (error) {
      console.error('❌ Error updating voice visualizer:', error);
    }
  }

  /**
   * Update voice icon based on state
   */
  updateVoiceIcon() {
    if (!this.voiceIcon) return;
    
    try {
      if (this.isListening) {
        // Listening icon (microphone with sound waves)
        this.voiceIcon.innerHTML = `
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="18" cy="8" r="1" fill="currentColor"/>
          <circle cx="20" cy="10" r="1" fill="currentColor"/>
          <circle cx="6" cy="8" r="1" fill="currentColor"/>
          <circle cx="4" cy="10" r="1" fill="currentColor"/>
        `;
      } else {
        // Default microphone icon
        this.voiceIcon.innerHTML = `
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      }
    } catch (error) {
      console.error('❌ Error updating voice icon:', error);
    }
  }

  // REMOVED: setConversationMode() and setListening() - DDR Cleanup: Unused methods

  /**
   * Get current voice state
   */
  getVoiceState() {
    return {
      isListening: this.isListening,
      conversationMode: this.conversationMode,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Get voice button element
   */
  getVoiceButton() {
    return this.voiceButton;
  }

  /**
   * Check if voice manager is initialized
   */
  isElementAvailable() {
    return !!(this.voiceButton && this.voiceButton.parentNode);
  }

  /**
   * Cleanup voice manager
   */
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners.clear();
    
    // Reset state
    this.isListening = false;
    this.conversationMode = false; // DDR CLEANUP: Fixed - property now exists in constructor
    this.isInitialized = false;
    
    console.log('📝 Voice Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.VoiceManager = VoiceManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceManager;
}

console.log('📝 Voice Manager loaded');
