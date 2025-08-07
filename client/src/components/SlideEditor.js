import React, { useState, memo, useCallback } from 'react';
import { FaImage, FaVideo, FaFileAlt, FaUser, FaEye } from 'react-icons/fa';
import config from '../config/config';
import LayoutPreviewPopup from './LayoutPreviewPopup';
import RichTextEditor from './RichTextEditor';
import './SlideEditor.css';

const SlideEditor = ({ slide, onUpdate, onAddMedia, onImmediateUpdate }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [localSlide, setLocalSlide] = useState(slide);
  const [customLayouts, setCustomLayouts] = useState([]);
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);

  // Update local slide when prop changes
  React.useEffect(() => {
    setLocalSlide(slide);
    console.log('SlideEditor received slide:', slide);
  }, [slide]);

  // Load custom layouts
  React.useEffect(() => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
      setCustomLayouts(savedLayouts);
    } catch (error) {
      console.error('Error loading custom layouts:', error);
    }
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (handleInputChange.timeoutId) {
        clearTimeout(handleInputChange.timeoutId);
      }
    };
  }, []);

  const handleInputChange = useCallback((field, value) => {
    const updatedSlide = { ...localSlide, [field]: value };
    setLocalSlide(updatedSlide);
    
    // Immediately update preview
    if (onImmediateUpdate) {
      onImmediateUpdate(updatedSlide);
    }
    
    // Debounce the update to parent component
    if (handleInputChange.timeoutId) {
      clearTimeout(handleInputChange.timeoutId);
    }
    
    handleInputChange.timeoutId = setTimeout(() => {
      onUpdate(updatedSlide);
    }, 300);
  }, [localSlide, onUpdate, onImmediateUpdate]);

  const handleCustomLayoutSelect = useCallback((layoutId) => {
    const selectedLayout = customLayouts.find(layout => layout.id === layoutId);
    if (selectedLayout) {
      const updatedSlide = {
        ...localSlide,
        type: 'custom-layout',
        layoutId: layoutId,
        layoutSlots: selectedLayout.slots,
        title: localSlide.title || selectedLayout.name
      };
      setLocalSlide(updatedSlide);
      
      if (onImmediateUpdate) {
        onImmediateUpdate(updatedSlide);
      }
      
      onUpdate(updatedSlide);
    }
  }, [localSlide, customLayouts, onUpdate, onImmediateUpdate]);

  const getSlideTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'contact':
        return <FaUser />;
      default:
        return <FaFileAlt />;
    }
  };

     const renderContentEditor = () => (
     <div className="content-editor">
       {localSlide.type !== 'custom-layout' && (
         <>
           <div className="form-group">
             <label>Slide Title</label>
             <input
               type="text"
               value={localSlide.title || ''}
               onChange={(e) => handleInputChange('title', e.target.value)}
               placeholder="Enter slide title"
               className="form-input"
             />
           </div>

           <div className="form-group">
             <label>Content</label>
             <textarea
               value={localSlide.content || ''}
               onChange={(e) => handleInputChange('content', e.target.value)}
               placeholder="Enter slide content"
               className="form-textarea"
               rows={6}
             />
           </div>
         </>
       )}
       
       {localSlide.type === 'custom-layout' && (
         <div className="custom-layout-notice">
           <p><strong>Custom Layout Active:</strong> This slide uses a custom layout. The title and content fields are disabled. Use the Media tab to edit slot content.</p>
         </div>
       )}

       {localSlide.type === 'title' && (
         <div className="form-group">
           <label>Subtitle</label>
           <input
             type="text"
             value={localSlide.subtitle || ''}
             onChange={(e) => handleInputChange('subtitle', e.target.value)}
             placeholder="Enter subtitle"
             className="form-input"
           />
         </div>
       )}

             {localSlide.type === 'contact' && (
         <>
           <div className="form-group">
             <label>Email</label>
             <input
               type="email"
               value={localSlide.email || ''}
               onChange={(e) => handleInputChange('email', e.target.value)}
               placeholder="contact@example.com"
               className="form-input"
             />
           </div>
           <div className="form-group">
             <label>Phone</label>
             <input
               type="tel"
               value={localSlide.phone || ''}
               onChange={(e) => handleInputChange('phone', e.target.value)}
               placeholder="+1-555-0123"
               className="form-input"
             />
           </div>
           <div className="form-group">
             <label>Website</label>
             <input
               type="url"
               value={localSlide.website || ''}
               onChange={(e) => handleInputChange('website', e.target.value)}
               placeholder="https://example.com"
               className="form-input"
             />
           </div>
         </>
       )}
    </div>
  );

  const renderMediaEditor = () => (
    <div className="media-editor">
      {localSlide.imageUrl && (
        <div className="media-preview">
          <img src={localSlide.imageUrl} alt="Slide image" />
          <button
            className="remove-media"
            onClick={() => handleInputChange('imageUrl', '')}
          >
            Remove Image
          </button>
        </div>
      )}
      
      {localSlide.videoUrl && (
        <div className="media-preview">
          <video controls>
            <source src={localSlide.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            className="remove-media"
            onClick={() => handleInputChange('videoUrl', '')}
          >
            Remove Video
          </button>
        </div>
      )}
      
      {!localSlide.imageUrl && !localSlide.videoUrl && (
        <div className="no-media">
          <p>No media added to this slide</p>
          <button 
            className="btn btn-primary"
            onClick={onAddMedia}
          >
            <FaImage /> Add Media
          </button>
        </div>
      )}
    </div>
  );

  const renderCustomLayoutEditor = () => {
    try {
      console.log('renderCustomLayoutEditor called, layoutSlots:', localSlide.layoutSlots);
      
      if (!localSlide.layoutSlots || !Array.isArray(localSlide.layoutSlots)) {
        return (
          <div className="custom-layout-editor">
            <p>Please select a custom layout in the Settings tab first.</p>
          </div>
        );
      }

      console.log('Custom layout slots:', localSlide.layoutSlots);

    const updateSlotContent = (slotId, content) => {
      const updatedSlots = localSlide.layoutSlots.map(slot =>
        slot.id === slotId ? { ...slot, content } : slot
      );
      
      const updatedSlide = {
        ...localSlide,
        layoutSlots: updatedSlots
      };
      
      setLocalSlide(updatedSlide);
      if (onImmediateUpdate) {
        onImmediateUpdate(updatedSlide);
      }
      onUpdate(updatedSlide);
    };

    return (
      <div className="custom-layout-editor">
        <div className="layout-preview">
          <div className="layout-preview-header">
            <h4>Layout Preview</h4>
            <button 
              className="preview-btn"
              onClick={() => setShowLayoutPreview(true)}
            >
              <FaEye /> Full Preview
            </button>
          </div>
          <div className="slide-frame-preview">
                         {localSlide.layoutSlots.map((slot, index) => {
               // Convert pixel values to percentages if needed
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
              
              // Validate and clamp position/size values
              x = Math.max(0, Math.min(100, x));
              y = Math.max(0, Math.min(100, y));
              width = Math.max(5, Math.min(100, width));
              height = Math.max(5, Math.min(100, height));
              
              return (
                <div
                  key={slot.id}
                  className="slot-preview"
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    border: '2px dashed #ccc',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: '#666',
                    zIndex: 1
                  }}
                                 >
                                       {slot.content ? (
                      slot.type === 'image' ? (
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
                                      slot.boxShadow === 'large' ? '0 8px 16px rgba(0,0,0,0.2)' : 'none'
                          }} 
                        />
                      ) : slot.type === 'video' ? (
                        <video 
                          controls 
                          autoPlay={slot.autoplay || false}
                          muted={slot.muted || false}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <source src={slot.content} type="video/mp4" />
                        </video>
                      ) : slot.type === 'text' ? (
                        <div 
                          style={{ 
                            fontSize: '0.7rem', 
                            lineHeight: '1.1', 
                            padding: '2px', 
                            overflow: 'hidden',
                            textAlign: 'left'
                          }}
                          dangerouslySetInnerHTML={{ __html: slot.content }}
                        />
                      ) : (
                        slot.type
                      )
                    ) : (
                      slot.type
                    )}
                 </div>
              );
            })}
          </div>
        </div>

        <div className="slot-editors">
          <h4>Edit Slot Content</h4>
          {localSlide.layoutSlots.map((slot, index) => (
            <div key={slot.id} className="slot-editor">
              <div className="slot-editor-header">
                <label>{slot.type} Slot {index + 1}</label>
                {slot.content && (
                  <button 
                    className="clear-content-btn"
                    onClick={() => updateSlotContent(slot.id, '')}
                    title="Clear content"
                  >
                    Clear
                  </button>
                )}
              </div>
              
                             {slot.type === 'text' ? (
                 <RichTextEditor
                   value={slot.content || ''}
                   onChange={(content) => updateSlotContent(slot.id, content)}
                   placeholder={`Enter ${slot.type} content...`}
                   className="slot-rich-text-editor"
                 />
                             ) : (slot.type === 'image' || slot.type === 'video') ? (
                 <div className="media-input-group">
                   <div className="input-tabs">
                     <button 
                       className={`tab-btn ${!slot.content?.startsWith('http') ? 'active' : ''}`}
                       onClick={() => {
                         const fileInput = document.getElementById(`file-input-${slot.id}`);
                         if (fileInput) fileInput.click();
                       }}
                     >
                       Upload File
                     </button>
                     <button 
                       className={`tab-btn ${slot.content?.startsWith('http') ? 'active' : ''}`}
                       onClick={() => {
                         const urlInput = document.getElementById(`url-input-${slot.id}`);
                         if (urlInput) urlInput.focus();
                       }}
                     >
                       URL
                     </button>
                   </div>
                   
                   <input
                     id={`file-input-${slot.id}`}
                     type="file"
                     accept={slot.type === 'image' ? 'image/*' : 'video/*'}
                     onChange={(e) => {
                       const file = e.target.files[0];
                       if (file) {
                         const formData = new FormData();
                         formData.append('file', file);
                         
                         fetch(config.getApiUrl(config.UPLOAD_ENDPOINT), {
                           method: 'POST',
                           body: formData
                         })
                         .then(response => response.json())
                         .then(data => {
                           if (data.success) {
                             updateSlotContent(slot.id, config.getServerUrl(data.file.url));
                           } else {
                             alert('Upload failed: ' + (data.error || 'Unknown error'));
                           }
                         })
                         .catch(error => {
                           console.error('Upload error:', error);
                           alert('Upload failed: ' + error.message);
                         });
                       }
                     }}
                     style={{ display: 'none' }}
                   />
                   
                   <input
                     id={`url-input-${slot.id}`}
                     type="text"
                     value={slot.content || ''}
                     onChange={(e) => updateSlotContent(slot.id, e.target.value)}
                     placeholder={`Enter ${slot.type} URL...`}
                     className="form-input"
                   />
                   
                   {slot.type === 'video' && slot.content && (
                     <div className="video-options">
                       <div className="option-group">
                         <label className="checkbox-label">
                           <input
                             type="checkbox"
                             checked={slot.autoplay || false}
                             onChange={(e) => {
                               const updatedSlots = localSlide.layoutSlots.map(s =>
                                 s.id === slot.id ? { ...s, autoplay: e.target.checked } : s
                               );
                               const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                               setLocalSlide(updatedSlide);
                               if (onImmediateUpdate) {
                                 onImmediateUpdate(updatedSlide);
                               }
                               onUpdate(updatedSlide);
                             }}
                           />
                           <span>Autoplay</span>
                         </label>
                         <label className="checkbox-label">
                           <input
                             type="checkbox"
                             checked={slot.muted || false}
                             onChange={(e) => {
                               const updatedSlots = localSlide.layoutSlots.map(s =>
                                 s.id === slot.id ? { ...s, muted: e.target.checked } : s
                               );
                               const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                               setLocalSlide(updatedSlide);
                               if (onImmediateUpdate) {
                                 onImmediateUpdate(updatedSlide);
                               }
                               onUpdate(updatedSlide);
                             }}
                           />
                           <span>Muted</span>
                         </label>
                       </div>
                     </div>
                   )}
                   
                   {slot.type === 'image' && slot.content && (
                     <div className="image-options">
                       <h5>Image Styling</h5>
                       <div className="option-group">
                         <label>Border Radius:</label>
                         <input
                           type="range"
                           min="0"
                           max="50"
                           value={slot.borderRadius || 0}
                           onChange={(e) => {
                             const updatedSlots = localSlide.layoutSlots.map(s =>
                               s.id === slot.id ? { ...s, borderRadius: parseInt(e.target.value) } : s
                             );
                             const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                             setLocalSlide(updatedSlide);
                             if (onImmediateUpdate) {
                               onImmediateUpdate(updatedSlide);
                             }
                             onUpdate(updatedSlide);
                           }}
                         />
                         <span>{slot.borderRadius || 0}px</span>
                       </div>
                       
                       <div className="option-group">
                         <label>Object Fit:</label>
                         <select
                           value={slot.objectFit || 'cover'}
                           onChange={(e) => {
                             const updatedSlots = localSlide.layoutSlots.map(s =>
                               s.id === slot.id ? { ...s, objectFit: e.target.value } : s
                             );
                             const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                             setLocalSlide(updatedSlide);
                             if (onImmediateUpdate) {
                               onImmediateUpdate(updatedSlide);
                             }
                             onUpdate(updatedSlide);
                           }}
                         >
                           <option value="cover">Cover</option>
                           <option value="contain">Contain</option>
                           <option value="fill">Fill</option>
                           <option value="scale-down">Scale Down</option>
                         </select>
                       </div>
                       
                       <div className="option-group">
                         <label>Border Width:</label>
                         <input
                           type="range"
                           min="0"
                           max="20"
                           value={slot.borderWidth || 0}
                           onChange={(e) => {
                             const updatedSlots = localSlide.layoutSlots.map(s =>
                               s.id === slot.id ? { ...s, borderWidth: parseInt(e.target.value) } : s
                             );
                             const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                             setLocalSlide(updatedSlide);
                             if (onImmediateUpdate) {
                               onImmediateUpdate(updatedSlide);
                             }
                             onUpdate(updatedSlide);
                           }}
                         />
                         <span>{slot.borderWidth || 0}px</span>
                       </div>
                       
                       <div className="option-group">
                         <label>Border Color:</label>
                         <input
                           type="color"
                           value={slot.borderColor || '#000000'}
                           onChange={(e) => {
                             const updatedSlots = localSlide.layoutSlots.map(s =>
                               s.id === slot.id ? { ...s, borderColor: e.target.value } : s
                             );
                             const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                             setLocalSlide(updatedSlide);
                             if (onImmediateUpdate) {
                               onImmediateUpdate(updatedSlide);
                             }
                             onUpdate(updatedSlide);
                           }}
                         />
                       </div>
                       
                       <div className="option-group">
                         <label>Box Shadow:</label>
                         <select
                           value={slot.boxShadow || 'none'}
                           onChange={(e) => {
                             const updatedSlots = localSlide.layoutSlots.map(s =>
                               s.id === slot.id ? { ...s, boxShadow: e.target.value } : s
                             );
                             const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
                             setLocalSlide(updatedSlide);
                             if (onImmediateUpdate) {
                               onImmediateUpdate(updatedSlide);
                             }
                             onUpdate(updatedSlide);
                           }}
                         >
                           <option value="none">None</option>
                           <option value="small">Small</option>
                           <option value="medium">Medium</option>
                           <option value="large">Large</option>
                         </select>
                       </div>
                     </div>
                   )}
                   
                   {slot.content && (
                     <div className="media-preview">
                       {slot.type === 'image' ? (
                         <img 
                           src={slot.content} 
                           alt="Preview" 
                           style={{ 
                             maxWidth: '100%', 
                             maxHeight: '100px', 
                             objectFit: slot.objectFit || 'cover',
                             borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                             border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
                             boxShadow: slot.boxShadow === 'small' ? '0 2px 4px rgba(0,0,0,0.1)' :
                                       slot.boxShadow === 'medium' ? '0 4px 8px rgba(0,0,0,0.15)' :
                                       slot.boxShadow === 'large' ? '0 8px 16px rgba(0,0,0,0.2)' : 'none'
                           }} 
                         />
                       ) : (
                         <video 
                           controls 
                           autoPlay={slot.autoplay || false}
                           muted={slot.muted || false}
                           style={{ maxWidth: '100%', maxHeight: '100px' }}
                         >
                           <source src={slot.content} type="video/mp4" />
                         </video>
                       )}
                     </div>
                   )}
                 </div>
              ) : (
                <input
                  type="text"
                  value={slot.content || ''}
                  onChange={(e) => updateSlotContent(slot.id, e.target.value)}
                  placeholder={`Enter ${slot.type} URL or path...`}
                  className="form-input"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
    } catch (error) {
      console.error('Error rendering custom layout editor:', error);
      return (
        <div className="custom-layout-editor">
          <p>Error loading custom layout. Please try again.</p>
        </div>
      );
    }
  };

  const renderMultiMediaEditor = () => {
    const mediaItems = localSlide.mediaItems || [];
    
    const addMediaItem = () => {
      // Calculate smart positioning based on number of existing items
      let x, y, width, height;
      
      if (mediaItems.length === 0) {
        // First item - top left
        x = 5;
        y = 15;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 1) {
        // Second item - top right
        x = 50;
        y = 15;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 2) {
        // Third item - bottom center
        x = 27.5;
        y = 55;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 3) {
        // Fourth item - bottom left
        x = 5;
        y = 55;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 4) {
        // Fifth item - bottom right
        x = 50;
        y = 55;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 5) {
        // Sixth item - center top
        x = 27.5;
        y = 15;
        width = 40;
        height = 35;
      } else if (mediaItems.length === 6) {
        // Seventh item - center bottom
        x = 27.5;
        y = 55;
        width = 40;
        height = 35;
      } else {
        // For additional items, use a more sophisticated grid layout
        const itemsPerRow = 3;
        const row = Math.floor(mediaItems.length / itemsPerRow);
        const col = mediaItems.length % itemsPerRow;
        
        // Adjust spacing for 3-column layout
        const itemWidth = 28;
        const itemHeight = 30;
        const marginX = 5;
        const marginY = 15;
        const spacingX = (100 - (itemsPerRow * itemWidth) - ((itemsPerRow - 1) * marginX)) / 2;
        
        x = spacingX + (col * (itemWidth + marginX));
        y = marginY + (row * (itemHeight + 10));
        width = itemWidth;
        height = itemHeight;
      }
      
      const newItem = {
        id: `media-${Date.now()}`,
        type: 'image',
        url: '',
        position: { x, y, width, height },
        caption: ''
      };
      handleInputChange('mediaItems', [...mediaItems, newItem]);
    };

    const updateMediaItem = (index, field, value) => {
      const updatedItems = [...mediaItems];
      if (field === 'position') {
        updatedItems[index] = { ...updatedItems[index], position: { ...updatedItems[index].position, ...value } };
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      handleInputChange('mediaItems', updatedItems);
    };

    const removeMediaItem = (index) => {
      const updatedItems = mediaItems.filter((_, i) => i !== index);
      handleInputChange('mediaItems', updatedItems);
    };

    return (
      <div className="multi-media-editor">
        <div className="multi-media-header">
          <h3>Multi-Media Items</h3>
          <button className="btn btn-primary" onClick={addMediaItem}>
            <FaImage /> Add Media Item
          </button>
        </div>
        
        <div className="multi-media-help">
          <p><strong>💡 Smart Positioning:</strong> New media items are automatically positioned to avoid overlap. You can manually adjust positions using the controls below.</p>
        </div>
        
        {mediaItems.length === 0 ? (
          <div className="no-media">
            <p>No media items added yet</p>
            <button className="btn btn-primary" onClick={addMediaItem}>
              <FaImage /> Add First Media Item
            </button>
          </div>
        ) : (
          <div className="media-items-list">
            {mediaItems.map((item, index) => (
              <div key={item.id} className="media-item-editor">
                <div className="media-item-header">
                  <h4>Media Item {index + 1}</h4>
                  <button 
                    className="remove-media"
                    onClick={() => removeMediaItem(index)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => updateMediaItem(index, 'type', e.target.value)}
                    className="form-select"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="text"
                    value={item.url || ''}
                    onChange={(e) => updateMediaItem(index, 'url', e.target.value)}
                    placeholder="Enter media URL"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Caption</label>
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => updateMediaItem(index, 'caption', e.target.value)}
                    placeholder="Enter caption"
                    className="form-input"
                  />
                </div>
                
                <div className="position-controls">
                  <h5>Position & Size</h5>
                  <div className="position-grid">
                    <div className="form-group">
                      <label>X (%)</label>
                      <input
                        type="number"
                        value={item.position?.x || 0}
                        onChange={(e) => updateMediaItem(index, 'position', { x: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Y (%)</label>
                      <input
                        type="number"
                        value={item.position?.y || 0}
                        onChange={(e) => updateMediaItem(index, 'position', { y: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Width (%)</label>
                      <input
                        type="number"
                        value={item.position?.width || 30}
                        onChange={(e) => updateMediaItem(index, 'position', { width: parseInt(e.target.value) || 30 })}
                        min="5"
                        max="100"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (%)</label>
                      <input
                        type="number"
                        value={item.position?.height || 30}
                        onChange={(e) => updateMediaItem(index, 'position', { height: parseInt(e.target.value) || 30 })}
                        min="5"
                        max="100"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                
                {item.url && (
                  <div className="media-preview">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.caption || 'Media item'} />
                    ) : (
                      <video controls>
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsEditor = () => (
    <div className="settings-editor">
      <div className="form-group">
        <label>Slide Type</label>
        <select
          value={localSlide.type || 'content'}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="form-select"
        >
          <option value="title">Title Slide</option>
          <option value="content">Content Slide</option>
          <option value="image">Image Slide</option>
          <option value="video">Video Slide</option>
          <option value="multi-media">Multi-Media Slide</option>
          <option value="contact">Contact Slide</option>
          {customLayouts.length > 0 && <option value="custom-layout">Custom Layout</option>}
        </select>
      </div>

      {localSlide.type === 'custom-layout' && (
        <div className="form-group">
          <label>Select Custom Layout</label>
          <select
            value={localSlide.layoutId || ''}
            onChange={(e) => handleCustomLayoutSelect(e.target.value)}
            className="form-select"
          >
            <option value="">Choose a layout...</option>
            {customLayouts.map(layout => (
              <option key={layout.id} value={layout.id}>
                {layout.name} ({layout.slots.length} slots)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Background Color</label>
        <input
          type="color"
          value={localSlide.backgroundColor || '#ffffff'}
          onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
          className="form-color"
        />
      </div>

      <div className="form-group">
        <label>Text Color</label>
        <input
          type="color"
          value={localSlide.textColor || '#000000'}
          onChange={(e) => handleInputChange('textColor', e.target.value)}
          className="form-color"
        />
      </div>
    </div>
  );

  return (
    <div className="slide-editor">
             <div className="editor-header">
         <div className="slide-type-indicator">
           {getSlideTypeIcon(localSlide.type)}
           <span>{localSlide.type || 'content'} slide</span>
         </div>
       </div>

      <div className="editor-tabs">
        <button
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'content' && renderContentEditor()}
        {activeTab === 'media' && (
          localSlide.type === 'multi-media' ? renderMultiMediaEditor() :
          localSlide.type === 'custom-layout' && localSlide.layoutSlots && localSlide.layoutSlots.length > 0 ? renderCustomLayoutEditor() :
          renderMediaEditor()
        )}
        {activeTab === 'settings' && renderSettingsEditor()}
      </div>
      
      <LayoutPreviewPopup
        isOpen={showLayoutPreview}
        onClose={() => setShowLayoutPreview(false)}
        layoutSlots={localSlide.layoutSlots}
        layoutName={localSlide.title || 'Custom Layout'}
      />
    </div>
  );
};

export default memo(SlideEditor); 