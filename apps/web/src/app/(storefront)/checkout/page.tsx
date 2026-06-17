'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/stores/cart-store';
import { checkoutApi } from '@/lib/api';
import { checkoutSchema, type CheckoutInput } from 'shared';
import { formatPrice } from '@/lib/utils';
import { INDIAN_STATES } from '@/lib/constants';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, coupon } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema as any) });

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true);
    setError('');
    try {
      const result = await checkoutApi.create({
        ...data,
        couponCode: coupon?.code,
      });
      window.location.href = result.paymentUrl;
    } catch (e: any) {
      setError(e.message ?? 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="font-satoshi text-earth">Your cart is empty.</p>
        <a href="/shop" className="text-honey-500 font-satoshi text-sm underline">Shop Now</a>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-[900px] mx-auto px-6 md:px-8">
        <h1 className="font-clash text-charcoal font-bold text-4xl mb-10">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            {/* Left: Form */}
            <div className="flex flex-col gap-8">
              {/* Contact */}
              <section>
                <h2 className="font-satoshi text-charcoal font-semibold text-sm uppercase tracking-wider mb-4">Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email?.message}>
                    <input {...register('email')} type="email" placeholder="you@example.com" className={fieldClass} />
                  </Field>
                  <Field label="Phone" error={errors.phone?.message}>
                    <input {...register('phone')} placeholder="10-digit mobile number" className={fieldClass} />
                  </Field>
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="font-satoshi text-charcoal font-semibold text-sm uppercase tracking-wider mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.shippingAddress?.name?.message}>
                    <input {...register('shippingAddress.name')} placeholder="Name on order" className={fieldClass} />
                  </Field>
                  <Field label="Phone" error={errors.shippingAddress?.phone?.message}>
                    <input {...register('shippingAddress.phone')} placeholder="Delivery phone" className={fieldClass} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 1" error={errors.shippingAddress?.addressLine1?.message}>
                      <input {...register('shippingAddress.addressLine1')} placeholder="House / flat / street" className={fieldClass} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 2 (Optional)" error={undefined}>
                      <input {...register('shippingAddress.addressLine2')} placeholder="Landmark, area" className={fieldClass} />
                    </Field>
                  </div>
                  <Field label="City" error={errors.shippingAddress?.city?.message}>
                    <input {...register('shippingAddress.city')} placeholder="City" className={fieldClass} />
                  </Field>
                  <Field label="Pincode" error={errors.shippingAddress?.pincode?.message}>
                    <input {...register('shippingAddress.pincode')} placeholder="6-digit pincode" maxLength={6} className={fieldClass} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="State" error={errors.shippingAddress?.state?.message}>
                      <select {...register('shippingAddress.state')} className={fieldClass}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>

              {error && (
                <div className="bg-terracotta-light border border-terracotta/30 rounded-md px-4 py-3">
                  <p className="font-satoshi text-terracotta text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div>
              <div className="bg-cream-warm rounded-xl p-6 sticky top-24">
                <h2 className="font-clash text-charcoal font-bold text-lg mb-5">Order Summary</h2>

                <div className="flex flex-col gap-3 mb-5 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex justify-between font-satoshi text-sm text-bark gap-3">
                      <span className="truncate">{item.product.name} × {item.quantity}</span>
                      <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-sand pt-4 mb-5">
                  <div className="flex justify-between font-satoshi text-sm text-bark">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-satoshi text-sm text-sage">
                      <span>Discount ({coupon?.code})</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-satoshi text-sm text-bark">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-sage' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-clash text-charcoal font-bold text-lg border-t border-sand pt-2">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-honey-400 text-midnight font-satoshi font-semibold py-4 rounded-md hover:bg-honey-500 transition-colors disabled:opacity-70"
                >
                  {loading ? (
                    <><HoneycombLoader size="sm" /> Processing...</>
                  ) : (
                    `Pay ${formatPrice(total)} with PhonePe`
                  )}
                </button>

                <p className="font-satoshi text-earth-light text-xs text-center mt-3">
                  Secured by PhonePe. We accept UPI, cards, netbanking.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-satoshi text-charcoal text-xs font-medium block mb-1.5">{label}</label>
      {children}
      {error && <p className="font-satoshi text-terracotta text-xs mt-1">{error}</p>}
    </div>
  );
}

const fieldClass = 'w-full border border-sand rounded-md px-4 py-3 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-100 transition-all';
