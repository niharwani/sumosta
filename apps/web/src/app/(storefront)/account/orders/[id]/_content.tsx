'use client';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Star,
  RotateCcw,
  CreditCard,
  Clock,
  Download,
  X,
  AlertCircle,
} from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice, cn } from '@/lib/utils';
import { ordersApi, reviewsApi, cartApi, ApiError, type TrackingResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { HONEY_EASE_OUT } from '@/lib/animations';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-[--honey-100] text-[--honey-600]',
  confirmed:  'bg-[--sage-light] text-[--sage]',
  processing: 'bg-[--honey-100] text-[--honey-600]',
  shipped:    'bg-[--honey-100] text-[--honey-600]',
  delivered:  'bg-[--sage-light] text-[--sage]',
  cancelled:  'bg-[--terracotta-light] text-[--terracotta]',
  refunded:   'bg-[--terracotta-light] text-[--terracotta]',
};

type Toast = { id: number; text: string; tone: 'success' | 'error' | 'info' };

type OrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name?: string | null;
  image_url?: string | null;
  quantity: number;
  line_total: number;
  is_reviewed?: boolean;
};

type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  subtotal: number;
  discount: number;
  shipping_amount: number;
  total: number;
  coupon_code: string | null;
  paid_at: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  awb_code?: string | null;
  courier_name?: string | null;
  shipment_status?: string | null;
  estimated_delivery_date?: string | null;
  guest_email?: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  // On Cloudflare Pages static export the URL /account/orders/ord_XXX/ is
  // served by the pre-built _placeholder HTML, so useParams() returns the
  // baked-in placeholder value, not the real id. The pathname does have
  // the real segment — use it as the source of truth.
  const paramsFromRoute = useParams<{ id: string }>();
  const pathname = usePathname();
  const idFromPath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const source = pathname ?? window.location.pathname;
    const match  = source.match(/\/account\/orders\/([^/]+)/);
    const raw    = match?.[1] ?? '';
    return raw === '_placeholder' || raw === 'shell' ? '' : decodeURIComponent(raw);
  }, [pathname]);
  const paramId = paramsFromRoute?.id;
  const id = idFromPath || (paramId && paramId !== '_placeholder' && paramId !== 'shell' ? paramId : '');

  const router = useRouter();
  const qc = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', body: '' });
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const isShellRoute = !id;

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => ordersApi.get(id as string) as Promise<OrderDetail>,
    enabled:  !!id && !isShellRoute,
    retry:    false,
  });

  // Live tracking — fetches Shiprocket checkpoints once we have an order.
  // Refetched every 5 minutes while the tab is open so customers who leave
  // the page open see updates (Shiprocket updates faster than our polling,
  // but 5min is a friendly rate).
  const { data: tracking } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn:  () => ordersApi.tracking(id as string) as Promise<TrackingResponse>,
    enabled:  !!id && !isShellRoute && !!order && !['cancelled', 'refunded'].includes(order.status),
    refetchInterval: 5 * 60 * 1000,
    retry:    false,
    staleTime: 60 * 1000,
  });

  const pushToast = (text: string, tone: Toast['tone'] = 'info') => {
    const t: Toast = { id: Date.now() + Math.random(), text, tone };
    setToasts((prev) => [...prev, t]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3500);
  };

  const reorderMutation = useMutation({
    mutationFn: async (items: OrderItem[]) => {
      const results = await Promise.allSettled(
        items.map((item) =>
          cartApi.addItem({
            productId: item.product_id,
            variantId: item.variant_id ?? undefined,
            quantity: item.quantity,
          }),
        ),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: items.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      const added = total - failed;
      if (added === 0) {
        pushToast('These items are no longer available.', 'error');
        return;
      }
      if (failed > 0) {
        pushToast(
          `${failed} item${failed === 1 ? '' : 's'} no longer available; the rest were added to your cart.`,
          'info',
        );
      } else {
        pushToast('Items added to your cart.', 'success');
      }
      router.push('/cart');
    },
    onError: () => {
      pushToast('Could not reorder. Please try again.', 'error');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(id as string),
    onSuccess: () => {
      setCancelOpen(false);
      pushToast('Order cancelled.', 'success');
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Could not cancel this order.';
      pushToast(msg, 'error');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string; itemId: string }) => {
      return reviewsApi.create({
        productId,
        rating: reviewData.rating,
        title: reviewData.title,
        body: reviewData.body,
      });
    },
    onSuccess: (_data, vars) => {
      setReviewingItem(null);
      setReviewData({ rating: 5, title: '', body: '' });
      setReviewedItems((prev) => new Set(prev).add(vars.itemId));
      pushToast('Thanks — your review has been submitted.', 'success');
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Could not submit review.';
      pushToast(msg, 'error');
    },
  });

  const handleReorder = () => {
    if (!order?.items?.length) return;
    reorderMutation.mutate(order.items);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    // The receipt endpoint returns JSON, not a real PDF — building a PDF
    // service is out of scope for launch. Open the printable order-confirmation
    // page in a new tab instead; the customer can use the browser's built-in
    // "Save as PDF" for a cleaner invoice than we could hand-render.
    const email = order.guest_email ?? user?.email ?? '';
    const url = `/order-confirmation/${order.id}/?orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(email)}&print=1`;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) {
      pushToast('Please allow pop-ups to view the invoice.', 'error');
    }
  };

  const currentStepIndex = useMemo(
    () => (order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1),
    [order],
  );

  if (isShellRoute) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading order">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading order">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  if (isError || !order) {
    const status = error instanceof ApiError ? error.status : undefined;
    const isForbidden = status === 403;
    const title = isForbidden ? "You don't have access to this order." : 'Order not found.';
    return (
      <div className="text-center py-20 bg-[--cream-warm] rounded-2xl border border-[--sand]">
        <AlertCircle size={36} className="mx-auto text-[--earth-light] mb-4" aria-hidden />
        <p className="font-clash text-lg text-[--charcoal] mb-2">{title}</p>
        <p className="font-satoshi text-sm text-[--earth] mb-6">
          {isForbidden
            ? 'This order belongs to a different account.'
            : "We couldn't find the order you're looking for."}
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
        >
          <ArrowLeft size={16} aria-hidden /> Back to orders
        </Link>
      </div>
    );
  }

  const isTerminal = ['cancelled', 'refunded'].includes(order.status);
  const isPending = order.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/account/orders"
          aria-label="Back to orders"
          className="text-[--earth] hover:text-[--charcoal] transition-colors p-1 -ml-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
        >
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <h1 className="font-clash text-[--charcoal] font-bold text-xl md:text-2xl m-0">
          {order.order_number}
        </h1>
        <span
          className={cn(
            'text-xs font-satoshi font-medium px-3 py-1 rounded-full capitalize',
            STATUS_STYLES[order.status] ?? 'bg-[--sand] text-[--bark]',
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {!isTerminal && (
        <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[--honey-500]" aria-hidden />
              <div>
                <p className="font-satoshi text-[--charcoal] text-sm font-semibold">
                  Awaiting payment confirmation
                </p>
                <p className="font-satoshi text-[--earth] text-xs mt-0.5">
                  We&apos;ll email you as soon as the payment is confirmed.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-start justify-between">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-[--sand]" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-[--honey-400] transition-all duration-1000"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-2 relative z-10"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        done ? 'bg-[--honey-400]' : 'bg-[--sand]',
                        active ? 'ring-4 ring-[--honey-100]' : '',
                      )}
                    >
                      <Icon size={15} className={done ? 'text-[--charcoal]' : 'text-[--earth]'} aria-hidden />
                    </div>
                    <span
                      className={cn(
                        'font-satoshi text-xs text-center',
                        done ? 'text-[--charcoal] font-medium' : 'text-[--earth]',
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {(order.tracking_number || order.estimated_delivery_date || order.awb_code) && (
            <div className="mt-6 pt-4 border-t border-[--sand] flex flex-wrap items-center justify-between gap-4">
              <div>
                {(order.awb_code || order.tracking_number) && (
                  <>
                    <p className="font-satoshi text-[--earth] text-xs uppercase tracking-wider">
                      AWB · {order.courier_name ?? 'Courier assigned'}
                    </p>
                    <p className="font-satoshi text-[--charcoal] font-medium mt-0.5">
                      {order.awb_code ?? order.tracking_number}
                    </p>
                  </>
                )}
                {order.estimated_delivery_date && (
                  <p className="font-satoshi text-[--earth] text-xs mt-2">
                    Est. delivery{' '}
                    <span className="text-[--charcoal] font-medium">
                      {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                )}
              </div>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-satoshi text-sm font-semibold text-[--honey-600] hover:text-[--honey-500] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded"
                >
                  Track on courier website →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live courier tracking — Shiprocket checkpoints */}
      {!isTerminal && tracking && (tracking.awb_pending || tracking.awb_code) && (
        <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-clash text-[--charcoal] font-bold text-lg m-0">
              Live tracking
            </h2>
            {tracking.current_status && (
              <span className="font-satoshi text-xs font-medium bg-[--honey-100] text-[--honey-600] px-3 py-1 rounded-full">
                {tracking.current_status}
              </span>
            )}
          </div>

          {tracking.awb_pending ? (
            <div className="flex items-center gap-3 text-[--bark]">
              <Clock size={16} className="text-[--honey-500]" aria-hidden />
              <p className="font-satoshi text-sm m-0">
                We&apos;re preparing your shipment — the courier and tracking
                number will appear here as soon as it&apos;s picked up. Usually
                within a few hours.
              </p>
            </div>
          ) : tracking.activities.length === 0 ? (
            <div className="flex items-center gap-3 text-[--bark]">
              <Truck size={16} className="text-[--honey-500]" aria-hidden />
              <p className="font-satoshi text-sm m-0">
                Awaiting the first update from{' '}
                <strong>{tracking.courier_name ?? 'the courier'}</strong>.
                Check back shortly.
              </p>
            </div>
          ) : (
            <ol className="relative border-l-2 border-[--sand] ml-1.5 space-y-4 pl-6 pt-1 list-none">
              {tracking.activities.map((a, i) => (
                <li key={`${a.date}-${i}`} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full border-2',
                      i === 0
                        ? 'bg-[--honey-400] border-[--honey-500]'
                        : 'bg-[--cream-warm] border-[--sand]',
                    )}
                  />
                  <p className="font-satoshi text-[--charcoal] text-sm font-medium m-0">
                    {a.status}
                  </p>
                  {a.activity && a.activity !== a.status && (
                    <p className="font-satoshi text-[--bark] text-xs mt-0.5 m-0">
                      {a.activity}
                    </p>
                  )}
                  <p className="font-satoshi text-[--earth] text-xs mt-1 m-0">
                    {a.location && <span>{a.location} · </span>}
                    {a.date}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
        <h2 className="font-clash text-[--charcoal] font-bold text-lg mb-4">Items</h2>
        <ul className="space-y-4 list-none p-0">
          {order.items?.map((item) => {
            const alreadyReviewed = item.is_reviewed || reviewedItems.has(item.id);
            return (
              <li key={item.id}>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[--cream] shrink-0 border border-[--sand]">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[--earth-light]">
                        <Package size={20} aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-satoshi text-[--charcoal] font-medium text-sm">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="font-satoshi text-[--earth] text-xs">{item.variant_name}</p>
                    )}
                    <p className="font-satoshi text-[--earth] text-xs mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-satoshi text-[--charcoal] font-semibold text-sm whitespace-nowrap">
                    {formatPrice(item.line_total)}
                  </p>
                </div>
                {order.status === 'delivered' && (
                  <div className="mt-3 ml-20">
                    {reviewingItem === item.id ? (
                      <div className="bg-[--cream] rounded-xl p-4 space-y-3 border border-[--sand]">
                        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setReviewData((d) => ({ ...d, rating: s }))}
                              aria-label={`Rate ${s} star${s === 1 ? '' : 's'}`}
                              aria-pressed={s === reviewData.rating}
                              className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded"
                            >
                              <Star
                                size={18}
                                className={
                                  s <= reviewData.rating
                                    ? 'text-[--honey-400] fill-[--honey-400]'
                                    : 'text-[--sand] fill-[--sand]'
                                }
                                aria-hidden
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          value={reviewData.title}
                          onChange={(e) =>
                            setReviewData((d) => ({ ...d, title: e.target.value }))
                          }
                          placeholder="Review title"
                          aria-label="Review title"
                          className="w-full border border-[--sand] rounded-lg px-3 py-2 text-sm font-satoshi text-[--charcoal] bg-[--cream-warm] focus:outline-none focus:ring-2 focus:ring-[--honey-400] focus:border-[--honey-400]"
                        />
                        <textarea
                          value={reviewData.body}
                          onChange={(e) =>
                            setReviewData((d) => ({ ...d, body: e.target.value }))
                          }
                          placeholder="Share your experience..."
                          rows={3}
                          aria-label="Review body"
                          className="w-full border border-[--sand] rounded-lg px-3 py-2 text-sm font-satoshi text-[--charcoal] bg-[--cream-warm] focus:outline-none focus:ring-2 focus:ring-[--honey-400] focus:border-[--honey-400] resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              reviewMutation.mutate({ productId: item.product_id, itemId: item.id })
                            }
                            disabled={!reviewData.body || reviewMutation.isPending}
                            className="font-satoshi text-xs font-semibold bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-4 py-2 min-h-[36px] rounded-full disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
                          >
                            {reviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewingItem(null)}
                            className="font-satoshi text-xs text-[--earth] px-3 py-2 min-h-[36px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : alreadyReviewed ? (
                      <span className="font-satoshi text-xs text-[--sage] inline-flex items-center gap-1">
                        <CheckCircle size={12} aria-hidden /> Review submitted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewingItem(item.id)}
                        className="font-satoshi text-xs text-[--honey-600] hover:text-[--honey-500] inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded"
                      >
                        <Star size={12} aria-hidden /> Write a review
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="border-t border-[--sand] mt-6 pt-4 space-y-2">
          <div className="flex justify-between font-satoshi text-sm text-[--bark]">
            <span>Subtotal</span>
            <span className="text-[--charcoal]">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-satoshi text-sm text-[--sage]">
              <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-satoshi text-sm text-[--bark]">
            <span>Shipping</span>
            <span
              className={
                order.shipping_amount === 0
                  ? 'text-[--sage] font-medium'
                  : 'text-[--charcoal]'
              }
            >
              {order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between font-satoshi font-bold text-[--charcoal] pt-2 border-t border-[--sand]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
        <h2 className="font-clash text-[--charcoal] font-bold text-lg mb-3">Shipping to</h2>
        <p className="font-satoshi text-[--charcoal] text-sm font-medium">{order.shipping_name}</p>
        <p className="font-satoshi text-[--earth] text-sm">{order.shipping_phone}</p>
        <p className="font-satoshi text-[--earth] text-sm mt-1 leading-relaxed">
          {order.shipping_address_line1}
          {order.shipping_address_line2 && `, ${order.shipping_address_line2}`}
          <br />
          {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
        </p>
      </div>

      {/* Payment Info */}
      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-[--earth]" aria-hidden />
          <h2 className="font-clash text-[--charcoal] font-bold text-lg m-0">Payment</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(() => {
            const isCod = order.payment_method === 'cod';
            const label = order.payment_status === 'captured'
              ? 'Paid'
              : isCod
                ? 'Cash on delivery'
                : String(order.payment_status).replace('_', ' ');
            const tone = order.payment_status === 'captured'
              ? 'bg-[--sage-light] text-[--sage]'
              : order.payment_status === 'pending'
                ? 'bg-[--honey-100] text-[--honey-600]'
                : 'bg-[--terracotta-light] text-[--terracotta]';
            return (
              <span className={cn('text-xs font-satoshi font-medium px-2.5 py-1 rounded-full capitalize', tone)}>
                {label}
              </span>
            );
          })()}
          {order.payment_method && order.payment_method !== 'cod' && (
            <span className="font-satoshi text-[--earth] text-xs capitalize">
              · {order.payment_method}
            </span>
          )}
          {order.paid_at && (
            <p className="font-satoshi text-[--earth] text-xs">
              Paid on{' '}
              {new Date(order.paid_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
          {order.coupon_code && (
            <p className="font-satoshi text-[--earth] text-xs">
              · Coupon:{' '}
              <span className="font-semibold text-[--charcoal]">{order.coupon_code}</span>
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {!isTerminal && (
            <button
              type="button"
              onClick={handleReorder}
              disabled={reorderMutation.isPending}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] font-satoshi font-semibold text-sm rounded-full px-6 py-3 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] disabled:opacity-60"
            >
              {reorderMutation.isPending ? (
                <HoneycombLoader size="sm" />
              ) : (
                <RotateCcw size={15} aria-hidden />
              )}
              {reorderMutation.isPending ? 'Adding…' : 'Reorder'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[--cream] border border-[--sand] hover:border-[--honey-400] text-[--charcoal] font-satoshi font-semibold text-sm rounded-full px-6 py-3 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
          >
            <Download size={15} aria-hidden />
            View / print invoice
          </button>
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center bg-[--cream] border border-[--sand] hover:border-[--terracotta] text-[--terracotta] font-satoshi font-semibold text-sm rounded-full px-6 py-3 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--terracotta]"
            >
              Cancel order
            </button>
          )}
          <Link
            href="/contact"
            className="flex-1 min-w-[160px] inline-flex items-center justify-center bg-[--cream] border border-[--sand] hover:border-[--honey-400] text-[--charcoal] font-satoshi font-semibold text-sm rounded-full px-6 py-3 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
          >
            Need help?
          </Link>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
        <AnimatePresence>
          {cancelOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-[--overlay]"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild aria-describedby="cancel-order-desc">
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-[--cream-warm] border border-[--sand] rounded-2xl p-6 shadow-[0_12px_40px_rgba(44,36,23,0.16)]"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.96 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
                >
                  <Dialog.Title className="font-clash text-xl text-[--charcoal] m-0">
                    Cancel this order?
                  </Dialog.Title>
                  <Dialog.Description
                    id="cancel-order-desc"
                    className="font-satoshi text-sm text-[--bark] mt-2"
                  >
                    This cannot be undone. If payment was captured, a refund will be initiated.
                  </Dialog.Description>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="flex-1 font-satoshi text-sm font-semibold text-[--bark] border border-[--sand] rounded-full px-5 py-2.5 min-h-[44px] hover:bg-[--cream] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] transition-colors"
                      >
                        Keep order
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 font-satoshi text-sm font-semibold text-white bg-[--terracotta] hover:bg-[--terracotta]/90 rounded-full px-5 py-2.5 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--terracotta] transition-colors disabled:opacity-60"
                    >
                      {cancelMutation.isPending ? <HoneycombLoader size="sm" /> : null}
                      {cancelMutation.isPending ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close dialog"
                      className="absolute top-3 right-3 p-2 text-[--earth] hover:text-[--charcoal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded-full"
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      {/* Toasts */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
              className={cn(
                'font-satoshi text-sm px-4 py-2.5 rounded-full border shadow-md pointer-events-auto max-w-sm text-center',
                t.tone === 'success'
                  ? 'bg-[--sage-light] border-[--sage]/40 text-[--charcoal]'
                  : t.tone === 'error'
                  ? 'bg-[--terracotta-light] border-[--terracotta]/40 text-[--charcoal]'
                  : 'bg-[--cream-warm] border-[--sand] text-[--charcoal]',
              )}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
