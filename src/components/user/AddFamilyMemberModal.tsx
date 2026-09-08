'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Select } from '@/components/ui';
import { familyMemberService } from '@/api/services/familyMemberService';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { RelationshipType } from '@/types';
import { User, Phone, Calendar, Save } from 'lucide-react';

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
}

export const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({
  isOpen,
  onClose,
  familyId,
}) => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isGu = language === 'gu';
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'SON' as RelationshipType,
    mobile_number: '',
    birth_date: '2000-01-01',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(isGu ? 'કૃપા કરીને પૂરું નામ દાખલ કરો' : 'Please enter member full name');
      return;
    }

    setIsSaving(true);
    try {
      await familyMemberService.addMember(familyId, {
        name: formData.name.trim(),
        relationship: formData.relationship,
        mobile_number: formData.mobile_number.trim(),
        birth_date: formData.birth_date,
        is_active: formData.is_active,
      });

      await queryClient.invalidateQueries({ queryKey: ['family-members', familyId] });
      toast.success(isGu ? 'પરિવારના સભ્ય સફળતાપૂર્વક ઉમેરાયા' : 'Family member added successfully');
      onClose();
      setFormData({
        name: '',
        relationship: 'SON',
        mobile_number: '',
        birth_date: '2000-01-01',
        is_active: true,
      });
    } catch {
      toast.error(isGu ? 'સભ્ય ઉમેરવામાં નિષ્ફળ' : 'Failed to add member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGu ? 'પરિવારના સભ્ય ઉમેરો' : 'Add Family Member'}
      description={isGu ? `પરિવાર #${familyId} હેઠળ નવો સભ્ય નોંધો` : `Enrolling new member under Family #${familyId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label={isGu ? 'પૂરું નામ' : 'Full Name'}
          placeholder={isGu ? 'દા.ત. પ્રિયાબેન પટેલ' : 'e.g. Priyaben Patel'}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={isGu ? 'સંબંધ' : 'Relationship'}
            value={formData.relationship}
            onChange={(e) =>
              setFormData({ ...formData, relationship: e.target.value as RelationshipType })
            }
            options={[
              { label: isGu ? 'પત્ની' : 'Wife', value: 'WIFE' },
              { label: isGu ? 'પતિ' : 'Husband', value: 'HUSBAND' },
              { label: isGu ? 'પુત્ર' : 'Son', value: 'SON' },
              { label: isGu ? 'પુત્રી' : 'Daughter', value: 'DAUGHTER' },
              { label: isGu ? 'પિતા' : 'Father', value: 'FATHER' },
              { label: isGu ? 'માતા' : 'Mother', value: 'MOTHER' },
              { label: isGu ? 'ભાઈ' : 'Brother', value: 'BROTHER' },
              { label: isGu ? 'બહેન' : 'Sister', value: 'SISTER' },
              { label: isGu ? 'અન્ય' : 'Other', value: 'OTHER' },
            ]}
          />

          <Input
            label={isGu ? 'મોબાઈલ નંબર' : 'Mobile Number'}
            placeholder="e.g. 9876543210"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        <Input
          label={isGu ? 'જન્મ તારીખ' : 'Birth Date'}
          type="date"
          value={formData.birth_date}
          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          leftIcon={<Calendar className="w-4 h-4" />}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {isGu ? 'રદ કરો' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isGu ? 'સાચવો' : 'Save Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
