'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/api/auth';
import { authService } from '@/api/services/authService';
import { UserRole, AdminUser, EmployeeUser, CustomerUser, LoginResponse } from '@/types';

type UserProfile = AdminUser | EmployeeUser | CustomerUser;

interface AuthContextType {
  userRole: UserRole | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStaff: (creds: { username: string; password: string; portal_type?: string }) => Promise<LoginResponse>;
  loginCustomer: (creds: { family_id: string; mobile_number: string; password: string }) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = authStorage.getUserRole();
    const profile = authStorage.getUserProfile<UserProfile>();
    const isAuthed = authStorage.isAuthenticated();

    if (isAuthed && role) {
      setUserRole(role);
      setUser(profile);
    }
    setIsLoading(false);
  }, []);

  const loginStaff = async (creds: { username: string; password: string; portal_type?: string }): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.staffLogin(creds);
      authStorage.setSession(res);
      setUserRole(res.user_type);
      const profile = res.user || res.employee || null;
      setUser(profile);

      if (res.user_type === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/staff/dashboard');
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginCustomer = async (creds: {
    family_id: string;
    mobile_number: string;
    password: string;
  }): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.customerLogin(creds);
      authStorage.setSession(res);
      setUserRole(res.user_type);
      setUser(res.customer || null);
      router.push('/user/dashboard');
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      authStorage.clearSession();
      setUserRole(null);
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        user,
        isAuthenticated: !!userRole && !!authStorage.getAccessToken(),
        isLoading,
        loginStaff,
        loginCustomer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
