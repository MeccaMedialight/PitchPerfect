import React, { useState, useRef } from 'react';
import { FaTrash, FaFont, FaPlus } from 'react-icons/fa';
import fontManager from '../utils/fontManager';
import './CustomFontUpload.css';

const CustomFontUpload = ({ onFontAdded, onFontRemoved }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fontName, setFontName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'font/ttf',
        'font/otf',
        'font/woff',
        'font/woff2',
        'application/x-font-ttf',
        'application/x-font-otf',
        'application/font-woff',
        'application/font-woff2'
      ];
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        setUploadError('Please select a valid font file (TTF, OTF, WOFF, or WOFF2)');
        return;
      }

      // Auto-generate font name from filename if not provided
      if (!fontName) {
        const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFontName(nameFromFile);
      }

      setUploadError('');
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file || !fontName.trim()) {
      setUploadError('Please select a font file and enter a font name');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const customFont = await fontManager.addCustomFont(file, fontName.trim());
      setFontName('');
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onFontAdded) {
        onFontAdded(customFont);
      }
    } catch (error) {
      setUploadError(error.message || 'Failed to upload font');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFont = (fontValue) => {
    if (window.confirm('Are you sure you want to remove this custom font?')) {
      fontManager.removeCustomFont(fontValue);
      if (onFontRemoved) {
        onFontRemoved(fontValue);
      }
    }
  };

  const customFonts = fontManager.customFonts;

  return (
    <div className="custom-font-upload">
      <div className="custom-font-header">
        <h4>Custom Fonts</h4>
        <button
          className="add-font-btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
          title="Add custom font"
        >
          <FaPlus />
          Add Font
        </button>
      </div>

      {showUploadForm && (
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="font-file">Font File (TTF, OTF, WOFF, WOFF2)</label>
            <input
              ref={fileInputRef}
              type="file"
              id="font-file"
              accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
              onChange={handleFileSelect}
              className="font-file-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="font-name">Font Name</label>
            <input
              type="text"
              id="font-name"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              placeholder="Enter font name"
              className="font-name-input"
            />
          </div>

          {uploadError && (
            <div className="upload-error">
              {uploadError}
            </div>
          )}

          <div className="upload-actions">
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Font'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setShowUploadForm(false);
                setFontName('');
                setUploadError('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {customFonts.length > 0 && (
        <div className="custom-fonts-list">
          <h5>Uploaded Fonts</h5>
          {customFonts.map((font) => (
            <div key={font.value} className="custom-font-item">
              <div className="font-info">
                <FaFont className="font-icon" />
                <span className="font-name" style={{ fontFamily: font.value }}>
                  {font.label}
                </span>
              </div>
              <button
                className="remove-font-btn"
                onClick={() => handleRemoveFont(font.value)}
                title="Remove font"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      {customFonts.length === 0 && !showUploadForm && (
        <div className="no-custom-fonts">
          <FaFont className="no-fonts-icon" />
          <p>No custom fonts uploaded yet.</p>
          <p>Click "Add Font" to upload your own fonts.</p>
        </div>
      )}
    </div>
  );
};

export default CustomFontUpload;
