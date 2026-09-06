'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Badge, Button, Input, Select, Textarea } from '@/components/ui';
import { applicationService } from '@/api/services/applicationService';
import { auditLogService } from '@/api/services/auditLogService';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Application, ApplicationStatus } from '@/types';
import { ReceiptModal } from './ReceiptModal';
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal';
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Printer,
  Share2,
  Calendar,
  Building2,
  ShieldCheck,
  User,
  ArrowRight,
  History,
  Coins,
  Send,
  Sparkles,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ApplicationDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

const STATUS_PROGRESSION: { status: ApplicationStatus; labelEn: string; labelGu: string }[] = [
  { status: 'SUBMITTED', labelEn: 'Submitted', labelGu: 'નોંધાયેલ' },
  { status: 'DOCS_PENDING', labelEn: 'Docs Pending', labelGu: 'દસ્તાવેજ બાકી' },
  { status: 'SCRUTINY', labelEn: 'Desk Scrutiny', labelGu: 'ચકાસણી' },
  { status: 'GOVERNMENT_PROCESSING', labelEn: 'Govt Processing', labelGu: 'સરકારી પોર્ટલ' },
  { status: 'ACTION_REQUIRED', labelEn: 'Action Required', labelGu: 'પગલાં જરૂરી' },
  { status: 'APPROVED', labelEn: 'Approved', labelGu: 'મંજૂર' },
  { status: 'COMPLETED', labelEn: 'Completed', labelGu: 'પૂર્ણ/વિતરિત' },
];

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'form' | 'timeline'>('overview');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedDocToView, setSelectedDocToView] = useState<any | null>(null);

  // Status Change Dialog State
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('GOVERNMENT_PROCESSING');
  const [statusNotes, setStatusNotes] = useState('');

  // Govt Ref Edit State
  const [isEditingGovtRef, setIsEditingGovtRef] = useState(false);
  const [govtRefInput, setGovtRefInput] = useState('');

  if (!application) return null;

  const actorName = (user as any)?.username || (user as any)?.full_name || 'Admin Operator';

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: () =>
      applicationService.updateStatus(application.id, newStatus, statusNotes, actorName),
    onSuccess: (updated) => {
      toast.success(
        language === 'gu'
          ? `અરજીની સ્થિતિ બદલાઈ: ${updated.status}`
          : `Application status updated to ${updated.status}`
      );
      auditLogService.logAction(
        'STATUS_UPDATE',
        'Application',
        application.application_no,
        `Status changed from ${application.status} to ${newStatus}. Notes: ${statusNotes}`
      );
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsChangingStatus(false);
      setStatusNotes('');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // Save Govt App Reference Mutation
  const saveGovtRefMutation = useMutation({
    mutationFn: () =>
      applicationService.updateApplication(application.id, {
        government_app_no: govtRefInput,
      }),
    onSuccess: () => {
      toast.success('Government reference number saved');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsEditingGovtRef(false);
    },
  });

  // Check SLA Status
  const isOverdue = application.expected_date
    ? new Date(application.expected_date) < new Date() && application.status !== 'COMPLETED'
    : false;

  const currentStepIndex = STATUS_PROGRESSION.findIndex((s) => s.status === application.status);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={application.application_no}
        description={`${application.service_name} • ${application.customer_name} (${application.customer_family_id})`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Top Banner: Status, SLA & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
                  application.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : application.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : isOverdue
                    ? 'bg-rose-500/15 text-rose-600 animate-pulse ring-2 ring-rose-500/30'
                    : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {application.status.replace(/_/g, ' ')}
                  </span>
                  {isOverdue && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      SLA Overdue!
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {application.category || 'GOVT_FORMS'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA Target: {application.expected_date || 'Standard'}</span>
                  <span>&bull;</span>
                  <span>Operator: {application.assigned_staff_name || 'Admin Desk'}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReceiptOpen(true)}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Receipt
              </Button>

              {application.government_portal_url && (
                <a
                  href={application.government_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Gov Portal</span>
                </a>
              )}

              <Button
                size="sm"
                onClick={() => {
                  setNewStatus(application.status);
                  setIsChangingStatus(true);
                }}
                leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Update Status
              </Button>
            </div>
          </div>

          {/* Visual Lifecycle Stepper */}
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center justify-between min-w-[620px] px-4">
              {STATUS_PROGRESSION.map((stepItem, index) => {
                const isPassed = currentStepIndex >= 0 && index <= currentStepIndex;
                const isCurrent = stepItem.status === application.status;

                return (
                  <div key={stepItem.status} className="flex flex-col items-center relative group">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>

                    <span
                      className={`text-[10px] font-bold mt-1 text-center whitespace-nowrap ${
                        isCurrent
                          ? 'text-brand-600 dark:text-brand-400 font-black'
                          : isPassed
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {language === 'gu' ? stepItem.labelGu : stepItem.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Change Drawer / Form */}
          {isChangingStatus && (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-700 dark:text-brand-300 uppercase">
                  Advance Application Stage
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingStatus(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="New Lifecycle Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  options={[
                    { label: 'SUBMITTED - Received at desk', value: 'SUBMITTED' },
                    { label: 'DOCS_PENDING - Waiting for citizen docs', value: 'DOCS_PENDING' },
                    { label: 'SCRUTINY - Under verification', value: 'SCRUTINY' },
                    { label: 'GOVERNMENT_PROCESSING - Submitted to portal', value: 'GOVERNMENT_PROCESSING' },
                    { label: 'ACTION_REQUIRED - Portal query / biometric needed', value: 'ACTION_REQUIRED' },
                    { label: 'APPROVED - Sanctioned by department', value: 'APPROVED' },
                    { label: 'COMPLETED - Certificate/PVC Card Delivered', value: 'COMPLETED' },
                    { label: 'REJECTED - Rejected by Government', value: 'REJECTED' },
                    { label: 'CANCELLED - Cancelled by Citizen', value: 'CANCELLED' },
                  ]}
                />

                <Input
                  label="Operator Transition Remarks"
                  placeholder="e.g. Uploaded to Digital Gujarat, Token #9923 issued"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setIsChangingStatus(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatusMutation.mutate()}
                  isLoading={updateStatusMutation.isPending}
                >
                  Save & Record in Audit Trail
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-6">
            {[
              { id: 'overview', label: 'Overview & Details' },
              { id: 'docs', label: `Documents (${application.documents?.length || 0})` },
              { id: 'form', label: 'Form Data' },
              { id: 'timeline', label: `Timeline (${application.timeline?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 transition-all relative ${
                  activeTab === tab.id
                    ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Citizen / Applicant</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {application.applicant_name}
                  </div>
                  <div className="text-slate-500">
                    Family: <span className="font-mono font-bold">{application.customer_family_id}</span>
                  </div>
                  <div className="text-slate-500 font-mono">Mobile: {application.applicant_mobile}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service & Category</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {application.service_name}
                  </div>
                  {application.service_name_gu && (
                    <div className="text-brand-600 dark:text-brand-400 font-medium">
                      {application.service_name_gu}
                    </div>
                  )}
                  {application.sub_service_name && (
                    <div className="text-slate-500">&bull; {application.sub_service_name}</div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Financials & Billing</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Fee:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{application.total_fee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {application.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt No:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {application.receipt_no || `RCP-${application.id}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Govt Portal Reference Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Government Portal Application / Token Number
                  </span>
                  {isEditingGovtRef ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={govtRefInput}
                        onChange={(e) => setGovtRefInput(e.target.value)}
                        placeholder="e.g. GJ-SARATHI-992318"
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                      <Button size="sm" onClick={() => saveGovtRefMutation.mutate()}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingGovtRef(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="font-mono font-black text-sm text-brand-600 dark:text-brand-400 mt-0.5">
                      {application.government_app_no || 'Not registered yet on Government Portal'}
                    </div>
                  )}
                </div>

                {!isEditingGovtRef && (
                  <button
                    type="button"
                    onClick={() => {
                      setGovtRefInput(application.government_app_no || '');
                      setIsEditingGovtRef(true);
                    }}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Edit Gov Token #
                  </button>
                )}
              </div>

              {application.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff / Operator Notes</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {application.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS CHECKLIST */}
          {activeTab === 'docs' && (
            <div className="space-y-3 text-xs animate-fade-in">
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          doc.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : doc.status === 'AVAILABLE'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {doc.status === 'VERIFIED' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {doc.document_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Type: {doc.document_type} &bull; Status: {doc.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status === 'VERIFIED'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : doc.status === 'AVAILABLE'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {doc.status}
                      </span>

                      {doc.file_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDocToView({
                              id: doc.id,
                              family_id: application.customer_family_id,
                              member_name: application.applicant_name,
                              document_type: doc.document_type,
                              document_name: doc.document_name,
                              document_file: doc.file_url,
                              is_verified: doc.status === 'VERIFIED',
                              created_at: application.created_at,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No documents attached to this application record.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FORM DATA */}
          {activeTab === 'form' && (
            <div className="space-y-3 text-xs animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Captured Dynamic Application Answers
                </span>
                {application.form_data && Object.keys(application.form_data).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {Object.entries(application.form_data).map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {String(val) || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No additional form data parameters entered for this service.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE & AUDIT TRAIL */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 text-xs animate-fade-in">
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-2">
                {application.timeline && application.timeline.length > 0 ? (
                  application.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative pl-6">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-950" />
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{event.action}</span>
                        <span className="text-[10px] font-mono">
                          {new Date(event.timestamp).toLocaleString('gu-IN')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        By {event.actor_name} ({event.actor_role})
                      </div>
                      {event.notes && (
                        <p className="p-2 mt-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="pl-6 text-slate-400">No timeline events recorded yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Embedded Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        application={application}
      />

      {selectedDocToView && (
        <DocumentViewerModal
          isOpen={!!selectedDocToView}
          onClose={() => setSelectedDocToView(null)}
          document={selectedDocToView}
        />
      )}
    </>
  );
};
