
import React from 'react';

const Logo: React.FC<{ className?: string, theme?: 'GNOSIS' | 'ABYSS' | 'BONE' }> = ({ className = "w-24 h-24", theme = 'GNOSIS' }) => {
  const stops = {
    GNOSIS: { start: "#818cf8", mid: "#6366f1", end: "#312e81" },
    ABYSS: { start: "#ffffff", mid: "#6366f1", end: "#1e1b4b" },
    BONE: { start: "#4f46e5", mid: "#6366f1", end: "#e0e7ff" }
  }[theme];

  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`humanoidGradient-${theme}`} x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stops.start} stopOpacity="0.8" />
          <stop offset="50%" stopColor={stops.mid} stopOpacity="0.6" />
          <stop offset="100%" stopColor={stops.end} stopOpacity="0.9" />
        </linearGradient>
        <filter id="liquidGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.38  0 0 0 0 0.4  0 0 0 0 0.94  0 0 0 1 0" />
        </filter>
      </defs>
      
      {/* Realistic Humanoid Silhouette Outline */}
      <g filter={theme !== 'BONE' ? "url(#liquidGlow)" : ""} opacity={theme === 'BONE' ? "0.9" : "0.7"}>
        <path d="M100 25C88 25 78 35 78 48C78 61 88 71 100 71C112 71 122 61 122 48C122 35 112 25 100 25Z" fill={`url(#humanoidGradient-${theme})`} />
        <path d="M100 75C85 75 60 82 50 95C40 108 38 135 38 150V180H162V150C162 135 160 108 150 95C140 82 115 75 100 75Z" fill={`url(#humanoidGradient-${theme})`} />
      </g>

      {/* Detail Layer: Neural Circuits */}
      <path 
        d="M100 48V60M90 45H110M85 105L70 130M115 105L130 130M100 85V160" 
        stroke={theme === 'BONE' ? "#4f46e5" : "white"} 
        strokeWidth="0.8" 
        strokeOpacity="0.3" 
        strokeLinecap="round" 
      />
      
      {/* Core Gnosis Point */}
      <circle cx="100" cy="48" r="1.5" fill={theme === 'BONE' ? "#4f46e5" : "#818cf8"}>
        <animate attributeName="r" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Orbital Data Streams */}
      <circle cx="100" cy="100" r="85" stroke={theme === 'BONE' ? "#6366f1" : "white"} strokeWidth="0.2" strokeOpacity="0.1" strokeDasharray="1 4" />
      <circle cx="100" cy="100" r="70" stroke={theme === 'BONE' ? "#6366f1" : "white"} strokeWidth="0.2" strokeOpacity="0.05" strokeDasharray="10 5" />
    </svg>
  );
};

export default Logo;
