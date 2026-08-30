import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { RequiredDocument, DocumentType } from '@/types';
import { MOCK_SERVICES } from '../mockData';

export const requiredDocumentService = {
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    try {
      const response = await apiClient.get<RequiredDocument[]>(
        ENDPOINTS.REQUIRED_DOCUMENTS.LIST
      );
      return response.data;
    } catch {
      return MOCK_SERVICES.flatMap((s) => s.SubServices).flatMap((sub) => sub.RequiredDocuments);
    }
  },

  async getRequiredDocumentDetail(id: number | string): Promise<RequiredDocument> {
    try {
      const response = await apiClient.get<RequiredDocument>(
        ENDPOINTS.REQUIRED_DOCUMENTS.DETAIL(id)
      );
      return response.data;
    } catch {
      const all = MOCK_SERVICES.flatMap((s) => s.SubServices).flatMap((sub) => sub.RequiredDocuments);
      const found = all.find((d) => d.id === Number(id));
      if (!found) throw new Error('Required Document not found');
      return found;
    }
  },

  async createRequiredDocuments(data: {
    SubService: number;
    DocumentName?: string;
    document_type?: DocumentType;
    Documents?: string[];
  }): Promise<{ message: string; data: RequiredDocument[] }> {
    try {
      const response = await apiClient.post<{ message: string; data: RequiredDocument[] }>(
        ENDPOINTS.REQUIRED_DOCUMENTS.CREATE,
        data
      );
      return response.data;
    } catch {
      const names = data.Documents || (data.DocumentName ? [data.DocumentName] : ['Required Document']);
      const created: RequiredDocument[] = names.map((name, i) => ({
        id: Math.floor(Math.random() * 1000) + 50 + i,
        SubService: data.SubService,
        DocumentName: name,
        document_type: data.document_type || 'AADHAR',
        IsRequired: true,
        CreatedAt: new Date().toISOString(),
      }));

      for (const s of MOCK_SERVICES) {
        const sub = s.SubServices.find((subS) => subS.id === data.SubService);
        if (sub) {
          sub.RequiredDocuments.push(...created);
        }
      }

      return { message: 'Required documents created successfully', data: created };
    }
  },

  async updateRequiredDocument(
    id: number | string,
    data: { SubService?: number; DocumentName?: string; document_type?: DocumentType; IsRequired?: boolean }
  ): Promise<RequiredDocument> {
    try {
      const response = await apiClient.patch<RequiredDocument>(
        ENDPOINTS.REQUIRED_DOCUMENTS.UPDATE(id),
        data
      );
      return response.data;
    } catch {
      for (const s of MOCK_SERVICES) {
        for (const sub of s.SubServices) {
          const idx = sub.RequiredDocuments.findIndex((d) => d.id === Number(id));
          if (idx !== -1) {
            sub.RequiredDocuments[idx] = { ...sub.RequiredDocuments[idx], ...data };
            return sub.RequiredDocuments[idx];
          }
        }
      }
      throw new Error('Required Document not found');
    }
  },

  async deleteRequiredDocument(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.REQUIRED_DOCUMENTS.DELETE(id)
      );
      return response.data;
    } catch {
      for (const s of MOCK_SERVICES) {
        for (const sub of s.SubServices) {
          sub.RequiredDocuments = sub.RequiredDocuments.filter((d) => d.id !== Number(id));
        }
      }
      return { message: 'Required document deleted successfully.' };
    }
  },
};
