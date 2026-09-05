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
import { documentService } from '@/api/services/documentService';
import { customerService } from '@/api/services/customerService';
import { familyMemberService } from '@/api/services/familyMemberService';
import { useLanguage } from '@/context/LanguageContext';
import { CustomerDocument, DocumentType, Customer, FamilyMember } from '@/types';
import { toast } from 'sonner';
import {
  ShieldCheck,
  UploadCloud,
  Search,
  FileCheck2,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
  Layers,
} from 'lucide-react';

const DOC_TYPES: DocumentType[] = [
  'AADHAR',
  'VOTER_ID',
  'PAN',
  'RATION_CARD',
  'BIRTH_CERTIFICATE',
  'CASTE_CERTIFICATE',
  'INCOME_CERTIFICATE',
  'DRIVING_LICENSE',
  'PHOTO',
  'OTHER',
];

export default function DocumentsVaultPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');
  const [selectedFamilyId, setSelectedFamilyId] = useState('ALL');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<CustomerDocument | null>(null);
  const [docToPreview, setDocToPreview] = useState<CustomerDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<CustomerDocument | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    family_id: 'HTF-000002',
    member_id: 3,
    document_type: 'AADHAR' as DocumentType,
    document_name: '',
    description: '',
    is_verified: true,
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    document_name: '',
    document_type: 'AADHAR' as DocumentType,
    description: '',
    is_verified: true,
  });

  // Fetch Customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  // Fetch members for the currently selected upload family
  const { data: uploadFamilyMembers = [] } = useQuery({
    queryKey: ['family-members', uploadForm.family_id],
    queryFn: () => familyMemberService.getMembers(uploadForm.family_id),
    enabled: !!uploadForm.family_id,
  });

  // Fetch all documents across all customers and members
  const { data: allDocs = [], isLoading } = useQuery({
    queryKey: ['all-customer-documents', customers],
    queryFn: async () => {
      if (!customers.length) return [];
      const docPromises = customers.map(async (c) => {
        const members = await familyMemberService.getMembers(c.family_id);
        const memberIds = members.length ? members.map((m) => m.id) : [1, 2, 3];
        const docsPerMember = await Promise.all(
          memberIds.map((mId) => documentService.getDocuments(c.family_id, mId))
        );
        return docsPerMember.flat();
      });
      const nested = await Promise.all(docPromises);
      return nested.flat();
    },
    enabled: customers.length > 0,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('document_type', uploadForm.document_type);
      fd.append('document_name', uploadForm.document_name);
      fd.append('description', uploadForm.description);
      fd.append('is_verified', String(uploadForm.is_verified));
      return documentService.uploadDocument(uploadForm.family_id, uploadForm.member_id, fd);
    },
    onSuccess: () => {
      toast.success('Document archived in Citizen Vault!');
      queryClient.invalidateQueries({ queryKey: ['all-customer-documents'] });
      setIsUploadOpen(false);
      setUploadForm({
        family_id: customers[0]?.family_id || 'HTF-000002',
        member_id: 3,
        document_type: 'AADHAR',
        document_name: '',
        description: '',
        is_verified: true,
      });
    },
    onError: () => toast.error('Failed to upload document'),
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: () => {
      if (!docToEdit) throw new Error('No document selected');
      return documentService.updateDocument(
        docToEdit.family_id,
        docToEdit.family_member,
        docToEdit.id,
        editForm
      );
    },
    onSuccess: () => {
      toast.success('Document details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['all-customer-documents'] });
      setDocToEdit(null);
    },
    onError: () => toast.error('Failed to update document'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!docToDelete) throw new Error('No document selected');
      return documentService.deleteDocument(
        docToDelete.family_id,
        docToDelete.family_member,
        docToDelete.id
      );
    },
    onSuccess: () => {
      toast.success('Document permanently deleted');
      queryClient.invalidateQueries({ queryKey: ['all-customer-documents'] });
      setDocToDelete(null);
    },
    onError: () => toast.error('Failed to delete document'),
  });

  // Toggle quick verify
  const handleQuickToggleVerify = async (doc: CustomerDocument) => {
    try {
      const nextStatus = !doc.is_verified;
      await documentService.updateDocument(doc.family_id, doc.family_member, doc.id, {
        is_verified: nextStatus,
      });
      toast.success(nextStatus ? 'Marked as verified original' : 'Marked as unverified');
      queryClient.invalidateQueries({ queryKey: ['all-customer-documents'] });
      if (docToPreview && docToPreview.id === doc.id) {
        setDocToPreview({ ...docToPreview, is_verified: nextStatus });
      }
    } catch {
      toast.error('Failed to update verification status');
    }
  };

  const handleOpenEdit = (doc: CustomerDocument) => {
    setDocToEdit(doc);
    setEditForm({
      document_name: doc.document_name,
      document_type: doc.document_type,
      description: doc.description || '',
      is_verified: doc.is_verified,
    });
  };

  // Filtered documents
  const filteredDocs = allDocs.filter((doc) => {
    const matchesSearch =
      doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.family_id.toLowerCase().includes(search.toLowerCase()) ||
      (doc.member_name && doc.member_name.toLowerCase().includes(search.toLowerCase())) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'ALL' || doc.document_type === selectedType;
    const matchesVerification =
      selectedVerification === 'ALL' ||
      (selectedVerification === 'VERIFIED' && doc.is_verified) ||
      (selectedVerification === 'UNVERIFIED' && !doc.is_verified);

    const matchesFamily = selectedFamilyId === 'ALL' || doc.family_id === selectedFamilyId;

    return matchesSearch && matchesType && matchesVerification && matchesFamily;
  });

  const totalVaultFiles = allDocs.length;
  const verifiedCount = allDocs.filter((d) => d.is_verified).length;
  const pendingCount = totalVaultFiles - verifiedCount;
  const uniqueTypesCount = new Set(allDocs.map((d) => d.document_type)).size;

  const columns: Column<CustomerDocument>[] = [
    {
      key: 'document_name',
      header: 'Document Name & Record',
      sortable: true,
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600/15 to-purple-600/15 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{doc.document_name}</span>
              {doc.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {doc.description || 'No description provided'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'document_type',
      header: 'Category',
      sortable: true,
      cell: (doc) => (
        <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 font-black text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-[11px]">
          {doc.document_type_display || doc.document_type}
        </span>
      ),
    },
    {
      key: 'family_id',
      header: t('family_id'),
      sortable: true,
      cell: (doc) => (
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 font-mono font-black text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs">
          {doc.family_id}
        </span>
      ),
    },
    {
      key: 'member_name',
      header: 'Family Member',
      cell: (doc) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
          {doc.member_name || `Member #${doc.family_member}`}
        </span>
      ),
    },
    {
      key: 'is_verified',
      header: 'Verification Status',
      sortable: true,
      cell: (doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickToggleVerify(doc);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
            doc.is_verified
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
          }`}
          title="Click to toggle verification status"
        >
          {doc.is_verified ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Original</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Unverified File</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'created_at',
      header: 'Date Archived',
      sortable: true,
      cell: (doc) => (
        <span className="font-mono text-xs text-slate-500">
          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDocToPreview(doc)}
            className="p-1.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
            title="Preview Document"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(doc)}
            className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors"
            title={t('edit_document')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDocToDelete(doc)}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-black tracking-wide mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CENTRALIZED DOCUMENT VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('nav_digital_vault')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, preview, verify, and manage citizen government documents, biometric files, and certificates.
          </p>
        </div>

        <Button
          onClick={() => {
            setUploadForm({
              family_id: customers[0]?.family_id || 'HTF-000002',
              member_id: 3,
              document_type: 'AADHAR',
              document_name: '',
              description: '',
              is_verified: true,
            });
            setIsUploadOpen(true);
          }}
          variant="primary"
          leftIcon={<UploadCloud className="w-4 h-4" />}
        >
          {t('upload_document')}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Archived Documents"
          value={totalVaultFiles}
          subtitle="Citizen digital records"
          icon={FileCheck2}
          colorScheme="brand"
        />
        <StatCard
          title="Verified Originals"
          value={verifiedCount}
          subtitle="KYC approved files"
          icon={ShieldCheck}
          colorScheme="emerald"
        />
        <StatCard
          title="Pending Verification"
          value={pendingCount}
          subtitle="Requires desk review"
          icon={XCircle}
          colorScheme="amber"
        />
        <StatCard
          title="Document Types Active"
          value={uniqueTypesCount}
          subtitle="Aadhar, PAN, Voter, etc."
          icon={Layers}
          colorScheme="sky"
        />
      </div>

      {/* Filters Bar */}
      <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name, token, description, or citizen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Categories</option>
            {DOC_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Status</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNVERIFIED">Unverified Only</option>
          </select>

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
        </div>
      </Card>

      {/* Documents Table */}
      <DataTable
        columns={columns}
        data={filteredDocs}
        keyExtractor={(d) => `${d.family_id}_${d.family_member}_${d.id}`}
        isLoading={isLoading}
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title={t('upload_document')}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Citizen Household *"
              value={uploadForm.family_id}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, family_id: e.target.value, member_id: 1 })
              }
            >
              {customers.map((c) => (
                <option key={c.id} value={c.family_id}>
                  {c.family_id} — {c.head_of_family}
                </option>
              ))}
            </Select>

            <Select
              label="Family Member *"
              value={uploadForm.member_id}
              onChange={(e) => setUploadForm({ ...uploadForm, member_id: Number(e.target.value) })}
            >
              {uploadFamilyMembers.length > 0 ? (
                uploadFamilyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))
              ) : (
                <option value={3}>Head of Family (Default)</option>
              )}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Document Type *"
              value={uploadForm.document_type}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, document_type: e.target.value as DocumentType })
              }
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt.replace('_', ' ')}
                </option>
              ))}
            </Select>

            <Input
              label="Document File Title *"
              required
              value={uploadForm.document_name}
              onChange={(e) => setUploadForm({ ...uploadForm, document_name: e.target.value })}
              placeholder="e.g. Aadhaar Card Original Front/Back"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document File (PDF or Image) *
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-brand-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500 font-medium">Click to select PDF or JPEG/PNG</p>
              <input type="file" className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="mt-2 inline-block px-3 py-1 bg-brand-600 text-white rounded-xl text-[11px] font-bold cursor-pointer hover:bg-brand-500 transition-colors"
              >
                Browse File
              </label>
            </div>
          </div>

          <Input
            label="Internal Notes / Description"
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            placeholder="e.g. Scanned with original stamp from Tehsil office"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Verification Status
            </label>
            <button
              type="button"
              onClick={() => setUploadForm({ ...uploadForm, is_verified: !uploadForm.is_verified })}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                uploadForm.is_verified
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-300 dark:border-amber-800'
              }`}
            >
              {uploadForm.is_verified ? '✓ Verified Original' : 'Unverified (Awaiting Desk Review)'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsUploadOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={uploadMutation.isPending}>
              Archive Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Document Metadata Modal */}
      <Modal
        isOpen={!!docToEdit}
        onClose={() => setDocToEdit(null)}
        title={`${t('edit_document')} — ${docToEdit?.document_name}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Document Name *"
            required
            value={editForm.document_name}
            onChange={(e) => setEditForm({ ...editForm, document_name: e.target.value })}
          />

          <Select
            label="Document Category *"
            value={editForm.document_type}
            onChange={(e) =>
              setEditForm({ ...editForm, document_type: e.target.value as DocumentType })
            }
          >
            {DOC_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt.replace('_', ' ')}
              </option>
            ))}
          </Select>

          <Input
            label="Description / Notes"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Verification Status
            </label>
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, is_verified: !editForm.is_verified })}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition-all ${
                editForm.is_verified
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-300 dark:border-amber-800'
              }`}
            >
              {editForm.is_verified ? '✓ Verified Original' : 'Unverified (Awaiting Review)'}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setDocToEdit(null)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={editMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Document Modal */}
      <Modal
        isOpen={!!docToPreview}
        onClose={() => setDocToPreview(null)}
        title={docToPreview?.document_name || 'Document Preview'}
        maxWidth="2xl"
      >
        {docToPreview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  {docToPreview.family_id}
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {docToPreview.member_name || `Member #${docToPreview.family_member}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={docToPreview.is_verified ? 'success' : 'warning'}>
                  {docToPreview.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
                <Button
                  size="sm"
                  variant={docToPreview.is_verified ? 'secondary' : 'primary'}
                  onClick={() => handleQuickToggleVerify(docToPreview)}
                >
                  {docToPreview.is_verified ? 'Unverify' : 'Mark as Verified'}
                </Button>
              </div>
            </div>

            {/* Document Viewer Frame */}
            <div className="h-80 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-6 text-center border border-slate-800 relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold text-sm">{docToPreview.document_name}</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">
                Secure Government Document File: {docToPreview.document_file}
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href={docToPreview.document_file || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDocToPreview(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Document?"
        message={`Are you sure you want to permanently delete "${docToDelete?.document_name}" from household ${docToDelete?.family_id}?`}
        confirmText="Delete Document"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
