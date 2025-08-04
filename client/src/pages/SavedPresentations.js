import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaEye, FaDownload, FaTrash, FaPlus, FaFileAlt, FaImage, FaVideo, FaEdit, FaCopy } from 'react-icons/fa';
import './SavedPresentations.css';

const SavedPresentations = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState({});
  const [deleting, setDeleting] = useState({});
  const [duplicating, setDuplicating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/presentations');
      setPresentations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading presentations:', err);
      setError('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (presentationId) => {
    try {
      setExporting(prev => ({ ...prev, [presentationId]: true }));
      
      // First get the presentation data
      const response = await axios.get(`http://localhost:5001/api/presentations/${presentationId}`);
      const presentationData = response.data;
      
      // Then generate the export
      const exportResponse = await axios.post(
        `http://localhost:5001/api/presentations/${presentationId}/generate`,
        presentationData,
        {
          responseType: 'blob',
          timeout: 600000 // 10 minutes
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([exportResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `presentation-${presentationId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting presentation:', err);
      alert('Failed to export presentation');
    } finally {
      setExporting(prev => ({ ...prev, [presentationId]: false }));
    }
  };

  const handleDelete = async (presentationId) => {
    if (!window.confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(prev => ({ ...prev, [presentationId]: true }));
      await axios.delete(`http://localhost:5001/api/presentations/${presentationId}`);
      setPresentations(prev => prev.filter(p => p.id !== presentationId));
    } catch (err) {
      console.error('Error deleting presentation:', err);
      alert('Failed to delete presentation');
    } finally {
      setDeleting(prev => ({ ...prev, [presentationId]: false }));
    }
  };

  const handleDuplicate = async (presentationId) => {
    try {
      setDuplicating(prev => ({ ...prev, [presentationId]: true }));
      
      // Get the original presentation
      const response = await axios.get(`http://localhost:5001/api/presentations/${presentationId}`);
      const originalPresentation = response.data;
      
      // Create a new presentation with copied data
      const duplicatedPresentation = {
        title: `${originalPresentation.title} (Copy)`,
        template: originalPresentation.template,
        slides: originalPresentation.slides,
        settings: originalPresentation.settings
      };
      
      // Save the duplicated presentation
      const saveResponse = await axios.post('http://localhost:5001/api/presentations', duplicatedPresentation);
      
      // Reload presentations to show the new copy
      await loadPresentations();
      
      alert('Presentation duplicated successfully!');
    } catch (err) {
      console.error('Error duplicating presentation:', err);
      alert('Failed to duplicate presentation');
    } finally {
      setDuplicating(prev => ({ ...prev, [presentationId]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="saved-presentations">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading presentations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-presentations">
      <div className="saved-presentations-header">
        <h1>Saved Presentations</h1>
        <motion.button
          className="btn btn-primary"
          onClick={() => navigate('/templates')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Create New
        </motion.button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadPresentations} className="btn btn-secondary">Retry</button>
        </div>
      )}

      {presentations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaFileAlt />
          </div>
          <h3>No presentations yet</h3>
          <p>Create your first presentation to get started</p>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/templates')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Create Presentation
          </motion.button>
        </div>
      ) : (
        <div className="presentations-grid">
          {presentations.map((presentation) => (
            <motion.div
              key={presentation.id}
              className="presentation-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            >
              <div className="presentation-header">
                <div className="presentation-icon">
                  {presentation.hasMedia ? (
                    <FaVideo className="media-icon" />
                  ) : (
                    <FaFileAlt />
                  )}
                </div>
                <div className="presentation-info">
                  <h3>{presentation.title}</h3>
                  <p className="presentation-meta">
                    {presentation.slideCount} slide{presentation.slideCount !== 1 ? 's' : ''} • 
                    {presentation.hasMedia && <span className="media-indicator"> <FaImage /> Media</span>}
                  </p>
                  <p className="presentation-date">{formatDate(presentation.createdAt)}</p>
                </div>
              </div>

              <div className="presentation-actions">
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/view/${presentation.id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="View Presentation"
                >
                  <FaEye />
                </motion.button>
                
                <motion.button
                  className="btn btn-primary"
                  onClick={() => navigate(`/builder/${presentation.id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Edit Presentation"
                >
                  <FaEdit />
                </motion.button>
                
                <motion.button
                  className="btn btn-secondary"
                  onClick={() => handleDuplicate(presentation.id)}
                  disabled={duplicating[presentation.id]}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Duplicate Presentation"
                >
                  {duplicating[presentation.id] ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <FaCopy />
                  )}
                </motion.button>
                
                <motion.button
                  className="btn btn-primary"
                  onClick={() => handleExport(presentation.id)}
                  disabled={exporting[presentation.id]}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export Presentation"
                >
                  {exporting[presentation.id] ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <FaDownload />
                  )}
                </motion.button>
                
                <motion.button
                  className="btn btn-danger"
                  onClick={() => handleDelete(presentation.id)}
                  disabled={deleting[presentation.id]}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete Presentation"
                >
                  {deleting[presentation.id] ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <FaTrash />
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPresentations; 