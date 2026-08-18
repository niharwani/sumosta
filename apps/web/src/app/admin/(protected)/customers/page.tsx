'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Link from 'next/link';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const res = await adminFetch(`${API}/api/admin/customers?${params}`);
      return res.json();
    },
  });

  const customers = data?.data?.customers ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Customer', 'Phone', 'Joined', 'Orders', 'Total Spent', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-satoshi text-gray-800 text-sm font-medium">{c.name}</div>
                      <div className="font-satoshi text-gray-400 text-xs">{c.email}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">{c.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-700 text-sm">{c.order_count ?? 0}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-medium">
                    {formatPrice(c.total_spent ?? 0)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-satoshi text-xs text-honey-600 hover:text-honey-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-satoshi text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
