import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Transaction, PaymentMode } from '@/types';
import { MOCK_TRANSACTIONS, MOCK_CUSTOMERS, MOCK_SERVICES } from '../mockData';

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
    try {
      const response = await apiClient.post<{ message: string; data: Transaction }>(
        ENDPOINTS.TRANSACTIONS.CREATE,
        payload
      );
      return response.data;
    } catch {
      const bill = parseFloat(payload.bill_amount) || 0;
      const paid = payload.paid_amount !== undefined ? parseFloat(payload.paid_amount) || 0 : bill;
      const due = payload.due_amount !== undefined ? parseFloat(payload.due_amount) || 0 : Math.max(0, bill - paid);
      const walletUsed = parseFloat(payload.wallet_used || '0') || 0;
      const walletCredit = parseFloat(payload.wallet_credit || '0') || 0;
      const netWalletChange = walletCredit - walletUsed;

      const cust = MOCK_CUSTOMERS.find((c) => c.id === payload.customer);
      const serv = MOCK_SERVICES.find((s) => s.id === (payload.service || payload.items?.[0]?.service_id));
      const subServ = serv?.SubServices?.find((sub) => sub.id === (payload.sub_service || payload.items?.[0]?.sub_service_id));

      const paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' =
        payload.payment_status || (due > 0 ? (paid > 0 ? 'PARTIAL' : 'PENDING') : 'PAID');

      const newTxn: Transaction = {
        id: localTxns.length + 1,
        transaction_no: `TXN-00000${localTxns.length + 1}`,
        transaction_date: new Date().toISOString().split('T')[0],
        customer: payload.customer,
        service: payload.service || payload.items?.[0]?.service_id || 3,
        sub_service: payload.sub_service || payload.items?.[0]?.sub_service_id || 3,
        staff: payload.staff,
        family_id: cust?.family_id || 'HTF-000003',
        customer_name: cust?.head_of_family || 'Rameshbhai Patel',
        service_name: payload.items && payload.items.length > 1
          ? `${payload.items.map((i) => i.service_name).join(', ')}`
          : serv?.ServiceName || payload.items?.[0]?.service_name || 'Aadhaar Card',
        sub_service_name: payload.items && payload.items.length > 1
          ? `${payload.items.length} Services`
          : subServ?.SubServiceName || payload.items?.[0]?.sub_service_name || 'New Aadhaar Card',
        staff_name: payload.staff_name || 'MITALI CHANGANI',
        bill_amount: bill.toFixed(2),
        paid_amount: paid.toFixed(2),
        due_amount: due.toFixed(2),
        payment_status: paymentStatus,
        items: payload.items,
        previous_due_cleared: payload.previous_due_cleared,
        points_earned: payload.points_earned ?? Math.round(paid * 0.1),
        employee_points: payload.employee_points ?? Math.round(paid * 0.1),
        points_redeemed: payload.points_redeemed ?? 0,
        wallet_credit: walletCredit.toFixed(2),
        wallet_used: walletUsed.toFixed(2),
        net_wallet_change: netWalletChange,
        payment_mode: payload.payment_mode,
        remarks: payload.remarks || (due > 0 ? `Partial payment: ₹${paid.toFixed(2)} paid, ₹${due.toFixed(2)} pending due` : 'Full payment received'),
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
