'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { authApi } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

const schema = z
  .object({
    password:        z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
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

type FormValues = z.infer<typeof schema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const reduce = useReducedMotion();

  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (data: FormValues) => {
    setError('');
    setTokenExpired(false);
    try {
      await authApi.resetPassword({ token, password: data.password });
      setDone(true);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_TOKEN') {
        setTokenExpired(true);
        return;
      }
      setError(e.message ?? 'Something went wrong. Please try again.');
    }
  };

  // Token failed — show recovery affordance.
  if (tokenExpired) {
    return (
      <AuthCard
        title="Reset link expired"
        subtitle="This password reset link is no longer valid. Reset links expire after a short time for your security."
        back={{ href: '/auth/login', label: 'Back to sign in' }}
        size="sm"
      >
        <Link
          href="/auth/forgot-password"
          className="block w-full text-center rounded-full bg-[--honey-400] text-[--charcoal] font-satoshi font-semibold text-sm px-6 py-3 hover:bg-[--honey-500] transition-colors shadow-[0_8px_30px_rgba(245,166,35,0.2)]"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  // Success state.
  if (done) {
    return (
      <AuthCard title="Password updated" size="sm">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.96 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={reduce ? undefined : { duration: 0.5, ease: HONEY_EASE_OUT }}
          className="text-center py-2"
        >
          <div className="w-16 h-16 bg-[--sage-light] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={30} className="text-[--sage]" aria-hidden="true" />
          </div>
          <p className="font-satoshi text-[--bark] text-sm leading-relaxed mb-6">
            Your password has been updated. You can now sign in with your new password.
          </p>

          <Link
            href="/auth/login"
            className="block w-full text-center rounded-full bg-[--honey-400] text-[--charcoal] font-satoshi font-semibold text-sm px-6 py-3 hover:bg-[--honey-500] transition-colors shadow-[0_8px_30px_rgba(245,166,35,0.2)]"
          >
            Sign in
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  // Default: form.
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Pick something strong and memorable — at least 8 characters."
      back={{ href: '/auth/login', label: 'Back to sign in' }}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <AuthField
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <AuthField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-[--terracotta-light] bg-[--terracotta-light]/60 px-4 py-3"
          >
            <p className="font-satoshi text-[--terracotta] text-sm">{error}</p>
          </div>
        ) : null}

        <AuthSubmitButton loading={isSubmitting} loadingLabel="Updating…">
          Update password
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
