import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { BaseService } from '@/types';

export const baseServiceService = {
  async getServices(): Promise<BaseService[]> {
    const response = await apiClient.get<any>(ENDPOINTS.SERVICES.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getServiceDetail(id: number | string): Promise<BaseService> {
    const response = await apiClient.get<BaseService>(ENDPOINTS.SERVICES.DETAIL(id));
    return response.data;
  },

  async createService(data: Partial<BaseService> & { ServiceName: string }): Promise<BaseService> {
    const response = await apiClient.post<BaseService>(ENDPOINTS.SERVICES.CREATE, data);
    return response.data;
  },

  async updateService(
    id: number | string,
    data: Partial<BaseService>
  ): Promise<BaseService> {
    const response = await apiClient.patch<BaseService>(
      ENDPOINTS.SERVICES.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteService(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.SERVICES.DELETE(id)
    );
    return response.data;
  },
};
