# PitchPerfect Player API

This document describes the API endpoints specifically designed for the PitchPerfect Player application.

## Base URL

```
http://localhost:5001/api
```

## Endpoints

### 1. List All Presentations for Player

**GET** `/presentations/player/list`

Returns a list of all available presentations with metadata optimized for the PitchPerfect Player.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "presentations": [
    {
      "id": "092a5086-6d9a-4780-a7c8-bb2cd2d7bef0",
      "title": "Business Pitch Presentation",
      "description": "A professional business presentation",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "slideCount": 5,
      "hasMedia": true,
      "duration": 300,
      "template": "business-pitch",
      "downloadUrl": "http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/download",
      "metadataUrl": "http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/metadata"
    }
  ]
}
```

### 2. Get Presentation Metadata

**GET** `/presentations/{id}/metadata`

Returns metadata for a specific presentation.

**Parameters:**
- `id` (string) - Presentation ID

**Response:**
```json
{
  "id": "092a5086-6d9a-4780-a7c8-bb2cd2d7bef0",
  "title": "Business Pitch Presentation",
  "description": "A professional business presentation",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "slideCount": 5,
  "hasMedia": true,
  "duration": 300,
  "template": "business-pitch",
  "downloadUrl": "http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/download"
}
```

### 3. Download Presentation

**GET** `/presentations/{id}/download`

Downloads a complete presentation package as a ZIP file. The ZIP contains:
- `presentation.json` - Presentation data
- `index.html` - HTML viewer
- `styles.css` - CSS styles
- `presentation.js` - JavaScript functionality
- `README.md` - Documentation
- `media/` - All media files (images, videos, etc.)

**Parameters:**
- `id` (string) - Presentation ID

**Response:**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="pitchperfect-{id}.zip"`
- Binary ZIP file

**Headers:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="pitchperfect-092a5086-6d9a-4780-a7c8-bb2cd2d7bef0.zip"
Content-Length: 1234567
Cache-Control: no-cache
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

## Usage Examples

### JavaScript/TypeScript

```javascript
// List all presentations
const response = await fetch('http://localhost:5001/api/presentations/player/list');
const data = await response.json();
console.log(data.presentations);

// Get metadata for a specific presentation
const metadataResponse = await fetch('http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/metadata');
const metadata = await metadataResponse.json();
console.log(metadata);

// Download a presentation
const downloadResponse = await fetch('http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/download');
const blob = await downloadResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `pitchperfect-092a5086-6d9a-4780-a7c8-bb2cd2d7bef0.zip`;
a.click();
```

### cURL

```bash
# List all presentations
curl -X GET "http://localhost:5001/api/presentations/player/list"

# Get metadata
curl -X GET "http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/metadata"

# Download presentation
curl -X GET "http://localhost:5001/api/presentations/092a5086-6d9a-4780-a7c8-bb2cd2d7bef0/download" \
  -o "presentation.zip"
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Presentation not found
- `500` - Internal server error

## CORS Support

All endpoints support CORS and are configured to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8080`
- `http://127.0.0.1:8080`
- `capacitor://localhost`
- `ionic://localhost`

## Notes

- The download endpoint has a 10-minute timeout for large presentations
- Media files are automatically included in the ZIP download
- External URLs are downloaded and included in the package
- The ZIP file is optimized for offline playback
- All endpoints are designed to work with the PitchPerfect Player application 