import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaExpand, FaCompress } from 'react-icons/fa';
import axios from 'axios';
import './PresentationViewer.css';

const PresentationViewer = () => {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPresentation();
  }, [presentationId]);

  useEffect(() => {
    let interval;
    if (isPlaying && presentation) {
      interval = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev < presentation.slides.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, presentation]);

  const loadPresentation = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/presentations/${presentationId}`);
      setPresentation(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading presentation:', error);
      setError('Presentation not found');
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousSlide();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  if (loading) {
    return (
      <div className="presentation-viewer loading">
        <div className="loading-spinner"></div>
        <p>Loading presentation...</p>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="presentation-viewer error">
        <h2>Error</h2>
        <p>{error || 'Presentation not found'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  const currentSlideData = presentation.slides[currentSlide];

  return (
    <div className="presentation-viewer">
      {/* Header */}
      <div className="viewer-header">
        <div className="presentation-info">
          <h1>{presentation.title}</h1>
          <span>Slide {currentSlide + 1} of {presentation.slides.length}</span>
        </div>
        
        <div className="viewer-controls">
          <button className="control-btn" onClick={previousSlide} disabled={currentSlide === 0}>
            <FaChevronLeft />
          </button>
          
          <button className="control-btn play-btn" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button className="control-btn" onClick={nextSlide} disabled={currentSlide === presentation.slides.length - 1}>
            <FaChevronRight />
          </button>
          
          <button className="control-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="viewer-content">
        <motion.div
          key={currentSlide}
          className="slide-container"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <SlideDisplay slide={currentSlideData} />
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="slide-indicators">
        {presentation.slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentSlide + 1) / presentation.slides.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

// Slide Display Component
const SlideDisplay = ({ slide }) => {
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="slide-content title-slide">
            <h1 className="slide-title">{slide.title}</h1>
            {slide.subtitle && <div className="slide-subtitle">{slide.subtitle}</div>}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'image':
        return (
          <div className="slide-content image-slide">
            <h2 className="slide-title">{slide.title}</h2>
            {slide.imageUrl && (
              <div className="slide-media">
                <img src={slide.imageUrl} alt={slide.title} />
              </div>
            )}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'video':
        return (
          <div className="slide-content video-slide">
            <h2 className="slide-title">{slide.title}</h2>
            {slide.videoUrl && (
              <div className="slide-media">
                <video controls>
                  <source src={slide.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'contact':
        return (
          <div className="slide-content contact-slide">
            <h2 className="slide-title">{slide.title}</h2>
            <div className="contact-info">
              {slide.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span className="contact-value">{slide.email}</span>
                </div>
              )}
              {slide.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span className="contact-value">{slide.phone}</span>
                </div>
              )}
              {slide.website && (
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <span className="contact-value">{slide.website}</span>
                </div>
              )}
            </div>
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'multi-media':
        return (
          <div className="slide-content multi-media-slide">
            <h2 className="slide-title">{slide.title || 'Multi-Media Slide'}</h2>
            {slide.mediaItems && slide.mediaItems.length > 0 && (
              <div className="multi-media-container">
                {slide.mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="media-item"
                    style={{
                      position: 'absolute',
                      left: `${item.position.x}%`,
                      top: `${item.position.y}%`,
                      width: `${item.position.width}%`,
                      height: `${item.position.height}%`,
                      zIndex: index + 1
                    }}
                  >
                    {item.type === 'image' && item.url && (
                      <img src={item.url} alt={item.caption || 'Media item'} />
                    )}
                    {item.type === 'video' && item.url && (
                      <video controls>
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {item.caption && (
                      <div className="media-caption">{item.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'custom-layout':
        return (
          <div className="slide-content custom-layout-slide">
            <div className="custom-layout-container">
              {slide.layoutSlots && slide.layoutSlots.map((slot, index) => {
                  // Convert pixel values to percentages if needed
                  // Use the original layout designer dimensions for accurate positioning
                  const containerWidth = 800; // Layout designer width
                  const containerHeight = 600; // Layout designer height
                  
                  let x = slot.position?.x || 0;
                  let y = slot.position?.y || 0;
                  let width = slot.size?.width || 30;
                  let height = slot.size?.height || 30;
                  
                  // If values are in pixels (large numbers), convert to percentages
                  if (width > 100) {
                    width = (width / containerWidth) * 100;
                  }
                  if (height > 100) {
                    height = (height / containerHeight) * 100;
                  }
                  if (x > 100) {
                    x = (x / containerWidth) * 100;
                  }
                  if (y > 100) {
                    y = (y / containerHeight) * 100;
                  }
                  
                  return (
                  <div
                    key={slot.id}
                    className="layout-slot"
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      zIndex: index + 1,
                      border: '1px solid #ccc',
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      overflow: 'hidden'
                    }}
                  >
                    {slot.type === 'image' && slot.content && (
                      <img src={slot.content} alt="Slot content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {slot.type === 'video' && slot.content && (
                      <video controls style={{ width: '100%', height: '100%' }}>
                        <source src={slot.content} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {slot.type === 'text' && slot.content && (
                      <div className="slot-text" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                        {slot.content}
                      </div>
                    )}
                    {(!slot.content || (slot.type !== 'text' && !slot.content)) && (
                      <div className="slot-placeholder" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        fontSize: '0.8rem',
                        color: '#999'
                      }}>
                        {slot.type} slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="slide-content content-slide">
            <h2 className="slide-title">{slide.title}</h2>
            <div className="slide-body">{slide.content}</div>
          </div>
        );
    }
  };

  return (
    <div className="slide-display">
      {renderSlideContent()}
    </div>
  );
};

export default PresentationViewer; 