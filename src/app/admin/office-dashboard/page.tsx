'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OfficeDashboardView } from '@/components/office/OfficeDashboardView';

export default function AdminOfficeDashboardPage() {
  return (
    <AppShell allowedRoles={['admin']}>
      <OfficeDashboardView />
    </AppShell>
  );
}
