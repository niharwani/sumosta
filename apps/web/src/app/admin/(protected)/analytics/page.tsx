'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
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
      const res   = await fetch(`${API}/api/admin/analytics/overview?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}

function useSales(period = '30d') {
  return useQuery({
    queryKey: ['admin-analytics-sales', period],
    queryFn: async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const res   = await fetch(`${API}/api/admin/analytics/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}

function useFunnel(period = '30d') {
  return useQuery({
    queryKey: ['admin-analytics-funnel', period],
    queryFn: async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const res   = await fetch(`${API}/api/admin/analytics/funnel?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  const { data: overviewData, isLoading: overviewLoading } = useAnalytics(period);
  const { data: salesData }   = useSales(period);
  const { data: funnelData }  = useFunnel(period);

  const stats  = overviewData?.data;
  const sales  = salesData?.data;
  const funnel = funnelData?.data;

  if (overviewLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  const maxFunnel = funnel?.funnel?.[0]?.count ?? 1;

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

      {/* KPIs — API returns changePct */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Revenue"    value={formatPrice(stats?.revenue?.current ?? 0)}            change={stats?.revenue?.changePct} />
        <StatsCard title="Orders"     value={String(stats?.orders?.current ?? 0)}                  change={stats?.orders?.changePct} />
        <StatsCard title="AOV"        value={formatPrice(stats?.aov?.current ?? 0)}                change={stats?.aov?.changePct} />
        <StatsCard title="Conversion" value={`${(stats?.conversionRate?.current ?? 0).toFixed(1)}%`} change={stats?.conversionRate?.changePct} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats?.revenueChart ?? []}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products */}
        {sales?.topProducts?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Top Products by Revenue</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sales.topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8B7355' }} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#5C4A32' }} width={120} />
                <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#F5A623" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversion funnel */}
        {funnel?.funnel && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Conversion Funnel</h2>
            <div className="space-y-3">
              {funnel.funnel.map((step: any) => (
                <div key={step.step}>
                  <div className="flex justify-between font-satoshi text-sm mb-1">
                    <span className="text-gray-700">{step.step}</span>
                    <span className="text-gray-500">{step.count.toLocaleString('en-IN')} <span className="text-gray-400 text-xs">({step.pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-honey-400 rounded-full transition-all duration-500"
                      style={{ width: `${(step.count / maxFunnel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="font-satoshi text-gray-400 text-xs">Cart Abandonment</p>
                <p className="font-satoshi text-red-500 font-semibold">{funnel.cartAbandonmentRate}%</p>
              </div>
              <div>
                <p className="font-satoshi text-gray-400 text-xs">Checkout Abandonment</p>
                <p className="font-satoshi text-orange-500 font-semibold">{funnel.checkoutAbandonmentRate}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue by category */}
      {sales?.byCategory?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-800 font-semibold mb-4">Revenue by Category</h2>
          <div className="space-y-2">
            {sales.byCategory.map((cat: any) => {
              const total = sales.byCategory.reduce((s: number, c: any) => s + c.revenue, 0);
              const pct   = total > 0 ? Math.round((cat.revenue / total) * 100) : 0;
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="font-satoshi text-gray-700 text-sm w-36 truncate">{cat.category}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-honey-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-satoshi text-gray-600 text-sm w-24 text-right">{formatPrice(cat.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
