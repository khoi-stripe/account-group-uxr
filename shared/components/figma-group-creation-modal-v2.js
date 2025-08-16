/**
 * Figma Group Creation Modal Component
 * Based on Figma designs from Orgs Multi-account views
 */

class FigmaGroupCreationModalV2 {
    constructor() {
        this.currentStep = 1;
        this.selectedAccounts = new Set();
        this.groupData = { name: '', description: '' };
        this.onComplete = null;
        this.accounts = [];
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.loadAccounts();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="figma-modal-backdrop" id="figmaModalBackdrop-v2" style="display: none;">
                <div class="figma-modal">
                    <!-- Step 1: Create Group -->
                    <div class="figma-step active" data-step="1">
                        <div class="figma-modal-header">
                            <div>
                                <h2 class="figma-modal-title">Create an account group</h2>
                                <p class="figma-modal-subtitle">Organize accounts for filtering and management</p>
                            </div>
                            <button class="figma-modal-close" data-action="close">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="figma-modal-content">
                            <div class="figma-form-group">
                                <label class="figma-form-label" for="figmaGroupName-v2">Group name</label>
                                <input type="text" id="figmaGroupName-v2" class="figma-form-input" placeholder="e.g. North America">
                            </div>
                            
                            <div class="figma-form-group">
                                <label class="figma-form-label" for="figmaGroupDescription-v2">Description</label>
                                <textarea id="figmaGroupDescription-v2" class="figma-form-textarea" placeholder="e.g. Reporting"></textarea>
                            </div>
                        </div>
                        
                        <div class="figma-modal-footer">
                            <button class="figma-btn figma-btn-primary" data-action="next">Next</button>
                        </div>
                    </div>

                    <!-- Step 2: Add Accounts -->
                    <div class="figma-step" data-step="2">
                        <div class="figma-modal-header">
                            <div>
                                <button class="figma-back-btn" data-action="back">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Back
                                </button>
                                <h2 class="figma-modal-title">Add accounts</h2>
                                <p class="figma-modal-subtitle">Select accounts to include in this group</p>
                            </div>
                            <button class="figma-modal-close" data-action="close">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="figma-modal-content">
                            <div class="figma-accounts-container">
                                <div class="figma-accounts-left">
                                    <div class="figma-search-container">
                                        <input type="text" class="figma-search-input" placeholder="Search" id="figmaAccountSearch-v2">
                                    </div>
                                    
                                    <div class="figma-accounts-table">
                                        <div class="figma-select-all">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <input type="checkbox" id="figmaSelectAllAccounts-v2">
                                                <label for="figmaSelectAllAccounts-v2">Select all</label>
                                            </div>
                                            <span style="font-size: 14px; color: #596171;" id="figmaSelectedCount-v2">0 selected</span>
                                        </div>
                                        
                                        <div class="figma-accounts-list" id="figmaAccountsList-v2">
                                            <!-- Accounts will be populated by JavaScript -->
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="figma-accounts-right">
                                    <div class="figma-group-preview">
                                        <div class="figma-group-preview-icon">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 4.5C2 3.67157 2.67157 3 3.5 3H5.87868C6.44129 3 6.98129 3.21071 7.38197 3.58579L8.11803 4.29289C8.51871 4.66797 9.05871 4.87868 9.62132 4.87868H12.5C13.3284 4.87868 14 5.55025 14 6.37868V11.5C14 12.3284 13.3284 13 12.5 13H3.5C2.67157 13 2 12.3284 2 11.5V4.5Z"/>
                                            </svg>
                                        </div>
                                        <div class="figma-group-preview-content">
                                            <div class="figma-group-preview-title" id="figmaPreviewGroupName-v2">North America</div>
                                        </div>
                                    </div>
                                    
                                    <div id="figmaSelectedAccountsList-v2">
                                        <div style="color: #6c7688; font-size: 12px; font-style: italic;">No accounts selected</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="figma-modal-footer">
                            <button class="figma-btn figma-btn-primary" data-action="done">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const styles = `
            <style>
                /* Modal Backdrop */
                .figma-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(182, 192, 205, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                }

                .figma-modal-backdrop.show {
                    opacity: 1;
                    visibility: visible;
                }

                /* Modal Container */
                .figma-modal {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    width: 872px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: hidden;
                    transform: scale(0.95);
                    transition: all 0.2s ease;
                }

                .figma-modal-backdrop.show .figma-modal {
                    transform: scale(1);
                }

                /* Modal Header */
                .figma-modal-header {
                    padding: 24px 24px 0 24px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }

                .figma-modal-title {
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 700;
                    font-size: 20px;
                    line-height: 28px;
                    color: #353a44;
                    margin: 0;
                }

                .figma-modal-subtitle {
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                    color: #596171;
                    margin: 4px 0 0 0;
                }

                .figma-modal-close {
                    background: none;
                    border: none;
                    color: #6c7688;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.15s ease;
                    flex-shrink: 0;
                    margin-left: 16px;
                }

                .figma-modal-close:hover {
                    background: #f5f6f8;
                    color: #353a44;
                }

                /* Modal Content */
                .figma-modal-content {
                    padding: 20px 24px 24px 24px;
                    min-height: 200px;
                }

                /* Form Styles */
                .figma-form-group {
                    margin-bottom: 20px;
                }

                .figma-form-label {
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    line-height: 20px;
                    color: #353a44;
                    display: block;
                    margin-bottom: 8px;
                }

                .figma-form-input,
                .figma-form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d8dee4;
                    border-radius: 8px;
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                    color: #353a44;
                    background: white;
                    transition: all 0.15s ease;
                    box-sizing: border-box;
                }

                .figma-form-input:focus,
                .figma-form-textarea:focus {
                    outline: none;
                    border-color: #675dff;
                    box-shadow: 0 0 0 3px rgba(103, 93, 255, 0.1);
                }

                .figma-form-input::placeholder,
                .figma-form-textarea::placeholder {
                    color: #9ca3af;
                }

                .figma-form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                /* Modal Footer */
                .figma-modal-footer {
                    padding: 0 24px 24px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .figma-btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    line-height: 20px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid transparent;
                }

                .figma-btn-primary {
                    background: #675dff;
                    color: white;
                    border-color: #675dff;
                }

                .figma-btn-primary:hover {
                    background: #5951e6;
                    border-color: #5951e6;
                }

                .figma-btn-secondary {
                    background: white;
                    color: #353a44;
                    border-color: #d8dee4;
                }

                .figma-btn-secondary:hover {
                    background: #f5f6f8;
                }

                /* Step 2 - Add Accounts Styles */
                .figma-accounts-container {
                    display: flex;
                    gap: 24px;
                    height: 432px;
                }

                .figma-accounts-left {
                    width: 448px;
                    display: flex;
                    flex-direction: column;
                }

                .figma-accounts-right {
                    width: 352px;
                    background: #f7f5fd;
                    border: 1px solid #d8dee4;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                }

                .figma-search-container {
                    position: relative;
                    margin-bottom: 24px;
                }

                .figma-search-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d8dee4;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    box-sizing: border-box;
                }

                .figma-search-input:focus {
                    outline: none;
                    border-color: #675dff;
                    box-shadow: 0 0 0 3px rgba(103, 93, 255, 0.1);
                }

                .figma-select-all {
                    display: flex;
                    align-items: center;
                    height: 36px;
                    padding: 0 8px;
                    border-bottom: 1px solid #ebeef1;
                    margin-bottom: 0;
                    font-size: 14px;
                    font-weight: 400;
                    color: #353a44;
                    background: #ffffff;
                    gap: 16px;
                }

                .figma-accounts-table {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid transparent;
                }

                .figma-select-all input[type="checkbox"] {
                    margin: 0;
                }

                .figma-select-all label {
                    margin: 0;
                    cursor: pointer;
                }

                .figma-accounts-list {
                    flex: 1;
                    overflow-y: auto;
                    margin-right: -8px;
                    padding-right: 8px;
                }

                .figma-account-item {
                    display: flex;
                    align-items: center;
                    height: 36px;
                    padding: 0 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    background: #ffffff;
                    border-bottom: 1px solid #ebeef1;
                    gap: 6px;
                }

                .figma-account-item:hover {
                    background: #f5f6f8;
                }

                .figma-account-item input[type="checkbox"] {
                    margin: 0;
                }

                .figma-account-icon {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 600;
                    color: white;
                    flex-shrink: 0;
                    position: relative;
                    background: #f5f6f8;
                }

                .figma-account-icon::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: var(--brand-color);
                }

                .figma-account-icon .icon-letter {
                    position: relative;
                    z-index: 1;
                    color: white;
                }

                .figma-account-icon.deliveries {
                    --brand-color: #088ef9;
                }

                .figma-account-icon.eats {
                    --brand-color: #58ba27;
                }

                .figma-account-icon.rides {
                    --brand-color: #fa4a67;
                }

                .figma-account-name {
                    font-size: 14px;
                    color: #353a44;
                }

                .figma-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #675dff;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    margin-bottom: 16px;
                    transition: all 0.15s ease;
                }

                .figma-back-btn:hover {
                    color: #5951e6;
                }

                .figma-group-preview {
                    background: #f7f5fd;
                    border: none;
                    border-radius: 0;
                    padding: 0 0 4px 0;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .figma-group-preview-icon {
                    width: 16px;
                    height: 16px;
                    background: transparent;
                    border: none;
                    border-radius: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #6c7688;
                }

                .figma-group-preview-content {
                    flex: 1;
                }

                .figma-group-preview-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #353a44;
                    margin: 0;
                    line-height: 24px;
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .figma-group-preview-subtitle {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0;
                    line-height: 16px;
                }

                .figma-preview-section {
                    margin-bottom: 16px;
                }

                .figma-preview-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6c7688;
                    margin-bottom: 8px;
                }

                /* Tree structure styles for selected accounts */
                .figma-tree-account {
                    display: flex;
                    align-items: center;
                    padding: 0;
                    position: relative;
                    height: 28px;
                }

                .figma-tree-connector {
                    width: 8px;
                    height: 28px;
                    position: relative;
                    flex-shrink: 0;
                    margin-right: 5px;
                    background: #f7f5fd;
                }

                .figma-tree-connector::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: #b6c0cd;
                }

                .figma-tree-connector::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    right: 0;
                    height: 1px;
                    background: #b6c0cd;
                    transform: translateY(-0.5px);
                }

                .figma-tree-connector.last::before {
                    height: 50%;
                    bottom: auto;
                }

                .figma-tree-account-name {
                    font-size: 14px;
                    color: #353a44;
                    line-height: 20px;
                    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 400;
                    letter-spacing: -0.15px;
                }

                /* Hidden by default */
                .figma-step {
                    display: none;
                }

                .figma-step.active {
                    display: block;
                }
            </style>
        `;

        // Add to document
        if (!document.getElementById('figmaModalStyles-v2')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'figmaModalStyles-v2';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }

        if (!document.getElementById('figmaModalBackdrop-v2')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    bindEvents() {
        const modal = document.getElementById('figmaModalBackdrop-v2');
        
        // Event delegation for all modal actions
        modal.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'close':
                    this.close();
                    break;
                case 'next':
                    this.nextStep();
                    break;
                case 'back':
                    this.prevStep();
                    break;
                case 'done':
                    this.createGroup();
                    break;
            }
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('figmaAccountSearch-v2');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderAccounts();
                this.updateSelectAllState();
            });
        }

        // Select all functionality
        const selectAllCheckbox = document.getElementById('figmaSelectAllAccounts-v2');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
    }

    loadAccounts() {
        // Load accounts from OrgDataManager if available, otherwise use mock data
        if (window.OrgDataManager) {
            this.accounts = window.OrgDataManager.getAllAccounts() || this.getMockAccounts();
        } else {
            this.accounts = this.getMockAccounts();
        }
    }

    getMockAccounts() {
        return [
            { id: 'acme_del_ca', name: 'Acme Deliveries CA', type: 'deliveries' },
            { id: 'acme_del_uk', name: 'Acme Deliveries UK', type: 'deliveries' },
            { id: 'acme_del_us', name: 'Acme Deliveries US', type: 'deliveries' },
            { id: 'acme_eats_ca', name: 'Acme Eats CA', type: 'eats' },
            { id: 'acme_eats_uk', name: 'Acme Eats UK', type: 'eats' },
            { id: 'acme_eats_us', name: 'Acme Eats US', type: 'eats' },
            { id: 'acme_rides_ca', name: 'Acme Rides CA', type: 'rides' },
            { id: 'acme_rides_uk', name: 'Acme Rides UK', type: 'rides' }
        ];
    }

    show(options = {}) {
        this.onComplete = options.onComplete || null;
        this.reset();
        
        const backdrop = document.getElementById('figmaModalBackdrop');
        backdrop.style.display = 'flex';
        setTimeout(() => backdrop.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        
        this.renderAccounts();
        this.updateSelectedCount();
        this.updatePreview();
    }

    close() {
        const backdrop = document.getElementById('figmaModalBackdrop');
        backdrop.classList.remove('show');
        setTimeout(() => {
            backdrop.style.display = 'none';
            document.body.style.overflow = '';
        }, 200);
    }

    reset() {
        this.currentStep = 1;
        this.selectedAccounts.clear();
        this.groupData = { name: '', description: '' };
        this.showStep(1);
        
        // Clear form
        document.getElementById('figmaGroupName-v2').value = '';
        document.getElementById('figmaGroupDescription-v2').value = '';
        document.getElementById('figmaAccountSearch-v2').value = '';
    }

    showStep(step) {
        document.querySelectorAll('.figma-step').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        this.currentStep = step;
    }

    nextStep() {
        // Capture form data
        this.groupData.name = document.getElementById('figmaGroupName-v2').value.trim();
        this.groupData.description = document.getElementById('figmaGroupDescription-v2').value.trim();
        
        if (!this.groupData.name) {
            alert('Please enter a group name');
            return;
        }
        
        // Update preview
        document.getElementById('figmaPreviewGroupName-v2').textContent = this.groupData.name;
        
        this.showStep(2);
    }

    prevStep() {
        this.showStep(1);
    }

    renderAccounts() {
        const container = document.getElementById('figmaAccountsList-v2');
        const searchTerm = document.getElementById('figmaAccountSearch-v2').value.toLowerCase();
        
        const filteredAccounts = this.accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm)
        );
        
        container.innerHTML = filteredAccounts.map(account => `
            <div class="figma-account-item" data-account-id="${account.id}">
                <input type="checkbox" ${this.selectedAccounts.has(account.id) ? 'checked' : ''}>
                <div class="figma-account-icon ${account.type}">
                    <span class="icon-letter">${account.type.charAt(0).toUpperCase()}</span>
                </div>
                <div class="figma-account-name">${account.name}</div>
            </div>
        `).join('');

        // Bind click events for account items
        container.querySelectorAll('.figma-account-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.toggleAccount(item.dataset.accountId);
            });
        });
    }

    toggleAccount(accountId) {
        if (this.selectedAccounts.has(accountId)) {
            this.selectedAccounts.delete(accountId);
        } else {
            this.selectedAccounts.add(accountId);
        }
        this.updateSelectedCount();
        this.updateSelectAllState();
        this.updatePreview();
    }

    toggleSelectAll(checked) {
        const searchTerm = document.getElementById('figmaAccountSearch-v2').value.toLowerCase();
        const visibleAccounts = this.accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm)
        );
        
        if (checked) {
            visibleAccounts.forEach(account => this.selectedAccounts.add(account.id));
        } else {
            visibleAccounts.forEach(account => this.selectedAccounts.delete(account.id));
        }
        
        this.renderAccounts();
        this.updateSelectedCount();
        this.updatePreview();
    }

    updateSelectedCount() {
        document.getElementById('figmaSelectedCount-v2').textContent = `${this.selectedAccounts.size} selected`;
    }

    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('figmaSelectAllAccounts-v2');
        const selectedCountElement = document.getElementById('figmaSelectedCount-v2');
        const searchTerm = document.getElementById('figmaAccountSearch-v2').value.toLowerCase();
        const visibleAccounts = this.accounts.filter(account => 
            account.name.toLowerCase().includes(searchTerm)
        );
        
        const visibleSelected = visibleAccounts.filter(account => this.selectedAccounts.has(account.id));
        
        // Update the count to show total selected accounts
        selectedCountElement.textContent = `${this.selectedAccounts.size} selected`;
        
        if (visibleSelected.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (visibleSelected.length === visibleAccounts.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    updatePreview() {
        const container = document.getElementById('figmaSelectedAccountsList-v2');
        const selected = this.accounts.filter(account => this.selectedAccounts.has(account.id));
        
        if (selected.length === 0) {
            container.innerHTML = '<div style="color: #6c7688; font-size: 12px; font-style: italic;">No accounts selected</div>';
        } else {
            container.innerHTML = selected.map((account, index) => `
                <div class="figma-tree-account">
                    <div class="figma-tree-connector ${index === selected.length - 1 ? 'last' : ''}"></div>
                    <div class="figma-tree-account-name">${account.name}</div>
                </div>
            `).join('');
        }
    }

    createGroup() {
        if (this.selectedAccounts.size === 0) {
            alert('Please select at least one account');
            return;
        }
        
        const result = {
            name: this.groupData.name,
            description: this.groupData.description,
            accounts: Array.from(this.selectedAccounts),
            type: 'accounts' // Default type
        };
        
        // Save to OrgDataManager if available
        if (window.OrgDataManager) {
            window.OrgDataManager.createAccountGroup(result);
        }
        
        console.log('Group created:', result);
        
        if (this.onComplete) {
            this.onComplete(result);
        }
        
        this.close();
    }
}

// Initialize and expose globally
window.FigmaGroupCreationModalV2 = new FigmaGroupCreationModalV2();