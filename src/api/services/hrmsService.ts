import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import {
  AttendanceRecord,
  LeaveRecord,
  HolidayItem,
  LeaveBalance,
  AttendanceStatus,
  LeaveType,
  HRSettingsResponse,
  HRRolePermission,
} from '@/types';

export const hrmsService = {
  // Get all leaves across employees (for Admin approval)
  async getAllLeaves(): Promise<LeaveRecord[]> {
    const response = await apiClient.get<any>(ENDPOINTS.HRMS.LEAVES);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  // Get all annual holidays
  async getHolidays(): Promise<HolidayItem[]> {
    const response = await apiClient.get<any>(ENDPOINTS.HRMS.HOLIDAYS);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  // Get employee attendance history
  async getEmployeeAttendance(employeeId: number | string): Promise<AttendanceRecord[]> {
    const response = await apiClient.get<any>(ENDPOINTS.HRMS.ATTENDANCE, {
      params: { employee_id: employeeId },
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  // Get employee leave balance
  async getEmployeeLeaveBalance(employeeId: number | string): Promise<LeaveBalance> {
    try {
      const response = await apiClient.get<LeaveBalance>(
        ENDPOINTS.HRMS.LEAVE_BALANCE(employeeId)
      );
      return response.data;
    } catch {
      return {
        casual_total: 12,
        casual_used: 0,
        sick_total: 7,
        sick_used: 0,
        paid_total: 5,
        paid_used: 0,
      };
    }
  },

  // Get employee leave requests history
  async getEmployeeLeaves(employeeId: number | string): Promise<LeaveRecord[]> {
    const response = await apiClient.get<any>(ENDPOINTS.HRMS.LEAVES, {
      params: { employee_id: employeeId },
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  // Mark / Punch Attendance
  async punchAttendance(payload: {
    employee_id: number;
    date: string;
    in_time?: string;
    out_time?: string;
    status: AttendanceStatus;
    notes?: string;
  }): Promise<{ message: string; data: AttendanceRecord }> {
    const response = await apiClient.post<any>(ENDPOINTS.HRMS.ATTENDANCE, payload);
    return response.data;
  },

  // Apply Leave
  async applyLeave(payload: {
    employee_id: number;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
  }): Promise<{ message: string; data: LeaveRecord }> {
    const response = await apiClient.post<any>(ENDPOINTS.HRMS.LEAVES, payload);
    return response.data;
  },

  // Approve / Reject Leave
  async updateLeaveStatus(
    leaveId: number,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string = 'Admin Manager'
  ): Promise<{ message: string }> {
    const response = await apiClient.patch<any>(`${ENDPOINTS.HRMS.LEAVES}${leaveId}/`, {
      status,
      approved_by: approvedBy,
    });
    return response.data;
  },

  // Get all HR Settings (Company, Attendance, Leave, Notifications, Roles & Permissions)
  async getHRSettings(): Promise<HRSettingsResponse> {
    const response = await apiClient.get<HRSettingsResponse>(ENDPOINTS.HRMS.SETTINGS);
    return response.data;
  },

  // Update HR Settings (bulk or individual sections)
  async updateHRSettings(payload: Partial<HRSettingsResponse> | any): Promise<HRSettingsResponse> {
    const response = await apiClient.patch<HRSettingsResponse>(ENDPOINTS.HRMS.SETTINGS, payload);
    return response.data;
  },

  // Update specific role permissions
  async updateRolePermission(id: number, payload: Partial<HRRolePermission>): Promise<HRRolePermission> {
    const response = await apiClient.patch<HRRolePermission>(ENDPOINTS.HRMS.SETTINGS_ROLE_DETAIL(id), payload);
    return response.data;
  },
};

