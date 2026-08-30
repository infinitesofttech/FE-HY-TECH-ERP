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
  StatCard,
} from '@/components/ui';
import { baseServiceService } from '@/api/services/baseServiceService';
import { subServiceService } from '@/api/services/subServiceService';
import { requiredDocumentService } from '@/api/services/requiredDocumentService';
import { BaseService, SubService, RequiredDocument, DocumentType } from '@/types';
import { toast } from 'sonner';
import {
  FolderTree,
  Plus,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  FileText,
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

export default function ServiceCatalogPage() {
  const queryClient = useQueryClient();
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({ 3: true, 4: true });

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubServiceModalOpen, setIsSubServiceModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Active items for editing or parenting
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<number | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'service' | 'subservice' | 'doc';
    id: number;
    title: string;
  } | null>(null);

  // Forms
  const [serviceForm, setServiceForm] = useState({ ServiceName: '', Description: '', IsActive: true });
  const [subServiceForm, setSubServiceForm] = useState({ SubServiceName: '', Description: '' });
  const [docForm, setDocForm] = useState({ DocumentName: '', document_type: 'AADHAR' as DocumentType, IsRequired: true });

  // Query
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  const toggleExpand = (id: number) => {
    setExpandedServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Base Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: () => baseServiceService.createService(serviceForm),
    onSuccess: () => {
      toast.success('Base service created');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setIsServiceModalOpen(false);
      setServiceForm({ ServiceName: '', Description: '', IsActive: true });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => baseServiceService.deleteService(id),
    onSuccess: () => {
      toast.success('Service deleted');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setDeleteTarget(null);
    },
  });

  // Sub Service Mutations
  const createSubServiceMutation = useMutation({
    mutationFn: () =>
      subServiceService.createSubService({
        Service: selectedServiceId!,
        SubServiceName: subServiceForm.SubServiceName,
        Description: subServiceForm.Description,
      }),
    onSuccess: () => {
      toast.success('Sub-service attached successfully');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setIsSubServiceModalOpen(false);
      setSubServiceForm({ SubServiceName: '', Description: '' });
    },
  });

  const deleteSubServiceMutation = useMutation({
    mutationFn: (id: number) => subServiceService.deleteSubService(id),
    onSuccess: () => {
      toast.success('Sub-service deleted');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setDeleteTarget(null);
    },
  });

  // Required Document Mutations
  const createDocMutation = useMutation({
    mutationFn: () =>
      requiredDocumentService.createRequiredDocuments({
        SubService: selectedSubServiceId!,
        DocumentName: docForm.DocumentName,
        document_type: docForm.document_type,
      }),
    onSuccess: () => {
      toast.success('Required document added to checklist driver');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setIsDocModalOpen(false);
      setDocForm({ DocumentName: '', document_type: 'AADHAR', IsRequired: true });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: number) => requiredDocumentService.deleteRequiredDocument(id),
    onSuccess: () => {
      toast.success('Required document deleted');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setDeleteTarget(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'service') deleteServiceMutation.mutate(deleteTarget.id);
    if (deleteTarget.type === 'subservice') deleteSubServiceMutation.mutate(deleteTarget.id);
    if (deleteTarget.type === 'doc') deleteDocMutation.mutate(deleteTarget.id);
  };

  const totalSubServices = services.reduce((sum, s) => sum + (s.SubServices?.length || 0), 0);
  const totalRequiredDocs = services.reduce(
    (sum, s) =>
      sum +
      (s.SubServices || []).reduce((subSum, sub) => subSum + (sub.RequiredDocuments?.length || 0), 0),
    0
  );

  return (
    <AppShell allowedRoles={['admin']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-black tracking-wide mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>SERVICE ARCHITECTURE & RULES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Service Catalog & Document Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure base services, nested operations, and required checklist documents that auto-populate in visit intake.
          </p>
        </div>

        <Button
          onClick={() => setIsServiceModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Base Service
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Base Services"
          value={services.length}
          subtitle="Primary portal categories"
          icon={FolderTree}
          colorScheme="brand"
        />
        <StatCard
          title="Sub-Service Operations"
          value={totalSubServices}
          subtitle="Configured operations"
          icon={Layers}
          colorScheme="emerald"
        />
        <StatCard
          title="Checklist Document Rules"
          value={totalRequiredDocs}
          subtitle="Active requirement rules"
          icon={FileCheck2}
          colorScheme="purple"
        />
      </div>

      {/* Tree Accordion View */}
      <div className="space-y-4">
        {services.map((service) => {
          const isExpanded = !!expandedServices[service.id];

          return (
            <Card
              key={service.id}
              variant="elevated"
              className="overflow-hidden"
            >
              {/* Service Header Row */}
              <div
                onClick={() => toggleExpand(service.id)}
                className="flex items-center justify-between p-5 bg-slate-50/75 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">
                        {service.ServiceName}
                      </h3>
                      <Badge variant={service.IsActive ? 'success' : 'default'}>
                        {service.IsActive ? 'Active Service' : 'Disabled'}
                      </Badge>
                    </div>
                    {service.Description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {service.Description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-semibold text-slate-400 px-2">
                    {service.SubServices?.length || 0} Sub-services
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setIsSubServiceModalOpen(true);
                    }}
                    variant="glass"
                    size="xs"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Sub-service
                  </Button>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: 'service',
                        id: service.id,
                        title: `Base Service: ${service.ServiceName}`,
                      })
                    }
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-services Body */}
              {isExpanded && (
                <div className="p-5 space-y-4 bg-white dark:bg-slate-900 animate-fade-in">
                  {(service.SubServices || []).map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-brand-500" />
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {sub.SubServiceName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            ({sub.RequiredDocuments?.length || 0} checklist items)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              setSelectedSubServiceId(sub.id);
                              setIsDocModalOpen(true);
                            }}
                            variant="secondary"
                            size="xs"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Add Required Doc
                          </Button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'subservice',
                                id: sub.id,
                                title: `Sub-service: ${sub.SubServiceName}`,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Sub-service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Required Documents List */}
                      <div className="pl-6 space-y-2 border-l-2 border-slate-200 dark:border-slate-800">
                        {(sub.RequiredDocuments || []).map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {doc.DocumentName}
                              </span>
                              <Badge variant="purple">{doc.document_type}</Badge>
                            </div>

                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'doc',
                                  id: doc.id,
                                  title: `Required Document: ${doc.DocumentName}`,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete Requirement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {(!sub.RequiredDocuments || sub.RequiredDocuments.length === 0) && (
                          <p className="text-[11px] text-slate-400 italic py-1">
                            No mandatory documents attached yet. Click &apos;Add Required Doc&apos; to configure checklist triggers.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!service.SubServices || service.SubServices.length === 0) && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No sub-services configured for {service.ServiceName}. Click &apos;Add Sub-service&apos; above.
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal 1: Create Base Service */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Add Base Service Category"
        description="e.g. Aadhar Card Services, Ayushman Bharat Card"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createServiceMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Service Name *"
            required
            value={serviceForm.ServiceName}
            onChange={(e) => setServiceForm({ ...serviceForm, ServiceName: e.target.value })}
            placeholder="e.g. Aadhar Card"
          />

          <Textarea
            label="Description"
            rows={2}
            value={serviceForm.Description}
            onChange={(e) => setServiceForm({ ...serviceForm, Description: e.target.value })}
            placeholder="Brief details regarding government service..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createServiceMutation.isPending}
            >
              Create Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Create Sub-Service */}
      <Modal
        isOpen={isSubServiceModalOpen}
        onClose={() => setIsSubServiceModalOpen(false)}
        title="Add Sub-Service Operation"
        description="e.g. Child Enrollment (0-5 Years), Address Correction, Biometric Update"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createSubServiceMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Sub-Service Name *"
            required
            value={subServiceForm.SubServiceName}
            onChange={(e) =>
              setSubServiceForm({ ...subServiceForm, SubServiceName: e.target.value })
            }
            placeholder="e.g. Child Enrollment"
          />

          <Textarea
            label="Description / Process Notes"
            rows={2}
            value={subServiceForm.Description}
            onChange={(e) =>
              setSubServiceForm({ ...subServiceForm, Description: e.target.value })
            }
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSubServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createSubServiceMutation.isPending}
            >
              Attach Sub-service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Create Required Document */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Add Mandatory Checklist Document"
        description="This rule triggers automatic intake checklists during citizen visits."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createDocMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Document Requirement Name *"
            required
            value={docForm.DocumentName}
            onChange={(e) => setDocForm({ ...docForm, DocumentName: e.target.value })}
            placeholder="e.g. Child Birth Certificate with QR code"
          />

          <Select
            label="Document Type Category *"
            value={docForm.document_type}
            onChange={(e) =>
              setDocForm({ ...docForm, document_type: e.target.value as DocumentType })
            }
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDocModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createDocMutation.isPending}
            >
              Add Requirement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Catalog Item?"
        message={`Are you sure you want to permanently remove ${deleteTarget?.title}? This may affect automatic visit checklists.`}
        confirmText="Delete"
        variant="danger"
        isLoading={
          deleteServiceMutation.isPending ||
          deleteSubServiceMutation.isPending ||
          deleteDocMutation.isPending
        }
      />
    </AppShell>
  );
}
