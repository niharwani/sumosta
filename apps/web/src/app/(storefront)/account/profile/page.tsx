'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { useAuthStore } from '@/stores/auth-store';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('sumosta_access_token');
      const res = await fetch(`${API}/api/auth/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      setUser(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-jakarta text-charcoal bg-white focus:outline-none transition-colors ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#F97316]'
    }`;

  return (
    <div>
      <h2 className="font-jakarta text-charcoal font-semibold text-lg mb-6">Profile</h2>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div>
            <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">Full Name</label>
            <input {...register('name')} className={inputClass(!!errors.name)} />
            {errors.name && <p className="font-jakarta text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm font-jakarta text-gray-400 bg-[#FAF7F2] cursor-not-allowed"
            />
            <p className="font-jakarta text-gray-400 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              className={inputClass(!!errors.phone)}
              placeholder="9876543210"
            />
            {errors.phone && <p className="font-jakarta text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="font-jakarta text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 font-jakarta font-semibold text-sm px-6 py-2.5 rounded-full transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
            } disabled:opacity-60`}
          >
            {saving ? <HoneycombLoader size="sm" /> : saved ? <Check size={15} /> : null}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
