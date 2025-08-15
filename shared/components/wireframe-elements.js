/**
 * Wireframe Elements - Components for creating wireframes at different fidelity levels
 * 
 * Usage:
 * import { WireframeElements, FidelityController } from './shared/components/wireframe-elements.js';
 * 
 * // Create elements
 * const header = WireframeElements.header('Site Header');
 * const button = WireframeElements.button('Click Me');
 * 
 * // Add fidelity switcher
 * FidelityController.init();
 */

export const WireframeElements = {
  /**
   * Create a generic wireframe box
   * @param {string} label - Label to display in the box
   * @param {Object} options - Size and styling options
   */
  box(label = 'Component', options = {}) {
    const {
      width = '200px',
      height = '100px',
      className = ''
    } = options;

    return `
      <div class="wireframe-box ${className}" 
           style="width: ${width}; height: ${height};" 
           data-label="${label}">
      </div>
    `;
  },

  /**
   * Create wireframe text blocks
   * @param {number} lines - Number of text lines
   * @param {Object} options - Styling options
   */
  text(lines = 3, options = {}) {
    const { className = '' } = options;
    const textLines = Array(lines).fill('<div class="text-line"></div>').join('');
    
    return `
      <div class="wireframe-text ${className}">
        ${textLines}
      </div>
    `;
  },

  /**
   * Create a wireframe button
   * @param {string} text - Button text
   * @param {Object} options - Button options
   */
  button(text = 'Button', options = {}) {
    const {
      type = 'button',
      className = '',
      onclick = ''
    } = options;

    return `
      <button class="wireframe-btn ${className}" 
              type="${type}" 
              ${onclick ? `onclick="${onclick}"` : ''}>
        ${text}
      </button>
    `;
  },

  /**
   * Create a wireframe input field
   * @param {Object} options - Input options
   */
  input(options = {}) {
    const {
      type = 'text',
      placeholder = 'Enter text...',
      id = '',
      className = ''
    } = options;

    return `
      <input class="wireframe-input ${className}" 
             type="${type}" 
             placeholder="${placeholder}"
             ${id ? `id="${id}"` : ''}>
    `;
  },

  /**
   * Create a wireframe card container
   * @param {string} content - Card content
   * @param {Object} options - Card options
   */
  card(content = '', options = {}) {
    const { className = '', title = '' } = options;
    
    return `
      <div class="wireframe-card ${className}">
        ${title ? `<h3>${title}</h3>` : ''}
        ${content}
      </div>
    `;
  },

  /**
   * Create a wireframe header
   * @param {string} title - Header title
   * @param {Object} options - Header options
   */
  header(title = 'Header', options = {}) {
    const { 
      className = '',
      showNav = true,
      showActions = true 
    } = options;

    const nav = showNav ? this.box('Navigation', { width: '200px', height: '40px' }) : '';
    const actions = showActions ? this.box('Actions', { width: '100px', height: '40px' }) : '';

    return `
      <div class="wireframe-header ${className}">
        <div class="flex items-center">
          <h1>${title}</h1>
        </div>
        ${nav}
        ${actions}
      </div>
    `;
  },

  /**
   * Create a wireframe sidebar
   * @param {Array} items - Sidebar items
   * @param {Object} options - Sidebar options
   */
  sidebar(items = [], options = {}) {
    const { className = '', width = '250px' } = options;
    
    const defaultItems = items.length > 0 ? items : [
      'Dashboard',
      'Analytics', 
      'Settings',
      'Profile'
    ];

    const itemsHtml = defaultItems.map(item => 
      `<div style="margin-bottom: 8px;">${this.box(item, { width: '100%', height: '40px' })}</div>`
    ).join('');

    return `
      <div class="wireframe-sidebar ${className}" style="width: ${width};">
        ${itemsHtml}
      </div>
    `;
  },

  /**
   * Create a wireframe form
   * @param {Array} fields - Form fields
   * @param {Object} options - Form options
   */
  form(fields = [], options = {}) {
    const { className = '', showSubmit = true } = options;
    
    const defaultFields = fields.length > 0 ? fields : [
      { label: 'Name', type: 'text', placeholder: 'Enter your name' },
      { label: 'Email', type: 'email', placeholder: 'Enter your email' },
      { label: 'Message', type: 'textarea', placeholder: 'Enter your message' }
    ];

    const fieldsHtml = defaultFields.map(field => `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 600;">${field.label}</label>
        ${field.type === 'textarea' 
          ? `<textarea class="wireframe-input" placeholder="${field.placeholder}" rows="3"></textarea>`
          : this.input({ type: field.type, placeholder: field.placeholder })
        }
      </div>
    `).join('');

    const submitButton = showSubmit ? this.button('Submit', { className: 'wireframe-btn-primary' }) : '';

    return `
      <form class="wireframe-form ${className}">
        ${fieldsHtml}
        ${submitButton}
      </form>
    `;
  },

  /**
   * Create a wireframe layout
   * @param {Object} sections - Layout sections
   * @param {Object} options - Layout options
   */
  layout(sections = {}, options = {}) {
    const { className = '' } = options;
    
    const {
      header = this.header(),
      sidebar = this.sidebar(),
      main = this.box('Main Content', { width: '100%', height: '400px' })
    } = sections;

    return `
      <div class="wireframe-layout ${className}">
        ${header}
        ${sidebar}
        <main class="wireframe-main">
          ${main}
        </main>
      </div>
    `;
  },

  /**
   * Create a data table wireframe
   * @param {Array} columns - Table columns
   * @param {number} rows - Number of rows
   */
  table(columns = ['Column 1', 'Column 2', 'Column 3'], rows = 5) {
    const headerHtml = columns.map(col => `<th>${col}</th>`).join('');
    
    const rowsHtml = Array(rows).fill(null).map(() => 
      columns.map(() => this.text(1)).map(text => `<td>${text}</td>`).join('')
    ).map(row => `<tr>${row}</tr>`).join('');

    return `
      <table class="wireframe-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }
};

/**
 * Fidelity Controller - Manages wireframe fidelity switching
 */
export const FidelityController = {
  currentFidelity: 'low',

  /**
   * Initialize the fidelity controller
   * @param {Object} options - Controller options
   */
  init(options = {}) {
    const {
      defaultFidelity = 'low',
      showControls = true,
      container = document.body
    } = options;

    this.currentFidelity = defaultFidelity;
    this.setFidelity(defaultFidelity);

    if (showControls) {
      this.addControls(container);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        switch(e.key) {
          case '1': this.setFidelity('low'); break;
          case '2': this.setFidelity('mid'); break;
          case '3': this.setFidelity('high'); break;
        }
      }
    });
  },

  /**
   * Set the current fidelity level
   * @param {string} level - Fidelity level (low, mid, high)
   */
  setFidelity(level) {
    // Remove existing fidelity classes
    document.body.classList.remove('wireframe-low', 'wireframe-mid', 'wireframe-high');
    
    // Add new fidelity class
    document.body.classList.add(`wireframe-${level}`);
    
    this.currentFidelity = level;
    
    // Update active button
    const buttons = document.querySelectorAll('.fidelity-controls button');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.fidelity === level);
    });

    // Trigger custom event
    document.dispatchEvent(new CustomEvent('fidelityChanged', { 
      detail: { level, previous: this.currentFidelity } 
    }));

    console.log(`Fidelity set to: ${level}`);
  },

  /**
   * Add fidelity controls to the page
   * @param {Element} container - Container to append controls to
   */
  addControls(container = document.body) {
    const controlsHtml = `
      <div class="fidelity-controls">
        <label>Fidelity:</label>
        <button data-fidelity="low" onclick="FidelityController.setFidelity('low')">Low</button>
        <button data-fidelity="mid" onclick="FidelityController.setFidelity('mid')">Mid</button>
        <button data-fidelity="high" onclick="FidelityController.setFidelity('high')">High</button>
        <span style="margin-left: 8px; opacity: 0.6; font-size: 11px;">Alt+1/2/3</span>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', controlsHtml);
    
    // Set initial active button
    this.setFidelity(this.currentFidelity);
  },

  /**
   * Get current fidelity level
   */
  getFidelity() {
    return this.currentFidelity;
  }
};

// Make FidelityController globally available for onclick handlers
window.FidelityController = FidelityController;

// Auto-initialize if this script is loaded directly (not as module)
if (typeof module === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    FidelityController.init();
  });
}