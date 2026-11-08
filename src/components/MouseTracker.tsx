"use client";

import { useEffect, useRef } from 'react';

export default function MouseTracker() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    // Skip on coarse pointer (touch) devices or when reduced motion is enabled
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isHoveringNav = false;
    let animationFrameId: number | null = null;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const render = () => {
      currentX = lerp(currentX, targetX, 0.22);
      currentY = lerp(currentY, targetY, 0.22);

      spotlight.style.transform = `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;
      spotlight.style.opacity = isHoveringNav || targetX < -500 ? '0' : '1';

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);

      if (dx > 0.5 || dy > 0.5) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        animationFrameId = null;
      }
    };

    const scheduleRender = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target instanceof Element ? e.target : null;
      isHoveringNav = Boolean(target?.closest('header'));
      scheduleRender();
    };

    const handleMouseLeaveWindow = () => {
      targetX = -1000;
      targetY = -1000;
      spotlight.style.opacity = '0';
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className="global-spotlight pointer-events-none fixed top-0 left-0 z-10 w-[600px] h-[600px] rounded-full hidden md:block will-change-transform transition-opacity duration-300 opacity-0"
    />
  );
}
