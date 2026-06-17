'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, HONEY_EASE_OUT } from '@/lib/animations';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-sm"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 font-satoshi text-earth text-sm hover:text-bark transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="bg-white rounded-2xl border border-sand p-8 shadow-sm">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: HONEY_EASE_OUT }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-honey-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-honey-500" />
              </div>
              <h2 className="font-satoshi text-gray-800 font-semibold text-lg mb-2">Check your email</h2>
              <p className="font-satoshi text-earth text-sm leading-relaxed">
                We sent a password reset link to{' '}
                <span className="font-medium text-bark">{getValues('email')}</span>
              </p>
              <p className="font-satoshi text-earth-light text-xs mt-4">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-honey-500 hover:text-honey-600 underline"
                >
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <>
              <h1 className="font-satoshi text-gray-800 font-semibold text-lg mb-2">Forgot password?</h1>
              <p className="font-satoshi text-earth text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-bark focus:outline-none transition-colors ${
                      errors.email ? 'border-terracotta/50 focus:border-terracotta' : 'border-sand focus:border-honey-400'
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="font-satoshi text-terracotta text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-terracotta-light border border-terracotta/20 rounded-lg px-4 py-3">
                    <p className="font-satoshi text-terracotta text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-60 text-midnight font-satoshi font-semibold text-sm py-3 rounded-lg transition-colors"
                >
                  {submitting ? <HoneycombLoader size="sm" /> : null}
                  {submitting ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
