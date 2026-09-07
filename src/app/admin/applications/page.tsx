'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  StatCard,
  Badge,
  Button,
  DataTable,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { applicationService } from '@/api/services/applicationService';
import { useLanguage } from '@/context/LanguageContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Application, ApplicationStatus, ServiceCategory } from '@/types';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { ApplicationDetailDrawer } from '@/components/applications/ApplicationDetailDrawer';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Printer,
  Calendar,
  Layers,
  KanbanSquare,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function AdminApplicationsPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // View mode: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Modals state
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<Application | null>(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setIsIntakeModalOpen(true);
      }
    }
  }, []);

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        app.application_no.toLowerCase().includes(q) ||
        app.customer_name?.toLowerCase().includes(q) ||
        app.applicant_name?.toLowerCase().includes(q) ||
        app.customer_family_id?.toLowerCase().includes(q) ||
        app.customer_mobile?.includes(q) ||
        app.applicant_mobile?.includes(q) ||
        app.service_name?.toLowerCase().includes(q) ||
        (app.service_name_gu && app.service_name_gu.includes(q));

      const matchesCat = selectedCategory === 'ALL' || app.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
      const matchesPriority = selectedPriority === 'ALL' || app.priority === selectedPriority;

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });
  }, [applications, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const scrutiny = applications.filter((a) => a.status === 'SCRUTINY' || a.status === 'DOCS_PENDING').length;
    const govtProcessing = applications.filter((a) => a.status === 'GOVERNMENT_PROCESSING').length;
    const completed = applications.filter((a) => a.status === 'COMPLETED' || a.status === 'APPROVED').length;
    const overdue = applications.filter((a) => {
      if (!a.expected_date || a.status === 'COMPLETED') return false;
      return new Date(a.expected_date) < new Date();
    }).length;

    return { total, scrutiny, govtProcessing, completed, overdue };
  }, [applications]);

  // Columns for DataTable
  const columns = [
    {
      key: 'application_no',
      header: 'Application No',
      accessor: (row: Application) => row.application_no,
      cell: (row: Application) => (
        <div className="space-y-0.5">
          <div className="font-mono font-black text-xs text-brand-600 dark:text-brand-400">
            {row.application_no}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {new Date(row.created_at).toLocaleDateString('gu-IN')}
          </div>
        </div>
      ),
    },
    {
      key: 'applicant_name',
      header: 'Citizen / Applicant',
      accessor: (row: Application) => row.applicant_name || row.customer_name,
      cell: (row: Application) => (
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {row.applicant_name || row.customer_name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            {row.customer_family_id} &bull; {row.applicant_mobile || row.customer_mobile}
            {(row.applicant_mobile || row.customer_mobile) && (
              <WhatsAppButton number={(row.applicant_mobile || row.customer_mobile)!} size="xs" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'service_name',
      header: 'Service / Scheme',
      accessor: (row: Application) => row.service_name,
      cell: (row: Application) => (
        <div className="space-y-0.5 max-w-xs">
          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
            {row.service_name}
          </div>
          {row.service_name_gu && (
            <div className="text-[11px] text-brand-600 dark:text-brand-400 truncate">
              {row.service_name_gu}
            </div>
          )}
          {row.sub_service_name && (
            <div className="text-[10px] text-slate-400 truncate">&bull; {row.sub_service_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row: Application) => row.category || 'GOVT_FORMS',
      cell: (row: Application) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.category || 'GOVT_FORMS'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: Application) => row.status,
      cell: (row: Application) => {
        const isOverdue =
          row.expected_date && new Date(row.expected_date) < new Date() && row.status !== 'COMPLETED';

        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                row.status === 'COMPLETED'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : row.status === 'APPROVED'
                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                  : row.status === 'REJECTED'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  : row.status === 'ACTION_REQUIRED'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 animate-pulse'
                  : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{row.status.replace(/_/g, ' ')}</span>
            </span>

            {isOverdue && (
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                Overdue ({row.expected_date})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'total_fee',
      header: 'Fee & Billing',
      accessor: (row: Application) => row.total_fee,
      cell: (row: Application) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
            ₹{row.total_fee.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {row.payment_status} ({row.payment_mode || 'CASH'})
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Application) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedAppForDrawer(row)}
            title="વિગતો જુઓ / View & Inspect Details"
            aria-label="View Application Details"
            className="p-1.5 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedAppForReceipt(row)}
            title="પહોંચ પ્રિન્ટ કરો / Print Official Citizen Receipt"
            aria-label="Print Application Receipt"
            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell allowedRoles={['admin']}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Government Service Center OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('applications_title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t('applications_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setIsIntakeModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            {t('new_application')}
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Applications"
          value={stats.total}
          subtitle="All service records"
          icon={FileText}
          colorScheme="brand"
        />
        <StatCard
          title="Scrutiny / Docs"
          value={stats.scrutiny}
          subtitle="Awaiting documents or review"
          icon={Layers}
          colorScheme="amber"
        />
        <StatCard
          title="Govt Processing"
          value={stats.govtProcessing}
          subtitle="Portal submitted"
          icon={Send}
          colorScheme="sky"
        />
        <StatCard
          title="Completed & Ready"
          value={stats.completed}
          subtitle="Delivered to citizen"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="SLA Overdue"
          value={stats.overdue}
          subtitle="Urgent attention required"
          icon={AlertTriangle}
          colorScheme={stats.overdue > 0 ? 'rose' : 'brand'}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, mobile, app no, service..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Select */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { label: 'બધી સેવાઓ / All Categories (45)', value: 'ALL' },
                { label: 'સરકારી યોજનાઓ & ફોર્મ / Govt Schemes (15)', value: 'GOVT_FORMS' },
                { label: 'કાર્ડ અપડેટ & KYC / Card Updates (7)', value: 'CARD_SERVICES' },
                { label: 'નવા કાર્ડ & પ્રમાણપત્ર / New Cards (6)', value: 'NEW_SERVICES' },
                { label: 'કાનૂની & પ્રિન્ટિંગ / Desk & Print (7)', value: 'OTHER_SERVICES' },
                { label: 'કોમ્પ્યુટર કોર્સ / Computer Courses (6)', value: 'COMPUTER_COURSES' },
                { label: 'ઓનલાઇન & બેંકિંગ / Utility & Bank (4)', value: 'ADDITIONAL_SERVICES' },
              ]}
            />

            {/* Status Select */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { label: 'બધી સ્થિતિ / All Statuses', value: 'ALL' },
                { label: 'સબમિટ થયેલ / Submitted', value: 'SUBMITTED' },
                { label: 'ખૂટતા દસ્તાવેજ / Docs Pending', value: 'DOCS_PENDING' },
                { label: 'દસ્તાવેજ તપાસ / Scrutiny', value: 'SCRUTINY' },
                { label: 'સરકારી પોર્ટલ / Govt Processing', value: 'GOVERNMENT_PROCESSING' },
                { label: 'ધ્યાન જરૂરી / Action Required', value: 'ACTION_REQUIRED' },
                { label: 'મંજૂર થયેલ / Approved', value: 'APPROVED' },
                { label: 'પૂર્ણ થયેલ / Completed', value: 'COMPLETED' },
                { label: 'નામંજૂર / Rejected', value: 'REJECTED' },
              ]}
            />

            {/* Priority Select */}
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={[
                { label: 'તમામ પ્રાથમિકતા / All Priorities', value: 'ALL' },
                { label: 'સામાન્ય / Normal Priority', value: 'NORMAL' },
                { label: 'ઉચ્ચ / High Priority', value: 'HIGH' },
                { label: 'તાત્કાલિક / Urgent Expedited', value: 'URGENT' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Table or Kanban */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredApps}
              isLoading={isLoading}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => setSelectedAppForDrawer(row)}
            />
          </CardContent>
        </Card>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 overflow-x-auto pb-4">
          {[
            { status: 'SUBMITTED', title: '૧. સબમિટ / Submitted', color: 'border-slate-300 dark:border-slate-700' },
            { status: 'SCRUTINY', title: '૨. તપાસ / Scrutiny', color: 'border-amber-400 dark:border-amber-600' },
            { status: 'GOVERNMENT_PROCESSING', title: '૩. પોર્ટલ / Govt Processing', color: 'border-blue-400 dark:border-blue-600' },
            { status: 'ACTION_REQUIRED', title: '૪. ધ્યાન જરૂરી / Action', color: 'border-rose-400 dark:border-rose-600' },
            { status: 'COMPLETED', title: '૫. તૈયાર / Completed', color: 'border-emerald-400 dark:border-emerald-600' },
          ].map((col) => {
            const colApps = filteredApps.filter((a) => {
              if (col.status === 'SCRUTINY') return a.status === 'SCRUTINY' || a.status === 'DOCS_PENDING';
              if (col.status === 'COMPLETED') return a.status === 'COMPLETED' || a.status === 'APPROVED';
              return a.status === col.status;
            });

            return (
              <div
                key={col.status}
                className="bg-slate-100/70 dark:bg-slate-900/70 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[480px]"
              >
                <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.color}`}>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">
                    {col.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppForDrawer(app)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-brand-500/50 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-black text-brand-600 dark:text-brand-400">
                          {app.application_no}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ₹{app.total_fee}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {app.applicant_name || app.customer_name}
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">
                        {app.service_name}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                        <span>{app.customer_family_id}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {app.expected_date ? `SLA: ${app.expected_date.slice(5)}` : '3d'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Universal Service Intake Modal */}
      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={(created) => {
          setSelectedAppForReceipt(created);
        }}
      />

      {/* Application Inspection Drawer */}
      <ApplicationDetailDrawer
        isOpen={!!selectedAppForDrawer}
        onClose={() => setSelectedAppForDrawer(null)}
        application={selectedAppForDrawer}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />
    </AppShell>
  );
}
