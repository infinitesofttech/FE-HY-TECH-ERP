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
      bgHover: 'hover:border-brand-500/50 dark:hover:border-brand-500/50',
      iconBox: 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/30',
      glow: 'from-brand-500/10 via-transparent to-transparent',
      textAccent: 'text-brand-600 dark:text-brand-400',
    },
    emerald: {
      bgHover: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/50',
      iconBox: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
      glow: 'from-emerald-500/10 via-transparent to-transparent',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bgHover: 'hover:border-amber-500/50 dark:hover:border-amber-500/50',
      iconBox: 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30',
      glow: 'from-amber-500/10 via-transparent to-transparent',
      textAccent: 'text-amber-600 dark:text-amber-400',
    },
    sky: {
      bgHover: 'hover:border-sky-500/50 dark:hover:border-sky-500/50',
      iconBox: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30',
      glow: 'from-sky-500/10 via-transparent to-transparent',
      textAccent: 'text-sky-600 dark:text-sky-400',
    },
    purple: {
      bgHover: 'hover:border-purple-500/50 dark:hover:border-purple-500/50',
      iconBox: 'bg-gradient-to-br from-purple-400 to-indigo-600 text-white shadow-lg shadow-purple-500/30',
      glow: 'from-purple-500/10 via-transparent to-transparent',
      textAccent: 'text-purple-600 dark:text-purple-400',
    },
    rose: {
      bgHover: 'hover:border-rose-500/50 dark:hover:border-rose-500/50',
      iconBox: 'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-lg shadow-rose-500/30',
      glow: 'from-rose-500/10 via-transparent to-transparent',
      textAccent: 'text-rose-600 dark:text-rose-400',
    },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-card-elevated hover:shadow-card-hover transition-all duration-300 group ${scheme.bgHover} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background soft glow gradient */}
      <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${scheme.glow} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 ${scheme.iconBox}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </span>
        )}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
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
