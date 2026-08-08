'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from 'shared';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { mergeGuestCart, resolveSafeNext } from '@/lib/auth-helpers';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { GoogleButton } from '@/components/auth/GoogleButton';

// -----------------------------------------------------------------------------
// Query-param banner (?error=google_failed etc.)
// -----------------------------------------------------------------------------

const ERROR_BANNERS: Record<string, string> = {
  google_failed:    'Sign-in with Google failed. Please try again.',
  google_cancelled: 'Google sign-in was cancelled.',
  google_invalid:   "Your Google account couldn't be verified. Please use email instead.",
  session_expired:  'Your session expired. Please sign in again.',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');
  const errorParam = searchParams.get('error');

  const login = useAuthStore((s) => s.login);

  const nextPath = useMemo(() => resolveSafeNext(rawNext), [rawNext]);
  const bannerMessage = errorParam ? ERROR_BANNERS[errorParam] : undefined;

  const [formError, setFormError] = useState<string>('');
  const [retryAfter, setRetryAfter] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
  });

  // Countdown timer for RATE_LIMITED responses.
  useEffect(() => {
    if (retryAfter <= 0) return;
    const t = setTimeout(() => setRetryAfter((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryAfter]);

  const disabled = retryAfter > 0;

  const onSubmit = async (data: LoginInput) => {
    setFormError('');
    try {
      const res = await authApi.login(data);
      login(res.user, res.accessToken, res.refreshToken);

      // Best-effort — never blocks navigation.
      await mergeGuestCart();

      router.push(nextPath);
    } catch (err) {
      handleLoginError(err, setFormError, setRetryAfter);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your SUMOSTA account"
    >
      {bannerMessage ? (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-[--terracotta-light] bg-[--terracotta-light]/60 px-4 py-3"
        >
          <p className="font-satoshi text-sm text-[--terracotta]">{bannerMessage}</p>
        </div>
      ) : null}

      <GoogleButton nextPath={nextPath} label="Continue with Google" />

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-[--sand]" />
        <span className="font-satoshi text-xs text-[--earth-light]">or</span>
        <hr className="flex-1 border-[--sand]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <AuthField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2 font-satoshi text-[--bark] cursor-pointer select-none">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-[--sand] text-[--honey-400] focus:ring-[--honey-400]"
            />
            Remember me
          </label>

          <Link
            href="/auth/forgot-password"
            className="font-satoshi text-[--honey-600] hover:text-[--honey-700] transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        {formError ? (
          <p role="alert" className="font-satoshi text-[--terracotta] text-sm text-center">
            {formError}
          </p>
        ) : null}

        <AuthSubmitButton
          loading={isSubmitting}
          disabled={disabled}
          loadingLabel="Signing in…"
        >
          {retryAfter > 0 ? `Try again in ${retryAfter}s` : 'Sign In'}
        </AuthSubmitButton>
      </form>

      <p className="font-satoshi text-[--earth] text-sm text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href={rawNext ? `/auth/register?next=${encodeURIComponent(nextPath)}` : '/auth/register'}
          className="text-[--honey-600] font-medium hover:text-[--honey-700] transition-colors"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

// -----------------------------------------------------------------------------
// Error mapping — keep messages generic, honour RATE_LIMITED countdown.
// -----------------------------------------------------------------------------

function handleLoginError(
  err: unknown,
  setError: (s: string) => void,
  setRetryAfter: (n: number) => void,
): void {
  const e = err as { code?: string; message?: string; retryAfter?: number };
  const code = e?.code;

  if (code === 'INVALID_CREDENTIALS') {
    setError('Invalid email or password.');
    return;
  }

  if (code === 'RATE_LIMITED') {
    const seconds = Number(e?.retryAfter) > 0 ? Math.ceil(Number(e.retryAfter)) : 30;
    setRetryAfter(seconds);
    setError(`Too many attempts. Try again in ${seconds}s.`);
    return;
  }

  if (code === 'EMAIL_NOT_VERIFIED') {
    setError('Please verify your email before signing in.');
    return;
  }

  setError(e?.message ?? 'Sign-in failed. Please try again.');
}

// -----------------------------------------------------------------------------
// Page wrapper
// -----------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[--cream]" aria-hidden />}
    >
      <LoginForm />
    </Suspense>
  );
}
