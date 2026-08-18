'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Truck, Package, Clock, Save, Check } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const inputClass =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';

interface ShippingForm {
  freeShippingThreshold: number;
  defaultShippingRate:   number;
  announcementBar:       string;
  announcementBarActive: boolean;
  supportPhone:          string;
  supportEmail:          string;
}

export default function AdminShippingPage() {
  const [form, setForm]     = useState<ShippingForm>({
    freeShippingThreshold: 500,
    defaultShippingRate:   60,
    announcementBar:       'Free shipping on orders over ₹500 🍯',
    announcementBarActive: true,
    supportPhone:          '',
    supportEmail:          'support@sumosta.com',
  });
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/settings`);
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setForm({
        freeShippingThreshold: s.freeShippingThreshold ?? 500,
        defaultShippingRate:   s.defaultShippingRate   ?? 60,
        announcementBar:       s.announcementBar        ?? 'Free shipping on orders over ₹500 🍯',
        announcementBarActive: s.announcementBarActive  ?? true,
        supportPhone:          s.supportPhone           ?? '',
        supportEmail:          s.supportEmail           ?? 'support@sumosta.com',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Shipping Rates */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <Truck size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Shipping Rates</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
              className={inputClass}
              min={0}
            />
            <p className="font-satoshi text-gray-400 text-xs mt-1">
              Orders above this amount get free shipping
            </p>
          </div>
          <div>
            <label className={labelClass}>Default Shipping Rate (₹)</label>
            <input
              type="number"
              value={form.defaultShippingRate}
              onChange={(e) => setForm({ ...form, defaultShippingRate: Number(e.target.value) })}
              className={inputClass}
              min={0}
            />
            <p className="font-satoshi text-gray-400 text-xs mt-1">
              Flat rate for orders below the free threshold
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 bg-honey-50 rounded-lg px-4 py-3">
          <p className="font-satoshi text-gray-700 text-sm">
            <span className="font-semibold">Preview:</span>{' '}
            Shipping is <span className="text-honey-600 font-medium">₹{form.defaultShippingRate}</span> for orders
            under <span className="text-honey-600 font-medium">₹{form.freeShippingThreshold}</span>.
            Orders above are <span className="text-green-600 font-medium">FREE</span>.
          </p>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <Package size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Announcement Bar</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Announcement Text</label>
            <input
              value={form.announcementBar}
              onChange={(e) => setForm({ ...form, announcementBar: e.target.value })}
              className={inputClass}
              placeholder="Free shipping on orders over ₹500 🍯"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, announcementBarActive: !form.announcementBarActive })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.announcementBarActive ? 'bg-honey-400' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.announcementBarActive ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <label className="font-satoshi text-gray-700 text-sm cursor-pointer"
              onClick={() => setForm({ ...form, announcementBarActive: !form.announcementBarActive })}>
              {form.announcementBarActive ? 'Bar is visible on storefront' : 'Bar is hidden'}
            </label>
          </div>
        </div>
      </div>

      {/* Support Contact */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <Clock size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Customer Support</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Support Email</label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className={inputClass}
              placeholder="support@sumosta.com"
            />
          </div>
          <div>
            <label className={labelClass}>Support Phone</label>
            <input
              type="tel"
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className={inputClass}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-2 font-satoshi font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-honey-400 hover:bg-honey-500 text-midnight disabled:opacity-50'
          }`}
        >
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saveMutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
