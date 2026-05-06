"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-10 px-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
        <div className="mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} JustGanIt.com. {t.footer.rights}
        </div>
        <div className="flex space-x-6">
          <a href="https://github.com/NBananapie" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
            GitHub
          </a>
          <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
            Twitter
          </a>
          <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
