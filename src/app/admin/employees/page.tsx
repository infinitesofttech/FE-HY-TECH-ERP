'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  Modal,
  Badge,
  Button,
  Input,
  Select,
  Card,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { employeeService } from '@/api/services/employeeService';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { EmployeeUser } from '@/types';
import { formatEmpName, getEmpInitial } from '@/i18n';
import { toast } from 'sonner';
import {
  UserCog,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Trash2,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Search,
  Calendar,
  CalendarDays,
  Clock,
  Briefcase,
  Users,
  Banknote,
  FileSpreadsheet,
  DollarSign,
  BarChart3,
  BarChart2,
  FileCheck,
  Sliders,
  Bell,
  TrendingUp,
  FileText,
  Printer,
  Eye,
  Download,
  Check,
  X,
  Building2,
  AlertCircle,
  Filter,
  Settings,
  CalendarCheck,
  Plus,
} from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const { t, language } = useLanguage();
  const isGu = language === 'gu';

  // Active Tab state synced with URL ?tab=...
  const [currentTab, setCurrentTab] = useState<string>('employees');

  useEffect(() => {
    const syncTab = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) {
          setCurrentTab(tab);
        } else {
          setCurrentTab('employees');
        }
        if (params.get('action') === 'add_employee') {
          setIsAddOpen(true);
        }
      }
    };
    syncTab();
    const handleTabChange = (e: any) => {
      if (e.detail) {
        setCurrentTab(e.detail);
      }
    };
    window.addEventListener('popstate', syncTab);
    window.addEventListener('hrms-tab-change', handleTabChange);
    return () => {
      window.removeEventListener('popstate', syncTab);
      window.removeEventListener('hrms-tab-change', handleTabChange);
    };
  }, []);

  const switchTab = (tabKey: string) => {
    setCurrentTab(tabKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabKey);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new CustomEvent('hrms-tab-change', { detail: tabKey }));
    }
  };

  // Redirection for employee role
  useEffect(() => {
    if (userRole === 'employee') {
      router.replace('/staff/hrms');
    }
  }, [userRole, router]);

  // Modals & form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<EmployeeUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [selectedSlipEmployee, setSelectedSlipEmployee] = useState<any | null>(null);

  // Leave approval interactive state
  const [pendingLeaves, setPendingLeaves] = useState([
    {
      id: 1,
      empName: 'Hardikbhai Patel',
      role: 'Digital Gujarat & Scholarship Specialist',
      type: 'Casual Leave (CL)',
      dates: '12 Sep 2026 - 13 Sep 2026 (2 Days)',
      reason: 'Family religious ceremony in hometown village',
      appliedOn: '08 Sep 2026',
      status: 'PENDING',
    },
    {
      id: 2,
      empName: 'Vinesh Sharma',
      role: 'PAN & Voter ID Executive',
      type: 'Sick Leave (SL)',
      dates: '05 Sep 2026 (1 Day)',
      reason: 'Viral fever and medical rest',
      appliedOn: '04 Sep 2026',
      status: 'APPROVED',
    },
  ]);

  const handleApproveLeave = (id: number) => {
    setPendingLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'APPROVED' } : l))
    );
    toast.success('Leave application approved successfully!');
  };

  const handleRejectLeave = (id: number) => {
    setPendingLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l))
    );
    toast.error('Leave application marked as rejected.');
  };

  // Employee Form State
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    mobile_number: '',
    role: 'STAFF' as 'STAFF' | 'ADMIN',
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees(),
  });

  const createMutation = useMutation({
    mutationFn: () => employeeService.createEmployee(form),
    onSuccess: (res) => {
      toast.success(
        res.message || (isGu ? 'સ્ટાફ સફળતાપૂર્વક ઉમેરાયો!' : 'Staff member added successfully!')
      );
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsAddOpen(false);
      setForm({
        username: '',
        password: '',
        full_name: '',
        email: '',
        mobile_number: '',
        role: 'STAFF',
      });
    },
    onError: () => toast.error(isGu ? 'કર્મચારી ઉમેરવામાં ભૂલ આવી' : 'Failed to add employee'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast.success(isGu ? 'કર્મચારી ખાતું દૂર કર્યું' : 'Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEmpToDelete(null);
    },
  });

  const adminCount = employees.filter((e) => e.role === 'ADMIN').length;
  const staffCount = employees.filter((e) => e.role === 'STAFF').length;

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.full_name?.toLowerCase().includes(q) ||
        emp.username.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.mobile_number?.includes(q) ||
        emp.designation?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [employees, searchTerm, roleFilter]);

  // Determine active group for secondary pills
  const activeGroup = useMemo(() => {
    if (['salary-structure', 'payroll', 'salary-slips', 'payroll-reports'].includes(currentTab)) {
      return 'payroll';
    }
    if (
      [
        'attendance-report',
        'leave-report',
        'employee-report',
        'late-coming-report',
        'monthly-hr-report',
      ].includes(currentTab)
    ) {
      return 'reports';
    }
    if (
      [
        'company-settings',
        'attendance-settings',
        'leave-settings',
        'notification-settings',
        'roles-permissions',
      ].includes(currentTab)
    ) {
      return 'settings';
    }
    if (currentTab === 'attendance') return 'attendance';
    if (currentTab === 'leave') return 'leave';
    return 'employees';
  }, [currentTab]);

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isGu ? 'કર્મચારી સંચાલન (HRMS)' : 'Employee Management (HRMS)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeGroup === 'employees' &&
              (isGu
                ? 'તમામ સ્ટાફ સભ્યો, તેમની વિગતો અને ઓળખપત્રોનું સંચાલન.'
                : 'Manage staff credentials, operator profiles, and role access.')}
            {activeGroup === 'attendance' &&
              (isGu
                ? 'દૈનિક બાયોમેટ્રિક હાજરી લોગ, પંચ-ઇન / આઉટ અને કાર્યકારી કલાકો.'
                : 'Daily biometric attendance logs, real-time punch-ins, and working hours.')}
            {activeGroup === 'leave' &&
              (isGu
                ? 'સ્ટાફની રજા અરજીઓ, મંજૂરી પ્રક્રિયા અને રજા બેલેન્સ ક્વોટા.'
                : 'Staff leave applications, approval workflow, and leave balance quotas.')}
            {activeGroup === 'payroll' &&
              (isGu
                ? 'માસિક પગાર ગણતરી, પગાર સ્લિપ જનરેટર અને પેરોલ રિપોર્ટ્સ.'
                : 'Payroll structures, monthly salary disbursement, and printable salary slips.')}
            {activeGroup === 'reports' &&
              (isGu
                ? 'ઓડિટેડ એચઆર એનાલિટિક્સ, હાજરી ટકાવારી અને માસિક સ્ટાફ રિપોર્ટ્સ.'
                : 'Audited HR analytics, attendance percentages, and monthly workforce reports.')}
            {activeGroup === 'settings' &&
              (isGu
                ? 'સેન્ટર એચઆર નિયમો, શિફ્ટ સમય, રજા ક્વોટા અને ઓપરેટર અધિકારો.'
                : 'Center HR policies, shift timings, leave quotas, and operator permission matrix.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {activeGroup === 'employees' && (
            <Button
              onClick={() => setIsAddOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
            >
              {isGu ? '+ નવા કર્મચારી ઉમેરો' : '+ Add New Employee'}
            </Button>
          )}
          {activeGroup === 'payroll' && (
            <Button
              onClick={() => toast.success('Payroll for current cycle calculated and queued!')}
              leftIcon={<Banknote className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Process Monthly Payroll
            </Button>
          )}
          {activeGroup === 'reports' && (
            <Button
              onClick={() => toast.info('Exporting HR report to CSV...')}
              variant="outline"
              leftIcon={<Download className="w-4 h-4 text-brand-600" />}
            >
              Export CSV Report
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top-Level HRMS Module Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => switchTab('employees')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'employees'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees ({employees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'attendance'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance (8/8)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('leave')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'leave'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Leave (1 Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('payroll')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'payroll'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Payroll ▾</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('attendance-report')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'reports'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Reports ▾</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('company-settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeGroup === 'settings'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings ▾</span>
        </button>
      </div>

      {/* 3. Sub-Pill Navigation for Nested Groups (Payroll, Reports, Settings) */}
      {activeGroup === 'payroll' && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400 px-2 uppercase tracking-wider text-[10px]">
            Payroll Modules:
          </span>
          {[
            { key: 'salary-structure', label: 'Salary Structure', icon: FileSpreadsheet },
            { key: 'payroll', label: 'Payroll Processing', icon: DollarSign },
            { key: 'salary-slips', label: 'Salary Slips', icon: FileText },
            { key: 'payroll-reports', label: 'Payroll Reports', icon: BarChart3 },
          ].map((sub) => {
            const Icon = sub.icon;
            const active = currentTab === sub.key;
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => switchTab(sub.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${active
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeGroup === 'reports' && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400 px-2 uppercase tracking-wider text-[10px]">
            HR Reports:
          </span>
          {[
            { key: 'attendance-report', label: 'Attendance Report', icon: FileCheck },
            { key: 'leave-report', label: 'Leave Report', icon: FileText },
            { key: 'employee-report', label: 'Employee Report', icon: Users },
            { key: 'late-coming-report', label: 'Late Coming Report', icon: Clock },
            { key: 'monthly-hr-report', label: 'Monthly HR Report', icon: TrendingUp },
          ].map((sub) => {
            const Icon = sub.icon;
            const active = currentTab === sub.key;
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => switchTab(sub.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${active
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeGroup === 'settings' && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400 px-2 uppercase tracking-wider text-[10px]">
            HR Settings:
          </span>
          {[
            { key: 'company-settings', label: 'Company Settings', icon: Building2 },
            { key: 'attendance-settings', label: 'Attendance Settings', icon: Sliders },
            { key: 'leave-settings', label: 'Leave Settings', icon: Calendar },
            { key: 'notification-settings', label: 'Notification Settings', icon: Bell },
            { key: 'roles-permissions', label: 'Roles & Permissions', icon: ShieldCheck },
          ].map((sub) => {
            const Icon = sub.icon;
            const active = currentTab === sub.key;
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => switchTab(sub.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${active
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENT VIEW SWITCHER */}
      {/* ========================================================================= */}

      {/* VIEW A: EMPLOYEES DIRECTORY */}
      {activeGroup === 'employees' && (
        <div className="space-y-6 animate-fade-in">
          {/* Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title={isGu ? 'કુલ સ્ટાફ' : 'TOTAL STAFF'}
              value={employees.length}
              subtitle={isGu ? 'રજીસ્ટર્ડ એકાઉન્ટ્સ' : 'Provisioned accounts'}
              icon={Users}
              colorScheme="brand"
            />
            <StatCard
              title={isGu ? 'એડમિનિસ્ટ્રેટર' : 'ADMINISTRATORS'}
              value={adminCount}
              subtitle={isGu ? 'સંપૂર્ણ એક્સેસ અધિકારો' : 'Full access rights'}
              icon={Shield}
              colorScheme="purple"
            />
            <StatCard
              title={isGu ? 'ફ્રન્ટ ડેસ્ક સ્ટાફ' : 'FRONT DESK STAFF'}
              value={staffCount}
              subtitle={isGu ? 'ઓપરેશનલ ઇનટેક ઓપરેટર્સ' : 'Operational intake operators'}
              icon={CheckCircle}
              colorScheme="emerald"
            />
          </div>

          {/* Search & Filter Bar */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isGu
                    ? 'કર્મચારીનું નામ, યૂઝરનેમ, મોબાઈલ કે હોદ્દો શોધો...'
                    : 'Search employee by name, username, mobile, designation...'
                }
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 self-stretch sm:self-auto justify-center">
              {[
                { key: 'ALL', label: isGu ? `બધા (${employees.length})` : `All (${employees.length})` },
                { key: 'STAFF', label: isGu ? `સ્ટાફ (${staffCount})` : `Staff Operators (${staffCount})` },
                { key: 'ADMIN', label: isGu ? `એડમિન (${adminCount})` : `Admins (${adminCount})` },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setRoleFilter(pill.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${roleFilter === pill.key
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Employees Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading operators directory...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No staff operators found matching &quot;{searchTerm}&quot;
                </p>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const initial = getEmpInitial(emp.full_name || emp.username);
                const displayName = formatEmpName(emp.full_name || emp.username, language);

                return (
                  <Card
                    key={emp.id}
                    variant="elevated"
                    className="p-5 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition-all rounded-2xl"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black text-base flex items-center justify-center ring-1 ring-brand-500/30">
                            {initial}
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                              {displayName}
                            </h3>
                            <p className="text-[11px] font-mono text-slate-400">
                              @{emp.username}
                            </p>
                          </div>
                        </div>

                        <Badge variant={emp.role === 'ADMIN' ? 'purple' : 'info'}>
                          {emp.role}
                        </Badge>
                      </div>

                      {emp.designation && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{emp.designation}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                        {emp.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{emp.email}</span>
                          </div>
                        )}
                        {emp.mobile_number && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="font-mono">{emp.mobile_number}</span>
                            </div>
                            <WhatsAppButton
                              phoneNumber={emp.mobile_number}
                              message={`Hello ${displayName}, this is from HY-TECH HR Desk.`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => {
                          setSelectedSlipEmployee(emp);
                          switchTab('salary-slips');
                        }}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Salary Slip</span>
                      </button>

                      {emp.role !== 'ADMIN' && (
                        <button
                          onClick={() => setEmpToDelete(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Deactivate Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW B: ATTENDANCE TRACKER */}
      {activeGroup === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="PRESENT TODAY"
              value="7"
              subtitle="Logged in on desk"
              icon={CheckCircle}
              colorScheme="emerald"
            />
            <StatCard
              title="LATE ARRIVAL"
              value="1"
              subtitle="Arrived past 09:30 AM"
              icon={Clock}
              colorScheme="amber"
            />
            <StatCard
              title="ON APPROVED LEAVE"
              value="0"
              subtitle="Authorized absence"
              icon={CalendarDays}
              colorScheme="brand"
            />
            <StatCard
              title="UNEXCUSED ABSENT"
              value="0"
              subtitle="No punch record"
              icon={AlertCircle}
              colorScheme="rose"
            />
          </div>

          <Card variant="elevated" className="p-5 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Today&apos;s Biometric &amp; Shift Punch Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Standard Shift: 09:30 AM - 06:30 PM (Grace period: 15 mins)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Date:</span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black">
                  {new Date().toISOString().split('T')[0]}
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => toast.success('Biometric device synced with central server!')}
                  leftIcon={<Clock className="w-3.5 h-3.5 text-brand-500" />}
                >
                  Sync Biometrics
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-black">Staff Member</th>
                    <th className="py-3 px-4 font-black">Designation / Desk</th>
                    <th className="py-3 px-4 font-black">Check-In</th>
                    <th className="py-3 px-4 font-black">Check-Out</th>
                    <th className="py-3 px-4 font-black">Total Hours</th>
                    <th className="py-3 px-4 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {[
                    { name: 'Jadav Durgesh', desig: 'Senior Aadhaar & Revenue Portal Operator', in: '09:15 AM', out: '06:30 PM', hrs: '9h 15m', status: 'PRESENT' },
                    { name: 'Hardikbhai Patel', desig: 'Digital Gujarat & Scholarship Specialist', in: '09:28 AM', out: '06:30 PM', hrs: '9h 02m', status: 'PRESENT' },
                    { name: 'Vinesh Sharma', desig: 'PAN Card, Passport & Voter ID Executive', in: '09:48 AM', out: '06:30 PM', hrs: '8h 42m', status: 'LATE' },
                    { name: 'Mitali Changani', desig: 'Revenue & Certified Documents Desk', in: '09:20 AM', out: '06:30 PM', hrs: '9h 10m', status: 'PRESENT' },
                    { name: 'Ronak Patel', desig: 'Computer Courses & Online Coaching Head', in: '09:12 AM', out: '06:30 PM', hrs: '9h 18m', status: 'PRESENT' },
                    { name: 'Priyaben Dave', desig: 'Banking & Financial Inclusion Desk', in: '09:30 AM', out: '06:30 PM', hrs: '9h 00m', status: 'PRESENT' },
                    { name: 'Bhavik Changani', desig: 'Printing, Legal Lamination & Delivery', in: '09:25 AM', out: '06:30 PM', hrs: '9h 05m', status: 'PRESENT' },
                    { name: 'admin (Operator)', desig: 'Managing Director & System Administrator', in: '09:00 AM', out: '07:00 PM', hrs: '10h 00m', status: 'PRESENT' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {row.desig}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {row.in}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {row.out}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {row.hrs}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Badge variant={row.status === 'PRESENT' ? 'success' : 'warning'}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW C: LEAVE MANAGEMENT */}
      {activeGroup === 'leave' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="PENDING APPROVALS"
              value={pendingLeaves.filter((l) => l.status === 'PENDING').length}
              subtitle="Awaiting administrative sign-off"
              icon={AlertCircle}
              colorScheme="amber"
            />
            <StatCard
              title="APPROVED THIS MONTH"
              value="4 Days"
              subtitle="Staff leaves granted"
              icon={CalendarCheck}
              colorScheme="emerald"
            />
            <StatCard
              title="ANNUAL QUOTA REMAINING"
              value="18 Days / Emp"
              subtitle="Average quota balance"
              icon={CalendarDays}
              colorScheme="brand"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Requests Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Leave Approval Queue</span>
              </h3>

              {pendingLeaves.map((req) => (
                <Card key={req.id} variant="elevated" className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {req.empName}
                      </h4>
                      <p className="text-xs text-slate-400">{req.role}</p>
                    </div>
                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {req.type}
                      </span>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        {req.dates}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      &quot;{req.reason}&quot;
                    </p>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleRejectLeave(req.id)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => handleApproveLeave(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve Leave
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Leave Policy Quota Matrix */}
            <Card variant="elevated" className="p-5 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-500" />
                <span>Standard Leave Policy</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Casual Leave (CL)</span>
                    <span className="text-brand-600 font-mono">12 Days / Year</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Max 2 consecutive days with 24h notice</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Sick Leave (SL)</span>
                    <span className="text-emerald-600 font-mono">6 Days / Year</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Medical prescription required for &gt; 2 days</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Earned / Paid Leave (PL)</span>
                    <span className="text-purple-600 font-mono">18 Days / Year</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Planned vacation with 7-day prior approval</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW D: PAYROLL MANAGEMENT */}
      {activeGroup === 'payroll' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-view: Salary Structure */}
          {currentTab === 'salary-structure' && (
            <Card variant="elevated" className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Designation Salary Grade Structure (CTC)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configured basic pay, house rent allowance, and statutory deductions
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => toast.success('New salary band created!')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Salary Band
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-black">Role / Grade</th>
                      <th className="py-3 px-4 font-black">Basic Pay</th>
                      <th className="py-3 px-4 font-black">HRA (20%)</th>
                      <th className="py-3 px-4 font-black">Allowances</th>
                      <th className="py-3 px-4 font-black">PF (Deduction)</th>
                      <th className="py-3 px-4 font-black text-right">Net Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium font-mono">
                    {[
                      { role: 'Senior Aadhaar & Revenue Operator', basic: '₹16,800', hra: '₹5,600', allow: '₹3,600', pf: '₹2,000', net: '₹24,000' },
                      { role: 'Digital Gujarat & Scholarship Specialist', basic: '₹14,400', hra: '₹4,800', allow: '₹3,000', pf: '₹1,800', net: '₹20,400' },
                      { role: 'PAN Card, Passport & Voter ID Executive', basic: '₹13,200', hra: '₹4,400', allow: '₹2,800', pf: '₹1,600', net: '₹18,800' },
                      { role: 'Computer Courses & Online Coaching Head', basic: '₹15,000', hra: '₹5,000', allow: '₹3,000', pf: '₹1,800', net: '₹21,200' },
                      { role: 'Printing, Legal Lamination & Delivery', basic: '₹11,000', hra: '₹3,600', allow: '₹2,400', pf: '₹1,400', net: '₹15,600' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                          {row.role}
                        </td>
                        <td className="py-3 px-4">{row.basic}</td>
                        <td className="py-3 px-4 text-slate-500">{row.hra}</td>
                        <td className="py-3 px-4 text-slate-500">{row.allow}</td>
                        <td className="py-3 px-4 text-rose-500">-{row.pf}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {row.net}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Sub-view: Payroll Processing (Default for Payroll) */}
          {(currentTab === 'payroll' || !['salary-structure', 'salary-slips', 'payroll-reports'].includes(currentTab)) && (
            <Card variant="elevated" className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Monthly Payroll Disbursement Summary
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cycle: September 2026 &bull; Total Staff Payout: ₹1,88,000.00
                  </p>
                </div>
                <Badge variant="success">DISBURSEMENT COMPLETED</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-sans">Gross Total Salary</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">₹2,02,400.00</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-sans">Total Statutory Deductions</span>
                  <div className="text-xl font-black text-rose-500 mt-1">-₹14,400.00</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-sans">Net Disbursed to Bank</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹1,88,000.00</div>
                </div>
              </div>
            </Card>
          )}

          {/* Sub-view: Salary Slips */}
          {currentTab === 'salary-slips' && (
            <Card variant="elevated" className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Staff Salary Slip Vault &amp; Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official payslips with company stamp and breakdown
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Batch Slips
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Jadav Durgesh', role: 'Senior Aadhaar Operator', net: '₹24,000', month: 'Aug 2026', slipNo: 'SLIP-2026-0801' },
                  { name: 'Hardikbhai Patel', role: 'Digital Gujarat Specialist', net: '₹20,400', month: 'Aug 2026', slipNo: 'SLIP-2026-0802' },
                  { name: 'Vinesh Sharma', role: 'PAN Card & Voter ID Exec', net: '₹18,800', month: 'Aug 2026', slipNo: 'SLIP-2026-0803' },
                  { name: 'Mitali Changani', role: 'Revenue Documents Desk', net: '₹21,200', month: 'Aug 2026', slipNo: 'SLIP-2026-0804' },
                ].map((slip, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-brand-500/50 transition-all bg-white dark:bg-slate-900"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-brand-600 font-bold">{slip.slipNo}</span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{slip.name}</h4>
                      <p className="text-xs text-slate-400">{slip.role} &bull; {slip.month}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-emerald-600">{slip.net}</div>
                      <Button
                        size="xs"
                        variant="glass"
                        className="mt-1"
                        onClick={() => toast.success(`Generated official slip PDF for ${slip.name}`)}
                        leftIcon={<Eye className="w-3 h-3" />}
                      >
                        View Slip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sub-view: Payroll Reports */}
          {currentTab === 'payroll-reports' && (
            <Card variant="elevated" className="p-5 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Yearly &amp; Monthly Payroll Expenditure Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Total center workforce expenditure trend (Jan 2026 - Sep 2026)
              </p>
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <BarChart3 className="w-12 h-12 text-brand-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Annual Budget Allocated: ₹24,00,000.00 &bull; Disbursed to Date: ₹16,92,000.00 (70.5%)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  100% compliance with PF &amp; professional tax filing.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* VIEW E: HR REPORTS */}
      {activeGroup === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <Card variant="elevated" className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {currentTab.replace('-', ' ')}
                </h3>
                <p className="text-xs text-slate-400">
                  Active Period: 01 Sep 2026 - 08 Sep 2026 &bull; Scope: Entire Center Workforce
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => toast.success('Report printed to PDF')}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print
                </Button>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => toast.success('Report downloaded to spreadsheet')}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Excel
                </Button>
              </div>
            </div>

            {currentTab === 'late-coming-report' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-black">Date</th>
                      <th className="py-2.5 px-4 font-black">Employee</th>
                      <th className="py-2.5 px-4 font-black">Punch In</th>
                      <th className="py-2.5 px-4 font-black">Minutes Late</th>
                      <th className="py-2.5 px-4 font-black">Reason / Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    <tr>
                      <td className="py-3 px-4 font-mono">08 Sep 2026</td>
                      <td className="py-3 px-4 font-bold">Vinesh Sharma</td>
                      <td className="py-3 px-4 font-mono text-amber-500 font-bold">09:48 AM</td>
                      <td className="py-3 px-4 font-mono font-black text-rose-500">+18 Mins</td>
                      <td className="py-3 px-4 text-slate-400">Traffic delay at railway crossing</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono">03 Sep 2026</td>
                      <td className="py-3 px-4 font-bold">Bhavik Changani</td>
                      <td className="py-3 px-4 font-mono text-amber-500 font-bold">09:42 AM</td>
                      <td className="py-3 px-4 font-mono font-black text-rose-500">+12 Mins</td>
                      <td className="py-3 px-4 text-slate-400">Heavy rain</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <FileCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Comprehensive {currentTab.replace('-', ' ')} Generated
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Average Center Attendance: 96.4% &bull; Zero compliance flags detected this month.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW F: HR SETTINGS */}
      {activeGroup === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          <Card variant="elevated" className="p-6 max-w-3xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {currentTab.replace('-', ' ')}
            </h3>

            {currentTab === 'company-settings' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Center Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="HY-TECH CITIZEN SERVICES & COMPUTER HUB"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Center Opening Time
                    </label>
                    <input
                      type="text"
                      defaultValue="09:00 AM"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Center Closing Time
                    </label>
                    <input
                      type="text"
                      defaultValue="07:00 PM"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'attendance-settings' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Grace Period for Punch-In
                    </label>
                    <input
                      type="text"
                      defaultValue="15 Minutes"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Half-Day Cutoff After
                    </label>
                    <input
                      type="text"
                      defaultValue="01:30 PM"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'leave-settings' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Casual Leave (CL)
                    </label>
                    <input
                      type="number"
                      defaultValue="12"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Sick Leave (SL)
                    </label>
                    <input
                      type="number"
                      defaultValue="6"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Paid Leave (PL)
                    </label>
                    <input
                      type="number"
                      defaultValue="18"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'notification-settings' && (
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                  <span className="font-bold">Send daily WhatsApp punch-in summary to Admin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                  <span className="font-bold">Notify staff via SMS when leave request is approved</span>
                </label>
              </div>
            )}

            {currentTab === 'roles-permissions' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-500">
                  Role matrix: Administrator has full access to financial ledgers, salary structure, and employee credentials. Staff operators are limited to citizen service processing and attendance punch-in.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                onClick={() => toast.success('HR configuration settings saved successfully!')}
                className="bg-brand-600 text-white font-bold"
              >
                Save HR Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Add Employee */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Provision New Staff Account"
        description="Assign operator portal login credentials and role."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Username *"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="e.g. jadav_durgesh"
          />

          <Input
            label="Initial Password *"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Secure password"
          />

          <Input
            label="Full Name *"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. જાદવ દુર્ગેશ (Jadav Durgesh)"
          />

          <Input
            label="Email *"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jadav@hytech.com"
          />

          <Input
            label="Mobile Number"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            placeholder="10-digit mobile number"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Role &bull; પરવાનગી
            </label>
            <Select
              options={[
                { value: 'STAFF', label: 'STAFF - Front Desk Operator' },
                { value: 'ADMIN', label: 'ADMIN - Full Administrative Rights' },
              ]}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="bg-brand-600 text-white font-bold"
            >
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!empToDelete}
        onClose={() => setEmpToDelete(null)}
        onConfirm={() => empToDelete && deleteMutation.mutate(empToDelete.id)}
        title="Remove Staff Operator"
        message={`Are you sure you want to deactivate ${empToDelete?.full_name || empToDelete?.username}? They will no longer be able to log in.`}
        confirmText="Remove Employee"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
