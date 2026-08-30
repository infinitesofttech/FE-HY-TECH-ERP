'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge, Card, EmptyState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { reminderService } from '@/api/services/reminderService';
import { BellRing, Calendar, MessageSquare, Sparkles } from 'lucide-react';

export default function CustomerRemindersPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['customer-reminders', familyId],
    queryFn: async () => {
      const all = await reminderService.getReminders();
      return all.filter((r) => r.customer_family_id === familyId);
    },
  });

  return (
    <AppShell allowedRoles={['customer']}>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black tracking-wide mb-2">
          <BellRing className="w-3.5 h-3.5" />
          <span>CITIZEN NOTIFICATIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          My Alerts & Service Reminders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Government service readiness notifications, collection appointments, and desk follow-ups.
        </p>
      </div>

      <div className="space-y-4">
        {reminders.map((r) => (
          <Card
            key={r.id}
            variant="elevated"
            className="p-6 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800/60">
                  {r.reminder_no}
                </span>
                <Badge variant={r.priority === 'HIGH' ? 'danger' : 'warning'}>
                  {r.priority} Priority
                </Badge>
                <Badge variant={r.follow_up_status === 'DONE' ? 'success' : 'info'}>
                  {r.follow_up_status}
                </Badge>
              </div>

              <span className="text-xs font-mono font-bold text-slate-500">
                Scheduled for: {r.due_date}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {r.subject}
            </h3>

            {r.message_template && (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  HY-TECH Message:
                </div>
                <p className="text-sm font-semibold font-gujarati text-slate-800 dark:text-slate-200">
                  {r.message_template}
                </p>
              </div>
            )}
          </Card>
        ))}

        {reminders.length === 0 && (
          <EmptyState
            icon={BellRing}
            title="No pending reminders or alerts"
            description="You are all caught up! You will be notified here as soon as your applied documents or identity cards are ready."
          />
        )}
      </div>
    </AppShell>
  );
}
