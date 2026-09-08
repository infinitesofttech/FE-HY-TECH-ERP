import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgb(var(--brand-50, 236 253 245) / <alpha-value>)',
          100: 'rgb(var(--brand-100, 209 250 229) / <alpha-value>)',
          200: 'rgb(var(--brand-200, 167 243 208) / <alpha-value>)',
          300: 'rgb(var(--brand-300, 110 231 183) / <alpha-value>)',
          400: 'rgb(var(--brand-400, 52 211 153) / <alpha-value>)',
          500: 'rgb(var(--brand-500, 16 185 129) / <alpha-value>)',
          600: 'rgb(var(--brand-600, 5 150 105) / <alpha-value>)',
          700: 'rgb(var(--brand-700, 4 120 87) / <alpha-value>)',
          800: 'rgb(var(--brand-800, 6 95 70) / <alpha-value>)',
          900: 'rgb(var(--brand-900, 6 78 59) / <alpha-value>)',
          950: 'rgb(var(--brand-950, 2 44 34) / <alpha-value>)',
        },
        slate: {
          850: '#11221e',
          900: '#0a1a16',
          925: '#061310',
          950: '#030c0a',
        },
        emerald: {
          450: '#059669',
          550: '#047857',
        },
        amber: {
          450: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        gujarati: ['Noto Sans Gujarati', 'Shruti', 'Gujarati MT', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(5, 150, 105, 0.45)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'card-subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        'card-elevated': '0 4px 16px -2px rgba(15, 23, 42, 0.09), 0 2px 6px -1px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 20px 36px -6px rgba(15, 23, 42, 0.13), 0 8px 16px -3px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(16, 185, 129, 0.3)',
        'card-highlight': '0 16px 36px -6px rgba(16, 185, 129, 0.2), 0 6px 14px -2px rgba(15, 23, 42, 0.06), 0 0 0 1.5px rgba(16, 185, 129, 0.45)',
        'dropdown': '0 20px 30px -5px rgba(15, 23, 42, 0.15), 0 8px 12px -6px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        '2xl': '40px',
      },
    },
  },
  plugins: [],
};

export default config;
