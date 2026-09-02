'use client';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { fadeUp } from '@/lib/animations';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import type { TrackingResponse } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

// Accept either an email OR a 10-digit Indian mobile number as the
// second factor. Phone-only checkout users have no email on file.
const schema = z
  .object({
    orderNumber: z.string().min(3, 'Enter your order number'),
    identifier:  z.string().min(1, 'Enter your email or mobile number'),
  })
  .refine(
    ({ identifier }) => {
      const digits = identifier.replace(/\D/g, '');
      if (/^[6-9]\d{9}$/.test(digits.slice(-10))) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    },
    { message: 'Enter a valid email or 10-digit mobile number', path: ['identifier'] },
  );
type FormData = z.infer<typeof schema>;

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'] as const;
const STATUS_ICONS: Record<string, typeof Package> = {
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: MapPin,
};

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus as (typeof STATUS_STEPS)[number]);

  return (
    <div className="mt-8">
      {/* Mobile: vertical stack */}
      <ol className="flex md:hidden flex-col gap-4" aria-label="Order status timeline">
        {STATUS_STEPS.map((step, i) => {
          const Icon = STATUS_ICONS[step];
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  done ? 'bg-honey-500' : 'bg-sand'
                } ${active ? 'ring-4 ring-honey-100' : ''}`}
                aria-hidden="true"
              >
                <Icon size={15} className={done ? 'text-cream' : 'text-earth-light'} />
              </div>
              <span
                className={`font-satoshi text-sm capitalize ${
                  done ? 'text-charcoal font-medium' : 'text-earth-light'
                }`}
              >
                {step}
                {active && <span className="sr-only"> (current)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal timeline */}
      <div className="relative hidden md:flex items-start justify-between" aria-hidden="true">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-sand" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-honey-500 transition-all duration-1000"
          style={{ width: `${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
        {STATUS_STEPS.map((step, i) => {
          const Icon = STATUS_ICONS[step];
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  done ? 'bg-honey-500' : 'bg-sand'
                } ${active ? 'ring-4 ring-honey-100' : ''}`}
              >
                <Icon size={15} className={done ? 'text-cream' : 'text-earth-light'} />
              </div>
              <span
                className={`font-satoshi text-xs capitalize ${
                  done ? 'text-charcoal font-medium' : 'text-earth-light'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState('');
  const orderNumberId = useId();
  const identifierId = useId();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    setOrder(null);
    setTracking(null);
    try {
      // Decide whether the identifier is a phone or an email and build the
      // right query string. Backend accepts either.
      const digits = data.identifier.replace(/\D/g, '');
      const isPhone = /^[6-9]\d{9}$/.test(digits.slice(-10));
      const queryParam = isPhone
        ? `phone=${encodeURIComponent(digits.slice(-10))}`
        : `email=${encodeURIComponent(data.identifier)}`;

      const base = `orderNumber=${encodeURIComponent(data.orderNumber)}&${queryParam}`;

      const [orderRes, trackingRes] = await Promise.all([
        fetch(`${API}/api/orders/track?${base}`),
        fetch(`${API}/api/orders/track/live?${base}`),
      ]);
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.data) throw new Error(orderJson.error || 'Order not found');
      setOrder(orderJson.data);

      // Live tracking is best-effort — don't error the page if it fails
      if (trackingRes.ok) {
        const trackingJson = await trackingRes.json();
        if (trackingJson.success && trackingJson.data) setTracking(trackingJson.data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-charcoal bg-cream focus:outline-none transition-colors focus-visible:ring-2 focus-visible:ring-honey-400 ${
      hasError ? 'border-terracotta focus:border-terracotta' : 'border-sand focus:border-honey-400'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-12 md:pt-20 bg-cream">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <Truck size={36} className="text-honey-500 mx-auto mb-4" strokeWidth={1.6} />
          <h1 className="font-clash font-bold text-charcoal text-3xl mb-2">Track Your Order</h1>
          <p className="font-satoshi text-bark text-sm">
            Enter your order number and email to check the status
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-cream-warm rounded-2xl border border-sand p-8 shadow-sm space-y-4"
          noValidate
        >
          <div>
            <label htmlFor={orderNumberId} className="block font-satoshi text-charcoal text-sm font-medium mb-1.5">
              Order Number
            </label>
            <input
              id={orderNumberId}
              {...register('orderNumber')}
              className={inputClass(!!errors.orderNumber)}
              placeholder="SUMO-000001"
              aria-invalid={!!errors.orderNumber}
              aria-describedby={errors.orderNumber ? `${orderNumberId}-error` : undefined}
            />
            {errors.orderNumber && (
              <p id={`${orderNumberId}-error`} className="font-satoshi text-terracotta text-xs mt-1">
                {errors.orderNumber.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={identifierId} className="block font-satoshi text-charcoal text-sm font-medium mb-1.5">
              Email or Mobile Number
            </label>
            <input
              id={identifierId}
              type="text"
              autoComplete="email"
              {...register('identifier')}
              className={inputClass(!!errors.identifier)}
              placeholder="you@example.com or 9876543210"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? `${identifierId}-error` : undefined}
            />
            {errors.identifier && (
              <p id={`${identifierId}-error`} className="font-satoshi text-terracotta text-xs mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-terracotta-light border border-terracotta/30 rounded-lg px-4 py-3" role="alert">
              <p className="font-satoshi text-terracotta text-sm m-0">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-honey w-full disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <HoneycombLoader size="sm" /> : null}
            {submitting ? 'Looking up...' : 'Track Order'}
          </button>
        </form>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 bg-cream-warm rounded-2xl border border-sand p-8 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2 gap-4">
                <div>
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider">Order</p>
                  <p className="font-clash text-charcoal font-bold text-lg">{order.order_number}</p>
                </div>
                <span
                  className={`text-xs font-satoshi font-medium px-3 py-1 rounded-full capitalize ${
                    order.status === 'delivered'
                      ? 'bg-sage-light text-sage'
                      : order.status === 'cancelled'
                        ? 'bg-terracotta-light text-terracotta'
                        : 'bg-honey-100 text-honey-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-satoshi text-bark mb-6 gap-4 flex-wrap">
                <span>
                  Placed{' '}
                  <time dateTime={order.created_at}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </span>
                <span className="font-medium text-charcoal">{formatPrice(order.total)}</span>
              </div>

              {!['cancelled', 'refunded'].includes(order.status) && (
                <StatusTimeline currentStatus={order.status} />
              )}

              {(order.tracking_number || order.awb_code) && (
                <div className="mt-6 p-4 bg-cream rounded-xl border border-sand">
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider mb-1">
                    {order.courier_name ? `${order.courier_name} · AWB` : 'Tracking Number'}
                  </p>
                  <p className="font-satoshi text-charcoal font-medium">
                    {order.awb_code ?? order.tracking_number}
                  </p>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-satoshi text-honey-600 hover:text-honey-500 text-sm hover:underline mt-1 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                    >
                      Track on courier website →
                    </a>
                  )}
                </div>
              )}

              {/* Live checkpoints from Shiprocket */}
              {tracking && !['cancelled', 'refunded'].includes(order.status) && (tracking.awb_pending || tracking.awb_code) && (
                <div className="mt-6 border-t border-sand pt-6">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <p className="font-clash text-charcoal font-semibold text-sm m-0">Live tracking</p>
                    {tracking.current_status && (
                      <span className="font-satoshi text-xs font-medium bg-honey-100 text-honey-600 px-2.5 py-0.5 rounded-full">
                        {tracking.current_status}
                      </span>
                    )}
                  </div>

                  {tracking.awb_pending ? (
                    <div className="flex items-center gap-2.5 text-bark">
                      <Clock size={14} className="text-honey-500" aria-hidden />
                      <p className="font-satoshi text-sm m-0">
                        Preparing your shipment. The courier and AWB will appear here shortly.
                      </p>
                    </div>
                  ) : tracking.activities.length === 0 ? (
                    <div className="flex items-center gap-2.5 text-bark">
                      <Truck size={14} className="text-honey-500" aria-hidden />
                      <p className="font-satoshi text-sm m-0">
                        Awaiting the first courier update.
                      </p>
                    </div>
                  ) : (
                    <ol className="relative border-l-2 border-sand ml-1 space-y-3 pl-5 list-none">
                      {tracking.activities.map((a, i) => (
                        <li key={`${a.date}-${i}`} className="relative">
                          <span
                            aria-hidden
                            className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 ${
                              i === 0 ? 'bg-honey-500 border-honey-500' : 'bg-cream-warm border-sand'
                            }`}
                          />
                          <p className="font-satoshi text-charcoal text-sm font-medium m-0">
                            {a.status}
                          </p>
                          {a.activity && a.activity !== a.status && (
                            <p className="font-satoshi text-bark text-xs mt-0.5 m-0">{a.activity}</p>
                          )}
                          <p className="font-satoshi text-earth text-xs mt-0.5 m-0">
                            {a.location && <span>{a.location} · </span>}
                            {a.date}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {order.items?.length > 0 && (
                <div className="mt-6 border-t border-sand pt-6">
                  <p className="font-clash text-charcoal font-semibold text-sm mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-satoshi text-charcoal text-sm">{item.product_name}</p>
                          <p className="font-satoshi text-earth-light text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-satoshi text-charcoal text-sm font-medium">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
