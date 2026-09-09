import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { LoginResponse } from '@/types';

export const authService = {
  async staffLogin(credentials: { username: string; password: string; portal_type?: string }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.STAFF_LOGIN,
      credentials
    );
    return response.data;
  },

  async customerLogin(credentials: {
    family_id: string;
    mobile_number: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.CUSTOMER_LOGIN,
      credentials
    );
    return response.data;
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
