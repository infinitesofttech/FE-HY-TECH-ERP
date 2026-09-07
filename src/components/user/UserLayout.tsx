'use client';

import React, { useState } from 'react';
import { RouteGuard } from '@/components/layout/RouteGuard';
import { UserSidebar } from './UserSidebar';
import { UserHeader } from './UserHeader';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
  familyId?: string;
  headOfFamily?: string;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  familyId,
  headOfFamily,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  const currentFamilyId = (user as any)?.family_id || familyId || 'HTF-000002';
  const currentHeadOfFamily = (user as any)?.head_of_family || headOfFamily || 'Rajesh Patel';

  return (
    <RouteGuard allowedRoles={['customer']}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 antialiased font-sans text-slate-900 dark:text-slate-100">
        {/* Fixed Enterprise Dark Sidebar */}
        <UserSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content Column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top Header */}
          <UserHeader
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
            familyId={currentFamilyId}
            headOfFamily={currentHeadOfFamily}
          />

          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-6">
              {children}
            </div>

            {/* Enterprise Security Footer (Mockup replica) */}
            <footer className="max-w-7xl mx-auto w-full mt-10 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure</span>
                <span>|</span>
                <span>Your data is safe with us</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                eService ERP v1.0.0
              </div>
            </footer>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
};
