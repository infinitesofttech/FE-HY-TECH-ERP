import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  colorScheme?: 'brand' | 'emerald' | 'amber' | 'sky' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  colorScheme = 'brand',
  onClick,
}) => {
  const schemeStyles = {
    brand: {
      borderHover: 'hover:border-brand-500/40 dark:hover:border-brand-400/40',
      iconBg: 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/80 dark:border-brand-800/80',
      accentGlow: 'from-brand-500/5 to-transparent',
      textAccent: 'text-brand-600 dark:text-brand-400',
    },
    emerald: {
      borderHover: 'hover:border-emerald-500/40 dark:hover:border-emerald-400/40',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80',
      accentGlow: 'from-emerald-500/5 to-transparent',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      borderHover: 'hover:border-amber-500/40 dark:hover:border-amber-400/40',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80',
      accentGlow: 'from-amber-500/5 to-transparent',
      textAccent: 'text-amber-600 dark:text-amber-400',
    },
    sky: {
      borderHover: 'hover:border-sky-500/40 dark:hover:border-sky-400/40',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/80',
      accentGlow: 'from-sky-500/5 to-transparent',
      textAccent: 'text-sky-600 dark:text-sky-400',
    },
    purple: {
      borderHover: 'hover:border-purple-500/40 dark:hover:border-purple-400/40',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80',
      accentGlow: 'from-purple-500/5 to-transparent',
      textAccent: 'text-purple-600 dark:text-purple-400',
    },
    rose: {
      borderHover: 'hover:border-rose-500/40 dark:hover:border-rose-400/40',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80',
      accentGlow: 'from-rose-500/5 to-transparent',
      textAccent: 'text-rose-600 dark:text-rose-400',
    },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card-hover transition-all duration-300 group ${scheme.borderHover} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Background ambient accent */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl ${scheme.accentGlow} rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-xs ${scheme.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[170px]">
            {subtitle}
          </span>
        )}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ml-auto ${
              trend.isPositive !== false
                ? 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400'
                : 'text-rose-700 bg-rose-500/10 dark:text-rose-400'
            }`}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
