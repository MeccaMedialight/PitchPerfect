# Configuration Guide

This project now uses centralized configuration files to manage server and client URLs, making it easier to update and maintain.

## Configuration Files

### Client Configuration (`client/src/config/config.js`)

The client configuration file contains all API endpoints and URLs used by the React application:

```javascript
const config = {
  // Server configuration
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
  
  // API endpoints
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // Specific endpoints
  TEMPLATES_ENDPOINT: '/templates',
  PRESENTATIONS_ENDPOINT: '/presentations',
  UPLOAD_ENDPOINT: '/upload',
  
  // Helper functions
  getApiUrl: (endpoint) => `${config.API_BASE_URL}${endpoint}`,
  getServerUrl: (path = '') => `${config.SERVER_URL}${path}`,
  getClientUrl: (path = '') => `${config.CLIENT_URL}${path}`,
};
```

### Server Configuration (`server/config/config.js`)

The server configuration file contains server-specific settings:

```javascript
const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // CORS configuration
  CORS_ORIGINS: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ],
  
  // File upload configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024, // 50MB default
  
  // Helper functions
  getClientUrl: (path = '') => `${config.CLIENT_URL}${path}`,
  getServerUrl: (path = '') => `http://localhost:${config.PORT}${path}`,
};
```

## Environment Variables

You can override the default configuration using environment variables:

### Client Environment Variables
- `REACT_APP_SERVER_URL`: Override the server URL (default: `http://localhost:5000`)
- `REACT_APP_CLIENT_URL`: Override the client URL (default: `http://localhost:3000`)
- `REACT_APP_API_BASE_URL`: Override the API base URL (default: `http://localhost:5000/api`)

### Server Environment Variables
- `PORT`: Override the server port (default: `5000`)
- `CLIENT_URL`: Override the client URL for CORS (default: `http://localhost:3000`)
- `UPLOAD_DIR`: Override the upload directory (default: `uploads`)
- `MAX_FILE_SIZE`: Override the maximum file size in bytes (default: `52428800` - 50MB)

## Usage Examples

### In Client Components

```javascript
import config from '../config/config';

// Using helper functions
const templatesUrl = config.getApiUrl(config.TEMPLATES_ENDPOINT);
const uploadUrl = config.getApiUrl(config.UPLOAD_ENDPOINT);

// Direct access
const serverUrl = config.SERVER_URL;
const apiBaseUrl = config.API_BASE_URL;
```

### In Server Code

```javascript
const config = require('./config/config');

// Using configuration values
const port = config.PORT;
const corsOrigins = config.CORS_ORIGINS;
const uploadDir = config.UPLOAD_DIR;
```

## Benefits

1. **Centralized Management**: All URLs and endpoints are defined in one place
2. **Environment Flexibility**: Easy to switch between development, staging, and production environments
3. **Maintainability**: No need to search and replace hardcoded URLs throughout the codebase
4. **Consistency**: Ensures all components use the same configuration values
5. **Type Safety**: Helper functions provide a consistent interface for URL construction

## Migration Notes

All hardcoded URLs have been replaced with configuration-based URLs:

- `http://localhost:5000/api/*` → `config.getApiUrl(endpoint)`
- `http://localhost:5000` → `config.getServerUrl(path)`
- `http://localhost:3000` → `config.getClientUrl(path)`

The following files were updated:
- `client/src/pages/TemplateSelector.js`
- `client/src/pages/SavedPresentations.js`
- `client/src/pages/PresentationViewer.js`
- `client/src/pages/PresentationBuilder.js`
- `client/src/components/SlideEditor.js`
- `client/src/components/MediaUpload.js`
- `server/index.js` 