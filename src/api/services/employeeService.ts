import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { EmployeeUser } from '@/types';

export const employeeService = {
  async getEmployees(): Promise<EmployeeUser[]> {
    const response = await apiClient.get<any>(
      ENDPOINTS.AUTH.EMPLOYEES
    );
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.results)) return response.data.results;
    return [];
  },

  async getEmployeeDetail(id: number | string): Promise<EmployeeUser> {
    const response = await apiClient.get<EmployeeUser>(
      ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id)
    );
    return response.data;
  },

  async createEmployee(payload: {
    username: string;
    password?: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    role: 'STAFF' | 'ADMIN';
  }): Promise<{ message: string; data: EmployeeUser }> {
    const response = await apiClient.post<{ message: string; data: EmployeeUser }>(
      ENDPOINTS.AUTH.EMPLOYEES,
      payload
    );
    return response.data;
  },

  async updateEmployee(
    id: number | string,
    data: Partial<EmployeeUser> & { password?: string }
  ): Promise<{ message: string; data: EmployeeUser }> {
    const response = await apiClient.patch<{ message: string; data: EmployeeUser }>(
      ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id),
      data
    );
    return response.data;
  },

  async deleteEmployee(id: number | string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.AUTH.EMPLOYEE_DETAIL(id)
    );
    return response.data;
  },
};
