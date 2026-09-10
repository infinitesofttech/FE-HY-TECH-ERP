'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge, Card, EmptyState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { CheckCircle2, XCircle, CalendarCheck, Sparkles } from 'lucide-react';

export default function CustomerVisitsPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || '';

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['customer-visits', familyId],
    queryFn: async () => {
      const all = await serviceVisitService.getVisits();
      return all.filter((v) => v.customer_family_id === familyId);
    },
    enabled: !!familyId,
  });

  return (
    <AppShell allowedRoles={['customer']}>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>APPLICATION PROGRESS DESK</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          My Service Visits & Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review application status, operator remarks, and document checklist readiness.
        </p>
      </div>

      <div className="space-y-4">
        {visits.map((visit) => {
          const total = visit.total_documents || visit.documents?.length || 2;
          const avail = visit.available_documents || visit.documents?.filter((d) => d.status === 'AVAILABLE').length || 0;
          const pct = Math.round((avail / total) * 100);

          return (
            <Card
              key={visit.visit_no}
              variant="elevated"
              className="p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200 dark:border-brand-800/60">
                    {visit.visit_no}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {visit.service_name} &bull; <span className="text-brand-600 dark:text-brand-400">{visit.sub_service_name}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={visit.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {visit.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {visit.visit_date}
                  </span>
                </div>
              </div>

              {/* Progress and notes */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Required Documents Readiness</span>
                  <span className={pct === 100 ? 'text-emerald-500' : 'text-amber-500'}>
                    {avail} of {total} Available ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct === 100 ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-brand-500 shadow-glow-brand'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Document checklist details */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                  Document Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(visit.documents || []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {doc.status === 'AVAILABLE' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {doc.document_name}
                        </span>
                      </div>

                      <Badge variant={doc.status === 'AVAILABLE' ? 'success' : 'warning'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}

        {visits.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="No service visits logged"
            description="When you apply for a citizen service at the HY-TECH desk, live progress will appear here."
          />
        )}
      </div>
    </AppShell>
  );
}
