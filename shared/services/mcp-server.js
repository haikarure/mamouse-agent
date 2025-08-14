// MCP Server for Mamouse Agent
// Model Context Protocol implementation - Screenshot functionality for chameleon theme

const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { ipcMain, screen, desktopCapturer } = require('electron');
const { logger } = require('../utils/file-logger');

// Try to load nut.js, if not available, set nutjs to null
let nutjs = null;
let nutjsAvailable = false;

try {
  // Check if nut.js package is installed
  require.resolve('@nut-tree-fork/nut-js');

  // If no error, package is installed
  try {
    // Using @nut-tree-fork/nut-js as RobotJS alternative
    const { keyboard, mouse, Point } = require('@nut-tree-fork/nut-js');

    // Configure nut.js
    keyboard.config.autoDelayMs = 0;
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 1000;

    nutjs = { keyboard, mouse, Point };
    nutjsAvailable = true;

    logger.info('Nut.js successfully loaded for keyboard and mouse control', 'MCP_SERVER');
  } catch (initError) {
    logger.warn(`Nut.js installed but failed to initialize: ${initError.message}`, 'MCP_SERVER');
    nutjsAvailable = false;
  }
} catch (error) {
  logger.warn('Nut.js not available. Keyboard and mouse simulation features will not work.', 'MCP_SERVER');
  logger.warn('To enable these features, install nut.js: npm install @nut-tree-fork/nut-js', 'MCP_SERVER');
  nutjsAvailable = false;
}

/**
 * MCP Server for Mamouse Agent
 * Handles Model Context Protocol operations including system commands and automation
 * @class MCPServer
 */
class MCPServer {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      debug: false,
      ...config
    };

    this.processes = new Map();
    this.initialized = false;
  }

  /**
   * Initialize MCP Server
   * @returns {boolean} Success status
   */
  initialize() {
    if (this.initialized) {
      logger.warn('MCP Server already initialized', 'MCP_SERVER');
      return true;
    }

    try {
      logger.info('Initializing MCP Server...', 'MCP_SERVER');
      
      // Setup IPC handlers
      this.setupIPCHandlers();
      
      this.initialized = true;
      logger.info('✅ MCP Server initialized successfully', 'MCP_SERVER');
      return true;
      
    } catch (error) {
      logger.error(`Failed to initialize MCP Server: ${error.message}`, 'MCP_SERVER');
      return false;
    }
  }

  /**
   * Setup IPC handlers for MCP operations
   */
  setupIPCHandlers() {
    // Handle system command execution
    ipcMain.handle('mcp-run-command', async (event, command, args, options) => {
      return await this.runCommand(command, args, options);
    });

    // Handle screenshot capture
    ipcMain.handle('mcp-screenshot', async () => {
      return await this.takeScreenshot();
    });

    // Handle keyboard simulation
    ipcMain.handle('mcp-keyboard', async (event, action, data) => {
      return await this.handleKeyboard(action, data);
    });

    // Handle mouse simulation
    ipcMain.handle('mcp-mouse', async (event, action, data) => {
      return await this.handleMouse(action, data);
    });

    // Handle process management
    ipcMain.handle('mcp-list-processes', () => {
      return this.listProcesses();
    });

    ipcMain.handle('mcp-kill-process', (event, processId) => {
      return this.killProcess(processId);
    });

    logger.info('📝 IPC handlers for MCP Server set up successfully', 'MCP_SERVER');
  }

  /**
   * Run system command
   * @param {string} command - Command to execute
   * @param {Array} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Command result
   */
  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (this.config.debug) {
          logger.debug(`Running command: ${command} ${args.join(' ')}`, 'MCP_SERVER');
        }

        const process = spawn(command, args, options);
        const processId = Date.now().toString();
        this.processes.set(processId, process);

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
          stdout += data.toString();
          if (this.config.debug) {
            logger.debug(`[MCP] stdout: ${data}`, 'MCP_SERVER');
          }
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
          if (this.config.debug) {
            logger.debug(`[MCP] stderr: ${data}`, 'MCP_SERVER');
          }
        });

        process.on('close', (code) => {
          this.processes.delete(processId);
          
          const result = {
            success: code === 0,
            code: code,
            stdout: stdout,
            stderr: stderr,
            processId: processId
          };

          if (this.config.debug) {
            logger.debug(`Command completed with code ${code}`, 'MCP_SERVER');
          }

          resolve(result);
        });

        process.on('error', (error) => {
          this.processes.delete(processId);
          logger.error(`Command error: ${error.message}`, 'MCP_SERVER');
          reject(error);
        });

      } catch (error) {
        logger.error(`Error running command: ${error.message}`, 'MCP_SERVER');
        reject(error);
      }
    });
  }

  /**
   * Take screenshot
   * @returns {Promise<Object>} Screenshot result
   */
  async takeScreenshot() {
    try {
      logger.info('Taking screenshot...', 'MCP_SERVER');
      
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      const screenshot = sources[0].thumbnail.toDataURL();
      
      // Save screenshot if enabled
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = path.join(process.cwd(), 'screenshots', filename);

      // Ensure screenshots directory exists
      const screenshotsDir = path.dirname(filePath);
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Save screenshot
      const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(filePath, base64Data, 'base64');

      logger.info(`Screenshot saved: ${filePath}`, 'MCP_SERVER');
      
      return {
        success: true,
        data: screenshot,
        filePath: filePath,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error(`Error taking screenshot: ${error.message}`, 'MCP_SERVER');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle keyboard actions
   * @param {string} action - Keyboard action
   * @param {Object} data - Action data
   * @returns {Promise<Object>} Action result
   */
  async handleKeyboard(action, data) {
    if (!nutjsAvailable) {
      return {
        success: false,
        error: 'Nut.js not available for keyboard simulation'
      };
    }

    try {
      switch (action) {
        case 'type':
          await nutjs.keyboard.type(data.text);
          break;
        case 'pressKey':
          await nutjs.keyboard.pressKey(data.key);
          break;
        case 'releaseKey':
          await nutjs.keyboard.releaseKey(data.key);
          break;
        default:
          throw new Error(`Unknown keyboard action: ${action}`);
      }

      return { success: true };

    } catch (error) {
      logger.error(`Keyboard action error: ${error.message}`, 'MCP_SERVER');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle mouse actions
   * @param {string} action - Mouse action
   * @param {Object} data - Action data
   * @returns {Promise<Object>} Action result
   */
  async handleMouse(action, data) {
    if (!nutjsAvailable) {
      return {
        success: false,
        error: 'Nut.js not available for mouse simulation'
      };
    }

    try {
      switch (action) {
        case 'move':
          await nutjs.mouse.setPosition(new nutjs.Point(data.x, data.y));
          break;
        case 'click':
          if (data.x && data.y) {
            await nutjs.mouse.setPosition(new nutjs.Point(data.x, data.y));
          }
          await nutjs.mouse.leftClick();
          break;
        case 'rightClick':
          if (data.x && data.y) {
            await nutjs.mouse.setPosition(new nutjs.Point(data.x, data.y));
          }
          await nutjs.mouse.rightClick();
          break;
        case 'scroll':
          await nutjs.mouse.scrollDown(data.amount || 3);
          break;
        default:
          throw new Error(`Unknown mouse action: ${action}`);
      }

      return { success: true };

    } catch (error) {
      logger.error(`Mouse action error: ${error.message}`, 'MCP_SERVER');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List running processes
   * @returns {Array} Process list
   */
  listProcesses() {
    const processList = [];
    
    for (const [id, process] of this.processes.entries()) {
      processList.push({
        id: id,
        pid: process.pid,
        killed: process.killed,
        connected: process.connected
      });
    }

    return processList;
  }

  /**
   * Kill process by ID
   * @param {string} processId - Process ID
   * @returns {Object} Kill result
   */
  killProcess(processId) {
    try {
      const process = this.processes.get(processId);
      
      if (!process) {
        return {
          success: false,
          error: `Process ${processId} not found`
        };
      }

      process.kill();
      this.processes.delete(processId);
      
      logger.info(`Process ${processId} killed successfully`, 'MCP_SERVER');
      return { success: true };

    } catch (error) {
      logger.error(`Error killing process ${processId}: ${error.message}`, 'MCP_SERVER');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get MCP Server status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      enabled: this.config.enabled,
      nutjsAvailable: nutjsAvailable,
      activeProcesses: this.processes.size,
      debug: this.config.debug
    };
  }

  /**
   * Shutdown MCP Server
   */
  shutdown() {
    logger.info('Shutting down MCP Server...', 'MCP_SERVER');

    // Kill all running processes
    for (const [id, process] of this.processes.entries()) {
      try {
        process.kill();
        logger.info(`Process ${id} killed successfully`, 'MCP_SERVER');
      } catch (error) {
        logger.error(`Error killing process ${id}: ${error.message}`, 'MCP_SERVER');
      }
    }

    this.processes.clear();
    this.initialized = false;

    // Remove IPC handlers
    ipcMain.removeAllListeners('mcp-run-command');
    ipcMain.removeAllListeners('mcp-screenshot');
    ipcMain.removeAllListeners('mcp-keyboard');
    ipcMain.removeAllListeners('mcp-mouse');
    ipcMain.removeAllListeners('mcp-list-processes');
    ipcMain.removeAllListeners('mcp-kill-process');

    logger.info('🧹 MCP Server shutdown complete', 'MCP_SERVER');
  }
}

// Create singleton instance
const mcpServer = new MCPServer();

module.exports = mcpServer;
