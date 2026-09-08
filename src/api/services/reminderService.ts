import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Reminder, FollowUp } from '@/types';
import { MOCK_REMINDERS } from '../mockData';

let localReminders = [...MOCK_REMINDERS];

export const reminderService = {
  async getReminders(): Promise<Reminder[]> {
    try {
      const response = await apiClient.get<Reminder[]>(ENDPOINTS.REMINDERS.LIST);
      return response.data;
    } catch {
      return localReminders;
    }
  },

  async getReminderDetail(reminderNo: string): Promise<Reminder> {
    try {
      const response = await apiClient.get<Reminder>(
        ENDPOINTS.REMINDERS.DETAIL(reminderNo)
      );
      return response.data;
    } catch {
      const found = localReminders.find((r) => r.reminder_no === reminderNo);
      if (!found) throw new Error('Reminder not found');
      return found;
    }
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
    try {
      const response = await apiClient.post<{ message: string; data: Reminder }>(
        ENDPOINTS.REMINDERS.CREATE,
        payload
      );
      return response.data;
    } catch {
      const newReminder: Reminder = {
        id: localReminders.length + 1,
        reminder_no: `RMD-00000${localReminders.length + 1}`,
        customer: payload.customer,
        customer_family_id: 'HTF-000001',
        customer_name: 'Vitthalbhai Changani',
        customer_mobile: '6789012345',
        service: payload.service,
        service_name: 'Aadhaar Card',
        reminder_type: payload.reminder_type,
        subject: payload.subject,
        due_date: payload.due_date,
        reminder_date: payload.reminder_date,
        priority: payload.priority,
        message_template: payload.message_template,
        follow_up_status: 'PENDING',
        notes: payload.notes || '',
        last_contact_date: null,
        customer_response: null,
        next_follow_up: null,
        created_by: 1,
        created_by_name: 'MITALI CHANGANI',
        follow_ups: [],
        follow_up_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localReminders = [newReminder, ...localReminders];
      return { message: 'Reminder created successfully.', data: newReminder };
    }
  },

  async updateReminder(
    reminderNo: string,
    data: Partial<Reminder>
  ): Promise<{ message: string; data: Reminder }> {
    try {
      const response = await apiClient.patch<{ message: string; data: Reminder }>(
        ENDPOINTS.REMINDERS.UPDATE(reminderNo),
        data
      );
      return response.data;
    } catch {
      const idx = localReminders.findIndex((r) => r.reminder_no === reminderNo);
      if (idx === -1) throw new Error('Reminder not found');
      localReminders[idx] = { ...localReminders[idx], ...data, updated_at: new Date().toISOString() };
      return { message: 'Reminder updated successfully.', data: localReminders[idx] };
    }
  },

  async deleteReminder(reminderNo: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.REMINDERS.DELETE(reminderNo)
      );
      return response.data;
    } catch {
      localReminders = localReminders.filter((r) => r.reminder_no !== reminderNo);
      return { message: 'Reminder deleted successfully.' };
    }
  },

  async getFollowUps(reminderNo: string): Promise<FollowUp[]> {
    try {
      const response = await apiClient.get<FollowUp[]>(
        ENDPOINTS.REMINDERS.FOLLOW_UPS(reminderNo)
      );
      return response.data;
    } catch {
      const r = localReminders.find((rem) => rem.reminder_no === reminderNo);
      return r?.follow_ups || [];
    }
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
    try {
      const response = await apiClient.post<{ message: string; data: FollowUp }>(
        ENDPOINTS.REMINDERS.ADD_FOLLOW_UP(reminderNo),
        data
      );
      return response.data;
    } catch {
      const r = localReminders.find((rem) => rem.reminder_no === reminderNo);
      if (!r) throw new Error('Reminder not found');
      const newFollowUp: FollowUp = {
        id: Math.floor(Math.random() * 1000) + 10,
        reminder: r.id,
        contact_date: data.contact_date,
        customer_response: data.customer_response,
        next_follow_up: data.next_follow_up || null,
        notes: data.notes || '',
        contacted_by: data.contacted_by || 1,
        contacted_by_name: 'MITALI CHANGANI',
        created_at: new Date().toISOString(),
      };
      if (!r.follow_ups) r.follow_ups = [];
      r.follow_ups.push(newFollowUp);
      r.customer_response = data.customer_response;
      r.last_contact_date = data.contact_date;
      r.next_follow_up = data.next_follow_up || null;
      r.follow_up_count = (r.follow_up_count || 0) + 1;
      return { message: 'Follow-up added successfully.', data: newFollowUp };
    }
  },

  async updateFollowUp(
    reminderNo: string,
    followUpId: number | string,
    data: Partial<FollowUp>
  ): Promise<{ message: string; data: FollowUp }> {
    try {
      const response = await apiClient.patch<{ message: string; data: FollowUp }>(
        ENDPOINTS.REMINDERS.UPDATE_FOLLOW_UP(reminderNo, followUpId),
        data
      );
      return response.data;
    } catch {
      const r = localReminders.find((rem) => rem.reminder_no === reminderNo);
      if (!r || !r.follow_ups) throw new Error('Follow-up not found');
      const idx = r.follow_ups.findIndex((fu) => fu.id === Number(followUpId));
      if (idx === -1) throw new Error('Follow-up not found');
      r.follow_ups[idx] = { ...r.follow_ups[idx], ...data };
      if (data.customer_response) r.customer_response = data.customer_response;
      if (data.contact_date) r.last_contact_date = data.contact_date;
      if (data.next_follow_up !== undefined) r.next_follow_up = data.next_follow_up;
      return { message: 'Follow-up updated successfully.', data: r.follow_ups[idx] };
    }
  },

  async deleteFollowUp(
    reminderNo: string,
    followUpId: number | string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.REMINDERS.DELETE_FOLLOW_UP(reminderNo, followUpId)
      );
      return response.data;
    } catch {
      const r = localReminders.find((rem) => rem.reminder_no === reminderNo);
      if (r && r.follow_ups) {
        r.follow_ups = r.follow_ups.filter((fu) => fu.id !== Number(followUpId));
        r.follow_up_count = r.follow_ups.length;
      }
      return { message: 'Follow-up removed successfully.' };
    }
  },
};
