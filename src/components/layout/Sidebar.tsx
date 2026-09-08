'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ShieldCheck,
  UserCheck,
  FileText,
  Network,
  X,
  Coins,
  FileCheck2,
  Clock,
  Building2,
  Calendar,
  CalendarDays,
  Banknote,
  FileSpreadsheet,
  DollarSign,
  BarChart3,
  BarChart2,
  FileCheck,
  Sliders,
  Bell,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavSubItem[];
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavSubItem[];
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

  const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({
    'Office Dashboard': true,
    'ઓફિસ ડેશબોર્ડ': true,
    'कार्यालय डैशबोर्ड': true,
    'HRMS': true,
    'Payroll': false,
    'Reports': false,
    'Settings': false,
  });

  // Track active HRMS / query tab
  const [currentTab, setCurrentTab] = useState<string>('employees');

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        setCurrentTab(sp.get('tab') || 'employees');
      }
    };
    syncTabFromUrl();
    window.addEventListener('popstate', syncTabFromUrl);
    const handleCustomTab = (e: any) => {
      if (e.detail) setCurrentTab(e.detail);
    };
    window.addEventListener('hrms-tab-change', handleCustomTab);
    return () => {
      window.removeEventListener('popstate', syncTabFromUrl);
      window.removeEventListener('hrms-tab-change', handleCustomTab);
    };
  }, [pathname]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getAdminNavigation = (): NavGroup[] => [
    {
      group: t('group_administration'),
      items: [
        { name: t('nav_dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
        {
          name: t('nav_office_dashboard'),
          href: '/admin/office-dashboard',
          icon: Building2,
          children: [
            { name: t('nav_family'), href: '/admin/customers', icon: Users },
            { name: t('nav_village'), href: '/admin/family-tree', icon: Network, badge: 'Tree' },
          ],
        },
        { name: t('nav_services'), href: '/admin/services', icon: FolderTree },
        { name: t('nav_account_finance'), href: '/admin/transactions', icon: Receipt },
        {
          name: t('nav_hrms'),
          href: '/admin/employees',
          icon: UserCog,
          children: [
            { name: 'Employees', href: '/admin/employees?tab=employees', icon: Users },
            { name: 'Attendance', href: '/admin/employees?tab=attendance', icon: Calendar },
            { name: 'Leave', href: '/admin/employees?tab=leave', icon: CalendarDays },
            {
              name: 'Payroll',
              icon: Banknote,
              children: [
                { name: 'Salary Structure', href: '/admin/employees?tab=salary-structure', icon: FileSpreadsheet },
                { name: 'Payroll', href: '/admin/employees?tab=payroll', icon: DollarSign },
                { name: 'Salary Slips', href: '/admin/employees?tab=salary-slips', icon: Receipt },
                { name: 'Payroll Reports', href: '/admin/employees?tab=payroll-reports', icon: BarChart3 },
              ],
            },
            {
              name: 'Reports',
              icon: BarChart2,
              children: [
                { name: 'Attendance Report', href: '/admin/employees?tab=attendance-report', icon: FileCheck },
                { name: 'Leave Report', href: '/admin/employees?tab=leave-report', icon: FileText },
                { name: 'Employee Report', href: '/admin/employees?tab=employee-report', icon: Users },
                { name: 'Late Coming Report', href: '/admin/employees?tab=late-coming-report', icon: Clock },
                { name: 'Monthly HR Report', href: '/admin/employees?tab=monthly-hr-report', icon: TrendingUp },
              ],
            },
            {
              name: 'Settings',
              icon: Settings,
              children: [
                { name: 'Company Settings', href: '/admin/employees?tab=company-settings', icon: Building2 },
                { name: 'Attendance Settings', href: '/admin/employees?tab=attendance-settings', icon: Sliders },
                { name: 'Leave Settings', href: '/admin/employees?tab=leave-settings', icon: Calendar },
                { name: 'Notification Settings', href: '/admin/employees?tab=notification-settings', icon: Bell },
                { name: 'Roles & Permissions', href: '/admin/employees?tab=roles-permissions', icon: ShieldCheck },
              ],
            },
          ],
        },
        { name: t('nav_settings'), href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const getStaffNavigation = (): NavGroup[] => [
    {
      group: t('group_office_ops'),
      items: [
        { name: t('nav_dashboard'), href: '/staff/dashboard', icon: LayoutDashboard },
        { name: t('nav_family'), href: '/staff/customers', icon: Users },
        { name: t('nav_services'), href: '/staff/services', icon: FolderTree },
        { name: t('nav_hrms'), href: '/staff/hrms', icon: UserCog },
        { name: t('nav_settings'), href: '/staff/settings', icon: Settings },
      ],
    },
  ];

  const getCustomerNavigation = (): NavGroup[] => [
    {
      group: t('nav_dashboard').toUpperCase(),
      items: [
        { name: t('nav_my_dashboard'), href: '/user/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: t('nav_family').toUpperCase(),
      items: [
        { name: t('nav_family_card'), href: '/user/family?tab=card', icon: ShieldCheck },
        { name: t('nav_family_members'), href: '/user/family?tab=member', icon: Users },
        { name: t('nav_wallet_points'), href: '/user/family?tab=wallet', icon: Coins },
      ],
    },
    {
      group: t('navigation.applications').toUpperCase(),
      items: [
        { name: t('navigation.all_applications'), href: '/user/applications', icon: FileText },
        { name: t('nav_services'), href: '/user/services', icon: FolderTree },
        { name: t('nav_settings'), href: '/user/settings', icon: Settings },
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
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isChildActive = Boolean(
                  hasChildren &&
                    item.children?.some((child) => {
                      if (child.href) {
                        const childPath = child.href.split('?')[0];
                        return pathname === childPath || pathname.startsWith(`${childPath}/`);
                      }
                      if (child.children) {
                        return child.children.some((c) => {
                          const cPath = (c.href || '').split('?')[0];
                          return pathname === cPath || pathname.startsWith(`${cPath}/`);
                        });
                      }
                      return false;
                    })
                );
                const isActive = !hasChildren && (pathname === item.href || (item.href ? pathname.startsWith(`${item.href}/`) : false));
                const isOpen = openDropdowns[item.name] ?? (isChildActive || Boolean(item.href && pathname === item.href) || false);

                if (hasChildren && item.children) {
                  const isParentActive = Boolean(item.href && pathname === item.href);

                  if (isCollapsed) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href || item.children[0].href}
                        onClick={onCloseMobile}
                        title={item.name}
                        className={`group relative flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isParentActive || isChildActive
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/80 dark:border-brand-800/80 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-850/60 border border-transparent'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isParentActive || isChildActive
                              ? 'text-brand-600 dark:text-brand-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                      </Link>
                    );
                  }

                  return (
                    <div key={item.name} className="space-y-1">
                      <div
                        className={`w-full group relative flex items-center justify-between rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isParentActive
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/80 dark:border-brand-800/80 shadow-xs'
                            : isChildActive
                            ? 'bg-slate-100/70 dark:bg-slate-850/70 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-slate-800'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-850/60 border border-transparent'
                        }`}
                      >
                        <Link
                          href={item.href || '#'}
                          onClick={onCloseMobile}
                          className="flex-1 flex items-center gap-2.5 px-3 py-2 min-w-0"
                        >
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isParentActive || isChildActive
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDropdown(item.name);
                          }}
                          className="p-2 mr-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                          aria-label="Toggle submenu"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                              isOpen ? 'rotate-180 text-brand-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {isOpen && (
                        <div className="pl-4 ml-3.5 my-1 space-y-1 border-l-2 border-slate-200/80 dark:border-slate-800 transition-all">
                          {item.children.map((subItem) => {
                            const SubIcon = subItem.icon || FolderTree;

                            if (subItem.children && subItem.children.length > 0) {
                              const hasActiveChild = subItem.children.some((child) => {
                                const childTab = (child.href || '').match(/tab=([^&]+)/)?.[1];
                                return childTab === currentTab;
                              });
                              const isSubOpen = openDropdowns[subItem.name] ?? hasActiveChild;

                              return (
                                <div key={subItem.name} className="space-y-0.5 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleDropdown(subItem.name);
                                    }}
                                    className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      hasActiveChild
                                        ? 'text-brand-700 dark:text-brand-300 bg-brand-500/10'
                                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-850/80'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${hasActiveChild ? 'text-brand-600 dark:text-brand-400' : 'text-brand-500'}`} />
                                      <span className="truncate">{subItem.name}</span>
                                    </div>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                                        isSubOpen ? 'rotate-180 text-brand-500' : ''
                                      }`}
                                    />
                                  </button>

                                  {isSubOpen && (
                                    <div className="pl-3 ml-2.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800 transition-all">
                                      {subItem.children.map((child, cIdx) => {
                                        const isLast = cIdx === subItem.children!.length - 1;
                                        const childTab = (child.href || '').match(/tab=([^&]+)/)?.[1];
                                        const isChildItemActive = pathname === '/admin/employees' && childTab === currentTab;

                                        return (
                                          <Link
                                            key={child.name + (child.href || '')}
                                            href={child.href || '#'}
                                            onClick={() => {
                                              onCloseMobile?.();
                                              if (childTab && typeof window !== 'undefined') {
                                                window.dispatchEvent(new CustomEvent('hrms-tab-change', { detail: childTab }));
                                              }
                                            }}
                                            className={`group flex items-center px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                              isChildItemActive
                                                ? 'text-brand-700 dark:text-brand-300 bg-brand-500/15 font-bold shadow-xs'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-500/10'
                                            }`}
                                          >
                                            <span className={`font-mono mr-1.5 text-[10px] ${isChildItemActive ? 'text-brand-500 font-bold' : 'text-slate-300 dark:text-slate-600'}`}>
                                              {isLast ? '└──' : '├──'}
                                            </span>
                                            <span className="truncate">{child.name}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            const subTab = (subItem.href || '').match(/tab=([^&]+)/)?.[1];
                            const isSubActive =
                              pathname === (subItem.href || '').split('?')[0] &&
                              ((!subTab && (!currentTab || currentTab === 'employees')) ||
                                subTab === currentTab ||
                                (subTab === 'employees' && (!currentTab || currentTab === 'employees')));

                            return (
                              <Link
                                key={subItem.href || subItem.name}
                                href={subItem.href || '#'}
                                onClick={() => {
                                  onCloseMobile?.();
                                  if (subTab && typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('hrms-tab-change', { detail: subTab }));
                                  }
                                }}
                                className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isSubActive
                                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/80 dark:border-brand-800/80 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-850/60 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <SubIcon
                                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                                      isSubActive
                                        ? 'text-brand-600 dark:text-brand-400'
                                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                    }`}
                                  />
                                  <span className="truncate">{subItem.name}</span>
                                </div>

                                {subItem.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold transition-all flex-shrink-0 ${
                                      isSubActive
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-brand-500/15 group-hover:text-brand-600 dark:group-hover:text-brand-300'
                                    }`}
                                  >
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href || item.name}
                    href={item.href || '#'}
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
                <span className="text-[11px]">{t('common.collapse')}</span>
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
