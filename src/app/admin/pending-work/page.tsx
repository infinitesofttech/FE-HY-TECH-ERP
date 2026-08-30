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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import { pendingWorkService } from '@/api/services/pendingWorkService';
import { customerService } from '@/api/services/customerService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { PendingWork, WorkStatus } from '@/types';
import { toast } from 'sonner';
import {
  KanbanSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';

const COLUMNS: Array<{ id: WorkStatus; title: string; headerColor: string; bgGlow: string }> = [
  {
    id: 'PENDING',
    title: 'Pending Desk Intake',
    headerColor: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    bgGlow: 'hover:border-amber-500/40',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Government Progress',
    headerColor: 'text-brand-500 border-brand-500/30 bg-brand-500/10',
    bgGlow: 'hover:border-brand-500/40',
  },
  {
    id: 'BLOCKED',
    title: 'Blocked / Action Needed',
    headerColor: 'text-rose-500 border-rose-500/30 bg-rose-500/10',
    bgGlow: 'hover:border-rose-500/40',
  },
  {
    id: 'COMPLETED',
    title: 'Completed & Ready',
    headerColor: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
    bgGlow: 'hover:border-emerald-500/40',
  },
];

export default function PendingWorkPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<PendingWork | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<PendingWork | null>(null);

  // Add Form State
  const [form, setForm] = useState({
    customer: 1,
    service: 3,
    pending_since: new Date().toISOString().split('T')[0],
    expected_date: '2026-09-05',
    priority: 'HIGH' as 'HIGH' | 'MEDIUM' | 'LOW',
    pending_reason: 'Biometric verification sync with UIDAI portal',
    documents_pending: 'None',
    assigned_staff: 1,
    next_action: 'Verify status on government portal and send citizen SMS',
    work_status: 'PENDING' as WorkStatus,
    follow_up_date: '2026-09-02',
    notes: 'Urgent document processing request',
  });

  // Queries
  const { data: workItems = [] } = useQuery({
    queryKey: ['pending-work'],
    queryFn: () => pendingWorkService.getPendingWork(),
  });

  const { data: summary } = useQuery({
    queryKey: ['pending-summary'],
    queryFn: () => pendingWorkService.getSummary(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ pendingNo, newStatus }: { pendingNo: string; newStatus: WorkStatus }) =>
      pendingWorkService.updatePendingWork(pendingNo, { work_status: newStatus }),
    onSuccess: () => {
      toast.success('Kanban ticket progressed successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-work'] });
      queryClient.invalidateQueries({ queryKey: ['pending-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: () => pendingWorkService.createPendingWork(form),
    onSuccess: (res) => {
      toast.success(res.message || 'Work ticket dispatched to Kanban board!');
      queryClient.invalidateQueries({ queryKey: ['pending-work'] });
      queryClient.invalidateQueries({ queryKey: ['pending-summary'] });
      setIsAddOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (pendingNo: string) => pendingWorkService.deletePendingWork(pendingNo),
    onSuccess: () => {
      toast.success('Work ticket archived');
      queryClient.invalidateQueries({ queryKey: ['pending-work'] });
      queryClient.invalidateQueries({ queryKey: ['pending-summary'] });
      setSelectedWork(null);
      setTicketToDelete(null);
    },
  });

  const getNextColumn = (current: WorkStatus): WorkStatus | null => {
    if (current === 'PENDING') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'COMPLETED';
    if (current === 'BLOCKED') return 'IN_PROGRESS';
    return null;
  };

  const getPrevColumn = (current: WorkStatus): WorkStatus | null => {
    if (current === 'COMPLETED') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'PENDING';
    if (current === 'BLOCKED') return 'PENDING';
    return null;
  };

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>GOVERNMENT AGENCY TRACKING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Pending Work Kanban Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline monitoring for government approvals, biometric verification holdups, and target SLAs.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Work Ticket
        </Button>
      </div>

      {/* Metric Counter Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Work</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{summary?.total ?? workItems.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">Pending</span>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">
            {summary?.pending ?? workItems.filter((w) => w.work_status === 'PENDING').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/25 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300">In Progress</span>
          <p className="text-xl font-black text-brand-700 dark:text-brand-300">
            {summary?.in_progress ?? workItems.filter((w) => w.work_status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">Blocked</span>
          <p className="text-xl font-black text-rose-700 dark:text-rose-300">
            {summary?.blocked ?? workItems.filter((w) => w.work_status === 'BLOCKED').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Completed</span>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
            {summary?.completed ?? workItems.filter((w) => w.work_status === 'COMPLETED').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">High Priority</span>
          <p className="text-xl font-black text-purple-700 dark:text-purple-300">
            {summary?.high_priority ?? workItems.filter((w) => w.priority === 'HIGH').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-center space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-300">Overdue</span>
          <p className="text-xl font-black text-red-700 dark:text-red-300">{summary?.overdue ?? 1}</p>
        </div>
      </div>

      {/* 4-Column Luxury Glass Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = workItems.filter((w) => w.work_status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-3xl bg-slate-100/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 min-h-[520px] flex flex-col transition-all shadow-card-elevated ${col.bgGlow}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-black border ${col.headerColor}`}>
                  <span>{col.title}</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs">
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1">
                {items.map((item) => (
                  <Card
                    key={item.pending_no}
                    variant="elevated"
                    onClick={() => setSelectedWork(item)}
                    className="p-4 space-y-3 cursor-pointer group hover:border-brand-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800/60">
                        {item.pending_no}
                      </span>
                      <Badge variant={item.priority === 'HIGH' ? 'danger' : 'warning'}>
                        {item.priority}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {item.customer_name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        {item.service_name}
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Holdup Reason:</span>
                      {item.pending_reason}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono">SLA: {item.expected_date}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.assigned_staff_name || 'Desk 1'}</span>
                    </div>

                    {/* Interactive Kanban Move Buttons */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      {getPrevColumn(col.id) ? (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              pendingNo: item.pending_no,
                              newStatus: getPrevColumn(col.id)!,
                            })
                          }
                          className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back
                        </button>
                      ) : (
                        <div></div>
                      )}

                      {getNextColumn(col.id) && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              pendingNo: item.pending_no,
                              newStatus: getNextColumn(col.id)!,
                            })
                          }
                          className="flex items-center gap-1 text-[10px] font-black text-brand-600 dark:text-brand-300 hover:text-brand-700 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 shadow-xs hover:scale-105 transition-all"
                        >
                          Progress
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                    <span>No active tickets</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Stage is currently clear</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Work Ticket Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Pending Work Ticket"
        description="Log an application submitted to a government agency awaiting status approval."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Citizen Household *"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: Number(e.target.value) })}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.family_id} — {c.head_of_family}
                </option>
              ))}
            </Select>

            <Select
              label="Service Category *"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: Number(e.target.value) })}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ServiceName}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Pending Reason *"
            required
            value={form.pending_reason}
            onChange={(e) => setForm({ ...form, pending_reason: e.target.value })}
            placeholder="e.g. Government Portal Verification Queue"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level *"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
            >
              <option value="HIGH">HIGH (Urgent Citizen Request)</option>
              <option value="MEDIUM">MEDIUM (Standard Processing)</option>
              <option value="LOW">LOW (Deferred)</option>
            </Select>

            <Select
              label="Initial Kanban Column *"
              value={form.work_status}
              onChange={(e) => setForm({ ...form, work_status: e.target.value as any })}
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="COMPLETED">COMPLETED</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Completion Date *"
              type="date"
              required
              value={form.expected_date}
              onChange={(e) => setForm({ ...form, expected_date: e.target.value })}
            />

            <Input
              label="Follow-up Target Date"
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
            />
          </div>

          <Input
            label="Next Action Required"
            value={form.next_action}
            onChange={(e) => setForm({ ...form, next_action: e.target.value })}
          />

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
              Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        title="Pending Work Inspection"
        description={selectedWork?.pending_no || ''}
        maxWidth="md"
      >
        {selectedWork && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/90 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {selectedWork.customer_name}
                </span>
                <Badge variant={selectedWork.priority === 'HIGH' ? 'danger' : 'warning'}>
                  {selectedWork.priority}
                </Badge>
              </div>
              <p className="text-brand-600 dark:text-brand-400 font-black">{selectedWork.service_name}</p>
              <div className="text-slate-500 font-mono text-[11px]">
                {selectedWork.customer_family_id} &bull; {selectedWork.customer_mobile}
              </div>
            </div>

            <div className="space-y-2.5 py-1">
              <div>
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Reason Pending:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedWork.pending_reason}</p>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Next Action:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedWork.next_action}</p>
              </div>
              <div>
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Documents Pending:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedWork.documents_pending || 'None'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold">Target Date:</span>
                  <p className="font-mono font-black text-slate-700 dark:text-slate-300">{selectedWork.expected_date}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Assigned Desk:</span>
                  <p className="font-black text-slate-700 dark:text-slate-300">{selectedWork.assigned_staff_name || 'Desk 1'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTicketToDelete(selectedWork)}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Ticket
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedWork(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Ticket Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!ticketToDelete}
        onClose={() => setTicketToDelete(null)}
        onConfirm={() => ticketToDelete && deleteMutation.mutate(ticketToDelete.pending_no)}
        title="Delete Work Ticket?"
        message={`Are you sure you want to permanently remove ticket ${ticketToDelete?.pending_no}?`}
        confirmText="Delete Ticket"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
