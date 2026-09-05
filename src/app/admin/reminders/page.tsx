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
  ConfirmDialog,
} from '@/components/ui';
import { reminderService } from '@/api/services/reminderService';
import { customerService } from '@/api/services/customerService';
import { baseServiceService } from '@/api/services/baseServiceService';
import { useLanguage } from '@/context/LanguageContext';
import { Reminder, ReminderPriority, FollowUp } from '@/types';
import { toast } from 'sonner';
import {
  BellRing,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Trash2,
  Copy,
  Sparkles,
  PhoneCall,
  Edit2,
  Users,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Navigation Tab: 'reminders' | 'followups'
  const [activeTab, setActiveTab] = useState<'reminders' | 'followups'>('reminders');

  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchFollowUp, setSearchFollowUp] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  // Edit Reminder state
  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);
  const [editReminderForm, setEditReminderForm] = useState({
    subject: '',
    due_date: '',
    reminder_date: '',
    priority: 'HIGH' as ReminderPriority,
    follow_up_status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'DONE',
    message_template: '',
    notes: '',
  });

  // Edit Follow-up state
  const [followUpToEdit, setFollowUpToEdit] = useState<{
    reminderNo: string;
    followUp: FollowUp;
  } | null>(null);
  const [editFollowUpForm, setEditFollowUpForm] = useState({
    contact_date: '',
    customer_response: '',
    next_follow_up: '',
    notes: '',
  });

  // Follow-up delete state
  const [followUpToDelete, setFollowUpToDelete] = useState<{
    reminderNo: string;
    followUpId: number;
  } | null>(null);

  // Standalone Add Follow-up modal state (for Follow-ups tab)
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [targetReminderForFollowUp, setTargetReminderForFollowUp] = useState<string>('');

  // New Reminder Form
  const [reminderForm, setReminderForm] = useState({
    customer: 1,
    service: 3,
    reminder_type: 'SERVICE_READY',
    subject: 'Aadhaar Card Ready for Collection',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminder_date: new Date().toISOString().split('T')[0],
    priority: 'HIGH' as ReminderPriority,
    message_template: 'તમારી સેવા તૈયાર છે. HY-TECH સેવા કેન્દ્રની મુલાકાત લો.',
    notes: 'Citizen notified via SMS & phone call',
  });

  // Quick Sidebar Follow-up Form
  const [followUpForm, setFollowUpForm] = useState({
    contact_date: new Date().toISOString().split('T')[0],
    customer_response: 'Citizen confirmed they will visit tomorrow morning with original token',
    next_follow_up: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Informed about pickup token requirement',
  });

  // Queries
  const { data: reminders = [] } = useQuery({
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

  // Aggregate all follow-ups across reminders for the dedicated follow-ups tab
  const allAggregatedFollowUps = reminders.flatMap((r: any) =>
    (r.follow_ups || []).map((fu: any) => ({
      ...fu,
      reminder_no: r.reminder_no,
      customer_name: r.customer_name,
      customer_family_id: r.customer_family_id,
      customer_mobile: r.customer_mobile,
      service_name: r.service_name,
      reminder_subject: r.subject,
    }))
  );

  const filteredAllFollowUps = allAggregatedFollowUps.filter((fu: any) => {
    if (!searchFollowUp) return true;
    const q = searchFollowUp.toLowerCase();
    return (
      fu.customer_name?.toLowerCase().includes(q) ||
      fu.customer_response?.toLowerCase().includes(q) ||
      fu.notes?.toLowerCase().includes(q) ||
      fu.reminder_no?.toLowerCase().includes(q) ||
      fu.contacted_by_name?.toLowerCase().includes(q)
    );
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

  // Update Reminder Mutation
  const updateReminderMutation = useMutation({
    mutationFn: ({ reminderNo, data }: { reminderNo: string; data: Partial<Reminder> }) =>
      reminderService.updateReminder(reminderNo, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Reminder updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setReminderToEdit(null);
      if (selectedReminder && selectedReminder.reminder_no === res.data.reminder_no) {
        setSelectedReminder(res.data);
      }
    },
    onError: () => toast.error('Failed to update reminder'),
  });

  // Add Follow-up Mutation (Sidebar)
  const addFollowUpMutation = useMutation({
    mutationFn: (targetNo?: string) => {
      const remNo = targetNo || selectedReminder!.reminder_no;
      return reminderService.addFollowUp(remNo, {
        contact_date: followUpForm.contact_date,
        customer_response: followUpForm.customer_response,
        next_follow_up: followUpForm.next_follow_up,
        notes: followUpForm.notes,
        contacted_by: 1,
      });
    },
    onSuccess: () => {
      toast.success('Follow-up activity recorded!');
      queryClient.invalidateQueries({ queryKey: ['follow-ups', selectedReminder?.reminder_no] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsAddFollowUpModalOpen(false);
      setFollowUpForm({
        contact_date: new Date().toISOString().split('T')[0],
        customer_response: '',
        next_follow_up: '',
        notes: '',
      });
    },
  });

  // Update Follow-up Mutation
  const updateFollowUpMutation = useMutation({
    mutationFn: () => {
      if (!followUpToEdit) throw new Error('No follow-up selected');
      return reminderService.updateFollowUp(
        followUpToEdit.reminderNo,
        followUpToEdit.followUp.id,
        editFollowUpForm
      );
    },
    onSuccess: () => {
      toast.success('Follow-up record updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['follow-ups', selectedReminder?.reminder_no] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setFollowUpToEdit(null);
    },
    onError: () => toast.error('Failed to update follow-up'),
  });

  // Delete Follow-up Mutation
  const deleteFollowUpMutation = useMutation({
    mutationFn: () => {
      if (!followUpToDelete) throw new Error('No follow-up selected');
      return reminderService.deleteFollowUp(
        followUpToDelete.reminderNo,
        followUpToDelete.followUpId
      );
    },
    onSuccess: () => {
      toast.success('Follow-up log removed');
      queryClient.invalidateQueries({ queryKey: ['follow-ups', selectedReminder?.reminder_no] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setFollowUpToDelete(null);
    },
    onError: () => toast.error('Failed to delete follow-up'),
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

  const openEditReminder = (rem: Reminder) => {
    setReminderToEdit(rem);
    setEditReminderForm({
      subject: rem.subject || '',
      due_date: rem.due_date || '',
      reminder_date: rem.reminder_date || '',
      priority: rem.priority || 'HIGH',
      follow_up_status: rem.follow_up_status || 'PENDING',
      message_template: rem.message_template || '',
      notes: rem.notes || '',
    });
  };

  const openEditFollowUp = (reminderNo: string, fu: FollowUp) => {
    setFollowUpToEdit({ reminderNo, followUp: fu });
    setEditFollowUpForm({
      contact_date: fu.contact_date || new Date().toISOString().split('T')[0],
      customer_response: fu.customer_response || '',
      next_follow_up: fu.next_follow_up || '',
      notes: fu.notes || '',
    });
  };

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black tracking-wide mb-2">
            <BellRing className="w-3.5 h-3.5" />
            <span>CITIZEN NOTIFICATIONS & FOLLOW-UP CRM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('reminders_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('reminders_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'reminders' ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('create_reminder')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (reminders.length > 0) {
                  setTargetReminderForFollowUp(reminders[0].reminder_no);
                  setIsAddFollowUpModalOpen(true);
                } else {
                  toast.error('Please create a reminder first to log a follow-up');
                }
              }}
              variant="primary"
              leftIcon={<PhoneCall className="w-4 h-4" />}
            >
              Log Follow-up Call
            </Button>
          )}
        </div>
      </div>

      {/* Modern Tab Bar: Reminders vs Follow-ups */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'reminders'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Active Reminders ({reminders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'followups'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Follow-ups Management ({allAggregatedFollowUps.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {/* Priority Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Priority:
            </span>
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
                          Citizen:{' '}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {rem.customer_name}
                          </strong>{' '}
                          ({rem.customer_family_id}) &bull; {rem.service_name}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditReminder(rem);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition-colors"
                            title="Edit Reminder"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReminderToDelete(rem);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditReminder(selectedReminder)}
                      className="p-1.5 text-slate-400 hover:text-brand-500"
                      title="Edit Reminder"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReminderToDelete(selectedReminder)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {selectedReminder ? (
                <div className="space-y-4">
                  {/* Add Follow-up Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!followUpForm.customer_response) return;
                      addFollowUpMutation.mutate(undefined);
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
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Next Action Date
                        </label>
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
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{fu.contacted_by_name || 'Desk Staff'}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {fu.contact_date}
                            </span>
                            <button
                              onClick={() =>
                                openEditFollowUp(selectedReminder.reminder_no, fu)
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-brand-500 transition-opacity"
                              title="Edit Follow-up"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setFollowUpToDelete({
                                  reminderNo: selectedReminder.reminder_no,
                                  followUpId: fu.id,
                                })
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity"
                              title="Delete Follow-up"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
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

                    {followUps.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-4">
                        No follow-up calls logged yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Select a reminder card on the left to review or log customer communications.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED FOLLOW-UPS MANAGEMENT SECTION */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFollowUp}
                onChange={(e) => setSearchFollowUp(e.target.value)}
                placeholder="Search follow-ups by citizen name, notes, token, or officer..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div className="text-xs text-slate-500 font-bold px-2">
              Showing {filteredAllFollowUps.length} interaction logs
            </div>
          </Card>

          {/* Follow-ups Detailed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllFollowUps.map((fu: any) => (
              <Card
                key={`${fu.reminder_no}_${fu.id}`}
                variant="elevated"
                className="p-5 space-y-3 hover:border-brand-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg border border-brand-200 dark:border-brand-800/60">
                    {fu.reminder_no}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditFollowUp(fu.reminder_no, fu)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                      title="Edit Follow-up Log"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setFollowUpToDelete({
                          reminderNo: fu.reminder_no,
                          followUpId: fu.id,
                        })
                      }
                      className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Follow-up Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {fu.customer_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {fu.service_name} &bull; {fu.reminder_subject}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Citizen Response:
                  </span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                    &ldquo;{fu.customer_response}&rdquo;
                  </p>
                </div>

                {fu.notes && (
                  <p className="text-[11px] text-slate-500">
                    <strong>Staff Notes:</strong> {fu.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Contacted: {fu.contact_date}</span>
                  </div>
                  {fu.next_follow_up && (
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      Next: {fu.next_follow_up}
                    </span>
                  )}
                </div>
              </Card>
            ))}

            {filteredAllFollowUps.length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                No follow-up interaction records match your query.
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Citizen Household *"
              value={reminderForm.customer}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, customer: Number(e.target.value) })
              }
            >
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.family_id} — {c.head_of_family}
                </option>
              ))}
            </Select>

            <Select
              label="Associated Service *"
              value={reminderForm.service}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, service: Number(e.target.value) })
              }
            >
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.ServiceName}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Subject / Notification Title *"
            required
            value={reminderForm.subject}
            onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            onChange={(e) =>
              setReminderForm({ ...reminderForm, message_template: e.target.value })
            }
          />

          <Input
            label="Internal Notes"
            value={reminderForm.notes}
            onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createReminderMutation.isPending}>
              Schedule Notification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        isOpen={!!reminderToEdit}
        onClose={() => setReminderToEdit(null)}
        title="Edit Reminder"
        description={`Modify notification details for ${reminderToEdit?.reminder_no}`}
        maxWidth="lg"
      >
        {reminderToEdit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateReminderMutation.mutate({
                reminderNo: reminderToEdit.reminder_no,
                data: editReminderForm,
              });
            }}
            className="space-y-4"
          >
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Citizen: {reminderToEdit.customer_name} ({reminderToEdit.customer_family_id})
              </span>
              <p className="text-slate-500 mt-0.5">{reminderToEdit.service_name}</p>
            </div>

            <Input
              label="Subject *"
              required
              value={editReminderForm.subject}
              onChange={(e) =>
                setEditReminderForm({ ...editReminderForm, subject: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Target Due Date *"
                type="date"
                required
                value={editReminderForm.due_date}
                onChange={(e) =>
                  setEditReminderForm({ ...editReminderForm, due_date: e.target.value })
                }
              />

              <Select
                label="Priority *"
                value={editReminderForm.priority}
                onChange={(e) =>
                  setEditReminderForm({
                    ...editReminderForm,
                    priority: e.target.value as ReminderPriority,
                  })
                }
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </Select>

              <Select
                label="Follow-up Status *"
                value={editReminderForm.follow_up_status}
                onChange={(e) =>
                  setEditReminderForm({
                    ...editReminderForm,
                    follow_up_status: e.target.value as any,
                  })
                }
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </Select>
            </div>

            <Textarea
              label="Gujarati Template"
              rows={2}
              value={editReminderForm.message_template}
              onChange={(e) =>
                setEditReminderForm({ ...editReminderForm, message_template: e.target.value })
              }
            />

            <Input
              label="Internal Staff Notes"
              value={editReminderForm.notes}
              onChange={(e) => setEditReminderForm({ ...editReminderForm, notes: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setReminderToEdit(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateReminderMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Follow-up Modal */}
      <Modal
        isOpen={!!followUpToEdit}
        onClose={() => setFollowUpToEdit(null)}
        title="Edit Follow-up Log"
        description="Update citizen communication notes and next scheduled action date."
        maxWidth="md"
      >
        {followUpToEdit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFollowUpMutation.mutate();
            }}
            className="space-y-4"
          >
            <Input
              label="Contact Date *"
              type="date"
              required
              value={editFollowUpForm.contact_date}
              onChange={(e) =>
                setEditFollowUpForm({ ...editFollowUpForm, contact_date: e.target.value })
              }
            />

            <Textarea
              label="Citizen Response & Communication Notes *"
              rows={3}
              required
              value={editFollowUpForm.customer_response}
              onChange={(e) =>
                setEditFollowUpForm({ ...editFollowUpForm, customer_response: e.target.value })
              }
            />

            <Input
              label="Next Scheduled Follow-up Date"
              type="date"
              value={editFollowUpForm.next_follow_up}
              onChange={(e) =>
                setEditFollowUpForm({ ...editFollowUpForm, next_follow_up: e.target.value })
              }
            />

            <Input
              label="Internal Notes"
              value={editFollowUpForm.notes}
              onChange={(e) =>
                setEditFollowUpForm({ ...editFollowUpForm, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setFollowUpToEdit(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateFollowUpMutation.isPending}
              >
                Update Follow-up
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Standalone Add Follow-up Modal (from Follow-ups tab) */}
      <Modal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        title="Log Citizen Follow-up Call"
        description="Record telephone or in-person citizen interaction."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addFollowUpMutation.mutate(targetReminderForFollowUp);
          }}
          className="space-y-4"
        >
          <Select
            label="Associated Reminder / Citizen Task *"
            value={targetReminderForFollowUp}
            onChange={(e) => setTargetReminderForFollowUp(e.target.value)}
          >
            {reminders.map((r: any) => (
              <option key={r.reminder_no} value={r.reminder_no}>
                {r.reminder_no} — {r.customer_name} ({r.subject})
              </option>
            ))}
          </Select>

          <Input
            label="Contact Date *"
            type="date"
            required
            value={followUpForm.contact_date}
            onChange={(e) =>
              setFollowUpForm({ ...followUpForm, contact_date: e.target.value })
            }
          />

          <Textarea
            label="Citizen Response Notes *"
            rows={3}
            required
            value={followUpForm.customer_response}
            onChange={(e) =>
              setFollowUpForm({ ...followUpForm, customer_response: e.target.value })
            }
          />

          <Input
            label="Next Action / Callback Date"
            type="date"
            value={followUpForm.next_follow_up}
            onChange={(e) =>
              setFollowUpForm({ ...followUpForm, next_follow_up: e.target.value })
            }
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddFollowUpModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addFollowUpMutation.isPending}
            >
              Record Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Follow-up Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!followUpToDelete}
        onClose={() => setFollowUpToDelete(null)}
        onConfirm={() => deleteFollowUpMutation.mutate()}
        title="Delete Follow-up Record?"
        message="Are you sure you want to delete this follow-up interaction log?"
        confirmText="Delete Follow-up"
        variant="danger"
        isLoading={deleteFollowUpMutation.isPending}
      />

      {/* Delete Reminder Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!reminderToDelete}
        onClose={() => setReminderToDelete(null)}
        onConfirm={() =>
          reminderToDelete && deleteReminderMutation.mutate(reminderToDelete.reminder_no)
        }
        title="Delete Reminder Record?"
        message={`Are you sure you want to permanently remove reminder ${reminderToDelete?.reminder_no}?`}
        confirmText="Delete Reminder"
        variant="danger"
        isLoading={deleteReminderMutation.isPending}
      />
    </AppShell>
  );
}
