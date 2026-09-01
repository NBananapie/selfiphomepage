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
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle visibility bidirectionally on scroll up and down
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
      }}
      className={`transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1) transform will-change-transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 filter-none'
          : 'opacity-0 translate-y-8 scale-[0.98] blur-[2px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
