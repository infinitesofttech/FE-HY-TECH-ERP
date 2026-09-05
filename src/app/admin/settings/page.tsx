'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { API_BASE_URL } from '@/api/client';
import { Card, Badge, Button } from '@/components/ui';
import {
  Settings,
  Server,
  Radio,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [testingConnection, setTestingConnection] = useState(false);

  const testApiConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/`, { method: 'GET' });
      if (res.ok) {
        toast.success(`Connected to Django REST backend at ${API_BASE_URL}!`);
      } else {
        toast.info(`Backend reached (${res.status}), ready for operations.`);
      }
    } catch {
      toast.warning(`Backend currently unreachable at ${API_BASE_URL}. Running in demo offline fallback mode.`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-500/30 text-xs font-black tracking-wide mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>SYSTEM &amp; ENVIRONMENT CONTROLS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('settings_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings_sub')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Centralized API Environment (Rule #1) */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('api_environment')}
              </h3>
              <p className="text-xs text-slate-500">Centralized, swap-safe configuration</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t('active_api_base')}:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                Read-Only (Configured via .env)
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-brand-600 dark:text-brand-400 select-all break-all">
              {API_BASE_URL}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Info className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
              To change to production, modify <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-brand-600">NEXT_PUBLIC_API_BASE_URL</code> in <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-brand-600">.env.local</code>.
            </p>
          </div>

          <Button
            onClick={testApiConnection}
            isLoading={testingConnection}
            variant="secondary"
            className="w-full"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {t('test_api_connection')}
          </Button>
        </Card>

        {/* Card 2: Interface Preferences */}
        <Card variant="elevated" className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Display & Language
              </h3>
              <p className="text-xs text-slate-500">Customize appearance and localization</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Primary UI Language
              </span>
              <span className="text-xs text-slate-400">English / ગુજરાતી</span>
            </div>

            <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  language === 'en'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('gu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  language === 'gu'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Color Theme
              </span>
              <span className="text-xs text-slate-400">
                Currently active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              leftIcon={
                theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-brand-600" />
                )
              }
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
