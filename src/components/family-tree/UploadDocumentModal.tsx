'use client';

import React, { useState } from 'react';
import { GovDocumentItem, DocumentType } from '@/types';
import { Modal, Input, Button, Textarea, Select } from '@/components/ui';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GovDocumentItem | null;
  memberName?: string;
  onSuccess: (docId: string, docNo: string, fileUrl: string) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  memberName = 'Durgesh Changani',
  onSuccess,
}) => {
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('2026-08-15');
  const [notes, setNotes] = useState('Verified copy received at desk');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      toast.error('Please enter official document identification number');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(
        document.id,
        docNumber.trim(),
        file ? URL.createObjectURL(file) : '/media/customer_documents/sample.pdf'
      );
      toast.success(`${document.title} stored and verified in vault!`);
      onClose();
    }, 600);
  };

  const handleQuickDemoFill = () => {
    if (document.type === 'AADHAR') setDocNumber('XXXX XXXX ' + Math.floor(1000 + Math.random() * 9000));
    else if (document.type === 'PAN') setDocNumber('ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F');
    else if (document.type === 'RATION_CARD') setDocNumber('08' + Math.floor(10000000 + Math.random() * 90000000));
    else setDocNumber('GJ/' + Math.floor(100000 + Math.random() * 900000));
    setNotes('Biometric physical document verified by operator');
    toast.success('Sample document details auto-filled!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload Document: ${document.title}`}
      description={`Storing verified government credentials in ${memberName}'s digital vault.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Demo Fill Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fast 1-Click Demo Fill:</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            ⚡ Auto-Fill Number
          </button>
        </div>

        <Input
          label="Official Document / Card Number *"
          required
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
          placeholder="e.g. XXXX XXXX 4821 or PAN / Ration No."
        />

        <Input
          label="Issue / Verification Date"
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
        />

        {/* File Drag & Drop */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Select Scanned File (PDF / JPG / PNG)
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50/60 dark:bg-slate-900/60 transition-colors">
            <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {file ? file.name : 'Click to select or drag & drop document file'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <Textarea
          label="Officer Verification Notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="emerald" isLoading={isSubmitting}>
            Upload & Store in Vault
          </Button>
        </div>
      </form>
    </Modal>
  );
};
