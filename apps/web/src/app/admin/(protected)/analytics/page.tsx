'use client';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts';
import StatsCard from '@/components/admin/StatsCard';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function useAnalytics(period = '30d') {
  return useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const res = await fetch(`${API}/api/admin/analytics/overview?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalytics();
  const stats = data?.data;

  if (isLoading) return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Revenue" value={formatPrice(stats?.revenue?.current ?? 0)} change={stats?.revenue?.change} />
        <StatsCard title="Orders"  value={String(stats?.orders?.current ?? 0)}       change={stats?.orders?.change} />
        <StatsCard title="AOV"     value={formatPrice(stats?.aov?.current ?? 0)}     change={stats?.aov?.change} />
        <StatsCard title="Conversion" value={`${(stats?.conversionRate?.current ?? 0).toFixed(1)}%`} change={stats?.conversionRate?.change} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats?.revenueChart ?? []}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      {stats?.topProducts?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Top Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5C4A32' }} width={150} />
              <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#F5A623" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
