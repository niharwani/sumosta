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
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E5E7EB]" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-[#F97316] transition-all duration-1000"
        style={{ width: `${(Math.max(0, currentIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
      />

      {STATUS_STEPS.map((step, i) => {
        const Icon = STATUS_ICONS[step];
        const done = i <= currentIndex;
        const active = i === currentIndex;

        return (
          <div key={step} className="flex flex-col items-center gap-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              done ? 'bg-[#F97316]' : 'bg-[#E5E7EB]'
            } ${active ? 'ring-4 ring-orange-100' : ''}`}>
              <Icon size={15} className={done ? 'text-white' : 'text-gray-400'} />
            </div>
            <span className={`font-jakarta text-xs capitalize ${done ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
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
    `w-full border rounded-lg px-4 py-3 text-sm font-jakarta text-charcoal bg-white focus:outline-none transition-colors ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#F97316]'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-[148px] pb-20">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <Truck size={36} className="text-[#F97316] mx-auto mb-4" />
          <h1 className="font-jakarta font-bold text-charcoal text-3xl mb-2">Track Your Order</h1>
          <p className="font-jakarta text-gray-600 text-sm">Enter your order number and email to check the status</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm space-y-4">
          <div>
            <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">Order Number</label>
            <input
              {...register('orderNumber')}
              className={inputClass(!!errors.orderNumber)}
              placeholder="SUMO-000001"
            />
            {errors.orderNumber && (
              <p className="font-jakarta text-red-600 text-xs mt-1">{errors.orderNumber.message}</p>
            )}
          </div>
          <div>
            <label className="block font-jakarta text-charcoal text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={inputClass(!!errors.email)}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="font-jakarta text-red-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="font-jakarta text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 btn-pill-orange disabled:opacity-60"
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
              className="mt-6 bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-jakarta text-gray-600 text-xs uppercase tracking-wider">Order</p>
                  <p className="font-jakarta text-charcoal font-bold text-lg">{order.order_number}</p>
                </div>
                <span className={`text-xs font-jakarta font-medium px-3 py-1 rounded-full capitalize ${
                  order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                  'bg-orange-50 text-[#F97316]'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-jakarta text-gray-600 mb-6">
                <span>Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="font-medium text-charcoal">{formatPrice(order.total)}</span>
              </div>

              {!['cancelled', 'refunded'].includes(order.status) && (
                <StatusTimeline currentStatus={order.status} />
              )}

              {order.tracking_number && (
                <div className="mt-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#E5E7EB]">
                  <p className="font-jakarta text-gray-600 text-xs uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="font-jakarta text-charcoal font-medium">{order.tracking_number}</p>
                  {order.tracking_url && (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-jakarta text-[#F97316] text-sm hover:underline mt-1 inline-block">
                      Track on courier website →
                    </a>
                  )}
                </div>
              )}

              {order.items?.length > 0 && (
                <div className="mt-6 border-t border-[#E5E7EB] pt-6">
                  <p className="font-jakarta text-charcoal font-semibold text-sm mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-jakarta text-charcoal text-sm">{item.product_name}</p>
                          <p className="font-jakarta text-gray-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-jakarta text-charcoal text-sm font-medium">{formatPrice(item.total)}</p>
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
