/**
 * Color Settings Component for Menu-Bar
 * Handles theme selection, color picker interactions, and preset management
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// Color Settings Configuration
const COLOR_SETTINGS_CONFIG = {
  // Default Colors
  defaults: {
    primary: '#00a8ff',
    secondary: '#0078d4'
  },

  // Preset Themes
  presets: {
    default: {
      primary: '#00a8ff',
      secondary: '#0078d4'
    },
    neon: {
      primary: '#ff0080',
      secondary: '#8000ff'
    },
    ocean: {
      primary: '#0077be',
      secondary: '#4ecdc4'
    },
    sunset: {
      primary: '#ff6b35',
      secondary: '#f7931e'
    }
  },

  // Storage Keys
  storage: {
    primaryColor: 'primary_color',
    secondaryColor: 'secondary_color',
    currentTheme: 'current_theme'
  },

  // Element Selectors
  selectors: {
    primaryColorPicker: '#primary-color-picker',
    secondaryColorPicker: '#secondary-color-picker',
    presetOptions: '.preset-option',
    themeOptions: '.theme-option',
    colorDots: '.color-dot'
  }
};

/**
 * ColorSettings - Comprehensive Color and Theme Management
 * @class ColorSettings
 */
class ColorSettings {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      initialized: false,
      currentColors: {
        primary: COLOR_SETTINGS_CONFIG.defaults.primary,
        secondary: COLOR_SETTINGS_CONFIG.defaults.secondary
      },
      currentTheme: 'default',
      isApplying: false
    };

    // Event listeners tracking
    this.#eventListeners = new Map();

    // Throttling for performance
    this.#applyThrottleTimeout = null;
    
    console.log('🎨 Color Settings initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;
  #applyThrottleTimeout = null;

  /**
   * Initialize color settings
   */
  async initialize() {
    try {
      console.log('🎨 Initializing Color Settings...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Load saved settings
      await this.#loadSettings();

      // Apply current colors
      this.#applyColors();

      this.#state.initialized = true;
      console.log('✅ Color Settings initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing Color Settings:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    const elements = {
      primaryColorPicker: document.querySelector(COLOR_SETTINGS_CONFIG.selectors.primaryColorPicker),
      secondaryColorPicker: document.querySelector(COLOR_SETTINGS_CONFIG.selectors.secondaryColorPicker),
      presetOptions: document.querySelectorAll(COLOR_SETTINGS_CONFIG.selectors.presetOptions),
      themeOptions: document.querySelectorAll(COLOR_SETTINGS_CONFIG.selectors.themeOptions),
      colorDots: document.querySelectorAll(COLOR_SETTINGS_CONFIG.selectors.colorDots)
    };

    // Cache elements
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    console.log(`🎨 Cached color settings elements`);
  }

  /**
   * Setup event listeners
   */
  #setupEventListeners() {
    const primaryColorPicker = this.#elements.get('primaryColorPicker');
    const secondaryColorPicker = this.#elements.get('secondaryColorPicker');
    const presetOptions = this.#elements.get('presetOptions');
    const themeOptions = this.#elements.get('themeOptions');

    // Primary color picker
    if (primaryColorPicker) {
      const primaryHandler = (e) => {
        this.#updateColor('primary', e.target.value);
      };
      primaryColorPicker.addEventListener('input', primaryHandler);
      this.#eventListeners.set('primaryColor', { element: primaryColorPicker, handler: primaryHandler });
    }

    // Secondary color picker
    if (secondaryColorPicker) {
      const secondaryHandler = (e) => {
        this.#updateColor('secondary', e.target.value);
      };
      secondaryColorPicker.addEventListener('input', secondaryHandler);
      this.#eventListeners.set('secondaryColor', { element: secondaryColorPicker, handler: secondaryHandler });
    }

    // Preset options
    if (presetOptions) {
      presetOptions.forEach((option, index) => {
        const presetHandler = (e) => {
          const presetName = e.target.dataset.preset || Object.keys(COLOR_SETTINGS_CONFIG.presets)[index];
          this.applyPreset(presetName);
        };
        option.addEventListener('click', presetHandler);
        this.#eventListeners.set(`preset-${index}`, { element: option, handler: presetHandler });
      });
    }

    // Theme options
    if (themeOptions) {
      themeOptions.forEach((option, index) => {
        const themeHandler = (e) => {
          const themeName = e.target.dataset.theme || Object.keys(COLOR_SETTINGS_CONFIG.presets)[index];
          this.applyPreset(themeName);
        };
        option.addEventListener('click', themeHandler);
        this.#eventListeners.set(`theme-${index}`, { element: option, handler: themeHandler });
      });
    }

    // Color dots
    const colorDots = this.#elements.get('colorDots');
    if (colorDots) {
      colorDots.forEach((dot, index) => {
        const colorDotHandler = (e) => {
          const color = e.target.dataset.color;
          const palette = e.target.closest('.color-palette');
          const targetPickerId = palette?.dataset.target;

          if (color && targetPickerId) {
            const targetPicker = document.getElementById(targetPickerId);
            if (targetPicker) {
              targetPicker.value = color;

              // Determine if this is primary or secondary color
              const colorType = targetPickerId.includes('primary') ? 'primary' : 'secondary';
              this.#updateColor(colorType, color);

              // Update active state
              this.#updateColorDotActiveState(palette, dot);
            }
          }
        };
        dot.addEventListener('click', colorDotHandler);
        this.#eventListeners.set(`colorDot-${index}`, { element: dot, handler: colorDotHandler });
      });
    }

    console.log(`🎨 Setup color settings event listeners`);
  }

  /**
   * Load saved settings
   */
  async #loadSettings() {
    try {
      // Load primary color
      const savedPrimary = localStorage.getItem(COLOR_SETTINGS_CONFIG.storage.primaryColor);
      if (savedPrimary) {
        this.#state.currentColors.primary = savedPrimary;
      }

      // Load secondary color
      const savedSecondary = localStorage.getItem(COLOR_SETTINGS_CONFIG.storage.secondaryColor);
      if (savedSecondary) {
        this.#state.currentColors.secondary = savedSecondary;
      }

      // Load current theme
      const savedTheme = localStorage.getItem(COLOR_SETTINGS_CONFIG.storage.currentTheme);
      if (savedTheme) {
        this.#state.currentTheme = savedTheme;
      }

      // Update color pickers
      this.#updateColorPickers();

      console.log('🎨 Loaded color settings from storage');
    } catch (error) {
      console.warn('⚠️ Failed to load color settings:', error);
    }
  }

  /**
   * Update color pickers with current values
   */
  #updateColorPickers() {
    const primaryColorPicker = this.#elements.get('primaryColorPicker');
    const secondaryColorPicker = this.#elements.get('secondaryColorPicker');

    if (primaryColorPicker) {
      primaryColorPicker.value = this.#state.currentColors.primary;
    }

    if (secondaryColorPicker) {
      secondaryColorPicker.value = this.#state.currentColors.secondary;
    }
  }

  /**
   * Update color dot active state
   */
  #updateColorDotActiveState(palette, activeDot) {
    // Remove active class from all dots in this palette
    const allDots = palette.querySelectorAll('.color-dot');
    allDots.forEach(dot => dot.classList.remove('active'));

    // Add active class to clicked dot
    activeDot.classList.add('active');
  }

  /**
   * Update color and apply changes
   */
  #updateColor(type, color) {
    this.#state.currentColors[type] = color;
    
    // Save to storage
    const storageKey = type === 'primary' ? 
      COLOR_SETTINGS_CONFIG.storage.primaryColor : 
      COLOR_SETTINGS_CONFIG.storage.secondaryColor;
    localStorage.setItem(storageKey, color);

    // Apply colors with throttling
    this.#applyColorsThrottled();

    console.log(`🎨 Updated ${type} color:`, color);
  }

  /**
   * Apply colors with throttling for performance
   */
  #applyColorsThrottled() {
    if (this.#applyThrottleTimeout) {
      clearTimeout(this.#applyThrottleTimeout);
    }

    this.#applyThrottleTimeout = setTimeout(() => {
      this.#applyColors();
    }, 100);
  }

  /**
   * Apply colors to CSS variables
   */
  #applyColors() {
    const root = document.documentElement;
    const { primary, secondary } = this.#state.currentColors;

    try {
      // Convert colors to RGB
      const primaryRgb = this.#hexToRgb(primary);
      const secondaryRgb = this.#hexToRgb(secondary);

      if (primaryRgb && secondaryRgb) {
        // Set primary color variables
        root.style.setProperty('--primary-color', primary);
        root.style.setProperty('--primary-color-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);

        // Set secondary color variables
        root.style.setProperty('--secondary-color', secondary);
        root.style.setProperty('--secondary-color-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);

        // Generate tertiary and accent colors
        const tertiaryColor = this.#blendColors(primary, secondary, 0.7);
        const accentColor = this.#lightenColor(primary, 20);

        const tertiaryRgb = this.#hexToRgb(tertiaryColor);
        const accentRgb = this.#hexToRgb(accentColor);

        if (tertiaryRgb) {
          root.style.setProperty('--tertiary-color', tertiaryColor);
          root.style.setProperty('--tertiary-color-rgb', `${tertiaryRgb.r}, ${tertiaryRgb.g}, ${tertiaryRgb.b}`);
        }

        if (accentRgb) {
          root.style.setProperty('--accent-color', accentColor);
          root.style.setProperty('--accent-color-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
        }

        console.log('🎨 Applied colors to CSS variables');
      }
    } catch (error) {
      console.error('❌ Error applying colors:', error);
    }
  }

  /**
   * Apply preset theme
   */
  applyPreset(presetName) {
    const preset = COLOR_SETTINGS_CONFIG.presets[presetName];
    if (!preset) {
      console.error('❌ Unknown preset:', presetName);
      return;
    }

    this.#state.currentColors.primary = preset.primary;
    this.#state.currentColors.secondary = preset.secondary;
    this.#state.currentTheme = presetName;

    // Save to storage
    localStorage.setItem(COLOR_SETTINGS_CONFIG.storage.primaryColor, preset.primary);
    localStorage.setItem(COLOR_SETTINGS_CONFIG.storage.secondaryColor, preset.secondary);
    localStorage.setItem(COLOR_SETTINGS_CONFIG.storage.currentTheme, presetName);

    // Update color pickers
    this.#updateColorPickers();

    // Apply colors
    this.#applyColors();

    console.log('🎨 Applied preset:', presetName);
  }

  /**
   * Convert hex color to RGB
   */
  #hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Blend two colors
   */
  #blendColors(color1, color2, ratio) {
    const rgb1 = this.#hexToRgb(color1);
    const rgb2 = this.#hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
    const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
    const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Lighten color by percentage
   */
  #lightenColor(color, percent) {
    const rgb = this.#hexToRgb(color);
    if (!rgb) return color;

    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * percent / 100));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * percent / 100));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * percent / 100));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      currentColors: { ...this.#state.currentColors },
      currentTheme: this.#state.currentTheme,
      isApplying: this.#state.isApplying
    };
  }

  /**
   * Get state
   */
  getState() {
    return { ...this.#state };
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
    // Clear throttle timeout
    if (this.#applyThrottleTimeout) {
      clearTimeout(this.#applyThrottleTimeout);
    }

    // Remove event listeners
    this.#eventListeners.forEach(({ element, handler }) => {
      element.removeEventListener('input', handler);
      element.removeEventListener('click', handler);
    });
    this.#eventListeners.clear();

    // Clear cached elements
    this.#elements.clear();

    console.log('🎨 Color Settings cleaned up');
  }
}

// Export for use in other modules
export default ColorSettings;
