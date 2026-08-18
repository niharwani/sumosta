'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices', search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20', page: String(page), payment_status: 'captured' });
      if (search) params.set('search', search);
      const res = await adminFetch(`${API}/api/admin/orders?${params}`);
      return res.json();
    },
  });

  const orders     = data?.data?.orders     ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order number or customer..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-72"
        />
        <span className="font-satoshi text-gray-400 text-sm">
          {data?.data?.total ?? 0} paid orders
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Invoice #', 'Date', 'Customer', 'Items', 'Total', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-honey-500" />
                        <span className="font-satoshi text-gray-800 text-sm font-medium">
                          INV-{order.order_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-satoshi text-gray-800 text-sm">{order.shipping_name}</p>
                      <p className="font-satoshi text-gray-400 text-xs">{order.user_email ?? 'Guest'}</p>
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/invoices/${order.id}`}
                        className="inline-flex items-center gap-1.5 font-satoshi text-xs text-honey-600 hover:text-honey-700 font-medium"
                      >
                        <Download size={12} /> View &amp; Print
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 font-satoshi text-gray-400">
                      No paid orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-satoshi text-sm text-gray-600 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-honey-300 transition-colors"
              >
                Previous
              </button>
              <span className="font-satoshi text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="font-satoshi text-sm text-gray-600 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-honey-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
