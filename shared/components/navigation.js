/**
 * Reusable Navigation Component
 * Configurable navigation that works across all prototypes
 */

export function createNavigation(config = {}) {
  const {
    items = [],
    title = 'Navigation',
    showTitle = true,
    className = 'shared-nav'
  } = config;

  // Create navigation container
  const nav = document.createElement('nav');
  nav.className = className;

  // Add title if specified
  if (showTitle && title) {
    const titleElement = document.createElement('div');
    titleElement.className = 'nav-title';
    titleElement.textContent = title;
    nav.appendChild(titleElement);
  }

  // Create navigation list
  const navList = document.createElement('ul');
  navList.className = 'nav-list';

  items.forEach(item => {
    const listItem = document.createElement('li');
    listItem.className = 'nav-item';

    if (item.type === 'section') {
      // Section header
      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'nav-section';
      sectionHeader.textContent = item.label;
      listItem.appendChild(sectionHeader);
    } else if (item.type === 'divider') {
      // Divider
      listItem.className = 'nav-divider';
    } else {
      // Regular nav link
      const link = document.createElement('a');
      link.className = `nav-link ${item.active ? 'active' : ''}`;
      link.href = item.href || '#';
      
      // Add icon if provided
      if (item.icon) {
        const icon = document.createElement('span');
        icon.className = 'nav-icon';
        icon.innerHTML = item.icon;
        link.appendChild(icon);
      }

      // Add label
      const label = document.createElement('span');
      label.className = 'nav-label';
      label.textContent = item.label;
      link.appendChild(label);

      // Add badge if provided
      if (item.badge) {
        const badge = document.createElement('span');
        badge.className = `nav-badge ${item.badge.variant || 'default'}`;
        badge.textContent = item.badge.text;
        link.appendChild(badge);
      }

      // Add click handler
      if (item.onClick) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          item.onClick(item, e);
        });
      }

      listItem.appendChild(link);
    }

    navList.appendChild(listItem);
  });

  nav.appendChild(navList);
  return nav;
}

// Default styles for the navigation component
export function injectNavigationStyles() {
  if (document.getElementById('navigation-styles')) return;

  const style = document.createElement('style');
  style.id = 'navigation-styles';
  style.textContent = `
    /* Navigation Component Styles */
    .shared-nav {
      width: 100%;
      height: 100%;
      background: white;
      overflow-y: auto;
    }

    .nav-title {
      padding: 24px 20px 16px;
      font-family: var(--font-family-ui);
      font-size: var(--font-size-16);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      border-bottom: 1px solid rgba(0, 39, 77, 0.08);
      margin-bottom: 8px;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 8px;
    }

    .nav-item {
      margin-bottom: 2px;
    }

    .nav-section {
      padding: 16px 12px 8px;
      font-family: var(--font-family-ui);
      font-size: var(--font-size-12);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .nav-divider {
      height: 1px;
      background: rgba(0, 39, 77, 0.08);
      margin: 8px 12px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-family-ui);
      font-size: var(--font-size-14);
      font-weight: var(--font-weight-regular);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition-default);
      position: relative;
    }

    .nav-link:hover {
      background: var(--neutral-100);
      color: var(--color-text);
    }

    .nav-link.active {
      background: var(--brand-100);
      color: var(--brand-700);
    }

    .nav-link.active .nav-icon {
      color: var(--brand-600);
    }

    .nav-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--color-text-muted);
      transition: var(--transition-default);
    }

    .nav-icon svg {
      width: 16px;
      height: 16px;
      color: currentColor;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: var(--font-size-10);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      flex-shrink: 0;
    }

    .nav-badge.default {
      background: var(--neutral-200);
      color: var(--neutral-700);
    }

    .nav-badge.brand {
      background: var(--brand-100);
      color: var(--brand-700);
    }

    .nav-badge.success {
      background: var(--success-100);
      color: var(--success-700);
    }

    .nav-badge.attention {
      background: var(--attention-100);
      color: var(--attention-700);
    }

    .nav-badge.critical {
      background: var(--critical-100);
      color: var(--critical-700);
    }

    /* Scrollbar styling */
    .shared-nav::-webkit-scrollbar {
      width: 4px;
    }

    .shared-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .shared-nav::-webkit-scrollbar-thumb {
      background: var(--neutral-300);
      border-radius: 2px;
    }

    .shared-nav::-webkit-scrollbar-thumb:hover {
      background: var(--neutral-400);
    }

    /* Workload caret styling */
    .workload-caret-icon svg {
      color: currentColor;
      transition: all var(--transition-fast);
    }
  `;

  document.head.appendChild(style);
}

// Example navigation configuration
export const defaultNavConfig = {
  title: 'Dashboard',
  showTitle: true,
  items: [
    {
      label: 'Overview',
      href: '#overview',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline fill="currentColor" points="9,22 9,12 15,12 15,22"></polyline></svg>',
      active: true
    },
    {
      label: 'Analytics',
      href: '#analytics',
      icon: '<svg viewBox="0 0 24 24"><polyline fill="currentColor" points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline></svg>',
      badge: { text: '12', variant: 'brand' }
    },
    {
      label: 'Users',
      href: '#users',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle fill="currentColor" cx="9" cy="7" r="4"></circle><path fill="currentColor" d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path fill="currentColor" d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      label: 'Content'
    },
    {
      label: 'Products',
      href: '#products',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line fill="currentColor" x1="3" y1="6" x2="21" y2="6"></line><path fill="currentColor" d="M16 10a4 4 0 0 1-8 0"></path></svg>',
      badge: { text: 'New', variant: 'success' }
    },
    {
      label: 'Orders',
      href: '#orders',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path><polyline fill="currentColor" points="9,11 9,4 15,4 15,11"></polyline></svg>'
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      label: 'Settings'
    },
    {
      label: 'Preferences',
      href: '#preferences',
      icon: '<svg viewBox="0 0 24 24"><circle fill="currentColor" cx="12" cy="12" r="3"></circle><path fill="currentColor" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    },
    {
      label: 'Help & Support',
      href: '#help',
      icon: '<svg viewBox="0 0 24 24"><circle fill="currentColor" cx="12" cy="12" r="10"></circle><path fill="currentColor" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line fill="currentColor" x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    }
  ]
}; 