"use client";

import { useEffect, useRef } from 'react';

export default function MouseTracker() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isHoveringNav = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      document.documentElement.style.setProperty('--mouse-x', `${targetX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${targetY}px`);

      const target = e.target as HTMLElement;
      isHoveringNav = !!target?.closest('header');
    };

    const handleMouseLeaveWindow = () => {
      targetX = -1000;
      targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const render = () => {
      // 0.2 factor delivers instant responsive tracking without lag or stutter
      currentX = lerp(currentX, targetX, 0.22);
      currentY = lerp(currentY, targetY, 0.22);

      if (spotlight) {
        // Hardware accelerated GPU composite
        spotlight.style.transform = `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;
        spotlight.style.opacity = isHoveringNav || currentX < -500 ? '0' : '1';
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={spotlightRef}
      className="global-spotlight pointer-events-none fixed top-0 left-0 z-10 w-[600px] h-[600px] rounded-full hidden md:block will-change-transform transition-opacity duration-300"
    />
  );
}
