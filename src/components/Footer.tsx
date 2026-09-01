"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full py-12 px-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/30 backdrop-blur-xl mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 dark:text-slate-400 text-sm gap-4">
        <div>
          &copy; {new Date().getFullYear()} JustGanIt.com. {t.footer.rights}
        </div>
        <div className="flex space-x-6">
          <a href="https://github.com/NBananapie" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium">
            GitHub
          </a>
          <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium">
            Twitter
          </a>
          <a href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors font-medium">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
