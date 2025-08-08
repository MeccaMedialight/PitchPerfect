import React, { memo } from 'react';
import { FaImage, FaVideo, FaUser, FaFileAlt } from 'react-icons/fa';
import styles from './SlidePreview.module.css';

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
            {slide.content && (
              <div 
                className={styles.slideBody}
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
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
            {slide.content && (
              <div 
                className={styles.slideBody}
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
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
            {slide.content && (
              <div 
                className={styles.slideBody}
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
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
            {slide.content && (
              <div 
                className={styles.slideBody}
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
          </div>
        );

      case 'multi-media':
        return (
          <div className={`${styles.slideContent} ${styles.multiMediaSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Multi-Media Slide'}</h2>
            {slide.content && (
              <div 
                className={styles.slideBody}
                dangerouslySetInnerHTML={{ __html: slide.content }}
              />
            )}
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
        // Ensure we have layout slots
        const layoutSlots = slide.layoutSlots || [];
        
        return (
          <div style={{ 
            height: '100%',
            width: '100%',
            position: isIPadPreview ? 'absolute' : 'relative',
            top: isIPadPreview ? '0' : 'auto',
            left: isIPadPreview ? '0' : 'auto',
            padding: '0',
            margin: '0',
            overflow: 'visible',
            backgroundColor: isIPadPreview ? 'transparent' : 'rgba(240, 240, 240, 0.3)',
            border: 'none',
            zIndex: isIPadPreview ? 1000 : 'auto'
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              padding: '0',
              margin: '0',
              overflow: 'visible',
              backgroundColor: 'transparent',
              border: 'none',
              zIndex: isIPadPreview ? 1001 : 'auto'
            }}>
              {!layoutSlots || layoutSlots.length === 0 ? (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  color: '#999',
                  fontSize: '1rem',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #007bff'
                }}>
                  No layout slots found
                  <br />
                  <small>Slide type: {slide.type}</small>
                  <br />
                  <small>Slots count: {layoutSlots.length}</small>
                </div>
              ) : (
                <>
                  {layoutSlots.map((slot, index) => {
                    // Custom layouts use pixel coordinates relative to 800x600 design canvas
                    const designCanvasWidth = 800;  // Design canvas width
                    const designCanvasHeight = 600; // Design canvas height
                    
                    let x = slot.position?.x || 0;
                    let y = slot.position?.y || 0;
                    let width = slot.size?.width || 30;
                    let height = slot.size?.height || 30;
                    
                    // Convert pixel coordinates to percentages based on the design canvas
                    // This ensures consistent positioning across different preview modes
                    x = (x / designCanvasWidth) * 100;
                    y = (y / designCanvasHeight) * 100;
                    width = (width / designCanvasWidth) * 100;
                    height = (height / designCanvasHeight) * 100;
                    
                    return (
                      <div 
                        key={slot.id || index}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                          border: isIPadPreview ? 'none' : '1px solid #007bff',
                          padding: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          overflow: 'visible',
                          zIndex: isIPadPreview ? 1002 : 10,
                          borderRadius: '4px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                          minWidth: '80px',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {slot.type === 'image' && slot.content ? (
                          <img 
                            src={slot.content} 
                            alt="Slot content" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: slot.objectFit || 'cover',
                              borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                              border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
                              boxShadow: slot.boxShadow === 'small' ? '0 2px 4px rgba(0,0,0,0.1)' :
                                        slot.boxShadow === 'medium' ? '0 4px 8px rgba(0,0,0,0.15)' :
                                        slot.boxShadow === 'large' ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
                              display: 'block',
                              zIndex: 2,
                              position: 'relative'
                            }} 
                          />
                        ) : slot.type === 'video' && slot.content ? (
                          <video 
                            controls 
                            style={{ 
                              width: '100%', 
                              height: '100%',
                              display: 'block',
                              zIndex: 2,
                              position: 'relative'
                            }}
                          >
                            <source src={slot.content} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : slot.type === 'text' && slot.content ? (
                          <div 
                            style={{ 
                              fontSize: '1rem', 
                              lineHeight: '1.2', 
                              padding: '4px',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              color: '#000',
                              backgroundColor: slot.backgroundColor || 'transparent',
                              borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                              border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
                              boxShadow: slot.boxShadow === 'small' ? '0 2px 4px rgba(0,0,0,0.1)' :
                                        slot.boxShadow === 'medium' ? '0 4px 8px rgba(0,0,0,0.15)' :
                                        slot.boxShadow === 'large' ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
                              zIndex: 2,
                              position: 'relative',
                              overflow: 'hidden',
                              fontFamily: slot.fontFamily || 'inherit'
                            }}
                            dangerouslySetInnerHTML={{ __html: slot.content || '' }}
                          />
                        ) : (
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              height: '100%',
                              width: '100%',
                              fontSize: '0.9rem',
                              color: '#999',
                              backgroundColor: 'rgba(0, 123, 255, 0.1)',
                              textAlign: 'center',
                              zIndex: 2,
                              position: 'relative'
                            }}
                          >
                            {slot.type} slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
               )}
            </div>
          </div>
        );

      default:
        return (
          <div className={`${styles.slideContent} ${styles.contentSlide}`}>
            <h2 className={styles.slideTitle}>{slide.title || 'Content Slide'}</h2>
            <div 
              className={styles.slideBody}
              dangerouslySetInnerHTML={{ __html: slide.content || 'Add your content here' }}
            />
          </div>
        );
    }
  };

  return (
    <div style={isIPadPreview ? {
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'visible',
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '0',
      boxShadow: 'none',
      margin: '0',
      padding: '0'
    } : {
      // Use CSS classes for regular preview mode
    }} className={isIPadPreview ? '' : `${styles.slidePreview} ${isActive ? styles.slidePreviewActive : ''} ${isIPadPreview ? styles.slidePreviewIpadPreview : ''}`}>
      {!isIPadPreview && (
        <div className={styles.slideHeader}>
          <div className={styles.slideType}>
            {getSlideTypeIcon(slide.type)}
            <span>{slide.type || 'content'}</span>
          </div>
          <div className={styles.slideNumber}>#{slideNumber || slide.id}</div>
        </div>
      )}
      
      <div style={isIPadPreview ? {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: 'white',
        border: 'none',
        margin: '0',
        padding: '0',
        maxWidth: 'none',
        maxHeight: 'none',
        aspectRatio: 'auto'
      } : {
        // Use CSS classes for regular preview mode
      }} className={isIPadPreview ? '' : styles.slideDisplay}>
        {renderSlideContent()}
      </div>
    </div>
  );
};

export default memo(SlidePreview); 