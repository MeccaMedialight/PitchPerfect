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
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
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
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  // Check if we're editing an existing layout
  useEffect(() => {
    console.log('SlideLayoutDesigner useEffect running...');
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    console.log('Edit ID from URL:', editId);
    
    if (editId) {
      console.log('Loading layout for editing:', editId);
      loadLayoutForEditing(editId);
    } else {
      // Create a test layout if no layouts exist
      const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
      console.log('Found saved layouts:', savedLayouts.length);
      if (savedLayouts.length === 0) {
        console.log('No layouts found, creating test layout...');
        createTestLayout();
      } else {
        console.log('Layouts already exist, not creating test layout');
      }
    }
  }, []);

  const createTestLayout = () => {
    console.log('Creating test layout...');
    const testLayout = {
      id: `layout-${Date.now()}`,
      name: 'Test Custom Layout',
      slots: [
        {
          id: 'slot-1',
          type: 'text',
          position: { x: 50, y: 50 },
          size: { width: 200, height: 150 },
          content: 'Test text slot'
        },
        {
          id: 'slot-2', 
          type: 'image',
          position: { x: 300, y: 50 },
          size: { width: 200, height: 150 },
          content: ''
        },
        {
          id: 'slot-3',
          type: 'video', 
          position: { x: 50, y: 250 },
          size: { width: 200, height: 150 },
          content: ''
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
    console.log('Current saved layouts:', savedLayouts);
    savedLayouts.push(testLayout);
    localStorage.setItem('slideLayouts', JSON.stringify(savedLayouts));
    console.log('Test layout saved. Total layouts:', savedLayouts.length);
    
    // Load the test layout for editing
    setSlots(testLayout.slots);
    setLayoutName(testLayout.name);
    setEditingLayoutId(testLayout.id);
  };

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
    const slideWidth = 800; // Match the slide-frame width from CSS
    const slideHeight = 600; // Match the slide-frame height from CSS
    const maxX = slideWidth - slotWidth - padding;
    const maxY = slideHeight - slotHeight - padding;
    
    // Create a more predictable grid-based positioning system
    let x, y;
    const gridCols = 3;
    const gridRows = 2;
    const colWidth = (slideWidth - padding * 2) / gridCols;
    const rowHeight = (slideHeight - padding * 2) / gridRows;
    
    if (slots.length === 0) {
      // First slot in center
      x = (slideWidth - slotWidth) / 2;
      y = (slideHeight - slotHeight) / 2;
    } else {
      // Use grid positioning for predictable placement
      const gridIndex = slots.length - 1;
      const col = gridIndex % gridCols;
      const row = Math.floor(gridIndex / gridCols);
      
      x = padding + (col * colWidth) + (colWidth - slotWidth) / 2;
      y = padding + (row * rowHeight) + (rowHeight - slotHeight) / 2;
      
      // If we exceed the grid, use a spiral pattern
      if (gridIndex >= gridCols * gridRows) {
        const spiralIndex = gridIndex - (gridCols * gridRows);
        const angle = spiralIndex * Math.PI / 4;
        const radius = 150 + spiralIndex * 30;
        const centerX = slideWidth / 2;
        const centerY = slideHeight / 2;
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
      }
    }
    
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
    
    console.log(`Adding slot ${type} at position (${x}, ${y}) with size (${slotWidth}, ${slotHeight})`);
    console.log('Current slots:', slots.length);
    
    setSlots(prevSlots => [...prevSlots, newSlot]);
  };

  const deleteSlot = (id) => {
    setSlots(slots.filter(slot => slot.id !== id));
    if (selectedSlot === id) {
      setSelectedSlot(null);
    }
  };

  const handleDragStart = (slotId, offset) => {
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
    let constrainedX = Math.max(0, Math.min(newX, maxX));
    let constrainedY = Math.max(0, Math.min(newY, maxY));

    if (snapToGrid && gridSize > 0) {
      const snap = (v) => Math.round(v / gridSize) * gridSize;
      constrainedX = snap(constrainedX);
      constrainedY = snap(constrainedY);
      // Keep within bounds after snapping
      constrainedX = Math.max(0, Math.min(constrainedX, maxX));
      constrainedY = Math.max(0, Math.min(constrainedY, maxY));
    }

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
      let constrainedX = Math.max(0, Math.min(newX, maxX));
      let constrainedY = Math.max(0, Math.min(newY, maxY));

      if (snapToGrid && gridSize > 0) {
        const snap = (v) => Math.round(v / gridSize) * gridSize;
        constrainedX = snap(constrainedX);
        constrainedY = snap(constrainedY);
        constrainedX = Math.max(0, Math.min(constrainedX, maxX));
        constrainedY = Math.max(0, Math.min(constrainedY, maxY));
      }

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

      if (snapToGrid && gridSize > 0) {
        const snap = (v) => Math.round(v / gridSize) * gridSize;
        newWidth = Math.max(150, snap(newWidth));
        newHeight = Math.max(100, snap(newHeight));
        newX = snap(newX);
        newY = snap(newY);
      }

      newX = Math.max(0, Math.min(newX, slideRect.width - newWidth));
      newY = Math.max(0, Math.min(newY, slideRect.height - newHeight));

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

  // Keyboard nudging for selected slot
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSlot) return;
      const slideFrame = slideRef.current?.querySelector('.slide-frame');
      if (!slideFrame) return;

      const frameRect = slideFrame.getBoundingClientRect();
      const slot = slots.find(s => s.id === selectedSlot);
      if (!slot) return;

      const baseStep = snapToGrid && gridSize > 0 ? gridSize : 2;
      const step = e.shiftKey ? baseStep * 2 : baseStep;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();
      const newX = Math.max(0, Math.min(slot.position.x + dx, frameRect.width - slot.size.width));
      const newY = Math.max(0, Math.min(slot.position.y + dy, frameRect.height - slot.size.height));
      setSlots(prev => prev.map(s => s.id === selectedSlot ? { ...s, position: { x: newX, y: newY } } : s));
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlot, slots, gridSize, snapToGrid]);

  const duplicateSelectedSlot = () => {
    if (!selectedSlot) return;
    const slideFrame = slideRef.current?.querySelector('.slide-frame');
    if (!slideFrame) return;
    const frameRect = slideFrame.getBoundingClientRect();
    const original = slots.find(s => s.id === selectedSlot);
    if (!original) return;
    const offset = 20;
    let newX = Math.min(original.position.x + offset, frameRect.width - original.size.width);
    let newY = Math.min(original.position.y + offset, frameRect.height - original.size.height);
    if (snapToGrid && gridSize > 0) {
      const snap = (v) => Math.round(v / gridSize) * gridSize;
      newX = snap(newX);
      newY = snap(newY);
    }
    const duplicated = {
      ...original,
      id: `slot-${Date.now()}`,
      position: { x: newX, y: newY }
    };
    setSlots(prev => [...prev, duplicated]);
    setSelectedSlot(duplicated.id);
  };

  const alignSelected = (direction) => {
    if (!selectedSlot) return;
    const slideFrame = slideRef.current?.querySelector('.slide-frame');
    if (!slideFrame) return;
    const frameRect = slideFrame.getBoundingClientRect();
    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;
    let x = slot.position.x;
    let y = slot.position.y;
    if (direction === 'left') x = 0;
    if (direction === 'centerX') x = (frameRect.width - slot.size.width) / 2;
    if (direction === 'right') x = frameRect.width - slot.size.width;
    if (direction === 'top') y = 0;
    if (direction === 'centerY') y = (frameRect.height - slot.size.height) / 2;
    if (direction === 'bottom') y = frameRect.height - slot.size.height;
    if (snapToGrid && gridSize > 0) {
      const snap = (v) => Math.round(v / gridSize) * gridSize;
      x = snap(x);
      y = snap(y);
    }
    setSlots(prev => prev.map(s => s.id === selectedSlot ? { ...s, position: { x, y } } : s));
  };

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
          <div className="toggle-group" title="Grid and snapping options">
            <label className="toggle">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              Grid
            </label>
            <label className="toggle">
              <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
              Snap
            </label>
            <label className="toggle">
              Size
              <select value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value) || 20)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 6px' }}>
                <option value={10}>10px</option>
                <option value={20}>20px</option>
                <option value={40}>40px</option>
              </select>
            </label>
          </div>
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
             <button 
               onClick={createTestLayout}
               style={{ 
                 marginTop: '10px', 
                 padding: '8px 16px', 
                 backgroundColor: '#007bff', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: '4px',
                 cursor: 'pointer'
               }}
             >
               Create Test Layout
             </button>
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
          <div className="slide-preview-container">
            <div 
              className={`slide-frame ${showGrid ? 'show-grid' : ''}`}
              onClick={() => setSelectedSlot(null)}
            >
              {slots.length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#a0aec0',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  <p>Click "Add Content Slots" to create your layout</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Slots added: {slots.length}
                  </p>
                </div>
              )}
              
              {slots.map((slot) => (
                <SlotItem
                  key={slot.id}
                  id={slot.id}
                  type={slot.type}
                  position={slot.position}
                  size={slot.size}
                  onDelete={deleteSlot}
                  onUpdate={(updatedSlot) => {
                    setSlots(prevSlots => 
                      prevSlots.map(s => s.id === slot.id ? updatedSlot : s)
                    );
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
                    <div className="align-controls">
                      <button onClick={() => alignSelected('left')}>Left</button>
                      <button onClick={() => alignSelected('centerX')}>Center</button>
                      <button onClick={() => alignSelected('right')}>Right</button>
                      <button onClick={() => alignSelected('top')}>Top</button>
                      <button onClick={() => alignSelected('centerY')}>Middle</button>
                      <button onClick={() => alignSelected('bottom')}>Bottom</button>
                    </div>
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
                      onClick={duplicateSelectedSlot}
                    >
                      <FaCopy /> Duplicate Slot
                    </button>
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