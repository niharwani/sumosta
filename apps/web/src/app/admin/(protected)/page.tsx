'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '@/components/admin/StatsCard';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

function useDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;
      const res = await fetch(`${API}/api/admin`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
      if (!res.ok) throw new Error('FETCH_ERROR');
      const data = await res.json();
      return data.data;
    },
    retry: false,
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => {
    if ((error as Error)?.message === 'UNAUTHORIZED') {
      router.push('/admin/login');
    }
  }, [error, router]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-gray-500 mb-3">Could not load dashboard.</p>
        <p className="font-satoshi text-gray-400 text-sm">Make sure you&apos;re logged in as admin.</p>
      </div>
    );
  }

  const { today = {}, yesterday = {}, recentOrders = [], lowStockProducts = [], revenueChart = [] } = data ?? {};

  const change = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Revenue Today"
          value={formatPrice(today?.revenue ?? 0)}
          change={change(today?.revenue, yesterday?.revenue)}
        />
        <StatsCard
          title="Orders Today"
          value={String(today?.orders ?? 0)}
          change={change(today?.orders, yesterday?.orders)}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatPrice(today?.aov ?? 0)}
          change={change(today?.aov, yesterday?.aov)}
        />
        <StatsCard
          title="Visitors Today"
          value={String(today?.visitors ?? 0)}
          change={change(today?.visitors, yesterday?.visitors)}
        />
      </div>

      {/* Revenue chart — last 30 days */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-satoshi text-gray-800 font-semibold">Revenue — Last 30 Days</h2>
          <Link href="/admin/analytics" className="font-satoshi text-honey-500 text-xs hover:text-honey-600">
            Full analytics →
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueChart}>
            <defs>
              <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B7355' }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#8B7355' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2} fill="url(#honeyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-satoshi text-gray-800 font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-honey-500 text-xs font-satoshi hover:text-honey-600">
              View all →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {recentOrders.slice(0, 8).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-satoshi text-gray-800 text-sm font-medium">{order.order_number}</p>
                  <span className={`text-[10px] font-satoshi font-medium px-1.5 py-0.5 rounded-full capitalize ${
                    STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <span className="font-satoshi text-gray-800 text-sm">{formatPrice(order.total)}</span>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="font-satoshi text-gray-400 text-sm py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-satoshi text-gray-800 font-semibold">Low Stock Alerts</h2>
            <Link href="/admin/products" className="text-honey-500 text-xs font-satoshi hover:text-honey-600">
              Manage →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {lowStockProducts.slice(0, 8).map((product: any) => (
              <div key={product.id} className="flex items-center justify-between py-2.5">
                <p className="font-satoshi text-gray-800 text-sm truncate pr-4">{product.name}</p>
                <span className={`font-satoshi text-sm font-semibold shrink-0 ${
                  product.stock === 0 ? 'text-red-500' : 'text-orange-500'
                }`}>
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                </span>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="font-satoshi text-gray-400 text-sm py-4">All products well-stocked ✓</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
