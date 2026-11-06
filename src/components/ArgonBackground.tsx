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

  const isDarkRef = useRef(isDark);
  const glyphRef = useRef(currentGlyph);

  useEffect(() => {
    isDarkRef.current = isDark;
    glyphRef.current = currentGlyph;
  }, [isDark, currentGlyph]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: ArgonRenderer | null = null;
    const initRenderer = () => {
      try {
        renderer = new ArgonRenderer(canvas);
      } catch (err) {
        console.warn('Failed to initialize WebGL ArgonRenderer:', err);
        renderer = null;
      }
    };

    initRenderer();
    if (!renderer) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const config: ArgonConfig = {
      family: 0,
      colorMode: isDarkRef.current ? 'dark' : 'light',
      themePreference: 'auto',
      seed: 36,
      center: [0.40, 0.28],
      curve: [0.73, 0.70],
      spread: 68,
      softness: 64,
      beamIntensity: 60,
      showMotif: false,
      motifText: glyphRef.current,
      motifSize: 58,
      motifPosX: 0,
      motifPosY: 0,
      motifOpacity: 85,
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
      holdPoint: [0.5, 0.5],
    };

    let targetPointer: [number, number] = [0, 0];
    let isPointerDown = false;
    let holdTargetUV: [number, number] = [0.5, 0.5];
    let targetHoverUV: [number, number] = [0.5, 0.5];
    let isHovering = false;

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
      targetHoverUV = [nx, ny];
      isHovering = true;
      if (isPointerDown) {
        holdTargetUV = [nx, ny];
      }
    };

    const handlePointerLeave = () => {
      isHovering = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, [role="dialog"]')) {
        return;
      }
      isPointerDown = true;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = e.clientX / w;
      const ny = e.clientY / h;
      holdTargetUV = [nx, ny];
      interaction.holdPoint = [nx, ny];
      // Switch the powder field on; grains are recruited nearest-first and stream in as the field grows
      renderer?.beginGather(nx, ny);
      document.body.style.userSelect = 'none';
    };

    const stopHold = () => {
      if (isPointerDown) {
        isPointerDown = false;
        document.body.style.userSelect = '';
        renderer?.release();
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fade = Math.max(0.45, 1 - scrollY / 1100);
      canvas.style.opacity = `${fade}`;
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      initRenderer();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', stopHold, { passive: true });
    window.addEventListener('pointercancel', stopHold, { passive: true });
    window.addEventListener('blur', stopHold, { passive: true });

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const renderLoop = (now: number) => {
      if (isVisible && renderer) {
        const timeSec = (now - startTime) * 0.001;

        interaction.pointer[0] += (targetPointer[0] - interaction.pointer[0]) * 0.06;
        interaction.pointer[1] += (targetPointer[1] - interaction.pointer[1]) * 0.06;

        interaction.hover[0] += (targetHoverUV[0] - interaction.hover[0]) * 0.12;
        interaction.hover[1] += (targetHoverUV[1] - interaction.hover[1]) * 0.12;
        const targetHoverAmount = isHovering ? 1.0 : 0.0;
        interaction.hoverAmount += (targetHoverAmount - interaction.hoverAmount) * 0.08;

        if (isPointerDown) {
          interaction.holdPoint[0] += (holdTargetUV[0] - interaction.holdPoint[0]) * 0.09;
          interaction.holdPoint[1] += (holdTargetUV[1] - interaction.holdPoint[1]) * 0.09;
        }

        config.colorMode = isDarkRef.current ? 'dark' : 'light';
        config.motifText = glyphRef.current;

        renderer.render(config, timeSec, interaction);
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.userSelect = '';
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', stopHold);
      window.removeEventListener('pointercancel', stopHold);
      window.removeEventListener('blur', stopHold);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer?.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />
    </div>
  );
}
