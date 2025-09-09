/**
 * Account Group Creation Modal - 2-step flow for UXR prototype
 * Step 1: Dual-panel account selection with tree visualization
 * Step 2: Group name and type selection
 */

class GroupCreationModal {
  constructor() {
    this.currentStep = 1;
    this.groupData = {
      name: '',
      type: '',
      accountIds: [],
      description: ''
    };
    this.modal = null;
    this.onComplete = null;
  }

  show(options = {}) {
    this.onComplete = options.onComplete;
    this.currentStep = 1;
    this.groupData = {
      name: '',
      type: '',
      accountIds: [],
      description: ''
    };
    
    this.createModal();
    this.renderStep2();
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
          <h2 class="modal-title">Create account group</h2>
          <button class="modal-close" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="step-indicator">
            <div class="step step-1 active">
              <span class="step-number">1</span>
              <span class="step-label">Add accounts</span>
            </div>
            <div class="step-divider"></div>
            <div class="step step-2">
              <span class="step-number">2</span>
              <span class="step-label">Group details</span>
            </div>
          </div>
          <div class="step-content"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">Cancel</button>
          <div class="footer-actions">
            <button class="btn btn-secondary step-back" style="display: none;">Back</button>
            <button class="btn btn-primary step-next">Next</button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-cancel').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());
    this.modal.querySelector('.step-next').addEventListener('click', () => this.handleNext());
    this.modal.querySelector('.step-back').addEventListener('click', () => this.handleBack());
  }

  renderStep1() {
    const groupTypes = window.OrgDataManager.getGroupTypesConfig();
    const stepContent = this.modal.querySelector('.step-content');
    
    stepContent.innerHTML = `
      <div class="form-section">
        <label class="form-label" for="group-name">Group name</label>
        <input 
          type="text" 
          id="group-name" 
          class="form-input" 
          placeholder="Enter group name"
          value="${this.groupData.name}"
          maxlength="50"
        >
        <div class="form-help">Choose a descriptive name for your account group</div>
      </div>

      <div class="form-section">
        <label class="form-label">Group type</label>
        <div class="group-type-options">
          ${Object.values(groupTypes).map(type => `
            <div class="group-type-option ${this.groupData.type === type.id ? 'selected' : ''}" 
                 data-type="${type.id}">
              <div class="type-header">
                <div class="type-icon">
                  ${this.getTypeIcon(type.icon)}
                </div>
                <div class="type-info">
                  <div class="type-name">${type.name}</div>
                  <div class="type-description">${type.description}</div>
                </div>
                <div class="type-radio">
                  <input type="radio" name="group-type" value="${type.id}" 
                         ${this.groupData.type === type.id ? 'checked' : ''}>
                </div>
              </div>
              <div class="type-use-cases">
                <div class="use-cases-label">Common use cases:</div>
                <ul class="use-cases-list">
                  ${type.useCases.map(useCase => `<li>${useCase}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-section">
        <label class="form-label" for="group-description">Description (optional)</label>
        <textarea 
          id="group-description" 
          class="form-textarea" 
          placeholder="Add a description to help others understand this group's purpose"
          rows="3"
          maxlength="200"
        >${this.groupData.description}</textarea>
      </div>
    `;

    // Event listeners for step 1
    const nameInput = stepContent.querySelector('#group-name');
    const descriptionInput = stepContent.querySelector('#group-description');
    const typeOptions = stepContent.querySelectorAll('.group-type-option');

    nameInput.addEventListener('input', (e) => {
      this.groupData.name = e.target.value;
      this.updateNextButton();
    });

    descriptionInput.addEventListener('input', (e) => {
      this.groupData.description = e.target.value;
    });

    typeOptions.forEach(option => {
      option.addEventListener('click', () => {
        typeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        option.querySelector('input[type="radio"]').checked = true;
        this.groupData.type = option.dataset.type;
        this.updateNextButton();
      });
    });

    // Update step indicator
    this.modal.querySelector('.step-1').classList.remove('active');
    this.modal.querySelector('.step-2').classList.add('active');
    
    // Update footer buttons
    this.modal.querySelector('.step-back').style.display = 'inline-block';
    this.modal.querySelector('.step-next').textContent = 'Create group';

    this.updateNextButton();
  }

  renderStep2() {
    const stepContent = this.modal.querySelector('.step-content');
    
    // Clean up any existing event listeners by re-creating the content
    stepContent.innerHTML = '';
    
    const eligibleAccounts = window.OrgDataManager.getEligibleAccounts(this.groupData.type);
    // Sort accounts alphabetically for better UX
    eligibleAccounts.sort((a, b) => a.name.localeCompare(b.name));
    const selectedIds = new Set(this.groupData.accountIds);

    stepContent.innerHTML = `
      <div class="step2-container">
        <div class="accounts-selection-panel">
          <div class="panel-header">
            <h3>Select accounts</h3>
            <div class="selection-summary">
              <span class="selected-count">${selectedIds.size}</span> of 
              <span class="total-count">${eligibleAccounts.length}</span> accounts selected
            </div>
          </div>
          
          <div class="accounts-search">
            <input type="text" placeholder="Search accounts..." class="search-input">
          </div>
          
          <div class="accounts-list">
            ${eligibleAccounts.map(account => `
              <label class="account-option ${selectedIds.has(account.id) ? 'selected' : ''}" 
                     data-account-id="${account.id}">
                <input type="checkbox" ${selectedIds.has(account.id) ? 'checked' : ''}>
                <div class="account-info">
                  <div class="account-name">${account.name}</div>
                  <div class="account-type">${account.type}</div>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="group-preview-panel">
          <div class="panel-header">
            <h3>${this.groupData.name}</h3>
            <div class="group-type-badge ${this.groupData.type}">
              ${window.OrgDataManager.getGroupTypesConfig()[this.groupData.type.toUpperCase()]?.name || this.groupData.type}
            </div>
          </div>
          
          <div class="selected-accounts-tree">
            <div class="tree-header">
              <span class="tree-title">Selected accounts</span>
              <span class="tree-count">(${selectedIds.size})</span>
            </div>
            <div class="tree-content">
              ${selectedIds.size === 0 ? 
                '<div class="empty-state">No accounts selected</div>' :
                this.renderAccountsTree(Array.from(selectedIds))
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners for step 2
    const searchInput = stepContent.querySelector('.search-input');
    const accountOptions = stepContent.querySelectorAll('.account-option');

    searchInput.addEventListener('input', (e) => {
      this.filterAccounts(e.target.value.toLowerCase());
    });

    accountOptions.forEach(option => {
      const checkbox = option.querySelector('input[type="checkbox"]');
      const accountId = option.dataset.accountId;

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          // Prevent duplicate account IDs
          if (!this.groupData.accountIds.includes(accountId)) {
            this.groupData.accountIds.push(accountId);
          } else {
            console.warn('🐛 Prevented duplicate account selection:', accountId);
          }
          option.classList.add('selected');
        } else {
          this.groupData.accountIds = this.groupData.accountIds.filter(id => id !== accountId);
          option.classList.remove('selected');
        }
        this.updatePreviewPanel();
        this.updateNextButton();
      });
    });

    // Update step indicator
    this.modal.querySelector('.step-2').classList.remove('active');
    this.modal.querySelector('.step-1').classList.add('active');
    
    // Update footer buttons
    this.modal.querySelector('.step-back').style.display = 'none';
    this.modal.querySelector('.step-next').textContent = 'Next';
  }

  renderAccountsTree(accountIds) {
    const accounts = window.OrgDataManager.getCurrentAccounts()
      .filter(acc => accountIds.includes(acc.id));
    
    // Group by account type for better visualization
    const groupedAccounts = accounts.reduce((groups, account) => {
      const type = account.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(account);
      return groups;
    }, {});

    return Object.entries(groupedAccounts).map(([type, accs]) => `
      <div class="tree-group">
        <div class="tree-group-header">${type} (${accs.length})</div>
        <div class="tree-group-items">
          ${accs.map(acc => `
            <div class="tree-item">
              <div class="tree-item-name">${acc.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  filterAccounts(searchTerm) {
    const accountOptions = this.modal.querySelectorAll('.account-option');
    accountOptions.forEach(option => {
      const accountName = option.querySelector('.account-name').textContent.toLowerCase();
      const accountType = option.querySelector('.account-type').textContent.toLowerCase();
      const matches = accountName.includes(searchTerm) || accountType.includes(searchTerm);
      option.style.display = matches ? 'flex' : 'none';
      
      // Ensure selection state remains consistent when filtering
      const accountId = option.dataset.accountId;
      const checkbox = option.querySelector('input[type="checkbox"]');
      const isSelected = this.groupData.accountIds.includes(accountId);
      
      if (checkbox.checked !== isSelected) {
        checkbox.checked = isSelected;
        option.classList.toggle('selected', isSelected);
      }
    });
  }

  updatePreviewPanel() {
    const treeContent = this.modal.querySelector('.tree-content');
    const selectedCount = this.modal.querySelector('.selected-count');
    const treeCount = this.modal.querySelector('.tree-count');
    
    selectedCount.textContent = this.groupData.accountIds.length;
    treeCount.textContent = `(${this.groupData.accountIds.length})`;
    
    if (this.groupData.accountIds.length === 0) {
      treeContent.innerHTML = '<div class="empty-state">No accounts selected</div>';
    } else {
      treeContent.innerHTML = this.renderAccountsTree(this.groupData.accountIds);
    }
  }

  updateNextButton() {
    const nextButton = this.modal.querySelector('.step-next');
    
    if (this.currentStep === 1) {
      const canProceed = this.groupData.accountIds.length > 0;
      nextButton.disabled = !canProceed;
    } else if (this.currentStep === 2) {
      const canCreate = this.groupData.name.trim() && this.groupData.type;
      nextButton.disabled = !canCreate;
    }
  }

  handleNext() {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      this.renderStep1();
    } else if (this.currentStep === 2) {
      this.createGroup();
    }
  }

  handleBack() {
    this.currentStep = 1;
    this.renderStep2();
    
    // Update step indicator
    this.modal.querySelector('.step-2').classList.remove('active');
    this.modal.querySelector('.step-1').classList.add('active');
    
    // Update footer buttons
    this.modal.querySelector('.step-back').style.display = 'none';
    this.modal.querySelector('.step-next').textContent = 'Next';
  }

  createGroup() {
    try {
      const group = window.OrgDataManager.createAccountGroup(this.groupData);
      
      if (this.onComplete) {
        this.onComplete(group);
      }
      
      this.close();
      
      // Show success notification
      this.showNotification('Account group created successfully', 'success');
      
    } catch (error) {
      console.error('Error creating group:', error);
      // Show specific error message from validation
      this.showNotification(error.message || 'Failed to create account group', 'error');
    }
  }

  close() {
    this.modal.classList.remove('show');
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
    }, 300);
  }

  getTypeIcon(iconName) {
    const icons = {
      folder: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h3.879a1.5 1.5 0 0 1 1.06.44L10.5 4.5H14a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 14 14.5H2.5A1.5 1.5 0 0 1 1 13V3.5Z" stroke="currentColor" fill="none"/>
      </svg>`,
      users: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 14c0-2.21 1.79-4 4-4s4 1.79 4 4M11 4a2 2 0 1 0 0 4M14 14c0-1.1-.45-2.1-1.17-2.83" stroke="currentColor" fill="none"/>
      </svg>`
    };
    return icons[iconName] || icons.folder;
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
      z-index: 10000;
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