// Gemini API Service untuk Mamouse Agent
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../core/config');
const { logger } = require('../utils/file-logger');
// DDR CLEANUP: Removed unused fs and path imports

// ===== GEMINI SERVICE CONFIGURATION =====
const GEMINI_SERVICE_CONFIG = {
  // Default Models
  models: {
    default: 'gemini-2.5-flash',
    vision: 'gemini-1.5-pro-latest',
    fallback: 'gemini-1.5-flash'
  },

  // Generation Configuration - Centralized to eliminate duplication
  generation: {
    temperature: config.gemini?.temperature ?? 0.7,
    maxOutputTokens: config.gemini?.maxOutputTokens ?? 2048,
    topK: config.gemini?.topK ?? 40,
    topP: config.gemini?.topP ?? 0.95
  },

  // Safety Settings - Centralized configuration
  safety: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],

  // Validation Rules
  validation: {
    apiKeyMinLength: 30,
    testPrompt: 'Hello, this is a test prompt to validate the API key.'
  }
};

/**
 * Gemini API Service for Mamouse Agent
 * Manages interactions with Google's Gemini AI API including chat, streaming, and image analysis
 * @class GeminiService
 */
class GeminiService {
  /**
   * Initialize Gemini Service instance
   * @param {string} apiKey - Gemini API key (optional, defaults to config)
   */
  constructor(apiKey = config.gemini?.apiKey) {
    this.apiKey = apiKey;
    this.model = config.gemini?.model ?? GEMINI_SERVICE_CONFIG.models.default;
    this.genAI = null;
    this.modelInstance = null;
    this.chatSession = null;
    this.initialized = false;

    // Auto-initialize if API key is available
    if (this.apiKey) {
      this.initialize();
    }
  }

  /**
   * Initialize Gemini API with current configuration
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      logger.info('Starting Gemini API initialization...', 'GEMINI_SERVICE');
      
      if (!this.apiKey || this.apiKey.trim() === '') {
        logger.error('API key not available', 'GEMINI_SERVICE');
        return false;
      }

      logger.info(`API key available, length: ${this.apiKey.length}`, 'GEMINI_SERVICE');

      // Create GoogleGenerativeAI instance
      logger.info('Creating GoogleGenerativeAI instance...', 'GEMINI_SERVICE');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      logger.info('GoogleGenerativeAI instance created successfully', 'GEMINI_SERVICE');

      // Get model with configuration
      logger.info(`Getting model: ${this.model}`, 'GEMINI_SERVICE');
      const modelConfig = {
        model: this.model,
        generationConfig: GEMINI_SERVICE_CONFIG.generation,
        safetySettings: GEMINI_SERVICE_CONFIG.safety
      };

      logger.info(`Model configuration: ${JSON.stringify(modelConfig, null, 2)}`, 'GEMINI_SERVICE');
      
      logger.info('Getting generative model...', 'GEMINI_SERVICE');
      this.modelInstance = this.genAI.getGenerativeModel(modelConfig);
      logger.info('Generative model obtained successfully', 'GEMINI_SERVICE');

      // Create initial chat session
      logger.info('Creating new chat session', 'GEMINI_SERVICE');
      this.chatSession = this.modelInstance.startChat({
        history: []
      });
      logger.info('Chat session created successfully', 'GEMINI_SERVICE');

      this.initialized = true;
      logger.info(`Gemini API successfully initialized with model: ${this.model}`, 'GEMINI_SERVICE');
      return true;
    } catch (error) {
      logger.error(`Error initializing Gemini API: ${error.message}`, 'GEMINI_SERVICE');
      logger.error(`Stack trace: ${error.stack}`, 'GEMINI_SERVICE');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Set API key and reinitialize service
   * @param {string} apiKey - New API key
   * @returns {boolean} Success status
   */
  setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      logger.error('Invalid API key provided', 'GEMINI_SERVICE');
      return false;
    }

    this.apiKey = apiKey.trim();
    logger.info('API key updated, reinitializing service...', 'GEMINI_SERVICE');
    return this.initialize();
  }

  /**
   * Set model and reinitialize service
   * @param {string} model - New model name
   * @returns {boolean} Success status
   */
  setModel(model) {
    if (!model || typeof model !== 'string' || model.trim() === '') {
      logger.error('Invalid model provided', 'GEMINI_SERVICE');
      return false;
    }

    const validModels = Object.values(GEMINI_SERVICE_CONFIG.models);
    if (!validModels.includes(model) && !model.startsWith('gemini-')) {
      logger.warn(`Unknown model: ${model}. Using anyway...`, 'GEMINI_SERVICE');
    }

    this.model = model.trim();
    logger.info(`Model updated to: ${this.model}, reinitializing service...`, 'GEMINI_SERVICE');
    return this.initialize();
  }

  /**
   * Get simple response from Gemini API (non-streaming)
   * @param {string} message - User message
   * @returns {Promise<string>} AI response
   */
  async getResponse(message) {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized');
    }

    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message provided');
    }

    try {
      logger.info('Sending message to Gemini API...', 'GEMINI_SERVICE');
      const result = await this.chatSession.sendMessage(message);
      const response = result.response;
      const text = response.text();

      logger.info('Got response from Gemini', 'GEMINI_SERVICE');

      // Return structured response format expected by IPC handler
      return {
        error: false,
        text: text,
        candidates: response.candidates
      };
    } catch (error) {
      logger.error(`Error getting response from Gemini: ${error.message}`, 'GEMINI_SERVICE');

      // Return structured error response
      return {
        error: true,
        message: `Error: ${error.message}`,
        originalError: error.message
      };
    }
  }

  /**
   * Get streaming response from Gemini API
   * @param {string} message - User message
   * @param {Function} onChunk - Callback for each chunk
   */
  async getStreamingResponse(message, onChunk) {
    logger.bubbleDebug(`getStreamingResponse called with message: ${message.substring(0, 50)}...`);

    // Validate inputs
    if (!this._validateStreamingInputs(message, onChunk)) {
      return;
    }

    // Check initialization
    if (!this.initialized) {
      logger.warn('Gemini API not initialized, attempting reinitialization...', 'BUBBLE_DEBUG');
      try {
        if (!this.initialize()) {
          logger.error('Failed to initialize Gemini API', 'BUBBLE_DEBUG');
          logger.bubbleDebug(`API key length: ${this.apiKey ? this.apiKey.length : 0}`);
          this._sendStreamChunk(onChunk, '', true, true, 
            'Gemini API not initialized. Please ensure API key is set correctly.');
          return;
        }
        logger.info('Gemini API successfully reinitialized', 'BUBBLE_DEBUG');
      } catch (initError) {
        logger.error(`Error reinitializing Gemini API: ${initError.message}`, 'BUBBLE_DEBUG');
        this._sendStreamChunk(onChunk, '', true, true, 
          `Error reinitializing Gemini API: ${initError.message}`);
        return;
      }
    }

    try {
      // Ensure chat session exists
      if (!(await this._ensureChatSession(onChunk))) {
        return;
      }

      // Send message to Gemini API with streaming
      logger.info('Sending streaming message to Gemini API...', 'BUBBLE_DEBUG');
      let result;
      try {
        logger.bubbleDebug('Calling chatSession.sendMessageStream...');
        result = await this.chatSession.sendMessageStream(message);
        logger.info('Successfully received streaming response from Gemini API', 'BUBBLE_DEBUG');
      } catch (streamError) {
        logger.error(`Error sending streaming message: ${streamError.message}`, 'BUBBLE_DEBUG');

        // Try creating new chat session and retry
        try {
          logger.info('Creating new chat session and retrying message...', 'BUBBLE_DEBUG');
          this.chatSession = this._createChatSession();
          result = await this.chatSession.sendMessageStream(message);
          logger.info('Successfully received response after creating new chat session', 'BUBBLE_DEBUG');
        } catch (retryError) {
          logger.error(`Retry failed: ${retryError.message}`, 'BUBBLE_DEBUG');
          this._sendStreamChunk(onChunk, '', true, true, 
            `Error sending message to Gemini API: ${streamError.message}`);
          return;
        }
      }

      if (!result || !result.stream) {
        logger.error('Invalid streaming response from Gemini API', 'BUBBLE_DEBUG');
        this._sendStreamChunk(onChunk, '', true, true, 
          'Invalid or empty streaming response from Gemini API');
        return;
      }

      // Process each chunk from streaming response
      logger.info('Starting streaming response processing...', 'BUBBLE_DEBUG');
      for await (const chunk of result.stream) {
        try {
          logger.bubbleDebug('Received chunk from Gemini API');

          // Extract text from chunk using helper method
          const chunkText = this._extractTextFromChunk(chunk);
          
          if (chunkText) {
            logger.bubbleDebug(`Processed chunk text, length: ${chunkText.length}`);
            this._sendStreamChunk(onChunk, chunkText, false);
          } else {
            // Handle chunks without extractable text
            logger.bubbleDebug('Chunk has no extractable text, trying alternative processing');
            
            // Try to extract from alternative structures
            let extractedText = '';
            if (chunk.parts && chunk.parts.length > 0) {
              extractedText = chunk.parts
                .map(part => typeof part === 'string' ? part : 
                            part && part.text ? this._safeTextExtraction(part.text) : '')
                .join('');
            } else if (chunk.content) {
              extractedText = this._safeTextExtraction(chunk.content);
            }

            if (extractedText) {
              this._sendStreamChunk(onChunk, extractedText, false);
            } else {
              // Final fallback - try JSON stringification
              try {
                const stringified = JSON.stringify(chunk);
                if (stringified && stringified !== '{}' && stringified !== '[]') {
                  this._sendStreamChunk(onChunk, `[Unable to process response: ${stringified}]`, false);
                }
              } catch (stringifyError) {
                logger.bubbleDebug(`JSON stringify failed: ${stringifyError.message}`);
              }
            }
          }
        } catch (chunkError) {
          logger.error(`Error processing chunk: ${chunkError.message}`, 'BUBBLE_DEBUG');
          this._sendStreamChunk(onChunk, '', false, true, 
            `Error processing chunk: ${chunkError.message}`);
        }
      }

      // Mark streaming as complete
      logger.info('Streaming complete, sending done signal', 'BUBBLE_DEBUG');

      // Send final completion signal
      try {
        // Try to get complete text from response
        let finalText = '';
        if (result && result.response) {
          finalText = this._safeTextExtraction(result.response.text);
        }

        // Send final chunk with completion signal
        if (finalText) {
          logger.bubbleDebug('Sending complete text as final chunk');
          this._sendStreamChunk(onChunk, finalText, true);
        } else {
          // Send empty completion signal to avoid issues with empty chunks
          logger.bubbleDebug('Sending completion signal');
          this._sendStreamChunk(onChunk, ' ', true);
        }
      } catch (finalChunkError) {
        logger.error(`Error sending final chunk: ${finalChunkError.message}`, 'BUBBLE_DEBUG');
        this._sendStreamChunk(onChunk, ' ', true);
      }

      logger.bubbleDebug('Done signal successfully sent');
    } catch (error) {
      logger.error(`Error getting streaming response: ${error.message}`, 'BUBBLE_DEBUG');
      this._handleStreamingError(error, onChunk);
    }
  }

  // Reset chat session
  resetChat() {
    if (this.initialized) {
      this.chatSession = this.modelInstance.startChat({
        history: []
      });
      return true;
    }
    return false;
  }

  // Check initialization status
  isInitialized() {
    return this.initialized;
  }

  /**
   * Analyze image using Gemini API
   * @param {string} imageData - Base64 image data
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(imageData) {
    if (!this.initialized) {
      if (!this.initialize()) {
        return {
          error: true,
          message: 'Gemini API not initialized. Please ensure API key is set correctly.'
        };
      }
    }

    try {
      // Ensure model supports image input
      if (!this.model.includes('gemini-1.5')) {
        logger.info('Current model does not support image input, switching to gemini-1.5-pro-latest', 'GEMINI_SERVICE');

        // Save current model
        const currentModel = this.model;

        // Switch to image-capable model
        this.model = GEMINI_SERVICE_CONFIG.models.vision;

        // Reinitialize with new model
        const initResult = this.initialize();

        if (!initResult) {
          // Restore previous model if failed
          this.model = currentModel;
          this.initialize();

          return {
            error: true,
            message: 'Failed to switch to image-capable model'
          };
        }
      }

      // Create vision model for image analysis
      const visionModel = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: GEMINI_SERVICE_CONFIG.generation,
        safetySettings: GEMINI_SERVICE_CONFIG.safety
      });

      // Create prompt for image analysis
      const prompt = config.camera?.analysisPrompt || 'Describe what you see in this image in detail.';

      // Create multimodal input with image and prompt
      const imageParts = [
        {
          inlineData: {
            data: imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
            mimeType: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
          }
        },
        {
          text: prompt
        }
      ];

      // Analyze image
      logger.info(`Analyzing image with prompt: ${prompt}`, 'GEMINI_SERVICE');
      const result = await visionModel.generateContent({
        contents: [{ role: 'user', parts: imageParts }]
      });

      const response = result.response;

      return {
        error: false,
        text: response.text(),
        candidates: response.candidates
      };
    } catch (error) {
      logger.error(`Error analyzing image: ${error.message}`, 'GEMINI_SERVICE');
      return {
        error: true,
        message: `Error: ${error.message || 'An error occurred while analyzing the image'}`
      };
    }
  }

  /**
   * Validate API key by sending test request
   * @param {string} apiKey - API key to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < GEMINI_SERVICE_CONFIG.validation.apiKeyMinLength) {
      return {
        valid: false,
        error: 'API key is too short or invalid format'
      };
    }

    // Store current state
    const previousApiKey = this.apiKey;
    const wasInitialized = this.initialized;

    try {
      // Temporarily set new API key
      this.apiKey = apiKey;
      this.initialized = false;

      // Try to initialize with new key
      if (!this.initialize()) {
        this.#restoreApiKey(previousApiKey, wasInitialized);
        return {
          valid: false,
          error: 'Failed to initialize with provided API key'
        };
      }

      // Test with simple prompt
      const testResult = await this.getResponse(GEMINI_SERVICE_CONFIG.validation.testPrompt);

      if (testResult && testResult.length > 0) {
        logger.info('API key validation successful', 'GEMINI_SERVICE');
        return {
          valid: true,
          message: 'API key is valid and working'
        };
      } else {
        this.#restoreApiKey(previousApiKey, wasInitialized);
        return {
          valid: false,
          error: 'API key validation failed - no response received'
        };
      }
    } catch (error) {
      this.#restoreApiKey(previousApiKey, wasInitialized);
      logger.error(`API key validation error: ${error.message}`, 'GEMINI_SERVICE');
      return {
        valid: false,
        error: this.#parseValidationError(error)
      };
    }
  }

  /**
   * Parse validation error to user-friendly message
   * @private
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  #parseValidationError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('api key')) {
      return 'Invalid API key format or permissions';
    } else if (message.includes('quota')) {
      return 'API quota exceeded';
    } else if (message.includes('billing')) {
      return 'Billing account issue - please check your Google Cloud billing';
    } else if (message.includes('permission')) {
      return 'API key does not have required permissions';
    } else if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection error';
    }

    return error.message;
  }

  /**
   * Restore API key to previous value and reinitialize if needed
   * @private
   * @param {string} previousApiKey - Previous API key value
   * @param {boolean} wasInitialized - Whether service was previously initialized
   */
  #restoreApiKey(previousApiKey, wasInitialized) {
    this.apiKey = previousApiKey || '';
    if (wasInitialized) {
      this.initialize();
    }
  }

  // Helper method: Safe text extraction from various sources
  _safeTextExtraction(textSource) {
    if (!textSource) return '';

    if (typeof textSource === 'function') {
      try {
        return textSource();
      } catch (error) {
        logger.bubbleDebug(`Error calling text function: ${error.message}`);
        return String(textSource);
      }
    }

    return String(textSource);
  }

  // Helper method: Extract text from chunk with all fallback mechanisms
  _extractTextFromChunk(chunk) {
    let chunkText = '';

    // Method 1: Direct chunk.text access
    if (chunk.text) {
      chunkText = this._safeTextExtraction(chunk.text);
      if (chunkText) {
        logger.bubbleDebug(`Text extracted from chunk.text: ${chunkText.substring(0, 50)}...`);
        return chunkText;
      }
    }

    // Method 2: Extract from candidates
    if (chunk.candidates && chunk.candidates.length > 0) {
      const candidate = chunk.candidates[0];

      if (candidate.content && candidate.content.parts) {
        chunkText = candidate.content.parts
          .map(part => part.text ? this._safeTextExtraction(part.text) : '')
          .join('');
      } else if (candidate.text) {
        chunkText = this._safeTextExtraction(candidate.text);
      } else if (candidate.parts && Array.isArray(candidate.parts)) {
        chunkText = candidate.parts
          .map(part => typeof part === 'string' ? part :
                      part && part.text ? this._safeTextExtraction(part.text) : '')
          .join('');
      }

      if (chunkText) {
        logger.bubbleDebug(`Text extracted from candidates: ${chunkText.substring(0, 50)}...`);
        return chunkText;
      }
    }

    // Method 3: Extract from response
    if (chunk.response && chunk.response.text) {
      chunkText = this._safeTextExtraction(chunk.response.text);
      if (chunkText) {
        logger.bubbleDebug(`Text extracted from response: ${chunkText.substring(0, 50)}...`);
        return chunkText;
      }
    }

    // Method 4: Extract from alternative chunk structures
    if (chunk.parts && chunk.parts.length > 0) {
      chunkText = chunk.parts
        .map(part => typeof part === 'string' ? part :
                    part && part.text ? this._safeTextExtraction(part.text) : '')
        .join('');
    } else if (chunk.content) {
      chunkText = this._safeTextExtraction(chunk.content);
    }

    if (chunkText) {
      logger.bubbleDebug(`Text extracted from alternative structure: ${chunkText.substring(0, 50)}...`);
      return chunkText;
    }

    // Method 5: JSON string parsing fallback
    try {
      const stringified = JSON.stringify(chunk);
      const textMatch = stringified.match(/"text":"([^"]+)"/) ||
                       stringified.match(/"parts":\s*\[\s*\{\s*"text":\s*"([^"]+)"/);
      if (textMatch && textMatch[1]) {
        chunkText = textMatch[1];
        logger.bubbleDebug(`Text extracted from JSON parsing: ${chunkText.substring(0, 50)}...`);
        return chunkText;
      }
    } catch (error) {
      logger.bubbleDebug(`JSON parsing failed: ${error.message}`);
    }

    // Return empty string if no text found
    logger.bubbleDebug('No text could be extracted from chunk');
    return '';
  }

  // Helper method: Standardized chunk sending
  _sendStreamChunk(onChunk, text, done = false, error = false, errorMessage = '') {
    if (error) {
      onChunk({
        error: true,
        message: errorMessage,
        done: true
      });
    } else {
      onChunk({
        error: false,
        chunk: text,
        done: done
      });
    }
  }

  // Helper method: Create chat session with configuration
  _createChatSession() {
    const chatConfig = {
      history: [],
      generationConfig: GEMINI_SERVICE_CONFIG.generation
    };

    logger.bubbleDebug(`Creating chat session with config: ${JSON.stringify(chatConfig)}`);
    return this.modelInstance.startChat(chatConfig);
  }

  // Helper method: Ensure chat session exists
  async _ensureChatSession(onChunk) {
    if (this.chatSession) {
      return true;
    }

    logger.info('Chat session not found, creating new session...', 'BUBBLE_DEBUG');

    try {
      // Ensure model instance exists
      if (!this.modelInstance) {
        logger.warn('Model instance not found, reinitializing...', 'BUBBLE_DEBUG');
        if (!this.initialize()) {
          this._sendStreamChunk(onChunk, '', true, true,
            'Failed to create chat session: Model instance not available');
          return false;
        }
        logger.info('Model instance created after reinitialization', 'BUBBLE_DEBUG');
      }

      this.chatSession = this._createChatSession();
      logger.info('Chat session successfully created', 'BUBBLE_DEBUG');
      return true;
    } catch (error) {
      logger.error(`Error creating chat session: ${error.message}`, 'BUBBLE_DEBUG');
      this._sendStreamChunk(onChunk, '', true, true,
        `Error creating chat session: ${error.message}`);
      return false;
    }
  }

  // Helper method: Validate streaming inputs
  _validateStreamingInputs(message, onChunk) {
    // Validate callback
    if (typeof onChunk !== 'function') {
      logger.error('Invalid onChunk callback', 'BUBBLE_DEBUG');
      return false;
    }

    // Validate input
    if (!message || typeof message !== 'string') {
      logger.error(`Invalid input: ${JSON.stringify(message)}`, 'BUBBLE_DEBUG');
      this._sendStreamChunk(onChunk, '', true, true,
        'Invalid input. Message must be a string.');
      return false;
    }

    return true;
  }

  // Helper method: Handle streaming errors
  _handleStreamingError(error, onChunk) {
    let errorMessage = 'An error occurred while communicating with Gemini API';

    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key is invalid or expired';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota has been exceeded';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network connection issue, please check your internet connection';
      } else {
        errorMessage = error.message;
      }
    }

    this._sendStreamChunk(onChunk, '', true, true, `Error: ${errorMessage}`);
  }
}

// Create singleton instance
const geminiService = new GeminiService();

module.exports = geminiService;
