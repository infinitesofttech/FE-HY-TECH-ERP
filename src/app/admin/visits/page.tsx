'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  Modal,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  StatCard,
  ConfirmDialog,
} from '@/components/ui';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { documentService } from '@/api/services/documentService';
import { useLanguage } from '@/context/LanguageContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ServiceVisit, VisitDocument } from '@/types';
import { toast } from 'sonner';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Edit2,
  UploadCloud,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';

export default function ServiceVisitsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [visitToDelete, setVisitToDelete] = useState<ServiceVisit | null>(null);

  // Edit Visit state
  const [visitToEdit, setVisitToEdit] = useState<ServiceVisit | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    visit_date: '',
    remarks: '',
  });

  // Inline Document Upload state for existing visits
  const [selectedVisitForDocUpload, setSelectedVisitForDocUpload] = useState<{
    visit: ServiceVisit;
    doc: VisitDocument;
  } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Wizard Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [checklist, setChecklist] = useState<
    Array<{
      name: string;
      type: string;
      status: 'AVAILABLE' | 'NOT_AVAILABLE';
      autoChecked?: boolean;
    }>
  >([]);

  // Queries
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['service-visits', search, serviceFilter],
    queryFn: () => serviceVisitService.getVisits({ search, service: serviceFilter || undefined }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  // Sync default selections when data loads
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
      if (services[0].SubServices?.length > 0 && !selectedSubServiceId) {
        setSelectedSubServiceId(services[0].SubServices[0].id);
      }
    }
  }, [services, selectedServiceId, selectedSubServiceId]);

  const selectedCustomer =
    customers.find((c: any) => c.id === selectedCustomerId) || customers[0];

  const { data: members = [] } = useQuery({
    queryKey: ['family-members', selectedCustomer?.family_id],
    queryFn: () => familyMemberService.getMembers(selectedCustomer?.family_id || ''),
    enabled: !!selectedCustomer?.family_id,
  });

  // Query Vault documents for the selected citizen to automatically check requirements
  const { data: customerVaultDocs = [] } = useQuery({
    queryKey: ['vault-documents', selectedCustomer?.family_id, selectedMemberId],
    queryFn: () => {
      if (!selectedCustomer?.family_id || !selectedMemberId) return [];
      return documentService.getDocuments(selectedCustomer.family_id, selectedMemberId);
    },
    enabled: !!selectedCustomer?.family_id && !!selectedMemberId,
  });

  const currentService =
    services.find((s: any) => s.id === selectedServiceId) || services[0];
  const currentSubServices = currentService?.SubServices || [];
  const currentSubService =
    currentSubServices.find((sub: any) => sub.id === selectedSubServiceId) ||
    currentSubServices[0];

  // Helper to check if a required document is in the customer's digital vault
  const checkDocInVault = (docType: string, docName: string) => {
    return customerVaultDocs.some((vd: any) => {
      const typeMatch = vd.document_type && docType && vd.document_type.toLowerCase() === docType.toLowerCase();
      const nameMatch =
        vd.document_name &&
        docName &&
        (vd.document_name.toLowerCase().includes(docName.toLowerCase()) ||
          docName.toLowerCase().includes(vd.document_name.toLowerCase()));
      return typeMatch || nameMatch;
    });
  };

  // Re-generate & auto-check checklist whenever sub-service, customer, or vault docs change
  const refreshChecklistWithAutoCheck = (subService: any) => {
    if (!subService || !subService.RequiredDocuments) return;
    const generated = subService.RequiredDocuments.map((req: any) => {
      const isPresent = checkDocInVault(req.document_type, req.DocumentName);
      return {
        name: req.DocumentName,
        type: req.document_type,
        status: isPresent ? ('AVAILABLE' as const) : ('NOT_AVAILABLE' as const),
        autoChecked: isPresent,
      };
    });
    setChecklist(generated);
  };

  const handleSubServiceChange = (subId: number) => {
    setSelectedSubServiceId(subId);
    const sub = currentSubServices.find((s: any) => s.id === subId);
    if (sub) {
      refreshChecklistWithAutoCheck(sub);
    }
  };

  // Auto-check when switching to Step 3 or when customerVaultDocs load
  useEffect(() => {
    if (currentSubService) {
      refreshChecklistWithAutoCheck(currentSubService);
    }
  }, [customerVaultDocs, selectedSubServiceId]);

  // Create Visit Mutation
  const createVisitMutation = useMutation({
    mutationFn: () =>
      serviceVisitService.createVisit({
        customer: selectedCustomerId,
        family_member: selectedMemberId,
        service: selectedServiceId,
        sub_service: selectedSubServiceId,
        checked_by: 1,
        remarks,
      }),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Service visit created successfully!');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsWizardOpen(false);
      setWizardStep(1);
    },
    onError: () => toast.error('Failed to create visit'),
  });

  // Update Visit Mutation (edit status, remarks, visit_date)
  const updateVisitMutation = useMutation({
    mutationFn: ({ visitNo, data }: { visitNo: string; data: Partial<ServiceVisit> }) =>
      serviceVisitService.updateVisit(visitNo, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Service visit updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
      setVisitToEdit(null);
    },
    onError: () => toast.error('Failed to update service visit'),
  });

  // Checklist status toggle mutation
  const toggleDocMutation = useMutation({
    mutationFn: async ({
      visitNo,
      docId,
      status,
    }: {
      visitNo: string;
      docId: number;
      status: 'AVAILABLE' | 'NOT_AVAILABLE';
    }) => {
      const fd = new FormData();
      fd.append('status', status);
      return serviceVisitService.updateVisitDocument(visitNo, docId, fd);
    },
    onSuccess: () => {
      toast.success('Document status updated!');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
    },
  });

  // Upload missing document for existing visit
  const uploadMissingDocMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVisitForDocUpload) throw new Error('No document selected');
      const { visit, doc } = selectedVisitForDocUpload;
      const fd = new FormData();
      fd.append('status', 'AVAILABLE');
      if (uploadFile) {
        fd.append('document_file', uploadFile);
      }
      return serviceVisitService.updateVisitDocument(visit.visit_no, doc.id, fd);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Document uploaded and verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
      setSelectedVisitForDocUpload(null);
      setUploadFile(null);
    },
    onError: () => toast.error('Failed to upload document'),
  });

  // Auto-Check Vault for existing visit
  const autoCheckVisitMutation = useMutation({
    mutationFn: async (visit: ServiceVisit) => {
      // Fetch citizen's vault
      const vaultDocs = await documentService.getDocuments(
        visit.customer_family_id,
        visit.family_member || 1
      );
      let updatedCount = 0;
      const docsToUpdate = (visit.documents || []).filter((d) => d.status === 'NOT_AVAILABLE');

      for (const d of docsToUpdate) {
        const found = vaultDocs.some(
          (vd: any) =>
            (vd.document_type && vd.document_type.toLowerCase() === d.document_type.toLowerCase()) ||
            (vd.document_name && d.document_name && vd.document_name.toLowerCase().includes(d.document_name.toLowerCase()))
        );
        if (found) {
          const fd = new FormData();
          fd.append('status', 'AVAILABLE');
          await serviceVisitService.updateVisitDocument(visit.visit_no, d.id, fd);
          updatedCount++;
        }
      }
      return { updatedCount, totalChecked: docsToUpdate.length };
    },
    onSuccess: ({ updatedCount, totalChecked }) => {
      if (updatedCount > 0) {
        toast.success(`Automated Vault Sync: ${updatedCount} missing document(s) verified!`);
        queryClient.invalidateQueries({ queryKey: ['service-visits'] });
      } else {
        toast.info(
          `Vault checked (${totalChecked} missing): No matching documents found in citizen vault.`
        );
      }
    },
    onError: () => toast.error('Automated vault sync failed'),
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (visitNo: string) => serviceVisitService.deleteVisit(visitNo),
    onSuccess: () => {
      toast.success('Service visit deleted');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
      setVisitToDelete(null);
    },
  });

  const completedVisitsCount = visits.filter((v) => v.status === 'COMPLETED').length;
  const pendingVisitsCount = visits.filter((v) => v.status !== 'COMPLETED').length;

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wide mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>INTELLIGENT CITIZEN INTAKE DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('service_visits_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('service_visits_sub')}
          </p>
        </div>

        <Button
          onClick={() => {
            setIsWizardOpen(true);
            setWizardStep(1);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('new_service_visit')}
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('total_visits')}
          value={visits.length}
          subtitle="Visits recorded"
          icon={CalendarCheck}
          colorScheme="brand"
        />
        <StatCard
          title={t('ready_delivery')}
          value={completedVisitsCount}
          subtitle="Processed successfully"
          icon={CheckCircle}
          colorScheme="emerald"
        />
        <StatCard
          title={t('open_pending')}
          value={pendingVisitsCount}
          subtitle="Pending intake verifications"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Catalogue Services"
          value={services.length}
          subtitle="Active government schemes"
          icon={FileText}
          colorScheme="purple"
        />
      </div>

      {/* Filter Bar */}
      <Card variant="elevated" className="p-3.5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Visit Token (VIS-...), Customer Name, or Family ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-slate-200 font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="py-1.5 text-xs font-bold"
          >
            <option value="">All Services</option>
            {services.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.ServiceName}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map((visit: any) => {
          const total = visit.total_documents || visit.documents?.length || 2;
          const avail =
            visit.available_documents ||
            visit.documents?.filter((d: any) => d.status === 'AVAILABLE').length ||
            0;
          const pct = Math.round((avail / total) * 100);
          const hasMissingDocs = (visit.documents || []).some(
            (d: any) => d.status === 'NOT_AVAILABLE'
          );

          return (
            <Card
              key={visit.visit_no}
              variant="elevated"
              className="p-5 sm:p-6 space-y-4 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-xl border border-brand-200/80 dark:border-brand-800/80 shadow-xs">
                    {visit.visit_no}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {visit.customer_name}
                      {visit.family_member_name && (
                        <span className="text-xs font-semibold text-slate-500 ml-2">
                          (Applicant: {visit.family_member_name})
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      {visit.customer_family_id} &bull; {visit.customer_mobile}
                      {visit.customer_mobile && <WhatsAppButton number={visit.customer_mobile} size="xs" />}
                    </span>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant={
                      visit.status === 'COMPLETED'
                        ? 'success'
                        : visit.status === 'IN_PROGRESS'
                        ? 'info'
                        : visit.status === 'CANCELLED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {visit.status}
                  </Badge>

                  <span className="text-xs text-slate-400 font-mono font-bold">
                    {visit.visit_date}
                  </span>

                  {/* Auto-check system vault button */}
                  {hasMissingDocs && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => autoCheckVisitMutation.mutate(visit)}
                      isLoading={autoCheckVisitMutation.isPending}
                      className="text-[11px] h-8 px-2.5"
                      title="Auto-check and sync missing documents from customer digital vault"
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Auto-Check Vault
                    </Button>
                  )}

                  {/* Edit Visit Details */}
                  <button
                    onClick={() => {
                      setVisitToEdit(visit);
                      setEditForm({
                        status: visit.status,
                        visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
                        remarks: visit.remarks || '',
                      });
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Edit Visit Details & Status"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Visit */}
                  <button
                    onClick={() => setVisitToDelete(visit)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Visit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Service & Readiness Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Service Applied
                  </div>
                  <div className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                    {visit.service_name} &bull;{' '}
                    <span className="text-brand-600 dark:text-brand-400">
                      {visit.sub_service_name}
                    </span>
                  </div>
                  {visit.remarks && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      Remarks: {visit.remarks}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full md:w-72 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">
                      Document Readiness
                    </span>
                    <span
                      className={
                        pct === 100
                          ? 'text-emerald-500 font-black'
                          : 'text-amber-500 font-black'
                      }
                    >
                      {avail}/{total} Available ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100
                          ? 'bg-emerald-500 shadow-glow-emerald'
                          : 'bg-brand-500 shadow-glow-brand'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Interactive Checklist Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Document Requirements ({visit.documents?.length || 0})
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Click status pill to toggle &bull; Upload file for missing docs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(visit.documents || []).map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {doc.status === 'AVAILABLE' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {doc.document_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* If NOT_AVAILABLE, show instant Upload button */}
                        {doc.status === 'NOT_AVAILABLE' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVisitForDocUpload({ visit, doc });
                              setUploadFile(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 hover:bg-brand-100 transition-all"
                            title="Upload Document File"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            toggleDocMutation.mutate({
                              visitNo: visit.visit_no,
                              docId: doc.id,
                              status:
                                doc.status === 'AVAILABLE'
                                  ? 'NOT_AVAILABLE'
                                  : 'AVAILABLE',
                            })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            doc.status === 'AVAILABLE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                          title={t('toggle_availability')}
                        >
                          {doc.status === 'AVAILABLE' ? t('available') : t('not_available')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Service Visit Creation Wizard"
        description="Step-by-step citizen onboarding with automated vault cross-checking."
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            {[
              { step: 1, label: 'Citizen' },
              { step: 2, label: 'Service' },
              { step: 3, label: 'Checklist' },
              { step: 4, label: 'Confirm' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === s.step
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 ring-2 ring-brand-500/20'
                      : wizardStep > s.step
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {wizardStep > s.step ? '✓' : s.step}
                </div>
                <span className="text-xs font-bold hidden sm:inline text-slate-700 dark:text-slate-300">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Pick Customer / Member */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <Select
                label="Select Citizen Household *"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              >
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.family_id} — {c.head_of_family} ({c.village_city})
                  </option>
                ))}
              </Select>

              <Select
                label="Applicant Beneficiary"
                value={selectedMemberId || ''}
                onChange={(e) =>
                  setSelectedMemberId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Self (Head of Household)</option>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </Select>

              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Automated System Vault Integration</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  When you select a service, HY-TECH ERP will automatically scan the
                  citizen&apos;s digital vault for existing Aadhaar, Ration Card, Birth
                  Certificates, and other mandatory documents.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Cascading Services */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <Select
                label="Government Service *"
                value={selectedServiceId}
                onChange={(e) => {
                  const newServiceId = Number(e.target.value);
                  setSelectedServiceId(newServiceId);
                  const s = services.find((srv: any) => srv.id === newServiceId);
                  if (s && s.SubServices?.length) {
                    handleSubServiceChange(s.SubServices[0].id);
                  }
                }}
              >
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.ServiceName}
                  </option>
                ))}
              </Select>

              <Select
                label="Sub-Service Operation *"
                value={selectedSubServiceId}
                onChange={(e) => handleSubServiceChange(Number(e.target.value))}
              >
                {currentSubServices.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.SubServiceName}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Step 3: Dynamic Live Checklist with Automated System Check */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Requirements for: {currentSubService?.SubServiceName || 'Service'}
                </h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  {checklist.filter((c) => c.status === 'AVAILABLE').length} of {checklist.length}{' '}
                  Available
                </span>
              </div>

              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.status === 'AVAILABLE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {item.name}
                        </span>
                        {item.autoChecked && (
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Auto-verified from citizen digital vault
                          </span>
                        )}
                        {!item.autoChecked && item.status === 'NOT_AVAILABLE' && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Not found in system &bull; Citizen must submit
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...checklist];
                        updated[idx].status =
                          updated[idx].status === 'AVAILABLE'
                            ? 'NOT_AVAILABLE'
                            : 'AVAILABLE';
                        setChecklist(updated);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all self-start sm:self-auto ${
                        item.status === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                      }`}
                    >
                      {item.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Remarks & Final Submit */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <Textarea
                label="Desk Remarks & Notes"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Notes from citizen intake visit..."
              />

              <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/80 text-xs space-y-1.5">
                <span className="font-black text-brand-700 dark:text-brand-300">
                  Verification Summary:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  Citizen:{' '}
                  <strong>{selectedCustomer?.head_of_family}</strong> (
                  {selectedCustomer?.family_id})
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Service: <strong>{currentService?.ServiceName}</strong> &bull;{' '}
                  {currentSubService?.SubServiceName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Documents Verified:{' '}
                  <strong>
                    {checklist.filter((c) => c.status === 'AVAILABLE').length}/
                    {checklist.length} Available
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Wizard Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {wizardStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {wizardStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="emerald"
                isLoading={createVisitMutation.isPending}
                onClick={() => createVisitMutation.mutate()}
              >
                Complete Service Intake
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Visit Details Modal */}
      <Modal
        isOpen={!!visitToEdit}
        onClose={() => setVisitToEdit(null)}
        title="Edit Service Visit Details"
        description={`Update status, date, and remarks for visit token ${visitToEdit?.visit_no}`}
        maxWidth="md"
      >
        {visitToEdit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateVisitMutation.mutate({
                visitNo: visitToEdit.visit_no,
                data: {
                  status: editForm.status,
                  visit_date: editForm.visit_date,
                  remarks: editForm.remarks,
                },
              });
            }}
            className="space-y-4"
          >
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Citizen: {visitToEdit.customer_name} ({visitToEdit.customer_family_id})
              </p>
              <p className="text-slate-500 mt-0.5">
                {visitToEdit.service_name} &bull; {visitToEdit.sub_service_name}
              </p>
            </div>

            <Select
              label="Visit Intake Status *"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
            >
              <option value="PENDING">PENDING (Awaiting Documents)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Under Desk Review)</option>
              <option value="COMPLETED">COMPLETED (All Documents Verified)</option>
              <option value="CANCELLED">CANCELLED</option>
            </Select>

            <Input
              label="Visit Date *"
              type="date"
              required
              value={editForm.visit_date}
              onChange={(e) => setEditForm({ ...editForm, visit_date: e.target.value })}
            />

            <Textarea
              label="Desk Remarks & Internal Notes"
              rows={3}
              value={editForm.remarks}
              onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setVisitToEdit(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updateVisitMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Upload Missing Document Modal */}
      <Modal
        isOpen={!!selectedVisitForDocUpload}
        onClose={() => {
          setSelectedVisitForDocUpload(null);
          setUploadFile(null);
        }}
        title="Upload Required Document"
        description={
          selectedVisitForDocUpload
            ? `Submit ${selectedVisitForDocUpload.doc.document_name} for visit token ${selectedVisitForDocUpload.visit.visit_no}`
            : ''
        }
        maxWidth="md"
      >
        {selectedVisitForDocUpload && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              uploadMissingDocMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Missing Requirement Resolution</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Document: <strong>{selectedVisitForDocUpload.doc.document_name}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Type: <code className="font-mono text-[11px]">{selectedVisitForDocUpload.doc.document_type}</code>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Select File (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300 hover:file:bg-brand-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Uploading will immediately transition this requirement to AVAILABLE.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedVisitForDocUpload(null);
                  setUploadFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="emerald"
                isLoading={uploadMissingDocMutation.isPending}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload & Verify
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!visitToDelete}
        onClose={() => setVisitToDelete(null)}
        onConfirm={() => visitToDelete && deleteVisitMutation.mutate(visitToDelete.visit_no)}
        title="Delete Visit Record?"
        message={`Are you sure you want to permanently remove visit token ${visitToDelete?.visit_no}?`}
        confirmText="Delete Visit"
        variant="danger"
        isLoading={deleteVisitMutation.isPending}
      />
    </AppShell>
  );
}
