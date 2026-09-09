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
import { ServiceIntakeModal } from '@/components/applications/ServiceIntakeModal';
import { useLanguage } from '@/context/LanguageContext';
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
  Search,
  LayoutGrid,
  List,
  Users,
  Send,
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
  const { t, language } = useLanguage();
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({ 3: true, 4: true });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubServiceModalOpen, setIsSubServiceModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BaseService | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedServiceForIntake, setSelectedServiceForIntake] = useState<BaseService | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'add_service') {
        setIsServiceModalOpen(true);
      }
    }
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
  const [builderForm, setBuilderForm] = useState<Partial<BaseService>>({
    ServiceName: '',
    ServiceNameGu: '',
    Category: 'GOVT_FORMS',
    GovernmentFee: 0,
    ServiceCharge: 50,
    SlaDays: 3,
    PortalUrl: '',
    StaffInstructions: '',
    SmsTemplateGu: '',
  });

  // Query
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['base-services'],
    queryFn: () => baseServiceService.getServices(),
  });

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      ALL: services.length,
      GOVT_FORMS: 0,
      CARD_SERVICES: 0,
      NEW_SERVICES: 0,
      OTHER_SERVICES: 0,
      COMPUTER_COURSES: 0,
      ADDITIONAL_SERVICES: 0,
    };
    services.forEach((s) => {
      const cat = s.Category || 'GOVT_FORMS';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts[cat] = 1;
      }
    });
    return counts;
  }, [services]);

  const categoryPills = React.useMemo(() => {
    if (language === 'gu') {
      return [
        { key: 'ALL', label: `બધી સેવાઓ (${categoryCounts.ALL || 0})` },
        { key: 'GOVT_FORMS', label: `મહેસૂલી & સરકારી યોજના (${categoryCounts.GOVT_FORMS || 0})` },
        { key: 'CARD_SERVICES', label: `કાર્ડ સુધારા & KYC (${categoryCounts.CARD_SERVICES || 0})` },
        { key: 'NEW_SERVICES', label: `નવા કાર્ડ & દાખલા (${categoryCounts.NEW_SERVICES || 0})` },
        { key: 'OTHER_SERVICES', label: `કાનૂની & પ્રિન્ટિંગ (${categoryCounts.OTHER_SERVICES || 0})` },
        { key: 'COMPUTER_COURSES', label: `કોમ્પ્યુટર કોર્સ (${categoryCounts.COMPUTER_COURSES || 0})` },
        { key: 'ADDITIONAL_SERVICES', label: `ઓનલાઇન & બેંકિંગ (${categoryCounts.ADDITIONAL_SERVICES || 0})` },
      ];
    }
    if (language === 'hi') {
      return [
        { key: 'ALL', label: `सभी सेवाएं (${categoryCounts.ALL || 0})` },
        { key: 'GOVT_FORMS', label: `राजस्व एवं सरकारी योजनाएं (${categoryCounts.GOVT_FORMS || 0})` },
        { key: 'CARD_SERVICES', label: `कार्ड सुधार एवं KYC (${categoryCounts.CARD_SERVICES || 0})` },
        { key: 'NEW_SERVICES', label: `नए कार्ड एवं प्रमाण पत्र (${categoryCounts.NEW_SERVICES || 0})` },
        { key: 'OTHER_SERVICES', label: `कानूनी एवं प्रिंटिंग (${categoryCounts.OTHER_SERVICES || 0})` },
        { key: 'COMPUTER_COURSES', label: `कंप्यूटर कोर्स (${categoryCounts.COMPUTER_COURSES || 0})` },
        { key: 'ADDITIONAL_SERVICES', label: `ऑनलाइन एवं बैंकिंग (${categoryCounts.ADDITIONAL_SERVICES || 0})` },
      ];
    }
    return [
      { key: 'ALL', label: `All Services (${categoryCounts.ALL || 0})` },
      { key: 'GOVT_FORMS', label: `Revenue & Govt Schemes (${categoryCounts.GOVT_FORMS || 0})` },
      { key: 'CARD_SERVICES', label: `Card Updates & KYC (${categoryCounts.CARD_SERVICES || 0})` },
      { key: 'NEW_SERVICES', label: `New Cards & Certificates (${categoryCounts.NEW_SERVICES || 0})` },
      { key: 'OTHER_SERVICES', label: `Legal & Printing (${categoryCounts.OTHER_SERVICES || 0})` },
      { key: 'COMPUTER_COURSES', label: `Computer Courses (${categoryCounts.COMPUTER_COURSES || 0})` },
      { key: 'ADDITIONAL_SERVICES', label: `Online & Banking (${categoryCounts.ADDITIONAL_SERVICES || 0})` },
    ];
  }, [language, categoryCounts]);

  const getCategoryBadgeLabel = (cat?: string) => {
    if (!cat) return language === 'gu' ? 'સરકારી યોજના' : 'Govt Schemes';
    const mapGu: Record<string, string> = {
      GOVT_FORMS: 'મહેસૂલી & સરકારી યોજના',
      CARD_SERVICES: 'કાર્ડ સુધારા & KYC',
      NEW_SERVICES: 'નવા કાર્ડ & દાખલા',
      OTHER_SERVICES: 'કાનૂની & પ્રિન્ટિંગ',
      COMPUTER_COURSES: 'કોમ્પ્યુટર કોર્સ',
      ADDITIONAL_SERVICES: 'ઓનલાઇન & બેંકિંગ',
    };
    const mapEn: Record<string, string> = {
      GOVT_FORMS: 'Govt Schemes',
      CARD_SERVICES: 'Card Updates',
      NEW_SERVICES: 'New Cards',
      OTHER_SERVICES: 'Legal & Print',
      COMPUTER_COURSES: 'Courses',
      ADDITIONAL_SERVICES: 'Online Services',
    };
    const mapHi: Record<string, string> = {
      GOVT_FORMS: 'सरकारी योजना',
      CARD_SERVICES: 'कार्ड सुधार',
      NEW_SERVICES: 'नए कार्ड',
      OTHER_SERVICES: 'कानूनी सेवाएं',
      COMPUTER_COURSES: 'कंप्यूटर कोर्स',
      ADDITIONAL_SERVICES: 'ऑनलाइन सेवाएं',
    };
    if (language === 'gu') return mapGu[cat] || cat;
    if (language === 'hi') return mapHi[cat] || cat;
    return mapEn[cat] || cat;
  };

  const updateServiceMutation = useMutation({
    mutationFn: () => {
      if (!editingService) throw new Error('No service selected');
      return baseServiceService.updateService(editingService.id, builderForm);
    },
    onSuccess: () => {
      toast.success('Service rules, fees & SLA updated successfully');
      queryClient.invalidateQueries({ queryKey: ['base-services'] });
      setIsBuilderModalOpen(false);
    },
    onError: () => toast.error('Failed to update service'),
  });

  const openBuilder = (s: BaseService) => {
    setEditingService(s);
    setBuilderForm({
      ServiceName: s.ServiceName,
      ServiceNameGu: s.ServiceNameGu || '',
      Category: s.Category || 'GOVT_FORMS',
      GovernmentFee: s.GovernmentFee ?? 0,
      ServiceCharge: s.ServiceCharge ?? 50,
      SlaDays: s.SlaDays ?? 3,
      PortalUrl: s.PortalUrl || '',
      StaffInstructions: s.StaffInstructions || '',
      SmsTemplateGu: s.SmsTemplateGu || '',
    });
    setIsBuilderModalOpen(true);
  };

  const filteredServices = services.filter((s) => {
    const cat = s.Category || 'GOVT_FORMS';
    const matchesCat = selectedCategory === 'ALL' || cat === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.ServiceName.toLowerCase().includes(q) ||
      (s.ServiceNameGu && s.ServiceNameGu.toLowerCase().includes(q)) ||
      (s.Description && s.Description.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const getCategoryTitle = (catKey: string) => {
    if (language === 'gu') {
      const map: Record<string, string> = {
        ALL: 'બધી સેવાઓ',
        GOVT_FORMS: 'મહેસૂલી & સરકારી યોજના',
        CARD_SERVICES: 'કાર્ડ સુધારા & KYC',
        NEW_SERVICES: 'નવા કાર્ડ & દાખલા',
        OTHER_SERVICES: 'કાનૂની & પ્રિન્ટિંગ',
        COMPUTER_COURSES: 'કોમ્પ્યુટર કોર્સ',
        ADDITIONAL_SERVICES: 'ઓનલાઇન & બેંકિંગ',
      };
      return map[catKey] || catKey;
    }
    if (language === 'hi') {
      const map: Record<string, string> = {
        ALL: 'सभी सेवाएं',
        GOVT_FORMS: 'राजस्व एवं सरकारी योजनाएं',
        CARD_SERVICES: 'कार्ड सुधार एवं KYC',
        NEW_SERVICES: 'नए कार्ड एवं प्रमाण पत्र',
        OTHER_SERVICES: 'कानूनी एवं प्रिंटिंग',
        COMPUTER_COURSES: 'कंप्यूटर कोर्स',
        ADDITIONAL_SERVICES: 'ऑनलाइन एवं बैंकिंग',
      };
      return map[catKey] || catKey;
    }
    const map: Record<string, string> = {
      ALL: 'All Services',
      GOVT_FORMS: 'Revenue & Govt Schemes',
      CARD_SERVICES: 'Card Updates & KYC',
      NEW_SERVICES: 'New Cards & Certificates',
      OTHER_SERVICES: 'Legal & Printing',
      COMPUTER_COURSES: 'Computer Courses',
      ADDITIONAL_SERVICES: 'Online & Banking',
    };
    return map[catKey] || catKey;
  };

  const groupedCategories = React.useMemo(() => {
    const categoryKeys = [
      'GOVT_FORMS',
      'CARD_SERVICES',
      'NEW_SERVICES',
      'OTHER_SERVICES',
      'COMPUTER_COURSES',
      'ADDITIONAL_SERVICES',
    ];

    if (selectedCategory !== 'ALL') {
      const items = filteredServices.filter(
        (s) => (s.Category || 'GOVT_FORMS') === selectedCategory
      );
      return [{ key: selectedCategory, title: getCategoryTitle(selectedCategory), items }];
    }

    const groups: { key: string; title: string; items: BaseService[] }[] = [];
    categoryKeys.forEach((key) => {
      const items = filteredServices.filter((s) => (s.Category || 'GOVT_FORMS') === key);
      if (items.length > 0) {
        groups.push({
          key,
          title: getCategoryTitle(key),
          items,
        });
      }
    });

    const otherItems = filteredServices.filter(
      (s) => !categoryKeys.includes(s.Category || 'GOVT_FORMS')
    );
    if (otherItems.length > 0) {
      groups.push({
        key: 'OTHER',
        title: language === 'gu' ? 'અન્ય સેવાઓ' : 'Other Services',
        items: otherItems,
      });
    }

    return groups;
  }, [filteredServices, selectedCategory, language]);

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
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-black tracking-wide mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>SERVICE ARCHITECTURE & RULES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('catalog_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('catalog_sub')}
          </p>
        </div>

        <Button
          onClick={() => setIsServiceModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('add_base_service')}
        </Button>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={language === 'gu' ? 'મુખ્ય સેવાઓ' : 'Base Services'}
          value={services.length}
          subtitle={language === 'gu' ? 'મુખ્ય પોર્ટલ કેટેગરીઝ' : 'Primary portal categories'}
          icon={FolderTree}
          colorScheme="brand"
        />
        <StatCard
          title={language === 'gu' ? 'પેટા-સેવા કામગીરી' : 'Sub-Service Operations'}
          value={totalSubServices}
          subtitle={language === 'gu' ? 'રૂપરેખાંકિત કામગીરી' : 'Configured operations'}
          icon={Layers}
          colorScheme="emerald"
        />
        <StatCard
          title={language === 'gu' ? 'ચેકલિસ્ટ દસ્તાવેજ નિયમો' : 'Checklist Document Rules'}
          value={totalRequiredDocs}
          subtitle={language === 'gu' ? 'સક્રિય જરૂરિયાત નિયમો' : 'Active requirement rules'}
          icon={FileCheck2}
          colorScheme="purple"
        />
      </div>

      {/* Category Pills & Search Filter */}
      <div className="space-y-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'gu'
                  ? 'સેવાનું નામ, યોજના (દા.ત. 7/12, આવક, કિસાન) અથવા વિગત શોધો...'
                  : language === 'hi'
                  ? 'सेवा का नाम, योजना या विवरण खोजें...'
                  : 'Search service by name, government scheme, or keywords...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>

          {/* View Switcher: Box / Grid vs List */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex-shrink-0 select-none">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Box / Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Box / Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BOX / GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-8 animate-fade-in">
          {groupedCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderTree className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'gu' ? 'કોઈ સેવા મળી નથી' : 'No services found matching criteria'}
              </p>
            </div>
          ) : (
            groupedCategories.map((group) => (
              <div key={group.key} className="space-y-4 pt-2">
                {/* Category Section Header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20"></span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {group.title} <span className="text-brand-600 dark:text-brand-400 font-extrabold">({group.items.length})</span>
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {language === 'gu'
                      ? `${group.items.length} સેવાઓ`
                      : language === 'hi'
                      ? `${group.items.length} सेवाएं`
                      : `${group.items.length} Services`}
                  </span>
                </div>

                {/* Grid for this category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((service) => {
                    const isExpanded = !!expandedServices[service.id];
                    const subCount = (service.SubServices || []).length;
                    const reqDocCount = (service.SubServices || []).reduce(
                      (sum, sub) => sum + (sub.RequiredDocuments || []).length,
                      0
                    );

                    return (
                      <Card
                        key={service.id}
                        variant="elevated"
                        className="group flex flex-col justify-between overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900"
                      >
                        <div className="p-5 space-y-3.5">
                          {/* Category & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                              {getCategoryBadgeLabel(service.Category)}
                            </span>
                            <Badge variant={service.IsActive ? 'success' : 'default'}>
                              {service.IsActive ? (language === 'gu' ? 'સક્રિય' : 'Active') : (language === 'gu' ? 'નિષ્ક્રિય' : 'Disabled')}
                            </Badge>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {language === 'gu' && service.ServiceNameGu ? service.ServiceNameGu : service.ServiceName}
                            </h3>
                          </div>

                          {/* Description */}
                          {service.Description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {service.Description}
                            </p>
                          )}

                          {/* Fee & SLA Info Box */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center font-mono">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans">Govt Fee</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                ₹{service.GovernmentFee ?? 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans">Desk Fee</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                ₹{service.ServiceCharge ?? 50}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans">SLA</span>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                {service.SlaDays || 3}d
                              </span>
                            </div>
                          </div>

                          {/* Sub-services & Checklist Counts */}
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Layers className="w-3.5 h-3.5 text-brand-500" />
                              {subCount} Sub-services
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                              {reqDocCount} Rules
                            </span>
                          </div>

                          {/* Required Documents preview chips */}
                          {(() => {
                            const reqDocs: string[] = Array.from(
                              new Set(
                                (service.SubServices || []).flatMap((sub) =>
                                  (sub.RequiredDocuments || []).map((d) => d.DocumentName)
                                )
                              )
                            );
                            if (reqDocs.length === 0) return null;
                            return (
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                  <FileCheck2 className="w-3 h-3 text-purple-500" />
                                  <span>{language === 'gu' ? 'જરૂરી પુરાવા / દસ્તાવેજ:' : 'Required Documents:'}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {reqDocs.slice(0, 3).map((doc, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium truncate max-w-[150px]"
                                      title={doc}
                                    >
                                      {doc}
                                    </span>
                                  ))}
                                  {reqDocs.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                      +{reqDocs.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Assigned Staff */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-[11px] truncate">
                              <strong className="text-slate-700 dark:text-slate-300">{language === 'gu' ? 'સ્ટાફ' : 'Staff'}:</strong>{' '}
                              {service.StaffInstructions ? (service.StaffInstructions.length > 25 ? service.StaffInstructions.slice(0, 25) + '...' : service.StaffInstructions) : (language === 'gu' ? 'સહાયક ઓપરેટર' : 'Desk Operator')}
                            </span>
                          </div>

                          {/* Expanded Sub-services Drawer inside card */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fade-in">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Sub-Service Operations:
                              </h4>
                              {(service.SubServices || []).length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No sub-services attached</p>
                              ) : (
                                (service.SubServices || []).map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                                  >
                                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate mr-2">
                                      {sub.SubServiceName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                                      {(sub.RequiredDocuments || []).length} Docs
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Actions Footer */}
                        <div className="p-3 bg-slate-50/75 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          <button
                            onClick={() => toggleExpand(service.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => {
                                setSelectedServiceForIntake(service);
                                setIsIntakeModalOpen(true);
                              }}
                              variant="primary"
                              size="xs"
                              leftIcon={<Send className="w-3 h-3" />}
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-xs"
                            >
                              {language === 'gu' ? 'અરજી કરો' : 'Apply'}
                            </Button>
                            <Button
                              onClick={() => openBuilder(service)}
                              variant="outline"
                              size="xs"
                              leftIcon={<Edit2 className="w-3 h-3" />}
                            >
                              Rules
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedServiceId(service.id);
                                setIsSubServiceModalOpen(true);
                              }}
                              variant="glass"
                              size="xs"
                              leftIcon={<Plus className="w-3 h-3" />}
                            >
                              + Sub
                            </Button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'service',
                                  id: service.id,
                                  title: `Base Service: ${service.ServiceName}`,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIST / ACCORDION VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-8 animate-fade-in">
          {groupedCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderTree className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'gu' ? 'કોઈ સેવા મળી નથી' : 'No services found matching criteria'}
              </p>
            </div>
          ) : (
            groupedCategories.map((group) => (
              <div key={group.key} className="space-y-4 pt-2">
                {/* Category Section Header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20"></span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {group.title} <span className="text-brand-600 dark:text-brand-400 font-extrabold">({group.items.length})</span>
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {language === 'gu'
                      ? `${group.items.length} સેવાઓ`
                      : language === 'hi'
                      ? `${group.items.length} सेवाएं`
                      : `${group.items.length} Services`}
                  </span>
                </div>

                {/* List of cards for this category */}
                <div className="space-y-4">
                  {group.items.map((service) => {
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
                          className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50/75 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/60 gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1 rounded-lg text-slate-400 mt-1">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-base text-slate-900 dark:text-white">
                                  {language === 'gu' && service.ServiceNameGu ? service.ServiceNameGu : service.ServiceName}
                                </h3>
                                <Badge variant={service.IsActive ? 'success' : 'default'}>
                                  {service.IsActive ? (language === 'gu' ? 'સક્રિય' : 'Active') : (language === 'gu' ? 'નિષ્ક્રિય' : 'Disabled')}
                                </Badge>
                                {service.Category && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {getCategoryBadgeLabel(service.Category)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                <span>Govt Fee: ₹{service.GovernmentFee ?? 0}</span>
                                <span>&bull;</span>
                                <span>Service Charge: ₹{service.ServiceCharge ?? 50}</span>
                                <span>&bull;</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">
                                  {service.SlaDays || 3} Days SLA
                                </span>
                              </div>

                              {service.Description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {service.Description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <Button
                              onClick={() => {
                                setSelectedServiceForIntake(service);
                                setIsIntakeModalOpen(true);
                              }}
                              variant="primary"
                              size="xs"
                              leftIcon={<Send className="w-3 h-3" />}
                              className="bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-xs"
                            >
                              {language === 'gu' ? 'અરજી કરો' : 'Apply Service'}
                            </Button>
                            <Button
                              onClick={() => openBuilder(service)}
                              variant="outline"
                              size="xs"
                              leftIcon={<Edit2 className="w-3 h-3" />}
                            >
                              Rules &amp; Fees
                            </Button>
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
                              className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
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
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-brand-500" />
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                      {sub.SubServiceName}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => {
                                        setSelectedSubServiceId(sub.id);
                                        setIsDocModalOpen(true);
                                      }}
                                      variant="outline"
                                      size="xs"
                                      leftIcon={<Plus className="w-3 h-3" />}
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
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                      title="Delete Sub-service"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Checklist Documents */}
                                <div className="space-y-1.5 pl-6">
                                  {(sub.RequiredDocuments || []).map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
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
                                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
              </div>
            ))
          )}
        </div>
      )}

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

      {/* Modal 4: Service Builder & Rules */}
      <Modal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        title={`Service Builder: ${editingService?.ServiceName || ''}`}
        description="Configure Gujarati names, categories, pricing, SLA days, and portal endpoints."
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateServiceMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Official Service Name (English) *"
              required
              value={builderForm.ServiceName || ''}
              onChange={(e) => setBuilderForm({ ...builderForm, ServiceName: e.target.value })}
            />
            <Input
              label={language === 'gu' ? 'સત્તાવાર સેવાનું નામ (ગુજરાતી) *' : 'Official Service Name (Gujarati) *'}
              required
              value={builderForm.ServiceNameGu || ''}
              onChange={(e) => setBuilderForm({ ...builderForm, ServiceNameGu: e.target.value })}
              placeholder={language === 'gu' ? 'દા.ત. આવકનો દાખલો, 7/12 ઉતારો' : 'e.g. Income Certificate, 7/12'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Official Service Category *"
              value={builderForm.Category || 'GOVT_FORMS'}
              onChange={(e) => setBuilderForm({ ...builderForm, Category: e.target.value as any })}
            >
              <option value="GOVT_FORMS">{language === 'gu' ? 'મહેસૂલી & સરકારી યોજના' : 'Revenue & Govt Schemes'}</option>
              <option value="CARD_SERVICES">{language === 'gu' ? 'કાર્ડ સુધારા & KYC' : 'Card Updates & KYC'}</option>
              <option value="NEW_SERVICES">{language === 'gu' ? 'નવા કાર્ડ & દાખલા' : 'New Cards & Certificates'}</option>
              <option value="OTHER_SERVICES">{language === 'gu' ? 'કાનૂની & પ્રિન્ટિંગ' : 'Legal & Printing'}</option>
              <option value="COMPUTER_COURSES">{language === 'gu' ? 'કોમ્પ્યુટર કોર્સ' : 'Computer Courses'}</option>
              <option value="ADDITIONAL_SERVICES">{language === 'gu' ? 'ઓનલાઇન & બેંકિંગ' : 'Online & Banking'}</option>
            </Select>

            <Input
              label="SLA Target (Working Days) *"
              type="number"
              required
              value={builderForm.SlaDays || 3}
              onChange={(e) => setBuilderForm({ ...builderForm, SlaDays: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Government Portal Official Fee (₹)"
              type="number"
              value={builderForm.GovernmentFee ?? 0}
              onChange={(e) => setBuilderForm({ ...builderForm, GovernmentFee: Number(e.target.value) })}
            />
            <Input
              label="HY-TECH Service Desk Charge (₹)"
              type="number"
              value={builderForm.ServiceCharge ?? 50}
              onChange={(e) => setBuilderForm({ ...builderForm, ServiceCharge: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Government Portal Direct URL (e.g. Digital Gujarat, Parivahan, UIDAI)"
            placeholder="https://digitalgujarat.gov.in"
            value={builderForm.PortalUrl || ''}
            onChange={(e) => setBuilderForm({ ...builderForm, PortalUrl: e.target.value })}
          />

          <Textarea
            label="Staff Operating Instructions & Verification Guidelines"
            placeholder="Special instructions for desk operators when processing this service..."
            rows={2}
            value={builderForm.StaffInstructions || ''}
            onChange={(e) => setBuilderForm({ ...builderForm, StaffInstructions: e.target.value })}
          />

          <Textarea
            label="Gujarati Citizen SMS Notification Template"
            placeholder="નમસ્તે {citizen}, આપનું {service} સફળતાપૂર્વક પૂર્ણ થયેલ છે..."
            rows={2}
            value={builderForm.SmsTemplateGu || ''}
            onChange={(e) => setBuilderForm({ ...builderForm, SmsTemplateGu: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBuilderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateServiceMutation.isPending}
            >
              Save Service Rules & Pricing
            </Button>
          </div>
        </form>
      </Modal>


      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Catalogue Item?"
        message={`Are you sure you want to permanently remove ${deleteTarget?.title}? This may affect automatic visit checklists.`}
        confirmText="Delete"
        variant="danger"
        isLoading={
          deleteServiceMutation.isPending ||
          deleteSubServiceMutation.isPending ||
          deleteDocMutation.isPending
        }
      />

      {/* Service Intake Modal triggered directly from Catalog */}
      <ServiceIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => {
          setIsIntakeModalOpen(false);
          setSelectedServiceForIntake(null);
        }}
        initialServiceId={selectedServiceForIntake?.id}
      />
    </AppShell>
  );
}
