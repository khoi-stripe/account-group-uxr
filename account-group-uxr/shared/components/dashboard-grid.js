// Dashboard Grid Component
export function createDashboardGrid(items = [], options = {}) {
  const {
    columns = 'auto',
    gap = 'md',
    className = ''
  } = options;

  const grid = document.createElement('div');
  grid.className = `dashboard-grid ${className}`;
  
  const style = document.createElement('style');
  style.textContent = `
    .dashboard-grid {
      display: grid;
      gap: var(--space-${gap});
      margin-bottom: var(--space-xl);
    }
    
    .dashboard-grid.auto {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    
    .dashboard-grid.grid-1 { grid-template-columns: 1fr; }
    .dashboard-grid.grid-2 { grid-template-columns: repeat(2, 1fr); }
    .dashboard-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
    .dashboard-grid.grid-4 { grid-template-columns: repeat(4, 1fr); }
    
    @media (max-width: 768px) {
      .dashboard-grid.grid-2,
      .dashboard-grid.grid-3,
      .dashboard-grid.grid-4 {
        grid-template-columns: 1fr;
      }
    }
    
    .dashboard-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
      cursor: pointer;
    }
    
    .dashboard-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .dashboard-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-md);
    }
    
    .dashboard-card-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      margin: 0;
      color: var(--color-text);
    }
    
    .dashboard-card-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--space-xs) 0 0 0;
    }
    
    .dashboard-card-badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-xs) var(--space-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      border-radius: var(--radius-lg);
      background-color: var(--color-primary);
      color: white;
    }
    
    .dashboard-card-content {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    
    .dashboard-card-footer {
      margin-top: var(--space-md);
      padding-top: var(--space-md);
      border-top: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .dashboard-card-actions {
      display: flex;
      gap: var(--space-sm);
    }
    
    .dashboard-card-meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `;
  
  if (!document.querySelector('#dashboard-grid-styles')) {
    style.id = 'dashboard-grid-styles';
    document.head.appendChild(style);
  }

  // Set grid type based on columns option
  if (columns === 'auto') {
    grid.classList.add('auto');
  } else if (typeof columns === 'number') {
    grid.classList.add(`grid-${columns}`);
  }

  // Create cards from items
  items.forEach(item => {
    const card = createDashboardCard(item);
    grid.appendChild(card);
  });

  return grid;
}

function createDashboardCard(item) {
  const {
    title,
    subtitle,
    content,
    badge,
    actions = [],
    meta,
    onClick,
    href
  } = item;

  const card = document.createElement('div');
  card.className = 'dashboard-card';
  
  if (href) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.location.href = href;
    });
  } else if (onClick) {
    card.addEventListener('click', onClick);
  }

  card.innerHTML = `
    <div class="dashboard-card-header">
      <div>
        <h3 class="dashboard-card-title">${title}</h3>
        ${subtitle ? `<p class="dashboard-card-subtitle">${subtitle}</p>` : ''}
      </div>
      ${badge ? `<span class="dashboard-card-badge">${badge}</span>` : ''}
    </div>
    
    ${content ? `<div class="dashboard-card-content">${content}</div>` : ''}
    
    ${(actions.length > 0 || meta) ? `
      <div class="dashboard-card-footer">
        <div class="dashboard-card-actions">
          ${actions.map(action => 
            `<button class="btn btn-sm ${action.variant || 'btn-ghost'}" onclick="${action.onClick}">${action.label}</button>`
          ).join('')}
        </div>
        ${meta ? `<div class="dashboard-card-meta">${meta}</div>` : ''}
      </div>
    ` : ''}
  `;

  return card;
}

// Export for use in other modules
export { createDashboardCard }; 