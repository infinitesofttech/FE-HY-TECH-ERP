'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Tabs,
  ConfirmDialog,
  DocumentViewerModal,
  EmptyState,
} from '@/components/ui';
import { customerService } from '@/api/services/customerService';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { familyMemberService } from '@/api/services/familyMemberService';
import { documentService } from '@/api/services/documentService';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { transactionService } from '@/api/services/transactionService';
import { reminderService } from '@/api/services/reminderService';
import { applicationService } from '@/api/services/applicationService';
import { useLanguage } from '@/context/LanguageContext';
import { CustomerDocument, FamilyMember, RelationshipType, DocumentType, Application } from '@/types';
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { ApplicationDetailDrawer } from '@/components/applications/ApplicationDetailDrawer';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  FileCheck2,
  CalendarCheck,
  Receipt,
  BellRing,
  User,
  Plus,
  Phone,
  MapPin,
  Coins,
  Wallet,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  UploadCloud,
  FileText,
  ShieldCheck,
  Sparkles,
  Printer,
} from 'lucide-react';

const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'HEAD',
  'SELF',
  'WIFE',
  'HUSBAND',
  'SON',
  'DAUGHTER',
  'FATHER',
  'MOTHER',
  'BROTHER',
  'SISTER',
  'OTHER',
];

const DOC_TYPES: DocumentType[] = [
  'AADHAR',
  'VOTER_ID',
  'PAN',
  'RATION_CARD',
  'BIRTH_CERTIFICATE',
  'CASTE_CERTIFICATE',
  'INCOME_CERTIFICATE',
  'DRIVING_LICENSE',
  'PHOTO',
  'OTHER',
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const familyId = params?.id as string;

  const [activeTab, setActiveTab] = useState<string>('profile');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<CustomerDocument | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [docToEdit, setDocToEdit] = useState<CustomerDocument | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<Application | null>(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    head_of_family: '',
    mobile_number: '',
    whatsapp_number: '',
    village_city: '',
    birth_date: '',
    referral_family_id: '',
    document_consent: true,
    is_active: true,
    notes: '',
  });

  // New Member Form
  const [memberForm, setMemberForm] = useState({
    name: '',
    relationship: 'SON' as RelationshipType,
    mobile_number: '',
    birth_date: '2005-01-01',
    is_active: true,
  });

  // Edit Member Form
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    relationship: 'SON' as RelationshipType,
    mobile_number: '',
    birth_date: '2005-01-01',
    is_active: true,
  });

  // New Doc Form
  const [docForm, setDocForm] = useState({
    memberId: 3,
    document_type: 'AADHAR' as DocumentType,
    document_name: '',
    description: '',
    is_verified: true,
  });

  // Edit Doc Form
  const [editDocForm, setEditDocForm] = useState({
    document_name: '',
    document_type: 'AADHAR' as DocumentType,
    description: '',
    is_verified: true,
  });

  // Queries
  const { data: customer, isLoading: custLoading } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
    enabled: !!familyId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
    enabled: !!familyId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['customer-documents', familyId],
    queryFn: async () => {
      const all: CustomerDocument[] = [];
      for (const m of members) {
        const docs = await documentService.getDocuments(familyId, m.id);
        all.push(...docs);
      }
      if (all.length === 0) {
        return await documentService.getDocuments(familyId, 3);
      }
      return all;
    },
    enabled: !!familyId,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['customer-visits', familyId],
    queryFn: async () => {
      const all = await serviceVisitService.getVisits();
      return all.filter((v: any) => v.customer_family_id === familyId);
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['customer-transactions', familyId],
    queryFn: async () => {
      const all = await transactionService.getTransactions();
      return all.filter((t: any) => t.family_id === familyId);
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['customer-reminders', familyId],
    queryFn: async () => {
      const all = await reminderService.getReminders();
      return all.filter((r: any) => r.customer_family_id === familyId);
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['customer-applications', familyId],
    queryFn: async () => {
      const all = await applicationService.getApplications();
      return all.filter((a) => a.customer_family_id === familyId);
    },
    enabled: !!familyId,
  });

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: (data: typeof memberForm) =>
      familyMemberService.addMember(familyId, { ...data, customer: customer?.id }),
    onSuccess: () => {
      toast.success('Family member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      setIsAddMemberOpen(false);
      setMemberForm({
        name: '',
        relationship: 'SON',
        mobile_number: '',
        birth_date: '2005-01-01',
        is_active: true,
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: number) => familyMemberService.deleteMember(familyId, memberId),
    onSuccess: () => {
      toast.success('Family member removed');
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      setMemberToDelete(null);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => customerService.updateCustomer(familyId, profileForm),
    onSuccess: () => {
      toast.success('Household profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer', familyId] });
      setIsEditProfileOpen(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const updateMemberMutation = useMutation({
    mutationFn: () => {
      if (!memberToEdit) throw new Error('No member selected');
      return familyMemberService.updateMember(familyId, memberToEdit.id, editMemberForm);
    },
    onSuccess: () => {
      toast.success('Family member updated!');
      queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      setMemberToEdit(null);
    },
    onError: () => toast.error('Failed to update member'),
  });

  const updateDocMutation = useMutation({
    mutationFn: () => {
      if (!docToEdit) throw new Error('No document selected');
      return documentService.updateDocument(
        familyId,
        docToEdit.family_member,
        docToEdit.id,
        editDocForm
      );
    },
    onSuccess: () => {
      toast.success('Document updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-documents', familyId] });
      setDocToEdit(null);
    },
    onError: () => toast.error('Failed to update document'),
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (data: typeof docForm) => {
      const fd = new FormData();
      fd.append('document_type', data.document_type);
      fd.append('document_name', data.document_name);
      fd.append('description', data.description);
      fd.append('is_verified', String(data.is_verified));
      return documentService.uploadDocument(familyId, data.memberId, fd);
    },
    onSuccess: () => {
      toast.success('Document stored in Citizen Vault!');
      queryClient.invalidateQueries({ queryKey: ['customer-documents', familyId] });
      setIsUploadDocOpen(false);
      setDocForm({
        memberId: 3,
        document_type: 'AADHAR',
        document_name: '',
        description: '',
        is_verified: true,
      });
    },
  });

  const handleToggleVerify = async (docId: number, isVerified: boolean) => {
    try {
      await documentService.updateDocument(familyId, 3, docId, { is_verified: isVerified });
      toast.success(isVerified ? 'Document marked as verified original' : 'Document unverified');
      queryClient.invalidateQueries({ queryKey: ['customer-documents', familyId] });
      if (viewingDoc) {
        setViewingDoc({ ...viewingDoc, is_verified: isVerified });
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (custLoading) {
    return (
      <AppShell allowedRoles={['admin', 'employee']}>
        <div className="p-16 text-center text-slate-400 font-bold">
          Accessing Citizen Vault & Family Ledger...
        </div>
      </AppShell>
    );
  }

  if (!customer) {
    return (
      <AppShell allowedRoles={['admin', 'employee']}>
        <div className="p-16 text-center space-y-3">
          <p className="text-sm font-black text-rose-500">Citizen file not found in system.</p>
          <Button onClick={() => router.back()} variant="outline" size="sm">
            ← Return to Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  const tabItems = [
    { id: 'profile', label: t('household_profile'), icon: User },
    { id: 'applications', label: t('nav_applications'), icon: FileText, count: applications.length },
    { id: 'members', label: t('family_members'), icon: Users, count: members.length },
    { id: 'documents', label: t('document_vault'), icon: FileCheck2, count: documents.length },
    { id: 'visits', label: t('visits'), icon: CalendarCheck, count: visits.length },
    { id: 'transactions', label: t('invoices'), icon: Receipt, count: transactions.length },
    { id: 'reminders', label: t('alerts'), icon: BellRing, count: reminders.length },
  ];

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200 dark:border-brand-800 shadow-xs">
              {customer.family_id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {customer.head_of_family}
            </h1>
            <Badge variant="gold">{t('verified')}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Registered on {customer.registration_date} &bull; {customer.village_city} &bull; Mobile: {customer.mobile_number}
          </p>
        </div>
      </div>

      {/* Quick Highlights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('loyalty_points')}</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{customer.current_points} Pts</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('wallet_balance')}</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">₹{customer.wallet_balance}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('family_members')}</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{members.length || customer.family_member_count}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('visits')}</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{visits.length}</p>
          </div>
        </div>
      </div>

      {/* Reusable Tabs Navigation */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card variant="elevated">
          <CardHeader>
            <div>
              <CardTitle>Citizen Household Master Record</CardTitle>
              <CardDescription>Primary profile and registration information</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={customer.is_active ? 'success' : 'default'}>
                {customer.is_active ? 'Active Household' : 'Inactive'}
              </Badge>
              <Button
                onClick={() => {
                  setProfileForm({
                    head_of_family: customer.head_of_family,
                    mobile_number: customer.mobile_number,
                    whatsapp_number: customer.whatsapp_number,
                    village_city: customer.village_city,
                    birth_date: customer.birth_date,
                    referral_family_id: customer.referral_family_id || '',
                    document_consent: customer.document_consent,
                    is_active: customer.is_active,
                    notes: customer.notes || '',
                  });
                  setIsEditProfileOpen(true);
                }}
                variant="outline"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                {t('edit_profile')}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Head of Household</span>
                  <p className="font-black text-slate-900 dark:text-white text-base mt-0.5">{customer.head_of_family}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary Mobile</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{customer.mobile_number}</p>
                    <WhatsAppButton number={customer.mobile_number} size="xs" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">WhatsApp Contact</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{customer.whatsapp_number}</p>
                    <WhatsAppButton number={customer.whatsapp_number} size="xs" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Birth Date</span>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{customer.birth_date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</span>
                  <p className="font-black text-slate-900 dark:text-white text-base mt-0.5">{customer.village_city}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Referral Token</span>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{customer.referral_family_id || 'Direct Walk-in'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Consent on Record</span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {customer.document_consent ? '✓ Verified Citizen Consent Stamped' : 'Pending Consent'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Desk Notes</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{customer.notes || 'None'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Government Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Government Service Applications
              </h3>
              <p className="text-xs text-slate-400">
                Official government scheme &amp; certificate applications filed for this household.
              </p>
            </div>
            <Button
              onClick={() => setIsIntakeModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              + New Application for Family
            </Button>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Applications Recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This family has not applied for any government services yet. Click above to start a 1-click intake.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card variant="elevated" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                    <tr>
                      <th className="py-3.5 px-4">App No &amp; Date</th>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Service Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Fee</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                        onClick={() => setSelectedAppForDrawer(app)}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {app.application_no}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(app.created_at).toLocaleDateString('gu-IN')}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {app.applicant_name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{app.service_name}</div>
                          {app.service_name_gu && (
                            <div className="text-[11px] text-brand-600 dark:text-brand-400">{app.service_name_gu}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                            {app.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          ₹{app.total_fee}
                        </td>
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedAppForDrawer(app)}
                              className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedAppForReceipt(app)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Family Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Family Tree &amp; Dependents</h3>
              <p className="text-xs text-slate-400">Enrolled beneficiaries for government applications.</p>
            </div>
            <Button
              onClick={() => setIsAddMemberOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Member
            </Button>
          </div>

          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                  <tr>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Relationship</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Birth Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {members.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        {m.name}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="purple">{m.relationship}</Badge>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span>{m.mobile_number}</span>
                          <WhatsAppButton number={m.mobile_number} size="xs" />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {m.birth_date}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setMemberToEdit(m);
                              setEditMemberForm({
                                name: m.name,
                                relationship: m.relationship,
                                mobile_number: m.mobile_number,
                                birth_date: m.birth_date,
                                is_active: m.is_active,
                              });
                            }}
                            className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors"
                            title={t('edit_member')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(m)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                            title="Remove Member"
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

      {/* Tab 3: Document Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Encrypted Digital Vault</h3>
              <p className="text-xs text-slate-400">Secure storage for Aadhar, Voter ID, PAN, Ration, and Certificates.</p>
            </div>
            <Button
              onClick={() => setIsUploadDocOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc: any) => (
              <Card
                key={doc.id}
                variant="elevated"
                className="flex flex-col justify-between group hover:border-brand-500/50 transition-all duration-300 p-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="purple">{doc.document_type_display || doc.document_type}</Badge>
                    {doc.is_verified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {doc.document_name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Owner: {doc.member_name || 'Household Member'}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {doc.created_at?.split('T')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setDocToEdit(doc);
                        setEditDocForm({
                          document_name: doc.document_name,
                          document_type: doc.document_type,
                          description: doc.description || '',
                          is_verified: doc.is_verified,
                        });
                      }}
                      className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title={t('edit_document')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      onClick={() => setViewingDoc(doc)}
                      variant="ghost"
                      size="xs"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview &amp; Verify
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Visits */}
      {activeTab === 'visits' && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                <tr>
                  <th className="py-3.5 px-4">Visit Token</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Beneficiary</th>
                  <th className="py-3.5 px-4">Document Readiness</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {visits.map((v: any) => (
                  <tr key={v.visit_no} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-black text-brand-600">{v.visit_no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{v.service_name}</td>
                    <td className="py-3.5 px-4">{v.family_member_name || v.customer_name}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{v.available_documents || 1}/{v.total_documents || 2} Docs</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={v.status === 'COMPLETED' ? 'success' : 'warning'}>{v.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">{v.visit_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 5: Transactions */}
      {activeTab === 'transactions' && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                <tr>
                  <th className="py-3.5 px-4">Txn Token</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Bill Amount</th>
                  <th className="py-3.5 px-4">Points Credited</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-black text-brand-600">{t.transaction_no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.service_name}</td>
                    <td className="py-3.5 px-4 font-black text-sm text-slate-900 dark:text-white">₹{t.bill_amount}</td>
                    <td className="py-3.5 px-4 text-amber-500 font-black">+{t.points_earned} Pts</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="info">{t.payment_mode}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">{t.transaction_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 6: Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.map((r: any) => (
            <Card key={r.id} variant="elevated" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.priority === 'HIGH' ? 'danger' : 'warning'}>{r.priority}</Badge>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{r.subject}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-gujarati font-semibold">{r.message_template}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-500">Due: {r.due_date}</span>
                <div className="mt-1">
                  <Badge variant={r.follow_up_status === 'DONE' ? 'success' : 'info'}>{r.follow_up_status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Family Dependent"
        description="Enroll a new family member to link citizen document applications."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMemberMutation.mutate(memberForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Full Name *"
            required
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            placeholder="e.g. Priyaben Changani"
          />

          <Select
            label="Relationship *"
            value={memberForm.relationship}
            onChange={(e) => setMemberForm({ ...memberForm, relationship: e.target.value as RelationshipType })}
          >
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>

          <Input
            label="Mobile Number"
            type="tel"
            value={memberForm.mobile_number}
            onChange={(e) => setMemberForm({ ...memberForm, mobile_number: e.target.value })}
            placeholder="Optional 10-digit mobile"
          />

          <Input
            label="Birth Date"
            type="date"
            value={memberForm.birth_date}
            onChange={(e) => setMemberForm({ ...memberForm, birth_date: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddMemberOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addMemberMutation.isPending}
            >
              Add Dependent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Upload Document to Vault"
        description="Upload verified citizen identity card or government certificate."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadDocMutation.mutate(docForm);
          }}
          className="space-y-4"
        >
          <Select
            label="Document Owner *"
            value={docForm.memberId}
            onChange={(e) => setDocForm({ ...docForm, memberId: Number(e.target.value) })}
          >
            {members.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship})
              </option>
            ))}
          </Select>

          <Select
            label="Document Type *"
            value={docForm.document_type}
            onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value as DocumentType })}
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Input
            label="Document Name *"
            required
            value={docForm.document_name}
            onChange={(e) => setDocForm({ ...docForm, document_name: e.target.value })}
            placeholder="e.g. Aadhar Card Front & Back"
          />

          <Input
            label="Description / Notes"
            value={docForm.description}
            onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
            placeholder="e.g. Scanned with original biometrics"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsUploadDocOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={uploadDocMutation.isPending}
            >
              Store in Vault
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => memberToDelete && deleteMemberMutation.mutate(memberToDelete.id)}
        title="Remove Family Member?"
        message={`Are you sure you want to remove ${memberToDelete?.name} (${memberToDelete?.relationship}) from this household?`}
        confirmText="Remove Member"
        variant="danger"
        isLoading={deleteMemberMutation.isPending}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        onToggleVerify={handleToggleVerify}
      />

      {/* Edit Household Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title={t('edit_profile')}
        description="Update citizen household profile details and contact information."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfileMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Head of Family Name *"
            required
            value={profileForm.head_of_family}
            onChange={(e) => setProfileForm({ ...profileForm, head_of_family: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Primary Mobile *"
              required
              type="tel"
              value={profileForm.mobile_number}
              onChange={(e) => setProfileForm({ ...profileForm, mobile_number: e.target.value })}
            />
            <Input
              label="WhatsApp Number"
              type="tel"
              value={profileForm.whatsapp_number}
              onChange={(e) => setProfileForm({ ...profileForm, whatsapp_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Village / City *"
              required
              value={profileForm.village_city}
              onChange={(e) => setProfileForm({ ...profileForm, village_city: e.target.value })}
            />
            <Input
              label="Birth Date *"
              type="date"
              required
              value={profileForm.birth_date}
              onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
            />
          </div>

          <Input
            label="Referral Family ID"
            value={profileForm.referral_family_id}
            onChange={(e) => setProfileForm({ ...profileForm, referral_family_id: e.target.value })}
            placeholder="e.g. HTF-000001"
          />

          <Input
            label="Desk Notes"
            value={profileForm.notes}
            onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
            placeholder="Operational notes on citizen file"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Household Status
            </label>
            <button
              type="button"
              onClick={() => setProfileForm({ ...profileForm, is_active: !profileForm.is_active })}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                profileForm.is_active
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
            >
              {profileForm.is_active ? '✓ Active Citizen Household' : 'Inactive / Archived Household'}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsEditProfileOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={updateProfileMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={!!memberToEdit}
        onClose={() => setMemberToEdit(null)}
        title={`${t('edit_member')} — ${memberToEdit?.name}`}
        description="Update family relation, contact details, or active status."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMemberMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Member Full Name *"
            required
            value={editMemberForm.name}
            onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Relationship to Head *"
              value={editMemberForm.relationship}
              onChange={(e) =>
                setEditMemberForm({ ...editMemberForm, relationship: e.target.value as RelationshipType })
              }
            >
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </Select>

            <Input
              label="Mobile Contact"
              type="tel"
              value={editMemberForm.mobile_number}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, mobile_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Birth *"
              type="date"
              required
              value={editMemberForm.birth_date}
              onChange={(e) => setEditMemberForm({ ...editMemberForm, birth_date: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Member
              </label>
              <button
                type="button"
                onClick={() =>
                  setEditMemberForm({ ...editMemberForm, is_active: !editMemberForm.is_active })
                }
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                  editMemberForm.is_active
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {editMemberForm.is_active ? '✓ Active Dependent' : 'Inactive Dependent'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setMemberToEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMemberMutation.isPending}>
              Save Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Document Details Modal */}
      <Modal
        isOpen={!!docToEdit}
        onClose={() => setDocToEdit(null)}
        title={`${t('edit_document')} — ${docToEdit?.document_name}`}
        description="Update document category, metadata, or verification state."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateDocMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Document Title *"
            required
            value={editDocForm.document_name}
            onChange={(e) => setEditDocForm({ ...editDocForm, document_name: e.target.value })}
          />

          <Select
            label="Document Type *"
            value={editDocForm.document_type}
            onChange={(e) =>
              setEditDocForm({ ...editDocForm, document_type: e.target.value as DocumentType })
            }
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Input
            label="Description / Notes"
            value={editDocForm.description}
            onChange={(e) => setEditDocForm({ ...editDocForm, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Verification Status
            </label>
            <button
              type="button"
              onClick={() =>
                setEditDocForm({ ...editDocForm, is_verified: !editDocForm.is_verified })
              }
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                editDocForm.is_verified
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-300 dark:border-amber-800'
              }`}
            >
              {editDocForm.is_verified ? '✓ Verified Original' : 'Unverified (Awaiting Desk Review)'}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setDocToEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={updateDocMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Universal Service Intake for this Customer */}
      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        initialCustomer={customer}
        onSuccess={(created) => {
          setSelectedAppForReceipt(created);
          queryClient.invalidateQueries({ queryKey: ['customer-applications', familyId] });
        }}
      />

      {/* Inspection Drawer */}
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
