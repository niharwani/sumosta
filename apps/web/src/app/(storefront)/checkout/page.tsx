'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Tag, LogIn, ShoppingBag, Info, Truck, Lock, CreditCard, Wallet } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice } from '@/lib/utils';
import CouponInput from '@/components/cart/CouponInput';
import { couponsApi } from '@/lib/api';
import { tracker } from '@/lib/tracker';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { INDIAN_STATES } from '@/lib/constants';
import { MAX_COUPONS_DEFAULT, MAX_COUPONS_WITH_FIRST_ORDER, PREPAID_COUPON_CODE } from '@/stores/cart-store';
import type { Coupon } from 'shared';

// Razorpay Checkout is loaded via a <Script> tag; declare its global for TS.
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
    onTurnstileVerify?: (token: string) => void;
    turnstile?: {
      render: (el: HTMLElement | string, opts: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

// Coerce an API error field (which may be a string, a ZodError object, or missing)
// into a user-facing string.
function errText(err: unknown, fallback: string): string {
  if (typeof err === 'string' && err.trim()) return err;
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; issues?: Array<{ message?: string; path?: unknown[] }> };
    if (typeof e.message === 'string') return e.message;
    if (Array.isArray(e.issues) && e.issues[0]?.message) {
      const first = e.issues[0];
      const field = Array.isArray(first.path) ? first.path.join('.') : '';
      return field ? `${field}: ${first.message}` : first.message!;
    }
  }
  return fallback;
}

const AVAILABLE_COUPONS: { code: string; label: string }[] = [
  { code: 'PREPAID5',  label: '5% off on prepaid orders' },
  { code: 'WELCOME10', label: '10% off for new customers' },
  { code: 'COMBO10',   label: '10% off on combo purchases' },
];

const inputClass =
  'w-full border border-sand rounded-lg px-3.5 py-3 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-400/30 transition-all';
const labelClass =
  'font-satoshi text-[12px] font-semibold text-bark mb-1.5 block uppercase tracking-[0.05em]';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, couponDiscounts, coupons, addCoupon, removeCoupon, clearCart } = useCartStore();
  const { user, isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pincode: '',
  });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [chipLoading, setChipLoading] = useState<string | null>(null);
  const [chipError, setChipError] = useState<{ code: string; msg: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileMounted = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setForm((f) => ({
        ...f,
        name:  user.name  ?? '',
        email: user.email ?? '',
        phone: (user as any).phone ?? '',
      }));
    }
  }, [user]);

  // Pincode → city/state autofill (debounced 400ms) using postalpincode.in
  useEffect(() => {
    if (!/^\d{6}$/.test(form.pincode)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        const office = json?.[0]?.PostOffice?.[0];
        if (office?.District && office?.State) {
          setForm((f) => ({ ...f, city: f.city || office.District, state: f.state || office.State }));
        }
      } catch {
        /* silent — user can fill manually */
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [form.pincode]);

  // Fire begin_checkout once when the page mounts with items
  const beginCheckoutFired = useRef(false);
  useEffect(() => {
    if (!mounted || beginCheckoutFired.current || items.length === 0) return;
    beginCheckoutFired.current = true;
    tracker?.track('begin_checkout', {
      cartTotal:  total,
      itemCount:  items.reduce((n, i) => n + i.quantity, 0),
      couponCodes: coupons.map((c) => c.code),
    });
  }, [mounted, items, total, coupons]);

  // Cloudflare Turnstile setup: register callback + render when script + container ready
  useEffect(() => {
    if (!turnstileSiteKey) {
      // no-op if the sitekey isn't set — pay button remains usable
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('[checkout] NEXT_PUBLIC_TURNSTILE_SITE_KEY not set — Turnstile disabled.');
      }
      return;
    }
    if (typeof window === 'undefined') return;

    window.onTurnstileVerify = (token: string) => setTurnstileToken(token);

    const tryRender = () => {
      if (turnstileMounted.current) return;
      const el = document.getElementById('cf-turnstile');
      if (el && window.turnstile) {
        try {
          window.turnstile.render(el, {
            sitekey: turnstileSiteKey,
            callback: 'onTurnstileVerify',
            theme: 'light',
          });
          turnstileMounted.current = true;
        } catch {
          /* ignore double-render */
        }
      } else {
        setTimeout(tryRender, 300);
      }
    };
    tryRender();
  }, [turnstileSiteKey]);

  if (!mounted) return <div className="min-h-screen bg-cream" />;

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex flex-col items-center justify-center gap-6 text-center px-6 bg-cream py-20">
        <ShoppingBag size={64} strokeWidth={1} className="text-earth-light" aria-hidden />
        <h1 className="font-clash font-bold text-charcoal text-3xl">Your cart is empty</h1>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Auth gate — checkout requires a signed-in customer.
  if (isInitialized && !user) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center px-6 py-20 bg-cream">
        <div className="w-full max-w-md bg-cream-warm rounded-2xl border border-sand p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-honey-100 mx-auto mb-4 flex items-center justify-center">
            <LogIn size={22} className="text-honey-600" aria-hidden />
          </div>
          <h1 className="font-clash font-bold text-charcoal text-2xl mb-2">Please sign in to place your order</h1>
          <p className="font-satoshi text-earth text-sm mb-6">
            Signing in lets us save your order to your account so you can track it, reorder easily, and access support.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/auth/login?next=${encodeURIComponent('/checkout')}`)}
              className="w-full inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm rounded-full px-6 py-3 transition-colors min-h-[44px]"
            >
              Sign in to continue
            </button>
            <button
              onClick={() => router.push(`/auth/register?next=${encodeURIComponent('/checkout')}`)}
              className="w-full inline-flex items-center justify-center bg-cream border border-sand hover:border-honey-400 text-charcoal font-satoshi font-semibold text-sm rounded-full px-6 py-3 transition-colors min-h-[44px]"
            >
              Create an account
            </button>
            <Link
              href="/cart"
              className="font-satoshi text-xs text-earth hover:text-charcoal mt-1"
            >
              ← Back to cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Waiting on auth init
  if (!isInitialized) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center bg-cream">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const applyCode = async (code: string) => {
    if (coupons.some((c) => c.code === code)) return;
    setChipLoading(code);
    setChipError(null);
    try {
      const cartItems = items.map((i) => ({ name: i.product.name, quantity: i.quantity }));
      const res = await couponsApi.validate(code, subtotal, cartItems);
      if (!res.valid || !res.coupon) {
        setChipError({ code, msg: res.error ?? 'Cannot apply this coupon.' });
        return;
      }
      const coupon = res.coupon as Coupon;
      const hasFirstOrder = coupons.some((c) => c.isFirstOrderOnly) || coupon.isFirstOrderOnly;
      const max = hasFirstOrder ? MAX_COUPONS_WITH_FIRST_ORDER : MAX_COUPONS_DEFAULT;
      if (coupon.code !== PREPAID_COUPON_CODE && coupons.length >= max) {
        setChipError({ code, msg: `Max ${max} coupons allowed.` });
        return;
      }
      addCoupon(coupon);
    } catch {
      setChipError({ code, msg: 'Failed to apply. Try manually.' });
    } finally {
      setChipLoading(null);
    }
  };

  const isFormValid =
    form.name && form.email && form.phone.length >= 10 &&
    form.address1 && form.city && form.state && form.pincode.length === 6;

  // If Turnstile is configured, require a verified token before enabling pay
  const turnstileOk = !turnstileSiteKey || !!turnstileToken;

  const shippingPayload = () => ({
    name:    form.name,
    phone:   form.phone,
    line1:   form.address1,
    line2:   form.address2 || null,
    city:    form.city,
    state:   form.state,
    pincode: form.pincode,
  });

  const handleCodPay = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
    const token = typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;
    const res = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        shippingAddress: shippingPayload(),
        couponCodes:     coupons.map((c) => c.code),
        email:           form.email,
        paymentMethod:   'cod',
      }),
    });
    const data = await res.json();
    if (data.success && data.data?.orderId) {
      clearCart();
      const oid = data.data.orderId;
      window.location.href = `/order-confirmation/${oid}/?orderId=${encodeURIComponent(oid)}&email=${encodeURIComponent(form.email)}`;
    } else {
      setPayError(errText(data.error, 'Could not place COD order. Please try again.'));
    }
  };

  const handleRazorpayPay = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      setPayError('Payment is not configured. Please contact support.');
      return;
    }
    if (typeof window === 'undefined' || !window.Razorpay) {
      setPayError('Payment library is still loading. Please try again in a moment.');
      return;
    }
    const token = localStorage.getItem('sumosta_access_token');

    const createRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        shippingAddress: shippingPayload(),
        couponCodes:     coupons.map((c) => c.code),
        email:           form.email,
        items: items.map((i) => ({
          productId:   i.productId,
          variantId:   i.variantId ?? null,
          quantity:    i.quantity,
          unitPrice:   i.unitPrice,
          productName: i.product.name,
        })),
      }),
    });
    const created = await createRes.json();
    if (!createRes.ok || !created.success) {
      setPayError(errText(created.error, 'Could not start payment. Please try again.'));
      return;
    }
    const { orderId, razorpayOrderId, amount, currency } = created.data as {
      orderId: string; razorpayOrderId: string; amount: number; currency: string;
    };

    await new Promise<void>((resolve) => {
      const rzp = new window.Razorpay({
        key:       keyId,
        amount,
        currency,
        name:      'SUMOSTA',
        description: 'Order payment',
        order_id:  razorpayOrderId,
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: form.phone,
        },
        notes: { orderId },
        theme: { color: '#F5A623' },
        modal: {
          ondismiss: () => {
            setPayError('Payment cancelled. Your order is still saved — you can retry.');
            setPaying(false);
            resolve();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                orderId,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verified = await verifyRes.json();
            if (verifyRes.ok && verified.success) {
              clearCart();
              const finalOid = verified.data.orderId ?? orderId;
              window.location.href = `/order-confirmation/${finalOid}/?orderId=${encodeURIComponent(finalOid)}&email=${encodeURIComponent(form.email)}`;
            } else {
              setPayError(errText(verified.error, 'Payment verification failed. Please contact support.'));
            }
          } catch {
            setPayError('Could not verify payment. Please contact support.');
          } finally {
            resolve();
          }
        },
      });

      rzp.on('payment.failed', (resp: unknown) => {
        const r = resp as { error?: { description?: string } };
        setPayError(r.error?.description ?? 'Payment failed. Please try again.');
        setPaying(false);
        resolve();
      });

      rzp.open();
    });
  };

  const handlePay = async () => {
    if (!isFormValid || !turnstileOk) return;
    setPaying(true);
    setPayError('');
    try {
      if (paymentMethod === 'cod') {
        await handleCodPay();
      } else {
        await handleRazorpayPay();
      }
    } catch {
      setPayError('Could not reach payment server. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const COD_FEE = 69;
  const afterDiscount = Math.max(0, subtotal - discount);
  const toFreeShipping = Math.max(0, 499 - afterDiscount);
  const codHandlingFee = paymentMethod === 'cod' ? COD_FEE : 0;
  const grandTotal = total + codHandlingFee;

  const canPay = isFormValid && turnstileOk;

  return (
    <div className="bg-cream min-h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {turnstileSiteKey && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      )}
      <div className="max-w-[1100px] mx-auto px-6 md:px-8 pt-8 pb-24">
        {/* Back */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 font-satoshi text-sm text-earth hover:text-honey-500 transition-colors mb-6"
        >
          <ArrowLeft size={14} aria-hidden /> Back to Cart
        </Link>

        <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-7">
          Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* Left: Form */}
          <div className="flex flex-col gap-5">
            {/* Contact */}
            <section className="bg-cream-warm rounded-2xl border border-sand p-6">
              <h2 className="font-clash font-bold text-charcoal text-base mb-4 pb-3 border-b border-sand">
                Contact Information
              </h2>
              <div className="grid gap-3.5">
                <div>
                  <label htmlFor="co-name" className={labelClass}>Full Name *</label>
                  <input id="co-name" className={inputClass} placeholder="Rahul Sharma" value={form.name} onChange={set('name')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="co-email" className={labelClass}>Email *</label>
                    <input id="co-email" type="email" className={inputClass} placeholder="you@example.com" value={form.email} onChange={set('email')} />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className={labelClass}>Phone *</label>
                    <input id="co-phone" type="tel" className={inputClass} placeholder="9876543210" maxLength={10} value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-cream-warm rounded-2xl border border-sand p-6">
              <h2 className="font-clash font-bold text-charcoal text-base mb-4 pb-3 border-b border-sand">
                Shipping Address
              </h2>
              <div className="grid gap-3.5">
                <div>
                  <label htmlFor="co-addr1" className={labelClass}>Address Line 1 *</label>
                  <input id="co-addr1" className={inputClass} placeholder="Flat / House No., Building, Street" value={form.address1} onChange={set('address1')} />
                </div>
                <div>
                  <label htmlFor="co-addr2" className={labelClass}>Address Line 2</label>
                  <input id="co-addr2" className={inputClass} placeholder="Area, Colony, Landmark (optional)" value={form.address2} onChange={set('address2')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="co-pincode" className={labelClass}>Pincode *</label>
                    <input
                      id="co-pincode"
                      className={inputClass}
                      placeholder="400001"
                      maxLength={6}
                      value={form.pincode}
                      onChange={set('pincode')}
                      inputMode="numeric"
                      aria-describedby="pincode-hint"
                    />
                    <p id="pincode-hint" className="font-satoshi text-[11px] text-earth mt-1">
                      City & state auto-fill from pincode
                    </p>
                  </div>
                  <div>
                    <label htmlFor="co-city" className={labelClass}>City *</label>
                    <input id="co-city" className={inputClass} placeholder="Mumbai" value={form.city} onChange={set('city')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="co-state" className={labelClass}>State *</label>
                  <div className="relative">
                    <select
                      id="co-state"
                      value={form.state}
                      onChange={set('state')}
                      className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                    >
                      <option value="">Select state…</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth pointer-events-none" aria-hidden />
                  </div>
                </div>
              </div>
            </section>

            {/* Offers & Coupons */}
            <section className="bg-cream-warm rounded-2xl border border-sand p-6">
              <h2 className="font-clash font-bold text-charcoal text-base mb-4 pb-3 border-b border-sand">
                Offers & Coupons
              </h2>

              <div className="flex flex-col gap-2 mb-4">
                {AVAILABLE_COUPONS.map((offer) => {
                  const isApplied = coupons.some((c) => c.code === offer.code);
                  const isLoading = chipLoading === offer.code;
                  const err = chipError?.code === offer.code ? chipError.msg : null;
                  return (
                    <div key={offer.code}>
                      <button
                        onClick={() => isApplied ? removeCoupon(offer.code) : applyCode(offer.code)}
                        disabled={isLoading}
                        aria-pressed={isApplied}
                        className={`w-full flex items-center justify-between text-left rounded-lg px-3.5 py-3 transition-all min-h-[44px] ${
                          isApplied
                            ? 'bg-cream-warm border border-honey-400'
                            : 'bg-cream border border-dashed border-sand hover:border-honey-400'
                        } ${isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Tag size={13} className={isApplied ? 'text-honey-600' : 'text-earth-light'} aria-hidden />
                          <div>
                            <p className={`font-satoshi font-bold text-[13px] tracking-[0.04em] m-0 ${
                              isApplied ? 'text-honey-600' : 'text-charcoal'
                            }`}>
                              {offer.code}
                            </p>
                            <p className={`font-satoshi text-[11px] m-0 ${
                              isApplied ? 'text-honey-600' : 'text-earth'
                            }`}>
                              {offer.label}
                            </p>
                          </div>
                        </div>
                        <span className={`font-satoshi text-xs font-semibold whitespace-nowrap ${
                          isApplied
                            ? 'text-honey-600 bg-cream border border-honey-400 rounded-full px-2.5 py-0.5'
                            : 'text-earth-light'
                        }`}>
                          {isLoading ? '…' : isApplied ? '✓ Applied' : 'Tap to apply'}
                        </span>
                      </button>
                      {err && (
                        <p role="alert" className="font-satoshi text-[11px] text-terracotta mt-1 ml-3.5">
                          {err}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <CouponInput />
            </section>
          </div>

          {/* Right: Order summary + pay */}
          <div>
            <div className="bg-cream-warm rounded-2xl border border-sand p-6 sticky top-[calc(var(--header-height)+1rem)]">
              <h2 className="font-clash font-bold text-charcoal text-lg mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="flex flex-col gap-2.5 mb-4 pb-4 border-b border-sand max-h-[220px] overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? 'default'}`} className="flex justify-between gap-2 items-start">
                    <span className="font-satoshi text-[13px] text-bark flex-1 leading-tight">
                      {item.product.name}
                      {item.variant && <span className="text-earth-light"> · {item.variant.name}</span>}
                      <span className="text-earth-light"> × {item.quantity}</span>
                    </span>
                    <span className="font-satoshi text-[13px] font-semibold text-charcoal whitespace-nowrap">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2.5 mb-4">
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscounts.map((cd) => (
                  <div key={cd.code} className="flex justify-between font-satoshi text-sm text-sage font-semibold">
                    <span>Coupon ({cd.code})</span>
                    <span>−{formatPrice(cd.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage font-bold' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Free shipping nudge */}
              {toFreeShipping > 0 && (
                <div className="bg-honey-50 border border-honey-200 rounded-lg px-3.5 py-2 mb-3.5 flex items-center gap-2">
                  <Truck size={13} className="text-honey-500 shrink-0" aria-hidden />
                  <p className="font-satoshi text-xs text-honey-600 m-0">
                    Add {formatPrice(toFreeShipping)} more for free shipping.
                  </p>
                </div>
              )}

              {/* COD handling fee line */}
              {paymentMethod === 'cod' && (
                <div className="flex justify-between font-satoshi text-sm text-bark mb-2.5">
                  <span>COD Handling Fee</span>
                  <span className="text-terracotta font-semibold">+{formatPrice(COD_FEE)}</span>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-sand pt-4 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="font-satoshi font-semibold text-[15px] text-charcoal">Total</span>
                  <span className="font-clash font-bold text-[26px] text-charcoal">{formatPrice(grandTotal)}</span>
                </div>
                <p className="font-satoshi text-[11px] text-earth-light text-right mt-1">
                  Inclusive of all taxes{paymentMethod === 'cod' ? ' · Incl. ₹69 COD fee' : ''}
                </p>
              </div>

              {/* Payment method selector — using Radix-less radio group pattern */}
              <div className="flex flex-col gap-2 mb-4" role="radiogroup" aria-label="Payment method">
                <p className="font-satoshi text-xs font-bold text-bark m-0 mb-1 uppercase tracking-[0.05em]">
                  Payment Method
                </p>

                {/* Online payment */}
                <label
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-3 cursor-pointer transition-all border ${
                    paymentMethod === 'online'
                      ? 'bg-honey-50 border-honey-400'
                      : 'bg-cream border-sand hover:border-earth-light'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'online' ? 'border-honey-500 bg-honey-500' : 'border-earth-light bg-cream'
                    }`}
                  >
                    {paymentMethod === 'online' && (
                      <span className="w-1.5 h-1.5 bg-cream rounded-full block" />
                    )}
                  </span>
                  <CreditCard size={16} className={paymentMethod === 'online' ? 'text-honey-600' : 'text-earth'} aria-hidden />
                  <div className="flex-1">
                    <p className="font-satoshi font-bold text-[13px] text-charcoal m-0">Pay Online</p>
                    <p className="font-satoshi text-[11px] text-earth m-0">UPI · Cards · Net Banking · Wallets</p>
                  </div>
                  <span className="ml-auto font-satoshi text-[11px] font-bold text-sage bg-sage-light border border-sage/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                    Save with PREPAID5
                  </span>
                </label>

                {/* COD */}
                <label
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-3 cursor-pointer transition-all border ${
                    paymentMethod === 'cod'
                      ? 'bg-honey-50 border-honey-400'
                      : 'bg-cream border-sand hover:border-earth-light'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'cod' ? 'border-honey-500 bg-honey-500' : 'border-earth-light bg-cream'
                    }`}
                  >
                    {paymentMethod === 'cod' && (
                      <span className="w-1.5 h-1.5 bg-cream rounded-full block" />
                    )}
                  </span>
                  <Wallet size={16} className={paymentMethod === 'cod' ? 'text-honey-600' : 'text-earth'} aria-hidden />
                  <div className="flex-1">
                    <p className="font-satoshi font-bold text-[13px] text-charcoal m-0">Cash on Delivery</p>
                    <p className="font-satoshi text-[11px] text-earth m-0">Pay when your order arrives · +₹69 handling fee</p>
                  </div>
                </label>

                {/* PREPAID5 nudge when COD is selected */}
                {paymentMethod === 'cod' && (
                  <div className="bg-honey-100 border border-honey-400 rounded-lg px-3.5 py-2.5 flex items-start gap-2.5">
                    <Info size={16} className="text-honey-600 shrink-0 mt-0.5" aria-hidden />
                    <div className="flex-1">
                      <p className="font-satoshi font-bold text-[13px] text-honey-600 m-0 mb-0.5">
                        Save 5% by paying online.
                      </p>
                      <p className="font-satoshi text-xs text-earth m-0">
                        Switch to online payment and use code{' '}
                        <strong className="text-honey-600 tracking-[0.04em]">PREPAID5</strong>{' '}
                        to get 5% off. No COD fee either.
                      </p>
                    </div>
                    <button
                      onClick={() => setPaymentMethod('online')}
                      className="ml-auto shrink-0 font-satoshi text-xs font-bold text-honey-600 bg-cream border border-honey-400 hover:bg-honey-50 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap"
                    >
                      Switch →
                    </button>
                  </div>
                )}
              </div>

              {/* Turnstile widget */}
              {turnstileSiteKey && (
                <div className="mb-3">
                  <div id="cf-turnstile" className="cf-turnstile" />
                </div>
              )}

              {/* Error */}
              {payError && (
                <p role="alert" className="font-satoshi text-sm text-terracotta bg-terracotta-light rounded-lg px-3.5 py-2.5 mb-3.5">
                  {payError}
                </p>
              )}

              {/* Pay button — unified honey styling regardless of method */}
              <button
                onClick={handlePay}
                disabled={!canPay || paying}
                className={`w-full py-3.5 rounded-full font-satoshi font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors mb-2.5 min-h-[44px] ${
                  canPay && !paying
                    ? 'bg-honey-500 hover:bg-honey-600 text-cream shadow-honey'
                    : 'bg-sand text-earth-light cursor-not-allowed'
                } ${paying ? 'opacity-70' : ''}`}
              >
                {paying ? (
                  'Processing…'
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Wallet size={16} aria-hidden />
                    Place Order — Pay {formatPrice(grandTotal)} on Delivery
                  </>
                ) : (
                  <>
                    <Lock size={16} aria-hidden />
                    Pay {formatPrice(grandTotal)} Securely
                  </>
                )}
              </button>

              {!isFormValid && (
                <p className="font-satoshi text-[11px] text-earth-light text-center m-0">
                  Fill in all required fields to continue
                </p>
              )}
              {isFormValid && !turnstileOk && turnstileSiteKey && (
                <p className="font-satoshi text-[11px] text-earth-light text-center m-0">
                  Complete the security check to continue
                </p>
              )}

              <p className="font-satoshi text-[11px] text-earth-light text-center mt-2 inline-flex items-center justify-center gap-1.5 w-full">
                <Lock size={11} aria-hidden />
                {paymentMethod === 'cod'
                  ? 'Secure COD · Pay cash when your order arrives'
                  : 'Secured by Razorpay · UPI · Cards · Net Banking · Wallets'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
