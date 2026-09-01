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
  // 'down': entering from bottom (downward scroll) -> start at +32px
  // 'up': entering from top (upward scroll) -> start at -32px
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const domRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastScrollYRef.current) > 3) {
        setScrollDirection(currentY > lastScrollYRef.current ? 'down' : 'up');
        lastScrollYRef.current = currentY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const currentRef = domRef.current;
    if (!currentRef) return () => window.removeEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // If leaving from top, next time if we scroll up it drops from top (-32px)
          // If leaving from bottom, next time if we scroll down it floats from bottom (+32px)
          const rect = entry.boundingClientRect;
          if (rect.top < 0) {
            setScrollDirection('up');
          } else {
            setScrollDirection('down');
          }
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
      window.removeEventListener('scroll', handleScroll);
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Natural wave translation offset based on scroll vector
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
