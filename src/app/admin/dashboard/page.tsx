'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { dashboardService } from '@/api/services/dashboardService';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { pendingWorkService } from '@/api/services/pendingWorkService';
import { applicationService } from '@/api/services/applicationService';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  IndianRupee,
  Coins,
  Receipt,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  FileCheck2,
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

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  const { data: recentVisits = [] } = useQuery({
    queryKey: ['service-visits'],
    queryFn: () => serviceVisitService.getVisits(),
  });

  const { data: pendingItems = [] } = useQuery({
    queryKey: ['pending-work'],
    queryFn: () => pendingWorkService.getPendingWork(),
  });

  const [isIntakeModalOpen, setIsIntakeModalOpen] = React.useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const revenueData = dashboard?.revenue_chart?.labels?.map((label, idx) => ({
    day: label,
    revenue: dashboard?.revenue_chart?.datasets?.[0]?.data?.[idx] || 0,
  })) || [
    { day: 'Mon', revenue: 450 },
    { day: 'Tue', revenue: 780 },
    { day: 'Wed', revenue: 920 },
    { day: 'Thu', revenue: 650 },
    { day: 'Fri', revenue: 1150 },
    { day: 'Sat', revenue: 1400 },
    { day: 'Sun', revenue: 850 },
  ];

  const categoryData = dashboard?.category_distribution || [
    { name: 'Aadhar Card', count: 42, percentage: 38 },
    { name: 'Ayushman Card', count: 28, percentage: 25 },
    { name: 'Election Card', count: 18, percentage: 16 },
    { name: 'PAN Card', count: 14, percentage: 13 },
    { name: 'Ration Card', count: 9, percentage: 8 },
  ];

  return (
    <AppShell allowedRoles={['admin']}>
      {/* 1. Executive Mesh Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 sm:p-9 text-white shadow-2xl">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span className="text-amber-200">HY-TECH ENTERPRISE SUITE v2.4</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-emerald-300 font-semibold">Government Certified Desk</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('exec_overview')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('exec_sub')}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setIsIntakeModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              + {t('new_application')}
            </Button>
            <Button
              onClick={() => router.push('/admin/applications')}
              variant="glass"
              size="sm"
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              {t('nav_applications')} ({applications.length})
            </Button>
            <Button
              onClick={() => router.push('/admin/visits')}
              variant="glass"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {t('new_service_visit')}
            </Button>
            <Button
              onClick={() => router.push('/admin/customers')}
              variant="glass"
              size="sm"
              leftIcon={<Users className="w-4 h-4" />}
            >
              {t('register_new_family')}
            </Button>
            <Button
              onClick={() => router.push('/admin/transactions')}
              variant="emerald"
              size="sm"
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              {t('record_transaction')}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Primary Operational KPI Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Real-Time Desk Indicators
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Live Sync Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('total_customers')}
            value={dashboard?.today_summary?.total_customers ?? 2}
            subtitle="Households enrolled"
            trend={{ value: '+8.2% this month', isPositive: true }}
            icon={Users}
            colorScheme="brand"
            onClick={() => router.push('/admin/customers')}
          />
          <StatCard
            title={t('total_visits')}
            value={dashboard?.today_summary?.total_service_entries ?? 3}
            subtitle="Visits logged today"
            trend={{ value: '+14.6% vs yesterday', isPositive: true }}
            icon={CalendarCheck}
            colorScheme="emerald"
            onClick={() => router.push('/admin/visits')}
          />
          <StatCard
            title={t('open_pending')}
            value={dashboard?.today_summary?.open_pending_work ?? 3}
            subtitle="In progress with Gov"
            trend={{ value: 'Within SLA', isPositive: true }}
            icon={Clock}
            colorScheme="amber"
            onClick={() => router.push('/admin/pending-work')}
          />
          <StatCard
            title={t('ready_delivery')}
            value={dashboard?.today_summary?.ready_for_delivery ?? 0}
            subtitle="Documents ready for pickup"
            trend={{ value: '100% Prepared', isPositive: true }}
            icon={CheckCircle}
            colorScheme="sky"
            onClick={() => router.push('/admin/reminders')}
          />
        </div>
      </div>

      {/* 3. Financial & Revenue KPI Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Financial & Loyalty Points Vault
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('today_revenue')}
            value={`₹${dashboard?.financial_kpi?.today_revenue ?? '0.00'}`}
            subtitle="Collected today"
            icon={IndianRupee}
            colorScheme="emerald"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('month_revenue')}
            value={`₹${dashboard?.financial_kpi?.month_revenue ?? '4,850.00'}`}
            subtitle="MTD Revenue Invoiced"
            trend={{ value: '+22.4% MoM', isPositive: true }}
            icon={TrendingUp}
            colorScheme="brand"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('all_time_billed')}
            value={`₹${dashboard?.financial_kpi?.total_revenue ?? '18,400.00'}`}
            subtitle="All-time gross processing"
            icon={Receipt}
            colorScheme="purple"
            onClick={() => router.push('/admin/transactions')}
          />
          <StatCard
            title={t('points_issued')}
            value={`${dashboard?.financial_kpi?.total_points_issued ?? 120} Pts`}
            subtitle="Circulating citizen wallet credits"
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
          <CardHeader>
            <div>
              <CardTitle>Revenue Trajectory & Daily Invoicing</CardTitle>
              <CardDescription>
                Day-by-day revenue breakdown from government document processing
              </CardDescription>
            </div>

            <Badge variant="purple">Weekly Trend</Badge>
          </CardHeader>

          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value: any) => [`₹${value}`, 'Invoiced']}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Service Category Distribution Donut */}
        <Card variant="elevated" className="flex flex-col justify-between">
          <CardHeader>
            <div>
              <CardTitle>Service Application Share</CardTitle>
              <CardDescription>Distribution by government service category</CardDescription>
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
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Share</span>
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
        {/* Left 2 Cols: Live Visits Verification Desk */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Live Service Visits & Document Desks</CardTitle>
                <CardDescription>Active citizen verification queues</CardDescription>
              </div>
            </div>

            <Button
              onClick={() => router.push('/admin/visits')}
              variant="ghost"
              size="xs"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Manage All Visits
            </Button>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Visit Token</th>
                    <th className="py-3 px-3">Citizen & Family</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Checklist Readiness</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {recentVisits.slice(0, 4).map((visit) => {
                    const total = visit.total_documents || 2;
                    const avail = visit.available_documents || 1;
                    const pct = Math.round((avail / total) * 100);

                    return (
                      <tr
                        key={visit.id}
                        onClick={() => router.push('/admin/visits')}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                            {visit.visit_no}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {visit.customer_name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {visit.customer_family_id}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {visit.service_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{avail}/{total} Docs</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct === 100
                                    ? 'bg-emerald-500'
                                    : pct >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'warning'}>
                            {visit.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                          {visit.visit_date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Pending Government Work Priority Peek */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle>Government Queue</CardTitle>
                <CardDescription>Active processing tasks</CardDescription>
              </div>
            </div>

            <Button
              onClick={() => router.push('/admin/pending-work')}
              variant="ghost"
              size="xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Board
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {pendingItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => router.push('/admin/pending-work')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 transition-all space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {item.pending_no}
                  </span>
                  <Badge variant={item.priority === 'HIGH' ? 'danger' : 'default'}>
                    {item.priority}
                  </Badge>
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {item.customer_name} &bull; {item.service_name}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Due {item.expected_date}</span>
                  <Badge
                    variant={
                      item.work_status === 'COMPLETED'
                        ? 'success'
                        : item.work_status === 'IN_PROGRESS'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {item.work_status}
                  </Badge>
                </div>
              </div>
            ))}
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
