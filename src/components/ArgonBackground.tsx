"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/LanguageContext';
import { ArgonConfig, InteractionState } from '@/lib/argon/types';
import { ArgonRenderer } from '@/lib/argon/renderer';

export default function ArgonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const { language } = useLanguage();

  const isDark = (resolvedTheme || theme) === 'dark';
  const currentGlyph = language === 'zh' ? '干' : 'DO';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: ArgonRenderer | null = null;
    try {
      renderer = new ArgonRenderer(canvas);
    } catch (err) {
      console.warn('Failed to initialize WebGL ArgonRenderer:', err);
      return;
    }

    let animationFrameId: number;
    let startTime = performance.now();

    const config: ArgonConfig = {
      family: 0,
      colorMode: isDark ? 'dark' : 'light',
      themePreference: 'auto',
      seed: 36,
      center: [0.40, 0.28],
      curve: [0.73, 0.70],
      spread: 68,
      softness: 64,
      beamIntensity: 60,
      showMotif: true,
      motifText: currentGlyph,
      motifSize: 94,
      motifPosX: 0,
      motifPosY: -1,
      motifOpacity: 54,
      idleEvap: 56,
      motifEvap: 52,
      density: 24,
      sparkScale: 105,
      sparkSizeFalloff: 28,
      sparkOpacityDark: 68,
      sparkOpacityLight: 48,
      prominence: 78,
      meshDepth: 52,
      sparkPosX: 0,
      sparkPosY: 10,
      secondMesh: true,
      density2: 68,
      spark2Scale: 140,
      spark2SizeFalloff: 38,
      spark2OpacityDark: 52,
      spark2OpacityLight: 72,
      meshDepth2: 72,
      spark2PosX: 15,
      spark2PosY: -20,
      grain: 28,
      energy: 72,
      duration: 15,
      seamlessLoop: true,
      parallax: true,
      ripple: true,
      hoverReactivity: 35,
      hoverSize: 100,
      repulsion: 22,
      reach: 100,
    };

    const interaction: InteractionState = {
      pointer: [0, 0],
      hover: [0.5, 0.5],
      hoverAmount: 0,
      tap: [0.5, 0.5],
      tapAge: 10,
    };

    let targetPointer: [number, number] = [0, 0];
    let targetHover: [number, number] = [0.5, 0.5];
    let targetHoverAmount = 0;
    let lastTapTime = -1000;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handlePointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = e.clientX / w;
      const ny = e.clientY / h;
      targetPointer = [(nx - 0.5) * 2, (ny - 0.5) * 2];
      targetHover = [nx, ny];
      targetHoverAmount = 1.0;
    };

    const handlePointerLeave = () => {
      targetHoverAmount = 0.0;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      interaction.tap = [e.clientX / w, e.clientY / h];
      lastTapTime = performance.now();
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fade = Math.max(0.40, 1 - scrollY / 900);
      canvas.style.opacity = `${fade}`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const renderLoop = (now: number) => {
      if (isVisible) {
        const timeSec = (now - startTime) * 0.001;

        // Smoothly interpolate interactions
        interaction.pointer[0] += (targetPointer[0] - interaction.pointer[0]) * 0.06;
        interaction.pointer[1] += (targetPointer[1] - interaction.pointer[1]) * 0.06;
        interaction.hover[0] += (targetHover[0] - interaction.hover[0]) * 0.08;
        interaction.hover[1] += (targetHover[1] - interaction.hover[1]) * 0.08;
        interaction.hoverAmount += (targetHoverAmount - interaction.hoverAmount) * 0.06;

        interaction.tapAge = (now - lastTapTime) * 0.001;

        config.colorMode = isDark ? 'dark' : 'light';
        config.motifText = currentGlyph;

        renderer?.render(config, timeSec, interaction);
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer?.destroy();
    };
  }, [isDark, currentGlyph]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />
    </div>
  );
}
