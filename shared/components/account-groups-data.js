/**
 * Account Groups Data Provider
 * Provides custom account groups created by users for use in filters
 *
 * Consolidated: All reads now come from OrgDataManager only,
 * which already persists to organization-scoped localStorage.
 */

// Generate account groups for the filter component
function generateCustomAccountGroups() {
  try {
    // generateCustomAccountGroups invoked
    
    // Get all accounts from the current organization
    const allOrgAccounts = window.OrgDataManager?.getCurrentOrganization()?.accounts || [];
    // org accounts loaded
    
    // Filter out aggregate views and convert to filter format
    const accountData = allOrgAccounts
      .filter(acc => !acc.isAggregate)
      .map((acc, index) => ({
        name: acc.name,
        initials: generateInitials(acc.name),
        color: convertHexToColorClass(acc.color) || (index % 2 === 0 ? 'blue' : 'green'),
        backgroundColor: acc.color, // Store the original hex color for inline styles
        checked: true,
        id: acc.id,
        type: acc.type || 'Account'
      }));
    
    // account data converted

    // Start with just an empty groups object - no default groups
    const groups = {};

    // Add custom account groups created by users (single source of truth)
    let customGroups = window.OrgDataManager?.getAccountGroups() || [];
    // custom groups fetched

    // Apply custom order if available
    const customOrder = window.OrgDataManager?.getCustomGroupOrder() || [];
    if (customOrder && customOrder.length > 0) {
      // Sort groups according to custom order
      customGroups.sort((a, b) => {
        const indexA = customOrder.indexOf(a.id);
        const indexB = customOrder.indexOf(b.id);
        
        // If both items are in custom order, sort by their position
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one item is in custom order, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // If neither is in custom order, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    } else {
      // No custom order, sort alphabetically
      customGroups.sort((a, b) => a.name.localeCompare(b.name));
    }

    customGroups.forEach(group => {
      // Get account IDs for this group
      let accountIds = [];
      if (group.accountIds) {
        // Saved groups have accountIds array
        accountIds = group.accountIds;
      } else if (group.accounts) {
        // Managed groups might have accounts array
        accountIds = group.accounts.map(acc => acc.id);
      }

      // Filter accountData to only include accounts in this group
      const groupAccounts = accountData.filter(acc => accountIds.includes(acc.id));
      
      if (groupAccounts.length > 0) {
        // Create a safe key for the group (remove special characters)
        const groupKey = group.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        groups[groupKey] = {
          accounts: groupAccounts,
          originalName: group.name // Preserve the original case
        };
      }
    });

    // custom account groups generated
    return groups;
    
  } catch (error) {
    console.error('Error generating custom account groups:', error);
    // Return empty object when no groups available
    return {};
  }
}

// Helper function to generate initials
function generateInitials(name) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

// Helper function to convert hex colors to color classes
function convertHexToColorClass(hexColor) {
  if (!hexColor) return 'blue';
  
  // Simple mapping of hex colors to named colors
  const colorMap = {
    '#3b82f6': 'blue',
    '#10b981': 'green', 
    '#f59e0b': 'orange',
    '#ef4444': 'red',
    '#8b5cf6': 'purple',
    '#06b6d4': 'cyan'
  };
  
  return colorMap[hexColor] || 'blue';
}

// Make generateCustomAccountGroups globally accessible
window.generateCustomAccountGroups = generateCustomAccountGroups;

// Account Groups Data Provider loaded