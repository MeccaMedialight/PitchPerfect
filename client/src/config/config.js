// Configuration file for API endpoints and URLs
const config = {
  // Server configuration
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:5001',
  CLIENT_URL: process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
  
  // API endpoints
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api',
  
  // Specific endpoints
  TEMPLATES_ENDPOINT: '/templates',
  PRESENTATIONS_ENDPOINT: '/presentations',
  UPLOAD_ENDPOINT: '/upload',
  
  // Helper functions
  getApiUrl: (endpoint) => `${config.API_BASE_URL}${endpoint}`,
  getServerUrl: (path = '') => `${config.SERVER_URL}${path}`,
  getClientUrl: (path = '') => `${config.CLIENT_URL}${path}`,
};

export default config; 