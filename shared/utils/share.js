/**
 * Prototype Data Sharing Utilities
 * Handles exporting/importing prototype state via key-value store
 */

class PrototypeShare {
  constructor() {
    this.apiEndpoint = this.getApiEndpoint();
  }

  getApiEndpoint() {
    // Detect environment and set appropriate API endpoint
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local development - use mock API
      return null;
    } else if (window.location.hostname.includes('netlify')) {
      // Netlify deployment
      return '/.netlify/functions/share';
    } else if (window.location.hostname.includes('vercel')) {
      // Vercel deployment
      return '/api/share';
    } else {
      // Custom deployment - assume API at /api/share
      return '/api/share';
    }
  }

  async sharePrototype() {
    try {
      // Collect current prototype state
      const shareData = await this.exportCurrentState();
      
      // Store via API or mock
      let response;
      if (this.apiEndpoint) {
        // Real API call
        const apiResponse = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shareData)
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API error: ${apiResponse.status}`);
        }
        
        response = await apiResponse.json();
      } else {
        // Local mock API
        response = await window.shareAPI.post(shareData);
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create share');
      }
      
      return {
        success: true,
        shareId: response.shareId,
        shareUrl: response.shareUrl
      };
      
    } catch (error) {
      console.error('Failed to share prototype:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadSharedPrototype(shareId) {
    try {
      let response;
      if (this.apiEndpoint) {
        // Real API call
        const apiResponse = await fetch(`${this.apiEndpoint}?id=${shareId}`);
        
        if (!apiResponse.ok) {
          if (apiResponse.status === 404) {
            throw new Error('Shared prototype not found or expired');
          }
          throw new Error(`API error: ${apiResponse.status}`);
        }
        
        response = await apiResponse.json();
      } else {
        // Local mock API
        response = await window.shareAPI.get(shareId);
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load share');
      }
      
      // Import the shared data
      await this.importSharedState(response.data);
      
      return {
        success: true,
        data: response.data,
        createdAt: response.createdAt
      };
      
    } catch (error) {
      console.error('Failed to load shared prototype:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async exportCurrentState() {
    // Wait for OrgDataManager to be ready
    if (window.OrgDataManager && window.OrgDataManager.initPromise) {
      await window.OrgDataManager.initPromise;
    }

    const currentOrg = window.OrgDataManager?.getCurrentOrganization();
    const currentAccount = window.OrgDataManager?.getCurrentSubAccount();
    
    // Get account groups and add organizationName to each group
    const accountGroups = (window.OrgDataManager?.getAccountGroups() || []).map(group => ({
      ...group,
      organizationName: currentOrg?.name || 'Unknown'
    }));
    
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      organizations: window.OrgDataManager?.organizations || [],
      accountGroups: accountGroups,
      currentState: {
        organizationName: currentOrg?.name,
        subAccountId: currentAccount?.id
      },
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href.split('?')[0], // Base URL without params
        exportedFrom: 'prototype-control-panel'
      }
    };
  }

  async importSharedState(sharedData) {
    try {
      // Validate shared data
      if (!sharedData || !sharedData.organizations) {
        throw new Error('Invalid shared data format');
      }

      // Wait for OrgDataManager to be ready
      if (window.OrgDataManager && window.OrgDataManager.initPromise) {
        await window.OrgDataManager.initPromise;
      }

      // Import organizations
      if (window.OrgDataManager) {
        // Set organizations directly
        window.OrgDataManager.organizations = sharedData.organizations;

        // Save to localStorage FIRST for persistence
        localStorage.setItem('uxr_organizations_data', JSON.stringify(sharedData.organizations));
        
        // Save account groups per organization to localStorage
        if (sharedData.accountGroups && sharedData.accountGroups.length > 0) {
          console.log('💾 Saving account groups to localStorage:', sharedData.accountGroups.length, 'total groups');
          sharedData.organizations.forEach(org => {
            const orgGroups = sharedData.accountGroups.filter(g => 
              g.organizationName === org.name
            );
            if (orgGroups.length > 0) {
              const storageKey = `uxr_account_groups_${org.name}`;
              localStorage.setItem(storageKey, JSON.stringify(orgGroups));
              console.log(`💾 Saved ${orgGroups.length} groups for org "${org.name}" to key "${storageKey}"`);
            } else {
              console.log(`⚠️ No groups found for organization "${org.name}"`);
            }
          });
        } else {
          console.log('⚠️ No account groups in shared data to save');
        }

        // Restore current state if provided
        if (sharedData.currentState) {
          const { organizationName, subAccountId } = sharedData.currentState;
          
          if (organizationName) {
            const org = window.OrgDataManager.getOrganizationByName(organizationName);
            if (org) {
              window.OrgDataManager.setCurrentOrganization(org);
              
              // AFTER setting current organization, load account groups for that org
              if (window.OrgDataManager.loadAccountGroups) {
                console.log('🔄 Loading account groups for organization:', org.name);
                window.OrgDataManager.loadAccountGroups();
                console.log('📊 Account groups loaded:', window.OrgDataManager.accountGroups?.length || 0);
              }
              
              if (subAccountId) {
                const account = window.OrgDataManager.getSubAccountById(subAccountId);
                if (account) {
                  window.OrgDataManager.setCurrentSubAccount(account);
                }
              }
            }
          }
        } else {
          // If no current state, set to first organization and load its groups
          if (sharedData.organizations.length > 0) {
            window.OrgDataManager.setCurrentOrganization(sharedData.organizations[0]);
            if (window.OrgDataManager.loadAccountGroups) {
              console.log('🔄 Loading account groups for first organization:', sharedData.organizations[0].name);
              window.OrgDataManager.loadAccountGroups();
              console.log('📊 Account groups loaded:', window.OrgDataManager.accountGroups?.length || 0);
            }
          }
        }

        // Trigger data refresh on current page
        if (typeof window.loadAccountGroups === 'function') {
          window.loadAccountGroups();
        }
        if (typeof window.updateAccountSwitcher === 'function') {
          window.updateAccountSwitcher();
        }
        if (typeof window.updateActiveAccountsCard === 'function') {
          window.updateActiveAccountsCard();
        }
      }

      console.log('Successfully imported shared prototype data:', sharedData.metadata);
      return true;
      
    } catch (error) {
      console.error('Failed to import shared state:', error);
      throw error;
    }
  }

  // Check URL for share parameter on page load
  async checkForSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (shareId) {
      console.log('Loading shared prototype:', shareId);
      const result = await this.loadSharedPrototype(shareId);
      
      if (result.success) {
        // Clean URL to remove share parameter
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('share');
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        this.showShareLoadMessage(result.createdAt);
      } else {
        // Show error message
        this.showShareErrorMessage(result.error);
      }
      
      return result.success;
    }
    
    return false;
  }

  showShareLoadMessage(createdAt) {
    const date = new Date(createdAt).toLocaleDateString();
    const message = `✅ Loaded shared prototype data from ${date}`;
    this.showNotification(message, 'success');
  }

  showShareErrorMessage(error) {
    const message = `❌ Failed to load shared prototype: ${error}`;
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}

// Initialize on page load
if (typeof window !== 'undefined') {
  window.PrototypeShare = PrototypeShare;
  
  // Create a promise that resolves when shared data check is complete
  window.sharedDataReady = new Promise(async (resolve) => {
    // Check URL immediately for share parameter
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (shareId) {
      console.log('🔗 Shared link detected, loading data before page initialization...');
      
      // Wait for page to be minimally ready
      if (document.readyState === 'loading') {
        await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
      }
      
      // Wait for OrgDataManager to be available and ready
      if (window.OrgDataManager) {
        await window.OrgDataManager.waitForReady();
      }
      
      const share = new PrototypeShare();
      const result = await share.loadSharedPrototype(shareId);
      
      if (result.success) {
        // Mark this session as participant mode (accessed via shared link)
        sessionStorage.setItem('loaded_shared_data', 'true');
        
        // Clean URL to remove share parameter
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('share');
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        share.showShareLoadMessage(result.createdAt);
        console.log('✅ Shared data loaded successfully before page initialization');
      } else {
        // Show error message
        share.showShareErrorMessage(result.error);
        console.error('❌ Failed to load shared data:', result.error);
      }
      
      resolve(result.success);
    } else {
      // No shared data, resolve immediately
      resolve(false);
    }
  });
  
  // Fallback: Auto-check for shared data when DOM is ready (for backwards compatibility)
  document.addEventListener('DOMContentLoaded', async () => {
    // This ensures sharedDataReady resolves even if no share ID
    await window.sharedDataReady;
  });
}