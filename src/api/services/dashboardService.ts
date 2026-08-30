import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { DashboardData } from '@/types';
import { MOCK_DASHBOARD } from '../mockData';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>(ENDPOINTS.DASHBOARD.GET);
      return response.data;
    } catch {
      return MOCK_DASHBOARD;
    }
  },
};
