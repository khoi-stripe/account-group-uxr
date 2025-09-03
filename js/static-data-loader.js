/**
 * Static Data Loader - Non-API Prototype Data Management
 * Handles loading participant data from static JSON files and URL parameters
 * Replaces API-based sharing to avoid Chrome security warnings
 */

class StaticDataLoader {
  constructor() {
    // 🧹 CACHE BUSTING: Check for ?fresh=true parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fresh') === 'true') {
      console.log('🧹 Fresh mode: Clearing cached data');
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Cache cleared successfully');
      } catch (error) {
        console.warn('⚠️ Could not clear cache:', error);
      }
    }
    
    this.currentData = null;
    this.isParticipantMode = this.checkParticipantMode();
    this.init();
  }

  checkParticipantMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlHasParticipantMode = urlParams.has('mode') && urlParams.get('mode') === 'participant';
    
    // Check URL parameters first
    if (urlHasParticipantMode) {
      // Store participant context in sessionStorage for persistence across pages
      const participantData = urlParams.get('data');
      const scenario = urlParams.get('scenario');
      
      if (participantData) {
        sessionStorage.setItem('participant_mode', 'true');
        sessionStorage.setItem('participant_data_id', participantData);
        console.log(`🔄 Stored participant mode: ${participantData}`);
      } else if (scenario) {
        sessionStorage.setItem('participant_mode', 'true');
        sessionStorage.setItem('participant_scenario', scenario);
        console.log(`🔄 Stored participant mode: scenario ${scenario}`);
      }
      
      return true;
    }
    
    // Check sessionStorage for persisted participant mode
    const storedParticipantMode = sessionStorage.getItem('participant_mode') === 'true';
    if (storedParticipantMode) {
      console.log(`✅ Restored participant mode from sessionStorage`);
      return true;
    }
    
    return false;
  }

  async init() {
    try {

      // Load data based on URL parameters or sessionStorage
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      const scenarioParam = urlParams.get('scenario');


      if (dataParam) {
        // Load participant-specific data from URL
        // Clear any cached participant data to ensure fresh load
        sessionStorage.removeItem('participant_organization_data');
        sessionStorage.removeItem('participant_data_id');
        sessionStorage.removeItem('participant_scenario');
        await this.loadParticipantData(dataParam);
      } else if (scenarioParam) {
        // Load predefined scenario from URL
        await this.loadScenario(scenarioParam);
      } else if (this.isParticipantMode) {
        // Check sessionStorage for participant data when URL params not available
        const storedDataId = sessionStorage.getItem('participant_data_id');
        const storedScenario = sessionStorage.getItem('participant_scenario');
        
        if (storedDataId) {

          await this.loadParticipantData(storedDataId);
        } else if (storedScenario) {

          await this.loadScenario(storedScenario);
        } else {
          // Try to restore from sessionStorage if available
          const storedOrgData = sessionStorage.getItem('participant_organization_data');
          if (storedOrgData) {
            try {
              const participantData = JSON.parse(storedOrgData);
              this.currentData = participantData;

            } catch (error) {
              console.warn('Failed to restore participant data from sessionStorage:', error);
              await this.loadDefaultData();
            }
          } else {
            console.log('⚠️ Participant mode but no stored data, loading default');
            await this.loadDefaultData();
          }
        }
      } else {
        // Load default data for researcher mode
        await this.loadDefaultData();
      }

      // Notify other components that data is ready
      this.notifyDataReady();
    } catch (error) {
      console.error('Error initializing static data loader:', error);
      // Fallback to default data
      await this.loadDefaultData();
    }
  }

  async loadParticipantData(participantId) {
    try {
      const url = `/account-group-uxr/data/participants/${participantId}.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load participant data: ${response.status}`);
      }
      this.currentData = await response.json();
      console.log(`✅ Loaded participant data: ${this.currentData.organizationName}`);
      return this.currentData;
    } catch (error) {
      console.error('❌ Error loading participant data:', error);
      console.log('🔄 Falling back to enterprise scenario');
      // Fallback to a default scenario
      return await this.loadScenario('enterprise');
    }
  }

  async loadScenario(scenarioName) {
    try {

      const response = await fetch(`/account-group-uxr/data/scenarios/${scenarioName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scenario: ${response.status}`);
      }
      this.currentData = await response.json();
      console.log(`✅ Loaded scenario: ${scenarioName}`);
      return this.currentData;
    } catch (error) {
      console.error('Error loading scenario:', error);
      return await this.loadDefaultData();
    }
  }

  async loadDefaultData() {
    // Load the existing organizations data as fallback
    if (window.OrgDataManager && window.OrgDataManager.organizations && window.OrgDataManager.organizations.length > 0) {
      const currentOrg = window.OrgDataManager.getCurrentOrganization() || window.OrgDataManager.organizations[0];
      this.currentData = {
        scenarioName: "Default",
        organizationName: currentOrg.name,
        accounts: currentOrg.accounts || [],
        metadata: {
          createdAt: new Date().toISOString(),
          scenario: "default",
          description: "Default organization data"
        }
      };
    } else {
      // Ultimate fallback
      this.currentData = {
        scenarioName: "Demo Company",
        organizationName: "Demo Company",
        accounts: [
          { id: "all_accounts", name: "Demo Company", type: "Aggregate view", isAggregate: true },
          { id: "demo_account_1", name: "Main Account", type: "Account", color: "#3B82F6" },
          { id: "demo_account_2", name: "Test Account", type: "Account", color: "#10B981" }
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          scenario: "demo",
          description: "Demo data for testing"
        }
      };
    }
    console.log('Loaded default data');
    return this.currentData;
  }

  // Generate a participant data file from current state
  async generateParticipantData() {
    // 🚨 GUARD: Prevent double execution within 1 second
    const now = Date.now();
    if (this._lastGenerationTime && (now - this._lastGenerationTime) < 1000) {
      console.log('⚠️ generateParticipantData called too quickly, ignoring to prevent race condition');
      return this._lastGenerationResult;
    }
    this._lastGenerationTime = now;
    
    console.log('generateParticipantData called');
    console.log('window.OrgDataManager:', window.OrgDataManager);
    console.log('window.selectedOrganizationName:', window.selectedOrganizationName);
    
    // Use OrgDataManager instead of window.organizationData
    if (!window.OrgDataManager) {
      throw new Error('Organization Data Manager not available. Please refresh the page.');
    }

    const currentOrg = window.OrgDataManager.getCurrentOrganization();
    const selectedOrgName = window.selectedOrganizationName || currentOrg?.name || 'Default Organization';
    
    console.log('Looking for organization:', selectedOrgName);
    console.log('Current organization from OrgDataManager:', currentOrg);
    console.log('Available organizations:', window.OrgDataManager.organizations?.map(org => org.name));
    
    // Get the organization from OrgDataManager
    const selectedOrg = window.OrgDataManager.getOrganizationByName(selectedOrgName);
    
    if (!selectedOrg) {
      const available = window.OrgDataManager.organizations?.map(org => org.name).join(', ') || 'None';
      throw new Error(`Selected organization '${selectedOrgName}' not found. Available: ${available}`);
    }

    // 🔧 FIX: Generate participantId only once to avoid race conditions
    const participantId = this.generateParticipantId();
    console.log('Generated consistent participantId:', participantId);
    
    // Get accounts from the selected organization
    const orgAccounts = selectedOrg.accounts || [];
    console.log('Organization accounts:', orgAccounts);
    
    const participantData = {
      scenarioName: selectedOrg.name,
      organizationName: selectedOrg.name,
      accounts: orgAccounts,
      metadata: {
        createdAt: new Date().toISOString(),
        participantId: participantId,
        scenario: "custom",
        description: `Custom participant data for ${selectedOrg.name}`
      }
    };

    // In a real implementation, this would save to the server
    // For now, we'll use a blob download as a temporary solution
    await this.downloadParticipantFile(participantId, participantData);
    
    const result = {
      participantId,
      shareUrl: `${window.location.origin}${window.location.pathname}?data=${participantId}&mode=participant`,
      data: participantData
    };
    
    // 🔧 CACHE: Store result to prevent race conditions
    this._lastGenerationResult = result;
    
    return result;
  }

  generateParticipantId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `participant-${timestamp}-${random}`;
  }

  async downloadParticipantFile(participantId, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${participantId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`Generated participant file: ${participantId}.json`);
    console.log('Please upload this file to the data/participants/ directory');
  }

  // Get available scenarios
  async getAvailableScenarios() {
    const scenarios = ['enterprise', 'startup', 'agency'];
    const scenarioData = [];

    for (const scenario of scenarios) {
      try {
        const response = await fetch(`./data/scenarios/${scenario}.json`);
        if (response.ok) {
          const data = await response.json();
          scenarioData.push({
            id: scenario,
            name: data.scenarioName || scenario,
            description: data.metadata?.description || `${scenario} scenario`
          });
        }
      } catch (error) {
        console.warn(`Could not load scenario: ${scenario}`);
      }
    }

    return scenarioData;
  }

  // Integrate with existing organization data system
  integrateWithOrganizationData() {
    if (this.currentData && this.currentData.accounts) {
      // 🔧 FIX: In participant mode, force override all existing data
      if (this.isParticipantMode) {
        console.log(`🔄 Participant mode: Force loading ${this.currentData.organizationName} data`);
        
        // Store participant data in sessionStorage for cross-page persistence
        sessionStorage.setItem('participant_organization_data', JSON.stringify({
          organizationName: this.currentData.organizationName,
          accounts: this.currentData.accounts,
          metadata: this.currentData.metadata,
          scenarioName: this.currentData.scenarioName
        }));
        
        // Clear any cached organization data that might conflict
        localStorage.removeItem('uxr_organizations_data');
        localStorage.removeItem('uxr_current_organization');
        localStorage.removeItem('uxr_current_sub_account');
        
        // Force OrgDataManager to use our participant data
        if (window.OrgDataManager) {
          // Replace the organizations array with our participant data
          window.OrgDataManager.organizations = [{
            name: this.currentData.organizationName,
            accounts: this.currentData.accounts
          }];
          
          // Set as current organization
          window.OrgDataManager.setCurrentOrganization(window.OrgDataManager.organizations[0]);
          
          // Set aggregate view as current sub-account
          const aggregateAccount = this.currentData.accounts.find(acc => acc.isAggregate);
          if (aggregateAccount) {
            window.OrgDataManager.setCurrentSubAccount(aggregateAccount);
          }
        }
        
        console.log(`✅ Participant mode: Successfully loaded ${this.currentData.organizationName} data`);
        return;
      }
      
      // Normal mode: Standard integration
      window.selectedOrganizationName = this.currentData.organizationName;
      
      // Create a compatibility layer for window.organizationData
      if (!window.organizationData) {
        window.organizationData = { organizations: [] };
      }
      
      // Replace or add our loaded organization
      const existingIndex = window.organizationData.organizations.findIndex(
        org => org.name === this.currentData.organizationName
      );
      
      const organizationData = {
        name: this.currentData.organizationName,
        accounts: this.currentData.accounts
      };

      if (existingIndex >= 0) {
        window.organizationData.organizations[existingIndex] = organizationData;
      } else {
        window.organizationData.organizations.unshift(organizationData);
      }

      // Set as current organization
      window.selectedOrganizationName = this.currentData.organizationName;
      
      // If OrgDataManager exists, try to integrate with it too
      if (window.OrgDataManager && this.currentData.organizationName !== 'Demo Company') {
        try {
          const existingOrg = window.OrgDataManager.getOrganizationByName(this.currentData.organizationName);
          if (existingOrg) {
            window.OrgDataManager.setCurrentOrganization(existingOrg);
          }
        } catch (error) {
          console.warn('Could not integrate with OrgDataManager:', error);
        }
      }
      
      console.log(`Integrated data for organization: ${this.currentData.organizationName}`);
    }
  }

  notifyDataReady() {
    // Integrate with existing system
    this.integrateWithOrganizationData();
    
    // Dispatch custom event for other components
    const event = new CustomEvent('staticDataReady', {
      detail: {
        data: this.currentData,
        isParticipantMode: this.isParticipantMode
      }
    });
    window.dispatchEvent(event);
    
    console.log('Static data ready:', this.currentData);
  }

  getCurrentData() {
    return this.currentData;
  }

  isInParticipantMode() {
    return this.isParticipantMode;
  }
}

// Global instance
window.staticDataLoader = new StaticDataLoader();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StaticDataLoader;
}
