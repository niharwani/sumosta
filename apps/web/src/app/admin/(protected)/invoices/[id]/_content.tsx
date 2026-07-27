'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function InvoicePrintArea({ order }: { order: any }) {
  const issueDate   = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNo   = `INV-${order.order_number}`;
  const subtotal    = order.subtotal ?? 0;
  const discount    = order.discount ?? 0;
  const shipping    = order.shipping_amount ?? 0;
  const total       = order.total ?? 0;
  const taxIncl     = Math.round((total / 1.05) * 0.05 * 100) / 100;

  return (
    <div id="invoice-print" className="bg-white p-10 max-w-3xl mx-auto font-satoshi text-gray-800 print:p-8 print:shadow-none">
      <div className="flex justify-between items-start pb-8 border-b border-gray-200">
        <div>
          <p className="text-2xl font-bold tracking-widest text-midnight">SUMOSTA</p>
          <p className="text-xs text-gray-400 mt-0.5">Nature&apos;s Golden Promise</p>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            support@sumosta.com<br />
            sumosta.com
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Invoice</p>
          <p className="text-xl font-bold text-gray-800">{invoiceNo}</p>
          <p className="text-xs text-gray-400 mt-2">Date: {issueDate}</p>
          <p className="text-xs text-gray-400">
            Payment:{' '}
            <span className={order.payment_status === 'captured' ? 'text-green-600 font-medium' : 'text-red-500'}>
              {order.payment_status === 'captured' ? 'Paid' : order.payment_status}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Bill To</p>
          <p className="font-semibold text-gray-800">{order.shipping_name}</p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {order.shipping_address_line1}
            {order.shipping_address_line2 && <><br />{order.shipping_address_line2}</>}
            <br />
            {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
          </p>
          {order.shipping_phone && (
            <p className="text-sm text-gray-400 mt-1">{order.shipping_phone}</p>
          )}
          {(order.user_email || order.guest_email) && (
            <p className="text-sm text-gray-400">{order.user_email ?? order.guest_email}</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Order Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 w-28">Order #</span>
              <span className="text-gray-700 font-medium">{order.order_number}</span>
            </div>
            {order.tracking_number && (
              <div className="flex gap-2">
                <span className="text-gray-400 w-28">Tracking</span>
                <span className="text-gray-700">{order.tracking_number}</span>
              </div>
            )}
            {order.coupon_code && (
              <div className="flex gap-2">
                <span className="text-gray-400 w-28">Coupon</span>
                <span className="text-gray-700">{order.coupon_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <table className="w-full mt-8 text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-gray-400 text-xs uppercase tracking-wider font-medium">Item</th>
            <th className="text-right py-2 text-gray-400 text-xs uppercase tracking-wider font-medium">Qty</th>
            <th className="text-right py-2 text-gray-400 text-xs uppercase tracking-wider font-medium">Unit Price</th>
            <th className="text-right py-2 text-gray-400 text-xs uppercase tracking-wider font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item: any) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-3 pr-4">
                <p className="font-medium text-gray-800">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-400">{item.variant_name}</p>
                )}
                <p className="text-xs text-gray-400">SKU: {item.sku}</p>
              </td>
              <td className="py-3 text-right text-gray-700">{item.quantity}</td>
              <td className="py-3 text-right text-gray-700">{formatPrice(item.unit_price)}</td>
              <td className="py-3 text-right font-medium text-gray-800">{formatPrice(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-xs">
            <span>GST incl. (5%)</span>
            <span>{formatPrice(taxIncl)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 text-base">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          Thank you for your order! For queries: support@sumosta.com · sumosta.com
        </p>
        <p className="text-xs text-gray-300 mt-1">
          SUMOSTA — This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
}

export default function InvoiceContent() {
  const [id, setId] = useState('_placeholder');

  useEffect(() => {
    const match = window.location.pathname.match(/\/admin\/invoices\/([^/]+)/);
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

  const order = data?.data;

  if (isLoading) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-gray-400">Order not found</p>
        <Link href="/admin/invoices" className="font-satoshi text-honey-500 hover:underline mt-2 inline-block">
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/invoices" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={16} />
          <span className="font-satoshi text-sm">Back to Invoices</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden print:border-0 print:rounded-none">
        <InvoicePrintArea order={order} />
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
