'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { userRole, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !userRole) {
      router.replace('/login');
    } else if (userRole === 'admin') {
      router.replace('/admin/dashboard');
    } else if (userRole === 'employee') {
      router.replace('/staff/dashboard');
    } else if (userRole === 'customer') {
      router.replace('/customer/dashboard');
    } else {
      router.replace('/login');
    }
  }, [userRole, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading HY-TECH ERP...
        </p>
      </div>
    </div>
  );
}
