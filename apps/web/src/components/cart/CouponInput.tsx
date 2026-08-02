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
    setMsg(`${resolved.code} applied! You save ₹${discount}.`);
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F0FAF0',
                  border: '1px solid #BBE0BB',
                  borderRadius: '999px',
                  padding: '5px 10px 5px 8px',
                }}
              >
                <Tag size={11} color="#4A8F4A" />
                <span
                  style={{
                    fontFamily: 'var(--font-satoshi), var(--font-manrope), sans-serif',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: '#2E6B2E',
                    letterSpacing: '0.05em',
                  }}
                >
                  {c.code}
                </span>
                {disc && (
                  <span
                    style={{
                      fontFamily: 'var(--font-satoshi), var(--font-manrope), sans-serif',
                      fontSize: '11px',
                      color: '#4A8F4A',
                      fontWeight: 500,
                    }}
                  >
                    −₹{disc.amount}
                  </span>
                )}
                <button
                  onClick={() => handleRemove(c.code)}
                  aria-label={`Remove coupon ${c.code}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4A8F4A',
                    opacity: 0.7,
                  }}
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
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setStatus('idle');
            setMsg('');
          }}
          placeholder="Coupon code"
          className="flex-1 border border-[#E5E7EB] rounded-full px-4 py-2.5 font-jakarta text-sm text-charcoal bg-white focus:outline-none focus:border-[#F97316]"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={status === 'loading' || !code.trim()}
          className="bg-charcoal text-white font-jakarta text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '…' : 'Apply'}
        </button>
      </div>

      {/* Status message */}
      {msg && (
        <p className={`font-jakarta text-xs ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
