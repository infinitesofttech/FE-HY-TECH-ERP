import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { AuditLog } from '@/types';
import { MOCK_AUDIT_LOGS } from '../mockData';

let localAuditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];

export const auditLogService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response = await apiClient.get<AuditLog[]>(ENDPOINTS.AUDIT_LOGS.LIST);
      return response.data;
    } catch {
      return localAuditLogs;
    }
  },

  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    userName: string = 'Staff Officer',
    userRole: string = 'STAFF'
  ): Promise<AuditLog> {
    const entry: AuditLog = {
      id: localAuditLogs.length + 1,
      timestamp: new Date().toISOString(),
      user_name: userName,
      user_role: userRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    };
    localAuditLogs = [entry, ...localAuditLogs];
    return entry;
  },
};
