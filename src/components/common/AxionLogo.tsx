import React from 'react';

interface AxionLogoProps {
  className?: string;
  size?: number;
}

export const AxionLogo: React.FC<AxionLogoProps> = ({ className = "w-8 h-8", size }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="axion-h-gradient" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
      </defs>

      {/* 1. Left Vertical Outer Leaf (Top-Left sharp point) */}
      <path
        d="M 14 92 
           L 14 62 
           C 14 34, 22 12, 38 6 
           C 44 14, 46 26, 46 40 
           L 34 40 
           C 34 28, 32 18, 28 14 
           C 24 22, 24 38, 24 60 
           L 24 92 
           Z"
        fill="url(#axion-h-gradient)"
      />

      {/* 2. Right Vertical Outer Leaf (Bottom-Right sharp point - 180deg symmetric) */}
      <path
        d="M 86 8 
           L 86 38 
           C 86 66, 78 88, 62 94 
           C 56 86, 54 74, 54 60 
           L 66 60 
           C 66 72, 68 82, 72 86 
           C 76 78, 76 62, 76 40 
           L 76 8 
           Z"
        fill="url(#axion-h-gradient)"
      />

      {/* 3. Interlocking S-Bridge Underpass (From Top-Right across to Bottom-Left) */}
      <path
        d="M 72 8 
           L 72 42 
           C 72 58, 58 66, 42 64 
           C 30 62, 20 52, 16 40 
           L 26 38 
           C 30 48, 36 54, 44 55 
           C 56 57, 62 52, 62 42 
           L 62 8 
           Z"
        fill="url(#axion-h-gradient)"
      />

      {/* 4. Interlocking S-Bridge Overpass with White Separation Gap (From Bottom-Left across to Top-Right) */}
      {/* White Gap Outline */}
      <path
        d="M 28 92 
           L 28 58 
           C 28 42, 42 34, 58 36 
           C 70 38, 80 48, 84 60 
           L 74 62 
           C 70 52, 64 46, 56 45 
           C 44 43, 38 48, 38 58 
           L 38 92 
           Z"
        stroke="white"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="white"
      />

      {/* Colored Overpass Ribbon */}
      <path
        d="M 28 92 
           L 28 58 
           C 28 42, 42 34, 58 36 
           C 70 38, 80 48, 84 60 
           L 74 62 
           C 70 52, 64 46, 56 45 
           C 44 43, 38 48, 38 58 
           L 38 92 
           Z"
        fill="url(#axion-h-gradient)"
      />
    </svg>
  );
};
