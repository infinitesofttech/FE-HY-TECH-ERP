'use client';

import React, { useState } from 'react';
import { RelationshipType } from '@/types';
import { Modal, Input, Select, Button } from '@/components/ui';
import { Sparkles, UserPlus } from 'lucide-react';
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

const RELATION_OPTIONS: { label: string; value: RelationshipType; defaultGender: 'MALE' | 'FEMALE' }[] = [
  { label: 'Son (પુત્ર)', value: 'SON', defaultGender: 'MALE' },
  { label: 'Daughter (પુત્રી)', value: 'DAUGHTER', defaultGender: 'FEMALE' },
  { label: 'Wife (પત્ની)', value: 'WIFE', defaultGender: 'FEMALE' },
  { label: 'Husband (પતિ)', value: 'HUSBAND', defaultGender: 'MALE' },
  { label: 'Father (પિતા)', value: 'FATHER', defaultGender: 'MALE' },
  { label: 'Mother (માતા)', value: 'MOTHER', defaultGender: 'FEMALE' },
  { label: 'Brother (ભાઈ)', value: 'BROTHER', defaultGender: 'MALE' },
  { label: 'Sister (બહેન)', value: 'SISTER', defaultGender: 'FEMALE' },
];

export const AddRelationModal: React.FC<AddRelationModalProps> = ({
  isOpen,
  onClose,
  familyId = 'HTF-000002',
  headName = 'Dineshbhai Changani',
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('SON');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [birthDate, setBirthDate] = useState('2004-03-15');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRelationChange = (rel: RelationshipType) => {
    setRelationship(rel);
    const found = RELATION_OPTIONS.find((r) => r.value === rel);
    if (found) setGender(found.defaultGender);
  };

  const handleQuickDemoFill = () => {
    setName('Mayur Changani');
    setRelationship('SON');
    setGender('MALE');
    setBirthDate('2003-10-12');
    setMobile('9876501234');
    toast.success('Sample relation details auto-filled!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter family member full name');
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
        mobile_number: mobile.trim() || '9876500000',
      });
      toast.success(`${name} added to family tree!`);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Family Relation to Tree"
      description={`Adding new connected node to ${headName}'s family (${familyId}).`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Demo Fill Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fast 1-Click Demo Fill:</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            ⚡ Auto-Fill Member
          </button>
        </div>

        <Input
          label="Full Name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mayur Changani"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Relationship *"
            value={relationship}
            onChange={(e) => handleRelationChange(e.target.value as RelationshipType)}
          >
            {RELATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <Select
            label="Gender *"
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
          >
            <option value="MALE">Male (પુરુષ)</option>
            <option value="FEMALE">Female (સ્ત્રી)</option>
            <option value="OTHER">Other</option>
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
