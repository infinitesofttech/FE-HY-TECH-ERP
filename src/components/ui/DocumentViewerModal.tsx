'use client';

import React from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { CustomerDocument } from '@/types';
import { FileText, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CustomerDocument | null;
  onToggleVerify?: (docId: number, isVerified: boolean) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  onToggleVerify,
}) => {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.document_name}
      description={`Type: ${document.document_type_display || document.document_type} | Family ID: ${document.family_id}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Document Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Verification Status:</span>
            {document.is_verified ? (
              <Badge variant="success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Document
              </Badge>
            ) : (
              <Badge variant="warning">
                <XCircle className="w-3.5 h-3.5" />
                Pending Verification
              </Badge>
            )}
          </div>

          {onToggleVerify && (
            <button
              onClick={() => onToggleVerify(document.id, !document.is_verified)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                document.is_verified
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {document.is_verified ? 'Mark Unverified' : 'Mark as Verified'}
            </button>
          )}
        </div>

        {/* Document Preview Frame */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-8 min-h-[260px]">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <FileText className="w-8 h-8" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {document.document_name}
          </span>
          <span className="text-xs text-slate-500 font-mono mt-1 break-all text-center max-w-md">
            {document.document_file}
          </span>

          <div className="mt-4 flex gap-3">
            <a
              href={document.document_file}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Document
            </a>
            <a
              href={document.document_file}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>

        {/* Metadata Details */}
        {document.description && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Notes: </span>
            <span className="text-slate-500 dark:text-slate-400">{document.description}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </Modal>
  );
};
