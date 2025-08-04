import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaDownload, FaTablet, FaPalette, FaVideo, FaImage, FaFolder } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FaPalette />,
      title: 'Beautiful Templates',
      description: 'Choose from professionally designed templates for any presentation type'
    },
    {
      icon: <FaImage />,
      title: 'Rich Media Support',
      description: 'Add images, videos, and interactive content to your slides'
    },
    {
      icon: <FaTablet />,
      title: 'iPad Ready',
      description: 'Create presentations that work perfectly on iPad, even offline'
    },
    {
      icon: <FaDownload />,
      title: 'Standalone Export',
      description: 'Download complete presentations that run without internet'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <div className="hero-logo">
            <img src="/logo.svg" alt="PitchPerfect Logo" className="hero-logo-image" />
          </div>
          <h1>Create Amazing Presentations</h1>
          <p>Build professional presentations with rich media that work perfectly on iPad and run offline</p>
          <div className="hero-buttons">
            <Link to="/templates" className="btn btn-primary">
              <FaPlay /> Start Creating
            </Link>
            <Link to="/saved" className="btn btn-secondary">
              <FaFolder /> My Presentations
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="presentation-preview">
            <div className="slide-preview slide-1">
              <h3>Your Title Here</h3>
              <p>Professional presentation content</p>
            </div>
            <div className="slide-preview slide-2">
              <h3>Key Points</h3>
              <ul>
                <li>Point 1</li>
                <li>Point 2</li>
                <li>Point 3</li>
              </ul>
            </div>
            <div className="slide-preview slide-3">
              <h3>Media Content</h3>
              <div className="media-placeholder">
                <FaVideo />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose PitchPerfect?
          </motion.h2>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2>Ready to Create Your Presentation?</h2>
          <p>Choose a template and start building your professional presentation today</p>
          <Link to="/templates" className="btn btn-primary btn-large">
            <FaPalette /> Browse Templates
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home; 