"use client";

import React from 'react';
import GlassCard from './GlassCard';
import SectionReveal from './SectionReveal';
import { useLanguage } from '@/context/LanguageContext';

export default function ToolGrid() {
  const { t } = useLanguage();

  return (
    <section id="tools" className="w-full py-24 sm:py-32 px-4 max-w-6xl mx-auto">
      <SectionReveal>
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {t.tools.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            {t.tools.subtitle}
          </p>
        </div>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {t.tools.items.map((tool, index) => {
          const isLive = tool.statusKey === 'statusLive' && tool.url !== '#';
          const statusText = isLive ? t.tools.statusLive : t.tools.statusSoon;

          const cardInner = (
            <GlassCard
              hoverable={isLive}
              className="h-full flex flex-col relative overflow-hidden bg-white/50 dark:bg-slate-900/40 border border-white/80 dark:border-slate-800/80"
            >
              <div className="absolute top-0 right-0 p-5 z-10">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isLive
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {statusText}
                </span>
              </div>
              <div className="text-5xl mb-6 mt-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                {tool.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed flex-grow">
                {tool.description}
              </p>

              <div
                className={`mt-8 flex items-center font-bold text-sm ${
                  isLive
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {isLive ? t.tools.launch : t.tools.learnMore}
                {isLive && (
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </div>
            </GlassCard>
          );

          return (
            <SectionReveal key={tool.id} delayMs={index * 120}>
              {isLive ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full cursor-pointer"
                >
                  {cardInner}
                </a>
              ) : (
                <div role="article" aria-disabled="true" className="block h-full select-none">
                  {cardInner}
                </div>
              )}
            </SectionReveal>
          );
        })}

        {/* Future tools slot */}
        <SectionReveal delayMs={360}>
          <div className="h-full border-2 border-dashed border-slate-300/80 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity bg-white/20 dark:bg-slate-900/20">
            <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t.tools.comingSoon}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.tools.workingOn}</p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
