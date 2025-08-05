import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaSave, FaDownload, FaEye, FaPlus, FaTrash, FaImage, 
  FaArrowLeft, FaGripVertical
} from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import config from '../config/config';
import SlideEditor from '../components/SlideEditor';
import MediaUpload from '../components/MediaUpload';
import IPadPreview from '../components/IPadPreview';
import './PresentationBuilder.css';

// Sortable Slide Item Component
const SortableSlideItem = ({ slide, index, isActive, onSelect, onDelete, totalSlides }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`slide-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onSelect(index)}
      whileHover={{ x: 5 }}
    >
      <div 
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        <FaGripVertical />
      </div>
      <div className="slide-number">{index + 1}</div>
      <div className="slide-info">
        <div className="slide-title">{slide.title}</div>
        <div className="slide-type">{slide.type}</div>
      </div>
      {totalSlides > 1 && (
        <button
          className="delete-slide"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
        >
          <FaTrash />
        </button>
      )}
    </motion.div>
  );
};

const PresentationBuilder = () => {
  
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [presentation, setPresentation] = useState({
    title: '',
    template: templateId,
    slides: [],
    settings: {}
  });
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showIPadPreview, setShowIPadPreview] = useState(false);
  const [currentSlideData, setCurrentSlideData] = useState(null);

  useEffect(() => {
    if (templateId === 'custom') {
      const initialSlide = {
        id: 'title',
        type: 'title',
        title: 'Title Slide',
        content: 'Your Presentation Title',
        subtitle: 'Your Subtitle'
      };
      setPresentation({
        title: 'Untitled Presentation',
        template: 'custom',
        slides: [initialSlide],
        settings: {}
      });
      setCurrentSlideData(initialSlide);
      setLoading(false);
    } else {
      // Check if this is a presentation ID (UUID format) or template ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);
      if (isUUID) {
        loadPresentation();
      } else {
        loadTemplate();
      }
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await axios.get(config.getApiUrl(`${config.TEMPLATES_ENDPOINT}/${templateId}`));
      console.log('Template response:', response.data);
      const slides = response.data.slides.map(slide => ({
        ...slide,
        id: slide.id || `slide-${Date.now()}-${Math.random()}`
      }));
      const firstSlide = slides[0];
      console.log('First slide data:', firstSlide);
      setPresentation({
        title: response.data.name,
        template: templateId,
        slides: slides,
        settings: {}
      });
      setCurrentSlideData(firstSlide);
      setLoading(false);
    } catch (error) {
      console.error('Error loading template:', error);
      setLoading(false);
    }
  };

  const loadPresentation = async () => {
    try {
      const response = await axios.get(config.getApiUrl(`${config.PRESENTATIONS_ENDPOINT}/${templateId}`));
      console.log('Presentation response:', response.data);
      const presentationData = response.data;
      setPresentation({
        id: presentationData.id,
        title: presentationData.title,
        template: presentationData.template || 'custom',
        slides: presentationData.slides,
        settings: presentationData.settings || {}
      });
      if (presentationData.slides && presentationData.slides.length > 0) {
        setCurrentSlideData(presentationData.slides[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading presentation:', error);
      setLoading(false);
    }
  };

  const updateSlide = (slideIndex, updatedSlide) => {
    const newSlides = [...presentation.slides];
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...updatedSlide };
    setPresentation(prevPresentation => ({ 
      ...prevPresentation, 
      slides: newSlides 
    }));
    // Update current slide data immediately for preview
    if (slideIndex === currentSlideIndex) {
      setCurrentSlideData(updatedSlide);
    }
  };

  const updateCurrentSlideImmediately = (updatedSlide) => {
    setCurrentSlideData(updatedSlide);
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}-${Math.random()}`,
      type: 'content',
      title: 'New Slide',
      content: 'Add your content here'
    };
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide]
    });
    setCurrentSlideIndex(presentation.slides.length);
    setCurrentSlideData(newSlide);
  };

  const deleteSlide = (slideIndex) => {
    if (presentation.slides.length <= 1) return;
    
    const newSlides = presentation.slides.filter((_, index) => index !== slideIndex);
    setPresentation({ ...presentation, slides: newSlides });
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
    
    // Update current slide data
    const newCurrentIndex = currentSlideIndex >= newSlides.length ? newSlides.length - 1 : currentSlideIndex;
    setCurrentSlideData(newSlides[newCurrentIndex]);
  };

  const savePresentation = async () => {
    setSaving(true);
    try {
      const presentationToSave = {
        ...presentation,
        updatedAt: new Date().toISOString(),
        title: presentation.title || 'Untitled Presentation'
      };
      
      let response;
      if (presentation.id) {
        // Update existing presentation
        response = await axios.put(config.getApiUrl(`${config.PRESENTATIONS_ENDPOINT}/${presentation.id}`), presentationToSave);
        alert('Presentation updated successfully!');
      } else {
        // Create new presentation
        presentationToSave.createdAt = new Date().toISOString();
        response = await axios.post(config.getApiUrl(config.PRESENTATIONS_ENDPOINT), presentationToSave);
        // Update the presentation state with the new ID
        setPresentation(prev => ({ ...prev, id: response.data.id }));
        alert('Presentation saved successfully!');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Error saving presentation');
      setSaving(false);
    }
  };

  const generateStandalone = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        config.getApiUrl(`${config.PRESENTATIONS_ENDPOINT}/${presentation.id || 'temp'}/generate`),
        presentation,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `presentation-${presentation.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSaving(false);
    } catch (error) {
      console.error('Error generating presentation:', error);
      alert('Error generating standalone presentation');
      setSaving(false);
    }
  };

  const handleMediaUpload = (mediaFile) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const updatedSlide = { ...currentSlide };
    
    if (currentSlide.type === 'multi-media') {
      // For multi-media slides, add the media to the mediaItems array
      const mediaItems = currentSlide.mediaItems || [];
      const newMediaItem = {
        id: `media-${Date.now()}`,
        type: mediaFile.type.startsWith('image/') ? 'image' : 'video',
        url: mediaFile.url,
        position: { x: 10 + (mediaItems.length * 20), y: 10 + (mediaItems.length * 20), width: 30, height: 30 },
        caption: ''
      };
      updatedSlide.mediaItems = [...mediaItems, newMediaItem];
    } else {
      // For regular slides, update the appropriate URL and type
      if (mediaFile.type.startsWith('image/')) {
        updatedSlide.imageUrl = mediaFile.url;
        updatedSlide.type = 'image';
      } else if (mediaFile.type.startsWith('video/')) {
        updatedSlide.videoUrl = mediaFile.url;
        updatedSlide.type = 'video';
      }
    }
    
    updateSlide(currentSlideIndex, updatedSlide);
    setShowMediaUpload(false);
  };

  // Drag and drop handlers
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPresentation((prevPresentation) => {
        const oldIndex = prevPresentation.slides.findIndex(slide => slide.id === active.id);
        const newIndex = prevPresentation.slides.findIndex(slide => slide.id === over.id);
        
        const newSlides = arrayMove(prevPresentation.slides, oldIndex, newIndex);
        
        // Update current slide index if the active slide was moved
        if (oldIndex === currentSlideIndex) {
          setCurrentSlideIndex(newIndex);
        } else if (oldIndex < currentSlideIndex && newIndex >= currentSlideIndex) {
          // Slide was moved from before current to after current
          setCurrentSlideIndex(currentSlideIndex - 1);
        } else if (oldIndex > currentSlideIndex && newIndex <= currentSlideIndex) {
          // Slide was moved from after current to before current
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
        
        return {
          ...prevPresentation,
          slides: newSlides
        };
      });
    }
  };

  if (loading) {
    return (
      <div className="presentation-builder loading">
        <div className="loading-spinner"></div>
        <p>Loading template...</p>
      </div>
    );
  }

  return (
    <div className="presentation-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/templates')}
          >
            <FaArrowLeft /> Back
          </button>
          <input
            type="text"
            value={presentation.title}
            onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
            className="presentation-title"
            placeholder="Presentation Title"
          />
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowIPadPreview(true)}
            style={{ 
              background: '#667eea',
              color: 'white',
              border: '2px solid #667eea'
            }}
          >
            <FaEye /> iPad Preview
          </button>
          <button 
            className="btn btn-primary"
            onClick={savePresentation}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={generateStandalone}
            disabled={saving}
          >
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div className="builder-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Slides ({presentation.slides.length})</h3>
            <button className="btn btn-primary btn-small" onClick={addSlide}>
              <FaPlus /> Add Slide
            </button>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={presentation.slides.map(slide => slide.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="slides-list">
                {presentation.slides.map((slide, index) => (
                  <SortableSlideItem
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isActive={index === currentSlideIndex}
                    onSelect={(index) => {
                      setCurrentSlideIndex(index);
                      setCurrentSlideData(slide);
                    }}
                    onDelete={deleteSlide}
                    totalSlides={presentation.slides.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

                 {/* Main Editor */}
         <div className="editor-main">
           <div className="editor-toolbar">
             <div className="toolbar-section">
               <button 
                 className="btn btn-secondary"
                 onClick={() => setShowMediaUpload(true)}
               >
                 <FaImage /> Add Media
               </button>
             </div>
             
             <div className="toolbar-section">
               <span>Slide {currentSlideIndex + 1} of {presentation.slides.length}</span>
             </div>
           </div>

           <div className="editor-content">
             {currentSlideData ? (
               <SlideEditor
                 key={`editor-${currentSlideIndex}-${currentSlideData.id}`}
                 slide={currentSlideData}
                 onUpdate={(updatedSlide) => updateSlide(currentSlideIndex, updatedSlide)}
                 onImmediateUpdate={updateCurrentSlideImmediately}
                 onAddMedia={() => setShowMediaUpload(true)}
               />
             ) : (
               <div className="loading-editor">
                 <div className="loading-spinner"></div>
                 <p>Loading slide editor...</p>
               </div>
             )}
           </div>
         </div>

                 
      </div>

             {/* Modals */}
       {showMediaUpload && (
         <MediaUpload
           onUpload={handleMediaUpload}
           onClose={() => setShowMediaUpload(false)}
         />
       )}

               {showIPadPreview && (
          <IPadPreview
            presentation={presentation}
            isOpen={showIPadPreview}
            onClose={() => setShowIPadPreview(false)}
            currentSlideIndex={currentSlideIndex}
          />
        )}
    </div>
  );
};

export default PresentationBuilder; 