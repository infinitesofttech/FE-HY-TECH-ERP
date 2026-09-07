'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  LayoutGrid,
  Settings,
  Landmark,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

interface UserSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [familyExpanded, setFamilyExpanded] = React.useState(true);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/user/dashboard',
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      name: 'Family',
      href: '/user/family',
      icon: Users,
      subItems: [
        { name: 'Family Card', href: '/user/family?tab=card', icon: CreditCard, tab: 'card' },
        { name: 'Family Member', href: '/user/family?tab=member', icon: UserCheck, tab: 'member' },
        { name: 'Family Wallet', href: '/user/family?tab=wallet', icon: Wallet, tab: 'wallet' },
      ],
    },
    {
      name: 'My Application',
      href: '/user/applications',
      icon: FileText,
    },
    {
      name: 'Services',
      href: '/user/services',
      icon: LayoutGrid,
    },
    {
      name: 'Setting',
      href: '/user/settings',
      icon: Settings,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.matchExact) {
      return pathname === item.href || pathname === '/customer/dashboard';
    }
    return pathname.startsWith(item.href) || pathname.startsWith(item.href.replace('/user/', '/customer/'));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link
          href="/user/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3.5 group min-w-0"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-md flex-shrink-0">
            <img
              src="/logo.png"
              alt="HY-TECH Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity">
              <h1 className="font-black text-base text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                HY-TECH ERP
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                Computer Education &amp; Online Hub
              </p>
            </div>
          )}
        </Link>

        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const hasSub = item.subItems && item.subItems.length > 0;
          const isFamilyRoute = pathname.startsWith('/user/family') || pathname.startsWith('/customer/family');

          return (
            <div key={item.name} className="space-y-1">
              <Link
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
              </Link>

              {/* Sub-items for Family (Family Card, Family Member, Family Wallet) */}
              {hasSub && !isCollapsed && isFamilyRoute && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  {item.subItems!.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group"
                      >
                        <SubIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                        <span>{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer (Desktop) */}
      <div className="p-3 border-t border-slate-800 hidden lg:flex items-center justify-between text-xs text-slate-500">
        {!isCollapsed && (
          <span className="font-mono text-[10px]">v1.0.0 &bull; eService</span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-30 border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden animate-fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
