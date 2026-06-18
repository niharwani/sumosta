'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped:    'bg-blue-50 text-blue-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-red-50 text-red-700',
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const res = await fetch(`${API}/api/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const customer = data?.data;

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-gray-400">Customer not found</p>
        <Link href="/admin/customers" className="font-satoshi text-honey-500 hover:underline mt-2 inline-block">
          ← Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-satoshi text-gray-800 font-semibold">{customer.name}</h1>
      </div>

      <div className="grid gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Spent', value: formatPrice(customer.total_spent ?? 0) },
            { label: 'Orders', value: String(customer.order_count ?? 0) },
            { label: 'AOV', value: formatPrice(customer.avg_order_value ?? 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="font-satoshi text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="font-satoshi text-gray-800 font-bold text-xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">Customer Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm font-satoshi">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Name</p>
              <p className="text-gray-800 font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="text-gray-800">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Phone</p>
              <p className="text-gray-800">{customer.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Joined</p>
              <p className="text-gray-800">{new Date(customer.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        {customer.orders?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Order History</h2>
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {customer.orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-satoshi text-gray-800 text-sm font-medium hover:text-honey-500">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-satoshi text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-satoshi font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-satoshi text-gray-800 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
