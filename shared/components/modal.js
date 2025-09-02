/**
 * Reusable Modal Component
 * Usage:
 * const modal = new Modal({
 *   title: 'Modal Title',
 *   content: '<p>Modal content</p>',
 *   footerActions: [
 *     { text: 'Cancel', type: 'secondary', action: () => modal.hide() },
 *     { text: 'Save', type: 'primary', action: () => saveData() }
 *   ]
 * });
 * modal.show();
 */

class Modal {
  constructor(options = {}) {
    this.options = {
      title: options.title || 'Modal',
      content: options.content || '',
      footerActions: options.footerActions || [],
      showHeader: options.showHeader !== false,
      showFooter: options.showFooter !== false,
      closable: options.closable !== false,
      size: options.size || 'medium', // small, medium, large
      onShow: options.onShow || null,
      onHide: options.onHide || null,
      className: options.className || '',
      ...options
    };

    this.isVisible = false;
    this.overlay = null;
    this.modal = null;
    
    this.init();
  }

  init() {
    this.createOverlay();
    this.createModal();
    this.attachEventListeners();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    
    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay && this.options.closable) {
        this.hide();
      }
    });

    document.body.appendChild(this.overlay);
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = `modal ${this.options.className}`;
    
    // Apply size class
    if (this.options.size) {
      this.modal.classList.add(`modal-${this.options.size}`);
    }

    this.updateContent();
    document.body.appendChild(this.modal);
  }

  updateContent() {
    let headerHTML = '';
    let footerHTML = '';

    // Header
    if (this.options.showHeader) {
      const closeButton = this.options.closable ? 
        '<button class="modal-close" data-modal-close>×</button>' : '';
      
      headerHTML = `
        <div class="modal-header">
          <h2 class="modal-title">${this.options.title}</h2>
          ${closeButton}
        </div>
      `;
    }

    // Footer
    if (this.options.showFooter && this.options.footerActions.length > 0) {
      const actionsHTML = this.options.footerActions.map(action => {
        const buttonClass = `modal-btn modal-btn-${action.type || 'secondary'}`;
        const disabled = action.disabled ? 'disabled' : '';
        return `<button class="${buttonClass}" data-action="${action.id || ''}" ${disabled}>${action.text}</button>`;
      }).join('');

      footerHTML = `
        <div class="modal-footer">
          <div class="modal-footer-actions">
            ${actionsHTML}
          </div>
        </div>
      `;
    }

    // Full modal HTML
    this.modal.innerHTML = `
      ${headerHTML}
      <div class="modal-content">
        ${this.options.content}
      </div>
      ${footerHTML}
    `;

    // Attach footer action listeners
    this.attachFooterActions();
  }

  attachFooterActions() {
    if (!this.options.footerActions.length) return;

    this.options.footerActions.forEach(action => {
      if (action.id) {
        const button = this.modal.querySelector(`[data-action="${action.id}"]`);
        if (button && action.action) {
          button.addEventListener('click', action.action);
        }
      }
    });
  }

  attachEventListeners() {
    // ESC key to close
    this.escapeHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible && this.options.closable) {
        this.hide();
      }
    };

    // Close button click handler
    this.closeHandler = (e) => {
      if (e.target.hasAttribute('data-modal-close') && this.options.closable) {
        this.hide();
      }
    };

    document.addEventListener('keydown', this.escapeHandler);
    this.modal.addEventListener('click', this.closeHandler);
  }

  show() {
    if (this.isVisible) return;

    this.isVisible = true;

    // Add show classes
    this.overlay.classList.add('show');
    this.modal.classList.add('show');

    // Add body class to prevent scrolling
    document.body.style.overflow = 'hidden';

    // Call onShow callback
    if (this.options.onShow) {
      this.options.onShow(this);
    }

    return this;
  }

  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;

    // Remove show classes
    this.overlay.classList.remove('show');
    this.modal.classList.remove('show');

    // Restore body scrolling
    document.body.style.overflow = '';

    // Call onHide callback
    if (this.options.onHide) {
      this.options.onHide(this);
    }

    return this;
  }

  destroy() {
    this.hide();
    
    // Remove event listeners
    document.removeEventListener('keydown', this.escapeHandler);
    
    // Remove DOM elements
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }

    return this;
  }

  // Update modal content
  setContent(content) {
    this.options.content = content;
    this.updateContent();
    return this;
  }

  // Update modal title
  setTitle(title) {
    this.options.title = title;
    if (this.options.showHeader) {
      const titleElement = this.modal.querySelector('.modal-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    return this;
  }

  // Update footer actions
  setFooterActions(actions) {
    this.options.footerActions = actions;
    this.updateContent();
    return this;
  }

  // Get modal element for direct manipulation
  getElement() {
    return this.modal;
  }

  // Get content element for direct manipulation
  getContentElement() {
    return this.modal.querySelector('.modal-content');
  }

  // Toggle collapsible module
  static toggleModule(moduleId) {
    const header = document.querySelector(`[data-module="${moduleId}"] .modal-collapsible-header`);
    const content = document.querySelector(`[data-module="${moduleId}"] .modal-module-content`);
    
    if (header && content) {
      header.classList.toggle('collapsed');
      content.classList.toggle('collapsed');
    }
  }

  // Utility method to create collapsible modules
  static createCollapsibleModule(id, title, content, collapsed = false) {
    const collapsedClass = collapsed ? 'collapsed' : '';
    const contentCollapsedClass = collapsed ? 'collapsed' : '';
    
    return `
      <div class="modal-section" data-module="${id}">
        <div class="modal-section-content">
          <div class="modal-module">
            <h4 class="modal-module-title modal-collapsible-header ${collapsedClass}" onclick="Modal.toggleModule('${id}')">
              <svg class="modal-module-caret" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 2.5L4 5L6.5 2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${title}
            </h4>
            <div class="modal-module-content ${contentCollapsedClass}">
              ${content}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Utility method for form groups
  static createFormGroup(label, inputHTML) {
    return `
      <div class="modal-form-group">
        <label class="modal-form-label">${label}</label>
        ${inputHTML}
      </div>
    `;
  }

  // Utility method for input fields
  static createInput(options = {}) {
    const {
      type = 'text',
      id = '',
      placeholder = '',
      value = '',
      required = false,
      className = 'modal-form-input'
    } = options;

    return `<input type="${type}" id="${id}" class="${className}" placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''}>`;
  }

  // Utility method for select fields
  static createSelect(options = {}) {
    const {
      id = '',
      items = [],
      selectedValue = '',
      className = 'modal-form-select'
    } = options;

    const optionsHTML = items.map(item => {
      const value = typeof item === 'object' ? item.value : item;
      const text = typeof item === 'object' ? item.text : item;
      const selected = value === selectedValue ? 'selected' : '';
      return `<option value="${value}" ${selected}>${text}</option>`;
    }).join('');

    return `<select id="${id}" class="${className}">${optionsHTML}</select>`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Modal;
} else if (typeof window !== 'undefined') {
  window.Modal = Modal;
} 