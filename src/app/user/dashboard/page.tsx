'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '@/components/user/UserLayout';
import { UserFamilyCard } from '@/components/user/UserFamilyCard';
import { UserApplicationDetailModal } from '@/components/user/UserApplicationDetailModal';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { applicationService } from '@/api/services/applicationService';
import { documentService } from '@/api/services/documentService';
import { Application } from '@/types';
import {
  FileText,
  Users,
  Wallet,
  ArrowRight,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  FileCheck,
  Award,
  ScrollText,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Baby,
  Briefcase,
  Layers,
} from 'lucide-react';

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState({
    date: 'Monday, 25 Aug 2025',
    time: '04:32 PM',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Family Data
  const { data: customer } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
  });

  // Fetch Family Members
  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: () => familyMemberService.getMembers(familyId),
  });

  // Fetch Documents
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

  // Fetch Applications
  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const myApplications = allApplications.filter(
    (app) => app.customer_family_id === familyId
  );

  // Fallback demo recent applications matching mockup if empty
  const recentApplications: Application[] = myApplications.length > 0
    ? myApplications.slice(0, 5)
    : [
        {
          id: 101,
          application_no: 'APP20250032',
          service_name: 'Income Certificate',
          category: 'REVENUE',
          applicant_name: customer?.head_of_family || 'Rajesh Patel',
          customer_family_id: familyId,
          status: 'PENDING',
          created_at: '2025-08-22T10:30:00.000Z',
          expected_date: '2025-08-28',
          amount: 50,
          payment_status: 'PAID',
        },
        {
          id: 102,
          application_no: 'APP20250028',
          service_name: 'Caste Certificate',
          category: 'REVENUE',
          applicant_name: customer?.head_of_family || 'Rajesh Patel',
          customer_family_id: familyId,
          status: 'APPROVED',
          created_at: '2025-08-18T11:00:00.000Z',
          expected_date: '2025-08-24',
          amount: 50,
          payment_status: 'PAID',
        },
        {
          id: 103,
          application_no: 'APP20250024',
          service_name: 'Ration Card Update',
          category: 'FOOD_CIVIL',
          applicant_name: customer?.head_of_family || 'Rajesh Patel',
          customer_family_id: familyId,
          status: 'GOVERNMENT_PROCESSING' as any,
          created_at: '2025-08-12T09:15:00.000Z',
          expected_date: '2025-08-20',
          amount: 70,
          payment_status: 'PAID',
        },
        {
          id: 104,
          application_no: 'APP20250020',
          service_name: 'Residence Certificate',
          category: 'REVENUE',
          applicant_name: customer?.head_of_family || 'Rajesh Patel',
          customer_family_id: familyId,
          status: 'APPROVED',
          created_at: '2025-08-05T14:45:00.000Z',
          expected_date: '2025-08-11',
          amount: 50,
          payment_status: 'PAID',
        },
        {
          id: 105,
          application_no: 'APP20250016',
          service_name: 'Birth Certificate',
          category: 'HEALTH',
          applicant_name: customer?.head_of_family || 'Rajesh Patel',
          customer_family_id: familyId,
          status: 'REJECTED',
          created_at: '2025-07-28T16:00:00.000Z',
          expected_date: '2025-08-02',
          amount: 50,
          payment_status: 'PAID',
        },
      ];

  const quickServices = [
    {
      name: 'Income Certificate',
      desc: 'Apply for income certificate',
      icon: ScrollText,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      href: '/user/services?category=income',
    },
    {
      name: 'Caste Certificate',
      desc: 'Apply for caste certificate',
      icon: Award,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      href: '/user/services?category=caste',
    },
    {
      name: 'Ration Card',
      desc: 'Apply for ration card',
      icon: FileSpreadsheet,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      href: '/user/services?category=ration',
    },
    {
      name: 'Residence Certificate',
      desc: 'Apply for residence certificate',
      icon: Home,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      href: '/user/services?category=residence',
    },
    {
      name: 'Birth / Death Certificate',
      desc: 'Apply for birth or death certificate',
      icon: Baby,
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
      href: '/user/services?category=civil',
    },
    {
      name: 'Other Services',
      desc: 'View all available services',
      icon: Briefcase,
      color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      href: '/user/services',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Approved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            In Progress
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Pending
          </span>
        );
    }
  };

  const displayName = customer?.head_of_family || 'Rajesh Patel';

  return (
    <UserLayout familyId={customer?.family_id || familyId} headOfFamily={displayName}>
      <div className="space-y-6">
        {/* Welcome Header (Mockup Replica) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Welcome back, {displayName}!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Here&apos;s an overview of your family information and services.
            </p>
          </div>

          {/* Date & Time pill */}
          <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs self-start md:self-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentDateTime.date}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentDateTime.time}</span>
            </div>
          </div>
        </div>

        {/* ROW 1: Family Card (Left) + 4 Summary Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Family Card */}
          <div className="lg:col-span-7">
            <UserFamilyCard customer={customer} />
          </div>

          {/* 4 Summary Cards in 2x2 Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. My Documents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/50 transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    My Documents
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
                    {documents.length || 5}
                  </span>
                </div>
              </div>
              <Link
                href="/user/family"
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 2. Family Members */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Family Members
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
                    {members.length || 4}
                  </span>
                </div>
              </div>
              <Link
                href="/user/family"
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 3. Wallet Points */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Wallet Points
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
                    {customer?.current_points ?? 250}
                  </span>
                </div>
              </div>
              <div
                onClick={() => router.push('/user/settings')}
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. My Application */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-purple-500/50 transition-all group">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    My Application
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
                    {myApplications.length || 3}
                  </span>
                </div>
              </div>
              <Link
                href="/user/applications"
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: Recent Applications (Left) + Quick Services (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Recent Applications Table */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Applications
                </h2>
              </div>
              <Link
                href="/user/applications"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-2">Application ID</th>
                    <th className="py-3 px-2">Service Name</th>
                    <th className="py-3 px-2">Applied Date</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {app.application_no}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200">
                        {app.service_name}
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-2">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Quick Services (6-Card Grid) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick Services
                </h2>
              </div>
              <Link
                href="/user/services"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.name}
                    href={service.href}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3 group hover:shadow-2xs bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="space-y-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${service.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      <UserApplicationDetailModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
        onPrintReceipt={(app) => {
          setSelectedApp(null);
          setSelectedAppForReceipt(app);
        }}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />
    </UserLayout>
  );
}
