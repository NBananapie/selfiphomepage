"use client";

import React from 'react';
import GlassCard from './GlassCard';
import { useLanguage } from '@/context/LanguageContext';
import { Disc3, Music2, ExternalLink, Sparkles } from 'lucide-react';
import { SiApplemusic } from 'react-icons/si';

export default function MusicSection() {
  const { t } = useLanguage();
  const music = (t as any).music;

  if (!music) return null;

  return (
    <section id="music" className="w-full py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Release Track</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {music.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {music.subtitle}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <GlassCard hoverable className="p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-white/60 via-amber-50/20 to-white/40 dark:from-slate-900/60 dark:via-amber-950/20 dark:to-slate-900/40 border border-white/60 dark:border-slate-800/60 shadow-2xl">
          {/* Ambient glow in corner */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

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
                <span>Single Track</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                {music.trackTitle}
              </h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                {music.artist}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 max-w-xl">
                {music.description}
              </p>

              {/* Streaming Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {music.platforms.map((p: any) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
      </div>
    </section>
  );
}
