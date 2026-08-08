'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
import { Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { authApi } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';

const SUBMIT_COOLDOWN_MS = 30_000;

export default function ForgotPasswordPage() {
  const reduce = useReducedMotion();

  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [error, setError] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number>(0);
  const [now, setNow] = useState<number>(() => Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  // 1s ticker so the "wait N seconds" copy updates without user interaction.
  useEffect(() => {
    if (cooldownEndsAt <= now) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cooldownEndsAt, now]);

  const cooldownRemaining = Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000));
  const isCoolingDown = cooldownRemaining > 0;

  const onSubmit = async (data: ForgotPasswordInput) => {
    if (isCoolingDown) return;

    setError('');
    try {
      await authApi.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setSent(true);
      setCooldownEndsAt(Date.now() + SUBMIT_COOLDOWN_MS);
      setNow(Date.now());
    } catch (err) {
      const e = err as { code?: string; message?: string; retryAfter?: number };
      if (e.code === 'RATE_LIMITED') {
        const seconds = Number(e.retryAfter) > 0 ? Math.ceil(Number(e.retryAfter)) : 30;
        setCooldownEndsAt(Date.now() + seconds * 1000);
        setNow(Date.now());
        setError(`Too many attempts. Try again in ${seconds}s.`);
        return;
      }
      setError(e.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <AuthCard
      title={sent ? 'Check your email' : 'Reset your password'}
      subtitle={
        sent
          ? undefined
          : 'Enter your email address and we’ll send you a link to reset your password.'
      }
      back={{ href: '/auth/login', label: 'Back to sign in' }}
      size="sm"
    >
      {sent ? (
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.96 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1 }}
          transition={reduce ? undefined : { duration: 0.5, ease: HONEY_EASE_OUT }}
          className="text-center py-2"
        >
          <div className="w-16 h-16 bg-[--honey-100] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={26} className="text-[--honey-500]" aria-hidden="true" />
          </div>
          <p className="font-satoshi text-[--bark] text-sm leading-relaxed">
            We sent a password reset link to{' '}
            <span className="font-medium text-[--charcoal]">{sentEmail}</span>.
          </p>
          <p className="font-satoshi text-[--earth] text-xs mt-4">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => {
                if (isCoolingDown) return;
                setSent(false);
              }}
              disabled={isCoolingDown}
              className="text-[--honey-600] hover:text-[--honey-700] underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCoolingDown ? `try again in ${cooldownRemaining}s` : 'try again'}
            </button>
            .
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <AuthField
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-[--terracotta-light] bg-[--terracotta-light]/60 px-4 py-3"
            >
              <p className="font-satoshi text-[--terracotta] text-sm">{error}</p>
            </div>
          ) : null}

          <AuthSubmitButton
            loading={isSubmitting}
            disabled={isCoolingDown}
            loadingLabel="Sending…"
          >
            {isCoolingDown ? `Try again in ${cooldownRemaining}s` : 'Send reset link'}
          </AuthSubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
