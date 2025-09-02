/**
 * UXR Organization Data Management - Sub-Account Model
 * Focus on sub-accounts within organizations rather than org switching
 * Supports CSV/spreadsheet data loading for easy UXR data management
 */

// Spreadsheet integration helper
class SpreadsheetDataLoader {
  constructor() {
    this.csvData = null;
    this.processedData = [];
  }

  // Load CSV data from text content
  async loadFromCSV(csvContent) {
    try {
      const rows = csvContent.split('\n').map(row => 
        row.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, '')) // Remove quotes
      );
      
      if (rows.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }
      
      const organizations = new Map();
      // Track account name counters per organization to handle duplicates
      const accountNameCounters = new Map();
      
      // Expected format: Organization,Account Name
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || !row[0] || !row[1]) continue;
        
        const orgName = row[0];
        const accountName = row[1];
        
        // Track how many accounts with this name we've seen in this org
        const orgAccountKey = `${orgName}_${accountName}`;
        const nameCount = (accountNameCounters.get(orgAccountKey) || 0) + 1;
        accountNameCounters.set(orgAccountKey, nameCount);
        
        // Generate unique ID that includes the occurrence count for duplicates
        const accountId = this.generateAccountId(orgName, accountName, nameCount);
        
        if (!organizations.has(orgName)) {
          organizations.set(orgName, {
            name: orgName,
            accounts: [
              { id: "all_accounts", name: orgName, type: "Aggregate view", isAggregate: true }
            ]
          });
        }
        
        // Keep original name for display, but ensure unique IDs and colors
        organizations.get(orgName).accounts.push({
          id: accountId,
          name: accountName, // Use original name without numbering
          originalName: accountName, // Store the original name for reference
          type: "Account", // Default type for all accounts
          color: this.generateAccountColor(accountName, accountId) // Unique color based on unique ID
        });
      }
      
      this.processedData = Array.from(organizations.values());
      return this.processedData;
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  }

  generateAccountId(orgName, accountName, nameCount = 1) {
    // Generate deterministic IDs that remain stable across page loads
    const orgClean = orgName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
    const accClean = accountName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    
    // Include nameCount in the hash to ensure uniqueness for duplicate names
    const combined = `${orgName}_${accountName}_${nameCount}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & 0xffffffff; // Convert to 32-bit integer properly
    }
    
    // Use longer hash for better uniqueness (6 chars instead of 3)
    const hashStr = Math.abs(hash).toString(36).slice(0, 6);
    
    // Include nameCount suffix for duplicate accounts (but not for the first occurrence)
    const suffix = nameCount > 1 ? `_${nameCount}` : '';
    
    return `${orgClean}_${accClean}_${hashStr}${suffix}`;
  }

  generateAccountColor(accountName, accountId) {
    // Deterministic color generation based on account name and ID
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

    // Generate consistent color based on account name + ID
    const combined = `${accountName}_${accountId}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Generate sample CSV content for users
  getSampleCSV() {
    return `Organization,Account Name
TechSaaS Corp,Mobile App
TechSaaS Corp,Web Platform
TechSaaS Corp,API Services
TechSaaS Corp,Mobile App
TechSaaS Corp,Analytics Dashboard
TechSaaS Corp,Development Environment
TechSaaS Corp,Staging Environment
TechSaaS Corp,Production Environment
GlobalCommerce Ltd,North America B2B
GlobalCommerce Ltd,North America B2C
GlobalCommerce Ltd,Europe B2B
GlobalCommerce Ltd,Europe B2C
GlobalCommerce Ltd,North America B2B
GlobalCommerce Ltd,Marketplace Platform
GlobalCommerce Ltd,Payment Processing
FinanceFirst Bank,Personal Banking
FinanceFirst Bank,Commercial Banking
FinanceFirst Bank,Investment & Wealth
FinanceFirst Bank,Digital Banking
FinanceFirst Bank,Personal Banking`;
  }

  async getDefaultData() {
    try {
      // Try to load CSV from repository first
      const response = await fetch('./data/organizations.csv');
      if (response.ok) {
        const csvContent = await response.text();
        console.log('✅ Loaded organizations.csv from repository');
        return this.loadFromCSV(csvContent);
      }
    } catch (error) {
      console.warn('Could not load repository CSV, using sample data:', error);
    }
    
    // Fallback to sample CSV
    return this.loadFromCSV(this.getSampleCSV());
  }
}

// Enhanced group types for UXR study
const GROUP_TYPES = {
  ACCOUNTS: {
    id: 'accounts',
    name: 'Accounts',
    description: 'Flexible account groupings for filtering and organization',
    allowMultipleMembership: true,
    icon: 'folder',
    useCases: ['Filtering shortcuts', 'Quick access', 'Reporting views']
  },
  RESOURCE_SHARING: {
    id: 'resource_sharing',
    name: 'Resource sharing',
    description: 'Exclusive groups for resource access and permissions',
    allowMultipleMembership: false,
    icon: 'users',
    useCases: ['Access control', 'Resource allocation', 'Team management']
  }
};

// Sub-Account focused data manager
class OrganizationDataManager {
  constructor() {
    this.currentOrganization = null;
    this.currentSubAccount = null;
    this.accountGroups = [];
    this.spreadsheetLoader = new SpreadsheetDataLoader();
    this.organizations = [];
    this.isReady = false;
    this.initPromise = this.init();
  }

  async init() {
    // Try to load from saved organizations data (with colors), then CSV, then defaults
    const savedOrganizationsData = localStorage.getItem('uxr_organizations_data');
    const savedCsvData = localStorage.getItem('uxr_csv_data');
    
    if (savedOrganizationsData) {
      try {
        this.organizations = JSON.parse(savedOrganizationsData);
      } catch (error) {
        console.warn('Failed to load saved organizations data, trying CSV fallback:', error);
        if (savedCsvData) {
          this.organizations = await this.spreadsheetLoader.loadFromCSV(savedCsvData);
        } else {
          this.organizations = await this.spreadsheetLoader.getDefaultData();
        }
      }
    } else if (savedCsvData) {
      try {
        this.organizations = await this.spreadsheetLoader.loadFromCSV(savedCsvData);
      } catch (error) {
        console.warn('Failed to load saved CSV data, using defaults:', error);
        this.organizations = await this.spreadsheetLoader.getDefaultData();
      }
    } else {
      this.organizations = await this.spreadsheetLoader.getDefaultData();
    }

    // Ensure all accounts have colors assigned
    this.ensureAccountColors();

    // Load saved state - organization and sub-account
    const savedOrgName = localStorage.getItem('uxr_current_organization');
    const savedSubAccountId = localStorage.getItem('uxr_current_sub_account');
    
    // Set current organization (or default to first)
    const org = savedOrgName ? 
      this.getOrganizationByName(savedOrgName) : 
      this.organizations[0];
    
    // Safety check: ensure we have a valid organization
    if (!org) {
      console.error('No organizations found - falling back to default data');
      return;
    }
    
    this.setCurrentOrganization(org);
    
    // Set current sub-account - preserve saved state, otherwise default to "All accounts"
    const subAccount = savedSubAccountId ? 
      this.getSubAccountById(savedSubAccountId) : 
      org.accounts?.find(acc => acc.isAggregate);
    
    // Safety check: ensure we have a valid sub-account
    if (!subAccount) {
      console.error('No sub-accounts found for organization:', org.name);
      return;
    }
    
    this.setCurrentSubAccount(subAccount);
    this.isReady = true;
  }

  // Wait for initialization to complete
  async waitForReady() {
    if (this.isReady) return true;
    await this.initPromise;
    return this.isReady;
  }

  // Spreadsheet integration methods
  async loadFromSpreadsheet(csvContent) {
    try {
      this.organizations = await this.spreadsheetLoader.loadFromCSV(csvContent);
      
      // Ensure all accounts have colors assigned
      this.ensureAccountColors();
      
      // Save the CSV data
      localStorage.setItem('uxr_csv_data', csvContent);
      
      // Reset to first organization and "All accounts"
      this.setCurrentOrganization(this.organizations[0]);
      const allAccountsView = this.organizations[0].accounts.find(acc => acc.isAggregate);
      if (allAccountsView) {
        this.setCurrentSubAccount(allAccountsView);
      }
      
      // Clear existing account groups
      this.accountGroups = [];
      this.saveAccountGroups();
      
      return true;
    } catch (error) {
      console.error('Failed to load spreadsheet data:', error);
      throw error;
    }
  }

  getSampleCSV() {
    return this.spreadsheetLoader.getSampleCSV();
  }

  exportCurrentDataAsCSV() {
    let csv = 'Organization,Account Name\n';
    
    this.organizations.forEach(org => {
      org.accounts.forEach(account => {
        if (!account.isAggregate) { // Skip "All accounts" in export
          csv += `${org.name},"${account.name}"\n`;
        }
      });
    });
    
    return csv;
  }

  // Organization management
  getAllOrganizations() {
    return this.organizations;
  }

  getOrganizationByName(name) {
    return this.organizations.find(org => org.name === name);
  }

  getCurrentOrganization() {
    return this.currentOrganization;
  }

  setCurrentOrganization(organization) {
    this.currentOrganization = organization;
    localStorage.setItem('uxr_current_organization', organization.name);
    this.loadAccountGroups();
    
    // Reset to "All accounts" when switching orgs
    const allAccountsView = organization.accounts.find(acc => acc.isAggregate);
    if (allAccountsView) {
      this.setCurrentSubAccount(allAccountsView);
    }
  }

  // Sub-account management
  getCurrentSubAccount() {
    return this.currentSubAccount;
  }

  getAllOrganizationNames() {
    return this.organizations.map(org => org.name);
  }

  setCurrentSubAccount(subAccount) {
    this.currentSubAccount = subAccount;
    localStorage.setItem('uxr_current_sub_account', subAccount.id);
  }

  ensureAccountColors() {
    // Ensure all accounts have consistent colors assigned
    this.organizations.forEach(org => {
      org.accounts.forEach(account => {
        // Skip "All accounts" aggregate views
        if (account.isAggregate) return;
        
        // If account doesn't have a color, generate one
        if (!account.color) {
          account.color = this.spreadsheetLoader.generateAccountColor(account.name, account.id);
        }
      });
    });
    
    // Save updated organizations back to localStorage
    this.saveOrganizations();
  }

  saveOrganizations() {
    // Save the full organizations data with colors to localStorage
    const organizationsData = JSON.stringify(this.organizations);
    localStorage.setItem('uxr_organizations_data', organizationsData);
  }

  getSubAccountById(id) {
    return this.currentOrganization ? 
      this.currentOrganization.accounts.find(acc => acc.id === id) : null;
  }

  getAllSubAccounts() {
    return this.currentOrganization ? this.currentOrganization.accounts : [];
  }

  // Account switcher helper functions
  getAccountSwitcherData() {
    if (!this.currentOrganization || !this.currentSubAccount) {
      return { currentAccount: null, accounts: [] };
    }

    const accounts = this.currentOrganization.accounts.slice(); // Copy array
    
    // Move current account to top of list
    const currentIndex = accounts.findIndex(acc => acc.id === this.currentSubAccount.id);
    if (currentIndex > 0) {
      const currentAccount = accounts.splice(currentIndex, 1)[0];
      accounts.unshift(currentAccount);
    }

    return {
      currentAccount: {
        id: this.currentSubAccount.id,
        name: this.currentSubAccount.name, // First line
        type: this.currentSubAccount.isAggregate ? "Organization" : this.currentOrganization.name, // Second line
        isAggregate: this.currentSubAccount.isAggregate, // Preserve aggregate flag
        color: this.currentSubAccount.color // Preserve color for consistency
      },
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name, // First line
        type: acc.isAggregate ? "Organization" : this.currentOrganization.name, // Second line
        isAggregate: acc.isAggregate, // Preserve aggregate flag
        color: acc.color // Preserve color for consistency
      }))
    };
  }

  switchToSubAccount(subAccountId) {
    const subAccount = this.getSubAccountById(subAccountId);
    if (subAccount) {
      this.setCurrentSubAccount(subAccount);
      return true;
    }
    return false;
  }

  // Enhanced account group management
  loadAccountGroups() {
    const storageKey = `uxr_account_groups_${this.currentOrganization.name}`;
    const saved = localStorage.getItem(storageKey);
    this.accountGroups = saved ? JSON.parse(saved) : [];
  }

  saveAccountGroups() {
    const storageKey = `uxr_account_groups_${this.currentOrganization.name}`;
    localStorage.setItem(storageKey, JSON.stringify(this.accountGroups));
  }

  createAccountGroup(groupData) {
    const group = {
      id: `group_${Date.now()}`,
      name: groupData.name,
      type: groupData.type,
      accountIds: groupData.accountIds || [],
      createdAt: new Date().toISOString(),
      description: groupData.description || ''
    };
    
    this.accountGroups.push(group);
    this.saveAccountGroups();
    return group;
  }

  getAccountGroupById(groupId) {
    return this.accountGroups.find(g => g.id === groupId) || null;
  }

  updateAccountGroup(groupId, updates) {
    const index = this.accountGroups.findIndex(g => g.id === groupId);
    if (index !== -1) {
      this.accountGroups[index] = { 
        ...this.accountGroups[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveAccountGroups();
      return this.accountGroups[index];
    }
    return null;
  }

  deleteAccountGroup(groupId) {
    this.accountGroups = this.accountGroups.filter(g => g.id !== groupId);
    this.saveAccountGroups();
  }

  getAccountGroups() {
    return this.accountGroups;
  }

  getAccountGroupsByType(type) {
    return this.accountGroups.filter(g => g.type === type);
  }

  // Account eligibility for group types (exclude "All accounts" from grouping)
  getEligibleAccounts(groupType, excludeGroupId = null) {
    const allAccounts = this.getAllSubAccounts().filter(acc => !acc.isAggregate);
    
    if (groupType === GROUP_TYPES.RESOURCE_SHARING.id) {
      // For exclusive groups, exclude accounts already in other exclusive groups
      const exclusiveGroups = this.getAccountGroupsByType(GROUP_TYPES.RESOURCE_SHARING.id)
        .filter(g => g.id !== excludeGroupId);
      const usedAccountIds = new Set();
      
      exclusiveGroups.forEach(group => {
        group.accountIds.forEach(id => usedAccountIds.add(id));
      });
      
      return allAccounts.filter(account => !usedAccountIds.has(account.id));
    }
    
    // For non-exclusive groups, all accounts are eligible
    return allAccounts;
  }

  // Validation
  canAddAccountToGroup(accountId, groupId) {
    const group = this.accountGroups.find(g => g.id === groupId);
    if (!group) return false;

    const eligibleAccounts = this.getEligibleAccounts(group.type, groupId);
    return eligibleAccounts.some(account => account.id === accountId);
  }

  // Utility methods
  getGroupTypesConfig() {
    return GROUP_TYPES;
  }

  getAccountsInGroup(groupId) {
    const group = this.accountGroups.find(g => g.id === groupId);
    if (!group) return [];
    
    return this.getAllSubAccounts().filter(account => 
      group.accountIds.includes(account.id)
    );
  }

  getGroupsForAccount(accountId) {
    return this.accountGroups.filter(group => 
      group.accountIds.includes(accountId)
    );
  }

  // Add new organization
  addOrganization(orgData) {
    // Check if organization with same name already exists
    const existingOrg = this.organizations.find(org => org.name === orgData.name);
    if (existingOrg) {
      throw new Error(`Organization "${orgData.name}" already exists`);
    }
    
    // Add the new organization
    this.organizations.push(orgData);
    
    // Save to localStorage
    localStorage.setItem('uxr_organizations_data', JSON.stringify(this.organizations));
    
    return orgData;
  }

  // UXR reset functionality
  resetAllData() {
    localStorage.removeItem('uxr_current_organization');
    localStorage.removeItem('uxr_current_sub_account');
    localStorage.removeItem('uxr_csv_data'); // Clear saved CSV data
    localStorage.removeItem('uxr_organizations_data'); // Clear saved organizations data with colors
    // Clear user-created custom account groups stored by creation modal
    localStorage.removeItem('accountGroups');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('uxr_account_groups_') || key.startsWith('customGroupOrder_')) {
        localStorage.removeItem(key);
      }
    });
    this.accountGroups = [];
    
    // Reload default data
    this.init();
  }

  // Custom Group Ordering
  getCustomGroupOrder() {
    // Get custom order from organization-specific localStorage
    console.log('🔧 getCustomGroupOrder called');
    console.log('🔧 currentOrganization:', this.currentOrganization);
    
    let orgId = this.currentOrganization?.id;
    if (!orgId) {
      console.log('🔧 No current org, using fallback...');
      orgId = this.organizations?.[0]?.id || 'default';
      console.log('🔧 Using fallback org ID:', orgId);
    }
    
    const storageKey = `customGroupOrder_${orgId}`;
    const stored = localStorage.getItem(storageKey);
    
    try {
      const result = stored ? JSON.parse(stored) : [];
      console.log(`🔧 Retrieved custom order for ${orgId}:`, result);
      return result;
    } catch (error) {
      console.error('Error parsing custom group order:', error);
      return [];
    }
  }
  
  setCustomGroupOrder(groupIds) {
    // Save custom order to organization-specific localStorage
    console.log('🔧 setCustomGroupOrder called with:', groupIds);
    console.log('🔧 currentOrganization:', this.currentOrganization);
    console.log('🔧 currentOrganization.id:', this.currentOrganization?.id);
    
    const orgId = this.currentOrganization?.id;
    if (!orgId) {
      console.error('No current organization for saving custom group order');
      console.log('🔧 Available organizations:', this.organizations);
      console.log('🔧 Using fallback org ID approach...');
      
      // Fallback: use the first organization ID or a default
      const fallbackOrgId = this.organizations?.[0]?.id || 'default';
      console.log('🔧 Using fallback org ID:', fallbackOrgId);
      
      const storageKey = `customGroupOrder_${fallbackOrgId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(groupIds));
        console.log(`💾 Saved custom group order for fallback org ${fallbackOrgId}:`, groupIds);
        return true;
      } catch (error) {
        console.error('Error saving custom group order with fallback:', error);
        return false;
      }
    }
    
    const storageKey = `customGroupOrder_${orgId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(groupIds));
      console.log(`💾 Saved custom group order for org ${orgId}:`, groupIds);
      return true;
    } catch (error) {
      console.error('Error saving custom group order:', error);
      return false;
    }
  }
  
  clearCustomGroupOrder() {
    // Clear custom order for current organization
    const orgId = this.currentOrganization?.id;
    if (!orgId) return false;
    
    const storageKey = `customGroupOrder_${orgId}`;
    localStorage.removeItem(storageKey);
    console.log(`🗑️ Cleared custom group order for org ${orgId}`);
    return true;
  }

  // UXR Analytics
  getGroupingInsights() {
    return {
      totalGroups: this.accountGroups.length,
      groupsByType: Object.values(GROUP_TYPES).reduce((acc, type) => {
        acc[type.id] = this.getAccountGroupsByType(type.id).length;
        return acc;
      }, {}),
      averageAccountsPerGroup: this.accountGroups.length > 0 ? 
        this.accountGroups.reduce((sum, g) => sum + g.accountIds.length, 0) / this.accountGroups.length : 0,
      ungroupedAccounts: this.getAllSubAccounts().filter(account => 
        !account.isAggregate && !this.accountGroups.some(group => group.accountIds.includes(account.id))
      ).length
    };
  }
}

// Global instance
window.OrgDataManager = new OrganizationDataManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrganizationDataManager, GROUP_TYPES, SpreadsheetDataLoader };
} 