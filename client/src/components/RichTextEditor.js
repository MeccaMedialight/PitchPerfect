import React, { useState, useRef, useEffect } from 'react';
import {
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaFont, FaTextHeight, FaPalette, FaListUl, FaListOl, FaQuoteLeft, FaStrikethrough, FaCog
} from 'react-icons/fa';
import fontManager from '../utils/fontManager';
import CustomFontUpload from './CustomFontUpload';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [categorizedFonts, setCategorizedFonts] = useState({});
  const [showFontManager, setShowFontManager] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  useEffect(() => {
    // Set placeholder attribute for better accessibility
    if (editorRef.current && placeholder) {
      editorRef.current.setAttribute('data-placeholder', placeholder);
    }
  }, [placeholder]);

  // Load fonts
  useEffect(() => {
    const allFonts = fontManager.getAllFonts();
    const categorized = fontManager.getFontsByCategory();
    setCategorizedFonts(categorized);
  }, []);

  // Handle content synchronization
  useEffect(() => {
    if (editorRef.current && value === '' && editorRef.current.innerHTML !== '') {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Only trigger onChange if content actually changed
      if (content !== value) {
        onChange(content);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Ensure cursor is at the end when focusing
    if (editorRef.current && !editorRef.current.textContent.trim()) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleFontAdded = (customFont) => {
    // Reload fonts after adding a custom font
    const allFonts = fontManager.getAllFonts();
    const categorized = fontManager.getFontsByCategory();
    setCategorizedFonts(categorized);
  };

  const handleFontRemoved = (fontValue) => {
    // Reload fonts after removing a custom font
    const allFonts = fontManager.getAllFonts();
    const categorized = fontManager.getFontsByCategory();
    setCategorizedFonts(categorized);
  };

  const execCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Use a more robust approach for formatting commands
      if (command === 'bold' || command === 'italic' || command === 'underline' || command === 'strikethrough') {
        // Custom implementation for text formatting
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (!range.collapsed) {
            // Apply formatting to selected text
            try {
              document.execCommand(command, false, value);
            } catch (error) {
              // Fallback: wrap selection in appropriate tag
              const tag = command === 'bold' ? 'strong' : 
                         command === 'italic' ? 'em' : 
                         command === 'underline' ? 'u' : 's';
              const element = document.createElement(tag);
              try {
                range.surroundContents(element);
              } catch (surroundError) {
                // If surroundContents fails, try a different approach
                const fragment = range.extractContents();
                element.appendChild(fragment);
                range.insertNode(element);
              }
            }
          } else {
            // No selection, apply to current position
            document.execCommand(command, false, value);
          }
        } else {
          // Fallback to execCommand
          document.execCommand(command, false, value);
        }
      } else if (command === 'fontName' || command === 'fontSize' || command === 'foreColor') {
        document.execCommand(command, false, value);
      } else if (command === 'formatBlock') {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, value);
      }
      
      handleInput();
    }
  };

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (error) {
      // Fallback: check if the current selection is within the specified tag
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Check if the container or its parent has the formatting
        const tag = command === 'bold' ? 'strong' : 
                   command === 'italic' ? 'em' : 
                   command === 'underline' ? 'u' : 's';
        
        let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
        while (element && element !== editorRef.current) {
          if (element.tagName && element.tagName.toLowerCase() === tag) {
            return true;
          }
          element = element.parentElement;
        }
      }
      return false;
    }
  };

  const ToolbarButton = ({ command, icon, title, value = null, children = null, onClick = null }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      const updateActiveState = () => {
        if (editorRef.current && document.activeElement === editorRef.current) {
          setIsActive(isCommandActive(command));
        }
      };

      document.addEventListener('selectionchange', updateActiveState);
      return () => document.removeEventListener('selectionchange', updateActiveState);
    }, [command]);

    const handleClick = () => {
      if (onClick) {
        onClick();
      } else {
        execCommand(command, value);
      }
    };

    return (
      <button
        type="button"
        className={`toolbar-btn ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        title={title}
      >
        {icon}
        {children}
      </button>
    );
  };

  const FontSelect = () => {
    return (
      <select
        className="toolbar-select"
        onChange={(e) => execCommand('fontName', e.target.value)}
        title="Font Family"
      >
        <option value="">Select Font</option>
        {Object.entries(categorizedFonts).map(([category, categoryFonts]) => (
          <optgroup key={category} label={category}>
            {categoryFonts.map(font => (
              <option 
                key={font.value} 
                value={font.value} 
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  };

  const FontSizeSelect = () => {
    const sizes = [
      { value: 1, label: 'Very Small' },
      { value: 2, label: 'Small' },
      { value: 3, label: 'Normal' },
      { value: 4, label: 'Medium' },
      { value: 5, label: 'Large' },
      { value: 6, label: 'Very Large' },
      { value: 7, label: 'Extra Large' }
    ];
    
    return (
      <select
        className="toolbar-select"
        onChange={(e) => execCommand('fontSize', e.target.value)}
        title="Font Size"
      >
        {sizes.map(size => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    );
  };

  const ColorPicker = () => {
    return (
      <input
        type="color"
        className="toolbar-color-picker"
        onChange={(e) => execCommand('foreColor', e.target.value)}
        title="Text Color"
      />
    );
  };

  return (
    <div className={`rich-text-editor ${className || ''} ${isFocused ? 'focused' : ''}`}>
      <div className="toolbar">
        {/* Text Formatting */}
        <div className="toolbar-group">
          <ToolbarButton command="bold" icon={<FaBold />} title="Bold (Ctrl+B)" />
          <ToolbarButton command="italic" icon={<FaItalic />} title="Italic (Ctrl+I)" />
          <ToolbarButton command="underline" icon={<FaUnderline />} title="Underline (Ctrl+U)" />
          <ToolbarButton command="strikethrough" icon={<FaStrikethrough />} title="Strikethrough" />
        </div>

        <div className="toolbar-separator" />

        {/* Font Options */}
        <div className="toolbar-group">
          <div className="toolbar-select-wrapper">
            <FaFont className="toolbar-select-icon" />
            <FontSelect />
          </div>
          <div className="toolbar-select-wrapper">
            <FaTextHeight className="toolbar-select-icon" />
            <FontSizeSelect />
          </div>
          <div className="toolbar-select-wrapper">
            <FaPalette className="toolbar-select-icon" />
            <ColorPicker />
          </div>
          <ToolbarButton 
            command="fontManager" 
            icon={<FaCog />} 
            title="Font Manager"
            onClick={() => setShowFontManager(!showFontManager)}
          />
        </div>

        <div className="toolbar-separator" />

        {/* Alignment */}
        <div className="toolbar-group">
          <ToolbarButton command="justifyLeft" icon={<FaAlignLeft />} title="Align Left" />
          <ToolbarButton command="justifyCenter" icon={<FaAlignCenter />} title="Align Center" />
          <ToolbarButton command="justifyRight" icon={<FaAlignRight />} title="Align Right" />
          <ToolbarButton command="justifyFull" icon={<FaAlignJustify />} title="Justify" />
        </div>

        <div className="toolbar-separator" />

        {/* Lists and Quotes */}
        <div className="toolbar-group">
          <ToolbarButton command="insertUnorderedList" icon={<FaListUl />} title="Bullet List" />
          <ToolbarButton command="insertOrderedList" icon={<FaListOl />} title="Numbered List" />
          <ToolbarButton command="formatBlock" icon={<FaQuoteLeft />} title="Quote Block" value="blockquote" />
        </div>
      </div>

      {/* Font Manager Panel */}
      {showFontManager && (
        <div className="font-manager-panel">
          <CustomFontUpload 
            onFontAdded={handleFontAdded}
            onFontRemoved={handleFontRemoved}
          />
        </div>
      )}

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditor; 