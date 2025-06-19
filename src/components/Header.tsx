import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AnimatedLogoComponent from './AnimatedLogoComponent';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header">
      <div className="header__container container">
        <Link to="/" className="header__logo">
          <AnimatedLogoComponent />
        </Link>
        <nav className="header__nav">
          <Link 
            to="/" 
            className={`header__link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/services" 
            className={`header__link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            Services
          </Link>
          <Link 
            to="/about" 
            className={`header__link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
            <Link 
            to="/careers" 
            className={`header__link ${location.pathname === '/careers' ? 'active' : ''}`}
          >
            Careers
          </Link>
          <Link 
            to="/contact" 
            className={`header__link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;