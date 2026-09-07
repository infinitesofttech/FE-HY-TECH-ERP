'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  Home,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserHeaderProps {
  onOpenMobileSidebar: () => void;
  familyId?: string;
  headOfFamily?: string;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  onOpenMobileSidebar,
  familyId = 'HTF-000002',
  headOfFamily = 'Rajesh Patel',
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName =
    (user as any)?.head_of_family ||
    (user as any)?.full_name ||
    headOfFamily;

  const currentFamilyId =
    (user as any)?.family_id ||
    familyId;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger Toggle & Family Selector Pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Family Selector Pill (Exact replica of mockup) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
          <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Family #{currentFamilyId}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Red alert dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 px-4 z-50 animate-slide-up text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                <span>Notifications</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => toast.info('All notifications marked as read')}>
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 py-1">
                <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Income Certificate</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Application is under verification at Taluka office.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Wallet Points Credited</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">+20 points earned on document verification.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Dropdown (Mockup replica) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* Name and Role */}
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                {displayName}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Family User
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-slide-up text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-slate-500">Family User</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/user/family');
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Family Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/user/settings');
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={handleSignOut}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
