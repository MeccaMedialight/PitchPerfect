# PitchPerfect App

A modern web application for creating professional presentations with rich media support, designed to work perfectly on iPad and run offline.

## Features

- 🎨 **Beautiful Templates**: Choose from professionally designed templates for any presentation type
- 📝 **Rich Text Editor**: Advanced text editing with formatting options
- 🖼️ **Rich Media Support**: Add images, videos, and interactive content to your slides
- 🎯 **Slide Editor**: Intuitive drag-and-drop slide editing with real-time preview
- 📱 **iPad Ready**: Create presentations that work perfectly on iPad, even offline
- 💾 **Standalone Export**: Download complete presentations that run without internet
- 🎨 **Custom Layouts**: Design custom slide layouts with the layout designer
- 🔄 **Real-time Preview**: See your changes instantly with live preview
- 📊 **Multiple Slide Types**: Title slides, content slides, image slides, video slides, and more
- 🎪 **Presentation Viewer**: Full-featured presentation viewer with touch controls
- 💾 **Save & Load**: Save presentations and load them later for editing

## Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PitchPerfect
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm start
   ```

This will start both the client (React app) and server (Node.js API) concurrently.

## Development

### Client (React App)
```bash
# Navigate to client directory
cd client

# Start development server
npm start

# Build for production
npm run build
```

### Server (Node.js API)
```bash
# Navigate to server directory
cd server

# Start development server
npm start
```

### Restart Scripts

The application includes intelligent restart scripts that read your `.env` configuration and properly stop/start the client and server processes.

#### Prerequisites

1. **Create a `.env` file** in the root directory with the following variables:
   ```bash
   # Server Configuration (from server/config/config.js)
   PORT=5001
   CLIENT_URL=http://localhost:3000
   
   # Client Configuration (from client/src/config/config.js)
   REACT_APP_SERVER_URL=http://localhost:5001
   REACT_APP_CLIENT_URL=http://localhost:3000
   REACT_APP_API_BASE_URL=http://localhost:5001/api
   ```

#### Using Restart Scripts

**Windows (PowerShell):**
```powershell
# Restart with dependency installation
.\restart.ps1

# Restart without dependency installation (faster)
.\restart.ps1 -SkipInstall
```

**Windows (Command Prompt):**
```cmd
# Restart with dependency installation
restart.bat

# Restart without dependency installation (faster)
# Edit restart.bat and set SkipInstall=true
```

**What the restart scripts do:**

1. **Read `.env` configuration** - Extracts ports and URLs from your `.env` file
2. **Stop running processes** - Stops processes on the configured ports (server: 5001, client: 3000)
3. **Wait for termination** - Ensures all processes are fully stopped
4. **Validate configuration** - Checks that required environment variables are present
5. **Install dependencies** - Runs `npm run install-all` (unless skipped)
6. **Start application** - Starts both client and server using `npm start`

#### Default Configuration Values

The scripts use these default values from the server and client config files:

**Server Config (`server/config/config.js`):**
- `PORT`: 5001
- `CLIENT_URL`: http://localhost:3000

**Client Config (`client/src/config/config.js`):**
- `REACT_APP_SERVER_URL`: http://localhost:5001
- `REACT_APP_CLIENT_URL`: http://localhost:3000
- `REACT_APP_API_BASE_URL`: http://localhost:5001/api

#### Manual Restart

If you prefer to restart manually:

```bash
# Stop all Node.js processes
taskkill /f /im node.exe

# Wait a moment
timeout /t 3

# Start the application
npm start
```

#### Troubleshooting Restart Issues

- **Port conflicts**: The scripts automatically detect and stop processes on configured ports
- **Missing .env**: Scripts will show you what variables are needed
- **Permission issues**: Run PowerShell as Administrator if needed
- **Process not stopping**: Use `taskkill /f /im node.exe` manually

## Project Structure

```
PitchPerfect/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Header.js           # Main navigation header
│   │   │   ├── SlideEditor.js      # Slide editing component
│   │   │   ├── MediaUpload.js      # Media upload component
│   │   │   ├── RichTextEditor.js   # Rich text editing
│   │   │   └── IPadPreview.js      # iPad preview component
│   │   ├── pages/                  # Main application pages
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── TemplateSelector.js # Template selection
│   │   │   ├── PresentationBuilder.js # Main presentation builder
│   │   │   ├── PresentationViewer.js # Presentation viewer
│   │   │   ├── SavedPresentations.js # Saved presentations list
│   │   │   └── SlideLayoutDesigner.js # Custom layout designer
│   │   ├── config/
│   │   │   └── config.js          # Configuration settings
│   │   └── App.js                 # Main React application
│   ├── public/                     # Static assets
│   └── package.json               # Client dependencies
├── server/                         # Node.js backend API
│   ├── index.js                   # Main server file
│   ├── config/
│   │   └── config.js              # Server configuration
│   ├── presentations/             # Stored presentations
│   ├── uploads/                   # Uploaded media files
│   └── package.json              # Server dependencies
├── capacitor.config.json          # Capacitor configuration
├── package.json                  # Root dependencies
└── README.md                     # This file
```

## Usage

### Creating Presentations

1. **Start the app** by running `npm start`
2. **Choose a template** from the template selector
3. **Build your presentation** using the drag-and-drop slide editor
4. **Add media** by uploading images and videos
5. **Preview** your presentation using the iPad preview feature
6. **Save** your presentation for later editing
7. **Export** as a standalone presentation for offline use

### Slide Types

- **Title Slide**: Perfect for opening your presentation
- **Content Slide**: Standard content with text and media
- **Image Slide**: Focus on visual content
- **Video Slide**: Video-focused presentations
- **Multi-Media Slide**: Multiple media items on one slide
- **Contact Slide**: Contact information and call-to-action
- **Custom Layout**: Use custom-designed layouts

### Custom Layouts

1. **Design layouts** using the Slide Layout Designer
2. **Create slots** for content placement
3. **Save layouts** for reuse across presentations
4. **Apply layouts** to slides in the presentation builder

## API Integration

The app includes a Node.js backend API with the following endpoints:

- `GET /api/templates` - Get available presentation templates
- `GET /api/presentations` - List all saved presentations
- `GET /api/presentations/:id` - Get specific presentation
- `POST /api/presentations` - Save a new presentation
- `PUT /api/presentations/:id` - Update an existing presentation
- `DELETE /api/presentations/:id` - Delete a presentation
- `POST /api/upload` - Upload media files
- `GET /api/presentations/:id/generate` - Generate standalone presentation

## Configuration

### Client Configuration

Edit `client/src/config/config.js` to customize the app:

```javascript
const config = {
  apiUrl: 'http://localhost:5001/api',
  uploadUrl: 'http://localhost:5001/api/upload',
  // ... other settings
};
```

### Server Configuration

Edit `server/config/config.js` to customize the server:

```javascript
const config = {
  port: 5001,
  uploadDir: './uploads',
  presentationsDir: './presentations',
  // ... other settings
};
```

## Building for Production

### Web Application

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy the built files** from `client/build/` to your web server

### Standalone Presentations

1. **Create a presentation** in the app
2. **Click "Export"** to generate a standalone version
3. **Download the ZIP file** containing the presentation
4. **Extract and open** `index.html` in any web browser

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (client) and 5001 (server) are available
2. **Media upload issues**: Check server upload directory permissions
3. **Build errors**: Ensure all dependencies are installed
4. **Preview issues**: Check browser console for JavaScript errors

### Debug Mode

Enable debug logging by setting environment variables:
```bash
export DEBUG=true
export NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [React documentation](https://reactjs.org/docs)
- Review the [Node.js documentation](https://nodejs.org/docs)
- Open an issue on GitHub

---

## PitchPerfect Player App

The **PitchPerfect Player** is a separate Capacitor.js mobile application designed specifically for playing PitchPerfect presentations on iPad iOS and other mobile devices.

### Player Features

- 📱 **Native Mobile App**: Built with Capacitor.js for iOS and Android
- 🎯 **Presentation Player**: Full-featured presentation viewer with touch controls
- 📥 **Download Support**: Download presentations from PitchPerfect server
- 🔄 **Offline Playback**: Play presentations without internet connection
- 🎨 **Rich Media Support**: Images, videos, and interactive content
- 👆 **Touch Controls**: Swipe gestures for navigation
- 🎮 **Keyboard Controls**: Arrow keys, spacebar, and escape
- 🖥️ **Fullscreen Mode**: Immersive presentation experience
- ⚡ **Autoplay**: Automatic slide progression with customizable timing

### Player Installation

1. **Clone the player repository** (separate from main app)
   ```bash
   git clone <player-repository-url>
   cd PitchPerfectPlayer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the web assets**
   ```bash
   npm run build
   ```

4. **Add platforms**
   ```bash
   npx cap add ios
   npx cap add android
   ```

5. **Sync the project**
   ```bash
   npx cap sync
   ```

### Player Development

```bash
# iOS Development
npx cap open ios
npx cap run ios

# Android Development
npx cap open android
npx cap run android
```

### Player Usage

1. **Launch the app** on your iPad or mobile device
2. **Browse presentations** in the main list view
3. **Tap "Play"** to start a presentation
4. **Navigate** using swipe gestures or on-screen controls
5. **Use fullscreen mode** for immersive experience

The Player app works seamlessly with presentations created in the main PitchPerfect App, providing a complete presentation creation and playback solution. 