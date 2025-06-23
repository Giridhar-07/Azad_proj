import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AnimatedLogoComponent from './AnimatedLogoComponent';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Handle clicks outside of the mobile menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container container">
        <Link to="/" className="header__logo">
          <AnimatedLogoComponent />
        </Link>
        
        {/* Mobile menu toggle button */}
        <button 
          className={`header__mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav 
          ref={navRef}
          className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}
        >
          <Link 
            to="/" 
            className={`header__link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="header__link-text">Home</span>
            <span className="header__link-indicator"></span>
          </Link>
          <Link 
            to="/services" 
            className={`header__link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            <span className="header__link-text">Services</span>
            <span className="header__link-indicator"></span>
          </Link>
          <Link 
            to="/about" 
            className={`header__link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            <span className="header__link-text">About</span>
            <span className="header__link-indicator"></span>
          </Link>
          <Link 
            to="/careers" 
            className={`header__link ${location.pathname === '/careers' ? 'active' : ''}`}
          >
            <span className="header__link-text">Careers</span>
            <span className="header__link-indicator"></span>
          </Link>
          <Link 
            to="/contact" 
            className={`header__link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            <span className="header__link-text">Contact</span>
            <span className="header__link-indicator"></span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;