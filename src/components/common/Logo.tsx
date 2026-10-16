/**
 * Professional Banking Brand Mark (Logo) for JP MORGAN
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true, light = false }) => {
  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 30 : 24;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`${dimensions} bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-lg flex items-center justify-center text-amber-400 shadow-md relative overflow-hidden`}
      >
        {/* Subtle radial sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.15),transparent_70%)]"></div>
        
        {/* Professional Interlocking J & P Monogram SVG */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 text-amber-400 drop-shadow-sm"
        >
          {/* Serif J Stem & Hook */}
          <path
            d="M11 7V21C11 23.2091 12.7909 25 15 25C17.2091 25 19 23.2091 19 21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M7 7H15"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          {/* Integrated P Loop */}
          <path
            d="M15 7H20C22.2091 7 24 8.79086 24 11C24 13.2091 22.2091 15 20 15H15V7Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div>
          <div className={`font-serif font-bold tracking-[0.2em] text-sm sm:text-base leading-tight ${light ? 'text-white' : 'text-slate-900'}`}>
            JPMORGAN
          </div>
          <div className={`text-[9px] tracking-[0.25em] uppercase font-semibold ${light ? 'text-amber-400/90' : 'text-amber-700'}`}>
            Global Financial Services
          </div>
        </div>
      )}
    </div>
  );
};
