import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './LayoutPreviewPopup.module.css';

const LayoutPreviewPopup = ({ isOpen, onClose, layoutSlots, layoutName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.layoutPreviewOverlay} onClick={onClose}>
      <div className={styles.layoutPreviewPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <h3>Layout Preview: {layoutName || 'Custom Layout'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.popupContent}>
          <div className={styles.layoutPreviewContainer} style={{ borderWidth: 0, background: '#fff' }}>
            {Array.isArray(layoutSlots) && layoutSlots.map((slot, index) => {
              const baseWidth = 800; // match designer
              const baseHeight = 600;
              const pxX = slot.position?.x ?? 0;
              const pxY = slot.position?.y ?? 0;
              const pxW = slot.size?.width ?? 30;
              const pxH = slot.size?.height ?? 30;
              const xPct = Math.max(0, Math.min(100, (pxX / baseWidth) * 100));
              const yPct = Math.max(0, Math.min(100, (pxY / baseHeight) * 100));
              const wPct = Math.max(0, Math.min(100, (pxW / baseWidth) * 100));
              const hPct = Math.max(0, Math.min(100, (pxH / baseHeight) * 100));
              return (
                <div
                  key={slot.id || index}
                  className={styles.layoutSlotPreview}
                  style={{
                    position: 'absolute',
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    width: `${wPct}%`,
                    height: `${hPct}%`,
                    zIndex: index + 1
                  }}
                >
                  {slot.type === 'image' && slot.content && (
                    <img
                      src={slot.content}
                      alt="Content"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: slot.objectFit || 'cover',
                        borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                        border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none'
                      }}
                    />
                  )}
                  {slot.type === 'video' && slot.content && (
                    <video controls autoPlay={!!slot.autoplay} muted={!!slot.muted} style={{ width: '100%', height: '100%' }}>
                      <source src={slot.content} type="video/mp4" />
                    </video>
                  )}
                  {slot.type === 'text' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        textAlign: 'left',
                        padding: `${slot.padding || 0}px`,
                        background: slot.backgroundColor || 'transparent',
                        borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
                        border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none'
                      }}
                      dangerouslySetInnerHTML={{ __html: slot.content || '' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPreviewPopup; 