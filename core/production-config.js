// Production Configuration for Mamouse Agent
// ARCHITECTURAL MIGRATION: Moved from shared/utils/production-mode.js
// Core application configuration for production environment optimization
// This is application configuration logic, not utility functions

console.log('🚀 Production Configuration loaded (core)');

// Function to disable all testing
function disableAllTesting() {
  console.log('🚀 Disabling all testing and diagnostic functions...');
  
  // Disable menu testing functions
  if (window.debugMenuState) {
    window.debugMenuState = function() {
      console.log('🚫 Menu debugging disabled in production mode');
    };
  }
  
  if (window.testMenuToggle) {
    window.testMenuToggle = function() {
      console.log('🚫 Menu testing disabled in production mode');
    };
  }
  
  if (window.runComprehensiveTest) {
    window.runComprehensiveTest = function() {
      console.log('🚫 Comprehensive testing disabled in production mode');
    };
  }
  
  // Disable utility diagnostic functions
  if (window.runComprehensiveDiagnostic) {
    window.runComprehensiveDiagnostic = function() {
      console.log('🚫 Utility diagnostics disabled in production mode');
    };
  }
  
  if (window.testUtilityFunctions) {
    window.testUtilityFunctions = function() {
      console.log('🚫 Utility testing disabled in production mode');
    };
  }
  
  console.log('✅ All testing functions disabled');
}

// Function to disable status notifications for testing
function disableTestStatusNotifications() {
  console.log('🚀 Disabling test status notifications...');
  
  // Override status helper to prevent test notifications
  if (window.StatusHelper) {
    const originalShowStatus = window.StatusHelper.prototype.showStatus;
    window.StatusHelper.prototype.showStatus = function(type, message, duration, elementId) {
      // Only show status if it's not a test message
      if (message && (
        message.includes('Test') || 
        message.includes('test') || 
        message.includes('Testing') || 
        message.includes('Diagnostic') || 
        message.includes('diagnostic')
      )) {
        // Suppress test-related status messages
        return false;
      }
      
      // Allow normal status messages
      return originalShowStatus.call(this, type, message, duration, elementId);
    };
  }
  
  // Override createStatusHelper to prevent test notifications
  if (window.createStatusHelper) {
    const originalCreateStatusHelper = window.createStatusHelper;
    window.createStatusHelper = function(moduleName) {
      const statusHelper = originalCreateStatusHelper(moduleName);
      
      // Override showStatus method
      const originalShowStatus = statusHelper.showStatus;
      statusHelper.showStatus = function(type, message, duration, elementId) {
        // Suppress test-related messages
        if (message && (
          message.includes('Test') || 
          message.includes('test') || 
          message.includes('Testing') || 
          message.includes('Diagnostic') || 
          message.includes('diagnostic')
        )) {
          return false;
        }
        
        return originalShowStatus.call(this, type, message, duration, elementId);
      };
      
      return statusHelper;
    };
  }
  
  console.log('✅ Test status notifications disabled');
}

// Function to clean console output
function cleanConsoleOutput() {
  console.log('🚀 Setting up clean console output...');
  
  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Override console methods to filter test messages
  console.log = function(...args) {
    const message = args.join(' ');
    
    // Filter out test-related messages
    if (message.includes('🧪') || 
        message.includes('🔍') || 
        message.includes('Test') && message.includes('completed') ||
        message.includes('diagnostic') ||
        message.includes('Diagnostic')) {
      return; // Suppress test messages
    }
    
    // Allow normal messages
    originalLog.apply(console, args);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Filter out test-related warnings
    if (message.includes('🧪') || 
        message.includes('🔍') || 
        message.includes('test') && message.includes('available')) {
      return; // Suppress test warnings
    }
    
    originalWarn.apply(console, args);
  };
  
  // Keep error messages as they are important
  console.error = originalError;
  
  console.log('✅ Console output cleaned');
}

// Function to enable production mode
function enableProductionMode() {
  console.log('🚀 === ENABLING PRODUCTION MODE ===');
  
  // Step 1: Disable all testing
  disableAllTesting();
  
  // Step 2: Disable test status notifications
  setTimeout(() => {
    disableTestStatusNotifications();
  }, 100);
  
  // Step 3: Clean console output
  setTimeout(() => {
    cleanConsoleOutput();
  }, 200);
  
  // Step 4: Final cleanup
  setTimeout(() => {
    console.log('✅ Production mode enabled successfully');
    console.log('🎯 All testing and diagnostic messages disabled');
    
    // Clear any existing test status messages
    const statusElement = document.getElementById('api-status');
    if (statusElement) {
      statusElement.style.display = 'none';
    }
    
  }, 300);
}

// Function to disable specific test functions
function disableTestFunctions() {
  // List of test function names to disable
  const testFunctions = [
    'debugMenuState',
    'testMenuToggle', 
    'testMenuVisibility',
    'testMenuButtonClick',
    'testMenuSections',
    'runComprehensiveTest',
    'quickMenuTest',
    'checkUtilityAvailability',
    'checkScriptLoadingOrder',
    'fixUtilityIssues',
    'testUtilityFunctions',
    'runComprehensiveDiagnostic',
    'testMenuFix'
  ];
  
  testFunctions.forEach(funcName => {
    if (window[funcName]) {
      window[funcName] = function() {
        console.log(`🚫 ${funcName} disabled in production mode`);
      };
    }
  });
  
  console.log('✅ Test functions disabled');
}

// Auto-enable production mode when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      enableProductionMode();
      disableTestFunctions();
    }, 1000); // Wait for other scripts to load first
  });
} else {
  setTimeout(() => {
    enableProductionMode();
    disableTestFunctions();
  }, 1000);
}

// Export functions for manual control
window.enableProductionMode = enableProductionMode;
window.disableAllTesting = disableAllTesting;
window.disableTestStatusNotifications = disableTestStatusNotifications;
window.cleanConsoleOutput = cleanConsoleOutput;
window.disableTestFunctions = disableTestFunctions;

console.log('🚀 Production configuration functions available:');
console.log('  - enableProductionMode() - Enable clean production mode');
console.log('  - disableAllTesting() - Disable all test functions');
console.log('  - disableTestStatusNotifications() - Disable test notifications');
console.log('  - cleanConsoleOutput() - Clean console from test messages');
console.log('  - disableTestFunctions() - Disable specific test functions');

console.log('✅ Production Configuration initialized (ARCHITECTURAL MIGRATION: Moved from shared/utils/production-mode.js)');
