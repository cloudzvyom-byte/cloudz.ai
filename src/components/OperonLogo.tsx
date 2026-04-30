import React from 'react';

export function OperonLogo({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="5"
      className={className}
      {...props}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" />
      
      {/* Horizontal and vertical axes */}
      <path d="M50 5 L50 95 M5 50 L95 50" />
      
      {/* Meridians (ellipses) */}
      <path d="M50 5 A 22 45 0 0 0 50 95 A 22 45 0 0 0 50 5" />
      
      {/* Central Sparkle/Star */}
      <path 
        d="M50 20 Q50 50 20 50 Q50 50 50 80 Q50 50 80 50 Q50 50 50 20 Z" 
        fill="currentColor" 
        stroke="none" 
      />
    </svg>
  );
}
