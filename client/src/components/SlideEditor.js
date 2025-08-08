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
  const [highlightedSlotId, setHighlightedSlotId] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);

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

    const slotStylePresets = {
      'Card': {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        boxShadow: 'medium'
      },
      'Hero Image': {
        objectFit: 'cover',
        padding: 0,
        borderRadius: 8,
        borderWidth: 0,
        boxShadow: 'large',
        backgroundColor: 'transparent'
      },
      'Framed': {
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: '#2d3748',
        boxShadow: 'small'
      },
      'Badge': {
        backgroundColor: '#667eea',
        padding: 8,
        borderRadius: 999,
        borderWidth: 0,
        boxShadow: 'none'
      },
      'Captioned Media': {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        boxShadow: 'small'
      }
    };

    const updateSlots = (updater) => {
      const updatedSlots = typeof updater === 'function' ? updater(localSlide.layoutSlots) : updater;
      const updatedSlide = { ...localSlide, layoutSlots: updatedSlots };
      setLocalSlide(updatedSlide);
      if (onImmediateUpdate) onImmediateUpdate(updatedSlide);
      onUpdate(updatedSlide);
    };
    const applyPreset = (slotId, presetName) => {
      const preset = slotStylePresets[presetName];
      if (!preset) return;
      updateSlots(localSlide.layoutSlots.map(slot => {
        if (slot.id !== slotId) return slot;
        const next = { ...slot };
        Object.entries(preset).forEach(([key, val]) => {
          if (key === 'objectFit' && slot.type !== 'image') return;
          next[key] = val;
        });
        return next;
      }));
    };

    const updateSlotContent = (slotId, content) => {
      updateSlots(localSlide.layoutSlots.map(slot => slot.id === slotId ? { ...slot, content } : slot));
    };

    const updateSlotField = (slotId, field, value) => {
      updateSlots(localSlide.layoutSlots.map(slot => slot.id === slotId ? { ...slot, [field]: value } : slot));
    };

    return (
      <div className="custom-layout-editor">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button 
            className="preview-btn"
            onClick={() => setShowLayoutPreview(true)}
          >
            <FaEye /> Full Preview
          </button>
        </div>

        <div className="layout-edit-grid">
          <div className="layout-live-preview">
            <div className="layout-preview-header" style={{ justifyContent: 'space-between' }}>
              <h4>Live Preview</h4>
              <button className="preview-btn" onClick={() => setShowLayoutPreview(true)}><FaEye /> Full Preview</button>
            </div>
            <div className="slide-frame-preview">
              {localSlide.layoutSlots.map((slot, index) => {
                const baseWidth = 800;
                const baseHeight = 600;
                const pxX = slot.position?.x ?? 0;
                const pxY = slot.position?.y ?? 0;
                const pxW = slot.size?.width ?? 30;
                const pxH = slot.size?.height ?? 30;
                const xPct = Math.max(0, Math.min(100, (pxX / baseWidth) * 100));
                const yPct = Math.max(0, Math.min(100, (pxY / baseHeight) * 100));
                const wPct = Math.max(0, Math.min(100, (pxW / baseWidth) * 100));
                const hPct = Math.max(0, Math.min(100, (pxH / baseHeight) * 100));
                const isHighlighted = highlightedSlotId === slot.id;
                const isEditing = editingSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    className="slot-preview"
                    style={{
                      position: 'absolute',
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      width: `${wPct}%`,
                      height: `${hPct}%`,
                      zIndex: index + 1,
                      background: slot.backgroundColor || 'transparent',
                      padding: `${slot.padding || 0}px`,
                      borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                      border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
                      boxSizing: 'border-box',
                      outline: isHighlighted || isEditing ? '2px solid #667eea' : 'none',
                      outlineOffset: '0',
                      cursor: 'pointer'
                    }}
                    onClick={() => setEditingSlotId(slot.id)}
                    onMouseEnter={() => setHighlightedSlotId(slot.id)}
                    onMouseLeave={() => setHighlightedSlotId(null)}
                  >
                    {slot.type === 'image' && slot.content && (
                      <img
                        src={slot.content}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: slot.objectFit || 'cover',
                          borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0'
                        }}
                      />
                    )}
                    {slot.type === 'video' && slot.content && (
                      <video
                        controls
                        autoPlay={!!slot.autoplay}
                        muted={!!slot.muted}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <source src={slot.content} type="video/mp4" />
                      </video>
                    )}
                    {slot.type === 'text' && (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                          textAlign: 'left'
                        }}
                        dangerouslySetInnerHTML={{ __html: slot.content || '' }}
                      />
                    )}
                    {!slot.content && (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '0.8rem', color: '#999'
                      }}>
                        {slot.type} slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="slot-editors">
            {editingSlotId ? (
              (() => {
                const slot = localSlide.layoutSlots.find(s => s.id === editingSlotId);
                const index = localSlide.layoutSlots.findIndex(s => s.id === editingSlotId);
                if (!slot) return null;
                
                return (
                  <div className="slot-editor">
                    <div className="slot-editor-header">
                      <label>{slot.type} Slot {index + 1}</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {slot.content && (
                          <button 
                            className="clear-content-btn"
                            onClick={() => updateSlotContent(slot.id, '')}
                            title="Clear content"
                          >
                            Clear
                          </button>
                        )}
                        <button 
                          className="close-btn"
                          onClick={() => setEditingSlotId(null)}
                          title="Close editor"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="option-group" style={{ marginBottom: '0.5rem' }}>
                      <label>Preset:</label>
                      <select
                        onChange={(e) => {
                          const name = e.target.value;
                          if (name) applyPreset(slot.id, name);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <option value="">Choose preset…</option>
                        {Object.keys(slotStylePresets).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
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
                            e.preventDefault();
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
                            // Reset the input value to allow re-uploading the same file
                            e.target.value = '';
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
                                  onChange={(e) => updateSlotField(slot.id, 'autoplay', e.target.checked)}
                                />
                                <span>Autoplay</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={slot.muted || false}
                                  onChange={(e) => updateSlotField(slot.id, 'muted', e.target.checked)}
                                />
                                <span>Muted</span>
                              </label>
                            </div>
                          </div>
                        )}
                        
                        {slot.type === 'image' && (
                          <div className="image-options">
                            <h5>Image Options</h5>
                            <div className="option-group">
                              <label>Object Fit:</label>
                              <select
                                value={slot.objectFit || 'cover'}
                                onChange={(e) => updateSlotField(slot.id, 'objectFit', e.target.value)}
                              >
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="fill">Fill</option>
                                <option value="scale-down">Scale Down</option>
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
                                  objectFit: slot.objectFit || 'cover'
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

                    {/* Styling Options (applies to all slot types) */}
                    <div className="image-options" style={{ marginTop: '0.5rem' }}>
                      <h5>Styling</h5>
                      <div className="option-group">
                        <label>Border Width:</label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={slot.borderWidth || 0}
                          onChange={(e) => updateSlotField(slot.id, 'borderWidth', parseInt(e.target.value))}
                        />
                        <span>{slot.borderWidth || 0}px</span>
                      </div>
                      <div className="option-group">
                        <label>Border Color:</label>
                        <input
                          type="color"
                          value={slot.borderColor || '#000000'}
                          onChange={(e) => updateSlotField(slot.id, 'borderColor', e.target.value)}
                        />
                      </div>
                      <div className="option-group">
                        <label>Border Radius:</label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={slot.borderRadius || 0}
                          onChange={(e) => updateSlotField(slot.id, 'borderRadius', parseInt(e.target.value))}
                        />
                        <span>{slot.borderRadius || 0}px</span>
                      </div>
                      <div className="option-group">
                        <label>Box Shadow:</label>
                        <select
                          value={slot.boxShadow || 'none'}
                          onChange={(e) => updateSlotField(slot.id, 'boxShadow', e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="option-group">
                        <label>Background:</label>
                        <input
                          type="color"
                          value={slot.backgroundColor || '#ffffff'}
                          onChange={(e) => updateSlotField(slot.id, 'backgroundColor', e.target.value)}
                        />
                      </div>
                      <div className="option-group">
                        <label>Padding:</label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={slot.padding || 0}
                          onChange={(e) => updateSlotField(slot.id, 'padding', parseInt(e.target.value))}
                        />
                        <span>{slot.padding || 0}px</span>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="no-slot-selected">
                <p>Click on a slot in the preview to edit its content and styling.</p>
              </div>
            )}
          </div>
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
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <a href="/layout-designer" className="btn btn-primary" style={{ padding: '0.4rem 0.6rem' }}>Open Layout Designer</a>
            {localSlide.layoutId && (
              <a href={`/layout-designer?edit=${localSlide.layoutId}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>Edit This Layout</a>
            )}
          </div>
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