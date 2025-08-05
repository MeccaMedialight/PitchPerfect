const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const JSZip = require('jszip');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '200mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Create directories
const uploadsDir = path.join(__dirname, 'uploads');
const presentationsDir = path.join(__dirname, 'presentations');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(presentationsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
    fieldSize: 200 * 1024 * 1024 // 200MB field size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp|mp4|mov|avi|pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, video, and document files are allowed!'));
    }
  }
});

// Templates data
const templates = [
  {
    id: 'business-pitch',
    name: 'Business Pitch',
    description: 'Professional business presentation template with rich media support',
    slides: [
      { 
        id: 'title', 
        type: 'title', 
        title: 'TechCorp Solutions', 
        content: 'Revolutionizing Business Technology', 
        subtitle: 'Empowering the future of work',
        backgroundColor: '#1a365d',
        textColor: '#ffffff'
      },
      { 
        id: 'problem', 
        type: 'content', 
        title: 'The Problem We Solve', 
        content: 'Businesses struggle with:\n• Inefficient workflow management\n• Poor team collaboration\n• Data security concerns\n• High operational costs\n• Limited scalability',
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0'
      },
      { 
        id: 'solution', 
        type: 'image', 
        title: 'Our Innovative Solution', 
        content: 'A comprehensive platform that streamlines operations, enhances security, and drives growth through intelligent automation.',
        imageUrl: '',
        backgroundColor: '#2a4365',
        textColor: '#bee3f8'
      },
      { 
        id: 'market', 
        type: 'content', 
        title: 'Market Opportunity', 
        content: 'Global Business Software Market:\n• $500B+ market size\n• 15% annual growth rate\n• 2.5M+ potential customers\n• $50K average contract value',
        backgroundColor: '#22543d',
        textColor: '#c6f6d5'
      },
      { 
        id: 'business-model', 
        type: 'content', 
        title: 'Revenue Model', 
        content: '• SaaS Subscription: $99-999/month\n• Enterprise Licensing: $50K-500K\n• Professional Services: $150/hour\n• Training & Support: $25K/year',
        backgroundColor: '#744210',
        textColor: '#faf089'
      },
      { 
        id: 'team', 
        type: 'image', 
        title: 'Our Leadership Team', 
        content: 'Experienced professionals with 50+ years combined experience in enterprise software and business transformation.',
        imageUrl: '',
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      },
      { 
        id: 'contact', 
        type: 'contact', 
        title: 'Let\'s Build the Future Together', 
        email: 'hello@techcorp.com', 
        phone: '+1-555-0123',
        website: 'www.techcorp.com',
        backgroundColor: '#742a2a',
        textColor: '#fed7d7'
      }
    ]
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase your product features with interactive media',
    slides: [
      { 
        id: 'title', 
        type: 'title', 
        title: 'SmartHome Hub', 
        content: 'The Future of Home Automation', 
        subtitle: 'Control everything with one device',
        backgroundColor: '#2d3748',
        textColor: '#ffffff'
      },
      { 
        id: 'overview', 
        type: 'content', 
        title: 'Product Overview', 
        content: 'SmartHome Hub is an AI-powered central control system that:\n\n• Connects to 200+ smart devices\n• Learns your preferences\n• Saves 30% on energy bills\n• Provides 24/7 security monitoring\n• Works with voice commands',
        backgroundColor: '#1a365d',
        textColor: '#bee3f8'
      },
      { 
        id: 'features', 
        type: 'image', 
        title: 'Key Features', 
        content: '• Voice Control Integration\n• Mobile App Control\n• Energy Management\n• Security Monitoring\n• Custom Automation\n• Multi-Room Audio',
        imageUrl: '',
        backgroundColor: '#22543d',
        textColor: '#c6f6d5'
      },
      { 
        id: 'benefits', 
        type: 'content', 
        title: 'Why Customers Love It', 
        content: 'Customer Satisfaction: 4.8/5 stars\n\n• 95% energy savings\n• 60% faster setup than competitors\n• 99.9% uptime reliability\n• 24/7 customer support\n• Free software updates',
        backgroundColor: '#744210',
        textColor: '#faf089'
      },
      { 
        id: 'demo', 
        type: 'video', 
        title: 'See It In Action', 
        content: 'Watch how SmartHome Hub transforms your daily routine with intelligent automation and seamless control.',
        videoUrl: '',
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      },
      { 
        id: 'pricing', 
        type: 'content', 
        title: 'Pricing Plans', 
        content: 'Starter: $199\n• Basic home automation\n• 10 device support\n• Mobile app\n\nProfessional: $399\n• Advanced features\n• 50 device support\n• Voice control\n\nEnterprise: $799\n• Unlimited devices\n• Custom integrations\n• Priority support',
        backgroundColor: '#742a2a',
        textColor: '#fed7d7'
      },
      { 
        id: 'contact', 
        type: 'contact', 
        title: 'Get Started Today', 
        email: 'sales@smarthome.com', 
        phone: '+1-800-SMART-HOME',
        website: 'www.smarthomehub.com',
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0'
      }
    ]
  },
  {
    id: 'startup-pitch',
    name: 'Startup Pitch',
    description: 'Perfect for startup presentations with compelling storytelling',
    slides: [
      { 
        id: 'title', 
        type: 'title', 
        title: 'EcoCharge', 
        content: 'Revolutionizing Electric Vehicle Charging', 
        subtitle: 'Fast, green, and everywhere',
        backgroundColor: '#22543d',
        textColor: '#ffffff'
      },
      { 
        id: 'vision', 
        type: 'content', 
        title: 'Our Vision', 
        content: 'To accelerate the world\'s transition to sustainable energy by making EV charging as convenient as finding a gas station.\n\nWe envision a future where:\n• Every parking spot has a charger\n• Charging takes 5 minutes or less\n• 100% renewable energy powers all EVs\n• Charging is free for everyone',
        backgroundColor: '#1a365d',
        textColor: '#bee3f8'
      },
      { 
        id: 'problem', 
        type: 'image', 
        title: 'The Problem', 
        content: 'Current EV charging infrastructure is:\n\n• Too slow (hours to charge)\n• Too sparse (charging deserts)\n• Too expensive ($0.30-0.50/kWh)\n• Too unreliable (broken stations)\n• Too complex (multiple apps/payments)',
        imageUrl: '',
        backgroundColor: '#742a2a',
        textColor: '#fed7d7'
      },
      { 
        id: 'solution', 
        type: 'video', 
        title: 'Our Breakthrough Solution', 
        content: 'EcoCharge\'s revolutionary technology:\n\n• Ultra-fast charging (5 minutes)\n• Wireless charging pads\n• Solar-powered stations\n• AI-powered load balancing\n• Universal compatibility',
        videoUrl: '',
        backgroundColor: '#744210',
        textColor: '#faf089'
      },
      { 
        id: 'traction', 
        type: 'content', 
        title: 'Impressive Traction', 
        content: 'Growth Metrics:\n\n• 500% YoY revenue growth\n• 10,000+ active users\n• 50+ charging stations deployed\n• $2M ARR\n• 95% customer retention\n• 4.9/5 customer rating\n\nPartnerships:\n• Tesla, Ford, GM\n• Walmart, Target, Costco\n• Major cities and universities',
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      },
      { 
        id: 'team', 
        type: 'image', 
        title: 'The Dream Team', 
        content: 'Founders with 30+ years combined experience:\n\n• CEO: Former Tesla engineer\n• CTO: PhD in electrical engineering\n• COO: Ex-Uber operations leader\n• CMO: Former Apple marketing director',
        imageUrl: '',
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0'
      },
      { 
        id: 'ask', 
        type: 'content', 
        title: 'Investment Opportunity', 
        content: 'Seeking $5M Series A to:\n\n• Deploy 1,000 charging stations\n• Expand to 10 new cities\n• Hire 50 team members\n• Develop next-gen technology\n• Scale manufacturing\n\nExpected ROI: 10x within 3 years',
        backgroundColor: '#1a365d',
        textColor: '#ffffff'
      }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Engaging marketing presentation with visual storytelling',
    slides: [
      { 
        id: 'title', 
        type: 'title', 
        title: 'Brand Evolution 2024', 
        content: 'Transforming Our Brand Story', 
        subtitle: 'Connecting hearts, inspiring minds',
        backgroundColor: '#553c9a',
        textColor: '#ffffff'
      },
      { 
        id: 'story', 
        type: 'content', 
        title: 'Our Brand Story', 
        content: 'From humble beginnings to industry leader:\n\n• Founded in 2010 with a simple mission\n• Grew from 3 employees to 500+ team members\n• Served 1M+ customers worldwide\n• Won 25+ industry awards\n• Recognized as a top workplace',
        backgroundColor: '#1a365d',
        textColor: '#bee3f8'
      },
      { 
        id: 'campaign', 
        type: 'image', 
        title: 'The Campaign Concept', 
        content: 'Our new campaign focuses on:\n\n• Authentic storytelling\n• Customer success stories\n• Behind-the-scenes content\n• Interactive experiences\n• Social media engagement',
        imageUrl: '',
        backgroundColor: '#22543d',
        textColor: '#c6f6d5'
      },
      { 
        id: 'video-story', 
        type: 'video', 
        title: 'Customer Success Stories', 
        content: 'Real stories from real customers who transformed their businesses with our solutions.',
        videoUrl: '',
        backgroundColor: '#744210',
        textColor: '#faf089'
      },
      { 
        id: 'metrics', 
        type: 'content', 
        title: 'Campaign Performance', 
        content: 'Expected Results:\n\n• 500% increase in brand awareness\n• 300% boost in social media engagement\n• 200% growth in website traffic\n• 150% increase in lead generation\n• 100% improvement in customer satisfaction',
        backgroundColor: '#742a2a',
        textColor: '#fed7d7'
      },
      { 
        id: 'timeline', 
        type: 'content', 
        title: 'Launch Timeline', 
        content: 'Phase 1 (Q1): Brand refresh and website launch\nPhase 2 (Q2): Social media campaign kickoff\nPhase 3 (Q3): Customer story video series\nPhase 4 (Q4): Interactive brand experience\n\nTotal Budget: $2.5M\nExpected ROI: 400%',
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0'
      },
      { 
        id: 'contact', 
        type: 'contact', 
        title: 'Join Our Journey', 
        email: 'hello@brandevolution.com', 
        phone: '+1-555-BRAND-2024',
        website: 'www.brandevolution.com',
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      }
    ]
  },
  {
    id: 'educational-content',
    name: 'Educational Content',
    description: 'Interactive learning presentation with multimedia elements',
    slides: [
      { 
        id: 'title', 
        type: 'title', 
        title: 'The Future of AI', 
        content: 'Understanding Artificial Intelligence', 
        subtitle: 'A comprehensive guide for everyone',
        backgroundColor: '#2d3748',
        textColor: '#ffffff'
      },
      { 
        id: 'intro', 
        type: 'content', 
        title: 'What is Artificial Intelligence?', 
        content: 'AI is the simulation of human intelligence in machines:\n\n• Machine Learning\n• Natural Language Processing\n• Computer Vision\n• Robotics\n• Expert Systems\n\nAI is already part of our daily lives!',
        backgroundColor: '#1a365d',
        textColor: '#bee3f8'
      },
      { 
        id: 'history', 
        type: 'image', 
        title: 'A Brief History of AI', 
        content: 'Key milestones:\n\n1950s: Turing Test proposed\n1960s: First AI programs\n1980s: Expert systems boom\n1990s: Machine learning advances\n2000s: Big data revolution\n2010s: Deep learning breakthrough\n2020s: AI in everything',
        imageUrl: '',
        backgroundColor: '#22543d',
        textColor: '#c6f6d5'
      },
      { 
        id: 'demo', 
        type: 'video', 
        title: 'AI in Action', 
        content: 'Watch how AI is transforming industries:\n\n• Healthcare: Medical diagnosis\n• Finance: Fraud detection\n• Transportation: Self-driving cars\n• Education: Personalized learning\n• Entertainment: Content creation',
        videoUrl: '',
        backgroundColor: '#744210',
        textColor: '#faf089'
      },
      { 
        id: 'applications', 
        type: 'content', 
        title: 'Real-World Applications', 
        content: 'AI is everywhere:\n\n• Virtual assistants (Siri, Alexa)\n• Recommendation systems (Netflix, Amazon)\n• Image recognition (Facebook, Google Photos)\n• Language translation (Google Translate)\n• Autonomous vehicles (Tesla, Waymo)\n• Medical imaging (diagnosis assistance)',
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      },
      { 
        id: 'future', 
        type: 'content', 
        title: 'The Future of AI', 
        content: 'What\'s coming next:\n\n• General AI (human-level intelligence)\n• Quantum computing integration\n• Brain-computer interfaces\n• AI-powered creativity tools\n• Autonomous everything\n• AI ethics and regulation\n\nOpportunities and challenges ahead!',
        backgroundColor: '#742a2a',
        textColor: '#fed7d7'
      },
      { 
        id: 'resources', 
        type: 'contact', 
        title: 'Learn More', 
        email: 'ai-education@future.com', 
        phone: '+1-555-AI-LEARN',
        website: 'www.ai-education.com',
        backgroundColor: '#2d3748',
        textColor: '#e2e8f0'
      }
    ]
  },
          {
          id: 'actf-mipcom',
          name: 'ACTF MIPCOM',
          description: 'Professional presentation template inspired by modern design with custom styling',
          slides: [
            {
              id: 'title',
              type: 'title',
              title: 'ACTF MIPCOM',
              content: 'Professional Presentation',
              subtitle: 'Modern design with custom styling',
              backgroundColor: '#fafafc',
              textColor: '#2b2a35'
            },
            {
              id: 'overview',
              type: 'content',
              title: 'Project Overview',
              content: 'A comprehensive overview of our innovative approach to modern presentation design:\n\n• Custom typography and fonts\n• Professional color schemes\n• Responsive layout design\n• Interactive elements\n• Modern visual hierarchy',
              backgroundColor: '#fafafc',
              textColor: '#545465'
            },
            {
              id: 'features',
              type: 'image',
              title: 'Key Features',
              content: 'Our platform delivers:\n\n• Advanced typography system\n• Custom font loading\n• Responsive design\n• Professional themes\n• Interactive components\n• Seamless integration',
              imageUrl: '',
              backgroundColor: '#fafafc',
              textColor: '#545465'
            },
            {
              id: 'technology',
              type: 'content',
              title: 'Technology Stack',
              content: 'Built with modern technologies:\n\n• React.js for frontend\n• Node.js backend\n• Custom CSS frameworks\n• Web font optimization\n• Progressive Web App features\n• Cross-platform compatibility',
              backgroundColor: '#fafafc',
              textColor: '#545465'
            },
            {
              id: 'benefits',
              type: 'video',
              title: 'Benefits & Advantages',
              content: 'Why choose our solution:\n\n• Professional appearance\n• Consistent branding\n• Easy customization\n• Fast performance\n• Mobile optimization\n• Offline capability',
              videoUrl: '',
              backgroundColor: '#fafafc',
              textColor: '#545465'
            },
            {
              id: 'implementation',
              type: 'content',
              title: 'Implementation Process',
              content: 'Our streamlined implementation:\n\n• Initial consultation\n• Design customization\n• Development phase\n• Testing & optimization\n• Deployment\n• Ongoing support',
              backgroundColor: '#fafafc',
              textColor: '#545465'
            },
            {
              id: 'contact',
              type: 'contact',
              title: 'Get Started Today',
              email: 'contact@actf-mipcom.com',
              phone: '+1-555-MIPCOM',
              website: 'www.actf-mipcom.com',
              backgroundColor: '#fafafc',
              textColor: '#2b2a35'
            }
          ]
        },
        {
          id: 'multi-media-demo',
          name: 'Multi-Media Demo',
          description: 'Template showcasing multiple media items on a single slide',
          slides: [
            {
              id: 'title',
              type: 'title',
              title: 'Multi-Media Presentation',
              content: 'Showcasing Multiple Media Types',
              subtitle: 'Images, videos, and text on one slide',
              backgroundColor: '#1a365d',
              textColor: '#ffffff'
            },
            {
              id: 'multi-media-slide',
              type: 'multi-media',
              title: 'Product Showcase',
              content: 'Our flagship product combines cutting-edge technology with intuitive design to deliver an unparalleled user experience.',
              mediaItems: [
                {
                  id: 'media-1',
                  type: 'image',
                  url: '',
                  position: { x: 5, y: 15, width: 40, height: 35 },
                  caption: 'Product Interface'
                },
                {
                  id: 'media-2',
                  type: 'video',
                  url: '',
                  position: { x: 50, y: 15, width: 40, height: 35 },
                  caption: 'Product Demo'
                },
                {
                  id: 'media-3',
                  type: 'image',
                  url: '',
                  position: { x: 27.5, y: 55, width: 40, height: 35 },
                  caption: 'Technical Specs'
                }
              ],
              backgroundColor: '#2d3748',
              textColor: '#e2e8f0'
            },
            {
              id: 'content',
              type: 'content',
              title: 'Key Benefits',
              content: '• Multiple media types on one slide\n• Flexible positioning and sizing\n• Rich visual storytelling\n• Enhanced engagement\n• Professional presentation',
              backgroundColor: '#2a4365',
              textColor: '#bee3f8'
            }
          ]
        },
        {
          id: 'portfolio-showcase',
          name: 'Portfolio Showcase',
          description: 'Perfect for showcasing multiple projects or products with visual media',
          slides: [
            {
              id: 'title',
              type: 'title',
              title: 'Portfolio Showcase',
              content: 'Our Creative Work',
              subtitle: 'Showcasing our best projects and achievements',
              backgroundColor: '#2d3748',
              textColor: '#ffffff'
            },
            {
              id: 'portfolio-grid',
              type: 'multi-media',
              title: 'Featured Projects',
              content: 'A selection of our most impactful work across various industries and technologies.',
              mediaItems: [
                {
                  id: 'project-1',
                  type: 'image',
                  url: '',
                  position: { x: 5, y: 15, width: 28, height: 30 },
                  caption: 'Project Alpha'
                },
                {
                  id: 'project-2',
                  type: 'image',
                  url: '',
                  position: { x: 37, y: 15, width: 28, height: 30 },
                  caption: 'Project Beta'
                },
                {
                  id: 'project-3',
                  type: 'image',
                  url: '',
                  position: { x: 69, y: 15, width: 28, height: 30 },
                  caption: 'Project Gamma'
                },
                {
                  id: 'project-4',
                  type: 'image',
                  url: '',
                  position: { x: 5, y: 50, width: 28, height: 30 },
                  caption: 'Project Delta'
                },
                {
                  id: 'project-5',
                  type: 'image',
                  url: '',
                  position: { x: 37, y: 50, width: 28, height: 30 },
                  caption: 'Project Epsilon'
                },
                {
                  id: 'project-6',
                  type: 'image',
                  url: '',
                  position: { x: 69, y: 50, width: 28, height: 30 },
                  caption: 'Project Zeta'
                }
              ],
              backgroundColor: '#1a365d',
              textColor: '#bee3f8'
            }
          ]
        },
        {
          id: 'comparison-slide',
          name: 'Comparison Slide',
          description: 'Compare two or more items side by side with visual media',
          slides: [
            {
              id: 'title',
              type: 'title',
              title: 'Product Comparison',
              content: 'Before vs After',
              subtitle: 'See the difference our solution makes',
              backgroundColor: '#22543d',
              textColor: '#ffffff'
            },
            {
              id: 'comparison',
              type: 'multi-media',
              title: 'Before vs After',
              content: 'Visual comparison showing the transformation and improvements achieved.',
              mediaItems: [
                {
                  id: 'before',
                  type: 'image',
                  url: '',
                  position: { x: 5, y: 15, width: 42, height: 60 },
                  caption: 'Before'
                },
                {
                  id: 'after',
                  type: 'image',
                  url: '',
                  position: { x: 53, y: 15, width: 42, height: 60 },
                  caption: 'After'
                }
              ],
              backgroundColor: '#744210',
              textColor: '#faf089'
            }
          ]
        },
        {
          id: 'feature-highlight',
          name: 'Feature Highlight',
          description: 'Highlight multiple features with supporting media',
          slides: [
            {
              id: 'title',
              type: 'title',
              title: 'Key Features',
              content: 'What Makes Us Special',
              subtitle: 'Discover our unique capabilities',
              backgroundColor: '#553c9a',
              textColor: '#ffffff'
            },
            {
              id: 'features',
              type: 'multi-media',
              title: 'Core Features',
              content: 'Our platform offers a comprehensive suite of features designed to meet your needs.',
              mediaItems: [
                {
                  id: 'feature-1',
                  type: 'image',
                  url: '',
                  position: { x: 10, y: 20, width: 35, height: 25 },
                  caption: 'Feature 1'
                },
                {
                  id: 'feature-2',
                  type: 'image',
                  url: '',
                  position: { x: 55, y: 20, width: 35, height: 25 },
                  caption: 'Feature 2'
                },
                {
                  id: 'feature-3',
                  type: 'image',
                  url: '',
                  position: { x: 10, y: 50, width: 35, height: 25 },
                  caption: 'Feature 3'
                },
                {
                  id: 'feature-4',
                  type: 'image',
                  url: '',
                  position: { x: 55, y: 50, width: 35, height: 25 },
                  caption: 'Feature 4'
                }
              ],
              backgroundColor: '#742a2a',
              textColor: '#fed7d7'
            }
    ]
  }
];

// API Routes

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test generate endpoint
app.post('/test-generate', (req, res) => {
  console.log('Test generate endpoint hit');
  console.log('Request body:', req.body);
  res.json({ message: 'Test generate endpoint working!', data: req.body });
});

// Test endpoint to check media files
app.get('/test-media', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileStats = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime
      };
    });
    res.json({ 
      uploadsDir, 
      fileCount: files.length, 
      files: fileStats 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to create a presentation with media files
app.post('/test-create-presentation-with-media', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    if (files.length === 0) {
      return res.status(400).json({ error: 'No media files available for testing' });
    }

    // Create a test presentation with the first available media files
    const testPresentation = {
      title: 'Test Presentation with Media',
      template: 'business-pitch',
      slides: [
        {
          id: 'title',
          type: 'title',
          title: 'Test Presentation',
          content: 'Testing media file inclusion',
          subtitle: 'With uploaded media files',
          backgroundColor: '#1a365d',
          textColor: '#ffffff'
        },
        {
          id: 'image-slide',
          type: 'image',
          title: 'Test Image Slide',
          content: 'This slide has an image',
          imageUrl: `/uploads/${files[0]}`, // Use the first available file
          backgroundColor: '#2d3748',
          textColor: '#e2e8f0'
        }
      ]
    };

    // If there are video files, add a video slide
    const videoFiles = files.filter(file => file.includes('.mp4'));
    if (videoFiles.length > 0) {
      testPresentation.slides.push({
        id: 'video-slide',
        type: 'video',
        title: 'Test Video Slide',
        content: 'This slide has a video',
        videoUrl: `/uploads/${videoFiles[0]}`, // Use the first video file
        backgroundColor: '#553c9a',
        textColor: '#e9d8fd'
      });
    }

    res.json({
      success: true,
      presentation: testPresentation,
      message: 'Test presentation created with media files'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all templates
app.get('/api/templates', (req, res) => {
  console.log('Templates route hit');
  res.json(templates);
});

// Get specific template
app.get('/api/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  // Set a timeout for large uploads
  req.setTimeout(300000); // 5 minutes
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling for multer upload errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 200MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message && error.message.includes('Only image, video, and document files are allowed')) {
    return res.status(400).json({ error: 'Only image, video, and document files are allowed!' });
  }
  
  console.error('Upload middleware error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Save presentation
app.post('/api/presentations', (req, res) => {
  try {
    const { title, template, slides, settings } = req.body;
    const presentationId = uuidv4();
    
    const presentationData = {
      id: presentationId,
      title,
      template,
      slides,
      settings,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(presentationsDir, `${presentationId}.json`);
    fs.writeJsonSync(filePath, presentationData);

    res.json({
      success: true,
      presentationId,
      message: 'Presentation saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all presentations
app.get('/api/presentations', (req, res) => {
  try {
    const files = fs.readdirSync(presentationsDir);
    const presentations = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(presentationsDir, file);
        const presentationData = fs.readJsonSync(filePath);
        const presentationId = file.replace('.json', '');
        
        presentations.push({
          id: presentationId,
          title: presentationData.title || 'Untitled Presentation',
          createdAt: presentationData.createdAt || fs.statSync(filePath).mtime,
          slideCount: presentationData.slides ? presentationData.slides.length : 0,
          hasMedia: presentationData.slides ? presentationData.slides.some(slide => slide.imageUrl || slide.videoUrl) : false
        });
      }
    }
    
    // Sort by creation date (newest first)
    presentations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(presentations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get presentation
app.get('/api/presentations/:id', (req, res) => {
  try {
    const filePath = path.join(presentationsDir, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    const presentationData = fs.readJsonSync(filePath);
    res.json(presentationData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update presentation
app.put('/api/presentations/:id', (req, res) => {
  try {
    const { title, template, slides, settings } = req.body;
    const filePath = path.join(presentationsDir, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Read existing presentation to preserve createdAt
    const existingData = fs.readJsonSync(filePath);
    
    const presentationData = {
      ...existingData,
      title,
      template,
      slides,
      settings,
      updatedAt: new Date().toISOString()
    };

    fs.writeJsonSync(filePath, presentationData);

    res.json({
      success: true,
      message: 'Presentation updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate downloadable presentation
app.post('/api/presentations/:id/generate', async (req, res) => {
  // Set a longer timeout for large file processing
  req.setTimeout(600000); // 10 minutes
  
  try {
    console.log('Generate endpoint hit with ID:', req.params.id);
    console.log('Request body keys:', Object.keys(req.body));
    
    // Use presentation data from request body instead of file
    const presentationData = req.body;
    
    if (!presentationData || !presentationData.slides) {
      console.log('Invalid presentation data:', presentationData);
      return res.status(400).json({ error: 'Invalid presentation data' });
    }
    
    console.log('Presentation has', presentationData.slides.length, 'slides');
    const zip = new JSZip();

    // Add presentation data (will be updated after media processing)
    zip.file('presentation.json', JSON.stringify(presentationData, null, 2));

    // Generate HTML viewer (will be updated after media processing)
    const htmlContent = generateHTMLViewer(presentationData);
    zip.file('index.html', htmlContent);

    // Generate CSS styles
    const cssContent = generateCSSStyles();
    zip.file('styles.css', cssContent);

    // Generate JavaScript
    const jsContent = generatePresentationJS();
    zip.file('presentation.js', jsContent);

    // Add README file
    const readmeContent = generateReadmeContent(presentationData);
    zip.file('README.md', readmeContent);

    // Add media files
    const mediaFiles = new Set();
    const mediaFilesAdded = [];
    const mediaFilesMissing = [];
    const mediaFileMap = {}; // Maps original URLs to local filenames
    
    presentationData.slides.forEach((slide, index) => {
      console.log(`Slide ${index}:`, { imageUrl: slide.imageUrl, videoUrl: slide.videoUrl });
      if (slide.imageUrl) mediaFiles.add(slide.imageUrl);
      if (slide.videoUrl) mediaFiles.add(slide.videoUrl);
      
      // Handle multi-media slides
      if (slide.type === 'multi-media' && slide.mediaItems) {
        slide.mediaItems.forEach(mediaItem => {
          if (mediaItem.url) {
            mediaFiles.add(mediaItem.url);
          }
        });
      }
      
      // Handle custom layout slides
      if (slide.type === 'custom-layout' && slide.layoutSlots) {
        slide.layoutSlots.forEach(slot => {
          if (slot.content && (slot.type === 'image' || slot.type === 'video')) {
            mediaFiles.add(slot.content);
          }
        });
      }
    });

    console.log('Media files found:', Array.from(mediaFiles));

    for (const mediaFile of mediaFiles) {
      if (mediaFile) {
        let fileName = null;
        let mediaPath = null;
        let isExternalUrl = false;
        
        // Handle both relative and full URLs
        if (mediaFile.startsWith('/uploads/')) {
          fileName = mediaFile.replace('/uploads/', '');
          mediaPath = path.join(uploadsDir, fileName);
        } else if (mediaFile.includes('/uploads/')) {
          // Extract filename from full URL
          const urlParts = mediaFile.split('/uploads/');
          if (urlParts.length > 1) {
            fileName = urlParts[1];
            mediaPath = path.join(uploadsDir, fileName);
          }
        } else if (mediaFile.startsWith('http://') || mediaFile.startsWith('https://')) {
          // Handle external URLs
          isExternalUrl = true;
          fileName = generateExternalFileName(mediaFile);
          console.log(`Processing external media: ${mediaFile} -> ${fileName}`);
        }
        
        if (fileName) {
          if (isExternalUrl) {
            // Download external media
            try {
              const fileBuffer = await downloadExternalMedia(mediaFile, fileName);
              if (fileBuffer) {
                console.log(`Adding external media to ZIP: media/${fileName}`);
                zip.file(`media/${fileName}`, fileBuffer);
                mediaFilesAdded.push(fileName);
                mediaFileMap[mediaFile] = fileName; // Add to mapping
                console.log(`Added external media file: ${fileName} (${fileBuffer.length} bytes)`);
              } else {
                console.warn(`Failed to download external media: ${mediaFile}`);
                mediaFilesMissing.push(fileName);
              }
            } catch (error) {
              console.error(`Error downloading external media ${mediaFile}:`, error.message);
              mediaFilesMissing.push(fileName);
            }
          } else if (mediaPath) {
            // Handle local files
            console.log('Checking media file:', mediaPath, 'exists:', fs.existsSync(mediaPath));
            
            if (fs.existsSync(mediaPath)) {
              try {
                const fileSize = fs.statSync(mediaPath).size;
                console.log(`Reading file: ${fileName} (${fileSize} bytes)`);
                
                // Check if file is too large and warn user
                if (fileSize > 50 * 1024 * 1024) { // 50MB
                  console.warn(`Large file detected: ${fileName} (${(fileSize / 1024 / 1024).toFixed(1)}MB) - this may take a while`);
                }
                
                // Use streaming for large files to avoid memory issues
                const fileBuffer = fs.readFileSync(mediaPath);
                console.log(`File read successfully: ${fileName} (${fileBuffer.length} bytes)`);
                
                console.log(`Adding to ZIP: media/${fileName}`);
                zip.file(`media/${fileName}`, fileBuffer);
                mediaFilesAdded.push(fileName);
                mediaFileMap[mediaFile] = fileName; // Add to mapping
                console.log(`Added media file: ${fileName} (${fileBuffer.length} bytes)`);
              } catch (error) {
                console.error(`Error reading media file ${fileName}:`, error.message);
                console.error(`Error stack:`, error.stack);
                mediaFilesMissing.push(fileName);
              }
            } else {
              console.warn(`Media file not found: ${mediaPath}`);
              mediaFilesMissing.push(fileName);
            }
          }
        } else {
          console.log(`Skipping invalid media file: ${mediaFile}`);
        }
      }
    }

    console.log(`Media files added: ${mediaFilesAdded.length}`);
    console.log(`Media files missing: ${mediaFilesMissing.length}`);
    if (mediaFilesMissing.length > 0) {
      console.warn('Missing media files:', mediaFilesMissing);
    }

    // Process presentation data to replace external URLs with local references
    const processedPresentationData = processPresentationDataForExport(presentationData, mediaFileMap);
    
    // Update the presentation.json and index.html files with processed data
    zip.file('presentation.json', JSON.stringify(processedPresentationData, null, 2));
    const updatedHtmlContent = generateHTMLViewer(processedPresentationData);
    zip.file('index.html', updatedHtmlContent);

    console.log('Generating ZIP file...');
    console.log('ZIP file list:', Object.keys(zip.files));
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    console.log('ZIP file generated, size:', zipBuffer.length, 'bytes');
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="presentation-${req.params.id}.zip"`);
    res.send(zipBuffer);
    console.log('ZIP file sent successfully');

  } catch (error) {
    console.error('Error in generate endpoint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Delete presentation
app.delete('/api/presentations/:id', (req, res) => {
  try {
    const filePath = path.join(presentationsDir, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Presentation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to download external media files
async function downloadExternalMedia(url, fileName) {
  try {
    console.log(`Downloading external media: ${url}`);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`Downloaded ${fileName}: ${response.data.length} bytes`);
    return response.data;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

// Helper function to generate unique filename for external media
function generateExternalFileName(url, originalFileName = null) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const extension = path.extname(pathname) || (originalFileName ? path.extname(originalFileName) : '');
  
  // Generate a unique filename based on URL and timestamp
  const timestamp = Date.now();
  const urlHash = Buffer.from(url).toString('base64').substring(0, 8);
  const baseName = originalFileName ? path.basename(originalFileName, path.extname(originalFileName)) : 'external';
  
  return `${baseName}-${urlHash}-${timestamp}${extension}`;
}

// Helper function to process presentation data and replace external URLs with local references
function processPresentationDataForExport(presentationData, mediaFileMap) {
  const processedData = JSON.parse(JSON.stringify(presentationData));
  
  processedData.slides.forEach(slide => {
    // Handle regular image/video URLs
    if (slide.imageUrl && mediaFileMap[slide.imageUrl]) {
      slide.imageUrl = `media/${mediaFileMap[slide.imageUrl]}`;
    }
    if (slide.videoUrl && mediaFileMap[slide.videoUrl]) {
      slide.videoUrl = `media/${mediaFileMap[slide.videoUrl]}`;
    }
    
    // Handle multi-media slides
    if (slide.type === 'multi-media' && slide.mediaItems) {
      slide.mediaItems.forEach(mediaItem => {
        if (mediaItem.url && mediaFileMap[mediaItem.url]) {
          mediaItem.url = `media/${mediaFileMap[mediaItem.url]}`;
        }
      });
    }
    
    // Handle custom layout slides
    if (slide.type === 'custom-layout' && slide.layoutSlots) {
      slide.layoutSlots.forEach(slot => {
        if (slot.content && (slot.type === 'image' || slot.type === 'video') && mediaFileMap[slot.content]) {
          slot.content = `media/${mediaFileMap[slot.content]}`;
        }
      });
    }
  });
  
  return processedData;
}

// Helper functions for generating presentation files
function generateHTMLViewer(presentationData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentationData.title || 'Presentation'}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="presentation-container">
        <div id="presentation" class="presentation">
            <div id="slides-container"></div>
        </div>
        
        <div id="controls" class="controls">
            <button id="prev-btn" class="control-btn">‹</button>
            <button id="play-btn" class="control-btn">▶</button>
            <button id="next-btn" class="control-btn">›</button>
            <div id="slide-indicator" class="slide-indicator"></div>
        </div>
        
        <div id="fullscreen-btn" class="fullscreen-btn">⛶</div>
    </div>
    
    <script>
        try {
            window.presentationData = JSON.parse(atob('${Buffer.from(JSON.stringify(presentationData)).toString('base64')}'));
        } catch (e) {
            console.error('Failed to parse base64 data, trying alternative method:', e);
            // Fallback: embed data directly in a safer way
            window.presentationData = ${JSON.stringify(presentationData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')};
        }
    </script>
    <script src="presentation.js"></script>
</body>
</html>`;
}

function generateCSSStyles() {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #000;
    color: #fff;
    overflow: hidden;
    height: 100vh;
}

#presentation-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.presentation {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;
}

.slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    text-align: center;
}

.slide.active {
    opacity: 1;
}

.slide-title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #fff;
}

.slide-content {
    font-size: 1.5rem;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    color: #ccc;
}

.slide-subtitle {
    font-size: 1.2rem;
    color: #888;
    margin-top: 0.5rem;
}

.slide-image {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    margin: 20px 0;
    border-radius: 8px;
}

 .video-container {
     position: relative;
     width: 100%;
     max-width: 800px;
     margin: 20px auto;
}

.slide-video {
      width: 100%;
    max-height: 60vh;
    border-radius: 8px;
      background: #000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      pointer-events: auto !important;
      z-index: 1000;
      position: relative;
  }
  
  .slide-video::-webkit-media-controls {
      background: rgba(0, 0, 0, 0.7) !important;
      pointer-events: auto !important;
  }
  
  .slide-video::-webkit-media-controls-panel {
      background: rgba(0, 0, 0, 0.8) !important;
      pointer-events: auto !important;
  }
  
  .slide-video::-webkit-media-controls-play-button {
      pointer-events: auto !important;
  }
  
  .slide-video::-webkit-media-controls-timeline {
      pointer-events: auto !important;
  }
  
  .slide-video::-webkit-media-controls-volume-slider {
      pointer-events: auto !important;
  }
  
  .slide-video::-webkit-media-controls-fullscreen-button {
      pointer-events: auto !important;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
}

.controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 15px 25px;
    border-radius: 50px;
    backdrop-filter: blur(10px);
}

.control-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    padding: 10px;
    border-radius: 50%;
    transition: background-color 0.3s;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.slide-indicator {
    display: flex;
    gap: 8px;
}

.indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: background-color 0.3s;
}

.indicator-dot.active {
    background: #fff;
}

.fullscreen-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border: none;
    font-size: 1.5rem;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
    .slide {
        padding: 40px 20px;
    }
    
    .slide-title {
        font-size: 2rem;
    }
    
    .slide-content {
        font-size: 1.2rem;
    }
    
    .controls {
        bottom: 20px;
        padding: 10px 20px;
    }
    
    .control-btn {
        font-size: 1.5rem;
    }
}

.image-error, .video-error {
    background: rgba(255, 107, 107, 0.1);
    border: 2px dashed rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    margin: 1rem 0;
}

    .image-error div, .video-error div {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }`;
}

function generateReadmeContent(presentationData) {
  const mediaFiles = [];
  presentationData.slides.forEach(slide => {
    if (slide.imageUrl) {
      // Handle both relative and full URLs
      if (slide.imageUrl.includes('/uploads/')) {
        const fileName = slide.imageUrl.split('/uploads/')[1];
        mediaFiles.push(`media/${fileName}`);
      }
    }
    if (slide.videoUrl) {
      // Handle both relative and full URLs
      if (slide.videoUrl.includes('/uploads/')) {
        const fileName = slide.videoUrl.split('/uploads/')[1];
        mediaFiles.push(`media/${fileName}`);
      }
    }
  });

  return `# ${presentationData.title || 'Presentation'}

This is a standalone presentation that can run without an internet connection.

## How to Use

1. **Open the presentation**: Double-click on \`index.html\` to open the presentation in your web browser
2. **Navigate**: Use the arrow keys, spacebar, or click the navigation buttons
3. **Fullscreen**: Click the fullscreen button (⛶) for a better viewing experience
4. **Autoplay**: Click the play button (▶) to automatically advance through slides

## Keyboard Shortcuts

- **Left Arrow / Up Arrow**: Previous slide
- **Right Arrow / Down Arrow / Spacebar**: Next slide
- **F11**: Toggle fullscreen (browser)

## Files Included

- \`index.html\` - Main presentation file
- \`styles.css\` - Presentation styling
- \`presentation.js\` - Presentation logic
- \`presentation.json\` - Presentation data
${mediaFiles.length > 0 ? `- \`media/\` folder - Contains ${mediaFiles.length} media file(s)` : ''}

## Media Files

${mediaFiles.length > 0 ? mediaFiles.map(file => `- \`${file}\``).join('\n') : 'No media files included in this presentation.'}

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No internet connection required
- All media files are included locally

## Troubleshooting

If media files don't load:
1. Make sure all files are extracted from the ZIP
2. Check that the \`media\` folder contains the required files
3. Try opening \`index.html\` in a different browser

## Created with PitchPerfect

This presentation was created using PitchPerfect - a modern presentation builder for creating engaging, interactive presentations.

---
Generated on: ${new Date().toISOString()}
`;
}

function generatePresentationJS() {
  return `class Presentation {
    constructor(data) {
        this.data = data;
        this.currentSlide = 0;
        this.isPlaying = false;
        this.autoplayInterval = null;
        this.autoplayDuration = 5000; // 5 seconds per slide
        
        this.init();
    }
    
    init() {
        console.log('Initializing presentation with', this.data.slides.length, 'slides');
        this.renderSlides();
        this.setupControls();
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.showSlide(0);
        this.updateIndicators();
        console.log('Presentation initialized successfully');
    }
    
    renderSlides() {
        const container = document.getElementById('slides-container');
        container.innerHTML = '';
        
        this.data.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.id = \`slide-\${index}\`;
            
            // Apply slide-specific styling
            if (slide.backgroundColor) {
                slideElement.style.backgroundColor = slide.backgroundColor;
            }
            if (slide.textColor) {
                slideElement.style.color = slide.textColor;
            }
            
            let slideContent = '';
            
            switch (slide.type) {
                case 'title':
                    slideContent = \`
                        <h1 class="slide-title">\${slide.title || ''}</h1>
                        <div class="slide-content">\${slide.content || ''}</div>
                        \${slide.subtitle ? \`<div class="slide-subtitle">\${slide.subtitle}</div>\` : ''}
                    \`;
                    break;
                    
                case 'content':
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        <div class="slide-content">\${slide.content || ''}</div>
                    \`;
                    break;
                    
                case 'image':
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        \${slide.imageUrl ? \`
                            <img src="media/\${slide.imageUrl.includes('/uploads/') ? slide.imageUrl.split('/uploads/')[1] : slide.imageUrl.replace('/uploads/', '')}" 
                                 alt="\${slide.title}" 
                                 class="slide-image"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <div class="image-error" style="display: none; color: #ff6b6b; text-align: center; padding: 2rem;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                                <div>Image not available</div>
                                <div style="font-size: 0.9rem; margin-top: 0.5rem;">media/\${slide.imageUrl.includes('/uploads/') ? slide.imageUrl.split('/uploads/')[1] : slide.imageUrl.replace('/uploads/', '')}</div>
                            </div>
                        \` : ''}
                        \${slide.content ? \`<div class="slide-content">\${slide.content}</div>\` : ''}
                    \`;
                    break;
                    
                case 'video':
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        \${slide.videoUrl ? \`
                            <div class="video-container">
                                <video class="slide-video" controls preload="metadata" playsinline
                                       style="pointer-events: auto; z-index: 1000;"
                                       onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                                       onloadedmetadata="console.log('Video loaded:', this.videoWidth, 'x', this.videoHeight); this.style.pointerEvents='auto';">
                                    <source src="media/\${slide.videoUrl.includes('/uploads/') ? slide.videoUrl.split('/uploads/')[1] : slide.videoUrl.replace('/uploads/', '')}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                                <div class="video-error" style="display: none; color: #ff6b6b; text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎥</div>
                                    <div>Video not available</div>
                                    <div style="font-size: 0.9rem; margin-top: 0.5rem;">media/\${slide.videoUrl.includes('/uploads/') ? slide.videoUrl.split('/uploads/')[1] : slide.videoUrl.replace('/uploads/', '')}</div>
                                </div>
                            </div>
                        \` : ''}
                        \${slide.content ? \`<div class="slide-content">\${slide.content}</div>\` : ''}
                    \`;
                    break;
                    
                case 'contact':
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        <div class="contact-info">
                            \${slide.email ? \`
                                <div class="contact-item">
                                    <span>📧</span>
                                    <span>\${slide.email}</span>
                                </div>
                            \` : ''}
                            \${slide.phone ? \`
                                <div class="contact-item">
                                    <span>📞</span>
                                    <span>\${slide.phone}</span>
                                </div>
                            \` : ''}
                            \${slide.website ? \`
                                <div class="contact-item">
                                    <span>🌐</span>
                                    <span>\${slide.website}</span>
                                </div>
                            \` : ''}
                        </div>
                    \`;
                    break;
                    
                case 'multi-media':
                    const mediaItemsHTML = slide.mediaItems ? slide.mediaItems.map(item => {
                        const mediaUrl = item.url.includes('/uploads/') ? 
                            \`media/\${item.url.split('/uploads/')[1]}\` : 
                            \`media/\${item.url.replace('/uploads/', '')}\`;
                        
                        if (item.type === 'image') {
                            return \`
                                <div class="media-item" style="position: absolute; left: \${item.position.x}%; top: \${item.position.y}%; width: \${item.position.width}%; height: \${item.position.height}%;">
                                    <img src="\${mediaUrl}" alt="\${item.caption || 'Media item'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                    \${item.caption ? \`<div class="media-caption">\${item.caption}</div>\` : ''}
                                </div>
                            \`;
                        } else if (item.type === 'video') {
                            return \`
                                <div class="media-item" style="position: absolute; left: \${item.position.x}%; top: \${item.position.y}%; width: \${item.position.width}%; height: \${item.position.height}%;">
                                    <video controls style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                        <source src="\${mediaUrl}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                    \${item.caption ? \`<div class="media-caption">\${item.caption}</div>\` : ''}
                                </div>
                            \`;
                        }
                        return '';
                    }).join('') : '';
                    
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        <div class="slide-content">\${slide.content || ''}</div>
                        <div class="multi-media-container" style="position: relative; width: 100%; height: 60%; margin-top: 2rem;">
                            \${mediaItemsHTML}
                        </div>
                    \`;
                    break;
                    
                default:
                    slideContent = \`
                        <h2 class="slide-title">\${slide.title || ''}</h2>
                        <div class="slide-content">\${slide.content || ''}</div>
                    \`;
            }
            
            slideElement.innerHTML = slideContent;
            container.appendChild(slideElement);
             
                           // Add video event listeners after the element is in the DOM
              if (slide.type === 'video' && slide.videoUrl) {
                  const video = slideElement.querySelector('video');
                  if (video) {
                      // Ensure video controls are accessible
                      video.addEventListener('loadedmetadata', () => {
                          console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
                          video.style.pointerEvents = 'auto';
                      });
                      
                      video.addEventListener('play', () => {
                          console.log('Video started playing');
                      });
                      
                      video.addEventListener('pause', () => {
                          console.log('Video paused');
                      });
                      
                      video.addEventListener('error', (e) => {
                          console.error('Video error:', e);
                      });
                      
                      // Force enable controls
                      video.controls = true;
                      video.style.pointerEvents = 'auto';
                      
                      // Add click handler to ensure controls work
                      video.addEventListener('click', (e) => {
                          e.stopPropagation();
                          console.log('Video clicked');
                      });
                      
                      // Prevent any parent elements from interfering
                      video.addEventListener('mousedown', (e) => {
                          e.stopPropagation();
                      });
                      
                      video.addEventListener('touchstart', (e) => {
                          e.stopPropagation();
                      });
                  }
              }
        });
    }
    
    setupControls() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const playBtn = document.getElementById('play-btn');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        playBtn.addEventListener('click', () => this.toggleAutoplay());
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
             // Don't interfere with video controls when video is focused
             const activeVideo = document.querySelector('video:focus');
             if (activeVideo) {
                 return;
             }
             
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Escape':
                    this.exitFullscreen();
                    break;
            }
        });
    }
    
    setupTouchControls() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
             // Don't interfere with video controls
             if (e.target.closest('video') || e.target.closest('.video-container')) {
                 return;
             }
             
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
             // Don't interfere with video controls
             if (e.target.closest('video') || e.target.closest('.video-container')) {
                 startX = 0;
                 startY = 0;
                 return;
             }
             
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    showSlide(index) {
        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        const currentSlideElement = document.getElementById(\`slide-\${index}\`);
        if (currentSlideElement) {
            currentSlideElement.classList.add('active');
        }
        
        this.currentSlide = index;
        this.updateIndicators();
    }
    
    nextSlide() {
        if (this.currentSlide < this.data.slides.length - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }
    
    toggleAutoplay() {
        const playBtn = document.getElementById('play-btn');
        
        if (this.isPlaying) {
            this.stopAutoplay();
            playBtn.textContent = '▶';
        } else {
            this.startAutoplay();
            playBtn.textContent = '⏸';
        }
    }
    
    startAutoplay() {
        this.isPlaying = true;
        this.autoplayInterval = setInterval(() => {
            if (this.currentSlide < this.data.slides.length - 1) {
                this.nextSlide();
            } else {
                this.stopAutoplay();
            }
        }, this.autoplayDuration);
    }
    
    stopAutoplay() {
        this.isPlaying = false;
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    updateIndicators() {
        const indicator = document.getElementById('slide-indicator');
        indicator.innerHTML = '';
        
        this.data.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = \`indicator-dot \${index === this.currentSlide ? 'active' : ''}\`;
            dot.addEventListener('click', () => this.showSlide(index));
            indicator.appendChild(dot);
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for presentation data...');
    if (window.presentationData) {
        console.log('Presentation data found:', window.presentationData);
        new Presentation(window.presentationData);
    } else {
        console.error('No presentation data found!');
    }
});
`;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Server error:', error);
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 