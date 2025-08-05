import React, { useState, useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from 'react-icons/fa';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const getSelection = () => {
    return window.getSelection();
  };

  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };

  const ToolbarButton = ({ command, icon, title, value = null }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      const updateActiveState = () => {
        setIsActive(isCommandActive(command));
      };

      document.addEventListener('selectionchange', updateActiveState);
      return () => document.removeEventListener('selectionchange', updateActiveState);
    }, [command]);

    return (
      <button
        type="button"
        className={`toolbar-btn ${isActive ? 'active' : ''}`}
        onClick={() => execCommand(command, value)}
        title={title}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className={`rich-text-editor ${className || ''} ${isFocused ? 'focused' : ''}`}>
      <div className="toolbar">
        <ToolbarButton command="bold" icon={<FaBold />} title="Bold (Ctrl+B)" />
        <ToolbarButton command="italic" icon={<FaItalic />} title="Italic (Ctrl+I)" />
        <ToolbarButton command="underline" icon={<FaUnderline />} title="Underline (Ctrl+U)" />
        
        <div className="toolbar-separator" />
        
        <ToolbarButton command="justifyLeft" icon={<FaAlignLeft />} title="Align Left" />
        <ToolbarButton command="justifyCenter" icon={<FaAlignCenter />} title="Align Center" />
        <ToolbarButton command="justifyRight" icon={<FaAlignRight />} title="Align Right" />
        <ToolbarButton command="justifyFull" icon={<FaAlignJustify />} title="Justify" />
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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