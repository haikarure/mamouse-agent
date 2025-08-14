// File Logger Utility for Mamouse Agent
// ARCHITECTURAL CORRECTION: Moved from shared/services/file-logger.js to shared/utils/file-logger.js
// REASON: Provides utility logging functionality and helper methods - NOT business service logic
// RENAMED: From logger.js to file-logger.js for better clarity
// SEPARATED: Node.js file-based logging from browser console logging
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    this.currentLevel = this.logLevels.INFO;
    this.logToFile = true;
    this.logToConsole = true;
    this.logFilePath = null;
    
    this.initializeLogFile();
  }

  initializeLogFile() {
    try {
      // Use the project directory for log file
      this.logFilePath = path.join(process.cwd(), 'debug-log.txt');
      
      // Create log file if it doesn't exist
      if (!fs.existsSync(this.logFilePath)) {
        fs.writeFileSync(this.logFilePath, '', 'utf8');
      }
    } catch (error) {
      console.error('Failed to initialize log file:', error);
      this.logToFile = false;
    }
  }

  setLevel(level) {
    if (typeof level === 'string') {
      level = this.logLevels[level.toUpperCase()];
    }
    
    if (level !== undefined && level >= 0 && level <= 3) {
      this.currentLevel = level;
    }
  }

  setLogToFile(enabled) {
    this.logToFile = enabled;
  }

  setLogToConsole(enabled) {
    this.logToConsole = enabled;
  }

  formatMessage(level, message, category = 'GENERAL') {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${category}] ${message}`;
  }

  writeToFile(formattedMessage) {
    if (!this.logToFile || !this.logFilePath) return;
    
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  writeToConsole(formattedMessage) {
    if (this.logToConsole) {
      console.log(formattedMessage);
    }
  }

  log(level, message, category = 'GENERAL') {
    const levelValue = typeof level === 'string' ? this.logLevels[level] : level;
    
    if (levelValue <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, category);
      this.writeToFile(formattedMessage);
      this.writeToConsole(formattedMessage);
    }
  }

  error(message, category = 'GENERAL') {
    this.log('ERROR', message, category);
  }

  warn(message, category = 'GENERAL') {
    this.log('WARN', message, category);
  }

  info(message, category = 'GENERAL') {
    this.log('INFO', message, category);
  }

  debug(message, category = 'GENERAL') {
    this.log('DEBUG', message, category);
  }

  // Specialized logging methods for different components
  bubbleDebug(message) {
    this.debug(message, 'BUBBLE_DEBUG');
  }

  cameraDebug(message) {
    this.debug(message, 'CAMERA_DEBUG');
  }

  voiceDebug(message) {
    this.debug(message, 'VOICE_DEBUG');
  }

  windowDebug(message) {
    this.debug(message, 'WINDOW_DEBUG');
  }

  ipcDebug(message) {
    this.debug(message, 'IPC_DEBUG');
  }

  // Utility method to clear log file
  clearLogFile() {
    if (!this.logFilePath) return;
    
    try {
      fs.writeFileSync(this.logFilePath, '', 'utf8');
      this.info('Log file cleared', 'LOGGER');
    } catch (error) {
      console.error('Failed to clear log file:', error);
    }
  }

  // Utility method to get log file path
  getLogFilePath() {
    return this.logFilePath;
  }

  // Utility method to read recent log entries
  getRecentLogs(lines = 100) {
    if (!this.logFilePath || !fs.existsSync(this.logFilePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  // Method to log with stack trace for errors
  errorWithStack(message, error, category = 'GENERAL') {
    this.error(`${message}: ${error.message}`, category);
    if (error.stack) {
      this.debug(`Stack trace: ${error.stack}`, category);
    }
  }

  // Method to log performance metrics
  performance(operation, duration, category = 'PERFORMANCE') {
    this.info(`${operation} completed in ${duration}ms`, category);
  }

  // Method to log API calls
  apiCall(method, url, status, duration, category = 'API') {
    this.info(`${method} ${url} - ${status} (${duration}ms)`, category);
  }

  // Method to log user actions
  userAction(action, details = '', category = 'USER_ACTION') {
    this.info(`User action: ${action} ${details}`, category);
  }

  // Method to log system events
  systemEvent(event, details = '', category = 'SYSTEM') {
    this.info(`System event: ${event} ${details}`, category);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = { logger };
