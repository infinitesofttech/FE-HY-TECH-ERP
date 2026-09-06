'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { GoogleLanguageSelector } from './GoogleLanguageSelector';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  PlusCircle,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface TopbarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenSearch?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenMobileSidebar,
  onOpenSearch,
}) => {
  const router = useRouter();
  const { userRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Aadhar Ready for Pickup',
      desc: 'Bipinbhai Patel (HTF-000002) - SMS dispatched in Gujarati.',
      time: '10m ago',
      type: 'ready',
    },
    {
      id: 2,
      title: 'Pending Gov Verification',
      desc: 'Ration card member addition pending UIDAI sync.',
      time: '45m ago',
      type: 'alert',
    },
    {
      id: 3,
      title: 'Daily Summary Ready',
      desc: '3 new visits completed today. Loyalty ledger updated.',
      time: '2h ago',
      type: 'info',
    },
  ];

  const handleQuickAction = () => {
    if (userRole === 'customer') {
      router.push('/customer/documents');
    } else if (userRole === 'employee') {
      router.push('/staff/visits');
    } else {
      router.push('/admin/visits');
    }
  };

  return (
    <header className="glass-header h-16 px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
      {/* Left: Mobile Drawer Trigger + Global Search Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Trigger for GlobalSearchModal) */}
        <button
          onClick={onOpenSearch}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-slate-400 group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            <span className="truncate group-hover:text-slate-600 dark:group-hover:text-slate-300">
              {t('quick_search_placeholder')}
            </span>
          </div>

          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs flex-shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Quick Action, Sync Pill, Lang, Theme, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        {userRole !== 'customer' && (
          <button
            onClick={handleQuickAction}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-sm shadow-brand-600/30 hover:scale-105 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('visit_wizard')}</span>
          </button>
        )}

        {/* Sync Engine Indicator */}
        <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{t('sync_active')}</span>
        </div>

        {/* Google Translate & Multi-Language Selector */}
        <GoogleLanguageSelector />

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-brand-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-slide-up space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    3 New
                  </span>
                </div>

                <button
                  onClick={() => toast.info('All notifications marked as read')}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 transition-colors space-y-1 cursor-pointer"
                    onClick={() => {
                      setShowNotifications(false);
                      router.push(userRole === 'customer' ? '/customer/reminders' : '/admin/reminders');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    router.push(userRole === 'customer' ? '/customer/reminders' : '/admin/reminders');
                  }}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1.5 w-full py-1"
                >
                  <span>View Reminders & Follow-ups</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
