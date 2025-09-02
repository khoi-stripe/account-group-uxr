// V3 - Refactored to use shared Modal component
class FigmaGroupCreationModalV3 {
    constructor() {
        this.modal = null;
        this.accounts = [];
        this.selectedAccounts = new Set();
        this.groupData = {};
        this.onComplete = null;
    }

    init() {
        this.accounts = this.getActiveOrganizationAccounts();
    }

    getActiveOrganizationAccounts() {
        let accounts = [];
        
        // Get accounts from the current active organization
        if (window.OrgDataManager && window.OrgDataManager.getCurrentOrganization()) {
            const currentOrg = window.OrgDataManager.getCurrentOrganization();
            // Filter out the aggregate view account
            accounts = currentOrg.accounts.filter(account => !account.isAggregate);
        } else {
            // Fallback to mock accounts if no organization is loaded
            accounts = this.getMockAccounts();
        }
        
        // Sort accounts alphabetically by name for better UX in step 2
        return accounts.sort((a, b) => a.name.localeCompare(b.name));
    }

    getMockAccounts() {
        const accounts = [
            { id: 'acme_del_ca', name: 'Acme Deliveries CA', type: 'deliveries' },
            { id: 'acme_del_uk', name: 'Acme Deliveries UK', type: 'deliveries' },
            { id: 'acme_del_us', name: 'Acme Deliveries US', type: 'deliveries' },
            { id: 'acme_eats_ca', name: 'Acme Eats CA', type: 'eats' },
            { id: 'acme_eats_uk', name: 'Acme Eats UK', type: 'eats' },
            { id: 'acme_eats_us', name: 'Acme Eats US', type: 'eats' },
            { id: 'acme_rides_ca', name: 'Acme Rides CA', type: 'rides' },
            { id: 'acme_rides_uk', name: 'Acme Rides UK', type: 'rides' },
            { id: 'acme_rides_us', name: 'Acme Rides US', type: 'rides' },
        ];
        
        // Sort accounts alphabetically by name for better UX in step 2
        return accounts.sort((a, b) => a.name.localeCompare(b.name));
    }

    show(options = {}) {
        this.onComplete = options.onComplete;
        this.reset();
        this.showStep1();
    }
    
    reset() {
        this.selectedAccounts.clear();
        this.groupData = {};
    }

    showStep1() {
        const content = `
            <style>
                .step1-content { padding: 32px 32px 0 32px; }
                .step1-header { margin-bottom: 32px; }
                .step1-title { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24px; font-weight: 700; line-height: 32px; color: #21252c; letter-spacing: 0.3px; margin: 0 0 4px 0; }
                .step1-subtitle { font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; color: #353a44; letter-spacing: -0.31px; margin: 0; }
                .step1-form { display: flex; flex-direction: column; gap: 24px; }
                .step1-field { display: flex; flex-direction: column; gap: 6px; }
                .step1-field-with-helper { display: flex; flex-direction: column; gap: 8px; }
                .step1-label { font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; font-weight: 600; line-height: 20px; color: #353a44; margin: 0; }
                .step1-label-optional { font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; font-weight: 400; line-height: 20px; color: #353a44; margin: 0; }
                .step1-input { width: 100%; padding: 12px 16px; border: 1px solid #d8dee4; border-radius: 6px; font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; color: #353a44; background: #ffffff; box-sizing: border-box; }
                .step1-input::placeholder { color: var(--neutral-400); }
                .step1-input:focus { outline: none; border-color: #675dff; }
                .step1-textarea { width: 100%; padding: 12px 16px; border: 1px solid #d8dee4; border-radius: 6px; font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; color: #353a44; background: #ffffff; box-sizing: border-box; resize: vertical; min-height: 48px; }
                .step1-textarea::placeholder { color: #818da0; }
                .step1-textarea:focus { outline: none; border-color: #675dff; }
                .step1-helper { font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 400; line-height: 16px; color: #818da0; margin: 0; }
                .step1-footer { display: flex; justify-content: flex-end; padding: 32px; padding-top: 24px; border-top: none; }
                .step1-button { padding: 8px 16px; border-radius: 6px; font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; font-weight: 600; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #675dff; background: #675dff; color: white; }
                .step1-button:hover { background: #5a4ff0; border-color: #5a4ff0; }
                .step1-button:disabled { background: var(--neutral-200); border-color: var(--neutral-200); color: var(--neutral-400); cursor: not-allowed; }
                .step1-button:disabled:hover { background: var(--neutral-200); border-color: var(--neutral-200); }
            </style>
            <div class="step1-content">
                <div class="step1-header">
                    <h1 class="step1-title">Create an account group</h1>
                    <p class="step1-subtitle">Lorem ipsum dolor</p>
                </div>
                <div class="step1-form">
                    <div class="step1-field">
                        <label class="step1-label" for="groupName-v3">Group name</label>
                        <input type="text" id="groupName-v3" class="step1-input" placeholder="Group name" value="${this.groupData.name || ''}" maxlength="150" />
                    </div>
                    <div class="step1-field-with-helper">
                        <label class="step1-label-optional" for="groupDescription-v3">Description</label>
                        <textarea id="groupDescription-v3" class="step1-textarea" placeholder="e.g. Reporting" maxlength="150">${this.groupData.description || ''}</textarea>
                        <p class="step1-helper">0/150</p>
                    </div>
                </div>
            </div>
                            <div class="step1-footer">
                    <button id="step1-next-button" class="step1-button" disabled onclick="window.figmaModalV3.showStep2()">Next</button>
                </div>
        `;

        if (!this.modal) {
            this.modal = new Modal({
                title: ' ', // Use a space to ensure header is visible
                content: content,
                size: 'large',
                footerActions: [],
                showHeader: true,
                closable: true
            });
            this.modal.show();
        } else {
            this.modal.setTitle('');
            this.modal.setContent(content);
            this.modal.setFooterActions([]);
            this.modal.show();
        }
        
        // Rely on standardized modal size from CSS variables
        this.modal.getElement().style.width = '';
        this.modal.getElement().style.maxWidth = '';
        this.modal.getElement().style.height = 'auto';
        this.modal.getElement().style.maxHeight = 'none';
        
        // Restore normal modal styling for Step 1
        const modalContent = this.modal.getElement().querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.padding = '0';
            modalContent.style.overflow = 'visible';
        }
        
        const modalHeader = this.modal.getElement().querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.style.display = 'none';
        }
        
        const modalFooter = this.modal.getElement().querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }
        
        // Add close button
        const modalElement = this.modal.getElement();
        let closeButton = modalElement.querySelector('.step1-close-button');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.className = 'step1-close-button';
            closeButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            closeButton.style.cssText = `
                position: absolute;
                top: 24px;
                right: 24px;
                background: none;
                border: none;
                cursor: pointer;
                color: #6c7688;
                padding: 8px;
                margin: -8px;
                z-index: 1000;
            `;
            closeButton.onclick = () => this.modal.hide();
            modalElement.appendChild(closeButton);
        }
        
        // Update character count on input
        setTimeout(() => {
            const textareaEl = document.getElementById('groupDescription-v3');
            if (textareaEl) {
                const updateCharCount = () => {
                    const helperEl = document.querySelector('.step1-helper');
                    if (helperEl) {
                        const length = textareaEl.value.length;
                        helperEl.textContent = `${length}/150`;
                    }
                };
                textareaEl.addEventListener('input', updateCharCount);
                updateCharCount(); // Initial update
            }
        }, 0);

        // Button enable/disable functionality
        setTimeout(() => {
            const nameField = document.getElementById('groupName-v3');
            const nextButton = document.getElementById('step1-next-button');
            
            function updateButtonState() {
                if (nameField && nextButton) {
                    const hasName = nameField.value.trim().length > 0;
                    nextButton.disabled = !hasName;
                }
            }
            
            if (nameField && nextButton) {
                updateButtonState(); // Initial check
                nameField.addEventListener('input', updateButtonState);
            }
        }, 0);
    }
    
    showStep2() {
        this.groupData.name = document.getElementById('groupName-v3').value;
        this.groupData.description = document.getElementById('groupDescription-v3').value;
        
        if (!this.groupData.name.trim()) {
            alert('Group name is required');
            return;
        }

        this.modal.setTitle('');
        this.modal.setContent(this.getStep2HTML());
        this.modal.setFooterActions([]);

        // Rely on standardized modal size from CSS variables
        this.modal.getElement().style.width = '';
        this.modal.getElement().style.maxWidth = '';
        this.modal.getElement().style.height = '';
        this.modal.getElement().style.maxHeight = '';

        this.renderAccounts();
        this.bindStep2Events();
        
        // Adjust modal content padding for Step 2 custom layout  
        const modalContent = this.modal.getElement().querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.padding = '0';
            modalContent.style.paddingBottom = '0';
            modalContent.style.overflow = 'visible';
            modalContent.style.display = 'flex';
            modalContent.style.flexDirection = 'column';
            modalContent.style.flex = '1';
        }
        
        // Hide the default modal header for Step 2
        const modalHeader = this.modal.getElement().querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.style.display = 'none';
        }
        
        // Hide the default modal footer for Step 2 (we use custom footer)
        const modalFooter = this.modal.getElement().querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }
        
        // Add custom footer directly to modal element (outside modal-content)
        const modalElement = this.modal.getElement();
        let customFooter = modalElement.querySelector('.custom-modal-footer');
        if (!customFooter) {
            customFooter = document.createElement('div');
            customFooter.className = 'custom-modal-footer modal-footer';
            customFooter.innerHTML = '<button class="modal-button modal-button-primary" onclick="window.figmaModalV3.createGroup()">Done</button>';
            modalElement.appendChild(customFooter);
        }
        
        // Set up flexbox layout for the entire modal
        modalElement.style.display = 'flex';
        modalElement.style.flexDirection = 'column';
        

    }

    getStep2HTML() {
        return `
            <div class="custom-modal-header" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 24px 0 24px; border: none;">
                <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                    <button style="display: flex; align-items: center; gap: 6px; background: none; border: none; padding: 0; color: #675dff; font-size: 14px; font-weight: 400; cursor: pointer;" onclick="window.figmaModalV3.showStep1()">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.38128 1.38128C6.72299 1.03957 7.27701 1.03957 7.61872 1.38128C7.96043 1.72299 7.96043 2.27701 7.61872 2.61872L3.11244 7.125H15C15.4833 7.125 15.875 7.51675 15.875 8C15.875 8.48325 15.4833 8.875 15 8.875H3.11244L7.61872 13.3813C7.96043 13.723 7.96043 14.277 7.61872 14.6187C7.27701 14.9604 6.72299 14.9604 6.38128 14.6187L0.381282 8.61872C0.210427 8.44786 0.125 8.22393 0.125 8C0.125 7.77607 0.210427 7.55214 0.381282 7.38128L6.38128 1.38128Z" fill="currentColor"/>
                        </svg>
                        Back
                    </button>
                    <h2 style="margin: 0; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24px; font-weight: 700; line-height: 32px; color: #21252c; letter-spacing: 0.3px;">Add accounts</h2>
                    <p style="margin: 0; font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; color: #353a44; letter-spacing: -0.31px;">Select accounts from your business to add to this group.</p>
                </div>
                <button style="background: none; border: none; padding: 8px; margin: -8px -8px 0 0; cursor: pointer; color: #6c7688;" onclick="window.figmaModalV3.close()">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <style>
                /* Add styles needed for step 2, scoping them to avoid conflicts */
                .accounts-container { display: flex; gap: 32px; height: 400px; margin-top: 24px; min-height: 0; }
                .accounts-left { flex: 1; display: flex; flex-direction: column; height: 400px; }
                .accounts-right { flex: 1; background: #f7f5fd; border-radius: 12px; padding: 16px; box-sizing: border-box; height: 400px; overflow-y: auto; }
                .accounts-right {
                    scrollbar-width: thin;
                    scrollbar-color: var(--neutral-400) transparent;
                }
                .accounts-right::-webkit-scrollbar {
                    width: 6px;
                }
                .accounts-right::-webkit-scrollbar-track {
                    background: transparent;
                }
                .accounts-right::-webkit-scrollbar-thumb {
                    background-color: var(--neutral-400);
                    border-radius: 3px;
                }
                .accounts-right::-webkit-scrollbar-thumb:hover {
                    background-color: var(--neutral-600);
                }
                .select-all { display: flex; align-items: center; height: 36px; border-bottom: 1px solid #ebeef1; position: relative; }
                .select-all .checkbox-container { width: 22px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: absolute; left: 8px; box-sizing: border-box; margin: 0; padding: 0; }
                .select-all .account-filter-content { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px; margin-left: 30px; flex: 1; box-sizing: border-box; }
                .select-all label { font-size: 14px; font-weight: 400; line-height: 20px; letter-spacing: -0.005em; color: var(--neutral-700); cursor: pointer; }
                .accounts-table { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .accounts-list { 
                    flex: 1; 
                    overflow-y: auto; 
                    min-height: 0;
                    /* Custom scrollbar styling */
                    scrollbar-width: thin; /* Firefox */
                    scrollbar-color: rgba(0, 0, 0, 0.15) transparent; /* Firefox */
                }
                /* Webkit scrollbar styling (Chrome, Safari, Edge) */
                .accounts-list::-webkit-scrollbar {
                    width: 6px;
                }
                .accounts-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .accounts-list::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 3px;
                }
                .accounts-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.25);
                }
                .account-item { display: flex; align-items: center; height: 36px; cursor: pointer; position: relative; }
                .account-item:hover { background: var(--neutral-25); border-radius: 6px; }
                .checkbox-container { width: 22px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: absolute; left: 8px; box-sizing: border-box; margin: 0; padding: 0; }
                .account-filter-content { display: flex; align-items: center; gap: 6px; padding: 8px 6px; margin-left: 30px; flex: 1; box-sizing: border-box; }
                .account-icon { width: 24px; height: 24px; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
                .account-name { flex: 1; font-size: 14px; font-weight: 400; line-height: 20px; letter-spacing: -0.005em; color: var(--neutral-700); cursor: pointer; }
                .tree-account { display: flex; align-items: center; height: 28px; padding: 0; }
                .tree-connector { width: 16px; height: 32px; position: relative; flex-shrink: 0; margin-right: 5px; background: #f7f5fd; }
                .tree-connector::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 1px; background: #b6c0cd; }
                .tree-connector::after { content: ''; position: absolute; left: 8px; top: 50%; width: 8px; height: 1px; background: #b6c0cd; transform: translateY(0.5px); }
                .tree-connector.last::before { height: 50%; bottom: auto; left: 8px; }
                .tree-account-name { font-size: 14px; color: #353a44; line-height: 20px; }
                .group-preview { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; height: 32px; }
                .group-preview-icon { color: #6c7688; display: flex; align-items: center; }
                .group-preview-title { font-size: 14px; font-weight: 600; color: #353a44; }
                /* Checkbox styling to match account groups filter */
                input[type="checkbox"] {
                    width: 14px;
                    height: 14px;
                    border: 1px solid var(--neutral-300);
                    border-radius: 4px;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                input[type="checkbox"]:checked {
                    background: var(--brand-600);
                    border-color: var(--brand-600);
                    position: relative;
                }
                input[type="checkbox"]:checked::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 1px;
                    width: 4px;
                    height: 7px;
                    border: solid white;
                    border-width: 0 1px 1px 0;
                    transform: rotate(45deg);
                }
                input[type="checkbox"]:indeterminate {
                    background: var(--brand-600);
                    border-color: var(--brand-600);
                    position: relative;
                }
                input[type="checkbox"]:indeterminate::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 2px;
                    background: white;
                    border-radius: 1px;
                }
                /* Custom footer styling to match static preview exactly */
                .modal-footer { 
                    padding: 16px 24px 24px; 
                    display: flex; 
                    justify-content: flex-end; 
                    gap: 12px; 
                }
                .modal-button { 
                    padding: 8px 16px; 
                    border-radius: 6px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    cursor: pointer; 
                    border: 1px solid; 
                    height: 36px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                }
                .modal-button-primary { 
                    background: #675dff; 
                    border-color: #675dff; 
                    color: white; 
                }
            </style>
            <div class="modal-step2-content" style="flex: 1; display: flex; flex-direction: column; padding: 0 24px 0 24px;">
                <div class="accounts-container">
                <div class="accounts-left">
                    <div class="search-container" style="position: relative;">
                        <input type="text" id="accountSearch-v3" class="modal-form-input" placeholder="Search">
                    </div>
                    <div class="accounts-table" style="margin-top: 24px;">
                        <div class="select-all">
                            <div class="checkbox-container">
                                <input type="checkbox" id="selectAllAccounts-v3">
                            </div>
                            <div class="account-filter-content">
                                <span id="selectedCount-v3" style="font-size: 14px; color: #596171;">0 selected</span>
                            </div>
                        </div>
                        <div id="accountsList-v3" class="accounts-list" style="flex: 1; overflow-y: auto;">
                            <!-- Account list -->
                        </div>
                    </div>
                </div>
                <div class="accounts-right">
                    <div class="group-preview">
                        <!-- Preview content -->
                    </div>
                    <div id="selectedAccountsList-v3"></div>
                </div>
            </div>
            </div>
        `;
    }

    renderAccounts() {
        const container = document.getElementById('accountsList-v3');
        const searchTerm = document.getElementById('accountSearch-v3')?.value?.toLowerCase() || '';
        
        const filteredAccounts = this.accounts.filter(account => 
            !searchTerm || account.name.toLowerCase().includes(searchTerm)
        );
        
        container.innerHTML = filteredAccounts.map(account => `
            <div class="account-item" data-account-id="${account.id}">
                <div class="checkbox-container">
                    <input type="checkbox" ${this.selectedAccounts.has(account.id) ? 'checked' : ''}>
                </div>
                <div class="account-filter-content">
                    <div class="account-icon" style="background-color: ${account.color || '#3B82F6'}">${account.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}</div>
                    <label class="account-name">${account.name}</label>
                </div>
            </div>
        `).join('');
        this.updatePreview();
    }
    
    bindStep2Events() {
        const searchInput = document.getElementById('accountSearch-v3');
        searchInput.addEventListener('input', (e) => {
            this.renderAccounts();
            this.bindAccountEvents();
        });

        const selectAll = document.getElementById('selectAllAccounts-v3');
        selectAll.addEventListener('change', (e) => this.toggleSelectAll());
        
        // Make select all row clickable
        const selectAllRow = this.modal.getElement().querySelector('.select-all');
        if (selectAllRow) {
            selectAllRow.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') {
                    return;
                }
                
                const checkbox = selectAllRow.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        this.bindAccountEvents();
    }
    
    bindAccountEvents() {
        const accountList = document.getElementById('accountsList-v3');
        
        // Remove existing listeners to prevent duplicates
        const newAccountList = accountList.cloneNode(true);
        accountList.parentNode.replaceChild(newAccountList, accountList);
        
        newAccountList.addEventListener('click', (e) => {
            const item = e.target.closest('.account-item');
            if (item && e.target.type !== 'checkbox') {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const accountId = item.dataset.accountId;
                
                checkbox.checked = !checkbox.checked;
                
                // Call toggleAccount directly with the correct accountId
                if (accountId) {
                    this.toggleAccount(accountId);
                } else {
                    console.error('No accountId found on row click');
                }
            }
        });
        
        // Account checkbox changes
        newAccountList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const accountItem = e.target.closest('.account-item');
                const accountId = accountItem?.dataset.accountId;
                if (accountId) {
                    this.toggleAccount(accountId);
                }
            }
        });
    }
    
    toggleAccount(accountId) {
        if (this.selectedAccounts.has(accountId)) {
            this.selectedAccounts.delete(accountId);
        } else {
            this.selectedAccounts.add(accountId);
        }
        this.updateSelectionCount();
        this.updateSelectAllState();
        this.updatePreview();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllAccounts-v3');
        const isChecked = selectAllCheckbox?.checked || false;
        
        // Get currently visible accounts (filtered)
        const searchTerm = document.getElementById('accountSearch-v3')?.value?.toLowerCase() || '';
        const visibleAccounts = this.accounts.filter(account => 
            !searchTerm || account.name.toLowerCase().includes(searchTerm)
        );
        
        // Apply to ONLY visible accounts
        visibleAccounts.forEach(account => {
            if (isChecked) {
                this.selectedAccounts.add(account.id);
            } else {
                this.selectedAccounts.delete(account.id);
            }
        });
        
        this.renderAccounts();
        this.bindAccountEvents();
        this.updateSelectionCount();
        this.updatePreview();
    }
    
    updateSelectionCount() {
        const countEl = document.getElementById('selectedCount-v3');
        if (countEl) {
            countEl.textContent = `${this.selectedAccounts.size} selected`;
        }
    }
    
    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('selectAllAccounts-v3');
        if (!selectAllCheckbox) return;
        
        // Get currently visible accounts (filtered)
        const searchTerm = document.getElementById('accountSearch-v3')?.value?.toLowerCase() || '';
        const visibleAccounts = this.accounts.filter(account => 
            !searchTerm || account.name.toLowerCase().includes(searchTerm)
        );
        
        // Count how many visible accounts are selected
        const selectedVisibleCount = visibleAccounts.filter(account => 
            this.selectedAccounts.has(account.id)
        ).length;
        
        const totalVisibleAccounts = visibleAccounts.length;
        const totalSelectedAccounts = this.selectedAccounts.size;
        
        // Simple rules:
        if (totalSelectedAccounts === 0) {
            // No accounts selected anywhere
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedVisibleCount === totalVisibleAccounts) {
            // All visible accounts are selected
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            // Some accounts selected but not all visible ones
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
    
    filterAccountsBySearch(searchTerm) {
        const accountItems = document.querySelectorAll('#accountsList-v3 .account-item');
        
        accountItems.forEach(item => {
            const label = item.querySelector('.account-name');
            if (label) {
                const accountName = label.textContent.toLowerCase();
                const shouldShow = !searchTerm || accountName.includes(searchTerm.toLowerCase());
                item.style.display = shouldShow ? 'flex' : 'none';
            }
        });
        
        this.updateSelectionCount();
        this.updateSelectAllState();
    }
    
    updatePreview() {
        const previewContainer = this.modal.getElement().querySelector('.group-preview');
        const selectedContainer = this.modal.getElement().querySelector('#selectedAccountsList-v3');
        const selected = this.accounts.filter(account => this.selectedAccounts.has(account.id));
        
        previewContainer.innerHTML = `
            <div class="group-preview-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.82679C16 7.94141 15.9803 8.05518 15.9417 8.16312L13.974 13.6727C13.6898 14.4687 12.9358 15 12.0906 15H2C0.895431 15 0 14.1046 0 13V3C0 1.89543 0.89543 1 2 1H4.58579C4.851 1 5.10536 1.10536 5.29289 1.29289L6 2H11C12.1046 2 13 2.89543 13 4V5H14C15.1046 5 16 5.89543 16 7V7.82679ZM3.75 6.5C3.33579 6.5 3 6.16421 3 5.75C3 5.33579 3.33579 5 3.75 5H11.5V4C11.5 3.72386 11.2761 3.5 11 3.5H6C5.60218 3.5 5.22064 3.34196 4.93934 3.06066L4.37868 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V13C1.5 13.2761 1.72386 13.5 2 13.5H12.0906C12.3019 13.5 12.4904 13.3672 12.5614 13.1682L14.5 7.74018V7C14.5 6.72386 14.2761 6.5 14 6.5H3.75Z" fill="var(--neutral-600)"/>
                </svg>
            </div>
            <div class="group-preview-content">
                <div class="group-preview-title">${this.groupData.name}</div>
            </div>
        `;
        
        if (selected.length === 0) {
            selectedContainer.innerHTML = '<div style="color: #6c7688; font-size: 12px; font-style: italic;">No accounts selected</div>';
        } else {
            selectedContainer.innerHTML = selected.map((account, index) => `
                <div class="tree-account">
                    <div class="tree-connector ${index === selected.length - 1 ? 'last' : ''}"></div>
                    <div class="account-icon" style="background-color: ${account.color || '#3B82F6'}; width: 16px; height: 16px; font-size: 8px; margin-right: 8px;">${account.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}</div>
                    <div class="tree-account-name">${account.name}</div>
                </div>
            `).join('');
        }
    }

    createGroup() {
        if (this.selectedAccounts.size === 0) {
            alert('Please select at least one account.');
            return;
        }

        const groupData = {
            id: Date.now().toString(), // Simple ID generation
            name: this.groupData.name,
            description: this.groupData.description,
            accountIds: Array.from(this.selectedAccounts),
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        this.saveGroupToStorage(groupData);
        
        // Update page content immediately if we're on the account groups page
        if (window.location.pathname.includes('account-groups.html')) {
            // Close modal first
            this.modal.hide();
            
            // Update the page content without full reload
            if (typeof window.loadAccountGroups === 'function') {
                window.loadAccountGroups();
            }
            
            // Refresh any existing account group filters on the page
            if (typeof window.refreshAccountGroupFilters === 'function') {
                window.refreshAccountGroupFilters();
            }
            return; // Exit early since we've updated the page
        }
        
        if (this.onComplete) {
            this.onComplete(groupData);
        }

        this.modal.hide();
    }

    saveGroupToStorage(groupData) {
        try {
            // Prefer OrgDataManager as single source of truth
            if (window.OrgDataManager && typeof window.OrgDataManager.createAccountGroup === 'function') {
                const created = window.OrgDataManager.createAccountGroup(groupData);
                return;
            }

            // Fallback: direct localStorage (org-scoped) if OrgDataManager is unavailable
            const currentOrg = window.OrgDataManager?.getCurrentOrganization();
            if (!currentOrg) {
                console.error('No current organization found');
                alert('Unable to save group: No organization selected');
                return;
            }
            const storageKey = `uxr_account_groups_${currentOrg.name}`;
            const existingGroups = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existingGroups.push(groupData);
            localStorage.setItem(storageKey, JSON.stringify(existingGroups));
        } catch (error) {
            console.error('Failed to save group:', error);
            alert(error.message || 'Failed to save group. Please try again.');
        }
    }

    close() {
        this.modal.close();
    }
}

window.FigmaGroupCreationModalV3 = new FigmaGroupCreationModalV3();
window.figmaModalV3 = window.FigmaGroupCreationModalV3;
