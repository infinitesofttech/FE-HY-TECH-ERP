'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RootPage() {
  const { userRole, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = () => {
      const target =
        !isAuthenticated || !userRole
          ? '/login'
          : userRole === 'admin'
          ? '/admin/dashboard'
          : userRole === 'employee'
          ? '/staff/dashboard'
          : userRole === 'customer'
          ? '/user/dashboard'
          : '/login';

      try {
        router.replace(target);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.replace(target);
        }
      }
    };

    if (!isLoading) {
      handleRedirect();
    }

    // Safety timeout: Never stay stuck on loading screen longer than 600ms
    const timer = setTimeout(() => {
      handleRedirect();
    }, 600);

    return () => clearTimeout(timer);
  }, [userRole, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading HY-TECH ERP...
        </p>
        <Link
          href="/login"
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2 font-medium"
        >
          Go to Login →
        </Link>
      </div>
    </div>
  );
}
