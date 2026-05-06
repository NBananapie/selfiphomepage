"use client";

import React from 'react';
import GlassCard from './GlassCard';
import { useLanguage } from '@/context/LanguageContext';
import { SiWechat, SiXiaohongshu, SiX } from 'react-icons/si';

export default function SocialSection() {
  const { t } = useLanguage();

  const getIcon = (id: string) => {
    switch(id) {
      case 'wechat': return <SiWechat className="w-8 h-8" />;
      case 'xiaohongshu': return <SiXiaohongshu className="w-8 h-8" />;
      case 'x': return <SiX className="w-8 h-8" />;
      default: return null;
    }
  };

  return (
    <section id="contact" className="w-full py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.social.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t.social.subtitle}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
        {t.social.platforms.map((platform) => (
          <a
            key={platform.id}
            href="#"
            className="group w-full md:w-1/3 block cursor-pointer"
          >
            <GlassCard hoverable className={`h-full flex items-center p-6 sm:p-8 transition-shadow duration-500 ${platform.shadow} bg-white/40 dark:bg-slate-900/40`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 ${platform.color} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                {getIcon(platform.id)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                  {platform.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {platform.label}
                </p>
              </div>
            </GlassCard>
          </a>
        ))}
      </div>
    </section>
  );
}
