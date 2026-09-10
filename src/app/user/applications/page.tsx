'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '@/components/user/UserLayout';
import { UserApplicationDetailModal } from '@/components/user/UserApplicationDetailModal';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import { applicationService } from '@/api/services/applicationService';
import { customerService } from '@/api/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { Application } from '@/types';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui';

type TabStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'REJECTED';

export default function UserApplicationsPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  // Fetch Family Data
  const { data: customer } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
  });

  // Fetch Applications
  const { data: allApplications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const myApplications = allApplications.filter(
    (app) => app.customer_family_id === familyId
  );

  // Real live applications list
  const displaySourceList: Application[] = myApplications;

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: displaySourceList.length,
      PENDING: displaySourceList.filter((a) => a.status === 'PENDING').length,
      APPROVED: displaySourceList.filter((a) => a.status === 'APPROVED' || a.status === 'COMPLETED').length,
      IN_PROGRESS: displaySourceList.filter((a) => (a.status as string) === 'IN_PROGRESS' || a.status === 'GOVERNMENT_PROCESSING' || a.status === 'SUBMITTED').length,
      REJECTED: displaySourceList.filter((a) => a.status === 'REJECTED').length,
    };
  }, [displaySourceList]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return displaySourceList.filter((app) => {
      // Tab filter
      if (activeTab === 'PENDING' && app.status !== 'PENDING') return false;
      if (activeTab === 'APPROVED' && app.status !== 'APPROVED' && app.status !== 'COMPLETED') return false;
      if (activeTab === 'IN_PROGRESS' && (app.status as string) !== 'IN_PROGRESS' && app.status !== 'GOVERNMENT_PROCESSING' && app.status !== 'SUBMITTED') return false;
      if (activeTab === 'REJECTED' && app.status !== 'REJECTED') return false;

      // Service filter
      if (serviceFilter !== 'ALL' && app.category !== serviceFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNo = app.application_no.toLowerCase().includes(q);
        const matchName = app.service_name.toLowerCase().includes(q);
        const matchApplicant = (app.applicant_name || '').toLowerCase().includes(q);
        if (!matchNo && !matchName && !matchApplicant) return false;
      }

      return true;
    });
  }, [displaySourceList, activeTab, serviceFilter, searchQuery]);

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

  return (
    <UserLayout familyId={customer?.family_id || familyId} headOfFamily={customer?.head_of_family}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              My Application &bull; <span className="text-blue-600 dark:text-blue-400">મારી અરજીઓ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live status tracking, timeline progress, and official receipts for government applications.
            </p>
          </div>
        </div>

        {/* Filter Tabs (Mockup Standard) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          {[
            { key: 'ALL', label: 'All Applications' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => {
            const count = tabCounts[tab.key as TabStatus];
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabStatus)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active
                      ? 'bg-blue-700/80 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Application ID, service name, or applicant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="REVENUE">Revenue Services (મહેસૂલ)</option>
              <option value="FOOD_CIVIL">Food & Civil Supplies (પુરવઠો)</option>
              <option value="HEALTH">Health & Birth (આરોગ્ય)</option>
              <option value="SOCIAL_JUSTICE">Social Justice (સમાજ કલ્યાણ)</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Application ID</th>
                  <th className="py-3 px-3">Service Name</th>
                  <th className="py-3 px-3">Applicant</th>
                  <th className="py-3 px-3">Applied Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No applications found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {app.application_no}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {app.service_name}
                        </span>
                        {app.service_name_gu && (
                          <span className="text-[10px] text-slate-400">
                            {app.service_name_gu}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {app.applicant_name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-3">{getStatusBadge(app.status)}</td>
                      <td className="py-3.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {app.updated_at
                          ? new Date(app.updated_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'Recent'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => setSelectedAppForReceipt(app)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
                            title="Print Receipt"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
