import React, { memo } from 'react';
import { FaImage, FaVideo, FaUser, FaFileAlt } from 'react-icons/fa';
import styles from './SlidePreview.module.css';

const SlidePreview = ({ slide, isActive = false, slideNumber, isIPadPreview = false }) => {
  // DEBUG: File edited at ${new Date().toISOString()}
  // Debug logging for iPad preview
  if (isIPadPreview) {
    console.log('iPad Preview - Slide data:', slide);
    console.log('iPad Preview - Slide type:', slide?.type);
    console.log('iPad Preview - Slide title:', slide?.title);
    console.log('iPad Preview - Slide content:', slide?.content);
  }

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
    // Debug: If no slide data, show a placeholder
    if (!slide || !slide.type) {
      console.log('No slide data provided, showing placeholder');
      return (
        <div className={`${styles.slideContent} ${styles.contentSlide}`}>
          <h2 className={styles.slideTitle}>No Slide Data</h2>
          <div className={styles.slideBody}>Slide data is missing or empty</div>
        </div>
      );
    }

    switch (slide.type) {
      case 'title':
        return (
          <div className={`${styles.slideContent} ${styles.titleSlide}`}>
            <h1 className={styles.slideTitle}>{slide.title || 'Title'}</h1>
            <div className={styles.slideSubtitle}>{slide.subtitle || 'Subtitle'}</div>
            {slide.content && <div className={styles.slideBody}>{slide.content}</div>}
            
          </div>
        );

      case 'image':
        return (
          <div className={`${styles.slideContent} ${styles.imageSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Image Slide'}</h2>
            {slide.imageUrl ? (
              <div className={styles.slideMedia}>
                <img src={slide.imageUrl} alt={slide.title} />
              </div>
            ) : (
              <div className={styles.mediaPlaceholder}>
                <FaImage />
                <span>No image selected</span>
              </div>
            )}
            {slide.content && <div className={styles.slideBody}>{slide.content}</div>}
          </div>
        );

      case 'video':
        return (
          <div className={`${styles.slideContent} ${styles.videoSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Video Slide'}</h2>
            {slide.videoUrl ? (
              <div className={styles.slideMedia}>
                <video controls>
                  <source src={slide.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className={styles.mediaPlaceholder}>
                <FaVideo />
                <span>No video selected</span>
              </div>
            )}
            {slide.content && <div className={styles.slideBody}>{slide.content}</div>}
          </div>
        );

      case 'contact':
        return (
          <div className={`${styles.slideContent} ${styles.contactSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Contact'}</h2>
            <div className={styles.contactInfo}>
              {slide.email && (
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📧</span>
                  <span className={styles.contactValue}>{slide.email}</span>
                </div>
              )}
              {slide.phone && (
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <span className={styles.contactValue}>{slide.phone}</span>
                </div>
              )}
              {slide.website && (
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>🌐</span>
                  <span className={styles.contactValue}>{slide.website}</span>
                </div>
              )}
            </div>
            {slide.content && <div className={styles.slideBody}>{slide.content}</div>}
          </div>
        );

      case 'multi-media':
        return (
          <div className={`${styles.slideContent} ${styles.multiMediaSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Multi-Media Slide'}</h2>
            {slide.content && <div className={styles.slideBody}>{slide.content}</div>}
            <div className={styles.multiMediaContainer}>
              {slide.mediaItems && slide.mediaItems.map((item, index) => (
                <div 
                  key={item.id || index}
                  className={styles.mediaItem}
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
                    <div className={styles.mediaPlaceholder}>
                      {item.type === 'image' ? <FaImage /> : <FaVideo />}
                      <span>No {item.type} selected</span>
                    </div>
                  )}
                  {item.caption && <div className={styles.mediaCaption}>{item.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        );

                                                                                                                                             case 'custom-layout':
        return (
          <div className={`${styles.slideContent} ${styles.slideContentCustomLayoutSlide}`} style={{ 
            height: '100%',
            width: '100%',
            position: 'relative',
            padding: '0',
            margin: '0',
            overflow: 'visible'
          }}>
            <div className={styles.customLayoutContainer} style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              padding: '0',
              margin: '0',
              overflow: 'visible'
            }}>
                                 
                 
                 {!slide.layoutSlots || slide.layoutSlots.length === 0 ? (
                   <div style={{ 
                     position: 'absolute', 
                     top: '50%', 
                     left: '50%', 
                     transform: 'translate(-50%, -50%)',
                     color: '#999',
                     fontSize: '1rem',
                     textAlign: 'center'
                   }}>
                     No layout slots found
                   </div>
                 ) : (
                                     slide.layoutSlots.map((slot, index) => {
                                                                 // Custom layouts use pixel coordinates relative to 800x600 design canvas
                const designCanvasWidth = 800;  // Design canvas width
                const designCanvasHeight = 600; // Design canvas height
                
                // Use consistent scaling for both preview modes
                // The design canvas is 800x600, so we'll scale proportionally
                const scaleFactor = isIPadPreview ? 1.5 : 0.5; // iPad preview is 1.5x larger, regular is 0.5x smaller
                
                let x = slot.position?.x || 0;
                let y = slot.position?.y || 0;
                let width = slot.size?.width || 30;
                let height = slot.size?.height || 30;
                
                // Scale the coordinates and sizes based on the preview mode
                x = x * scaleFactor;
                y = y * scaleFactor;
                width = width * scaleFactor;
                height = height * scaleFactor;
                
                // Convert to percentages for CSS positioning
                // Use the design canvas as the reference for percentage calculation
                x = (x / (designCanvasWidth * scaleFactor)) * 100;
                y = (y / (designCanvasHeight * scaleFactor)) * 100;
                width = (width / (designCanvasWidth * scaleFactor)) * 100;
                height = (height / (designCanvasHeight * scaleFactor)) * 100;
                
                // Debug logging for positioning
                console.log(`Slot ${slot.id || index}: Original (${slot.position?.x}, ${slot.position?.y}) -> Scaled (${x.toFixed(2)}%, ${y.toFixed(2)}%)`);
                  
                  
                
                
                                                     return (
                    <div 
                      key={slot.id || index}
                      className={styles.layoutSlot}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        border: '1px solid #ddd',
                        padding: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        overflow: 'hidden',
                        zIndex: 10,
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
                      <div className={styles.slotText} style={{ fontSize: '0.9rem', lineHeight: '1.2', padding: '4px' }}>
                        {slot.content}
                      </div>
                    ) : (
                      <div className={styles.slotPlaceholder} style={{ 
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
             })
               )}
            </div>
          </div>
        );

                                 default:
        return (
          <div className={`${styles.slideContent} ${styles.contentSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Content Slide'}</h2>
            <div className={styles.slideBody}>{slide.content || 'Add your content here'}</div>
            
          </div>
        );
    }
  };

  return (
    <div className={`${styles.slidePreview} ${isActive ? styles.slidePreviewActive : ''} ${isIPadPreview ? styles.slidePreviewIpadPreview : ''}`}>
      {!isIPadPreview && (
        <div className={styles.slideHeader}>
          <div className={styles.slideType}>
            {getSlideTypeIcon(slide.type)}
            <span>{slide.type || 'content'}</span>
          </div>
          <div className={styles.slideNumber}>#{slideNumber || slide.id}</div>
        </div>
      )}
      
      <div className={styles.slideDisplay}>
        {renderSlideContent()}
      </div>
    </div>
  );
};

export default memo(SlidePreview); 