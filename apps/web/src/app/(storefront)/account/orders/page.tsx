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
    pending:    'bg-beeswax text-bark',
    confirmed:  'bg-sage-light text-sage',
    processing: 'bg-honey-100 text-honey-600',
    shipped:    'bg-honey-100 text-honey-600',
    delivered:  'bg-sage-light text-sage',
    cancelled:  'bg-terracotta-light text-terracotta',
    refunded:   'bg-terracotta-light text-terracotta',
  };

  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-[720px] mx-auto px-6">
        <h1 className="font-clash text-charcoal font-bold text-3xl mb-8">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
        ) : !data?.data?.length ? (
          <div className="text-center py-20">
            <p className="font-satoshi text-earth mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="bg-honey-400 text-midnight font-satoshi font-semibold px-6 py-3 rounded-md hover:bg-honey-500 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.data.map((order: any) => (
              <div key={order.id} className="bg-cream-warm rounded-xl border border-sand p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-satoshi text-charcoal font-semibold text-sm">{order.order_number}</p>
                    <p className="font-satoshi text-earth-light text-xs">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`font-satoshi text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-sand text-bark'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-satoshi text-bark text-sm">{formatPrice(order.total)}</span>
                  <Link href={`/account/orders/${order.id}`} className="font-satoshi text-honey-500 text-sm hover:text-honey-600">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
