'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerMembersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/user/family?tab=member');
  }, [router]);
  return null;
}
