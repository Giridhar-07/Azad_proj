import React, { useEffect, useRef } from 'react';
import { AnimatedLogo } from './AnimatedLogo';

const AnimatedLogoComponent: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const animatedLogoRef = useRef<AnimatedLogo | null>(null);

  useEffect(() => {
    if (logoRef.current && !animatedLogoRef.current) {
      animatedLogoRef.current = new AnimatedLogo(logoRef.current);
    }

    return () => {
      if (animatedLogoRef.current) {
        // Cleanup if needed
        animatedLogoRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={logoRef}
      className="logo"
      style={{
        background: 'linear-gradient(45deg, #00f5ff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2rem',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      AZAYD
    </div>
  );
};

export default AnimatedLogoComponent;