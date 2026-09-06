'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { documentService } from '@/api/services/documentService';
import { applicationService } from '@/api/services/applicationService';
import { auditLogService } from '@/api/services/auditLogService';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Customer,
  FamilyMember,
  BaseService,
  SubService,
  Application,
  CustomerDocument,
  DocumentType,
  ServiceCategory,
  PaymentMode,
} from '@/types';
import { toast } from 'sonner';
import {
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  FileText,
  Sparkles,
  Receipt,
  XCircle,
  FolderTree,
  Coins,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ServiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: Application) => void;
  initialCustomer?: Customer | null;
  initialServiceId?: number | null;
}

const CATEGORIES: { key: ServiceCategory | 'ALL'; labelEn: string; labelGu: string }[] = [
  { key: 'ALL', labelEn: 'All Services (45)', labelGu: 'બધી સેવાઓ (45)' },
  { key: 'GOVT_FORMS', labelEn: 'Govt Schemes & Forms (15)', labelGu: 'સરકારી યોજનાઓ (15)' },
  { key: 'CARD_SERVICES', labelEn: 'Card Updates & KYC (7)', labelGu: 'કાર્ડ સુધારા (7)' },
  { key: 'NEW_SERVICES', labelEn: 'New Cards & Docs (6)', labelGu: 'નવા કાર્ડ (6)' },
  { key: 'OTHER_SERVICES', labelEn: 'Desk & Printing (7)', labelGu: 'અન્ય સેવાઓ (7)' },
  { key: 'COMPUTER_COURSES', labelEn: 'Computer Courses (6)', labelGu: 'કોમ્પ્યુટર કોર્સ (6)' },
  { key: 'ADDITIONAL_SERVICES', labelEn: 'Online & Utility (4)', labelGu: 'ઓનલાઇન સેવાઓ (4)' },
];

export const ServiceIntakeModal: React.FC<ServiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer = null,
  initialServiceId = null,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Wizard Step: 1 = Citizen, 2 = Applicant, 3 = Service, 4 = Vault Check, 5 = Form & Payment
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer);
  const [selectedApplicant, setSelectedApplicant] = useState<{
    id: number | string;
    name: string;
    relationship: string;
    mobile: string;
    isHead: boolean;
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'ALL'>('ALL');
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<BaseService | null>(null);
  const [selectedSubService, setSelectedSubService] = useState<SubService | null>(null);

  // Citizen Search
  const [citizenQuery, setCitizenQuery] = useState('');

  // Missing Doc Quick Upload File
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Form & Payment Details
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [operatorNotes, setOperatorNotes] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [govtFee, setGovtFee] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(50);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('PAID');
  const [sendSms, setSendSms] = useState(true);

  // Quick Register Citizen Form Toggle
  const [isQuickRegister, setIsQuickRegister] = useState(false);
  const [quickCitizen, setQuickCitizen] = useState({
    head_of_family: '',
    mobile_number: '',
    whatsapp_number: '',
    village_city: 'Varna',
  });

  // Queries
  const { data: customers = [] } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customerService.getCustomers(),
    enabled: isOpen,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
    enabled: isOpen,
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members', selectedCustomer?.family_id],
    queryFn: () =>
      selectedCustomer ? familyMemberService.getMembers(selectedCustomer.family_id) : Promise.resolve([]),
    enabled: !!selectedCustomer && isOpen,
  });

  const { data: customerDocs = [], refetch: refetchDocs } = useQuery({
    queryKey: ['vault-documents', selectedCustomer?.family_id, selectedApplicant?.id],
    queryFn: () => {
      if (!selectedCustomer) return Promise.resolve([]);
      return documentService.getDocuments(selectedCustomer.family_id, selectedApplicant?.id || 'head');
    },
    enabled: !!selectedCustomer && isOpen,
  });

  // Initialize from props
  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
      setSelectedApplicant({
        id: initialCustomer.id,
        name: initialCustomer.head_of_family,
        relationship: 'Head of Family',
        mobile: initialCustomer.mobile_number,
        isHead: true,
      });
      setStep(initialServiceId ? 4 : 3);
    }
  }, [initialCustomer, initialServiceId]);

  useEffect(() => {
    if (initialServiceId && services.length > 0) {
      const found = services.find((s) => s.id === initialServiceId);
      if (found) {
        setSelectedService(found);
        setGovtFee(found.GovernmentFee ?? 0);
        setServiceCharge(found.ServiceCharge ?? 50);
      }
    }
  }, [initialServiceId, services]);

  // Update fees when service changes
  const handleSelectService = (s: BaseService) => {
    setSelectedService(s);
    setGovtFee(s.GovernmentFee ?? 0);
    setServiceCharge(s.ServiceCharge ?? 50);
    const subs = s.SubServices || s.sub_services || [];
    if (subs.length > 0) {
      setSelectedSubService(subs[0]);
    } else {
      setSelectedSubService(null);
    }
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!citizenQuery.trim()) return customers.slice(0, 8);
    const q = citizenQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.head_of_family.toLowerCase().includes(q) ||
        c.mobile_number.includes(q) ||
        c.family_id.toLowerCase().includes(q) ||
        c.village_city.toLowerCase().includes(q)
    );
  }, [customers, citizenQuery]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = selectedCategory === 'ALL' || s.Category === selectedCategory;
      const q = serviceSearch.toLowerCase();
      const matchesQuery =
        !q ||
        s.ServiceName.toLowerCase().includes(q) ||
        (s.ServiceNameGu && s.ServiceNameGu.includes(q)) ||
        (s.Description && s.Description.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [services, selectedCategory, serviceSearch]);

  // Vault Requirement Status Checking
  const vaultCheckList = useMemo(() => {
    if (!selectedService) return [];
    const reqDocs = [
      ...(selectedService.required_documents || []),
      ...((selectedService.SubServices || selectedService.sub_services || []).flatMap(
        (sub) => sub.RequiredDocuments || []
      )),
    ];
    const uniqueReqs: typeof reqDocs = [];
    const seen = new Set<string>();
    for (const r of reqDocs) {
      const key = `${r.document_type}_${r.DocumentName}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReqs.push(r);
      }
    }
    return uniqueReqs.map((req) => {
      // Check if doc exists in customerDocs
      const found = customerDocs.find(
        (cd) =>
          cd.document_type === req.document_type ||
          cd.document_name.toLowerCase().includes(req.DocumentName.toLowerCase())
      );
      return {
        ...req,
        vaultDoc: found || null,
        isAvailable: !!found,
        isVerified: !!found?.is_verified,
      };
    });
  }, [selectedService, customerDocs]);

  const allDocsReady = useMemo(() => {
    if (vaultCheckList.length === 0) return true;
    return vaultCheckList.every((d) => !d.IsRequired || d.isAvailable);
  }, [vaultCheckList]);

  // Inline Document Upload to Digital Vault
  const handleInlineVaultUpload = async (docType: string, docName: string) => {
    if (!selectedCustomer || !uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document_file', uploadFile);
      formData.append('document_type', docType);
      formData.append('document_name', docName);
      formData.append('family_id', selectedCustomer.family_id);
      formData.append('is_verified', 'true');

      await documentService.uploadDocument(
        selectedCustomer.family_id,
        selectedApplicant?.id || 'head',
        formData
      );

      toast.success(`${docName} uploaded to Digital Vault successfully!`);
      setUploadingDocType(null);
      setUploadFile(null);
      refetchDocs();
    } catch {
      toast.error('Failed to upload document');
    }
  };

  // Quick Register Mutation
  const quickRegisterMutation = useMutation({
    mutationFn: () =>
      customerService.createCustomer({
        head_of_family: quickCitizen.head_of_family,
        mobile_number: quickCitizen.mobile_number,
        whatsapp_number: quickCitizen.whatsapp_number || quickCitizen.mobile_number,
        village_city: quickCitizen.village_city,
        family_member_count: 1,
        document_consent: true,
      }),
    onSuccess: (newCust) => {
      toast.success('Citizen registered successfully');
      queryClient.invalidateQueries({ queryKey: ['customers-list'] });
      setSelectedCustomer(newCust);
      setSelectedApplicant({
        id: newCust.id,
        name: newCust.head_of_family,
        relationship: 'Head of Family',
        mobile: newCust.mobile_number,
        isHead: true,
      });
      setIsQuickRegister(false);
      setStep(3);
    },
    onError: () => {
      toast.error('Error registering citizen');
    },
  });

  // Create Application Mutation
  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer || !selectedService || !selectedApplicant) {
        throw new Error('Missing required application details');
      }

      const totalAmount = Number(govtFee) + Number(serviceCharge);
      const days = selectedService.SlaDays || 5;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + days);

      const payload: Partial<Application> = {
        customer: selectedCustomer.id,
        customer_name: selectedCustomer.head_of_family,
        customer_mobile: selectedCustomer.mobile_number,
        customer_family_id: selectedCustomer.family_id,
        applicant_member_id: selectedApplicant.isHead ? undefined : Number(selectedApplicant.id),
        applicant_name: selectedApplicant.name,
        applicant_mobile: selectedApplicant.mobile,
        family_member: selectedApplicant.isHead ? null : Number(selectedApplicant.id),
        family_member_name: selectedApplicant.isHead ? null : selectedApplicant.name,
        service: selectedService.id,
        service_name: selectedService.ServiceName,
        service_name_gu: selectedService.ServiceNameGu || selectedService.ServiceName,
        sub_service: selectedSubService ? selectedSubService.id : undefined,
        sub_service_name: selectedSubService ? selectedSubService.SubServiceName : undefined,
        category: selectedService.Category || 'GOVT_FORMS',
        status: allDocsReady ? 'SCRUTINY' : 'DOCS_PENDING',
        priority,
        govt_fee: Number(govtFee),
        service_charge: Number(serviceCharge),
        total_fee: totalAmount,
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        sla_days: days,
        expected_date: expectedDate.toISOString().split('T')[0],
        assigned_staff: (user as any)?.id || 1,
        assigned_staff_name: (user as any)?.username || (user as any)?.full_name || 'Admin Manager',
        created_by: (user as any)?.id || 1,
        created_by_name: (user as any)?.username || (user as any)?.full_name || 'Admin Manager',
        documents: vaultCheckList.map((req) => ({
          id: req.id,
          document_name: req.DocumentName,
          document_type: req.document_type,
          status: req.isVerified ? 'VERIFIED' : req.isAvailable ? 'AVAILABLE' : 'NOT_AVAILABLE',
          file_url: req.vaultDoc?.document_file,
        })),
        form_data: {
          ...dynamicAnswers,
          citizen_village: selectedCustomer.village_city,
          relationship: selectedApplicant.relationship,
        },
        notes: operatorNotes,
      };

      const result = await applicationService.createApplication(payload);

      // Record Audit Log
      await auditLogService.logAction(
        'APPLICATION_CREATED',
        'Application',
        result.application_no,
        `Intake application for ${selectedApplicant.name} - ${selectedService.ServiceName}`
      );

      return result;
    },
    onSuccess: (createdApp) => {
      toast.success(
        language === 'gu'
          ? `અરજી સફળતાપૂર્વક નોંધાઈ ગઈ: ${createdApp.application_no}`
          : `Application registered successfully: ${createdApp.application_no}`
      );
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      onSuccess?.(createdApp);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit application');
    },
  });

  const resetAll = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedApplicant(null);
    setSelectedService(null);
    setSelectedSubService(null);
    setDynamicAnswers({});
    setOperatorNotes('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        language === 'gu'
          ? 'સરકારી સેવા નોંધણી પોર્ટલ (Service Intake)'
          : 'Government Service Intake Hub'
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Stepper */}
        <div className="relative flex items-center justify-between px-2 sm:px-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 w-full z-0" />
          {[
            { num: 1, label: t('intake_step_citizen') },
            { num: 2, label: t('intake_step_applicant') },
            { num: 3, label: t('intake_step_service') },
            { num: 4, label: t('intake_step_docs') },
            { num: 5, label: t('intake_step_payment') },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center group">
                <button
                  onClick={() => {
                    if (isDone) setStep(s.num);
                  }}
                  disabled={!isDone && !isCurrent}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isDone
                      ? 'bg-emerald-500 text-white hover:scale-105'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </button>
                <span
                  className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                    isCurrent
                      ? 'text-brand-600 dark:text-brand-400 font-extrabold'
                      : isDone
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CITIZEN SEARCH & QUICK REGISTRATION */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  1. {t('step_citizen')}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'gu'
                    ? 'નાગરિક અથવા કુટુંબના વડાને શોધો અથવા નવો નાગરિક નોંધો'
                    : 'Search head of family by name, mobile, family ID, or register new citizen'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickRegister(!isQuickRegister)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isQuickRegister ? 'Back to Search' : '+ Quick Register Citizen'}</span>
              </button>
            </div>

            {isQuickRegister ? (
              <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-4">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Citizen Onboarding</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Head of Family Full Name"
                    placeholder="e.g. Ramesh Patel"
                    value={quickCitizen.head_of_family}
                    onChange={(e) => setQuickCitizen({ ...quickCitizen, head_of_family: e.target.value })}
                    required
                  />
                  <Input
                    label="Mobile Number (10 Digits)"
                    placeholder="e.g. 9876543210"
                    value={quickCitizen.mobile_number}
                    onChange={(e) => setQuickCitizen({ ...quickCitizen, mobile_number: e.target.value })}
                    maxLength={10}
                    required
                  />
                  <Input
                    label="WhatsApp Number"
                    placeholder="e.g. 9876543210"
                    value={quickCitizen.whatsapp_number}
                    onChange={(e) => setQuickCitizen({ ...quickCitizen, whatsapp_number: e.target.value })}
                    maxLength={10}
                  />
                  <Input
                    label="Village / City"
                    placeholder="e.g. Varna"
                    value={quickCitizen.village_city}
                    onChange={(e) => setQuickCitizen({ ...quickCitizen, village_city: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsQuickRegister(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => quickRegisterMutation.mutate()}
                    isLoading={quickRegisterMutation.isPending}
                    disabled={!quickCitizen.head_of_family || !quickCitizen.mobile_number}
                  >
                    Save & Continue
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={citizenQuery}
                    onChange={(e) => setCitizenQuery(e.target.value)}
                    placeholder="Search by Citizen Name, Mobile, Family ID (e.g. HTF-000002), or Village..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredCustomers.map((cust) => {
                    const isSel = selectedCustomer?.id === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setSelectedApplicant({
                            id: cust.id,
                            name: cust.head_of_family,
                            relationship: 'Head of Family',
                            mobile: cust.mobile_number,
                            isHead: true,
                          });
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSel
                            ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-500 ring-2 ring-brand-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {cust.head_of_family[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {cust.head_of_family}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {cust.family_id} &bull; {cust.mobile_number}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {cust.village_city || 'Varna'} &bull; {cust.family_member_count || 1} Members
                            </div>
                          </div>
                        </div>

                        {isSel && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedCustomer}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Select Applicant &rarr;
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: APPLICANT SELECTION (HEAD OR FAMILY MEMBER) */}
        {/* ========================================================================= */}
        {step === 2 && selectedCustomer && (
          <div className="space-y-4 animate-fade-in">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                2. {t('step_applicant')}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'gu'
                  ? 'આ સરકારી સેવા કોના નામે કરવાની છે તે પસંદ કરો'
                  : 'Specify who is this government application for (Head or Family Member)'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Head of Family */}
              <div
                onClick={() =>
                  setSelectedApplicant({
                    id: selectedCustomer.id,
                    name: selectedCustomer.head_of_family,
                    relationship: 'Head of Family',
                    mobile: selectedCustomer.mobile_number,
                    isHead: true,
                  })
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedApplicant?.isHead
                    ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {selectedCustomer.head_of_family}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-600">
                        Head
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{selectedCustomer.mobile_number}</div>
                  </div>
                </div>

                {selectedApplicant?.isHead && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
              </div>

              {/* Dependents / Family Members */}
              {familyMembers.map((m) => {
                const isSel = !selectedApplicant?.isHead && selectedApplicant?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() =>
                      setSelectedApplicant({
                        id: m.id,
                        name: m.member_name,
                        relationship: m.relationship || 'Dependent',
                        mobile: m.mobile_number || selectedCustomer.mobile_number,
                        isHead: false,
                      })
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSel
                        ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {m.member_name[0]}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {m.member_name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {m.relationship}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {m.mobile_number || 'Family Mobile'} &bull; Age: {m.age || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {isSel && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedApplicant}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Choose Government Service &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: 45 GOVERNMENT SERVICES VISUAL CATALOG */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  3. {t('step_service')} (45 Services)
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'gu'
                    ? 'સત્તાવાર 45 સરકારી સેવાઓમાંથી યોગ્ય સેવા પસંદ કરો'
                    : 'Select from the 45 official government services across 6 categories'}
                </p>
              </div>

              {selectedService && (
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    Selected: {selectedService.ServiceName}
                  </span>
                </div>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {language === 'gu' ? cat.labelGu : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search service by English name, Gujarati (દા.ત. આવકનો દાખલો, 7/12, PM કિસાન)..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredServices.map((srv) => {
                const isSel = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleSelectService(srv)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSel
                        ? 'bg-brand-50/90 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {srv.ServiceName}
                        </span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />}
                      </div>
                      {srv.ServiceNameGu && (
                        <div className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
                          {srv.ServiceNameGu}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-slate-500 font-mono">
                        <span>Govt: ₹{srv.GovernmentFee ?? 0}</span>
                        <span>+ Desk: ₹{srv.ServiceCharge ?? 50}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {srv.SlaDays || 3}d SLA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-Service Option if present */}
            {((selectedService?.SubServices || selectedService?.sub_services || []).length > 0) && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Select Specific Sub-Service / Option:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedService?.SubServices || selectedService?.sub_services || []).map((sub) => {
                    const isSubSel = selectedSubService?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubService(sub)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSubSel
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sub.SubServiceName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!selectedService}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Vault Document Check &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SMART DIGITAL VAULT REQUIREMENT CHECK & INLINE UPLOAD */}
        {/* ========================================================================= */}
        {step === 4 && selectedService && selectedCustomer && (
          <div className="space-y-4 animate-fade-in">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    4. {t('step_vault')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'gu'
                      ? 'ડિજિટલ વૉલ્ટમાંથી જરૂરી પુરાવાઓની આપોઆપ ચકાસણી'
                      : 'Automatic requirement check against citizen’s Digital Vault'}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>Vault: {selectedCustomer.family_id}</span>
                </div>
              </div>
            </div>

            {vaultCheckList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  No mandatory documents configured for this service. You can proceed directly to form details.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {vaultCheckList.map((docItem) => {
                  const isUploading = uploadingDocType === docItem.document_type;

                  return (
                    <div
                      key={docItem.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        docItem.isAvailable
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-300/80 dark:border-emerald-800/60'
                          : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              docItem.isAvailable
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {docItem.isAvailable ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {docItem.DocumentName}
                              </span>
                              {docItem.IsRequired && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Type: {docItem.document_type}
                            </div>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex items-center gap-2">
                          {docItem.isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              <Check className="w-3.5 h-3.5" />
                              <span>In Digital Vault</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                Missing
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setUploadingDocType(isUploading ? null : docItem.document_type)
                                }
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xs transition-all"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isUploading ? 'Cancel' : 'Upload to Vault'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline Upload Drawer */}
                      {isUploading && (
                        <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
                          <input
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-500 text-slate-500"
                          />
                          <Button
                            size="sm"
                            disabled={!uploadFile}
                            onClick={() => handleInlineVaultUpload(docItem.document_type, docItem.DocumentName)}
                          >
                            Save Document to Vault
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!allDocsReady && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                Notice: Missing documents will set application status to <strong>&quot;Documents Pending&quot;</strong> until collected from citizen.
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setStep(5)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Application Form & Payment &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: APPLICATION FORM, PAYMENT & FINAL INTAKE */}
        {/* ========================================================================= */}
        {step === 5 && selectedService && selectedCustomer && selectedApplicant && (
          <div className="space-y-4 animate-fade-in">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                5. {t('step_payment')} & Final Submission
              </h3>
              <p className="text-xs text-slate-500">
                Review applicant profile, enter any service details, record fee, and submit.
              </p>
            </div>

            {/* Applicant Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedApplicant.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Family ID</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {selectedCustomer.family_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Service</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedService.ServiceName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SLA Expected</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {selectedService.SlaDays || 3} Working Days
                </span>
              </div>
            </div>

            {/* Optional Service Dynamic Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Government Portal / App Ref (Optional)"
                  placeholder="e.g. GJ-SARATHI-9941 / Digital Gujarat Ref"
                  value={dynamicAnswers['govt_ref'] || ''}
                  onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, govt_ref: e.target.value })}
                />
                <Select
                  label="Priority Level"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  options={[
                    { label: 'સામાન્ય / Normal Priority', value: 'NORMAL' },
                    { label: 'ઉચ્ચ પ્રાથમિકતા / High Priority (Govt Deadline)', value: 'HIGH' },
                    { label: 'તાત્કાલિક / Emergency Expedited (Tatkal)', value: 'URGENT' },
                  ]}
                />
              </div>

              <Textarea
                label="Staff / Operator Notes"
                placeholder="Specific citizen requests, photo/biometric captured status, etc."
                rows={2}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
              />
            </div>

            {/* Fee & Payment Section */}
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wide">
                  <Receipt className="w-4 h-4" />
                  <span>Fee Collection & Payment Receipt</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 mr-2">Total Payable:</span>
                  <span className="text-base font-black text-brand-600 dark:text-brand-400 font-mono">
                    ₹{(Number(govtFee) + Number(serviceCharge)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Govt Portal Fee (₹)"
                  type="number"
                  value={govtFee}
                  onChange={(e) => setGovtFee(Number(e.target.value))}
                />
                <Input
                  label="HY-TECH Service Charge (₹)"
                  type="number"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(Number(e.target.value))}
                />
                <Select
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  options={[
                    { label: 'રોકડ / Cash at Desk', value: 'CASH' },
                    { label: 'UPI / QR (GPay, PhonePe, Paytm)', value: 'UPI' },
                    { label: 'વોલેટ બેલેન્સ / Wallet Debit', value: 'WALLET' },
                    { label: 'બેંક ટ્રાન્સફર / Bank Transfer', value: 'BANK_TRANSFER' },
                  ]}
                />
                <Select
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  options={[
                    { label: 'Fully Paid (ચુકવાઈ ગયું)', value: 'PAID' },
                    { label: 'Partial Advance', value: 'PARTIAL' },
                    { label: 'Pay Later / Delivery', value: 'UNPAID' },
                  ]}
                />
              </div>

              {/* SMS Notification Pill */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Dispatch confirmation SMS to citizen in Gujarati</span>
                </label>

                <span className="text-[11px] text-slate-400 font-mono">
                  To: {selectedApplicant.mobile || selectedCustomer.mobile_number}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setStep(4)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                onClick={() => createApplicationMutation.mutate()}
                isLoading={createApplicationMutation.isPending}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Submit Application & Generate Receipt
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
