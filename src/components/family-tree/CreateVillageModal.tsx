'use client';

import React, { useState } from 'react';
import { Modal, Input, Select, Button } from '@/components/ui';
import { Building2, Sparkles, MapPin, Users, FileText, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface CreateVillageModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextVillageCode?: string;
  onAddVillage: (villageData: {
    name: string;
    name_gu: string;
    code: string;
    taluka: string;
    district: string;
    total_families: number;
    total_citizens: number;
    total_documents: number;
  }) => Promise<void> | void;
}

const TALUKA_BASE = [
  'Botad',
  'Gadhada',
  'Barwala',
  'Ranpur',
  'Jasdan',
  'Bhavnagar',
  'Vallabhipur',
  'Sihor',
  'Palitana',
];

const DISTRICT_BASE = [
  'Botad',
  'Bhavnagar',
  'Rajkot',
  'Ahmedabad',
  'Amreli',
  'Surendranagar',
  'Junagadh',
];

export const CreateVillageModal: React.FC<CreateVillageModalProps> = ({
  isOpen,
  onClose,
  nextVillageCode = 'VIL-007',
  onAddVillage,
}) => {
  const { language } = useLanguage();
  const isGu = language === 'gu';

  const [name, setName] = useState('');
  const [nameGu, setNameGu] = useState('');
  const [code, setCode] = useState(nextVillageCode);
  const [taluka, setTaluka] = useState('Botad');
  const [customTaluka, setCustomTaluka] = useState('');
  const [district, setDistrict] = useState('Botad');
  const [customDistrict, setCustomDistrict] = useState('');
  const [totalFamilies, setTotalFamilies] = useState('85');
  const [totalCitizens, setTotalCitizens] = useState('360');
  const [totalDocuments, setTotalDocuments] = useState('950');
  const [isLoading, setIsLoading] = useState(false);

  const talukaOptions = [...TALUKA_BASE, isGu ? 'અન્ય' : 'Other'];
  const districtOptions = [...DISTRICT_BASE, isGu ? 'અન્ય' : 'Other'];

  // Quick 1-Click Demo Fill
  const handleQuickDemoFill = () => {
    setName('Salangpur');
    setNameGu('સાળંગપુર');
    setCode(nextVillageCode);
    setTaluka('Barwala');
    setDistrict('Botad');
    setTotalFamilies('115');
    setTotalCitizens('510');
    setTotalDocuments('1420');
    toast.success(isGu ? 'નમૂના ગામની વિગતો ઓટો-ફિલ થઈ ગઈ!' : 'Demo village details auto-filled!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isGu ? 'ગામનું નામ દાખલ કરો' : 'Please enter village name');
      return;
    }

    const isOtherTaluka = taluka === 'Other' || taluka === 'અન્ય';
    const isOtherDistrict = district === 'Other' || district === 'અન્ય';

    const finalTaluka = isOtherTaluka ? customTaluka.trim() : taluka;
    const finalDistrict = isOtherDistrict ? customDistrict.trim() : district;

    if (!finalTaluka) {
      toast.error(isGu ? 'તાલુકો દાખલ કરો' : 'Please select or enter taluka');
      return;
    }
    if (!finalDistrict) {
      toast.error(isGu ? 'જિલ્લો દાખલ કરો' : 'Please select or enter district');
      return;
    }

    setIsLoading(true);
    try {
      await onAddVillage({
        name: name.trim(),
        name_gu: nameGu.trim() || name.trim(),
        code: code.trim().toUpperCase() || nextVillageCode,
        taluka: finalTaluka,
        district: finalDistrict,
        total_families: parseInt(totalFamilies, 10) || 0,
        total_citizens: parseInt(totalCitizens, 10) || 0,
        total_documents: parseInt(totalDocuments, 10) || 0,
      });

      setName('');
      setNameGu('');
      setCode('');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || (isGu ? 'ગામ ઉમેરવામાં નિષ્ફળ' : 'Failed to create village'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGu ? 'નવું ગામ ઉમેરો' : 'Create New Village'}
      description={isGu ? 'ERP સિસ્ટમમાં નવું અધિકાર ક્ષેત્ર ધરાવતું ગામ ઉમેરો.' : 'Register a new administrative village jurisdiction in the ERP system.'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fast Demo Fill Button */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isGu ? 'ઝડપી નમૂનો:' : 'Fast 1-Click Demo Fill:'}</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-900/60 hover:bg-emerald-100 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs transition-colors cursor-pointer"
          >
            {isGu ? 'ઓટો-ફિલ "સાળંગપુર"' : 'Auto-Fill "Salangpur"'}
          </button>
        </div>

        {/* Village Name inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'ગામનું નામ (અંગ્રેજી)' : 'Village Name'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salangpur, Paliyad, Bhimdad"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'ગામનું નામ (ગુજરાતીમાં)' : 'Village Name (Gujarati - Optional)'}
            </label>
            <Input
              value={nameGu}
              onChange={(e) => setNameGu(e.target.value)}
              placeholder={isGu ? 'દા.ત. સાળંગપુર, પાળિયાદ' : 'e.g. સાળંગપુર, પાળિયાદ'}
              className="text-xs font-medium"
            />
          </div>
        </div>

        {/* Code & Taluka & District */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'ગામ કોડ' : 'Village Code'}
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VIL-007"
              className="text-xs font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'તાલુકો' : 'Taluka'} <span className="text-red-500">*</span>
            </label>
            <Select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="text-xs"
            >
              {talukaOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            {(taluka === 'Other' || taluka === 'અન્ય') && (
              <Input
                value={customTaluka}
                onChange={(e) => setCustomTaluka(e.target.value)}
                placeholder={isGu ? 'તાલુકાનું નામ લખો...' : 'Enter taluka name...'}
                className="mt-1.5 text-xs"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isGu ? 'જિલ્લો' : 'District'} <span className="text-red-500">*</span>
            </label>
            <Select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="text-xs"
            >
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            {(district === 'Other' || district === 'અન્ય') && (
              <Input
                value={customDistrict}
                onChange={(e) => setCustomDistrict(e.target.value)}
                placeholder={isGu ? 'જિલ્લાનું નામ લખો...' : 'Enter district name...'}
                className="mt-1.5 text-xs"
                required
              />
            )}
          </div>
        </div>

        {/* Initial Estimates (Families, Citizens, Documents) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {isGu ? 'પ્રારંભિક અંદાજીત ગણતરી' : 'Initial Counts & Statistics'}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {isGu ? 'પરિવારો' : 'Families'}
              </label>
              <Input
                type="number"
                min="0"
                value={totalFamilies}
                onChange={(e) => setTotalFamilies(e.target.value)}
                placeholder="85"
                className="text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {isGu ? 'નાગરિકો' : 'Citizens'}
              </label>
              <Input
                type="number"
                min="0"
                value={totalCitizens}
                onChange={(e) => setTotalCitizens(e.target.value)}
                placeholder="360"
                className="text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {isGu ? 'દસ્તાવેજો' : 'Documents'}
              </label>
              <Input
                type="number"
                min="0"
                value={totalDocuments}
                onChange={(e) => setTotalDocuments(e.target.value)}
                placeholder="950"
                className="text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {isGu ? 'રદ કરો' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Plus className="w-4 h-4" />
            {isGu ? 'ગામ ઉમેરો' : 'Create Village'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
