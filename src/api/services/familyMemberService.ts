import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { FamilyMember } from '@/types';
import { MOCK_FAMILY_MEMBERS } from '../mockData';

const localMembers: Record<string, FamilyMember[]> = { ...MOCK_FAMILY_MEMBERS };

export const familyMemberService = {
  async getMembers(familyId: string): Promise<FamilyMember[]> {
    try {
      const response = await apiClient.get<FamilyMember[]>(
        ENDPOINTS.CUSTOMERS.FAMILY_MEMBERS(familyId)
      );
      return response.data;
    } catch {
      return localMembers[familyId] || [];
    }
  },

  async getMemberDetail(familyId: string, memberId: number | string): Promise<FamilyMember> {
    try {
      const response = await apiClient.get<FamilyMember>(
        ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId)
      );
      return response.data;
    } catch {
      const list = localMembers[familyId] || [];
      const found = list.find((m) => m.id === Number(memberId));
      if (!found) throw new Error('Member not found');
      return found;
    }
  },

  async addMember(
    familyId: string,
    data: Omit<FamilyMember, 'id' | 'family_id' | 'created_at' | 'customer'> & { customer?: number }
  ): Promise<{ message: string; data: FamilyMember }> {
    try {
      const response = await apiClient.post<{ message: string; data: FamilyMember }>(
        ENDPOINTS.CUSTOMERS.FAMILY_MEMBERS(familyId),
        data
      );
      return response.data;
    } catch {
      if (!localMembers[familyId]) {
        localMembers[familyId] = [];
      }
      const newId = Math.floor(Math.random() * 1000) + 10;
      const newMember: FamilyMember = {
        id: newId,
        family_id: familyId,
        name: data.name,
        relationship: data.relationship,
        mobile_number: data.mobile_number,
        birth_date: data.birth_date,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        customer: data.customer || 3,
      };
      localMembers[familyId].push(newMember);
      return { message: 'Family member created successfully.', data: newMember };
    }
  },

  async updateMember(
    familyId: string,
    memberId: number | string,
    data: Partial<FamilyMember>
  ): Promise<{ message: string; data: FamilyMember }> {
    try {
      const response = await apiClient.patch<{ message: string; data: FamilyMember }>(
        ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId),
        data
      );
      return response.data;
    } catch {
      const list = localMembers[familyId] || [];
      const idx = list.findIndex((m) => m.id === Number(memberId));
      if (idx === -1) throw new Error('Member not found');
      list[idx] = { ...list[idx], ...data };
      return { message: 'Family member updated successfully.', data: list[idx] };
    }
  },

  async deleteMember(familyId: string, memberId: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.CUSTOMERS.FAMILY_MEMBER_DETAIL(familyId, memberId)
      );
      return response.data;
    } catch {
      if (localMembers[familyId]) {
        localMembers[familyId] = localMembers[familyId].filter(
          (m) => m.id !== Number(memberId)
        );
      }
      return { message: 'Family member deleted successfully.' };
    }
  },
};
