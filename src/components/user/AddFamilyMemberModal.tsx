'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Select } from '@/components/ui';
import { familyMemberService } from '@/api/services/familyMemberService';
import { useQueryClient } from '@tanstack/react-query';
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
      toast.error('Please enter member full name');
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
      toast.success(`${formData.name} added to family successfully!`);
      onClose();
      setFormData({
        name: '',
        relationship: 'SON',
        mobile_number: '',
        birth_date: '2000-01-01',
        is_active: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Family Member"
      description={`Enrolling new member under Family #${familyId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Full Name / પૂરું નામ"
          placeholder="e.g. Priyaben Patel"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Relationship / સંબંધ"
            value={formData.relationship}
            onChange={(e) =>
              setFormData({ ...formData, relationship: e.target.value as RelationshipType })
            }
            options={[
              { label: 'Wife / પત્ની', value: 'WIFE' },
              { label: 'Husband / પતિ', value: 'HUSBAND' },
              { label: 'Son / પુત્ર', value: 'SON' },
              { label: 'Daughter / પુત્રી', value: 'DAUGHTER' },
              { label: 'Father / પિતા', value: 'FATHER' },
              { label: 'Mother / માતા', value: 'MOTHER' },
              { label: 'Brother / ભાઈ', value: 'BROTHER' },
              { label: 'Sister / બહેન', value: 'SISTER' },
              { label: 'Other / અન્ય', value: 'OTHER' },
            ]}
          />

          <Input
            label="Mobile Number / મોબાઈલ"
            placeholder="e.g. 9876543210"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Birth Date / જન્મ તારીખ"
          type="date"
          value={formData.birth_date}
          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          leftIcon={<Calendar className="w-4 h-4" />}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
