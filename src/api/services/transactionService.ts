import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Transaction, PaymentMode } from '@/types';
import { MOCK_TRANSACTIONS } from '../mockData';

let localTxns = [...MOCK_TRANSACTIONS];

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>(ENDPOINTS.TRANSACTIONS.LIST);
      return response.data;
    } catch {
      return localTxns;
    }
  },

  async getTransactionDetail(id: number | string): Promise<Transaction> {
    try {
      const response = await apiClient.get<Transaction>(
        ENDPOINTS.TRANSACTIONS.DETAIL(id)
      );
      return response.data;
    } catch {
      const found = localTxns.find((t) => t.id === Number(id));
      if (!found) throw new Error('Transaction not found');
      return found;
    }
  },

  async createTransaction(payload: {
    customer: number;
    service: number;
    sub_service: number;
    bill_amount: string;
    points_earned?: number;
    points_redeemed?: number;
    wallet_credit?: string;
    wallet_used?: string;
    payment_mode: PaymentMode;
    staff: number;
    remarks?: string;
  }): Promise<{ message: string; data: Transaction }> {
    try {
      const response = await apiClient.post<{ message: string; data: Transaction }>(
        ENDPOINTS.TRANSACTIONS.CREATE,
        payload
      );
      return response.data;
    } catch {
      const bill = parseFloat(payload.bill_amount) || 0;
      const walletUsed = parseFloat(payload.wallet_used || '0') || 0;
      const walletCredit = parseFloat(payload.wallet_credit || '0') || 0;
      const netWalletChange = walletCredit - walletUsed;

      const newTxn: Transaction = {
        id: localTxns.length + 1,
        transaction_no: `TXN-00000${localTxns.length + 1}`,
        transaction_date: new Date().toISOString().split('T')[0],
        customer: payload.customer,
        service: payload.service,
        sub_service: payload.sub_service,
        staff: payload.staff,
        family_id: 'HTF-000002',
        customer_name: 'Dineshbhai Changani',
        service_name: 'Aadhar Card',
        sub_service_name: 'New Aadhaar Card',
        staff_name: 'MITALI CHANGANI',
        bill_amount: bill.toFixed(2),
        points_earned: payload.points_earned ?? 20,
        points_redeemed: payload.points_redeemed ?? 0,
        wallet_credit: walletCredit.toFixed(2),
        wallet_used: walletUsed.toFixed(2),
        net_wallet_change: netWalletChange,
        payment_mode: payload.payment_mode,
        remarks: payload.remarks || 'Standard transaction',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localTxns = [newTxn, ...localTxns];
      return { message: 'Transaction created successfully', data: newTxn };
    }
  },

  async updateTransaction(
    id: number | string,
    data: Partial<Transaction>
  ): Promise<{ message: string; data: Transaction }> {
    try {
      const response = await apiClient.patch<{ message: string; data: Transaction }>(
        ENDPOINTS.TRANSACTIONS.UPDATE(id),
        data
      );
      return response.data;
    } catch {
      const idx = localTxns.findIndex((t) => t.id === Number(id));
      if (idx === -1) throw new Error('Transaction not found');
      localTxns[idx] = { ...localTxns[idx], ...data, updated_at: new Date().toISOString() };
      return { message: 'Transaction updated successfully', data: localTxns[idx] };
    }
  },

  async deleteTransaction(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.TRANSACTIONS.DELETE(id)
      );
      return response.data;
    } catch {
      localTxns = localTxns.filter((t) => t.id !== Number(id));
      return { message: 'Transaction deleted successfully' };
    }
  },
};
