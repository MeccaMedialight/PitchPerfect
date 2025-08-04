import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaImage, FaVideo, FaTimes, FaStop } from 'react-icons/fa';
import axios from 'axios';
import './MediaUpload.css';

const MediaUpload = ({ onUpload, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file) {
        console.error('No file provided to onDrop');
        return;
      }

      // Check file size and show warning for very large files
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        const proceed = window.confirm(
          `This file is ${fileSizeMB.toFixed(1)}MB. Large files may take a while to upload and could slow down the page. Do you want to continue?`
        );
        if (!proceed) {
          return;
        }
      }

      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Create abort controller for canceling upload
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout for large files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          } else {
            // If total is not available, show indeterminate progress
            setUploadProgress(progressEvent.loaded > 0 ? 50 : 0);
          }
        },
      });

      const mediaFile = {
        url: `http://localhost:5001${response.data.file.url}`,
        type: file.type,
        name: file.name,
        size: file.size,
      };

      onUpload(mediaFile);
      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Error uploading file. Please try again.';
      
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        errorMessage = 'Upload was cancelled.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. The file may be too large or the connection is slow.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please try a smaller file.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  }, [onUpload]);

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const dropzoneConfig = {
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 200 * 1024 * 1024, // 200MB
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, rejectedFiles } = useDropzone(dropzoneConfig);

  // Safety check for props (after all hooks)
  if (!onUpload || !onClose) {
    console.error('MediaUpload: Missing required props onUpload or onClose');
    return null;
  }

  const getFileIcon = (file) => {
    if (file && file.type) {
      if (file.type.startsWith('image/')) {
        return <FaImage />;
      } else if (file.type.startsWith('video/')) {
        return <FaVideo />;
      }
    }
    return <FaCloudUploadAlt />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="media-upload-modal">
      <div className="media-upload-content">
        <div className="upload-header">
          <h2>Add Media to Slide</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="upload-area">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
                <button 
                  className="cancel-upload-btn"
                  onClick={cancelUpload}
                  type="button"
                >
                  <FaStop /> Cancel Upload
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <FaCloudUploadAlt className="upload-icon" />
                <h3>Drop your media here</h3>
                <p>or click to browse files</p>
                <div className="upload-info">
                  <p>Supported formats: JPG, PNG, GIF, MP4, MOV, AVI</p>
                  <p>Maximum file size: 200MB</p>
                  <p className="upload-warning">⚠️ Large video files may take several minutes to upload</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {acceptedFiles && acceptedFiles.length > 0 && !uploading && (
          <div className="accepted-files">
            <h4>Selected File:</h4>
            {acceptedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">
                  {getFileIcon(file)}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {rejectedFiles && rejectedFiles.length > 0 && (
          <div className="rejected-files">
            <h4>Rejected Files:</h4>
            {rejectedFiles.map((file, index) => (
              <div key={index} className="file-item error">
                <div className="file-icon">
                  {getFileIcon(file.file)}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.file.name}</div>
                  <div className="file-error">
                    {file.errors && file.errors.map((error, errorIndex) => (
                      <span key={errorIndex}>{error.message}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="upload-error">
            <p>{error}</p>
          </div>
        )}

        <div className="upload-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload; 