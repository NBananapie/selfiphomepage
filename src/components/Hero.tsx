"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-yellow-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="z-10 animate-float">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
          {t.hero.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">{t.hero.name}</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#tools"
            className="px-8 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            {t.hero.explore}
          </a>
          <a
            href="#blog"
            className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold border border-slate-200 hover:border-yellow-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            {t.hero.blog}
          </a>
        </div>
      </div>
    </section>
  );
}
