'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  Modal,
  Badge,
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { transactionService } from '@/api/services/transactionService';
import { customerService } from '@/api/services/customerService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction, PaymentMode } from '@/types';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  Search,
  IndianRupee,
  Coins,
  Wallet,
  CheckCircle2,
  Trash2,
  Eye,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  History,
} from 'lucide-react';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [txnToDelete, setTxnToDelete] = useState<Transaction | null>(null);

  // Billing Form State
  const [customerId, setCustomerId] = useState(3);
  const [serviceId, setServiceId] = useState(3);
  const [subServiceId, setSubServiceId] = useState(3);
  const [billAmount, setBillAmount] = useState('200.00');
  const [pointsEarned, setPointsEarned] = useState(20);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [walletCredit, setWalletCredit] = useState('0.00');
  const [walletUsed, setWalletUsed] = useState('0.00');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [remarks, setRemarks] = useState('Service processing payment');

  // Expense State
  const [expenses, setExpenses] = useState<Array<{ id: number; title: string; category: string; amount: number; date: string; notes?: string; paymentMode?: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hytech_expenses');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('OFFICE_SUPPLIES');
  const [expensePaymentMode, setExpensePaymentMode] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  const [activeLedgerTab, setActiveLedgerTab] = useState<'all' | 'income' | 'expenses'>('all');
  const [allSearch, setAllSearch] = useState('');
  const [allTypeFilter, setAllTypeFilter] = useState('ALL');
  const [expenseSearch, setExpenseSearch] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const action = params.get('action');
      if (type === 'EXPENSE' || action === 'new_expense') {
        setActiveLedgerTab('expenses');
        setIsExpenseModalOpen(true);
      } else if (type === 'INCOME' || action === 'new_income') {
        setActiveLedgerTab('income');
        setIsBillingModalOpen(true);
      }
    }
  }, []);

  const handleDeleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast.success('Expense record deleted');
  };

  const filteredExpenses = useMemo(() => {
    if (!expenseSearch.trim()) return expenses;
    const q = expenseSearch.toLowerCase();
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
    );
  }, [expenses, expenseSearch]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    if (!expenseTitle.trim()) {
      toast.error('Please enter an expense title/purpose');
      return;
    }
    const newExp = {
      id: Date.now(),
      title: expenseTitle,
      category: expenseCategory,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      notes: expenseNotes,
      paymentMode: expensePaymentMode,
    };
    setExpenses([newExp, ...expenses]);
    toast.success('Expense recorded successfully!');
    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
  };

  // Queries
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  const currentService = services.find((s: any) => s.id === serviceId) || services[0];
  const currentSubServices = currentService?.SubServices || [];

  // Live Calculations
  const numBill = parseFloat(billAmount) || 0;
  const numWalletUsed = parseFloat(walletUsed) || 0;
  const numWalletCredit = parseFloat(walletCredit) || 0;
  const netWalletChange = numWalletCredit - numWalletUsed;
  const netPayableCash = Math.max(0, numBill - numWalletUsed);

  // Create Transaction Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      transactionService.createTransaction({
        customer: customerId,
        service: serviceId,
        sub_service: subServiceId,
        bill_amount: billAmount,
        points_earned: pointsEarned,
        points_redeemed: pointsRedeemed,
        wallet_credit: walletCredit,
        wallet_used: walletUsed,
        payment_mode: paymentMode,
        staff: 1,
        remarks,
      }),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Transaction processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsBillingModalOpen(false);
    },
    onError: () => toast.error('Failed to create transaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction record deleted');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTxnToDelete(null);
    },
  });

  const filteredTransactions = transactions.filter((t: any) => {
    const matchesSearch =
      t.transaction_no.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.family_id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = paymentFilter === 'ALL' || t.payment_mode === paymentFilter;
    return matchesSearch && matchesFilter;
  });

  const combinedHistory = useMemo(() => {
    const list: Array<{
      id: string;
      originalId: number;
      type: 'INCOME' | 'EXPENSE';
      date: string;
      token: string;
      title: string;
      subtitle?: string;
      categoryOrService: string;
      subCategory?: string;
      paymentMode: string;
      amount: number;
      points?: number;
      walletChange?: number;
      originalTxn?: any;
      originalExpense?: any;
    }> = [];

    transactions.forEach((txn: any) => {
      list.push({
        id: `txn-${txn.id}`,
        originalId: txn.id,
        type: 'INCOME',
        date: txn.transaction_date || (txn.created_at ? txn.created_at.split('T')[0] : ''),
        token: txn.transaction_no,
        title: txn.customer_name,
        subtitle: txn.family_id,
        categoryOrService: txn.service_name,
        subCategory: txn.sub_service_name,
        paymentMode: txn.payment_mode || 'CASH',
        amount: parseFloat(txn.bill_amount) || 0,
        points: txn.points_earned,
        walletChange: txn.net_wallet_change,
        originalTxn: txn,
      });
    });

    expenses.forEach((exp: any) => {
      list.push({
        id: `exp-${exp.id}`,
        originalId: exp.id,
        type: 'EXPENSE',
        date: exp.date,
        token: `EXP-${exp.id.toString().padStart(6, '0')}`,
        title: exp.title,
        subtitle: exp.notes,
        categoryOrService: exp.category,
        subCategory: undefined,
        paymentMode: exp.paymentMode || 'ONLINE',
        amount: exp.amount || 0,
        points: undefined,
        walletChange: undefined,
        originalExpense: exp,
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [transactions, expenses]);

  const filteredCombinedHistory = useMemo(() => {
    return combinedHistory.filter((item) => {
      const q = allSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.token.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.categoryOrService.toLowerCase().includes(q) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(q));

      const matchesFilter =
        allTypeFilter === 'ALL' ||
        (allTypeFilter === 'INCOME' && item.type === 'INCOME') ||
        (allTypeFilter === 'EXPENSE' && item.type === 'EXPENSE') ||
        item.paymentMode === allTypeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [combinedHistory, allSearch, allTypeFilter]);

  const totalBilled = transactions.reduce((acc: number, t: any) => acc + (parseFloat(t.bill_amount) || 0), 0);
  const totalIncome = totalBilled;
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const netProfitLoss = totalIncome - totalExpenses;
  const isProfitable = netProfitLoss >= 0;

  const incomeOnline = transactions
    .filter((t: any) => t.payment_mode === 'ONLINE/UPI' || t.payment_mode === 'ONLINE' || t.payment_mode === 'CARD' || t.payment_mode === 'UPI')
    .reduce((acc: number, t: any) => acc + (parseFloat(t.bill_amount) || 0), 0);

  const incomeCash = transactions
    .filter((t: any) => !t.payment_mode || t.payment_mode === 'CASH')
    .reduce((acc: number, t: any) => acc + (parseFloat(t.bill_amount) || 0), 0);

  const expenseOnline = expenses
    .filter((e: any) => e.paymentMode === 'ONLINE' || e.paymentMode === 'ONLINE/UPI' || e.category === 'PORTAL_FEE')
    .reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

  const expenseCash = expenses
    .filter((e: any) => e.paymentMode === 'CASH' || (!e.paymentMode && e.category !== 'PORTAL_FEE'))
    .reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('transactions_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('transactions_sub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            size="sm"
            className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold border-0 shadow-md shadow-rose-600/25"
            leftIcon={<TrendingDown className="w-4 h-4 text-white" />}
          >
            + Add Expense
          </Button>
          <Button
            onClick={() => setIsBillingModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {language === 'gu' ? 'ઇનવોઇસ ઉમેરો' : 'Add Invoice'}
          </Button>
        </div>
      </div>

      {/* Summary Highlights Row: Profit & Loss, Income, Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={language === 'gu' ? (isProfitable ? 'ચોખ્ખો નફો' : 'ખોટ') : (isProfitable ? 'Profit' : 'Loss')}
          value={`${isProfitable ? '₹+' : '₹-'}${Math.abs(netProfitLoss).toFixed(2)}`}
          subtitle={
            language === 'gu'
              ? `ઓનલાઇન = ₹${(incomeOnline - expenseOnline).toFixed(0)} અને કેશ = ₹${(incomeCash - expenseCash).toFixed(0)}`
              : `Online Payment = ₹${(incomeOnline - expenseOnline).toFixed(0)} and Cash Payment = ₹${(incomeCash - expenseCash).toFixed(0)}`
          }
          icon={isProfitable ? TrendingUp : TrendingDown}
          colorScheme={isProfitable ? 'emerald' : 'rose'}
          onClick={() => setActiveLedgerTab('all')}
        />
        <StatCard
          title={language === 'gu' ? 'આવક' : 'Income'}
          value={`₹${totalIncome.toFixed(2)}`}
          subtitle={
            language === 'gu'
              ? `ઓનલાઇન પેમેન્ટ = ₹${incomeOnline.toFixed(0)} અને કેશ પેમેન્ટ = ₹${incomeCash.toFixed(0)}`
              : `Online Payment = ₹${incomeOnline.toFixed(0)} and Cash Payment = ₹${incomeCash.toFixed(0)}`
          }
          icon={TrendingUp}
          colorScheme="emerald"
          onClick={() => setActiveLedgerTab('income')}
        />
        <StatCard
          title={language === 'gu' ? 'ખર્ચ' : 'Expenses'}
          value={`₹${totalExpenses.toFixed(2)}`}
          subtitle={
            language === 'gu'
              ? `ઓનલાઇન પેમેન્ટ = ₹${expenseOnline.toFixed(0)} અને કેશ પેમેન્ટ = ₹${expenseCash.toFixed(0)}`
              : `Online Payment = ₹${expenseOnline.toFixed(0)} and Cash Payment = ₹${expenseCash.toFixed(0)}`
          }
          icon={TrendingDown}
          colorScheme="rose"
          onClick={() => setActiveLedgerTab('expenses')}
        />
      </div>

      {/* Ledger History Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveLedgerTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLedgerTab === 'all'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{language === 'gu' ? 'બધો ઇતિહાસ' : 'All History'} ({combinedHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLedgerTab('income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLedgerTab === 'income'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{language === 'gu' ? 'ઇનવોઇસ અને આવક ઇતિહાસ' : 'Invoices & Income History'} ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLedgerTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeLedgerTab === 'expenses'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>{language === 'gu' ? 'ખર્ચ ઇતિહાસ' : 'Expenses History'} ({expenses.length})</span>
        </button>
      </div>

      {/* 0. All History (Combined) View */}
      {activeLedgerTab === 'all' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter & Search Bar */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={allSearch}
                onChange={(e) => setAllSearch(e.target.value)}
                placeholder={
                  language === 'gu'
                    ? 'બધા ટ્રાન્ઝેક્શન, નાગરિક, ઇનવોઇસ કે ખર્ચ શોધો...'
                    : 'Search all transactions, customer name, token, or expense...'
                }
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                {language === 'gu' ? 'પ્રકાર / મોડ:' : 'Type / Mode:'}
              </span>
              <Select
                value={allTypeFilter}
                onChange={(e) => setAllTypeFilter(e.target.value)}
                className="py-1.5 text-xs font-bold"
              >
                <option value="ALL">{language === 'gu' ? 'બધા રેકોર્ડ્સ (All Records)' : 'All Records'}</option>
                <option value="INCOME">{language === 'gu' ? 'માત્ર આવક (+ Invoices)' : 'Income Only (+ Invoices)'}</option>
                <option value="EXPENSE">{language === 'gu' ? 'માત્ર ખર્ચ (- Expenses)' : 'Expenses Only (- Center Costs)'}</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE/UPI">ONLINE / UPI</option>
                <option value="CARD">CARD</option>
              </Select>
            </div>
          </Card>

          {/* Combined Data Table */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'પ્રકાર' : 'Type'}</th>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'ટોકન / રેફ' : 'Token / Ref'}</th>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'વિગત / નાગરિક' : 'Party / Title'}</th>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'સેવા / કેટેગરી' : 'Service / Category'}</th>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'મોડ' : 'Payment Mode'}</th>
                    <th className="py-3.5 px-4 font-black">{language === 'gu' ? 'તારીખ' : 'Date'}</th>
                    <th className="py-3.5 px-4 font-black text-right">{language === 'gu' ? 'રકમ' : 'Amount'}</th>
                    <th className="py-3.5 px-4 font-black text-right">{language === 'gu' ? 'ક્રિયા' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredCombinedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                        {language === 'gu' ? 'કોઈ રેકોર્ડ મળ્યો નથી' : 'No records found matching criteria'}
                      </td>
                    </tr>
                  ) : (
                    filteredCombinedHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          {item.type === 'INCOME' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <TrendingUp className="w-3 h-3" />
                              {language === 'gu' ? 'આવક' : 'Income'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <TrendingDown className="w-3 h-3" />
                              {language === 'gu' ? 'ખર્ચ' : 'Expense'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black">
                          <span className={item.type === 'INCOME' ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}>
                            {item.token}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.subtitle}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {item.categoryOrService}
                          </div>
                          {item.subCategory && (
                            <div className="text-[10px] text-slate-400">
                              {item.subCategory}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant={item.paymentMode === 'CASH' ? 'success' : item.paymentMode === 'EXPENSE' ? 'danger' : 'info'}>
                              {item.paymentMode}
                            </Badge>
                            {item.originalTxn?.payment_status === 'PARTIAL' && (
                              <Badge variant="warning">
                                {language === 'gu' ? 'અંશતઃ' : 'PARTIAL'}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-sm">
                          {item.type === 'INCOME' ? (
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                                +₹{(item.originalTxn?.paid_amount ? parseFloat(item.originalTxn.paid_amount) : item.amount).toFixed(2)}
                              </span>
                              {item.originalTxn?.due_amount && parseFloat(item.originalTxn.due_amount) > 0 && (
                                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                  {language === 'gu' ? 'બાકી: ' : 'Due: '}₹{parseFloat(item.originalTxn.due_amount).toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-mono font-black">
                              -₹{item.amount.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.type === 'INCOME' && item.originalTxn && (
                              <button
                                onClick={() => setSelectedReceipt(item.originalTxn)}
                                className="p-1.5 rounded-xl text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                                title="View Official Receipt"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (item.type === 'INCOME' && item.originalTxn) {
                                  setTxnToDelete(item.originalTxn);
                                } else if (item.type === 'EXPENSE' && item.originalExpense) {
                                  handleDeleteExpense(item.originalExpense.id);
                                }
                              }}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title={item.type === 'INCOME' ? 'Delete Invoice' : 'Delete Expense'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 1. Invoices & Income History View */}
      {activeLedgerTab === 'income' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter & Search Bar */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Txn No, Customer Name, or Family ID..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Mode:</span>
              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="py-1.5 text-xs font-bold"
              >
                <option value="ALL">All Modes</option>
                <option value="CASH">CASH</option>
                <option value="ONLINE/UPI">ONLINE / UPI</option>
                <option value="CARD">CARD</option>
              </Select>
            </div>
          </Card>

          {/* Transactions Data Table */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="py-3.5 px-4 font-black">Txn Token</th>
                    <th className="py-3.5 px-4 font-black">Citizen &amp; Household</th>
                    <th className="py-3.5 px-4 font-black">Service Provided</th>
                    <th className="py-3.5 px-4 font-black">Bill Amount</th>
                    <th className="py-3.5 px-4 font-black">Points Credit</th>
                    <th className="py-3.5 px-4 font-black">Wallet Change</th>
                    <th className="py-3.5 px-4 font-black">Payment Mode</th>
                    <th className="py-3.5 px-4 font-black">Date</th>
                    <th className="py-3.5 px-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredTransactions.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-brand-600 dark:text-brand-400">
                        {txn.transaction_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {txn.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {txn.family_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {txn.service_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {txn.sub_service_name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-slate-900 dark:text-white">
                        ₹{txn.bill_amount}
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-500">
                        +{txn.points_earned} Pts
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {txn.net_wallet_change >= 0 ? `+₹${txn.net_wallet_change}` : `-₹${Math.abs(txn.net_wallet_change)}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={txn.payment_mode === 'CASH' ? 'success' : 'info'}>
                          {txn.payment_mode}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {txn.transaction_date}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedReceipt(txn)}
                            className="p-1.5 rounded-xl text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                            title="View Official Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTxnToDelete(txn)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Expenses History View */}
      {activeLedgerTab === 'expenses' && (
        <div className="space-y-4 animate-fade-in">
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Search expenses by purpose, category, or notes..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-rose-600 hover:bg-rose-500 text-white flex-shrink-0 font-bold"
            >
              + Add New Expense
            </Button>
          </Card>

          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="py-3.5 px-4 font-black">Date</th>
                    <th className="py-3.5 px-4 font-black">Expense Purpose / Title</th>
                    <th className="py-3.5 px-4 font-black">Category</th>
                    <th className="py-3.5 px-4 font-black">Payment Mode</th>
                    <th className="py-3.5 px-4 font-black">Notes / Remarks</th>
                    <th className="py-3.5 px-4 font-black">Amount</th>
                    <th className="py-3.5 px-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <TrendingDown className="w-8 h-8 text-rose-300 dark:text-rose-600 mb-2" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            No expenses matching your search
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Click &quot;+ Add New Expense&quot; above to log an operating cost.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {exp.date}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {exp.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={exp.paymentMode === 'CASH' ? 'success' : 'info'}>
                            {exp.paymentMode || 'ONLINE'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {exp.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-sm text-rose-600 dark:text-rose-400 font-mono">
                          ₹{exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Create Transaction / Billing Modal */}
      <Modal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title="Issue Government Service Invoicing"
        description="Live wallet math and points calculation engine."
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Citizen Household *"
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
            >
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.family_id} — {c.head_of_family}
                </option>
              ))}
            </Select>

            <Select
              label="Service *"
              value={serviceId}
              onChange={(e) => {
                const sId = Number(e.target.value);
                setServiceId(sId);
                const s = services.find((srv: any) => srv.id === sId);
                if (s && s.SubServices?.length) setSubServiceId(s.SubServices[0].id);
              }}
            >
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.ServiceName}
                </option>
              ))}
            </Select>

            <Select
              label="Sub-Service *"
              value={subServiceId}
              onChange={(e) => setSubServiceId(Number(e.target.value))}
            >
              {currentSubServices.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.SubServiceName}
                </option>
              ))}
            </Select>

            <Input
              label="Bill Amount (₹) *"
              type="number"
              step="0.01"
              required
              value={billAmount}
              onChange={(e) => {
                setBillAmount(e.target.value);
                setPointsEarned(Math.round((parseFloat(e.target.value) || 0) * 0.1));
              }}
            />

            <Input
              label="Loyalty Points Credited"
              type="number"
              value={pointsEarned}
              onChange={(e) => setPointsEarned(Number(e.target.value))}
            />

            <Select
              label="Payment Mode *"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            >
              <option value="CASH">CASH</option>
              <option value="ONLINE/UPI">ONLINE / UPI</option>
              <option value="CARD">CARD</option>
            </Select>
          </div>

          {/* Real-time Math Summary Box */}
          <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
              <span>Gross Fee:</span>
              <span className="font-mono">₹{numBill.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Total Payable Now:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{netPayableCash.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBillingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              isLoading={createMutation.isPending}
            >
              Issue Official Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Luxury Printable Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Service Receipt"
        description="HY-TECH Citizen Service Center"
        maxWidth="md"
      >
        {selectedReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center space-y-1 shadow-lg">
              <span className="font-mono text-xs font-bold text-brand-300">
                {selectedReceipt.transaction_no}
              </span>
              <h4 className="text-3xl font-black text-white">
                ₹{selectedReceipt.bill_amount}
              </h4>
              <p className="text-slate-300 text-xs">Settled via {selectedReceipt.payment_mode}</p>
            </div>

            <div className="space-y-2 border-y border-slate-100 dark:border-slate-800 py-3.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Citizen:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Family ID:</span>
                <span className="font-mono font-bold text-brand-600">{selectedReceipt.family_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service Category:</span>
                <span className="font-bold">{selectedReceipt.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sub-Service:</span>
                <span>{selectedReceipt.sub_service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loyalty Points Credited:</span>
                <span className="font-black text-amber-500">+{selectedReceipt.points_earned} Points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Transaction:</span>
                <span className="font-mono">{selectedReceipt.transaction_date}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>

              <Button
                onClick={() => setSelectedReceipt(null)}
                variant="primary"
                size="sm"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Center Expense"
        description="Log operational costs, portal top-ups, stationery, and utility bills"
        maxWidth="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Digital Gujarat Wallet Refill, Printer Paper & Toner"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="PORTAL_FEE">Portal Wallet Recharge</option>
                <option value="OFFICE_SUPPLIES">Office Supplies &amp; Paper</option>
                <option value="UTILITY_BILL">Electricity / Internet</option>
                <option value="MAINTENANCE">Hardware Maintenance</option>
                <option value="OTHER">Other Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode *
              </label>
              <select
                value={expensePaymentMode}
                onChange={(e) => setExpensePaymentMode(e.target.value as 'ONLINE' | 'CASH')}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="ONLINE">Online / UPI Payment</option>
                <option value="CASH">Cash Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expense Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="e.g. 50"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bill reference, Paid via UPI"
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="xs"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Save Expense Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!txnToDelete}
        onClose={() => setTxnToDelete(null)}
        onConfirm={() => txnToDelete && deleteMutation.mutate(txnToDelete.id)}
        title="Delete Transaction Record?"
        message={`Are you sure you want to permanently remove invoice ${txnToDelete?.transaction_no}?`}
        confirmText="Delete Invoice"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
