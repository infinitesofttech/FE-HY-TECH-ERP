'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getNestedTranslation } from '@/i18n';

export type Language = 'en' | 'gu' | 'hi' | string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const defaultT = (key: string): string => {
  return getNestedTranslation(translations['en'], key) || key;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'en' so first-time visitors always get English
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Clear any unwanted Google Translate cookies, scripts or banners
    try {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) banner.remove();
      const gadget = document.getElementById('google_translate_element');
      if (gadget) gadget.remove();
      document.body.style.top = '0px';
      document.documentElement.style.top = '0px';
    } catch {}

    // Check localStorage - default to 'en' if not set
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hytech_language') as Language;
      if (saved && (saved === 'en' || saved === 'gu' || saved === 'hi' || translations[saved])) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      } else {
        setLanguageState('en');
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hytech_language', lang);
      document.documentElement.lang = lang;
    }
  };

  /**
   * Pure single-language translation lookup:
   * 1. Check selected language dictionary
   * 2. Fall back to English dictionary
   * 3. Fall back to key string
   * NEVER falls back to Gujarati when English or Hindi is active!
   */
  const t = (key: string): string => {
    const currentDict = translations[language];
    const match = getNestedTranslation(currentDict, key);
    if (match !== undefined) {
      return match;
    }

    // Fallback to English
    if (language !== 'en') {
      const enMatch = getNestedTranslation(translations['en'], key);
      if (enMatch !== undefined) {
        return enMatch;
      }
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'gu' ? 'font-gujarati' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
