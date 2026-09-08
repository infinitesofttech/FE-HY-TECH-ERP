'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHrmsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      router.replace(`/admin/employees${search || ''}`);
    }
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );
}
