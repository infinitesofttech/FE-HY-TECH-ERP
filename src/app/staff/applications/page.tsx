'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  StatCard,
  Button,
  DataTable,
  Input,
  Select,
  Card,
  CardContent,
} from '@/components/ui';
import { applicationService } from '@/api/services/applicationService';
import { useLanguage } from '@/context/LanguageContext';
import { Application } from '@/types';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { ApplicationDetailDrawer } from '@/components/applications/ApplicationDetailDrawer';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function StaffApplicationsPage() {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<Application | null>(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

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
        app.service_name?.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || app.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [applications, searchQuery, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const total = applications.length;
    const scrutiny = applications.filter((a) => a.status === 'SCRUTINY' || a.status === 'DOCS_PENDING').length;
    const govtProcessing = applications.filter((a) => a.status === 'GOVERNMENT_PROCESSING').length;
    const completed = applications.filter((a) => a.status === 'COMPLETED' || a.status === 'APPROVED').length;

    return { total, scrutiny, govtProcessing, completed };
  }, [applications]);

  const columns = [
    {
      key: 'application_no',
      header: 'App No & Date',
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
          <div className="text-[11px] text-slate-500 font-mono">
            {row.customer_family_id} &bull; {row.applicant_mobile || row.customer_mobile}
          </div>
        </div>
      ),
    },
    {
      key: 'service_name',
      header: 'Service Description',
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
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row: Application) => row.status,
      cell: (row: Application) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'COMPLETED'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : row.status === 'APPROVED'
              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
              : row.status === 'REJECTED'
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{row.status.replace(/_/g, ' ')}</span>
        </span>
      ),
    },
    {
      key: 'total_fee',
      header: 'Fee Collected',
      accessor: (row: Application) => row.total_fee,
      cell: (row: Application) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
            ₹{row.total_fee.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {row.payment_status}
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
    <AppShell allowedRoles={['employee', 'admin']}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Operator Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('applications_title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Register citizen requests, verify digital vault documents, and update status.
          </p>
        </div>

        <Button
          onClick={() => setIsIntakeModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          size="md"
        >
          {t('new_application')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Desk Applications"
          value={stats.total}
          subtitle="Processed at center"
          icon={FileText}
          colorScheme="brand"
        />
        <StatCard
          title="Scrutiny / Pending"
          value={stats.scrutiny}
          subtitle="In document verification"
          icon={Layers}
          colorScheme="amber"
        />
        <StatCard
          title="Portal Submissions"
          value={stats.govtProcessing}
          subtitle="In department queue"
          icon={Send}
          colorScheme="sky"
        />
        <StatCard
          title="Completed & Ready"
          value={stats.completed}
          subtitle="Ready for pickup"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, mobile, app no..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

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
              ]}
            />
          </div>
        </CardContent>
      </Card>

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

      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={(created) => setSelectedAppForReceipt(created)}
      />

      <ApplicationDetailDrawer
        isOpen={!!selectedAppForDrawer}
        onClose={() => setSelectedAppForDrawer(null)}
        application={selectedAppForDrawer}
      />

      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />
    </AppShell>
  );
}
