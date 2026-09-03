'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, MapPin, Truck, Printer } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';
import { ordersApi, ApiError } from '@/lib/api';

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url: string | null;
}

interface Invoice {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
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
  tax?: number;
  total: number;
  coupon_code: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  paid_at: string | null;
  created_at: string;
  items: InvoiceItem[];
}

export default function InvoiceContent() {
  const paramsFromRoute = useParams<{ id: string }>();
  const pathname = usePathname();
  const id = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const source = pathname ?? window.location.pathname;
    const match  = source.match(/\/account\/orders\/([^/]+)\/invoice/);
    const raw    = match?.[1] ?? '';
    if (raw && raw !== '_placeholder' && raw !== 'shell') return decodeURIComponent(raw);
    const fallback = paramsFromRoute?.id;
    return fallback && fallback !== '_placeholder' && fallback !== 'shell' ? fallback : '';
  }, [pathname, paramsFromRoute?.id]);

  const isShellRoute = !id;

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn:  () => ordersApi.get(id) as Promise<Invoice>,
    enabled:  !!id && !isShellRoute,
    retry:    false,
  });

  const invoiceDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null;

  const estimatedText = order?.estimated_delivery_date
    ? new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : null;

  const paymentLabel = (() => {
    if (!order) return '';
    if (order.payment_status === 'captured') return 'Paid';
    if (order.payment_method === 'cod')       return 'Cash on delivery';
    return order.payment_status.replace('_', ' ');
  })();

  const paymentTone =
    order?.payment_status === 'captured'
      ? 'bg-sage-light text-sage'
      : order?.payment_status === 'pending'
      ? 'bg-honey-100 text-honey-600'
      : 'bg-terracotta-light text-terracotta';

  if (isShellRoute || isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading invoice">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  if (isError || !order) {
    const status = error instanceof ApiError ? error.status : undefined;
    const isForbidden = status === 403;
    return (
      <div className="min-h-screen bg-cream pt-8 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-cream-warm rounded-2xl border border-sand py-20 px-6">
          <p className="font-clash text-lg text-charcoal mb-2">
            {isForbidden ? "You don't have access to this invoice." : 'Invoice not found.'}
          </p>
          <p className="font-satoshi text-sm text-earth mb-6">
            {isForbidden
              ? 'This order belongs to a different account.'
              : "We couldn't load the invoice you're looking for."}
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-honey-400 hover:bg-honey-500 text-charcoal px-6 py-2.5 min-h-[44px] rounded-full transition-colors"
          >
            <ArrowLeft size={16} aria-hidden /> Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20 px-4 pt-8 md:pt-12 invoice-page">
      <div className="max-w-2xl mx-auto">
        {/* Toolbar — hidden on print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-2 font-satoshi text-sm text-earth hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to order
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-charcoal font-satoshi font-semibold text-sm px-5 py-2.5 min-h-[44px] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-honey-500"
          >
            <Printer size={15} aria-hidden />
            Print / Save PDF
          </button>
        </div>

        {/* Printable area */}
        <div id="invoice-print">
          {/* Hero — brand mark + Invoice label */}
          <div className="text-center mb-10">
            <p className="font-clash font-bold text-charcoal text-2xl tracking-[0.32em] mb-1">
              SUMOSTA
            </p>
            <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider">
              Nature&apos;s Golden Promise
            </p>

            <div className="mt-8">
              <p className="font-satoshi text-earth text-xs uppercase tracking-wider mb-1">
                Tax Invoice
              </p>
              <h1 className="font-clash font-bold text-charcoal text-3xl sm:text-4xl">
                INV-{order.order_number}
              </h1>
              {invoiceDate && (
                <p className="font-satoshi text-earth text-sm mt-2">
                  Issued {invoiceDate}
                </p>
              )}
            </div>
          </div>

          {/* Invoice summary card — same shape as order-confirmation card */}
          <div className="bg-cream-warm rounded-2xl border border-sand overflow-hidden print:border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-sand bg-honey-50">
              <div>
                <p className="font-satoshi text-earth text-xs uppercase tracking-wider">Order</p>
                <p className="font-clash font-bold text-charcoal text-lg">{order.order_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-satoshi text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${paymentTone}`}>
                  {paymentLabel}
                </span>
                <span className="font-satoshi text-xs font-semibold px-2.5 py-1 rounded-full bg-honey-100 text-honey-600 capitalize">
                  {order.status}
                </span>
              </div>
            </div>

            {estimatedText && (
              <div className="flex items-start gap-3 px-5 py-4 border-b border-sand">
                <Truck size={18} className="text-honey-500 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-satoshi text-xs text-earth uppercase tracking-wider">Estimated Delivery</p>
                  <p className="font-satoshi text-sm text-charcoal font-semibold">By {estimatedText}</p>
                  {order.tracking_number && (
                    <p className="font-satoshi text-xs text-bark mt-1">
                      Tracking: <span className="font-semibold">{order.tracking_number}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="p-5 border-b border-sand">
              <div className="flex items-center gap-2 mb-3">
                <Package size={15} className="text-earth" aria-hidden />
                <p className="font-satoshi text-xs text-earth uppercase tracking-wider font-semibold">
                  Items ({order.items.length})
                </p>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
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
                      <p className="font-satoshi font-semibold text-sm text-charcoal leading-tight">
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
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-satoshi text-sm text-sage font-semibold">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-satoshi text-sm text-bark">
                <span>Shipping</span>
                <span className={order.shipping_amount === 0 ? 'text-sage font-semibold' : ''}>
                  {order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}
                </span>
              </div>
              {typeof order.tax === 'number' && order.tax > 0 && (
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-satoshi text-xs text-earth-light pt-1">
                <span>Includes GST 5%</span>
                <span>{formatPrice(Math.round((order.total / 1.05) * 0.05 * 100) / 100)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sand">
                <span className="font-clash font-bold text-charcoal">Total</span>
                <span className="font-clash font-bold text-charcoal text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Billed to */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={15} className="text-earth" aria-hidden />
                <p className="font-satoshi text-xs text-earth uppercase tracking-wider font-semibold">Billed to</p>
              </div>
              <p className="font-satoshi text-sm text-charcoal font-semibold">{order.shipping_name}</p>
              <p className="font-satoshi text-xs text-earth">{order.shipping_phone}</p>
              <p className="font-satoshi text-sm text-bark leading-relaxed mt-1">
                {order.shipping_address_line1}
                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}
                <br />
                {order.shipping_city}, {order.shipping_state} – {order.shipping_pincode}
              </p>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center font-satoshi text-xs text-earth-light mt-6 leading-relaxed">
            support@sumosta.com  ·  sumosta.com
            <br />
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .invoice-page { padding: 0 !important; }
          #invoice-print { max-width: 100% !important; }
          header, footer, nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
