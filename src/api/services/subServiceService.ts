import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { SubService } from '@/types';

export const subServiceService = {
  async getSubServices(): Promise<SubService[]> {
    const response = await apiClient.get<any>(ENDPOINTS.SUB_SERVICES.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getSubServiceDetail(id: number | string): Promise<SubService> {
    const response = await apiClient.get<SubService>(
      ENDPOINTS.SUB_SERVICES.DETAIL(id)
    );
    return response.data;
  },

  async createSubService(data: {
    Service: number;
    SubServiceName: string;
    Description?: string;
  }): Promise<SubService> {
    const response = await apiClient.post<SubService>(
      ENDPOINTS.SUB_SERVICES.CREATE,
      data
    );
    return response.data;
  },

  async updateSubService(
    id: number | string,
    data: { Service?: number; SubServiceName?: string; Description?: string; IsActive?: boolean }
  ): Promise<SubService> {
    const response = await apiClient.patch<SubService>(
      ENDPOINTS.SUB_SERVICES.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteSubService(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.SUB_SERVICES.DELETE(id)
    );
    return response.data;
  },
};
