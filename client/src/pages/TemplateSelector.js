import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaEye, FaBusinessTime, FaRocket, FaVideo } from 'react-icons/fa';
import axios from 'axios';
import './TemplateSelector.css';

const TemplateSelector = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/templates');
      setTemplates(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load templates');
      setLoading(false);
    }
  };

  const getTemplateIcon = (templateId) => {
    switch (templateId) {
      case 'business-pitch':
        return <FaBusinessTime />;
      case 'product-demo':
        return <FaVideo />;
      case 'startup-pitch':
        return <FaRocket />;
      default:
        return <FaPlay />;
    }
  };

  if (loading) {
    return (
      <div className="template-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-selector error">
        <p>{error}</p>
        <button onClick={fetchTemplates} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="template-selector">
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Choose Your Template</h1>
          <p>Select a professional template to start building your presentation</p>
        </motion.div>

        <div className="templates-grid">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              className="template-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="template-icon">
                {getTemplateIcon(template.id)}
              </div>
              
              <div className="template-content">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                
                <div className="template-stats">
                  <span>{template.slides.length} slides</span>
                  <span>•</span>
                  <span>Professional</span>
                </div>
              </div>

              <div className="template-actions">
                <Link 
                  to={`/builder/${template.id}`}
                  className="btn btn-primary"
                >
                  <FaPlay /> Use Template
                </Link>
                
                <button className="btn btn-secondary">
                  <FaEye /> Preview
                </button>
              </div>

              <div className="template-preview">
                <div className="slide-thumbnails">
                  {template.slides.slice(0, 3).map((slide, slideIndex) => (
                    <div key={slideIndex} className="slide-thumbnail">
                      <div className="slide-type">{slide.type}</div>
                      <div className="slide-title">{slide.title}</div>
                    </div>
                  ))}
                  {template.slides.length > 3 && (
                    <div className="slide-thumbnail more">
                      +{template.slides.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="custom-template"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3>Don't see what you need?</h3>
          <p>Create a custom presentation from scratch</p>
          <Link to="/builder/custom" className="btn btn-secondary">
            Start from Scratch
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateSelector; 