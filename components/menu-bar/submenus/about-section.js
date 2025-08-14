/**
 * About Section Component for Menu-Bar
 * Handles about section content and interactive elements
 * @version 1.0.0
 * @author Mamouse Agent Development Team
 */

// About Section Configuration
const ABOUT_SECTION_CONFIG = {
  // Application Information
  app: {
    name: 'Mamouse Agent',
    version: '1.0.0',
    description: 'An AI personal assistant with multimodal capabilities.',
    author: 'Mamouse Agent Development Team',
    license: 'MIT',
    repository: 'https://github.com/mamouse-agent/mamouse-agent'
  },

  // Element Selectors
  selectors: {
    aboutSection: '.about-section',
    versionInfo: '.version-info',
    descriptionText: '.description-text',
    authorInfo: '.author-info',
    licenseInfo: '.license-info',
    repositoryLink: '.repository-link'
  },

  // Storage Keys
  storage: {
    lastViewedVersion: 'last_viewed_version',
    aboutPreferences: 'about_preferences'
  }
};

/**
 * AboutSection - About Section Content Management
 * @class AboutSection
 */
class AboutSection {
  constructor() {
    // DOM elements cache
    this.#elements = new Map();
    
    // State management
    this.#state = {
      initialized: false,
      currentVersion: ABOUT_SECTION_CONFIG.app.version,
      lastViewedVersion: null,
      hasNewVersion: false
    };

    // Event listeners tracking
    this.#eventListeners = new Map();
    
    console.log('ℹ️ About Section initialized');
  }

  // Private properties
  #elements = null;
  #state = null;
  #eventListeners = null;

  /**
   * Initialize about section
   */
  async initialize() {
    try {
      console.log('ℹ️ Initializing About Section...');

      // Cache DOM elements
      this.#cacheElements();

      // Setup event listeners
      this.#setupEventListeners();

      // Load saved preferences
      await this.#loadPreferences();

      // Update content
      this.#updateContent();

      // Check for version updates
      this.#checkVersionUpdate();

      this.#state.initialized = true;
      console.log('✅ About Section initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing About Section:', error);
      return false;
    }
  }

  /**
   * Cache DOM elements for performance
   */
  #cacheElements() {
    const elements = {
      aboutSection: document.querySelector(ABOUT_SECTION_CONFIG.selectors.aboutSection),
      versionInfo: document.querySelector(ABOUT_SECTION_CONFIG.selectors.versionInfo),
      descriptionText: document.querySelector(ABOUT_SECTION_CONFIG.selectors.descriptionText),
      authorInfo: document.querySelector(ABOUT_SECTION_CONFIG.selectors.authorInfo),
      licenseInfo: document.querySelector(ABOUT_SECTION_CONFIG.selectors.licenseInfo),
      repositoryLink: document.querySelector(ABOUT_SECTION_CONFIG.selectors.repositoryLink)
    };

    // Cache elements (some may be null if not present)
    Object.entries(elements).forEach(([key, element]) => {
      this.#elements.set(key, element);
    });

    console.log(`ℹ️ Cached about section elements`);
  }

  /**
   * Setup event listeners
   */
  #setupEventListeners() {
    const repositoryLink = this.#elements.get('repositoryLink');
    const aboutSection = this.#elements.get('aboutSection');

    // Repository link click handler
    if (repositoryLink) {
      const linkHandler = (e) => {
        e.preventDefault();
        this.#openRepository();
      };
      repositoryLink.addEventListener('click', linkHandler);
      this.#eventListeners.set('repositoryLink', { element: repositoryLink, handler: linkHandler });
    }

    // About section click handler for version info
    if (aboutSection) {
      const sectionHandler = (e) => {
        if (e.target.classList.contains('version-info') || e.target.closest('.version-info')) {
          this.#showVersionDetails();
        }
      };
      aboutSection.addEventListener('click', sectionHandler);
      this.#eventListeners.set('aboutSection', { element: aboutSection, handler: sectionHandler });
    }

    console.log(`ℹ️ Setup about section event listeners`);
  }

  /**
   * Load saved preferences
   */
  async #loadPreferences() {
    try {
      // Load last viewed version
      const lastViewed = localStorage.getItem(ABOUT_SECTION_CONFIG.storage.lastViewedVersion);
      if (lastViewed) {
        this.#state.lastViewedVersion = lastViewed;
      }

      console.log('ℹ️ Loaded about section preferences');
    } catch (error) {
      console.warn('⚠️ Failed to load about section preferences:', error);
    }
  }

  /**
   * Update content with current information
   */
  #updateContent() {
    const config = ABOUT_SECTION_CONFIG.app;

    // Update version info
    const versionInfo = this.#elements.get('versionInfo');
    if (versionInfo) {
      versionInfo.textContent = `${config.name} v${config.version}`;
    }

    // Update description
    const descriptionText = this.#elements.get('descriptionText');
    if (descriptionText) {
      descriptionText.textContent = config.description;
    }

    // Update author info
    const authorInfo = this.#elements.get('authorInfo');
    if (authorInfo) {
      authorInfo.textContent = `Developed by ${config.author}`;
    }

    // Update license info
    const licenseInfo = this.#elements.get('licenseInfo');
    if (licenseInfo) {
      licenseInfo.textContent = `License: ${config.license}`;
    }

    // Update repository link
    const repositoryLink = this.#elements.get('repositoryLink');
    if (repositoryLink) {
      repositoryLink.href = config.repository;
      repositoryLink.textContent = 'View on GitHub';
    }

    console.log('ℹ️ Updated about section content');
  }

  /**
   * Check for version updates
   */
  #checkVersionUpdate() {
    const currentVersion = this.#state.currentVersion;
    const lastViewedVersion = this.#state.lastViewedVersion;

    if (lastViewedVersion && lastViewedVersion !== currentVersion) {
      this.#state.hasNewVersion = true;
      console.log('ℹ️ New version detected:', currentVersion);
    }
  }

  /**
   * Open repository in external browser
   */
  #openRepository() {
    const repositoryUrl = ABOUT_SECTION_CONFIG.app.repository;
    
    try {
      // Try to use Electron's shell API if available
      if (window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(repositoryUrl);
      } else {
        // Fallback to window.open
        window.open(repositoryUrl, '_blank');
      }
      
      console.log('ℹ️ Opened repository:', repositoryUrl);
    } catch (error) {
      console.error('❌ Error opening repository:', error);
    }
  }

  /**
   * Show version details
   */
  #showVersionDetails() {
    const config = ABOUT_SECTION_CONFIG.app;
    const details = [
      `Application: ${config.name}`,
      `Version: ${config.version}`,
      `Author: ${config.author}`,
      `License: ${config.license}`,
      `Description: ${config.description}`
    ].join('\n');

    // Try to show in a modal or alert
    if (window.showModal) {
      window.showModal('Version Details', details);
    } else {
      alert(details);
    }

    // Mark version as viewed
    this.#markVersionAsViewed();

    console.log('ℹ️ Showed version details');
  }

  /**
   * Mark current version as viewed
   */
  #markVersionAsViewed() {
    try {
      localStorage.setItem(
        ABOUT_SECTION_CONFIG.storage.lastViewedVersion, 
        this.#state.currentVersion
      );
      this.#state.lastViewedVersion = this.#state.currentVersion;
      this.#state.hasNewVersion = false;

      console.log('ℹ️ Marked version as viewed:', this.#state.currentVersion);
    } catch (error) {
      console.warn('⚠️ Failed to mark version as viewed:', error);
    }
  }

  /**
   * Get application information
   */
  getAppInfo() {
    return { ...ABOUT_SECTION_CONFIG.app };
  }

  /**
   * Get current version
   */
  getCurrentVersion() {
    return this.#state.currentVersion;
  }

  /**
   * Check if there's a new version
   */
  hasNewVersion() {
    return this.#state.hasNewVersion;
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
   * Update application information
   */
  updateAppInfo(newInfo) {
    Object.assign(ABOUT_SECTION_CONFIG.app, newInfo);
    this.#updateContent();
    console.log('ℹ️ Updated application information');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Remove event listeners
    this.#eventListeners.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.#eventListeners.clear();

    // Clear cached elements
    this.#elements.clear();

    console.log('ℹ️ About Section cleaned up');
  }
}

// Export for use in other modules
export default AboutSection;
