'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  AlertTriangle,
  TrendingDown,
  Mail,
  Check,
  Loader2,
} from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatSentAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day:    'numeric',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

const PERIODS = [
  { value: '7d',  label: 'Last 7 days'  },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
];

interface AbandonedCart {
  session_id:        string;
  user_id:           string | null;
  email:             string | null;
  phone:             string | null;
  name:              string | null;
  last_activity:     string;
  add_to_cart_count: number;
  reached_checkout:  boolean;
  last_product:      string | null;
  cart_value:        number;
  items_count:       number;
  recovery_sent_at:  string | null;
}

export default function AdminAbandonmentPage() {
  const [period, setPeriod] = useState('7d');
  const [error, setError]   = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-abandonment', period],
    queryFn: async () => {
      const res = await adminFetch(
        `${API}/api/admin/abandonment?period=${period}&limit=50`,
      );
      return res.json();
    },
  });

  const recover = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await adminFetch(
        `${API}/api/admin/abandonment/${encodeURIComponent(sessionId)}/recover`,
        { method: 'POST' },
      );
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error ?? 'Failed to send recovery email');
      }
      return json.data as { sessionId: string; sentAt: string };
    },
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ['admin-abandonment'] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const result = data?.data;
  const carts: AbandonedCart[] = result?.abandonedCarts ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`font-satoshi text-sm px-4 py-2 rounded-lg transition-colors ${
              period === value
                ? 'bg-honey-400 text-midnight font-semibold'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-honey-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ShoppingCart size={18} className="text-red-500" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Abandoned Carts</p>
              <p className="font-satoshi text-gray-800 text-xl font-bold">{result.totalAbandoned}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Abandoned at Checkout</p>
              <p className="font-satoshi text-orange-600 text-xl font-bold">{result.abandonedAtCheckout}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <div>
              <p className="font-satoshi text-gray-400 text-xs">Abandonment Rate</p>
              <p className="font-satoshi text-red-500 text-xl font-bold">{result.abandonmentRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Send error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="font-satoshi text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Cart list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="border-b border-gray-100">
              <tr>
                {[
                  'Customer',
                  'Email',
                  'Phone',
                  'Cart Value',
                  'Items',
                  'Stage',
                  'Last Activity',
                  'Action',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {carts.map((cart) => {
                const canRecover = Boolean(cart.email);
                const pending    = recover.isPending && recover.variables === cart.session_id;
                const alreadySent = cart.recovery_sent_at !== null;
                return (
                  <tr key={cart.session_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-satoshi text-gray-800 text-sm font-medium">
                        {cart.name ?? (cart.user_id ? 'Registered' : 'Guest')}
                      </p>
                      {cart.last_product && (
                        <p className="font-satoshi text-gray-400 text-xs truncate max-w-[180px]">
                          {cart.last_product}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-satoshi text-gray-700 text-sm">
                        {cart.email ?? <span className="text-gray-300">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-satoshi text-gray-700 text-sm">
                        {cart.phone ?? <span className="text-gray-300">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-satoshi text-gray-800 text-sm font-medium">
                        {cart.cart_value > 0 ? formatPrice(cart.cart_value) : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">
                      {cart.items_count > 0 ? cart.items_count : cart.add_to_cart_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-satoshi font-medium px-2.5 py-1 rounded-full ${
                          cart.reached_checkout
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cart.reached_checkout ? 'Checkout' : 'Cart Only'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                      {timeAgo(cart.last_activity)}
                    </td>
                    <td className="px-5 py-3.5">
                      {alreadySent ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-satoshi font-medium text-green-700"
                          title={`Recovery email sent on ${formatSentAt(cart.recovery_sent_at!)}`}
                        >
                          <Check size={13} />
                          Sent {timeAgo(cart.recovery_sent_at!)}
                        </span>
                      ) : (
                        <button
                          onClick={() => recover.mutate(cart.session_id)}
                          disabled={!canRecover || pending}
                          title={canRecover ? 'Send recovery email' : 'No email on record'}
                          className={`inline-flex items-center gap-1.5 text-xs font-satoshi font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            canRecover
                              ? 'bg-honey-400 text-midnight hover:bg-honey-500'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {pending ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              Sending
                            </>
                          ) : (
                            <>
                              <Mail size={13} />
                              Send recovery
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {carts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <ShoppingCart size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="font-satoshi text-gray-400 text-sm">
                      No abandoned carts in this period
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {carts.length > 0 && (
        <p className="font-satoshi text-gray-400 text-xs text-center">
          Cart values are estimated from analytics events. Email/phone are shown when the shopper
          identified themselves at checkout or was signed in. Showing top {carts.length} most
          recent abandoned carts.
        </p>
      )}
    </div>
  );
}
