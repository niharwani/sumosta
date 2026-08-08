'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Package, MapPin, Mail, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { tracker } from '@/lib/tracker';
import { HONEY_EASE_OUT } from '@/lib/animations';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

interface ReceiptItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url: string | null;
}

interface Receipt {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  discount: number;
  shipping_amount: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  paid_at: string | null;
  created_at: string;
  items: ReceiptItem[];
}

const CONFETTI_COLORS = ['#F5A623', '#D4891A', '#FFCC66', '#7C9A6E', '#F7E89E'];

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paramId = params?.id;
  const queryOrderId = searchParams.get('orderId');
  const id = queryOrderId
    || (paramId && paramId !== '_placeholder' ? paramId : '');
  const email = searchParams.get('email') ?? '';

  const checkRef = useRef<SVGPathElement>(null);
  const clearCart = useCartStore((s) => s.clearCart);
  const reduce = useReducedMotion();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const trackedRef = useRef(false);

  // Clear cart once on mount (safe if already empty)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Animate check mark (skip when reduced motion)
  useEffect(() => {
    if (!checkRef.current || reduce) return;
    import('animejs').then(({ default: anime }) => {
      anime({
        targets: checkRef.current,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'cubicBezier(0.65, 0, 0.35, 1)',
        duration: 800,
        delay: 200,
      });
    });
  }, [reduce]);

  // Fetch receipt
  useEffect(() => {
    if (!id) return;

    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('sumosta_access_token');

    const load = async () => {
      try {
        let data: Receipt | null = null;
        if (hasToken) {
          try {
            data = await ordersApi.get(id) as Receipt;
          } catch {
            // fall through to receipt endpoint
          }
        }
        if (!data) {
          if (!email) {
            setErrorMsg('We couldn’t load your order details here. Please check the confirmation email we’ve sent, or track your order using your email.');
            setLoading(false);
            return;
          }
          data = await ordersApi.receipt(id, email) as Receipt;
        }
        setReceipt(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not load order';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, email]);

  // Fire purchase analytics event once when receipt loads
  useEffect(() => {
    if (!receipt || trackedRef.current || !tracker) return;
    trackedRef.current = true;
    tracker.track('purchase', {
      orderId:     receipt.id,
      orderNumber: receipt.order_number,
      total:       receipt.total,
      subtotal:    receipt.subtotal,
      discount:    receipt.discount,
      shipping:    receipt.shipping_amount,
      couponCode:  receipt.coupon_code,
      itemCount:   receipt.items.reduce((n, it) => n + it.quantity, 0),
      items: receipt.items.map((it) => ({
        productId: it.product_id,
        name:      it.product_name,
        quantity:  it.quantity,
        price:     it.unit_price,
      })),
    });
  }, [receipt]);

  const estimatedText = receipt?.estimated_delivery_date
    ? new Date(receipt.estimated_delivery_date).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-cream pb-20 px-4 pt-8 md:pt-12">
      {/* Confetti burst — hidden when reduced motion */}
      {!reduce && (
        <div
          className="pointer-events-none fixed inset-x-0 z-0 h-40 overflow-hidden"
          style={{ top: 'calc(var(--header-height) + 1rem)' }}
          aria-hidden
        >
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
              animate={{
                y: 260 + Math.random() * 120,
                x: (Math.random() - 0.5) * 400,
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2.4, delay: 0.2 + Math.random() * 0.6, ease: HONEY_EASE_OUT }}
              style={{
                position: 'absolute',
                left: `${10 + Math.random() * 80}%`,
                width: 8,
                height: 12,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                borderRadius: 2,
                display: 'block',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Hero — success mark */}
        <div className="text-center mb-10">
          <motion.div
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: HONEY_EASE_OUT }}
            className="w-20 h-20 rounded-full bg-sage-light mx-auto flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(124,154,110,0.25)]"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path
                ref={checkRef}
                d="M8 20 L17 29 L32 12"
                stroke="#5C8A4E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: HONEY_EASE_OUT }}
          >
            <h1 className="font-clash font-bold text-charcoal text-3xl sm:text-4xl mb-2">
              Thank you for your order!
            </h1>
            <p className="font-satoshi text-earth text-sm sm:text-base">
              We’re packing your honey. A confirmation email is on its way.
            </p>
          </motion.div>
        </div>

        {loading && (
          <div className="flex justify-center py-16"><HoneycombLoader size="lg" /></div>
        )}

        {!loading && errorMsg && !receipt && (
          <div className="bg-cream-warm rounded-2xl border border-sand p-6 text-center">
            <p className="font-satoshi text-sm text-bark leading-relaxed mb-6">{errorMsg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/track"
                className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-6 py-3 rounded-full transition-colors min-h-[44px]"
              >
                Track Order
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-cream border border-sand hover:border-honey-400 text-charcoal font-satoshi font-semibold text-sm px-6 py-3 rounded-full transition-colors min-h-[44px]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {receipt && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: HONEY_EASE_OUT }}
            className="space-y-5"
          >
            {/* Order summary card */}
            <div className="bg-cream-warm rounded-2xl border border-sand overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-sand bg-honey-50">
                <div>
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider">Order</p>
                  <p className="font-clash font-bold text-charcoal text-lg">{receipt.order_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-satoshi text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    receipt.payment_status === 'captured'
                      ? 'bg-sage-light text-sage'
                      : receipt.payment_status === 'pending'
                      ? 'bg-honey-100 text-honey-600'
                      : 'bg-terracotta-light text-terracotta'
                  }`}>
                    {receipt.payment_status === 'captured' ? 'Paid' : receipt.payment_status.replace('_', ' ')}
                  </span>
                  <span className="font-satoshi text-xs font-semibold px-2.5 py-1 rounded-full bg-honey-100 text-honey-600 capitalize">
                    {receipt.status}
                  </span>
                </div>
              </div>

              {estimatedText && (
                <div className="flex items-start gap-3 px-5 py-4 border-b border-sand">
                  <Truck size={18} className="text-honey-500 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-satoshi text-xs text-earth uppercase tracking-wider">Estimated Delivery</p>
                    <p className="font-satoshi text-sm text-charcoal font-semibold">By {estimatedText}</p>
                    {receipt.tracking_number && (
                      <p className="font-satoshi text-xs text-bark mt-1">
                        Tracking: <span className="font-semibold">{receipt.tracking_number}</span>
                        {receipt.tracking_url && (
                          <> · <a href={receipt.tracking_url} target="_blank" rel="noopener noreferrer" className="text-honey-500 hover:text-honey-600 underline">Track on courier</a></>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="p-5 border-b border-sand">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={15} className="text-earth" aria-hidden />
                  <p className="font-satoshi text-xs text-earth uppercase tracking-wider font-semibold">Items ({receipt.items.length})</p>
                </div>
                <div className="space-y-3">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-sand overflow-hidden shrink-0 relative">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized={item.image_url.startsWith('http')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-earth-light">
                            <Package size={20} aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-satoshi font-semibold text-sm text-charcoal leading-tight truncate">
                          {item.product_name}
                        </p>
                        {item.variant_name && (
                          <p className="font-satoshi text-xs text-earth">{item.variant_name}</p>
                        )}
                        <p className="font-satoshi text-xs text-earth mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-satoshi text-sm font-semibold text-charcoal whitespace-nowrap">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-5 border-b border-sand space-y-2">
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Subtotal</span>
                  <span>{formatPrice(receipt.subtotal)}</span>
                </div>
                {receipt.discount > 0 && (
                  <div className="flex justify-between font-satoshi text-sm text-sage font-semibold">
                    <span>Discount {receipt.coupon_code ? `(${receipt.coupon_code})` : ''}</span>
                    <span>−{formatPrice(receipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Shipping</span>
                  <span className={receipt.shipping_amount === 0 ? 'text-sage font-semibold' : ''}>
                    {receipt.shipping_amount === 0 ? 'FREE' : formatPrice(receipt.shipping_amount)}
                  </span>
                </div>
                {receipt.tax > 0 && (
                  <div className="flex justify-between font-satoshi text-sm text-bark">
                    <span>Tax</span>
                    <span>{formatPrice(receipt.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-sand">
                  <span className="font-clash font-bold text-charcoal">Total</span>
                  <span className="font-clash font-bold text-charcoal text-lg">{formatPrice(receipt.total)}</span>
                </div>
              </div>

              {/* Shipping address */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={15} className="text-earth" aria-hidden />
                  <p className="font-satoshi text-xs text-earth uppercase tracking-wider font-semibold">Shipping to</p>
                </div>
                <p className="font-satoshi text-sm text-charcoal font-semibold">{receipt.shipping_name}</p>
                <p className="font-satoshi text-xs text-earth">{receipt.shipping_phone}</p>
                <p className="font-satoshi text-sm text-bark leading-relaxed mt-1">
                  {receipt.shipping_address_line1}
                  {receipt.shipping_address_line2 ? `, ${receipt.shipping_address_line2}` : ''}
                  <br />
                  {receipt.shipping_city}, {receipt.shipping_state} – {receipt.shipping_pincode}
                </p>
              </div>
            </div>

            {/* Email nudge */}
            <div className="flex items-start gap-3 bg-honey-50 border border-honey-200 rounded-2xl p-4">
              <Mail size={16} className="text-honey-500 shrink-0 mt-0.5" aria-hidden />
              <p className="font-satoshi text-xs text-bark leading-relaxed">
                A receipt has been sent to your email. If you don’t see it, please check your spam folder.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/account/orders/${receipt.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm rounded-full px-6 py-3 transition-colors min-h-[44px]"
              >
                View Order <ArrowRight size={15} aria-hidden />
              </Link>
              <Link
                href="/shop"
                className="flex-1 inline-flex items-center justify-center bg-cream border border-sand hover:border-honey-400 text-charcoal font-satoshi font-semibold text-sm rounded-full px-6 py-3 transition-colors min-h-[44px]"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
