import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaVideo, FaFont, FaTrash, FaPlus, FaSave, FaEye, FaCopy } from 'react-icons/fa';
import './SlideLayoutDesigner.css';

const SlotType = {
  IMAGE: 'image',
  VIDEO: 'video',
  TEXT: 'text'
};

const SlotItem = ({ id, type, position, size, onDelete, onUpdate, onClick, isSelected, onDragStart, onDragEnd, onResizeStart, onResizeEnd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const style = {
    transition: 'none',
    opacity: isDragging || isResizing ? 0.7 : 1,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleMouseDown = (e) => {
    console.log('Slot mouse down:', id);
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    console.log('Drag offset calculated:', offsetX, offsetY);
    setIsDragging(true);
    if (onDragStart) onDragStart(id, { x: offsetX, y: offsetY });
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) onDragEnd(id, e);
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      if (onResizeEnd) onResizeEnd(id, e);
    }
  };

  const handleResizeMouseDown = (e, handle) => {
    console.log('Resize mouse down:', id, handle);
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    if (onResizeStart) onResizeStart(id, handle, e);
  };

  const getIcon = () => {
    switch (type) {
      case SlotType.IMAGE:
        return <FaImage />;
      case SlotType.VIDEO:
        return <FaVideo />;
      case SlotType.TEXT:
        return <FaFont />;
      default:
        return <FaFont />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case SlotType.IMAGE:
        return 'Image';
      case SlotType.VIDEO:
        return 'Video';
      case SlotType.TEXT:
        return 'Text';
      default:
        return 'Text';
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      style={style}
      className={`slot-item ${type}-slot ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="slot-header">
        <div className="slot-icon">
          {getIcon()}
        </div>
        <span className="slot-type">{getTypeName()}</span>
        <button
          className="delete-slot-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <FaTrash />
        </button>
      </div>
      <div className="slot-content">
        <div className="slot-placeholder">
          {type === SlotType.TEXT ? 'Rich text content will appear here' : `${getTypeName()} content will appear here`}
        </div>
      </div>
      <div className="slot-resize-handles">
        <div 
          className="resize-handle resize-handle-nw" 
          onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        />
        <div 
          className="resize-handle resize-handle-ne" 
          onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        />
        <div 
          className="resize-handle resize-handle-sw" 
          onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        />
        <div 
          className="resize-handle resize-handle-se" 
          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        />
      </div>
    </div>
  );
};

const SlideLayoutDesigner = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [layoutName, setLayoutName] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingLayoutId, setEditingLayoutId] = useState(null);
  const [draggingSlot, setDraggingSlot] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingSlot, setResizingSlot] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const slideRef = useRef(null);

  // Check if we're editing an existing layout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      loadLayoutForEditing(editId);
    }
  }, []);

  const loadLayoutForEditing = (layoutId) => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
      const layout = savedLayouts.find(l => l.id === layoutId);
      
      if (layout) {
        setSlots(layout.slots);
        setLayoutName(layout.name);
        setEditingLayoutId(layoutId);
      }
    } catch (error) {
      console.error('Error loading layout for editing:', error);
    }
  };

  const addSlot = (type) => {
    // Calculate position to avoid overlap
    const padding = 20;
    const slotWidth = 200;
    const slotHeight = 150;
    const maxX = 900 - slotWidth - padding;
    const maxY = 675 - slotHeight - padding;
    
    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    
    // Ensure minimum distance from edges
    x = Math.max(padding, Math.min(x, maxX));
    y = Math.max(padding, Math.min(y, maxY));
    
    const newSlot = {
      id: `slot-${Date.now()}`,
      type,
      position: { x, y },
      size: { width: slotWidth, height: slotHeight },
      content: type === SlotType.TEXT ? 'Enter text here...' : '',
      style: {}
    };
    setSlots([...slots, newSlot]);
  };

  const deleteSlot = (id) => {
    setSlots(slots.filter(slot => slot.id !== id));
    if (selectedSlot === id) {
      setSelectedSlot(null);
    }
  };

  const handleDragStart = (slotId, offset) => {
    console.log('Drag start:', slotId, offset);
    setDraggingSlot(slotId);
    setDragOffset(offset);
  };

  const handleDragEnd = (slotId, event) => {
    if (!draggingSlot || !slideRef.current) return;

    // Get the slide frame element to calculate position relative to it
    const slideFrame = slideRef.current.querySelector('.slide-frame');
    if (!slideFrame) return;
    
    const frameRect = slideFrame.getBoundingClientRect();
    const newX = event.clientX - frameRect.left - dragOffset.x;
    const newY = event.clientY - frameRect.top - dragOffset.y;

    // Constrain to slide frame boundaries
    const maxX = frameRect.width - 200; // slot width
    const maxY = frameRect.height - 150; // slot height
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, position: { x: constrainedX, y: constrainedY } }
          : slot
      )
    );

    setDraggingSlot(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleResizeStart = (slotId, handle, event) => {
    console.log('Resize start:', slotId, handle);
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    setResizingSlot(slotId);
    setResizeHandle(handle);
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      width: slot.size.width,
      height: slot.size.height,
      slotX: slot.position.x,
      slotY: slot.position.y
    });
  };

  const handleResizeEnd = (slotId, event) => {
    console.log('Resize end:', slotId);
    setResizingSlot(null);
    setResizeHandle(null);
    setResizeStart({ x: 0, y: 0, width: 0, height: 0, slotX: 0, slotY: 0 });
  };

  const handleSlideMouseMove = (e) => {
    if (!draggingSlot && !resizingSlot || !slideRef.current) return;

    const slideRect = slideRef.current.getBoundingClientRect();

    if (draggingSlot) {
      // Get the slide frame element to calculate position relative to it
      const slideFrame = slideRef.current?.querySelector('.slide-frame');
      if (!slideFrame) return;
      
      const frameRect = slideFrame.getBoundingClientRect();
      const newX = e.clientX - frameRect.left - dragOffset.x;
      const newY = e.clientY - frameRect.top - dragOffset.y;

      // Constrain to slide frame boundaries
      const maxX = frameRect.width - 200;
      const maxY = frameRect.height - 150;
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      console.log('Dragging:', draggingSlot, 'to:', constrainedX, constrainedY, 'frame rect:', frameRect);

      setSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === draggingSlot 
            ? { ...slot, position: { x: constrainedX, y: constrainedY } }
            : slot
        )
      );
    }

    if (resizingSlot) {
      const slot = slots.find(s => s.id === resizingSlot);
      if (!slot) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.slotX;
      let newY = resizeStart.slotY;

      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(150, resizeStart.width + deltaX);
          newHeight = Math.max(100, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(150, resizeStart.width - deltaX);
          newHeight = Math.max(100, resizeStart.height + deltaY);
          newX = resizeStart.slotX + (resizeStart.width - newWidth);
          break;
        case 'ne':
          newWidth = Math.max(150, resizeStart.width + deltaX);
          newHeight = Math.max(100, resizeStart.height - deltaY);
          newY = resizeStart.slotY + (resizeStart.height - newHeight);
          break;
        case 'nw':
          newWidth = Math.max(150, resizeStart.width - deltaX);
          newHeight = Math.max(100, resizeStart.height - deltaY);
          newX = resizeStart.slotX + (resizeStart.width - newWidth);
          newY = resizeStart.slotY + (resizeStart.height - newHeight);
          break;
      }

      // Constrain to slide boundaries
      const maxX = slideRect.width - newWidth;
      const maxY = slideRect.height - newHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      console.log('Resizing:', resizingSlot, 'to:', newWidth, 'x', newHeight, 'at', newX, newY);

      setSlots(prevSlots => 
        prevSlots.map(s => 
          s.id === resizingSlot 
            ? { 
                ...s, 
                position: { x: newX, y: newY },
                size: { width: newWidth, height: newHeight }
              }
            : s
        )
      );
    }
  };

  // Add global mouse event listeners for dragging and resizing
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if ((draggingSlot || resizingSlot) && slideRef.current) {
        handleSlideMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggingSlot) {
        setDraggingSlot(null);
        setDragOffset({ x: 0, y: 0 });
      }
      if (resizingSlot) {
        setResizingSlot(null);
        setResizeHandle(null);
        setResizeStart({ x: 0, y: 0, width: 0, height: 0, slotX: 0, slotY: 0 });
      }
    };

    if (draggingSlot || resizingSlot) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingSlot, dragOffset, resizingSlot, resizeHandle, resizeStart]);

  const saveLayout = () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
    
    if (editingLayoutId) {
      // Update existing layout
      const updatedLayouts = savedLayouts.map(layout => 
        layout.id === editingLayoutId 
          ? { ...layout, name: layoutName, slots: slots, updatedAt: new Date().toISOString() }
          : layout
      );
      localStorage.setItem('slideLayouts', JSON.stringify(updatedLayouts));
      alert(`Layout "${layoutName}" updated successfully!`);
    } else {
      // Create new layout
      const layout = {
        id: `layout-${Date.now()}`,
        name: layoutName,
        slots: slots,
        createdAt: new Date().toISOString()
      };
      savedLayouts.push(layout);
      localStorage.setItem('slideLayouts', JSON.stringify(savedLayouts));
      alert(`Layout "${layoutName}" saved successfully!`);
    }
    
    setLayoutName('');
    setEditingLayoutId(null);
  };

  const exportLayout = () => {
    if (slots.length === 0) {
      alert('No slots to export');
      return;
    }

    const layoutData = {
      name: layoutName || 'Custom Layout',
      slots: slots,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layoutData.name.replace(/\s+/g, '_')}_layout.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="slide-layout-designer">
      <div className="designer-header">
        <h1>{editingLayoutId ? 'Edit Layout' : 'Slide Layout Designer'}</h1>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Enter layout name..."
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="layout-name-input"
          />
          <button
            className="preview-btn"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <FaEye />
            {isPreviewMode ? ' Edit' : ' Preview'}
          </button>
          <button className="save-btn" onClick={saveLayout}>
            <FaSave />
            {editingLayoutId ? 'Update Layout' : 'Save Layout'}
          </button>
          <button className="export-btn" onClick={exportLayout}>
            Export
          </button>
        </div>
      </div>

      <div className="designer-content">
        <div className="toolbar">
          <h3>Add Content Slots</h3>
          <div className="slot-buttons">
            <button
              className="add-slot-btn image-slot"
              onClick={() => addSlot(SlotType.IMAGE)}
            >
              <FaImage />
              Image Slot
            </button>
            <button
              className="add-slot-btn video-slot"
              onClick={() => addSlot(SlotType.VIDEO)}
            >
              <FaVideo />
              Video Slot
            </button>
            <button
              className="add-slot-btn text-slot"
              onClick={() => addSlot(SlotType.TEXT)}
            >
              <FaFont />
              Text Slot
            </button>
          </div>
          
          <div className="layout-info">
            <p>Slots: {slots.length}</p>
            <p>Drag slots to reposition them</p>
          </div>
        </div>

        <div 
          className="slide-canvas" 
          ref={slideRef}
          onMouseMove={handleSlideMouseMove}
          onMouseUp={() => {
            if (draggingSlot) {
              setDraggingSlot(null);
              setDragOffset({ x: 0, y: 0 });
            }
            if (resizingSlot) {
              setResizingSlot(null);
              setResizeHandle(null);
              setResizeStart({ x: 0, y: 0, width: 0, height: 0, slotX: 0, slotY: 0 });
            }
          }}
        >
          <div className="slide-preview">
            <div 
              className="slide-frame"
              onClick={() => setSelectedSlot(null)}
            >
              {slots.map((slot) => (
                <SlotItem
                  key={slot.id}
                  id={slot.id}
                  type={slot.type}
                  position={slot.position}
                  size={slot.size}
                  onDelete={deleteSlot}
                  onUpdate={(updatedSlot) => {
                    setSlots(slots.map(s => s.id === updatedSlot.id ? updatedSlot : s));
                  }}
                  onClick={() => setSelectedSlot(slot.id)}
                  isSelected={selectedSlot === slot.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onResizeStart={handleResizeStart}
                  onResizeEnd={handleResizeEnd}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="properties-panel">
          <h3>Properties</h3>
          {selectedSlot ? (
            <div className="slot-properties">
              {(() => {
                const slot = slots.find(s => s.id === selectedSlot);
                if (!slot) return null;
                
                return (
                  <>
                    <div className="property-group">
                      <label>Type:</label>
                      <span className="property-value">{slot.type}</span>
                    </div>
                    <div className="property-group">
                      <label>Position:</label>
                      <div className="position-inputs">
                        <input
                          type="number"
                          value={slot.position.x}
                          onChange={(e) => {
                            const updatedSlot = { ...slot, position: { ...slot.position, x: parseInt(e.target.value) || 0 } };
                            setSlots(slots.map(s => s.id === selectedSlot ? updatedSlot : s));
                          }}
                          placeholder="X"
                        />
                        <input
                          type="number"
                          value={slot.position.y}
                          onChange={(e) => {
                            const updatedSlot = { ...slot, position: { ...slot.position, y: parseInt(e.target.value) || 0 } };
                            setSlots(slots.map(s => s.id === selectedSlot ? updatedSlot : s));
                          }}
                          placeholder="Y"
                        />
                      </div>
                    </div>
                    <div className="property-group">
                      <label>Size:</label>
                      <div className="size-inputs">
                        <input
                          type="number"
                          value={slot.size.width}
                          onChange={(e) => {
                            const updatedSlot = { ...slot, size: { ...slot.size, width: parseInt(e.target.value) || 150 } };
                            setSlots(slots.map(s => s.id === selectedSlot ? updatedSlot : s));
                          }}
                          placeholder="Width"
                        />
                        <input
                          type="number"
                          value={slot.size.height}
                          onChange={(e) => {
                            const updatedSlot = { ...slot, size: { ...slot.size, height: parseInt(e.target.value) || 100 } };
                            setSlots(slots.map(s => s.id === selectedSlot ? updatedSlot : s));
                          }}
                          placeholder="Height"
                        />
                      </div>
                    </div>
                    <button
                      className="delete-slot-btn"
                      onClick={() => deleteSlot(selectedSlot)}
                    >
                      <FaTrash />
                      Delete Slot
                    </button>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a slot to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideLayoutDesigner; 