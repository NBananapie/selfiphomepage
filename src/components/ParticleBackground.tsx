"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;

  constructor(width: number, height: number, colors: string[]) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.baseAlpha = Math.random() * 0.5 + 0.1;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let alpha = this.baseAlpha;
    let radius = this.radius;

    if (distance < 250) {
      const intensity = 1 - distance / 250;
      alpha += intensity * 0.6;
      radius += intensity * 2;
      
      this.x -= (dx / distance) * intensity * 0.5;
      this.y -= (dy / distance) * intensity * 0.5;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    
    // Sophisticated, soft palettes
    const lightColors = ['#F59E0B', '#FBBF24', '#38BDF8', '#818CF8', '#E2E8F0'];
    const darkColors = ['#FACC15', '#F59E0B', '#38BDF8', '#C084FC', '#475569'];
    const colors = theme === 'dark' ? darkColors : lightColors;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const density = theme === 'dark' ? 11000 : 13000; // slightly cleaner density in light mode
      const particleCount = Math.floor((canvas.width * canvas.height) / density); 
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height, colors));
      }
    };

    resize();
    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = (currentScrollY - lastScrollY) * 0.15;
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Decay scroll velocity smoothly
      scrollVelocity *= 0.92;

      particles.forEach((particle) => {
        // Apply vertical scroll parallax
        particle.y -= scrollVelocity * (particle.radius * 0.5);
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, mouseX, mouseY);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60 transition-opacity duration-700"
    />
  );
}
