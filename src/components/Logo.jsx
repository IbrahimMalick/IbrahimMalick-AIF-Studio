import React from "react";

export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <svg 
      viewBox="0 0 1200 400" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#2E3192", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#8B3A8B", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FF6B35", stopOpacity:1}} />
        </linearGradient>
        
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:"#2E3192", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FF6B35", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      <g id="logo-icon" transform="translate(50, 100)">
        <path d="M 40 200 L 80 80 L 120 200 M 60 150 L 100 150" 
              stroke="url(#iconGradient)" 
              strokeWidth="12" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"/>
        
        <path d="M 140 80 L 140 200 M 140 80 L 200 80 M 140 140 L 180 140" 
              stroke="url(#iconGradient)" 
              strokeWidth="12" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"/>
        
        <path d="M 60 140 Q 40 120, 60 140 T 100 140 Q 120 160, 100 140 T 140 140 Q 160 120, 140 140 T 180 140"
              stroke="#8B3A8B" 
              strokeWidth="6" 
              fill="none" 
              opacity="0.6"
              strokeLinecap="round"/>
      </g>
      
      <g id="company-name" transform="translate(320, 100)">
        <text x="0" y="80" 
              fontFamily="Montserrat, sans-serif" 
              fontWeight="700" 
              fontSize="72" 
              fill="#2E3192">AI</text>
        
        <text x="120" y="80" 
              fontFamily="Montserrat, sans-serif" 
              fontWeight="700" 
              fontSize="72" 
              fill="#2E3192">FREEDOM</text>
        
        <text x="0" y="160" 
              fontFamily="Montserrat, sans-serif" 
              fontWeight="300" 
              fontSize="48" 
              fill="#4B5563"
              letterSpacing="8">STUDIOS</text>
        
        <text x="0" y="220" 
              fontFamily="Inter, sans-serif" 
              fontWeight="400" 
              fontSize="18" 
              fill="#9CA3AF"
              letterSpacing="2">UNLEASH AI • AMPLIFY FREEDOM • SCALE EVERYTHING</text>
      </g>
      
      <rect x="320" y="250" width="500" height="3" fill="url(#brandGradient)" opacity="0.3"/>
    </svg>
  );
}