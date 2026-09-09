import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { DashboardData } from '@/types';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>(ENDPOINTS.DASHBOARD.GET);
    return response.data;
  },
};
