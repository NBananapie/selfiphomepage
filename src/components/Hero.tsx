"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full pt-36 pb-24 px-4 min-h-[92vh] flex flex-col justify-center items-center overflow-hidden">
      {/* Soft Ambient Light Cones */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-200/15 dark:bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none animate-blob animation-delay-2000"></div>

      <div className="z-10 flex flex-col items-center text-center max-w-4xl mx-auto animate-float">
        <div className="mb-8 relative">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white/80 dark:border-slate-800/80 shadow-2xl relative z-10 bg-slate-100 dark:bg-slate-800">
            <Image 
              src="/logo-fist.jpg" 
              alt="Gan Avatar" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 112px, 144px"
              priority
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-amber-400 dark:bg-amber-500 blur-2xl opacity-30 animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-6 drop-shadow-sm">
          {t.hero.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 dark:from-amber-400 dark:via-amber-500 dark:to-orange-400">{t.hero.name}</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed font-normal">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => scrollToSection('tools')}
            className="px-9 py-4 rounded-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-base md:text-lg hover:bg-slate-800 dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {t.hero.explore}
          </button>
          <button 
            onClick={() => scrollToSection('blog')}
            className="px-9 py-4 rounded-full liquid-glass hover:bg-white/80 dark:hover:bg-slate-800/80 font-bold text-base md:text-lg text-slate-800 dark:text-slate-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            {t.hero.blog}
          </button>
        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <div 
        onClick={() => scrollToSection('tools')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-slate-400 dark:text-slate-500"
      >
        <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-current animate-bounce" />
        </div>
      </div>
    </section>
  );
}
