/**
 * Bubble Manager for Mamouse Agent
 * Handles bubble display, animations, and virtual scrolling
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Bubble Manager Configuration
const BUBBLE_MANAGER_CONFIG = {
  // Element Selectors
  selectors: {
    contentArea: '#bubble-content-area',
    bubbles: '.standalone-bubble'
  },

  // Animation Settings
  animation: {
    entrance: {
      duration: '0.4s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },

  // Bubble Limits
  limits: {
    maxBubbles: 50
  },

  // Scroll Settings
  scroll: {
    autoScrollThreshold: 0.9, // 90% from bottom triggers auto-scroll
    smoothScrollBehavior: 'smooth'
  }
};

/**
 * BubbleManager - Core bubble display and animation logic
 * @class BubbleManager
 */
class BubbleManager {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      initialized: false,
      bubbles: [],
      contentArea: null,
      virtualScrollTop: 0,
      isAutoScrollEnabled: true
    };

    // Event listeners tracking
    this.#eventListeners = new Map();
    
    console.log('💬 Bubble Manager initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;

  /**
   * Initialize bubble manager
   */
  async initialize() {
    try {
      console.log('💬 Initializing Bubble Manager...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Initialize virtual scrolling
      this.#initializeVirtualScroll();

      this.#state.initialized = true;
      console.log('✅ Bubble Manager initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Bubble Manager:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    const elements = {
      contentArea: document.querySelector(BUBBLE_MANAGER_CONFIG.selectors.contentArea)
    };

    // Cache elements
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    // Store content area in state for quick access
    this.#state.contentArea = elements.contentArea;

    console.log(`💬 Cached bubble manager elements`);
  }

  /**
   * Setup event listeners for scrolling and interactions
   */
  #setupEventListeners() {
    // Wheel event for scroll isolation
    const wheelHandler = (e) => {
      this.#handleWheel(e);
    };
    document.addEventListener('wheel', wheelHandler, { passive: false });
    this.#eventListeners.set('wheel', { element: document, handler: wheelHandler });

    // Keyboard events for scroll control
    const keyHandler = (e) => {
      this.#handleKeyDown(e);
    };
    document.addEventListener('keydown', keyHandler);
    this.#eventListeners.set('keydown', { element: document, handler: keyHandler });

    // Scroll event for auto-scroll management
    const contentArea = this.#state.contentArea;
    if (contentArea) {
      const scrollHandler = (e) => {
        this.#handleScroll(e);
      };
      contentArea.addEventListener('scroll', scrollHandler);
      this.#eventListeners.set('scroll', { element: contentArea, handler: scrollHandler });
    }

    console.log(`💬 Setup bubble manager event listeners`);
  }

  /**
   * Initialize virtual scrolling system
   */
  #initializeVirtualScroll() {
    const contentArea = this.#state.contentArea;
    if (!contentArea) {
      console.warn('⚠️ Bubble content area not found - scroll isolation may not work properly');
      return;
    }

    console.log('💬 Virtual scrolling initialized');
  }

  /**
   * Create a standalone bubble element
   */
  createBubble(message) {
    if (!message) {
      console.error('❌ Invalid message provided to createBubble');
      return null;
    }

    try {
      const bubble = document.createElement('div');
      bubble.className = `standalone-bubble ${message.isUser ? 'user' : 'assistant'}`;
      bubble.id = message.id || `bubble-${Date.now()}`;

      // Add timestamp data
      if (message.timestamp) {
        bubble.dataset.timestamp = message.timestamp;
      }

      if (message.isTyping) {
        // Create typing indicator with backup-compatible class structure
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'bubble-content typing-indicator';

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'typing-dots';

        // Create three dots for typing animation with backup inline styles
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('span');
          dot.className = 'typing-dot';
          dot.setAttribute('data-dot-index', i);
          dot.style.cssText = 'width: 6px !important; height: 6px !important; background-color: white !important; border-radius: 50% !important; display: inline-block !important; margin: 0 4px !important; visibility: visible !important; opacity: 1 !important;';
          dotsContainer.appendChild(dot);
        }

        typingIndicator.appendChild(dotsContainer);
        bubble.appendChild(typingIndicator);
      } else {
        // Create content
        const content = document.createElement('div');
        content.className = 'bubble-content';

        const formattedText = this.#formatTextContent(message.text);
        if (formattedText !== message.text) {
          content.innerHTML = formattedText;
        } else {
          content.textContent = formattedText;
        }

        bubble.appendChild(content);
      }

      console.log(`💬 Created bubble: ${bubble.id}`);
      return bubble;

    } catch (error) {
      console.error('❌ Error creating bubble:', error);
      return null;
    }
  }

  /**
   * Add bubble to the chat area
   */
  addBubble(bubble, isUser = false) {
    if (!bubble) {
      console.error('❌ Invalid bubble provided to addBubble');
      return false;
    }

    try {
      const contentArea = this.#state.contentArea;
      if (!contentArea) {
        console.error('❌ Content area not available');
        return false;
      }

      // Add bubble to DOM
      contentArea.appendChild(bubble);

      // Add to state tracking
      this.#state.bubbles.push({
        element: bubble,
        id: bubble.id,
        isUser: isUser,
        timestamp: Date.now()
      });

      // Manage bubble limit
      this.#manageBubbleLimit();

      // Auto-scroll to show new bubble
      this.#autoScrollToBottom();

      console.log(`💬 Added bubble to chat: ${bubble.id}`);
      return true;

    } catch (error) {
      console.error('❌ Error adding bubble:', error);
      return false;
    }
  }

  /**
   * Update bubble content (for streaming responses)
   */
  updateBubbleContent(bubbleId, text) {
    try {
      const bubble = document.getElementById(bubbleId);
      if (!bubble) {
        console.warn(`⚠️ Bubble not found for update: ${bubbleId}`);
        return false;
      }

      let content = bubble.querySelector('.bubble-content');

      // Handle typing indicator conversion (backup-compatible approach)
      if (content && content.classList.contains('typing-indicator')) {
        console.log(`💬 Converting typing indicator to content for bubble: ${bubbleId}`);

        // Clear typing indicator content and remove class (same element conversion)
        content.innerHTML = '';
        content.classList.remove('typing-indicator');
      }

      if (!content) {
        console.warn(`⚠️ Bubble content not found: ${bubbleId}`);
        return false;
      }

      const formattedText = this.#formatTextContent(text);
      if (formattedText !== text) {
        content.innerHTML = formattedText;
      } else {
        content.textContent = formattedText;
      }

      // Auto-scroll if user is near bottom
      this.#autoScrollToBottom();

      console.log(`💬 Updated bubble content: ${bubbleId}`);
      return true;

    } catch (error) {
      console.error(`❌ Error updating bubble ${bubbleId}:`, error);
      return false;
    }
  }

  /**
   * Remove bubble from chat
   */
  removeBubble(bubbleId) {
    try {
      const bubble = document.getElementById(bubbleId);
      if (bubble && bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }

      // Remove from state tracking
      this.#state.bubbles = this.#state.bubbles.filter(b => b.id !== bubbleId);

      console.log(`💬 Removed bubble: ${bubbleId}`);
      return true;

    } catch (error) {
      console.error(`❌ Error removing bubble ${bubbleId}:`, error);
      return false;
    }
  }

  /**
   * Clear all bubbles
   */
  clearAllBubbles() {
    try {
      const contentArea = this.#state.contentArea;
      if (contentArea) {
        contentArea.innerHTML = '';
      }

      this.#state.bubbles = [];
      console.log('💬 Cleared all bubbles');
      return true;

    } catch (error) {
      console.error('❌ Error clearing bubbles:', error);
      return false;
    }
  }

  /**
   * Scroll to bottom of chat
   */
  scrollToBottom() {
    try {
      const contentArea = this.#state.contentArea;
      if (contentArea) {
        contentArea.scrollTop = contentArea.scrollHeight;
        this.#state.virtualScrollTop = contentArea.scrollTop;
      }
    } catch (error) {
      console.error('❌ Error scrolling to bottom:', error);
    }
  }

  /**
   * Format text content with links and line breaks
   */
  #formatTextContent(text) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    // Convert URLs to links
    const textWithLinks = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert line breaks
    return textWithLinks.replace(/\n/g, '<br>');
  }

  /**
   * Handle wheel events for scroll isolation
   */
  #handleWheel(e) {
    if (this.#isMouseOverContent(e)) {
      const contentArea = this.#state.contentArea;
      if (contentArea) {
        // Update virtual scroll position
        this.#state.virtualScrollTop = contentArea.scrollTop;
        // Allow native scrolling by not preventing default
        return;
      }
    }
    // Prevent scrolling outside bubble area
    e.preventDefault();
  }

  /**
   * Handle keyboard events for scroll control
   */
  #handleKeyDown(e) {
    if (this.#isKeyboardScrollEvent(e)) {
      const contentArea = this.#state.contentArea;
      if (contentArea && this.#isContentAreaFocused()) {
        // Allow keyboard scrolling in content area
        if (e.key === 'End') {
          this.scrollToBottom();
        }
        return;
      }
      // Prevent keyboard scrolling outside bubble area
      e.preventDefault();
    }
  }

  /**
   * Handle scroll events for auto-scroll management
   */
  #handleScroll(e) {
    const contentArea = this.#state.contentArea;
    if (!contentArea) return;

    // Update virtual scroll position
    this.#state.virtualScrollTop = contentArea.scrollTop;

    // Check if user is near bottom to enable/disable auto-scroll
    const threshold = BUBBLE_MANAGER_CONFIG.scroll.autoScrollThreshold;
    const scrollPosition = contentArea.scrollTop;
    const scrollHeight = contentArea.scrollHeight;
    const clientHeight = contentArea.clientHeight;

    // Calculate if user is near bottom (within 90% threshold)
    const isNearBottom = (scrollPosition + clientHeight) >= (scrollHeight * threshold);

    // Enable auto-scroll when near bottom, disable when scrolled up
    this.#state.isAutoScrollEnabled = isNearBottom;
  }

  /**
   * Check if mouse is over bubble content area
   */
  #isMouseOverContent(e) {
    const contentArea = this.#state.contentArea;
    if (!contentArea) return false;

    const rect = contentArea.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  }

  /**
   * Check if keyboard event is for scrolling
   */
  #isKeyboardScrollEvent(e) {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
    return scrollKeys.includes(e.key);
  }

  /**
   * Check if content area is focused
   */
  #isContentAreaFocused() {
    const contentArea = this.#state.contentArea;
    return contentArea && (document.activeElement === contentArea || contentArea.contains(document.activeElement));
  }

  /**
   * Auto-scroll to bottom if user is near bottom
   */
  #autoScrollToBottom() {
    const contentArea = this.#state.contentArea;
    if (!contentArea) return;

    // Always check current position before auto-scrolling
    const threshold = BUBBLE_MANAGER_CONFIG.scroll.autoScrollThreshold;
    const scrollPosition = contentArea.scrollTop;
    const scrollHeight = contentArea.scrollHeight;
    const clientHeight = contentArea.clientHeight;

    // Check if user is near bottom (within 90% threshold)
    const isNearBottom = (scrollPosition + clientHeight) >= (scrollHeight * threshold);

    // Auto-scroll if user is near bottom or if auto-scroll is explicitly enabled
    if (isNearBottom || this.#state.isAutoScrollEnabled) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    }
  }

  /**
   * Manage bubble limit to prevent memory issues
   */
  #manageBubbleLimit() {
    const maxBubbles = BUBBLE_MANAGER_CONFIG.limits.maxBubbles;
    
    while (this.#state.bubbles.length > maxBubbles) {
      const oldestBubble = this.#state.bubbles.shift();
      if (oldestBubble && oldestBubble.element && oldestBubble.element.parentNode) {
        oldestBubble.element.parentNode.removeChild(oldestBubble.element);
      }
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      initialized: this.#state.initialized,
      bubbleCount: this.#state.bubbles.length,
      isAutoScrollEnabled: this.#state.isAutoScrollEnabled
    };
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.#state.initialized;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Remove event listeners
    this.#eventListeners.forEach(({ element, handler }, eventType) => {
      if (eventType === 'wheel') {
        element.removeEventListener('wheel', handler);
      } else if (eventType === 'keydown') {
        element.removeEventListener('keydown', handler);
      } else if (eventType === 'scroll') {
        element.removeEventListener('scroll', handler);
      }
    });
    this.#eventListeners.clear();

    // Clear cached elements
    this.#elements.clear();

    // Clear bubbles
    this.clearAllBubbles();

    this.#state.initialized = false;
    console.log('💬 Bubble Manager cleaned up');
  }
}

// Export for use in other modules
export default BubbleManager;
