// Netlify Debug Script - Add to any page having filtering issues
console.log('🔍 Netlify Debug Check:', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  location: window.location.href,
  
  // Check critical dependencies
  OrgDataManager: {
    exists: !!window.OrgDataManager,
    type: typeof window.OrgDataManager,
    methods: window.OrgDataManager ? Object.keys(window.OrgDataManager) : null
  },
  
  // Check filter component
  AccountGroupsFilter: {
    exists: !!window.AccountGroupsFilter,
    instances: document.querySelectorAll('[id*="filter"]').length
  },
  
  // Check DOM elements
  filterElements: {
    trigger: !!document.getElementById('filterTrigger'),
    popover: !!document.getElementById('filterPopover'),
    searchInput: !!document.getElementById('searchInput')
  },
  
  // Check script loading
  scripts: Array.from(document.scripts).map(s => ({
    src: s.src,
    loaded: s.readyState === 'complete'
  }))
});

// Check if error occurs during filter initialization
window.addEventListener('error', (e) => {
  console.error('🚨 Netlify Error:', e.error?.message, e.filename, e.lineno);
});
