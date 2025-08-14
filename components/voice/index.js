// Voice Component Entry Point (SSOT)
// DDR CLEANUP: Updated to use consolidated voice utilities
// This file serves as the main entry point for the voice component
// Following SSOT principles - all voice-related functionality is managed here

console.log('🔥 LOADING: voice/index.js file is being loaded (SSOT)');

// Load voice component utilities (SSOT)
if (typeof window !== 'undefined') {
  // Load voice configuration
  const script1 = document.createElement('script');
  script1.src = './components/voice/voice-config.js';
  document.head.appendChild(script1);

  // Load voice utilities
  const script2 = document.createElement('script');
  script2.src = './components/voice/voice-utils.js';
  document.head.appendChild(script2);

  // Load ElevenLabs client
  const script3 = document.createElement('script');
  script3.src = './components/voice/elevenlabs-client.js';
  document.head.appendChild(script3);
}

const VoiceComponent = {
  // Component metadata
  name: 'Voice',
  version: '1.0.0',
  description: 'Voice component for Mamouse Agent',
  
  // Component modules
  manager: null,
  service: null,
  
  // Initialization status
  initialized: false,
  
  /**
   * Initialize the voice component
   * This method sets up all voice-related functionality
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Voice component already initialized');
      return true;
    }

    try {
      console.log('📝 Initializing Voice Component...');
      console.log('📝 DOM ready state:', document.readyState);
      console.log('📝 VoiceManager available:', !!window.VoiceManager);
      console.log('📝 VoiceService available:', !!window.VoiceService);
      
      // Initialize voice manager (UI logic)
      if (window.VoiceManager) {
        this.manager = new window.VoiceManager();
        const managerResult = await this.manager.initialize();
        if (managerResult) {
          console.log('✅ Voice Manager initialized');
        } else {
          console.error('❌ Voice Manager initialization failed');
          return false;
        }
      } else {
        console.error('❌ VoiceManager class not available');
        return false;
      }
      
      // Initialize voice service (processing logic)
      if (window.VoiceService) {
        this.service = new window.VoiceService();
        const serviceResult = await this.service.initialize();
        if (serviceResult) {
          console.log('✅ Voice Service initialized');

          // Attach service to global voice input handler for access
          if (window.voiceInputHandler) {
            window.voiceInputHandler.voiceService = this.service;
            console.log('🔧 Voice service attached to global handler');
          }
        } else {
          console.error('❌ Voice Service initialization failed');
          return false;
        }
      } else {
        console.error('❌ VoiceService class not available');
        return false;
      }
      
      this.initialized = true;
      console.log('✅ Voice Component fully initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Voice Component:', error);
      return false;
    }
  },
  
  /**
   * Get the voice manager instance
   */
  getManager() {
    return this.manager;
  },
  
  /**
   * Get the voice service instance
   */
  getService() {
    return this.service;
  },
  
  /**
   * Get the voice button DOM element
   */
  getVoiceButton() {
    return this.manager ? this.manager.getVoiceButton() : null;
  },
  
  /**
   * Check if component is initialized
   */
  isInitialized() {
    return this.initialized;
  },
  
  /**
   * Toggle voice input
   */
  toggleVoiceInput() {
    if (this.manager && this.manager.toggleVoiceInput) {
      this.manager.toggleVoiceInput();
    }
  },
  
  /**
   * Set conversation mode (DDR CLEANUP: Simplified - direct property access)
   */
  setConversationMode(enabled) {
    if (this.manager) {
      this.manager.conversationMode = enabled;
    }
    if (this.service) {
      this.service.conversationMode = enabled;
    }
  },

  /**
   * Set listening state (DDR CLEANUP: Simplified - direct property access)
   */
  setListening(listening) {
    if (this.manager) {
      this.manager.isListening = listening;
      this.manager.updateVoiceButton();
    }
  },
  
  /**
   * Get voice state
   */
  getVoiceState() {
    if (this.manager && this.manager.getVoiceState) {
      return this.manager.getVoiceState();
    }
    return { isListening: false, conversationMode: false, isInitialized: false };
  },
  
  /**
   * Play audio
   */
  async playAudio(audioData) {
    if (this.service && this.service.playAudio) {
      return await this.service.playAudio(audioData);
    }
  },
  
  /**
   * Stop audio
   */
  stopAudio() {
    if (this.service && this.service.stopAudio) {
      this.service.stopAudio();
    }
  },
  
  /**
   * Set audio volume
   */
  setVolume(volume) {
    if (this.service && this.service.setVolume) {
      this.service.setVolume(volume);
    }
  },
  
  /**
   * Enable/disable audio
   */
  setAudioEnabled(enabled) {
    if (this.service && this.service.setAudioEnabled) {
      this.service.setAudioEnabled(enabled);
    }
  },
  
  /**
   * Get component status
   */
  getStatus() {
    const managerState = this.manager ? this.manager.getVoiceState() : {};
    const serviceStatus = this.service ? this.service.getStatus() : {};
    
    return {
      initialized: this.initialized,
      manager: managerState,
      service: serviceStatus
    };
  },
  
  /**
   * Cleanup voice component
   */
  cleanup() {
    if (this.manager && this.manager.cleanup) {
      this.manager.cleanup();
    }
    if (this.service && this.service.cleanup) {
      this.service.cleanup();
    }
    this.initialized = false;
    console.log('📝 Voice Component cleaned up');
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.VoiceComponent = VoiceComponent;
  
  // CRITICAL: Create global instance immediately like the original
  // This ensures backward compatibility with existing code
  if (window.VoiceManager) {
    console.log('📝 Creating global voiceInputHandler instance...');
    
    // Create the global instance
    const globalManager = new window.VoiceManager();
    
    // Create backward compatibility wrapper that matches original API
    window.voiceInputHandler = {
      // Core properties
      isListening: false,
      conversationMode: false,
      isInitialized: false,
      
      // Core methods that match original API
      initialize: async () => {
        const result = await globalManager.initialize();
        window.voiceInputHandler.isInitialized = result;
        return result;
      },
      
      toggleVoiceInput: () => globalManager.toggleVoiceInput(),
      // DDR CLEANUP: toggleMic() method removed - use toggleVoiceInput() instead
      toggleMic: () => globalManager.toggleVoiceInput(),
      // DDR CLEANUP: Direct property access since methods were removed
      setConversationMode: (enabled) => { globalManager.conversationMode = enabled; },
      setListening: (listening) => {
        globalManager.isListening = listening;
        globalManager.updateVoiceButton();
      },
      getVoiceState: () => globalManager.getVoiceState(),
      updateVoiceButton: () => globalManager.updateVoiceButton(),
      
      // Expose the manager for advanced usage
      _manager: globalManager
    };
    
    console.log('✅ Global voiceInputHandler instance created');
  } else {
    console.error('❌ Cannot create global voiceInputHandler - VoiceManager not available');
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceComponent;
}

console.log('📝 Voice Component entry point loaded');
console.log('🔍 Available classes:', {
  VoiceManager: typeof window.VoiceManager,
  VoiceService: typeof window.VoiceService,
  voiceInputHandler: typeof window.voiceInputHandler
});
