'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { dashboardService } from '@/api/services/dashboardService';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { applicationService } from '@/api/services/applicationService';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import { useLanguage } from '@/context/LanguageContext';
import { Application } from '@/types';
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  FileCheck2,
  FileText,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  const { data: recentVisits = [] } = useQuery({
    queryKey: ['service-visits'],
    queryFn: () => serviceVisitService.getVisits(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  return (
    <AppShell allowedRoles={['employee']}>
      {/* Staff Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Staff Operator Front Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Front Desk Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Process customer applications, verify digital vault documents, and manage billing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => setIsIntakeModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              + {t('new_application')}
            </Button>
            <Button
              onClick={() => router.push('/staff/applications')}
              variant="glass"
              size="sm"
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              {t('nav_applications')} ({applications.length})
            </Button>
            <Button
              onClick={() => router.push('/staff/customers')}
              variant="glass"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Register Customer
            </Button>
            <Button
              onClick={() => router.push('/staff/visits')}
              variant="glass"
              size="sm"
              leftIcon={<CalendarCheck className="w-4 h-4" />}
            >
              New Service Visit
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {t('kpi_today')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('total_customers')}
            value={dashboard?.today_summary?.total_customers ?? 2}
            subtitle="Registered families"
            icon={Users}
            colorScheme="brand"
            onClick={() => router.push('/staff/customers')}
          />
          <StatCard
            title={t('total_visits')}
            value={dashboard?.today_summary?.total_service_entries ?? 3}
            subtitle="Visits recorded"
            icon={CalendarCheck}
            colorScheme="emerald"
            onClick={() => router.push('/staff/visits')}
          />
          <StatCard
            title={t('open_pending')}
            value={dashboard?.today_summary?.open_pending_work ?? 3}
            subtitle="In progress"
            icon={Clock}
            colorScheme="amber"
            onClick={() => router.push('/staff/pending-work')}
          />
          <StatCard
            title={t('ready_delivery')}
            value={dashboard?.today_summary?.ready_for_delivery ?? 0}
            subtitle="Documents ready"
            icon={CheckCircle}
            colorScheme="sky"
            onClick={() => router.push('/staff/reminders')}
          />
        </div>
      </div>

      {/* Recent Visits Queue */}
      <Card variant="elevated">
        <CardHeader>
          <div>
            <CardTitle>Today&apos;s Service Visits</CardTitle>
            <CardDescription>Active verification queues</CardDescription>
          </div>

          <Button
            onClick={() => router.push('/staff/visits')}
            variant="ghost"
            size="xs"
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            All Visits
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Visit No</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Checklist Status</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentVisits.slice(0, 4).map((v) => (
                  <tr
                    key={v.visit_no}
                    onClick={() => router.push('/staff/visits')}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {v.visit_no}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {v.customer_name}
                    </td>
                    <td className="py-3.5 px-3">
                      {v.service_name} &bull; <span className="text-slate-400">{v.sub_service_name}</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold">
                      {v.available_documents || 1}/{v.total_documents || 2} Docs
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={v.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      {v.visit_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Universal Service Intake Wizard Modal */}
      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={(created) => {
          setSelectedAppForReceipt(created);
        }}
      />

      {/* Citizen Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />
    </AppShell>
  );
}
