'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { hrmsService } from '@/api/services/hrmsService';
import { employeeService } from '@/api/services/employeeService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
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
  Plus,
  Check,
  Building2,
  Sparkles,
  Search,
  Briefcase,
  ShieldCheck,
  Send,
  Timer,
  ChevronRight,
  Sun,
  Coffee,
} from 'lucide-react';

export default function StaffHRMSPage() {
  const queryClient = useQueryClient();
  const { user, userRole } = useAuth();
  const { t, language } = useLanguage();
  const isGu = language === 'gu';

  // Digital clock state for real-time punch widget
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine active staff ID from authenticated user
  const effectiveUserId = (user as any)?.id || 4;
  const [selectedEmpId, setSelectedEmpId] = useState<number>(effectiveUserId);

  useEffect(() => {
    if ((user as any)?.id) {
      setSelectedEmpId((user as any).id);
    }
  }, [user]);

  // Active HRMS Sub-Tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'holidays' | 'leaves'>('attendance');

  // Punch Attendance Modal State
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchForm, setPunchForm] = useState({
    date: new Date().toISOString().split('T')[0],
    in_time: '09:30 AM',
    out_time: '06:30 PM',
    status: 'PRESENT' as AttendanceStatus,
    notes: 'Office desktop entry',
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

  // Fetch all employees for preview or operator selector
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees(),
  });

  // Active employee record
  const currentEmployee = useMemo(() => {
    return (
      employees.find((e) => e.id === selectedEmpId) || {
        id: selectedEmpId,
        username: (user as any)?.username || 'staff01',
        full_name: (user as any)?.full_name || 'Staff Operator',
        designation: 'Senior Aadhaar & Digital Gujarat Specialist',
        department: 'Citizen Front-Desk Operations',
        shift_timing: '09:30 AM - 06:30 PM',
        email: (user as any)?.email || 'staff@hytech.com',
        mobile_number: '9825123450',
        role: 'STAFF',
      }
    );
  }, [employees, selectedEmpId, user]);

  // Fetch Attendance Log
  const { data: attendanceList = [], isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['employee-attendance', selectedEmpId],
    queryFn: () => hrmsService.getEmployeeAttendance(selectedEmpId),
  });

  // Fetch Leave Balance
  const { data: leaveBalance } = useQuery({
    queryKey: ['employee-leave-balance', selectedEmpId],
    queryFn: () => hrmsService.getEmployeeLeaveBalance(selectedEmpId),
  });

  // Fetch Leave Requests History
  const { data: leaveList = [] } = useQuery({
    queryKey: ['employee-leaves', selectedEmpId],
    queryFn: () => hrmsService.getEmployeeLeaves(selectedEmpId),
  });

  // Fetch Holidays
  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => hrmsService.getHolidays(),
  });

  // Attendance Punch Mutation
  const punchMutation = useMutation({
    mutationFn: () =>
      hrmsService.punchAttendance({
        employee_id: selectedEmpId,
        date: punchForm.date,
        in_time: punchForm.in_time,
        out_time: punchForm.out_time,
        status: punchForm.status,
        notes: punchForm.notes,
      }),
    onSuccess: (res) => {
      toast.success(
        isGu
          ? 'હાજરી સફળતાપૂર્વક નોંધાઈ ગઈ છે!'
          : res.message || 'Attendance logged successfully!'
      );
      queryClient.invalidateQueries({ queryKey: ['employee-attendance', selectedEmpId] });
      setIsPunchModalOpen(false);
    },
    onError: () =>
      toast.error(isGu ? 'હાજરી નોંધવામાં ભૂલ આવી' : 'Failed to log attendance'),
  });

  // Quick 1-Click Today Punch
  const quickPunchToday = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    hrmsService
      .punchAttendance({
        employee_id: selectedEmpId,
        date: now.toISOString().split('T')[0],
        in_time: timeStr,
        status: 'PRESENT',
        notes: 'Quick 1-Click Biometric/Web Punch',
      })
      .then((res) => {
        toast.success(
          isGu
            ? `આજની હાજરી નોંધાઈ ગઈ (${timeStr})!`
            : `Today attendance punched successfully (${timeStr})!`
        );
        queryClient.invalidateQueries({ queryKey: ['employee-attendance', selectedEmpId] });
      })
      .catch(() => {
        toast.error('Failed to record punch');
      });
  };

  // Apply Leave Mutation
  const applyLeaveMutation = useMutation({
    mutationFn: () =>
      hrmsService.applyLeave({
        employee_id: selectedEmpId,
        leave_type: leaveForm.leave_type,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        days_count: Number(leaveForm.days_count),
        reason: leaveForm.reason,
      }),
    onSuccess: (res) => {
      toast.success(
        isGu
          ? 'રજાની અરજી સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!'
          : res.message || 'Leave application submitted for approval!'
      );
      queryClient.invalidateQueries({ queryKey: ['employee-leaves', selectedEmpId] });
      setIsLeaveModalOpen(false);
      setLeaveForm({
        leave_type: 'CASUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        days_count: 1,
        reason: '',
      });
    },
    onError: () =>
      toast.error(isGu ? 'રજા અરજી સબમિટ ન થઈ શકી' : 'Failed to submit leave request'),
  });

  // Compute Metrics
  const metrics = useMemo(() => {
    const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;
    const halfDayCount = attendanceList.filter((a) => a.status === 'HALF_DAY').length;
    const holidayCount = attendanceList.filter((a) => a.status === 'HOLIDAY').length;
    const totalWorkingDays = 26;
    const effectiveDays = presentCount + halfDayCount * 0.5;
    const percentage = ((effectiveDays / totalWorkingDays) * 100).toFixed(1);

    const todayDate = new Date().toISOString().split('T')[0];
    const todayPunch = attendanceList.find((a) => a.date === todayDate);

    const totalLeavesAvailable = leaveBalance
      ? leaveBalance.casual_total -
        leaveBalance.casual_used +
        (leaveBalance.sick_total - leaveBalance.sick_used) +
        (leaveBalance.paid_total - leaveBalance.paid_used)
      : 15;

    return {
      presentCount,
      absentCount,
      halfDayCount,
      holidayCount,
      totalWorkingDays,
      percentage,
      todayPunch,
      totalLeavesAvailable,
    };
  }, [attendanceList, leaveBalance]);

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>STAFF SELF-SERVICE HRMS &bull; હાજરી અને રજાઓ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isGu ? 'મારી હાજરી અને HRMS પોર્ટલ' : 'My Attendance & HRMS Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isGu
                ? 'તમારી દૈનિક હાજરી, હોલિડે કેલેન્ડર અને રજાઓની અરજી (Leave Application) નું સંપૂર્ણ સંચાલન.'
                : 'Track daily biometric attendance, view official holiday calendar, and apply for leaves.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setIsPunchModalOpen(true)}
              leftIcon={<Clock className="w-4 h-4 text-emerald-600" />}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {isGu ? '+ હાજરી પૂરો' : '+ Punch Attendance'}
            </Button>
            <Button
              onClick={() => setIsLeaveModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
            >
              {isGu ? '+ રજાની અરજી કરો (Apply Leave)' : '+ Apply for Leave'}
            </Button>
          </div>
        </div>

        {/* Staff Profile & Live Punch Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Staff Info Card */}
          <Card
            variant="elevated"
            className="lg:col-span-2 p-5 relative overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-500/20 shrink-0">
                  {currentEmployee.full_name ? currentEmployee.full_name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {currentEmployee.full_name}
                    </h2>
                    <Badge variant="success">{isGu ? 'ઓન ડ્યુટી' : 'Active Staff'}</Badge>
                  </div>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-0.5">
                    {currentEmployee.designation || 'Front Desk Operator'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {currentEmployee.department || 'Citizen Service Center'} &bull; શિફ્ટ:{' '}
                    {currentEmployee.shift_timing || '09:30 AM - 06:30 PM'}
                  </p>
                </div>
              </div>

              {/* If admin is testing or multiple staff exist, show profile picker */}
              {employees.length > 1 && (
                <div className="shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    {isGu ? 'કર્મચારી બદલો' : 'Switch Staff'}
                  </span>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isGu ? 'યુઝરનેમ' : 'Username'}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  @{currentEmployee.username}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isGu ? 'મોબાઇલ' : 'Mobile'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentEmployee.mobile_number || '9825123450'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isGu ? 'આજની સ્થિતિ' : "Today's Status"}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {metrics.todayPunch
                    ? isGu
                      ? 'હાજર (Present)'
                      : metrics.todayPunch.status
                    : isGu
                    ? 'હાજર (Auto Punch)'
                    : 'Present'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isGu ? 'પંચ ઇન સમય' : 'Punch-In Time'}
                </span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {metrics.todayPunch?.in_time || '09:25 AM'}
                </span>
              </div>
            </div>
          </Card>

          {/* Real-time Clock & 1-Click Action Box */}
          <Card
            variant="elevated"
            className="p-5 border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-brand-600" />
                  {isGu ? 'લાઈવ ઓફિસ ઘડિયાળ' : 'Live Clock'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active Shift
                </span>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {currentTime || '09:30:00 AM'}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {new Date().toLocaleDateString(isGu ? 'gu-IN' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={quickPunchToday}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>{isGu ? 'આજની હાજરી માર્ક કરો (Quick Punch)' : 'Mark Attendance Today'}</span>
              </button>
            </div>
          </Card>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={isGu ? 'હાજર દિવસો (PRESENT)' : 'PRESENT DAYS'}
            value={`${metrics.presentCount} / ${metrics.totalWorkingDays}`}
            subtitle={isGu ? `${metrics.percentage}% હાજરી દર` : `${metrics.percentage}% monthly rate`}
            icon={CheckCircle2}
            colorScheme="emerald"
            onActionClick={() => setIsPunchModalOpen(true)}
            actionTitle={isGu ? 'હાજરી પૂરો (+)' : 'Punch (+)'}
          />
          <StatCard
            title={isGu ? 'ગેરહાજર (ABSENT)' : 'ABSENT / UNINFORMED'}
            value={`${metrics.absentCount} Days`}
            subtitle={isGu ? 'બિન-અધિકૃત રજાઓ' : 'Unexcused absence'}
            icon={XCircle}
            colorScheme="rose"
          />
          <StatCard
            title={isGu ? 'ઉપલબ્ધ રજાઓ (LEAVES)' : 'LEAVE BALANCE'}
            value={`${metrics.totalLeavesAvailable} Days`}
            subtitle={isGu ? 'CL + SL + PL બાકી' : 'Available balance'}
            icon={Palmtree}
            colorScheme="amber"
            onActionClick={() => setIsLeaveModalOpen(true)}
            actionTitle={isGu ? 'રજા અરજી કરો (+)' : 'Apply Leave (+)'}
          />
          <StatCard
            title={isGu ? 'કુલ હોલિડે (HOLIDAYS)' : 'ANNUAL HOLIDAYS'}
            value={`${holidays.length} Holidays`}
            subtitle={isGu ? 'વાર્ષિક સરકારી રજાઓ' : 'Government holiday list'}
            icon={CalendarDays}
            colorScheme="purple"
            onActionClick={() => setActiveTab('holidays')}
            actionTitle={isGu ? 'હોલિડે જુઓ' : 'View Holidays'}
          />
        </div>

        {/* Sub-Tabs Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === 'attendance'
                ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-brand-500/10 text-brand-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {isGu ? '૧. મારી અટેન્ડન્સ (Attendance)' : '1. Attendance Log'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isGu ? 'દૈનિક પંચ, સમય અને હાજરી લોગ' : 'Daily punches, shift hours & log'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === 'holidays'
                ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'holidays'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-500/10 text-purple-600'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {isGu ? '૨. અટેન્ડન્સ હોલિડે (Holidays)' : '2. Holiday Calendar'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isGu ? 'સરકારી તહેવારો અને રજાઓનું લિસ્ટ' : 'Public holidays & festival list'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              activeTab === 'leaves'
                ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'leaves'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {isGu ? '૩. લિવ એપ્લાય (Apply Leave)' : '3. Apply & Leave Balance'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isGu ? 'રજાની અરજી કરો અને સ્ટેટસ જુઓ' : 'Submit leave request & balances'}
              </div>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ATTENDANCE & BIOMETRIC LOGS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-600" />
                    <span>
                      {isGu
                        ? 'દૈનિક હાજરી અને બાયોમેટ્રિક લોગ (Attendance Register)'
                        : 'Daily Attendance Register & Punches'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isGu
                      ? 'આ મહિનાના તમામ પંચ-ઇન, પંચ-આઉટ અને કાર્ય કલાકોનું વિગતવાર રજિસ્ટર.'
                      : 'Detailed punch-in, punch-out, shift timing and logged work hours.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPunchModalOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    {isGu ? 'મેન્યુઅલ પંચ ઉમેરો' : 'Add Manual Punch'}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{isGu ? 'તારીખ' : 'Date'}</th>
                      <th className="px-4 py-3">{isGu ? 'વાર' : 'Day'}</th>
                      <th className="px-4 py-3">{isGu ? 'પંચ ઇન' : 'In-Time'}</th>
                      <th className="px-4 py-3">{isGu ? 'પંચ આઉટ' : 'Out-Time'}</th>
                      <th className="px-4 py-3">{isGu ? 'કુલ કલાકો' : 'Work Hours'}</th>
                      <th className="px-4 py-3">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                      <th className="px-4 py-3">{isGu ? 'નોંધ' : 'Remarks'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {attendanceList.length > 0 ? (
                      attendanceList.map((rec) => (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
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
                              <Badge variant="success">{isGu ? 'હાજર (Present)' : 'Present'}</Badge>
                            )}
                            {rec.status === 'ABSENT' && (
                              <Badge variant="danger">{isGu ? 'ગેરહાજર (Absent)' : 'Absent'}</Badge>
                            )}
                            {rec.status === 'HALF_DAY' && (
                              <Badge variant="warning">{isGu ? 'અડધો દિવસ (Half Day)' : 'Half Day'}</Badge>
                            )}
                            {rec.status === 'HOLIDAY' && (
                              <Badge variant="info">{isGu ? 'હોલિડે (Holiday)' : 'Holiday'}</Badge>
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
                          {isGu ? 'હાજરી રેકોર્ડ મળ્યો નથી.' : 'No attendance logs found.'}
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
        {/* TAB 2: HOLIDAY CALENDAR                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-600" />
                    <span>
                      {isGu
                        ? 'વાર્ષિક હોલિડે કેલેન્ડર (Annual Holiday Calendar ૨૦૨૬)'
                        : 'Official Public & Festival Holiday Calendar 2026'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isGu
                      ? 'ગુજરાત સરકાર અને સંસ્થા દ્વારા માન્ય જાહેર રજાઓ અને તહેવારોનું લિસ્ટ.'
                      : 'Gazetted public holidays, festivals, and mandatory office closures.'}
                  </p>
                </div>
                <Badge variant="purple">
                  {holidays.length} {isGu ? 'જાહેર રજાઓ' : 'Holidays'}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{isGu ? 'તારીખ (Date)' : 'Date'}</th>
                      <th className="px-4 py-3">{isGu ? 'વાર (Day)' : 'Day'}</th>
                      <th className="px-4 py-3">{isGu ? 'તહેવાર / રજાનું નામ' : 'Holiday / Festival Name'}</th>
                      <th className="px-4 py-3">{isGu ? 'પ્રકાર' : 'Type'}</th>
                      <th className="px-4 py-3">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {holidays.map((h) => {
                      const isPast = new Date(h.date) < new Date();
                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {h.date}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {h.day_name}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {h.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-gujarati">
                              {h.name_gu || h.name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={h.type === 'PUBLIC' ? 'purple' : 'info'}>
                              {h.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {isPast ? (
                              <span className="text-[11px] font-bold text-slate-400">
                                {isGu ? 'પૂર્ણ થઈ' : 'Past'}
                              </span>
                            ) : (
                              <Badge variant="success">
                                {isGu ? 'આગામી રજા' : 'Upcoming'}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LEAVE MANAGEMENT & APPLY LEAVE                                     */}
        {/* ========================================================================= */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            {/* 3 Leave Balances Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Casual Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {isGu ? 'કેઝ્યુઅલ રજા (Casual Leave - CL)' : 'Casual Leave (CL)'}
                  </span>
                  <Badge variant="info">CL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                    {leaveBalance ? leaveBalance.casual_total - leaveBalance.casual_used : 9}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.casual_total || 12} {isGu ? 'દિવસ બાકી' : 'days left'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.casual_total - leaveBalance.casual_used) /
                              leaveBalance.casual_total) *
                            100
                          : 75
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {isGu ? 'વપરાયેલ:' : 'Used:'} {leaveBalance?.casual_used || 3} &bull;{' '}
                  {isGu ? 'કુલ મંજૂર:' : 'Total:'} {leaveBalance?.casual_total || 12}
                </div>
              </div>

              {/* Sick Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {isGu ? 'માંદગી રજા (Sick Leave - SL)' : 'Sick Leave (SL)'}
                  </span>
                  <Badge variant="warning">SL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {leaveBalance ? leaveBalance.sick_total - leaveBalance.sick_used : 6}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.sick_total || 7} {isGu ? 'દિવસ બાકી' : 'days left'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.sick_total - leaveBalance.sick_used) /
                              leaveBalance.sick_total) *
                            100
                          : 85
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {isGu ? 'વપરાયેલ:' : 'Used:'} {leaveBalance?.sick_used || 1} &bull;{' '}
                  {isGu ? 'કુલ મંજૂર:' : 'Total:'} {leaveBalance?.sick_total || 7}
                </div>
              </div>

              {/* Paid Leave */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {isGu ? 'પેઇડ રજા (Paid Leave - PL)' : 'Paid Leave (PL)'}
                  </span>
                  <Badge variant="success">PL</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {leaveBalance ? leaveBalance.paid_total - leaveBalance.paid_used : 4}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {leaveBalance?.paid_total || 5} {isGu ? 'દિવસ બાકી' : 'days left'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${
                        leaveBalance
                          ? ((leaveBalance.paid_total - leaveBalance.paid_used) /
                              leaveBalance.paid_total) *
                            100
                          : 80
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  {isGu ? 'વપરાયેલ:' : 'Used:'} {leaveBalance?.paid_used || 1} &bull;{' '}
                  {isGu ? 'કુલ મંજૂર:' : 'Total:'} {leaveBalance?.paid_total || 5}
                </div>
              </div>
            </div>

            {/* My Applied Leaves Table */}
            <Card variant="elevated" className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-brand-600" />
                    <span>
                      {isGu
                        ? 'મારી રજા અરજીઓ અને હિસ્ટ્રી (Applied Leaves History)'
                        : 'My Leave Applications History'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isGu
                      ? 'તમે સબમિટ કરેલ તમામ રજાઓની મંજૂરી સ્થિતિ અને વિગત.'
                      : 'Review status, approval state, and dates of your applied leaves.'}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsLeaveModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-brand-600 text-white font-bold"
                >
                  {isGu ? '+ નવી રજા અરજી કરો' : '+ Apply for Leave'}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{isGu ? 'રજા પ્રકાર' : 'Type'}</th>
                      <th className="px-4 py-3">{isGu ? 'તારીખ થી - સુધી' : 'From - To'}</th>
                      <th className="px-4 py-3">{isGu ? 'દિવસો' : 'Days'}</th>
                      <th className="px-4 py-3">{isGu ? 'કારણ / વિગત' : 'Reason'}</th>
                      <th className="px-4 py-3">{isGu ? 'અરજી તારીખ' : 'Applied Date'}</th>
                      <th className="px-4 py-3">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {leaveList.length > 0 ? (
                      leaveList.map((leave) => (
                        <tr
                          key={leave.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <Badge
                              variant={
                                leave.leave_type === 'CASUAL'
                                  ? 'info'
                                  : leave.leave_type === 'SICK'
                                  ? 'warning'
                                  : 'purple'
                              }
                            >
                              {leave.leave_type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                            {leave.start_date} {leave.end_date !== leave.start_date && `→ ${leave.end_date}`}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {leave.days_count} {isGu ? 'દિવસ' : 'Days'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {leave.reason}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {leave.applied_at || '2026-09-07'}
                          </td>
                          <td className="px-4 py-3">
                            {leave.status === 'APPROVED' && (
                              <Badge variant="success">{isGu ? 'મંજૂર (Approved)' : 'Approved'}</Badge>
                            )}
                            {leave.status === 'PENDING' && (
                              <Badge variant="warning">{isGu ? 'પેન્ડિંગ (Pending)' : 'Pending'}</Badge>
                            )}
                            {leave.status === 'REJECTED' && (
                              <Badge variant="danger">{isGu ? 'અસ્વીકાર (Rejected)' : 'Rejected'}</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          {isGu
                            ? 'હજુ સુધી કોઈ રજા અરજી કરેલ નથી. નવી અરજી કરવા માટે "+ નવી રજા અરજી કરો" બટન દબાવો.'
                            : 'No leave applications submitted yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modal 1: Apply Leave */}
        <Modal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          title={isGu ? 'રજા માટે અરજી કરો (Apply for Leave)' : 'Apply for Leave'}
          description={
            isGu
              ? 'તમારી રજાનો પ્રકાર, તારીખ અને કારણ દાખલ કરી અરજી સબમિટ કરો.'
              : 'Submit your leave request for managerial approval.'
          }
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyLeaveMutation.mutate();
            }}
            className="space-y-4"
          >
            <Select
              label={isGu ? 'રજાનો પ્રકાર (Leave Type) *' : 'Leave Type *'}
              value={leaveForm.leave_type}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, leave_type: e.target.value as LeaveType })
              }
            >
              <option value="CASUAL">
                {isGu ? 'કેઝ્યુઅલ રજા (Casual Leave - CL)' : 'Casual Leave (CL)'}
              </option>
              <option value="SICK">
                {isGu ? 'માંદગી રજા (Sick Leave - SL)' : 'Sick Leave (SL)'}
              </option>
              <option value="PAID">
                {isGu ? 'પેઇડ રજા (Paid Leave - PL)' : 'Paid Leave (PL)'}
              </option>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isGu ? 'શરૂઆત તારીખ *' : 'Start Date *'}
                type="date"
                required
                value={leaveForm.start_date}
                onChange={(e) => {
                  const s = e.target.value;
                  setLeaveForm({
                    ...leaveForm,
                    start_date: s,
                    end_date: s > leaveForm.end_date ? s : leaveForm.end_date,
                  });
                }}
              />
              <Input
                label={isGu ? 'સમાપ્તિ તારીખ *' : 'End Date *'}
                type="date"
                required
                value={leaveForm.end_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
              />
            </div>

            <Input
              label={isGu ? 'કુલ દિવસો (Days Count) *' : 'Number of Days *'}
              type="number"
              min={1}
              max={30}
              required
              value={leaveForm.days_count}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, days_count: Number(e.target.value) })
              }
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isGu ? 'રજાનું કારણ (Reason) *' : 'Reason for Leave *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  isGu
                    ? 'દા.ત. અંગત સામાજિક પ્રસંગ, તબિયત ખરાબ હોવાથી અથવા ગામડે જવાનું હોવાથી...'
                    : 'e.g. Attending family function, medical reasons...'
                }
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsLeaveModalOpen(false)}
              >
                {isGu ? 'રદ કરો' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={applyLeaveMutation.isPending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isGu ? 'અરજી સબમિટ કરો' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal 2: Punch Attendance */}
        <Modal
          isOpen={isPunchModalOpen}
          onClose={() => setIsPunchModalOpen(false)}
          title={isGu ? 'હાજરી નોંધો (Punch Attendance)' : 'Punch Attendance'}
          description={
            isGu
              ? 'તમારી આજની હાજરી, ઇન-ટાઇમ અને આઉટ-ટાઇમ કન્ફર્મ કરો.'
              : 'Log or update daily biometric and shift attendance.'
          }
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              punchMutation.mutate();
            }}
            className="space-y-4"
          >
            <Input
              label={isGu ? 'તારીખ (Date) *' : 'Date *'}
              type="date"
              required
              value={punchForm.date}
              onChange={(e) => setPunchForm({ ...punchForm, date: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isGu ? 'પંચ ઇન સમય (In-Time)' : 'In-Time'}
                value={punchForm.in_time}
                onChange={(e) => setPunchForm({ ...punchForm, in_time: e.target.value })}
                placeholder="09:30 AM"
              />
              <Input
                label={isGu ? 'પંચ આઉટ સમય (Out-Time)' : 'Out-Time'}
                value={punchForm.out_time}
                onChange={(e) => setPunchForm({ ...punchForm, out_time: e.target.value })}
                placeholder="06:30 PM"
              />
            </div>

            <Select
              label={isGu ? 'હાજરી સ્થિતિ (Status) *' : 'Status *'}
              value={punchForm.status}
              onChange={(e) =>
                setPunchForm({ ...punchForm, status: e.target.value as AttendanceStatus })
              }
            >
              <option value="PRESENT">{isGu ? 'હાજર (Present)' : 'Present'}</option>
              <option value="HALF_DAY">{isGu ? 'અડધો દિવસ (Half Day)' : 'Half Day'}</option>
              <option value="ABSENT">{isGu ? 'ગેરહાજર (Absent)' : 'Absent'}</option>
            </Select>

            <Input
              label={isGu ? 'નોંધ / વિગત (Remarks)' : 'Remarks'}
              value={punchForm.notes}
              onChange={(e) => setPunchForm({ ...punchForm, notes: e.target.value })}
              placeholder="e.g. Office desk entry"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPunchModalOpen(false)}
              >
                {isGu ? 'રદ કરો' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={punchMutation.isPending}
                leftIcon={<Clock className="w-4 h-4" />}
              >
                {isGu ? 'હાજરી સેવ કરો' : 'Save Attendance'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
