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
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-bark bg-white focus:outline-none transition-colors ${
      hasError ? 'border-terracotta/50 focus:border-terracotta' : 'border-sand focus:border-honey-400'
    }`;

  return (
    <div>
      <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-6">Profile</h2>

      <div className="bg-white rounded-2xl border border-sand p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div>
            <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">Full Name</label>
            <input {...register('name')} className={inputClass(!!errors.name)} />
            {errors.name && <p className="font-satoshi text-terracotta text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-sand rounded-lg px-4 py-3 text-sm font-satoshi text-earth-light bg-cream-warm cursor-not-allowed"
            />
            <p className="font-satoshi text-earth-light text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              className={inputClass(!!errors.phone)}
              placeholder="9876543210"
            />
            {errors.phone && <p className="font-satoshi text-terracotta text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {error && (
            <div className="bg-terracotta-light border border-terracotta/20 rounded-lg px-4 py-3">
              <p className="font-satoshi text-terracotta text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 font-satoshi font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors ${
              saved
                ? 'bg-sage text-white'
                : 'bg-honey-400 hover:bg-honey-500 text-midnight'
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
