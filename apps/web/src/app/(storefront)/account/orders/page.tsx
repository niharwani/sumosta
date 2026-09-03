'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Package, Copy, Check, Truck } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice, cn } from '@/lib/utils';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  coupon_code: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  item_count: number;
};

type OrderListResponse = {
  orders: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-[--honey-100] text-[--honey-600]',
  confirmed:  'bg-[--sage-light] text-[--sage]',
  processing: 'bg-[--honey-100] text-[--honey-600]',
  shipped:    'bg-[--honey-100] text-[--honey-600]',
  delivered:  'bg-[--sage-light] text-[--sage]',
  cancelled:  'bg-[--terracotta-light] text-[--terracotta]',
  refunded:   'bg-[--terracotta-light] text-[--terracotta]',
};

const LIMIT = 10;

export default function OrdersPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['key']>('all');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const isAuthReady = useAuthStore((s) => s.isInitialized && !!s.user);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<OrderListResponse>({
    queryKey: ['orders', status],
    initialPageParam: 1,
    retry: false,
    // Wait for the auth store to finish hydrating before requesting. Prevents
    // a race where useInfiniteQuery fires before initAuth has set the access
    // token, which would cause an unauthenticated request and a broken retry.
    enabled: isAuthReady,
    queryFn: async ({ pageParam }) =>
      (await ordersApi.list({
        page: pageParam as number,
        limit: LIMIT,
        ...(status !== 'all' ? { status } : {}),
      } as never)) as OrderListResponse,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });

  const orders: OrderRow[] = data?.pages.flatMap((p) => p.orders) ?? [];

  const handleCopyTracking = async (id: string, tracking: string) => {
    try {
      await navigator.clipboard.writeText(tracking);
      setCopiedTracking(id);
      setTimeout(() => setCopiedTracking((c) => (c === id ? null : c)), 1500);
    } catch {
      /* silent */
    }
  };

  return (
    <div>
      <h1 className="font-clash font-semibold text-[--charcoal] text-2xl md:text-3xl mb-6">
        My Orders
      </h1>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 no-scrollbar-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={cn(
              'font-satoshi text-sm whitespace-nowrap px-4 py-2 rounded-full border transition-colors min-h-[40px]',
              status === f.key
                ? 'bg-[--honey-400] text-[--charcoal] border-[--honey-400] font-semibold'
                : 'bg-[--cream-warm] text-[--bark] border-[--sand] hover:bg-[--honey-50]',
            )}
            aria-pressed={status === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading your orders">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[--cream-warm] rounded-xl border border-[--sand] p-5 animate-pulse"
            >
              <div className="h-4 w-32 bg-[--sand] rounded mb-3" />
              <div className="h-3 w-48 bg-[--sand]/70 rounded mb-4" />
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-[--sand] rounded" />
                <div className="h-4 w-16 bg-[--sand]/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-[--cream-warm] rounded-2xl border border-[--sand]">
          <p className="font-satoshi text-[--bark] mb-4">
            We couldn&apos;t load your orders.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[--cream-warm] rounded-2xl border border-[--sand]">
          <Package size={40} className="mx-auto text-[--earth-light] mb-4" aria-hidden />
          <p className="font-clash text-[--charcoal] font-semibold mb-1 text-lg">
            {status === 'all' ? 'No orders yet' : `No ${status} orders`}
          </p>
          <p className="font-satoshi text-[--earth] text-sm mb-6">
            {status === 'all'
              ? "You haven't placed any orders yet."
              : 'Try a different filter to see other orders.'}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[--cream-warm] rounded-xl border border-[--sand] p-5 hover:border-[--honey-400] transition-colors"
              >
                <Link
                  href={`/account/orders/${order.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded-lg -m-1 p-1"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-satoshi text-[--charcoal] font-semibold text-sm">
                        {order.order_number}
                      </p>
                      <p className="font-satoshi text-[--earth] text-xs mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {order.item_count
                          ? ` · ${order.item_count} item${order.item_count === 1 ? '' : 's'}`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'font-satoshi text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap',
                        STATUS_COLOR[order.status] ?? 'bg-[--sand] text-[--bark]',
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-satoshi text-[--charcoal] text-sm font-semibold">
                      {formatPrice(order.total)}
                    </span>
                    <span className="font-satoshi text-[--honey-600] text-sm">
                      View details →
                    </span>
                  </div>
                </Link>

                {(order.tracking_number || order.estimated_delivery_date) && (
                  <div className="mt-3 pt-3 border-t border-[--sand] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-satoshi text-[--bark]">
                    {order.estimated_delivery_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Truck size={13} className="text-[--honey-500]" aria-hidden />
                        Est. delivery{' '}
                        {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {order.tracking_number && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[--earth]">Tracking:</span>
                        <span className="text-[--charcoal] font-medium">
                          {order.tracking_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.id, order.tracking_number!)}
                          aria-label="Copy tracking number"
                          className="p-1 rounded-md text-[--earth] hover:text-[--charcoal] hover:bg-[--honey-50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
                        >
                          {copiedTracking === order.id ? (
                            <Check size={13} className="text-[--sage]" aria-hidden />
                          ) : (
                            <Copy size={13} aria-hidden />
                          )}
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage || isFetching}
                className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-[--cream-warm] border border-[--sand] hover:border-[--honey-400] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] transition-colors disabled:opacity-60"
              >
                {isFetchingNextPage ? <HoneycombLoader size="sm" /> : null}
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      <style jsx global>{`
        .no-scrollbar-2::-webkit-scrollbar { display: none; }
        .no-scrollbar-2 { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
