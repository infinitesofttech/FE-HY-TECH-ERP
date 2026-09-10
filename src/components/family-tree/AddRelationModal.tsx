'use client';

import React, { useState } from 'react';
import { RelationshipType } from '@/types';
import { Modal, Input, Select, Button } from '@/components/ui';
import { Sparkles, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface AddRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId?: string;
  headName?: string;
  onAdd: (newMember: {
    name: string;
    relationship: RelationshipType;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    birth_date: string;
    mobile_number: string;
  }) => void;
}

const RELATION_OPTIONS: { labelEn: string; labelGu: string; value: RelationshipType; defaultGender: 'MALE' | 'FEMALE' }[] = [
  { labelEn: 'Son', labelGu: 'પુત્ર', value: 'SON', defaultGender: 'MALE' },
  { labelEn: 'Daughter', labelGu: 'પુત્રી', value: 'DAUGHTER', defaultGender: 'FEMALE' },
  { labelEn: 'Wife', labelGu: 'પત્ની', value: 'WIFE', defaultGender: 'FEMALE' },
  { labelEn: 'Husband', labelGu: 'પતિ', value: 'HUSBAND', defaultGender: 'MALE' },
  { labelEn: 'Father', labelGu: 'પિતા', value: 'FATHER', defaultGender: 'MALE' },
  { labelEn: 'Mother', labelGu: 'માતા', value: 'MOTHER', defaultGender: 'FEMALE' },
  { labelEn: 'Brother', labelGu: 'ભાઈ', value: 'BROTHER', defaultGender: 'MALE' },
  { labelEn: 'Sister', labelGu: 'બહેન', value: 'SISTER', defaultGender: 'FEMALE' },
];

export const AddRelationModal: React.FC<AddRelationModalProps> = ({
  isOpen,
  onClose,
  familyId = '',
  headName = '',
  onAdd,
}) => {
  const { language } = useLanguage();
  const isGu = language === 'gu';

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('SON');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [birthDate, setBirthDate] = useState('2005-01-01');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRelationChange = (rel: RelationshipType) => {
    setRelationship(rel);
    const found = RELATION_OPTIONS.find((r) => r.value === rel);
    if (found) setGender(found.defaultGender);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isGu ? 'કૃપા કરીને પૂરું નામ દાખલ કરો' : 'Please enter family member full name');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAdd({
        name: name.trim(),
        relationship,
        gender,
        birth_date: birthDate,
        mobile_number: mobile.trim(),
      });
      toast.success(`${name} ${isGu ? 'ફેમિલી ટ્રીમાં ઉમેરાઈ ગયા!' : 'added to family tree!'}`);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGu ? 'ફેમિલી ટ્રીમાં સંબંધ ઉમેરો' : 'Add Family Relation to Tree'}
      description={
        headName && familyId
          ? (isGu ? `${headName} ના પરિવાર (${familyId}) માં નવી કડી ઉમેરી રહ્યા છો.` : `Adding new member to ${headName}'s family (${familyId}).`)
          : (isGu ? 'પરિવારમાં નવી કડી ઉમેરી રહ્યા છો.' : 'Adding new member to family.')
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          label={isGu ? 'પૂરું નામ *' : 'Full Name *'}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isGu ? 'દા.ત. મયૂર ચાંગાણી' : 'e.g. Mayur Changani'}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label={isGu ? 'સંબંધ *' : 'Relationship *'}
            value={relationship}
            onChange={(e) => handleRelationChange(e.target.value as RelationshipType)}
          >
            {RELATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {isGu ? opt.labelGu : opt.labelEn}
              </option>
            ))}
          </Select>

          <Select
            label={isGu ? 'જાતિ / લિંગ *' : 'Gender *'}
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
          >
            <option value="MALE">{isGu ? 'પુરુષ (Male)' : 'Male'}</option>
            <option value="FEMALE">{isGu ? 'સ્ત્રી (Female)' : 'Female'}</option>
            <option value="OTHER">{isGu ? 'અન્ય' : 'Other'}</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Birth Date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <Input
            label="Mobile Contact"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="10-digit mobile"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="emerald" isLoading={isLoading} leftIcon={<UserPlus className="w-4 h-4" />}>
            Add to Family Tree
          </Button>
        </div>
      </form>
    </Modal>
  );
};
