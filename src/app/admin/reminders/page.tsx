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
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import { reminderService } from '@/api/services/reminderService';
import { customerService } from '@/api/services/customerService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { Reminder, ReminderPriority } from '@/types';
import { toast } from 'sonner';
import {
  BellRing,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  UserCheck,
  Send,
  Trash2,
  Copy,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  // New Reminder Form
  const [reminderForm, setReminderForm] = useState({
    customer: 1,
    service: 3,
    reminder_type: 'SERVICE_READY',
    subject: 'Aadhar Card Ready for Collection',
    due_date: '2026-08-30',
    reminder_date: '2026-08-29',
    priority: 'HIGH' as ReminderPriority,
    message_template: 'તમારી સેવા તૈયાર છે. HY-TECHની મુલાકાત લો.',
    notes: 'Customer notified via SMS & call',
  });

  // New Follow-up Form
  const [followUpForm, setFollowUpForm] = useState({
    contact_date: new Date().toISOString().split('T')[0],
    customer_response: 'Citizen confirmed they will visit tomorrow morning with original token',
    next_follow_up: '2026-08-31',
    notes: 'Informed about pickup token requirement',
  });

  // Queries
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => reminderService.getReminders(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  // Follow-ups for selected reminder
  const { data: followUps = [] } = useQuery({
    queryKey: ['follow-ups', selectedReminder?.reminder_no],
    queryFn: () => reminderService.getFollowUps(selectedReminder!.reminder_no),
    enabled: !!selectedReminder,
  });

  // Create Reminder Mutation
  const createReminderMutation = useMutation({
    mutationFn: () => reminderService.createReminder(reminderForm),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Reminder notification dispatched!');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsCreateOpen(false);
    },
    onError: () => toast.error('Failed to create reminder'),
  });

  // Add Follow-up Mutation
  const addFollowUpMutation = useMutation({
    mutationFn: () =>
      reminderService.addFollowUp(selectedReminder!.reminder_no, {
        contact_date: followUpForm.contact_date,
        customer_response: followUpForm.customer_response,
        next_follow_up: followUpForm.next_follow_up,
        notes: followUpForm.notes,
        contacted_by: 1,
      }),
    onSuccess: () => {
      toast.success('Follow-up activity recorded!');
      queryClient.invalidateQueries({ queryKey: ['follow-ups', selectedReminder?.reminder_no] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setFollowUpForm({
        contact_date: new Date().toISOString().split('T')[0],
        customer_response: '',
        next_follow_up: '',
        notes: '',
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderNo: string) => reminderService.deleteReminder(reminderNo),
    onSuccess: () => {
      toast.success('Reminder removed');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      if (selectedReminder) setSelectedReminder(null);
      setReminderToDelete(null);
    },
  });

  const copyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Gujarati message template copied to clipboard!');
  };

  const filteredReminders = reminders.filter((r: any) => {
    return priorityFilter === 'ALL' || r.priority === priorityFilter;
  });

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black tracking-wide mb-2">
            <BellRing className="w-3.5 h-3.5" />
            <span>CITIZEN NOTIFICATIONS & SMS DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Reminders & Gujarati Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track document pickup deadlines, Gujarati WhatsApp notices, and telephone follow-up CRM.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Reminder
        </Button>
      </div>

      {/* Priority Filter Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Priority:</span>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all ${
              priorityFilter === p
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminders Cards Container */}
        <div className="lg:col-span-2 space-y-3.5">
          {filteredReminders.map((rem: any) => {
            const isSelected = selectedReminder?.reminder_no === rem.reminder_no;

            return (
              <Card
                key={rem.reminder_no}
                variant="elevated"
                onClick={() => setSelectedReminder(rem)}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-brand-50/70 dark:bg-brand-950/50 border-brand-500 shadow-glow-brand ring-2 ring-brand-500/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800/60">
                        {rem.reminder_no}
                      </span>
                      <Badge
                        variant={
                          rem.priority === 'HIGH'
                            ? 'danger'
                            : rem.priority === 'MEDIUM'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {rem.priority} Priority
                      </Badge>
                      <Badge
                        variant={
                          rem.follow_up_status === 'DONE'
                            ? 'success'
                            : rem.follow_up_status === 'IN_PROGRESS'
                            ? 'info'
                            : 'default'
                        }
                      >
                        {rem.follow_up_status}
                      </Badge>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                      {rem.subject}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Citizen: <strong className="text-slate-800 dark:text-slate-200">{rem.customer_name}</strong> ({rem.customer_family_id}) &bull; {rem.service_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 block">
                      Target Due: {rem.due_date}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Remind Date: {rem.reminder_date}
                    </span>
                  </div>
                </div>

                {/* Gujarati Message Template Box */}
                {rem.message_template && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Official Gujarati Broadcast Template
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTemplate(rem.message_template);
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        Copy SMS
                      </button>
                    </div>
                    <p className="text-sm font-semibold font-gujarati text-slate-900 dark:text-slate-100">
                      {rem.message_template}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="truncate max-w-xs text-slate-400">
                    {rem.notes ? `Staff Note: ${rem.notes}` : 'No notes'}
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {rem.follow_up_count || rem.follow_ups?.length || 0} Calls Logged &rarr;
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mini CRM Activity Feed Sidebar */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Contact Activity Feed
              </h3>
              <p className="text-xs text-slate-400">
                {selectedReminder ? selectedReminder.reminder_no : 'Select reminder on left'}
              </p>
            </div>
            {selectedReminder && (
              <button
                onClick={() => setReminderToDelete(selectedReminder)}
                className="p-1.5 text-slate-400 hover:text-rose-500"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedReminder ? (
            <div className="space-y-4">
              {/* Add Follow-up Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!followUpForm.customer_response) return;
                  addFollowUpMutation.mutate();
                }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs"
              >
                <span className="font-black text-slate-800 dark:text-slate-200 block">
                  Log Customer Telephone Call
                </span>
                <Input
                  required
                  value={followUpForm.customer_response}
                  onChange={(e) =>
                    setFollowUpForm({ ...followUpForm, customer_response: e.target.value })
                  }
                  placeholder="Citizen response notes..."
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Next Action Date</label>
                    <input
                      type="date"
                      value={followUpForm.next_follow_up}
                      onChange={(e) =>
                        setFollowUpForm({ ...followUpForm, next_follow_up: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full"
                      isLoading={addFollowUpMutation.isPending}
                      leftIcon={<Send className="w-3 h-3" />}
                    >
                      Save Log
                    </Button>
                  </div>
                </div>
              </form>

              {/* History Timeline */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Call & Visit Logs
                </div>
                {followUps.map((fu: any) => (
                  <div
                    key={fu.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{fu.contacted_by_name || 'Desk Staff'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{fu.contact_date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">
                      &ldquo;{fu.customer_response}&rdquo;
                    </p>
                    {fu.next_follow_up && (
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 block pt-0.5">
                        Follow-up scheduled: {fu.next_follow_up}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a reminder card from the list to manage customer responses.
            </div>
          )}
        </Card>
      </div>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Citizen Reminder"
        description="Notify customers regarding service readiness or pending government tasks."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createReminderMutation.mutate();
          }}
          className="space-y-4"
        >
          <Select
            label="Citizen *"
            value={reminderForm.customer}
            onChange={(e) => setReminderForm({ ...reminderForm, customer: Number(e.target.value) })}
          >
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.family_id} — {c.head_of_family}
              </option>
            ))}
          </Select>

          <Input
            label="Subject / Notification Title *"
            required
            value={reminderForm.subject}
            onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Due Date *"
              type="date"
              required
              value={reminderForm.due_date}
              onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })}
            />

            <Select
              label="Priority Level *"
              value={reminderForm.priority}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, priority: e.target.value as ReminderPriority })
              }
            >
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </Select>
          </div>

          <Textarea
            label="Gujarati SMS / WhatsApp Template"
            rows={2}
            value={reminderForm.message_template}
            onChange={(e) => setReminderForm({ ...reminderForm, message_template: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createReminderMutation.isPending}
            >
              Schedule Notification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!reminderToDelete}
        onClose={() => setReminderToDelete(null)}
        onConfirm={() => reminderToDelete && deleteReminderMutation.mutate(reminderToDelete.reminder_no)}
        title="Delete Reminder Record?"
        message={`Are you sure you want to permanently remove reminder ${reminderToDelete?.reminder_no}?`}
        confirmText="Delete Reminder"
        variant="danger"
        isLoading={deleteReminderMutation.isPending}
      />
    </AppShell>
  );
}
