import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { PendingWork, PendingWorkSummary } from '@/types';

export const pendingWorkService = {
  async getPendingWork(): Promise<PendingWork[]> {
    const response = await apiClient.get<any>(ENDPOINTS.PENDING_WORK.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getSummary(): Promise<PendingWorkSummary> {
    const response = await apiClient.get<PendingWorkSummary>(
      ENDPOINTS.PENDING_WORK.SUMMARY
    );
    return response.data;
  },

  async getPendingDetail(pendingNo: string): Promise<PendingWork> {
    const response = await apiClient.get<PendingWork>(
      ENDPOINTS.PENDING_WORK.DETAIL(pendingNo)
    );
    return response.data;
  },

  async createPendingWork(payload: {
    service_visit?: number;
    customer: number;
    service: number;
    pending_since: string;
    expected_date: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    pending_reason: string;
    documents_pending?: string;
    assigned_staff: number;
    next_action: string;
    work_status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
    follow_up_date: string;
    notes?: string;
    created_by?: number;
  }): Promise<{ message: string; data: PendingWork }> {
    const response = await apiClient.post<{ message: string; data: PendingWork }>(
      ENDPOINTS.PENDING_WORK.CREATE,
      payload
    );
    return response.data;
  },

  async updatePendingWork(
    pendingNo: string,
    data: Partial<PendingWork>
  ): Promise<{ message: string; data: PendingWork }> {
    const response = await apiClient.patch<{ message: string; data: PendingWork }>(
      ENDPOINTS.PENDING_WORK.UPDATE(pendingNo),
      data
    );
    return response.data;
  },

  async deletePendingWork(pendingNo: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.PENDING_WORK.DELETE(pendingNo)
    );
    return response.data;
  },
};
