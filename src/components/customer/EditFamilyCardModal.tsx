'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { Customer } from '@/types';
import { customerService } from '@/api/services/customerService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Phone, MapPin, MessageSquare, Save } from 'lucide-react';

interface EditFamilyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

export const EditFamilyCardModal: React.FC<EditFamilyCardModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    head_of_family: '',
    mobile_number: '',
    whatsapp_number: '',
    village_city: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        head_of_family: customer.head_of_family || '',
        mobile_number: customer.mobile_number || '',
        whatsapp_number: customer.whatsapp_number || customer.mobile_number || '',
        village_city: customer.village_city || '',
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.family_id) return;

    if (!formData.head_of_family.trim()) {
      toast.error('કૃપા કરીને નામ દાખલ કરો (Please enter name)');
      return;
    }
    if (!formData.mobile_number.trim()) {
      toast.error('કૃપા કરીને મોબાઈલ નંબર દાખલ કરો (Please enter mobile number)');
      return;
    }

    setIsSaving(true);
    try {
      await customerService.updateCustomer(customer.family_id, {
        head_of_family: formData.head_of_family.trim(),
        mobile_number: formData.mobile_number.trim(),
        whatsapp_number: formData.whatsapp_number.trim() || formData.mobile_number.trim(),
        village_city: formData.village_city.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ['customer', customer.family_id] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('ફેમિલી કાર્ડ માહિતી સફળતાપૂર્વક અપડેટ થઈ! (Family Card updated successfully)');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'વિગતો અપડેટ કરવામાં ભૂલ આવી (Failed to update)');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Family Card / ફેમિલી કાર્ડ સુધારો"
      description={`Family ID: ${customer?.family_id || ''}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Name / કુટુંબના વડાનું નામ"
          placeholder="e.g. Ramesh Patel"
          value={formData.head_of_family}
          onChange={(e) => setFormData({ ...formData, head_of_family: e.target.value })}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mobile Number / નંબર"
            placeholder="e.g. 9876543210"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <Input
            label="WhatsApp Number / વ્હોટ્સએપ"
            placeholder="e.g. 9876543210"
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            leftIcon={<MessageSquare className="w-4 h-4 text-emerald-500" />}
          />
        </div>

        <Input
          label="Address / સરનામું (ગામ / શહેર)"
          placeholder="e.g. Varna, Gujarat"
          value={formData.village_city}
          onChange={(e) => setFormData({ ...formData, village_city: e.target.value })}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel / રદ કરો
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes / સાચવો
          </Button>
        </div>
      </form>
    </Modal>
  );
};
