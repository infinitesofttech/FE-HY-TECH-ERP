import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Application, ApplicationStatus } from '@/types';

export const applicationService = {
  async getApplications(params?: {
    search?: string;
    status?: string;
    service?: number | string;
    priority?: string;
    family_id?: string;
  }): Promise<Application[]> {
    const response = await apiClient.get<any>(ENDPOINTS.APPLICATIONS.LIST, {
      params,
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getApplicationDetail(appNo: string): Promise<Application> {
    const response = await apiClient.get<Application>(ENDPOINTS.APPLICATIONS.DETAIL(appNo));
    return response.data;
  },

  async createApplication(payload: Partial<Application>): Promise<Application> {
    const response = await apiClient.post<any>(
      ENDPOINTS.APPLICATIONS.CREATE,
      payload
    );
    return response.data.data || response.data;
  },

  async updateApplication(
    appNoOrId: string | number,
    data: Partial<Application>
  ): Promise<Application> {
    const s = String(appNoOrId);
    const response = await apiClient.patch<any>(
      ENDPOINTS.APPLICATIONS.UPDATE(s),
      data
    );
    return response.data.data || response.data;
  },

  async updateStatus(
    appNoOrId: string | number,
    newStatus: ApplicationStatus,
    notes?: string,
    actorName?: string,
    actorRole?: string
  ): Promise<Application> {
    const s = String(appNoOrId);
    const response = await apiClient.post<any>(
      ENDPOINTS.APPLICATIONS.STATUS(s),
      { status: newStatus, notes, actor_name: actorName, actor_role: actorRole }
    );
    return response.data.data || response.data;
  },

  async deleteApplication(appNo: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.APPLICATIONS.DELETE(appNo)
    );
    return response.data;
  },
};
