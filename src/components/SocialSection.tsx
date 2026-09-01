"use client";

import React from 'react';
import GlassCard from './GlassCard';
import SectionReveal from './SectionReveal';
import { useLanguage } from '@/context/LanguageContext';
import { SiWechat, SiXiaohongshu, SiX } from 'react-icons/si';

export default function SocialSection() {
  const { t } = useLanguage();

  const getIcon = (id: string) => {
    switch(id) {
      case 'wechat': return <SiWechat className="w-7 h-7" />;
      case 'xiaohongshu': return <SiXiaohongshu className="w-7 h-7" />;
      case 'x': return <SiX className="w-7 h-7" />;
      default: return null;
    }
  };

  return (
    <section id="contact" className="w-full py-24 sm:py-32 px-4 max-w-6xl mx-auto">
      <SectionReveal>
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {t.social.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            {t.social.subtitle}
          </p>
        </div>
      </SectionReveal>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
        {t.social.platforms.map((platform, index) => (
          <SectionReveal key={platform.id} delayMs={index * 120} className="w-full md:w-1/3">
            <a
              href="#"
              className="group block h-full cursor-pointer"
            >
              <GlassCard hoverable className="h-full flex items-center p-6 sm:p-8 bg-white/50 dark:bg-slate-900/40 border border-white/80 dark:border-slate-800/80 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 ${platform.color} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-sm`}>
                  {getIcon(platform.id)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {platform.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                    {platform.label}
                  </p>
                </div>
              </GlassCard>
            </a>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
