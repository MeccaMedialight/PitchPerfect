import React, { memo } from 'react';
import { FaImage, FaVideo, FaUser, FaFileAlt } from 'react-icons/fa';
import './SlidePreview.css';

const SlidePreview = ({ slide, isActive = false, slideNumber, isIPadPreview = false }) => {
  const getSlideTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'contact':
        return <FaUser />;
      case 'multi-media':
        return <FaImage />;
      default:
        return <FaFileAlt />;
    }
  };

  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="slide-content title-slide">
            <h1 className="slide-title">{slide.title || 'Title'}</h1>
            <div className="slide-subtitle">{slide.subtitle || 'Subtitle'}</div>
            {slide.content && <div className="slide-body">{slide.content}</div>}
            
          </div>
        );

      case 'image':
        return (
          <div className="slide-content image-slide">
            <h2 className="slide-title">{slide.title || 'Image Slide'}</h2>
            {slide.imageUrl ? (
              <div className="slide-media">
                <img src={slide.imageUrl} alt={slide.title} />
              </div>
            ) : (
              <div className="media-placeholder">
                <FaImage />
                <span>No image selected</span>
              </div>
            )}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'video':
        return (
          <div className="slide-content video-slide">
            <h2 className="slide-title">{slide.title || 'Video Slide'}</h2>
            {slide.videoUrl ? (
              <div className="slide-media">
                <video controls>
                  <source src={slide.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="media-placeholder">
                <FaVideo />
                <span>No video selected</span>
              </div>
            )}
            {slide.content && <div className="slide-body">{slide.content}</div>}
          </div>
        );

      case 'contact':
        return (
          <div className="slide-content contact-slide">
            <h2 className="slide-title">{slide.title || 'Contact'}</h2>
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
            {slide.content && <div className="slide-body">{slide.content}</div>}
            <div className="multi-media-container">
              {slide.mediaItems && slide.mediaItems.map((item, index) => (
                <div 
                  key={item.id || index}
                  className="media-item"
                  style={{
                    position: 'absolute',
                    left: `${item.position?.x || 0}%`,
                    top: `${item.position?.y || 0}%`,
                    width: `${item.position?.width || 30}%`,
                    height: `${item.position?.height || 30}%`
                  }}
                >
                  {item.type === 'image' && item.url ? (
                    <img src={item.url} alt={item.caption || 'Media item'} />
                  ) : item.type === 'video' && item.url ? (
                    <video controls>
                      <source src={item.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="media-placeholder">
                      {item.type === 'image' ? <FaImage /> : <FaVideo />}
                      <span>No {item.type} selected</span>
                    </div>
                  )}
                  {item.caption && <div className="media-caption">{item.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        );

             case 'custom-layout':
         return (
           <div className="slide-content custom-layout-slide">
             <div className="custom-layout-container">
                             {slide.layoutSlots && slide.layoutSlots.map((slot, index) => {
                                                                 // Convert pixel values to percentages if needed
                // Use container dimensions that match this preview (400x300)
                const containerWidth = 400; // Match this preview width
                const containerHeight = 300; // Match this preview height
                 
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
                    key={slot.id || index}
                    className="layout-slot"
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      border: '1px solid #ccc',
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      overflow: 'hidden'
                    }}
                  >
                                     {slot.type === 'image' && slot.content ? (
                     <img src={slot.content} alt="Slot content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : slot.type === 'video' && slot.content ? (
                     <video controls style={{ width: '100%', height: '100%' }}>
                       <source src={slot.content} type="video/mp4" />
                       Your browser does not support the video tag.
                     </video>
                   ) : slot.type === 'text' && slot.content ? (
                     <div className="slot-text" style={{ fontSize: '0.9rem', lineHeight: '1.2', padding: '4px' }}>
                       {slot.content}
                     </div>
                   ) : (
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
            <h2 className="slide-title">{slide.title || 'Content Slide'}</h2>
            <div className="slide-body">{slide.content || 'Add your content here'}</div>
          </div>
        );
    }
  };

  return (
    <div className={`slide-preview ${isActive ? 'active' : ''} ${isIPadPreview ? 'ipad-preview' : ''}`}>
      {!isIPadPreview && (
        <div className="slide-header">
          <div className="slide-type">
            {getSlideTypeIcon(slide.type)}
            <span>{slide.type || 'content'}</span>
          </div>
          <div className="slide-number">#{slideNumber || slide.id}</div>
        </div>
      )}
      
      <div className="slide-display">
        {renderSlideContent()}
      </div>
    </div>
  );
};

export default memo(SlidePreview); 