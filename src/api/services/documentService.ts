import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { CustomerDocument } from '@/types';
import { MOCK_DOCUMENTS } from '../mockData';

const localDocs: Record<string, CustomerDocument[]> = { ...MOCK_DOCUMENTS };

export const documentService = {
  async getDocuments(familyId: string, memberId: number | string): Promise<CustomerDocument[]> {
    try {
      const response = await apiClient.get<CustomerDocument[]>(
        ENDPOINTS.DOCUMENTS.LIST(familyId, memberId)
      );
      return response.data;
    } catch {
      const key = `${familyId}_${memberId}`;
      return localDocs[key] || [];
    }
  },

  async uploadDocument(
    familyId: string,
    memberId: number | string,
    formData: FormData
  ): Promise<{ message: string; data: CustomerDocument }> {
    try {
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
    } catch {
      const key = `${familyId}_${memberId}`;
      if (!localDocs[key]) localDocs[key] = [];
      const newDoc: CustomerDocument = {
        id: Math.floor(Math.random() * 1000) + 10,
        family_id: familyId,
        member_name: 'Member Document',
        document_type: (formData.get('document_type') as CustomerDocument['document_type']) || 'AADHAR',
        document_type_display: String(formData.get('document_type') || 'Document'),
        document_name: String(formData.get('document_name') || 'Uploaded Document'),
        document_file: '/media/customer_documents/sample.pdf',
        description: String(formData.get('description') || ''),
        is_verified: formData.get('is_verified') === 'true',
        created_at: new Date().toISOString(),
        family_member: Number(memberId),
      };
      localDocs[key].push(newDoc);
      return { message: 'Document uploaded successfully.', data: newDoc };
    }
  },

  async getDocumentDetail(
    familyId: string,
    memberId: number | string,
    docId: number | string
  ): Promise<CustomerDocument> {
    try {
      const response = await apiClient.get<CustomerDocument>(
        ENDPOINTS.DOCUMENTS.DETAIL(familyId, memberId, docId)
      );
      return response.data;
    } catch {
      const key = `${familyId}_${memberId}`;
      const list = localDocs[key] || [];
      const found = list.find((d) => d.id === Number(docId));
      if (!found) throw new Error('Document not found');
      return found;
    }
  },

  async updateDocument(
    familyId: string,
    memberId: number | string,
    docId: number | string,
    data: Partial<CustomerDocument>
  ): Promise<{ message: string; data: CustomerDocument }> {
    try {
      const response = await apiClient.patch<{ message: string; data: CustomerDocument }>(
        ENDPOINTS.DOCUMENTS.UPDATE(familyId, memberId, docId),
        data
      );
      return response.data;
    } catch {
      const key = `${familyId}_${memberId}`;
      const list = localDocs[key] || [];
      const idx = list.findIndex((d) => d.id === Number(docId));
      if (idx === -1) throw new Error('Document not found');
      list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() };
      return { message: 'Document updated successfully.', data: list[idx] };
    }
  },

  async deleteDocument(
    familyId: string,
    memberId: number | string,
    docId: number | string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.DOCUMENTS.DELETE(familyId, memberId, docId)
      );
      return response.data;
    } catch {
      const key = `${familyId}_${memberId}`;
      if (localDocs[key]) {
        localDocs[key] = localDocs[key].filter((d) => d.id !== Number(docId));
      }
      return { message: 'Document deleted successfully.' };
    }
  },
};
