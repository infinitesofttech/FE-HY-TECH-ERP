'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  Modal,
} from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { ContactInquiry } from '@/types';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  User,
  ExternalLink,
  Calendar,
  Sparkles,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';

const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    id: 1,
    full_name: 'Bipinbhai Patel',
    mobile_number: '9825123450',
    email: 'bipin.patel@gmail.com',
    subject: 'Aadhaar Card Address Update',
    service_interest: 'Aadhaar Card Correction',
    message: 'Need urgent appointment for updating address in Aadhaar card for 3 family members.',
    created_at: '2026-09-08 14:30',
    status: 'NEW',
    notes: 'Requested callback after 4 PM',
  },
  {
    id: 2,
    full_name: 'Dineshbhai Changani',
    mobile_number: '9898012345',
    email: 'dinesh.c@yahoo.com',
    subject: 'Income Certificate Documentation',
    service_interest: 'Income Certificate (આવકનો દાખલો)',
    message: 'What documents are required for digital Gujarat income certificate? Please send checklist on WhatsApp.',
    created_at: '2026-09-08 11:15',
    status: 'CONTACTED',
    notes: 'Document list sent via WhatsApp',
  },
  {
    id: 3,
    full_name: 'Pravinbhai Shah',
    mobile_number: '9724056789',
    email: 'pravin.shah@gmail.com',
    subject: 'Ration Card Name Addition',
    service_interest: 'Ration Card Member Addition',
    message: 'Want to add new daughter-in-law name to ration card. Have marriage certificate ready.',
    created_at: '2026-09-07 16:45',
    status: 'NEW',
    notes: 'Pending initial call',
  },
  {
    id: 4,
    full_name: 'Hansaben Vora',
    mobile_number: '9824498765',
    subject: 'Senior Citizen Card Application',
    service_interest: 'Senior Citizen ID',
    message: 'Please guide how to apply for state senior citizen bus concession pass and ID card.',
    created_at: '2026-09-06 10:20',
    status: 'RESOLVED',
    notes: 'Application completed at center on Sept 7',
  },
];

export default function ContactUsInquiriesPage() {
  const { language } = useLanguage();
  const isGu = language === 'gu';

  const [inquiries, setInquiries] = useState<ContactInquiry[]>(INITIAL_INQUIRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'RESOLVED'>('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'NEW').length;
    const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
    const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;
    return { total, newCount, contactedCount, resolvedCount };
  }, [inquiries]);

  // Filtered list
  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        inq.full_name.toLowerCase().includes(q) ||
        inq.mobile_number.includes(q) ||
        (inq.subject && inq.subject.toLowerCase().includes(q)) ||
        (inq.service_interest && inq.service_interest.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [inquiries, statusFilter, searchQuery]);

  const handleUpdateStatus = (id: number, newStatus: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
    setInquiries((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
    );
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(
      isGu
        ? `સ્થિતિ અપડેટ થઈ: ${newStatus === 'RESOLVED' ? 'પૂર્ણ' : newStatus === 'CONTACTED' ? 'સંપર્ક કર્યો' : 'નવી'}`
        : `Status updated to ${newStatus}`
    );
  };

  const handleOpenWhatsApp = (mobile: string, name: string) => {
    const cleanMobile = mobile.replace(/\D/g, '');
    const phoneWithCountry = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      isGu
        ? `નમસ્તે ${name}, HY-TECH ગવર્નમેન્ટ સર્વિસ સેન્ટર તરફથી તમારી વેબસાઇટ ઇન્ક્વાયરીના સંદર્ભમાં સંપર્ક કર્યો છે. અમે તમને કેવી રીતે મદદ કરી શકીએ?`
        : `Hello ${name}, Greetings from HY-TECH Government Service Center regarding your website inquiry. How can we assist you today?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <AppShell allowedRoles={['admin', 'hr']}>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Mail className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isGu ? 'વેબસાઇટ કોન્ટેક્ટ ઇન્ક્વાયરી લિસ્ટ' : 'Website Contact Inquiries'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isGu
                ? 'વેબસાઇટ "Contact Us" ફોર્મ દ્વારા નાગરિકો તરફથી આવેલી પૂછપરછ અને લીડ્સનું સંચાલન'
                : 'Manage public citizen inquiries and leads submitted through the website contact form'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>{isGu ? 'લાઈવ વેબસાઇટ જુઓ' : 'View Public Website'}</span>
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="elevated" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isGu ? 'કુલ ઇન્ક્વાયરી' : 'Total Inquiries'}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.total}
            </span>
          </Card>

          <Card variant="elevated" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {isGu ? 'નવી પૂછપરછ (New)' : 'New Inquiries'}
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {stats.newCount}
            </span>
          </Card>

          <Card variant="elevated" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              {isGu ? 'સંપર્ક કરેલ (Contacted)' : 'Contacted'}
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {stats.contactedCount}
            </span>
          </Card>

          <Card variant="elevated" className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {isGu ? 'પૂર્ણ થયેલ (Resolved)' : 'Resolved'}
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.resolvedCount}
            </span>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isGu ? 'નામ, મોબાઇલ અથવા સેવા દ્વારા સર્ચ...' : 'Search by name, mobile, service...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 self-stretch sm:self-auto overflow-x-auto">
            {(['ALL', 'NEW', 'CONTACTED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? isGu ? 'બધી' : 'All'
                  : st === 'NEW'
                  ? isGu ? 'નવી' : 'New'
                  : st === 'CONTACTED'
                  ? isGu ? 'સંપર્ક કરેલ' : 'Contacted'
                  : isGu ? 'પૂર્ણ' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">{isGu ? 'નાગરિક નામ' : 'Citizen Name'}</th>
                  <th className="py-3.5 px-4">{isGu ? 'મોબાઇલ નંબર' : 'Mobile'}</th>
                  <th className="py-3.5 px-4">{isGu ? 'વિષય / સેવા' : 'Subject / Service'}</th>
                  <th className="py-3.5 px-4">{isGu ? 'સંદેશ' : 'Message'}</th>
                  <th className="py-3.5 px-4">{isGu ? 'તારીખ' : 'Date'}</th>
                  <th className="py-3.5 px-4">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isGu ? 'ક્રિયા' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      {isGu ? 'કોઈ ઇન્ક્વાયરી મળી નથી' : 'No inquiries found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-900 dark:text-white">
                          {inq.full_name}
                        </div>
                        {inq.email && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {inq.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span>{inq.mobile_number}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {inq.service_interest || inq.subject}
                        </span>
                        {inq.service_interest && inq.subject && inq.subject !== inq.service_interest && (
                          <span className="text-[10px] text-slate-400 block">{inq.subject}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="truncate text-slate-600 dark:text-slate-400" title={inq.message}>
                          {inq.message}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {inq.created_at}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            inq.status === 'RESOLVED'
                              ? 'success'
                              : inq.status === 'CONTACTED'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {inq.status === 'RESOLVED'
                            ? isGu ? 'પૂર્ણ' : 'Resolved'
                            : inq.status === 'CONTACTED'
                            ? isGu ? 'સંપર્ક કર્યો' : 'Contacted'
                            : isGu ? 'નવી' : 'New'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick WhatsApp Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(inq.mobile_number, inq.full_name)}
                            title="WhatsApp Chat"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Call Action */}
                          <a
                            href={`tel:${inq.mobile_number}`}
                            title="Call Citizen"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* View Detail Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

        {/* Details & Status Change Modal */}
        {selectedInquiry && (
          <Modal
            isOpen={!!selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
            title={isGu ? 'ઇન્ક્વાયરી વિગત & ફોલોઅપ' : 'Inquiry Details & Follow-up'}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {selectedInquiry.full_name}
                  </h3>
                  <Badge
                    variant={
                      selectedInquiry.status === 'RESOLVED'
                        ? 'success'
                        : selectedInquiry.status === 'CONTACTED'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {selectedInquiry.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  📱 {selectedInquiry.mobile_number} {selectedInquiry.email ? `• ✉️ ${selectedInquiry.email}` : ''}
                </div>
                <div className="text-xs font-bold text-brand-600 dark:text-brand-400 pt-1">
                  {selectedInquiry.service_interest || selectedInquiry.subject}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {isGu ? 'નાગરિકનો સંદેશ:' : 'Citizen Message:'}
                </label>
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
                  {selectedInquiry.message}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {isGu ? 'સ્થિતિ અપડેટ કરો:' : 'Change Status:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'NEW')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedInquiry.status === 'NEW'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isGu ? 'નવી (New)' : 'New'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'CONTACTED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedInquiry.status === 'CONTACTED'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isGu ? 'સંપર્ક કર્યો (Contacted)' : 'Contacted'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'RESOLVED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedInquiry.status === 'RESOLVED'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isGu ? 'પૂર્ણ (Resolved)' : 'Resolved'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenWhatsApp(selectedInquiry.mobile_number, selectedInquiry.full_name)}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  WhatsApp Reply
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedInquiry(null)}
                >
                  {isGu ? 'બંધ કરો' : 'Close'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
