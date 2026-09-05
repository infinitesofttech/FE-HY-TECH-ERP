'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600/20 to-purple-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto ring-8 ring-brand-500/10 shadow-lg shadow-brand-500/20">
          <FileQuestion className="w-10 h-10 text-brand-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
            {t('page_not_found')}
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {t('page_not_found_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t('page_not_found_desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-brand-600/30 hover:scale-[1.02] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('return_to_console')}
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all"
          >
            {t('switch_account')}
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
          HY-TECH ERP &bull; Government Services &amp; Citizen Identity Portal
        </div>
      </div>
    </div>
  );
}
