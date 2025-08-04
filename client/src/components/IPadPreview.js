import React from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlay, FaPause } from 'react-icons/fa';
import SlidePreview from './SlidePreview';
import './IPadPreview.css';

const IPadPreview = ({ presentation, isOpen, onClose, currentSlideIndex = 0, onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = React.useState(currentSlideIndex);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [autoplayInterval, setAutoplayInterval] = React.useState(null);

  React.useEffect(() => {
    setCurrentSlide(currentSlideIndex);
  }, [currentSlideIndex]);

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => {
          const next = prev + 1;
          if (next >= presentation.slides.length) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 3000); // 3 seconds per slide
      setAutoplayInterval(interval);
    } else {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        setAutoplayInterval(null);
      }
    }

    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    };
  }, [isPlaying, presentation.slides.length]);

  const handlePrevious = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(presentation.slides.length - 1, prev + 1));
  };

  const handleKeyPress = (e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case ' ':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const currentSlideData = presentation.slides[currentSlide];

  return (
    <div className="ipad-preview-overlay">
      <div className="ipad-preview-container">
        {/* iPad Frame */}
        <div className="ipad-frame">
          {/* iPad Screen */}
          <div className="ipad-screen">
            {/* Presentation Content */}
            <div className="presentation-viewport">
              <SlidePreview
                slide={currentSlideData}
                isActive={true}
                slideNumber={currentSlide + 1}
                isIPadPreview={true}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="ipad-controls">
          <div className="control-group">
            <button 
              className="control-btn"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              <FaChevronLeft />
            </button>
            
            <button 
              className="control-btn play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <button 
              className="control-btn"
              onClick={handleNext}
              disabled={currentSlide === presentation.slides.length - 1}
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div className="slide-indicator">
            {currentSlide + 1} / {presentation.slides.length}
          </div>
        </div>

        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Instructions */}
        <div className="preview-instructions">
          <p>Use arrow keys to navigate • Space to play/pause • Esc to close</p>
        </div>
      </div>
    </div>
  );
};

export default IPadPreview; 