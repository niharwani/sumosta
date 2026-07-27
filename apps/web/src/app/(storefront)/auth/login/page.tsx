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
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-jakarta font-bold text-charcoal text-3xl mb-2">Welcome Back</h1>
          <p className="font-jakarta text-gray-600 text-sm">Sign in to your SUMOSTA account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input {...register('password')} type="password" placeholder="Your password" className={inputClass} />
            </Field>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="font-jakarta text-[#F97316] text-xs hover:text-[#EA580C]">
                Forgot password?
              </Link>
            </div>

            {error && <p className="font-jakarta text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-pill-orange disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="font-jakarta text-gray-600 text-sm text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#F97316] font-medium hover:text-[#EA580C]">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-jakarta text-charcoal text-xs font-medium block mb-1.5">{label}</label>
      {children}
      {error && <p className="font-jakarta text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full border border-[#E5E7EB] rounded-lg px-4 py-3 font-jakarta text-sm text-charcoal bg-white focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all';
