import React from 'react';
import logoDarkSrc from '../assets/logo_dark.png';

interface BrandLogoProps {
  className?: string;
  onDark?: boolean; // true = white logo (dark backgrounds), false = dark logo (light backgrounds)
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-8 h-8', onDark = false }) => {
  return (
    <img
      src={logoDarkSrc}
      alt="Invoicy"
      draggable={false}
      className={className}
      style={{
        objectFit: 'contain',
        filter: onDark ? 'brightness(0) invert(1)' : 'brightness(0)',
      }}
    />
  );
};
