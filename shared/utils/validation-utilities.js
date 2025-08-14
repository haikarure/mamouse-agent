// Validation Utilities for Mamouse Agent
// ARCHITECTURAL MIGRATION: Renamed from validator.js to validation-utilities.js for naming consistency
// Centralized validation functions for better reusability

/**
 * Validate API key format and content
 * @param {string} apiKey - The API key to validate
 * @returns {object} - Validation result with valid flag and message
 */
const validateApiKey = (apiKey) => {
  if (!apiKey?.trim()) {
    return { valid: false, message: 'API key cannot be empty' };
  }
  
  // Check minimum length for API keys
  if (apiKey.trim().length < 30) {
    return { valid: false, message: 'API key is too short' };
  }
  
  return { valid: true };
};

/**
 * Validate URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, throws error if invalid
 */
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL');
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }
  return true;
};

/**
 * Validate configuration data
 * @param {object} data - Configuration data to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateConfigData = (data) => {
  return data && typeof data === 'object' && !Array.isArray(data);
};

/**
 * Validate file path
 * @param {string} filePath - File path to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateFilePath = (filePath) => {
  return typeof filePath === 'string' && filePath.trim().length > 0;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate port number
 * @param {number|string} port - Port number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePort = (port) => {
  const portNum = parseInt(port);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
};

/**
 * Validate string input
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {object} - Validation result
 */
const validateString = (str, minLength = 0, maxLength = Infinity) => {
  if (typeof str !== 'string') {
    return { valid: false, message: 'Input must be a string' };
  }
  
  if (str.length < minLength) {
    return { valid: false, message: `String must be at least ${minLength} characters long` };
  }
  
  if (str.length > maxLength) {
    return { valid: false, message: `String must be no more than ${maxLength} characters long` };
  }
  
  return { valid: true };
};

/**
 * Validate number input
 * @param {number|string} num - Number to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {object} - Validation result
 */
const validateNumber = (num, min = -Infinity, max = Infinity) => {
  const numValue = parseFloat(num);
  
  if (isNaN(numValue)) {
    return { valid: false, message: 'Input must be a valid number' };
  }
  
  if (numValue < min) {
    return { valid: false, message: `Number must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { valid: false, message: `Number must be no more than ${max}` };
  }
  
  return { valid: true };
};

/**
 * Validate object structure
 * @param {object} obj - Object to validate
 * @param {array} requiredFields - Array of required field names
 * @returns {object} - Validation result
 */
const validateObject = (obj, requiredFields = []) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { valid: false, message: 'Input must be an object' };
  }
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return { valid: false, message: `Missing required field: ${field}` };
    }
  }
  
  return { valid: true };
};

/**
 * Validate array input
 * @param {array} arr - Array to validate
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {object} - Validation result
 */
const validateArray = (arr, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(arr)) {
    return { valid: false, message: 'Input must be an array' };
  }
  
  if (arr.length < minLength) {
    return { valid: false, message: `Array must have at least ${minLength} items` };
  }
  
  if (arr.length > maxLength) {
    return { valid: false, message: `Array must have no more than ${maxLength} items` };
  }
  
  return { valid: true };
};

module.exports = {
  validateApiKey,
  validateUrl,
  validateConfigData,
  validateFilePath,
  validateEmail,
  validatePort,
  validateString,
  validateNumber,
  validateObject,
  validateArray
};

console.log('✅ Validation Utilities loaded (shared/utils/validation-utilities.js) - ARCHITECTURAL MIGRATION: Renamed from validator.js for naming consistency');
