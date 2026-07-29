'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function GoogleCallbackPage() {
  const router     = useRouter();
  const params     = useSearchParams();
  const loginStore = useAuthStore((s) => s.login);

  useEffect(() => {
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error        = params.get('error');

    if (error || !accessToken || !refreshToken) {
      router.replace('/auth/login?error=google_failed');
      return;
    }

    loginStore(
      {
        id:    params.get('userId')!,
        name:  params.get('userName')!,
        email: params.get('userEmail')!,
        role:  params.get('userRole')!,
      },
      accessToken,
      refreshToken,
    );

    router.replace('/account/orders');
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-jakarta text-sm text-gray-500">Signing you in with Google…</p>
      </div>
    </div>
  );
}
