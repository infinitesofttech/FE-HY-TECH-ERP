'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'emerald' | 'amber';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 focus:ring-brand-500 border border-brand-500/20',
      secondary:
        'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 focus:ring-slate-400',
      outline:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:ring-brand-500',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 focus:ring-rose-500 border border-rose-500/30',
      glass:
        'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-sm focus:ring-brand-500',
      emerald:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 focus:ring-emerald-500 border border-emerald-500/30',
      amber:
        'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 focus:ring-amber-500 border border-amber-400/40',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
      md: 'px-4 py-2 text-xs sm:text-sm gap-2 rounded-xl',
      lg: 'px-5 py-2.5 text-sm gap-2.5 rounded-2xl font-extrabold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
