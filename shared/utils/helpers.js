// Shared utility functions

// DOM utilities
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Array utilities
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique(array, key) {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// String utilities
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncate(text, length = 100, suffix = '...') {
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
}

// Date utilities
export function formatDate(date, options = {}) {
  const defaults = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
}

// Storage utilities
export function storage(key, value) {
  if (value === undefined) {
    const stored = localStorage.getItem(key);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return stored;
    }
  }
  
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Event utilities
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// API utilities
export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Random utilities
export function randomId(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Validation utilities
export function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Animation utilities
export function animateCSS(element, animationName, duration = '1s') {
  return new Promise(resolve => {
    element.style.animationDuration = duration;
    element.classList.add('animate__animated', `animate__${animationName}`);
    
    function handleAnimationEnd() {
      element.classList.remove('animate__animated', `animate__${animationName}`);
      element.style.animationDuration = '';
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    }
    
    element.addEventListener('animationend', handleAnimationEnd);
  });
}

// Loading state utility
export function withLoading(element, asyncFn) {
  return async (...args) => {
    const originalText = element.textContent;
    const originalDisabled = element.disabled;
    
    element.textContent = 'Loading...';
    element.disabled = true;
    
    try {
      return await asyncFn(...args);
    } finally {
      element.textContent = originalText;
      element.disabled = originalDisabled;
    }
  };
} 

// Page-level spinner overlay
export function showPageSpinner(text = '') {
  let overlay = document.getElementById('page-spinner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-spinner-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.65); backdrop-filter: saturate(180%) blur(6px);
    `;
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 20px; height: 20px; border: 2px solid rgba(0,39,77,0.18); border-top-color: var(--brand-600);
      border-radius: 50%; animation: agf_spin .6s linear infinite; margin-right: ${text ? '8px' : '0'};
    `;
    const label = document.createElement('div');
    label.textContent = text;
    label.style.cssText = 'color: #353a44; font-size: 14px;';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center;';
    row.appendChild(spinner);
    if (text) row.appendChild(label);
    overlay.appendChild(row);
    document.body.appendChild(overlay);
    // Keyframes if not present
    if (!document.getElementById('agf-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'agf-spinner-style';
      style.textContent = '@keyframes agf_spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }
  } else {
    overlay.style.display = 'flex';
  }
}

export function hidePageSpinner() {
  const overlay = document.getElementById('page-spinner-overlay');
  if (overlay) overlay.style.display = 'none';
}