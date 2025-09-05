/**
 * Group Creation Modal Component
 * Simplified 2-step flow for creating account groups
 * Step 1: Group name and description
 * Step 2: Account selection with dual-panel interface
 */

class GroupCreationModal {
  constructor() {
    this.currentStep = 1;
    this.groupData = {
      name: '',
      description: '',
      selectedAccounts: [],
    };
    this.modal = null;
    this.onComplete = null;
    this.searchQuery = '';
  }

  show(options = {}) {
    this.onComplete = options.onComplete;
    this.currentStep = 1;
    this.groupData = {
      name: '',
      description: '',
      selectedAccounts: [],
    };
    this.searchQuery = '';
    
    this.createModal();
    this.renderStep1();
    document.body.appendChild(this.modal);
    
    // Animate in
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'group-creation-modal';
    this.modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-header-content">
            <h2 class="modal-title">Create account group</h2>
            <p class="modal-subtitle">Organize accounts with flexible groupings for filtering and reporting.</p>
          </div>
          <button class="modal-close" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="step-content"></div>
        </div>
        <div class="modal-footer">
          <div class="footer-actions">
            <button class="btn btn-secondary step-back" style="display: none;">Back</button>
            <button class="btn btn-primary step-next">Next</button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());
    this.modal.querySelector('.step-next').addEventListener('click', () => this.handleNext());
    this.modal.querySelector('.step-back').addEventListener('click', () => this.handleBack());
  }

  renderStep1() {
    const stepContent = this.modal.querySelector('.step-content');
    
    stepContent.innerHTML = `
      <div class="form-section">
        <label class="form-label" for="group-name">Group name</label>
        <input 
          type="text" 
          id="group-name" 
          class="form-input" 
          placeholder="North America"
          value="${this.groupData.name}"
          maxlength="50"
        >
      </div>

      <div class="form-section">
        <label class="form-label" for="group-description">Description <span style="color: var(--neutral-500); font-weight: 400;">(optional)</span></label>
        <textarea 
          id="group-description" 
          class="form-textarea" 
          placeholder="Add a description to help others understand this group's purpose"
          rows="3"
          maxlength="150"
        >${this.groupData.description}</textarea>
        <div class="form-help">
          <span id="char-count">${this.groupData.description.length}</span>/150 characters
        </div>
      </div>
    `;

    // Add event listeners for form inputs
    const nameInput = this.modal.querySelector('#group-name');
    const descInput = this.modal.querySelector('#group-description');
    const charCount = this.modal.querySelector('#char-count');
    
    nameInput.addEventListener('input', (e) => {
      this.groupData.name = e.target.value;
      this.updateNextButton();
    });

    descInput.addEventListener('input', (e) => {
      this.groupData.description = e.target.value;
      charCount.textContent = e.target.value.length;
      
      // Update character count color based on limit
      if (e.target.value.length > 140) {
        charCount.style.color = 'var(--critical-600)';
      } else if (e.target.value.length > 120) {
        charCount.style.color = 'var(--attention-600)';
      } else {
        charCount.style.color = 'var(--neutral-600)';
      }
    });

    // Update header for Step 1
    this.updateModalHeader();
    
    // Focus the name input
    setTimeout(() => nameInput.focus(), 100);
    
    this.updateNextButton();
  }

  renderStep2() {
    const stepContent = this.modal.querySelector('.step-content');
    const availableAccounts = this.getAvailableAccounts();
    const filteredAccounts = this.filterAccounts(availableAccounts);
    const selectedCount = this.groupData.selectedAccounts.length;

    stepContent.innerHTML = `
      <div class="dual-panel-container">
        <div class="account-list-panel">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input filter" 
              placeholder="Search"
              value="${this.searchQuery || ''}"
            >
          </div>
          
          <div class="account-list">
            <div class="select-all-item">
              <label class="checkbox-container">
                <input type="checkbox" class="select-all-checkbox">
                <span class="checkmark"></span>
                <span class="select-all-content">
                  <span class="select-all-text">Select all</span>
                  <span class="select-count">${selectedCount} selected</span>
                </span>
              </label>
            </div>
            
            ${filteredAccounts.map(account => `
              <div class="account-item" data-account-id="${account.id}">
                <label class="checkbox-container">
                  <input 
                    type="checkbox" 
                    ${this.groupData.selectedAccounts.includes(account.id) ? 'checked' : ''}
                  >
                  <span class="checkmark"></span>
                  <span class="account-content">
                    <span class="account-icon ${account.type}"></span>
                    <span class="account-name">${account.name}</span>
                  </span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="preview-panel">
          <div class="preview-header">
            <h3 class="preview-title">${this.groupData.name || 'New Group'}</h3>
          </div>
          <div class="preview-content">
            ${this.renderPreviewContent()}
          </div>
        </div>
      </div>
    `;

    // Update header for Step 2
    this.updateModalHeader();
    
    // Add event listeners
    this.addStep2EventListeners();
    this.updateSelectAllState();
    this.updateNextButton();
  }

  renderAccountsList(accounts) {
    if (accounts.length === 0) {
      return `<div class="empty-selection">
        <div class="empty-selection-text">No accounts found</div>
      </div>`;
    }

    return accounts.map(account => `
      <label class="account-option ${this.selectedAccounts.has(account.id) ? 'selected' : ''}" 
             data-account-id="${account.id}">
        <input type="checkbox" ${this.selectedAccounts.has(account.id) ? 'checked' : ''}>
        <div class="account-info">
          <div class="account-name">${account.name}</div>
          <div class="account-type">${account.type}</div>
        </div>
      </label>
    `).join('');
  }

  renderSelectedAccountsTree() {
    if (this.selectedAccounts.size === 0) {
      return `<div class="empty-selection">
        <div class="empty-selection-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
        <div class="empty-selection-text">Select accounts to see them here</div>
      </div>`;
    }

    const selectedAccountData = this.getAvailableAccounts()
      .filter(account => this.selectedAccounts.has(account.id));

    return selectedAccountData.map(account => `
      <div class="tree-item">
        ${account.name}
        <span style="color: var(--neutral-500); font-size: 12px; margin-left: 8px;">(${account.type})</span>
      </div>
    `).join('');
  }

  addStep2EventListeners() {
    // Remove existing listeners to prevent duplicates
    this.removeStep2EventListeners();
    
    // Search input listener
    const searchInput = this.modal.querySelector('.search-input');
    if (searchInput) {
      this.searchInputHandler = (e) => {
        this.searchQuery = e.target.value;
        this.updateAccountsList();
      };
      searchInput.addEventListener('input', this.searchInputHandler);
    }
    
    // Select all checkbox listener
    const selectAllCheckbox = this.modal.querySelector('.select-all-checkbox');
    if (selectAllCheckbox) {
      this.selectAllHandler = (e) => {
        const accountCheckboxes = this.modal.querySelectorAll('.account-item input[type="checkbox"]');
        const shouldCheck = e.target.checked;
        
        accountCheckboxes.forEach(checkbox => {
          checkbox.checked = shouldCheck;
          const accountId = checkbox.closest('.account-item').dataset.accountId;
          
          if (shouldCheck && !this.groupData.selectedAccounts.includes(accountId)) {
            this.groupData.selectedAccounts.push(accountId);
          } else if (!shouldCheck) {
            const index = this.groupData.selectedAccounts.indexOf(accountId);
            if (index > -1) {
              this.groupData.selectedAccounts.splice(index, 1);
            }
          }
        });
        
        this.updatePreviewContent();
        this.updateSelectAllState();
        this.updateNextButton();
      };
      selectAllCheckbox.addEventListener('change', this.selectAllHandler);
    }
    
    // Use event delegation for account checkboxes to handle dynamic content
    const accountList = this.modal.querySelector('.account-list');
    if (accountList) {
      this.accountListHandler = (e) => {
        if (e.target.type === 'checkbox' && e.target.closest('.account-item')) {
          const accountItem = e.target.closest('.account-item');
          const accountId = accountItem.dataset.accountId;
          
          if (e.target.checked && !this.groupData.selectedAccounts.includes(accountId)) {
            this.groupData.selectedAccounts.push(accountId);
          } else if (!e.target.checked) {
            const index = this.groupData.selectedAccounts.indexOf(accountId);
            if (index > -1) {
              this.groupData.selectedAccounts.splice(index, 1);
            }
          }
          
          this.updatePreviewContent();
          this.updateSelectAllState();
          this.updateNextButton();
        }
      };
      accountList.addEventListener('change', this.accountListHandler);
    }
  }

  removeStep2EventListeners() {
    // Only try to remove listeners if modal exists and handlers are defined
    if (!this.modal) return;
    
    // Remove search input listener
    if (this.searchInputHandler) {
      const searchInput = this.modal.querySelector('.search-input');
      if (searchInput) {
        searchInput.removeEventListener('input', this.searchInputHandler);
      }
      this.searchInputHandler = null;
    }
    
    // Remove select all listener
    if (this.selectAllHandler) {
      const selectAllCheckbox = this.modal.querySelector('.select-all-checkbox');
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener('change', this.selectAllHandler);
      }
      this.selectAllHandler = null;
    }
    
    // Remove account list listener
    if (this.accountListHandler) {
      const accountList = this.modal.querySelector('.account-list');
      if (accountList) {
        accountList.removeEventListener('change', this.accountListHandler);
      }
      this.accountListHandler = null;
    }
  }

  refreshAccountsList() {
    const availableAccounts = this.getAvailableAccounts();
    const filteredAccounts = this.filterAccounts(availableAccounts);
    const accountsList = this.modal.querySelector('.accounts-list');
    
    accountsList.innerHTML = this.renderAccountsList(filteredAccounts);
    // Don't re-add event listeners - using event delegation now
    this.updateSelectAllState();
    this.updatePreviewContent();
  }

  updateSelectionSummary() {
    const selectedCountEl = this.modal.querySelector('.selected-count');
    if (selectedCountEl) {
      selectedCountEl.textContent = this.selectedAccounts.size;
    }
  }

  updateSelectedAccountsTree() {
    const treeContent = this.modal.querySelector('.tree-content');
    const treeCount = this.modal.querySelector('.tree-count');
    
    if (treeContent) {
      treeContent.innerHTML = this.renderSelectedAccountsTree();
    }
    if (treeCount) {
      treeCount.textContent = `(${this.selectedAccounts.size})`;
    }
  }

  filterAccounts(accounts) {
    if (!this.searchTerm) return accounts;
    
    return accounts.filter(account => 
      account.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      account.type.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getAvailableAccounts() {
    let accounts = [];
    
    // Try to get accounts from various sources
    if (window.mockAccountData) {
      accounts = window.mockAccountData;
    } else if (window.OrgDataManager && typeof window.OrgDataManager.getAllSubAccounts === 'function') {
      const allAccounts = window.OrgDataManager.getAllSubAccounts();
      accounts = allAccounts.filter(acc => !acc.isAggregate);
    } else {
      // Fallback demo data matching the reference design
      accounts = [
        { id: 'acc_1', name: 'Acme Deliveries CA', type: 'deliveries' },
        { id: 'acc_2', name: 'Acme Deliveries UK', type: 'deliveries' },
        { id: 'acc_3', name: 'Acme Deliveries US', type: 'deliveries' },
        { id: 'acc_4', name: 'Acme Eats CA', type: 'eats' },
        { id: 'acc_5', name: 'Acme Eats UK', type: 'eats' },
        { id: 'acc_6', name: 'Acme Eats US', type: 'eats' },
        { id: 'acc_7', name: 'Acme Rides CA', type: 'rides' },
        { id: 'acc_8', name: 'Acme Rides UK', type: 'rides' }
      ];
    }

    // Sort accounts alphabetically by name for better UX in step 2
    return accounts.sort((a, b) => a.name.localeCompare(b.name));
  }

  updateModalHeader() {
    const titleElement = this.modal.querySelector('.modal-title');
    const subtitleElement = this.modal.querySelector('.modal-subtitle');
    const modalContent = this.modal.querySelector('.modal-content');
    
    if (this.currentStep === 1) {
      titleElement.textContent = 'Create account group';
      subtitleElement.textContent = 'Organize accounts with flexible groupings for filtering and reporting.';
      modalContent.className = 'modal-content small';
    } else if (this.currentStep === 2) {
      titleElement.textContent = 'Add accounts';
      subtitleElement.textContent = 'Lorem ipsum dolor';
      modalContent.className = 'modal-content large';
    }
  }

  updateStepIndicator() {
    const step1 = this.modal.querySelector('.step-1');
    const step2 = this.modal.querySelector('.step-2');
    
    if (this.currentStep === 1) {
      step1.classList.add('active');
      step1.classList.remove('completed');
      step2.classList.remove('active');
    } else if (this.currentStep === 2) {
      step1.classList.remove('active');
      step1.classList.add('completed');
      step2.classList.add('active');
    }
  }

  updateNextButton() {
    const nextButton = this.modal.querySelector('.step-next');
    const backButton = this.modal.querySelector('.step-back');
    
    if (this.currentStep === 1) {
      nextButton.textContent = 'Next';
      // Only require group name, description is optional
      nextButton.disabled = !this.groupData.name.trim();
      backButton.style.display = 'none';
    } else if (this.currentStep === 2) {
      nextButton.textContent = 'Done';
      nextButton.disabled = this.groupData.selectedAccounts.length === 0;
      backButton.style.display = 'block';
    }
  }

  renderPreviewContent() {
    const selectedAccounts = this.groupData.selectedAccounts;
    
    if (selectedAccounts.length === 0) {
      return `<div class="preview-placeholder">Select an account</div>`;
    }
    
    const availableAccounts = this.getAvailableAccounts();
    const selectedAccountsData = availableAccounts.filter(acc => 
      selectedAccounts.includes(acc.id)
    );
    
    return `
      <div class="preview-list">
        ${selectedAccountsData.map(account => `
          <div class="preview-item">
            <span class="account-icon ${account.type}"></span>
            <span class="account-name">${account.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  updateSelectAllState() {
    const selectAllCheckbox = this.modal.querySelector('.select-all-checkbox');
    const accountCheckboxes = this.modal.querySelectorAll('.account-item input[type="checkbox"]');
    const selectCountEl = this.modal.querySelector('.select-count');
    
    if (!selectAllCheckbox || !accountCheckboxes.length) return;
    
    const checkedCount = Array.from(accountCheckboxes).filter(cb => cb.checked).length;
    const totalCount = accountCheckboxes.length;
    
    // Update select all checkbox state
    if (checkedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === totalCount) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
    
    // Update count display
    if (selectCountEl) {
      selectCountEl.textContent = `${checkedCount} selected`;
    }
  }

  updatePreviewContent() {
    const previewContent = this.modal.querySelector('.preview-content');
    if (previewContent) {
      previewContent.innerHTML = this.renderPreviewContent();
    }
  }

  updateAccountsList() {
    const availableAccounts = this.getAvailableAccounts();
    const filteredAccounts = this.filterAccounts(availableAccounts);
    const accountList = this.modal.querySelector('.account-list');
    
    if (accountList) {
      // Re-render the account items
      const accountItems = filteredAccounts.map(account => `
        <div class="account-item" data-account-id="${account.id}">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              ${this.groupData.selectedAccounts.includes(account.id) ? 'checked' : ''}
            >
            <span class="checkmark"></span>
            <span class="account-content">
              <span class="account-icon ${account.type}"></span>
              <span class="account-name">${account.name}</span>
            </span>
          </label>
        </div>
      `).join('');
      
      // Update just the account items, keep select all
      const selectAllItem = accountList.querySelector('.select-all-item');
      accountList.innerHTML = selectAllItem.outerHTML + accountItems;
      
      // Update select all state and preview (no need to re-add listeners due to event delegation)
      this.updateSelectAllState();
      this.updatePreviewContent();
    }
  }

  filterAccounts(accounts) {
    if (!this.searchQuery) return accounts;
    
    return accounts.filter(account => 
      account.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  handleNext() {
    if (this.currentStep === 1) {
      if (!this.groupData.name.trim()) {
        this.showError('Please enter a group name');
        return;
      }
      // Description is optional, no validation needed
      this.currentStep = 2;
      this.renderStep2();
    } else if (this.currentStep === 2) {
      if (this.groupData.selectedAccounts.length === 0) {
        this.showError('Please select at least one account');
        return;
      }
      this.createGroup();
    }
  }

  handleBack() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.renderStep1();
    }
  }

  createGroup() {
    try {
      // selectedAccounts is already an array, no need to convert
      
      // If there's an external data manager, use it
      if (window.OrgDataManager && typeof window.OrgDataManager.createAccountGroup === 'function') {
        const group = window.OrgDataManager.createAccountGroup(this.groupData);
        
        if (this.onComplete) {
          this.onComplete(group);
        }
      } else {
        // Fallback for demo/development
        const group = {
          id: `group_${Date.now()}`,
          name: this.groupData.name,
          description: this.groupData.description,
          accountIds: this.groupData.selectedAccounts,
          createdAt: new Date().toISOString()
        };
        
        if (this.onComplete) {
          this.onComplete(group);
        }
      }
      
      this.close();
      this.showNotification('Account group created successfully', 'success');
      
    } catch (error) {
      console.error('Error creating group:', error);
      this.showError(error.message || 'Failed to create account group');
    }
  }

  close() {
    // Clean up event listeners
    this.removeStep2EventListeners();
    
    this.modal.classList.remove('show');
    
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      
      // Reset state (handler references already cleared in removeStep2EventListeners)
      this.currentStep = 1;
      this.groupData = {
        name: '',
        description: '',
        selectedAccounts: [],
      };
      this.searchQuery = '';
    }, 300);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6B7280'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Global instance
window.GroupCreationModal = new GroupCreationModal();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroupCreationModal;
}