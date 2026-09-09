import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Transaction, PaymentMode } from '@/types';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get<any>(ENDPOINTS.TRANSACTIONS.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getTransactionDetail(id: number | string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(
      ENDPOINTS.TRANSACTIONS.DETAIL(id)
    );
    return response.data;
  },

  async createTransaction(payload: {
    customer: number;
    service?: number;
    sub_service?: number;
    bill_amount: string;
    paid_amount?: string;
    due_amount?: string;
    payment_status?: 'PAID' | 'PARTIAL' | 'PENDING';
    items?: Array<{
      service_id: number;
      service_name: string;
      sub_service_id: number;
      sub_service_name: string;
      amount: number;
    }>;
    previous_due_cleared?: string;
    points_earned?: number;
    employee_points?: number;
    points_redeemed?: number;
    wallet_credit?: string;
    wallet_used?: string;
    payment_mode: PaymentMode;
    staff: number;
    staff_name?: string;
    remarks?: string;
  }): Promise<{ message: string; data: Transaction }> {
    const response = await apiClient.post<{ message: string; data: Transaction }>(
      ENDPOINTS.TRANSACTIONS.CREATE,
      payload
    );
    return response.data;
  },

  async updateTransaction(
    id: number | string,
    data: Partial<Transaction>
  ): Promise<{ message: string; data: Transaction }> {
    const response = await apiClient.patch<{ message: string; data: Transaction }>(
      ENDPOINTS.TRANSACTIONS.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteTransaction(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.TRANSACTIONS.DELETE(id)
    );
    return response.data;
  },
};
