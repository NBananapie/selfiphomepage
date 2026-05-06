"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full pt-32 pb-20 px-4 min-h-[90vh] flex flex-col justify-center items-center overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:hidden"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:hidden"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-yellow-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:hidden"></div>

      <div className="z-10 flex flex-col items-center text-center max-w-4xl mx-auto animate-float">
        <div className="mb-6 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/60 dark:border-slate-800/60 shadow-xl relative z-10 bg-slate-100 dark:bg-slate-800">
            <Image 
              src="/logo-fist.jpg" 
              alt="Gan Avatar" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 128px"
              priority
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-amber-400 dark:bg-amber-500 blur-xl opacity-40 animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-6 drop-shadow-sm">
          {t.hero.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500">{t.hero.name}</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed font-light">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => scrollToSection('tools')}
            className="px-8 py-4 rounded-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-900 font-semibold text-lg hover:bg-slate-800 dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {t.hero.explore}
          </button>
          <button 
            onClick={() => scrollToSection('blog')}
            className="px-8 py-4 rounded-full glass hover:bg-white/60 dark:hover:bg-slate-800/60 font-semibold text-lg text-slate-800 dark:text-slate-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
          >
            {t.hero.blog}
          </button>
        </div>
      </div>
    </section>
  );
}
