'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ColorTheme = 'emerald' | 'blue' | 'purple' | 'amber' | 'teal' | 'rose' | 'indigo' | 'cyan' | 'custom';

export interface ThemeColorOption {
  id: ColorTheme;
  nameEn: string;
  nameGu: string;
  colorHex: string;
  badge: string;
}

export const PRESET_THEME_COLORS: ThemeColorOption[] = [
  { id: 'emerald', nameEn: 'GovTech Emerald', nameGu: 'શાલીન લીલો (Emerald)', colorHex: '#059669', badge: 'Classic Gov' },
  { id: 'blue', nameEn: 'Royal Sapphire', nameGu: 'રોયલ બ્લુ (Blue)', colorHex: '#2563eb', badge: 'High-Tech' },
  { id: 'purple', nameEn: 'Imperial Violet', nameGu: 'પર્પલ લક્ઝરી (Purple)', colorHex: '#9333ea', badge: 'Luxury' },
  { id: 'amber', nameEn: 'Saffron Amber', nameGu: 'કેસરી સોનેરી (Amber)', colorHex: '#d97706', badge: 'Heritage' },
  { id: 'teal', nameEn: 'Ocean Teal', nameGu: 'સમુદ્રી ટીલ (Teal)', colorHex: '#0d9488', badge: 'Modern' },
  { id: 'rose', nameEn: 'Ruby Crimson', nameGu: 'રૂબી ગુલાબી (Rose)', colorHex: '#e11d48', badge: 'Dynamic' },
  { id: 'indigo', nameEn: 'Electric Indigo', nameGu: 'ઈન્ડિગો બ્લુ (Indigo)', colorHex: '#4f46e5', badge: 'Premium' },
  { id: 'cyan', nameEn: 'Cyan Horizon', nameGu: 'સાયન સ્કાય (Cyan)', colorHex: '#0891b2', badge: 'Clean' },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
  customHex: string;
  setCustomHex: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  colorTheme: 'emerald',
  setColorTheme: () => {},
  customHex: '#059669',
  setCustomHex: () => {},
});

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function mixRgb(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, weight: number) {
  return {
    r: Math.round(c1.r * (1 - weight) + c2.r * weight),
    g: Math.round(c1.g * (1 - weight) + c2.g * weight),
    b: Math.round(c1.b * (1 - weight) + c2.b * weight),
  };
}

function applyCustomColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const s50 = mixRgb(white, rgb, 0.1);
  const s100 = mixRgb(white, rgb, 0.2);
  const s200 = mixRgb(white, rgb, 0.35);
  const s300 = mixRgb(white, rgb, 0.55);
  const s400 = mixRgb(white, rgb, 0.8);
  const s500 = rgb;
  const s600 = mixRgb(rgb, black, 0.15);
  const s700 = mixRgb(rgb, black, 0.3);
  const s800 = mixRgb(rgb, black, 0.45);
  const s900 = mixRgb(rgb, black, 0.65);
  const s950 = mixRgb(rgb, black, 0.82);

  const root = document.documentElement;
  root.style.setProperty('--brand-50', `${s50.r} ${s50.g} ${s50.b}`);
  root.style.setProperty('--brand-100', `${s100.r} ${s100.g} ${s100.b}`);
  root.style.setProperty('--brand-200', `${s200.r} ${s200.g} ${s200.b}`);
  root.style.setProperty('--brand-300', `${s300.r} ${s300.g} ${s300.b}`);
  root.style.setProperty('--brand-400', `${s400.r} ${s400.g} ${s400.b}`);
  root.style.setProperty('--brand-500', `${s500.r} ${s500.g} ${s500.b}`);
  root.style.setProperty('--brand-600', `${s600.r} ${s600.g} ${s600.b}`);
  root.style.setProperty('--brand-700', `${s700.r} ${s700.g} ${s700.b}`);
  root.style.setProperty('--brand-800', `${s800.r} ${s800.g} ${s800.b}`);
  root.style.setProperty('--brand-900', `${s900.r} ${s900.g} ${s900.b}`);
  root.style.setProperty('--brand-950', `${s950.r} ${s950.g} ${s950.b}`);
}

function clearCustomColor() {
  const root = document.documentElement;
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((v) => {
    root.style.removeProperty(`--brand-${v}`);
  });
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('emerald');
  const [customHex, setCustomHexState] = useState<string>('#059669');

  // Initialize theme mode and color on mount
  useEffect(() => {
    // 1. Dark/Light theme mode
    const savedTheme = localStorage.getItem('hytech_theme') as Theme;
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    } else {
      setThemeState('light');
      document.documentElement.classList.remove('dark');
    }

    // 2. Color Theme
    const savedColor = localStorage.getItem('hytech_color_theme') as ColorTheme;
    const savedCustomHex = localStorage.getItem('hytech_custom_hex') || '#059669';

    if (savedCustomHex) {
      setCustomHexState(savedCustomHex);
    }

    if (savedColor === 'custom') {
      setColorThemeState('custom');
      document.documentElement.removeAttribute('data-color-theme');
      applyCustomColor(savedCustomHex);
    } else if (savedColor && savedColor !== 'emerald') {
      setColorThemeState(savedColor);
      clearCustomColor();
      document.documentElement.setAttribute('data-color-theme', savedColor);
    } else {
      setColorThemeState('emerald');
      clearCustomColor();
      document.documentElement.removeAttribute('data-color-theme');
    }
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem('hytech_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem('hytech_color_theme', color);

    if (color === 'custom') {
      document.documentElement.removeAttribute('data-color-theme');
      applyCustomColor(customHex);
    } else if (color === 'emerald') {
      clearCustomColor();
      document.documentElement.removeAttribute('data-color-theme');
    } else {
      clearCustomColor();
      document.documentElement.setAttribute('data-color-theme', color);
    }
  };

  const setCustomHex = (hex: string) => {
    setCustomHexState(hex);
    localStorage.setItem('hytech_custom_hex', hex);
    if (colorTheme === 'custom') {
      applyCustomColor(hex);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        colorTheme,
        setColorTheme,
        customHex,
        setCustomHex,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
