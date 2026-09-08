'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Globe, Check, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

export interface LanguageItem {
  code: string;
  name: string;
  english: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', english: 'English' },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi' },
  { code: 'mr', name: 'मराठी', english: 'Marathi' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil' },
  { code: 'te', name: 'తెలుగు', english: 'Telugu' },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam' },
  { code: 'ur', name: 'اردو', english: 'Urdu' },
  { code: 'or', name: 'ଓଡ଼ିଆ', english: 'Odia' },
  { code: 'as', name: 'অসমীয়া', english: 'Assamese' },
  { code: 'sa', name: 'संस्कृतम्', english: 'Sanskrit' },
  { code: 'sd', name: 'سنڌي', english: 'Sindhi' },
  { code: 'ar', name: 'العربية', english: 'Arabic' },
  { code: 'es', name: 'Español', english: 'Spanish' },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'de', name: 'Deutsch', english: 'German' },
  { code: 'ru', name: 'Русский', english: 'Russian' },
  { code: 'zh', name: '简体中文', english: 'Chinese' },
  { code: 'ja', name: '日本語', english: 'Japanese' },
];

export const GoogleLanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clean up any remaining Google Translate iframes, banners, scripts, or cookies on mount
  useEffect(() => {
    try {
      // Clear google translate cookies
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;

      // Remove any injected iframe or script
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) banner.remove();

      const script = document.getElementById('google-translate-script');
      if (script) script.remove();

      const gadget = document.getElementById('google_translate_element');
      if (gadget) gadget.remove();

      // Reset any top styles applied by google translate
      document.body.style.top = '0px';
      document.body.style.position = 'static';
      document.documentElement.style.top = '0px';
    } catch {
      // Ignore cleanup error
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Current language item
  const currentLang = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [language]);

  // Filtered languages by search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.english.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectLanguage = (lang: LanguageItem) => {
    setLanguage(lang.code);
    setIsOpen(false);
    setSearchQuery('');
    const msg =
      lang.code === 'gu'
        ? `ભાષા બદલાઈ: ${lang.name}`
        : lang.code === 'hi'
        ? `भाषा बदली: ${lang.name}`
        : `Language changed: ${lang.name}`;
    toast.success(msg);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`ભાષા: ${currentLang.name} (${currentLang.english}) / Select Language`}
        aria-label="Select Language"
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? 'bg-brand-50/80 dark:bg-slate-800 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Globe className="w-3.5 h-3.5" />
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
          }`}
        />
      </button>

      {/* Pure Dropdown: ONLY Search & Languages */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / શોધો..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                કોઈ ભાષા મળી નથી / No language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang.code === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang)}
                    className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="text-xs font-semibold truncate">
                        {lang.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                        ({lang.english})
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LanguageSelector = GoogleLanguageSelector;
