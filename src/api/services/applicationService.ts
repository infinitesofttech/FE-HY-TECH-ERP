import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Application, ApplicationStatus } from '@/types';
import { MOCK_APPLICATIONS } from '../mockData';

let localApplications: Application[] = [...MOCK_APPLICATIONS];

export const applicationService = {
  async getApplications(params?: {
    search?: string;
    status?: string;
    service?: number | string;
    priority?: string;
    family_id?: string;
  }): Promise<Application[]> {
    try {
      const response = await apiClient.get<Application[]>(ENDPOINTS.APPLICATIONS.LIST, {
        params,
      });
      return response.data;
    } catch {
      let filtered = [...localApplications];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (app) =>
            app.application_no.toLowerCase().includes(query) ||
            app.customer_name.toLowerCase().includes(query) ||
            app.customer_mobile.toLowerCase().includes(query) ||
            app.customer_family_id.toLowerCase().includes(query) ||
            (app.government_app_no && app.government_app_no.toLowerCase().includes(query)) ||
            app.service_name.toLowerCase().includes(query) ||
            (app.service_name_gu && app.service_name_gu.includes(query))
        );
      }
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter((app) => app.status === params.status);
      }
      if (params?.service && params.service !== 'ALL') {
        filtered = filtered.filter((app) => app.service === Number(params.service));
      }
      if (params?.priority && params.priority !== 'ALL') {
        filtered = filtered.filter((app) => app.priority === params.priority);
      }
      if (params?.family_id) {
        filtered = filtered.filter((app) => app.customer_family_id === params.family_id);
      }
      return filtered;
    }
  },

  async getApplicationDetail(appNo: string): Promise<Application> {
    try {
      const response = await apiClient.get<Application>(ENDPOINTS.APPLICATIONS.DETAIL(appNo));
      return response.data;
    } catch {
      const found = localApplications.find((a) => a.application_no === appNo);
      if (!found) throw new Error('Application not found');
      return found;
    }
  },

  async createApplication(
    payload: Partial<Application>
  ): Promise<Application> {
    try {
      const response = await apiClient.post<any>(
        ENDPOINTS.APPLICATIONS.CREATE,
        payload
      );
      return response.data.data || response.data;
    } catch {
      const pad = (n: number) => String(n).padStart(6, '0');
      const newAppNo = `HT-APP-2026-${pad(localApplications.length + 1)}`;
      const now = new Date().toISOString();

      const newApp: Application = {
        id: localApplications.length + 1,
        application_no: newAppNo,
        customer: payload.customer,
        customer_name: payload.customer_name || 'Citizen Applicant',
        customer_mobile: payload.customer_mobile || '8000000000',
        customer_family_id: payload.customer_family_id || 'HTF-000001',
        family_member: payload.family_member || null,
        family_member_name: payload.family_member_name || null,
        service: payload.service,
        service_name: payload.service_name || 'Government Service',
        service_name_gu: payload.service_name_gu,
        sub_service: payload.sub_service,
        sub_service_name: payload.sub_service_name || 'General Operation',
        category: payload.category || 'GOVT_FORMS',
        status: payload.status || 'DRAFT',
        priority: payload.priority || 'HIGH',
        government_app_no: payload.government_app_no,
        government_portal_url: payload.government_portal_url,
        govt_fee: payload.govt_fee || 0,
        service_charge: payload.service_charge || 50,
        total_fee: payload.total_fee || 50,
        payment_status: payload.payment_status || 'PAID',
        payment_mode: payload.payment_mode || 'CASH',
        receipt_no: payload.receipt_no || `RCP-2026-${pad(localApplications.length + 1)}`,
        assigned_staff: payload.assigned_staff || 1,
        assigned_staff_name: payload.assigned_staff_name || 'Front Desk Officer',
        created_by: payload.created_by || 1,
        created_by_name: payload.created_by_name || 'Admin',
        expected_date:
          payload.expected_date ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sla_days: payload.sla_days || 7,
        documents: payload.documents || [],
        form_data: payload.form_data || {},
        timeline: [
          {
            id: `evt-${Date.now()}`,
            timestamp: now,
            actor_name: payload.created_by_name || 'Operator',
            actor_role: 'STAFF',
            action: 'Application Intake Recorded',
            old_status: undefined,
            new_status: payload.status || 'DRAFT',
            notes: payload.notes || 'Citizen completed intake at desk',
          },
          ...(payload.timeline || []),
        ],
        notes: payload.notes || '',
        created_at: now,
        updated_at: now,
      };

      localApplications = [newApp, ...localApplications];
      return newApp;
    }
  },

  async updateApplication(
    appNoOrId: string | number,
    data: Partial<Application>
  ): Promise<Application> {
    const s = String(appNoOrId);
    try {
      const response = await apiClient.patch<any>(
        ENDPOINTS.APPLICATIONS.UPDATE(s),
        data
      );
      return response.data.data || response.data;
    } catch {
      const idx = localApplications.findIndex((a) => a.application_no === s || String(a.id) === s);
      if (idx === -1) throw new Error('Application not found');

      localApplications[idx] = {
        ...localApplications[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return localApplications[idx];
    }
  },

  async updateStatus(
    appNoOrId: string | number,
    newStatus: ApplicationStatus,
    notes?: string,
    actorName: string = 'Staff Officer',
    actorRole: string = 'STAFF'
  ): Promise<Application> {
    const s = String(appNoOrId);
    try {
      const response = await apiClient.post<any>(
        ENDPOINTS.APPLICATIONS.STATUS(s),
        { status: newStatus, notes }
      );
      return response.data.data || response.data;
    } catch {
      const idx = localApplications.findIndex((a) => a.application_no === s || String(a.id) === s);
      if (idx === -1) throw new Error('Application not found');

      const oldStatus = localApplications[idx].status;
      const timelineEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_name: actorName,
        actor_role: actorRole,
        action: `Status advanced to ${newStatus}`,
        old_status: oldStatus,
        new_status: newStatus,
        notes: notes || `Application moved from ${oldStatus} to ${newStatus}`,
      };

      localApplications[idx] = {
        ...localApplications[idx],
        status: newStatus,
        timeline: [timelineEvent, ...(localApplications[idx].timeline || [])],
        updated_at: new Date().toISOString(),
      };

      return localApplications[idx];
    }
  },

  async deleteApplication(appNo: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.APPLICATIONS.DELETE(appNo)
      );
      return response.data;
    } catch {
      localApplications = localApplications.filter((a) => a.application_no !== appNo);
      return { message: 'Application removed successfully.' };
    }
  },
};
