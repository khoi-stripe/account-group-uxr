/**
 * URL-based data sharing approach
 * Uses URL fragment (#) and compression for better UX
 */

// Example implementation
class URLDataSharing {
  
  // Generate shareable URL with data embedded
  generateShareURL(participantData) {
    try {
      // Compress the JSON data
      const compressed = this.compressData(participantData);
      
      // Check if it fits in URL (leave room for domain/path)
      if (compressed.length > 1500) {
        throw new Error('Data too large for URL sharing');
      }
      
      // Use URL fragment (#) - this data never goes to server
      const shareUrl = `${window.location.origin}${window.location.pathname}#data=${compressed}&mode=participant`;
      
      return {
        success: true,
        shareUrl,
        method: 'url',
        dataSize: compressed.length
      };
    } catch (error) {
      // Fallback to file download
      return this.generateFileDownload(participantData);
    }
  }
  
  // Load data from URL fragment
  loadFromURL() {
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    
    if (params.has('data')) {
      try {
        const compressed = params.get('data');
        const data = this.decompressData(compressed);
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse URL data:', error);
        return null;
      }
    }
    return null;
  }
  
  // Simple compression using base64 + JSON optimization
  compressData(data) {
    // Remove unnecessary whitespace and encode
    const minified = JSON.stringify(data);
    return btoa(minified).replace(/[+/=]/g, (char) => {
      // URL-safe base64
      return { '+': '-', '/': '_', '=': '' }[char];
    });
  }
  
  decompressData(compressed) {
    // Restore standard base64
    const base64 = compressed.replace(/[-_]/g, (char) => {
      return { '-': '+', '_': '/' }[char];
    });
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    return atob(padded);
  }
}

// Benefits:
// ✅ No file uploads needed
// ✅ Instant sharing
// ✅ Data never hits server (URL fragment)
// ✅ Still works offline
// ✅ Fallback to file download for large datasets

// Drawbacks:
// ❌ URLs still somewhat long
// ❌ Data visible in browser history
// ❌ Limited data size
