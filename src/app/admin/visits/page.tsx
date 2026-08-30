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
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { ServiceVisit } from '@/types';
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
} from 'lucide-react';

export default function ServiceVisitsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [visitToDelete, setVisitToDelete] = useState<ServiceVisit | null>(null);

  // Wizard Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(3);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(3);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(3);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<number>(3);
  const [remarks, setRemarks] = useState('Customer came for Aadhaar Card service');
  const [checklist, setChecklist] = useState<Array<{ name: string; type: string; status: 'AVAILABLE' | 'NOT_AVAILABLE' }>>([
    { name: 'Child Birth Certificate with new QR and with full name', type: 'BIRTH_CERTIFICATE', status: 'NOT_AVAILABLE' },
    { name: 'Mother/Father Aadhaar Card', type: 'AADHAR', status: 'AVAILABLE' },
  ]);

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

  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId) || customers[0];
  const { data: members = [] } = useQuery({
    queryKey: ['family-members', selectedCustomer?.family_id],
    queryFn: () => familyMemberService.getMembers(selectedCustomer?.family_id || 'HTF-000002'),
    enabled: !!selectedCustomer?.family_id,
  });

  const currentService = services.find((s: any) => s.id === selectedServiceId) || services[0];
  const currentSubServices = currentService?.SubServices || [];
  const currentSubService = currentSubServices.find((sub: any) => sub.id === selectedSubServiceId) || currentSubServices[0];

  const handleSubServiceChange = (subId: number) => {
    setSelectedSubServiceId(subId);
    const sub = currentSubServices.find((s: any) => s.id === subId);
    if (sub && sub.RequiredDocuments?.length) {
      setChecklist(
        sub.RequiredDocuments.map((req: any) => ({
          name: req.DocumentName,
          type: req.document_type,
          status: 'NOT_AVAILABLE',
        }))
      );
    }
  };

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

  // Checklist status toggle mutation
  const uploadDocMutation = useMutation({
    mutationFn: async ({ visitNo, docId, status }: { visitNo: string; docId: number; status: 'AVAILABLE' | 'NOT_AVAILABLE' }) => {
      const fd = new FormData();
      fd.append('status', status);
      return serviceVisitService.updateVisitDocument(visitNo, docId, fd);
    },
    onSuccess: () => {
      toast.success('Checklist updated in real time!');
      queryClient.invalidateQueries({ queryKey: ['service-visits'] });
    },
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
            <span>INSTANT VERIFICATION DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Service Visits & Verification Desks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic document readiness tracking, checklist automation, and multi-step intake wizard.
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
          Create Service Visit Wizard
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visits"
          value={visits.length}
          subtitle="Visits recorded"
          icon={CalendarCheck}
          colorScheme="brand"
        />
        <StatCard
          title="Completed Intakes"
          value={completedVisitsCount}
          subtitle="Processed successfully"
          icon={CheckCircle}
          colorScheme="emerald"
        />
        <StatCard
          title="In Progress"
          value={pendingVisitsCount}
          subtitle="Awaiting documents/verification"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Catalog Services"
          value={services.length}
          subtitle="Available for intake"
          icon={FileText}
          colorScheme="purple"
        />
      </div>

      {/* Filter Bar */}
      <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Visit Token (HTV-...), Customer Name, or Family ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
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
          const avail = visit.available_documents || visit.documents?.filter((d: any) => d.status === 'AVAILABLE').length || 0;
          const pct = Math.round((avail / total) * 100);

          return (
            <Card
              key={visit.visit_no}
              variant="elevated"
              className="p-6 space-y-4 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3.5 py-1.5 rounded-2xl border border-brand-200 dark:border-brand-800/80 shadow-xs">
                    {visit.visit_no}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {visit.customer_name}
                      {visit.family_member_name && (
                        <span className="text-xs font-bold text-slate-500 ml-2">
                          (Applicant: {visit.family_member_name})
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {visit.customer_family_id} &bull; {visit.customer_mobile}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {visit.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    {visit.visit_date}
                  </span>
                  <button
                    onClick={() => setVisitToDelete(visit)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Visit"
                  >
                    <Trash2 className="w-4 h-4" />
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
                    <span className="text-brand-600 dark:text-brand-400">{visit.sub_service_name}</span>
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
                    <span className="text-slate-600 dark:text-slate-300">Document Readiness</span>
                    <span className={pct === 100 ? 'text-emerald-500 font-black' : 'text-amber-500 font-black'}>
                      {avail}/{total} Available ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-brand-500 shadow-glow-brand'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Interactive Checklist Items */}
              <div className="pt-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Document Requirements ({visit.documents?.length || 0})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(visit.documents || []).map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:border-slate-300"
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

                      <button
                        onClick={() =>
                          uploadDocMutation.mutate({
                            visitNo: visit.visit_no,
                            docId: doc.id,
                            status: doc.status === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE',
                          })
                        }
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs ${
                          doc.status === 'AVAILABLE'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                      >
                        {doc.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Multi-step Service Visit Creation Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Service Visit Creation Wizard"
        description="Step-by-step citizen onboarding with dynamic requirement generation."
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
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                    wizardStep === s.step
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-4 ring-brand-500/20'
                      : wizardStep > s.step
                      ? 'bg-emerald-500 text-white shadow-sm'
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
                onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Self (Head of Household)</option>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </Select>
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

          {/* Step 3: Dynamic Live Checklist */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  Dynamic Checklist Generated for: {currentSubService?.SubServiceName || 'Service'}
                </h4>
                <div className="space-y-2">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.status === 'AVAILABLE' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...checklist];
                          updated[idx].status =
                            updated[idx].status === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';
                          setChecklist(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </button>
                    </div>
                  ))}
                </div>
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
                  Citizen: <strong>{selectedCustomer?.head_of_family}</strong> ({selectedCustomer?.family_id})
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Service: <strong>{currentService?.ServiceName}</strong> &bull; {currentSubService?.SubServiceName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Documents Verified: <strong>{checklist.filter((c) => c.status === 'AVAILABLE').length}/{checklist.length} Available</strong>
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
