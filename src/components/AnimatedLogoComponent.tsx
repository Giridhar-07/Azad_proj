import React from 'react';

const AnimatedLogoComponent: React.FC = () => {
  return (
    <div 
      className="logo gradient-text"
      style={{
        background: 'linear-gradient(45deg, #00f5ff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'var(--text-color)' // Fallback color for browsers that don't support background-clip
      }}
    >
      AZAYD
    </div>
  );
};

export default AnimatedLogoComponent;