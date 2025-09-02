/**
 * Simple Key-Value Store API for Prototype Data Sharing
 * Can be deployed as Netlify Function, Vercel Function, or standalone
 */

// In-memory store for demo (use Redis/DB in production)
const dataStore = new Map();

// Generate short, URL-safe IDs
function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Netlify Function format
if (typeof exports !== 'undefined') {
  exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://account-group-uxr.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Store data and return share ID
      const rawData = JSON.parse(event.body);
      
      // Basic input validation and sanitization
      if (!rawData || typeof rawData !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid data format' })
        };
      }
      
      // Limit data size (1MB max)
      if (JSON.stringify(rawData).length > 1024 * 1024) {
        return {
          statusCode: 413,
          headers,
          body: JSON.stringify({ error: 'Data too large' })
        };
      }
      
      const data = rawData; // You could add more sanitization here if needed
      const shareId = generateShareId();
      
      // Add metadata
      const record = {
        data,
        createdAt: new Date().toISOString(),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      dataStore.set(shareId, record);
      
      // Get the current page path from the shared data, or default to prototype page
      const currentPath = data.metadata?.url ? 
        new URL(data.metadata.url).pathname : 
        '/prototypes/stripe-dashboard-uxr/';
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          shareId,
          shareUrl: `${event.headers.origin}${currentPath}?share=${shareId}`
        })
      };
      
    } else if (event.httpMethod === 'GET') {
      // Retrieve data by share ID
      const shareId = event.queryStringParameters?.id;
      
      if (!shareId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing share ID' })
        };
      }
      
      const record = dataStore.get(shareId);
      
      if (!record) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Share not found or expired' })
        };
      }
      
      // Check expiration
      if (new Date() > new Date(record.expires)) {
        dataStore.delete(shareId);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Share expired' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: record.data,
          createdAt: record.createdAt
        })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Share API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
}

// For local development/testing
if (typeof window !== 'undefined') {
  // Browser environment - mock API
  window.shareAPI = {
    store: new Map(),
    
    async post(data) {
      const shareId = generateShareId();
      this.store.set(shareId, {
        data,
        createdAt: new Date().toISOString(),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      return {
        success: true,
        shareId,
        shareUrl: `${window.location.origin}${window.location.pathname}?share=${shareId}`
      };
    },
    
    async get(shareId) {
      const record = this.store.get(shareId);
      if (!record) {
        throw new Error('Share not found');
      }
      
      if (new Date() > new Date(record.expires)) {
        this.store.delete(shareId);
        throw new Error('Share expired');
      }
      
      return {
        success: true,
        data: record.data,
        createdAt: record.createdAt
      };
    }
  };
}