import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle__icon-container">
        <Sun 
          className={`theme-toggle__icon theme-toggle__icon--sun ${
            !isDark ? 'theme-toggle__icon--active' : ''
          }`}
          size={20}
        />
        <Moon 
          className={`theme-toggle__icon theme-toggle__icon--moon ${
            isDark ? 'theme-toggle__icon--active' : ''
          }`}
          size={20}
        />
      </div>
      <div className="theme-toggle__background"></div>
    </button>
  );
};

export default ThemeToggle;