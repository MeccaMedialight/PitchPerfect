// Font Management Utility
class FontManager {
  constructor() {
    this.builtInFonts = [
      { value: 'Arial', label: 'Arial', category: 'Sans-serif' },
      { value: 'Helvetica', label: 'Helvetica', category: 'Sans-serif' },
      { value: 'Verdana', label: 'Verdana', category: 'Sans-serif' },
      { value: 'Tahoma', label: 'Tahoma', category: 'Sans-serif' },
      { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'Sans-serif' },
      { value: 'Arial Black', label: 'Arial Black', category: 'Sans-serif' },
      { value: 'Impact', label: 'Impact', category: 'Sans-serif' },
      { value: 'Comic Sans MS', label: 'Comic Sans MS', category: 'Sans-serif' },
      { value: 'Times New Roman', label: 'Times New Roman', category: 'Serif' },
      { value: 'Georgia', label: 'Georgia', category: 'Serif' },
      { value: 'Palatino', label: 'Palatino', category: 'Serif' },
      { value: 'Garamond', label: 'Garamond', category: 'Serif' },
      { value: 'Bookman', label: 'Bookman', category: 'Serif' },
      { value: 'Courier New', label: 'Courier New', category: 'Monospace' },
      { value: 'Courier', label: 'Courier', category: 'Monospace' },
      { value: 'Monaco', label: 'Monaco', category: 'Monospace' },
      { value: 'Consolas', label: 'Consolas', category: 'Monospace' },
      { value: 'Lucida Console', label: 'Lucida Console', category: 'Monospace' },
      { value: 'Brush Script MT', label: 'Brush Script MT', category: 'Script' },
      { value: 'Lucida Handwriting', label: 'Lucida Handwriting', category: 'Script' },
      { value: 'Bradley Hand', label: 'Bradley Hand', category: 'Script' },
      { value: 'Segoe UI', label: 'Segoe UI', category: 'Sans-serif' },
      { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
      { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
      { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
      { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
      { value: 'Raleway', label: 'Raleway', category: 'Sans-serif' },
      { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
      { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Sans-serif' },
      { value: 'Ubuntu', label: 'Ubuntu', category: 'Sans-serif' },
      { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
      { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
      { value: 'Lora', label: 'Lora', category: 'Serif' },
      { value: 'Crimson Text', label: 'Crimson Text', category: 'Serif' },
      { value: 'PT Serif', label: 'PT Serif', category: 'Serif' },
      { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' },
      { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
      { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
      { value: 'Dancing Script', label: 'Dancing Script', category: 'Script' },
      { value: 'Pacifico', label: 'Pacifico', category: 'Script' },
      { value: 'Great Vibes', label: 'Great Vibes', category: 'Script' },
      { value: 'Satisfy', label: 'Satisfy', category: 'Script' },
      { value: 'Kaushan Script', label: 'Kaushan Script', category: 'Script' }
    ];

    this.customFonts = this.loadCustomFonts();
    this.loadGoogleFonts();
  }

  // Load custom fonts from localStorage
  loadCustomFonts() {
    try {
      const savedFonts = localStorage.getItem('customFonts');
      return savedFonts ? JSON.parse(savedFonts) : [];
    } catch (error) {
      console.error('Error loading custom fonts:', error);
      return [];
    }
  }

  // Save custom fonts to localStorage
  saveCustomFonts() {
    try {
      localStorage.setItem('customFonts', JSON.stringify(this.customFonts));
    } catch (error) {
      console.error('Error saving custom fonts:', error);
    }
  }

  // Get all fonts (built-in + custom)
  getAllFonts() {
    return [...this.builtInFonts, ...this.customFonts];
  }

  // Get fonts by category
  getFontsByCategory() {
    const allFonts = this.getAllFonts();
    const categorized = {};

    allFonts.forEach(font => {
      if (!categorized[font.category]) {
        categorized[font.category] = [];
      }
      categorized[font.category].push(font);
    });

    return categorized;
  }

  // Add a custom font
  async addCustomFont(fontFile, fontName) {
    try {
      // Create a unique font family name
      const fontFamilyName = `Custom_${fontName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      // Convert file to base64
      const base64 = await this.fileToBase64(fontFile);
      
      // Create font face
      const fontFace = new FontFace(fontFamilyName, `url(${base64})`);
      
      // Load the font
      await fontFace.load();
      document.fonts.add(fontFace);

      // Add to custom fonts
      const customFont = {
        value: fontFamilyName,
        label: fontName,
        category: 'Custom',
        custom: true,
        base64: base64
      };

      this.customFonts.push(customFont);
      this.saveCustomFonts();

      return customFont;
    } catch (error) {
      console.error('Error adding custom font:', error);
      throw new Error('Failed to add custom font');
    }
  }

  // Remove a custom font
  removeCustomFont(fontValue) {
    this.customFonts = this.customFonts.filter(font => font.value !== fontValue);
    this.saveCustomFonts();
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Load Google Fonts
  loadGoogleFonts() {
    const googleFonts = this.builtInFonts.filter(font => 
      ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway', 'Poppins', 
       'Source Sans Pro', 'Ubuntu', 'Playfair Display', 'Merriweather', 
       'Lora', 'Crimson Text', 'PT Serif', 'Source Code Pro', 'Fira Code', 
       'JetBrains Mono', 'Dancing Script', 'Pacifico', 'Great Vibes', 
       'Satisfy', 'Kaushan Script'].includes(font.value)
    );

    if (googleFonts.length > 0) {
      const fontFamilies = googleFonts.map(font => {
        // Handle font names with spaces
        return font.value.replace(/\s+/g, '+');
      }).join('|');
      
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }

  // Check if font is loaded
  isFontLoaded(fontFamily) {
    return document.fonts.check(`12px "${fontFamily}"`);
  }

  // Get font preview text
  getFontPreviewText(fontFamily) {
    return `${fontFamily}`;
  }
}

// Create singleton instance
const fontManager = new FontManager();

export default fontManager;
