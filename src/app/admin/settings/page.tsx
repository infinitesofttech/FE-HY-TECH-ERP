'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme, PRESET_THEME_COLORS, ColorTheme } from '@/context/ThemeContext';
import { Card, Button, Badge, Input } from '@/components/ui';
import {
  Settings,
  Sun,
  Moon,
  Palette,
  Check,
  Sparkles,
  Sliders,
  CheckCircle2,
  Brush,
  Eye,
} from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const {
    theme,
    toggleTheme,
    setTheme,
    colorTheme,
    setColorTheme,
    customHex,
    setCustomHex,
  } = useTheme();

  const [customColorInput, setCustomColorInput] = useState(customHex || '#059669');

  const handleApplyCustomColor = () => {
    setColorTheme('custom');
    setCustomHex(customColorInput);
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
          {language === 'gu'
            ? 'સિસ્ટમ થીમ, કલર પેલેટ અને ડિસ્પ્લે કસ્ટમાઇઝેશન.'
            : 'Customize system appearance, color themes, and language localization.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Settings Card */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="elevated" className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'gu' ? 'ડિસ્પ્લે અને કલર થીમ સેટિંગ્સ' : 'Display & Color Theme Design'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'gu'
                    ? 'તમારી પસંદગી મુજબ કલર પેલેટ અને ડાર્ક/લાઇટ મોડ પસંદ કરો'
                    : 'Personalize the ERP accent colors and dark/light mode appearance'}
                </p>
              </div>
            </div>

            {/* 1. Language Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  મુખ્ય ભાષા (Primary UI Language)
                </span>
                <span className="text-xs text-slate-400">English / ગુજરાતી</span>
              </div>

              <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
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

            {/* 2. Theme Mode Selector (Light / Dark) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    {language === 'gu' ? 'થીમ મોડ (Light / Dark Mode)' : 'Appearance Mode'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {language === 'gu'
                      ? `હાલમાં સક્રિય: ${theme === 'dark' ? 'રાત મોડ (Dark Mode)' : 'દિવસ મોડ (Light Mode)'}`
                      : `Currently active: ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Light Mode Button */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border font-bold text-xs transition-all ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 border-transparent hover:border-slate-300'
                  }`}
                >
                  <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>દિવસ મોડ (Light Mode)</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-brand-600 ml-auto" />}
                </button>

                {/* Dark Mode Button */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border font-bold text-xs transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-white border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 border-transparent hover:border-slate-300'
                  }`}
                >
                  <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>રાત મોડ (Dark Mode)</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-brand-400 ml-auto" />}
                </button>
              </div>
            </div>

            {/* 3. Multiple Color Theme Options (Presets) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    {language === 'gu' ? 'રંગ થીમ વિકલ્પો (Color Theme Presets)' : 'Color Theme Palette'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {language === 'gu'
                      ? 'તમારા આખા સોફ્ટવેર માટે સુંદર અને અનોખો રંગ પસંદ કરો'
                      : 'Choose an enterprise accent palette that matches your brand'}
                  </span>
                </div>
                <Badge variant="info">
                  {colorTheme.toUpperCase()}
                </Badge>
              </div>

              {/* Grid of Preset Color Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {PRESET_THEME_COLORS.map((opt) => {
                  const isSelected = colorTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setColorTheme(opt.id)}
                      className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-white shadow-md ring-2 ring-brand-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        {/* Color Circle Preview */}
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center shadow-xs ring-2 ring-black/5 dark:ring-white/10"
                          style={{ backgroundColor: opt.colorHex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {opt.badge}
                        </span>
                      </div>

                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {opt.nameEn}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.nameGu}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Custom Unique Color Option (User's unique choice) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brush className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                      {language === 'gu'
                        ? 'પોતાનો યુનિક કલર બનાવો (Custom Unique Color)'
                        : 'Custom Accent Color Picker'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {language === 'gu'
                        ? 'કોઈપણ ખાસ હેક્સ કોડ અથવા કલર પીકર વડે મનપસંદ રંગ સેટ કરો'
                        : 'Pick any custom hex shade using the color wheel'}
                    </span>
                  </div>
                </div>

                {colorTheme === 'custom' && (
                  <Badge variant="success">Custom Active</Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex-1">
                  <input
                    type="color"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                    title="Choose unique color"
                  />
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="#059669"
                    className="flex-1 px-2 py-1 text-xs font-mono font-bold uppercase bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <Button
                  onClick={handleApplyCustomColor}
                  className="bg-brand-600 text-white font-bold"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {language === 'gu' ? 'યુનિક કલર લાગુ કરો' : 'Apply Unique Color'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right / Live Preview Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="elevated" className="p-6 space-y-4 sticky top-24 border-brand-500/20">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {language === 'gu' ? 'લાઇવ પ્રીવ્યુ (Live Preview)' : 'Live Theme Preview'}
              </h4>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 text-[11px]">
                {language === 'gu'
                  ? 'તમે પસંદ કરેલા કલરથી સોફ્ટવેરના બટનો, કાર્ડ્સ અને એક્સેન્ટ્સ આ રીતે દેખાશે:'
                  : 'See how components reflect your chosen accent styling in real time:'}
              </p>

              {/* Sample Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400">બટન સ્ટાઇલ:</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                    Primary Button
                  </Button>
                  <Button size="sm" variant="outline" className="border-brand-500/40 text-brand-600">
                    Outline Button
                  </Button>
                </div>
              </div>

              {/* Sample Badges */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400">બેજ અને હાઇલાઇટ્સ:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    <span>Active ERP Status</span>
                  </span>
                </div>
              </div>

              {/* Sample Input Focus */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400">ઇનપુટ ફિલ્ડ એક્સેન્ટ:</div>
                <input
                  type="text"
                  readOnly
                  value="ઇનપુટ ફોકસ હાઇલાઇટ (Focus Accent)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-brand-500 ring-2 ring-brand-500/20 font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Active Sidebar Tab Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400">સાઇડબાર ટેબ નમૂનો:</div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active Navigation Item</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
