import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaCopy, FaTrash, FaEye, FaPencilRuler, FaImage, FaVideo, FaFont } from 'react-icons/fa';
import './CustomLayouts.css';

const CustomLayouts = () => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState({});

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = () => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
      setLayouts(savedLayouts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading layouts:', error);
      setLoading(false);
    }
  };

  const handleDuplicate = (layoutId) => {
    try {
      setDuplicating(prev => ({ ...prev, [layoutId]: true }));

      const layout = layouts.find(l => l.id === layoutId);
      if (!layout) return;

      const duplicatedLayout = {
        ...layout,
        id: `layout-${Date.now()}`,
        name: `${layout.name} (Copy)`,
        createdAt: new Date().toISOString()
      };

      const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
      savedLayouts.push(duplicatedLayout);
      localStorage.setItem('slideLayouts', JSON.stringify(savedLayouts));

      loadLayouts();
      alert('Layout duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating layout:', error);
      alert('Failed to duplicate layout');
    } finally {
      setDuplicating(prev => ({ ...prev, [layoutId]: false }));
    }
  };

  const handleDelete = (layoutId) => {
    if (window.confirm('Are you sure you want to delete this layout?')) {
      try {
        const savedLayouts = JSON.parse(localStorage.getItem('slideLayouts') || '[]');
        const filteredLayouts = savedLayouts.filter(l => l.id !== layoutId);
        localStorage.setItem('slideLayouts', JSON.stringify(filteredLayouts));
        loadLayouts();
        alert('Layout deleted successfully!');
      } catch (error) {
        console.error('Error deleting layout:', error);
        alert('Failed to delete layout');
      }
    }
  };

  const getSlotIcon = (type) => {
    switch (type) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'text':
        return <FaFont />;
      default:
        return <FaPencilRuler />;
    }
  };

  const renderLayoutPreview = (layout) => {
    const previewStyle = {
      width: '200px',
      height: '150px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #dee2e6',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden'
    };

    return (
      <div style={previewStyle}>
        {layout.slots.map((slot, index) => {
          const slotStyle = {
            position: 'absolute',
            left: `${(slot.position.x / 100) * 100}%`,
            top: `${(slot.position.y / 100) * 100}%`,
            width: `${(slot.size.width / 100) * 100}%`,
            height: `${(slot.size.height / 100) * 100}%`,
            backgroundColor: slot.type === 'image' ? '#e3f2fd' : 
                           slot.type === 'video' ? '#f3e5f5' : '#e8f5e8',
            border: '1px solid #ccc',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: '#666'
          };

          return (
            <div key={index} style={slotStyle} title={`${slot.type} slot`}>
              {getSlotIcon(slot.type)}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="custom-layouts loading">
        <div className="loading-spinner"></div>
        <p>Loading custom layouts...</p>
      </div>
    );
  }

  return (
    <div className="custom-layouts">
      <div className="container">
        <motion.div
          className="header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Custom Slide Layouts</h1>
          <p>Manage your custom slide layouts</p>
        </motion.div>

        {layouts.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FaPencilRuler className="empty-icon" />
            <h3>No custom layouts yet</h3>
            <p>Create your first custom slide layout using the Layout Designer</p>
            <Link to="/layout-designer" className="btn btn-primary">
              <FaPencilRuler /> Create Layout
            </Link>
          </motion.div>
        ) : (
          <div className="layouts-grid">
            {layouts.map((layout, index) => (
              <motion.div
                key={layout.id}
                className="layout-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="layout-preview">
                  {renderLayoutPreview(layout)}
                </div>
                
                <div className="layout-content">
                  <h3>{layout.name}</h3>
                  <div className="layout-stats">
                    <span>{layout.slots.length} slots</span>
                    <span>•</span>
                    <span>Created {new Date(layout.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="slot-types">
                    {layout.slots.map((slot, slotIndex) => (
                      <span key={slotIndex} className="slot-type-badge">
                        {getSlotIcon(slot.type)}
                        {slot.type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="layout-actions">
                  <Link 
                    to={`/layout-designer?edit=${layout.id}`}
                    className="btn btn-primary"
                    title="Edit Layout"
                  >
                    <FaEdit />
                  </Link>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDuplicate(layout.id)}
                    disabled={duplicating[layout.id]}
                    title="Duplicate Layout"
                  >
                    {duplicating[layout.id] ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                  
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(layout.id)}
                    title="Delete Layout"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="create-new"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link to="/layout-designer" className="btn btn-primary">
            <FaPencilRuler /> Create New Layout
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomLayouts; 