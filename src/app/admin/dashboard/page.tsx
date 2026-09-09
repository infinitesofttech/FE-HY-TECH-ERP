'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { dashboardService } from '@/api/services/dashboardService';
import { applicationService } from '@/api/services/applicationService';
import { hrmsService } from '@/api/services/hrmsService';
import { employeeService } from '@/api/services/employeeService';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { useLanguage } from '@/context/LanguageContext';
import { formatEmpName } from '@/i18n';
import { toast } from 'sonner';
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  IndianRupee,
  Coins,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  FileCheck2,
  FileText,
  ChevronRight,
  KanbanSquare,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#059669', '#10b981', '#0d9488', '#f59e0b', '#0284c7', '#8b5cf6'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'danger';
      case 'GOVERNMENT_PROCESSING':
      case 'SCRUTINY':
        return 'info';
      case 'ACTION_REQUIRED':
      case 'DOCS_PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  const queryClient = useQueryClient();

  const { data: rawApps = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });
  const applications = Array.isArray(rawApps) ? rawApps : ((rawApps as any)?.results || []);

  const { data: rawLeaves = [], refetch: refetchLeaves } = useQuery({
    queryKey: ['admin-leaves'],
    queryFn: () => hrmsService.getAllLeaves(),
  });
  const leaves = Array.isArray(rawLeaves) ? rawLeaves : ((rawLeaves as any)?.results || []);

  const { data: rawEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees(),
  });
  const employees = Array.isArray(rawEmployees) ? rawEmployees : ((rawEmployees as any)?.results || []);

  const leaveMutation = useMutation({
    mutationFn: ({ leaveId, status }: { leaveId: number; status: 'APPROVED' | 'REJECTED' }) =>
      hrmsService.updateLeaveStatus(leaveId, status),
    onSuccess: (res, vars) => {
      refetchLeaves();
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      toast.success(
        language === 'gu'
          ? `રજા ${vars.status === 'APPROVED' ? 'મંજૂર' : 'નામંજૂર'} કરવામાં આવી!`
          : `Leave ${vars.status === 'APPROVED' ? 'Approved' : 'Rejected'} successfully!`
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Action failed');
    },
  });

  const pendingLeaves = React.useMemo(() => {
    return Array.isArray(leaves) ? leaves.filter((l) => l.status === 'PENDING') : [];
  }, [leaves]);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  const chartData = React.useMemo(() => {
    if (timeframe === 'weekly') {
      const daysGu = ['સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ', 'રવિ'];
      const daysHi = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];
      const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const labels = language === 'gu' ? daysGu : language === 'hi' ? daysHi : daysEn;
      const values = [450, 780, 920, 650, 1150, 1400, 850];

      return labels.map((label, idx) => ({
        label,
        revenue: values[idx],
      }));
    }

    if (timeframe === 'monthly') {
      const monthsGu = ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઓક્ટો', 'નવે', 'ડિસે'];
      const monthsHi = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितं', 'अक्टू', 'नव', 'दिस'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const labels = language === 'gu' ? monthsGu : language === 'hi' ? monthsHi : monthsEn;
      const values = [14200, 16800, 19500, 22400, 21100, 25600, 28900, 31400, 34200, 38500, 42100, 45600];

      return labels.map((label, idx) => ({
        label,
        revenue: values[idx],
      }));
    }

    // Yearly
    const years = ['2022', '2023', '2024', '2025', '2026'];
    const values = [125000, 184000, 248000, 315000, 392000];
    return years.map((label, idx) => ({
      label,
      revenue: values[idx],
    }));
  }, [timeframe, language]);

  const totalPeriodRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  const categoryData = Array.isArray(dashboard?.category_distribution) ? dashboard.category_distribution : [
    { name: 'Aadhaar Card', count: 42, percentage: 38 },
    { name: 'Ayushman Card', count: 28, percentage: 25 },
    { name: 'Election Card', count: 18, percentage: 16 },
    { name: 'PAN Card', count: 14, percentage: 13 },
    { name: 'Ration Card', count: 9, percentage: 8 },
  ];

  return (
    <AppShell allowedRoles={['admin']}>
      {/* Financial & Revenue KPI Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {t('dashboard_page.financial_vault')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('today_revenue')}
            value={`₹${dashboard?.financial_kpi?.today_revenue ?? '0.00'}`}
            subtitle={t('dashboard_page.collected_today')}
            icon={IndianRupee}
            colorScheme="emerald"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('month_revenue')}
            value={`₹${dashboard?.financial_kpi?.month_revenue ?? '4,850.00'}`}
            subtitle={t('dashboard_page.mtd_revenue')}
            trend={{ value: '+22.4% MoM', isPositive: true }}
            icon={TrendingUp}
            colorScheme="brand"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('all_time_billed')}
            value={`₹${dashboard?.financial_kpi?.total_revenue ?? '18,400.00'}`}
            subtitle={t('dashboard_page.all_time_gross')}
            icon={Receipt}
            colorScheme="purple"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('points_issued')}
            value={`${dashboard?.financial_kpi?.total_points_issued ?? 120} Pts`}
            subtitle={t('dashboard_page.circulating_credits')}
            icon={Coins}
            colorScheme="amber"
            onClick={() => router.push('/admin/transactions')}
          />
        </div>
      </div>

      {/* 4. Luxury Recharts Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Growth Bar Chart */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <CardTitle>{t('dashboard_page.revenue_chart_title')}</CardTitle>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                  ₹{totalPeriodRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <CardDescription>
                {timeframe === 'weekly'
                  ? t('dashboard_page.weekly_sub')
                  : timeframe === 'monthly'
                  ? t('dashboard_page.monthly_sub')
                  : t('dashboard_page.yearly_sub')}
              </CardDescription>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-inner flex-shrink-0">
              <button
                type="button"
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === 'weekly'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('dashboard_page.weekly_data')}
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === 'monthly'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('dashboard_page.monthly_data')}
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('yearly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === 'yearly'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('dashboard_page.yearly_data')}
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(val) =>
                      val >= 100000
                        ? `₹${(val / 100000).toFixed(1)}L`
                        : val >= 1000
                        ? `₹${(val / 1000).toFixed(0)}k`
                        : `₹${val}`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, t('dashboard_page.invoiced')]}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Service Category Distribution Donut */}
        <Card variant="elevated" className="flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>{t('dashboard_page.service_share_title')}</CardTitle>
              <CardDescription>{t('dashboard_page.service_share_sub')}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
                <span className="text-[10px] font-bold uppercase text-slate-400">{t('dashboard_page.total_share')}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryData.slice(0, 4).map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    ></span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Live Operations Center: Recent Visits Desk & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Applications Desk */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>{t('dashboard_page.live_applications_title')}</CardTitle>
                <CardDescription>{t('dashboard_page.live_applications_sub')}</CardDescription>
              </div>
            </div>

            <Button
              onClick={() => router.push('/admin/applications')}
              variant="ghost"
              size="xs"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              {t('dashboard_page.manage_all_applications')}
            </Button>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">{t('office.application_id')}</th>
                    <th className="py-3 px-3">{t('dashboard_page.citizen_family')}</th>
                    <th className="py-3 px-3">{t('office.service')}</th>
                    <th className="py-3 px-3">{t('office.status')}</th>
                    <th className="py-3 px-3">{t('office.payment')}</th>
                    <th className="py-3 px-3 text-right">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {language === 'gu' ? 'હાલમાં કોઈ અરજીઓ નથી' : 'No applications registered yet'}
                      </td>
                    </tr>
                  ) : (
                    applications.slice(0, 5).map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => router.push('/admin/applications')}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {app.application_no}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {app.customer_name}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {app.customer_family_id}
                            {app.applicant_name && app.applicant_name !== app.customer_name && (
                              <span> &bull; {app.applicant_name}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {language === 'gu' && app.service_name_gu ? app.service_name_gu : app.service_name}
                          </span>
                          {app.sub_service_name && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {app.sub_service_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant={getStatusBadgeVariant(app.status)}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              app.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {app.payment_status === 'PAID'
                              ? (language === 'gu' ? 'ચૂકવેલ' : 'PAID')
                              : (language === 'gu' ? 'બાકી' : 'PENDING')} (₹{app.total_fee || 50})
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                          {app.created_at ? app.created_at.split('T')[0] : (language === 'gu' ? 'આજે' : 'Today')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Employee Leave Approval */}
        <Card variant="elevated" className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  {t('dashboard_page.leave_approval_title')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard_page.leave_approval_sub')}
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={() => router.push('/admin/employees')}
              variant="ghost"
              size="xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              HRMS
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 flex-1">
            {pendingLeaves.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('dashboard_page.no_pending_leaves')}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'gu' ? 'કોઈ નવી અરજી બાકી નથી' : 'Zero approval backlog'}
                </span>
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map((leave) => {
                const emp = employees.find((e) => e.id === leave.employee_id);
                const empDisplayName = formatEmpName(emp?.full_name || `Employee #${leave.employee_id}`, language);

                return (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-500/15 text-brand-600 font-black text-[10px] flex items-center justify-center">
                          {empDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {empDisplayName}
                        </span>
                      </div>
                      <Badge variant="warning">
                        {leave.leave_type === 'CASUAL'
                          ? (language === 'gu' ? 'કેઝ્યુઅલ' : 'CASUAL')
                          : leave.leave_type === 'SICK'
                          ? (language === 'gu' ? 'માંદગી' : 'SICK')
                          : (language === 'gu' ? 'હક્ક રજા' : 'PAID')}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 italic">
                      &ldquo;{leave.reason}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {leave.start_date} ({leave.days_count} {language === 'gu' ? 'દિવસ' : 'd'})
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => leaveMutation.mutate({ leaveId: leave.id, status: 'REJECTED' })}
                          disabled={leaveMutation.isPending}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-all cursor-pointer"
                        >
                          {t('dashboard_page.reject')}
                        </button>
                        <button
                          type="button"
                          onClick={() => leaveMutation.mutate({ leaveId: leave.id, status: 'APPROVED' })}
                          disabled={leaveMutation.isPending}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
                        >
                          {t('dashboard_page.approve')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={() => router.push('/admin/applications')}
      />
    </AppShell>
  );
}
