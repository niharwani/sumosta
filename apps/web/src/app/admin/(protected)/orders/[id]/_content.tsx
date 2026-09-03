'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, FileText, Truck, RotateCcw, XCircle, ExternalLink, AlertCircle, IndianRupee, Clock } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

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
  const [refundOpen, setRefundOpen]         = useState(false);
  const [refundAmount, setRefundAmount]     = useState<string>('');
  const [refundReason, setRefundReason]     = useState('');
  const [refundError,  setRefundError]      = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const match = window.location.pathname.match(/\/admin\/orders\/([^/]+)/);
    if (match?.[1]) setId(match[1]);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}`);
      return res.json();
    },
    enabled: !!id && id !== '_placeholder',
  });

  const { data: historyData } = useQuery({
    queryKey: ['admin-order-history', id],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}/history`);
      return res.json();
    },
    enabled: !!id && id !== '_placeholder',
  });

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error ?? `Update failed (${res.status})`);
      }
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-order-history', id] });
    },
  });

  const retryShipmentMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}/shipment/retry`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const cancelShipmentMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}/shipment/cancel`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const refundMutation = useMutation({
    mutationFn: async (body: { amount?: number; reason: string }) => {
      const res = await adminFetch(`${API}/api/admin/orders/${id}/refund`, {
        method: 'POST',
        body:   JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error ?? `Refund failed (${res.status})`);
      }
      return json;
    },
    onSuccess: () => {
      setRefundOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setRefundError(null);
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-order-history', id] });
    },
    onError: (err: unknown) => {
      setRefundError(err instanceof Error ? err.message : 'Refund failed');
    },
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
                onClick={() => {
                  // Destructive transitions get a confirm gate — cancel/refund
                  // reverses stock and (for refunded) can be user-visible.
                  if (s === 'cancelled' || s === 'refunded') {
                    const message = s === 'refunded'
                      ? 'Mark this order as refunded? Stock will be restored to inventory. This does NOT trigger a payment refund — use the "Refund" button for that.'
                      : 'Cancel this order? Stock will be restored to inventory. The customer will not be automatically notified.';
                    if (!window.confirm(message)) return;
                  }
                  updateMutation.mutate(s);
                }}
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
          {updateMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-satoshi text-red-700">
              {(updateMutation.error as Error)?.message ?? 'Update failed'}
            </div>
          )}
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
              <p className="text-gray-700 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method || '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Paid at</p>
              <p className="text-gray-700">
                {order.paid_at ? new Date(order.paid_at).toLocaleString('en-IN') : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Refund — only for Razorpay-captured orders that aren't already refunded */}
        {order.payment_method === 'razorpay'
          && order.payment_status === 'captured'
          && order.status !== 'refunded' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <IndianRupee size={14} /> Refund
                </h2>
                <p className="font-satoshi text-gray-400 text-xs">
                  Refunds go back to the customer&apos;s original payment method via Razorpay (5–7 days).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRefundAmount(String(order.total));
                  setRefundReason('');
                  setRefundError(null);
                  setRefundOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-satoshi font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50"
              >
                <IndianRupee size={12} /> Refund
              </button>
            </div>
          </div>
        )}
        {(order.payment_status === 'refunded' || order.payment_status === 'partially_refunded') && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="font-satoshi text-red-700 text-sm font-medium">
              {order.payment_status === 'refunded'
                ? 'This order has been fully refunded.'
                : 'This order has been partially refunded.'}
            </p>
          </div>
        )}

        {/* Shipping / Shiprocket */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck size={14} /> Shipping
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => retryShipmentMutation.mutate()}
                disabled={retryShipmentMutation.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-satoshi font-medium text-honey-600 hover:text-honey-700 px-2.5 py-1.5 rounded-lg border border-honey-200 hover:bg-honey-50 disabled:opacity-50"
                title={order.awb_code ? 'Force-reassign AWB' : 'Create Shiprocket shipment for this order'}
              >
                <RotateCcw size={12} />
                {retryShipmentMutation.isPending ? 'Retrying…' : order.awb_code ? 'Reassign AWB' : 'Create shipment'}
              </button>
              {order.awb_code && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Cancel this shipment on Shiprocket? The order stays as-is.')) {
                      cancelShipmentMutation.mutate();
                    }
                  }}
                  disabled={cancelShipmentMutation.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-satoshi font-medium text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={12} />
                  {cancelShipmentMutation.isPending ? 'Cancelling…' : 'Cancel shipment'}
                </button>
              )}
            </div>
          </div>

          {retryShipmentMutation.isError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-satoshi text-red-700">
              Retry failed. Check the API logs for the exact Shiprocket error.
            </div>
          )}
          {retryShipmentMutation.data && !retryShipmentMutation.data.success && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-satoshi text-red-700">
              Retry failed: {retryShipmentMutation.data.error ?? 'unknown error'}
            </div>
          )}

          {!order.awb_code && !order.shiprocket_shipment_id ? (
            <div className="flex items-start gap-2.5 text-sm font-satoshi text-gray-600">
              <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="m-0">No Shiprocket shipment yet.</p>
                {order.shipment_last_error && (
                  <p className="mt-1 text-xs text-red-600 m-0">
                    Last error: {order.shipment_last_error}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 m-0">
                  Automation runs on payment confirmation. Use “Create shipment” above to trigger manually if it didn&apos;t fire.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-satoshi">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Courier</p>
                <p className="text-gray-800 font-medium">{order.courier_name ?? 'Pending'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">AWB</p>
                <p className="text-gray-800 font-medium font-mono text-[13px]">
                  {order.awb_code ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Status</p>
                <p className="text-gray-800 font-medium">
                  {order.shipment_status ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Shiprocket ID</p>
                <p className="text-gray-800 font-medium font-mono text-[13px]">
                  {order.shiprocket_shipment_id ?? '—'}
                </p>
              </div>
              {order.tracking_url && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-100">
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-honey-600 hover:text-honey-700"
                  >
                    Open tracking page <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {order.shipment_last_error && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-100">
                  <p className="text-xs text-red-600 m-0">
                    Last error: {order.shipment_last_error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refund confirm dialog — plain overlay (admin panel doesn't use Radix) */}
      {refundOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => !refundMutation.isPending && setRefundOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-satoshi text-gray-800 font-semibold text-lg mb-1">
              Refund order {order.order_number}
            </h3>
            <p className="font-satoshi text-gray-400 text-xs mb-4">
              Order total: {formatPrice(order.total)}. Leave the amount as-is for a full refund.
            </p>

            <label className="block font-satoshi text-gray-600 text-xs uppercase tracking-wider mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={order.total}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              disabled={refundMutation.isPending}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-satoshi text-gray-800 focus:outline-none focus:border-honey-400 mb-4"
            />

            <label className="block font-satoshi text-gray-600 text-xs uppercase tracking-wider mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Damaged in transit — full refund requested by customer"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              disabled={refundMutation.isPending}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-satoshi text-gray-800 focus:outline-none focus:border-honey-400 mb-4 resize-none"
            />

            {refundError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-satoshi text-red-700">
                {refundError}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRefundOpen(false)}
                disabled={refundMutation.isPending}
                className="font-satoshi text-sm text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const amountNum = Number(refundAmount);
                  if (!Number.isFinite(amountNum) || amountNum <= 0) {
                    setRefundError('Enter a valid amount.');
                    return;
                  }
                  if (amountNum > order.total + 0.01) {
                    setRefundError('Refund cannot exceed the order total.');
                    return;
                  }
                  if (refundReason.trim().length < 3) {
                    setRefundError('Please provide a reason (min 3 characters).');
                    return;
                  }
                  const isFull = Math.abs(amountNum - order.total) < 0.01;
                  refundMutation.mutate({
                    amount: isFull ? undefined : amountNum,
                    reason: refundReason.trim(),
                  });
                }}
                disabled={refundMutation.isPending}
                className="font-satoshi text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {refundMutation.isPending ? 'Refunding…' : 'Confirm refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
