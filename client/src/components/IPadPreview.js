import React from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlay, FaPause } from 'react-icons/fa';
import SlidePreview from './SlidePreview';
import fontManager from '../utils/fontManager';

const IPadPreview = ({ presentation, isOpen, onClose, currentSlideIndex = 0, onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = React.useState(currentSlideIndex);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [autoplayInterval, setAutoplayInterval] = React.useState(null);

  React.useEffect(() => {
    setCurrentSlide(currentSlideIndex);
  }, [currentSlideIndex]);

  // Load custom fonts when preview is opened
  React.useEffect(() => {
    if (isOpen) {
      // Ensure custom fonts are loaded
      const customFonts = fontManager.customFonts;
      customFonts.forEach(font => {
        if (font.base64 && !document.fonts.check(`12px "${font.value}"`)) {
          const fontFace = new FontFace(font.value, `url(${font.base64})`);
          fontFace.load().then(() => {
            document.fonts.add(fontFace);
            console.log(`Custom font loaded: ${font.value}`);
          }).catch(error => {
            console.error('Error loading custom font:', error);
          });
        }
      });
    }
  }, [isOpen]);

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '50px',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        {/* iPad Frame */}
        <div style={{
          width: '800px',
          height: '600px',
          background: '#1a1a1a',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 0 0 2px #333, 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px #444',
          position: 'relative'
        }}>
          {/* iPad Screen */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'white',
            borderRadius: '12px',
            overflow: 'visible',
            position: 'relative'
          }}>
            {/* Presentation Content */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'block',
              background: 'white',
              position: 'relative',
              overflow: 'visible'
            }}>
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button 
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              <FaChevronLeft />
            </button>
            
            <button 
              style={{
                background: 'rgba(102, 126, 234, 0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <button 
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onClick={handleNext}
              disabled={currentSlide === presentation.slides.length - 1}
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '500',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            {currentSlide + 1} / {presentation.slides.length}
          </div>
        </div>

        {/* Close Button */}
        <button style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
          <FaTimes />
        </button>

        {/* Instructions */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.75rem 1.5rem',
          borderRadius: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <p>Use arrow keys to navigate • Space to play/pause • Esc to close</p>
        </div>
      </div>
    </div>
  );
};

export default IPadPreview; 