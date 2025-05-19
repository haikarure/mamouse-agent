/**
 * Unit tests for gemini-service.js
 */

// Mock dependencies
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            startChat: jest.fn().mockImplementation(() => {
              return {
                sendMessage: jest.fn().mockResolvedValue({
                  response: {
                    text: jest.fn().mockReturnValue('Test response'),
                    candidates: []
                  }
                }),
                sendMessageStream: jest.fn().mockResolvedValue({
                  stream: [
                    {
                      text: jest.fn().mockReturnValue('Test stream response')
                    }
                  ],
                  response: {
                    text: jest.fn().mockReturnValue('Test final response')
                  }
                })
              };
            }),
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: jest.fn().mockReturnValue('Test content response'),
                candidates: []
              }
            })
          };
        })
      };
    })
  };
});

// Mock config
jest.mock('../../config', () => {
  return {
    gemini: {
      apiKey: 'test-api-key',
      model: 'test-model',
      temperature: 0.7,
      maxOutputTokens: 2048,
      topK: 40,
      topP: 0.95,
      safetySettings: []
    }
  };
});

// Mock tools manager
jest.mock('../../tools', () => {
  return {
    getToolDefinitions: jest.fn().mockReturnValue([]),
    executeTool: jest.fn().mockResolvedValue({ success: true, result: 'Tool executed' })
  };
});

// Import the module to test
const geminiService = require('../../gemini-service');

describe('GeminiService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('should initialize with valid API key', () => {
    // Arrange
    const apiKey = 'valid-api-key';
    
    // Act
    const result = geminiService.setApiKey(apiKey);
    
    // Assert
    expect(result).toBe(true);
    expect(geminiService.isInitialized()).toBe(true);
  });

  test('should return error with invalid API key', async () => {
    // Arrange
    const apiKey = '';
    
    // Act
    const result = await geminiService.validateApiKey(apiKey);
    
    // Assert
    expect(result.valid).toBe(false);
  });

  test('should get response from Gemini API', async () => {
    // Arrange
    const message = 'Test message';
    
    // Act
    const result = await geminiService.getResponse(message);
    
    // Assert
    expect(result.error).toBe(false);
    expect(result.text).toBe('Test response');
  });

  test('should handle streaming response', async () => {
    // Arrange
    const message = 'Test message';
    const onChunk = jest.fn();
    
    // Act
    await geminiService.getStreamingResponse(message, onChunk);
    
    // Assert
    expect(onChunk).toHaveBeenCalled();
  });

  test('should reset chat session', () => {
    // Act
    const result = geminiService.resetChat();
    
    // Assert
    expect(result).toBe(true);
  });

  test('should analyze image', async () => {
    // Arrange
    const imageData = 'data:image/jpeg;base64,test-image-data';
    
    // Act
    const result = await geminiService.analyzeImage(imageData);
    
    // Assert
    expect(result.error).toBe(false);
    expect(result.text).toBe('Test content response');
  });
});
