"use client";

import { useEffect, useState } from 'react';

export default function MouseTracker() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isHoveringNav, setIsHoveringNav] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsHoveringNav(!!target.closest('header'));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      className="global-spotlight pointer-events-none fixed z-10 rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:block transition-all duration-300 ease-out"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: isHoveringNav ? '0px' : '650px',
        height: isHoveringNav ? '0px' : '650px',
        opacity: isHoveringNav ? 0 : 1,
      }}
    />
  );
}
