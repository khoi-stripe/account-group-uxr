// Shared Header Component
export function createHeader(options = {}) {
  const {
    title = 'Prototype Dashboard',
    navigation = [],
    showThemeToggle = true
  } = options;

  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <style>
      .header {
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        padding: var(--space-md) 0;
        position: sticky;
        top: 0;
        z-index: 100;
      }
      
      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--space-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .header-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
      }
      
      .header-nav {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
      }
      
      .theme-toggle {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-xs) var(--space-sm);
        cursor: pointer;
        color: var(--color-text);
        transition: all var(--transition-fast);
      }
      
      .theme-toggle:hover {
        background-color: var(--color-surface);
      }
      
      @media (max-width: 768px) {
        .header-nav .nav {
          display: none;
        }
      }
    </style>
    
    <div class="header-content">
      <h1 class="header-title">${title}</h1>
      <div class="header-nav">
        <nav class="nav">
          ${navigation.map(item => 
            `<a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}">${item.label}</a>`
          ).join('')}
        </nav>
        ${showThemeToggle ? '<button class="theme-toggle" id="theme-toggle">🌙</button>' : ''}
      </div>
    </div>
  `;

  // Add theme toggle functionality if enabled
  if (showThemeToggle) {
    const themeToggle = header.querySelector('#theme-toggle');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
    }
  }

  return header;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
  initializeHeader();
}

function initializeHeader() {
  const headerContainer = document.querySelector('[data-header]');
  if (headerContainer) {
    const config = JSON.parse(headerContainer.dataset.config || '{}');
    const header = createHeader(config);
    headerContainer.replaceWith(header);
  }
} 