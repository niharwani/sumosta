'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FileText, Download, Loader2 } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

// Fetch the admin PDF via adminFetch (JWT header) and trigger a download.
// Kept inline because it's the only page that needs it.
async function downloadInvoicePdf(orderId: string, orderNumber: string): Promise<void> {
  const res = await adminFetch(`${API}/api/admin/orders/${orderId}/invoice.pdf`);
  if (!res.ok) throw new Error(`Failed (${res.status})`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function AdminInvoicesPage() {
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices', search, page],
    queryFn: async () => {
      // Only surface orders that actually have a receivable — i.e. paid via
      // Razorpay or COD in-flight. Failed/pending online orders are not
      // invoiceable and would pollute the list.
      const params = new URLSearchParams({
        limit:         '20',
        page:          String(page),
        paymentStatus: 'captured,pending_cod',
      });
      if (search) params.set('search', search);
      const res = await adminFetch(`${API}/api/admin/orders?${params}`);
      const json = await res.json();
      // Client-side safety filter (in case the backend doesn't honor the query yet).
      if (json?.data?.orders) {
        json.data.orders = json.data.orders.filter((o: { payment_status: string; payment_method: string | null }) =>
          o.payment_status === 'captured' ||
          (o.payment_status === 'pending' && o.payment_method === 'cod'),
        );
      }
      return json;
    },
  });

  const orders     = data?.data?.orders     ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const handleDownload = async (orderId: string, orderNumber: string) => {
    setDownloadingId(orderId);
    try {
      await downloadInvoicePdf(orderId, orderNumber);
    } catch (err) {
      console.error(err);
      alert('Could not download the invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

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
          {data?.data?.total ?? 0} invoices
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
                  {['Invoice #', 'Date', 'Customer', 'Items', 'Payment', 'Total', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any) => {
                  const isDownloading = downloadingId === order.id;
                  const paidLabel = order.payment_status === 'captured'
                    ? 'Paid'
                    : order.payment_status === 'pending' && order.payment_method === 'cod'
                      ? 'COD'
                      : String(order.payment_status).replace('_', ' ');
                  const paidTone = order.payment_status === 'captured'
                    ? 'bg-green-50 text-green-700'
                    : order.payment_status === 'refunded' || order.payment_status === 'failed'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-yellow-50 text-yellow-700';
                  return (
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
                      <td className="px-5 py-3.5">
                        <span className={`inline-block font-satoshi text-xs px-2 py-0.5 rounded-full capitalize ${paidTone}`}>
                          {paidLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-semibold">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDownload(order.id, order.order_number)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-1.5 font-satoshi text-xs text-honey-600 hover:text-honey-700 font-medium disabled:opacity-50"
                          >
                            {isDownloading
                              ? <Loader2 size={12} className="animate-spin" />
                              : <Download size={12} />}
                            {isDownloading ? 'Downloading…' : 'Download PDF'}
                          </button>
                          <Link
                            href={`/admin/invoices/${order.id}`}
                            className="font-satoshi text-xs text-gray-500 hover:text-gray-700"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 font-satoshi text-gray-400">
                      No invoices found
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
