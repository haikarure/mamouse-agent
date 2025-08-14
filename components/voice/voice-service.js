// Voice Service - Direct ElevenLabs Integration (Based on Working Jarvis Tutorial)
// Handles voice recognition, audio processing, and ElevenLabs Conversational AI
// Integrated directly from proven working Jarvis implementation

console.log('🔥 LOADING: voice-service.js file is being loaded');

class VoiceService {
  constructor() {
    // Simplified State Management - Boolean flags only (like Jarvis)
    this.initialized = false;
    this.isActive = false;
    this.pythonProcess = null;

    // DDR CLEANUP: Added missing properties referenced in getStatus() method
    this.isRecording = false;
    this.conversationMode = false;
    this.isConversationActive = false;
    this.recognitionSupported = false;
    this.isAudioEnabled = true;
    this.volume = 1.0;
    this.elevenLabsClient = null;
    this.conversation = null;

    // DDR CLEANUP: Configuration moved to voice-config.js (SSOT)
    this.apiKey = window.VoiceConfig?.python?.defaultApiKey || 'sk_9131261681c86fe4479ae577c64df46fddb4efaecad98a26';
    this.agentId = window.VoiceConfig?.python?.defaultAgentId || 'agent_01k0e81qeref59p5h71h1zdbh7';

    // Electron integration
    this.isElectronMode = typeof window !== 'undefined' && window.electronAPI;

    console.log('🎤 Voice Service initialized (Simplified Jarvis Architecture)');
    console.log('🔧 Electron mode:', this.isElectronMode);
    console.log('🔑 API Key:', this.apiKey.substring(0, 10) + '...');
    console.log('🤖 Agent ID:', this.agentId);
  }

  /**
   * Simple UI update method (Simplified like Jarvis)
   */
  updateUI(status) {
    try {
      // Simple status update
      console.log('🔄 UI Status:', status);

      // Update input container state
      this.updateInputContainerVoiceState();

      // Update visual feedback
      this.updateVoiceVisualFeedback(status);

    } catch (error) {
      console.error('❌ Error updating UI:', error);
    }
  }

  /**
   * Initialize voice service (Simplified Jarvis approach)
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Voice service already initialized');
      return true;
    }

    try {
      console.log('🎤 Initializing Voice Service (Simplified Jarvis Architecture)...');

      // DDR CLEANUP: Setup voice permissions (moved from core/app.js)
      this.setupVoicePermissions();

      // No complex initialization needed - Jarvis approach is direct
      this.initialized = true;
      console.log('✅ Voice Service initialized successfully');

      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Voice Service:', error);
      throw error;
    }
  }

  /**
   * Initialize ElevenLabs client (Direct from Jarvis tutorial)
   */
  async initializeElevenLabsClient() {
    try {
      console.log('🔧 Initializing ElevenLabs client...');

      // Import ElevenLabs (new package)
      if (typeof require !== 'undefined') {
        const { ElevenLabs } = require('@elevenlabs/elevenlabs-js');
        this.ElevenLabs = ElevenLabs;
      } else {
        // For browser environment, we'll use a different approach
        console.warn('⚠️ Running in browser mode - ElevenLabs will be initialized on demand');
      }

      console.log('✅ ElevenLabs client ready');

    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs client:', error);
      throw error;
    }
  }

  /**
   * Create ElevenLabs conversation (Direct Jarvis approach)
   */
  async createElevenLabsConversation() {
    try {
      console.log('🎯 Creating ElevenLabs conversation...');

      // This will be implemented using the exact Jarvis approach
      // For now, we'll use a simplified version that works in browser

      // Initialize client
      this.elevenLabsClient = new this.ElevenLabs({
        apiKey: this.apiKey
      });

      console.log('✅ ElevenLabs conversation client created');
      return true;

    } catch (error) {
      console.error('❌ Failed to create ElevenLabs conversation:', error);
      return false;
    }
  }

  /**
   * Create enhanced ElevenLabs client (prioritizes real API client)
   */
  createEnhancedElevenLabsClient() {
    // Priority 1: Real ElevenLabs client with actual API integration
    if (typeof window !== 'undefined' && window.RealElevenLabsClient && window.RealElevenLabsClient.Conversation) {
      this.Conversation = window.RealElevenLabsClient.Conversation;
      console.log('✅ REAL ElevenLabs client loaded - using actual API integration');
      return;
    }

    // No fallback - only use real ElevenLabs client
    console.error('❌ Real ElevenLabs client not available - voice functionality disabled');
    throw new Error('Real ElevenLabs client required for voice functionality');
  }



  // REMOVED: setupMessageListeners() - Not needed for Python subprocess approach

  // REMOVED: handleConversationMessage() - Redundant for Python subprocess approach
  // Message handling is now done directly in handlePythonMessage()

  // REMOVED: handleStatusUpdate() - Redundant for Python subprocess approach

  /**
   * Handle voice toggle from voice manager (Simplified like Jarvis)
   */
  handleVoiceToggle(isListening) {
    try {
      console.log('🎯 handleVoiceToggle() called in voice-service.js');
      console.log('🎯 isListening parameter:', isListening);
      console.log('🎯 Current this.isActive:', this.isActive);
      console.log('🎯 Voice toggle requested:', isListening ? 'START' : 'STOP');

      if (isListening && !this.isActive) {
        console.log('🎯 Condition met: Starting conversation...');
        this.startConversation();
      } else if (!isListening && this.isActive) {
        console.log('🎯 Condition met: Stopping conversation...');
        this.stopConversation();
      } else {
        console.log('⚠️ Voice toggle ignored - already in requested state');
        console.log('⚠️ isListening:', isListening, 'isActive:', this.isActive);
      }
    } catch (error) {
      console.error('❌ Error handling voice toggle:', error);
      console.error('❌ Error stack:', error.stack);
    }
  }

  // REMOVED: Complex audio management - Let ElevenLabs DefaultAudioInterface handle all audio processing

  /**
   * Check for voice recognition support
   */
  checkVoiceRecognitionSupport() {
    try {
      // Check for Web Speech API support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        this.recognitionSupported = true;
        console.log('✅ Voice recognition supported');
      } else {
        this.recognitionSupported = false;
        console.log('⚠️ Voice recognition not supported in this browser');
      }
    } catch (error) {
      console.error('❌ Error checking voice recognition support:', error);
      this.recognitionSupported = false;
    }
  }

  /**
   * Start ElevenLabs conversation (Direct Jarvis approach - Simplified)
   */
  async startConversation() {
    try {
      console.log('🚀 startConversation() called in voice-service.js');
      console.log('🚀 Current this.isActive:', this.isActive);

      if (this.isActive) {
        console.warn('⚠️ Conversation already active, returning early');
        return;
      }

      console.log('🎤 Starting ElevenLabs conversation (Direct Jarvis Implementation)...');

      // Direct Python execution without subprocess complexity
      const { spawn } = require('child_process');
      const path = require('path');

      // Get correct working directory for Electron
      const workingDir = this.isElectronMode ? process.cwd() : __dirname;

      console.log('🐍 Working directory:', workingDir);
      console.log('🐍 Electron mode:', this.isElectronMode);
      console.log('🐍 About to spawn Python process...');

      // MIGRATION: Python files moved to voice component for SSOT
      this.pythonProcess = spawn('python', ['components/voice/python/start_service.py'], {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true // Enable shell for better compatibility
      });

      console.log('🐍 Python process spawned, PID:', this.pythonProcess.pid);

      // Simple event handling
      this.pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log('🐍 Jarvis:', output);

        // Simple message handling (no complex parsing)
        if (output.includes('Agent:')) {
          const message = output.replace('Agent:', '').trim();
          this.notifyBubbleChat(`🤖 ${message}`, 'assistant');
        } else if (output.includes('User:')) {
          const message = output.replace('User:', '').trim();
          this.notifyBubbleChat(`👤 ${message}`, 'user');
        }
      });

      this.pythonProcess.stderr.on('data', (data) => {
        console.error('❌ Python Error:', data.toString());
      });

      this.pythonProcess.on('close', (code) => {
        console.log(`🐍 Python process exited with code: ${code}`);
        this.stopConversation();
      });

      this.pythonProcess.on('error', (error) => {
        console.error('❌ Python process spawn error:', error);
        this.isActive = false;
        this.updateUI('error');
        this.notifyBubbleChat(`❌ Failed to start Python process: ${error.message}`, 'error');
      });

      // Update state
      this.isActive = true;
      this.updateUI('connected');
      this.notifyBubbleChat('🎤 Connected to ElevenLabs AI - speak now!', 'system');

      console.log('✅ Direct Jarvis conversation started');

    } catch (error) {
      console.error('❌ Failed to start ElevenLabs conversation:', error);
      this.isActive = false;
      this.updateUI('error');
      this.notifyBubbleChat(`❌ Failed to start voice conversation: ${error.message}`, 'error');
    }
  }

  // REMOVED: Duplicate startJarvisStyleConversation() - DDR Cleanup Iteration 3

  /**
   * Start browser conversation (fallback) - REMOVED: Conflicting implementation
   * Browser mode not supported for ElevenLabs direct integration
   */
  async startBrowserConversation() {
    throw new Error('Browser mode not supported for ElevenLabs direct integration. Use Electron mode only.');
  }

  // REMOVED: handlePythonMessage() - DDR Cleanup: Message handling done directly in stdout handler

  // REMOVED: Duplicate startBrowserConversation() method - DDR cleanup

  /**
   * Stop ElevenLabs conversation (Simplified Jarvis approach)
   */
  async stopConversation() {
    try {
      if (!this.isActive) {
        console.warn('No active conversation to stop');
        return;
      }

      console.log('🛑 Stopping ElevenLabs conversation...');

      // Stop Python process if running
      if (this.pythonProcess) {
        console.log('🐍 Terminating Python process...');
        try {
          this.pythonProcess.kill('SIGTERM');
        } catch (killError) {
          console.error('❌ Error terminating Python process:', killError);
        }
        this.pythonProcess = null;
      }

      // Update state
      this.isActive = false;
      this.updateUI('disconnected');

      // Notify user
      this.notifyBubbleChat('🎤 Voice conversation ended', 'system');
      console.log('✅ ElevenLabs conversation stopped successfully');

    } catch (error) {
      console.error('❌ Error stopping conversation:', error);
      // Force cleanup on error
      this.isActive = false;

      if (this.pythonProcess) {
        try {
          this.pythonProcess.kill('SIGKILL');
        } catch (killError) {
          console.error('❌ Error force killing Python process:', killError);
        }
        this.pythonProcess = null;
      }

      this.updateUI('error');
      this.notifyBubbleChat('🎤 Voice conversation ended (forced)', 'system');
    }
  }

  /**
   * Handle voice activity detection with visual feedback
   */
  handleVoiceActivity(activity) {
    try {
      const { level, active } = activity;

      // Update voice visualizer if available
      if (window.VoiceVisualizer && window.VoiceVisualizer.updateActivity) {
        window.VoiceVisualizer.updateActivity(level, active);
      }

      // Update voice button visual feedback
      if (window.VoiceComponent && window.VoiceComponent.getManager()) {
        const manager = window.VoiceComponent.getManager();
        if (manager.updateVoiceActivity) {
          manager.updateVoiceActivity(level, active);
        }
      }

      // Log significant voice activity
      if (active && level > 50) {
        console.log(`🎤 Strong voice activity detected: ${Math.round(level)}`);
      }

    } catch (error) {
      console.error('❌ Error handling voice activity:', error);
    }
  }

  /**
   * Update voice visual feedback based on conversation state
   */
  updateVoiceVisualFeedback(state) {
    try {
      console.log(`🎨 Updating voice visual feedback: ${state}`);

      // Update voice button state
      if (window.VoiceComponent && window.VoiceComponent.getManager()) {
        const manager = window.VoiceComponent.getManager();
        if (manager.updateConversationState) {
          manager.updateConversationState(state);
        }
      }

      // Update status indicator
      if (window.StatusIndicator && window.StatusIndicator.updateVoiceStatus) {
        window.StatusIndicator.updateVoiceStatus(state);
      }

      // Update voice visualizer
      if (window.VoiceVisualizer && window.VoiceVisualizer.updateState) {
        window.VoiceVisualizer.updateState(state);
      }

    } catch (error) {
      console.error('❌ Error updating voice visual feedback:', error);
    }
  }

  // DDR CLEANUP: Input container voice state management removed (SSOT)
  // Voice state is now managed centrally within voice component only



  /**
   * Notify bubble chat with message
   */
  notifyBubbleChat(message, sender = 'assistant') {
    try {
      // Send to bubble chat component if available
      if (window.standaloneBubble && window.standaloneBubble.addMessage) {
        window.standaloneBubble.addMessage(message, sender);
      }

      // Send via WebSocket if available
      if (window.safeSendWebSocket) {
        window.safeSendWebSocket({
          type: 'voice_message',
          content: message,
          sender: sender,
          timestamp: Date.now()
        });
      }

    } catch (error) {
      logger.error(`Error notifying bubble chat: ${error.message}`, 'VOICE_SERVICE');
    }
  }

  /**
   * Set conversation mode (DDR CLEANUP: Removed - not used in simplified Jarvis approach)
   * ElevenLabs Conversational AI handles conversation state automatically
   */
  // DDR CLEANUP: Method removed - conversation mode is handled by ElevenLabs client directly

  // REMOVED: Audio control methods - ElevenLabs DefaultAudioInterface handles all audio automatically

  /**
   * Setup voice permissions for ElevenLabs integration
   * DDR CLEANUP: Moved from core/app.js to voice component (SSOT)
   */
  setupVoicePermissions() {
    if (!this.isElectronMode) {
      console.log('🌐 Browser mode - voice permissions handled by browser');
      return;
    }

    try {
      // Get main window from Electron
      const { BrowserWindow } = require('electron');
      const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

      if (!mainWindow) {
        console.warn('⚠️ No main window found for voice permissions setup');
        return;
      }

      // Handle permission requests for microphone access
      mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['microphone', 'camera', 'media'];

        if (allowedPermissions.includes(permission)) {
          console.log(`✅ Granting ${permission} permission for voice functionality`);
          callback(true);
        } else {
          console.log(`❌ Denying ${permission} permission`);
          callback(false);
        }
      });

      // Handle permission check requests
      mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
        const allowedPermissions = ['microphone', 'camera', 'media'];
        return allowedPermissions.includes(permission);
      });

      console.log('🎤 Voice permissions configured for ElevenLabs integration');
    } catch (error) {
      console.error('❌ Error setting up voice permissions:', error);
    }
  }

  /**
   * Get voice service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      isRecording: this.isRecording,
      conversationMode: this.conversationMode,
      isConversationActive: this.isConversationActive,
      recognitionSupported: this.recognitionSupported,
      audioEnabled: this.isAudioEnabled,
      volume: this.volume,
      elevenLabsConnected: !!(this.elevenLabsClient && this.agentId),
      agentId: this.agentId
    };
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get conversation status
   */
  getConversationStatus() {
    return {
      active: this.isConversationActive,
      agentId: this.agentId,
      hasClient: !!this.elevenLabsClient,
      hasConversation: !!this.conversation
    };
  }

  /**
   * Cleanup voice service (DDR CLEANUP: Fixed inconsistent state management)
   */
  async cleanup() {
    try {
      console.log('🧹 Cleaning up Voice Service...');

      // Stop any active conversation
      if (this.isActive) {
        await this.stopConversation();
      }

      // DDR CLEANUP: Remove dead stopAudio() call - method doesn't exist
      // ElevenLabs DefaultAudioInterface handles audio automatically

      // Force cleanup Python process
      if (this.pythonProcess) {
        try {
          this.pythonProcess.kill('SIGKILL');
          this.pythonProcess = null;
        } catch (error) {
          console.error('❌ Error cleaning up Python process:', error);
        }
      }

      // Reset state completely (DDR CLEANUP: Use actual properties)
      this.initialized = false;
      this.isActive = false;

      // Clear references
      this.Conversation = null;

      console.log('✅ Voice Service cleaned up successfully');

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      // Force reset state even on error
      this.initialized = false;
      this.isActive = false;
    }
  }

  // REMOVED: Audio constraints - ElevenLabs DefaultAudioInterface handles optimal audio configuration
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.VoiceService = VoiceService;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceService;
}

console.log('📝 Voice Service loaded');
