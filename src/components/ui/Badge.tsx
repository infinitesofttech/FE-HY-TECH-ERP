import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  dot = true,
}) => {
  const styles = {
    default: 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/30',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 dark:border-purple-500/30',
    gold: 'bg-amber-400/15 text-amber-800 dark:text-amber-200 border-amber-400/40 dark:border-amber-400/30 shadow-sm shadow-amber-500/10',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500 shadow-sm shadow-emerald-500/80',
    warning: 'bg-amber-500 shadow-sm shadow-amber-500/80',
    danger: 'bg-rose-500 shadow-sm shadow-rose-500/80',
    info: 'bg-sky-500 shadow-sm shadow-sky-500/80',
    purple: 'bg-purple-500 shadow-sm shadow-purple-500/80',
    gold: 'bg-amber-400 shadow-sm shadow-amber-400/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border backdrop-blur-md transition-all ${styles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}></span>}
      {children}
    </span>
  );
};
