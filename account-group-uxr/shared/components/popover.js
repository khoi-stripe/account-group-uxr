/**
 * Popover Component
 * A reusable popover component that can be attached to any trigger element
 */

class Popover {
  constructor(triggerElement, options = {}) {
    this.trigger = triggerElement;
    this.isOpen = false;
    this.popoverTimeout = null;
    
    // Configuration options
    this.options = {
      position: 'right', // right, left, top, bottom
      offset: 8, // Distance from trigger
      showDelay: 0, // Delay before showing (ms)
      hideDelay: 100, // Delay before hiding (ms)
      trigger: 'hover', // hover, click
      content: '', // HTML content or array of items
      className: '', // Additional CSS classes
      ...options
    };
    
    this.createPopover();
    this.bindEvents();
  }
  
  createPopover() {
    // Create popover element
    this.popover = document.createElement('div');
    this.popover.className = `popover ${this.options.className}`.trim();
    
    // Add content
    if (Array.isArray(this.options.content)) {
      // Handle array of nav-item objects
      this.options.content.forEach((item, index) => {
        const option = document.createElement('div');
        option.className = 'popover-option nav-item';
        
        option.innerHTML = `
          <div class="nav-item-icon">
            ${item.icon}
          </div>
          <span class="nav-item-label">${item.label}</span>
        `;
        
        // Add click handler if provided
        if (item.onClick) {
          option.addEventListener('click', (e) => {
            item.onClick(e);
            this.hide();
          });
        }
        
        // Add last option class
        if (index === this.options.content.length - 1) {
          option.classList.add('last-option');
        }
        
        this.popover.appendChild(option);
      });
    } else {
      // Handle HTML string content
      this.popover.innerHTML = this.options.content;
    }
    
    // Add to body
    document.body.appendChild(this.popover);
  }
  
  position() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const popoverRect = this.popover.getBoundingClientRect();
    
    let top, left;
    
    switch (this.options.position) {
      case 'right':
        top = triggerRect.top;
        left = triggerRect.right + this.options.offset;
        break;
      case 'left':
        top = triggerRect.top;
        left = triggerRect.left - popoverRect.width - this.options.offset;
        break;
      case 'top':
        top = triggerRect.top - popoverRect.height - this.options.offset;
        left = triggerRect.left;
        break;
      case 'bottom':
        top = triggerRect.bottom + this.options.offset;
        left = triggerRect.left;
        break;
      default:
        top = triggerRect.top;
        left = triggerRect.right + this.options.offset;
    }
    
    // Global adjustment: Move all popovers up by 12px
    top -= 12;
    
    // Ensure popover stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 8;
    }
    if (left < 8) {
      left = 8;
    }
    if (top + popoverRect.height > viewportHeight) {
      top = viewportHeight - popoverRect.height - 8;
    }
    if (top < 8) {
      top = 8;
    }
    
    this.popover.style.top = `${top}px`;
    this.popover.style.left = `${left}px`;
  }
  
  show() {
    if (this.isOpen) return;
    
    this.position();
    this.popover.classList.add('show');
    this.trigger.classList.add('popover-open');
    this.isOpen = true;
    
    // Emit custom event
    this.trigger.dispatchEvent(new CustomEvent('popover:show', {
      detail: { popover: this }
    }));
  }
  
  hide() {
    if (!this.isOpen) return;
    
    this.popover.classList.remove('show');
    this.trigger.classList.remove('popover-open');
    this.isOpen = false;
    
    // Emit custom event
    this.trigger.dispatchEvent(new CustomEvent('popover:hide', {
      detail: { popover: this }
    }));
  }
  
  bindEvents() {
    if (this.options.trigger === 'hover') {
      // Mouse enter trigger
      this.trigger.addEventListener('mouseenter', () => {
        clearTimeout(this.popoverTimeout);
        if (this.options.showDelay > 0) {
          this.popoverTimeout = setTimeout(() => this.show(), this.options.showDelay);
        } else {
          this.show();
        }
      });
      
      // Mouse leave trigger
      this.trigger.addEventListener('mouseleave', () => {
        clearTimeout(this.popoverTimeout);
        this.popoverTimeout = setTimeout(() => {
          if (!this.popover.matches(':hover')) {
            this.hide();
          }
        }, this.options.hideDelay);
      });
      
      // Keep popover open when hovering over it
      this.popover.addEventListener('mouseenter', () => {
        clearTimeout(this.popoverTimeout);
      });
      
      this.popover.addEventListener('mouseleave', () => {
        this.hide();
      });
      
    } else if (this.options.trigger === 'click') {
      this.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen ? this.hide() : this.show();
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.trigger.contains(e.target) && !this.popover.contains(e.target)) {
          this.hide();
        }
      });
    }
    
    // Reposition on window resize/scroll
    window.addEventListener('resize', () => {
      if (this.isOpen) {
        this.position();
      }
    }, { passive: true });
    
    window.addEventListener('scroll', () => {
      if (this.isOpen) {
        this.position();
      }
    }, { passive: true });
  }
  
  // Update content dynamically
  updateContent(newContent) {
    this.options.content = newContent;
    this.popover.innerHTML = '';
    
    if (Array.isArray(newContent)) {
      newContent.forEach((item, index) => {
        const option = document.createElement('div');
        option.className = 'popover-option nav-item';
        
        option.innerHTML = `
          <div class="nav-item-icon">
            ${item.icon}
          </div>
          <span class="nav-item-label">${item.label}</span>
        `;
        
        if (item.onClick) {
          option.addEventListener('click', (e) => {
            item.onClick(e);
            this.hide();
          });
        }
        
        this.popover.appendChild(option);
      });
    } else {
      this.popover.innerHTML = newContent;
    }
  }
  
  // Destroy the popover
  destroy() {
    this.hide();
    if (this.popover && this.popover.parentNode) {
      this.popover.parentNode.removeChild(this.popover);
    }
    clearTimeout(this.popoverTimeout);
  }
}

// Auto-initialize popovers with data attributes
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-popover]').forEach(element => {
    const options = JSON.parse(element.dataset.popover || '{}');
    new Popover(element, options);
  });
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Popover;
} else if (typeof window !== 'undefined') {
  window.Popover = Popover;
} 