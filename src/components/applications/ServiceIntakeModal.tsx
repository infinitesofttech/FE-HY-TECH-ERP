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
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
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
  ChevronDown,
  RefreshCw,
  Edit2,
} from 'lucide-react';

interface ServiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: Application) => void;
  initialCustomer?: Customer | null;
  initialServiceId?: number | null;
}

const CATEGORIES: { key: ServiceCategory | 'ALL'; labelEn: string; labelGu: string }[] = [
  { key: 'ALL', labelEn: 'All Services', labelGu: 'બધી સેવાઓ' },
  { key: 'GOVT_FORMS', labelEn: 'Govt Schemes (15)', labelGu: 'સરકારી યોજનાઓ' },
  { key: 'CARD_SERVICES', labelEn: 'Card Updates (7)', labelGu: 'કાર્ડ સુધારા' },
  { key: 'NEW_SERVICES', labelEn: 'New Cards (6)', labelGu: 'નવા કાર્ડ' },
  { key: 'OTHER_SERVICES', labelEn: 'Desk & Print (7)', labelGu: 'અન્ય સેવાઓ' },
  { key: 'COMPUTER_COURSES', labelEn: 'Computer (6)', labelGu: 'કોમ્પ્યુટર' },
  { key: 'ADDITIONAL_SERVICES', labelEn: 'Utility (4)', labelGu: 'ઓનલાઇન' },
];

export const ServiceIntakeModal: React.FC<ServiceIntakeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer = null,
  initialServiceId = null,
}) => {
  const { t, language } = useLanguage();
  const isGu = language === 'gu';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Selections
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer);
  const [isChangingCustomer, setIsChangingCustomer] = useState(false);
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

  // Search
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
  const [formMode, setFormMode] = useState<'simple' | 'detailed'>('simple');
  const [govtAppNo, setGovtAppNo] = useState('');

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
    }
  }, [initialCustomer]);

  useEffect(() => {
    if (initialServiceId && services.length > 0) {
      const found = services.find((s) => s.id === initialServiceId);
      if (found) {
        setSelectedService(found);
        setGovtFee(found.GovernmentFee ?? 0);
        setServiceCharge(found.ServiceCharge ?? 50);
        const subs = found.SubServices || found.sub_services || [];
        if (subs.length > 0) setSelectedSubService(subs[0]);
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
    if (!citizenQuery.trim()) return customers.slice(0, 6);
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

  // Inline Document Upload
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
    onSuccess: (res: any) => {
      const newCust = res.data || res;
      toast.success('Citizen / Family registered successfully');
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
      setIsChangingCustomer(false);
    },
    onError: () => {
      toast.error('Error registering citizen');
    },
  });

  // Dropdown Select Options & Handlers for Simple Form
  const customerSelectOptions = useMemo(() => {
    return customers.map((c) => ({
      value: String(c.id),
      label: `${c.head_of_family} (${c.family_id})`,
      sublabel: `📱 ${c.mobile_number} • 📍 ${c.village_city || 'Varna'}`,
    }));
  }, [customers]);

  const applicantSelectOptions = useMemo(() => {
    if (!selectedCustomer) return [];
    const options = [
      {
        value: 'head',
        label: `${selectedCustomer.head_of_family} (મુખી / Head of Family)`,
        sublabel: `📱 ${selectedCustomer.mobile_number} • 👤 Head of Family`,
      },
    ];
    familyMembers.forEach((m) => {
      options.push({
        value: String(m.id),
        label: `${m.full_name} (${m.relationship_to_head || 'સભ્ય / Member'})`,
        sublabel: `📱 ${m.mobile_number || selectedCustomer.mobile_number} • 🎂 ${m.dob || 'DOB N/A'}`,
      });
    });
    return options;
  }, [selectedCustomer, familyMembers]);

  const serviceSelectOptions = useMemo(() => {
    return services.map((s) => ({
      value: String(s.id),
      label: `${s.ServiceName} ${s.ServiceNameGu ? `(${s.ServiceNameGu})` : ''}`,
      sublabel: `₹${(s.GovernmentFee || 0) + (s.ServiceCharge || 50)} • ${s.Category || 'General'}`,
    }));
  }, [services]);

  const subServiceSelectOptions = useMemo(() => {
    if (!selectedService) return [];
    const subs = selectedService.SubServices || selectedService.sub_services || [];
    return subs.map((sub) => ({
      value: String(sub.id),
      label: sub.SubServiceName,
      sublabel: sub.Description || 'General Sub-Service Option',
    }));
  }, [selectedService]);

  const handleCustomerDropdownChange = (customerId: string) => {
    const cust = customers.find((c) => String(c.id) === customerId);
    if (cust) {
      setSelectedCustomer(cust);
      setSelectedApplicant({
        id: cust.id,
        name: cust.head_of_family,
        relationship: 'Head of Family',
        mobile: cust.mobile_number,
        isHead: true,
      });
    } else {
      setSelectedCustomer(null);
      setSelectedApplicant(null);
    }
  };

  const handleApplicantDropdownChange = (applicantVal: string) => {
    if (!selectedCustomer) return;
    if (applicantVal === 'head') {
      setSelectedApplicant({
        id: selectedCustomer.id,
        name: selectedCustomer.head_of_family,
        relationship: 'Head of Family',
        mobile: selectedCustomer.mobile_number,
        isHead: true,
      });
    } else {
      const member = familyMembers.find((m) => String(m.id) === applicantVal);
      if (member) {
        setSelectedApplicant({
          id: member.id,
          name: member.full_name,
          relationship: member.relationship_to_head || 'Member',
          mobile: member.mobile_number || selectedCustomer.mobile_number,
          isHead: false,
        });
      }
    }
  };

  const handleServiceDropdownChange = (serviceId: string) => {
    const svc = services.find((s) => String(s.id) === serviceId);
    if (svc) {
      handleSelectService(svc);
    } else {
      setSelectedService(null);
      setSelectedSubService(null);
    }
  };

  const handleSubServiceDropdownChange = (subId: string) => {
    if (!selectedService) return;
    const subs = selectedService.SubServices || selectedService.sub_services || [];
    const sub = subs.find((s) => String(s.id) === subId);
    if (sub) {
      setSelectedSubService(sub);
      if ((sub as any).GovernmentFee !== undefined) setGovtFee((sub as any).GovernmentFee);
      if ((sub as any).ServiceCharge !== undefined) setServiceCharge((sub as any).ServiceCharge);
    }
  };

  // Create Application Mutation
  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer) {
        throw new Error('Please select a Citizen / Family in Section 1');
      }
      if (!selectedApplicant) {
        throw new Error('Please select an Applicant in Section 2');
      }
      if (!selectedService) {
        throw new Error('Please select a Service in Section 3');
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
        government_app_no: govtAppNo || undefined,
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
        assigned_staff_name: (user as any)?.username || (user as any)?.full_name || 'Front Desk Staff',
        created_by: (user as any)?.id || 1,
        created_by_name: (user as any)?.username || (user as any)?.full_name || 'Admin',
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess?.(createdApp);
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit application');
    },
  });

  const resetAll = () => {
    setSelectedCustomer(null);
    setSelectedApplicant(null);
    setSelectedService(null);
    setSelectedSubService(null);
    setDynamicAnswers({});
    setOperatorNotes('');
    setIsQuickRegister(false);
    setIsChangingCustomer(false);
    setGovtAppNo('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const totalFeeAmount = Number(govtFee) + Number(serviceCharge);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        formMode === 'simple'
          ? (isGu ? 'સરકારી સેવા અરજી નોંધણી' : 'Government Service Intake')
          : (isGu ? 'સરકારી સેવા નોંધણી પોર્ટલ' : 'Government Service Intake Hub')
      }
      description={
        formMode === 'simple'
          ? (isGu ? 'સરળ ડ્રોપડાઉન પસંદગી સાથે ઝડપી અરજી નોંધણી ફોર્મ.' : 'Fast & easy service intake using clean dropdown selectors.')
          : (isGu ? 'ઝડપી ફ્રન્ટ-ડેસ્ક પ્રોસેસિંગ માટે તમામ પગલાં એક જ પેજ પર ઉપલબ્ધ છે.' : 'All steps consolidated in a single page for rapid front-desk processing.')
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[76vh] overflow-y-auto pr-1 pb-4">
        {/* Form Mode Switcher Pill */}
        <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setFormMode('simple')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              formMode === 'simple'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ {isGu ? 'ઝડપી ફોર્મ' : 'Simple Form'}</span>
          </button>
          <button
            type="button"
            onClick={() => setFormMode('detailed')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              formMode === 'detailed'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>📋 {isGu ? 'વિગતવાર ફોર્મ' : 'Detailed Flow'}</span>
          </button>
        </div>

        {formMode === 'simple' ? (
          /* ========================================================================= */
          /* SIMPLE FORM MODE (CLEAN DROPDOWNS)                                        */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Field 1: Citizen / Family Dropdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {isGu ? '૧. પરિવાર / નાગરિક પસંદ કરો' : '1. Select Citizen / Family'} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickRegister(!isQuickRegister)}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isQuickRegister ? (isGu ? 'યાદીમાંથી પસંદ કરો' : 'Dropdown List') : (isGu ? '+ નવો નાગરિક નોંધો' : '+ Register New Citizen')}</span>
                </button>
              </div>

              {isQuickRegister ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isGu ? 'નવા નાગરિકની ઝડપી નોંધણી:' : 'Quick Citizen Registration:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      label={isGu ? 'પરિવારના વડાનું નામ' : 'Head of Family Name'}
                      placeholder={isGu ? 'દા.ત. રમેશભાઈ પટેલ' : 'e.g. Ramesh Patel'}
                      value={quickCitizen.head_of_family}
                      onChange={(e) => setQuickCitizen({ ...quickCitizen, head_of_family: e.target.value })}
                    />
                    <Input
                      label={isGu ? 'મોબાઇલ નંબર' : 'Mobile Number'}
                      placeholder={isGu ? '૧૦ અંકનો મોબાઇલ નંબર' : '10-digit mobile number'}
                      value={quickCitizen.mobile_number}
                      onChange={(e) => setQuickCitizen({ ...quickCitizen, mobile_number: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setIsQuickRegister(false)}>
                      {isGu ? 'રદ કરો' : 'Cancel'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => quickRegisterMutation.mutate()}
                      isLoading={quickRegisterMutation.isPending}
                      disabled={!quickCitizen.head_of_family || !quickCitizen.mobile_number}
                      className="bg-brand-600 text-white font-bold"
                    >
                      {isGu ? 'સાચવો અને પસંદ કરો' : 'Save & Select'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  searchable
                  placeholder={isGu ? '-- પરિવાર / નાગરિક પસંદ કરો --' : '-- Select Citizen / Family --'}
                  options={customerSelectOptions}
                  value={selectedCustomer ? String(selectedCustomer.id) : ''}
                  onChange={(e) => handleCustomerDropdownChange(e.target.value)}
                />
              )}

              {selectedCustomer && !isQuickRegister && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      {selectedCustomer.head_of_family}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                      ({selectedCustomer.family_id})
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                      • 📱 {selectedCustomer.mobile_number}
                    </span>
                  </div>
                  <Badge variant="success">પસંદ કરેલ</Badge>
                </div>
              )}
            </div>

            {/* Field 2: Applicant / Member Dropdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isGu ? '૨. અરજદાર / સભ્ય પસંદ કરો' : '2. Select Applicant Member'} <span className="text-rose-500">*</span>
              </label>
              <Select
                placeholder={selectedCustomer ? (isGu ? '-- અરજદાર સભ્ય પસંદ કરો --' : '-- Select Applicant Member --') : (isGu ? 'પહેલા ઉપરથી પરિવાર પસંદ કરો...' : 'Select family first...')}
                disabled={!selectedCustomer}
                options={applicantSelectOptions}
                value={selectedApplicant?.isHead ? 'head' : selectedApplicant ? String(selectedApplicant.id) : ''}
                onChange={(e) => handleApplicantDropdownChange(e.target.value)}
              />
              {selectedApplicant && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-blue-900 dark:text-blue-200">
                      {selectedApplicant.name}
                    </span>
                    <Badge variant="info">{selectedApplicant.relationship}</Badge>
                    <span className="text-blue-600 dark:text-blue-400 hidden sm:inline">
                      • 📱 {selectedApplicant.mobile}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Field 3: Service Selection Dropdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                  {isGu ? '૩. સરકારી સેવા પસંદ કરો' : '3. Select Government Service'} <span className="text-rose-500">*</span>
                </label>
                <Select
                  searchable
                  placeholder={isGu ? '-- સરકારી સેવા પસંદ કરો --' : '-- Select Government Service --'}
                  options={serviceSelectOptions}
                  value={selectedService ? String(selectedService.id) : ''}
                  onChange={(e) => handleServiceDropdownChange(e.target.value)}
                />
              </div>

              {/* Sub-Service Dropdown if exists */}
              {subServiceSelectOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {isGu ? 'સબ-સર્વિસ / સેવા વિકલ્પ' : 'Sub-Service Option'}
                  </label>
                  <Select
                    placeholder={isGu ? '-- સબ-સર્વિસ વિકલ્પ પસંદ કરો --' : '-- Select Sub-Service Option --'}
                    options={subServiceSelectOptions}
                    value={selectedSubService ? String(selectedSubService.id) : ''}
                    onChange={(e) => handleSubServiceDropdownChange(e.target.value)}
                  />
                </div>
              )}

              {selectedService && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isGu ? (selectedService.ServiceNameGu || selectedService.ServiceName) : selectedService.ServiceName}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isGu ? `SLA સમયગાળો: ${selectedService.SlaDays || 5} દિવસ` : `SLA Timeline: ${selectedService.SlaDays || 5} Days`} &bull; {isGu ? `કેટેગરી: ${selectedService.Category}` : `Category: ${selectedService.Category}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px]">{isGu ? 'કુલ સેવા ફી:' : 'Total Service Fee:'}</span>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ₹{totalFeeAmount}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Field 4: Govt Token / Application No. & Priority (2-col) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <Input
                label={isGu ? 'સરકારી અરજી / ટોકન નંબર (જો હોય તો)' : 'Government Application / Token No (Optional)'}
                placeholder={isGu ? 'દા.ત. PMK-GUJ-2026-98124' : 'e.g. PMK-GUJ-2026-98124'}
                value={govtAppNo}
                onChange={(e) => setGovtAppNo(e.target.value)}
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {isGu ? 'અગ્રતા' : 'Priority'}
                </label>
                <Select
                  options={[
                    { value: 'NORMAL', label: isGu ? 'સામાન્ય' : 'Normal' },
                    { value: 'HIGH', label: isGu ? 'ઝડપી' : 'High Priority' },
                    { value: 'URGENT', label: isGu ? 'તાત્કાલિક' : 'Urgent / Tatkal' },
                  ]}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                />
              </div>
            </div>

            {/* Field 5: Smart Document Checklist Badges */}
            {selectedService && vaultCheckList.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isGu ? 'જરૂરી દસ્તાવેજોની યાદી:' : 'Required Documents Checklist:'}
                  </span>
                  <span className={`font-bold ${allDocsReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {vaultCheckList.filter((d) => d.isAvailable).length} / {vaultCheckList.length} {isGu ? 'ઉપલબ્ધ' : 'Available'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {vaultCheckList.map((doc, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        doc.isAvailable
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {doc.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{doc.DocumentName}</span>
                      <span className="text-[10px] opacity-75">
                        ({doc.isAvailable ? (isGu ? 'તિજોરીમાં ઉપલબ્ધ' : 'In Vault') : (isGu ? 'બાકી છે' : 'Pending')})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Field 6: Fee & Payment Details */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isGu ? '૪. ફી અને ચુકવણી વિગતો' : '4. Fee & Payment Details'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isGu ? 'ચુકવણી પદ્ધતિ' : 'Payment Mode'}
                  </label>
                  <Select
                    options={[
                      { value: 'CASH', label: isGu ? 'રોકડ' : 'Cash' },
                      { value: 'UPI', label: isGu ? 'UPI / QR કોડ' : 'UPI / QR Code' },
                      { value: 'WALLET', label: isGu ? 'વૉલેટ' : 'Wallet' },
                      { value: 'BANK_TRANSFER', label: isGu ? 'બેંક ટ્રાન્સફર' : 'Bank Transfer' },
                    ]}
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isGu ? 'ચુકવણી સ્થિતિ' : 'Payment Status'}
                  </label>
                  <Select
                    options={[
                      { value: 'PAID', label: isGu ? 'પૂર્ણ ચૂકવાઈ' : 'Paid' },
                      { value: 'PARTIAL', label: isGu ? 'અડધું ચૂકવાઈ' : 'Partial' },
                      { value: 'UNPAID', label: isGu ? 'બાકી' : 'Unpaid' },
                    ]}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isGu ? 'કુલ રકમ' : 'Total Fee'}
                  </label>
                  <div className="h-10 px-3 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    <span>₹{totalFeeAmount}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({isGu ? `સરકારી: ₹${govtFee} + સેવા: ₹${serviceCharge}` : `Govt: ₹${govtFee} + Service: ₹${serviceCharge}`})
                    </span>
                  </div>
                </div>
              </div>

              <Input
                label={isGu ? 'ઓપરેટર નોંધ' : 'Operator Notes'}
                placeholder={isGu ? 'અરજી સંબંધિત ખાસ નોંધ અથવા રીમાર્ક લખો...' : 'Write any special notes or remarks...'}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
              />
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* DETAILED ASSISTED STEP FLOW (ORIGINAL)                                     */
          /* ========================================================================= */
          <>
            {/* Top Status Header Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] font-bold select-none">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
                  selectedCustomer
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {selectedCustomer ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span>1.</span>}
                <span className="truncate">Citizen Lookup</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
                  selectedApplicant
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {selectedApplicant ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span>2.</span>}
                <span className="truncate">Select Applicant</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
                  selectedService
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {selectedService ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span>3.</span>}
                <span className="truncate">Select Service</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
                  vaultCheckList.length > 0
                    ? allDocsReady
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>4.</span>
                <span className="truncate">Smart Checklist</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                <span>5.</span>
                <span className="truncate">Payment &amp; Receipt</span>
              </div>
            </div>

        {/* ========================================================================= */}
        {/* SECTION 1: CITIZEN / FAMILY LOOKUP */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xs">
                1
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Citizen / Family Lookup
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search head of family by name, mobile, family ID, or register new citizen
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsQuickRegister(!isQuickRegister);
                setIsChangingCustomer(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isQuickRegister ? 'Back to Search' : '+ Quick Register Citizen'}</span>
            </button>
          </div>

          {/* Quick Register Form */}
          {isQuickRegister ? (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant Citizen Onboarding</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Head of Family Full Name *"
                  placeholder="e.g. Ramesh Patel"
                  value={quickCitizen.head_of_family}
                  onChange={(e) => setQuickCitizen({ ...quickCitizen, head_of_family: e.target.value })}
                  required
                />
                <Input
                  label="Mobile Number (10 Digits) *"
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
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="xs" onClick={() => setIsQuickRegister(false)}>
                  Cancel
                </Button>
                <Button
                  size="xs"
                  onClick={() => quickRegisterMutation.mutate()}
                  isLoading={quickRegisterMutation.isPending}
                  disabled={!quickCitizen.head_of_family || !quickCitizen.mobile_number}
                >
                  Save &amp; Select Family
                </Button>
              </div>
            </div>
          ) : selectedCustomer && !isChangingCustomer ? (
            /* Selected Customer Display Card */
            <div className="p-3.5 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {selectedCustomer.head_of_family[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedCustomer.head_of_family}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white font-mono">
                      {selectedCustomer.family_id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    📱 {selectedCustomer.mobile_number} &bull; 📍 {selectedCustomer.village_city || 'Varna'} &bull; 👥 {selectedCustomer.family_member_count || 1} Members
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setIsChangingCustomer(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Change Family
                </Button>
              </div>
            </div>
          ) : (
            /* Customer Search & Select Grid */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={citizenQuery}
                  onChange={(e) => setCitizenQuery(e.target.value)}
                  placeholder="Type Citizen Name, Mobile, Family ID (e.g. HTF-000002)..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
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
                        setIsChangingCustomer(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSel
                          ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-brand-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {cust.head_of_family[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {cust.head_of_family}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {cust.family_id} &bull; {cust.mobile_number}
                          </div>
                        </div>
                      </div>

                      {isSel ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      ) : (
                        <span className="text-[10px] text-brand-600 font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SELECT APPLICANT */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs">
              2
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Select Applicant
              </h3>
              <p className="text-[11px] text-slate-500">
                Specify who is this government application for (Head of Family or Dependent Member)
              </p>
            </div>
          </div>

          {!selectedCustomer ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
              Please select a Citizen / Family in Section 1 above to load household applicants.
            </div>
          ) : (
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
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedApplicant?.isHead
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {selectedCustomer.head_of_family}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500/10 text-amber-600">
                        Head
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {selectedCustomer.mobile_number}
                    </div>
                  </div>
                </div>

                {selectedApplicant?.isHead && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </div>

              {/* Option 2: Family Members */}
              {familyMembers.map((m) => {
                const isSel = !selectedApplicant?.isHead && selectedApplicant?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() =>
                      setSelectedApplicant({
                        id: m.id,
                        name: m.name,
                        relationship: m.relationship || 'Dependent',
                        mobile: m.mobile_number || selectedCustomer.mobile_number,
                        isHead: false,
                      })
                    }
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSel
                        ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {m.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {m.relationship}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {m.mobile_number || selectedCustomer.mobile_number}
                        </div>
                      </div>
                    </div>

                    {isSel && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SELECT SERVICE & SUB-SERVICE */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                3
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Select Service
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select from official catalogue (Govt Schemes, KYC, New Cards, Utility)
                </p>
              </div>
            </div>

            {selectedService && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                Selected: {selectedService.ServiceName}
              </span>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              placeholder="Search service (e.g. Income Certificate, Ration Card, PAN Card)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
            {filteredServices.map((srv) => {
              const isSel = selectedService?.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => handleSelectService(srv)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSel
                      ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-purple-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {srv.ServiceName}
                      </span>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />}
                    </div>
                    {srv.ServiceNameGu && (
                      <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                        {srv.ServiceNameGu}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-500">
                    <span>Govt: ₹{srv.GovernmentFee ?? 0} + Desk: ₹{srv.ServiceCharge ?? 50}</span>
                    <span className="font-bold text-amber-600">{srv.SlaDays || 3}d SLA</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-Service options if present */}
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
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sub.SubServiceName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: SMART CHECKLIST (DIGITAL VAULT AUTO-VERIFICATION) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                4
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Smart Checklist
                </h3>
                <p className="text-[11px] text-slate-500">
                  Automatic requirement verification against citizen&apos;s Digital Vault
                </p>
              </div>
            </div>

            {selectedCustomer && (
              <span className="text-[11px] font-mono text-slate-400">
                Vault ID: {selectedCustomer.family_id}
              </span>
            )}
          </div>

          {!selectedService ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
              Please select a service in Section 3 above to verify mandatory document requirements.
            </div>
          ) : vaultCheckList.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>No mandatory documents required for this service. Ready to process.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vaultCheckList.map((docItem) => {
                const isUploading = uploadingDocType === docItem.document_type;
                return (
                  <div
                    key={docItem.id}
                    className={`p-3 rounded-xl border transition-all ${
                      docItem.isAvailable
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-300/80 dark:border-emerald-800/60'
                        : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            docItem.isAvailable
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {docItem.isAvailable ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {docItem.DocumentName}
                            </span>
                            {docItem.IsRequired && (
                              <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Type: {docItem.document_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {docItem.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            <Check className="w-3 h-3" />
                            <span>In Digital Vault</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600">
                              Missing
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setUploadingDocType(isUploading ? null : docItem.document_type)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xs"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{isUploading ? 'Cancel' : 'Upload to Vault'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUploading && (
                      <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
                        <input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-brand-600 file:text-white text-slate-500"
                        />
                        <Button
                          size="xs"
                          disabled={!uploadFile}
                          onClick={() => handleInlineVaultUpload(docItem.document_type, docItem.DocumentName)}
                        >
                          Save to Vault
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: PAYMENT & RECEIPT */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                5
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Payment &amp; Receipt
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fee calculation, payment settlement mode, and receipt dispatch
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 mr-2">Total Payable:</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{totalFeeAmount.toFixed(2)}
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
              label="Desk Service Fee (₹)"
              type="number"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(Number(e.target.value))}
            />
            <Select
              label="Payment Mode *"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
              options={[
                { label: 'CASH (રોકડ)', value: 'CASH' },
                { label: 'ONLINE / UPI', value: 'UPI' },
                { label: 'WALLET (વોલેટ)', value: 'WALLET' },
                { label: 'CARD (કાર્ડ)', value: 'CARD' },
              ]}
            />
            <Select
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              options={[
                { label: 'Fully Paid (ચુકવાઈ ગયું)', value: 'PAID' },
                { label: 'Partial Advance', value: 'PARTIAL' },
                { label: 'Pay Later', value: 'UNPAID' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Govt Portal / Token Ref (Optional)"
              placeholder="e.g. GJ-APP-99824 / Digital Gujarat Ref"
              value={dynamicAnswers['govt_ref'] || ''}
              onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, govt_ref: e.target.value })}
            />
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { label: 'Normal Priority (સામાન્ય)', value: 'NORMAL' },
                { label: 'High Priority (ઉચ્ચ પ્રાથમિકતા)', value: 'HIGH' },
                { label: 'Emergency Expedited (તાત્કાલિક)', value: 'URGENT' },
              ]}
            />
          </div>

          <Textarea
            label="Staff Notes / Remarks (Optional)"
            placeholder="Applicant requests, physical documents verified notes, etc."
            rows={2}
            value={operatorNotes}
            onChange={(e) => setOperatorNotes(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Send SMS receipt &amp; tracking notification to citizen</span>
            </label>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Unified One-Page Form Footer Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 truncate">
          {selectedApplicant && selectedService ? (
            <span>
              {isGu ? 'અરજદાર:' : 'For:'} <strong>{selectedApplicant.name}</strong> &bull; {isGu ? 'સેવા:' : 'Service:'} <strong>{isGu ? (selectedService.ServiceNameGu || selectedService.ServiceName) : selectedService.ServiceName}</strong> &bull; {isGu ? 'કુલ:' : 'Total:'} <strong>₹{totalFeeAmount}</strong>
            </span>
          ) : (
            <span>{isGu ? 'અરજી સબમિટ કરવા માટે તમામ વિભાગો પૂર્ણ કરો' : 'Please complete all sections to submit application'}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            {isGu ? 'રદ કરો' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            onClick={() => createApplicationMutation.mutate()}
            isLoading={createApplicationMutation.isPending}
            disabled={!selectedCustomer || !selectedApplicant || !selectedService}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="bg-brand-600 hover:bg-brand-500 font-bold"
          >
            {isGu ? 'અરજી સબમિટ કરો અને પહોંચ બનાવો' : 'Submit Application & Generate Receipt'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
