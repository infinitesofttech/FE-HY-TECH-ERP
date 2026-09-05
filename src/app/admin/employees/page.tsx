'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<EmployeeUser | null>(null);

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
      toast.success(res.message || 'Staff member added successfully!');
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
    onError: () => toast.error('Failed to add employee'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast.success('Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEmpToDelete(null);
    },
  });

  const adminCount = employees.filter((e) => e.role === 'ADMIN').length;
  const staffCount = employees.filter((e) => e.role === 'STAFF').length;

  return (
    <AppShell allowedRoles={['admin']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <UserCog className="w-3.5 h-3.5" />
            <span>OPERATOR CREDENTIALS & DESKS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('employees_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('employees_sub')}
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {t('add_employee')}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Staff"
          value={employees.length}
          subtitle="Provisioned accounts"
          icon={UserCog}
          colorScheme="brand"
        />
        <StatCard
          title="Administrators"
          value={adminCount}
          subtitle="Full access rights"
          icon={ShieldCheck}
          colorScheme="purple"
        />
        <StatCard
          title="Front Desk Staff"
          value={staffCount}
          subtitle="Operational intake operators"
          icon={CheckCircle}
          colorScheme="emerald"
        />
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card
            key={emp.id}
            variant="elevated"
            className="p-5 space-y-4 hover:border-brand-500/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-base ring-4 ring-brand-500/5">
                  {emp.full_name ? emp.full_name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {emp.full_name || emp.username}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">@{emp.username}</span>
                </div>
              </div>

              <Badge variant={emp.role === 'ADMIN' ? 'purple' : 'info'}>
                {emp.role}
              </Badge>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{emp.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{emp.mobile_number || '9876543210'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Staff
              </span>

              <button
                onClick={() => setEmpToDelete(emp)}
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
            placeholder="e.g. operator_nikhil"
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
            placeholder="e.g. Nikhil Patel"
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="nikhil@hytech.in"
          />

          <Input
            label="Mobile Number"
            type="tel"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            placeholder="10-digit mobile"
          />

          <Select
            label="Portal Role *"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="STAFF">STAFF (Operational front desk access)</option>
            <option value="ADMIN">ADMIN (Full administrative access)</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!empToDelete}
        onClose={() => setEmpToDelete(null)}
        onConfirm={() => empToDelete && deleteMutation.mutate(empToDelete.id)}
        title="Remove Staff Operator?"
        message={`Are you sure you want to permanently remove employee @${empToDelete?.username} (${empToDelete?.full_name})?`}
        confirmText="Remove Employee"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
