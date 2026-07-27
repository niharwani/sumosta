'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn:  () => ordersApi.list(),
  });

  const STATUS_COLOR: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700',
    confirmed:  'bg-green-50 text-green-700',
    processing: 'bg-orange-50 text-[#F97316]',
    shipped:    'bg-orange-50 text-[#F97316]',
    delivered:  'bg-green-50 text-green-700',
    cancelled:  'bg-red-50 text-red-600',
    refunded:   'bg-red-50 text-red-600',
  };

  return (
    <div>
      <h1 className="font-jakarta font-bold text-charcoal text-2xl mb-6">My Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : !data?.data?.length ? (
        <div className="text-center py-20">
          <p className="font-jakarta text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="btn-pill-orange">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.data.map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-jakarta text-charcoal font-semibold text-sm">{order.order_number}</p>
                  <p className="font-jakarta text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className={`font-jakarta text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-jakarta text-charcoal text-sm">{formatPrice(order.total)}</span>
                <Link href={`/account/orders/${order.id}`} className="font-jakarta text-[#F97316] text-sm hover:text-[#EA580C]">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
