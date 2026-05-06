"use client";

import React from 'react';
import GlassCard from './GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogSection() {
  const { t } = useLanguage();

  return (
    <section id="blog" className="w-full py-20 px-4 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.blog.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              {t.blog.subtitle}
            </p>
          </div>
          <a href="#" className="hidden md:inline-flex items-center text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer">
            {t.blog.viewAll}
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.blog.posts.map((post) => (
            <GlassCard key={post.id} hoverable className="flex flex-col cursor-pointer bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                  {post.category}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {post.readTime}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3">
                {post.excerpt}
              </p>
              <div className="text-xs text-slate-500 font-medium pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                {post.date}
              </div>
            </GlassCard>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <a href="#" className="inline-flex items-center text-amber-600 dark:text-amber-500 font-medium hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            {t.blog.viewAll}
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
