/**
 * Account Switcher Component
 * Global reusable component for switching between accounts/organizations
 */

class AccountSwitcher {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      currentAccount: options.currentAccount || { name: 'Acme, Inc.', type: 'organization' },
      accounts: options.accounts || [
        { id: 1, name: 'Acme, Inc.', type: 'organization' },
        { id: 2, name: 'Beta Corp', type: 'organization' },
        { id: 3, name: 'Charlie Ltd', type: 'organization' },
        { id: 4, name: 'Personal', type: 'personal' }
      ],
      variant: options.variant || '2-line', // '1-line' or '2-line'
      onAccountChange: options.onAccountChange || (() => {})
    };
    
    this.isOpen = false;
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    
    // Register with the global popover manager if it exists
    if (window.GlobalPopoverManager) {
      window.GlobalPopoverManager.register('account-switcher', () => this.close());
      console.log('🎯 PopoverManager: Registered account-switcher menu');
    }
  }
  
  generateInitials(name) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  generateAvatarColor(name, accountId = null) {
    // First check if we have a predefined color in the global accounts object
    if (accountId && window.accounts && window.accounts[accountId] && window.accounts[accountId].color) {
      return window.accounts[accountId].color;
    }
    
    // Random color palette for avatars
    const colors = [
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  
  generateUniqueColors(accounts) {
    // Generate unique colors for a set of accounts
    const colors = [
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#F87171', // red-400
      '#A78BFA', // violet-400
      '#34D399', // emerald-400
      '#FBBF24', // amber-400
    ];
    
    const accountColors = {};
    accounts.forEach((account, index) => {
      // First check if account object has color property
      if (account.color) {
        accountColors[account.id] = account.color;
      // Then check if we have a predefined color in the global accounts object
      } else if (window.accounts && window.accounts[account.id] && window.accounts[account.id].color) {
        accountColors[account.id] = window.accounts[account.id].color;
      } else {
        // Fall back to generated colors by index
        accountColors[account.id] = colors[index % colors.length];
      }
    });
    
    return accountColors;
  }

  render() {
    // Reset event binding flag since we're re-rendering
    this.eventsBound = false;
    
    const currentAccount = this.options.currentAccount;
    const variant = this.options.variant;
    const isAllAccounts = currentAccount.isAggregate;
    
    // Handle avatar for "All accounts" vs regular accounts
    const renderAvatar = () => {
      if (isAllAccounts) {
        return `
          <div class="account-avatar all-accounts-avatar" style="background: var(--neutral-50) !important; background-color: var(--neutral-50) !important; color: var(--neutral-600) !important;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50106 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50106 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="currentColor"/>
              <path fill="currentColor" d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="currentColor"/>
              <path fill="currentColor" d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="currentColor"/>
              <path fill="currentColor" d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="currentColor"/>
              <path fill="currentColor" d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="currentColor"/>
            </svg>
          </div>
        `;
      } else {
        const initials = this.generateInitials(currentAccount.name);
        // Use color from options first, then color system, then fallback
        const avatarColor = currentAccount.color || 
                           this.generateUniqueColors(this.options.accounts)[currentAccount.id] || 
                           this.generateAvatarColor(currentAccount.name, currentAccount.id);
        
        return `
          <div class="account-avatar" data-color="${avatarColor}" style="background-color: ${avatarColor} !important;">
            <span class="avatar-initials">${initials}</span>
          </div>
        `;
      }
    };
    
    const renderAccountDetails = () => {
      if (variant === '1-line') {
        return `
          <div class="account-details account-details-1-line">
            <span class="account-name">${currentAccount.name}</span>
          </div>
        `;
      } else {
        return `
          <div class="account-details account-details-2-line">
            <span class="account-name">${currentAccount.name}</span>
            <span class="account-type">${currentAccount.type}</span>
          </div>
        `;
      }
    };
    
    const hasMultipleAccounts = this.options.accounts.length > 1;
    const isOrgAccount = hasMultipleAccounts; // For now, treat multiple accounts as org accounts
    
    this.container.innerHTML = `
      <div class="account-switcher account-switcher-${variant} ${isOrgAccount ? 'account-switcher-org' : 'account-switcher-individual'}">
        <button class="account-switcher-trigger" type="button">
          <div class="account-info">
            ${renderAvatar()}
            ${renderAccountDetails()}
          </div>
          <div class="account-switcher-caret">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0.606072 2.33351C0.307015 2.62011 0.296913 3.09487 0.58351 3.39393L3.45851 6.39393C3.59989 6.54146 3.79535 6.62492 3.99969 6.625C4.20403 6.62509 4.39955 6.54179 4.54106 6.39438L7.41606 3.39938C7.70291 3.10056 7.6932 2.62579 7.39438 2.33894C7.09556 2.0521 6.62079 2.0618 6.33394 2.36062L4.00045 4.79151L1.66649 2.35607C1.3799 2.05701 0.905129 2.04691 0.606072 2.33351Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="account-switcher-tooltip">
            ${currentAccount.name}${currentAccount.type ? ` • ${currentAccount.type}` : ''}
          </div>
        </button>
        
        <div class="account-switcher-dropdown">
          ${isOrgAccount ? `
            <!-- Org Account: Show account list + actions -->
            <div class="account-list">
              ${this.options.accounts.length >= 8 ? `
                <div class="account-search-container">
                  <div class="account-search-input-wrapper">
                    <div class="search-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5788 11.8163C9.57969 12.5599 8.34124 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7C13 8.34124 12.5599 9.57969 11.8163 10.5788L15.2437 14.0063C15.5854 14.348 15.5854 14.902 15.2437 15.2437C14.902 15.5854 14.348 15.5854 14.0063 15.2437L10.5788 11.8163ZM11.25 7C11.25 9.34721 9.34721 11.25 7 11.25C4.65279 11.25 2.75 9.34721 2.75 7C2.75 4.65279 4.65279 2.75 7 2.75C9.34721 2.75 11.25 4.65279 11.25 7Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <input type="text" class="account-search-input" placeholder="Search accounts..." />
                  </div>
                </div>
              ` : ''}
              <div class="account-items-container">
              ${(() => {
                const uniqueColors = this.generateUniqueColors(this.options.accounts);
                const hasMultipleAccounts = this.options.accounts.length > 1;
                const isAllAccountsActive = currentAccount.isAggregate;
                let accountsHtml = '';
                
                if (hasMultipleAccounts) {
                  // Multiple accounts scenario - always show active account first
                  
                  // Sort accounts to pin "All accounts" at top, then active account
                  const sortedAccounts = [...this.options.accounts].sort((a, b) => {
                    // "All accounts" (aggregate) always goes first
                    if (a.isAggregate && !b.isAggregate) return -1;
                    if (!a.isAggregate && b.isAggregate) return 1;
                    
                    // If both are aggregate or neither are aggregate, prioritize active account
                    const aIsActive = a.id === currentAccount.id;
                    const bIsActive = b.id === currentAccount.id;
                    if (aIsActive && !bIsActive) return -1; // Active account goes first
                    if (!aIsActive && bIsActive) return 1;
                    
                    return 0; // Maintain original order for others
                  });
                  
                  accountsHtml += sortedAccounts.map((account, index) => {
                    const accountInitials = this.generateInitials(account.name);
                    const accountAvatarColor = account.color || uniqueColors[account.id];
                    const isActive = account.id === currentAccount.id;
                    
                    let accountItemHtml = '';
                    
                    // Check if this is an aggregate account and render with office icon
                    if (account.isAggregate) {
                      accountItemHtml = `
                        <button class="account-item all-accounts ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
                          <div class="account-avatar all-accounts-avatar" style="background: var(--neutral-50) !important; background-color: var(--neutral-50) !important; color: var(--neutral-600) !important;">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50106 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50106 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="currentColor"/>
                          <path fill="currentColor" d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="currentColor"/>
                          <path fill="currentColor" d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="currentColor"/>
                          <path fill="currentColor" d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="currentColor"/>
                          <path fill="currentColor" d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div class="account-details">
                            <span class="account-name">${account.name}</span>
                      </div>
                          ${isActive ? '<div class="account-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/></svg></div>' : ''}
                    </button>
                  `;
                  
                      // Add divider after "All accounts" if there are more accounts
                      if (index < sortedAccounts.length - 1) {
                        accountItemHtml += `<div class="account-divider" style="border-bottom: 1px solid var(--color-border-subtle); margin: 8px 16px;"></div>`;
                      }
                    } else {
                      accountItemHtml = `
                        <button class="account-item ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
                        <div class="account-avatar" data-color="${accountAvatarColor}" style="background-color: ${accountAvatarColor} !important;">
                          <span class="avatar-initials">${accountInitials}</span>
                        </div>
                        <div class="account-details">
                          <span class="account-name">${account.name}</span>
                        </div>
                          ${isActive ? '<div class="account-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/></svg></div>' : ''}
                      </button>
                    `;
                    }
                    
                    return accountItemHtml;
                  }).join('');
                  
                } else {
                  // Single account scenario - just render the account as is
                  accountsHtml += this.options.accounts.map(account => {
                    const accountInitials = this.generateInitials(account.name);
                    const accountAvatarColor = account.color || uniqueColors[account.id];
                    const isActive = account.id === currentAccount.id;
                    
                    // Check if this is an aggregate account and render with office icon
                    if (account.isAggregate) {
                      return `
                        <button class="account-item all-accounts ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
                          <div class="account-avatar all-accounts-avatar" style="background: var(--neutral-50) !important; background-color: var(--neutral-50) !important; color: var(--neutral-600) !important;">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50106 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50106 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="currentColor"/>
                              <path fill="currentColor" d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="currentColor"/>
                              <path fill="currentColor" d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="currentColor"/>
                              <path fill="currentColor" d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="currentColor"/>
                              <path fill="currentColor" d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="currentColor"/>
                            </svg>
                          </div>
                          <div class="account-details">
                            <span class="account-name">${account.name}</span>
                          </div>
                          ${isActive ? `
                            <div class="account-check">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/>
                              </svg>
                            </div>
                          ` : ''}
                        </button>
                      `;
                    } else {
                    return `
                      <button class="account-item ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
                        <div class="account-avatar" data-color="${accountAvatarColor}" style="background-color: ${accountAvatarColor} !important;">
                          <span class="avatar-initials">${accountInitials}</span>
                        </div>
                        <div class="account-details">
                          <span class="account-name">${account.name}</span>
                        </div>
                        ${isActive ? `
                          <div class="account-check">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/>
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/>
                            </svg>
                          </div>
                        ` : ''}
                      </button>
                    `;
                    }
                  }).join('');
                }
                
                return accountsHtml;
              })()}
              </div>
            </div>
            
            <!-- Account Actions Section -->
            <div class="account-actions">
              <button class="nav-item settings-button" type="button">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99996 10C9.10453 10 9.99996 9.10457 9.99996 8C9.99996 6.89543 9.10453 6 7.99996 6C6.89539 6 5.99996 6.89543 5.99996 8C5.99996 9.10457 6.89539 10 7.99996 10ZM7.99996 11.5C9.93295 11.5 11.5 9.933 11.5 8C11.5 6.067 9.93295 4.5 7.99996 4.5C6.06696 4.5 4.49996 6.067 4.49996 8C4.49996 9.933 6.06696 11.5 7.99996 11.5Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.40917 14.5H8.59082L8.64285 13.6676C8.68604 12.9765 9.12642 12.4062 9.72215 12.1591C10.3207 11.9109 11.0352 12.0054 11.5529 12.4622L12.1784 13.014L13.0139 12.1785L12.4622 11.5531C12.0053 11.0354 11.9109 10.3208 12.1591 9.72222C12.4062 9.12646 12.9765 8.68604 13.6676 8.64285L14.5 8.59082V7.40918L13.6676 7.35715C12.9765 7.31396 12.4062 6.87355 12.1591 6.27781C11.9109 5.67926 12.0053 4.9647 12.4622 4.44695L13.0139 3.82163L12.1784 2.98608L11.553 3.53784C11.0353 3.99467 10.3207 4.0891 9.72218 3.84089C9.12644 3.59384 8.68604 3.02347 8.64285 2.33241L8.59082 1.5H7.40917L7.35715 2.33236C7.31396 3.02345 6.87354 3.59384 6.27778 3.8409C5.67921 4.08913 4.96463 3.99471 4.44686 3.53785L3.82153 2.98609L2.98598 3.82164L3.53784 4.44708C3.99465 4.9648 4.08908 5.67931 3.84088 6.27784C3.59384 6.87357 3.02348 7.31396 2.33245 7.35715L1.5 7.40917V8.59082L2.33241 8.64285C3.02346 8.68604 3.59383 9.12643 3.84089 9.72218C4.0891 10.3207 3.99467 11.0353 3.53784 11.553L2.98597 12.1785L3.82152 13.014L4.44696 12.4622C4.9647 12.0053 5.67925 11.9109 6.27781 12.1591C6.87356 12.4062 7.31396 12.9765 7.35715 13.6676L7.40917 14.5ZM4.51386 14.3779C4.57751 14.3386 4.63866 14.2934 4.69655 14.2424L5.4394 13.5869C5.51167 13.5231 5.61418 13.5078 5.70322 13.5447C5.79219 13.5816 5.85406 13.665 5.86007 13.7612L5.92186 14.7498C5.92668 14.8269 5.93797 14.902 5.95519 14.9748C5.96527 15.0175 5.9774 15.0593 5.99145 15.1002C6.17209 15.6264 6.67094 16 7.2526 16H8.7474C9.32903 16 9.82785 15.6264 10.0085 15.1003C10.0226 15.0594 10.0347 15.0175 10.0448 14.9749C10.062 14.9021 10.0733 14.8269 10.0781 14.7498L10.1399 13.7611C10.1459 13.665 10.2078 13.5816 10.2967 13.5447C10.3858 13.5078 10.4882 13.5232 10.5605 13.5869L11.3033 14.2424C11.3612 14.2935 11.4224 14.3387 11.4861 14.378C11.5234 14.401 11.5615 14.422 11.6004 14.441C12.1001 14.6852 12.717 14.5967 13.1283 14.1854L14.1853 13.1284C14.5966 12.7171 14.6851 12.1002 14.4408 11.6004C14.4218 11.5616 14.4009 11.5234 14.3779 11.4862C14.3385 11.4225 14.2934 11.3614 14.2423 11.3035L13.5869 10.5607C13.5231 10.4884 13.5077 10.3859 13.5447 10.2968C13.5816 10.2078 13.665 10.1459 13.7612 10.1399L14.7498 10.0781C14.8269 10.0733 14.902 10.062 14.9748 10.0448C15.0174 10.0347 15.0593 10.0226 15.1002 10.0086C15.6263 9.82795 16 9.32909 16 8.7474V7.2526C16 6.67093 15.6264 6.17209 15.1002 5.99144C15.0593 5.9774 15.0175 5.96527 14.9748 5.95519C14.902 5.93797 14.8269 5.92668 14.7498 5.92186L13.7612 5.86007C13.665 5.85406 13.5816 5.79219 13.5447 5.70321C13.5078 5.61417 13.5231 5.51166 13.5869 5.43938L14.2423 4.69666C14.2934 4.63873 14.3386 4.57754 14.3779 4.51384C14.4009 4.47658 14.4219 4.43846 14.4409 4.39963C14.6851 3.89987 14.5966 3.28297 14.1853 2.87168L13.1283 1.8147C12.717 1.40342 12.1001 1.31487 11.6004 1.55913C11.5615 1.57811 11.5234 1.5991 11.4861 1.6221C11.4224 1.66142 11.3613 1.70662 11.3033 1.75773L10.5606 2.41309C10.4883 2.47686 10.3858 2.49223 10.2968 2.4553C10.2078 2.41841 10.1459 2.33497 10.1399 2.23884L10.0781 1.25016C10.0733 1.17312 10.062 1.09795 10.0448 1.02516C10.0347 0.982504 10.0226 0.940667 10.0085 0.899751C9.8279 0.373623 9.32906 0 8.7474 0H7.2526C6.67091 0 6.17205 0.373663 5.99142 0.899834C5.97738 0.940737 5.96526 0.982562 5.95518 1.0252C5.93797 1.09798 5.92668 1.17314 5.92186 1.25016L5.86007 2.2388C5.85406 2.33495 5.79218 2.41842 5.70318 2.45532C5.61412 2.49225 5.51159 2.47688 5.43929 2.41309L4.69656 1.75774C4.63865 1.70665 4.57748 1.66146 4.51381 1.62215C4.47655 1.59915 4.43844 1.57817 4.39962 1.55919C3.89985 1.31487 3.2829 1.40341 2.87159 1.81472L1.81461 2.8717C1.40332 3.28298 1.31477 3.89987 1.55903 4.39963C1.57802 4.43848 1.59902 4.47662 1.62203 4.5139C1.66134 4.57758 1.70653 4.63876 1.75763 4.69667L2.41308 5.43951C2.47684 5.51177 2.4922 5.61425 2.45529 5.70326C2.4184 5.79221 2.33499 5.85406 2.23888 5.86007L1.25016 5.92186C1.17311 5.92668 1.09792 5.93797 1.02512 5.9552C0.982451 5.96529 0.940602 5.97742 0.899674 5.99147C0.373587 6.17215 0 6.67097 0 7.2526V8.7474C0 9.32905 0.373619 9.82789 0.899741 10.0085C0.940658 10.0226 0.982497 10.0347 1.02516 10.0448C1.09795 10.062 1.17312 10.0733 1.25016 10.0781L2.23884 10.1399C2.33497 10.1459 2.41841 10.2078 2.4553 10.2968C2.49222 10.3858 2.47686 10.4883 2.41309 10.5606L1.75762 11.3034C1.70654 11.3613 1.66137 11.4225 1.62207 11.4861C1.59906 11.5234 1.57806 11.5615 1.55907 11.6004C1.31475 12.1001 1.40328 12.7171 1.81459 13.1284L2.87157 14.1854C3.28289 14.5967 3.89985 14.6852 4.39963 14.4409C4.43846 14.4219 4.47659 14.4009 4.51386 14.3779Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Settings</span>
              </button>
              
              <button class="nav-item" type="button" id="switchSandboxAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 6C0 5.6898 0.162753 5.40235 0.428746 5.24275L7.07125 1.25725C7.3518 1.08892 7.67283 1 8 1C8.32717 1 8.6482 1.08892 8.92875 1.25725L15.5713 5.24275C15.8372 5.40235 16 5.6898 16 6C16 6.3102 15.8372 6.59765 15.5713 6.75725L8.92875 10.7428C8.6482 10.9111 8.32717 11 8 11C7.67283 11 7.3518 10.9111 7.07125 10.7428L0.428746 6.75725C0.162753 6.59765 0 6.3102 0 6ZM7.89445 9.37076L2.27651 6L7.89445 2.62924C7.92633 2.61011 7.96282 2.6 8 2.6C8.03718 2.6 8.07367 2.61011 8.10555 2.62924L13.7235 6L8.10555 9.37076C8.07367 9.38989 8.03718 9.4 8 9.4C7.96281 9.4 7.92633 9.38989 7.89445 9.37076Z" fill="currentColor"/>
                    <path fill="currentColor" d="M1.43422 9.82811C1.06312 9.58833 0.5679 9.69478 0.328114 10.0659C0.0883268 10.437 0.194776 10.9322 0.565875 11.172L6.69425 15.1319C7.06621 15.3722 7.49965 15.5 7.9425 15.5H8.0576C8.50045 15.5 8.93388 15.3722 9.30584 15.1319L15.4342 11.172C15.8053 10.9322 15.9118 10.437 15.672 10.0659C15.4322 9.69478 14.937 9.58833 14.5659 9.82811L8.4375 13.788C8.32429 13.8611 8.19238 13.9 8.0576 13.9H7.9425C7.80772 13.9 7.6758 13.8611 7.5626 13.788L1.43422 9.82811Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Switch to sandbox</span>
              </button>
              
              <button class="nav-item" type="button" id="createAccountAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.25C8.48325 0.25 8.875 0.641751 8.875 1.125V7.125H14.875C15.3582 7.125 15.75 7.51675 15.75 8C15.75 8.48325 15.3582 8.875 14.875 8.875H8.875V14.875C8.875 15.3582 8.48325 15.75 8 15.75C7.51675 15.75 7.125 15.3582 7.125 14.875V8.875H1.125C0.641751 8.875 0.25 8.48325 0.25 8C0.25 7.51675 0.641751 7.125 1.125 7.125H7.125V1.125C7.125 0.641751 7.51675 0.25 8 0.25Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Create account</span>
              </button>
            </div>
          ` : `
            <!-- Non-Org Account: Show only actions -->
            <div class="account-actions">
              <button class="nav-item settings-button" type="button">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99996 10C9.10453 10 9.99996 9.10457 9.99996 8C9.99996 6.89543 9.10453 6 7.99996 6C6.89539 6 5.99996 6.89543 5.99996 8C5.99996 9.10457 6.89539 10 7.99996 10ZM7.99996 11.5C9.93295 11.5 11.5 9.933 11.5 8C11.5 6.067 9.93295 4.5 7.99996 4.5C6.06696 4.5 4.49996 6.067 4.49996 8C4.49996 9.933 6.06696 11.5 7.99996 11.5Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.40917 14.5H8.59082L8.64285 13.6676C8.68604 12.9765 9.12642 12.4062 9.72215 12.1591C10.3207 11.9109 11.0352 12.0054 11.5529 12.4622L12.1784 13.014L13.0139 12.1785L12.4622 11.5531C12.0053 11.0354 11.9109 10.3208 12.1591 9.72222C12.4062 9.12646 12.9765 8.68604 13.6676 8.64285L14.5 8.59082V7.40918L13.6676 7.35715C12.9765 7.31396 12.4062 6.87355 12.1591 6.27781C11.9109 5.67926 12.0053 4.9647 12.4622 4.44695L13.0139 3.82163L12.1784 2.98608L11.553 3.53784C11.0353 3.99467 10.3207 4.0891 9.72218 3.84089C9.12644 3.59384 8.68604 3.02347 8.64285 2.33241L8.59082 1.5H7.40917L7.35715 2.33236C7.31396 3.02345 6.87354 3.59384 6.27778 3.8409C5.67921 4.08913 4.96463 3.99471 4.44686 3.53785L3.82153 2.98609L2.98598 3.82164L3.53784 4.44708C3.99465 4.9648 4.08908 5.67931 3.84088 6.27784C3.59384 6.87357 3.02348 7.31396 2.33245 7.35715L1.5 7.40917V8.59082L2.33241 8.64285C3.02346 8.68604 3.59383 9.12643 3.84089 9.72218C4.0891 10.3207 3.99467 11.0353 3.53784 11.553L2.98597 12.1785L3.82152 13.014L4.44696 12.4622C4.9647 12.0053 5.67925 11.9109 6.27781 12.1591C6.87356 12.4062 7.31396 12.9765 7.35715 13.6676L7.40917 14.5ZM4.51386 14.3779C4.57751 14.3386 4.63866 14.2934 4.69655 14.2424L5.4394 13.5869C5.51167 13.5231 5.61418 13.5078 5.70322 13.5447C5.79219 13.5816 5.85406 13.665 5.86007 13.7612L5.92186 14.7498C5.92668 14.8269 5.93797 14.902 5.95519 14.9748C5.96527 15.0175 5.9774 15.0593 5.99145 15.1002C6.17209 15.6264 6.67094 16 7.2526 16H8.7474C9.32903 16 9.82785 15.6264 10.0085 15.1003C10.0226 15.0594 10.0347 15.0175 10.0448 14.9749C10.062 14.9021 10.0733 14.8269 10.0781 14.7498L10.1399 13.7611C10.1459 13.665 10.2078 13.5816 10.2967 13.5447C10.3858 13.5078 10.4882 13.5232 10.5605 13.5869L11.3033 14.2424C11.3612 14.2935 11.4224 14.3387 11.4861 14.378C11.5234 14.401 11.5615 14.422 11.6004 14.441C12.1001 14.6852 12.717 14.5967 13.1283 14.1854L14.1853 13.1284C14.5966 12.7171 14.6851 12.1002 14.4408 11.6004C14.4218 11.5616 14.4009 11.5234 14.3779 11.4862C14.3385 11.4225 14.2934 11.3614 14.2423 11.3035L13.5869 10.5607C13.5231 10.4884 13.5077 10.3859 13.5447 10.2968C13.5816 10.2078 13.665 10.1459 13.7612 10.1399L14.7498 10.0781C14.8269 10.0733 14.902 10.062 14.9748 10.0448C15.0174 10.0347 15.0593 10.0226 15.1002 10.0086C15.6263 9.82795 16 9.32909 16 8.7474V7.2526C16 6.67093 15.6264 6.17209 15.1002 5.99144C15.0593 5.9774 15.0175 5.96527 14.9748 5.95519C14.902 5.93797 14.8269 5.92668 14.7498 5.92186L13.7612 5.86007C13.665 5.85406 13.5816 5.79219 13.5447 5.70321C13.5078 5.61417 13.5231 5.51166 13.5869 5.43938L14.2423 4.69666C14.2934 4.63873 14.3386 4.57754 14.3779 4.51384C14.4009 4.47658 14.4219 4.43846 14.4409 4.39963C14.6851 3.89987 14.5966 3.28297 14.1853 2.87168L13.1283 1.8147C12.717 1.40342 12.1001 1.31487 11.6004 1.55913C11.5615 1.57811 11.5234 1.5991 11.4861 1.6221C11.4224 1.66142 11.3613 1.70662 11.3033 1.75773L10.5606 2.41309C10.4883 2.47686 10.3858 2.49223 10.2968 2.4553C10.2078 2.41841 10.1459 2.33497 10.1399 2.23884L10.0781 1.25016C10.0733 1.17312 10.062 1.09795 10.0448 1.02516C10.0347 0.982504 10.0226 0.940667 10.0085 0.899751C9.8279 0.373623 9.32906 0 8.7474 0H7.2526C6.67091 0 6.17205 0.373663 5.99142 0.899834C5.97738 0.940737 5.96526 0.982562 5.95518 1.0252C5.93797 1.09798 5.92668 1.17314 5.92186 1.25016L5.86007 2.2388C5.85406 2.33495 5.79218 2.41842 5.70318 2.45532C5.61412 2.49225 5.51159 2.47688 5.43929 2.41309L4.69656 1.75774C4.63865 1.70665 4.57748 1.66146 4.51381 1.62215C4.47655 1.59915 4.43844 1.57817 4.39962 1.55919C3.89985 1.31487 3.2829 1.40341 2.87159 1.81472L1.81461 2.8717C1.40332 3.28298 1.31477 3.89987 1.55903 4.39963C1.57802 4.43848 1.59902 4.47662 1.62203 4.5139C1.66134 4.57758 1.70653 4.63876 1.75763 4.69667L2.41308 5.43951C2.47684 5.51177 2.4922 5.61425 2.45529 5.70326C2.4184 5.79221 2.33499 5.85406 2.23888 5.86007L1.25016 5.92186C1.17311 5.92668 1.09792 5.93797 1.02512 5.9552C0.982451 5.96529 0.940602 5.97742 0.899674 5.99147C0.373587 6.17215 0 6.67097 0 7.2526V8.7474C0 9.32905 0.373619 9.82789 0.899741 10.0085C0.940658 10.0226 0.982497 10.0347 1.02516 10.0448C1.09795 10.062 1.17312 10.0733 1.25016 10.0781L2.23884 10.1399C2.33497 10.1459 2.41841 10.2078 2.4553 10.2968C2.49222 10.3858 2.47686 10.4883 2.41309 10.5606L1.75762 11.3034C1.70654 11.3613 1.66137 11.4225 1.62207 11.4861C1.59906 11.5234 1.57806 11.5615 1.55907 11.6004C1.31475 12.1001 1.40328 12.7171 1.81459 13.1284L2.87157 14.1854C3.28289 14.5967 3.89985 14.6852 4.39963 14.4409C4.43846 14.4219 4.47659 14.4009 4.51386 14.3779Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Settings</span>
              </button>
              
              <button class="nav-item" type="button" id="switchSandboxAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 6C0 5.6898 0.162753 5.40235 0.428746 5.24275L7.07125 1.25725C7.3518 1.08892 7.67283 1 8 1C8.32717 1 8.6482 1.08892 8.92875 1.25725L15.5713 5.24275C15.8372 5.40235 16 5.6898 16 6C16 6.3102 15.8372 6.59765 15.5713 6.75725L8.92875 10.7428C8.6482 10.9111 8.32717 11 8 11C7.67283 11 7.3518 10.9111 7.07125 10.7428L0.428746 6.75725C0.162753 6.59765 0 6.3102 0 6ZM7.89445 9.37076L2.27651 6L7.89445 2.62924C7.92633 2.61011 7.96282 2.6 8 2.6C8.03718 2.6 8.07367 2.61011 8.10555 2.62924L13.7235 6L8.10555 9.37076C8.07367 9.38989 8.03718 9.4 8 9.4C7.96281 9.4 7.92633 9.38989 7.89445 9.37076Z" fill="currentColor"/>
                    <path fill="currentColor" d="M1.43422 9.82811C1.06312 9.58833 0.5679 9.69478 0.328114 10.0659C0.0883268 10.437 0.194776 10.9322 0.565875 11.172L6.69425 15.1319C7.06621 15.3722 7.49965 15.5 7.9425 15.5H8.0576C8.50045 15.5 8.93388 15.3722 9.30584 15.1319L15.4342 11.172C15.8053 10.9322 15.9118 10.437 15.672 10.0659C15.4322 9.69478 14.937 9.58833 14.5659 9.82811L8.4375 13.788C8.32429 13.8611 8.19238 13.9 8.0576 13.9H7.9425C7.80772 13.9 7.6758 13.8611 7.5626 13.788L1.43422 9.82811Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Switch to sandbox</span>
              </button>
              
              <button class="nav-item" type="button" id="createAccountAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.25C8.48325 0.25 8.875 0.641751 8.875 1.125V7.125H14.875C15.3582 7.125 15.75 7.51675 15.75 8C15.75 8.48325 15.3582 8.875 14.875 8.875H8.875V14.875C8.875 15.3582 8.48325 15.75 8 15.75C7.51675 15.75 7.125 15.3582 7.125 14.875V8.875H1.125C0.641751 8.875 0.25 8.48325 0.25 8C0.25 7.51675 0.641751 7.125 1.125 7.125H7.125V1.125C7.125 0.641751 7.51675 0.25 8 0.25Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="nav-item-label">Create account</span>
              </button>
            </div>
          `}
        </div>
      </div>
    `;
    
    // Ensure all account avatars have correct styling
    setTimeout(() => {
      // Fix trigger button avatar to match dropdown
      const triggerAvatar = this.container.querySelector('.account-switcher-trigger .account-avatar:not(.all-accounts-avatar)');
      if (triggerAvatar && !this.options.currentAccount.isAggregate) {
        const uniqueColors = this.generateUniqueColors(this.options.accounts);
        const correctColor = this.options.currentAccount.color || uniqueColors[this.options.currentAccount.id];
        if (correctColor) {
          triggerAvatar.style.setProperty('background-color', correctColor, 'important');
        }
      }
      
      // Fix dropdown account avatars
      const accountAvatars = this.container.querySelectorAll('.account-item .account-avatar:not(.all-accounts-avatar)');
      accountAvatars.forEach((avatar, index) => {
        const accountId = avatar.closest('[data-account-id]')?.dataset.accountId;
        if (accountId) {
          const account = this.options.accounts.find(acc => acc.id === accountId);
          const uniqueColors = this.generateUniqueColors(this.options.accounts);
          const correctColor = account?.color || uniqueColors[accountId];
          if (correctColor) {
            avatar.style.setProperty('background-color', correctColor, 'important');
          }
        }
      });
      
      // Fix all-accounts avatars
      const allAccountsAvatars = this.container.querySelectorAll('.all-accounts-avatar');
      allAccountsAvatars.forEach(avatar => {
        avatar.removeAttribute('style');
        avatar.style.setProperty('background-color', 'var(--neutral-50)', 'important');
        avatar.style.setProperty('background', 'var(--neutral-50)', 'important');
        avatar.style.setProperty('color', 'var(--neutral-600)', 'important');
      });
    }, 10);
    
    // Immediate fix for all-accounts avatars to prevent red flash
    const immediateAllAccountsAvatars = this.container.querySelectorAll('.all-accounts-avatar');
    immediateAllAccountsAvatars.forEach((avatar) => {
      // Try CSS variable first, then fallback to hardcoded value
      avatar.style.setProperty('background-color', 'var(--neutral-50)', 'important');
      avatar.style.setProperty('background', 'var(--neutral-50)', 'important');
      avatar.style.setProperty('color', 'var(--neutral-600)', 'important');
      
      // If CSS variable didn't work, use hardcoded color (--neutral-50 fallback)
      const currentBg = window.getComputedStyle(avatar).backgroundColor;
      if (currentBg === 'rgb(225, 29, 72)' || currentBg.includes('225')) {
        avatar.style.setProperty('background-color', 'var(--neutral-50)', 'important');
        avatar.style.setProperty('background', 'var(--neutral-50)', 'important');
      }
    });
    
    this.addStyles();
    
    // Force remove any purple backgrounds after render
    setTimeout(() => {
      this.forceRemoveActiveBackgrounds();
    }, 0);
  }
  
  addStyles() {
    if (document.getElementById('account-switcher-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'account-switcher-styles';
    styles.textContent = `
      .account-switcher {
        position: relative;
        display: inline-block;
      }
      
      .account-switcher-trigger {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: white;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 280px;
      }
      
      .account-switcher-trigger:hover {
        border-color: var(--color-border-strong);
        background: var(--color-background);
      }
      
      /* Persist hover state when popover is open */
      .account-switcher-trigger.popover-open {
        border-color: var(--color-border-strong);
        background: var(--color-background);
      }
      
      .account-switcher-trigger:disabled {
        cursor: default !important;
        background: white !important;
        border-color: var(--color-border) !important;
        opacity: 1;
      }
      
      .account-switcher-trigger:disabled:hover {
        border-color: var(--color-border) !important;
        background: white !important;
      }
      
      .account-switcher-disabled .account-switcher-trigger {
        cursor: default;
      }
      
      .account-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }
      
      .account-avatar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      .avatar-initials {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        color: white;
        line-height: 1;
      }
      

       
       /* Sandbox avatars in popover - match account avatar styling */
       .sandbox-avatar {
         position: relative;
         display: flex;
         align-items: center;
         justify-content: center;
         width: 24px;
         height: 24px;
         border-radius: 4px;
         flex-shrink: 0;
       }
       
       .sandbox-avatar .avatar-initials {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-12);
         font-weight: var(--font-weight-medium);
         color: white;
         line-height: 1;
       }
       
       /* Sandbox section styling */
       .sandbox-section {
         margin-bottom: 16px;
       }
       
       .sandbox-section:last-of-type {
         margin-bottom: 8px;
         padding-bottom: 8px;
         border-bottom: 1px solid var(--neutral-50);
       }
       
       .sandbox-section-label {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-11);
         font-weight: var(--font-weight-medium);
         color: var(--neutral-500);
         text-transform: uppercase;
         letter-spacing: 0.02em;
         margin-bottom: 8px;
         padding: 0 4px;
       }
       
       /* Sandbox scope indicators */
       .sandbox-scope-indicator {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-11);
         font-weight: var(--font-weight-medium);
         color: var(--neutral-400);
         margin-left: auto;
         padding-left: 8px;
         flex-shrink: 0;
       }
       
       /* Organization sandbox styling */
       .org-sandbox .sandbox-scope-indicator {
         color: var(--blue-500);
       }
       
       /* Account sandbox styling */
       .account-sandbox .sandbox-scope-indicator {
         color: var(--purple-500);
       }
       
       
      
      .account-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        min-width: 0;
        flex: 1;
      }
      
      .account-name {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      

      
      .account-type {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued);
        text-transform: capitalize;
        line-height: var(--line-height-16);
        letter-spacing: 0;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* Variant-specific styles */
      .account-switcher-1-line .account-name {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-semibold);
        color: var(--neutral-900);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      .account-switcher-2-line .account-name {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
      }
      
      .account-switcher-2-line .account-type {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      /* Trigger button should use label/medium emphasized typography */
      .account-switcher-trigger .account-name {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text) !important;
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
      }
      
      .account-switcher-trigger .account-type {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued) !important;
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      /* Ensure text is not greyed out - override any conflicting styles */
      .account-switcher-trigger .account-name,
      .account-switcher:not(.account-switcher-disabled) .account-switcher-trigger .account-name {
        color: var(--neutral-900) !important;
      }
      
      .account-switcher-trigger .account-type,
      .account-switcher:not(.account-switcher-disabled) .account-switcher-trigger .account-type {
        color: var(--neutral-500) !important;
      }
      
      .account-switcher-caret {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--neutral-600);
        transition: transform 0.2s ease;
      }
      
      .account-switcher.open .account-switcher-caret {
        transform: rotate(180deg);
      }
      
      .account-switcher-dropdown {
        position: fixed;
        min-width: 284px;
        max-width: 400px;
        max-height: 95vh;
        background: white;
        border: none;
        border-radius: 8px;
        box-shadow: 0px 15px 35px 0px rgba(48, 49, 61, 0.08), 0px 5px 15px 0px rgba(0, 0, 0, 0.12);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        z-index: 9999;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      /* Ensure dropdown container itself doesn't respond to hover */
      .account-switcher-dropdown:hover {
        background: white !important;
      }
      
      .account-switcher.open .account-switcher-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .account-list {
        padding: 16px 8px; /* Additional 8px top and bottom padding (16px total), 8px sides */
        border-bottom: 1px solid var(--color-border-subtle);
        flex: 1; /* Allow to grow and fill available space */
        display: flex;
        flex-direction: column;
        min-height: 0; /* Allow flex item to shrink below content size */
      }
      
      .account-items-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden; /* Prevent horizontal scrolling */
        min-height: 0; /* Allow flex item to shrink below content size */
        
        /* Custom scrollbar styling */
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: rgba(0, 0, 0, 0.15) transparent; /* Firefox */
      }
      
      /* Webkit scrollbar styling (Chrome, Safari, Edge) */
      .account-items-container::-webkit-scrollbar {
        width: 6px;
      }
      
      .account-items-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .account-items-container::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
        transition: background 0.2s ease;
      }
      
      .account-items-container::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.25);
      }
      
      /* Account details container */
      .account-details {
        flex: 1;
        min-width: 0; /* Allow shrinking below content size */
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      /* Account name and type with text truncation */
      .account-name,
      .account-type {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        width: 100%;
      }
      
      /* Remove hover effects from container elements */
      .account-switcher-dropdown .account-list:hover,
      .account-switcher-dropdown .account-actions:hover,
      .account-switcher-dropdown .account-items-container:hover {
        background: transparent !important;
      }
      
      /* Override any global popover hover styles specifically for account switcher */
      .account-switcher-dropdown .popover-option,
      .account-switcher-dropdown .popover-option:hover,
      .account-switcher-dropdown .popover-option:focus {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Also override for sandbox popovers (regular .popover class) */
      .popover .popover-option,
      .popover .popover-option:hover,
      .popover .popover-option:focus {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Add floating hover for sandbox popovers */
      .popover .popover-option::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: transparent;
        border-radius: 8px;
        transition: background-color var(--transition-fast);
        z-index: 0;
        pointer-events: none;
        display: block;
      }
      
      .popover .popover-option:hover::before {
        background-color: var(--neutral-50);
      }
      
      /* Ensure sandbox popover content is above hover pseudo-element */
      .popover .popover-option .nav-item-icon,
      .popover .popover-option .nav-item-label,
      .popover .popover-option .sandbox-avatar {
        position: relative;
        z-index: 1;
      }
      
      /* Ensure popover containers don't have hover effects */
      .popover:hover {
        background: white !important;
      }
      
      .account-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 32px;
        padding: 4px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        position: relative;
      }
      
      /* Only add hover effects to non-active account items */
      .account-switcher-dropdown .account-item:not(.active)::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: transparent;
        border-radius: 8px;
        transition: background-color var(--transition-fast);
        z-index: 0;
        pointer-events: none;
        display: block;
      }
      
      .account-switcher-dropdown .account-item:not(.active):hover::before {
        background-color: var(--neutral-50);
      }
      
      /* Override any existing account-item hover backgrounds */
      .account-switcher-dropdown .account-item:hover {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      .account-item:hover {
        background: transparent;
      }
      
      /* Position account item content above hover pseudo-element */
      .account-item .account-avatar,
      .account-item .account-details,
      .account-item .account-check {
        position: relative;
        z-index: 1;
      }
      
      .account-item:hover .account-name {
        color: var(--neutral-900);
      }
      
      .account-item:hover .account-type {
        color: var(--color-text-subdued);
      }
      
      .account-item.active {
        background: transparent !important;
      }
      
      .account-item.active::before {
        background-color: transparent !important;
      }
      
       /* Active account items should not have hover backgrounds */
       .account-switcher .account-item.active::before,
       .account-switcher-dropdown .account-item.active::before {
         background-color: transparent !important;
       }
      
      .account-item.active .account-name {
        color: var(--brand-600);
        font-weight: var(--font-weight-semibold);
      }
      
      .account-item.active .account-type {
        color: var(--color-text-subdued);
      }
      
      /* Override active account item hover to prevent background change */
      .account-switcher-dropdown .account-item.active:hover {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      .account-switcher-dropdown .account-item.active:hover .account-name {
        color: var(--brand-600);
        font-weight: var(--font-weight-semibold);
      }
      
      .account-switcher-dropdown .account-item.active:hover .account-type {
        color: var(--color-text-subdued);
      }
      
      .account-switcher-disabled .account-name {
        color: var(--color-text-muted);
      }
      
      .account-switcher-disabled .account-type {
        color: var(--color-text-disabled);
      }
      
      .account-check {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        color: var(--brand-600);
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      
      .account-check svg {
        width: 16px;
        height: 16px;
        color: var(--brand-600);
      }
      
      .account-divider {
        height: 1px;
        background: var(--neutral-50);
        margin: 8px 12px;
      }
      
      .account-switcher .account-item.all-accounts .account-avatar.all-accounts-avatar {
        background: var(--neutral-50) !important;
        color: var(--neutral-600) !important;
      }
      
      .account-switcher .account-item.all-accounts:hover .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-600) !important;
      }
      
      /* All accounts active state */
      .account-switcher .account-item.all-accounts.active .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-600) !important;
      }
      
      .account-switcher .account-item.all-accounts.active:hover .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-600) !important;
      }
      
      /* Fallback override for stubborn CSS conflicts */
      [class*="all-accounts-avatar"] {
        background: var(--neutral-50) !important;
        background-color: var(--neutral-50) !important;
      }
      
      /* All accounts avatar in trigger button */
      .account-switcher-trigger .all-accounts-avatar {
        background: var(--neutral-50) !important;
        color: var(--neutral-600) !important;
      }
      
      .account-switcher-trigger:hover .all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-600) !important;
      }
      
      /* Persist all-accounts avatar hover state when popover is open */
      .account-switcher-trigger.popover-open .all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-600) !important;
      }
      
      /* Account switcher tooltip for collapsed state */
      .account-switcher-tooltip {
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: 8px;
        padding: 4px 8px;
        background: var(--neutral-900);
        color: white;
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        line-height: var(--line-height-16);
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        pointer-events: none;
        z-index: 99999;
        box-shadow: var(--shadow-md);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .account-switcher-tooltip::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -4px;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 4px 4px 4px 0;
        border-color: transparent var(--neutral-900) transparent transparent;
      }
      
      /* Show tooltip on hover when nav panel is collapsed */
      .nav-panel.collapsed .account-switcher-trigger:hover .account-switcher-tooltip {
        opacity: 1;
        visibility: visible;
      }
      
      /* Hide tooltip when dropdown is open */
      .nav-panel.collapsed .account-switcher.open .account-switcher-tooltip {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* Account Actions Section */
      .account-actions {
        padding: 16px 8px; /* Additional 8px top and bottom padding (16px total), 8px sides */
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 8px; /* 8px row gap between buttons */
        width: 100%;
        box-sizing: border-box;
        flex-shrink: 0; /* Don't shrink the actions section */
      }
      
      /* Account actions nav-item buttons */
      .account-actions .nav-item,
      .account-actions button.nav-item {
        position: relative;
        display: flex !important;
        align-items: center;
        width: 100% !important;
        max-width: none !important;
        min-width: 100% !important;
        height: 24px; /* Match nav panel button height */
        padding: 4px 12px; /* Match account-item padding for consistent full-width */
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        text-decoration: none;
        color: inherit;
        font-family: inherit;
        box-sizing: border-box !important;
      }
      
      /* Floating hover effect - match nav panel */
      .account-actions .nav-item::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: transparent;
        border-radius: 8px;
        transition: background-color var(--transition-fast);
        z-index: 0;
        pointer-events: none;
        display: block;
      }
      
      .account-actions .nav-item:hover::before {
        background-color: var(--neutral-50);
      }
      
      .account-actions .nav-item .nav-item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: var(--color-text-muted);
        flex-shrink: 0;
        margin: 0;
        position: relative;
        z-index: 1;
      }
      
      .account-actions .nav-item .nav-item-icon svg {
        width: 16px;
        height: 16px;
        stroke: none;
      }
      
      .account-actions .nav-item .nav-item-label {
        margin-left: 8px; /* Match nav panel spacing */
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
        flex: 1;
        position: relative;
        z-index: 1;
        text-align: left; /* Ensure left alignment */
      }
      
             /* Popover Styles */
       .popover {
         position: fixed;
         background: white;
         border: 1px solid rgba(0, 39, 77, 0.08);
         border-radius: 8px;
         box-shadow: 0px 15px 35px 0px rgba(48, 49, 61, 0.08), 0px 5px 15px 0px rgba(0, 0, 0, 0.12);
         padding: 8px;
         opacity: 0;
         visibility: hidden;
         transform: translateX(-4px);
         transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
         z-index: 10000;
         min-width: 284px;
         max-width: 284px;
         top: 0;
         left: 0;
         display: flex;
         flex-direction: column;
       }
      
             .popover.show {
         opacity: 1;
         visibility: visible;
         transform: translateX(0);
       }
      
      .popover-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        color: var(--neutral-900);
        text-decoration: none;
        min-height: 32px;
        width: 100% !important;
        max-width: none !important;
        min-width: 100%;
        box-sizing: border-box;
        position: relative;
      }
      
             /* Override height for nav-item popover options to match nav panel */
       .popover-option.nav-item {
         height: 24px !important;
         min-height: 24px !important;
         max-height: 24px !important;
       }
       
       /* Ensure consistent spacing in structured groups */
       .sandbox-group .popover-option:last-child,
       .management-group .popover-option:last-child {
         margin-bottom: 0 !important;
       }
      
      /* Override global popover option hover styles */
      .account-switcher-dropdown .popover-option:hover {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Add specific hover for account switcher popover options only */
      .account-switcher-dropdown .popover-option::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: transparent;
        border-radius: 8px;
        transition: background-color var(--transition-fast);
        z-index: 0;
        pointer-events: none;
        display: block;
      }
      
      .account-switcher-dropdown .popover-option:hover::before {
        background-color: var(--neutral-50);
      }
      
      .popover-option .nav-item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: var(--color-text-muted);
        flex-shrink: 0;
      }
      
      .popover-option .nav-item-icon svg {
        width: 16px;
        height: 16px;
      }
      
      /* Ensure account switcher popover option content is above hover pseudo-element */
      .account-switcher-dropdown .popover-option .nav-item-icon,
      .account-switcher-dropdown .popover-option .nav-item-label,
      .account-switcher-dropdown .popover-option .sandbox-avatar {
        position: relative;
        z-index: 1;
      }
      
             .popover-option .nav-item-label {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-14);
         font-weight: var(--font-weight-regular);
         color: var(--neutral-900);
         line-height: var(--line-height-20);
         white-space: nowrap;
         margin-left: 0; /* Remove inherited margin to prevent double spacing with gap */
       }
       
       /* Ensure action items are properly displayed in collapsed state */
       .account-switcher-dropdown .action-item {
         min-width: 0 !important;
         flex-shrink: 0 !important;
       }
       
       .account-switcher-dropdown .action-item .nav-item-label {
         flex: 1 !important;
         min-width: 0 !important;
         white-space: nowrap !important;
         overflow: hidden !important;
         text-overflow: ellipsis !important;
       }
       
       /* Override collapsed nav panel hiding - always show labels in account switcher dropdown */
       .nav-panel.collapsed .account-switcher-dropdown .nav-item-label {
         display: block !important;
             }
      
      /* Force full width for all buttons in popovers and account actions */
      .popover button,
      .account-actions button,
      .sandbox-group button,
      .management-group button {
        width: 100% !important;
        max-width: none !important;
        min-width: 100% !important;
        box-sizing: border-box !important;
        display: flex !important;
        height: 24px !important;
        min-height: 24px !important;
        max-height: 24px !important;
      }
       
             /* Sandbox popover group styling */
       .sandbox-group {
         margin-bottom: 8px;
         padding-bottom: 8px;
         border-bottom: 1px solid var(--neutral-50);
         width: 100%;
         display: flex;
         flex-direction: column;
         gap: 8px;
       }
       
       .management-group {
         margin-top: 8px;
         padding-top: 0;
         width: 100%;
         display: flex;
         flex-direction: column;
         gap: 8px;
       }
       
       /* Sandbox popover buttons should match nav panel styling */
       .sandbox-group .popover-option,
       .management-group .popover-option {
         position: relative;
         display: flex;
         align-items: center;
         height: 24px !important;
         min-height: 24px !important;
         max-height: 24px !important;
         padding: 4px 12px;
         background: transparent;
         border: none;
         border-radius: 6px;
         cursor: pointer;
         transition: all var(--transition-fast);
         text-decoration: none;
         color: inherit;
         font-family: inherit;
         margin-bottom: 0 !important;
         width: 100% !important;
         max-width: none !important;
         min-width: 100%;
         box-sizing: border-box;
       }
       
             /* Floating hover effect for sandbox buttons - inherit from general popover-option */
       
       .sandbox-group .popover-option .nav-item-icon,
       .sandbox-group .popover-option .nav-item-label,
       .management-group .popover-option .nav-item-icon,
       .management-group .popover-option .nav-item-label {
         position: relative;
         z-index: 1;
       }
       
       /* FINAL OVERRIDE - This should be the last rule with highest specificity */
       div[class*="account-switcher"] button[class*="account-item"][class*="active"]:not(:hover) {
         background: transparent !important;
         background-color: transparent !important;
       }
       
             div[class*="account-switcher"] button[class*="account-item"][class*="active"]:not(:hover)::before {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Account Search */
      .account-search-container {
        padding: 8px 12px;
        margin-bottom: 8px;
        flex-shrink: 0; /* Don't shrink the search container */
      }
      
      .account-search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      
      .search-icon {
        position: absolute;
        left: 8px;
        color: var(--neutral-400);
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
      }
      
      .account-search-input {
        width: 100%;
        height: 32px;
        padding: 0 12px 0 32px;
        border: 1px solid var(--neutral-200);
        border-radius: 6px;
        background: white;
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        color: var(--neutral-600);
        outline: none;
        transition: border-color 0.15s ease;
      }
      
      .account-search-input:focus {
        border-color: var(--brand-300);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
      
      .account-search-input::placeholder {
        color: var(--neutral-400);
      }
      
      /* Hide filtered accounts */
      .account-item.filtered-hidden {
        display: none !important;
      }
   `;
    
    document.head.appendChild(styles);
  }
  
  positionDropdown() {
    const trigger = this.container.querySelector('.account-switcher-trigger');
    const dropdown = this.container.querySelector('.account-switcher-dropdown');
    
    if (!trigger || !dropdown) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    
    // Check if nav panel is collapsed (narrow width indicates collapsed state)
    const navPanel = document.getElementById('navPanel');
        const isNavCollapsed = navPanel && navPanel.classList.contains('collapsed');
    
    if (isNavCollapsed) {
      // When nav is collapsed, position dropdown to the right of trigger
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.top;
      const accountCount = this.options.accounts ? this.options.accounts.length : 1;
      const hasActions = true;
      const approximateDropdownHeight = Math.min(
        (accountCount * 56) + (hasActions ? 120 : 0) + 50,
        viewportHeight * 0.9
      );
      
      let newTop = triggerRect.top;
      let maxHeight = Math.min(spaceBelow - 20, viewportHeight * 0.95);
      
      // If dropdown would extend beyond viewport, adjust top position
      if (newTop + approximateDropdownHeight > viewportHeight) {
        newTop = Math.max(20, viewportHeight - approximateDropdownHeight - 20);
        maxHeight = Math.min(viewportHeight - newTop - 20, viewportHeight * 0.95);
      }
      
      const newLeft = triggerRect.right + 8;
      
      dropdown.style.top = `${newTop}px`;
      dropdown.style.left = `${newLeft}px`;
      dropdown.style.position = 'fixed';
      dropdown.style.zIndex = '9999';
      dropdown.style.maxHeight = `${maxHeight}px`;
      dropdown.style.transform = 'translateY(0)'; // Reset any previous transform
      
            // Force styles directly to ensure visibility when nav is collapsed  
      setTimeout(() => {
        // Apply styles to all account elements to ensure visibility
        dropdown.querySelectorAll('.account-name, .account-type, .account-details, .account-item').forEach(el => {
          el.style.setProperty('overflow', 'visible', 'important');
          el.style.setProperty('text-overflow', 'initial', 'important');
          el.style.setProperty('max-width', 'none', 'important');
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
        });
        
        // Ensure dropdown and items have proper width when collapsed
        dropdown.style.setProperty('width', '320px', 'important');
        dropdown.style.setProperty('min-width', '284px', 'important');
        
        // Ensure account items span full width and maintain horizontal layout
        dropdown.querySelectorAll('.account-item').forEach(el => {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('min-width', '100%', 'important');
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'row', 'important');
          el.style.setProperty('align-items', 'center', 'important');
          el.style.setProperty('flex-wrap', 'nowrap', 'important');
        });
        
        // Ensure action items are also properly displayed in collapsed state
        dropdown.querySelectorAll('.action-item').forEach(el => {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('min-width', '100%', 'important');
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'row', 'important');
          el.style.setProperty('align-items', 'center', 'important');
          el.style.setProperty('flex-wrap', 'nowrap', 'important');
        });
        
        // Ensure action item labels are visible
        dropdown.querySelectorAll('.action-item .nav-item-label').forEach(el => {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('white-space', 'nowrap', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
          el.style.setProperty('text-overflow', 'ellipsis', 'important');
        });
        
        // Ensure account details don't wrap and take available space
        dropdown.querySelectorAll('.account-details').forEach(el => {
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'column', 'important');
          el.style.setProperty('flex', '1', 'important');
          el.style.setProperty('min-width', '0', 'important');
        });
        
        // Ensure account names don't wrap horizontally
        dropdown.querySelectorAll('.account-name').forEach(el => {
          el.style.setProperty('white-space', 'nowrap', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
          el.style.setProperty('text-overflow', 'ellipsis', 'important');
        });
      }, 50);
      

    } else {
      // Normal positioning: calculate best position based on available space
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const spacing = 4;
      
      // Get approximate dropdown height (estimate based on content)
      const accountCount = this.options.accounts ? this.options.accounts.length : 1;
      const hasActions = true; // assume actions are present
      const approximateDropdownHeight = Math.min(
        (accountCount * 56) + (hasActions ? 120 : 0) + 50, // 56px per account + actions + padding
        viewportHeight * 0.9 // max 90% of viewport
      );
      
      let newTop, maxHeight;
      
      if (spaceBelow >= approximateDropdownHeight + spacing) {
        // Enough space below - position below trigger
        newTop = triggerRect.bottom + spacing;
        maxHeight = Math.min(spaceBelow - spacing - 20, viewportHeight * 0.95); // 20px buffer
        dropdown.style.transform = 'translateY(0)'; // Reset any previous transform
      } else if (spaceAbove >= approximateDropdownHeight + spacing) {
        // Not enough space below but enough above - position above trigger
        newTop = triggerRect.top - spacing;
        maxHeight = Math.min(spaceAbove - spacing - 20, viewportHeight * 0.95);
        dropdown.style.transform = 'translateY(-100%)';
      } else {
        // Limited space both ways - use the larger space and adjust height
        if (spaceBelow > spaceAbove) {
          newTop = triggerRect.bottom + spacing;
          maxHeight = spaceBelow - spacing - 20;
          dropdown.style.transform = 'translateY(0)'; // Reset any previous transform
        } else {
          newTop = triggerRect.top - spacing;
          maxHeight = spaceAbove - spacing - 20;
          dropdown.style.transform = 'translateY(-100%)';
        }
      }
      
      const newLeft = triggerRect.left;
      
      dropdown.style.top = `${newTop}px`;
      dropdown.style.left = `${newLeft}px`;
      dropdown.style.position = 'fixed';
      dropdown.style.zIndex = '9999';
      dropdown.style.maxHeight = `${maxHeight}px`;
      
            // Reset any inline styles applied in collapsed mode
      setTimeout(() => {
        // Reset dropdown width
        dropdown.style.removeProperty('width');
        dropdown.style.removeProperty('min-width');
        
        [...dropdown.querySelectorAll('.account-name, .account-type, .account-details, .account-item, .action-item')].forEach(el => {
          el.style.removeProperty('overflow');
          el.style.removeProperty('text-overflow');
          el.style.removeProperty('max-width');
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          // Additional properties specific to collapsed mode layout
          el.style.removeProperty('white-space');
          el.style.removeProperty('width');
          el.style.removeProperty('min-width');
          el.style.removeProperty('flex-direction');
          el.style.removeProperty('align-items');
          el.style.removeProperty('flex-wrap');
          el.style.removeProperty('flex');
        });
        
        // Reset action item labels specifically
        [...dropdown.querySelectorAll('.action-item .nav-item-label')].forEach(el => {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          el.style.removeProperty('white-space');
          el.style.removeProperty('overflow');
          el.style.removeProperty('text-overflow');
        });
      }, 50);
    }
  }
  
  bindEvents() {
    // Prevent duplicate event binding
    if (this.eventsBound) {
      return;
    }
    
    // Force remove purple backgrounds from active account items
    this.forceRemoveActiveBackgrounds();
    
    const trigger = this.container.querySelector('.account-switcher-trigger');
    const dropdown = this.container.querySelector('.account-switcher-dropdown');
    const accountItems = this.container.querySelectorAll('.account-item');
    
    // Always add interactive behavior for account switcher
    const hasMultipleAccounts = this.options.accounts.length > 1;
    const isOrgAccount = hasMultipleAccounts;
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    // Account selection (only for org accounts)
    if (isOrgAccount) {
      accountItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const accountId = item.dataset.accountId;
          console.log('🎯 Account item clicked:', accountId);
          this.selectAccount(accountId);
        });
      });
    }
    
    // Account search functionality
    const searchInput = this.container.querySelector('.account-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const accountItems = this.container.querySelectorAll('.account-item:not(.all-accounts)');
        
        accountItems.forEach(item => {
          const accountName = item.querySelector('.account-name')?.textContent?.toLowerCase() || '';
          const shouldShow = searchTerm === '' || accountName.includes(searchTerm);
          
          if (shouldShow) {
            item.classList.remove('filtered-hidden');
          } else {
            item.classList.add('filtered-hidden');
          }
        });
        
        // Also handle aggregate account (organization) item - show it when search is empty or matches "all" or the org name
        const allAccountsItem = this.container.querySelector('.account-item.all-accounts');
        if (allAccountsItem) {
          const aggregateAccount = this.options.accounts.find(acc => acc.isAggregate);
          const orgName = aggregateAccount ? aggregateAccount.name.toLowerCase() : '';
          const shouldShowAll = searchTerm === '' || 
                                'all'.includes(searchTerm) || 
                                orgName.includes(searchTerm);
          if (shouldShowAll) {
            allAccountsItem.classList.remove('filtered-hidden');
          } else {
            allAccountsItem.classList.add('filtered-hidden');
          }
        }
      });
      
      // Clear search when dropdown closes
      if (!this.originalClose) {
        this.originalClose = this.close.bind(this);
      this.close = () => {
        if (searchInput) {
          searchInput.value = '';
          // Reset all items to visible
          const allItems = this.container.querySelectorAll('.account-item');
          allItems.forEach(item => {
            item.classList.remove('filtered-hidden');
          });
        }
          this.originalClose();
      };
      }
    }
    
            // Initialize popover for Switch to sandbox action
    const switchSandboxButton = this.container.querySelector('#switchSandboxAction');
    if (switchSandboxButton && window.Popover) {
      const sandboxPopover = new window.Popover(switchSandboxButton, {
        position: 'right',
        offset: 8,
        trigger: 'hover',
        hideDelay: 100,
        showDelay: 0,
        content: this.generateSandboxContent()
      });
    }

    // Bind settings navigation
    const settingsButton = this.container.querySelector('.settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.navigateToSettings();
      });
    }

    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Reposition dropdown on window resize and scroll
    window.addEventListener('resize', () => {
      if (this.isOpen) {
        this.positionDropdown();
      }
    }, { passive: true });
    
    window.addEventListener('scroll', () => {
      if (this.isOpen) {
        this.positionDropdown();
      }
    }, { passive: true });
    
    // Mark events as bound
    this.eventsBound = true;
  }
  
  bindAccountItemEvents() {
    // Only bind account item click events (for dynamic re-rendering)
    const accountItems = this.container.querySelectorAll('.account-item');
    
    console.log('🔗 bindAccountItemEvents called, found', accountItems.length, 'items');
    
    // Simple approach - just bind click events
    accountItems.forEach(item => {
      console.log('🔗 Binding event to item:', item.dataset.accountId);
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const accountId = item.dataset.accountId;
        console.log('🎯 Dynamic click handler triggered for:', accountId);
        this.selectAccount(accountId);
      });
    });
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      // Use the global popover manager to close other menus and open this one
      if (window.GlobalPopoverManager) {
        window.GlobalPopoverManager.openMenu('account-switcher');
      }
      this.open();
    }
  }
  
  open() {
    this.isOpen = true;
    this.container.querySelector('.account-switcher').classList.add('open');
    
    // Add popover-open class to trigger for persistent hover state
    const trigger = this.container.querySelector('.account-switcher-trigger');
    if (trigger) {
      trigger.classList.add('popover-open');
    }
    
    // Use requestAnimationFrame to ensure positioning happens after any CSS transitions
    requestAnimationFrame(() => {
      this.positionDropdown();
    });
  }
  
  close() {
    this.isOpen = false;
    
    const switcher = this.container.querySelector('.account-switcher');
    if (switcher) {
      switcher.classList.remove('open');
    }
    
    // Note: No need to update popover manager state since it's handled by the manager
    
    // Remove popover-open class from trigger
    const trigger = this.container.querySelector('.account-switcher-trigger');
    if (trigger) {
      trigger.classList.remove('popover-open');
    }
  }
  
  generateSandboxContent() {
    const currentAccount = this.options.currentAccount;
    const isAllAccounts = currentAccount.isAggregate;
    const isOrgAccount = this.options.accounts.length > 1;
    
    // Mock sandbox data - in real implementation, this would come from API
    const orgSandboxes = [
      { id: 'org-dev', name: 'Development', color: '#10B981', initial: 'D' },
      { id: 'org-staging', name: 'Staging', color: '#F59E0B', initial: 'S' },
      { id: 'org-prod', name: 'Production', color: '#EF4444', initial: 'P' }
    ];
    
    const accountSandboxes = [
      { id: 'acc-dev', name: 'Development', color: '#06B6D4', initial: 'D' },
      { id: 'acc-test', name: 'Test', color: '#8B5CF6', initial: 'T' }
    ];
    
    let content = '';
    
    if (isOrgAccount && isAllAccounts) {
      // Show only organization-level sandboxes when viewing "All accounts" in org
      content += `
        <div class="sandbox-section">
          <div class="sandbox-group">
            ${orgSandboxes.map(sandbox => `
              <div class="popover-option nav-item org-sandbox" style="position: relative;" onclick="this.closest('.popover').style.display='none';">
                <div class="nav-item-icon">
                  <div class="sandbox-avatar" style="background-color: ${sandbox.color};">
                    <span class="avatar-initials">${sandbox.initial}</span>
                  </div>
                </div>
                <span class="nav-item-label">${sandbox.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Show only account-level sandboxes (both for specific accounts in orgs and non-org accounts)
      content += `
        <div class="sandbox-section">
          <div class="sandbox-group">
            ${accountSandboxes.map(sandbox => `
              <div class="popover-option nav-item account-sandbox" style="position: relative;" onclick="this.closest('.popover').style.display='none';">
                <div class="nav-item-icon">
                  <div class="sandbox-avatar" style="background-color: ${sandbox.color};">
                    <span class="avatar-initials">${sandbox.initial}</span>
                  </div>
                </div>
                <span class="nav-item-label">${sandbox.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Add management actions
    content += `
      <div class="management-group">
        <div class="popover-option nav-item" style="position: relative;" onclick="this.closest('.popover').style.display='none';">
          <div class="nav-item-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.5C8.27614 0.5 8.5 0.723858 8.5 1V7.5H15C15.2761 7.5 15.5 7.72386 15.5 8C15.5 8.27614 15.2761 8.5 15 8.5H8.5V15C8.5 15.2761 8.27614 15.5 8 15.5C7.72386 15.5 7.5 15.2761 7.5 15V8.5H1C0.723858 8.5 0.5 8.27614 0.5 8C0.5 7.72386 0.723858 7.5 1 7.5H7.5V1C7.5 0.723858 7.72386 0.5 8 0.5Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="nav-item-label">Create</span>
        </div>
        <div class="popover-option nav-item" style="position: relative;" onclick="this.closest('.popover').style.display='none';">
          <div class="nav-item-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99996 10C9.10453 10 9.99996 9.10457 9.99996 8C9.99996 6.89543 9.10453 6 7.99996 6C6.89539 6 5.99996 6.89543 5.99996 8C5.99996 9.10457 6.89539 10 7.99996 10ZM7.99996 11.5C9.93295 11.5 11.5 9.933 11.5 8C11.5 6.067 9.93295 4.5 7.99996 4.5C6.06696 4.5 4.49996 6.067 4.49996 8C4.49996 9.933 6.06696 11.5 7.99996 11.5Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.40917 14.5H8.59082L8.64285 13.6676C8.68604 12.9765 9.12642 12.4062 9.72215 12.1591C10.3207 11.9109 11.0352 12.0054 11.5529 12.4622L12.1784 13.014L13.0139 12.1785L12.4622 11.5531C12.0053 11.0354 11.9109 10.3208 12.1591 9.72222C12.4062 9.12646 12.9765 8.68604 13.6676 8.64285L14.5 8.59082V7.40918L13.6676 7.35715C12.9765 7.31396 12.4062 6.87355 12.1591 6.27781C11.9109 5.67926 12.0053 4.9647 12.4622 4.44695L13.0139 3.82163L12.1784 2.98608L11.553 3.53784C11.0353 3.99467 10.3207 4.0891 9.72218 3.84089C9.12644 3.59384 8.68604 3.02347 8.64285 2.33241L8.59082 1.5H7.40917L7.35715 2.33236C7.31396 3.02345 6.87354 3.59384 6.27778 3.8409C5.67921 4.08913 4.96463 3.99471 4.44686 3.53785L3.82153 2.98609L2.98598 3.82164L3.53784 4.44708C3.99465 4.9648 4.08908 5.67931 3.84088 6.27784C3.59384 6.87357 3.02348 7.31396 2.33245 7.35715L1.5 7.40917V8.59082L2.33241 8.64285C3.02346 8.68604 3.59383 9.12643 3.84089 9.72218C4.0891 10.3207 3.99467 11.0353 3.53784 11.553L2.98597 12.1785L3.82152 13.014L4.44696 12.4622C4.9647 12.0053 5.67925 11.9109 6.27781 12.1591C6.87356 12.4062 7.31396 12.9765 7.35715 13.6676L7.40917 14.5ZM4.51386 14.3779C4.57751 14.3386 4.63866 14.2934 4.69655 14.2424L5.4394 13.5869C5.51167 13.5231 5.61418 13.5078 5.70322 13.5447C5.79219 13.5816 5.85406 13.665 5.86007 13.7612L5.92186 14.7498C5.92668 14.8269 5.93797 14.902 5.95519 14.9748C5.96527 15.0175 5.9774 15.0593 5.99145 15.1002C6.17209 15.6264 6.67094 16 7.2526 16H8.7474C9.32903 16 9.82785 15.6264 10.0085 15.1003C10.0226 15.0594 10.0347 15.0175 10.0448 14.9749C10.062 14.9021 10.0733 14.8269 10.0781 14.7498L10.1399 13.7611C10.1459 13.665 10.2078 13.5816 10.2967 13.5447C10.3858 13.5078 10.4882 13.5232 10.5605 13.5869L11.3033 14.2424C11.3612 14.2935 11.4224 14.3387 11.4861 14.378C11.5234 14.401 11.5615 14.422 11.6004 14.441C12.1001 14.6852 12.717 14.5967 13.1283 14.1854L14.1853 13.1284C14.5966 12.7171 14.6851 12.1002 14.4408 11.6004C14.4218 11.5616 14.4009 11.5234 14.3779 11.4862C14.3385 11.4225 14.2934 11.3614 14.2423 11.3035L13.5869 10.5607C13.5231 10.4884 13.5077 10.3859 13.5447 10.2968C13.5816 10.2078 13.665 10.1459 13.7612 10.1399L14.7498 10.0781C14.8269 10.0733 14.902 10.062 14.9748 10.0448C15.0174 10.0347 15.0593 10.0226 15.1002 10.0086C15.6263 9.82795 16 9.32909 16 8.7474V7.2526C16 6.67093 15.6264 6.17209 15.1002 5.99144C15.0593 5.9774 15.0175 5.96527 14.9748 5.95519C14.902 5.93797 14.8269 5.92668 14.7498 5.92186L13.7612 5.86007C13.665 5.85406 13.5816 5.79219 13.5447 5.70321C13.5078 5.61417 13.5231 5.51166 13.5869 5.43938L14.2423 4.69666C14.2934 4.63873 14.3386 4.57754 14.3779 4.51384C14.4009 4.47658 14.4219 4.43846 14.4409 4.39963C14.6851 3.89987 14.5966 3.28297 14.1853 2.87168L13.1283 1.8147C12.717 1.40342 12.1001 1.31487 11.6004 1.55913C11.5615 1.57811 11.5234 1.5991 11.4861 1.6221C11.4224 1.66142 11.3613 1.70662 11.3033 1.75773L10.5606 2.41309C10.4883 2.47686 10.3858 2.49223 10.2968 2.4553C10.2078 2.41841 10.1459 2.33497 10.1399 2.23884L10.0781 1.25016C10.0733 1.17312 10.062 1.09795 10.0448 1.02516C10.0347 0.982504 10.0226 0.940667 10.0085 0.899751C9.8279 0.373623 9.32906 0 8.7474 0H7.2526C6.67091 0 6.17205 0.373663 5.99142 0.899834C5.97738 0.940737 5.96526 0.982562 5.95518 1.0252C5.93797 1.09798 5.92668 1.17314 5.92186 1.25016L5.86007 2.2388C5.85406 2.33495 5.79218 2.41842 5.70318 2.45532C5.61412 2.49225 5.51159 2.47688 5.43929 2.41309L4.69656 1.75774C4.63865 1.70665 4.57748 1.66146 4.51381 1.62215C4.47655 1.59915 4.43844 1.57817 4.39962 1.55919C3.89985 1.31487 3.2829 1.40341 2.87159 1.81472L1.81461 2.8717C1.40332 3.28298 1.31477 3.89987 1.55903 4.39963C1.57802 4.43848 1.59902 4.47662 1.62203 4.5139C1.66134 4.57758 1.70653 4.63876 1.75763 4.69667L2.41308 5.43951C2.47684 5.51177 2.4922 5.61425 2.45529 5.70326C2.4184 5.79221 2.33499 5.85406 2.23888 5.86007L1.25016 5.92186C1.17311 5.92668 1.09792 5.93797 1.02512 5.9552C0.982451 5.96529 0.940602 5.97742 0.899674 5.99147C0.373587 6.17215 0 6.67097 0 7.2526V8.7474C0 9.32905 0.373619 9.82789 0.899741 10.0085C0.940658 10.0226 0.982497 10.0347 1.02516 10.0448C1.09795 10.062 1.17312 10.0733 1.25016 10.0781L2.23884 10.1399C2.33497 10.1459 2.41841 10.2078 2.4553 10.2968C2.49222 10.3858 2.47686 10.4883 2.41309 10.5606L1.75762 11.3034C1.70654 11.3613 1.66137 11.4225 1.62207 11.4861C1.59906 11.5234 1.57806 11.5615 1.55907 11.6004C1.31475 12.1001 1.40328 12.7171 1.81459 13.1284L2.87157 14.1854C3.28289 14.5967 3.89985 14.6852 4.39963 14.4409C4.43846 14.4219 4.47659 14.4009 4.51386 14.3779Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="nav-item-label">Manage</span>
        </div>
      </div>
    `;
    
    return content;
  }
  
  forceRemoveActiveBackgrounds() {
    // Use JavaScript to forcefully remove backgrounds from active account items
    const removeBackgrounds = () => {
      const activeItems = this.container.querySelectorAll('.account-item.active');
      activeItems.forEach(item => {
        // Remove any background styles
        item.style.setProperty('background', 'transparent', 'important');
        item.style.setProperty('background-color', 'transparent', 'important');
        
        // Also check for pseudo-element styling via a style injection
        const styleId = 'force-no-active-bg';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = `
            .account-switcher .account-item.active:not(:hover),
            .account-switcher .account-item.active:not(:hover)::before,
            .account-switcher-dropdown .account-item.active:not(:hover),
            .account-switcher-dropdown .account-item.active:not(:hover)::before {
              background: transparent !important;
              background-color: transparent !important;
            }
          `;
          document.head.appendChild(style);
        }
      });
    };
    
    // Run immediately and also observe for changes
    removeBackgrounds();
    
    // Set up a mutation observer to catch any dynamically added active states
    const observer = new MutationObserver(() => {
      removeBackgrounds();
    });
    
    observer.observe(this.container, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    });
  }
  
  refreshSandboxPopover() {
    const switchSandboxButton = this.container.querySelector('#switchSandboxAction');
    if (switchSandboxButton && window.Popover) {
      // Find and remove existing popover
      const existingPopover = document.querySelector('.popover');
      if (existingPopover) {
        existingPopover.remove();
      }
      
      // Recreate popover with updated content
      const sandboxPopover = new window.Popover(switchSandboxButton, {
        position: 'right',
        offset: 8,
        trigger: 'hover',
        hideDelay: 100,
        showDelay: 0,
        content: this.generateSandboxContent()
      });
    }
  }
  
  // Method to re-render just the dropdown content with updated sorting
  renderDropdownContent() {
    const dropdownContent = this.container.querySelector('.account-switcher-dropdown .account-items-container');
    if (!dropdownContent) return;
    
    const currentAccount = this.options.currentAccount;
    const hasMultipleAccounts = this.options.accounts.length > 1;
    
    if (hasMultipleAccounts) {
      // Sort accounts to pin "All accounts" at top, then active account (same logic as main render)
      const sortedAccounts = [...this.options.accounts].sort((a, b) => {
        // "All accounts" (aggregate) always goes first
        if (a.isAggregate && !b.isAggregate) return -1;
        if (!a.isAggregate && b.isAggregate) return 1;
        
        // If both are aggregate or neither are aggregate, prioritize active account
        const aIsActive = a.id === currentAccount.id;
        const bIsActive = b.id === currentAccount.id;
        if (aIsActive && !bIsActive) return -1; // Active account goes first
        if (!aIsActive && bIsActive) return 1;
        
        return 0; // Maintain original order for others
      });
      
      // Generate unique colors for consistent avatar colors
      const uniqueColors = this.generateUniqueColors(this.options.accounts);
      
      // Re-generate the accounts HTML
      const accountsHtml = sortedAccounts.map((account, index) => {
        const accountInitials = this.generateInitials(account.name);
        const accountAvatarColor = account.color || uniqueColors[account.id];
        const isActive = account.id === currentAccount.id;
        
        let accountItemHtml = '';
        
        // Check if this is an aggregate account and render with office icon
        if (account.isAggregate) {
          accountItemHtml = `
            <button class="account-item all-accounts ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
              <div class="account-avatar all-accounts-avatar" style="background: var(--neutral-50) !important; background-color: var(--neutral-50) !important; color: var(--neutral-600) !important;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50106 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50106 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="currentColor"/>
                  <path fill="currentColor" d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="currentColor"/>
                  <path fill="currentColor" d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="currentColor"/>
                  <path fill="currentColor" d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="currentColor"/>
                  <path fill="currentColor" d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="account-details">
                <span class="account-name">${account.name}</span>
              </div>
              ${isActive ? '<div class="account-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/></svg></div>' : ''}
            </button>
          `;
          
          // Add divider after "All accounts" if there are more accounts
          if (index < sortedAccounts.length - 1) {
            accountItemHtml += `<div class="account-divider" style="border-bottom: 1px solid var(--color-border-subtle); margin: 8px 16px;"></div>`;
          }
        } else {
          accountItemHtml = `
            <button class="account-item ${isActive ? 'active' : ''}" data-account-id="${account.id}" type="button">
              <div class="account-avatar" data-color="${accountAvatarColor}" style="background-color: ${accountAvatarColor} !important;">
                <span class="avatar-initials">${accountInitials}</span>
              </div>
              <div class="account-details">
                <span class="account-name">${account.name}</span>
              </div>
              ${isActive ? '<div class="account-check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2803 5.21967C12.5732 5.51256 12.5732 5.98744 12.2803 6.28033L7.53033 11.0303C7.23744 11.3232 6.76256 11.3232 6.46967 11.0303L3.96967 8.53033C3.67678 8.23744 3.67678 7.76256 3.96967 7.46967C4.26256 7.17678 4.73744 7.17678 5.03033 7.46967L7 9.43934L11.2197 5.21967C11.5126 4.92678 11.9874 4.92678 12.2803 5.21967Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5C11.5903 14.5 14.5 11.5903 14.5 7.99999C14.5 4.40834 11.6 1.5 8 1.5C4.4097 1.5 1.5 4.40969 1.5 7.99999C1.5 11.5903 4.4097 14.5 8 14.5ZM8 16C12.4187 16 16 12.4187 16 7.99999C16 3.58126 12.4297 0 8 0C3.58127 0 0 3.58126 0 7.99999C0 12.4187 3.58127 16 8 16Z" fill="currentColor"/></svg></div>' : ''}
            </button>
          `;
        }
        
        return accountItemHtml;
      }).join('');
      
      // Update only the account items container content
      dropdownContent.innerHTML = accountsHtml;
      
      // Re-bind only account item events for the new content
      this.bindAccountItemEvents();
    }
  }
  
  selectAccount(accountId) {
    const selectedAccount = this.options.accounts.find(acc => acc.id === accountId);
    
    if (selectedAccount) {
      // Create a copy of the selected account and modify the type to show parent organization
      const accountWithParent = { ...selectedAccount };
      
      // For aggregate accounts, keep the original type, for regular accounts set parent org name
      if (!selectedAccount.isAggregate) {
      accountWithParent.type = this.getParentOrganizationName();
      }
      
      // Update the current account immediately for smooth transition
      this.options.currentAccount = accountWithParent;
      
      // Update just the trigger display without full re-render
      this.updateTriggerDisplay(accountWithParent);
      
      // Re-render dropdown to update sorting order (active account should be at top)
      this.renderDropdownContent();
      
      // Update dropdown selection state
      this.updateDropdownSelection(accountId);
      
      // Notify of account change
      this.options.onAccountChange(accountWithParent);
      
      // Close dropdown immediately after selection
      this.close();
      this.refreshSandboxPopover();
    }
  }
  
  getParentOrganizationName() {
    // Look up parent organization name from window.OrgDataManager (new system)
    if (window.OrgDataManager) {
      const currentOrg = window.OrgDataManager.getCurrentOrganization();
      if (currentOrg && currentOrg.name) {
        return currentOrg.name;
      }
    }
    
    // Legacy fallback - Look up parent organization name from window.accounts
    if (window.accounts && window.currentAccount) {
      const parentAccount = window.accounts[window.currentAccount];
      if (parentAccount && parentAccount.name) {
        return parentAccount.name;
      }
    }
    
    // Final fallback
    return 'Organization';
  }

  updateTriggerDisplay(account) {
    const trigger = this.container.querySelector('.account-switcher-trigger');
    if (!trigger) return;

    // Add smooth transition effect
    trigger.style.transition = 'all 0.2s ease';

    // Update avatar
    const avatarElement = trigger.querySelector('.account-avatar');
    if (avatarElement) {
      const isAllAccounts = account.isAggregate;
      
      if (isAllAccounts) {
        // Update to office icon
        avatarElement.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H8C9.51878 0 10.75 1.23122 10.75 2.75V3C10.75 3.41421 10.4142 3.75 10 3.75C9.58579 3.75 9.25 3.41421 9.25 3V2.75C9.25 2.05964 8.69036 1.5 8 1.5H2.75C2.05964 1.5 1.5 2.05964 1.5 2.75V14.25C1.5 14.3881 1.61193 14.5 1.75 14.5H4.25C4.66421 14.5 5 14.8358 5 15.25C5 15.6642 4.66421 16 4.25 16H1.75C0.783502 16 0 15.2165 0 14.25V2.75ZM10.8525 5.864C11.0957 5.712 11.4043 5.712 11.6475 5.864L15.6475 8.364C15.8668 8.50106 16 8.74141 16 9V14.25C16 15.2165 15.2165 16 14.25 16H8.25C7.2835 16 6.5 15.2165 6.5 14.25V9C6.5 8.74141 6.63321 8.50106 6.8525 8.364L10.8525 5.864ZM8 9.41569V14.25C8 14.3881 8.11193 14.5 8.25 14.5H10.5V13C10.5 12.5858 10.8358 12.25 11.25 12.25C11.6642 12.25 12 12.5858 12 13V14.5H14.25C14.3881 14.5 14.5 14.3881 14.5 14.25V9.41569L11.25 7.38444L8 9.41569Z" fill="currentColor"/>
            <path fill="currentColor" d="M3 4.5C3 3.94772 3.44772 3.5 4 3.5C4.55228 3.5 5 3.94772 5 4.5C5 5.05228 4.55228 5.5 4 5.5C3.44772 5.5 3 5.05228 3 4.5Z" fill="currentColor"/>
            <path fill="currentColor" d="M3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8Z" fill="currentColor"/>
            <path fill="currentColor" d="M6 4.5C6 3.94772 6.44772 3.5 7 3.5C7.55228 3.5 8 3.94772 8 4.5C8 5.05228 7.55228 5.5 7 5.5C6.44772 5.5 6 5.05228 6 4.5Z" fill="currentColor"/>
            <path fill="currentColor" d="M3 11.5C3 10.9477 3.44772 10.5 4 10.5C4.55228 10.5 5 10.9477 5 11.5C5 12.0523 4.55228 12.5 4 12.5C3.44772 12.5 3 12.0523 3 11.5Z" fill="currentColor"/>
          </svg>
        `;
        avatarElement.className = 'account-avatar all-accounts-avatar';
        avatarElement.style.cssText = 'background: var(--neutral-50) !important; background-color: var(--neutral-50) !important; color: var(--neutral-600) !important;';
      } else {
        // Update to initials
        const initials = this.generateInitials(account.name);
        // Use the same color logic as the original rendering
        const color = account.color || 
                     this.generateUniqueColors(this.options.accounts)[account.id] || 
                     this.generateAvatarColor(account.name, account.id);
        avatarElement.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        avatarElement.className = 'account-avatar';
        avatarElement.style.cssText = `background-color: ${color} !important;`;
        avatarElement.removeAttribute('data-color');
        avatarElement.setAttribute('data-color', color);
      }
    }

    // Update text content
    const nameElement = trigger.querySelector('.account-name');
    const typeElement = trigger.querySelector('.account-type');
    
    if (nameElement) {
      nameElement.textContent = account.name;
    }
    
    if (typeElement) {
      typeElement.textContent = account.type;
    }
  }

  updateDropdownSelection(selectedAccountId) {
    // First, clear ALL existing selections to ensure only one is active
    const accountItems = this.container.querySelectorAll('.account-item');
    
    // Clear all active states first
    accountItems.forEach(item => {
      item.classList.remove('active');
      const checkElement = item.querySelector('.account-check');
      if (checkElement) {
        checkElement.remove();
      }
    });
    
    // Then set the selected one as active
    let foundMatch = false;
    accountItems.forEach(item => {
      const accountId = item.dataset.accountId;
      
      if (accountId === selectedAccountId) {
        foundMatch = true;
        
        // Add active class and check mark with transition
        item.style.transition = 'background-color 0.15s ease';
        item.classList.add('active');
        

        
        const checkMarkHtml = `
          <div class="account-check">
            <img src="shared/svgs/checkCircleFilled.svg?v=5" width="12" height="12" alt="Selected" style="filter: brightness(0) saturate(100%) invert(54%) sepia(8%) saturate(1157%) hue-rotate(169deg) brightness(95%) contrast(91%);">
          </div>
        `;
        item.insertAdjacentHTML('beforeend', checkMarkHtml);
      }
    });
    
    if (!foundMatch) {
      console.log('❌ NO MATCH FOUND for selectedAccountId:', `"${selectedAccountId}"`);
    }
  }

  navigateToSettings() {
    // Navigate to settings page
    this.close(); // Close the popover first
    
    // Use relative path that works from any page in the UXR prototype
    if (window.location.pathname.includes('/prototypes/stripe-dashboard-uxr/')) {
      window.location.href = './settings.html';
    } else {
      // Fallback for other contexts
      window.location.href = 'settings.html';
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccountSwitcher;
}

// Global registration
window.AccountSwitcher = AccountSwitcher; 