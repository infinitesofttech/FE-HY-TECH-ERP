import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { CustomerDocument } from '@/types';

export const documentService = {
  async getDocuments(familyId: string, memberId: number | string): Promise<CustomerDocument[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.DOCUMENTS.LIST(familyId, memberId)
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async uploadDocument(
    familyId: string,
    memberId: number | string,
    formData: FormData
  ): Promise<{ message: string; data: CustomerDocument }> {
    const response = await apiClient.post<{ message: string; data: CustomerDocument }>(
      ENDPOINTS.DOCUMENTS.UPLOAD(familyId, memberId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getDocumentDetail(
    familyId: string,
    memberId: number | string,
    docId: number | string
  ): Promise<CustomerDocument> {
    const response = await apiClient.get<CustomerDocument>(
      ENDPOINTS.DOCUMENTS.DETAIL(familyId, memberId, docId)
    );
    return response.data;
  },

  async updateDocument(
    familyId: string,
    memberId: number | string,
    docId: number | string,
    data: Partial<CustomerDocument>
  ): Promise<{ message: string; data: CustomerDocument }> {
    const response = await apiClient.patch<{ message: string; data: CustomerDocument }>(
      ENDPOINTS.DOCUMENTS.UPDATE(familyId, memberId, docId),
      data
    );
    return response.data;
  },

  async deleteDocument(
    familyId: string,
    memberId: number | string,
    docId: number | string
  ): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.DOCUMENTS.DELETE(familyId, memberId, docId)
    );
    return response.data;
  },
};
