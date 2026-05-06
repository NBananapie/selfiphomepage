"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--nav-mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--nav-mouse-y', `${y}px`);
  };

  return (
    <header className="fixed top-0 w-full z-50 px-4 py-4 pointer-events-none">
      <div 
        onMouseMove={handleMouseMove}
        className="max-w-6xl mx-auto flex justify-between items-center liquid-glass nav-spotlight rounded-full px-6 py-3 pointer-events-auto"
      >
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={scrollToTop}
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/50 dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform">
            <Image 
              src="/logo-fist.jpg" 
              alt="JustGanIt Logo" 
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-200">
            JustGanIt
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm font-semibold rounded-full bg-slate-800 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
}
