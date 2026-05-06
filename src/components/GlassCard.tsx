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
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="white"
        glarePosition="all"
        scale={1.02}
        transitionSpeed={2500}
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
