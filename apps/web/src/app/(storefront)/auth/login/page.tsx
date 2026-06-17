'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from 'shared';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    try {
      const res = await authApi.login(data);
      login(res.user, res.accessToken, res.refreshToken);
      router.push('/account/orders');
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-clash text-charcoal font-bold text-3xl mb-2">Welcome Back</h1>
          <p className="font-satoshi text-earth text-sm">Sign in to your SUMOSTA account</p>
        </div>

        <div className="bg-cream-warm rounded-2xl p-8 border border-sand">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input {...register('password')} type="password" placeholder="Your password" className={inputClass} />
            </Field>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="font-satoshi text-honey-500 text-xs hover:text-honey-600">
                Forgot password?
              </Link>
            </div>

            {error && <p className="font-satoshi text-terracotta text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-honey-400 text-midnight font-satoshi font-semibold py-3.5 rounded-md hover:bg-honey-500 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="font-satoshi text-earth text-sm text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-honey-500 font-medium hover:text-honey-600">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-satoshi text-charcoal text-xs font-medium block mb-1.5">{label}</label>
      {children}
      {error && <p className="font-satoshi text-terracotta text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full border border-sand rounded-md px-4 py-3 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-100 transition-all';
