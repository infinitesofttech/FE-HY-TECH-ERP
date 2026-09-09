import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Reminder, FollowUp } from '@/types';

export const reminderService = {
  async getReminders(): Promise<Reminder[]> {
    const response = await apiClient.get<any>(ENDPOINTS.REMINDERS.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getReminderDetail(reminderNo: string): Promise<Reminder> {
    const response = await apiClient.get<Reminder>(
      ENDPOINTS.REMINDERS.DETAIL(reminderNo)
    );
    return response.data;
  },

  async createReminder(payload: {
    customer: number;
    service: number;
    reminder_type: string;
    subject: string;
    due_date: string;
    reminder_date: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    message_template: string;
    notes?: string;
  }): Promise<{ message: string; data: Reminder }> {
    const response = await apiClient.post<{ message: string; data: Reminder }>(
      ENDPOINTS.REMINDERS.CREATE,
      payload
    );
    return response.data;
  },

  async updateReminder(
    reminderNo: string,
    data: Partial<Reminder>
  ): Promise<{ message: string; data: Reminder }> {
    const response = await apiClient.patch<{ message: string; data: Reminder }>(
      ENDPOINTS.REMINDERS.UPDATE(reminderNo),
      data
    );
    return response.data;
  },

  async deleteReminder(reminderNo: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.REMINDERS.DELETE(reminderNo)
    );
    return response.data;
  },

  async getFollowUps(reminderNo: string): Promise<FollowUp[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.REMINDERS.FOLLOW_UPS(reminderNo)
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async addFollowUp(
    reminderNo: string,
    data: {
      contact_date: string;
      customer_response: string;
      next_follow_up?: string | null;
      notes?: string;
      contacted_by?: number;
    }
  ): Promise<{ message: string; data: FollowUp }> {
    const response = await apiClient.post<{ message: string; data: FollowUp }>(
      ENDPOINTS.REMINDERS.ADD_FOLLOW_UP(reminderNo),
      data
    );
    return response.data;
  },

  async updateFollowUp(
    reminderNo: string,
    followUpId: number | string,
    data: Partial<FollowUp>
  ): Promise<{ message: string; data: FollowUp }> {
    const response = await apiClient.patch<{ message: string; data: FollowUp }>(
      ENDPOINTS.REMINDERS.UPDATE_FOLLOW_UP(reminderNo, followUpId),
      data
    );
    return response.data;
  },

  async deleteFollowUp(
    reminderNo: string,
    followUpId: number | string
  ): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.REMINDERS.DELETE_FOLLOW_UP(reminderNo, followUpId)
    );
    return response.data;
  },
};
