# PitchPerfect Player API - Slide Rendering Specification

## Overview
This document provides a comprehensive specification for how slides are rendered in PitchPerfect, ensuring perfect consistency between the main PitchPerfect application and the PitchPerfectPlayer App.

## Core Rendering Principles

### 1. Coordinate System
- **Design Canvas**: All custom layouts use an 800x600 pixel coordinate system
- **Conversion**: Pixel coordinates are converted to percentages for responsive rendering
- **Formula**: `percentage = (pixel / baseDimension) * 100`
  - X: `(x / 800) * 100`
  - Y: `(y / 600) * 100`
  - Width: `(width / 800) * 100`
  - Height: `(height / 600) * 100`

### 2. Rich Text Rendering
- **Content Storage**: All text content is stored as HTML (not plain text)
- **Rendering Method**: Use `dangerouslySetInnerHTML` (React) or equivalent
- **Font Support**: Custom fonts are loaded via FontFace API and applied via `fontFamily` CSS property
- **Formatting**: Supports bold, italic, underline, strikethrough, color, alignment, lists, quotes

### 3. Slide Types and Structure

#### A. Title Slide (`type: 'title'`)
```javascript
{
  type: 'title',
  title: 'string',           // Main title
  subtitle: 'string',        // Optional subtitle
  content: 'string'          // HTML content (optional)
}
```

**Rendering Structure:**
```html
<div class="slide-content title-slide">
  <h1 class="slide-title">{title}</h1>
  {subtitle && <div class="slide-subtitle">{subtitle}</div>}
  {content && <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />}
</div>
```

#### B. Content Slide (`type: 'content'`)
```javascript
{
  type: 'content',
  title: 'string',           // Slide title
  content: 'string'          // HTML content
}
```

**Rendering Structure:**
```html
<div class="slide-content content-slide">
  <h2 class="slide-title">{title}</h2>
  <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />
</div>
```

#### C. Image Slide (`type: 'image'`)
```javascript
{
  type: 'image',
  title: 'string',           // Slide title
  imageUrl: 'string',        // Image URL
  content: 'string'          // HTML content (optional)
}
```

**Rendering Structure:**
```html
<div class="slide-content image-slide">
  <h2 class="slide-title">{title}</h2>
  {imageUrl && (
    <div class="slide-media">
      <img src={imageUrl} alt={title} />
    </div>
  )}
  {content && <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />}
</div>
```

#### D. Video Slide (`type: 'video'`)
```javascript
{
  type: 'video',
  title: 'string',           // Slide title
  videoUrl: 'string',        // Video URL
  content: 'string'          // HTML content (optional)
}
```

**Rendering Structure:**
```html
<div class="slide-content video-slide">
  <h2 class="slide-title">{title}</h2>
  {videoUrl && (
    <div class="slide-media">
      <video controls>
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  )}
  {content && <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />}
</div>
```

#### E. Contact Slide (`type: 'contact'`)
```javascript
{
  type: 'contact',
  title: 'string',           // Slide title
  email: 'string',           // Email address
  phone: 'string',           // Phone number
  website: 'string',         // Website URL
  content: 'string'          // HTML content (optional)
}
```

**Rendering Structure:**
```html
<div class="slide-content contact-slide">
  <h2 class="slide-title">{title}</h2>
  <div class="contact-info">
    {email && (
      <div class="contact-item">
        <span class="contact-icon">📧</span>
        <span class="contact-value">{email}</span>
      </div>
    )}
    {phone && (
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span class="contact-value">{phone}</span>
      </div>
    )}
    {website && (
      <div class="contact-item">
        <span class="contact-icon">🌐</span>
        <span class="contact-value">{website}</span>
      </div>
    )}
  </div>
  {content && <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />}
</div>
```

#### F. Multi-Media Slide (`type: 'multi-media'`)
```javascript
{
  type: 'multi-media',
  title: 'string',           // Slide title
  content: 'string',         // HTML content (optional)
  mediaItems: [              // Array of media items
    {
      id: 'string',
      type: 'image' | 'video',
      url: 'string',
      caption: 'string',
      position: {
        x: number,           // Percentage (0-100)
        y: number,           // Percentage (0-100)
        width: number,       // Percentage (0-100)
        height: number       // Percentage (0-100)
      }
    }
  ]
}
```

**Rendering Structure:**
```html
<div class="slide-content multi-media-slide">
  <h2 class="slide-title">{title}</h2>
  {content && <div class="slide-body" dangerouslySetInnerHTML={{ __html: content }} />}
  <div class="multi-media-container">
    {mediaItems.map(item => (
      <div class="media-item" style={{
        position: 'absolute',
        left: `${item.position.x}%`,
        top: `${item.position.y}%`,
        width: `${item.position.width}%`,
        height: `${item.position.height}%`,
        zIndex: index + 1
      }}>
        {item.type === 'image' && <img src={item.url} alt={item.caption} />}
        {item.type === 'video' && (
          <video controls>
            <source src={item.url} type="video/mp4" />
          </video>
        )}
        {item.caption && <div class="media-caption">{item.caption}</div>}
      </div>
    ))}
  </div>
</div>
```

#### G. Custom Layout Slide (`type: 'custom-layout'`)
```javascript
{
  type: 'custom-layout',
  title: 'string',           // Layout name
  layoutId: 'string',        // Layout ID
  layoutSlots: [             // Array of layout slots
    {
      id: 'string',
      type: 'text' | 'image' | 'video',
      content: 'string',     // HTML content for text, URL for media
      position: {
        x: number,           // Pixels (0-800)
        y: number            // Pixels (0-600)
      },
      size: {
        width: number,       // Pixels (0-800)
        height: number       // Pixels (0-600)
      },
      // Styling properties
      backgroundColor: 'string',
      padding: number,
      borderRadius: number,
      borderWidth: number,
      borderColor: 'string',
      boxShadow: 'small' | 'medium' | 'large' | 'none',
      objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down',
      autoplay: boolean,     // For video slots
      muted: boolean,        // For video slots
      fontFamily: 'string'   // For text slots
    }
  ]
}
```

**Rendering Structure:**
```html
<div class="slide-content custom-layout-slide">
  <div class="custom-layout-container">
    {layoutSlots.map((slot, index) => {
      // Convert pixel coordinates to percentages
      const xPct = (slot.position.x / 800) * 100;
      const yPct = (slot.position.y / 600) * 100;
      const wPct = (slot.size.width / 800) * 100;
      const hPct = (slot.size.height / 600) * 100;
      
      return (
        <div class="layout-slot" style={{
          position: 'absolute',
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: `${wPct}%`,
          height: `${hPct}%`,
          zIndex: index + 1,
          background: slot.backgroundColor || 'transparent',
          padding: `${slot.padding || 0}px`,
          borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
          border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
          boxShadow: slot.boxShadow === 'small' ? '0 2px 4px rgba(0,0,0,0.1)' :
                    slot.boxShadow === 'medium' ? '0 4px 8px rgba(0,0,0,0.15)' :
                    slot.boxShadow === 'large' ? '0 8px 16px rgba(0,0,0,0.2)' : 'none'
        }}>
          {slot.type === 'image' && slot.content && (
            <img src={slot.content} alt="Slot content" style={{
              width: '100%',
              height: '100%',
              objectFit: slot.objectFit || 'cover',
              borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
              border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none'
            }} />
          )}
          {slot.type === 'video' && slot.content && (
            <video controls autoPlay={!!slot.autoplay} muted={!!slot.muted} style={{
              width: '100%',
              height: '100%'
            }}>
              <source src={slot.content} type="video/mp4" />
            </video>
          )}
          {slot.type === 'text' && (
            <div style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              textAlign: 'left',
              padding: `${slot.padding || 0}px`,
              background: slot.backgroundColor || 'transparent',
              borderRadius: slot.borderRadius ? `${slot.borderRadius}px` : '0',
              border: slot.borderWidth ? `${slot.borderWidth}px solid ${slot.borderColor || '#000000'}` : 'none',
              fontFamily: slot.fontFamily || 'inherit'
            }} dangerouslySetInnerHTML={{ __html: slot.content || '' }} />
          )}
        </div>
      );
    })}
  </div>
</div>
```

## CSS Classes and Styling

### Core Slide Classes
- `.slide-content` - Base slide container
- `.slide-title` - Slide title styling
- `.slide-subtitle` - Slide subtitle styling
- `.slide-body` - Slide content body styling
- `.slide-media` - Media container styling

### Slide Type Classes
- `.title-slide` - Title slide specific styles
- `.content-slide` - Content slide specific styles
- `.image-slide` - Image slide specific styles
- `.video-slide` - Video slide specific styles
- `.contact-slide` - Contact slide specific styles
- `.multi-media-slide` - Multi-media slide specific styles
- `.custom-layout-slide` - Custom layout slide specific styles

### Custom Layout Classes
- `.custom-layout-container` - Custom layout container
- `.layout-slot` - Individual layout slot
- `.slot-text` - Text slot content
- `.slot-placeholder` - Empty slot placeholder

## Font Management

### Custom Font Loading
```javascript
// Load custom fonts when rendering
const customFonts = fontManager.customFonts;
customFonts.forEach(font => {
  if (font.base64 && !document.fonts.check(`12px "${font.value}"`)) {
    const fontFace = new FontFace(font.value, `url(${font.base64})`);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
    });
  }
});
```

### Font Application
- Text slots: Apply via `fontFamily` CSS property
- Rich text content: Fonts are embedded in HTML content
- Fallback: Use `inherit` or system fonts

## Responsive Design

### Breakpoints
- **Mobile**: `max-width: 768px`
- **Tablet**: `min-width: 768px and max-width: 1024px`
- **Desktop**: `min-width: 1024px`

### Scaling
- All dimensions use percentages for responsive scaling
- Custom layouts maintain aspect ratio through coordinate conversion
- Text scales proportionally with viewport size

## Media Handling

### Images
- **Object Fit**: `cover`, `contain`, `fill`, `none`, `scale-down`
- **Border Radius**: Applied via `borderRadius` property
- **Borders**: Applied via `borderWidth` and `borderColor` properties
- **Shadows**: Applied via `boxShadow` property

### Videos
- **Controls**: Always enabled
- **Autoplay**: Controlled via `autoplay` property
- **Muted**: Controlled via `muted` property
- **Object Fit**: Same as images

## Error Handling

### Missing Content
- Show placeholder for missing images/videos
- Display fallback text for missing content
- Graceful degradation for missing fonts

### Invalid Data
- Validate slide type before rendering
- Provide default values for missing properties
- Log errors for debugging

## Performance Considerations

### Optimization
- Lazy load images and videos
- Preload critical fonts
- Use CSS transforms for animations
- Minimize reflows and repaints

### Memory Management
- Clean up video elements when slides change
- Dispose of custom fonts when not needed
- Clear intervals and timeouts

## Implementation Checklist

### Required Features
- [ ] Support all slide types (title, content, image, video, contact, multi-media, custom-layout)
- [ ] Implement coordinate conversion for custom layouts
- [ ] Support rich text rendering with HTML
- [ ] Load and apply custom fonts
- [ ] Handle responsive design
- [ ] Implement error handling
- [ ] Support media controls and autoplay
- [ ] Apply styling consistently

### Optional Features
- [ ] Slide transitions
- [ ] Fullscreen mode
- [ ] Touch gestures
- [ ] Keyboard navigation
- [ ] Print support
- [ ] Accessibility features

## Testing

### Test Cases
1. **Title Slide**: Verify title, subtitle, and content rendering
2. **Content Slide**: Verify title and rich text content
3. **Image Slide**: Verify image display and fallback
4. **Video Slide**: Verify video controls and autoplay
5. **Contact Slide**: Verify contact information display
6. **Multi-Media Slide**: Verify multiple media items positioning
7. **Custom Layout**: Verify coordinate conversion and slot rendering
8. **Rich Text**: Verify HTML content and custom fonts
9. **Responsive**: Verify scaling across different screen sizes
10. **Error Handling**: Verify graceful degradation

### Validation
- Compare rendered output with PitchPerfect main app
- Test coordinate accuracy for custom layouts
- Verify font rendering consistency
- Check responsive behavior
- Validate accessibility compliance

This specification ensures perfect consistency between PitchPerfect and PitchPerfectPlayer App by providing detailed rendering requirements for all slide types and features. 