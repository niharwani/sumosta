'use client';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { authApi, ApiError } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  });

type FormData = z.infer<typeof schema>;

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-[--sand]' };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const bucket = Math.min(4, Math.floor((score / 5) * 4));
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = [
    'bg-[--terracotta]',
    'bg-[--honey-300]',
    'bg-[--honey-400]',
    'bg-[--honey-500]',
    'bg-[--sage]',
  ];
  return { score: bucket + 1, label: labels[bucket], color: colors[bucket] };
}

export default function SecurityPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError: setFormError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema as never),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPasswordValue = watch('newPassword');
  const strength = useMemo(() => getStrength(newPasswordValue ?? ''), [newPasswordValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      setSuccess(true);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setFormError('currentPassword', {
            type: 'server',
            message: 'Current password is incorrect.',
          });
        } else {
          setError(e.message || 'Failed to update password.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-[--charcoal] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--honey-400] transition-colors min-h-[44px] ${
      hasError ? 'border-[--terracotta] focus:border-[--terracotta]' : 'border-[--sand] focus:border-[--honey-400]'
    }`;

  return (
    <div>
      <h1 className="font-clash text-[--charcoal] font-semibold text-2xl md:text-3xl mb-6">
        Password &amp; Security
      </h1>

      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div>
            <label
              htmlFor="current-password"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
              className={inputClass(!!errors.currentPassword)}
              aria-invalid={!!errors.currentPassword}
              aria-describedby={errors.currentPassword ? 'current-password-err' : undefined}
            />
            {errors.currentPassword && (
              <p
                id="current-password-err"
                className="font-satoshi text-[--terracotta] text-xs mt-1"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
              className={inputClass(!!errors.newPassword)}
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword ? 'new-password-err' : 'new-password-strength'
              }
            />
            {errors.newPassword && (
              <p id="new-password-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
            {newPasswordValue && !errors.newPassword && (
              <div id="new-password-strength" className="mt-2">
                <div
                  className="h-1.5 w-full bg-[--sand] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={strength.score}
                  aria-label={`Password strength: ${strength.label}`}
                >
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <p className="font-satoshi text-xs text-[--earth] mt-1">
                  Strength: <span className="text-[--charcoal] font-medium">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={inputClass(!!errors.confirmPassword)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-err' : undefined}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-err"
                className="font-satoshi text-[--terracotta] text-xs mt-1"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-[--terracotta-light] border border-[--terracotta]/30 rounded-lg px-4 py-3">
              <p className="font-satoshi text-[--terracotta] text-sm">{error}</p>
            </div>
          )}

          <AnimatePresence>
            {success && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
                className="bg-[--sage-light] border border-[--sage]/30 rounded-lg px-4 py-3 flex items-start gap-3"
              >
                <Check size={18} className="text-[--sage] mt-0.5 shrink-0" aria-hidden />
                <div>
                  <p className="font-satoshi text-sm font-semibold text-[--charcoal]">
                    Password updated
                  </p>
                  <p className="font-satoshi text-xs text-[--bark] mt-0.5">
                    You&apos;ve been signed out of other sessions.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm px-6 py-2.5 min-h-[44px] rounded-full transition-colors bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <HoneycombLoader size="sm" /> : null}
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6 md:p-8 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-[--honey-500]" aria-hidden />
          <h2 className="font-clash text-lg text-[--charcoal] m-0">Account Activity</h2>
        </div>
        <p className="font-satoshi text-sm text-[--bark]">
          Detailed sign-in history will appear here soon. If you notice suspicious activity,
          update your password right away and{' '}
          <a href="/contact" className="text-[--honey-600] hover:text-[--honey-500] underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
