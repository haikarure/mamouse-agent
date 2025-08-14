/**
 * Voice Component Utilities - SSOT for all voice utilities
 * DDR CLEANUP: Migrated from shared/utils/voice-status-indicator.js
 * Consolidated voice utilities in voice component directory
 */

console.log('🔥 LOADING: voice-utils.js - Voice Component Utilities');

/**
 * Voice Status Indicator Utility
 * Provides visual feedback for ElevenLabs voice conversation states
 */
class VoiceStatusIndicator {
  constructor() {
    this.statusElement = null;
    this.iconElement = null;
    this.textElement = null;
    this.initialized = false;
    
    console.log('📊 Voice Status Indicator initialized');
  }

  /**
   * Initialize status indicator
   */
  initialize() {
    try {
      // Get existing status indicator elements
      this.statusElement = document.getElementById('status-indicator');
      this.iconElement = document.getElementById('status-indicator-icon');
      this.textElement = document.getElementById('status-indicator-text');

      if (!this.statusElement) {
        console.warn('⚠️ Status indicator element not found');
        return false;
      }

      this.initialized = true;
      console.log('✅ Voice Status Indicator initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Voice Status Indicator:', error);
      return false;
    }
  }

  /**
   * Update voice status with visual feedback
   */
  updateVoiceStatus(state, message = '') {
    if (!this.initialized || !this.statusElement) return;

    try {
      // Remove all status classes
      this.statusElement.classList.remove(
        'voice-connecting', 'voice-connected', 'voice-listening', 
        'voice-processing', 'voice-responding', 'voice-error', 'voice-disconnected'
      );

      // Update based on state
      switch (state) {
        case 'connecting':
          this.statusElement.classList.add('voice-connecting');
          this.updateStatusContent('🔗', message || 'Connecting to voice AI...');
          this.showStatus();
          break;

        case 'connected':
          this.statusElement.classList.add('voice-connected');
          this.updateStatusContent('🎤', message || 'Voice AI connected - speak now!');
          this.showStatus(3000); // Auto-hide after 3 seconds
          break;

        case 'listening':
          this.statusElement.classList.add('voice-listening');
          this.updateStatusContent('👂', message || 'Listening...');
          this.showStatus();
          break;

        case 'transcribing':
          this.statusElement.classList.add('voice-processing');
          this.updateStatusContent('📝', message || 'Processing your speech...');
          this.showStatus();
          break;

        case 'responding':
          this.statusElement.classList.add('voice-responding');
          this.updateStatusContent('🤖', message || 'AI is responding...');
          this.showStatus();
          break;

        case 'playing':
          this.statusElement.classList.add('voice-responding');
          this.updateStatusContent('🔊', message || 'Playing AI response...');
          this.showStatus();
          break;

        case 'error':
          this.statusElement.classList.add('voice-error');
          this.updateStatusContent('❌', message || 'Voice conversation error');
          this.showStatus(5000); // Show error longer
          break;

        case 'interrupted':
          this.statusElement.classList.add('voice-error');
          this.updateStatusContent('⚠️', message || 'Conversation interrupted');
          this.showStatus(3000);
          break;

        case 'disconnected':
          this.statusElement.classList.add('voice-disconnected');
          this.updateStatusContent('🔌', message || 'Voice conversation ended');
          this.showStatus(2000);
          break;

        default:
          this.hideStatus();
      }

      console.log(`📊 Voice status updated: ${state}`);

    } catch (error) {
      console.error('❌ Error updating voice status:', error);
    }
  }

  /**
   * Update status content (icon and text)
   */
  updateStatusContent(icon, text) {
    try {
      if (this.iconElement) {
        this.iconElement.textContent = icon;
      }
      
      if (this.textElement) {
        this.textElement.textContent = text;
      }
    } catch (error) {
      console.error('❌ Error updating status content:', error);
    }
  }

  /**
   * Show status indicator
   */
  showStatus(autoHideDelay = 0) {
    if (!this.statusElement) return;

    try {
      this.statusElement.style.display = 'flex';
      this.statusElement.classList.add('visible');

      // Auto-hide if delay specified
      if (autoHideDelay > 0) {
        setTimeout(() => {
          this.hideStatus();
        }, autoHideDelay);
      }

    } catch (error) {
      console.error('❌ Error showing status:', error);
    }
  }

  /**
   * Hide status indicator
   */
  hideStatus() {
    if (!this.statusElement) return;

    try {
      this.statusElement.classList.remove('visible');
      
      // Hide after animation completes
      setTimeout(() => {
        if (!this.statusElement.classList.contains('visible')) {
          this.statusElement.style.display = 'none';
        }
      }, 300);

    } catch (error) {
      console.error('❌ Error hiding status:', error);
    }
  }

  /**
   * Show voice activity level
   */
  showVoiceActivity(level, active) {
    if (!this.initialized || !active) return;

    try {
      // Update voice activity indicator if available
      const activityIndicator = this.statusElement?.querySelector('.voice-activity-indicator');
      if (activityIndicator) {
        activityIndicator.style.opacity = level / 255;
        activityIndicator.style.transform = `scale(${1 + (level / 255) * 0.2})`;
      }

    } catch (error) {
      console.error('❌ Error showing voice activity:', error);
    }
  }

  /**
   * Get status indicator state
   */
  getStatus() {
    return {
      initialized: this.initialized,
      visible: this.statusElement?.classList.contains('visible') || false,
      element: !!this.statusElement
    };
  }

  /**
   * Cleanup status indicator
   */
  cleanup() {
    try {
      this.hideStatus();
      this.initialized = false;
      console.log('📊 Voice Status Indicator cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up status indicator:', error);
    }
  }
}

/**
 * Voice Audio Configuration Utilities
 * DDR CLEANUP: Use voice-config.js as SSOT for audio configurations
 */
class VoiceAudioUtils {
  static getOptimalAudioConfig() {
    // DDR CLEANUP: Use VoiceConfig.audio as SSOT - no fallback duplication needed
    if (!window.VoiceConfig?.audio) {
      console.error('❌ VoiceConfig.audio not available - ensure voice-config.js is loaded');
      return null;
    }
    return window.VoiceConfig.audio;
  }

  static validateAudioConfig(config) {
    const required = ['sampleRate', 'channels', 'bitDepth'];
    return required.every(prop => config && typeof config[prop] === 'number');
  }

  /**
   * Get Electron-optimized audio constraints
   * DDR CLEANUP: Use VoiceConfig.audio.input as base configuration
   */
  static getElectronAudioConstraints() {
    const baseConfig = window.VoiceConfig?.audio?.input || {};
    return {
      audio: {
        echoCancellation: baseConfig.echoCancellation || true,
        noiseSuppression: baseConfig.noiseSuppression || true,
        autoGainControl: baseConfig.autoGainControl || true,
        sampleRate: baseConfig.sampleRate || 44100,
        sampleSize: baseConfig.bitDepth || 16,
        channelCount: baseConfig.channels || 1,
        // Electron-specific optimizations
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        googAudioMirroring: false
      }
    };
  }

  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment() {
    return typeof window !== 'undefined' &&
           window.electronAPI &&
           typeof window.electronAPI === 'object';
  }

  /**
   * Create optimized AudioContext for Electron
   * DDR CLEANUP: Use VoiceConfig.audio.input as base configuration
   */
  static createAudioContext() {
    const baseConfig = window.VoiceConfig?.audio?.input || {};
    const config = {
      sampleRate: baseConfig.sampleRate || 44100,
      latencyHint: 'interactive',
      bufferSize: baseConfig.bufferSize || 4096
    };
    return new (window.AudioContext || window.webkitAudioContext)(config);
  }

  /**
   * Apply Electron-specific audio optimizations
   */
  static applyElectronOptimizations(audioElement) {
    if (!this.isElectronEnvironment() || !audioElement) {
      return;
    }

    // Apply Electron-specific audio optimizations
    audioElement.crossOrigin = 'anonymous';
    audioElement.preload = 'auto';
    audioElement.style.willChange = 'transform';
  }
}

// Create global instances
const voiceStatusIndicator = new VoiceStatusIndicator();

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      voiceStatusIndicator.initialize();
    });
  } else {
    voiceStatusIndicator.initialize();
  }

  // Make available globally
  window.VoiceStatusIndicator = voiceStatusIndicator;
  window.VoiceAudioUtils = VoiceAudioUtils;
  window.StatusIndicator = voiceStatusIndicator; // Backward compatibility
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VoiceStatusIndicator,
    VoiceAudioUtils,
    voiceStatusIndicator
  };
}

console.log('✅ Voice Component Utilities loaded (SSOT)');
