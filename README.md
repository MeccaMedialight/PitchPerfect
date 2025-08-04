# PitchPerfect - Professional Presentation Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)

A modern web application for creating beautiful presentations with rich media support that can run offline on iPad and other devices.

## 🚀 Features

### Core Functionality
- **Template-Based Creation**: Choose from professional templates for business pitches, product demos, and startup presentations
- **Rich Media Support**: Add images, videos, and interactive content to slides
- **Real-Time Preview**: See changes instantly as you build your presentation
- **iPad Optimized**: Presentations work perfectly on iPad, even without internet connection
- **Standalone Export**: Download complete presentations that run without internet

### Presentation Types
- **Title Slides**: Professional opening slides with titles and subtitles
- **Content Slides**: Text-heavy slides for detailed information
- **Image Slides**: Visual slides with image support
- **Video Slides**: Multimedia slides with video playback
- **Contact Slides**: Professional contact information slides

### Technical Features
- **PWA Support**: Install as a native app on mobile devices
- **Offline Capability**: Service worker for offline functionality
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Beautiful, intuitive interface with animations
- **File Upload**: Drag-and-drop media upload with progress tracking

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions
- **React Dropzone**: File upload with drag-and-drop
- **React Icons**: Beautiful icon library
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Multer**: File upload handling
- **JSZip**: ZIP file generation for standalone presentations
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

## 📁 Project Structure

```
PitchPerfect/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── index.js          # Server entry point
│   ├── uploads/          # Uploaded media files
│   ├── presentations/    # Saved presentations
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MeccaMedialight/PitchPerfect.git
   cd PitchPerfect
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

### Building for Production

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy the backend**
   ```bash
   cd server
   npm start
   ```

## 📱 Usage

### Creating a Presentation

1. **Choose a Template**: Browse available templates or start from scratch
2. **Edit Slides**: Use the slide editor to customize content, titles, and media
3. **Add Media**: Upload images and videos using the drag-and-drop interface
4. **Preview**: See your presentation in real-time as you build
5. **Export**: Download a standalone ZIP file that runs offline

### Presentation Controls

- **Navigation**: Use arrow keys or click navigation buttons
- **Fullscreen**: Click the expand button for immersive viewing
- **Autoplay**: Enable automatic slide progression
- **Touch Support**: Swipe gestures on mobile devices

### Offline Usage

1. **Install as PWA**: Add to home screen on mobile devices
2. **Download Presentation**: Export standalone presentations
3. **No Internet Required**: Presentations work completely offline

## 🔧 API Endpoints

### Templates
- `GET /api/templates` - Get all available templates
- `GET /api/templates/:id` - Get specific template

### Presentations
- `POST /api/presentations` - Save a new presentation
- `GET /api/presentations/:id` - Get a saved presentation
- `POST /api/presentations/:id/generate` - Generate standalone presentation

### File Upload
- `POST /api/upload` - Upload media files
- `GET /uploads/:filename` - Serve uploaded files

## 🎨 Customization

### Adding New Templates
1. Add template data to `server/index.js`
2. Include slide structure and content
3. Add template icon and metadata

### Styling
- Modify CSS files in `client/src/`
- Update color scheme in `App.css`
- Customize animations in component files

### Features
- Extend slide types in `SlideEditor.js`
- Add new media types in `MediaUpload.js`
- Enhance presentation controls in `PresentationViewer.js`

## 📱 PWA Features

- **Offline Support**: Service worker caches resources
- **App Installation**: Add to home screen on mobile
- **Native Feel**: Fullscreen and immersive experience
- **Background Sync**: Sync data when online

## 🔒 Security Considerations

- File upload validation and size limits
- CORS configuration for cross-origin requests
- Input sanitization for user content
- Secure file serving with proper headers

## 🚀 Deployment

### Frontend Deployment
- Build with `npm run build`
- Deploy to static hosting (Netlify, Vercel, etc.)
- Configure environment variables

### Backend Deployment
- Deploy to cloud platform (Heroku, AWS, etc.)
- Set up environment variables
- Configure file storage for uploads

## 🏢 Organization

This project is maintained by [MeccaMedialight](https://github.com/MeccaMedialight), a team dedicated to creating innovative web applications and digital solutions.

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Advanced slide transitions
- [ ] Collaborative editing
- [ ] More template options
- [ ] Advanced media controls
- [ ] Analytics and tracking
- [ ] Cloud storage integration 