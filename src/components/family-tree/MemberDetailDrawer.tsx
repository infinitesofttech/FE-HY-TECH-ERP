'use client';

import React, { useState } from 'react';
import { FamilyTreeNodeData, GovDocumentItem } from '@/types';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  Clock,
  UploadCloud,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface MemberDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyTreeNodeData | null;
  familyHeadName?: string;
  villageName?: string;
  onUploadDocClick: (doc: GovDocumentItem) => void;
  onPreviewDoc?: (doc: GovDocumentItem) => void;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  isOpen,
  onClose,
  member,
  familyHeadName = '',
  villageName = '',
  onUploadDocClick,
  onPreviewDoc,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'documents' | 'activity'>('documents');

  if (!isOpen || !member) return null;

  const docPct = Math.round((member.documents_verified / (member.documents_total || 8)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-left">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20 flex-shrink-0">
                  {member.name ? member.name[0].toUpperCase() : 'M'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                      {member.relationship_display || member.relationship}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      &bull; Age {member.age} ({member.gender})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Meta */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{villageName} Village</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-mono">{member.mobile_number || 'No Mobile'}</span>
                {member.mobile_number && <WhatsAppButton number={member.mobile_number} size="xs" />}
              </div>
            </div>
          </div>

          {/* 4 Tabs Bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
            {[
              { id: 'documents', label: 'Documents Vault', icon: FileCheck2 },
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'family', label: 'Family Tree', icon: Layers },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* TAB: DOCUMENTS (DIGITAL VAULT) */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {/* Completion Metric Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Digital Identity Vault</span>
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                      {member.documents_verified} of {member.documents_total || 8} ({docPct}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-emerald-200/60 dark:bg-emerald-900/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${docPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    Verified documents can be used instantly across 45+ government scheme applications without re-uploading.
                  </p>
                </div>

                {/* Document Cards List */}
                <div className="space-y-2.5">
                  {(member.documents || []).map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3.5 rounded-2xl transition-all border ${
                        doc.status === 'VERIFIED'
                          ? 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800'
                          : doc.status === 'UPLOADED'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60'
                          : 'bg-slate-50/70 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Icon Status */}
                          <div className="mt-0.5 flex-shrink-0">
                            {doc.status === 'VERIFIED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : doc.status === 'UPLOADED' ? (
                              <Clock className="w-4 h-4 text-amber-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {doc.title}
                            </h5>
                            {language === 'gu' && doc.title_gu && (
                              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {doc.title_gu}
                              </p>
                            )}

                            {doc.document_no && (
                              <p className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                                No: {doc.document_no}
                              </p>
                            )}

                            {doc.uploaded_date && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Verified on {doc.uploaded_date}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : doc.status === 'UPLOADED'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        {doc.status === 'MISSING' ? (
                          <button
                            type="button"
                            onClick={() => onUploadDocClick(doc)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>+ Upload Document</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              type="button"
                              onClick={() => onPreviewDoc?.(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUploadDocClick(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs hover:bg-emerald-100 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Replace</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Name</span>
                      <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Relationship</span>
                      <span className="font-bold">{member.relationship}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Birth Date</span>
                      <span className="font-mono">{member.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Gender</span>
                      <span>{member.age} yrs &bull; {member.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{member.mobile_number || 'N/A'}</span>
                        {member.mobile_number && <WhatsAppButton number={member.mobile_number} size="xs" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Household ID</span>
                      <span className="font-mono font-bold text-emerald-600">{member.family_id}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Village & Jurisdiction
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {villageName ? (
                      <>Registered under <strong>{villageName} Village</strong>. Covered under Government Digital Citizen Registry.</>
                    ) : (
                      <>Covered under Government Digital Citizen Registry.</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: FAMILY TREE RELATIONS */}
            {activeTab === 'family' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Lineage & Household Affiliation
                  </h4>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    {familyHeadName && (
                      <p>
                        Head of Family: <strong>{familyHeadName}</strong>
                      </p>
                    )}
                    <p>
                      Family Unit: <strong>{member.family_id}{villageName ? ` (${villageName})` : ''}</strong>
                    </p>
                    <p>
                      Hierarchy Level: <strong>Generation {member.generation}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACTIVITY */}
            {activeTab === 'activity' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Recent Services & Verifications
                  </h4>
                  {member.documents?.filter((d) => d.status === 'VERIFIED' && d.uploaded_date).length ? (
                    <div className="space-y-1.5">
                      {member.documents
                        .filter((d) => d.status === 'VERIFIED' && d.uploaded_date)
                        .map((d) => (
                          <p key={d.id} className="text-slate-600 dark:text-slate-300">
                            <strong>{d.title}</strong> verified on {d.uploaded_date}.
                          </p>
                        ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">
                      No recent service records logged for this member.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
