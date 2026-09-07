'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
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
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useLanguage } from '@/context/LanguageContext';
import { Customer, RelationshipType } from '@/types';
import { familyMemberService } from '@/api/services/familyMemberService';
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
  Plus,
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const isStaffRoute = pathname?.startsWith('/staff');
  const getCustomerDetailUrl = (familyId: string) =>
    isStaffRoute ? `/staff/customers/${familyId}` : `/admin/customers/${familyId}`;

  const [selectedCity, setSelectedCity] = useState('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [formErrors, setFormErrors] = useState<{ head_of_family?: string; mobile_number?: string }>({});
  const [memberForm, setMemberForm] = useState<{
    family_id: string;
    name: string;
    relationship: RelationshipType;
    mobile_number: string;
    birth_date: string;
  }>({
    family_id: '',
    name: '',
    relationship: 'Son',
    mobile_number: '',
    birth_date: '',
  });
  const [memberFormErrors, setMemberFormErrors] = useState<{ family_id?: string; name?: string }>({});

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'add_family') {
        setIsRegisterOpen(true);
      } else if (params.get('action') === 'add_family_member' || params.get('action') === 'add_member') {
        setIsAddMemberOpen(true);
      }
    }
  }, []);

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
      setFormErrors({});
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

  const handleFillDemoData = () => {
    setFormData({
      head_of_family: 'Rameshbhai Patel',
      village_city: 'Rajkot',
      birth_date: '1985-06-15',
      mobile_number: '9825012345',
      whatsapp_number: '9825012345',
      family_member_count: 4,
      referral_family_id: 'HTF-000001',
      document_consent: true,
      password: 'Ramesh@123',
      notes: 'Verified citizen registration with full documents',
    });
    setFormErrors({});
    toast.success(language === 'gu' ? 'સેમ્પલ ડેટા સફળતાપૂર્વક ભરાયો!' : 'Sample demo data auto-filled!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { head_of_family?: string; mobile_number?: string } = {};

    if (!formData.head_of_family.trim()) {
      errors.head_of_family = t('head_of_family_required') || 'Head of Family is required';
    }

    if (!formData.mobile_number.trim()) {
      errors.mobile_number = t('mobile_required') || '10-digit Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number.trim())) {
      errors.mobile_number = language === 'gu' ? '૧૦ અંકનો સાચો મોબાઇલ નંબર દાખલ કરો' : 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(
        language === 'gu'
          ? 'કૃપા કરીને પરિવારના વડાનું નામ અને ૧૦ અંકનો મોબાઇલ નંબર દાખલ કરો'
          : 'Please enter Head of Family and a valid 10-digit Mobile Number'
      );
      return;
    }

    setFormErrors({});
    createMutation.mutate(formData);
  };

  const addMemberMutation = useMutation({
    mutationFn: async (data: typeof memberForm) => {
      const targetFamilyId = data.family_id || customers[0]?.family_id;
      if (!targetFamilyId) throw new Error('No household found to link member');
      const targetCustomer = customers.find((c: any) => c.family_id === targetFamilyId);
      return familyMemberService.addMember(targetFamilyId, {
        name: data.name,
        relationship: data.relationship,
        mobile_number: data.mobile_number,
        birth_date: data.birth_date,
        is_active: true,
        customer: targetCustomer?.id || 1,
      });
    },
    onSuccess: () => {
      toast.success(
        language === 'gu'
          ? 'પરિવાર સભ્ય સફળતાપૂર્વક ઉમેરાઈ ગયો!'
          : 'Family member added successfully!'
      );
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddMemberOpen(false);
      setMemberForm({
        family_id: customers[0]?.family_id || '',
        name: '',
        relationship: 'Son',
        mobile_number: '',
        birth_date: '',
      });
      setMemberFormErrors({});
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add family member');
    },
  });

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { family_id?: string; name?: string } = {};
    const selectedFamily = memberForm.family_id || customers[0]?.family_id;
    if (!selectedFamily) {
      errors.family_id = language === 'gu' ? 'પરિવાર પસંદ કરો' : 'Please select a household';
    }
    if (!memberForm.name.trim()) {
      errors.name = language === 'gu' ? 'સભ્યનું નામ દાખલ કરો' : 'Member name is required';
    }

    if (Object.keys(errors).length > 0) {
      setMemberFormErrors(errors);
      return;
    }

    addMemberMutation.mutate({
      ...memberForm,
      family_id: selectedFamily,
    });
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
  const totalWalletSum = customers.reduce((sum, c) => sum + parseFloat(c.wallet_balance || '0'), 0);

  const columns: Column<Customer>[] = [
    {
      key: 'family_id',
      header: t('family_id'),
      sortable: true,
      cell: (cust) => (
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 font-mono font-black text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs">
          {cust.family_id}
        </span>
      ),
    },
    {
      key: 'head_of_family',
      header: t('head_of_family'),
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
              <WhatsAppButton number={cust.mobile_number} size="xs" className="ml-0.5" />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'village_city',
      header: t('village_city'),
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
      header: t('member_count'),
      sortable: true,
      cell: (cust) => (
        <span className="font-bold px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs">
          {cust.family_member_count} {t('active_members')}
        </span>
      ),
    },
    {
      key: 'current_points',
      header: `${t('points')} & ${t('wallet')}`,
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
      header: t('visits'),
      sortable: true,
      cell: (cust) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {cust.total_visits} {t('visits')}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: t('status'),
      sortable: true,
      cell: (cust) => (
        <Badge variant={cust.is_active ? 'success' : 'default'}>
          {cust.is_active ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'right',
      cell: (cust) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(getCustomerDetailUrl(cust.family_id))}
            className="p-1.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
            title={t('inspect_profile')}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCustomerToDelete(cust)}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title={t('delete')}
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
            {t('customers_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('customers_sub')}
          </p>
        </div>

        <Button
          onClick={() => setIsRegisterOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {t('register_new_family')}
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('total_customers')}
          value={customers.length}
          subtitle="Registered families"
          icon={Users}
          colorScheme="brand"
          onActionClick={() => setIsRegisterOpen(true)}
          actionTitle={language === 'gu' ? 'નવો પરિવાર ઉમેરો (+)' : 'Register New Family (+)'}
        />
        <StatCard
          title={t('active_members')}
          value={totalMembersCount}
          subtitle="Verified family members"
          icon={ShieldCheck}
          colorScheme="emerald"
          onActionClick={() => {
            if (customers.length > 0 && !memberForm.family_id) {
              setMemberForm((prev) => ({ ...prev, family_id: customers[0].family_id }));
            }
            setIsAddMemberOpen(true);
          }}
          actionTitle={language === 'gu' ? 'પરિવાર સભ્ય ઉમેરો (+)' : 'Add Family Member (+)'}
        />
        <StatCard
          title={t('loyalty_points')}
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
        onRowClick={(cust) => router.push(getCustomerDetailUrl(cust.family_id))}
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
                  {city === 'ALL' ? 'બધા ગામ / All Villages' : city}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {/* Register Customer Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setFormErrors({});
        }}
        title={language === 'gu' ? 'નવા પરિવારની નોંધણી' : 'Register New Household'}
        description={language === 'gu' ? 'નાગરિક ઓળખ ફાઇલ બનાવે છે અને પોર્ટલ ઓળખપત્ર સોંપે છે.' : 'Creates official citizen file and assigns portal credentials.'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Demo Fill Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{language === 'gu' ? 'ટેસ્ટિંગ માટે ૧-ક્લિક ડેમો ડેટા:' : 'Quick 1-Click Test Data:'}</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoData}
              className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              ⚡ {t('auto_fill_sample') || 'Auto-Fill Sample Data'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={language === 'gu' ? 'પરિવારના વડાનું નામ *' : 'Head of Family *'}
              required
              value={formData.head_of_family}
              onChange={(e) => {
                setFormData({ ...formData, head_of_family: e.target.value });
                if (formErrors.head_of_family) {
                  setFormErrors((prev) => ({ ...prev, head_of_family: undefined }));
                }
              }}
              error={formErrors.head_of_family}
              placeholder="e.g. Dineshbhai Changani"
            />

            <Input
              label={language === 'gu' ? 'ગામ / શહેર *' : 'Village / City *'}
              required
              value={formData.village_city}
              onChange={(e) => setFormData({ ...formData, village_city: e.target.value })}
              placeholder="e.g. Varna"
            />

            <Input
              label={language === 'gu' ? 'મોબાઇલ નંબર *' : 'Mobile Number *'}
              type="tel"
              required
              value={formData.mobile_number}
              onChange={(e) => {
                setFormData({ ...formData, mobile_number: e.target.value });
                if (formErrors.mobile_number) {
                  setFormErrors((prev) => ({ ...prev, mobile_number: undefined }));
                }
              }}
              error={formErrors.mobile_number}
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
              onClick={() => {
                setIsRegisterOpen(false);
                setFormErrors({});
              }}
            >
              {language === 'gu' ? 'રદ કરો' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              {language === 'gu' ? 'નોંધણી પૂર્ણ કરો' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Family Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setMemberFormErrors({});
        }}
        title={language === 'gu' ? 'પરિવાર સભ્ય ઉમેરો' : 'Add Family Member'}
        description={
          language === 'gu'
            ? 'પરિવારમાં નવા સભ્યની માહિતી ઉમેરી નોંધણી પૂર્ણ કરો.'
            : 'Enroll and link a new member to an existing household.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <Select
            label={language === 'gu' ? 'પરિવાર પસંદ કરો (Household) *' : 'Select Household / Family *'}
            value={memberForm.family_id || customers[0]?.family_id || ''}
            onChange={(e) => {
              setMemberForm({ ...memberForm, family_id: e.target.value });
              setMemberFormErrors((prev) => ({ ...prev, family_id: undefined }));
            }}
            error={memberFormErrors.family_id}
          >
            {customers.map((c: any) => (
              <option key={c.family_id} value={c.family_id}>
                {c.family_id} - {c.head_of_family} ({c.village_city})
              </option>
            ))}
          </Select>

          <Input
            label={language === 'gu' ? 'સભ્યનું પૂરું નામ *' : 'Member Full Name *'}
            required
            value={memberForm.name}
            onChange={(e) => {
              setMemberForm({ ...memberForm, name: e.target.value });
              setMemberFormErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={memberFormErrors.name}
            placeholder={language === 'gu' ? 'દા.ત. પ્રિયાબેન પટેલ' : 'e.g. Priyaben Patel'}
          />

          <Select
            label={language === 'gu' ? 'સંબંધ (Relationship) *' : 'Relationship *'}
            value={memberForm.relationship}
            onChange={(e) =>
              setMemberForm({
                ...memberForm,
                relationship: e.target.value as RelationshipType,
              })
            }
          >
            <option value="Self">{language === 'gu' ? 'પોતે (Self)' : 'Self'}</option>
            <option value="Spouse">{language === 'gu' ? 'પતિ/પત્ની (Spouse)' : 'Spouse'}</option>
            <option value="Son">{language === 'gu' ? 'પુત્ર (Son)' : 'Son'}</option>
            <option value="Daughter">{language === 'gu' ? 'પુત્રી (Daughter)' : 'Daughter'}</option>
            <option value="Father">{language === 'gu' ? 'પિતા (Father)' : 'Father'}</option>
            <option value="Mother">{language === 'gu' ? 'માતા (Mother)' : 'Mother'}</option>
            <option value="Brother">{language === 'gu' ? 'ભાઈ (Brother)' : 'Brother'}</option>
            <option value="Sister">{language === 'gu' ? 'બહેન (Sister)' : 'Sister'}</option>
            <option value="Other">{language === 'gu' ? 'અન્ય (Other)' : 'Other'}</option>
          </Select>

          <Input
            label={language === 'gu' ? 'મોબાઇલ નંબર (વૈકલ્પિક)' : 'Mobile Number (Optional)'}
            type="tel"
            value={memberForm.mobile_number}
            onChange={(e) =>
              setMemberForm({ ...memberForm, mobile_number: e.target.value })
            }
            placeholder="10-digit mobile"
          />

          <Input
            label={language === 'gu' ? 'જન્મ તારીખ (વૈકલ્પિક)' : 'Birth Date (Optional)'}
            type="date"
            value={memberForm.birth_date}
            onChange={(e) =>
              setMemberForm({ ...memberForm, birth_date: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddMemberOpen(false);
                setMemberFormErrors({});
              }}
            >
              {language === 'gu' ? 'રદ કરો' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addMemberMutation.isPending}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {language === 'gu' ? 'સભ્ય ઉમેરો' : 'Add Member'}
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
