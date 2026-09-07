'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  Modal,
  Badge,
  Button,
  Input,
  Select,
  Card,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { employeeService } from '@/api/services/employeeService';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { EmployeeUser } from '@/types';
import { toast } from 'sonner';
import {
  UserCog,
  UserPlus,
  Mail, 
  Phone,
  Shield,
  Trash2,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Search,
  Calendar,
  Palmtree,
  ChevronRight,
  Briefcase,
  Users,
} from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const { t, language } = useLanguage();
  const isGu = language === 'gu';
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<EmployeeUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');

  React.useEffect(() => {
    if (userRole === 'employee') {
      router.replace('/staff/hrms');
    }
  }, [userRole, router]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'add_employee') {
        setIsAddOpen(true);
      }
    }
  }, []);

  // Helper to cleanly format employee names based on selected language
  const formatEmpName = (name: string) => {
    if (!name) return '';
    if (isGu) return name;
    // For English: extract English name from parentheses if present
    const match = name.match(/\(([^)]+)\)/);
    if (match) {
      const inside = match[1];
      if (/[A-Za-z]/.test(inside)) {
        return inside;
      }
      return name.replace(/\s*\([^)]+\)/, '').trim();
    }
    return name;
  };

  // Form State
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    mobile_number: '',
    role: 'STAFF' as 'STAFF' | 'ADMIN',
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getEmployees(),
  });

  const createMutation = useMutation({
    mutationFn: () => employeeService.createEmployee(form),
    onSuccess: (res) => {
      toast.success(res.message || (isGu ? 'સ્ટાફ સફળતાપૂર્વક ઉમેરાયો!' : 'Staff member added successfully!'));
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsAddOpen(false);
      setForm({
        username: '',
        password: '',
        full_name: '',
        email: '',
        mobile_number: '',
        role: 'STAFF',
      });
    },
    onError: () => toast.error(isGu ? 'કર્મચારી ઉમેરવામાં ભૂલ આવી' : 'Failed to add employee'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast.success(isGu ? 'કર્મચારી ખાતું દૂર કર્યું' : 'Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEmpToDelete(null);
    },
  });

  const adminCount = employees.filter((e) => e.role === 'ADMIN').length;
  const staffCount = employees.filter((e) => e.role === 'STAFF').length;

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.full_name?.toLowerCase().includes(q) ||
        emp.username.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.mobile_number?.includes(q) ||
        emp.designation?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [employees, searchTerm, roleFilter]);

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <UserCog className="w-3.5 h-3.5" />
            <span>HRMS &bull; OPERATOR CREDENTIALS &amp; DESKS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isGu ? 'કર્મચારી અને ઓપરેટર સંચાલન (HRMS)' : 'Employee & Operator Management (HRMS)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isGu
              ? 'તમામ સ્ટાફ સભ્યો, તેમની દૈનિક હાજરી (Attendance), હોલિડે કેલેન્ડર અને રજાઓનું સંચાલન.'
              : 'Manage staff credentials, biometric daily attendance, holiday calendar, and leave approvals.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => router.push('/staff/hrms')}
            leftIcon={<Calendar className="w-4 h-4 text-emerald-600" />}
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isGu ? 'મારી હાજરી અને રજાઓ (My HRMS)' : 'My Attendance & Leaves'}
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
          >
            {isGu ? '+ નવા કર્મચારી ઉમેરો' : '+ Add New Employee'}
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={isGu ? 'કુલ સ્ટાફ' : 'TOTAL STAFF'}
          value={employees.length}
          subtitle={isGu ? 'રજીસ્ટર્ડ એકાઉન્ટ્સ' : 'Provisioned accounts'}
          icon={Users}
          colorScheme="brand"
        />
        <StatCard
          title={isGu ? 'એડમિનિસ્ટ્રેટર' : 'ADMINISTRATORS'}
          value={adminCount}
          subtitle={isGu ? 'સંપૂર્ણ એક્સેસ અધિકારો' : 'Full access rights'}
          icon={Shield}
          colorScheme="purple"
        />
        <StatCard
          title={isGu ? 'ફ્રન્ટ ડેસ્ક સ્ટાફ' : 'FRONT DESK STAFF'}
          value={staffCount}
          subtitle={isGu ? 'દૈનિક સેવા ઓપરેટર્સ' : 'Operational intake operators'}
          icon={CheckCircle}
          colorScheme="emerald"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isGu
                ? 'કર્મચારીનું નામ શોધો (દા.ત. જાદવ દુર્ગેશ, હાર્દિકભાઈ, વિનેશ, રવિ, અબ્દુલ)...'
                : 'Search employee by name, username, mobile, designation...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              roleFilter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isGu ? 'તમામ' : 'All'} ({employees.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('STAFF')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              roleFilter === 'STAFF'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isGu ? 'ઓપરેટર સ્ટાફ' : 'Staff Operators'} ({staffCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              roleFilter === 'ADMIN'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isGu ? 'એડમિન' : 'Admins'} ({adminCount})
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card
            key={emp.id}
            variant="elevated"
            onClick={() => router.push(`/admin/employees/${emp.id}`)}
            className="p-5 space-y-4 hover:border-brand-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5 cursor-pointer group relative"
          >
            {/* Header: Avatar, Name, Role */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-emerald-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-base ring-4 ring-brand-500/5 group-hover:scale-105 transition-transform">
                  {emp.full_name ? emp.full_name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {formatEmpName(emp.full_name || emp.username)}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">@{emp.username}</span>
                </div>
              </div>

              <Badge variant={emp.role === 'ADMIN' ? 'purple' : 'info'}>
                {emp.role}
              </Badge>
            </div>

            {/* Designation & Department */}
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate">{emp.designation || 'Front-Desk Operator'}</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{emp.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{emp.mobile_number || '9876543210'}</span>
                {(emp.mobile_number || '9876543210') && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <WhatsAppButton number={emp.mobile_number || '9876543210'} size="xs" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick HRMS Indicators */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{isGu ? 'હાજરી: ૯૨.૫%' : 'Attendance: 92.5%'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Palmtree className="w-3.5 h-3.5" />
                <span>{isGu ? 'બાકી રજા: ૯ દિવસ' : 'Leaves: 9 Days'}</span>
              </span>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
                <span>{isGu ? 'હાજરી અને હોલિડે પ્રોફાઇલ જુઓ' : 'View Attendance & Profile'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEmpToDelete(emp);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="Remove staff member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Staff Operator"
        description="Provision operator credentials for front-desk document services."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Username *"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="e.g. jadav_durgesh"
          />

          <Input
            label="Password *"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Secure password"
          />

          <Input
            label="Full Name *"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. જાદવ દુર્ગેશ (Jadav Durgesh)"
          />

          <Input
            label="Email *"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jadav@hytech.com"
          />

          <Input
            label="Mobile Number"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            placeholder="10-digit mobile number"
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Role &bull; પરવાનગી
            </label>
            <Select
              options={[
                { value: 'STAFF', label: 'STAFF - Front Desk Operator' },
                { value: 'ADMIN', label: 'ADMIN - Full Administrative Rights' },
              ]}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="bg-brand-600 text-white font-bold"
            >
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!empToDelete}
        onClose={() => setEmpToDelete(null)}
        onConfirm={() => empToDelete && deleteMutation.mutate(empToDelete.id)}
        title="Remove Staff Operator"
        message={`Are you sure you want to deactivate ${empToDelete?.full_name || empToDelete?.username}? They will no longer be able to log in.`}
        confirmText="Remove Employee"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
