'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sumosta_access_token');
    if (!token) {
      router.replace('/admin/login');
    }
  }, [router]);

  return <>{children}</>;
}
