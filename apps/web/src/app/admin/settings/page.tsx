'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Truck, CreditCard, Users } from 'lucide-react';

const TABS = [
  { href: '/admin/settings', label: 'General', icon: Settings },
  { href: '/admin/settings/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/settings/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings/team', label: 'Team', icon: Users },
];

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    store_name: 'SUMOSTA',
    store_email: 'hello@sumosta.com',
    store_phone: '',
    store_address: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-50 rounded-xl p-1">
        {TABS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-satoshi text-sm font-medium transition-colors bg-white text-gray-800 shadow-sm"
          >
            <Icon size={14} /> {label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-satoshi text-gray-800 font-semibold">General Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Store Name</label>
            <input
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputClass}
            >
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Contact Email</label>
          <input
            type="email"
            value={form.store_email}
            onChange={(e) => setForm({ ...form, store_email: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Contact Phone</label>
          <input
            value={form.store_phone}
            onChange={(e) => setForm({ ...form, store_phone: e.target.value })}
            className={inputClass}
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className={labelClass}>Store Address</label>
          <textarea
            value={form.store_address}
            onChange={(e) => setForm({ ...form, store_address: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="123 Honey Lane, Mumbai, Maharashtra 400001"
          />
        </div>

        <div>
          <label className={labelClass}>Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className={inputClass}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className={`font-satoshi font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-honey-400 hover:bg-honey-500 text-midnight'
          }`}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
