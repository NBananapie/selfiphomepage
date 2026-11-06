"use client";

import React, { useEffect, useRef, useState } from 'react';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export default function SectionReveal({
  children,
  className = '',
  delayMs = 0,
}: SectionRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  // 'down': entering from bottom (downward scroll) -> start at +36px
  // 'up': entering from top (upward scroll) -> start at -36px
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Determine which edge the element exited from without needing a window scroll listener
          setScrollDirection(entry.boundingClientRect.top < 0 ? 'up' : 'down');
        }
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.08,
        rootMargin: '-20px 0px -20px 0px',
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  const initialTranslate = scrollDirection === 'down' ? 'translate-y-9' : '-translate-y-9';

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
      }}
      className={`transition-all duration-700 cubic-bezier(0.22, 1, 0.36, 1) transform will-change-transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 filter-none'
          : `opacity-0 ${initialTranslate} scale-[0.985] blur-[2px]`
      } ${className}`}
    >
      {children}
    </div>
  );
}
