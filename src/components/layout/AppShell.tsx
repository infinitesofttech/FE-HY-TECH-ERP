'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RouteGuard } from './RouteGuard';
import { UserRole } from '@/types';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';
import { WhatsAppPanel, WhatsAppFAB } from './WhatsAppPanel';

interface AppShellProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ allowedRoles, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K / Cmd+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <RouteGuard allowedRoles={allowedRoles}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 antialiased">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all">
            <div className="max-w-7xl mx-auto w-full space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* WhatsApp Floating Panel — available on every ERP page */}
      <WhatsAppPanel
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* Green FAB button — bottom-right corner */}
      <WhatsAppFAB
        isOpen={isWhatsAppOpen}
        onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
      />
    </RouteGuard>
  );
};
