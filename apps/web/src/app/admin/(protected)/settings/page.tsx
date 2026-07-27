'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Truck, CreditCard, Users } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const TABS = [
  { href: '/admin/settings', label: 'General', icon: Settings },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/settings/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/settings/team', label: 'Team', icon: Users },
];

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';

interface SettingsForm {
  siteName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  announcementBar: string;
  announcementBarActive: boolean;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  metaTitle: string;
  metaDescription: string;
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<SettingsForm>({
    siteName:             'SUMOSTA',
    tagline:              "Nature's Golden Promise",
    supportEmail:         'support@sumosta.com',
    supportPhone:         '',
    maintenanceMode:      false,
    announcementBar:      '',
    announcementBarActive: true,
    instagram:            '',
    facebook:             '',
    twitter:              '',
    youtube:              '',
    metaTitle:            '',
    metaDescription:      '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/settings`, { headers: authHeaders() });
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setForm({
        siteName:             s.siteName              ?? 'SUMOSTA',
        tagline:              s.tagline               ?? '',
        supportEmail:         s.supportEmail          ?? '',
        supportPhone:         s.supportPhone          ?? '',
        maintenanceMode:      s.maintenanceMode       ?? false,
        announcementBar:      s.announcementBar       ?? '',
        announcementBarActive: s.announcementBarActive ?? true,
        instagram:            s.socialLinks?.instagram ?? '',
        facebook:             s.socialLinks?.facebook  ?? '',
        twitter:              s.socialLinks?.twitter   ?? '',
        youtube:              s.socialLinks?.youtube   ?? '',
        metaTitle:            s.seo?.metaTitle         ?? '',
        metaDescription:      s.seo?.metaDescription   ?? '',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          siteName:             form.siteName,
          tagline:              form.tagline,
          supportEmail:         form.supportEmail,
          supportPhone:         form.supportPhone,
          maintenanceMode:      form.maintenanceMode,
          announcementBar:      form.announcementBar,
          announcementBarActive: form.announcementBarActive,
          socialLinks: {
            instagram: form.instagram,
            facebook:  form.facebook,
            twitter:   form.twitter,
            youtube:   form.youtube,
          },
          seo: {
            metaTitle:       form.metaTitle,
            metaDescription: form.metaDescription,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save settings');
      return json;
    },
    onSuccess: () => {
      setSaved(true);
      setSaveError('');
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: any) => {
      setSaveError(e.message);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

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

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-satoshi text-gray-800 font-semibold">General</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Store Name</label>
              <input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className={inputClass}
                placeholder="Nature's Golden Promise"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Support Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Support Phone</label>
              <input
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className={inputClass}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
              className="accent-honey-400 w-4 h-4"
            />
            <span className="font-satoshi text-gray-700 text-sm">Maintenance Mode (storefront shows maintenance page)</span>
          </label>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-satoshi text-gray-800 font-semibold">Announcement Bar</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.announcementBarActive}
                onChange={(e) => setForm({ ...form, announcementBarActive: e.target.checked })}
                className="accent-honey-400 w-4 h-4"
              />
              <span className="font-satoshi text-gray-600 text-sm">Active</span>
            </label>
          </div>
          <input
            value={form.announcementBar}
            onChange={(e) => setForm({ ...form, announcementBar: e.target.value })}
            className={inputClass}
            placeholder="Free delivery on orders above ₹499 | Use WELCOME10 for 10% off"
          />
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-satoshi text-gray-800 font-semibold">Social Links</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'instagram', label: 'Instagram URL' },
              { key: 'facebook',  label: 'Facebook URL'  },
              { key: 'twitter',   label: 'Twitter URL'   },
              { key: 'youtube',   label: 'YouTube URL'   },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputClass}
                  placeholder={`https://${key}.com/sumosta`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-satoshi text-gray-800 font-semibold">SEO Defaults</h2>
          <div>
            <label className={labelClass}>Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              className={inputClass}
              placeholder="SUMOSTA — Pure Wild Forest Honey"
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Single-origin wild forest honeys from India's most pristine ecosystems."
            />
          </div>
        </div>

        {saveError && <p className="font-satoshi text-red-500 text-sm">{saveError}</p>}

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-2 font-satoshi font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-honey-400 hover:bg-honey-500 text-midnight'
          }`}
        >
          {saveMutation.isPending && <HoneycombLoader size="sm" />}
          {saved ? 'Saved!' : saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
