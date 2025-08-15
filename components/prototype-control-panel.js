/**
 * UXR Prototype Control Panel
 * Floating panel for managing prototype data and settings
 * 
 * NOTE: This component uses custom modal implementation. 
 * For new modals, consider using the global Modal component:
 * @see shared/components/modal.js
 * @see shared/components/modal-example.html
 */

class PrototypeControlPanel {
  constructor() {
    this.isOpen = false;
    this.panel = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createFloatingButton();
    this.createPanel();
    this.bindEvents();
  }

  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'prototype-control-trigger';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill="currentColor"/>
      </svg>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      background: var(--neutral-900);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.2s ease;
      font-size: 0;
      opacity: 0.7;
    `;
    
    button.onmouseover = () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
      button.style.opacity = '1';
    };
    
    button.onmouseout = () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      button.style.opacity = '0.7';
    };
    
    document.body.appendChild(button);
  }

  createPanel() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;
    
    // Panel
    this.panel = document.createElement('div');
    this.panel.id = 'prototype-control-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Prototype Controls</h2>
        <button class="close-button" onclick="window.prototypePanel.hide()">×</button>
      </div>
      
      <div class="panel-content">
        <div class="section">
          <div class="section-content">
            <div class="org-controls">
              <label class="organization-label" for="panel-org-selector">choose organization</label>
              <select id="panel-org-selector" class="org-selector">
                <option value="">Select an organization...</option>
              </select>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-content">
            <div class="upload-actions">
              <h4 class="upload-title collapsible-header" onclick="window.prototypePanel.toggleModule('upload')">
                <svg class="module-caret" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2.5L4 5L6.5 2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Upload
              </h4>
              <div class="module-content" id="upload-content">
                <input type="file" id="panel-csv-input" accept=".csv" style="display: none;">
                <div class="upload-buttons">
                  <button class="btn btn-secondary" onclick="document.getElementById('panel-csv-input').click()">
                    Upload CSV File
                  </button>
                  <button class="btn btn-text" onclick="window.prototypePanel.downloadSample()">
                    Download Sample
                  </button>
                </div>
                <p class="help-text">
                  Upload a CSV with format: <strong>Organization, Account Name</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-content">
            <div class="generate-module">
              <h4 class="generate-title collapsible-header" onclick="window.prototypePanel.toggleModule('generate')">
                <svg class="module-caret" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2.5L4 5L6.5 2.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Generate
              </h4>
              <div class="module-content" id="generate-content">
                <div class="form-group">
                  <label class="form-label" for="panel-org-name">Organization Name</label>
                  <input type="text" id="panel-org-name" class="form-input" placeholder="e.g., Acme Technologies">
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="panel-account-count">Number of Accounts</label>
                  <input type="number" id="panel-account-count" class="form-input" min="1" max="20" value="5">
                </div>
                
                <div id="generated-preview" class="generated-preview" style="display: none;">
                  <div id="preview-content"></div>
                </div>
                
                <div id="initial-generate-container" class="generate-button-container">
                  <button class="btn btn-secondary" onclick="window.prototypePanel.generateOrganization()">
                    Generate
                  </button>
                </div>
                
                <div id="generated-actions-container" class="generated-actions" style="display: none;">
                  <button class="btn btn-text refresh-btn" onclick="window.prototypePanel.refreshGeneration()">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4V9H4.58152M4.58152 9C5.24429 7.2752 6.43205 5.80686 8.00236 4.8227C9.57267 3.83854 11.4295 3.39938 13.2725 3.56374C15.1154 3.72811 16.8505 4.48947 18.2048 5.73769C19.5591 6.98591 20.4574 8.64973 20.7573 10.4653C21.0572 12.2808 20.7434 14.1397 19.8615 15.7756C18.9795 17.4115 17.5759 18.7361 15.8847 19.5397C14.1935 20.3434 12.2992 20.5902 10.4674 20.2464C8.63555 19.9027 6.95663 19.0832 5.68213 17.9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.58152 9H9V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Refresh
                  </button>
                  <button class="btn btn-secondary" onclick="window.prototypePanel.saveGeneratedOrganization()">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <div class="footer-left">
          <button class="btn btn-text share-btn" onclick="window.prototypePanel.sharePrototype()" title="Generate shareable URL with current data">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 4.5C11.6046 4.5 12.5 3.60457 12.5 2.5C12.5 1.39543 11.6046 0.5 10.5 0.5C9.39543 0.5 8.5 1.39543 8.5 2.5C8.5 2.83289 8.58289 3.14675 8.72842 3.42264L5.77158 5.32736C5.39806 4.88364 4.82608 4.6 4.2 4.6C3.14772 4.6 2.3 5.44772 2.3 6.5C2.3 7.55228 3.14772 8.4 4.2 8.4C4.82608 8.4 5.39806 8.11636 5.77158 7.67264L8.72842 9.57736C8.58289 9.85325 8.5 10.1671 8.5 10.5C8.5 11.6046 9.39543 12.5 10.5 12.5C11.6046 12.5 12.5 11.6046 12.5 10.5C12.5 9.39543 11.6046 8.5 10.5 8.5C9.87392 8.5 9.30194 8.78364 8.92842 9.22736L5.97158 7.32264C6.11711 7.04675 6.2 6.73289 6.2 6.4C6.2 6.2 6.17158 6.00736 6.12842 5.82264L9.07158 3.92736C9.44806 4.36364 10.0201 4.6 10.5 4.5Z" fill="currentColor"/>
            </svg>
            Share prototype
          </button>
        </div>
        <div class="footer-actions">
          <button class="btn btn-destructive" onclick="window.prototypePanel.resetAllData()">
            Reset Data
          </button>
          <button class="btn btn-primary" onclick="window.prototypePanel.saveData()">
            Apply
          </button>
        </div>
      </div>
    `;
    
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 90%;
      max-width: 520px;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      z-index: 1002;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .panel-header {
        padding: 16px 20px 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }
      
      .panel-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--neutral-900);
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--neutral-600);
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: background 0.15s ease;
      }
      
      .close-button:hover {
        background: var(--neutral-100);
      }
      
      .panel-content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 0;
      }
      
      .section {
        display: flex;
        flex-direction: column;
      }
      
      .section-content {
        padding: 0;
      }
      
      .upload-actions {
        background: var(--neutral-50);
        padding: 12px;
        border-radius: 12px;
      }
      
      .upload-title,
      .generate-title {
        margin: 0 0 8px 0;
        font-size: 11px;
        font-weight: 600;
        color: var(--neutral-900);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .collapsible-header {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
        transition: color 0.2s ease;
      }
      
      .collapsible-header:hover {
        color: var(--neutral-700);
      }
      
      .module-caret {
        margin-right: 6px;
        margin-left: 0;
        transition: transform 0.3s ease;
        color: var(--neutral-600);
        flex-shrink: 0;
      }
      
      .collapsible-header.collapsed .module-caret {
        transform: rotate(-90deg);
      }
      
      .module-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .module-content.collapsed {
        display: none;
      }
      
      .upload-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
      }
      
      .upload-actions .help-text {
        margin: 0;
      }
      
      .generate-module {
        background: var(--neutral-50);
        padding: 12px;
        border-radius: 12px;
      }
      
      .org-controls {
      }
      
      .organization-label {
        display: block;
        margin-bottom: 3px;
        font-size: 11px;
        font-weight: 600;
        color: var(--neutral-900);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .org-selector {
        width: 100%;
        height: 32px;
        padding: 0 8px;
        border: 1px solid var(--neutral-300);
        border-radius: 6px;
        font-size: 13px;
        background: white;
        box-sizing: border-box;
      }
      
      .help-text {
        margin: 0;
        font-size: 12px;
        color: var(--neutral-600);
        line-height: 1.3;
      }
      
      .form-group {
        margin-bottom: 12px;
      }
      
      .form-group:last-child {
        margin-bottom: 0;
      }
      
      .generate-button-container {
        display: flex;
        justify-content: flex-end;
      }
      
      .generated-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 12px;
      }
      
      .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      
      .refresh-btn svg {
        flex-shrink: 0;
      }
      
      .form-label {
        display: block;
        margin-bottom: 3px;
        font-size: 11px;
        font-weight: 600;
        color: var(--neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .form-input {
        width: 100%;
        height: 32px;
        padding: 0 8px;
        border: 1px solid var(--neutral-300);
        border-radius: 6px;
        font-size: 13px;
        background: white;
        transition: border-color 0.15s ease;
        box-sizing: border-box;
      }
      
      .form-input:focus {
        outline: none;
        border-color: var(--brand-600);
      }
      
      .generated-preview {
        margin-top: 12px;
      }
      
      .preview-accounts-list {
        margin: 6px 0 0 0;
        padding-left: 16px;
        list-style-type: disc;
        font-size: 13px;
        color: var(--neutral-700);
        line-height: 1.3;
      }
      
      .preview-accounts-list li {
        margin-bottom: 4px;
      }
      
      .preview-accounts-list li:last-child {
        margin-bottom: 0;
      }
      
      .preview-org-info {
        margin-bottom: 12px;
        font-size: 13px;
        color: var(--neutral-600);
      }
      
      .status-message {
        margin: 12px 20px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
      }
      
      .panel-footer {
        padding: 12px 20px;
        background: white;
        border-top: none;
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .footer-left {
        display: flex;
        align-items: center;
      }
      
      .footer-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      
      .share-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #6b7280;
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.2s ease;
        border: none;
        background: transparent;
        cursor: pointer;
      }
      
      .share-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .share-btn:active {
        background: #e5e7eb;
      }
      
      .share-btn svg {
        transition: transform 0.2s ease;
      }
      
      .share-btn:hover svg {
        transform: scale(1.1);
      }
      
      .btn {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      
      /* Primary Button - Blue/Purple */
      .btn-primary {
        background: var(--brand-600);
        color: white;
        border: 1px solid var(--brand-600);
      }
      
      .btn-primary:hover {
        background: var(--brand-700);
        border-color: var(--brand-700);
      }
      
      /* Secondary Button - Light with border */
      .btn-secondary {
        background: white;
        color: var(--neutral-700);
        border: 1px solid var(--neutral-300);
      }
      
      .btn-secondary:hover {
        background: var(--neutral-50);
        border-color: var(--neutral-400);
      }
      
      /* Destructive Button - Red */
      .btn-destructive {
        background: var(--critical-600);
        color: white;
        border: 1px solid var(--critical-600);
      }
      
      .btn-destructive:hover {
        background: var(--critical-700);
        border-color: var(--critical-700);
      }
      
      /* Text Link Button - Text only, no background */
      .btn-text {
        background: transparent;
        color: var(--brand-600);
        border: none;
        padding: 4px 8px;
        text-decoration: none;
      }
      
      .btn-text:hover {
        color: var(--brand-700);
        background: transparent;
        text-decoration: underline;
      }
      
      /* Legacy support for existing btn-critical */
      .btn-critical {
        background: var(--critical-600);
        color: white;
        border: 1px solid var(--critical-600);
      }
      
      .btn-critical:hover {
        background: var(--critical-700);
        border-color: var(--critical-700);
      }
      
      /* Success Button - Green */
      .btn-success {
        background: var(--green-600) !important;
        color: white !important;
        border: 1px solid var(--green-600) !important;
        transition: all 0.15s ease;
      }
      
      .btn-success:hover {
        background: var(--green-700) !important;
        border-color: var(--green-700) !important;
      }
      
      .btn-success:disabled {
        opacity: 1 !important;
        cursor: default !important;
      }
      

    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  bindEvents() {
    // Trigger button
    document.getElementById('prototype-control-trigger').addEventListener('click', () => {
      this.toggle();
    });
    
    // Overlay click to close
    this.overlay.addEventListener('click', () => {
      this.close();
    });
    
    // CSV file upload
    document.getElementById('panel-csv-input').addEventListener('change', (event) => {
      this.handleFileUpload(event);
    });
  }

  hide() {
    this.close();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';
    this.panel.style.opacity = '1';
    this.panel.style.visibility = 'visible';
    this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Update organization selector when opening
    this.updateOrganizationSelector();
    
    // Reset upload button state
    this.resetUploadButton();
    
    // Initialize module states (ensure they start expanded)
    this.initializeModuleStates();
  }

  initializeModuleStates() {
    // Start upload and generate modules in collapsed state by default
    const uploadContent = document.getElementById('upload-content');
    const generateContent = document.getElementById('generate-content');
    const uploadHeader = uploadContent?.previousElementSibling;
    const generateHeader = generateContent?.previousElementSibling;
    
    if (uploadContent && uploadHeader) {
      uploadContent.classList.add('collapsed');
      uploadHeader.classList.add('collapsed');
      uploadContent.style.display = 'none';
    }
    
    if (generateContent && generateHeader) {
      generateContent.classList.add('collapsed');
      generateHeader.classList.add('collapsed');
      generateContent.style.display = 'none';
    }
  }

  close() {
    this.isOpen = false;
    this.overlay.style.opacity = '0';
    this.overlay.style.visibility = 'hidden';
    this.panel.style.opacity = '0';
    this.panel.style.visibility = 'hidden';
    this.panel.style.transform = 'translate(-50%, -50%) scale(0.9)';
  }

  // CSV file upload functionality
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target.result;
        this.loadCSVData(csvContent);
      };
      reader.readAsText(file);
    } else {
      this.showStatus('Please select a valid CSV file.', 'error');
    }
  }

  async loadCSVData(csvContent) {
    try {
      this.showStatus('Loading CSV data...', 'loading');
      
      await window.OrgDataManager.loadFromSpreadsheet(csvContent);
      
      this.showStatus('✅ CSV data loaded successfully!', 'success');
      this.showUploadSuccess();
      this.updateOrganizationSelector();
      
      // Clear the file input
      document.getElementById('panel-csv-input').value = '';
      
    } catch (error) {
      this.showStatus(`❌ Error loading CSV: ${error.message}`, 'error');
    }
  }

  downloadSample() {
    const sampleCSV = window.OrgDataManager.getSampleCSV();
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-organization-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.showStatus('📝 Sample CSV downloaded!', 'success');
  }

  showUploadSuccess() {
    // Show inline success message above the buttons
    let msg = document.getElementById('csv-upload-success-msg');
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'csv-upload-success-msg';
      msg.style.marginBottom = '8px';
      msg.style.color = 'var(--success-600)';
      msg.style.fontWeight = '500';
      msg.style.fontSize = '14px';
      const uploadContent = document.getElementById('upload-content');
      if (uploadContent) {
        uploadContent.insertBefore(msg, uploadContent.querySelector('.upload-buttons'));
      }
    }
    msg.textContent = 'Uploaded successfully!';

    // Reset message after 3 seconds
    setTimeout(() => {
      if (msg) msg.textContent = '';
    }, 3000);

    // Button remains unchanged
    const uploadButton = document.querySelector('.upload-buttons .btn-secondary');
    if (uploadButton) {
      uploadButton.innerHTML = 'Upload CSV File';
      uploadButton.disabled = false;
    }
  }

  resetUploadButton() {
    const uploadButton = document.querySelector('.upload-buttons .btn-secondary');
    if (!uploadButton) return;

    uploadButton.innerHTML = 'Upload CSV File';
    // Do NOT remove btn-success, just keep btn-secondary
    // uploadButton.classList.remove('btn-success');
    uploadButton.disabled = false;
  }

  generateOrganization() {
    try {
      const orgNameInput = document.getElementById('panel-org-name');
      const accountCountInput = document.getElementById('panel-account-count');
      
      const orgName = orgNameInput.value.trim();
      const accountCount = parseInt(accountCountInput.value) || 5;
      
      if (!orgName) {
        this.showStatus('❌ Please enter an organization name', 'error');
        return;
      }
      
      // Store generation parameters for refresh
      this.lastGenerationParams = { orgName, accountCount };
      
      this.showStatus('Generating organization...', 'loading');
      
      const accounts = this.generateThematicAccounts(orgName, accountCount);
      this.displayGeneratedPreview(orgName, accounts);
      
      // Create the organization data
      this.currentGeneratedOrg = {
        name: orgName,
        accounts: [
          { id: "all_accounts", name: orgName, type: "Aggregate view", isAggregate: true },
          ...accounts.map((name, index) => ({
            id: `${orgName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
            name: name,
            type: "Account",
            color: this.generateAccountColor(name, index)
          }))
        ]
      };
      
      // Switch to generated state
      this.showGeneratedState();
      
      this.showStatus('✅ Organization generated successfully!', 'success');
      
    } catch (error) {
      this.showStatus(`❌ Error generating organization: ${error.message}`, 'error');
    }
  }

  refreshGeneration() {
    if (!this.lastGenerationParams) return;
    
    this.showStatus('Refreshing organization...', 'loading');
    
    const { orgName, accountCount } = this.lastGenerationParams;
    const accounts = this.generateThematicAccounts(orgName, accountCount);
    this.displayGeneratedPreview(orgName, accounts);
    
    // Update the organization data
    this.currentGeneratedOrg = {
      name: orgName,
      accounts: [
        { id: "all_accounts", name: orgName, type: "Aggregate view", isAggregate: true },
        ...accounts.map((name, index) => ({
          id: `${orgName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
          name: name,
          type: "Account",
          color: this.generateAccountColor(name, index)
        }))
      ]
    };
    
    this.showStatus('✅ Organization refreshed!', 'success');
  }

  saveGeneratedOrganization() {
    if (!this.currentGeneratedOrg) return;
    
    try {
      this.showStatus('Saving organization...', 'loading');
      
      // Add to OrgDataManager
      window.OrgDataManager.addOrganization(this.currentGeneratedOrg);
      
      this.showStatus('✅ Organization saved successfully!', 'success');
      this.updateOrganizationSelector();
      
      // Set as selected in dropdown but don't apply until user clicks Apply
      const selector = document.getElementById('panel-org-selector');
      if (selector) {
        selector.value = this.currentGeneratedOrg.name;
      }
      
      // Reset to initial state
      this.showInitialState();
      
    } catch (error) {
      this.showStatus(`❌ Error saving organization: ${error.message}`, 'error');
    }
  }

  showGeneratedState() {
    document.getElementById('initial-generate-container').style.display = 'none';
    document.getElementById('generated-actions-container').style.display = 'flex';
    document.getElementById('generated-preview').style.display = 'block';
  }

  showInitialState() {
    document.getElementById('initial-generate-container').style.display = 'flex';
    document.getElementById('generated-actions-container').style.display = 'none';
    document.getElementById('generated-preview').style.display = 'none';
    
    // Clear form
    document.getElementById('panel-org-name').value = '';
    document.getElementById('panel-account-count').value = '5';
    
    // Clear stored data
    this.lastGenerationParams = null;
    this.currentGeneratedOrg = null;
  }

  generateThematicAccounts(orgName, count) {
    const orgLower = orgName.toLowerCase();
    const orgWords = orgName.split(/\s+/).filter(w => w.length > 2);
    
    // Capture this context
    const self = this;
    
    // Advanced contextual analysis engine
    const analyzeContext = (orgName, orgLower) => {
      const contexts = [];
      
      // Multi-layer semantic analysis
      const patterns = {
        technology: /\b(tech|software|digital|cyber|cloud|data|ai|labs?|systems?|solutions?|dev|code|api|platform|neural|quantum|crypto|blockchain|machine|learning|automation|robotics|iot|saas)\b/,
        finance: /\b(bank|financial?|capital|invest|fund|credit|wealth|money|treasury|asset|portfolio|trading|exchange|equity|venture|insurance|fintech|payment|blockchain|defi)\b/,
        healthcare: /\b(health|medical?|hospital|clinic|pharma|bio|care|wellness|therapy|diagnostic|surgical|patient|doctor|nurse|medicine|treatment|rehabilitation|mental)\b/,
        creative: /\b(creative|design|media|studio|artistic?|visual|graphics?|brand|marketing|advertising|content|story|narrative|experience|digital|art|photography|video)\b/,
        commerce: /\b(retail|store|shop|market|commerce|boutique|outlet|sales|customer|product|brand|lifestyle|fashion|luxury|premium|marketplace|ecommerce)\b/,
        education: /\b(education|school|academy|institute|university|college|learning|training|knowledge|curriculum|academic|student|teacher|research|scholarship)\b/,
        nature: /\b(green|eco|nature|earth|forest|ocean|mountain|valley|sustainable|environmental|renewable|clean|organic|natural|conservation|climate)\b/,
        logistics: /\b(transport|logistics|shipping|cargo|freight|delivery|express|supply|chain|distribution|fleet|route|warehouse|fulfillment)\b/,
        consulting: /\b(consulting|advisory|strategy|management|consulting|professional|services|expertise|guidance|transformation|optimization)\b/,
        manufacturing: /\b(manufacturing|production|industrial|factory|assembly|engineering|automotive|aerospace|machinery|materials|quality|precision)\b/
      };
      
      for (const [context, pattern] of Object.entries(patterns)) {
        if (pattern.test(orgLower)) {
          contexts.push(context);
        }
      }
      
      return contexts.length > 0 ? contexts : ['general'];
    };
    
    // Dynamic vocabulary engine
    const vocabularyEngine = {
      // Power adjectives by context
      adjectives: {
        technology: ['innovative', 'digital', 'smart', 'advanced', 'quantum', 'neural', 'cyber', 'automated', 'intelligent', 'cutting-edge', 'revolutionary', 'disruptive', 'scalable', 'adaptive'],
        finance: ['strategic', 'premium', 'elite', 'trusted', 'secure', 'global', 'sophisticated', 'diversified', 'robust', 'dynamic', 'capital', 'wealth-focused', 'risk-aware', 'performance-driven'],
        healthcare: ['vital', 'compassionate', 'healing', 'precision', 'integrated', 'patient-centered', 'clinical', 'therapeutic', 'evidence-based', 'holistic', 'specialized', 'breakthrough', 'life-saving'],
        creative: ['visionary', 'artistic', 'bold', 'expressive', 'imaginative', 'storytelling', 'impactful', 'engaging', 'memorable', 'authentic', 'experiential', 'boundary-pushing', 'trend-setting'],
        commerce: ['customer-focused', 'premium', 'curated', 'trendsetting', 'lifestyle', 'experiential', 'personalized', 'luxury', 'accessible', 'discovery-driven', 'value-oriented'],
        education: ['transformative', 'inspiring', 'knowledge-driven', 'student-centered', 'academic', 'scholarly', 'innovative', 'progressive', 'research-based', 'collaborative', 'excellence-focused'],
        nature: ['sustainable', 'organic', 'renewable', 'eco-friendly', 'natural', 'conservation-minded', 'earth-conscious', 'green', 'regenerative', 'climate-positive', 'biosphere-aware'],
        logistics: ['efficient', 'streamlined', 'reliable', 'fast-track', 'optimized', 'supply-focused', 'distribution-savvy', 'route-smart', 'delivery-excellence', 'logistics-powered'],
        general: ['innovative', 'strategic', 'dynamic', 'excellence-driven', 'performance-focused', 'solution-oriented', 'customer-centric', 'growth-minded', 'quality-assured', 'impact-driven']
      },
      
      // Core business nouns by context
      nouns: {
        technology: ['lab', 'forge', 'studio', 'works', 'systems', 'solutions', 'innovations', 'platform', 'engine', 'core', 'hub', 'network', 'intelligence', 'dynamics', 'collective'],
        finance: ['partners', 'capital', 'advisors', 'group', 'holdings', 'ventures', 'assets', 'fund', 'treasury', 'portfolio', 'exchange', 'wealth', 'investments', 'financial'],
        healthcare: ['clinic', 'center', 'wellness', 'care', 'health', 'medical', 'therapeutics', 'diagnostics', 'recovery', 'vitality', 'healing', 'life', 'medicine', 'treatment'],
        creative: ['studio', 'collective', 'workshop', 'atelier', 'agency', 'experience', 'stories', 'vision', 'craft', 'artisan', 'creators', 'design', 'media', 'content'],
        commerce: ['boutique', 'marketplace', 'collection', 'brands', 'retail', 'lifestyle', 'experience', 'curated', 'premium', 'select', 'discovery', 'commerce', 'market'],
        education: ['academy', 'institute', 'learning', 'knowledge', 'scholars', 'research', 'education', 'training', 'development', 'excellence', 'achievement', 'progress'],
        nature: ['earth', 'nature', 'eco', 'green', 'sustainability', 'conservation', 'renewable', 'environment', 'climate', 'organic', 'natural', 'biosphere'],
        logistics: ['logistics', 'express', 'supply', 'distribution', 'transport', 'delivery', 'freight', 'chain', 'route', 'flow', 'network', 'movement'],
        general: ['solutions', 'group', 'partners', 'collective', 'network', 'alliance', 'consortium', 'enterprise', 'ventures', 'dynamics', 'innovations', 'excellence']
      },
      
      // Regional and geographical elements
      regions: {
        continents: ['Americas', 'European', 'Asian', 'Pacific', 'Nordic', 'Mediterranean', 'Atlantic', 'Arctic'],
        countries: ['Swiss', 'Japanese', 'German', 'Canadian', 'Australian', 'Brazilian', 'Korean', 'Dutch', 'Swedish', 'Danish', 'Finnish', 'Singapore'],
        regions: ['Northern', 'Southern', 'Eastern', 'Western', 'Central', 'Coastal', 'Mountain', 'Valley', 'Highland', 'Lowland'],
        cities: ['Manhattan', 'Silicon Valley', 'Geneva', 'Hong Kong', 'London', 'Tokyo', 'Stockholm', 'Copenhagen', 'Amsterdam', 'Zurich', 'Barcelona', 'Melbourne']
      },
      
      // Organizational structures
      structures: ['division', 'group', 'team', 'unit', 'squad', 'collective', 'alliance', 'consortium', 'network', 'hub', 'center', 'institute', 'lab', 'studio', 'works', 'dynamics', 'solutions', 'ventures', 'partners'],
      
      // Personality modifiers
      personalities: ['alpha', 'apex', 'prime', 'core', 'elite', 'premier', 'signature', 'flagship', 'catalyst', 'nexus', 'vanguard', 'pinnacle', 'zenith', 'meridian', 'paradigm']
    };
    
    // Helper functions
    const pickRandom = (array) => {
      return array[Math.floor(Math.random() * array.length)];
    };
    
    const titleCase = (str) => {
      return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };
    
    // Simplified name generation
    const generateName = (contexts, orgWords) => {
      const primaryContext = contexts[0] || 'general';
      
      const strategies = [
        // Strategy 1: Adjective + Noun
        () => {
          const adj = pickRandom(vocabularyEngine.adjectives[primaryContext] || vocabularyEngine.adjectives.general);
          const noun = pickRandom(vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general);
          return titleCase(`${adj} ${noun}`);
        },
        
        // Strategy 2: Personality + Structure
        () => {
          const personality = pickRandom(vocabularyEngine.personalities);
          const structure = pickRandom(vocabularyEngine.structures);
          return titleCase(`${personality} ${structure}`);
        },
        
        // Strategy 3: Org-derived + Context noun
        () => {
          const orgWord = pickRandom(orgWords.filter(w => w.length > 3));
          const noun = pickRandom(vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general);
          return orgWord ? titleCase(`${orgWord} ${noun}`) : titleCase(`core ${noun}`);
        },
        
        // Strategy 4: Context-specific compound
        () => {
          const adj1 = pickRandom(vocabularyEngine.adjectives[primaryContext] || vocabularyEngine.adjectives.general);
          const structure = pickRandom(vocabularyEngine.structures);
          return titleCase(`${adj1} ${structure}`);
        },
        
        // Strategy 5: Semantic blend
        () => {
          const contextWords = vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general;
          const word1 = pickRandom(contextWords);
          const word2 = pickRandom(vocabularyEngine.structures);
          return titleCase(`${word1} ${word2}`);
        },
        
        // Strategy 6: Regional + Context noun
        () => {
          const allRegions = [
            ...vocabularyEngine.regions.countries,
            ...vocabularyEngine.regions.continents,
            ...vocabularyEngine.regions.regions
          ];
          const region = pickRandom(allRegions);
          const noun = pickRandom(vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general);
          return titleCase(`${region} ${noun}`);
        },
        
        // Strategy 7: City + Structure
        () => {
          const city = pickRandom(vocabularyEngine.regions.cities);
          const structure = pickRandom(vocabularyEngine.structures);
          return titleCase(`${city} ${structure}`);
        },
        
        // Strategy 8: Country + Adjective + Noun
        () => {
          const country = pickRandom(vocabularyEngine.regions.countries);
          const adj = pickRandom(vocabularyEngine.adjectives[primaryContext] || vocabularyEngine.adjectives.general);
          const noun = pickRandom(vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general);
          return Math.random() > 0.5 ? 
            titleCase(`${country} ${noun}`) : 
            titleCase(`${adj} ${country} ${noun}`);
        },
        
        // Strategy 9: Region + Personality + Structure
        () => {
          const region = pickRandom(vocabularyEngine.regions.regions);
          const personality = pickRandom(vocabularyEngine.personalities);
          const structure = pickRandom(vocabularyEngine.structures);
          return titleCase(`${region} ${personality} ${structure}`);
        },
        
        // Strategy 10: Hybrid Regional
        () => {
          const allRegionalTerms = [
            ...vocabularyEngine.regions.countries,
            ...vocabularyEngine.regions.cities,
            ...vocabularyEngine.regions.regions
          ];
          const regional = pickRandom(allRegionalTerms);
          const contextWord = pickRandom(vocabularyEngine.nouns[primaryContext] || vocabularyEngine.nouns.general);
          const structure = pickRandom(vocabularyEngine.structures);
          
          const combinations = [
            `${regional} ${contextWord}`,
            `${contextWord} ${regional}`,
            `${regional} ${structure}`
          ];
          return titleCase(pickRandom(combinations));
        }
      ];
      
      const strategy = pickRandom(strategies);
      return strategy();
    };
    
    // Generate names using simplified algorithm
    const contexts = analyzeContext(orgName, orgLower);
    const names = new Set();
    
    // Generate diverse names
    for (let i = 0; i < count * 3; i++) {
      try {
        const name = generateName(contexts, orgWords);
        if (name && name.length > 3) {
          names.add(name);
        }
      } catch (error) {
        console.error('Error generating name:', error);
      }
    }
    
    // Convert to array and shuffle
    const nameArray = Array.from(names);
    const shuffled = nameArray.sort(() => Math.random() - 0.5);
    
    // Return requested count
    return shuffled.slice(0, count);
  }
  
  // Utility functions for advanced generation
  seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return function() {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }
  
  pickRandom(array, rng) {
    return array[Math.floor(rng() * array.length)];
  }
  
  titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  generateAccountColor(accountName, index) {
    // Generate a consistent color based on account name
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    const hash = accountName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  displayGeneratedPreview(orgName, accounts) {
    const preview = document.getElementById('generated-preview');
    const content = document.getElementById('preview-content');
    
    content.innerHTML = `
      <div class="preview-org-info">
        <strong>${orgName}</strong> • ${accounts.length} account${accounts.length !== 1 ? 's' : ''}
      </div>
      <ul class="preview-accounts-list">
        ${accounts.map(name => `<li>${name}</li>`).join('')}
      </ul>
    `;
  }

  resetAllData() {
    if (confirm('Reset all prototype data including account groups and spreadsheet connections?\n\nThis cannot be undone.')) {
      this.showStatus('Resetting all data...', 'loading');
      // Clear user-created custom account groups as well
      try { localStorage.removeItem('accountGroups'); } catch (e) {}
      window.OrgDataManager.resetAllData();
      
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  saveData() {
    // Check if organization needs to be applied
    const selector = document.getElementById('panel-org-selector');
    const currentOrg = window.OrgDataManager.getCurrentOrganization();
    const selectedOrgName = selector.value;
    
    if (selectedOrgName && selectedOrgName !== (currentOrg ? currentOrg.name : '')) {
      // Apply organization change
      try {
        this.showStatus('Applying changes...', 'loading');
        
        // Find the organization by name
        const organizations = window.OrgDataManager.organizations;
        const selectedOrg = organizations.find(org => org.name === selectedOrgName);
        
        if (!selectedOrg) {
          throw new Error('Organization not found');
        }
        
        // Switch to the selected organization
        window.OrgDataManager.setCurrentOrganization(selectedOrg);
        
        this.showStatus('✅ Changes saved! Page will refresh...', 'success');
        
        setTimeout(() => {
          location.reload();
        }, 1500);
        
      } catch (error) {
        this.showStatus(`❌ Error: ${error.message}`, 'error');
        return;
      }
    } else {
      this.showStatus('✅ Data saved successfully!', 'success');
      setTimeout(() => {
        this.close();
      }, 1000);
    }
  }

  updateOrganizationSelector() {
    const selector = document.getElementById('panel-org-selector');
    
    if (!selector || !window.OrgDataManager) return;
    
    // Clear existing options except the first one
    selector.innerHTML = '<option value="">Select an organization...</option>';
    
    // Get all organization names
    const orgNames = window.OrgDataManager.getAllOrganizationNames();
    
    // Populate selector with organizations
    orgNames.forEach(orgName => {
      const option = document.createElement('option');
      option.value = orgName;
      option.textContent = orgName;
      selector.appendChild(option);
    });
    
    // Set current organization as selected
    const currentOrg = window.OrgDataManager.getCurrentOrganization();
    if (currentOrg) {
      selector.value = currentOrg.name;
    }
  }

  applyOrganization() {
    const selector = document.getElementById('panel-org-selector');
    const selectedOrgName = selector.value;
    
    if (!selectedOrgName) {
      this.showStatus('Please select an organization.', 'error');
      return;
    }
    
    try {
      this.showStatus('Switching organization...', 'loading');
      
      // Find the organization by name
      const organizations = window.OrgDataManager.organizations;
      const selectedOrg = organizations.find(org => org.name === selectedOrgName);
      
      if (!selectedOrg) {
        throw new Error('Organization not found');
      }
      
      // Switch to the selected organization
      window.OrgDataManager.setCurrentOrganization(selectedOrg);
      
      this.showStatus('✅ Organization switched! Page will refresh...', 'success');
      
      setTimeout(() => {
        location.reload();
      }, 1500);
      
    } catch (error) {
      this.showStatus(`❌ Error: ${error.message}`, 'error');
    }
  }

  async sharePrototype() {
    try {
      // Show loading state
      const shareBtn = this.panel.querySelector('.share-btn');
      const originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.3"/>
          <path d="M7 1v6l3-3m-3 3L4 4" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
        </svg>
        Generating...
      `;
      shareBtn.disabled = true;
      
      this.showStatus('🔗 Generating shareable URL...', 'loading');
      
      // Initialize share utility if not already done
      if (!window.prototypeShare) {
        window.prototypeShare = new window.PrototypeShare();
      }
      
      // Generate shareable URL
      const result = await window.prototypeShare.sharePrototype();
      
      if (result.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.shareUrl);
        
        this.showStatus('✅ Shareable URL copied to clipboard!', 'success');
        
        // Show URL in a nice modal/alert
        this.showShareUrlModal(result.shareUrl, result.shareId);
        
      } else {
        throw new Error(result.error || 'Failed to generate share URL');
      }
      
    } catch (error) {
      console.error('Share failed:', error);
      this.showStatus(`❌ Failed to share: ${error.message}`, 'error');
    } finally {
      // Restore button state
      const shareBtn = this.panel.querySelector('.share-btn');
      shareBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 4.5C11.6046 4.5 12.5 3.60457 12.5 2.5C12.5 1.39543 11.6046 0.5 10.5 0.5C9.39543 0.5 8.5 1.39543 8.5 2.5C8.5 2.83289 8.58289 3.14675 8.72842 3.42264L5.77158 5.32736C5.39806 4.88364 4.82608 4.6 4.2 4.6C3.14772 4.6 2.3 5.44772 2.3 6.5C2.3 7.55228 3.14772 8.4 4.2 8.4C4.82608 8.4 5.39806 8.11636 5.77158 7.67264L8.72842 9.57736C8.58289 9.85325 8.5 10.1671 8.5 10.5C8.5 11.6046 9.39543 12.5 10.5 12.5C11.6046 12.5 12.5 11.6046 12.5 10.5C12.5 9.39543 11.6046 8.5 10.5 8.5C9.87392 8.5 9.30194 8.78364 8.92842 9.22736L5.97158 7.32264C6.11711 7.04675 6.2 6.73289 6.2 6.4C6.2 6.2 6.17158 6.00736 6.12842 5.82264L9.07158 3.92736C9.44806 4.36364 10.0201 4.6 10.5 4.5Z" fill="currentColor"/>
        </svg>
        Share prototype
      `;
      shareBtn.disabled = false;
    }
  }

  showShareUrlModal(shareUrl, shareId) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      ">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          🔗 Prototype Ready to Share
        </h3>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          Anyone with this URL will see your current prototype data (organizations, accounts, and groups).
        </p>
        <div style="
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          font-family: monospace;
          font-size: 13px;
          word-break: break-all;
          color: #374151;
        ">${shareUrl}</div>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
          <button onclick="this.closest('[style*=fixed]').remove()" style="
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          ">Close</button>
          <button onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy URL', 2000)" style="
            padding: 8px 16px;
            border: 1px solid #675dff;
            background: #675dff;
            color: white;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          ">Copy URL</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.querySelector('div').style.transform = 'scale(1)';
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById('panel-status');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    // Set colors based on type
    if (type === 'success') {
      statusDiv.style.background = 'var(--green-50)';
      statusDiv.style.color = 'var(--green-700)';
      statusDiv.style.borderColor = 'var(--green-200)';
    } else if (type === 'error') {
      statusDiv.style.background = 'var(--red-50)';
      statusDiv.style.color = 'var(--red-700)';
      statusDiv.style.borderColor = 'var(--red-200)';
    } else if (type === 'loading') {
      statusDiv.style.background = 'var(--blue-50)';
      statusDiv.style.color = 'var(--blue-700)';
      statusDiv.style.borderColor = 'var(--blue-200)';
    }
    
    // Auto-hide success/loading messages
    if (type === 'success' || type === 'loading') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 4000);
    }
  }

  toggleModule(moduleId) {
    const moduleContent = document.getElementById(`${moduleId}-content`);
    const moduleHeader = moduleContent.previousElementSibling;
    
    if (moduleContent.classList.contains('collapsed')) {
      // Expand
      moduleContent.classList.remove('collapsed');
      moduleHeader.classList.remove('collapsed');
      moduleContent.style.display = 'block';
    } else {
      // Collapse
      moduleContent.classList.add('collapsed');
      moduleHeader.classList.add('collapsed');
      moduleContent.style.display = 'none';
    }
    
    // Allow modal to adjust to new content size
    this.adjustModalSize();
  }

  adjustModalSize() {
    // Force a reflow to ensure the modal adjusts to content size
    // The CSS flex properties will handle the actual resizing
    if (this.panel) {
      this.panel.style.height = 'auto';
      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        // The modal will naturally resize based on content due to flex: 1 1 auto
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.prototypePanel = new PrototypeControlPanel();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PrototypeControlPanel };
} 