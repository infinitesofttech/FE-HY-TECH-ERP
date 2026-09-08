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
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Wallet,
  Banknote,
  Smartphone,
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
  const isGu = language === 'gu';
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

  // ----------------------------------------------------
  // TRANSACTION MODAL: MULTI-SERVICE & SPLIT/PARTIAL PAYMENT & CUSTOMER LEDGER
  // ----------------------------------------------------
  interface TxnServiceItem {
    id: string;
    serviceId: number;
    subServiceId: number;
    amount: string;
  }

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txnCustomerId, setTxnCustomerId] = useState<number>(0);
  const [txnItems, setTxnItems] = useState<TxnServiceItem[]>([
    {
      id: 'txn-item-1',
      serviceId: 3,
      subServiceId: 3,
      amount: '50',
    },
  ]);
  const [txnPaidAmount, setTxnPaidAmount] = useState<string>('50');
  const [isManualPaid, setIsManualPaid] = useState<boolean>(false);
  const [includePreviousDue, setIncludePreviousDue] = useState<boolean>(false);
  const [showPastHistory, setShowPastHistory] = useState<boolean>(false);
  const [txnPaymentMode, setTxnPaymentMode] = useState<PaymentMode>('ONLINE/UPI');
  const [txnRemarks, setTxnRemarks] = useState<string>('');

  // Selected customer (fallback to HTF-000003 or first)
  const effectiveCustomerId = txnCustomerId || (customers[0]?.id ?? 4);
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === effectiveCustomerId) || customers[0];
  }, [customers, effectiveCustomerId]);

  // Customer past transactions & ledger
  const pastCustomerTxns = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(
      (t) => t.customer === selectedCustomer.id || t.family_id === selectedCustomer.family_id
    );
  }, [transactions, selectedCustomer]);

  const pastLedgerStats = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let due = 0;
    pastCustomerTxns.forEach((t) => {
      const b = parseFloat(t.bill_amount) || 0;
      const p = t.paid_amount !== undefined ? parseFloat(t.paid_amount) || 0 : b;
      const d = t.due_amount !== undefined ? parseFloat(t.due_amount) || 0 : 0;
      billed += b;
      paid += p;
      due += d;
    });
    return {
      totalBilled: billed,
      totalPaid: paid,
      totalDue: due,
      hasDue: due > 0,
      lastTxn: pastCustomerTxns[0] || null,
    };
  }, [pastCustomerTxns]);

  // Total services bill from all items
  const totalServicesBill = useMemo(() => {
    return txnItems.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
  }, [txnItems]);

  // Net total bill (including previous due if selected)
  const effectiveTotalBill = useMemo(() => {
    return totalServicesBill + (includePreviousDue && pastLedgerStats.hasDue ? pastLedgerStats.totalDue : 0);
  }, [totalServicesBill, includePreviousDue, pastLedgerStats]);

  // Auto-sync paid amount when bill changes unless user manually edited it
  React.useEffect(() => {
    if (!isManualPaid) {
      setTxnPaidAmount(effectiveTotalBill.toString());
    }
  }, [effectiveTotalBill, isManualPaid]);

  const currentPaid = parseFloat(txnPaidAmount) || 0;
  const currentDue = Math.max(0, effectiveTotalBill - currentPaid);
  const currentPaymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' =
    currentDue === 0 ? 'PAID' : currentPaid === 0 ? 'PENDING' : 'PARTIAL';

  const handleAddServiceItem = () => {
    const firstService = servicesList[0] || { id: 3, SubServices: [{ id: 3 }] };
    const firstSub = firstService?.SubServices?.[0] || { id: 3 };
    setTxnItems((prev) => [
      ...prev,
      {
        id: `txn-item-${Date.now()}-${Math.random()}`,
        serviceId: firstService.id,
        subServiceId: firstSub.id,
        amount: '50',
      },
    ]);
  };

  const handleRemoveServiceItem = (id: string) => {
    if (txnItems.length <= 1) return;
    setTxnItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateServiceItem = (
    id: string,
    field: 'serviceId' | 'subServiceId' | 'amount',
    val: string | number
  ) => {
    setTxnItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (field === 'serviceId') {
          const sId = Number(val);
          const found = servicesList.find((s) => s.id === sId);
          const newSubId = found?.SubServices?.[0]?.id || sId;
          return { ...it, serviceId: sId, subServiceId: newSubId };
        }
        if (field === 'subServiceId') {
          return { ...it, subServiceId: Number(val) };
        }
        if (field === 'amount') {
          return { ...it, amount: String(val) };
        }
        return it;
      })
    );
  };

  const createTxnMutation = useMutation({
    mutationFn: () => {
      const itemsPayload = txnItems.map((it) => {
        const s = servicesList.find((x) => x.id === it.serviceId);
        const sub = s?.SubServices?.find((y) => y.id === it.subServiceId);
        return {
          service_id: it.serviceId,
          service_name: s?.ServiceName || 'Service',
          sub_service_id: it.subServiceId,
          sub_service_name: sub?.SubServiceName || 'General',
          amount: parseFloat(it.amount) || 0,
        };
      });

      return transactionService.createTransaction({
        customer: effectiveCustomerId,
        service: txnItems[0]?.serviceId || 3,
        sub_service: txnItems[0]?.subServiceId || 3,
        bill_amount: effectiveTotalBill.toFixed(2),
        paid_amount: currentPaid.toFixed(2),
        due_amount: currentDue.toFixed(2),
        payment_status: currentPaymentStatus,
        items: itemsPayload,
        previous_due_cleared: includePreviousDue ? pastLedgerStats.totalDue.toFixed(2) : undefined,
        points_earned: Math.round(currentPaid * 0.1),
        payment_mode: txnPaymentMode,
        staff: 1,
        remarks:
          txnRemarks ||
          (currentDue > 0
            ? `Partial payment: ₹${currentPaid.toFixed(2)} received, ₹${currentDue.toFixed(2)} pending due`
            : 'Full payment received'),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Transaction recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsTransactionModalOpen(false);
      setTxnRemarks('');
      setIsManualPaid(false);
      setIncludePreviousDue(false);
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
              <span>{t('office.front_desk')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('office.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('office.subtitle')}
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
              {t('office.add_application')}
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
              {t('office.refresh')}
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 4 SUMMARY CARDS: [ ALL ] [ PENDING ] [ COMPLETED ] [ TRANSACTION ] */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            {t('office.overview_summary')}
          </h2>
          <span className="text-xs text-slate-400 font-medium">{t('office.live_sync')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. ALL */}
          <div
            onClick={() => {
              const el = document.getElementById('todays-apps-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-card-elevated hover:shadow-card-hover hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 opacity-90 group-hover:opacity-100 transition-opacity" />
            
            {/* Ambient hover glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t('office.all')}
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 shadow-xs group-hover:scale-110 transition-transform duration-300">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {totalAppsCount}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t('office.total_apps_registered')}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIntakeModalOpen(true);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-110 active:scale-95 shrink-0"
                title={t('office.add_application')}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* 2. PENDING */}
          <div
            onClick={() => {
              const el = document.getElementById('pending-apps-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-card-elevated hover:shadow-[0_18px_36px_-6px_rgba(245,158,11,0.22),0_8px_16px_-3px_rgba(15,23,42,0.06),0_0_0_1px_rgba(245,158,11,0.35)] hover:border-amber-500/60 dark:hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 opacity-90 group-hover:opacity-100 transition-opacity" />
            
            {/* Ambient hover glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('office.pending')}
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <div className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {pendingApps.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {t('office.in_scrutiny')}
              </p>
            </div>
          </div>

          {/* 3. COMPLETED */}
          <div
            onClick={() => {
              const el = document.getElementById('completed-apps-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-card-elevated hover:shadow-[0_18px_36px_-6px_rgba(16,185,129,0.22),0_8px_16px_-3px_rgba(15,23,42,0.06),0_0_0_1px_rgba(16,185,129,0.35)] hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity" />
            
            {/* Ambient hover glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t('office.completed')}
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 shadow-xs group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4">
              <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {completedApps.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {t('office.delivered_approved')}
              </p>
            </div>
          </div>

          {/* 4. TRANSACTION */}
          <div
            onClick={() => setIsTransactionModalOpen(true)}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-card-elevated hover:shadow-[0_18px_36px_-6px_rgba(99,102,241,0.22),0_8px_16px_-3px_rgba(15,23,42,0.06),0_0_0_1px_rgba(99,102,241,0.35)] hover:border-indigo-500/60 dark:hover:border-indigo-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 opacity-90 group-hover:opacity-100 transition-opacity" />
            
            {/* Ambient hover glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t('office.transaction')}
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shadow-xs group-hover:scale-110 transition-transform duration-300">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {totalTransactionsCount} {t('office.payment_records')}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTransactionModalOpen(true);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-110 active:scale-95 shrink-0"
                title={isGu ? 'નવો વ્યવહાર નોંધો' : 'Record New Transaction Entry (+)'}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION 1: TODAY'S APPLICATIONS (WITH FILTERS + ADD BUTTON) */}
      {/* ========================================================================= */}
      <Card id="todays-apps-section" variant="elevated" className="overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-card-elevated">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {t('office.todays_applications')}
                </CardTitle>
                <Badge variant="info">
                  {displayTodayApps.length}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                {t('office.todays_sub')}
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
              {t('office.add_application')}
            </Button>
          </div>
        </CardHeader>

        {/* Section 1 Filters Bar: Date, Status, Family ID */}
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.date_filter')}
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
                    title={isGu ? 'તારીખ સાફ કરો' : 'Clear date (Show all)'}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-1 rounded hover:bg-slate-200/50"
                  >
                    {t('office.clear')}
                  </button>
                )}
                <button
                  onClick={() => setTodayDateFilter(todayStr)}
                  title={isGu ? 'આજની તારીખ પર સેટ કરો' : 'Reset to today'}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100"
                >
                  {t('office.today')}
                </button>
              </div>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.status_filter')}
              </label>
              <select
                value={todayStatusFilter}
                onChange={(e) => setTodayStatusFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">{t('office.all_statuses')}</option>
                <option value="SUBMITTED">{isGu ? 'સબમિટ થયેલ' : 'Submitted'}</option>
                <option value="SCRUTINY">{isGu ? 'ચકાસણી' : 'Scrutiny'}</option>
                <option value="GOVERNMENT_PROCESSING">{isGu ? 'સરકારી પ્રક્રિયા' : 'Govt Processing'}</option>
                <option value="ACTION_REQUIRED">{isGu ? 'કાર્યવાહી જરૂરી' : 'Action Required'}</option>
                <option value="APPROVED">{isGu ? 'મંજૂર' : 'Approved'}</option>
                <option value="COMPLETED">{isGu ? 'પૂર્ણ' : 'Completed'}</option>
                <option value="REJECTED">{isGu ? 'અસ્વીકાર' : 'Rejected'}</option>
              </select>
            </div>

            {/* Filter: Family ID / Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.family_citizen')}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isGu ? 'દા.ત. HTF-000001 અથવા નામ' : 'e.g. HTF-000001 or Name'}
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
                {t('office.reset_filters')}
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
                  <th className="py-3.5 px-4">{t('office.application_id')}</th>
                  <th className="py-3.5 px-4">{t('office.family_applicant')}</th>
                  <th className="py-3.5 px-4">{t('office.service')}</th>
                  <th className="py-3.5 px-4">{t('office.applied_date')}</th>
                  <th className="py-3.5 px-4">{t('office.status')}</th>
                  <th className="py-3.5 px-4">{t('office.payment')}</th>
                  <th className="py-3.5 px-4 text-right">{t('office.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {displayTodayApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {t('office.no_today_apps')}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t('office.click_reset_or_add')}
                        </p>
                        <Button
                          onClick={() => setIsIntakeModalOpen(true)}
                          variant="primary"
                          size="xs"
                          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                          className="mt-3"
                        >
                          {t('office.add_application')}
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
                        {app.created_at ? app.created_at.split('T')[0] : (isGu ? 'આજે' : 'Today')}
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
                          {app.payment_status === 'PAID' ? (isGu ? 'ચૂકવેલ' : 'PAID') : (isGu ? 'બાકી' : 'PENDING')} (₹{app.total_fee || 50})
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
                            {t('office.view')}
                          </Button>
                          <Button
                            onClick={() => setSelectedAppForReceipt(app)}
                            variant="outline"
                            size="xs"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                          >
                            {t('office.receipt')}
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
      <Card id="pending-apps-section" variant="elevated" className="overflow-hidden border border-amber-200/90 dark:border-amber-900/40 shadow-card-elevated">
        <CardHeader className="bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/80 dark:border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {t('office.pending_applications')}
                </CardTitle>
                <Badge variant="warning">
                  {filteredPendingApps.length} {t('office.pending')}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                {t('office.pending_sub')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Section 2 Filters Bar: Date, Family ID, Service */}
        <div className="p-4 bg-amber-50/30 dark:bg-slate-900/30 border-b border-amber-200/70 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.date_filter')}
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
                    title={isGu ? 'તારીખ સાફ કરો' : 'Clear date'}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded"
                  >
                    {t('office.clear')}
                  </button>
                )}
              </div>
            </div>

            {/* Filter: Family ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.family_citizen')}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isGu ? 'પરિવાર આઈડી અથવા નામ શોધો' : 'Filter by Family ID / Name'}
                  value={pendingFamilyFilter}
                  onChange={(e) => setPendingFamilyFilter(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Filter: Service */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.service')}
              </label>
              <select
                value={pendingServiceFilter}
                onChange={(e) => setPendingServiceFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">{t('office.all_services')}</option>
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
                {t('office.reset_filters')}
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
                  <th className="py-3.5 px-4">{t('office.application_id')}</th>
                  <th className="py-3.5 px-4">{t('office.family_applicant')}</th>
                  <th className="py-3.5 px-4">{t('office.service')}</th>
                  <th className="py-3.5 px-4">{t('office.applied_date')}</th>
                  <th className="py-3.5 px-4">{t('office.current_status')}</th>
                  <th className="py-3.5 px-4">{t('office.assigned_staff')}</th>
                  <th className="py-3.5 px-4 text-right">{t('office.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPendingApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('office.no_pending_apps')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t('office.pending_all_clear')}
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
                        {app.assigned_staff_name || (isGu ? 'ફ્રન્ટ ડેસ્ક સ્ટાફ' : 'Front Desk Staff')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => setSelectedAppForDrawer(app)}
                          variant="primary"
                          size="xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          {t('office.process_scrutiny')}
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
      <Card id="completed-apps-section" variant="elevated" className="overflow-hidden border border-emerald-200/90 dark:border-emerald-900/40 shadow-card-elevated">
        <CardHeader className="bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {t('office.complete_applications')}
                </CardTitle>
                <Badge variant="success">
                  {filteredCompleteApps.length} {t('office.completed')}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                {t('office.complete_sub')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Section 3 Filters Bar: Date, Family ID, Service */}
        <div className="p-4 bg-emerald-50/30 dark:bg-slate-900/30 border-b border-emerald-200/70 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
            {/* Filter: Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.date_filter')}
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
                    title={isGu ? 'તારીખ સાફ કરો' : 'Clear date'}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded"
                  >
                    {t('office.clear')}
                  </button>
                )}
              </div>
            </div>

            {/* Filter: Family ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.family_citizen')}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isGu ? 'પરિવાર આઈડી અથવા નામ શોધો' : 'Filter by Family ID / Name'}
                  value={completeFamilyFilter}
                  onChange={(e) => setCompleteFamilyFilter(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filter: Service */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t('office.service')}
              </label>
              <select
                value={completeServiceFilter}
                onChange={(e) => setCompleteServiceFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">{t('office.all_services')}</option>
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
                {t('office.reset_filters')}
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
                  <th className="py-3.5 px-4">{t('office.application_id')}</th>
                  <th className="py-3.5 px-4">{t('office.family_applicant')}</th>
                  <th className="py-3.5 px-4">{t('office.service')}</th>
                  <th className="py-3.5 px-4">{t('office.govt_app_no')}</th>
                  <th className="py-3.5 px-4">{t('office.status')}</th>
                  <th className="py-3.5 px-4">{t('office.fee_paid')}</th>
                  <th className="py-3.5 px-4 text-right">{t('office.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCompleteApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('office.no_complete_apps')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t('office.complete_empty_hint')}
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
                            {t('office.view')}
                          </Button>
                          <Button
                            onClick={() => setSelectedAppForReceipt(app)}
                            variant="outline"
                            size="xs"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                          >
                            {t('office.receipt')}
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
        title={isGu ? 'નવો વ્યવહાર / બિલિંગ નોંધો' : 'Record Transaction / Billing Entry'}
        description={isGu ? 'મલ્ટીપલ સેવાઓ, અંશતઃ/હાફ ચુકવણી અને અગાઉના બાકી હિસાબ સાથે' : 'Support for multiple services, partial payment & customer previous ledger'}
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTxnMutation.mutate();
          }}
          className="space-y-4 text-xs"
        >
          {/* 1. FAMILY / CUSTOMER SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'પરિવાર / નાગરિક પસંદ કરો *' : 'Select Family / Customer *'}
            </label>
            <select
              value={txnCustomerId || (customers[0]?.id ?? 4)}
              onChange={(e) => {
                setTxnCustomerId(Number(e.target.value));
                setIncludePreviousDue(false);
                setIsManualPaid(false);
              }}
              required
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.family_id} — {c.head_of_family} ({c.mobile_number})
                </option>
              ))}
            </select>
          </div>

          {/* 2. FAMILY PAST PAYMENT HISTORY & DUE LEDGER */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {isGu ? 'અગાઉનો ચુકવણી ઇતિહાસ અને હિસાબ' : 'Previous Payment History & Ledger'}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({selectedCustomer?.head_of_family})
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pastCustomerTxns.length > 0
                      ? isGu
                        ? `આ પરિવારના કુલ ${pastCustomerTxns.length} અગાઉના વ્યવહારો મળ્યા છે`
                        : `${pastCustomerTxns.length} previous transaction record(s) on file`
                      : isGu
                      ? 'આ પરિવારનો કોઈ અગાઉનો વ્યવહાર નથી'
                      : 'No previous transactions found for this family'}
                  </p>
                </div>
              </div>

              {pastCustomerTxns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPastHistory((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <span>{showPastHistory ? (isGu ? 'વિગત છુપાવો' : 'Hide Details') : (isGu ? 'ઇતિહાસ જુઓ' : 'View History')}</span>
                  {showPastHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Quick stats cards: Previous Paid vs Previous Due */}
            {pastCustomerTxns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {isGu ? 'કુલ અગાઉ બિલ' : 'Total Prev Billed'}
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    ₹{pastLedgerStats.totalBilled.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {isGu ? 'પહેલા ચૂકવેલ રકમ' : 'Previously Paid'}
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    ₹{pastLedgerStats.totalPaid.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    pastLedgerStats.hasDue
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80'
                      : 'bg-slate-100/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      pastLedgerStats.hasDue ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {isGu ? 'અગાઉનું બાકી (Due)' : 'Outstanding Due'}
                  </span>
                  <span
                    className={`font-mono font-black text-xs sm:text-sm ${
                      pastLedgerStats.hasDue ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    ₹{pastLedgerStats.totalDue.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* If has pending due: highlighted warning & checkbox to include in current bill */}
            {pastLedgerStats.hasDue && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-semibold">
                    {isGu
                      ? `આ પરિવારે અગાઉ ₹${pastLedgerStats.totalPaid.toFixed(2)} ચૂકવ્યા હતા અને ₹${pastLedgerStats.totalDue.toFixed(2)} હજુ બાકી છે!`
                      : `Family previously paid ₹${pastLedgerStats.totalPaid.toFixed(2)} and has ₹${pastLedgerStats.totalDue.toFixed(2)} outstanding pending balance!`}
                  </span>
                </div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-1 rounded-lg hover:bg-amber-200 shrink-0">
                  <input
                    type="checkbox"
                    checked={includePreviousDue}
                    onChange={(e) => {
                      setIncludePreviousDue(e.target.checked);
                      setIsManualPaid(false);
                    }}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{isGu ? '+ આ બિલમાં બાકી રકમ સામેલ કરો' : '+ Include Previous Due in this Bill'}</span>
                </label>
              </div>
            )}

            {/* Collapsible previous transactions table */}
            {showPastHistory && pastCustomerTxns.length > 0 && (
              <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <tr>
                      <th className="py-2 px-2.5">{isGu ? 'તારીખ / નંબર' : 'Date / No'}</th>
                      <th className="py-2 px-2.5">{isGu ? 'સેવા' : 'Service'}</th>
                      <th className="py-2 px-2.5">{isGu ? 'બિલ' : 'Bill'}</th>
                      <th className="py-2 px-2.5">{isGu ? 'ચૂકવેલ' : 'Paid'}</th>
                      <th className="py-2 px-2.5">{isGu ? 'બાકી' : 'Due'}</th>
                      <th className="py-2 px-2.5">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {pastCustomerTxns.map((pt) => (
                      <tr key={pt.id}>
                        <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500">
                          {pt.transaction_date || pt.created_at.split('T')[0]}
                          <div className="text-slate-400 font-normal">{pt.transaction_no}</div>
                        </td>
                        <td className="py-2 px-2.5 text-slate-800 dark:text-slate-200">
                          {pt.service_name}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-slate-700 dark:text-slate-300">
                          ₹{parseFloat(pt.bill_amount).toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ₹{parseFloat(pt.paid_amount || pt.bill_amount).toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                          ₹{parseFloat(pt.due_amount || '0').toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              pt.payment_status === 'PAID' || !pt.due_amount || parseFloat(pt.due_amount) === 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {pt.payment_status || (parseFloat(pt.due_amount || '0') > 0 ? 'PARTIAL' : 'PAID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. MULTIPLE SERVICES SELECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isGu ? 'સેવાઓ પસંદ કરો (Multiple Services Allowed) *' : 'Select Services (Multiple Services Allowed) *'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {txnItems.length}
                </span>
              </label>
              <button
                type="button"
                onClick={handleAddServiceItem}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isGu ? '+ બીજી સેવા ઉમેરો' : '+ Add Another Service'}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {txnItems.map((item, index) => {
                const currentService = servicesList.find((s) => s.id === item.serviceId) || servicesList[0];
                const subServices = currentService?.SubServices || [];

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Service selection */}
                    <div className="flex-1 min-w-[130px]">
                      <select
                        value={item.serviceId}
                        onChange={(e) => handleUpdateServiceItem(item.id, 'serviceId', e.target.value)}
                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.ServiceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Service selection */}
                    <div className="flex-1 min-w-[130px]">
                      <select
                        value={item.subServiceId}
                        onChange={(e) => handleUpdateServiceItem(item.id, 'subServiceId', e.target.value)}
                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {subServices.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.SubServiceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount input */}
                    <div className="w-28 shrink-0 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={item.amount}
                        onChange={(e) => handleUpdateServiceItem(item.id, 'amount', e.target.value)}
                        className="w-full text-xs font-mono font-bold py-1.5 pl-6 pr-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Fee"
                      />
                    </div>

                    {/* Remove button */}
                    {txnItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                        title={isGu ? 'સેવા દૂર કરો' : 'Remove service'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. PAYMENT BREAKDOWN: TOTAL, PAID NOW, PENDING DUE */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3 shadow-2xs">
            {/* Total Services Bill */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {isGu ? 'કુલ સેવા બિલ રકમ:' : 'Total Services Bill Amount:'}
              </span>
              <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                ₹{totalServicesBill.toFixed(2)}
              </span>
            </div>

            {includePreviousDue && pastLedgerStats.hasDue && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-indigo-100 dark:border-indigo-900/40 text-amber-700 dark:text-amber-400">
                <span className="font-semibold">
                  {isGu ? '+ અગાઉનું બાકી (Previous Due Added):' : '+ Previous Due Added:'}
                </span>
                <span className="font-mono font-bold">
                  +₹{pastLedgerStats.totalDue.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>{isGu ? 'કુલ ચૂકવવાપાત્ર બિલ રકમ (Net Bill):' : 'Net Total Bill Amount:'}</span>
              <span className="font-mono font-black text-base text-indigo-700 dark:text-indigo-400">
                ₹{effectiveTotalBill.toFixed(2)}
              </span>
            </div>

            {/* Amount Paid / Received Now */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isGu ? 'અત્યારે મળેલ રકમ (Amount Paid / Received Now) *' : 'Amount Paid / Received Now (₹) *'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTxnPaidAmount(effectiveTotalBill.toString());
                      setIsManualPaid(false);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      currentPaid === effectiveTotalBill
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    {isGu ? 'પૂરેપૂરું (100%)' : 'Full (100%)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxnPaidAmount(Math.round(effectiveTotalBill / 2).toString());
                      setIsManualPaid(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      currentPaid === Math.round(effectiveTotalBill / 2) && effectiveTotalBill > 0
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    {isGu ? 'અડધું (50%)' : 'Half (50%)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxnPaidAmount('0');
                      setIsManualPaid(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      currentPaid === 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    {isGu ? 'બાકી (₹0 Due)' : 'Unpaid (₹0 Due)'}
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  max={effectiveTotalBill}
                  step="1"
                  required
                  value={txnPaidAmount}
                  onChange={(e) => {
                    setTxnPaidAmount(e.target.value);
                    setIsManualPaid(true);
                  }}
                  className="w-full text-sm font-mono font-bold py-2 pl-7 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Remaining Due & Status Indicator */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {isGu ? 'બાકી રહેતી રકમ (Remaining Due):' : 'Remaining Due:'}
                </span>
                <span
                  className={`font-mono font-black text-sm ${
                    currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  ₹{currentDue.toFixed(2)}
                </span>
              </div>

              <div>
                {currentPaymentStatus === 'PAID' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isGu ? 'સંપૂર્ણ ચૂકવેલ (PAID)' : 'Full Payment (PAID)'}
                  </span>
                )}
                {currentPaymentStatus === 'PARTIAL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isGu
                      ? `અંશતઃ ચૂકવેલ (₹${currentDue.toFixed(2)} બાકી)`
                      : `Half/Partial (₹${currentDue.toFixed(2)} Due)`}
                  </span>
                )}
                {currentPaymentStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    <Clock className="w-3.5 h-3.5" />
                    {isGu ? 'ચુકવણી બાકી (UNPAID)' : 'Pending (UNPAID)'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 5. PAYMENT MODE (CASH or ONLINE/UPI - NO DROPDOWN, NO CARD) & REMARKS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isGu ? 'ચુકવણી પદ્ધતિ (Payment Mode) *' : 'Payment Mode *'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxnPaymentMode('CASH')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                    txnPaymentMode === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/30'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>{isGu ? 'રોકડ (Cash)' : 'Cash'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxnPaymentMode('ONLINE/UPI')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                    txnPaymentMode === 'ONLINE/UPI'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isGu ? 'ઓનલાઇન / UPI' : 'Online / UPI'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isGu ? 'નોંધ / રીમાર્કસ (મરજિયાત)' : 'Remarks / Note (Optional)'}
              </label>
              <input
                type="text"
                placeholder={
                  isGu
                    ? currentDue > 0
                      ? 'દા.ત. અડધી રકમ મળી, બાકી ડિલિવરી સમયે'
                      : 'દા.ત. સેવા ફી ચુકવણી'
                    : currentDue > 0
                    ? 'e.g. ₹50 advance paid, balance on delivery'
                    : 'e.g. Service fee payment'
                }
                value={txnRemarks}
                onChange={(e) => setTxnRemarks(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Points preview */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              {isGu ? 'આ ચુકવણી પર ગ્રાહક લોયલ્ટી પોઈન્ટ્સ:' : 'Loyalty Points Earned on this Payment:'}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{Math.round(currentPaid * 0.1)} Pts
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTransactionModalOpen(false)}
            >
              {isGu ? 'રદ કરો' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createTxnMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 font-bold shadow-md shadow-indigo-600/20"
            >
              {isGu ? 'વ્યવહાર સાચવો (Save Entry)' : 'Save Transaction Entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
