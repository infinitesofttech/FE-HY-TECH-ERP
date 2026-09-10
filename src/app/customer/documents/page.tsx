'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge, Card, Button, DocumentViewerModal, EmptyState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { documentService } from '@/api/services/documentService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { CustomerDocument } from '@/types';
import { FileCheck2, Eye, FileText, Download, Sparkles, ShieldCheck } from 'lucide-react';

export default function CustomerDocumentsPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || '';
  const [viewingDoc, setViewingDoc] = useState<CustomerDocument | null>(null);

  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
    enabled: !!familyId,
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['customer-documents', familyId, members],
    queryFn: async () => {
      if (!members.length) return [];
      const promises = members.map((m) =>
        documentService.getDocuments(familyId, m.id).catch(() => [])
      );
      const res = await Promise.all(promises);
      return res.flat();
    },
    enabled: !!familyId,
  });

  return (
    <AppShell allowedRoles={['customer']}>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ENCRYPTED CITIZEN VAULT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          My Digital Document Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Secure, verified storage of your family identity cards, certificates, and government applications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            variant="elevated"
            className="p-5 flex flex-col justify-between hover:border-brand-500/50 transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="purple">{doc.document_type_display || doc.document_type}</Badge>
                {doc.is_verified ? (
                  <Badge variant="success">Verified Official</Badge>
                ) : (
                  <Badge variant="warning">Under Review</Badge>
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {doc.document_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Holder: {doc.member_name || 'Family Member'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Uploaded {doc.created_at?.split('T')[0]}
              </span>
              <Button
                onClick={() => setViewingDoc(doc)}
                variant="ghost"
                size="xs"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View File
              </Button>
            </div>
          </Card>
        ))}

        {documents.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={FileText}
              title="No documents uploaded yet"
              description="Your government documents and verified certificates will appear here once registered at the desk."
            />
          </div>
        )}
      </div>

      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </AppShell>
  );
}
