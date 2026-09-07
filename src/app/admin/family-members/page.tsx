'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  DataTable,
  Column,
  Badge,
  Button,
  Input,
  Select,
  Card,
  Modal,
  ConfirmDialog,
  StatCard,
} from '@/components/ui';
import { familyMemberService } from '@/api/services/familyMemberService';
import { customerService } from '@/api/services/customerService';
import { useLanguage } from '@/context/LanguageContext';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { FamilyMember, RelationshipType, Customer } from '@/types';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  ShieldCheck,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'HEAD',
  'SELF',
  'WIFE',
  'HUSBAND',
  'SON',
  'DAUGHTER',
  'FATHER',
  'MOTHER',
  'BROTHER',
  'SISTER',
  'OTHER',
];

export default function FamilyMembersPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('ALL');
  const [selectedRelationship, setSelectedRelationship] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  // Form State for Add
  const [addForm, setAddForm] = useState({
    family_id: 'HTF-000002',
    name: '',
    relationship: 'SON' as RelationshipType,
    mobile_number: '',
    birth_date: '2005-01-01',
    is_active: true,
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState({
    name: '',
    relationship: 'SON' as RelationshipType,
    mobile_number: '',
    birth_date: '2005-01-01',
    is_active: true,
  });

  // Fetch Customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  // Fetch all members across all families
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['all-family-members', customers],
    queryFn: async () => {
      if (!customers.length) return [];
      const promises = customers.map((c) => familyMemberService.getMembers(c.family_id));
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: customers.length > 0,
  });

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: () => {
      const cust = customers.find((c) => c.family_id === addForm.family_id);
      return familyMemberService.addMember(addForm.family_id, {
        name: addForm.name,
        relationship: addForm.relationship,
        mobile_number: addForm.mobile_number,
        birth_date: addForm.birth_date,
        is_active: addForm.is_active,
        customer: cust?.id,
      });
    },
    onSuccess: () => {
      toast.success('Family member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['all-family-members'] });
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setIsAddOpen(false);
      setAddForm({
        family_id: customers[0]?.family_id || 'HTF-000002',
        name: '',
        relationship: 'SON',
        mobile_number: '',
        birth_date: '2005-01-01',
        is_active: true,
      });
    },
    onError: () => toast.error('Failed to add family member'),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!memberToEdit) throw new Error('No member selected');
      return familyMemberService.updateMember(memberToEdit.family_id, memberToEdit.id, editForm);
    },
    onSuccess: () => {
      toast.success('Family member updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['all-family-members'] });
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setMemberToEdit(null);
    },
    onError: () => toast.error('Failed to update family member'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!memberToDelete) throw new Error('No member selected');
      return familyMemberService.deleteMember(memberToDelete.family_id, memberToDelete.id);
    },
    onSuccess: () => {
      toast.success('Family member removed');
      queryClient.invalidateQueries({ queryKey: ['all-family-members'] });
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setMemberToDelete(null);
    },
    onError: () => toast.error('Failed to remove member'),
  });

  const handleOpenEdit = (member: FamilyMember) => {
    setMemberToEdit(member);
    setEditForm({
      name: member.name,
      relationship: member.relationship,
      mobile_number: member.mobile_number,
      birth_date: member.birth_date,
      is_active: member.is_active,
    });
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile_number.includes(search) ||
      m.family_id.toLowerCase().includes(search.toLowerCase());

    const matchesFamily = selectedFamilyId === 'ALL' || m.family_id === selectedFamilyId;
    const matchesRelationship =
      selectedRelationship === 'ALL' || m.relationship === selectedRelationship;

    return matchesSearch && matchesFamily && matchesRelationship;
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.is_active).length;
  const headCount = members.filter((m) => m.relationship === 'HEAD' || m.relationship === 'SELF').length;
  const dependentCount = totalMembers - headCount;

  const columns: Column<FamilyMember>[] = [
    {
      key: 'name',
      header: 'Member Name',
      sortable: true,
      cell: (member) => {
        const cust = customers.find((c) => c.family_id === member.family_id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              {member.name ? member.name[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Household: {cust?.head_of_family || member.family_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'relationship',
      header: 'Relationship',
      sortable: true,
      cell: (member) => (
        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs">
          {member.relationship}
        </span>
      ),
    },
    {
      key: 'family_id',
      header: t('family_id'),
      sortable: true,
      cell: (member) => (
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 font-mono font-black text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs">
          {member.family_id}
        </span>
      ),
    },
    {
      key: 'mobile_number',
      header: 'Mobile Contact',
      cell: (member) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {member.mobile_number || 'N/A'}
          {member.mobile_number && <WhatsAppButton number={member.mobile_number} size="xs" />}
        </span>
      ),
    },
    {
      key: 'birth_date',
      header: 'Date of Birth',
      sortable: true,
      cell: (member) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {member.birth_date}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: t('status'),
      sortable: true,
      cell: (member) => (
        <Badge variant={member.is_active ? 'success' : 'default'}>
          {member.is_active ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'right',
      cell: (member) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(member)}
            className="p-1.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
            title={t('edit_member')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMemberToDelete(member)}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title={t('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>FAMILY TREE &amp; DEPENDENTS REGISTRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('nav_family_members')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive citizen roster, family tree relations, dependent profiles, and digital verification.
          </p>
        </div>

        <Button
          onClick={() => {
            setAddForm({
              family_id: customers[0]?.family_id || 'HTF-000002',
              name: '',
              relationship: 'SON',
              mobile_number: '',
              birth_date: '2005-01-01',
              is_active: true,
            });
            setIsAddOpen(true);
          }}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {t('add_family_member')}
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Members"
          value={totalMembers}
          subtitle="Enrolled citizen individuals"
          icon={Users}
          colorScheme="brand"
        />
        <StatCard
          title="Active Dependents"
          value={activeMembers}
          subtitle="Active citizen files"
          icon={ShieldCheck}
          colorScheme="emerald"
        />
        <StatCard
          title="Heads of Household"
          value={headCount}
          subtitle="Family file holders"
          icon={HeartHandshake}
          colorScheme="sky"
        />
        <StatCard
          title="Enrolled Dependents"
          value={dependentCount}
          subtitle="Children, spouses &amp; elders"
          icon={Sparkles}
          colorScheme="amber"
        />
      </div>

      {/* Search & Filters */}
      <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name, mobile, or family token..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Households</option>
            {customers.map((c) => (
              <option key={c.id} value={c.family_id}>
                {c.family_id} — {c.head_of_family}
              </option>
            ))}
          </select>

          <select
            value={selectedRelationship}
            onChange={(e) => setSelectedRelationship(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Relations</option>
            {RELATIONSHIP_OPTIONS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Members Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        keyExtractor={(m) => `${m.family_id}_${m.id}`}
        isLoading={isLoading}
      />

      {/* Add Family Member Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('add_family_member')}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate();
          }}
          className="space-y-4"
        >
          <Select
            label="Citizen Household *"
            value={addForm.family_id}
            onChange={(e) => setAddForm({ ...addForm, family_id: e.target.value })}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.family_id}>
                {c.family_id} — {c.head_of_family} ({c.village_city})
              </option>
            ))}
          </Select>

          <Input
            label="Full Name *"
            required
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            placeholder="e.g. Priyaben Patel"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Relationship *"
              value={addForm.relationship}
              onChange={(e) => setAddForm({ ...addForm, relationship: e.target.value as RelationshipType })}
            >
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </Select>

            <Input
              label="Mobile Number"
              type="tel"
              value={addForm.mobile_number}
              onChange={(e) => setAddForm({ ...addForm, mobile_number: e.target.value })}
              placeholder="9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Birth *"
              type="date"
              required
              value={addForm.birth_date}
              onChange={(e) => setAddForm({ ...addForm, birth_date: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Status
              </label>
              <button
                type="button"
                onClick={() => setAddForm({ ...addForm, is_active: !addForm.is_active })}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                  addForm.is_active
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {addForm.is_active ? '✓ Active Member' : 'Inactive Member'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={addMutation.isPending}>
              {t('submit')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Family Member Modal */}
      <Modal
        isOpen={!!memberToEdit}
        onClose={() => setMemberToEdit(null)}
        title={`${t('edit_member')} — ${memberToEdit?.name}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Full Name *"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Relationship *"
              value={editForm.relationship}
              onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value as RelationshipType })}
            >
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </Select>

            <Input
              label="Mobile Number"
              type="tel"
              value={editForm.mobile_number}
              onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Birth *"
              type="date"
              required
              value={editForm.birth_date}
              onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Status
              </label>
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                  editForm.is_active
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {editForm.is_active ? '✓ Active Member' : 'Inactive Member'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setMemberToEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Remove Family Member?"
        message={`Are you sure you want to remove ${memberToDelete?.name} from household ${memberToDelete?.family_id}?`}
        confirmText="Remove Member"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
