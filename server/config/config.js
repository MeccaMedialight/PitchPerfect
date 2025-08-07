// Server configuration file
const config = {
  // Server configuration
  PORT: process.env.PORT || 5001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // CORS configuration
  CORS_ORIGINS: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://localhost:8080',  // Webpack dev server
    'http://127.0.0.1:8080', // Alternative localhost
    'capacitor://localhost',  // Capacitor
    'ionic://localhost',      // Ionic
  ],
  
  // File upload configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024, // 50MB default
  
  // Database configuration (if needed in the future)
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Helper functions
  getClientUrl: (path = '') => `${config.CLIENT_URL}${path}`,
  getServerUrl: (path = '') => `http://localhost:${config.PORT}${path}`,
};

module.exports = config; 