'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/api/services/customerService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { applicationService } from '@/api/services/applicationService';
import {
  Search,
  LayoutDashboard,
  Users,
  CalendarCheck,
  KanbanSquare,
  Receipt,
  FolderTree,
  UserCog,
  Settings,
  BellRing,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  X,
  User,
  ExternalLink,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIntake?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenIntake,
}) => {
  const router = useRouter();
  const { userRole } = useAuth();
  const [query, setQuery] = useState('');

  // Fetch entities for global search
  const { data: customers = [] } = useQuery({
    queryKey: ['global-search-customers'],
    queryFn: () => customerService.getCustomers(),
    enabled: isOpen && userRole !== 'customer',
  });

  const { data: services = [] } = useQuery({
    queryKey: ['global-search-services'],
    queryFn: () => baseServiceService.getServices(),
    enabled: isOpen,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['global-search-applications'],
    queryFn: () => applicationService.getApplications(),
    enabled: isOpen && userRole !== 'customer',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const basePrefix = userRole === 'customer' ? '/customer' : userRole === 'employee' ? '/staff' : '/admin';

  const navItems = [
    { title: 'Dashboard', desc: 'Analytics & Command Hub', href: `${basePrefix}/dashboard`, icon: LayoutDashboard },
    { title: 'Government Applications', desc: 'Full application lifecycle, verification & delivery', href: `${basePrefix}/applications`, icon: FileText },
    { title: 'Customers Directory', desc: 'Search & manage citizen families', href: `${basePrefix}/customers`, icon: Users },
    { title: 'Service Visits', desc: 'Customer visit intake wizard & checklist', href: `${basePrefix}/visits`, icon: CalendarCheck },
    { title: 'Pending Work Kanban', desc: 'Government portal progress tracker', href: `${basePrefix}/pending-work`, icon: KanbanSquare },
    { title: 'Digital Vault', desc: 'Secure repository for citizen KYC documents', href: `${basePrefix}/documents`, icon: ShieldCheck },
    { title: 'Financial Transactions', desc: 'Billing ledger, points, & wallet credits', href: `${basePrefix}/transactions`, icon: Receipt },
    { title: 'Citizen Reminders', desc: 'SMS alerts & customer follow-up feed', href: `${basePrefix}/reminders`, icon: BellRing },
    ...(userRole === 'admin'
      ? [
          { title: 'Service Catalog Manager', desc: 'Configure 45 services, fees, SLAs & required docs', href: '/admin/services', icon: FolderTree },
          { title: 'Employee Management', desc: 'Operator accounts & desk permissions', href: '/admin/employees', icon: UserCog },
        ]
      : userRole === 'employee'
      ? [
          { title: 'Services Catalog', desc: 'Service directory, requirements & fees', href: '/staff/services', icon: FolderTree },
          { title: 'HRMS & Attendance', desc: 'Punch attendance, holiday calendar & leaves', href: '/staff/hrms', icon: UserCog },
        ]
      : []),
    { title: 'System Settings', desc: 'Environment diagnostics, language & theme', href: `${basePrefix}/settings`, icon: Settings },
  ];

  const q = query.trim().toLowerCase();

  const filteredNav = navItems.filter(
    (item) =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
  );

  const matchedCustomers = !q
    ? []
    : customers.filter(
        (c) =>
          c.head_of_family.toLowerCase().includes(q) ||
          c.mobile_number.includes(q) ||
          c.family_id.toLowerCase().includes(q) ||
          c.village_city.toLowerCase().includes(q)
      ).slice(0, 4);

  const matchedServices = !q
    ? []
    : services.filter(
        (s) =>
          s.ServiceName.toLowerCase().includes(q) ||
          (s.ServiceNameGu && s.ServiceNameGu.toLowerCase().includes(q)) ||
          (s.Category && s.Category.toLowerCase().includes(q))
      ).slice(0, 4);

  const matchedApplications = !q
    ? []
    : applications.filter(
        (a) =>
          a.application_no.toLowerCase().includes(q) ||
          a.customer_name?.toLowerCase().includes(q) ||
          a.applicant_name?.toLowerCase().includes(q) ||
          a.customer_family_id?.toLowerCase().includes(q) ||
          a.service_name?.toLowerCase().includes(q)
      ).slice(0, 4);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search citizens, 45 government services, applications, or modules..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 max-h-[70vh]">
          {/* Matched Citizens */}
          {matchedCustomers.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Citizens & Families ({matchedCustomers.length})
              </div>
              {matchedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => handleSelect(`/admin/customers/${cust.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-brand-50/80 dark:hover:bg-brand-950/30 hover:border-brand-500/30 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {cust.head_of_family}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {cust.family_id} &bull; {cust.mobile_number} &bull; {cust.village_city}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          )}

          {/* Matched Government Services */}
          {matchedServices.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Government Services (45 Catalog)
              </div>
              {matchedServices.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => handleSelect(`${basePrefix}/applications`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {srv.ServiceName}{' '}
                        {srv.ServiceNameGu && (
                          <span className="text-brand-600 dark:text-brand-400 font-normal">
                            ({srv.ServiceNameGu})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gov Fee: ₹{srv.GovernmentFee ?? 0} &bull; Service Charge: ₹{srv.ServiceCharge ?? 50} &bull; {srv.SlaDays || 3}d SLA
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Start Intake &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Applications */}
          {matchedApplications.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Applications
              </div>
              {matchedApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleSelect(`${basePrefix}/applications`)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-blue-50/80 dark:hover:bg-blue-950/30 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {app.application_no} &bull; {app.applicant_name || app.customer_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.service_name} &bull; Status: {app.status}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          )}

          {/* Navigation Modules */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              System Modules
            </div>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  onClick={() => handleSelect(item.href)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
