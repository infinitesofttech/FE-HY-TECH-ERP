'use client';

import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { toast } from 'sonner';
import {
  FileCheck,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Building2,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface HRReportsViewProps {
  currentTab: string;
}

// -------------------------------------------------------------
// 1. MOCK DATASETS
// -------------------------------------------------------------

export const MOCK_ATTENDANCE_REPORT = [
  {
    code: 'EMP-001',
    name: 'Admin Manager',
    nameGu: 'સંચાલક એડમિન',
    role: 'Center Head & System Administrator',
    dept: 'Management & IT',
    workingDays: 24,
    presentDays: 24,
    leaves: 0,
    absent: 0,
    hours: 216,
    overtime: 12,
    rate: 100,
    status: 'OPTIMAL',
  },
  {
    code: 'EMP-002',
    name: 'Jadav Durgesh',
    nameGu: 'જાદવ દુર્ગેશ',
    role: 'Senior Aadhaar & Revenue Portal Operator',
    dept: 'Front-Desk Operations',
    workingDays: 24,
    presentDays: 23,
    leaves: 1,
    absent: 0,
    hours: 194,
    overtime: 8,
    rate: 96,
    status: 'OPTIMAL',
  },
  {
    code: 'EMP-003',
    name: 'Hardikbhai Patel',
    nameGu: 'હાર્દિકભાઈ પટેલ',
    role: 'Digital Gujarat & Scholarship Specialist',
    dept: 'Scheme & Welfare Desk',
    workingDays: 24,
    presentDays: 22,
    leaves: 2,
    absent: 0,
    hours: 186,
    overtime: 4,
    rate: 92,
    status: 'COMPLIANT',
  },
  {
    code: 'EMP-004',
    name: 'Vinesh Sharma',
    nameGu: 'વિનેશ શર્મા',
    role: 'PAN Card, Passport & Voter ID Executive',
    dept: 'Identity Card Services',
    workingDays: 24,
    presentDays: 23,
    leaves: 1,
    absent: 0,
    hours: 192,
    overtime: 6,
    rate: 96,
    status: 'OPTIMAL',
  },
  {
    code: 'EMP-005',
    name: 'Ravi Makwana',
    nameGu: 'રવિ મકવાણા',
    role: 'Farmer Schemes & e-KYC Officer',
    dept: 'Agriculture & PM Kisan',
    workingDays: 24,
    presentDays: 23,
    leaves: 1,
    absent: 0,
    hours: 190,
    overtime: 5,
    rate: 96,
    status: 'OPTIMAL',
  },
  {
    code: 'EMP-006',
    name: 'Mitali Changani',
    nameGu: 'મીતાલી ચાંગાણી',
    role: 'Revenue Documents & Land Records Desk',
    dept: 'Revenue & Certified Copies',
    workingDays: 24,
    presentDays: 24,
    leaves: 0,
    absent: 0,
    hours: 204,
    overtime: 10,
    rate: 100,
    status: 'OPTIMAL',
  },
  {
    code: 'EMP-007',
    name: 'Bhavik Changani',
    nameGu: 'ભાવિક ચાંગાણી',
    role: 'Intake Operator & Cashier',
    dept: 'Front-Desk Operations',
    workingDays: 24,
    presentDays: 22,
    leaves: 1,
    absent: 1,
    hours: 178,
    overtime: 2,
    rate: 91,
    status: 'NOTICE',
  },
  {
    code: 'EMP-008',
    name: 'Pooja Solanki',
    nameGu: 'પૂજા સોલંકી',
    role: 'Front Desk Receptionist & Helpdesk',
    dept: 'Front-Desk Operations',
    workingDays: 24,
    presentDays: 24,
    leaves: 0,
    absent: 0,
    hours: 192,
    overtime: 3,
    rate: 100,
    status: 'OPTIMAL',
  },
];

export const MOCK_LEAVE_REPORT = [
  {
    id: 'LV-2026-091',
    name: 'Hardikbhai Patel',
    nameGu: 'હાર્દિકભાઈ પટેલ',
    role: 'Digital Gujarat Specialist',
    type: 'Casual Leave (CL)',
    fromDate: '12 Sep 2026',
    toDate: '13 Sep 2026',
    days: 2,
    reason: 'Family religious ceremony in hometown village',
    appliedOn: '08 Sep 2026',
    approver: 'Admin Manager',
    status: 'PENDING',
  },
  {
    id: 'LV-2026-092',
    name: 'Vinesh Sharma',
    nameGu: 'વિનેશ શર્મા',
    role: 'Identity Card Services',
    type: 'Medical Leave (ML)',
    fromDate: '04 Sep 2026',
    toDate: '04 Sep 2026',
    days: 1,
    reason: 'Severe viral fever with verified doctor certificate',
    appliedOn: '03 Sep 2026',
    approver: 'Admin Manager',
    status: 'APPROVED',
  },
  {
    id: 'LV-2026-093',
    name: 'Jadav Durgesh',
    nameGu: 'જાદવ દુર્ગેશ',
    role: 'Senior Aadhaar Operator',
    type: 'Privilege Leave (PL)',
    fromDate: '01 Sep 2026',
    toDate: '01 Sep 2026',
    days: 1,
    reason: 'UIDAI district supervisor accreditation exam',
    appliedOn: '28 Aug 2026',
    approver: 'Admin Manager',
    status: 'APPROVED',
  },
  {
    id: 'LV-2026-094',
    name: 'Bhavik Changani',
    nameGu: 'ભાવિક ચાંગાણી',
    role: 'Intake Operator',
    type: 'Emergency Leave',
    fromDate: '02 Sep 2026',
    toDate: '02 Sep 2026',
    days: 1,
    reason: 'Urgent municipal household water connection pipeline repair',
    appliedOn: '02 Sep 2026',
    approver: 'Admin Manager',
    status: 'APPROVED',
  },
  {
    id: 'LV-2026-095',
    name: 'Ravi Makwana',
    nameGu: 'રવિ મકવાણા',
    role: 'Farmer Schemes Officer',
    type: 'Casual Leave (CL)',
    fromDate: '05 Sep 2026',
    toDate: '05 Sep 2026',
    days: 1,
    reason: 'Sub-district taluka agricultural camp meeting',
    appliedOn: '02 Sep 2026',
    approver: 'Admin Manager',
    status: 'APPROVED',
  },
  {
    id: 'LV-2026-096',
    name: 'Bhavik Changani',
    nameGu: 'ભાવિક ચાંગાણી',
    role: 'Intake Operator',
    type: 'Casual Leave (CL)',
    fromDate: '18 Sep 2026',
    toDate: '21 Sep 2026',
    days: 4,
    reason: 'Outstation leisure travel during peak festival rush',
    appliedOn: '06 Sep 2026',
    approver: 'Admin Manager',
    status: 'REJECTED',
  },
  {
    id: 'LV-2026-097',
    name: 'Hardikbhai Patel',
    nameGu: 'હાર્દિકભાઈ પટેલ',
    role: 'Digital Gujarat Specialist',
    type: 'Compensatory Off',
    fromDate: '25 Aug 2026',
    toDate: '25 Aug 2026',
    days: 1,
    reason: 'Worked full Sunday shift during citizen Aadhaar camp',
    appliedOn: '24 Aug 2026',
    approver: 'Admin Manager',
    status: 'APPROVED',
  },
];

export const MOCK_EMPLOYEE_REPORT = [
  {
    code: 'EMP-001',
    name: 'Admin Manager',
    nameGu: 'સંચાલક એડમિન',
    username: 'admin',
    role: 'ADMIN',
    designation: 'Center Head & System Administrator',
    dept: 'Management & IT',
    mobile: '9876543210',
    joiningDate: '01 Jan 2024',
    salary: 35000,
    portalId: 'UIDAI-CH-001',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-002',
    name: 'Jadav Durgesh',
    nameGu: 'જાદવ દુર્ગેશ',
    username: 'jadav_durgesh',
    role: 'STAFF',
    designation: 'Senior Aadhaar & Revenue Portal Operator',
    dept: 'Front-Desk Operations',
    mobile: '9825123450',
    joiningDate: '15 Mar 2024',
    salary: 22000,
    portalId: 'UIDAI-OP-9941',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-003',
    name: 'Hardikbhai Patel',
    nameGu: 'હાર્દિકભાઈ પટેલ',
    username: 'hardik_patel',
    role: 'STAFF',
    designation: 'Digital Gujarat & Scholarship Specialist',
    dept: 'Scheme & Welfare Desk',
    mobile: '9879011223',
    joiningDate: '01 Jun 2024',
    salary: 20000,
    portalId: 'DS-GUJ-7712',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-004',
    name: 'Vinesh Sharma',
    nameGu: 'વિનેશ શર્મા',
    username: 'vinesh_sharma',
    role: 'STAFF',
    designation: 'PAN Card, Passport & Voter ID Executive',
    dept: 'Identity Card Services',
    mobile: '9904556677',
    joiningDate: '10 Aug 2024',
    salary: 19000,
    portalId: 'NSDL-PAN-5510',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-005',
    name: 'Ravi Makwana',
    nameGu: 'રવિ મકવાણા',
    username: 'ravi_makwana',
    role: 'STAFF',
    designation: 'Farmer Schemes & e-KYC Officer',
    dept: 'Agriculture & PM Kisan',
    mobile: '9723445566',
    joiningDate: '01 Nov 2024',
    salary: 18500,
    portalId: 'PMKISAN-GUJ-402',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-006',
    name: 'Mitali Changani',
    nameGu: 'મીતાલી ચાંગાણી',
    username: 'mitali_changani',
    role: 'STAFF',
    designation: 'Revenue Documents & Land Records Desk',
    dept: 'Revenue & Certified Copies',
    mobile: '9638112233',
    joiningDate: '01 Dec 2024',
    salary: 21000,
    portalId: 'ANYROR-REV-883',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-007',
    name: 'Bhavik Changani',
    nameGu: 'ભાવિક ચાંગાણી',
    username: 'bhavik_changani',
    role: 'STAFF',
    designation: 'Intake Operator & Cashier',
    dept: 'Front-Desk Operations',
    mobile: '9427001122',
    joiningDate: '15 Jan 2025',
    salary: 17500,
    portalId: 'DESK-CASH-101',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
  {
    code: 'EMP-008',
    name: 'Pooja Solanki',
    nameGu: 'પૂજા સોલંકી',
    username: 'pooja_solanki',
    role: 'STAFF',
    designation: 'Front Desk Receptionist & Helpdesk',
    dept: 'Front-Desk Operations',
    mobile: '9824009988',
    joiningDate: '01 Mar 2025',
    salary: 16000,
    portalId: 'HELP-DESK-201',
    kycStatus: 'VERIFIED',
    employmentType: 'Full-Time Regular',
    status: 'ACTIVE',
  },
];

export const MOCK_LATE_COMING_REPORT = [
  {
    id: 1,
    date: '08 Sep 2026',
    name: 'Vinesh Sharma',
    nameGu: 'વિનેશ શર્મા',
    dept: 'Identity Card Services',
    shift: '09:30 AM - 06:30 PM',
    punchIn: '09:48 AM',
    delayMinutes: 18,
    reason: 'Traffic delay at Botad railway junction crossing',
    graceApplied: 'Exceeded (3 mins over 15m grace)',
    action: 'First Notice Recorded',
    severity: 'WARNING',
  },
  {
    id: 2,
    date: '06 Sep 2026',
    name: 'Hardikbhai Patel',
    nameGu: 'હાર્દિકભાઈ પટેલ',
    dept: 'Scheme & Welfare Desk',
    shift: '09:30 AM - 06:30 PM',
    punchIn: '09:44 AM',
    delayMinutes: 14,
    reason: 'Torrential rain on rural highway transit',
    graceApplied: 'Within Grace (<15 Mins)',
    action: 'Grace Allowed',
    severity: 'NORMAL',
  },
  {
    id: 3,
    date: '04 Sep 2026',
    name: 'Jadav Durgesh',
    nameGu: 'જાદવ દુર્ગેશ',
    dept: 'Front-Desk Operations',
    shift: '09:30 AM - 06:30 PM',
    punchIn: '09:38 AM',
    delayMinutes: 8,
    reason: 'Urgent school drop-off for child',
    graceApplied: 'Within Grace (<15 Mins)',
    action: 'Grace Allowed',
    severity: 'NORMAL',
  },
  {
    id: 4,
    date: '03 Sep 2026',
    name: 'Bhavik Changani',
    nameGu: 'ભાવિક ચાંગાણી',
    dept: 'Front-Desk Operations',
    shift: '09:30 AM - 06:30 PM',
    punchIn: '09:42 AM',
    delayMinutes: 12,
    reason: 'Heavy village bus breakdown near Gadhada road',
    graceApplied: 'Within Grace (<15 Mins)',
    action: 'Grace Allowed',
    severity: 'NORMAL',
  },
  {
    id: 5,
    date: '02 Sep 2026',
    name: 'Ravi Makwana',
    nameGu: 'રવિ મકવાણા',
    dept: 'Agriculture & PM Kisan',
    shift: '10:00 AM - 07:00 PM',
    punchIn: '10:14 AM',
    delayMinutes: 14,
    reason: 'Tractor traffic congestion at APMC market gate',
    graceApplied: 'Within Grace (<15 Mins)',
    action: 'Grace Allowed',
    severity: 'NORMAL',
  },
  {
    id: 6,
    date: '01 Sep 2026',
    name: 'Vinesh Sharma',
    nameGu: 'વિનેશ શર્મા',
    dept: 'Identity Card Services',
    shift: '09:30 AM - 06:30 PM',
    punchIn: '09:50 AM',
    delayMinutes: 20,
    reason: 'Two-wheeler flat tire repair',
    graceApplied: 'Exceeded (5 mins over 15m grace)',
    action: 'Overtime Compensated',
    severity: 'WARNING',
  },
];

export const MOCK_MONTHLY_DEPARTMENTS = [
  {
    dept: 'UIDAI Aadhaar & Identity Desk',
    staffCount: 3,
    appsCompleted: 540,
    attendanceRate: 98.2,
    csat: 4.9,
    overtimeHours: 20,
    totalPayroll: 79000,
    efficiency: 'SUPERIOR',
  },
  {
    dept: 'Digital Gujarat & Student Schemes Desk',
    staffCount: 2,
    appsCompleted: 380,
    attendanceRate: 96.0,
    csat: 4.8,
    overtimeHours: 8,
    totalPayroll: 37500,
    efficiency: 'SUPERIOR',
  },
  {
    dept: 'PAN, Passport & Voter ID Desk',
    staffCount: 1,
    appsCompleted: 240,
    attendanceRate: 96.0,
    csat: 4.9,
    overtimeHours: 6,
    totalPayroll: 19000,
    efficiency: 'STANDARD',
  },
  {
    dept: 'Agriculture & PM Kisan Desk',
    staffCount: 1,
    appsCompleted: 160,
    attendanceRate: 96.0,
    csat: 4.8,
    overtimeHours: 5,
    totalPayroll: 18500,
    efficiency: 'STANDARD',
  },
  {
    dept: 'Front Desk Reception & Cash Counter',
    staffCount: 1,
    appsCompleted: 100,
    attendanceRate: 100.0,
    csat: 5.0,
    overtimeHours: 3,
    totalPayroll: 16000,
    efficiency: 'SUPERIOR',
  },
];

// -------------------------------------------------------------
// 2. MAIN COMPONENT
// -------------------------------------------------------------

export const HRReportsView: React.FC<HRReportsViewProps> = ({ currentTab }) => {
  const { language } = useLanguage();
  const isGu = language === 'gu';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

  // Trigger real CSV download
  const handleDownloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename}.csv exported successfully!`);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: ATTENDANCE REPORT
  // -------------------------------------------------------------
  if (currentTab === 'attendance-report') {
    const filtered = MOCK_ATTENDANCE_REPORT.filter((emp) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q);
      const matchTier =
        filterTier === 'ALL' ||
        (filterTier === '100' && emp.rate === 100) ||
        (filterTier === '95' && emp.rate >= 95 && emp.rate < 100) ||
        (filterTier === 'NOTICE' && emp.rate < 95);
      return matchSearch && matchTier;
    });

    const exportData = () => {
      handleDownloadCSV(
        'hytech_attendance_report_sep_2026',
        ['Code', 'Employee Name', 'Role', 'Department', 'Working Days', 'Present Days', 'Leaves', 'Absent', 'Total Hours', 'Overtime Hours', 'Attendance %', 'Status'],
        filtered.map((r) => [
          r.code,
          isGu ? r.nameGu : r.name,
          r.role,
          r.dept,
          r.workingDays,
          r.presentDays,
          r.leaves,
          r.absent,
          r.hours,
          r.overtime,
          `${r.rate}%`,
          r.status,
        ])
      );
    };

    return (
      <div className="space-y-4 animate-fade-in">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
              {isGu ? 'સરેરાશ હાજરી' : 'Average Attendance'}
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">96.4%</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+1.2% vs last month</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
              {isGu ? 'કુલ હાજર દિવસો' : 'Total Days Present'}
            </span>
            <div className="text-xl font-black text-blue-800 dark:text-blue-200 mt-0.5">185 / 192</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Across 8 staff members</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 block">
              {isGu ? 'ઓવરટાઇમ કલાકો' : 'Total Overtime'}
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-0.5">+40 Hours</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Special scheme drives</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300 block">
              {isGu ? 'મંજૂર રજાઓ' : 'Approved Leaves'}
            </span>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200 mt-0.5">6 Days</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">1 Unexcused absence</span>
          </div>
        </div>

        {/* Main Card with Toolbar & Table */}
        <Card variant="elevated" className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isGu ? 'હાજરી ઓડિટ રિપોર્ટ' : 'Workforce Attendance Report'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active Cycle: <strong>01 Sep 2026 - 30 Sep 2026</strong> &bull; Scope: Entire Center Workforce (8 Staff)
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="xs" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                {isGu ? 'પ્રિન્ટ' : 'Print'}
              </Button>
              <Button size="xs" variant="primary" onClick={exportData} leftIcon={<Download className="w-3.5 h-3.5" />}>
                {isGu ? 'એક્સેલ ડાઉનલોડ' : 'Download Excel'}
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isGu ? 'સ્ટાફનું નામ અથવા કોડ શોધો...' : 'Search employee by name, code or role...'}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{isGu ? 'સ્તર:' : 'Rate:'}</span>
              <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="text-xs py-1.5 font-bold">
                <option value="ALL">{isGu ? 'બધા દર (All)' : 'All Rates'}</option>
                <option value="100">100% Perfect</option>
                <option value="95">95% - 99% Optimal</option>
                <option value="NOTICE">&lt; 95% Needs Review</option>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3 text-center">Working Days</th>
                  <th className="py-3 px-3 text-center">Present</th>
                  <th className="py-3 px-3 text-center">Leaves</th>
                  <th className="py-3 px-3 text-center">Absent</th>
                  <th className="py-3 px-3 text-center">Logged Hours</th>
                  <th className="py-3 px-3 text-center">Overtime</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                {filtered.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                      {row.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isGu ? row.nameGu : row.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{row.role}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{row.workingDays}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {row.presentDays}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-purple-600 dark:text-purple-400">
                      {row.leaves}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-500">
                      {row.absent}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">
                      {row.hours}h
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                      +{row.overtime}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {row.rate}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.rate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          row.status === 'OPTIMAL'
                            ? 'success'
                            : row.status === 'COMPLIANT'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LEAVE REPORT
  // -------------------------------------------------------------
  if (currentTab === 'leave-report') {
    const filtered = MOCK_LEAVE_REPORT.filter((l) => {
      const q = searchTerm.toLowerCase();
      const match =
        l.name.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
      const matchStatus = filterTier === 'ALL' || l.status === filterTier;
      return match && matchStatus;
    });

    const exportData = () => {
      handleDownloadCSV(
        'hytech_leave_report_sep_2026',
        ['Leave ID', 'Staff Name', 'Category', 'From Date', 'To Date', 'Days', 'Reason', 'Applied Date', 'Approver', 'Status'],
        filtered.map((l) => [
          l.id,
          isGu ? l.nameGu : l.name,
          l.type,
          l.fromDate,
          l.toDate,
          l.days,
          l.reason,
          l.appliedOn,
          l.approver,
          l.status,
        ])
      );
    };

    return (
      <div className="space-y-4 animate-fade-in">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 block">
              {isGu ? 'કુલ અરજીઓ' : 'Total Applications'}
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-0.5">7 Requests</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">In current billing cycle</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
              {isGu ? 'મંજૂર રજાઓ' : 'Approved Requests'}
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">5 Approved</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Logged with attendance</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300 block">
              {isGu ? 'બાકી મંજૂરી' : 'Pending Approvals'}
            </span>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200 mt-0.5">1 Pending</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Action required by Admin</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
            <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-300 block">
              {isGu ? 'અસ્વીકાર થયેલ' : 'Rejected Requests'}
            </span>
            <div className="text-xl font-black text-rose-800 dark:text-rose-200 mt-0.5">1 Rejected</div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Peak rush week request</span>
          </div>
        </div>

        <Card variant="elevated" className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isGu ? 'સ્ટાફ રજા રિપોર્ટ' : 'Employee Leave Audit Log'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official statutory leaves, casual leaves (CL), and medical leaves registry
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="xs" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                {isGu ? 'પ્રિન્ટ' : 'Print'}
              </Button>
              <Button size="xs" variant="primary" onClick={exportData} leftIcon={<Download className="w-3.5 h-3.5" />}>
                {isGu ? 'એક્સેલ ડાઉનલોડ' : 'Download Excel'}
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isGu ? 'કર્મચારીનું નામ કે કારણ શોધો...' : 'Search by employee name, leave ID or reason...'}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{isGu ? 'સ્થિતિ:' : 'Status:'}</span>
              <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="text-xs py-1.5 font-bold">
                <option value="ALL">{isGu ? 'બધી સ્થિતિ (All)' : 'All Statuses'}</option>
                <option value="APPROVED">APPROVED (મંજૂર)</option>
                <option value="PENDING">PENDING (બાકી)</option>
                <option value="REJECTED">REJECTED (અસ્વીકાર)</option>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Leave ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Period & Duration</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-3">Approver</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {row.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isGu ? row.nameGu : row.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{row.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{row.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {row.fromDate} - {row.toDate}
                      </div>
                      <span className="text-[11px] font-bold text-brand-600">
                        {row.days} {row.days === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-500 dark:text-slate-400 truncate" title={row.reason}>
                      {row.reason}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                      {row.approver}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={
                          row.status === 'APPROVED'
                            ? 'success'
                            : row.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: EMPLOYEE REPORT
  // -------------------------------------------------------------
  if (currentTab === 'employee-report') {
    const filtered = MOCK_EMPLOYEE_REPORT.filter((e) => {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.portalId.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q)
      );
    });

    const exportData = () => {
      handleDownloadCSV(
        'hytech_employee_master_report_2026',
        ['Code', 'Name', 'Username', 'Role', 'Designation', 'Department', 'Mobile', 'Joining Date', 'Monthly Salary (INR)', 'Govt Portal ID', 'KYC Status'],
        filtered.map((e) => [
          e.code,
          isGu ? e.nameGu : e.name,
          e.username,
          e.role,
          e.designation,
          e.dept,
          e.mobile,
          e.joiningDate,
          e.salary,
          e.portalId,
          e.kycStatus,
        ])
      );
    };

    return (
      <div className="space-y-4 animate-fade-in">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <span className="text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300 block">
              {isGu ? 'કુલ કર્મચારીઓ' : 'Total Employees'}
            </span>
            <div className="text-xl font-black text-indigo-800 dark:text-indigo-200 mt-0.5">8 Staff</div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">100% Biometric Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
              {isGu ? 'KYC ચકાસણી' : 'KYC Compliance'}
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">100% Verified</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Aadhaar &amp; PAN authenticated</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
              {isGu ? 'સરેરાશ પગાર' : 'Average Compensation'}
            </span>
            <div className="text-xl font-black text-blue-800 dark:text-blue-200 mt-0.5">₹23,500 / mo</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Disbursed by 1st of month</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 block">
              {isGu ? 'સરેરાશ કાર્યકાળ' : 'Average Tenure'}
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 mt-0.5">1.8 Years</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Zero voluntary turnover</span>
          </div>
        </div>

        <Card variant="elevated" className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isGu ? 'કર્મચારી માસ્ટર રિપોર્ટ' : 'Employee Master Directory Report'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive human resources roster with operator credentials &amp; desk allocations
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="xs" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                {isGu ? 'પ્રિન્ટ' : 'Print'}
              </Button>
              <Button size="xs" variant="primary" onClick={exportData} leftIcon={<Download className="w-3.5 h-3.5" />}>
                {isGu ? 'એક્સેલ ડાઉનલોડ' : 'Download Excel'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isGu ? 'નામ, ડેસ્ક, યૂઝરનેમ કે પોર્ટલ ID શોધો...' : 'Search by name, designation, portal ID or phone...'}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department &amp; Desk</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-3">Govt Operator ID</th>
                  <th className="py-3 px-3 text-right">Base Salary</th>
                  <th className="py-3 px-4 text-right">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                {filtered.map((emp) => (
                  <tr key={emp.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {emp.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isGu ? emp.nameGu : emp.name}
                      </div>
                      <div className="text-[11px] text-slate-400">@{emp.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.designation}</div>
                      <div className="text-[11px] text-brand-600 dark:text-brand-400">{emp.dept}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.mobile}</span>
                        <WhatsAppButton number={emp.mobile} size="xs" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {emp.joiningDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {emp.portalId}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      ₹{emp.salary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="success">
                        {isGu ? 'સત્યાપિત' : 'VERIFIED'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: LATE COMING REPORT
  // -------------------------------------------------------------
  if (currentTab === 'late-coming-report') {
    const filtered = MOCK_LATE_COMING_REPORT.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.dept.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
      );
    });

    const exportData = () => {
      handleDownloadCSV(
        'hytech_late_coming_report_sep_2026',
        ['Date', 'Staff Name', 'Department', 'Shift Timing', 'Actual Punch In', 'Delay (Mins)', 'Reason', 'Grace Status', 'Administrative Action'],
        filtered.map((item) => [
          item.date,
          isGu ? item.nameGu : item.name,
          item.dept,
          item.shift,
          item.punchIn,
          `+${item.delayMinutes} Mins`,
          item.reason,
          item.graceApplied,
          item.action,
        ])
      );
    };

    return (
      <div className="space-y-4 animate-fade-in">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300 block">
              {isGu ? 'મોડા આવવાની ઘટનાઓ' : 'Late Incidents'}
            </span>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200 mt-0.5">6 Incidents</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">During Sep 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
            <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-300 block">
              {isGu ? 'કુલ વિલંબ' : 'Total Delay Recorded'}
            </span>
            <div className="text-xl font-black text-rose-800 dark:text-rose-200 mt-0.5">86 Minutes</div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Across all center counters</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
              {isGu ? 'ગ્રેસ સમય મર્યાદા' : 'Center Grace Limit'}
            </span>
            <div className="text-xl font-black text-blue-800 dark:text-blue-200 mt-0.5">15 Minutes</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Up to 3 times per month</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
              {isGu ? 'પગાર કપાત' : 'Salary Deductions'}
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">₹0.00</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Overtime offset applied</span>
          </div>
        </div>

        <Card variant="elevated" className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isGu ? 'મોડા આવવાનો લોગ રિપોર્ટ' : 'Biometric Late Coming Report'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Timestamped biometric device logs compared against scheduled shift start times
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="xs" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                {isGu ? 'પ્રિન્ટ' : 'Print'}
              </Button>
              <Button size="xs" variant="primary" onClick={exportData} leftIcon={<Download className="w-3.5 h-3.5" />}>
                {isGu ? 'એક્સેલ ડાઉનલોડ' : 'Download Excel'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isGu ? 'સ્ટાફનું નામ કે કારણ શોધો...' : 'Search by staff name, reason or date...'}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Scheduled Shift</th>
                  <th className="py-3 px-4">Actual Punch In</th>
                  <th className="py-3 px-3 text-center">Delay</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Grace Policy</th>
                  <th className="py-3 px-4 text-right">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {item.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isGu ? item.nameGu : item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.dept}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {item.shift}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                      {item.punchIn}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px]">
                        +{item.delayMinutes}m
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {item.graceApplied}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={item.severity === 'WARNING' ? 'warning' : 'default'}>
                        {item.action}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 5: MONTHLY HR REPORT
  // -------------------------------------------------------------
  const exportMonthlyData = () => {
    handleDownloadCSV(
      'hytech_monthly_hr_summary_sep_2026',
      ['Department', 'Staff Headcount', 'Applications Processed', 'Attendance Average %', 'CSAT Rating (5.0)', 'Overtime Hours', 'Monthly Payroll Cost (INR)', 'Efficiency Rating'],
      MOCK_MONTHLY_DEPARTMENTS.map((d) => [
        d.dept,
        d.staffCount,
        d.appsCompleted,
        `${d.attendanceRate}%`,
        d.csat,
        d.overtimeHours,
        d.totalPayroll,
        d.efficiency,
      ])
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Executive Monthly Header KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
            {isGu ? 'કુલ માસિક પેરોલ' : 'Monthly Gross Payroll'}
          </span>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">₹1,96,000</div>
          <span className="text-[10px] text-slate-500 font-semibold">For 8 active staff members</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/5 border border-blue-500/20">
          <span className="text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
            {isGu ? 'નાગરિક અરજીઓ' : 'Citizen Applications Handled'}
          </span>
          <div className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1">1,420 Done</div>
          <span className="text-[10px] text-emerald-600 font-semibold">99.1% SLA compliance</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-purple-500/5 border border-purple-500/20">
          <span className="text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 block">
            {isGu ? 'ઉત્પાદકતા સ્કોર' : 'Workforce Productivity'}
          </span>
          <div className="text-2xl font-black text-purple-800 dark:text-purple-200 mt-1">98.4%</div>
          <span className="text-[10px] text-purple-600 font-semibold">Center efficiency benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20">
          <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300 block">
            {isGu ? 'ગ્રાહક સંતોષ (CSAT)' : 'Citizen CSAT Rating'}
          </span>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">4.9 / 5.0</div>
          <span className="text-[10px] text-amber-600 font-semibold">Based on 640 feedback SMS</span>
        </div>
      </div>

      {/* Main Department Breakdown Card */}
      <Card variant="elevated" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isGu ? 'માસિક માનવ સંસાધન પ્રદર્શન ઓડિટ' : 'Monthly Executive HR & Operations Audit'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              September 2026 &bull; Departmental output, salary expense &amp; staff efficiency breakdown
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button size="xs" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              {isGu ? 'પ્રિન્ટ' : 'Print'}
            </Button>
            <Button size="xs" variant="primary" onClick={exportMonthlyData} leftIcon={<Download className="w-3.5 h-3.5" />}>
              {isGu ? 'એક્સેલ ડાઉનલોડ' : 'Download Excel'}
            </Button>
          </div>
        </div>

        {/* Department Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Department / Wing</th>
                <th className="py-3 px-3 text-center">Staff Count</th>
                <th className="py-3 px-4 text-center">Applications Processed</th>
                <th className="py-3 px-4 text-center">Avg Attendance</th>
                <th className="py-3 px-4 text-center">Citizen CSAT</th>
                <th className="py-3 px-3 text-center">Overtime</th>
                <th className="py-3 px-4 text-right">Payroll Allocated</th>
                <th className="py-3 px-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
              {MOCK_MONTHLY_DEPARTMENTS.map((dept) => (
                <tr key={dept.dept} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {dept.dept}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    {dept.staffCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.appsCompleted}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">
                    {dept.attendanceRate}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600">
                    ★ {dept.csat}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    +{dept.overtimeHours}h
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₹{dept.totalPayroll.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant={dept.efficiency === 'SUPERIOR' ? 'success' : 'info'}>
                      {dept.efficiency}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
