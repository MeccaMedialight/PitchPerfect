import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';

// Components
import Header from './components/Header';
import Home from './pages/Home';
import TemplateSelector from './pages/TemplateSelector';
import PresentationBuilder from './pages/PresentationBuilder';
import PresentationViewer from './pages/PresentationViewer';
import SavedPresentations from './pages/SavedPresentations';
import SlideLayoutDesigner from './pages/SlideLayoutDesigner';
import CustomLayouts from './pages/CustomLayouts';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/templates" element={<TemplateSelector />} />
            <Route path="/builder/:templateId" element={<PresentationBuilder />} />
            <Route path="/view/:presentationId" element={<PresentationViewer />} />
            <Route path="/saved" element={<SavedPresentations />} />
            <Route path="/layout-designer" element={<SlideLayoutDesigner />} />
        <Route path="/custom-layouts" element={<CustomLayouts />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  );
}

export default App;
