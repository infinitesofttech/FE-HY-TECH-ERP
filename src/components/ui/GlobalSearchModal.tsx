'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  LayoutDashboard,
  Users,
  CalendarCheck,
  KanbanSquare,
  Receipt,
  FolderTree,
  UserCog,
  Settings,
  BellRing,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { userRole } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const basePrefix = userRole === 'customer' ? '/customer' : userRole === 'employee' ? '/staff' : '/admin';

  const navItems = [
    { title: 'Dashboard', desc: 'Analytics & Command Hub', href: `${basePrefix}/dashboard`, icon: LayoutDashboard },
    { title: 'Customers Directory', desc: 'Search & manage citizen families', href: `${basePrefix}/customers`, icon: Users },
    { title: 'Service Visits', desc: 'Customer visit intake wizard & checklist', href: `${basePrefix}/visits`, icon: CalendarCheck },
    { title: 'Pending Work Kanban', desc: 'Government portal progress tracker', href: `${basePrefix}/pending-work`, icon: KanbanSquare },
    { title: 'Financial Transactions', desc: 'Billing ledger, points, & wallet credits', href: `${basePrefix}/transactions`, icon: Receipt },
    { title: 'Citizen Reminders', desc: 'SMS alerts & customer follow-up feed', href: `${basePrefix}/reminders`, icon: BellRing },
    ...(userRole === 'admin'
      ? [
          { title: 'Service Catalog Manager', desc: 'Configure services, sub-services & required docs', href: '/admin/services', icon: FolderTree },
          { title: 'Employee Management', desc: 'Operator accounts & desk permissions', href: '/admin/employees', icon: UserCog },
        ]
      : []),
    { title: 'System Settings', desc: 'Environment diagnostics, language & theme', href: `${basePrefix}/settings`, icon: Settings },
  ];

  const filteredItems = navItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, modules, or press ESC to close..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Navigation & Workflows
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching modules or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-500/10 dark:hover:bg-brand-500/15 group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
