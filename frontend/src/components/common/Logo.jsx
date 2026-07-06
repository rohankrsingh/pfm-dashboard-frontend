import React from 'react';

export default function Logo({ 
  className = "", 
  showText = true, 
  textClassName = "text-xl", 
  iconContainerClassName = "w-8 h-8", 
  innerSvgClassName = "w-full h-full text-primary" 
}) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className={`${iconContainerClassName} flex items-center justify-center shrink-0`}>
        {/* Isometric stacked diamond logo (wealth/layers vibe) */}
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={innerSvgClassName}>
          <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="currentColor" />
          <path d="M2 23L16 30L30 23V16L16 23L2 16V23Z" fill="currentColor" fillOpacity="0.6"/>
          <path d="M2 16L16 23L30 16V9L16 16L2 9V16Z" fill="currentColor" fillOpacity="0.3"/>
        </svg>
      </div>
      {showText && <span className={`font-black tracking-tight text-foreground ${textClassName}`}>PFM</span>}
    </div>
  );
}
