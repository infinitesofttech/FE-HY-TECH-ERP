import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { AuditLog } from '@/types';

export const auditLogService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await apiClient.get<any>(ENDPOINTS.AUDIT_LOGS.LIST);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return [];
  },

  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    userName: string = 'Staff Officer',
    userRole: string = 'STAFF'
  ): Promise<AuditLog> {
    try {
      const response = await apiClient.post<AuditLog>(ENDPOINTS.AUDIT_LOGS.LIST, {
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        user_name: userName,
        user_role: userRole,
      });
      return response.data;
    } catch {
      return {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user_name: userName,
        user_role: userRole,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      };
    }
  },
};
