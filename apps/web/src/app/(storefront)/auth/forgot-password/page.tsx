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
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-sm"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 font-jakarta text-gray-600 text-sm hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: HONEY_EASE_OUT }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-[#F97316]" />
              </div>
              <h2 className="font-jakarta font-semibold text-charcoal text-lg mb-2">Check your email</h2>
              <p className="font-jakarta text-gray-600 text-sm leading-relaxed">
                We sent a password reset link to{' '}
                <span className="font-medium text-charcoal">{getValues('email')}</span>
              </p>
              <p className="font-jakarta text-gray-400 text-xs mt-4">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#F97316] hover:text-[#EA580C] underline"
                >
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <>
              <h1 className="font-jakarta font-semibold text-charcoal text-lg mb-2">Forgot password?</h1>
              <p className="font-jakarta text-gray-600 text-sm mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full border rounded-lg px-4 py-3 text-sm font-jakarta text-charcoal focus:outline-none transition-colors ${
                      errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#F97316]'
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="font-jakarta text-red-600 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="font-jakarta text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 btn-pill-orange disabled:opacity-60"
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
