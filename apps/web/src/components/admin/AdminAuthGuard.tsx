'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateAdminSession, clearAdminSession } from '@/lib/admin-auth';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

/**
 * Wraps the admin panel. On mount:
 *   1. Validates the current session by calling /api/auth/me (via adminFetch,
 *      which auto-refreshes on 401).
 *   2. If the user is a valid admin, renders children.
 *   3. Otherwise clears local storage and redirects to /admin/login.
 * Also listens for `sumosta:admin-auth-expired` events dispatched by adminFetch
 * when a subsequent /refresh fails during normal admin activity.
 */
export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauth'>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await validateAdminSession();
      if (cancelled) return;
      if (user) {
        setStatus('ok');
      } else {
        setStatus('unauth');
        clearAdminSession();
        router.replace('/admin/login');
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      clearAdminSession();
      router.replace('/admin/login');
    };
    window.addEventListener('sumosta:admin-auth-expired', handler);
    return () => window.removeEventListener('sumosta:admin-auth-expired', handler);
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-label="Checking admin session">
        <div className="flex flex-col items-center gap-3">
          <HoneycombLoader size="lg" />
          <p className="font-satoshi text-sm text-gray-500">Verifying admin session…</p>
        </div>
      </div>
    );
  }

  if (status === 'unauth') return null; // redirect in flight

  return <>{children}</>;
}
