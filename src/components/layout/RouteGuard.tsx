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

    // =========================================================================
    // 1. Staff / Employee URL Enforcement: strictly stay under /staff/*
    // =========================================================================
    if (userRole === 'employee') {
      if (pathname.startsWith('/admin')) {
        let staffPath = pathname.replace(/^\/admin/, '/staff');
        if (pathname === '/admin/employees' || pathname.startsWith('/admin/employees/')) {
          staffPath = '/staff/hrms';
        } else if (pathname === '/admin/office-dashboard') {
          staffPath = '/staff/dashboard';
        }
        router.replace(staffPath);
        return;
      }
      if (pathname.startsWith('/user') || pathname.startsWith('/customer')) {
        router.replace('/staff/dashboard');
        return;
      }
    }

    // =========================================================================
    // 2. Administrator URL Enforcement: strictly stay under /admin/*
    // =========================================================================
    if (userRole === 'admin') {
      if (pathname.startsWith('/staff')) {
        let adminPath = pathname.replace(/^\/staff/, '/admin');
        if (pathname === '/staff/hrms' || pathname === '/staff/employees') {
          adminPath = '/admin/employees';
        }
        router.replace(adminPath);
        return;
      }
      if (pathname.startsWith('/user') || pathname.startsWith('/customer')) {
        router.replace('/admin/dashboard');
        return;
      }
    }

    // =========================================================================
    // 3. User / Citizen URL Enforcement: strictly stay under /user/*
    // =========================================================================
    if (userRole === 'customer') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
        router.replace('/user/dashboard');
        return;
      }
      if (pathname.startsWith('/customer')) {
        let userPath = '/user/dashboard';
        if (pathname.includes('/applications')) userPath = '/user/applications';
        else if (pathname.includes('/members') || pathname.includes('/family')) userPath = '/user/family';
        else if (pathname.includes('/services')) userPath = '/user/services';
        else if (pathname.includes('/settings')) userPath = '/user/settings';
        router.replace(userPath);
        return;
      }
    }

    if (userRole === 'hr') {
      if (!pathname.startsWith('/admin/employees') && !pathname.startsWith('/admin/services')) {
        router.replace('/admin/employees');
        return;
      }
    }

    if (!allowedRoles.includes(userRole)) {
      if (userRole === 'hr' && (pathname.startsWith('/admin/employees') || pathname.startsWith('/admin/services'))) {
        // HR allowed on employees and services
        return;
      }
      // Redirect to authorized portal
      if (userRole === 'admin') router.replace('/admin/dashboard');
      else if (userRole === 'hr') router.replace('/admin/employees');
      else if (userRole === 'employee') router.replace('/staff/dashboard');
      else if (userRole === 'customer') router.replace('/user/dashboard');
      else router.replace('/login');
    }
  }, [userRole, isAuthenticated, isLoading, allowedRoles, router, pathname]);

  // If role is mismatch or URL is currently being transitioned, render loader briefly
  const isUrlMismatched =
    (userRole === 'employee' && !pathname.startsWith('/staff') && !pathname.startsWith('/admin')) ||
    (userRole === 'hr' && !pathname.startsWith('/admin/employees') && !pathname.startsWith('/admin/services')) ||
    (userRole === 'admin' && !pathname.startsWith('/admin')) ||
    (userRole === 'customer' && !pathname.startsWith('/user'));

  if (
    isLoading ||
    !isAuthenticated ||
    !userRole ||
    (!allowedRoles.includes(userRole) && !(userRole === 'hr' && (pathname.startsWith('/admin/employees') || pathname.startsWith('/admin/services')))) ||
    isUrlMismatched
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">
            Switching to authorized {userRole} portal...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
