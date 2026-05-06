"use client";

import React from 'react';
import GlassCard from './GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export default function SocialSection() {
  const { t } = useLanguage();
  
  const platforms = [
    {
      id: 'wechat',
      name: 'WeChat Official',
      label: '微信公众号',
      color: 'bg-green-100 text-green-700',
      shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5 13.5c-2.9 0-5.2-2-5.2-4.5s2.3-4.5 5.2-4.5 5.2 2 5.2 4.5-2.3 4.5-5.2 4.5zm0-7.5c-2 0-3.5 1.3-3.5 3s1.6 3 3.5 3 3.5-1.3 3.5-3-1.6-3-3.5-3zm8.2 8.5c-2.4 0-4.3-1.6-4.3-3.7 0-.3 0-.6.1-.9 2.1-.3 3.7-2.1 3.7-4.2 0-.2 0-.5-.1-.7 1.6.4 2.8 1.9 2.8 3.7 0 2.1-1.9 3.7-4.3 3.7-2.4 0-4.3-1.6-4.3-3.7 0-.3 0-.6.1-.9 2.1-.3 3.7-2.1 3.7-4.2 0-.2 0-.5-.1-.7 1.6.4 2.8 1.9 2.8 3.7 0 2.1-1.9 3.7-4.3 3.7z" />
        </svg>
      )
    },
    {
      id: 'xiaohongshu',
      name: 'Xiaohongshu',
      label: '小红书',
      color: 'bg-red-100 text-red-600',
      shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5h2v5h-2zm1-9c-.83 0-1.5-.67-1.5-1.5S11.17 6 12 6s1.5.67 1.5 1.5S12.83 7.5 12 7.5z" />
        </svg>
      )
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      label: 'X.com',
      color: 'bg-slate-200 text-slate-800',
      shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(15,23,42,0.3)]',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ];

  return (
    <section className="w-full py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t.social.title}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {t.social.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {platforms.map((platform) => (
          <a key={platform.id} href="#" className="group block w-full sm:w-auto">
            <GlassCard hoverable className={`flex items-center space-x-4 pr-12 transition-all duration-300 ${platform.shadow}`}>
              <div className={`p-3 rounded-2xl ${platform.color}`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{platform.name}</h3>
                <p className="text-sm text-slate-500">{platform.label}</p>
              </div>
            </GlassCard>
          </a>
        ))}
      </div>
    </section>
  );
}
