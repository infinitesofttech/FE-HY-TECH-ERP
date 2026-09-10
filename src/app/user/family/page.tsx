'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '@/components/user/UserLayout';
import { UserFamilyCard } from '@/components/user/UserFamilyCard';
import { AddFamilyMemberModal } from '@/components/user/AddFamilyMemberModal';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { documentService } from '@/api/services/documentService';
import { serviceVisitService } from '@/api/services/serviceVisitService';
import { CustomerDocument, FamilyMember } from '@/types';
import {
  Users,
  CreditCard,
  Wallet,
  UserPlus,
  FileCheck2,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Coins,
  ArrowRight,
  Sparkles,
  Award,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';

type FamilyTab = 'card' | 'member' | 'wallet';

export default function UserFamilyPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const [activeTab, setActiveTab] = useState<FamilyTab>('card');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMemberForDocs, setSelectedMemberForDocs] = useState<FamilyMember | null>(null);

  // Sync tab from URL query params (e.g. ?tab=card, ?tab=member, ?tab=wallet)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'member' || tabParam === 'members') {
        setActiveTab('member');
      } else if (tabParam === 'wallet' || tabParam === 'points') {
        setActiveTab('wallet');
      } else if (tabParam === 'card') {
        setActiveTab('card');
      }
    }
  }, []);

  const handleTabChange = (tab: FamilyTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Customer / Family Detail
  const { data: customer } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
  });

  // Household Members
  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
  });

  // Documents
  const { data: documents = [] } = useQuery({
    queryKey: ['customer-documents', familyId],
    queryFn: async () => {
      if (members.length > 0) {
        const promises = members.map((m) =>
          documentService.getDocuments(familyId, m.id).catch(() => [])
        );
        const res = await Promise.all(promises);
        return res.flat();
      }
      return documentService.getDocuments(familyId, 3).catch(() => []);
    },
  });

  // Service Visits for Wallet/Activity history
  const { data: visits = [] } = useQuery({
    queryKey: ['customer-visits', familyId],
    queryFn: async () => {
      const all = await serviceVisitService.getVisits();
      return all.filter((v) => v.customer_family_id === familyId);
    },
  });

  const getAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 'N/A';
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' yrs';
  };

  // Documents for selected member modal
  const memberDocs = selectedMemberForDocs
    ? documents.filter(
        (d) =>
          d.customer === selectedMemberForDocs.id ||
          (d as any).member_id === selectedMemberForDocs.id ||
          (d.member_name && d.member_name.toLowerCase().includes(selectedMemberForDocs.name.toLowerCase()))
      )
    : [];

  return (
    <UserLayout familyId={customer?.family_id || familyId} headOfFamily={customer?.head_of_family}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Family &bull; <span className="text-blue-600 dark:text-blue-400">કુટુંબ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select below to view Family Card, Family Members, or Family Wallet points.
            </p>
          </div>

          {activeTab === 'member' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Member / સભ્ય ઉમેરો
            </Button>
          )}
        </div>

        {/* 3 Prominent Section Tabs requested by user */}
        {/* * family - family card / family member / family wallet */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          {/* Tab 1: Family Card */}
          <button
            onClick={() => handleTabChange('card')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Family Card (ફેમિલી કાર્ડ)</span>
          </button>

          {/* Tab 2: Family Member */}
          <button
            onClick={() => handleTabChange('member')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'member'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family Member (કુટુંબ સભ્યો)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'member'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {members.length || 4}
            </span>
          </button>

          {/* Tab 3: Family Wallet */}
          <button
            onClick={() => handleTabChange('wallet')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Family Wallet (વોલેટ પોઈન્ટ્સ)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'wallet'
                  ? 'bg-blue-700 text-white'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}
            >
              {customer?.current_points ?? 250} Pts
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUB-PAGE 1: FAMILY CARD                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'card' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6">
                <UserFamilyCard customer={customer} />
              </div>

              {/* Family Information & Contact Details */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Family Card Details & Household Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Head of Family Name
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {customer?.head_of_family || '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Registered Family ID
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {customer?.family_id || familyId}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Primary Mobile
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {customer?.mobile_number || '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        WhatsApp Updates
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {customer?.whatsapp_number || customer?.mobile_number || '—'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Residential Address
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {customer?.village_city ? `${customer.village_city}, Gujarat` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Enrolled: {customer?.registration_date || '2025-08-01'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Official Active Family Card
                  </span>
                </div>
              </div>
            </div>

            {/* Family Documents Vault Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Family Document Vault ({documents.length} Verified Files)
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.slice(0, 6).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {doc.document_type_display || doc.document_type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {doc.document_name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Holder: <strong className="text-slate-700 dark:text-slate-300">{doc.member_name || 'Family Member'}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 2: FAMILY MEMBER                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'member' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Family Members Roster ({members.length} Registered)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Click &quot;&rarr; My Documents&quot; on any member to view their uploaded identity certificates.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(true)}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Add Family Member
                </Button>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Member Name</th>
                      <th className="py-3 px-3">Relationship</th>
                      <th className="py-3 px-3">Age / DOB</th>
                      <th className="py-3 px-3">Mobile Number</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Documents Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                                {m.name}
                              </span>
                              <span className="text-[10px] text-slate-400">ID #{m.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {m.relationship}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">{getAge(m.birth_date)}</span>
                          {m.birth_date && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {m.birth_date}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {m.mobile_number || 'Family Number'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {/* Note requirement: Family Member -> My Documents */}
                          <button
                            onClick={() => setSelectedMemberForDocs(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all cursor-pointer shadow-2xs border border-blue-200 dark:border-blue-800"
                          >
                            <span>&rarr; My Documents</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-PAGE 3: FAMILY WALLET                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fade-in">
            {/* Wallet Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Available Loyalty Points
                  </span>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {customer?.current_points ?? 250}{' '}
                    <span className="text-sm font-semibold text-slate-500">Pts</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Active & Redeemable</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Preloaded Store Credit
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                    ₹{customer?.wallet_balance ?? '0.00'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Use for service desk billing</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total Completed Visits
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                    {customer?.total_visits ?? 2}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Document center visits</span>
                </div>
              </div>
            </div>

            {/* How Loyalty Points Work Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/20 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Family Points & Rewards Policy (વોલેટ પોઈન્ટ્સના લાભો)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 space-y-1">
                  <span className="font-black text-amber-700 dark:text-amber-300 block text-sm">+20 Points</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">New Government Scheme</span>
                  <p className="text-slate-500">Every revenue or welfare application applied at center desk earns 20 points.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 space-y-1">
                  <span className="font-black text-emerald-700 dark:text-emerald-300 block text-sm">Instant Redeem</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Bill Discount</span>
                  <p className="text-slate-500">Points can be redeemed to pay service charges, smart card lamination, and forms.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 space-y-1">
                  <span className="font-black text-blue-700 dark:text-blue-300 block text-sm">Family Shared</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Household Wallet</span>
                  <p className="text-slate-500">Points belong to the entire family (#{customer?.family_id || familyId}) and any member can use them.</p>
                </div>
              </div>
            </div>

            {/* Wallet Activity History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Wallet & Points Activity History
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Family #{customer?.family_id || familyId}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Service / Activity</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Points Earned / Used</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-slate-500">22 Aug 2025</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        Income Certificate Application
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          CREDIT
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 font-mono">
                        +20 Pts
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-emerald-600 font-semibold">Credited</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-slate-500">18 Aug 2025</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        Caste Certificate Application
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          CREDIT
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 font-mono">
                        +20 Pts
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-emerald-600 font-semibold">Credited</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-slate-500">01 Aug 2025</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        Family Onboarding & Vault Sync
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          BONUS
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-600 font-mono">
                        +210 Pts
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-emerald-600 font-semibold">Credited</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddFamilyMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        familyId={customer?.family_id || familyId}
      />

      {/* Member -> My Documents Modal */}
      {selectedMemberForDocs && (
        <Modal
          isOpen={!!selectedMemberForDocs}
          onClose={() => setSelectedMemberForDocs(null)}
          title={`${selectedMemberForDocs.name}'s Verified Documents`}
          description={`Registered dependent under Family #${customer?.family_id || familyId}`}
          maxWidth="lg"
        >
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  {selectedMemberForDocs.name}
                </span>
                <span className="text-slate-500">
                  Relation: <strong>{selectedMemberForDocs.relationship}</strong> &bull; Mobile:{' '}
                  <strong>{selectedMemberForDocs.mobile_number || 'Family Number'}</strong>
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Active Member
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Stored Digital Vault Documents:
              </h4>

              {memberDocs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  No individual documents uploaded yet for {selectedMemberForDocs.name}.
                  Visit center desk with original Aadhaar to add to vault.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memberDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {doc.document_type_display || doc.document_type}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {doc.document_name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Doc ID #{doc.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedMemberForDocs(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </UserLayout>
  );
}
