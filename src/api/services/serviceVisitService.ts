import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { ServiceVisit, VisitDocument, CustomerDocument } from '@/types';
import { MOCK_SERVICE_VISITS, MOCK_SERVICES } from '../mockData';

let localVisits = [...MOCK_SERVICE_VISITS];

export const serviceVisitService = {
  async getVisits(params?: { search?: string; service?: number | string }): Promise<ServiceVisit[]> {
    try {
      const response = await apiClient.get<ServiceVisit[]>(
        ENDPOINTS.SERVICE_VISITS.LIST,
        { params }
      );
      return response.data;
    } catch {
      let filtered = [...localVisits];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.customer_family_id.toLowerCase().includes(query) ||
            v.customer_name.toLowerCase().includes(query) ||
            v.visit_no.toLowerCase().includes(query)
        );
      }
      if (params?.service) {
        filtered = filtered.filter((v) => v.service === Number(params.service));
      }
      return filtered;
    }
  },

  async getVisitDetail(visitNo: string): Promise<ServiceVisit> {
    try {
      const response = await apiClient.get<ServiceVisit>(
        ENDPOINTS.SERVICE_VISITS.DETAIL(visitNo)
      );
      return response.data;
    } catch {
      const found = localVisits.find((v) => v.visit_no === visitNo);
      if (!found) throw new Error('Visit not found');
      return found;
    }
  },

  async createVisit(payload: {
    customer: number;
    family_member?: number | null;
    service: number;
    sub_service: number;
    checked_by: number;
    remarks?: string;
  }): Promise<{ message: string; data: ServiceVisit }> {
    try {
      const response = await apiClient.post<{ message: string; data: ServiceVisit }>(
        ENDPOINTS.SERVICE_VISITS.CREATE,
        payload
      );
      return response.data;
    } catch {
      const matchedService = MOCK_SERVICES.find((s) => s.id === payload.service);
      const matchedSub = matchedService?.SubServices.find((sub) => sub.id === payload.sub_service);

      const generatedDocs: VisitDocument[] = (matchedSub?.RequiredDocuments || []).map((req, idx) => ({
        id: Math.floor(Math.random() * 1000) + 50 + idx,
        document_type: req.document_type,
        document_name: req.DocumentName,
        status: 'NOT_AVAILABLE',
        document_file: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const newVisitNo = `VIS-00000${localVisits.length + 1}`;
      const newVisit: ServiceVisit = {
        id: localVisits.length + 1,
        visit_no: newVisitNo,
        customer: payload.customer,
        customer_family_id: 'HTF-000002',
        customer_name: 'Dineshbhai Changani',
        customer_mobile: '8000231125',
        family_member: payload.family_member || null,
        family_member_name: payload.family_member ? 'Family Member' : null,
        service: payload.service,
        service_name: matchedService?.ServiceName || 'General Service',
        sub_service: payload.sub_service,
        sub_service_name: matchedSub?.SubServiceName || 'General Sub-Service',
        checked_by: payload.checked_by || 1,
        checked_by_name: 'MITALI CHANGANI',
        status: 'PENDING',
        visit_date: new Date().toISOString().split('T')[0],
        remarks: payload.remarks || '',
        documents: generatedDocs,
        total_documents: generatedDocs.length,
        available_documents: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localVisits = [newVisit, ...localVisits];
      return { message: 'Service visit created. Document checklist generated.', data: newVisit };
    }
  },

  async updateVisit(
    visitNo: string,
    data: Partial<ServiceVisit>
  ): Promise<{ message: string; data: ServiceVisit }> {
    try {
      const response = await apiClient.patch<{ message: string; data: ServiceVisit }>(
        ENDPOINTS.SERVICE_VISITS.UPDATE(visitNo),
        data
      );
      return response.data;
    } catch {
      const idx = localVisits.findIndex((v) => v.visit_no === visitNo);
      if (idx === -1) throw new Error('Visit not found');
      localVisits[idx] = { ...localVisits[idx], ...data, updated_at: new Date().toISOString() };
      return { message: 'Service visit updated.', data: localVisits[idx] };
    }
  },

  async updateVisitDocument(
    visitNo: string,
    docId: number | string,
    formData: FormData
  ): Promise<{ message: string; visit_document: VisitDocument; customer_document?: CustomerDocument }> {
    try {
      const response = await apiClient.patch<{
        message: string;
        visit_document: VisitDocument;
        customer_document?: CustomerDocument;
      }>(ENDPOINTS.SERVICE_VISITS.UPDATE_DOCUMENT(visitNo, docId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch {
      const visit = localVisits.find((v) => v.visit_no === visitNo);
      if (!visit) throw new Error('Visit not found');
      const doc = visit.documents.find((d) => d.id === Number(docId));
      if (!doc) throw new Error('Document not found in checklist');

      doc.status = (formData.get('status') as VisitDocument['status']) || 'AVAILABLE';
      doc.document_file = '/media/visit_documents/sample.pdf';
      doc.updated_at = new Date().toISOString();

      visit.available_documents = visit.documents.filter((d) => d.status === 'AVAILABLE').length;

      return {
        message: 'Document uploaded and checklist updated.',
        visit_document: doc,
      };
    }
  },

  async deleteVisit(visitNo: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.SERVICE_VISITS.DELETE(visitNo)
      );
      return response.data;
    } catch {
      localVisits = localVisits.filter((v) => v.visit_no !== visitNo);
      return { message: 'Visit deleted successfully.' };
    }
  },
};
