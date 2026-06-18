'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped:    'bg-blue-50 text-blue-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-red-50 text-red-700',
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, search],
    queryFn:  async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const params = new URLSearchParams({ limit: '20' });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`${API}/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const orders = data?.data?.orders ?? [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order number..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-60"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Order', 'Date', 'Customer', 'Total', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-medium">{order.order_number}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">{order.shipping_name}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-medium">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-satoshi font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-satoshi px-2 py-0.5 rounded capitalize ${order.payment_status === 'captured' ? 'text-green-600' : 'text-gray-400'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 font-satoshi text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
