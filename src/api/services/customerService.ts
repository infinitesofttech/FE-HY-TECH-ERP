import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Customer } from '@/types';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await apiClient.get<any>(ENDPOINTS.CUSTOMERS.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getCustomerDetail(familyId: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(
      ENDPOINTS.CUSTOMERS.DETAIL(familyId)
    );
    return response.data;
  },

  async createCustomer(data: Partial<Customer> & { password?: string }): Promise<{ message: string; data: Customer }> {
    const response = await apiClient.post<{ message: string; data: Customer }>(
      ENDPOINTS.CUSTOMERS.CREATE,
      data
    );
    return response.data;
  },

  async updateCustomer(familyId: string, data: Partial<Customer>): Promise<{ message: string; data: Customer }> {
    const response = await apiClient.patch<{ message: string; data: Customer }>(
      ENDPOINTS.CUSTOMERS.UPDATE(familyId),
      data
    );
    return response.data;
  },

  async deleteCustomer(familyId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CUSTOMERS.DELETE(familyId)
    );
    return response.data;
  },
};
