'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  Card,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  StatCard,
} from '@/components/ui';
import { employeeService } from '@/api/services/employeeService';
import { hrmsService } from '@/api/services/hrmsService';
import { applicationService } from '@/api/services/applicationService';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useLanguage } from '@/context/LanguageContext';
import { formatEmpName, getEmpInitial } from '@/i18n';
import {
  EmployeeUser,
  AttendanceRecord,
  LeaveRecord,
  HolidayItem,
  LeaveBalance,
  AttendanceStatus,
  LeaveType,
} from '@/types';
import { toast } from 'sonner';
import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Palmtree,
  FileText,
  DollarSign,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Plus,
  Check,
  Building2,
  Sparkles,
  Download,
} from 'lucide-react';

export default function EmployeeHRMSDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isGu = language === 'gu';
  const empId = Number(params?.id);


  // Active HRMS Sub-Tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'holidays' | 'tasks' | 'salary'>('attendance');

  // Punch Attendance Modal State
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchForm, setPunchForm] = useState({
    date: new Date().toISOString().split('T')[0],
    in_time: '09:30 AM',
    out_time: '06:30 PM',
    status: 'PRESENT' as AttendanceStatus,
    notes: 'Biometric verified entry',
  });

  // Apply Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'CASUAL' as LeaveType,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    days_count: 1,
    reason: '',
  });

  // Fetch Employee Profile
  const { data: employee, isLoading: isEmpLoading } = useQuery({
    queryKey: ['employee-detail', empId],
    queryFn: () => employeeService.getEmployeeDetail(empId),
    enabled: !!empId,
  });

  // Fetch Attendance Records
  const { data: attendanceList = [] } = useQuery({
    queryKey: ['employee-attendance', empId],
    queryFn: () => hrmsService.getEmployeeAttendance(empId),
    enabled: !!empId,
  });

  // Fetch Leave Balance
  const { data: leaveBalance } = useQuery({
    queryKey: ['employee-leave-balance', empId],
    queryFn: () => hrmsService.getEmployeeLeaveBalance(empId),
    enabled: !!empId,
  });

  // Fetch Leaves History
  const { data: leavesHistory = [] } = useQuery({
    queryKey: ['employee-leaves', empId],
    queryFn: () => hrmsService.getEmployeeLeaves(empId),
    enabled: !!empId,
  });

  // Fetch Annual Holidays
  const { data: holidays = [] } = useQuery({
    queryKey: ['annual-holidays'],
    queryFn: () => hrmsService.getHolidays(),
  });

  // Fetch Applications processed by this employee
  const { data: applications = [] } = useQuery({
    queryKey: ['applications-assigned', empId],
    queryFn: () => applicationService.getApplications(),
  });

  const assignedApps = useMemo(() => {
    if (!employee) return [];
    return applications.filter(
      (a) =>
        a.assigned_staff === empId ||
        (a.assigned_staff_name &&
          employee.full_name &&
          a.assigned_staff_name.toLowerCase().includes(employee.username.toLowerCase()))
    );
  }, [applications, empId, employee]);

  // Attendance Punch Mutation
  const punchMutation = useMutation({
    mutationFn: () =>
      hrmsService.punchAttendance({
        employee_id: empId,
        date: punchForm.date,
        in_time: punchForm.in_time,
        out_time: punchForm.out_time,
        status: punchForm.status,
        notes: punchForm.notes,
      }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['employee-attendance', empId] });
      setIsPunchModalOpen(false);
    },
    onError: () => toast.error('Failed to log attendance'),
  });

  // Apply Leave Mutation
  const applyLeaveMutation = useMutation({
    mutationFn: () =>
      hrmsService.applyLeave({
        employee_id: empId,
        leave_type: leaveForm.leave_type,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        days_count: Number(leaveForm.days_count),
        reason: leaveForm.reason,
      }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['employee-leaves', empId] });
      setIsLeaveModalOpen(false);
      setLeaveForm({
        leave_type: 'CASUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        days_count: 1,
        reason: '',
      });
    },
    onError: () => toast.error('Failed to submit leave request'),
  });

  // Approve / Reject Leave Mutation
  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ leaveId, status }: { leaveId: number; status: 'APPROVED' | 'REJECTED' }) =>
      hrmsService.updateLeaveStatus(leaveId, status),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['employee-leaves', empId] });
      queryClient.invalidateQueries({ queryKey: ['employee-leave-balance', empId] });
    },
  });

  // Attendance Metrics
  const attendanceMetrics = useMemo(() => {
    const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;
    const halfDayCount = attendanceList.filter((a) => a.status === 'HALF_DAY').length;
    const holidayCount = attendanceList.filter((a) => a.status === 'HOLIDAY').length;
    const totalWorkingDays = 26;
    const effectivePresent = presentCount + halfDayCount * 0.5;
    const percentage = totalWorkingDays > 0 ? ((effectivePresent / totalWorkingDays) * 100).toFixed(1) : '100';

    return {
      presentCount,
      absentCount,
      halfDayCount,
      holidayCount,
      totalWorkingDays,
      percentage,
    };
  }, [attendanceList]);

  if (isEmpLoading) {
    return (
      <AppShell allowedRoles={['admin', 'employee']}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell allowedRoles={['admin', 'employee']}>
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Employee Not Found</h2>
          <Button onClick={() => router.push('/admin/employees')}>Back to Employees</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      <div className="space-y-6 pb-12">
        {/* Top Breadcrumb & Return Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← {t('hrms.back_to_directory')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPunchModalOpen(true)}
              leftIcon={<Clock className="w-4 h-4 text-emerald-600" />}
            >
              {t('hrms.punch_attendance')}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsLeaveModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-brand-600 text-white font-bold"
            >
              {t('hrms.apply_leave')}
            </Button>
          </div>
        </div>

        {/* Employee Hero Profile Header */}
        <Card variant="elevated" className="p-6 relative overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-500/20 ring-4 ring-white dark:ring-slate-900 shrink-0">
                {getEmpInitial(employee.full_name, language, employee.username, 'E')}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {formatEmpName(employee.full_name || employee.username, language)}
                  </h1>
                  <Badge variant={employee.role === 'ADMIN' ? 'purple' : 'info'}>
                    {employee.role}
                  </Badge>
                  <Badge variant="success">{t('hrms.active_staff')}</Badge>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                  <span>{employee.designation || 'Front-Desk Service Operator'}</span>
                  <span>&bull;</span>
                  <span>{employee.department || 'Operations'}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{employee.mobile_number || '9876543210'}</span>
                    <WhatsAppButton number={employee.mobile_number || '9876543210'} size="xs" />
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{employee.email || 'operator@hytech.com'}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('hrms.shift')}: {employee.shift_timing || '09:30 AM - 06:30 PM'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center sm:text-right">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('hrms.attendance_rate')}</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {attendanceMetrics.percentage}%
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('hrms.remaining_leaves')}</div>
                <div className="text-xl font-black text-brand-600 dark:text-brand-400">
                  {leaveBalance ? (leaveBalance.casual_total - leaveBalance.casual_used) + (leaveBalance.sick_total - leaveBalance.sick_used) : 11} {t('hrms.days')}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* HRMS Main Navigation Tabs - Small-Size Box Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
          {/* 1. Attendance Box */}
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
              activeTab === 'attendance'
                ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              activeTab === 'attendance'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{t('hrms.tab_attendance')}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('hrms.tab_attendance_sub')}</div>
            </div>
          </button>

          {/* 2. Holidays & Leaves Box */}
          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
              activeTab === 'holidays'
                ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              activeTab === 'holidays'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20'
            }`}>
              <Palmtree className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{t('hrms.tab_holidays')}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('hrms.tab_holidays_sub')}</div>
            </div>
          </button>

          {/* 3. Assigned Applications / Tasks Box */}
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
              activeTab === 'tasks'
                ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              activeTab === 'tasks'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{t('hrms.tab_tasks')}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('hrms.tab_tasks_sub')}</div>
            </div>
          </button>

          {/* 4. Salary & Ledger Box */}
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
              activeTab === 'salary'
                ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              activeTab === 'salary'
                ? 'bg-purple-500 text-white shadow-xs'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{t('hrms.tab_salary')}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{t('hrms.tab_salary_sub')}</div>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ATTENDANCE & BIOMETRIC LOGS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Attendance Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('hrms.working_days')}</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {attendanceMetrics.totalWorkingDays}
                </div>
                <span className="text-[11px] text-slate-400">2026</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t('hrms.present_days')}
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {attendanceMetrics.presentCount}
                </div>
                <span className="text-[11px] text-emerald-600/80">{t('hrms.full_attendance')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {t('hrms.absent_days')}
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {attendanceMetrics.absentCount}
                </div>
                <span className="text-[11px] text-rose-600/80">{t('hrms.unauthorized_leave')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {t('hrms.half_day')}
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {attendanceMetrics.halfDayCount}
                </div>
                <span className="text-[11px] text-amber-600/80">{t('hrms.half_day_log')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {t('hrms.holidays')}
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {attendanceMetrics.holidayCount}
                </div>
                <span className="text-[11px] text-blue-600/80">{t('hrms.public_holiday')}</span>
              </div>
            </div>

            {/* Attendance Monthly Punch Log Table */}
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-600" />
                    <span>{t('hrms.daily_punch_logs')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('hrms.daily_punch_logs_desc')}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPunchModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  {t('hrms.manual_punch')}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{t('hrms.date')}</th>
                      <th className="px-4 py-3">{t('hrms.day')}</th>
                      <th className="px-4 py-3">{t('hrms.in_time')}</th>
                      <th className="px-4 py-3">{t('hrms.out_time')}</th>
                      <th className="px-4 py-3">{t('hrms.hours')}</th>
                      <th className="px-4 py-3">{t('hrms.status')}</th>
                      <th className="px-4 py-3">{t('hrms.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {attendanceList.length > 0 ? (
                      attendanceList.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {rec.date}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {rec.day_name}
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {rec.in_time || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                            {rec.out_time || '—'}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {rec.work_hours ? `${rec.work_hours} hrs` : '0 hrs'}
                          </td>
                          <td className="px-4 py-3">
                            {rec.status === 'PRESENT' && (
                              <Badge variant="success">{t('hrms.status_present')}</Badge>
                            )}
                            {rec.status === 'ABSENT' && (
                              <Badge variant="danger">{t('hrms.status_absent')}</Badge>
                            )}
                            {rec.status === 'HALF_DAY' && (
                              <Badge variant="warning">{t('hrms.status_half_day')}</Badge>
                            )}
                            {rec.status === 'HOLIDAY' && (
                              <Badge variant="info">{t('hrms.status_holiday')}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {rec.notes || 'Normal shift'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          {language === 'gu'
                            ? 'આ કર્મચારી માટે કોઈ હાજરી રેકોર્ડ મળ્યો નથી.'
                            : language === 'hi'
                            ? 'इस कर्मचारी के लिए कोई उपस्थिति रिकॉर्ड नहीं मिला।'
                            : 'No attendance records found for this staff member.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HOLIDAY & LEAVE MANAGEMENT                                         */}
        {/* ========================================================================= */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            {/* Leave Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Casual Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {t('hrms.casual_leave')}
                  </span>
                  <Badge variant="info">CL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                    {leaveBalance ? leaveBalance.casual_total - leaveBalance.casual_used : 9}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.casual_total || 12} {t('hrms.days_remaining')}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.casual_total - leaveBalance.casual_used) / leaveBalance.casual_total) * 100
                          : 75
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {t('hrms.used')}: {leaveBalance?.casual_used || 3} {t('hrms.days')} &bull; {t('hrms.total_approved')}: {leaveBalance?.casual_total || 12} {t('hrms.days')}
                </div>
              </div>

              {/* Sick Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {t('hrms.sick_leave')}
                  </span>
                  <Badge variant="warning">SL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {leaveBalance ? leaveBalance.sick_total - leaveBalance.sick_used : 6}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.sick_total || 7} {t('hrms.days_remaining')}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.sick_total - leaveBalance.sick_used) / leaveBalance.sick_total) * 100
                          : 85
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {t('hrms.used')}: {leaveBalance?.sick_used || 1} {t('hrms.days')} &bull; {t('hrms.total_approved')}: {leaveBalance?.sick_total || 7} {t('hrms.days')}
                </div>
              </div>

              {/* Paid / Earned Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {t('hrms.paid_leave')}
                  </span>
                  <Badge variant="success">PL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {leaveBalance ? leaveBalance.paid_total - leaveBalance.paid_used : 3}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.paid_total || 5} {t('hrms.days_remaining')}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.paid_total - leaveBalance.paid_used) / leaveBalance.paid_total) * 100
                          : 60
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {t('hrms.used')}: {leaveBalance?.paid_used || 2} {t('hrms.days')} &bull; {t('hrms.total_approved')}: {leaveBalance?.paid_total || 5} {t('hrms.days')}
                </div>
              </div>
            </div>

            {/* Leave Applications History */}
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Palmtree className="w-4 h-4 text-brand-600" />
                    <span>{t('hrms.leave_history')}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('hrms.leave_history_desc')}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsLeaveModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-brand-600 text-white font-bold"
                >
                  {t('hrms.new_leave_req')}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{t('hrms.leave_type')}</th>
                      <th className="px-4 py-3">{t('hrms.dates')}</th>
                      <th className="px-4 py-3">{t('hrms.days_count')}</th>
                      <th className="px-4 py-3">{t('hrms.reason')}</th>
                      <th className="px-4 py-3">{t('hrms.status')}</th>
                      <th className="px-4 py-3">{t('hrms.approved_by')}</th>
                      <th className="px-4 py-3 text-right">{t('hrms.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {leavesHistory.length > 0 ? (
                      leavesHistory.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <Badge variant={l.leave_type === 'SICK' ? 'warning' : 'info'}>
                              {l.leave_type} LEAVE
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {l.start_date} {l.start_date !== l.end_date ? `to ${l.end_date}` : ''}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {l.days_count} દિવસ
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {l.reason}
                          </td>
                          <td className="px-4 py-3">
                            {l.status === 'APPROVED' && (
                              <Badge variant="success">APPROVED (મંજૂર)</Badge>
                            )}
                            {l.status === 'PENDING' && (
                              <Badge variant="warning">PENDING (પેન્ડિંગ)</Badge>
                            )}
                            {l.status === 'REJECTED' && (
                              <Badge variant="danger">REJECTED (નામંજૂર)</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {l.approved_by || 'Admin Manager'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {l.status === 'PENDING' ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLeaveStatusMutation.mutate({
                                      leaveId: l.id,
                                      status: 'APPROVED',
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/30 text-[11px] font-bold"
                                >
                                  મંજૂર કરો
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLeaveStatusMutation.mutate({
                                      leaveId: l.id,
                                      status: 'REJECTED',
                                    })
                                  }
                                  className="px-2 py-1 rounded bg-rose-500/15 text-rose-700 hover:bg-rose-500/30 text-[11px] font-bold"
                                >
                                  નામંજૂર
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">પૂર્ણ</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                          કોઈ રજા અરજી નથી.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Annual Center & Government Holidays Calendar */}
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>વાર્ષિક સેન્ટર અને સરકારી રજાઓનું કેલેન્ડર (Annual Holiday Calendar 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  સેન્ટરના તમામ સ્ટાફ માટે લાગુ પડતી સત્તાવાર રજાઓ અને તહેવારોનું લિસ્ટ.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">તારીખ (Date)</th>
                      <th className="px-4 py-3">વાર (Day)</th>
                      <th className="px-4 py-3">તહેવાર / રજા (Holiday Name)</th>
                      <th className="px-4 py-3">ગુજરાતી નામ</th>
                      <th className="px-4 py-3">પ્રકાર (Type)</th>
                      <th className="px-4 py-3">વિગત (Details)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {holidays.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {h.date}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {h.day}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {h.title}
                        </td>
                        <td className="px-4 py-3 text-brand-600 dark:text-brand-400 font-bold">
                          {h.title_gu}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={h.type === 'NATIONAL' ? 'danger' : h.type === 'GOVERNMENT' ? 'success' : 'purple'}>
                            {h.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {h.description || 'Public center holiday'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ASSIGNED APPLICATIONS & WORK (કામગીરી)                                */}
        {/* ========================================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>ઓપરેટર દ્વારા પ્રોસેસ થયેલ અરજીઓ (Assigned Applications)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    આ સ્ટાફ સભ્ય દ્વારા નોંધાયેલ અથવા હેન્ડલ થયેલી નાગરિક અરજીઓની સૂચિ.
                  </p>
                </div>
                <Badge variant="info">કુલ {assignedApps.length} અરજીઓ</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">અરજી નં. (Application No)</th>
                      <th className="px-4 py-3">નાગરિક (Citizen)</th>
                      <th className="px-4 py-3">સેવા (Service)</th>
                      <th className="px-4 py-3">ફી (Fee)</th>
                      <th className="px-4 py-3">સ્થિતિ (Status)</th>
                      <th className="px-4 py-3">અગ્રતા (Priority)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {assignedApps.length > 0 ? (
                      assignedApps.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-brand-600">
                            {app.application_no}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {app.customer_name}
                            </span>
                            <span className="block font-mono text-[10px] text-slate-400">
                              {app.customer_family_id}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {app.service_name}
                          </td>
                          <td className="px-4 py-3 font-black text-emerald-600">
                            ₹{app.total_fee}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={app.status === 'COMPLETED' ? 'success' : 'warning'}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={app.priority === 'HIGH' || app.priority === 'URGENT' ? 'danger' : 'default'}>
                              {app.priority || 'NORMAL'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                          આ ઓપરેટર સાથે જોડાયેલ કોઈ તાજેતરની અરજી નથી.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SALARY & ADVANCE LEDGER (પગાર હિસાબ)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'salary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">માસિક મૂળ પગાર</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{employee.basic_salary || 20000}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">ફિક્સ માસિક પે-રોલ</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">અગાઉ લીધેલ રકમ (Advance)</span>
                <div className="text-3xl font-black text-rose-600">
                  ₹0.00
                </div>
                <span className="text-[11px] text-slate-400">કોઈ એડવાન્સ બાકી નથી</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 shadow-xs space-y-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">ચૂકવવાપાત્ર ચોખ્ખી રકમ (Net)</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{employee.basic_salary || 20000}
                </div>
                <span className="text-[11px] text-emerald-600/80">સપ્ટેમ્બર ૨૦૨૬ અંદાજિત</span>
              </div>
            </div>

            <Card variant="elevated" className="p-5 border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">પે-રોલ અને બેંક ખાતાની વિગતો</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 font-bold">બેંકનું નામ:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">State Bank of India (SBI)</div>
                  <span className="text-slate-400 font-bold">ખાતા નંબર:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200">XXXX-XXXX-4589</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 font-bold">IFSC કોડ:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200">SBIN0001234</div>
                  <span className="text-slate-400 font-bold">પેમેન્ટ મોડ:</span>
                  <div className="font-bold text-emerald-600">ડાયરેક્ટ NEFT / બેંક ટ્રાન્સફર</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PUNCH / MARK ATTENDANCE                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        title="આજની હાજરી નોંધો (Mark Attendance)"
        description={`કર્મચારી: ${employee.full_name} (@${employee.username})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="તારીખ (Date)"
            type="date"
            value={punchForm.date}
            onChange={(e) => setPunchForm({ ...punchForm, date: e.target.value })}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              હાજરી સ્થિતિ (Attendance Status)
            </label>
            <Select
              options={[
                { value: 'PRESENT', label: 'PRESENT - સંપૂર્ણ હાજર' },
                { value: 'HALF_DAY', label: 'HALF DAY - અડધો દિવસ' },
                { value: 'ABSENT', label: 'ABSENT - ગેરહાજર' },
                { value: 'HOLIDAY', label: 'HOLIDAY - સરકારી રજા' },
              ]}
              value={punchForm.status}
              onChange={(e) => setPunchForm({ ...punchForm, status: e.target.value as any })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ઇન-ટાઇમ (In-Time)"
              value={punchForm.in_time}
              onChange={(e) => setPunchForm({ ...punchForm, in_time: e.target.value })}
              placeholder="09:30 AM"
            />
            <Input
              label="આઉટ-ટાઇમ (Out-Time)"
              value={punchForm.out_time}
              onChange={(e) => setPunchForm({ ...punchForm, out_time: e.target.value })}
              placeholder="06:30 PM"
            />
          </div>

          <Input
            label="નોંધ / રિમાર્ક (Notes)"
            value={punchForm.notes}
            onChange={(e) => setPunchForm({ ...punchForm, notes: e.target.value })}
            placeholder="દા.ત. સમયસર હાજરી અથવા ખાસ નોંધ"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsPunchModalOpen(false)}>
              રદ કરો
            </Button>
            <Button
              onClick={() => punchMutation.mutate()}
              isLoading={punchMutation.isPending}
              className="bg-brand-600 text-white font-bold"
            >
              હાજરી સેવ કરો
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: APPLY LEAVE                                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="નવી રજા અરજી (Apply Leave)"
        description={`કર્મચારી: ${employee.full_name} (@${employee.username})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              રજાનો પ્રકાર (Leave Type)
            </label>
            <Select
              options={[
                { value: 'CASUAL', label: 'કેઝ્યુઅલ રજા (Casual Leave - CL)' },
                { value: 'SICK', label: 'માંદગી રજા (Sick Leave - SL)' },
                { value: 'PAID', label: 'પેઇડ રજા (Paid Leave - PL)' },
                { value: 'UNPAID', label: 'બિન-પગારી રજા (Unpaid Leave)' },
              ]}
              value={leaveForm.leave_type}
              onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value as any })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="શરૂઆતની તારીખ"
              type="date"
              value={leaveForm.start_date}
              onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
            />
            <Input
              label="અંતિમ તારીખ"
              type="date"
              value={leaveForm.end_date}
              onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
            />
          </div>

          <Input
            label="કુલ દિવસોની સંખ્યા"
            type="number"
            min="1"
            value={leaveForm.days_count}
            onChange={(e) => setLeaveForm({ ...leaveForm, days_count: Number(e.target.value) })}
          />

          <Input
            label="રજાનું કારણ (Reason) *"
            placeholder="દા.ત. પારિવારિક પ્રસંગ / બીમારી વગેરે..."
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
              રદ કરો
            </Button>
            <Button
              onClick={() => applyLeaveMutation.mutate()}
              isLoading={applyLeaveMutation.isPending}
              disabled={!leaveForm.reason}
              className="bg-brand-600 text-white font-bold"
            >
              અરજી સબમિટ કરો
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
