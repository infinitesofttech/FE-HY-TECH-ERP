import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { ServiceVisit, VisitDocument, CustomerDocument } from '@/types';

export const serviceVisitService = {
  async getVisits(params?: { search?: string; service?: number | string }): Promise<ServiceVisit[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.SERVICE_VISITS.LIST,
      { params }
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getVisitDetail(visitNo: string): Promise<ServiceVisit> {
    const response = await apiClient.get<ServiceVisit>(
      ENDPOINTS.SERVICE_VISITS.DETAIL(visitNo)
    );
    return response.data;
  },

  async createVisit(payload: {
    customer: number;
    family_member?: number | null;
    service: number;
    sub_service: number;
    checked_by: number;
    remarks?: string;
  }): Promise<{ message: string; data: ServiceVisit }> {
    const response = await apiClient.post<{ message: string; data: ServiceVisit }>(
      ENDPOINTS.SERVICE_VISITS.CREATE,
      payload
    );
    return response.data;
  },

  async updateVisit(
    visitNo: string,
    data: Partial<ServiceVisit>
  ): Promise<{ message: string; data: ServiceVisit }> {
    const response = await apiClient.patch<{ message: string; data: ServiceVisit }>(
      ENDPOINTS.SERVICE_VISITS.UPDATE(visitNo),
      data
    );
    return response.data;
  },

  async updateVisitDocument(
    visitNo: string,
    docId: number | string,
    formData: FormData
  ): Promise<{ message: string; visit_document: VisitDocument; customer_document?: CustomerDocument }> {
    const response = await apiClient.patch<{
      message: string;
      visit_document: VisitDocument;
      customer_document?: CustomerDocument;
    }>(ENDPOINTS.SERVICE_VISITS.UPDATE_DOCUMENT(visitNo, docId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteVisit(visitNo: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.SERVICE_VISITS.DELETE(visitNo)
    );
    return response.data;
  },
};
