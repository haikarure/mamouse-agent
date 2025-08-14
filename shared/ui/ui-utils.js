// UI Utilities untuk Mamouse Agent
// Fungsi-fungsi utility yang independen dan dapat digunakan kembali
// Includes StatusManager and ToolManager classes
// MOVED: From ui/ui-utils.js to shared/utils/ui-utils.js for better architecture
// MOVED: From shared/utils/ui-utils.js to shared/ui/ui-utils.js for optimal architecture
// RELOCATION: Moved to shared/ui/ directory as this contains UI-specific utilities

// Initialize utilities with fallback
let uiUtils = null;

// Function to initialize utilities safely
function initializeUIUtils() {
  if (window.createUtilityManager && !uiUtils) {
    uiUtils = window.createUtilityManager('UIUtils');
    console.log('✅ UI Utils initialized with utility manager');
  } else if (!uiUtils) {
    console.log('⚠️ UI Utils running without utility manager');
  }
}

// Try to initialize immediately
initializeUIUtils();

// Also try after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initializeUIUtils();
});

// DDR Cleanup: Use shared constants instead of duplicate selectors
// Interactive selectors moved to shared/utils/ui-constants.js for SSOT
const interactiveSelectors = window.MAMOUSE_CONSTANTS?.SELECTORS?.INTERACTIVE || [
  // Fallback selectors if constants not loaded yet
  '.input-container', '.input-container *', '.window-controls', '.window-controls *',
  '.slide-menu.active', '.slide-menu.active *', '.bubble-content', '.bubble-content *',
  '.scroll-controls.active', '.scroll-controls.active *',
  '.voice-visualizer-container.active', '.voice-visualizer-container.active *',
  '.camera-btn', '.camera-above-input', '.camera-above-input *'
];

/**
 * Fungsi untuk memeriksa apakah elemen adalah bagian dari elemen interaktif
 * @param {Element} element - Element yang akan diperiksa
 * @returns {boolean} - True jika element adalah interaktif
 */
function isInteractiveElement(element) {
  if (!element) return false;

  // Periksa apakah ada modal yang sedang terbuka
  // Jika ada modal terbuka, seluruh area aplikasi dianggap interaktif
  // CAREFULLY UPDATED: Use DOM helper with safe fallback
  const cameraModal = (uiUtils && uiUtils.getElement) ? uiUtils.getElement('camera-modal', false) : document.getElementById('camera-modal');
  if (cameraModal && cameraModal.style.display === 'flex') {
    return true; // Seluruh area interaktif ketika camera modal terbuka
  }

  const cameraAboveInput = uiUtils ? uiUtils.getElement('camera-above-input', false) : document.getElementById('camera-above-input');
  if (cameraAboveInput && cameraAboveInput.style.display === 'flex') {
    return true; // Seluruh area interaktif ketika camera above input terbuka
  }

  const mcpModal = uiUtils ? uiUtils.getElement('mcp-modal', false) : document.getElementById('mcp-modal');
  if (mcpModal && mcpModal.style.display === 'flex') {
    return true; // Seluruh area interaktif ketika MCP modal terbuka
  }

  // Periksa apakah elemen adalah bubble content yang sebenarnya, bukan container-nya
  if (element.classList.contains('bubble-content') ||
      element.closest('.bubble-content')) {
    return true;
  }

  // Periksa apakah elemen adalah input container atau elemen di dalamnya
  if (element.classList.contains('input-container') ||
      element.closest('.input-container')) {
    return true;
  }

  // Periksa apakah elemen adalah window controls atau elemen di dalamnya
  if (element.classList.contains('window-controls') ||
      element.closest('.window-controls')) {
    return true;
  }

  // Periksa apakah elemen adalah slide menu yang aktif atau elemen di dalamnya
  if ((element.classList.contains('slide-menu') && element.classList.contains('active')) ||
      element.closest('.slide-menu.active')) {
    return true;
  }

  // Periksa apakah elemen adalah scroll controls yang aktif atau elemen di dalamnya
  if ((element.classList.contains('scroll-controls') && element.classList.contains('active')) ||
      element.closest('.scroll-controls.active')) {
    return true;
  }

  // Periksa apakah elemen adalah camera modal atau elemen di dalamnya
  if (element.classList.contains('camera-modal') ||
      element.closest('.camera-modal')) {
    return true;
  }

  // Periksa apakah elemen adalah camera-related menggunakan camera utilities
  if (window.cameraUtils && window.cameraUtils.isCameraElement(element)) {
    return true;
  }

  // Periksa apakah elemen adalah elemen interaktif standar
  if (element.tagName === 'BUTTON' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'A' ||
      element.getAttribute('role') === 'button' ||
      element.getAttribute('tabindex') === '0') {
    return true;
  }

  // Periksa apakah elemen atau parent-nya cocok dengan salah satu selector
  for (const selector of interactiveSelectors) {
    if (element.matches(selector) || element.closest(selector)) {
      return true;
    }
  }

  return false;
}

/**
 * Fungsi untuk mengatur efek ripple pada tombol
 * Harus dipanggil setelah DOM ready
 */
function setupRippleEffect() {
  // DDR Cleanup: Use shared constants instead of hardcoded selectors
  const buttonSelector = window.MAMOUSE_CONSTANTS?.SELECTORS?.RIPPLE_BUTTONS ||
    '.submit-button, .voice-button, .menu-button, .camera-button, .window-control-button, .btn, .hide-chat-btn';
  const buttons = document.querySelectorAll(buttonSelector);

  if (uiUtils) {
    uiUtils.log('Setting up ripple effect for', buttons.length, 'buttons');
  } else {
    console.log('Setting up ripple effect for', buttons.length, 'buttons');
  }

  buttons.forEach(button => {
    // Tambahkan class ripple-button
    button.classList.add('ripple-button');

    // Tambahkan event listener
    button.addEventListener('mousedown', createRipple);
  });

  function createRipple(event) {
    // CAREFULLY UPDATED: Use utility with safe fallback
    if (uiUtils) {
      uiUtils.log('Creating ripple effect');
    } else {
      console.log('Creating ripple effect');
    }

    const button = event.currentTarget;

    // Hapus ripple yang sudah ada pada tombol ini
    const oldRipples = button.querySelectorAll('.ripple');
    oldRipples.forEach(ripple => {
      button.removeChild(ripple);
    });

    // Buat elemen ripple
    const circle = document.createElement('span');
    circle.classList.add('ripple');

    // Hitung ukuran ripple
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Atur ukuran ripple
    circle.style.width = circle.style.height = `${diameter}px`;

    // Hitung posisi ripple relatif terhadap tombol
    const rect = button.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - radius;
    const offsetY = event.clientY - rect.top - radius;

    // Atur posisi ripple
    circle.style.left = `${offsetX}px`;
    circle.style.top = `${offsetY}px`;

    // Tambahkan ripple ke tombol
    button.appendChild(circle);

    // Hapus ripple setelah animasi selesai
    setTimeout(() => {
      if (circle.parentElement) {
        button.removeChild(circle);
      }
    }, 600);
  }
}

/**
 * Fungsi untuk menginisialisasi custom dropdown
 * Harus dipanggil setelah DOM ready
 */
function initializeCustomDropdown() {
  // Try to find the new dropdown structure first (gemini-model-custom)
  const customSelect = document.getElementById('gemini-model-custom') || document.querySelector('.custom-select');

  if (!customSelect) {
    console.warn('Custom dropdown elements not found');
    return;
  }

  // Handle new dropdown structure (gemini-model-custom)
  if (customSelect.id === 'gemini-model-custom') {
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('gemini-model');
    const selectedText = document.getElementById('selected-model-text');

    if (!trigger || !options.length || !hiddenInput || !selectedText) {
      console.warn('Custom dropdown elements not found for gemini-model-custom');
      return;
    }

    // Toggle dropdown
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      customSelect.classList.toggle('open');
    });

    // Handle option selection
    options.forEach(option => {
      option.addEventListener('click', async function(e) {
        e.stopPropagation();

        // Remove selected class from all options
        options.forEach(opt => opt.classList.remove('selected'));

        // Add selected class to clicked option
        this.classList.add('selected');

        // Update hidden input value
        hiddenInput.value = this.dataset.value;

        // Update displayed text
        selectedText.textContent = this.textContent;

        // Close dropdown
        customSelect.classList.remove('open');

        // Auto-save the selected model if function is available
        if (window.saveGeminiModel) {
          await window.saveGeminiModel();
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      customSelect.classList.remove('open');
    });

    // Set initial selected option
    const defaultOption = customSelect.querySelector('.custom-option[data-value="gemini-2.5-flash"]');
    if (defaultOption) {
      defaultOption.classList.add('selected');
    }

    console.log('Custom dropdown initialized for gemini-model-custom');
    return;
  }

  // Handle old dropdown structure (fallback)
  const selectBtn = customSelect.querySelector('.select-btn');
  const selectedValue = customSelect.querySelector('.selected-value');
  const optionsList = customSelect.querySelector('.options-list');
  const options = customSelect.querySelectorAll('.option');
  const hiddenSelect = document.getElementById('gemini-model');

  if (!selectBtn || !selectedValue || !optionsList || !hiddenSelect) {
    console.warn('Custom dropdown elements not found for fallback structure');
    return;
  }

  // Toggle dropdown
  selectBtn.addEventListener('click', () => {
    customSelect.classList.toggle('active');
  });

  // Handle option selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      const text = option.textContent;

      // Update selected value
      selectedValue.textContent = text;
      hiddenSelect.value = value;

      // Close dropdown
      customSelect.classList.remove('active');

      // Remove active class from all options
      options.forEach(opt => opt.classList.remove('active'));

      // Add active class to selected option
      option.classList.add('active');

      console.log('Model selected:', value);
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('active');
    }
  });

  console.log('Custom dropdown initialized for fallback structure');
}

/**
 * Fungsi untuk menampilkan status dengan ikon dan auto-hide
 * @param {string} type - Tipe status (success, error, info, warning, processing)
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {number} duration - Durasi tampil dalam ms (default: 5000)
 * @param {string} elementId - ID element status (default: 'api-status')
 */
function showStatus(type, message, duration = 5000, elementId = window.MAMOUSE_CONSTANTS?.ELEMENT_IDS?.API_STATUS || 'api-status') {
  const statusElement = document.getElementById(elementId);
  if (!statusElement) {
    console.error(`Status element dengan ID '${elementId}' tidak ditemukan`);
    return;
  }

  console.log(`Menampilkan status: ${type} - ${message} (durasi: ${duration}ms)`);

  // Hapus semua class status
  statusElement.classList.remove('success', 'error', 'info', 'warning', 'processing');

  // Tambahkan class sesuai tipe
  statusElement.classList.add(type);

  // Tambahkan ikon berdasarkan tipe
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✓ ';
      break;
    case 'error':
      icon = '✗ ';
      break;
    case 'warning':
      icon = '⚠ ';
      break;
    case 'info':
      icon = 'ℹ ';
      break;
    case 'processing':
      icon = '⟳ ';
      break;
  }

  // Atur pesan dengan ikon
  statusElement.textContent = icon + message;

  // Tampilkan status
  statusElement.style.display = 'block';

  // Auto hide setelah durasi tertentu (kecuali untuk processing)
  if (type !== 'processing' && duration > 0) {
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, duration);
  }
}

/**
 * Fungsi untuk menyembunyikan status
 * @param {string} elementId - ID element status (default: 'api-status')
 */
function hideStatus(elementId = window.MAMOUSE_CONSTANTS?.ELEMENT_IDS?.API_STATUS || 'api-status') {
  const statusElement = document.getElementById(elementId);
  if (statusElement) {
    statusElement.style.display = 'none';
  }
}

// Export functions untuk digunakan di file lain
window.UIUtils = {
  isInteractiveElement,
  setupRippleEffect,
  initializeCustomDropdown,
  showStatus,
  hideStatus,
  interactiveSelectors
};

// DDR Cleanup: Removed duplicate export (already exported above)

// === STATUS MANAGER CLASS ===
// DDR Cleanup Note: This is the AUTHORITATIVE status management implementation
// Used by shared/services/initialization-manager.js as window.statusManager
// The StatusHelper in shared/utils/status-helper.js provides fallback compatibility

class StatusManager {
  constructor() {
    this.statusIndicator = null;
    this.statusIndicatorIcon = null;
    this.statusIndicatorText = null;
    this.statusIndicatorTimeout = null;

    this.initialize();
  }

  initialize() {
    // DDR Cleanup: Use shared constants instead of hardcoded element IDs
    const ELEMENT_IDS = window.MAMOUSE_CONSTANTS?.ELEMENT_IDS || {};

    // Get DOM elements
    this.statusIndicator = document.getElementById(ELEMENT_IDS.STATUS_INDICATOR || 'status-indicator');
    this.statusIndicatorIcon = document.getElementById(ELEMENT_IDS.STATUS_INDICATOR_ICON || 'status-indicator-icon');
    this.statusIndicatorText = document.getElementById(ELEMENT_IDS.STATUS_INDICATOR_TEXT || 'status-indicator-text');

    if (!this.statusIndicator || !this.statusIndicatorIcon || !this.statusIndicatorText) {
      console.warn('Status indicator elements not found in DOM');
    }
  }

  showStatusIndicator(type, message, duration = 3000) {
    if (!this.statusIndicator || !this.statusIndicatorIcon || !this.statusIndicatorText) {
      console.warn('Status indicator elements not available');
      return;
    }

    // Clear any existing timeout
    if (this.statusIndicatorTimeout) {
      clearTimeout(this.statusIndicatorTimeout);
      this.statusIndicatorTimeout = null;
    }

    // Remove all status classes
    this.statusIndicator.classList.remove('listening', 'processing', 'error', 'success');

    // Add the appropriate class
    this.statusIndicator.classList.add(type);
    this.statusIndicator.classList.add('show');

    // Set the message
    this.statusIndicatorText.textContent = message;

    // DDR CLEANUP: Use centralized icon system instead of duplicate SVG definitions
    let iconSvg = '';
    if (window.Icons && window.Icons.getIcon) {
      // Use centralized icon system from icons.js
      switch (type) {
        case 'listening':
          iconSvg = window.Icons.getIcon('microphone').replace('width="24" height="24"', 'width="16" height="16"');
          break;
        case 'processing':
          iconSvg = window.Icons.getIcon('clock');
          break;
        case 'success':
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12l3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          break;
        case 'error':
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>`;
          break;
        default:
          iconSvg = window.Icons.getIcon('clock');
      }
    } else {
      // Fallback if icon system not loaded
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    }

    this.statusIndicatorIcon.innerHTML = iconSvg;

    // Hide after duration
    this.statusIndicatorTimeout = setTimeout(() => {
      this.statusIndicator.classList.remove('show');
    }, duration);
  }

  hideStatusIndicator() {
    if (this.statusIndicatorTimeout) {
      clearTimeout(this.statusIndicatorTimeout);
      this.statusIndicatorTimeout = null;
    }

    if (this.statusIndicator) {
      this.statusIndicator.classList.remove('show');
    }
  }

  // Convenience methods for different status types
  showListening(message, duration = 0) {
    this.showStatusIndicator('listening', message, duration);
  }

  showProcessing(message, duration = 5000) {
    this.showStatusIndicator('processing', message, duration);
  }

  showError(message, duration = 5000) {
    this.showStatusIndicator('error', message, duration);
  }

  showSuccess(message, duration = 3000) {
    this.showStatusIndicator('success', message, duration);
  }

  // Method to check if status indicator is currently shown
  isShown() {
    return this.statusIndicator && this.statusIndicator.classList.contains('show');
  }

  // Method to get current status type
  getCurrentType() {
    if (!this.statusIndicator) return null;

    const types = ['listening', 'processing', 'error', 'success'];
    for (const type of types) {
      if (this.statusIndicator.classList.contains(type)) {
        return type;
      }
    }
    return null;
  }

  // Method to refresh DOM elements (useful if DOM changes)
  refresh() {
    this.initialize();
  }
}

// === TOOL MANAGER CLASS ===

class ToolManager {
  constructor() {
    console.log('Tool Manager initialized');
  }

  // Menampilkan hasil tool di UI
  displayToolResult(messageId, toolName, toolParams, toolResult) {
    // Cari bubble pesan yang sesuai dengan messageId
    const messageBubble = document.querySelector(`.message-bubble[data-message-id="${messageId}"]`);

    if (!messageBubble) {
      console.error(`Bubble pesan dengan ID ${messageId} tidak ditemukan`);
      return;
    }

    // Buat elemen untuk menampilkan hasil tool
    const toolResultElement = document.createElement('div');
    toolResultElement.className = 'tool-result';

    // Tambahkan header tool
    const toolHeader = document.createElement('div');
    toolHeader.className = 'tool-header';

    // DDR Cleanup: Consolidated tool icon mapping
    const toolIcons = {
      'get_weather': '🌤️',
      'web_search': '🔍',
      'get_current_time': '⏰',
      'take_screenshot': '📷',
      'open_application': '🖥️',
      'get_running_applications': '📋',
      'activate_camera': '📹',
      'deactivate_camera': '📹',
      'capture_image': '📸',
      'analyze_image': '🔍',
      'get_news': '📰',
      'get_calendar': '📅',
      'get_currency': '💱',
      'get_stocks': '📈',
      'get_travel_time': '🚗'
    };
    const toolIcon = toolIcons[toolName] || '🔧'; // Default icon

    toolHeader.innerHTML = `
      <span class="tool-icon">${toolIcon}</span>
      <span class="tool-name">${this.formatToolName(toolName)}</span>
    `;

    // Tambahkan konten tool berdasarkan jenis tool
    const toolContent = document.createElement('div');
    toolContent.className = 'tool-content';

    if (toolName === 'get_weather' && toolResult.success) {
      const weatherData = toolResult.result;
      toolContent.innerHTML = `
        <div class="weather-result">
          <div class="weather-location">${weatherData.location}</div>
          <div class="weather-main">
            <span class="weather-temp">${weatherData.temperature}°C</span>
            <span class="weather-condition">${weatherData.condition}</span>
          </div>
          <div class="weather-details">
            <div>Kelembaban: ${weatherData.humidity}%</div>
            <div>Angin: ${weatherData.wind}</div>
            <div>Diperbarui: ${weatherData.lastUpdated}</div>
          </div>
          ${weatherData.note ? `<div class="weather-note">${weatherData.note}</div>` : ''}
        </div>
      `;
    } else if (toolName === 'web_search' && toolResult.success) {
      const searchData = toolResult.result;
      let resultsHtml = '';

      searchData.results.forEach(result => {
        resultsHtml += `
          <div class="search-result-item">
            <a href="${result.url}" target="_blank" class="search-result-title">${result.title}</a>
            <div class="search-result-snippet">${result.snippet}</div>
          </div>
        `;
      });

      toolContent.innerHTML = `
        <div class="search-result">
          <div class="search-query">Hasil pencarian untuk: "${searchData.query}"</div>
          <div class="search-results">${resultsHtml}</div>
          ${searchData.note ? `<div class="search-note">${searchData.note}</div>` : ''}
        </div>
      `;
    } else if (toolName === 'get_current_time' && toolResult.success) {
      const timeData = toolResult.result;
      toolContent.innerHTML = `
        <div class="time-result">
          <div class="time-main">${timeData.time}</div>
          <div class="time-date">${timeData.date}</div>
          <div class="time-timezone">Zona Waktu: ${timeData.timezone}</div>
        </div>
      `;
    } else if (toolResult.success) {
      // Generic tool result display
      const result = toolResult.result;
      let resultHtml = '';

      if (typeof result === 'object' && result !== null) {
        // Display object properties in a structured way
        resultHtml = Object.entries(result).map(([key, value]) => {
          if (key === 'screenshot' || key === 'imageData') {
            // Handle image data
            return `<div class="tool-result-item">
              <div class="tool-result-label">${key}:</div>
              <div class="tool-result-value">
                <img src="${value}" alt="${key}" style="max-width: 300px; max-height: 200px; border-radius: 8px;" />
              </div>
            </div>`;
          } else if (typeof value === 'object' && value !== null) {
            // Handle nested objects
            return `<div class="tool-result-item">
              <div class="tool-result-label">${key}:</div>
              <div class="tool-result-value"><pre>${JSON.stringify(value, null, 2)}</pre></div>
            </div>`;
          } else {
            // Handle simple values
            return `<div class="tool-result-item">
              <div class="tool-result-label">${key}:</div>
              <div class="tool-result-value">${value}</div>
            </div>`;
          }
        }).join('');
      } else {
        // Handle simple result
        resultHtml = `<div class="tool-result-simple">${result}</div>`;
      }

      toolContent.innerHTML = `
        <div class="tool-result-generic">
          <div class="tool-result-title">✅ ${this.formatToolName(toolName)}</div>
          <div class="tool-result-content">${resultHtml}</div>
        </div>
      `;
    } else {
      // Tampilkan hasil tool secara generik jika tidak ada format khusus
      toolContent.innerHTML = `
        <div class="generic-tool-result">
          <pre>${JSON.stringify(toolResult.result, null, 2)}</pre>
        </div>
      `;
    }

    // Tambahkan header dan konten ke elemen hasil tool
    toolResultElement.appendChild(toolHeader);
    toolResultElement.appendChild(toolContent);

    // Tambahkan elemen hasil tool ke bubble pesan
    messageBubble.appendChild(toolResultElement);

    // Tidak perlu scroll karena kita menggunakan standalone bubbles
  }

  // Format nama tool untuk tampilan
  formatToolName(toolName) {
    // Ubah snake_case menjadi Title Case dengan spasi
    return toolName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Export classes
window.StatusManager = StatusManager;
window.ToolManager = ToolManager;

// DDR Cleanup: Consolidated exports - removed duplicate individual exports
// All functions are available through window.UIUtils object
// Keeping only critical backward compatibility exports

// Critical export for mouse handler (cannot be removed)
window.isInteractiveElement = isInteractiveElement;

// Export formatToolName function for ToolManager backward compatibility
window.formatToolName = function(toolName) {
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// CAREFULLY UPDATED: Use utility with safe fallback
if (uiUtils) {
  uiUtils.logLoaded('UI Utils with StatusManager and ToolManager');
} else {
  console.log('UI Utils with StatusManager and ToolManager loaded (shared/utils)');
}
