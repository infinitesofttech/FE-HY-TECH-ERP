import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { PendingWork, PendingWorkSummary } from '@/types';
import { MOCK_PENDING_WORK, MOCK_PENDING_SUMMARY } from '../mockData';

let localPending = [...MOCK_PENDING_WORK];

export const pendingWorkService = {
  async getPendingWork(): Promise<PendingWork[]> {
    try {
      const response = await apiClient.get<PendingWork[]>(ENDPOINTS.PENDING_WORK.LIST);
      return response.data;
    } catch {
      return localPending;
    }
  },

  async getSummary(): Promise<PendingWorkSummary> {
    try {
      const response = await apiClient.get<PendingWorkSummary>(
        ENDPOINTS.PENDING_WORK.SUMMARY
      );
      return response.data;
    } catch {
      const pendingCount = localPending.filter((p) => p.work_status === 'PENDING').length;
      const inProgCount = localPending.filter((p) => p.work_status === 'IN_PROGRESS').length;
      const blockedCount = localPending.filter((p) => p.work_status === 'BLOCKED').length;
      const compCount = localPending.filter((p) => p.work_status === 'COMPLETED').length;
      const highPri = localPending.filter((p) => p.priority === 'HIGH').length;

      return {
        total: localPending.length,
        pending: pendingCount,
        in_progress: inProgCount,
        blocked: blockedCount,
        completed: compCount,
        high_priority: highPri,
        overdue: 1,
      };
    }
  },

  async getPendingDetail(pendingNo: string): Promise<PendingWork> {
    try {
      const response = await apiClient.get<PendingWork>(
        ENDPOINTS.PENDING_WORK.DETAIL(pendingNo)
      );
      return response.data;
    } catch {
      const found = localPending.find((p) => p.pending_no === pendingNo);
      if (!found) throw new Error('Pending work not found');
      return found;
    }
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
    try {
      const response = await apiClient.post<{ message: string; data: PendingWork }>(
        ENDPOINTS.PENDING_WORK.CREATE,
        payload
      );
      return response.data;
    } catch {
      const newWork: PendingWork = {
        id: localPending.length + 1,
        pending_no: `PWD-00000${localPending.length + 1}`,
        service_visit: payload.service_visit,
        customer: payload.customer,
        customer_family_id: 'HTF-000001',
        customer_name: 'Vitthalbhai Changani',
        customer_mobile: '6789012345',
        service: payload.service,
        service_name: 'Aadhar Card',
        pending_since: payload.pending_since,
        expected_date: payload.expected_date,
        priority: payload.priority,
        pending_reason: payload.pending_reason,
        documents_pending: payload.documents_pending || 'None',
        assigned_staff: payload.assigned_staff,
        assigned_staff_name: 'MITALI CHANGANI',
        next_action: payload.next_action,
        work_status: payload.work_status,
        follow_up_date: payload.follow_up_date,
        notes: payload.notes || '',
        created_by: payload.created_by || 1,
        created_by_name: 'Mitali Changani',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localPending = [newWork, ...localPending];
      return { message: 'Pending work created successfully.', data: newWork };
    }
  },

  async updatePendingWork(
    pendingNo: string,
    data: Partial<PendingWork>
  ): Promise<{ message: string; data: PendingWork }> {
    try {
      const response = await apiClient.patch<{ message: string; data: PendingWork }>(
        ENDPOINTS.PENDING_WORK.UPDATE(pendingNo),
        data
      );
      return response.data;
    } catch {
      const idx = localPending.findIndex((p) => p.pending_no === pendingNo);
      if (idx === -1) throw new Error('Pending work item not found');
      localPending[idx] = { ...localPending[idx], ...data, updated_at: new Date().toISOString() };
      return { message: 'Pending work updated successfully.', data: localPending[idx] };
    }
  },

  async deletePendingWork(pendingNo: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.PENDING_WORK.DELETE(pendingNo)
      );
      return response.data;
    } catch {
      localPending = localPending.filter((p) => p.pending_no !== pendingNo);
      return { message: 'Pending work deleted successfully.' };
    }
  },
};
