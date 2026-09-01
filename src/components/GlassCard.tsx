"use client";

import React from 'react';
import Tilt from 'react-parallax-tilt';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function GlassCard({ children, className = '', hoverable = false }: GlassCardProps) {
  const baseClasses = `glass rounded-3xl p-8 backdrop-blur-xl ${className}`;
  const hoverClasses = hoverable ? 'glass-hover cursor-pointer' : '';

  if (hoverable) {
    return (
      <Tilt
        tiltMaxAngleX={4}
        tiltMaxAngleY={4}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="rgba(255, 255, 255, 0.6)"
        glarePosition="all"
        scale={1.015}
        transitionSpeed={2000}
        className="h-full rounded-3xl"
        glareBorderRadius="1.5rem"
      >
        <div className={`${baseClasses} ${hoverClasses} h-full`}>
          {children}
        </div>
      </Tilt>
    );
  }

  return (
    <div className={`${baseClasses} ${hoverClasses}`}>
      {children}
    </div>
  );
}
