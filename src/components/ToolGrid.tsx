"use client";

import React from 'react';
import GlassCard from './GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export default function ToolGrid() {
  const { t } = useLanguage();

  const tools = [
    {
      id: 'ai-translator',
      name: 'AI Translator',
      description: 'A lightning-fast, highly accurate document translation tool powered by MiniMax models.',
      url: 'https://aitranslator.justganit.com/',
      icon: '🌐',
      status: t.tools.statusLive,
    },
    {
      id: 'douyin-scraper',
      name: 'Douyin Data Scraper',
      description: 'Advanced data extraction pipeline for Douyin (TikTok China) analytics and insights.',
      url: '#',
      icon: '📊',
      status: t.tools.statusSoon,
    },
  ];

  return (
    <section id="tools" className="w-full py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t.tools.title}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {t.tools.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <a
            key={tool.id}
            href={tool.url}
            target={tool.url !== '#' ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="group block cursor-pointer"
          >
            <GlassCard hoverable className="h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  tool.status === t.tools.statusLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {tool.status}
                </span>
              </div>
              <div className="text-5xl mb-6 mt-4 group-hover:scale-110 transition-transform duration-300">
                {tool.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-500 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-600 flex-grow">
                {tool.description}
              </p>
              
              <div className="mt-8 flex items-center text-amber-600 font-medium">
                {tool.url !== '#' ? t.tools.launch : t.tools.learnMore}
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </GlassCard>
          </a>
        ))}
        
        {/* Placeholder for future tools */}
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">{t.tools.comingSoon}</h3>
          <p className="text-slate-500 text-sm">{t.tools.workingOn}</p>
        </div>
      </div>
    </section>
  );
}
