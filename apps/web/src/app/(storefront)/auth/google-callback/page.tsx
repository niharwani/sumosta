'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { mergeGuestCart, resolveSafeNext } from '@/lib/auth-helpers';

import HoneycombLoader from '@/components/shared/HoneycombLoader';

function GoogleCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const login  = useAuthStore((s) => s.login);

  // Guard so Strict Mode's double-invoke doesn't burn the one-time OAuth code.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get('code');
    const nextRaw = params.get('next');

    if (!code) {
      router.replace('/auth/login?error=google_failed');
      return;
    }

    void (async () => {
      try {
        const res = await authApi.exchangeSession({ code });
        login(res.user, res.accessToken, res.refreshToken);

        // Best-effort merge — never blocks navigation.
        await mergeGuestCart();

        const nextPath = resolveSafeNext(nextRaw);
        router.replace(nextPath);
      } catch (err) {
        const e = err as { code?: string };
        if (e.code === 'EMAIL_NOT_VERIFIED') {
          router.replace('/auth/login?error=google_invalid');
          return;
        }
        router.replace('/auth/login?error=google_failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[--cream] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex mb-4" role="status" aria-label="Loading">
          <HoneycombLoader size="lg" />
        </div>
        <p className="font-satoshi text-sm text-[--earth]">Signing you in…</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[--cream] flex items-center justify-center">
          <div role="status" aria-label="Loading">
            <HoneycombLoader size="lg" />
          </div>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
