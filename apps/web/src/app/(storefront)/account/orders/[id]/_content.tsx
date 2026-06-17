'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, MapPin, CheckCircle, Star } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-red-50 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', body: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const token = localStorage.getItem('sumosta_access_token');
      const res = await fetch(`${API}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const token = localStorage.getItem('sumosta_access_token');
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, orderId: id, ...reviewData }),
      });
      return res.json();
    },
    onSuccess: () => {
      setReviewingItem(null);
      setReviewData({ rating: 5, title: '', body: '' });
    },
  });

  const order = data?.data;

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-earth">Order not found.</p>
        <Link href="/account/orders" className="font-satoshi text-honey-500 hover:underline mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isTerminal = ['cancelled', 'refunded'].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-earth hover:text-bark transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="font-satoshi text-charcoal font-semibold text-lg">{order.order_number}</h2>
        <span className={`text-xs font-satoshi font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {!isTerminal && (
        <div className="bg-white rounded-2xl border border-sand p-6">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-sand" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-honey-400 transition-all duration-1000"
              style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-honey-400' : 'bg-sand'} ${active ? 'ring-4 ring-honey-100' : ''}`}>
                    <Icon size={15} className={done ? 'text-midnight' : 'text-earth-light'} />
                  </div>
                  <span className={`font-satoshi text-xs ${done ? 'text-bark font-medium' : 'text-earth-light'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {order.tracking_number && (
            <div className="mt-6 pt-4 border-t border-sand flex items-center justify-between">
              <div>
                <p className="font-satoshi text-earth text-xs uppercase tracking-wider">Tracking Number</p>
                <p className="font-satoshi text-bark font-medium mt-0.5">{order.tracking_number}</p>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-satoshi text-sm text-honey-500 hover:underline">
                  Track on courier →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-sand p-6">
        <h3 className="font-satoshi text-bark font-semibold mb-4">Items</h3>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id}>
              <div className="flex items-start gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.product_name} className="w-16 h-16 rounded-xl object-cover bg-cream-warm" />
                )}
                <div className="flex-1">
                  <p className="font-satoshi text-bark font-medium text-sm">{item.product_name}</p>
                  {item.variant_name && <p className="font-satoshi text-earth text-xs">{item.variant_name}</p>}
                  <p className="font-satoshi text-earth text-xs mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-satoshi text-bark font-semibold text-sm">{formatPrice(item.line_total)}</p>
              </div>
              {order.status === 'delivered' && (
                <div className="mt-2 ml-20">
                  {reviewingItem === item.id ? (
                    <div className="bg-cream-warm rounded-xl p-4 space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setReviewData((d) => ({ ...d, rating: s }))}>
                            <Star size={18} className={s <= reviewData.rating ? 'text-honey-400 fill-honey-400' : 'text-sand fill-sand'} />
                          </button>
                        ))}
                      </div>
                      <input
                        value={reviewData.title}
                        onChange={(e) => setReviewData((d) => ({ ...d, title: e.target.value }))}
                        placeholder="Review title"
                        className="w-full border border-sand rounded-lg px-3 py-2 text-sm font-satoshi text-bark focus:outline-none focus:border-honey-400"
                      />
                      <textarea
                        value={reviewData.body}
                        onChange={(e) => setReviewData((d) => ({ ...d, body: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={3}
                        className="w-full border border-sand rounded-lg px-3 py-2 text-sm font-satoshi text-bark focus:outline-none focus:border-honey-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewMutation.mutate({ productId: item.product_id })}
                          disabled={!reviewData.body || reviewMutation.isPending}
                          className="font-satoshi text-xs font-semibold bg-honey-400 hover:bg-honey-500 text-midnight px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          Submit Review
                        </button>
                        <button onClick={() => setReviewingItem(null)} className="font-satoshi text-xs text-earth px-3 py-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingItem(item.id)}
                      className="font-satoshi text-xs text-honey-500 hover:text-honey-600 flex items-center gap-1"
                    >
                      <Star size={12} /> Write a review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-sand mt-6 pt-4 space-y-2">
          <div className="flex justify-between font-satoshi text-sm text-earth">
            <span>Subtotal</span><span className="text-bark">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-satoshi text-sm text-sage">
              <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-satoshi text-sm text-earth">
            <span>Shipping</span>
            <span className={order.shipping_amount === 0 ? 'text-sage font-medium' : 'text-bark'}>
              {order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between font-satoshi font-bold text-bark pt-2 border-t border-sand">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-2xl border border-sand p-6">
        <h3 className="font-satoshi text-bark font-semibold mb-3">Shipping to</h3>
        <p className="font-satoshi text-bark text-sm font-medium">{order.shipping_name}</p>
        <p className="font-satoshi text-earth text-sm">{order.shipping_phone}</p>
        <p className="font-satoshi text-earth text-sm mt-1 leading-relaxed">
          {order.shipping_address_line1}
          {order.shipping_address_line2 && `, ${order.shipping_address_line2}`}
          <br />
          {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
        </p>
      </div>
    </div>
  );
}
