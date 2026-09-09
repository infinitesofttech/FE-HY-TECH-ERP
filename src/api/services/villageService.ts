import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { Village, FamilyTreeNodeData, GovDocumentItem, Customer, RelationshipType } from '@/types';

export const villageService = {
  async getVillages(): Promise<Village[]> {
    const response = await apiClient.get<any>(ENDPOINTS.VILLAGES.LIST);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async createVillage(newVillage: {
    name: string;
    name_gu?: string;
    code?: string;
    taluka: string;
    district: string;
    total_families?: number;
    total_citizens?: number;
    total_documents?: number;
    male_count?: number;
    female_count?: number;
  }): Promise<{ message: string; village: Village }> {
    const response = await apiClient.post<any>(ENDPOINTS.VILLAGES.CREATE, newVillage);
    return {
      message: 'Village created successfully',
      village: response.data.data || response.data,
    };
  },

  async getVillageByCodeOrName(identifier: string): Promise<Village | undefined> {
    const villages = await this.getVillages();
    const norm = identifier.toLowerCase();
    return villages.find(
      (v) => v.code.toLowerCase() === norm || v.name.toLowerCase() === norm || v.name_gu?.toLowerCase() === norm
    );
  },

  async getVillageFamilies(villageName: string): Promise<Customer[]> {
    const response = await apiClient.get<any>(ENDPOINTS.CUSTOMERS.LIST, {
      params: { search: villageName },
    });
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getFamilyTree(
    familyId: string
  ): Promise<{ head: FamilyTreeNodeData; spouse?: FamilyTreeNodeData; children: FamilyTreeNodeData[] } | undefined> {
    const response = await apiClient.get<any>(ENDPOINTS.VILLAGES.FAMILY_TREE(familyId));
    return response.data;
  },

  async updateMemberDoc(
    familyId: string,
    memberId: number,
    docId: string,
    newStatus: GovDocumentItem['status'],
    fileUrl?: string,
    docNo?: string
  ): Promise<{ message: string; doc: GovDocumentItem }> {
    const response = await apiClient.patch<any>(
      `${ENDPOINTS.VILLAGES.FAMILY_TREE(familyId)}documents/${docId}/`,
      {
        member_id: memberId,
        status: newStatus,
        file_url: fileUrl,
        document_no: docNo,
      }
    );
    return response.data;
  },

  async addMemberRelation(
    familyId: string,
    newMember: {
      name: string;
      relationship: RelationshipType;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      birth_date: string;
      mobile_number: string;
    }
  ): Promise<{ message: string; member: FamilyTreeNodeData }> {
    const response = await apiClient.post<any>(
      `${ENDPOINTS.VILLAGES.FAMILY_TREE(familyId)}members/`,
      newMember
    );
    return response.data;
  },
};
