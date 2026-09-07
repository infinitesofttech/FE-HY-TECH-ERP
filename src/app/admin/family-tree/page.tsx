'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import {
  StatCard,
  Card,
  Badge,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { villageService } from '@/api/services/villageService';
import { useLanguage } from '@/context/LanguageContext';
import { Village, Customer, FamilyTreeNodeData, GovDocumentItem, RelationshipType } from '@/types';
import { InteractiveFamilyTree } from '@/components/family-tree/InteractiveFamilyTree';
import { MemberDetailDrawer } from '@/components/family-tree/MemberDetailDrawer';
import { UploadDocumentModal } from '@/components/family-tree/UploadDocumentModal';
import { AddRelationModal } from '@/components/family-tree/AddRelationModal';
import { CreateVillageModal } from '@/components/family-tree/CreateVillageModal';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  UserCheck,
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Plus,
  Network,
  Share2,
  Crown,
  Phone,
  Layers,
  Sparkles,
  Download,
  FolderTree,
} from 'lucide-react';

export default function VillageFamilyTreePage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Navigation Hierarchy State
  // Level 1: All Villages (selectedVillage = null)
  // Level 2: Village Members (selectedVillage != null, selectedFamily = null)
  // Level 3: Family Tree (selectedVillage != null, selectedFamily != null)
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Customer | null>(null);

  // Level 4 Drawer State
  const [selectedMember, setSelectedMember] = useState<FamilyTreeNodeData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [uploadingDoc, setUploadingDoc] = useState<GovDocumentItem | null>(null);
  const [isAddRelationOpen, setIsAddRelationOpen] = useState(false);
  const [isCreateVillageModalOpen, setIsCreateVillageModalOpen] = useState(false);

  // Filters
  const [villageSearch, setVillageSearch] = useState('');
  const [talukaFilter, setTalukaFilter] = useState('ALL');
  const [citizenSearch, setCitizenSearch] = useState('');

  // Queries
  const { data: villages = [], isLoading: villagesLoading } = useQuery({
    queryKey: ['villages'],
    queryFn: () => villageService.getVillages(),
  });

  const { data: villageFamilies = [], isLoading: familiesLoading } = useQuery({
    queryKey: ['village-families', selectedVillage?.name],
    queryFn: () => (selectedVillage ? villageService.getVillageFamilies(selectedVillage.name) : Promise.resolve([])),
    enabled: !!selectedVillage,
  });

  const { data: familyTreeData, refetch: refetchTree } = useQuery({
    queryKey: ['family-tree', selectedFamily?.family_id],
    queryFn: () => (selectedFamily ? villageService.getFamilyTree(selectedFamily.family_id) : Promise.resolve(undefined)),
    enabled: !!selectedFamily,
  });

  const nextVillageCode = useMemo(() => {
    const nextId = villages.length > 0 ? Math.max(...villages.map((v) => v.id)) + 1 : 1;
    return `VIL-${String(nextId).padStart(3, '0')}`;
  }, [villages]);

  const createVillageMutation = useMutation({
    mutationFn: (villageData: any) => villageService.createVillage(villageData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['villages'] });
      toast.success(
        language === 'gu'
          ? `નવું ગામ "${data.village.name_gu || data.village.name}" સફળતાપૂર્વક ઉમેરાયું!`
          : `Village "${data.village.name}" created successfully!`
      );
      setIsCreateVillageModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create village');
    },
  });

  const handleAddVillage = async (villageData: any) => {
    await createVillageMutation.mutateAsync(villageData);
  };

  // Filtered Villages
  const filteredVillages = useMemo(() => {
    return villages.filter((v) => {
      const q = villageSearch.toLowerCase();
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.name_gu.includes(q) ||
        v.code.toLowerCase().includes(q) ||
        v.taluka.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q);

      const matchTaluka = talukaFilter === 'ALL' || v.taluka === talukaFilter;
      return matchSearch && matchTaluka;
    });
  }, [villages, villageSearch, talukaFilter]);

  // Filtered Citizens in Village
  const filteredCitizens = useMemo(() => {
    return villageFamilies.filter((c) => {
      const q = citizenSearch.toLowerCase();
      return (
        !q ||
        c.head_of_family.toLowerCase().includes(q) ||
        c.family_id.toLowerCase().includes(q) ||
        c.mobile_number.includes(q)
      );
    });
  }, [villageFamilies, citizenSearch]);

  // Taluka options
  const talukas = useMemo<string[]>(() => {
    const unique = Array.from(new Set(villages.map((v) => v.taluka)));
    return ['ALL', ...unique];
  }, [villages]);

  // Handlers
  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
    setSelectedFamily(null);
    setSelectedMember(null);
    setIsDrawerOpen(false);
  };

  const handleSelectFamily = (family: Customer) => {
    setSelectedFamily(family);
    setSelectedMember(null);
    setIsDrawerOpen(false);
  };

  const handleSelectMemberNode = (node: FamilyTreeNodeData) => {
    setSelectedMember(node);
    setIsDrawerOpen(true);
  };

  const handleOpenDocsDrawer = (node: FamilyTreeNodeData) => {
    setSelectedMember(node);
    setIsDrawerOpen(true);
  };

  const handleDocumentUploaded = async (docId: string, docNo: string, fileUrl: string) => {
    if (!selectedFamily || !selectedMember) return;
    await villageService.updateMemberDoc(
      selectedFamily.family_id,
      selectedMember.id,
      docId,
      'VERIFIED',
      fileUrl,
      docNo
    );
    refetchTree();
    setUploadingDoc(null);
  };

  const handleAddRelation = async (newMember: {
    name: string;
    relationship: RelationshipType;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    birth_date: string;
    mobile_number: string;
  }) => {
    if (!selectedFamily) return;
    await villageService.addMemberRelation(selectedFamily.family_id, newMember);
    refetchTree();
  };

  const handleExportTree = () => {
    toast.success('Family tree hierarchy exported to PDF successfully!');
  };

  return (
    <AppShell allowedRoles={['admin', 'employee']}>
      {/* 1. TOP BREADCRUMB HIERARCHY BAR (only shown when drilled down into a village) */}
      {selectedVillage && (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 px-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedVillage(null);
              setSelectedFamily(null);
              setSelectedMember(null);
              setIsDrawerOpen(false);
            }}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {t('all_villages') || 'All Villages'}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => {
              setSelectedFamily(null);
              setSelectedMember(null);
              setIsDrawerOpen(false);
            }}
            className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer ${
              selectedVillage && !selectedFamily ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''
            }`}
          >
            {language === 'gu' ? selectedVillage.name_gu : selectedVillage.name} ({selectedVillage.code})
          </button>

          {selectedFamily && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {selectedFamily.head_of_family} ({selectedFamily.family_id})
              </span>
            </>
          )}

          {selectedMember && isDrawerOpen && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-white font-black truncate max-w-[140px]">
                {selectedMember.name}
              </span>
            </>
          )}
        </div>
      )}



      {/* ---------------------------------------------------- */}
      {/* LEVEL 1: ALL VILLAGES VIEW (ગામના બોક્સ) */}
      {/* ---------------------------------------------------- */}
      {!selectedVillage && (
        <div className="space-y-4 animate-fade-in">
          {/* Section Bar & Filter Toolbar */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={villageSearch}
                onChange={(e) => setVillageSearch(e.target.value)}
                placeholder={t('search_villages') || 'Search village by name, code, taluka, or district...'}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 font-medium transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <Select
                value={talukaFilter}
                onChange={(e) => setTalukaFilter(e.target.value)}
                className="py-1.5 text-xs font-bold"
              >
                {talukas.map((taluka) => (
                  <option key={taluka} value={taluka}>
                    {taluka === 'ALL' ? 'બધા તાલુકા / All Talukas' : taluka}
                  </option>
                ))}
              </Select>

              <Button
                type="button"
                onClick={() => setIsCreateVillageModalOpen(true)}
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'gu' ? '+ નવું ગામ ઉમેરો' : '+ Create Village'}</span>
              </Button>
            </div>
          </Card>

          {/* Villages Grid (4 cards per row on large desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVillages.map((village) => (
              <div
                key={village.id}
                onClick={() => handleSelectVillage(village)}
                className="group relative rounded-2xl p-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px]"
              >
                <div>
                  {/* Village Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {village.name}
                        </h3>
                        {village.name_gu && (
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {village.name_gu}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {village.code}
                    </span>
                  </div>

                  {/* Taluka / District tag */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{village.taluka} Taluka &bull; {village.district}</span>
                  </div>

                  {/* Statistics Counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Families</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{village.total_families}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizens</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{village.total_citizens}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Docs</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{village.total_documents}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Hover Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <span className="group-hover:underline">
                    {language === 'gu' ? 'ગામના સભ્યો જુઓ' : 'View Village Citizens'}
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEVEL 2: VILLAGE MEMBERS / HOUSEHOLDS VIEW */}
      {/* ---------------------------------------------------- */}
      {selectedVillage && !selectedFamily && (
        <div className="space-y-4 animate-fade-in">
          {/* Village Info Banner */}
          <Card variant="elevated" className="p-5 sm:p-6 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    {selectedVillage.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedVillage.taluka} Taluka &bull; {selectedVillage.district} District
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedVillage.name} Village ({selectedVillage.name_gu})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All registered families and citizen profiles under this village panchayat jurisdiction.
                </p>
              </div>

              {/* Village Quick Statistics */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Families</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{selectedVillage.total_families}</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizens</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{selectedVillage.total_citizens}</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Male / Female</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {selectedVillage.male_count} / {selectedVillage.female_count}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Citizen Search Toolbar */}
          <Card variant="elevated" className="p-3.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citizenSearch}
                onChange={(e) => setCitizenSearch(e.target.value)}
                placeholder={t('search_citizens_in_village') || 'Search citizen by name, mobile, or family ID...'}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 font-medium transition-all"
              />
            </div>
          </Card>

          {/* Citizens / Families Grid (3 or 4 cards per row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredCitizens.map((cust) => (
              <div
                key={cust.family_id}
                onClick={() => handleSelectFamily(cust)}
                className="group relative rounded-2xl p-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-sm flex-shrink-0">
                        {cust.head_of_family ? cust.head_of_family[0].toUpperCase() : 'H'}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {cust.head_of_family}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cust.mobile_number}</span>
                          <WhatsAppButton number={cust.mobile_number} size="xs" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 font-mono font-black text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                      {cust.family_id}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                      <Crown className="w-3 h-3" />
                      <span>Head of Family</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-black">
                      {cust.family_member_count || 4} Family Members
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-black">
                      Active
                    </span>
                  </div>

                  {/* Village Info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Village: <strong>{cust.village_city}</strong> &bull; Registered {cust.registration_date}</span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Network className="w-4 h-4" />
                    <span>{language === 'gu' ? 'ફેમિલી ટ્રી ઓપન કરો' : 'View Family Tree'}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEVEL 3: INTERACTIVE FAMILY TREE VIEW */}
      {/* ---------------------------------------------------- */}
      {selectedFamily && familyTreeData && (
        <div className="space-y-4 animate-fade-in">
          {/* Family Header Information Panel */}
          <Card variant="elevated" className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900 border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {selectedFamily.family_id}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {selectedVillage?.name || selectedFamily.village_city} Village
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedFamily.head_of_family}&apos;s Family Tree
                  </h2>
                </div>
              </div>

              {/* Family Meta Counters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
                  Total Members: <strong>{1 + (familyTreeData.spouse ? 1 : 0) + familyTreeData.children.length}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Generations: <strong>2</strong>
                </span>
                <Button
                  type="button"
                  variant="emerald"
                  size="sm"
                  onClick={() => setIsAddRelationOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  {t('add_relation') || '+ Add Relation'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Interactive Family Tree Graphical Hierarchy Canvas */}
          <InteractiveFamilyTree
            head={familyTreeData.head}
            spouse={familyTreeData.spouse}
            children={familyTreeData.children}
            selectedMemberId={selectedMember?.id}
            onSelectMember={handleSelectMemberNode}
            onOpenDocs={handleOpenDocsDrawer}
          />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEVEL 4: RIGHT-SIDE MEMBER DETAIL DRAWER & VAULT */}
      {/* ---------------------------------------------------- */}
      <MemberDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        member={selectedMember}
        familyHeadName={selectedFamily?.head_of_family || 'Dineshbhai Changani'}
        villageName={selectedVillage?.name || 'Bota'}
        onUploadDocClick={(doc) => setUploadingDoc(doc)}
      />

      {/* ---------------------------------------------------- */}
      {/* MODAL: UPLOAD MISSING GOVERNMENT DOCUMENT */}
      {/* ---------------------------------------------------- */}
      <UploadDocumentModal
        isOpen={!!uploadingDoc}
        onClose={() => setUploadingDoc(null)}
        document={uploadingDoc}
        memberName={selectedMember?.name}
        onSuccess={handleDocumentUploaded}
      />

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD RELATION TO TREE */}
      {/* ---------------------------------------------------- */}
      <AddRelationModal
        isOpen={isAddRelationOpen}
        onClose={() => setIsAddRelationOpen(false)}
        familyId={selectedFamily?.family_id}
        headName={selectedFamily?.head_of_family}
        onAdd={handleAddRelation}
      />

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE NEW VILLAGE */}
      {/* ---------------------------------------------------- */}
      <CreateVillageModal
        isOpen={isCreateVillageModalOpen}
        onClose={() => setIsCreateVillageModalOpen(false)}
        nextVillageCode={nextVillageCode}
        onAddVillage={handleAddVillage}
      />
    </AppShell>
  );
}
