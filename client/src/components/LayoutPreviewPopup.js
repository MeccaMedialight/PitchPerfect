import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './LayoutPreviewPopup.css';

const LayoutPreviewPopup = ({ isOpen, onClose, layoutSlots, layoutName }) => {
  if (!isOpen) return null;

  return (
    <div className="layout-preview-overlay" onClick={onClose}>
      <div className="layout-preview-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Layout Preview: {layoutName || 'Custom Layout'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="popup-content">
          <div className="layout-preview-container">
            {layoutSlots && layoutSlots.map((slot, index) => {
              console.log('Slot data:', slot);
              
                             // Convert pixel values to percentages if needed
               // The layout designer stores values in pixels, but we need percentages for display
               const containerWidth = 736; // Match popup container width (800px - 4rem padding)
               const containerHeight = 400; // Match popup container height
              
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
              
              console.log('Calculated dimensions:', { x, y, width, height });
              
              return (
                <div
                  key={slot.id || index}
                  className="layout-slot-preview"
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    border: '2px dashed #667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    color: '#667eea',
                    fontWeight: '500',
                    zIndex: 1
                  }}
                >
                                     <div className="slot-info">
                     <div className="slot-type">{slot.type}</div>
                     <div className="slot-dimensions">
                       {Math.round(width)}% × {Math.round(height)}%
                     </div>
                     {slot.content && (
                       <div className="slot-content-preview">
                         {slot.type === 'image' ? (
                           <img src={slot.content} alt="Content" style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'cover' }} />
                         ) : slot.type === 'video' ? (
                           <div style={{ fontSize: '0.8rem', color: '#666' }}>Video: {slot.content.substring(0, 30)}...</div>
                         ) : slot.type === 'text' ? (
                           <div style={{ fontSize: '0.8rem', color: '#666', maxHeight: '40px', overflow: 'hidden' }}>
                             {slot.content.substring(0, 40)}{slot.content.length > 40 ? '...' : ''}
                           </div>
                         ) : null}
                       </div>
                     )}
                   </div>
                </div>
              );
            })}
          </div>
          
          <div className="layout-info">
            <h4>Layout Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Total Slots:</span>
                <span className="info-value">{layoutSlots?.length || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Slot Types:</span>
                <span className="info-value">
                  {layoutSlots ? 
                    [...new Set(layoutSlots.map(slot => slot.type))].join(', ') : 
                    'None'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPreviewPopup; 