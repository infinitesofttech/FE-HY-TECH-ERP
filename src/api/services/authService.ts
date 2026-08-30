import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { LoginResponse } from '@/types';

export const authService = {
  async staffLogin(credentials: { username: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.STAFF_LOGIN,
        credentials
      );
      return response.data;
    } catch (err: unknown) {
      // Mock Fallback for local testing if server is offline
      if ((err as { code?: string })?.code === 'ERR_NETWORK' || !(err as { response?: unknown })?.response) {
        if (credentials.username === 'admin') {
          return {
            message: 'Admin login successful (Demo Mode).',
            user_type: 'admin',
            tokens: {
              access: 'mock-admin-access-token',
              refresh: 'mock-admin-refresh-token',
            },
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@hytech.com',
              is_staff: true,
              is_superuser: true,
            },
          };
        } else {
          return {
            message: 'Employee login successful (Demo Mode).',
            user_type: 'employee',
            tokens: {
              access: 'mock-staff-access-token',
              refresh: 'mock-staff-refresh-token',
            },
            employee: {
              id: 2,
              username: credentials.username || 'staff01',
              full_name: 'Staff One',
              email: 'staff1@hytech.com',
              role: 'STAFF',
            },
          };
        }
      }
      throw err;
    }
  },

  async customerLogin(credentials: {
    family_id: string;
    mobile_number: string;
    password: string;
  }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.CUSTOMER_LOGIN,
        credentials
      );
      return response.data;
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'ERR_NETWORK' || !(err as { response?: unknown })?.response) {
        return {
          message: 'Customer login successful (Demo Mode).',
          user_type: 'customer',
          tokens: {
            access: 'mock-customer-access-token',
            refresh: 'mock-customer-refresh-token',
          },
          customer: {
            id: 3,
            family_id: credentials.family_id || 'HTF-000002',
            head_of_family: 'Dineshbhai Changani',
            mobile_number: credentials.mobile_number || '8000231125',
            current_points: 20,
            wallet_balance: '0.00',
          },
        };
      }
      throw err;
    }
  },

  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        ENDPOINTS.AUTH.LOGOUT
      );
      return response.data;
    } catch {
      return { message: 'Logged out successfully.' };
    }
  },
};
