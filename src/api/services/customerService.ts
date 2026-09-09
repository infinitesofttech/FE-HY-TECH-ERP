import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Customer } from '@/types';
import { MOCK_CUSTOMERS } from '../mockData';

let localCustomers = [...MOCK_CUSTOMERS];

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await apiClient.get<any>(ENDPOINTS.CUSTOMERS.LIST);
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.results)) return response.data.results;
      return localCustomers;
    } catch {
      return localCustomers;
    }
  },

  async getCustomerDetail(familyId: string): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(
        ENDPOINTS.CUSTOMERS.DETAIL(familyId)
      );
      return response.data;
    } catch {
      const found = localCustomers.find((c) => c.family_id === familyId);
      if (!found) throw new Error('Customer not found');
      return found;
    }
  },

  async createCustomer(data: Partial<Customer> & { password?: string }): Promise<{ message: string; data: Customer }> {
    try {
      const response = await apiClient.post<{ message: string; data: Customer }>(
        ENDPOINTS.CUSTOMERS.CREATE,
        data
      );
      return response.data;
    } catch {
      const newId = localCustomers.length + 1;
      const newFamilyId = `HTF-00000${newId}`;
      const newCust: Customer = {
        id: newId,
        family_id: newFamilyId,
        registration_date: new Date().toISOString().split('T')[0],
        head_of_family: data.head_of_family || 'New Head',
        mobile_number: String(data.mobile_number || ''),
        whatsapp_number: String(data.whatsapp_number || data.mobile_number || ''),
        family_member_count: Number(data.family_member_count || 1),
        village_city: data.village_city || 'Varna',
        birth_date: data.birth_date || '1990-01-01',
        referral_family_id: data.referral_family_id || null,
        document_consent: !!data.document_consent,
        current_points: 0,
        wallet_balance: '0.00',
        total_visits: 0,
        last_visit: null,
        is_active: true,
        notes: data.notes || '',
        digital_card_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localCustomers = [newCust, ...localCustomers];
      return { message: 'Customer created successfully.', data: newCust };
    }
  },

  async updateCustomer(familyId: string, data: Partial<Customer>): Promise<{ message: string; data: Customer }> {
    try {
      const response = await apiClient.patch<{ message: string; data: Customer }>(
        ENDPOINTS.CUSTOMERS.UPDATE(familyId),
        data
      );
      return response.data;
    } catch {
      const idx = localCustomers.findIndex((c) => c.family_id === familyId);
      if (idx === -1) throw new Error('Customer not found');
      localCustomers[idx] = {
        ...localCustomers[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { message: 'Customer updated successfully.', data: localCustomers[idx] };
    }
  },

  async deleteCustomer(familyId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.CUSTOMERS.DELETE(familyId)
      );
      return response.data;
    } catch {
      localCustomers = localCustomers.filter((c) => c.family_id !== familyId);
      return { message: 'Customer deleted successfully.' };
    }
  },
};
