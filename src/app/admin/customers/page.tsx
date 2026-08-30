'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  DataTable,
  Column,
  Modal,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { customerService } from '@/api/services/customerService';
import { Customer } from '@/types';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  ArrowUpRight,
  Trash2,
  Coins,
  Wallet,
  Phone,
  MapPin,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCity, setSelectedCity] = useState('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    head_of_family: '',
    village_city: 'Varna',
    birth_date: '1988-01-01',
    mobile_number: '',
    whatsapp_number: '',
    family_member_count: 4,
    referral_family_id: '',
    document_consent: true,
    password: '',
    notes: 'Citizen registered with consent on file',
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: (newCust: typeof formData) => customerService.createCustomer(newCust),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Household registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsRegisterOpen(false);
      setFormData({
        head_of_family: '',
        village_city: 'Varna',
        birth_date: '1988-01-01',
        mobile_number: '',
        whatsapp_number: '',
        family_member_count: 4,
        referral_family_id: '',
        document_consent: true,
        password: '',
        notes: 'Citizen registered with consent on file',
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to register customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (familyId: string) => customerService.deleteCustomer(familyId),
    onSuccess: () => {
      toast.success('Customer removed successfully');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setCustomerToDelete(null);
    },
    onError: () => toast.error('Failed to remove customer'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.head_of_family || !formData.mobile_number) {
      toast.error('Please enter Head of Family and Mobile Number');
      return;
    }
    createMutation.mutate(formData);
  };

  const cities: string[] = [
    'ALL',
    ...(Array.from(new Set(customers.map((c: any) => c.village_city))).filter(Boolean) as string[]),
  ];

  const filteredCustomers = selectedCity === 'ALL'
    ? customers
    : customers.filter((c: any) => c.village_city === selectedCity);

  const totalMembersCount = customers.reduce((sum, c) => sum + (c.family_member_count || 1), 0);
  const totalPointsCount = customers.reduce((sum, c) => sum + (c.current_points || 0), 0);

  const columns: Column<Customer>[] = [
    {
      key: 'family_id',
      header: 'Family Token',
      sortable: true,
      cell: (cust) => (
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 font-mono font-black text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs">
          {cust.family_id}
        </span>
      ),
    },
    {
      key: 'head_of_family',
      header: 'Head of Family',
      sortable: true,
      cell: (cust) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
            {cust.head_of_family ? cust.head_of_family[0].toUpperCase() : 'H'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
              {cust.head_of_family}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{cust.mobile_number}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'village_city',
      header: 'Village / City',
      sortable: true,
      cell: (cust) => (
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          {cust.village_city}
        </span>
      ),
    },
    {
      key: 'family_member_count',
      header: 'Dependents',
      sortable: true,
      cell: (cust) => (
        <span className="font-bold px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs">
          {cust.family_member_count} Members
        </span>
      ),
    },
    {
      key: 'current_points',
      header: 'Points & Wallet',
      sortable: true,
      cell: (cust) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-xs">
            <Coins className="w-3 h-3" />
            {cust.current_points} Pts
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            <Wallet className="w-3 h-3" />
            ₹{cust.wallet_balance}
          </span>
        </div>
      ),
    },
    {
      key: 'total_visits',
      header: 'Visits',
      sortable: true,
      cell: (cust) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {cust.total_visits} Visits
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      cell: (cust) => (
        <Badge variant={cust.is_active ? 'success' : 'default'}>
          {cust.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (cust) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/admin/customers/${cust.family_id}`)}
            className="p-1.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
            title="Inspect Citizen 6-Tab Profile"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCustomerToDelete(cust)}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Family"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>CITIZEN CRM & HOUSEHOLDS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Household Directory & Citizen Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered families, digital identity cards, loyalty wallets, and family tree profiles.
          </p>
        </div>

        <Button
          onClick={() => setIsRegisterOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Register New Family
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Households"
          value={customers.length}
          subtitle="Registered families"
          icon={Users}
          colorScheme="brand"
        />
        <StatCard
          title="Enrolled Dependents"
          value={totalMembersCount}
          subtitle="Verified family members"
          icon={ShieldCheck}
          colorScheme="emerald"
        />
        <StatCard
          title="Citizen Points Ledger"
          value={`${totalPointsCount} Pts`}
          subtitle="Loyalty credit pool"
          icon={Coins}
          colorScheme="amber"
        />
        <StatCard
          title="Covered Villages"
          value={Math.max(cities.length - 1, 1)}
          subtitle="Service coverage areas"
          icon={Building2}
          colorScheme="purple"
        />
      </div>

      {/* Main Customers DataTable with City Filter */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(item) => item.family_id}
        isLoading={isLoading}
        searchPlaceholder="Search by Family ID, Head of Family, or Mobile Number..."
        searchKeys={['head_of_family', 'family_id', 'mobile_number', 'village_city']}
        emptyTitle="No household records found"
        emptyDescription="No families match your current filter criteria."
        emptyActionLabel="Register First Household"
        onEmptyAction={() => setIsRegisterOpen(true)}
        onRowClick={(cust) => router.push(`/admin/customers/${cust.family_id}`)}
        filterComponent={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Village / City:
            </span>
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-1.5 text-xs font-bold"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {/* Register Customer Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Household"
        description="Creates official citizen file and assigns portal credentials."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Head of Family *"
              required
              value={formData.head_of_family}
              onChange={(e) => setFormData({ ...formData, head_of_family: e.target.value })}
              placeholder="e.g. Dineshbhai Changani"
            />

            <Input
              label="Village / City *"
              required
              value={formData.village_city}
              onChange={(e) => setFormData({ ...formData, village_city: e.target.value })}
              placeholder="e.g. Varna"
            />

            <Input
              label="Mobile Number *"
              type="tel"
              required
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
              placeholder="10-digit mobile"
            />

            <Input
              label="WhatsApp Contact"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="Defaults to mobile"
            />

            <Input
              label="Birth Date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />

            <Input
              label="Family Member Count"
              type="number"
              min="1"
              max="20"
              value={formData.family_member_count}
              onChange={(e) => setFormData({ ...formData, family_member_count: Number(e.target.value) })}
            />

            <Input
              label="Citizen Portal Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="e.g. Dineshbhai@123"
            />

            <Input
              label="Referral Family ID"
              value={formData.referral_family_id}
              onChange={(e) => setFormData({ ...formData, referral_family_id: e.target.value })}
              placeholder="e.g. HTF-000001"
            />
          </div>

          <Textarea
            label="Officer Notes / Remarks"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={formData.document_consent}
              onChange={(e) => setFormData({ ...formData, document_consent: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
              Citizen has provided verified document processing consent
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRegisterOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => customerToDelete && deleteMutation.mutate(customerToDelete.family_id)}
        title="Remove Household Record?"
        message={`Are you sure you want to permanently delete ${customerToDelete?.head_of_family} (${customerToDelete?.family_id})? This action cannot be undone.`}
        confirmText="Delete Record"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
