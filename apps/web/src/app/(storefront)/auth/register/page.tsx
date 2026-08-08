'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { mergeGuestCart, resolveSafeNext } from '@/lib/auth-helpers';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

// -----------------------------------------------------------------------------
// Local schema (extends `registerSchema` from `shared` with confirm + T&Cs).
// We redeclare here instead of importing to keep the client bundle self-
// contained and to add the client-only cross-field validation.
// -----------------------------------------------------------------------------

const registerFormSchema = z
  .object({
    name:            z.string().min(2, 'Please enter your full name.'),
    email:           z.string().email('Please enter a valid email address.'),
    phone:           z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'),
    password:        z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    acceptTerms:     z.boolean().refine((v) => v === true, {
      message: 'You must agree to the Terms and Privacy Policy.',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
      });
    }
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// -----------------------------------------------------------------------------

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');

  const login = useAuthStore((s) => s.login);
  const nextPath = useMemo(() => resolveSafeNext(rawNext), [rawNext]);

  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError('');
    try {
      const res = await authApi.register({
        name:     data.name.trim(),
        email:    data.email.trim().toLowerCase(),
        phone:    data.phone,
        password: data.password,
      });

      login(res.user, res.accessToken, res.refreshToken);

      // Best-effort merge — never blocks navigation.
      await mergeGuestCart();

      // Consistent with login — always land on the orders dashboard.
      router.push(nextPath);
    } catch (err) {
      handleRegisterError(err, setError, setFormError);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join the SUMOSTA family — track orders, save addresses, and reorder in a tap."
    >
      <GoogleButton nextPath={nextPath} label="Sign up with Google" />

      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-[--sand]" />
        <span className="font-satoshi text-xs text-[--earth-light]">or</span>
        <hr className="flex-1 border-[--sand]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <AuthField
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Priya Sharma"
          error={errors.name?.message}
          {...register('name')}
        />

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
          label="Phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div>
          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <label className="flex items-start gap-2 font-satoshi text-sm text-[--bark] cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-0.5 rounded border-[--sand] text-[--honey-400] focus:ring-[--honey-400]"
            aria-describedby={errors.acceptTerms ? 'accept-terms-error' : undefined}
          />
          <span>
            I agree to the{' '}
            <Link href="/policies/terms" className="text-[--honey-600] hover:text-[--honey-700] underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/policies/privacy" className="text-[--honey-600] hover:text-[--honey-700] underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p id="accept-terms-error" role="alert" className="-mt-3 font-satoshi text-[--terracotta] text-xs">
            {errors.acceptTerms.message}
          </p>
        ) : null}

        {formError ? (
          <p role="alert" className="font-satoshi text-[--terracotta] text-sm text-center">
            {formError}
          </p>
        ) : null}

        <AuthSubmitButton loading={isSubmitting} loadingLabel="Creating your account…">
          Create Account
        </AuthSubmitButton>
      </form>

      <p className="font-satoshi text-[--earth] text-sm text-center mt-6">
        Already have an account?{' '}
        <Link
          href={rawNext ? `/auth/login?next=${encodeURIComponent(nextPath)}` : '/auth/login'}
          className="text-[--honey-600] font-medium hover:text-[--honey-700] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

// -----------------------------------------------------------------------------
// Error mapping — DUPLICATE_USER surfaces on the specific field.
// -----------------------------------------------------------------------------

function handleRegisterError(
  err: unknown,
  setError: (
    name: keyof RegisterFormValues,
    error: { type: string; message: string },
  ) => void,
  setFormError: (s: string) => void,
): void {
  const e = err as { code?: string; message?: string; field?: 'email' | 'phone' };
  const code = e?.code;

  if (code === 'DUPLICATE_USER') {
    if (e.field === 'email') {
      setError('email', { type: 'server', message: 'This email is already registered.' });
      return;
    }
    if (e.field === 'phone') {
      setError('phone', { type: 'server', message: 'This phone number is already registered.' });
      return;
    }
    setFormError('An account with these details already exists.');
    return;
  }

  if (code === 'RATE_LIMITED') {
    setFormError('Too many attempts. Please wait a moment and try again.');
    return;
  }

  setFormError(e?.message ?? 'Registration failed. Please try again.');
}

// -----------------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[--cream]" aria-hidden />}>
      <RegisterForm />
    </Suspense>
  );
}
