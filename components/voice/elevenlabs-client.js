/**
 * ElevenLabs Client - SSOT for all ElevenLabs API interactions
 * DDR CLEANUP: Consolidated from scattered ElevenLabs implementations
 * Replaces: shared/services/elevenlabs-tools-service.js and other ElevenLabs clients
 */

console.log('🔥 LOADING: elevenlabs-client.js - ElevenLabs Client (SSOT)');

const VoiceConfig = require('./voice-config');

class ElevenLabsClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || VoiceConfig.python.defaultApiKey;
    this.baseUrl = VoiceConfig.elevenlabs.baseUrl;
    this.defaultVoiceId = VoiceConfig.elevenlabs.defaultVoiceId;
    this.timeout = VoiceConfig.elevenlabs.timeout;
    this.initialized = false;
    
    console.log('🎤 ElevenLabs Client initialized');
  }

  /**
   * Initialize the ElevenLabs client
   */
  async initialize() {
    if (this.initialized) {
      console.warn('ElevenLabs Client already initialized');
      return true;
    }

    try {
      // Validate API key
      if (!this.apiKey || this.apiKey.length < VoiceConfig.validation.apiKeyMinLength) {
        throw new Error('Invalid ElevenLabs API key');
      }

      // Test connection
      const isValid = await this.validateApiKey();
      if (!isValid) {
        throw new Error('ElevenLabs API key validation failed');
      }

      this.initialized = true;
      console.log('✅ ElevenLabs Client initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs Client:', error);
      return false;
    }
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey() {
    try {
      const response = await this.makeRequest('/voices', 'GET');
      return response && Array.isArray(response.voices);
    } catch (error) {
      console.error('❌ API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    try {
      const response = await this.makeRequest('/voices', 'GET');
      return response?.voices || VoiceConfig.elevenlabs.availableVoices;
    } catch (error) {
      console.error('❌ Failed to get voices:', error);
      return VoiceConfig.elevenlabs.availableVoices;
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(text, voiceId = null, settings = null) {
    try {
      const voice = voiceId || this.defaultVoiceId;
      const voiceSettings = settings || VoiceConfig.elevenlabs.defaultSettings;

      const response = await this.makeRequest(
        `/text-to-speech/${voice}`,
        'POST',
        {
          text: text,
          model_id: VoiceConfig.models.defaultModel,
          voice_settings: voiceSettings
        },
        { responseType: 'arraybuffer' }
      );

      return response;

    } catch (error) {
      console.error('❌ Failed to generate speech:', error);
      throw error;
    }
  }

  /**
   * Start conversational AI session
   */
  async startConversation(agentId = null) {
    try {
      const agent = agentId || VoiceConfig.python.defaultAgentId;
      
      const response = await this.makeRequest(
        '/convai/conversations',
        'POST',
        {
          agent_id: agent
        }
      );

      return response?.conversation_id;

    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId) {
    try {
      const response = await this.makeRequest(
        `/convai/conversations/${conversationId}`,
        'GET'
      );

      return response;

    } catch (error) {
      console.error('❌ Failed to get conversation:', error);
      throw error;
    }
  }

  /**
   * Make HTTP request to ElevenLabs API
   */
  async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      };

      const config = {
        method,
        headers,
        timeout: this.timeout,
        ...options
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      // Handle different response types
      if (options.responseType === 'arraybuffer') {
        return await response.arrayBuffer();
      } else {
        return await response.json();
      }

    } catch (error) {
      console.error('❌ ElevenLabs API request failed:', error);
      throw error;
    }
  }

  /**
   * Set API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.initialized = false; // Require re-initialization
    console.log('🔑 ElevenLabs API key updated');
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : null,
      baseUrl: this.baseUrl,
      defaultVoiceId: this.defaultVoiceId,
      initialized: this.initialized
    };
  }

  /**
   * Cleanup client
   */
  cleanup() {
    this.initialized = false;
    console.log('🧹 ElevenLabs Client cleaned up');
  }
}

/**
 * ElevenLabs WebSocket Client for real-time conversation
 */
class ElevenLabsWebSocketClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || VoiceConfig.python.defaultApiKey;
    this.websocket = null;
    this.connected = false;
    this.conversationId = null;
    
    console.log('🔌 ElevenLabs WebSocket Client initialized');
  }

  /**
   * Connect to ElevenLabs WebSocket
   */
  async connect(conversationId) {
    try {
      this.conversationId = conversationId;
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversations/${conversationId}/ws?xi-api-key=${this.apiKey}`;
      
      this.websocket = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        this.websocket.onopen = () => {
          this.connected = true;
          console.log('✅ ElevenLabs WebSocket connected');
          resolve();
        };

        this.websocket.onerror = (error) => {
          console.error('❌ ElevenLabs WebSocket error:', error);
          reject(error);
        };

        this.websocket.onclose = () => {
          this.connected = false;
          console.log('🔌 ElevenLabs WebSocket disconnected');
        };
      });

    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      throw error;
    }
  }

  /**
   * Send audio data
   */
  sendAudio(audioData) {
    if (!this.connected || !this.websocket) {
      throw new Error('WebSocket not connected');
    }

    this.websocket.send(audioData);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.connected = false;
      this.conversationId = null;
    }
  }
}

// Create global instances
const elevenLabsClient = new ElevenLabsClient();

// Make available globally
if (typeof window !== 'undefined') {
  window.ElevenLabsClient = ElevenLabsClient;
  window.ElevenLabsWebSocketClient = ElevenLabsWebSocketClient;
  window.elevenLabsClient = elevenLabsClient;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ElevenLabsClient,
    ElevenLabsWebSocketClient,
    elevenLabsClient
  };
}

console.log('✅ ElevenLabs Client loaded (SSOT)');
