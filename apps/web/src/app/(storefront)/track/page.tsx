'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { fadeUp } from '@/lib/animations';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  orderNumber: z.string().min(3, 'Enter your order number'),
  email: z.string().email('Enter your registered email'),
});
type FormData = z.infer<typeof schema>;

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_ICONS: Record<string, typeof Package> = {
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: MapPin,
};

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="relative flex items-start justify-between mt-8">
      {/* Progress Line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-sand" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-honey-400 transition-all duration-1000"
        style={{ width: `${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
      />

      {STATUS_STEPS.map((step, i) => {
        const Icon = STATUS_ICONS[step];
        const done = i <= currentIndex;
        const active = i === currentIndex;

        return (
          <div key={step} className="flex flex-col items-center gap-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              done ? 'bg-honey-400' : 'bg-sand'
            } ${active ? 'ring-4 ring-honey-100' : ''}`}>
              <Icon size={15} className={done ? 'text-midnight' : 'text-earth-light'} />
            </div>
            <span className={`font-satoshi text-xs capitalize ${done ? 'text-bark font-medium' : 'text-earth-light'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${API}/api/orders/track?orderNumber=${data.orderNumber}&email=${data.email}`);
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || 'Order not found');
      setOrder(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-bark bg-white focus:outline-none transition-colors ${
      hasError ? 'border-terracotta/50 focus:border-terracotta' : 'border-sand focus:border-honey-400'
    }`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <Truck size={36} className="text-honey-400 mx-auto mb-4" />
          <h1 className="font-clash text-charcoal font-bold text-3xl mb-2">Track Your Order</h1>
          <p className="font-satoshi text-earth text-sm">Enter your order number and email to check the status</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-sand p-8 shadow-sm space-y-4">
          <div>
            <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">Order Number</label>
            <input
              {...register('orderNumber')}
              className={inputClass(!!errors.orderNumber)}
              placeholder="SUMO-000001"
            />
            {errors.orderNumber && (
              <p className="font-satoshi text-terracotta text-xs mt-1">{errors.orderNumber.message}</p>
            )}
          </div>
          <div>
            <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={inputClass(!!errors.email)}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="font-satoshi text-terracotta text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-terracotta-light border border-terracotta/20 rounded-lg px-4 py-3">
              <p className="font-satoshi text-terracotta text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-60 text-midnight font-satoshi font-semibold text-sm py-3 rounded-xl transition-colors"
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
              className="mt-6 bg-white rounded-2xl border border-sand p-8 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider">Order</p>
                  <p className="font-satoshi text-charcoal font-bold text-lg">{order.order_number}</p>
                </div>
                <span className={`text-xs font-satoshi font-medium px-3 py-1 rounded-full capitalize ${
                  order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                  'bg-honey-50 text-honey-700'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-satoshi text-earth mb-6">
                <span>Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="font-medium text-bark">{formatPrice(order.total)}</span>
              </div>

              {!['cancelled', 'refunded'].includes(order.status) && (
                <StatusTimeline currentStatus={order.status} />
              )}

              {order.tracking_number && (
                <div className="mt-6 p-4 bg-cream-warm rounded-xl border border-sand">
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="font-satoshi text-bark font-medium">{order.tracking_number}</p>
                  {order.tracking_url && (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-satoshi text-honey-500 text-sm hover:underline mt-1 inline-block">
                      Track on courier website →
                    </a>
                  )}
                </div>
              )}

              {order.items?.length > 0 && (
                <div className="mt-6 border-t border-sand pt-6">
                  <p className="font-satoshi text-bark font-semibold text-sm mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-satoshi text-bark text-sm">{item.product_name}</p>
                          <p className="font-satoshi text-earth text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-satoshi text-bark text-sm font-medium">{formatPrice(item.total)}</p>
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
