'use client';

import React from 'react';
import { FamilyTreeNodeData } from '@/types';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
  User,
  Phone,
  FileCheck2,
  Crown,
  Eye,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface FamilyTreeNodeProps {
  node: FamilyTreeNodeData;
  isSelected?: boolean;
  onSelect: (node: FamilyTreeNodeData) => void;
  onOpenDocs?: (node: FamilyTreeNodeData) => void;
}

export const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  node,
  isSelected = false,
  onSelect,
  onOpenDocs,
}) => {
  const getRoleColors = (rel: string) => {
    switch (rel) {
      case 'HEAD':
        return {
          badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          avatar: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20',
          ring: 'group-hover:border-emerald-500',
        };
      case 'WIFE':
      case 'HUSBAND':
        return {
          badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          avatar: 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-purple-500/20',
          ring: 'group-hover:border-purple-500',
        };
      case 'SON':
        return {
          badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          avatar: 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-blue-500/20',
          ring: 'group-hover:border-blue-500',
        };
      case 'DAUGHTER':
        return {
          badge: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
          avatar: 'bg-gradient-to-br from-pink-600 to-rose-700 text-white shadow-pink-500/20',
          ring: 'group-hover:border-pink-500',
        };
      default:
        return {
          badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          avatar: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-amber-500/20',
          ring: 'group-hover:border-amber-500',
        };
    }
  };

  const colors = getRoleColors(node.relationship);
  const docPct = Math.round((node.documents_verified / (node.documents_total || 8)) * 100);

  return (
    <div
      onClick={() => onSelect(node)}
      className={`group relative w-64 sm:w-72 rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left border ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-400 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20 scale-[1.02]'
          : 'bg-white/95 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Head of Family Crown Accent */}
      {node.is_head && (
        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs tracking-wider uppercase">
          <Crown className="w-3 h-3" />
          <span>Head of Family</span>
        </div>
      )}

      {/* Top Header info */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0 ${colors.avatar}`}
          >
            {node.name ? node.name[0].toUpperCase() : 'M'}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {node.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${colors.badge}`}
              >
                {node.relationship_display || node.relationship}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                &bull; Age {node.age}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 font-mono">
            <Phone className="w-3 h-3 text-slate-400" />
            {node.mobile_number || 'Not provided'}
            {node.mobile_number && (
              <WhatsAppButton number={node.mobile_number} size="xs" className="ml-0.5" />
            )}
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            DOB: {node.birth_date}
          </span>
        </div>

        {/* Document Readiness Progress */}
        <div className="pt-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Docs Verified</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {node.documents_verified}/{node.documents_total || 8} ({docPct}%)
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                docPct >= 75
                  ? 'bg-emerald-500'
                  : docPct >= 40
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${docPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Footer on Hover */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
          }}
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
        >
          <Eye className="w-3 h-3" />
          <span>Profile Drawer</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDocs) onOpenDocs(node);
            else onSelect(node);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px] hover:bg-emerald-100 transition-colors"
        >
          <FileText className="w-3 h-3" />
          <span>Digital Vault</span>
        </button>
      </div>
    </div>
  );
};
