/**
 * Static Data Loader - Non-API Prototype Data Management
 * Handles loading participant data from static JSON files and URL parameters
 * Replaces API-based sharing to avoid Chrome security warnings
 */

class StaticDataLoader {
  constructor() {
    this.currentData = null;
    this.isParticipantMode = this.checkParticipantMode();
    this.init();
  }

  checkParticipantMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('mode') && urlParams.get('mode') === 'participant';
  }

  async init() {
    try {
      // Load data based on URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      const scenarioParam = urlParams.get('scenario');

      if (dataParam) {
        // Load participant-specific data
        await this.loadParticipantData(dataParam);
      } else if (scenarioParam) {
        // Load predefined scenario
        await this.loadScenario(scenarioParam);
      } else if (!this.isParticipantMode) {
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
      const response = await fetch(`./data/participants/${participantId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load participant data: ${response.status}`);
      }
      this.currentData = await response.json();
      console.log(`Loaded participant data for: ${participantId}`);
      return this.currentData;
    } catch (error) {
      console.error('Error loading participant data:', error);
      // Fallback to a default scenario
      return await this.loadScenario('enterprise');
    }
  }

  async loadScenario(scenarioName) {
    try {
      const response = await fetch(`./data/scenarios/${scenarioName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scenario: ${response.status}`);
      }
      this.currentData = await response.json();
      console.log(`Loaded scenario: ${scenarioName}`);
      return this.currentData;
    } catch (error) {
      console.error('Error loading scenario:', error);
      return await this.loadDefaultData();
    }
  }

  async loadDefaultData() {
    // Load the existing organizations data as fallback
    if (window.organizationData && window.organizationData.organizations && window.organizationData.organizations.length > 0) {
      const firstOrg = window.organizationData.organizations[0];
      this.currentData = {
        scenarioName: "Default",
        organizationName: firstOrg.name,
        accounts: firstOrg.accounts || [],
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
    console.log('generateParticipantData called');
    console.log('window.organizationData:', window.organizationData);
    console.log('window.selectedOrganizationName:', window.selectedOrganizationName);
    
    if (!window.organizationData) {
      throw new Error('No organization data available to generate participant file');
    }

    const selectedOrgName = window.selectedOrganizationName || 'Default Organization';
    console.log('Looking for organization:', selectedOrgName);
    console.log('Available organizations:', window.organizationData.organizations?.map(org => org.name));
    
    const selectedOrg = window.organizationData.organizations.find(org => org.name === selectedOrgName);
    
    if (!selectedOrg) {
      throw new Error(`Selected organization '${selectedOrgName}' not found. Available: ${window.organizationData.organizations?.map(org => org.name).join(', ')}`);
    }

    const participantId = this.generateParticipantId();
    const participantData = {
      scenarioName: selectedOrg.name,
      organizationName: selectedOrg.name,
      accounts: selectedOrg.accounts || [],
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
    
    return {
      participantId,
      shareUrl: `${window.location.origin}${window.location.pathname}?data=${participantId}&mode=participant`,
      data: participantData
    };
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
      // Update the global organization data to match our loaded data
      window.selectedOrganizationName = this.currentData.organizationName;
      
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
