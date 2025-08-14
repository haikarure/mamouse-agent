// Tool Manager Service for Mamouse Agent
// ARCHITECTURAL CORRECTION: Renamed from tools.js to tool-manager-service.js
// REASON: Follow established naming convention (*-service.js pattern) and accurately reflect ToolsManager class functionality
const https = require('https');
const http = require('http');
const url = require('url');
const { ipcMain } = require('electron');
const config = require('../../core/config');
const { logger } = require('../utils/file-logger');

/**
 * Tools Manager for Mamouse Agent
 * Manages tool registration, execution, and integration with AI services
 * @class ToolsManager
 */
class ToolsManager {
  constructor() {
    this.tools = {};
    this.initialized = false;
    this.registerDefaultTools();
  }

  /**
   * Initialize Tools Manager
   * @returns {boolean} Success status
   */
  initialize() {
    if (this.initialized) {
      logger.warn('Tools Manager already initialized', 'TOOLS');
      return true;
    }

    try {
      logger.info('Initializing Tools Manager...', 'TOOLS');
      
      // Setup IPC handlers
      this.setupIPCHandlers();
      
      this.initialized = true;
      logger.info('✅ Tools Manager initialized successfully', 'TOOLS');
      return true;
      
    } catch (error) {
      logger.error(`Failed to initialize Tools Manager: ${error.message}`, 'TOOLS');
      return false;
    }
  }

  /**
   * Setup IPC handlers for tool operations
   */
  setupIPCHandlers() {
    // Handle tool execution
    ipcMain.handle('tools-execute', async (event, name, parameters) => {
      return await this.executeTool(name, parameters);
    });

    // Handle tool list retrieval
    ipcMain.handle('tools-list', () => {
      return this.getTools();
    });

    // Handle tool definitions for AI
    ipcMain.handle('tools-definitions', () => {
      return this.getToolDefinitions();
    });

    logger.info('📝 IPC handlers for Tools Manager set up successfully', 'TOOLS');
  }

  /**
   * Register a new tool
   * @param {string} name - Tool name
   * @param {string} description - Tool description
   * @param {Object} parameters - Tool parameters schema
   * @param {Function} handler - Tool execution handler
   * @returns {ToolsManager} This instance for chaining
   */
  registerTool(name, description, parameters, handler) {
    this.tools[name] = {
      name,
      description,
      parameters,
      handler
    };
    logger.info(`Tool "${name}" successfully registered`, 'TOOLS');
    return this;
  }

  /**
   * Get all registered tools
   * @returns {Array} Array of tool objects
   */
  getTools() {
    return Object.values(this.tools);
  }

  /**
   * Get tool definitions for Gemini API
   * @returns {Array} Array of tool definitions
   */
  getToolDefinitions() {
    return Object.values(this.tools).map(tool => ({
      function_declarations: [{
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }]
    }));
  }

  /**
   * Execute a tool by name
   * @param {string} name - Tool name
   * @param {Object} parameters - Tool parameters
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(name, parameters = {}) {
    try {
      const tool = this.tools[name];
      
      if (!tool) {
        throw new Error(`Tool "${name}" not found`);
      }

      logger.info(`Executing tool: ${name}`, 'TOOLS');
      const result = await tool.handler(parameters);
      
      logger.info(`Tool "${name}" executed successfully`, 'TOOLS');
      return {
        success: true,
        result: result
      };
      
    } catch (error) {
      logger.error(`Tool execution failed for "${name}": ${error.message}`, 'TOOLS');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register default tools
   */
  registerDefaultTools() {
    // HTTP Request Tool
    this.registerTool(
      'http_request',
      'Make HTTP requests to external APIs or websites',
      {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to make the request to'
          },
          method: {
            type: 'string',
            description: 'HTTP method (GET, POST, PUT, DELETE)',
            enum: ['GET', 'POST', 'PUT', 'DELETE']
          },
          headers: {
            type: 'object',
            description: 'HTTP headers to include'
          },
          body: {
            type: 'string',
            description: 'Request body for POST/PUT requests'
          }
        },
        required: ['url']
      },
      this.httpRequestHandler.bind(this)
    );

    // System Information Tool
    this.registerTool(
      'system_info',
      'Get system information including OS, memory, CPU details',
      {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Type of system info to retrieve',
            enum: ['all', 'os', 'memory', 'cpu', 'network']
          }
        }
      },
      this.systemInfoHandler.bind(this)
    );

    // File Operations Tool
    this.registerTool(
      'file_operations',
      'Perform file system operations like reading, writing, listing files',
      {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            description: 'File operation to perform',
            enum: ['read', 'write', 'list', 'exists', 'delete']
          },
          path: {
            type: 'string',
            description: 'File or directory path'
          },
          content: {
            type: 'string',
            description: 'Content to write (for write operation)'
          }
        },
        required: ['operation', 'path']
      },
      this.fileOperationsHandler.bind(this)
    );

    // Date/Time Tool
    this.registerTool(
      'datetime',
      'Get current date, time, or perform date calculations',
      {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            description: 'Date/time operation to perform',
            enum: ['current', 'format', 'add', 'subtract', 'compare']
          },
          format: {
            type: 'string',
            description: 'Date format string (for format operation)'
          },
          date: {
            type: 'string',
            description: 'Date string for calculations'
          },
          amount: {
            type: 'number',
            description: 'Amount to add/subtract'
          },
          unit: {
            type: 'string',
            description: 'Time unit for calculations',
            enum: ['days', 'hours', 'minutes', 'seconds']
          }
        },
        required: ['operation']
      },
      this.datetimeHandler.bind(this)
    );

    logger.info('Default tools registered successfully', 'TOOLS');
  }

  /**
   * HTTP Request Handler
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  async httpRequestHandler(params) {
    const { url: requestUrl, method = 'GET', headers = {}, body } = params;
    
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(requestUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method: method.toUpperCase(),
        headers: {
          'User-Agent': 'Mamouse-Agent/1.0',
          ...headers
        }
      };

      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = {
              status: res.statusCode,
              headers: res.headers,
              data: data
            };
            
            // Try to parse JSON if content-type suggests it
            if (res.headers['content-type']?.includes('application/json')) {
              try {
                result.data = JSON.parse(data);
              } catch (e) {
                // Keep as string if JSON parsing fails
              }
            }
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Write body for POST/PUT requests
      if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * System Information Handler
   * @param {Object} params - Parameters
   * @returns {Object} System information
   */
  systemInfoHandler(params) {
    const os = require('os');
    const { type = 'all' } = params;
    
    const info = {};
    
    if (type === 'all' || type === 'os') {
      info.os = {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname()
      };
    }
    
    if (type === 'all' || type === 'memory') {
      info.memory = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      };
    }
    
    if (type === 'all' || type === 'cpu') {
      info.cpu = {
        model: os.cpus()[0]?.model || 'Unknown',
        cores: os.cpus().length,
        loadavg: os.loadavg()
      };
    }
    
    if (type === 'all' || type === 'network') {
      info.network = os.networkInterfaces();
    }
    
    return info;
  }

  /**
   * File Operations Handler
   * @param {Object} params - Parameters
   * @returns {Promise<Object>} Operation result
   */
  async fileOperationsHandler(params) {
    const fs = require('fs').promises;
    const path = require('path');
    const { operation, path: filePath, content } = params;
    
    try {
      switch (operation) {
        case 'read':
          const data = await fs.readFile(filePath, 'utf8');
          return { content: data };
          
        case 'write':
          await fs.writeFile(filePath, content || '', 'utf8');
          return { success: true, message: 'File written successfully' };
          
        case 'list':
          const items = await fs.readdir(filePath);
          return { items };
          
        case 'exists':
          try {
            await fs.access(filePath);
            return { exists: true };
          } catch {
            return { exists: false };
          }
          
        case 'delete':
          await fs.unlink(filePath);
          return { success: true, message: 'File deleted successfully' };
          
        default:
          throw new Error(`Unknown file operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`File operation failed: ${error.message}`);
    }
  }

  /**
   * Date/Time Handler
   * @param {Object} params - Parameters
   * @returns {Object} Date/time result
   */
  datetimeHandler(params) {
    const { operation, format, date, amount, unit } = params;
    
    switch (operation) {
      case 'current':
        return {
          timestamp: Date.now(),
          iso: new Date().toISOString(),
          local: new Date().toString()
        };
        
      case 'format':
        const targetDate = date ? new Date(date) : new Date();
        return {
          formatted: targetDate.toLocaleDateString(),
          iso: targetDate.toISOString()
        };
        
      case 'add':
      case 'subtract':
        const baseDate = date ? new Date(date) : new Date();
        const multiplier = operation === 'add' ? 1 : -1;
        let milliseconds = 0;
        
        switch (unit) {
          case 'seconds':
            milliseconds = amount * 1000;
            break;
          case 'minutes':
            milliseconds = amount * 60 * 1000;
            break;
          case 'hours':
            milliseconds = amount * 60 * 60 * 1000;
            break;
          case 'days':
            milliseconds = amount * 24 * 60 * 60 * 1000;
            break;
          default:
            throw new Error(`Unknown time unit: ${unit}`);
        }
        
        const resultDate = new Date(baseDate.getTime() + (milliseconds * multiplier));
        return {
          result: resultDate.toISOString(),
          timestamp: resultDate.getTime()
        };
        
      default:
        throw new Error(`Unknown datetime operation: ${operation}`);
    }
  }

  /**
   * Get service status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      toolCount: Object.keys(this.tools).length,
      availableTools: Object.keys(this.tools)
    };
  }

  /**
   * Shutdown Tools Manager
   */
  shutdown() {
    if (!this.initialized) {
      return;
    }

    // Remove IPC handlers
    ipcMain.removeAllListeners('tools-execute');
    ipcMain.removeAllListeners('tools-list');
    ipcMain.removeAllListeners('tools-definitions');

    this.tools = {};
    this.initialized = false;

    logger.info('🧹 Tools Manager shutdown complete', 'TOOLS');
  }
}

// Create singleton instance
const toolsManager = new ToolsManager();

module.exports = toolsManager;
