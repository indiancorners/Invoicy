import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M28 15L75 15L50 50L3 50L28 15Z" 
        fill="currentColor" 
      />
      <path 
        d="M72 85L25 85L50 50L97 50L72 85Z" 
        fill="currentColor" 
      />
    </svg>
  );
};
