"use client";

import React from 'react';
import GlassCard from './GlassCard';
import SectionReveal from './SectionReveal';
import { useLanguage } from '@/context/LanguageContext';
import { Disc3, Music2, ExternalLink, Sparkles } from 'lucide-react';
import { SiApplemusic } from 'react-icons/si';

export default function MusicSection() {
  const { t } = useLanguage();
  const { music } = t;

  return (
    <section id="music" className="w-full py-24 sm:py-32 px-4 max-w-6xl mx-auto">
      <SectionReveal>
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{music.badge}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {music.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            {music.subtitle}
          </p>
        </div>
      </SectionReveal>

      <div className="max-w-4xl mx-auto">
        <SectionReveal delayMs={150}>
          <GlassCard
            hoverable
            className="p-8 sm:p-12 relative overflow-hidden bg-white/60 dark:bg-slate-900/50 border border-white/90 dark:border-slate-800/80 shadow-xl"
          >
            {/* Soft Ambient glow in corner */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-300/15 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
              {/* Spinning Vinyl Visual */}
              <div className="relative group/vinyl flex-shrink-0">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-950 dark:bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center relative overflow-hidden animate-[spin_20s_linear_infinite] group-hover/vinyl:animate-[spin_6s_linear_infinite]">
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-white/10" />
                  <div className="absolute inset-5 rounded-full border border-white/10" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                  <div className="absolute inset-11 rounded-full border border-white/10" />
                  {/* Center Label */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
                    <div className="w-4 h-4 rounded-full bg-slate-950 border-2 border-white/50" />
                  </div>
                </div>
                {/* Disc Badge */}
                <div className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30">
                  <Disc3 className="w-5 h-5 animate-spin" />
                </div>
              </div>

              {/* Song Info & Links */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                  <Music2 className="w-4 h-4" />
                  <span>{music.trackType}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                  {music.trackTitle}
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  {music.artist}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                  {music.description}
                </p>

                {/* Streaming Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  {music.platforms.map((p) => (
                    <a
                      key={p.id}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      {p.id === 'apple-music' ? (
                        <SiApplemusic className="w-5 h-5 text-rose-500" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                          QQ
                        </span>
                      )}
                      <span>{p.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}
