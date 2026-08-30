'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles, children }) => {
  const { userRole, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !userRole) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      // Redirect to authorized portal
      if (userRole === 'admin') router.replace('/admin/dashboard');
      else if (userRole === 'employee') router.replace('/staff/dashboard');
      else if (userRole === 'customer') router.replace('/customer/dashboard');
      else router.replace('/login');
    }
  }, [userRole, isAuthenticated, isLoading, allowedRoles, router, pathname]);

  if (isLoading || !isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Checking permissions...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
