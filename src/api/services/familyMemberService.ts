import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { FamilyMember } from '@/types';

export const familyMemberService = {
  async getMembers(familyId: string): Promise<FamilyMember[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.CUSTOMERS.FAMILY_MEMBERS(familyId)
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getMemberDetail(familyId: string, memberId: number | string): Promise<FamilyMember> {
    const response = await apiClient.get<FamilyMember>(
      ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId)
    );
    return response.data;
  },

  async addMember(
    familyId: string,
    data: Omit<FamilyMember, 'id' | 'family_id' | 'created_at' | 'customer'> & { customer?: number }
  ): Promise<{ message: string; data: FamilyMember }> {
    const response = await apiClient.post<{ message: string; data: FamilyMember }>(
      ENDPOINTS.CUSTOMERS.FAMILY_MEMBERS(familyId),
      data
    );
    return response.data;
  },

  async updateMember(
    familyId: string,
    memberId: number | string,
    data: Partial<FamilyMember>
  ): Promise<{ message: string; data: FamilyMember }> {
    const response = await apiClient.patch<{ message: string; data: FamilyMember }>(
      ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId),
      data
    );
    return response.data;
  },

  async deleteMember(familyId: string, memberId: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId)
    );
    return response.data;
  },
};
