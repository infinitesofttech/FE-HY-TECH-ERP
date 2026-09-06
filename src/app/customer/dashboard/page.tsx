'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import {
  Coins,
  Wallet,
  Users,
  CalendarCheck,
  FileCheck2,
  BellRing,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const { data: customer } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['customer-visits', familyId],
    queryFn: async () => {
      const all = await serviceVisitService.getVisits();
      return all.filter((v) => v.customer_family_id === familyId);
    },
  });

  return (
    <AppShell allowedRoles={['customer']}>
      {/* Customer Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Citizen Self-Service Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Namaste, {customer?.head_of_family || (user as any)?.head_of_family || 'Citizen'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Family ID: <span className="font-mono font-bold text-brand-300">{familyId}</span> &bull; {customer?.village_city || 'Varna'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/customer/documents')}
              variant="glass"
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              My Documents Vault
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Loyalty Points"
          value={`${customer?.current_points ?? 20} Pts`}
          subtitle="Redeemable on next service"
          icon={Coins}
          colorScheme="amber"
        />
        <StatCard
          title="Wallet Balance"
          value={`₹${customer?.wallet_balance ?? '0.00'}`}
          subtitle="Preloaded store credit"
          icon={Wallet}
          colorScheme="emerald"
        />
        <StatCard
          title="Family Members"
          value={members.length || 2}
          subtitle="Registered dependents"
          icon={Users}
          colorScheme="brand"
        />
        <StatCard
          title="Completed Visits"
          value={customer?.total_visits ?? 1}
          subtitle="Document center services"
          icon={CalendarCheck}
          colorScheme="sky"
        />
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="elevated"
          onClick={() => router.push('/customer/applications')}
          className="p-5 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group bg-gradient-to-br from-brand-500/5 to-indigo-500/5 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              Live Tracker
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Govt Applications &bull; <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">સરકારી અરજીઓ</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            તમામ ૪૫ સરકારી યોજનાઓ, પ્રમાણપત્રો અને દાખલાઓનું લાઈવ સ્ટેટસ જુઓ.
          </p>
        </Card>

        <Card
          variant="elevated"
          onClick={() => router.push('/customer/documents')}
          className="p-5 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Secure
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Document Vault &bull; <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">ડિજિટલ તિજોરી</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aadhaar, PAN, Voter ID, રેશન કાર્ડ અને આવકના દાખલાની ડિજિટલ કોપી.
          </p>
        </Card>

        <Card
          variant="elevated"
          onClick={() => router.push('/customer/members')}
          className="p-5 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Family
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Family Members &bull; <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">કુટુંબ સભ્યો</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            કુટુંબના નોંધાયેલા સભ્યો અને તેમના સરકારી ઓળખપત્રોની ચકાસણી.
          </p>
        </Card>

        <Card
          variant="elevated"
          onClick={() => router.push('/customer/reminders')}
          className="p-5 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BellRing className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Alerts
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Service Alerts &bull; <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">સૂચનાઓ</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            તૈયાર થયેલા કાર્ડ/પ્રમાણપત્ર મેળવવાની તારીખ અને SMS સૂચનાઓ.
          </p>
        </Card>
      </div>

      {/* Latest Service Applications */}
      <Card variant="elevated" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Service Applications
            </h3>
            <p className="text-xs text-slate-500">Recent applications and document verification status</p>
          </div>
          <button
            onClick={() => router.push('/customer/visits')}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {visits.map((v) => (
            <div
              key={v.visit_no}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {v.visit_no}
                  </span>
                  <Badge variant="warning">{v.status}</Badge>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                  {v.service_name} &bull; {v.sub_service_name}
                </h4>
                <p className="text-xs text-slate-500">
                  Beneficiary: {v.family_member_name || v.customer_name}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">
                  Documents: {v.available_documents || 1}/{v.total_documents || 2} Ready
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Applied on {v.visit_date}
                </span>
              </div>
            </div>
          ))}

          {visits.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent service applications recorded.
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
