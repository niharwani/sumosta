'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck, Package, Settings, Save, Check, PlugZap, MapPin,
  RefreshCw, CheckCircle2, XCircle,
} from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const TABS = [
  { href: '/admin/settings', label: 'General',  icon: Settings },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
];

const inputClass =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';
const helpClass  = 'font-satoshi text-gray-400 text-xs mt-1';

interface DefaultPackage {
  length:  number;
  breadth: number;
  height:  number;
  weight:  number;
}

interface ShippingForm {
  freeShippingThreshold: number;
  defaultShippingRate:   number;
  pickupLocation:        string;
  defaultPackage:        DefaultPackage;
}

interface ShippingStatusResponse {
  configured:          boolean;
  connected:           boolean;
  email:               string;
  pickupLocation:      string;
  lastAuthenticatedAt: string | null;
  error:               string | null;
}

interface PickupLocation {
  nickname: string;
  name:     string;
  city:     string;
  state:    string;
  pincode:  string;
  phone:    string;
}

const FALLBACK_PACKAGE: DefaultPackage = {
  length: 15, breadth: 12, height: 30, weight: 100,
};

export default function AdminShippingPage() {
  const pathname = usePathname();
  const qc       = useQueryClient();

  const [form, setForm] = useState<ShippingForm>({
    freeShippingThreshold: 499,
    defaultShippingRate:   49,
    pickupLocation:        'Primary',
    defaultPackage:        FALLBACK_PACKAGE,
  });
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Live pickup locations fetched on demand
  const [pickupLocations,   setPickupLocations]   = useState<PickupLocation[] | null>(null);
  const [pickupFetchError,  setPickupFetchError]  = useState('');

  // Test-connection result surface
  const [testResult, setTestResult] = useState<null | {
    ok: boolean; message: string; at: string | null;
  }>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res  = await adminFetch(`${API}/api/admin/settings`);
      const json = await res.json();
      return json;
    },
  });

  const statusQuery = useQuery<ShippingStatusResponse>({
    queryKey: ['admin-shipping-status'],
    queryFn: async () => {
      const res  = await adminFetch(`${API}/api/admin/shipping/status`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load shipping status');
      return json.data as ShippingStatusResponse;
    },
    // Only run once on mount — admin can re-test with the button.
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const s = settingsQuery.data?.data;
    if (!s) return;
    setForm({
      freeShippingThreshold: s.freeShippingThreshold ?? 499,
      defaultShippingRate:   s.defaultShippingRate   ?? 49,
      pickupLocation:        s.pickupLocation        ?? 'Primary',
      defaultPackage: {
        length:  s.defaultPackage?.length  ?? FALLBACK_PACKAGE.length,
        breadth: s.defaultPackage?.breadth ?? FALLBACK_PACKAGE.breadth,
        height:  s.defaultPackage?.height  ?? FALLBACK_PACKAGE.height,
        weight:  s.defaultPackage?.weight  ?? FALLBACK_PACKAGE.weight,
      },
    });
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`${API}/api/admin/settings/shipping`, {
        method: 'PUT',
        body: JSON.stringify({
          freeShippingThreshold: form.freeShippingThreshold,
          defaultShippingRate:   form.defaultShippingRate,
          pickupLocation:        form.pickupLocation.trim(),
          defaultPackage:        form.defaultPackage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      return json;
    },
    onSuccess: () => {
      setSaved(true);
      setSaveError('');
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: unknown) => {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const res  = await adminFetch(`${API}/api/admin/shipping/status`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to test connection');
      return json.data as ShippingStatusResponse;
    },
    onSuccess: (data) => {
      setTestResult({
        ok:      data.connected,
        message: data.connected
          ? 'Connected to Shiprocket'
          : (data.error ?? 'Authentication failed'),
        at:      data.lastAuthenticatedAt,
      });
      qc.setQueryData(['admin-shipping-status'], data);
    },
    onError: (err: unknown) => {
      setTestResult({
        ok:      false,
        message: err instanceof Error ? err.message : 'Failed to test connection',
        at:      null,
      });
    },
  });

  const fetchPickupsMutation = useMutation({
    mutationFn: async () => {
      const res  = await adminFetch(`${API}/api/admin/shipping/pickup-locations`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch pickup locations');
      return json.data as PickupLocation[];
    },
    onSuccess: (data) => {
      setPickupLocations(data);
      setPickupFetchError('');
    },
    onError: (err: unknown) => {
      setPickupFetchError(err instanceof Error ? err.message : 'Failed to fetch pickup locations');
      setPickupLocations(null);
    },
  });

  if (settingsQuery.isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  const status = statusQuery.data;

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-satoshi text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} /> {label}
            </Link>
          );
        })}
      </div>

      {/* Shipping Rates */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
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
            <p className={helpClass}>Orders above this amount get free shipping</p>
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
            <p className={helpClass}>Flat rate for orders below the free threshold</p>
          </div>
        </div>

        <div className="mt-4 bg-honey-50 rounded-lg px-4 py-3">
          <p className="font-satoshi text-gray-700 text-sm">
            <span className="font-semibold">Preview:</span>{' '}
            Shipping is <span className="text-honey-600 font-medium">₹{form.defaultShippingRate}</span> for orders
            under <span className="text-honey-600 font-medium">₹{form.freeShippingThreshold}</span>.
            Orders above are <span className="text-green-600 font-medium">FREE</span>.
          </p>
        </div>
      </section>

      {/* Shiprocket Connection */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <PlugZap size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Shiprocket Connection</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Account Email</label>
            <input
              value={status?.email ?? ''}
              readOnly
              placeholder={status?.configured === false ? 'Not configured' : 'Loading…'}
              className={`${inputClass} bg-gray-50 cursor-not-allowed`}
            />
            <p className={helpClass}>Set via SHIPROCKET_EMAIL secret in Wrangler</p>
          </div>
          <div>
            <label className={labelClass}>Last Successful Auth</label>
            <input
              value={status?.lastAuthenticatedAt
                ? new Date(status.lastAuthenticatedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : '—'}
              readOnly
              className={`${inputClass} bg-gray-50 cursor-not-allowed`}
            />
            <p className={helpClass}>Updated after each successful connection test</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            className="flex items-center gap-2 font-satoshi text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-honey-400 hover:text-honey-600 transition-colors disabled:opacity-50"
          >
            {testConnectionMutation.isPending
              ? <RefreshCw size={14} className="animate-spin" />
              : <PlugZap size={14} />}
            Test Connection
          </button>

          {testResult && (
            <span className={`flex items-center gap-1.5 font-satoshi text-sm ${
              testResult.ok ? 'text-green-600' : 'text-red-500'
            }`}>
              {testResult.ok
                ? <CheckCircle2 size={14} />
                : <XCircle size={14} />}
              {testResult.message}
            </span>
          )}
        </div>

        {status?.configured === false && (
          <p className="mt-3 font-satoshi text-sm text-red-500">
            Shiprocket credentials are not configured. Set{' '}
            <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5">SHIPROCKET_EMAIL</code> and{' '}
            <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5">SHIPROCKET_PASSWORD</code>{' '}
            via <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5">wrangler secret put</code>.
          </p>
        )}
      </section>

      {/* Pickup Location */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <MapPin size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Pickup Location</h2>
        </div>

        <div>
          <label className={labelClass}>Pickup Nickname</label>
          <div className="flex gap-2">
            <input
              value={form.pickupLocation}
              onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
              className={inputClass}
              placeholder="Primary"
            />
            <button
              type="button"
              onClick={() => fetchPickupsMutation.mutate()}
              disabled={fetchPickupsMutation.isPending}
              className="shrink-0 flex items-center gap-2 font-satoshi text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-honey-400 hover:text-honey-600 transition-colors disabled:opacity-50"
            >
              {fetchPickupsMutation.isPending
                ? <RefreshCw size={14} className="animate-spin" />
                : <RefreshCw size={14} />}
              Fetch available
            </button>
          </div>
          <p className={helpClass}>
            Must exactly match the nickname saved in Shiprocket panel → Settings → Pickup Addresses
          </p>
        </div>

        {pickupFetchError && (
          <p className="mt-3 font-satoshi text-sm text-red-500">{pickupFetchError}</p>
        )}

        {pickupLocations && pickupLocations.length > 0 && (
          <div className="mt-4">
            <label className={labelClass}>Available Pickup Addresses</label>
            <select
              onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
              value={form.pickupLocation}
              className={inputClass}
            >
              {pickupLocations.map((p) => (
                <option key={p.nickname} value={p.nickname}>
                  {p.nickname}
                  {p.city ? ` — ${p.city}, ${p.state}` : ''}
                  {p.pincode ? ` (${p.pincode})` : ''}
                </option>
              ))}
            </select>
            <p className={helpClass}>{pickupLocations.length} saved location(s)</p>
          </div>
        )}

        {pickupLocations && pickupLocations.length === 0 && (
          <p className="mt-3 font-satoshi text-sm text-gray-500">
            No pickup addresses found in your Shiprocket account.
          </p>
        )}
      </section>

      {/* Default Package Dimensions */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center">
            <Package size={16} className="text-honey-500" />
          </div>
          <h2 className="font-satoshi text-gray-800 font-semibold">Default Package Dimensions</h2>
        </div>

        <p className="font-satoshi text-gray-500 text-sm mb-4">
          Used when a product row is missing dimensions, and as the maximum stack height
          per parcel when packing multi-item orders. Overflow triggers additional boxes.
        </p>

        <div className="grid grid-cols-4 gap-4">
          {(['length','breadth','height'] as const).map((key) => (
            <div key={key}>
              <label className={labelClass}>
                {key[0].toUpperCase() + key.slice(1)} (cm)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={form.defaultPackage[key]}
                onChange={(e) => setForm({
                  ...form,
                  defaultPackage: { ...form.defaultPackage, [key]: Number(e.target.value) },
                })}
                className={inputClass}
              />
            </div>
          ))}
          <div>
            <label className={labelClass}>Weight (g)</label>
            <input
              type="number"
              min={1}
              max={50000}
              value={form.defaultPackage.weight}
              onChange={(e) => setForm({
                ...form,
                defaultPackage: { ...form.defaultPackage, weight: Number(e.target.value) },
              })}
              className={inputClass}
            />
          </div>
        </div>

        <p className={`${helpClass} mt-2`}>
          Height also serves as the maximum stack height per box. Items taller than this get
          split across additional parcels.
        </p>
      </section>

      {saveError && <p className="font-satoshi text-red-500 text-sm">{saveError}</p>}

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
