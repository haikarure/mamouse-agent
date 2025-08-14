// Camera System for Mamouse Agent
// Unified camera functionality - all camera features in one file
// Simple, not over-modularized approach

// ===== SIMPLE CAMERA CONFIGURATION =====
const CAMERA_CONFIG = {
  stream: {
    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
  }
};



// ===== CAMERA MANAGER CLASS =====
class CameraManager {
  constructor() {
    // Camera stream
    this.cameraStream = null;
    
    // Camera above input elements - Streamlined system
    this.cameraAboveInput = null;
    this.cameraVideoAbove = null;
    this.cameraCanvasAbove = null;
    this.cameraErrorAbove = null;

    // Animation state
    this.cameraAnimating = false;
    this.isInitialized = false;

    // Mouse penetration protection
    this.lastToggleTime = 0;
  }

  // Initialize camera manager
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Get camera elements
      this.cameraAboveInput = document.getElementById('camera-above-input');
      this.cameraVideoAbove = document.getElementById('camera-video-above');
      this.cameraCanvasAbove = document.getElementById('camera-canvas-above');
      this.cameraErrorAbove = document.getElementById('camera-error-above');





      // Critical element validation
      if (!this.cameraAboveInput) {
        console.error('❌ CRITICAL: camera-above-input element not found in DOM!');
        throw new Error('Camera above input element not found - check HTML structure');
      }

      if (!this.cameraVideoAbove) {
        console.error('❌ CRITICAL: camera-video-above element not found in DOM!');
        throw new Error('Camera video above element not found - check HTML structure');
      }

      // Setup event listeners
      this.setupEventListeners();
      
      // Ensure input container is always interactive
      if (window.inputContainer && window.inputContainer.ensureInteractive) {
        window.inputContainer.ensureInteractive();
      } else {
        this.ensureInputContainerAlwaysInteractive();
      }
      
      // Setup animation reset safety
      this.setupAnimationReset();
      
      this.isInitialized = true;
      // Camera Manager initialized
      
    } catch (error) {
      console.error('❌ Error initializing Camera Manager:', error);
      throw error;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    const cameraBtn = document.getElementById('camera-btn');

    if (cameraBtn) {
      cameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleCamera();
      });
    } else {
      console.error('Camera button not found!');
    }

    // Cleanup when window is closed
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Setup animation reset safety mechanism
  setupAnimationReset() {
    setInterval(() => {
      if (this.cameraAnimating) {
        console.warn('Camera animation stuck, auto-resetting...');
        this.resetCameraAnimationState();
      }
    }, 5000);
  }

  // Reset animation state if stuck
  resetCameraAnimationState() {
    this.cameraAnimating = false;
    if (this.cameraAboveInput) {
      this.cameraAboveInput.classList.remove(
        'fade-in',
        'fade-out',
        'test-fade',
        'test-fade-out'
      );
    }
  }

  // Simple animation with proper state management
  async _simpleAnimation(animationClass, duration, onComplete) {
    // Reset animation classes
    this.cameraAboveInput.classList.remove('fade-in', 'fade-out');

    // For fade-in: ensure element is visible for animation
    if (animationClass === 'fade-in') {
      this.cameraAboveInput.style.display = 'flex';
      this.cameraAboveInput.style.visibility = 'visible';
      // Don't set opacity manually - let CSS animation handle it
    }

    // Force reflow before adding animation class
    this.cameraAboveInput.offsetHeight;

    // Add animation class
    this.cameraAboveInput.classList.add(animationClass);

    // Wait for animation to complete
    return new Promise(resolve => {
      setTimeout(async () => {
        // Execute completion callback first
        if (onComplete) await onComplete();

        // Clean up animation class after completion
        this.cameraAboveInput.classList.remove(animationClass);

        // For fade-in: ensure final visible state
        if (animationClass === 'fade-in') {
          this.cameraAboveInput.style.opacity = '1';
          this.cameraAboveInput.style.transform = 'translateY(0)';
        }

        this.cameraAnimating = false;
        resolve();
      }, duration);
    });
  }

  // All test and debugging functions removed for production

  // Toggle camera above input (main functionality)
  async toggleCamera() {
    // Enhanced debounce protection to prevent mouse penetration
    if (this.cameraAnimating) {
      // Animation in progress - ignoring click
      return;
    }

    // Additional debounce protection
    if (this.lastToggleTime && (Date.now() - this.lastToggleTime) < 500) {
      // Camera toggle debounced
      return;
    }
    this.lastToggleTime = Date.now();

    if (!this.cameraAboveInput) {
      console.error('❌ cameraAboveInput element not found!');
      return;
    }

    const isHidden = this.cameraAboveInput.style.display === 'none' ||
                     this.cameraAboveInput.style.display === '' ||
                     this.cameraAboveInput.style.visibility === 'hidden';

    if (isHidden) {
      await this.showCameraAboveInput();
    } else {
      await this.hideCameraAboveInput();
    }
  }

  // Show camera above input with animation
  async showCameraAboveInput() {
    if (!this.cameraAboveInput) {
      console.error('❌ Camera element not found in showCameraAboveInput');
      return;
    }

    this.cameraAnimating = true;

    try {
      // FIXED TIMING: Initialize camera BEFORE fade-in animation
      // Initialize camera before fade-in animation
      await this.initCameraAbove();

      // Simple animation
      await this._simpleAnimation('fade-in', 600, () => {
        // Animation completed
      });

      // Force disable click-through when camera is open
      if (window.mouseHandler && window.mouseHandler.setClickThrough) {
        window.mouseHandler.setClickThrough(false);
        console.log('🔒 Camera opened - click-through DISABLED to prevent mouse penetration');
      }

      // Additional protection: ensure input container is interactive
      this.ensureInputContainerAlwaysInteractive();

    } catch (error) {
      console.error('❌ Error in showCameraAboveInput:', error);
      this.cameraAnimating = false;
      // Fallback: show without animation
      this.cameraAboveInput.style.display = 'flex';
      this.cameraAboveInput.style.visibility = 'visible';
      this.cameraAboveInput.style.opacity = '1';
      // Still initialize camera even in fallback
      await this.initCameraAbove();
    }
  }

  // Hide camera above input with animation
  async hideCameraAboveInput() {

    if (!this.cameraAboveInput) {
      console.error('❌ Camera element not found in hideCameraAboveInput');
      return;
    }

    // Hide camera with fade-out animation

    this.cameraAnimating = true;

    try {
      // FIXED: Proper fade-out sequence
      await this._simpleAnimation('fade-out', 500, async () => {
        // Stop camera and hide element after animation
        this.stopCameraAbove();
        this.cameraAboveInput.style.display = 'none';
        this.cameraAboveInput.style.visibility = 'hidden';
        this.cameraAboveInput.style.opacity = '0';
        this.cameraAboveInput.style.transform = 'translateY(30px)';
      });

      // Simplified click-through logic
      if (window.mouseHandler && window.mouseHandler.reevaluateClickThrough) {
        // Use reevaluateClickThrough to avoid race conditions
        setTimeout(() => {
          window.mouseHandler.reevaluateClickThrough();
        }, 100);
      }

    } catch (error) {
      console.error('❌ Error in hideCameraAboveInput:', error);
      this.cameraAnimating = false;
      // Fallback: hide without animation
      this.stopCameraAbove();
      this.cameraAboveInput.style.display = 'none';
      this.cameraAboveInput.style.visibility = 'hidden';
      this.cameraAboveInput.style.opacity = '0';
    }
  }

  // Initialize camera above input
  async initCameraAbove() {
    try {
      // Initialize camera above input

      if (this.cameraAboveInput) {
        this.cameraAboveInput.classList.add('loading');
      }

      if (this.cameraStream) {
        this.stopCameraAbove();
      }

      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONFIG.stream);
      this.cameraStream = stream;

      if (this.cameraVideoAbove) {
        this.cameraVideoAbove.srcObject = stream;
        this.cameraVideoAbove.style.display = 'block';
        // CAMERA READY: Set to full opacity so it's ready for container fade in
        this.cameraVideoAbove.style.opacity = '1';
        this.cameraVideoAbove.style.transition = 'opacity 0.3s ease-out';

        if (this.cameraAboveInput) {
          this.cameraAboveInput.classList.remove('loading');

          // CRITICAL FIX: Don't add .active class immediately to prevent race condition
          // The .active class has its own animation (cameraActivePulse) that conflicts with .fade-in
          // We'll add it after a short delay to ensure fade-in animation completes first
          setTimeout(() => {
            if (this.cameraAboveInput && !this.cameraAnimating) {
              this.cameraAboveInput.classList.add('active');
            }
          }, 100); // Small delay to ensure fade-in doesn't get overridden
        }

        if (this.cameraErrorAbove) {
          this.cameraErrorAbove.style.display = 'none';
        }

        // Camera above input initialized
      }
    } catch (error) {
      console.error('❌ Error accessing camera above input:', error);

      if (this.cameraAboveInput) {
        this.cameraAboveInput.classList.remove('loading');
      }

      if (this.cameraErrorAbove) {
        this.cameraErrorAbove.style.display = 'block';
        this.cameraErrorAbove.textContent = `Camera error: ${error.message}`;
      }
      if (this.cameraVideoAbove) {
        this.cameraVideoAbove.style.display = 'none';
      }
    }
  }

  // Stop camera above input
  stopCameraAbove() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
      console.log('Camera above input stopped');
    }

    if (this.cameraAboveInput) {
      this.cameraAboveInput.classList.remove(
        'active',
        'loading'
      );
    }

    if (this.cameraVideoAbove) {
      // SMOOTH CAMERA DISAPPEARANCE: Fade out video before hiding
      this.cameraVideoAbove.style.opacity = '0';
      setTimeout(() => {
        if (this.cameraVideoAbove) {
          this.cameraVideoAbove.srcObject = null;
          this.cameraVideoAbove.style.display = 'none';
          // Reset transition for next use
          this.cameraVideoAbove.style.transition = '';
        }
      }, 300); // Match CSS transition duration
    }
  }

  // Modal camera functions removed

  // Ensure input container is always interactive
  ensureInputContainerAlwaysInteractive() {
    const inputContainer = document.getElementById('input-container');
    if (inputContainer) {
      inputContainer.style.setProperty('pointer-events', 'auto', 'important');
      // CRITICAL FIX: Don't override z-index - let CSS handle it
      // inputContainer.style.setProperty('z-index', '99999', 'important'); // REMOVED

      const children = inputContainer.querySelectorAll('*');
      children.forEach(child => {
        child.style.setProperty('pointer-events', 'auto', 'important');
      });

      console.log('Input container forced to be interactive (z-index preserved)');
    }
  }

  // Cleanup all camera resources
  cleanup() {
    this.stopCameraAbove();
    console.log('Camera Manager cleaned up');
  }
}

// ===== CAMERA INITIALIZATION =====
let cameraManager = null;

// Initialize camera functionality when DOM is loaded (browser environment only)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Camera System

  try {
    // Wait a bit to ensure all other systems are initialized first
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create camera manager instance
    cameraManager = new CameraManager();

    // Initialize camera manager
    await cameraManager.initialize();

    // Make camera manager available globally for backward compatibility
    window.cameraManager = cameraManager;

    // Export functions - Streamlined camera system
    window.toggleCamera = () => cameraManager.toggleCamera();
    window.toggleCameraModal = () => cameraManager.toggleCamera(); // Backward compatibility alias
    window.initCameraAbove = () => cameraManager.initCameraAbove();
    window.stopCameraAbove = () => cameraManager.stopCameraAbove();
    window.ensureInputContainerAlwaysInteractive = () => cameraManager.ensureInputContainerAlwaysInteractive();
    window.resetCameraAnimationState = () => cameraManager.resetCameraAnimationState();

    // Legacy modal functions removed

    // Production code only - test functions removed

    // Camera System initialized

  } catch (error) {
    console.error('❌ Error initializing Camera System:', error);
  }
  });
}

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CameraManager, CAMERA_CONFIG };
}
