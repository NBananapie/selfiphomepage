"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between glass px-6 py-3 rounded-full max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <Image 
          src="/logo-fist.jpg" 
          alt="Gan Logo" 
          width={36} 
          height={36} 
          className="rounded-full border border-white/50 shadow-sm"
        />
        <span className="font-bold text-lg text-slate-800 tracking-tight hidden sm:block">
          JustGanIt
        </span>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={toggleLanguage}
          className="px-4 py-1.5 rounded-full bg-white/60 hover:bg-white/90 text-sm font-semibold text-slate-700 transition-colors border border-white/40 shadow-sm"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
    </header>
  );
}
