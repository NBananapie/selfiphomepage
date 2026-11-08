"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { translations, Language, TranslationSchema } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

const STORAGE_KEY = 'app-language';
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

let cachedClientLang: Language | null = null;
const listeners = new Set<() => void>();

function detectClientLanguage(): Language {
  if (cachedClientLang) {
    return cachedClientLang;
  }
  if (typeof window === 'undefined') {
    return 'zh';
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') {
      cachedClientLang = saved;
      return saved;
    }
  } catch {
    // Ignore storage access errors in private browsing or restricted WebViews
  }
  const navLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language.toLowerCase() : 'zh';
  cachedClientLang = navLang.startsWith('zh') ? 'zh' : 'en';
  return cachedClientLang;
}

function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'zh')) {
      cachedClientLang = e.newValue;
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getServerLanguage(): Language {
  return 'zh';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, detectClientLanguage, getServerLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    const validLang: Language = lang === 'en' ? 'en' : 'zh';
    cachedClientLang = validLang;
    try {
      window.localStorage.setItem(STORAGE_KEY, validLang);
    } catch {
      // Ignore storage write errors in restricted environments
    }
    document.documentElement.lang = validLang === 'zh' ? 'zh-CN' : 'en';
    listeners.forEach((l) => l());
  }, []);

  const t = translations[language] ?? translations.zh;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
