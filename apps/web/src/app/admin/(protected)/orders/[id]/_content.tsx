'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function authHeaders() {
  const token = localStorage.getItem('sumosta_access_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped:    'bg-blue-50 text-blue-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-red-50 text-red-700',
};

export default function AdminOrderDetailPage() {
  const [id, setId] = useState('_placeholder');
  const qc = useQueryClient();

  useEffect(() => {
    const match = window.location.pathname.match(/\/admin\/orders\/([^/]+)/);
    if (match?.[1]) setId(match[1]);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/orders/${id}`, { headers: authHeaders() });
      return res.json();
    },
    enabled: !!id && id !== '_placeholder',
  });

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`${API}/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const order = data?.data;

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-gray-400">Order not found</p>
        <Link href="/admin/orders" className="font-satoshi text-honey-500 hover:underline mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-satoshi text-gray-800 font-semibold">{order.order_number}</h1>
        <span className={`text-xs font-satoshi font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
        <Link
          href={`/admin/invoices/${id}`}
          className="ml-auto flex items-center gap-1.5 text-xs font-satoshi text-honey-600 hover:text-honey-700 font-medium"
        >
          <FileText size={13} /> View Invoice
        </Link>
      </div>

      <div className="grid gap-5">
        {/* Status Update */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">Update Status</h2>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateMutation.mutate(s)}
                disabled={order.status === s || updateMutation.isPending}
                className={`font-satoshi text-xs px-3 py-1.5 rounded-lg capitalize transition-colors disabled:opacity-40 ${
                  order.status === s
                    ? 'bg-honey-400 text-midnight font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                )}
                <div className="flex-1">
                  <p className="font-satoshi text-gray-800 text-sm font-medium">{item.product_name}</p>
                  {item.variant_name && <p className="font-satoshi text-gray-400 text-xs">{item.variant_name}</p>}
                  <p className="font-satoshi text-gray-400 text-xs">SKU: {item.sku} · Qty: {item.quantity}</p>
                </div>
                <p className="font-satoshi text-gray-800 text-sm font-semibold">{formatPrice(item.line_total)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-1.5">
            <div className="flex justify-between font-satoshi text-sm text-gray-500">
              <span>Subtotal</span><span className="text-gray-700">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between font-satoshi text-sm text-green-600">
                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-satoshi text-sm text-gray-500">
              <span>Shipping</span>
              <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between font-satoshi font-bold text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-3">Customer</h2>
            <p className="font-satoshi text-gray-800 text-sm font-medium">{order.shipping_name}</p>
            <p className="font-satoshi text-gray-500 text-sm">{order.shipping_phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-3">Ship to</h2>
            <p className="font-satoshi text-gray-600 text-sm leading-relaxed">
              {order.shipping_address_line1}
              {order.shipping_address_line2 && <><br />{order.shipping_address_line2}</>}
              <br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-3">Payment</h2>
          <div className="grid grid-cols-3 gap-4 text-sm font-satoshi">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Status</p>
              <p className={`font-medium capitalize ${order.payment_status === 'captured' ? 'text-green-600' : 'text-gray-600'}`}>
                {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Method</p>
              <p className="text-gray-700">PhonePe</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Paid at</p>
              <p className="text-gray-700">
                {order.paid_at ? new Date(order.paid_at).toLocaleString('en-IN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
