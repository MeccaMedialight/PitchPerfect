import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaPalette, FaFolder, FaPencilRuler, FaLayerGroup } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/templates', label: 'Templates', icon: <FaPalette /> },
    { path: '/layout-designer', label: 'Layout Designer', icon: <FaPencilRuler /> },
    { path: '/custom-layouts', label: 'Custom Layouts', icon: <FaLayerGroup /> },
    { path: '/saved', label: 'My Presentations', icon: <FaFolder /> },
  ];

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="PitchPerfect Logo" className="logo-image" />
          <span>PitchPerfect</span>
        </Link>
        
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header; 