'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FolderTree,
  Receipt,
  BellRing,
  KanbanSquare,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, userRole, logout } = useAuth();
  const { t } = useLanguage();

  const getAdminNavigation = () => [
    {
      group: 'COMMAND & ANALYTICS',
      items: [
        { name: t('nav_dashboard'), href: '/admin/dashboard', icon: LayoutDashboard, badge: 'Live' },
      ],
    },
    {
      group: 'CITIZEN OPERATIONS',
      items: [
        { name: t('nav_customers'), href: '/admin/customers', icon: Users },
        { name: t('nav_visits'), href: '/admin/visits', icon: CalendarCheck, badge: 'Hot' },
        { name: t('nav_pending_work'), href: '/admin/pending-work', icon: KanbanSquare, badge: '4' },
        { name: t('nav_reminders'), href: '/admin/reminders', icon: BellRing },
      ],
    },
    {
      group: 'FINANCE & CATALOG',
      items: [
        { name: t('nav_transactions'), href: '/admin/transactions', icon: Receipt },
        { name: t('nav_services'), href: '/admin/services', icon: FolderTree },
      ],
    },
    {
      group: 'PLATFORM ADMIN',
      items: [
        { name: t('nav_employees'), href: '/admin/employees', icon: UserCog },
        { name: t('nav_settings'), href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const getStaffNavigation = () => [
    {
      group: 'FRONT DESK',
      items: [
        { name: t('nav_dashboard'), href: '/staff/dashboard', icon: LayoutDashboard },
        { name: t('nav_customers'), href: '/staff/customers', icon: Users },
        { name: t('nav_visits'), href: '/staff/visits', icon: CalendarCheck, badge: 'Desk' },
        { name: t('nav_pending_work'), href: '/staff/pending-work', icon: KanbanSquare },
        { name: t('nav_transactions'), href: '/staff/transactions', icon: Receipt },
        { name: t('nav_reminders'), href: '/staff/reminders', icon: BellRing },
        { name: t('nav_settings'), href: '/staff/settings', icon: Settings },
      ],
    },
  ];

  const getCustomerNavigation = () => [
    {
      group: 'CITIZEN PORTAL',
      items: [
        { name: 'My Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
        { name: 'Family Members', href: '/customer/members', icon: Users },
        { name: 'Digital Vault', href: '/customer/documents', icon: ShieldCheck, badge: 'Vault' },
        { name: 'My Visits', href: '/customer/visits', icon: CalendarCheck },
        { name: 'Alerts & Reminders', href: '/customer/reminders', icon: BellRing },
      ],
    },
  ];

  const navGroups =
    userRole === 'admin'
      ? getAdminNavigation()
      : userRole === 'employee'
      ? getStaffNavigation()
      : getCustomerNavigation();

  const userInitial = (
    (user as any)?.head_of_family ||
    (user as any)?.full_name ||
    (user as any)?.username ||
    'U'
  )[0].toUpperCase();

  const userName =
    (user as any)?.head_of_family ||
    (user as any)?.full_name ||
    (user as any)?.username ||
    'Operator';

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div
        className={`p-4 border-b border-slate-800/80 flex items-center justify-between transition-all ${
          isCollapsed ? 'px-3 justify-center' : 'px-5'
        }`}
      >
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group min-w-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            H
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  HY-TECH
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 uppercase tracking-wider shadow-xs">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase truncate">
                  GovTech ERP
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                {group.group}
              </div>
            ) : (
              <div className="h-px bg-slate-800/80 my-2 mx-2" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.name : undefined}
                    className={`group relative flex items-center rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/30 font-extrabold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-glow-brand" />
                    )}

                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold transition-all flex-shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-brand-500/20 group-hover:text-brand-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls & User Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors text-xs font-semibold gap-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        )}

        {/* User Card */}
        <div
          className={`rounded-2xl bg-slate-800/60 border border-slate-700/60 transition-all ${
            isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 flex items-center justify-between'
          }`}
        >
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'flex-col' : ''}`}>
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {userName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-brand-500/20 text-brand-300 uppercase tracking-wider">
                    {userRole}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={t('auth_logout')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-900 text-slate-200 border-r border-slate-800/90 backdrop-blur-2xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (off-canvas) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-over panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-200 border-r border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
