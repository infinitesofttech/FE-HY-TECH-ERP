'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
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

  const totalBilled = transactions.reduce((acc: number, t: any) => acc + (parseFloat(t.bill_amount) || 0), 0);
  const totalPoints = transactions.reduce((acc: number, t: any) => acc + (t.points_earned || 0), 0);

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wide mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>FINANCIAL LEDGER & LOYALTY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Billing, Invoices & Citizen Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Service invoicing, wallet credits/debits, loyalty points issuance, and digital receipts.
          </p>
        </div>

        <Button
          onClick={() => setIsBillingModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Billing
        </Button>
      </div>

      {/* Summary Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Gross Billed"
          value={`₹${totalBilled.toFixed(2)}`}
          subtitle="Total services processed"
          icon={IndianRupee}
          colorScheme="emerald"
        />
        <StatCard
          title="Loyalty Points Issued"
          value={`${totalPoints} Pts`}
          subtitle="Circulating wallet currency"
          icon={Coins}
          colorScheme="amber"
        />
        <StatCard
          title="Invoices Dispatched"
          value={`${transactions.length} Receipts`}
          subtitle="Customer receipts recorded"
          icon={Receipt}
          colorScheme="brand"
        />
      </div>

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
                <th className="py-3.5 px-4 font-black">Citizen & Household</th>
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
