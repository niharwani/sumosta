'use client';
import { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { couponsApi } from '@/lib/api';
import { useCartStore, MAX_COUPONS_DEFAULT, MAX_COUPONS_WITH_FIRST_ORDER, PREPAID_COUPON_CODE } from '@/stores/cart-store';
import type { Coupon } from 'shared';

function validateStacking(
  newCoupon: Coupon,
  applied: Coupon[],
): { allowed: boolean; reason?: string } {
  if (applied.some((c) => c.code === newCoupon.code)) {
    return { allowed: false, reason: 'This coupon is already applied.' };
  }

  // PREPAID5 is always allowed regardless of count
  if (newCoupon.code === PREPAID_COUPON_CODE) {
    return { allowed: true };
  }

  const hasFirstOrderCoupon =
    applied.some((c) => c.isFirstOrderOnly) || newCoupon.isFirstOrderOnly;
  const maxCoupons = hasFirstOrderCoupon
    ? MAX_COUPONS_WITH_FIRST_ORDER
    : MAX_COUPONS_DEFAULT;

  if (applied.length >= maxCoupons) {
    return {
      allowed: false,
      reason: `Maximum ${maxCoupons} coupon${maxCoupons > 1 ? 's' : ''} allowed${hasFirstOrderCoupon ? ' when using WELCOME10' : ''}.`,
    };
  }

  return { allowed: true };
}

export default function CouponInput() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const { coupons, couponDiscounts, subtotal, items, addCoupon, removeCoupon } = useCartStore();

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setStatus('loading');

    let resolved: Coupon | null = null;

    try {
      const cartItems = items.map((i) => ({ name: i.product.name, quantity: i.quantity }));
      const res = await couponsApi.validate(trimmed, subtotal, cartItems);
      if (res.valid && res.coupon) {
        resolved = res.coupon as Coupon;
      } else {
        setStatus('error');
        setMsg(res.error ?? 'Invalid or expired coupon code.');
        return;
      }
    } catch {
      setStatus('error');
      setMsg('Could not reach the server. Please try again.');
      return;
    }

    // Validate stacking rules client-side
    const check = validateStacking(resolved, coupons);
    if (!check.allowed) {
      setStatus('error');
      setMsg(check.reason ?? 'Cannot apply this coupon.');
      return;
    }

    addCoupon(resolved);
    const discount =
      resolved.type === 'percentage'
        ? Math.round((subtotal * resolved.value) / 100)
        : resolved.value;
    setStatus('success');
    setMsg(`${resolved.code} applied. You save ₹${discount}.`);
    setCode('');
  };

  const handleRemove = (couponCode: string) => {
    removeCoupon(couponCode);
    setStatus('idle');
    setMsg('');
  };

  return (
    <div className="space-y-3">
      {/* Applied coupon chips */}
      {coupons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {coupons.map((c) => {
            const disc = couponDiscounts.find((d) => d.code === c.code);
            return (
              <div
                key={c.code}
                className="inline-flex items-center gap-1.5 bg-sage-light border border-sage/30 rounded-full py-1 pl-2 pr-2.5"
              >
                <Tag size={11} className="text-sage" />
                <span className="font-satoshi font-bold text-xs text-charcoal tracking-wider">
                  {c.code}
                </span>
                {disc && (
                  <span className="font-satoshi text-[11px] text-sage font-medium">
                    −₹{disc.amount}
                  </span>
                )}
                <button
                  onClick={() => handleRemove(c.code)}
                  aria-label={`Remove coupon ${c.code}`}
                  className="flex items-center text-sage opacity-70 hover:opacity-100 transition-opacity min-w-[16px] min-h-[16px]"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="coupon-input">Coupon code</label>
        <input
          id="coupon-input"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setStatus('idle');
            setMsg('');
          }}
          placeholder="Coupon code"
          className="flex-1 border border-sand rounded-full px-4 py-2.5 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-400/30 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={status === 'loading' || !code.trim()}
          className="bg-honey-500 hover:bg-honey-600 text-cream font-satoshi text-sm font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {status === 'loading' ? '…' : 'Apply'}
        </button>
      </div>

      {/* Status message */}
      {msg && (
        <p
          role="status"
          className={`font-satoshi text-xs ${status === 'success' ? 'text-sage' : 'text-terracotta'}`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
