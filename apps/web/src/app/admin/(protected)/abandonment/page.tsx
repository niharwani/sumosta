'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, AlertTriangle, TrendingDown } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1)  return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
];

export default function AdminAbandonmentPage() {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-abandonment', period],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/abandonment?period=${period}&limit=50`);
      return res.json();
    },
  });

  const result = data?.data;
  const carts  = result?.abandonedCarts ?? [];

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
        <div className="grid grid-cols-3 gap-4">
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

      {/* Cart list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Session', 'Last Product', 'Est. Value', 'Cart Events', 'Stage', 'Last Seen'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {carts.map((cart: any) => (
                <tr key={cart.session_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-satoshi text-gray-500 text-xs font-mono">
                      {cart.session_id.slice(0, 12)}…
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-satoshi text-gray-800 text-sm truncate max-w-[180px]">
                      {cart.last_product ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-satoshi text-gray-800 text-sm font-medium">
                      {cart.estimated_value > 0 ? formatPrice(cart.estimated_value) : '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">
                    {cart.add_to_cart_count}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-satoshi font-medium px-2.5 py-1 rounded-full ${
                      cart.reached_checkout
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {cart.reached_checkout ? 'Checkout' : 'Cart Only'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                    {timeAgo(cart.last_activity)}
                  </td>
                </tr>
              ))}
              {carts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <ShoppingCart size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="font-satoshi text-gray-400 text-sm">No abandoned carts in this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {carts.length > 0 && (
        <p className="font-satoshi text-gray-400 text-xs text-center">
          Estimated values are calculated from analytics events. Showing top {carts.length} most recent abandoned carts.
        </p>
      )}
    </div>
  );
}
