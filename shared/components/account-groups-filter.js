/**
 * Account Groups Filter Component
 * A reusable component that provides intelligent viewport positioning and full functionality
 */

class AccountGroupsFilter {
  constructor(options = {}) {
    this.options = {
      triggerId: 'filterTrigger',
      popoverId: 'filterPopover',
      searchInputId: 'searchInput',
      selectAllContainerId: 'selectAllContainer',
      accountsListId: 'accountsList',
      triggerOptionId: 'filterOption',
      accountGroups: {},
      generateAccountGroups: null,
      namespace: '', // For avoiding conflicts when multiple filters on same page
      ...options
    };
    
    this.currentGroup = 'all';
    this.searchTerm = '';
    this.accountGroups = {};
    this.isCustomMode = false; // Track if user has made manual changes to account selection
    this.isRepositioning = false; // Prevent cascade repositioning
    this.committedSelection = null; // Store committed selection state for cancel functionality
    this.triggerDimensions = null; // Store trigger size for consistent positioning
    this.alignmentMode = 'left'; // 'left' or 'right' - determines which edge to align to
    this.alignmentLocked = false; // Whether alignment mode has been determined
    this.retryCount = 0; // Track initialization retries
    this.maxRetries = 3; // Maximum number of initialization retries
    this.loadingRetryCount = 0; // Track data loading retries
    this.maxLoadingRetries = 10; // Max retries waiting for data
    this.isLoading = false; // Loading state for trigger label
    this.lastGroupKey = null; // Persisted last selected group key
    this.isClosingAfterApply = false; // Flag to prevent restoring selection when closing after apply
    this.appliedAccountSelection = new Map(); // Store applied account selection state by account ID
    
    this.init();
    
    // Register with the global popover manager if it exists
    // Use unique ID based on namespace or triggerId to avoid conflicts with multiple filter instances
    this.popoverManagerId = this.options.namespace ? 
      `account-groups-filter-${this.options.namespace}` : 
      `account-groups-filter-${this.options.triggerId}`;
      
    this.registerWithPopoverManager();
  }
  
  registerWithPopoverManager() {
    if (window.GlobalPopoverManager) {
      window.GlobalPopoverManager.register(this.popoverManagerId, () => {
        // Restore committed selection when closed by global popover manager (unless closing after apply)
        if (!this.isClosingAfterApply) {
          this.restoreCommittedSelection();
        }
        
        // Reset the flag for next time
        this.isClosingAfterApply = false;
        
        const popover = document.getElementById(this.options.popoverId);
        const trigger = document.getElementById(this.options.triggerId);
        if (popover) {
          popover.style.display = 'none';
        }
        if (trigger) {
          trigger.classList.remove('open');
        }
        // Clear stored position data when closing
        this.triggerDimensions = null;
        this.alignmentMode = 'left';
        this.alignmentLocked = false;
      });
      console.log('🎯 PopoverManager: Registered account-groups-filter menu with ID:', this.popoverManagerId);
    } else {
      // Retry registration after a short delay if GlobalPopoverManager isn't ready yet
      setTimeout(() => {
        this.registerWithPopoverManager();
      }, 100);
    }
  }
  
  init() {
    // Ensure DOM is ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponent());
    } else {
      this.initializeComponent();
    }
  }
  
  initializeComponent() {
    // Generate account groups if function provided
    if (this.options.generateAccountGroups) {
      try {
        this.accountGroups = this.options.generateAccountGroups();
      } catch (error) {
        console.error('Error generating account groups:', error);
        this.accountGroups = this.options.accountGroups || {};
      }
    } else {
      this.accountGroups = this.options.accountGroups || {};
    }
    
    // Verify all required DOM elements exist before proceeding
    const requiredElements = [
      this.options.triggerId,
      this.options.popoverId,
      this.options.searchInputId,
      this.options.selectAllContainerId,
      this.options.accountsListId,
      this.options.triggerOptionId
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.warn('AccountGroupsFilter: Missing required DOM elements:', missingElements);
      
      // Retry initialization after a delay if we haven't exceeded max retries
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`AccountGroupsFilter: Retrying initialization (attempt ${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.initializeComponent(), 100 * this.retryCount); // Increasing delay
        return;
      } else {
        console.error('AccountGroupsFilter: Failed to initialize after maximum retries');
        return;
      }
    }
    
    this.attachEventListeners();
    // Load last selected group key (scoped by org + namespace)
    this.lastGroupKey = this.getLastGroupKey();
    this.currentGroup = 'all';

    // Ensure an 'all' group exists before first render
    if (!this.accountGroups['all']) {
      this.createAllAccountsGroup();
    }

    // If data isn't ready yet, show loading spinner in trigger and retry until ready
    if (!this.hasAccountData()) {
      this.setTriggerLoadingState(true);
      this.retryInitializeData();
    } else {
      const initialGroup = this.getInitialGroupKey();
      this.currentGroup = initialGroup;
      this.renderAccounts(initialGroup);
      // Set default trigger label to All with folder icon (brand-600)
      this.isCustomMode = false;
      this.updateTriggerLabel(initialGroup);
      this.addScrollEffect();
    }
    
    // Check for overflow after initial render
    setTimeout(() => {
      this.checkAccountsListOverflow();
    }, 50);
  }

  // Build a storage key unique to org + component namespace
  getStorageKey() {
    const orgName = window.OrgDataManager?.getCurrentOrganization()?.name || 'default_org';
    const ns = this.options.namespace || 'default';
    return `agf:last_group:${ns}:${orgName}`;
  }

  getLastGroupKey() {
    try {
      return localStorage.getItem(this.getStorageKey());
    } catch (_) { return null; }
  }

  setLastGroupKey(groupKey) {
    try {
      localStorage.setItem(this.getStorageKey(), groupKey);
      this.lastGroupKey = groupKey;
    } catch (_) {}
  }

  // Decide which group to show first: last saved (if valid) else 'all'
  getInitialGroupKey() {
    const candidate = this.lastGroupKey;
    if (candidate && (candidate === 'all' || this.accountGroups[candidate])) {
      return candidate;
    }
    return 'all';
  }

  // Determine if account data is available for initial render
  hasAccountData() {
    if (!this.accountGroups || Object.keys(this.accountGroups).length === 0) return false;
    const allGroup = this.accountGroups['all'];
    // Handle both new structure (with accounts array) and legacy array format
    const allAccounts = allGroup?.accounts || allGroup;
    return Array.isArray(allAccounts) && allAccounts.length > 0;
  }

  // Retry generating data until OrgDataManager or generator provides accounts
  retryInitializeData() {
    // Try to (re)generate account groups
    try {
      if (this.options.generateAccountGroups) {
        const next = this.options.generateAccountGroups();
        if (next && Object.keys(next).length > 0) {
          this.accountGroups = next;
        }
      } else if (!this.accountGroups['all']) {
        // Try to build from OrgDataManager if available
        this.createAllAccountsGroup();
      }
    } catch (e) {
      // swallow and retry
    }

    if (this.hasAccountData()) {
      this.setTriggerLoadingState(false);
      const initialGroup = this.getInitialGroupKey();
      this.currentGroup = initialGroup;
      this.renderAccounts(initialGroup);
      this.isCustomMode = false;
      this.updateTriggerLabel(initialGroup);
      this.addScrollEffect();
      this.loadingRetryCount = 0;
      return;
    }

    if (this.loadingRetryCount >= this.maxLoadingRetries) {
      // Give up gracefully and leave trigger blank
      this.setTriggerLoadingState(false, true);
      return;
    }

    this.loadingRetryCount += 1;
    const delay = Math.min(100 * this.loadingRetryCount, 800);
    setTimeout(() => this.retryInitializeData(), delay);
  }

  // Show spinner in trigger while loading
  setTriggerLoadingState(isLoading, leaveEmpty = false) {
    const triggerOption = document.getElementById(this.options.triggerOptionId);
    if (!triggerOption) return;
    this.isLoading = isLoading;

    if (isLoading) {
      // Inject spinner keyframes once
      const styleId = 'agf-spinner-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = '@keyframes agf_spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(style);
      }
      triggerOption.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(0,39,77,0.18);border-top-color:rgba(0,39,77,0.45);border-radius:50%;animation:agf_spin .6s linear infinite;vertical-align:-1px;"></span>';
      // Visually disable trigger while loading
      const triggerBtn = document.getElementById(this.options.triggerId);
      if (triggerBtn) {
        triggerBtn.classList.add('is-loading');
        triggerBtn.style.pointerEvents = 'none';
        triggerBtn.setAttribute('aria-busy', 'true');
        triggerBtn.setAttribute('aria-disabled', 'true');
      }
    } else if (leaveEmpty) {
      triggerOption.innerHTML = '';
      const triggerBtn = document.getElementById(this.options.triggerId);
      if (triggerBtn) {
        triggerBtn.classList.remove('is-loading');
        triggerBtn.style.pointerEvents = '';
        triggerBtn.removeAttribute('aria-busy');
        triggerBtn.removeAttribute('aria-disabled');
      }
    }
  }
  
  calculateTriggerDimensions() {
    const trigger = document.getElementById(this.options.triggerId);
    if (!trigger) return;
    
    // Get current trigger dimensions
    const rect = trigger.getBoundingClientRect();
    this.triggerDimensions = {
      width: rect.width,
      height: rect.height
    };
  }
  
  updateTriggerSize() {
    // Public method to recalculate position based on current trigger size
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      this.positionPopover(false); // Keep same alignment mode, just recalculate position
    }
  }
  
  calculateAlignmentMode() {
    const trigger = document.getElementById(this.options.triggerId);
    if (!trigger || !this.triggerDimensions) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    const popoverWidth = 532;
    const viewportWidth = window.innerWidth;
    const margin = 16;
    
    // Check if left-aligned popover would go off left edge
    const triggerLeftInViewport = triggerRect.left;
    const leftAlignedRight = triggerLeftInViewport + popoverWidth;
    
    // Determine alignment: prefer left, fallback to right
    if (leftAlignedRight > viewportWidth - margin) {
      // Left alignment would go off right edge - use right alignment
      const rightAlignedLeft = triggerLeftInViewport + this.triggerDimensions.width - popoverWidth;
      if (rightAlignedLeft >= margin) {
        this.alignmentMode = 'right';
      } else {
        // Both alignments problematic, use left anyway
        this.alignmentMode = 'left';
      }
    } else {
      // Left alignment fits - use left alignment
      this.alignmentMode = 'left';
    }
  }
  
  positionPopover(forceRecalculate = false) {
    if (this.isRepositioning && !forceRecalculate) {
      return; // Prevent cascade repositioning
    }
    
    const trigger = document.getElementById(this.options.triggerId);
    const popover = document.getElementById(this.options.popoverId);
    
    if (!trigger || !popover) {
      return;
    }
    
    this.isRepositioning = true;
    
    // Determine alignment mode only once (when first opening or forcing recalculation)
    if (!this.alignmentLocked || forceRecalculate) {
      this.calculateTriggerDimensions();
      this.calculateAlignmentMode();
      this.alignmentLocked = true;
    }
    
    // Always get current trigger dimensions and position
    const triggerRect = trigger.getBoundingClientRect();
    const currentTriggerWidth = triggerRect.width;
    const currentTriggerHeight = triggerRect.height;
    
    const popoverWidth = 532;
    const viewportHeight = window.innerHeight;
    const margin = 24; // 24px margin from viewport edges (matching account switcher)
    
    // Calculate dynamic height based on content and viewport
    const { height: optimalHeight, canPositionBelow } = this.calculateOptimalHeight(triggerRect, viewportHeight, margin, popover);
    
    // Height calculation complete
    
    // Calculate position based on locked alignment mode but current trigger size
    let left;
    switch (this.alignmentMode) {
      case 'left':
        left = 0; // Left-align to trigger
        break;
      case 'right':
      default:
        left = currentTriggerWidth - popoverWidth; // Right-align to current trigger width
        break;
    }
    
    // Calculate vertical position - DON'T override the height calculation's positioning decision
    let top;
    if (canPositionBelow) {
      top = currentTriggerHeight + 4; // 4px below trigger
    } else {
      top = -optimalHeight - 4; // Position above trigger
    }
    
    // Apply positioning and height (relative to trigger) - NO safety overrides
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.style.height = `${optimalHeight}px`;
    
    // Positioning applied
    
    // Reset repositioning flag
    this.isRepositioning = false;
  }
  
  calculateOptimalHeight(triggerRect, viewportHeight, margin, popover) {
    // Calculate available space above and below trigger
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;
    
    // Calculate content-based height estimate
    const accountsListContainer = popover.querySelector('.accounts-list');
    const accountItems = accountsListContainer ? accountsListContainer.querySelectorAll('.account-item') : [];
    const selectAllContainer = popover.querySelector('.select-all-container');
    
    // Fixed height components
    const searchContainerHeight = 56; // search container + padding
    const selectAllHeight = selectAllContainer ? 36 : 0; // select all row height (36px as per CSS)
    const footerHeight = 64; // footer with buttons
    const groupsSectionPadding = 8; // margins and padding
    
    // Variable height: account items (36px each as per CSS)
    const accountItemHeight = 36;
    const visibleAccountCount = Array.from(accountItems).filter(item => 
      item.style.display !== 'none'
    ).length;
    
    // Account count calculated
    
    // Calculate accounts list height with padding (accounts-list has 8px bottom padding)
    const accountsListContentHeight = visibleAccountCount * accountItemHeight;
    const accountsListPadding = 8; // 8px bottom padding from CSS
    const accountsListHeight = accountsListContentHeight + accountsListPadding;
    
    // Calculate ideal height based on content
    const contentBasedHeight = searchContainerHeight + selectAllHeight + accountsListHeight + footerHeight + groupsSectionPadding;
    
    // Content calculation complete
    
    // Apply constraints
    const minHeight = 360; // Updated minimum height for usability
    
    // Calculate what height would work in each position
    const maxHeightBelow = Math.max(minHeight, spaceBelow - 4); // 4px gap
    const maxHeightAbove = Math.max(minHeight, spaceAbove - 4); // 4px gap
    
    // Space calculation complete
    
    // Determine best position based on content needs and available space
    let canPositionBelowFinal;
    let finalHeight;
    
    // First, check if content fits comfortably in either position
    if (contentBasedHeight <= maxHeightBelow && contentBasedHeight <= maxHeightAbove) {
      // Content fits in both positions - prefer below
      canPositionBelowFinal = true;
      finalHeight = contentBasedHeight;
    } else if (contentBasedHeight <= maxHeightBelow) {
      // Content fits below but not above
      canPositionBelowFinal = true;
      finalHeight = contentBasedHeight;
    } else if (contentBasedHeight <= maxHeightAbove) {
      // Content fits above but not below
      canPositionBelowFinal = false;
      finalHeight = contentBasedHeight;
    } else {
      // Content doesn't fit perfectly in either position
      // Choose the position with more available space
      if (maxHeightBelow >= maxHeightAbove) {
        canPositionBelowFinal = true;
        finalHeight = maxHeightBelow;
      } else {
        canPositionBelowFinal = false;
        finalHeight = maxHeightAbove;
      }
    }
    
    return {
      height: Math.round(finalHeight),
      canPositionBelow: canPositionBelowFinal
    };
  }
  
  togglePopover() {
    const popover = document.getElementById(this.options.popoverId);
    const trigger = document.getElementById(this.options.triggerId);
    
    if (!popover || !trigger) {
      return;
    }
    
    const isOpen = popover.style.display === 'flex';
    
    if (isOpen) {
      // Restore committed selection when closing without applying
      if (!this.isClosingAfterApply) {
        this.restoreCommittedSelection();
      }
      
      // Reset the flag for next time
      this.isClosingAfterApply = false;
      
      popover.style.display = 'none';
      trigger.classList.remove('open');
      // Clear stored position data when closing
      this.triggerDimensions = null;
      this.alignmentMode = 'left';
      this.alignmentLocked = false;
      
      // Update the popover manager that this menu is closed
      if (window.GlobalPopoverManager && window.GlobalPopoverManager.getCurrentOpenMenu() === this.popoverManagerId) {
        window.GlobalPopoverManager.currentOpenMenu = null;
      }
    } else {
      // Use the global popover manager to close other menus first
      if (window.GlobalPopoverManager) {
        window.GlobalPopoverManager.openMenu(this.popoverManagerId);
      }
      
      // Capture current selection state before opening
      this.captureCommittedSelection();
      popover.style.display = 'flex';
      trigger.classList.add('open');
      // Calculate fresh position when opening
      this.positionPopover(true);
      // Update Apply button state when opening
      this.updateApplyButtonState();
      // Check for scroll overflow after popover is shown and positioned
      setTimeout(() => {
        this.checkAccountsListOverflow();
      }, 10);
      // Defensive: if accounts list is empty, rebuild from manager to avoid blank state
      const accountsInDom = document.querySelectorAll(`#${this.options.accountsListId} .account-item`).length;
      if (accountsInDom === 0) {
        if (!this.accountGroups['all']) {
          this.createAllAccountsGroup();
        }
        const groupKey = this.getInitialGroupKey();
        this.currentGroup = groupKey;
        this.renderAccounts(groupKey);
        this.updateTriggerLabel(groupKey);
      }
    }
  }
  
  renderAccounts(groupKey) {
    const selectAllContainer = document.getElementById(this.options.selectAllContainerId);
    const accountsList = document.getElementById(this.options.accountsListId);
    const groupData = this.accountGroups[groupKey];
    const accounts = groupData?.accounts || groupData || []; // Handle both new structure and legacy array format
    
    if (!selectAllContainer || !accountsList) {
      console.warn('AccountGroupsFilter: Required containers not found for renderAccounts');
      return;
    }
    
    // Ensure we have account groups data
    if (!this.accountGroups || Object.keys(this.accountGroups).length === 0) {
      console.warn('AccountGroupsFilter: No account groups data available');
      return;
    }
    
    this.currentGroup = groupKey;
    
    // Create select all checkbox (pinned at top) - shows count only
    const selectAllHTML = `
      <div class="select-all-item">
        <div class="checkbox-container">
          <input type="checkbox" id="${this.options.namespace}selectAll" checked>
        </div>
        <div class="account-filter-content">
          <label for="${this.options.namespace}selectAll" id="${this.options.namespace}selectionCount">${accounts.length} selected</label>
        </div>
      </div>
    `;
    
    // Create account items (scrollable)
    const accountsHTML = accounts.map(account => {
      const iconStyle = account.backgroundColor ? 
        `style="background-color: ${account.backgroundColor};"` : 
        '';
      const iconClass = account.backgroundColor ? 'account-icon' : `account-icon ${account.color}`;
      
      // Use avatar image if available, otherwise fall back to initials
      const avatarContent = account.avatar ? 
        `<img src="${account.avatar}" alt="${account.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
        account.initials;
      
      return `
        <div class="account-item">
          <div class="checkbox-container">
            <input type="checkbox" ${account.checked ? 'checked' : ''}>
          </div>
          <div class="account-filter-content">
            <div class="${iconClass}" ${iconStyle}>${avatarContent}</div>
            <label>${account.name}</label>
          </div>
        </div>
      `;
    }).join('');
    
    // Set innerHTML separately
    selectAllContainer.innerHTML = selectAllHTML;
    accountsList.innerHTML = accountsHTML;
    
    // Reattach event listeners
    this.attachCheckboxListeners();
    this.attachSelectAllListener();
    
    // Apply search filter if active
    if (this.searchTerm) {
      this.filterAccountsBySearch(this.searchTerm);
    }
    
    this.updateSelectionCount();
    this.updateSelectAllState();
    this.checkAccountsListOverflow();
    
    // Recalculate popover height when content changes (group selection)
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      this.positionPopover();
    }
    
    // Do not update trigger label until user clicks Apply
  }
  
  attachEventListeners() {
    // Trigger button
    const trigger = document.getElementById(this.options.triggerId);
    if (trigger) {
      trigger.addEventListener('click', () => this.togglePopover());
    }
    
    // Search functionality (debounced to reduce work on large lists)
    const searchInput = document.getElementById(this.options.searchInputId);
    if (searchInput) {
      const debounce = (fn, delay = 200) => {
        let t;
        return (...args) => {
          clearTimeout(t);
          t = setTimeout(() => fn.apply(this, args), delay);
        };
      };

      const onSearch = debounce((e) => {
        this.searchTerm = e.target.value || '';
        this.filterAccountsBySearch(this.searchTerm);
      }, 200);

      searchInput.addEventListener('input', onSearch);
    }
    
    // Group selection functionality
    document.querySelectorAll(`#${this.options.popoverId} .group-item`).forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll(`#${this.options.popoverId} .group-item`).forEach(g => g.classList.remove('active'));
        item.classList.add('active');
        
        const group = item.getAttribute('data-group');
        if (group) {
          this.currentGroup = group;
          this.isCustomMode = false; // Reset custom mode when selecting a group
          this.renderAccounts(group);
        }
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      const popover = document.getElementById(this.options.popoverId);
      const trigger = document.getElementById(this.options.triggerId);
      
      if (popover && trigger && popover.style.display === 'flex') {
        if (!popover.contains(e.target) && !trigger.contains(e.target)) {
          this.togglePopover();
        }
      }
    });
    
    // Reposition on window resize and scroll (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const popover = document.getElementById(this.options.popoverId);
        if (popover && popover.style.display === 'flex') {
          // Force recalculation on significant viewport changes
          this.positionPopover(true);
        }
      }, 100);
    }, { passive: true });
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const popover = document.getElementById(this.options.popoverId);
        if (popover && popover.style.display === 'flex') {
          // Just reposition based on current alignment mode and trigger size
          this.positionPopover(false);
        }
      }, 50);
    }, { passive: true });
  }
  
  attachCheckboxListeners() {
    const accountsListEl = document.getElementById(this.options.accountsListId);
    if (!accountsListEl) return;

    // Bind once via delegation
    if (!this._delegatedAccountsBound) {
      // Toggle row by clicking anywhere in the row (except the checkbox itself)
      accountsListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.account-item');
        if (!item || !accountsListEl.contains(item)) return;
        if (e.target && e.target.type === 'checkbox') return;
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          // Trigger change to update counts/state
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Checkbox changes
      accountsListEl.addEventListener('change', (e) => {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
          this.handleAccountCheckboxChange();
        }
      });

      this._delegatedAccountsBound = true;
    }
  }
  
  attachSelectAllListener() {
    const selectAllCheckbox = document.getElementById(`${this.options.namespace}selectAll`);
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        // Only affect visible accounts (matching group creation modal logic)
        document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(item => {
          if (item.style.display !== 'none') {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = isChecked;
            }
          }
        });
        this.handleSelectAllChange();
      });
    }
    
    // Make entire select all row clickable
    document.querySelectorAll(`#${this.options.selectAllContainerId} .select-all-item`).forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') {
          return;
        }
        
        const selectAllItem = e.currentTarget;
        const checkbox = selectAllItem.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }
  
  filterAccountsBySearch(searchTerm) {
    document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(item => {
      const label = item.querySelector('label');
      if (label) {
        const accountName = label.textContent.toLowerCase();
        const shouldShow = accountName.includes(searchTerm.toLowerCase());
        item.style.display = shouldShow ? 'flex' : 'none';
      }
    });
    
    this.updateSelectionCount();
    this.updateSelectAllState();
    this.checkAccountsListOverflow();
    
    // Reposition popover after filtering to adjust height based on visible items
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      this.positionPopover();
    }
  }
  
  updateSelectionCount() {
    // Count ALL checked accounts (visible and hidden) for the selection count display
    let totalChecked = 0;
    document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        totalChecked++;
      }
    });
    
    const selectionCount = document.getElementById(`${this.options.namespace}selectionCount`);
    if (selectionCount) {
      selectionCount.textContent = `${totalChecked} selected`;
    }
    
    // Update Apply button state and hide validation error when selection changes
    this.updateApplyButtonState();
    this.hideValidationError();
  }
  
  updateSelectAllState() {
    // Count only visible accounts (matching group creation modal logic)
    let visibleTotal = 0;
    let visibleChecked = 0;
    
    document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(item => {
      if (item.style.display !== 'none') {
        visibleTotal++;
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          visibleChecked++;
        }
      }
    });
    
    const selectAllCheckbox = document.getElementById(`${this.options.namespace}selectAll`);
    if (selectAllCheckbox) {
      if (visibleTotal === 0) {
        // No visible accounts - disable select all
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.disabled = true;
      } else if (visibleChecked === 0) {
        // No visible accounts selected
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.disabled = false;
      } else if (visibleChecked === visibleTotal) {
        // All visible accounts selected
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.disabled = false;
      } else {
        // Some visible accounts selected
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.disabled = false;
      }
    }
  }
  
    addScrollEffect() {
    const accountsList = document.getElementById(this.options.accountsListId);
    let scrollTimeout;

    if (accountsList) {
      accountsList.addEventListener('scroll', function() {
        // Add scrolling class
        this.classList.add('scrolling');
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Set timeout to remove scrolling class when scrolling stops
        scrollTimeout = setTimeout(() => {
          this.classList.remove('scrolling');
        }, 300); // 300ms delay after scrolling stops
      }, { passive: true });
    }
  }
  
  // Handle individual account checkbox changes
  handleAccountCheckboxChange() {
    this.updateSelectionCount();
    this.updateSelectAllState();
  }
  
  // Handle select all checkbox changes
  handleSelectAllChange() {
    this.updateSelectionCount();
  }
  
  // Get a human-readable display name for a group key
  getGroupDisplayName(groupKey) {
    if (!groupKey || groupKey === 'all') {
      return 'All';
    }
    
    // Check if we have the original name stored in the group data
    const groupData = this.accountGroups[groupKey];
    if (groupData && groupData.originalName) {
      return groupData.originalName;
    }
    
    // Fallback to title case conversion for backwards compatibility
    return groupKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Update the trigger label text
  updateTriggerLabel(groupKey) {
    const triggerOption = document.getElementById(this.options.triggerOptionId);
    
    if (!triggerOption) {
      console.warn('AccountGroupsFilter: Trigger option element not found');
      return;
    }
    
    // Ensure we have account data
    const accountsList = document.getElementById(this.options.accountsListId);
    if (!accountsList) {
      console.warn('AccountGroupsFilter: Accounts list not found for label calculation');
      return;
    }
    
    // Get selected accounts info
    const selectedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const selectedCount = selectedCheckboxes.length;
    
    // Get total accounts for this group to check if all are selected (full group)
    const totalAccountsInGroup = document.querySelectorAll(`#${this.options.accountsListId} .account-item`).length;
    const isFullGroupSelected = selectedCount === totalAccountsInGroup && selectedCount > 0;
    
    // Get selected account names
    const selectedAccountNames = Array.from(selectedCheckboxes).map(checkbox => {
      const accountItem = checkbox.closest('.account-item');
      const label = accountItem.querySelector('label');
      return label ? label.textContent.trim() : '';
    }).filter(name => name);
    
    const folderIcon = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; flex-shrink: 0; color: var(--brand-600);">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.82679C16 7.94141 15.9803 8.05518 15.9417 8.16312L13.974 13.6727C13.6898 14.4687 12.9358 15 12.0906 15H2C0.895431 15 0 14.1046 0 13V3C0 1.89543 0.89543 1 2 1H4.58579C4.851 1 5.10536 1.10536 5.29289 1.29289L6 2H11C12.1046 2 13 2.89543 13 4V5H14C15.1046 5 16 5.89543 16 7V7.82679ZM3.75 6.5C3.33579 6.5 3 6.16421 3 5.75C3 5.33579 3.33579 5 3.75 5H11.5V4C11.5 3.72386 11.2761 3.5 11 3.5H6C5.60218 3.5 5.22064 3.34196 4.93934 3.06066L4.37868 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V13C1.5 13.2761 1.72386 13.5 2 13.5H12.0906C12.3019 13.5 12.4904 13.3672 12.5614 13.1682L14.5 7.74018V7C14.5 6.72386 14.2761 6.5 14 6.5H3.75Z" fill="currentColor"/>
    </svg>`;
    const hasCustomGroups = !!this.accountGroups && Object.keys(this.accountGroups).some(key => key !== 'all');
    
    let displayText = '';
    
    if (selectedCount === 0) {
      // No accounts selected - show default group name
      const groupName = this.getGroupDisplayName(groupKey);
      displayText = `${hasCustomGroups ? folderIcon : ''}<span style="color: var(--brand-600);">${groupName}</span>`;
    } else if (isFullGroupSelected && !this.isCustomMode) {
      // Full group selected - show group name (with folder only if custom groups exist)
      const groupName = this.getGroupDisplayName(groupKey);
      displayText = `${hasCustomGroups ? folderIcon : ''}<span style="color: var(--brand-600);">${groupName}</span>`;
    } else if (selectedCount === 1) {
      // Single account selected - show account name only (no icon)
      displayText = `<span style="color: var(--brand-600);">${selectedAccountNames[0]}</span>`;
    } else {
      // Multiple accounts selected but not a full group - show first account + more count (no parentheses)
      const firstName = selectedAccountNames[0];
      const othersCount = selectedCount - 1;
      displayText = `<span style=\"color: var(--brand-600);\">${firstName} +${othersCount} more</span>`;
    }
    
    triggerOption.innerHTML = displayText;
    
    // Recalculate position based on new trigger size - use setTimeout to ensure DOM has updated
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      setTimeout(() => {
        // Keep alignment mode locked; only recalc position relative to current trigger size
        this.positionPopover(false);
      }, 10);
    }
  }
  
  // Public method to apply selection (can be overridden)
  applySelection() {
    // Check if at least one account is selected
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    
    if (checkedCheckboxes.length === 0) {
      // Don't apply if no accounts are selected
      this.showValidationError();
      return;
    }
    
    // Hide validation error if it was showing
    this.hideValidationError();
    
    // Save the current selection state before updating trigger
    this.saveAppliedSelectionState();
    
    // Update trigger label based on current selection state
    this.updateTriggerBasedOnSelection();

    // Guard: if label becomes empty due to a transient render, restore current group label
    const triggerOption = document.getElementById(this.options.triggerOptionId);
    if (triggerOption && !triggerOption.innerHTML.trim()) {
      const restoreKey = this.isCustomMode ? 'custom' : (this.currentGroup || 'all');
      this.updateTriggerLabel(restoreKey);
    }

    // Persist last group key only when a full group is applied
    if (!this.isCustomMode) {
      this.setLastGroupKey(this.currentGroup || 'all');
    }
    
    // Set flag to indicate we're closing after applying (don't restore selection)
    this.isClosingAfterApply = true;
    this.togglePopover();
    // Override this method in implementations for custom behavior
  }
  
  // Save the current selection state for persistence across filter reopens
  saveAppliedSelectionState() {
    const accountItems = document.querySelectorAll(`#${this.options.accountsListId} .account-item`);
    
    accountItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const label = item.querySelector('label');
      
      if (checkbox && label) {
        const accountName = label.textContent.trim();
        // Find the account ID from the current organization data
        const currentOrg = window.OrgDataManager?.getCurrentOrganization();
        if (currentOrg && currentOrg.accounts) {
          const matchingAccount = currentOrg.accounts.find(acc => acc.name === accountName);
          if (matchingAccount) {
            this.appliedAccountSelection.set(matchingAccount.id, checkbox.checked);
          }
        }
      }
    });
    
    console.log('💾 Saved applied selection state:', Array.from(this.appliedAccountSelection.entries()));
  }
  
  // Update trigger label based on current selection
  updateTriggerBasedOnSelection() {
    const allCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const checkedCount = checkedCheckboxes.length;
    const totalCount = allCheckboxes.length;
    

    
    // If all visible accounts are selected, keep the current group name
    // Otherwise, show custom selection
    if (checkedCount === totalCount && checkedCount > 0) {
      // All accounts in current view are selected - keep current group label
      this.isCustomMode = false;
      this.updateTriggerLabel(this.currentGroup);
    } else {
      // Partial selection or no selection - switch to custom
      this.isCustomMode = true;
      this.updateTriggerLabel('custom');
    }
  }
  
  // Capture the current selection state (for cancel functionality)
  captureCommittedSelection() {
    const checkboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    this.committedSelection = [];
    
    checkboxes.forEach((checkbox, index) => {
      this.committedSelection.push({
        index: index,
        checked: checkbox.checked
      });
    });
    
    // Also capture the committed group and custom mode state
    this.committedGroup = this.currentGroup;
    this.committedCustomMode = this.isCustomMode;
  }
  
  // Restore the committed selection state (when canceling)
  restoreCommittedSelection() {
    if (!this.committedSelection) return;
    
    // Restore group selection and custom mode state
    if (this.committedGroup !== undefined) {
      this.currentGroup = this.committedGroup;
      this.isCustomMode = this.committedCustomMode || false;
      
      // Update group button active states
      const popover = document.getElementById(this.options.popoverId);
      if (popover) {
        // Remove active class from all group buttons
        popover.querySelectorAll('.group-item').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to the committed group button
        const activeButton = popover.querySelector(`.group-item[data-group="${this.committedGroup}"]`);
        if (activeButton) {
          activeButton.classList.add('active');
        }
      }
      
      // Re-render accounts for the committed group
      this.renderAccounts(this.committedGroup);
    }
    
    // Restore individual checkbox states
    const checkboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    
    this.committedSelection.forEach((item) => {
      if (checkboxes[item.index]) {
        checkboxes[item.index].checked = item.checked;
      }
    });
    
    // Update the visual state
    this.updateSelectionCount();
    this.updateSelectAllState();
  }
  
  // Public method to close the popover
  close() {
    // Restore the original selection when canceling
    this.restoreCommittedSelection();
    
    // Hide validation error when closing
    this.hideValidationError();
    
    const popover = document.getElementById(this.options.popoverId);
    const trigger = document.getElementById(this.options.triggerId);
    
    if (popover && trigger) {
      popover.style.display = 'none';
      trigger.classList.remove('open');
      
      // Clear stored position data when closing
      this.triggerDimensions = null;
      this.alignmentMode = 'left';
      this.alignmentLocked = false;
    }
  }
  
    // Show validation error when no accounts are selected
  showValidationError() {
    // CSS handles the tooltip display via .btn-apply.disabled:hover::after
    // No JavaScript needed for tooltip
  }

  // Hide validation error
  hideValidationError() {
    // CSS handles the tooltip display via .btn-apply.disabled:hover::after
    // No JavaScript needed for tooltip
  }
  
  // Update Apply button state based on selection
  updateApplyButtonState() {
    const applyButton = document.querySelector(`#${this.options.popoverId} .btn-apply`);
    if (!applyButton) return;
    
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const hasSelection = checkedCheckboxes.length > 0;
    
    if (hasSelection) {
      applyButton.disabled = false;
      applyButton.classList.remove('disabled');
      this.hideValidationError();
    } else {
      applyButton.disabled = true;
      applyButton.classList.add('disabled');
      this.showValidationError();
      
      // Set CSS custom properties for tooltip positioning
      const rect = applyButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const topY = rect.top;
      
      // Update CSS custom properties for the tooltip
      document.documentElement.style.setProperty('--tooltip-x', `${centerX}px`);
      document.documentElement.style.setProperty('--tooltip-y', `${topY}px`);
    }
  }
  
  // Public method to refresh the component data
  refresh() {
    // Re-generate account groups if function provided
    if (this.options.generateAccountGroups) {
      try {
        this.accountGroups = this.options.generateAccountGroups();
        // Ensure we have an 'all' group if none provided
        if (!this.accountGroups['all']) {
          this.createAllAccountsGroup();
        }
        this.rebuildGroupButtons();

        // If we were loading, clear spinner now
        if (this.isLoading && this.hasAccountData()) {
          this.setTriggerLoadingState(false);
        }

        // Use persisted last group or fall back to 'all'
        const initialGroup = this.getInitialGroupKey();
        this.currentGroup = initialGroup;
        this.renderAccounts(initialGroup);
        this.isCustomMode = false;
        this.updateTriggerLabel(initialGroup);
      } catch (error) {
        console.error('Error refreshing account groups:', error);
      }
    }
  }
  
  rebuildGroupButtons() {
    // Find the popover and groups container
    const popover = document.getElementById(this.options.popoverId);
    if (!popover) {
      console.warn('AccountGroupsFilter: Popover not found for rebuilding group buttons');
      return;
    }
    
    const groupsContainer = popover.querySelector('.groups-section');
    const accountsSection = popover.querySelector('.accounts-section');
    
    if (!groupsContainer || !accountsSection) {
      console.warn('AccountGroupsFilter: Required containers not found for rebuilding group buttons');
      return;
    }
    
    // Check if we have any custom groups (excluding 'all')
    const customGroupKeys = Object.keys(this.accountGroups).filter(key => key !== 'all');
    const hasCustomGroups = customGroupKeys.length > 0;
    
    if (!hasCustomGroups) {
      // No custom groups - hide the groups section and show only accounts
      groupsContainer.style.display = 'none';
      accountsSection.style.width = '100%';
      
      // Create an "all" group with all available accounts
      this.createAllAccountsGroup();
      this.currentGroup = 'all';
      this.renderAccounts('all');
      
      console.log('🔄 No custom groups found - showing all accounts only');
      return;
    }
    
    // Has custom groups - show the groups section
    groupsContainer.style.display = '';
    accountsSection.style.width = '';
    
    // Preserve the header and search bar
    const header = groupsContainer.querySelector('.groups-header');
    const searchBar = groupsContainer.querySelector('.search-bar');
    
    // Clear existing buttons but preserve header and search
    groupsContainer.innerHTML = '';
    
    // Re-add header if it existed
    if (header) {
      groupsContainer.appendChild(header);
    } else {
      // Create header if it doesn't exist
      const headerHTML = `
        <div class="groups-header">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px; flex-shrink: 0;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.82679C16 7.94141 15.9803 8.05518 15.9417 8.16312L13.974 13.6727C13.6898 14.4687 12.9358 15 12.0906 15H2C0.895431 15 0 14.1046 0 13V3C0 1.89543 0.89543 1 2 1H4.58579C4.851 1 5.10536 1.10536 5.29289 1.29289L6 2H11C12.1046 2 13 2.89543 13 4V5H14C15.1046 5 16 5.89543 16 7V7.82679ZM3.75 6.5C3.33579 6.5 3 6.16421 3 5.75C3 5.33579 3.33579 5 3.75 5H11.5V4C11.5 3.72386 11.2761 3.5 11 3.5H6C5.60218 3.5 5.22064 3.34196 4.93934 3.06066L4.37868 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V13C1.5 13.2761 1.72386 13.5 2 13.5H12.0906C12.3019 13.5 12.4904 13.3672 12.5614 13.1682L14.5 7.74018V7C14.5 6.72386 14.2761 6.5 14 6.5H3.75Z" fill="currentColor"/>
          </svg>
          Groups
        </div>
      `;
      groupsContainer.insertAdjacentHTML('afterbegin', headerHTML);
    }
    
    // Re-add search bar if it existed
    if (searchBar) {
      groupsContainer.appendChild(searchBar);
    }
    
    // Always create "All" button first
    this.createAllAccountsGroup();
    const allButton = document.createElement('button');
    allButton.className = 'group-item active';
    allButton.setAttribute('data-group', 'all');
    
    // Get count for All group
    const allGroupData = this.accountGroups['all'];
    const allAccountsCount = allGroupData?.accounts ? allGroupData.accounts.length : (allGroupData?.length || 0);
    
    allButton.innerHTML = `
      <span class="group-label">All</span>
      <span class="group-count">${allAccountsCount}</span>
    `;
    
    // Add click handler for All button
    allButton.addEventListener('click', (e) => {
      // Remove active class from all buttons
      groupsContainer.querySelectorAll('.group-item').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      allButton.classList.add('active');
      
      // Render accounts for All group
      this.renderAccounts('all');
    });
    
    groupsContainer.appendChild(allButton);
    
    // Set current group to 'all' by default
    this.currentGroup = 'all';
    
    // Create buttons for each custom account group (order handled by data provider)
    // The data provider now respects custom order from drag/drop operations
    customGroupKeys.forEach((groupKey) => {
      const button = document.createElement('button');
      button.className = 'group-item';
      button.setAttribute('data-group', groupKey);
      
      // Use consistent display name function
      const displayName = this.getGroupDisplayName(groupKey);
      
      // Get count for this group
      const groupData = this.accountGroups[groupKey];
      const groupAccountsCount = groupData?.accounts ? groupData.accounts.length : (groupData?.length || 0);
      
      button.innerHTML = `
        <span class="group-label">${displayName}</span>
        <span class="group-count">${groupAccountsCount}</span>
      `;
      
      // Add click handler
      button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        groupsContainer.querySelectorAll('.group-item').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Reset custom mode and render accounts for selected group
        this.currentGroup = groupKey;
        this.isCustomMode = false;
        this.renderAccounts(groupKey);
      });
      
      groupsContainer.appendChild(button);
    });
    
    console.log('🔄 Rebuilt group buttons with All + custom groups:', ['all', ...customGroupKeys]);
  }
  
  createAllAccountsGroup() {
    // Create an "all" group containing all available accounts from OrgDataManager
    if (window.OrgDataManager) {
      const currentOrg = window.OrgDataManager.getCurrentOrganization();
      if (currentOrg && currentOrg.accounts) {
        const allAccounts = currentOrg.accounts
          .filter(acc => !acc.isAggregate)
          .map((acc, index) => ({
            name: acc.name,
            initials: this.generateInitials(acc.name),
            color: this.convertHexToColorClass(acc.color) || (index % 2 === 0 ? 'blue' : 'green'),
            backgroundColor: acc.color,
            checked: this.appliedAccountSelection.has(acc.id) ? this.appliedAccountSelection.get(acc.id) : true,
            id: acc.id,
            type: acc.type || 'Account'
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.accountGroups['all'] = allAccounts;
        
        // Debug log to show state restoration
        const checkedAccounts = allAccounts.filter(acc => acc.checked).map(acc => acc.name);
        const uncheckedAccounts = allAccounts.filter(acc => !acc.checked).map(acc => acc.name);
        if (this.appliedAccountSelection.size > 0) {
          console.log('🔄 Restored account selection state:', {
            checked: checkedAccounts,
            unchecked: uncheckedAccounts
          });
        }
      }
    }
  }
  
  generateInitials(name) {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  }
  
  convertHexToColorClass(hexColor) {
    if (!hexColor) return null;
    
    const colorMap = {
      '#3B82F6': 'blue',
      '#10B981': 'green', 
      '#F59E0B': 'orange',
      '#EF4444': 'red',
      '#8B5CF6': 'purple',
      '#06B6D4': 'cyan',
      '#84CC16': 'lime',
      '#F97316': 'amber'
    };
    
    return colorMap[hexColor.toUpperCase()] || null;
  }
  
  checkAccountsListOverflow() {
    // Check if the accounts list overflows and show/hide shadow accordingly
    const accountsList = document.getElementById(this.options.accountsListId);
    const accountsSection = accountsList?.closest('.accounts-section');
    
    if (!accountsList || !accountsSection) {
      return;
    }
    
    // Use setTimeout to ensure DOM has updated after rendering
    setTimeout(() => {
      const hasOverflow = accountsList.scrollHeight > accountsList.clientHeight;
      
      if (hasOverflow) {
        accountsSection.classList.add('has-overflow');
      } else {
        accountsSection.classList.remove('has-overflow');
      }
    }, 10);
  }
} 