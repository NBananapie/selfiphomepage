import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function GlassCard({ children, className = '', hoverable = false }: GlassCardProps) {
  return (
    <div
      className={`glass ${
        hoverable ? 'glass-card' : ''
      } rounded-3xl p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
