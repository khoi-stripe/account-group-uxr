/**
 * Participant Navigation Persistence
 * Ensures participant mode and data persist across page navigation
 */

(function() {
  'use strict';
  
  /**
   * Check if we're in participant mode
   */
  function isParticipantMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlHasParticipantMode = urlParams.has('mode') && urlParams.get('mode') === 'participant';
    const storedParticipantMode = sessionStorage.getItem('participant_mode') === 'true';
    
    return urlHasParticipantMode || storedParticipantMode;
  }
  
  /**
   * Get current participant URL parameters
   */
  function getParticipantParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    
    // Check URL parameters first
    if (urlParams.has('mode') && urlParams.get('mode') === 'participant') {
      params.set('mode', 'participant');
      
      if (urlParams.has('data')) {
        params.set('data', urlParams.get('data'));
      }
      
      if (urlParams.has('scenario')) {
        params.set('scenario', urlParams.get('scenario'));
      }
      
      return params.toString();
    }
    
    // Check sessionStorage for participant context
    const storedMode = sessionStorage.getItem('participant_mode');
    if (storedMode === 'true') {
      params.set('mode', 'participant');
      
      const storedDataId = sessionStorage.getItem('participant_data_id');
      const storedScenario = sessionStorage.getItem('participant_scenario');
      
      if (storedDataId) {
        params.set('data', storedDataId);
      } else if (storedScenario) {
        params.set('scenario', storedScenario);
      }
      
      return params.toString();
    }
    
    return '';
  }
  
  /**
   * Update a URL to preserve participant parameters
   */
  function updateURLWithParticipantParams(url) {
    if (!isParticipantMode()) {
      return url;
    }
    
    const participantParams = getParticipantParams();
    if (!participantParams) {
      return url;
    }
    
    // Handle different URL formats
    try {
      const urlObj = new URL(url, window.location.origin);
      const existingParams = new URLSearchParams(urlObj.search);
      const newParams = new URLSearchParams(participantParams);
      
      // Add participant params to existing params
      for (const [key, value] of newParams) {
        existingParams.set(key, value);
      }
      
      urlObj.search = existingParams.toString();
      
      // Return relative URL if it was relative
      if (url.startsWith('./') || url.startsWith('../') || (!url.includes('://'))) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
      }
      
      return urlObj.toString();
    } catch (error) {
      // Fallback for simple relative URLs
      if (url.includes('?')) {
        return `${url}&${participantParams}`;
      } else {
        return `${url}?${participantParams}`;
      }
    }
  }
  
  /**
   * Initialize participant navigation persistence
   */
  function initParticipantNavigation() {
    if (!isParticipantMode()) {
      return;
    }
    
    console.log('🎯 Initializing participant navigation persistence');
    
    // Intercept all link clicks
    document.addEventListener('click', function(event) {
      const link = event.target.closest('a');
      
      if (!link || !link.href) {
        return;
      }
      
      // Skip if it's an external link or has special behavior
      if (link.target === '_blank' || 
          link.href.includes('javascript:') || 
          link.href.includes('mailto:') || 
          link.href.includes('tel:') ||
          link.href.includes('http') && !link.href.includes(window.location.origin)) {
        return;
      }
      
      // Skip if already has participant params
      if (link.href.includes('mode=participant')) {
        return;
      }
      
      // Update the href to include participant params
      const updatedHref = updateURLWithParticipantParams(link.href);
      if (updatedHref !== link.href) {
        link.href = updatedHref;
        console.log(`🔗 Updated navigation link: ${link.href}`);
      }
    });
    
    // Update existing links on page load
    setTimeout(() => {
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        if (link.href && 
            !link.href.includes('mode=participant') &&
            !link.href.includes('javascript:') &&
            !link.href.includes('mailto:') &&
            !link.href.includes('tel:') &&
            (!link.href.includes('http') || link.href.includes(window.location.origin))) {
          
          const updatedHref = updateURLWithParticipantParams(link.href);
          if (updatedHref !== link.href) {
            link.href = updatedHref;
          }
        }
      });
      
      console.log(`🔗 Updated ${links.length} navigation links for participant mode`);
    }, 100);
  }
  
  /**
   * Add participant mode indicator to the page
   */
  function addParticipantModeIndicator() {
    // Intentionally disabled; using bottom View Mode indicator from prototype control panel
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initParticipantNavigation();
      addParticipantModeIndicator();
    });
  } else {
    initParticipantNavigation();
    addParticipantModeIndicator();
  }
  
})();
