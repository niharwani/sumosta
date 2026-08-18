'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { useAuthStore } from '@/stores/auth-store';
import { authApi, ApiError } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // "google:..." (Google OAuth signups) and "guest:..." (auto-created guest
  // checkout accounts) are synthetic placeholders in the DB; never display them.
  const isSyntheticPhone = user?.phone ? /^(google|guest):/i.test(user.phone) : false;
  const defaultPhone = isSyntheticPhone ? '' : user?.phone ?? '';

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      name: user?.name ?? '',
      phone: defaultPhone,
    },
  });

  useEffect(() => {
    if (user) {
      const phone = user.phone && /^(google|guest):/i.test(user.phone) ? '' : user.phone ?? '';
      reset({ name: user.name ?? '', phone });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError('');
    try {
      const payload: { name?: string; phone?: string } = { name: data.name };
      if (data.phone !== undefined && data.phone !== '') payload.phone = data.phone;
      const res = await authApi.updateProfile(payload);
      if (res?.user) setUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setFormError('phone', {
            type: 'server',
            message: 'This phone number is already registered to another account.',
          });
        } else {
          setError(e.message || 'Failed to save changes.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-[--charcoal] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--honey-400] transition-colors min-h-[44px] ${
      hasError ? 'border-[--terracotta] focus:border-[--terracotta]' : 'border-[--sand] focus:border-[--honey-400]'
    }`;

  return (
    <div>
      <h1 className="font-clash text-[--charcoal] font-semibold text-2xl md:text-3xl mb-6">
        Profile
      </h1>

      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div>
            <label
              htmlFor="profile-name"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className={inputClass(!!errors.name)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'profile-name-err' : undefined}
            />
            {errors.name && (
              <p id="profile-name-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              disabled
              autoComplete="email"
              className="w-full border border-[--sand] rounded-lg px-4 py-3 text-sm font-satoshi text-[--earth-light] bg-[--cream] cursor-not-allowed min-h-[44px]"
            />
            <p className="font-satoshi text-[--earth] text-xs mt-1">
              Need to change your email?{' '}
              <Link href="/contact" className="text-[--honey-600] hover:text-[--honey-500] underline">
                Contact support
              </Link>
              .
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              {...register('phone')}
              className={inputClass(!!errors.phone)}
              placeholder="9876543210"
              aria-invalid={!!errors.phone}
              aria-describedby={
                errors.phone
                  ? 'profile-phone-err'
                  : isSyntheticPhone
                  ? 'profile-phone-hint'
                  : undefined
              }
            />
            {errors.phone ? (
              <p id="profile-phone-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                {errors.phone.message}
              </p>
            ) : isSyntheticPhone ? (
              <p id="profile-phone-hint" className="font-satoshi text-[--earth] text-xs mt-1">
                Add your mobile number to enable order tracking updates.
              </p>
            ) : null}
          </div>

          {error && (
            <div className="bg-[--terracotta-light] border border-[--terracotta]/30 rounded-lg px-4 py-3">
              <p className="font-satoshi text-[--terracotta] text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm px-6 py-2.5 min-h-[44px] rounded-full transition-colors bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <HoneycombLoader size="sm" /> : null}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <AnimatePresence>
              {saved && (
                <motion.span
                  role="status"
                  aria-live="polite"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 4 }}
                  transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
                  className="inline-flex items-center gap-1.5 font-satoshi text-xs font-medium text-[--sage] bg-[--sage-light] px-3 py-1.5 rounded-full"
                >
                  <Check size={14} aria-hidden /> Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}
