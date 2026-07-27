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
        <p className="font-jakarta text-gray-600">Order not found.</p>
        <Link href="/account/orders" className="font-jakarta text-[#F97316] hover:underline mt-2 inline-block">
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
        <Link href="/account/orders" className="text-gray-500 hover:text-charcoal transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="font-jakarta text-charcoal font-bold text-lg">{order.order_number}</h2>
        <span className={`text-xs font-jakarta font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {!isTerminal && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E5E7EB]" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-[#F97316] transition-all duration-1000"
              style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-[#F97316]' : 'bg-[#E5E7EB]'} ${active ? 'ring-4 ring-orange-100' : ''}`}>
                    <Icon size={15} className={done ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <span className={`font-jakarta text-xs ${done ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {order.tracking_number && (
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <p className="font-jakarta text-gray-500 text-xs uppercase tracking-wider">Tracking Number</p>
                <p className="font-jakarta text-charcoal font-medium mt-0.5">{order.tracking_number}</p>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-jakarta text-sm text-[#F97316] hover:underline">
                  Track on courier →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h3 className="font-jakarta text-charcoal font-bold mb-4">Items</h3>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id}>
              <div className="flex items-start gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.product_name} className="w-16 h-16 rounded-xl object-cover bg-[#F5F1E9]" />
                )}
                <div className="flex-1">
                  <p className="font-jakarta text-charcoal font-medium text-sm">{item.product_name}</p>
                  {item.variant_name && <p className="font-jakarta text-gray-500 text-xs">{item.variant_name}</p>}
                  <p className="font-jakarta text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-jakarta text-charcoal font-semibold text-sm">{formatPrice(item.line_total)}</p>
              </div>
              {order.status === 'delivered' && (
                <div className="mt-2 ml-20">
                  {reviewingItem === item.id ? (
                    <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setReviewData((d) => ({ ...d, rating: s }))}>
                            <Star size={18} className={s <= reviewData.rating ? 'text-[#F97316] fill-[#F97316]' : 'text-[#E5E7EB] fill-[#E5E7EB]'} />
                          </button>
                        ))}
                      </div>
                      <input
                        value={reviewData.title}
                        onChange={(e) => setReviewData((d) => ({ ...d, title: e.target.value }))}
                        placeholder="Review title"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm font-jakarta text-charcoal focus:outline-none focus:border-[#F97316]"
                      />
                      <textarea
                        value={reviewData.body}
                        onChange={(e) => setReviewData((d) => ({ ...d, body: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={3}
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm font-jakarta text-charcoal focus:outline-none focus:border-[#F97316] resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewMutation.mutate({ productId: item.product_id })}
                          disabled={!reviewData.body || reviewMutation.isPending}
                          className="font-jakarta text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-full disabled:opacity-50 transition-colors"
                        >
                          Submit Review
                        </button>
                        <button onClick={() => setReviewingItem(null)} className="font-jakarta text-xs text-gray-500 px-3 py-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingItem(item.id)}
                      className="font-jakarta text-xs text-[#F97316] hover:text-[#EA580C] flex items-center gap-1"
                    >
                      <Star size={12} /> Write a review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[#E5E7EB] mt-6 pt-4 space-y-2">
          <div className="flex justify-between font-jakarta text-sm text-gray-600">
            <span>Subtotal</span><span className="text-charcoal">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-jakarta text-sm text-green-600">
              <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-jakarta text-sm text-gray-600">
            <span>Shipping</span>
            <span className={order.shipping_amount === 0 ? 'text-green-600 font-medium' : 'text-charcoal'}>
              {order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between font-jakarta font-bold text-charcoal pt-2 border-t border-[#E5E7EB]">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h3 className="font-jakarta text-charcoal font-bold mb-3">Shipping to</h3>
        <p className="font-jakarta text-charcoal text-sm font-medium">{order.shipping_name}</p>
        <p className="font-jakarta text-gray-500 text-sm">{order.shipping_phone}</p>
        <p className="font-jakarta text-gray-500 text-sm mt-1 leading-relaxed">
          {order.shipping_address_line1}
          {order.shipping_address_line2 && `, ${order.shipping_address_line2}`}
          <br />
          {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
        </p>
      </div>
    </div>
  );
}
