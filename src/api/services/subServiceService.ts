import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { SubService } from '@/types';
import { MOCK_SERVICES } from '../mockData';

export const subServiceService = {
  async getSubServices(): Promise<SubService[]> {
    try {
      const response = await apiClient.get<SubService[]>(ENDPOINTS.SUB_SERVICES.LIST);
      return response.data;
    } catch {
      return MOCK_SERVICES.flatMap((s) => s.SubServices);
    }
  },

  async getSubServiceDetail(id: number | string): Promise<SubService> {
    try {
      const response = await apiClient.get<SubService>(
        ENDPOINTS.SUB_SERVICES.DETAIL(id)
      );
      return response.data;
    } catch {
      const all = MOCK_SERVICES.flatMap((s) => s.SubServices);
      const found = all.find((sub) => sub.id === Number(id));
      if (!found) throw new Error('SubService not found');
      return found;
    }
  },

  async createSubService(data: {
    Service: number;
    SubServiceName: string;
    Description?: string;
  }): Promise<SubService> {
    try {
      const response = await apiClient.post<SubService>(
        ENDPOINTS.SUB_SERVICES.CREATE,
        data
      );
      return response.data;
    } catch {
      const newSub: SubService = {
        id: Math.floor(Math.random() * 1000) + 30,
        Service: data.Service,
        SubServiceName: data.SubServiceName,
        Description: data.Description || null,
        IsActive: true,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        RequiredDocuments: [],
      };
      const service = MOCK_SERVICES.find((s) => s.id === data.Service);
      if (service) {
        service.SubServices.push(newSub);
      }
      return newSub;
    }
  },

  async updateSubService(
    id: number | string,
    data: { Service?: number; SubServiceName?: string; Description?: string; IsActive?: boolean }
  ): Promise<SubService> {
    try {
      const response = await apiClient.patch<SubService>(
        ENDPOINTS.SUB_SERVICES.UPDATE(id),
        data
      );
      return response.data;
    } catch {
      for (const s of MOCK_SERVICES) {
        const idx = s.SubServices.findIndex((sub) => sub.id === Number(id));
        if (idx !== -1) {
          s.SubServices[idx] = { ...s.SubServices[idx], ...data, UpdatedAt: new Date().toISOString() };
          return s.SubServices[idx];
        }
      }
      throw new Error('SubService not found');
    }
  },

  async deleteSubService(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.SUB_SERVICES.DELETE(id)
      );
      return response.data;
    } catch {
      for (const s of MOCK_SERVICES) {
        s.SubServices = s.SubServices.filter((sub) => sub.id !== Number(id));
      }
      return { message: 'SubService deleted successfully.' };
    }
  },
};
