'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge, Card, EmptyState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { familyMemberService } from '@/api/services/familyMemberService';
import { Users, Phone, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export default function CustomerMembersPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
  });

  return (
    <AppShell allowedRoles={['customer']}>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>FAMILY ROSTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          My Household Members
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Registered dependents enrolled under Family ID: <strong className="font-mono text-brand-600 dark:text-brand-400">{familyId}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card
            key={member.id}
            variant="elevated"
            className="p-5 space-y-3 hover:border-brand-500/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-base ring-4 ring-brand-500/5">
                  {member.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <Badge variant="purple">{member.relationship}</Badge>
                </div>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Active Beneficiary" />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{member.mobile_number || 'Mobile not registered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">DOB: {member.birth_date}</span>
              </div>
            </div>
          </Card>
        ))}

        {members.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No household members registered"
              description="Contact the HY-TECH desk operator to enroll your dependents and family members."
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
