// Text & Response Processing Utilities for Mamouse Agent
// ARCHITECTURAL MIGRATION: Renamed from core-utilities.js to text-response-utilities.js
// EXTRACTED: From core/app.js and core/ipc-handlers.js for better architecture
// RELOCATION: Moved to shared/utils/ directory as these are cross-component utility functions
// ARCHITECTURAL CLEANUP: WebSocket functions moved to shared/services/websocket-service.js

// ===== TEXT UTILITIES =====

/**
 * Extract text from chunk object
 * @param {Object} chunk - Chunk object from API response
 * @returns {string} Extracted text
 */
const extractChunkText = (chunk) => {
  if (chunk?.done && !chunk?.text) return ' ';
  return chunk?.text ?? chunk?.chunk ?? chunk?.content ??
         (chunk?.done ? ' ' : 'Tidak dapat mengekstrak teks dari respons Gemini API');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 50) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

// ===== ERROR HANDLING UTILITIES =====

/**
 * Centralized error handler
 * @param {Error} error - Error object
 * @param {string} serviceName - Service name for context
 * @param {string} fallbackMessage - Optional fallback message
 */
const handleServiceError = (error, serviceName, fallbackMessage) => {
  console.warn(`⚠️ Error saat ${serviceName}: ${error.message}`);
  if (fallbackMessage) console.info(fallbackMessage);
};

// ===== RESPONSE UTILITIES =====

/**
 * Create standardized response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} extra - Additional properties
 * @returns {Object} Response object
 */
const createResponse = (success, message, extra = {}) => ({
  success,
  message,
  timestamp: new Date().toISOString(),
  ...extra
});

/**
 * Create standardized error response
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error has none
 * @returns {Object} Error response object
 */
const createErrorResponse = (error, defaultMessage = 'Terjadi kesalahan') =>
  createResponse(false, error?.message ?? defaultMessage);

// ===== EXPORTS =====

module.exports = {
  // Text utilities
  extractChunkText,
  truncateText,

  // Error handling
  handleServiceError,

  // Response utilities
  createResponse,
  createErrorResponse
};

// Browser compatibility exports
if (typeof window !== 'undefined') {
  window.TextResponseUtilities = {
    extractChunkText,
    truncateText,
    handleServiceError,
    createResponse,
    createErrorResponse
  };
}

console.log('✅ Text & Response Processing Utilities loaded (shared/utils/text-response-utilities.js) - ARCHITECTURAL MIGRATION: Renamed from core-utilities.js');
