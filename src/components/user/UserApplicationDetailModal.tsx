'use client';

import React from 'react';
import { Modal, Badge, Button } from '@/components/ui';
import { Application } from '@/types';
import {
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface UserApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onPrintReceipt?: (app: Application) => void;
}

export const UserApplicationDetailModal: React.FC<UserApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onPrintReceipt,
}) => {
  if (!application) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      description={`Application #${application.application_no}`}
      maxWidth="lg"
    >
      <div className="p-6 space-y-6">
        {/* Header Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {application.application_no}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {application.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {application.service_name}
            </h3>
            {application.service_name_gu && (
              <p className="text-xs text-slate-500">{application.service_name_gu}</p>
            )}
          </div>

          <div>{getStatusBadge(application.status)}</div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Applicant</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {application.applicant_name}
            </p>
            <p className="text-slate-500">Beneficiary Member</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Family ID</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
              {application.customer_family_id}
            </p>
            <p className="text-slate-500">Registered Household</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Applied Date</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {new Date(application.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-slate-500">Submission Timestamp</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Expected Delivery</span>
            <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {application.expected_date || '3-5 Working Days'}
            </p>
            <p className="text-slate-500">Government SLA timeline</p>
          </div>
        </div>

        {/* Required Documents Checklist */}
        {application.documents && application.documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {doc.document_name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remarks / Timeline */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-xs space-y-1">
          <span className="font-bold text-blue-900 dark:text-blue-300">Official Note / Remarks:</span>
          <p className="text-slate-600 dark:text-slate-400">
            {application.notes ||
              (application as any).remarks ||
              'Your application has been received and verified by HY-TECH eService desk. Status updates will be sent via SMS / WhatsApp.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onPrintReceipt && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPrintReceipt(application)}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Receipt (પાવતી)
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
