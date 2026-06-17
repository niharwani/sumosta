'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      if (json.data?.user?.role !== 'admin' && json.data?.user?.role !== 'superadmin') {
        throw new Error('Access denied — admin accounts only');
      }
      localStorage.setItem('sumosta_access_token', json.data.accessToken);
      localStorage.setItem('sumosta_refresh_token', json.data.refreshToken);
      router.push('/admin');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-gray-700 focus:outline-none transition-colors ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-honey-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-satoshi text-midnight font-bold text-xl tracking-wide">SUMOSTA</span>
          <p className="font-satoshi text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="font-satoshi text-gray-800 font-semibold text-lg mb-6">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-satoshi text-gray-700 text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className={inputClass(!!errors.email)}
                placeholder="admin@sumosta.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="font-satoshi text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block font-satoshi text-gray-700 text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`${inputClass(!!errors.password)} pr-11`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="font-satoshi text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <p className="font-satoshi text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-midnight font-satoshi font-semibold text-sm py-3 rounded-lg transition-colors mt-2"
            >
              {submitting ? <HoneycombLoader size="sm" /> : null}
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
