'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  ChevronDown,
  FilePlus,
  Users,
  UserPlus,
  Layers,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export interface QuickAddDropdownProps {
  onAddNewApplication?: () => void;
  onAddFamily?: () => void;
  onAddFamilyMember?: () => void;
  onAddServices?: () => void;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onAddEmployee?: () => void;
  variant?: 'button' | 'icon' | 'compact';
  className?: string;
  buttonLabel?: string;
  align?: 'left' | 'right';
}

export const QuickAddDropdown: React.FC<QuickAddDropdownProps> = ({
  onAddNewApplication,
  onAddFamily,
  onAddFamilyMember,
  onAddServices,
  onAddExpense,
  onAddIncome,
  onAddEmployee,
  variant = 'button',
  className = '',
  buttonLabel = '+ Quick Add',
  align = 'right',
}) => {
  const { language } = useLanguage();
  const { userRole } = useAuth();
  const isGu = language === 'gu';
  const prefix = userRole === 'employee' ? '/staff' : '/admin';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (callback?: () => void, fallbackPath?: string) => {
    setIsOpen(false);
    if (callback) {
      callback();
    } else if (fallbackPath) {
      router.push(fallbackPath);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
          title="Quick Actions Menu (+)"
          aria-expanded={isOpen}
        >
          <Plus className={`w-4 h-4 stroke-[3] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm shadow-brand-600/25 transition-all active:scale-[0.98] cursor-pointer"
          aria-expanded={isOpen}
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{buttonLabel}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-md shadow-brand-600/30 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
          aria-expanded={isOpen}
        >
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{buttonLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
          role="menu"
        >
          {/* Header Banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-200" />
              <div>
                <div className="text-xs font-black tracking-wide">Quick Add Menu</div>
                <div className="text-[10px] text-brand-100/90 font-medium">
                  {isGu ? 'ત્વરિત ઉમેરો (સરકારી અને ઓફિસ સેવાઓ)' : 'Quick Create & Registration Actions'}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider">
              Create
            </span>
          </div>

          <div className="max-h-[75vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* 1. APPLICATION SECTION */}
            <div className="py-2 first:pt-1">
              <div className="px-2.5 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGu ? 'Application (અરજી અને સેવાઓ)' : 'Application (Forms & Services)'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  Apps
                </span>
              </div>
              <div className="space-y-0.5">
                {/* Add New Application */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddNewApplication, `${prefix}/applications?action=new`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FilePlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      Add New Application
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'નવી સરકારી અરજી દાખલ કરો (Service Intake)' : 'New citizen service intake & application'}
                    </div>
                  </div>
                </button>

                {/* Add Family */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddFamily, `${prefix}/customers?action=add_family`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      Add Family
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'નવો પરિવાર રજીસ્ટર કરો (Register New Family)' : 'Register new citizen household unit'}
                    </div>
                  </div>
                </button>

                {/* Add Family Member */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddFamilyMember, `${prefix}/customers?action=add_member`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      Add Family Member
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'પરિવારના નવા સભ્ય ઉમેરો (Family Member)' : 'Add member under registered family'}
                    </div>
                  </div>
                </button>

                {/* Add Services */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddServices, `${prefix}/services?action=add_service`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      Add Services
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'નવી યોજના / સેવા કેટેલોગમાં ઉમેરો (New Service)' : 'Create new government scheme or service'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. FINANCE SECTION */}
            <div className="py-2">
              <div className="px-2.5 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGu ? 'Finance (નાણાકીય)' : 'Finance (Ledger & Accounts)'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  Accounts
                </span>
              </div>
              <div className="space-y-0.5">
                {/* Add Expense */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddExpense, `${prefix}/transactions?type=EXPENSE&action=new_expense`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      Add Expense
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'ઓફિસ / પોર્ટલ ખર્ચ નોંધો (Office Expense)' : 'Record office utility or portal wallet expense'}
                    </div>
                  </div>
                </button>

                {/* Add Income */}
                <button
                  type="button"
                  onClick={() => handleAction(onAddIncome, `${prefix}/transactions?type=INCOME&action=new_income`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Add Income
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {isGu ? 'ગ્રાહક પેમેન્ટ / આવક નોંધો (Billing & Payment)' : 'Record customer payment receipt & bill'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. HRMS SECTION */}
            <div className="py-2 last:pb-1">
              <div className="px-2.5 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGu ? 'HRMS (કર્મચારી વ્યવસ્થાપન)' : 'HRMS (Staff & Payroll)'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  Staff
                </span>
              </div>
              <div className="space-y-0.5">
                {/* Add Employee */}
                <button
                  type="button"
                  onClick={() =>
                    handleAction(
                      onAddEmployee,
                      userRole === 'employee' ? '/staff/hrms' : '/admin/employees?action=add_employee'
                    )
                  }
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {userRole === 'employee' ? (isGu ? 'હાજરી અને રજાઓ (My HRMS)' : 'My HRMS & Attendance') : 'Add Employee'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {userRole === 'employee'
                        ? (isGu ? 'તમારી દૈનિક હાજરી, હોલિડે અને રજાઓ' : 'Track attendance, holidays & leaves')
                        : (isGu ? 'નવો સ્ટાફ / કર્મચારી પ્રોફાઇલ ઉમેરો (New Staff)' : 'Provision new staff or operator profile')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
