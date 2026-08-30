import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { EmployeeUser } from '@/types';
import { MOCK_EMPLOYEES } from '../mockData';

let localEmployees = [...MOCK_EMPLOYEES];

export const employeeService = {
  async getEmployees(): Promise<EmployeeUser[]> {
    try {
      const response = await apiClient.get<EmployeeUser[]>(
        ENDPOINTS.AUTH.EMPLOYEES
      );
      return response.data;
    } catch {
      return localEmployees;
    }
  },

  async getEmployeeDetail(id: number | string): Promise<EmployeeUser> {
    try {
      const response = await apiClient.get<EmployeeUser>(
        ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id)
      );
      return response.data;
    } catch {
      const found = localEmployees.find((e) => e.id === Number(id));
      if (!found) throw new Error('Employee not found');
      return found;
    }
  },

  async createEmployee(payload: {
    username: string;
    password?: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    role: 'STAFF' | 'ADMIN';
  }): Promise<{ message: string; data: EmployeeUser }> {
    try {
      const response = await apiClient.post<{ message: string; data: EmployeeUser }>(
        ENDPOINTS.AUTH.EMPLOYEES,
        payload
      );
      return response.data;
    } catch {
      const newEmp: EmployeeUser = {
        id: localEmployees.length + 1,
        username: payload.username,
        full_name: payload.full_name,
        email: payload.email,
        mobile_number: payload.mobile_number || '',
        role: payload.role,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      localEmployees = [newEmp, ...localEmployees];
      return { message: 'Employee created successfully.', data: newEmp };
    }
  },

  async updateEmployee(
    id: number | string,
    data: Partial<EmployeeUser> & { password?: string }
  ): Promise<{ message: string; data: EmployeeUser }> {
    try {
      const response = await apiClient.patch<{ message: string; data: EmployeeUser }>(
        ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id),
        data
      );
      return response.data;
    } catch {
      const idx = localEmployees.findIndex((e) => e.id === Number(id));
      if (idx === -1) throw new Error('Employee not found');
      localEmployees[idx] = { ...localEmployees[idx], ...data };
      return { message: 'Employee updated successfully.', data: localEmployees[idx] };
    }
  },

  async deleteEmployee(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id)
      );
      return response.data;
    } catch {
      localEmployees = localEmployees.filter((e) => e.id !== Number(id));
      return { message: 'Employee deleted successfully.' };
    }
  },
};
