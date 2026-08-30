import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { BaseService } from '@/types';
import { MOCK_SERVICES } from '../mockData';

let localServices = [...MOCK_SERVICES];

export const baseServiceService = {
  async getServices(): Promise<BaseService[]> {
    try {
      const response = await apiClient.get<BaseService[]>(ENDPOINTS.SERVICES.LIST);
      return response.data;
    } catch {
      return localServices;
    }
  },

  async getServiceDetail(id: number | string): Promise<BaseService> {
    try {
      const response = await apiClient.get<BaseService>(
        ENDPOINTS.SERVICES.DETAIL(id)
      );
      return response.data;
    } catch {
      const found = localServices.find((s) => s.id === Number(id));
      if (!found) throw new Error('Service not found');
      return found;
    }
  },

  async createService(data: { ServiceName: string; Description?: string; IsActive?: boolean }): Promise<BaseService> {
    try {
      const response = await apiClient.post<BaseService>(
        ENDPOINTS.SERVICES.CREATE,
        data
      );
      return response.data;
    } catch {
      const newService: BaseService = {
        id: Math.floor(Math.random() * 1000) + 20,
        ServiceName: data.ServiceName,
        Description: data.Description || null,
        IsActive: data.IsActive ?? true,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        SubServices: [],
      };
      localServices = [newService, ...localServices];
      return newService;
    }
  },

  async updateService(
    id: number | string,
    data: { ServiceName?: string; Description?: string; IsActive?: boolean }
  ): Promise<BaseService> {
    try {
      const response = await apiClient.patch<BaseService>(
        ENDPOINTS.SERVICES.UPDATE(id),
        data
      );
      return response.data;
    } catch {
      const idx = localServices.findIndex((s) => s.id === Number(id));
      if (idx === -1) throw new Error('Service not found');
      localServices[idx] = {
        ...localServices[idx],
        ...data,
        UpdatedAt: new Date().toISOString(),
      };
      return localServices[idx];
    }
  },

  async deleteService(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.SERVICES.DELETE(id)
      );
      return response.data;
    } catch {
      localServices = localServices.filter((s) => s.id !== Number(id));
      return { message: 'Service deleted successfully.' };
    }
  },
};
