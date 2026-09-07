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
  UserCheck,
  FileText,
  Network,
  X,
  Coins,
  FileCheck2,
  Clock,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
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

  const getAdminNavigation = (): NavGroup[] => [
    {
      group: 'ADMINISTRATION',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Office Dashboard', href: '/admin/office-dashboard', icon: Building2 },
        { name: 'Services', href: '/admin/services', icon: FolderTree },
        { name: 'Account & Finance', href: '/admin/transactions', icon: Receipt },
        { name: 'HRMS', href: '/admin/employees', icon: UserCog },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const getStaffNavigation = (): NavGroup[] => [
    {
      group: 'OFFICE OPERATIONS',
      items: [
        { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'Family', href: '/staff/customers', icon: Users },
        { name: 'Services', href: '/staff/services', icon: FolderTree },
        { name: 'HRMS', href: '/staff/hrms', icon: UserCog },
        { name: 'Settings', href: '/staff/settings', icon: Settings },
      ],
    },
  ];

  const getCustomerNavigation = (): NavGroup[] => [
    {
      group: 'DASHBOARD',
      items: [
        { name: t('nav_my_dashboard'), href: '/user/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'FAMILY',
      items: [
        { name: 'Family Card', href: '/user/family?tab=card', icon: ShieldCheck },
        { name: 'Family Member', href: '/user/family?tab=member', icon: Users },
        { name: 'Wallet Points', href: '/user/family?tab=wallet', icon: Coins },
      ],
    },
    {
      group: 'MY APPLICATION',
      items: [
        { name: 'All Application', href: '/user/applications', icon: FileText },
        { name: 'Services', href: '/user/services', icon: FolderTree },
        { name: 'Settings', href: '/user/settings', icon: Settings },
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
        className={`p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between transition-all ${
          isCollapsed ? 'px-3 justify-center' : 'px-5'
        }`}
      >
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group min-w-0"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 flex items-center justify-center shadow-md shadow-brand-500/15 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <img
              src="/logo.png"
              alt="HY-TECH Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  HY-TECH
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30 uppercase tracking-wider shadow-xs">
                  ERP
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase truncate">
                  Computer &amp; Online Hub
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </div>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2" />
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
                    className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/80 dark:border-brand-800/80 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-850/60 border border-transparent'
                    }`}
                  >
                    <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold transition-all flex-shrink-0 ${
                          isActive
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-brand-500/15 group-hover:text-brand-600 dark:group-hover:text-brand-300'
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
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex items-center justify-center w-full py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800/60 transition-colors text-xs font-semibold gap-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px]">Collapse</span>
              </>
            )}
          </button>
        )}

        {/* User Card */}
        <div
          className={`rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 transition-all ${
            isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-2.5 flex items-center justify-between'
          }`}
        >
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'flex-col' : ''}`}>
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {userName}
                </p>
                <div className="flex items-center gap-1 mt-0.2">
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 uppercase tracking-wider border border-brand-200/60 dark:border-brand-800/60">
                    {userRole}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={t('auth_logout')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-[#081411] text-slate-700 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (off-canvas) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-over panel */}
          <div className="relative w-64 max-w-[85vw] bg-white dark:bg-[#081411] text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
