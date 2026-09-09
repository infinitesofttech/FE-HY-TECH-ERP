import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { RequiredDocument, DocumentType } from '@/types';

export const requiredDocumentService = {
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.REQUIRED_DOCUMENTS.LIST
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getRequiredDocumentDetail(id: number | string): Promise<RequiredDocument> {
    const response = await apiClient.get<RequiredDocument>(
      ENDPOINTS.REQUIRED_DOCUMENTS.DETAIL(id)
    );
    return response.data;
  },

  async createRequiredDocuments(data: {
    SubService: number;
    DocumentName?: string;
    document_type?: DocumentType;
    Documents?: string[];
  }): Promise<{ message: string; data: RequiredDocument[] }> {
    const response = await apiClient.post<{ message: string; data: RequiredDocument[] }>(
      ENDPOINTS.REQUIRED_DOCUMENTS.CREATE,
      data
    );
    return response.data;
  },

  async updateRequiredDocument(
    id: number | string,
    data: { SubService?: number; DocumentName?: string; document_type?: DocumentType; IsRequired?: boolean }
  ): Promise<RequiredDocument> {
    const response = await apiClient.patch<RequiredDocument>(
      ENDPOINTS.REQUIRED_DOCUMENTS.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteRequiredDocument(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.REQUIRED_DOCUMENTS.DELETE(id)
    );
    return response.data;
  },
};
