"use client";

import React from 'react';
import GlassCard from './GlassCard';
import SectionReveal from './SectionReveal';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogSection() {
  const { t } = useLanguage();
  const primaryPostUrl = t.blog.posts[0]?.url || '#';

  return (
    <section id="blog" className="w-full py-24 sm:py-32 px-4 max-w-6xl mx-auto">
      <SectionReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
              {t.blog.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base sm:text-lg">
              {t.blog.subtitle}
            </p>
          </div>
          <a
            href={primaryPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center text-amber-600 dark:text-amber-500 font-bold hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer text-sm"
          >
            {t.blog.viewAll}
            <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.blog.posts.map((post, index) => (
          <SectionReveal key={post.id} delayMs={index * 100}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full cursor-pointer"
            >
              <GlassCard
                hoverable
                className="h-full flex flex-col bg-white/50 dark:bg-slate-900/40 border border-white/80 dark:border-slate-800/80 group-hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="text-xs text-slate-500 font-medium pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <span>{post.date}</span>
                  <span className="text-amber-600 dark:text-amber-500 font-bold group-hover:translate-x-1.5 transition-transform inline-flex items-center">
                    {t.blog.readArticle} &rarr;
                  </span>
                </div>
              </GlassCard>
            </a>
          </SectionReveal>
        ))}
      </div>

      <div className="mt-10 text-center md:hidden">
        <a
          href={primaryPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-amber-600 dark:text-amber-500 font-bold hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-sm"
        >
          {t.blog.viewAll}
          <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
