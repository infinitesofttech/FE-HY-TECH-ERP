'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  StatCard,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { applicationService } from '@/api/services/applicationService';
import { dashboardService } from '@/api/services/dashboardService';
import { transactionService } from '@/api/services/transactionService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { customerService } from '@/api/services/customerService';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import { ApplicationDetailDrawer } from '@/components/applications/ApplicationDetailDrawer';
import { QuickAddDropdown } from '@/components/common/QuickAddDropdown';
import { useLanguage } from '@/context/LanguageContext';
import { Application, ApplicationStatus, PaymentMode } from '@/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Clock,
  CheckCircle2,
  Receipt,
  Plus,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

const PENDING_STATUSES: ApplicationStatus[] = [
  'PENDING',
  'SUBMITTED',
  'SCRUTINY',
  'DOCS_PENDING',
  'GOVERNMENT_PROCESSING',
  'ACTION_REQUIRED',
  'DOCUMENT_CHECK',
  'READY_TO_SUBMIT',
  'DRAFT',
];

const COMPLETED_STATUSES: ApplicationStatus[] = ['COMPLETED', 'APPROVED'];

export const OfficeDashboardView: React.FC = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Modals state
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<Application | null>(null);

  // Queries
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  const { data: applications = [], isLoading: isAppsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions(),
  });

  const { data: servicesList = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => baseServiceService.getServices(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  // Transaction Modal State & Mutation
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txnCustomerId, setTxnCustomerId] = useState<number>(0);
  const [txnServiceId, setTxnServiceId] = useState<number>(0);
  const [txnSubServiceId, setTxnSubServiceId] = useState<number>(0);
  const [txnBillAmount, setTxnBillAmount] = useState<string>('50');
  const [txnPointsEarned, setTxnPointsEarned] = useState<number>(5);
  const [txnPaymentMode, setTxnPaymentMode] = useState<PaymentMode>('CASH');
  const [txnRemarks, setTxnRemarks] = useState<string>('');

  const currentTxnService = useMemo(() => {
    if (txnServiceId) {
      return servicesList.find((s) => s.id === txnServiceId) || servicesList[0];
    }
    return servicesList[0];
  }, [servicesList, txnServiceId]);

  const currentTxnSubServices = useMemo(() => {
    return currentTxnService?.SubServices || [];
  }, [currentTxnService]);

  const createTxnMutation = useMutation({
    mutationFn: () =>
      transactionService.createTransaction({
        customer: txnCustomerId || (customers[0]?.id ?? 1),
        service: txnServiceId || (servicesList[0]?.id ?? 1),
        sub_service: txnSubServiceId || (currentTxnSubServices[0]?.id ?? 1),
        bill_amount: txnBillAmount,
        points_earned: txnPointsEarned,
        payment_mode: txnPaymentMode,
        staff: 1,
        remarks: txnRemarks,
      }),
    onSuccess: (res) => {
      toast.success(res.message || 'Transaction recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsTransactionModalOpen(false);
      setTxnBillAmount('50');
      setTxnRemarks('');
    },
    onError: () => toast.error('Failed to record transaction'),
  });

  // Calculate summary stats
  const totalAppsCount = applications.length;
  const pendingApps = useMemo(
    () => applications.filter((app) => PENDING_STATUSES.includes(app.status)),
    [applications]
  );
  const completedApps = useMemo(
    () => applications.filter((app) => COMPLETED_STATUSES.includes(app.status)),
    [applications]
  );
  const totalTransactionsCount = transactions.length;
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, txn) => sum + (parseFloat(txn.bill_amount) || 0), 0);
  }, [transactions]);

  // Today's date in YYYY-MM-DD format
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ----------------------------------------------------
  // SECTION 1: TODAY'S APPLICATIONS FILTERS
  // ----------------------------------------------------
  const [todayDateFilter, setTodayDateFilter] = useState<string>(todayStr);
  const [todayStatusFilter, setTodayStatusFilter] = useState<string>('ALL');
  const [todayFamilyFilter, setTodayFamilyFilter] = useState<string>('');

  const filteredTodayApps = useMemo(() => {
    return applications.filter((app) => {
      // Date filter (if set, match application created_at or expected_date)
      if (todayDateFilter) {
        const appDate = app.created_at ? app.created_at.split('T')[0] : '';
        if (appDate !== todayDateFilter) {
          // If no applications exactly on todayDate, check if user specifically filtered
          // or fallback to all if user cleared it
          return false;
        }
      }
      // Status filter
      if (todayStatusFilter !== 'ALL' && app.status !== todayStatusFilter) {
        return false;
      }
      // Family ID / Name search
      if (todayFamilyFilter.trim()) {
        const q = todayFamilyFilter.toLowerCase().trim();
        const matchId = app.customer_family_id?.toLowerCase().includes(q);
        const matchName = app.customer_name?.toLowerCase().includes(q);
        const matchAppNo = app.application_no?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchAppNo) return false;
      }
      return true;
    });
  }, [applications, todayDateFilter, todayStatusFilter, todayFamilyFilter]);

  // If no apps on exact today, show today's applications OR recent applications with quick toggle
  const displayTodayApps = filteredTodayApps.length > 0 ? filteredTodayApps : applications.slice(0, 5);

  // ----------------------------------------------------
  // SECTION 2: PENDING APPLICATIONS FILTERS
  // ----------------------------------------------------
  const [pendingDateFilter, setPendingDateFilter] = useState<string>('');
  const [pendingFamilyFilter, setPendingFamilyFilter] = useState<string>('');
  const [pendingServiceFilter, setPendingServiceFilter] = useState<string>('ALL');

  const filteredPendingApps = useMemo(() => {
    return pendingApps.filter((app) => {
      if (pendingDateFilter) {
        const appDate = app.created_at ? app.created_at.split('T')[0] : '';
        if (appDate !== pendingDateFilter) return false;
      }
      if (pendingFamilyFilter.trim()) {
        const q = pendingFamilyFilter.toLowerCase().trim();
        const matchId = app.customer_family_id?.toLowerCase().includes(q);
        const matchName = app.customer_name?.toLowerCase().includes(q);
        const matchAppNo = app.application_no?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchAppNo) return false;
      }
      if (pendingServiceFilter !== 'ALL') {
        if (String(app.service) !== pendingServiceFilter && app.service_name !== pendingServiceFilter) {
          return false;
        }
      }
      return true;
    });
  }, [pendingApps, pendingDateFilter, pendingFamilyFilter, pendingServiceFilter]);

  // ----------------------------------------------------
  // SECTION 3: COMPLETED APPLICATIONS FILTERS
  // ----------------------------------------------------
  const [completeDateFilter, setCompleteDateFilter] = useState<string>('');
  const [completeFamilyFilter, setCompleteFamilyFilter] = useState<string>('');
  const [completeServiceFilter, setCompleteServiceFilter] = useState<string>('ALL');

  const filteredCompleteApps = useMemo(() => {
    return completedApps.filter((app) => {
      if (completeDateFilter) {
        const appDate = app.updated_at ? app.updated_at.split('T')[0] : app.created_at?.split('T')[0];
        if (appDate !== completeDateFilter) return false;
      }
      if (completeFamilyFilter.trim()) {
        const q = completeFamilyFilter.toLowerCase().trim();
        const matchId = app.customer_family_id?.toLowerCase().includes(q);
        const matchName = app.customer_name?.toLowerCase().includes(q);
        const matchAppNo = app.application_no?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchAppNo) return false;
      }
      if (completeServiceFilter !== 'ALL') {
        if (String(app.service) !== completeServiceFilter && app.service_name !== completeServiceFilter) {
          return false;
        }
      }
      return true;
    });
  }, [completedApps, completeDateFilter, completeFamilyFilter, completeServiceFilter]);

  const getStatusBadgeVariant = (
    status: ApplicationStatus
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gold' => {
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

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Office Front Desk & Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Office Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time service intake, pending workflow scrutiny, and completed applications delivery queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsIntakeModalOpen(true)}
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-5 h-5" />}
              className="shadow-lg shadow-brand-600/30 font-semibold"
            >
              + Add Application
            </Button>
            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['applications'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
              }}
              variant="glass"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 4 SUMMARY CARDS: [ ALL ] [ PENDING ] [ COMPLETED ] [ TRANSACTION ] */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            Overview Summary
          </h2>
          <span className="text-xs text-slate-400 font-medium">Live sync with backend</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. ALL */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-500/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                All
              </span>
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {totalAppsCount}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Total Applications Registered
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIntakeModalOpen(true);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all hover:scale-110 active:scale-95 shrink-0"
                title="Add New Application (+)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* 2. PENDING */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-amber-500/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {pendingApps.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                In Scrutiny / Govt Processing
              </p>
            </div>
          </div>

          {/* 3. COMPLETED */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Completed
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {completedApps.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Delivered &amp; Approved
              </p>
            </div>
          </div>

          {/* 4. TRANSACTION */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-500/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Transaction
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {totalTransactionsCount} Payment Records
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTransactionModalOpen(true);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-110 active:scale-95 shrink-0"
                title="Record New Transaction Entry (+)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TODAY'S APPLICATIONS (WITH FILTERS + ADD BUTTON) */}
      {/* ========================================================================= */}
      <Card variant="elevated" className="overflow-hidden border border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Today&apos;s Applications
                </CardTitle>
                <Badge variant="info">
                  {displayTodayApps.length}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Daily intake registry with instant filter and intake wizard
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsIntakeModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="shadow-md shadow-brand-600/20"
            >
              + Add Application
            </Button>
          </div>
        </CardHeader>

        {/* Section 1 Filters Bar: Date, Status, Family ID */}
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Date Filter
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={todayDateFilter}
                  onChange={(e) => setTodayDateFilter(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {todayDateFilter && (
                  <button
                    onClick={() => setTodayDateFilter('')}
                    title="Clear date (Show all)"
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-1 rounded hover:bg-slate-200/50"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setTodayDateFilter(todayStr)}
                  title="Reset to today"
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Status Filter
              </label>
              <select
                value={todayStatusFilter}
                onChange={(e) => setTodayStatusFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SCRUTINY">Scrutiny</option>
                <option value="GOVERNMENT_PROCESSING">Govt Processing</option>
                <option value="ACTION_REQUIRED">Action Required</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Filter: Family ID / Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Family ID / Citizen
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. HTF-000001 or Name"
                  value={todayFamilyFilter}
                  onChange={(e) => setTodayFamilyFilter(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Quick stats or Reset */}
            <div className="flex items-end justify-start sm:justify-end">
              <Button
                onClick={() => {
                  setTodayDateFilter(todayStr);
                  setTodayStatusFilter('ALL');
                  setTodayFamilyFilter('');
                }}
                variant="ghost"
                size="xs"
                className="text-xs text-slate-500"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Section 1 Applications Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Family ID & Applicant</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {displayTodayApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          No applications matched today&apos;s filter criteria
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click &quot;Reset Filters&quot; or register a new application below.
                        </p>
                        <Button
                          onClick={() => setIsIntakeModalOpen(true)}
                          variant="primary"
                          size="xs"
                          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                          className="mt-3"
                        >
                          + Add Application
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayTodayApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {app.application_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {app.customer_name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {app.customer_family_id}
                          {app.applicant_name && app.applicant_name !== app.customer_name && (
                            <span className="text-slate-400"> &bull; {app.applicant_name}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {app.service_name}
                        </div>
                        {app.sub_service_name && (
                          <div className="text-[11px] text-slate-400">
                            {app.sub_service_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {app.created_at ? app.created_at.split('T')[0] : 'Today'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            app.payment_status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {app.payment_status || 'PAID'} (₹{app.total_fee || 50})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setSelectedAppForDrawer(app)}
                            variant="ghost"
                            size="xs"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                          <Button
                            onClick={() => setSelectedAppForReceipt(app)}
                            variant="outline"
                            size="xs"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                          >
                            Receipt
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 2: PENDING APPLICATIONS (WITH FILTERS + PROCESS ACTION) */}
      {/* ========================================================================= */}
      <Card variant="elevated" className="overflow-hidden border border-amber-200/80 dark:border-amber-900/30">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Pending Applications
                </CardTitle>
                <Badge variant="warning">
                  {filteredPendingApps.length} Pending
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Workload requiring staff scrutiny, documents verification, or government portal submission
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Section 2 Filters Bar: Date, Family ID, Service */}
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Date
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={pendingDateFilter}
                  onChange={(e) => setPendingDateFilter(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pendingDateFilter && (
                  <button
                    onClick={() => setPendingDateFilter('')}
                    title="Clear date"
                    className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter: Family ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Family ID
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Family ID / Name"
                  value={pendingFamilyFilter}
                  onChange={(e) => setPendingFamilyFilter(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Filter: Service */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Service
              </label>
              <select
                value={pendingServiceFilter}
                onChange={(e) => setPendingServiceFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Services</option>
                {servicesList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.ServiceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <div className="flex items-end justify-start sm:justify-end">
              <Button
                onClick={() => {
                  setPendingDateFilter('');
                  setPendingFamilyFilter('');
                  setPendingServiceFilter('ALL');
                }}
                variant="ghost"
                size="xs"
                className="text-xs text-slate-500"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2 Pending Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/30 dark:bg-amber-950/10 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Family ID & Applicant</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPendingApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No pending applications matching these filters!
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        All applications in this queue are clear or handled.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPendingApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {app.application_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {app.customer_name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {app.customer_family_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {app.service_name}
                        </div>
                        {app.sub_service_name && (
                          <div className="text-[11px] text-slate-400">
                            {app.sub_service_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {app.created_at ? app.created_at.split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {app.assigned_staff_name || 'Front Desk Staff'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => setSelectedAppForDrawer(app)}
                          variant="primary"
                          size="xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Process &amp; Scrutiny
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 3: COMPLETE APPLICATIONS (WITH FILTERS + RECEIPT ACTION) */}
      {/* ========================================================================= */}
      <Card variant="elevated" className="overflow-hidden border border-emerald-200/80 dark:border-emerald-900/30">
        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/50 dark:border-emerald-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Complete Applications
                </CardTitle>
                <Badge variant="success">
                  {filteredCompleteApps.length} Completed
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Successfully approved, processed, and ready for citizen certificate delivery
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Section 3 Filters Bar: Date, Family ID, Service */}
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Date
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={completeDateFilter}
                  onChange={(e) => setCompleteDateFilter(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {completeDateFilter && (
                  <button
                    onClick={() => setCompleteDateFilter('')}
                    title="Clear date"
                    className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter: Family ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Family ID
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Family ID / Name"
                  value={completeFamilyFilter}
                  onChange={(e) => setCompleteFamilyFilter(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filter: Service */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Service
              </label>
              <select
                value={completeServiceFilter}
                onChange={(e) => setCompleteServiceFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Services</option>
                {servicesList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.ServiceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <div className="flex items-end justify-start sm:justify-end">
              <Button
                onClick={() => {
                  setCompleteDateFilter('');
                  setCompleteFamilyFilter('');
                  setCompleteServiceFilter('ALL');
                }}
                variant="ghost"
                size="xs"
                className="text-xs text-slate-500"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Section 3 Complete Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/30 dark:bg-emerald-950/10 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Family ID & Applicant</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Govt Application No</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Fee Paid</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCompleteApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No completed applications match the selected criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCompleteApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {app.application_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {app.customer_name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {app.customer_family_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {app.service_name}
                        </div>
                        {app.sub_service_name && (
                          <div className="text-[11px] text-slate-400">
                            {app.sub_service_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {app.government_app_no || 'COMPL-ACK-DIRECT'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success">
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ₹{app.total_fee || 50}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setSelectedAppForDrawer(app)}
                            variant="ghost"
                            size="xs"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>
                          <Button
                            onClick={() => setSelectedAppForReceipt(app)}
                            variant="outline"
                            size="xs"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                          >
                            Receipt
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          setSelectedAppForReceipt(created);
        }}
      />

      {/* Citizen / Family Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />

      {/* Application Detail / Scrutiny Drawer */}
      <ApplicationDetailDrawer
        isOpen={!!selectedAppForDrawer}
        onClose={() => setSelectedAppForDrawer(null)}
        application={selectedAppForDrawer}
      />

      {/* Quick Transaction Entry Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Record New Transaction Entry"
        description="Add a service payment or cash collection entry for a family"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTxnMutation.mutate();
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Family / Customer *
              </label>
              <select
                value={txnCustomerId || (customers[0]?.id ?? '')}
                onChange={(e) => setTxnCustomerId(Number(e.target.value))}
                required
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.family_id} — {c.head_of_family} ({c.mobile_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Service *
              </label>
              <select
                value={txnServiceId || (servicesList[0]?.id ?? '')}
                onChange={(e) => {
                  const sId = Number(e.target.value);
                  setTxnServiceId(sId);
                  const found = servicesList.find((s) => s.id === sId);
                  if (found && found.SubServices?.length) {
                    setTxnSubServiceId(found.SubServices[0].id);
                  }
                }}
                required
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {servicesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ServiceName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Service *
              </label>
              <select
                value={txnSubServiceId || (currentTxnSubServices[0]?.id ?? '')}
                onChange={(e) => setTxnSubServiceId(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {currentTxnSubServices.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.SubServiceName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bill Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={txnBillAmount}
                onChange={(e) => {
                  setTxnBillAmount(e.target.value);
                  setTxnPointsEarned(Math.round((parseFloat(e.target.value) || 0) * 0.1));
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode *
              </label>
              <select
                value={txnPaymentMode}
                onChange={(e) => setTxnPaymentMode(e.target.value as PaymentMode)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="CASH">CASH (રોકડ)</option>
                <option value="ONLINE/UPI">ONLINE / UPI (ઓનલાઇન)</option>
                <option value="CARD">CARD (કાર્ડ)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Service fee, Token #4, Xerox charge"
                value={txnRemarks}
                onChange={(e) => setTxnRemarks(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Summary preview */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Payable Collection:</span>
              <span className="ml-2 font-mono font-black text-sm text-indigo-700 dark:text-indigo-400">
                ₹{txnBillAmount || '0'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400">Loyalty Points:</span>
              <span className="ml-2 font-mono font-bold text-emerald-600">
                +{txnPointsEarned} Pts
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTransactionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createTxnMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              Save Transaction Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
