'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ChevronDown, Tag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatPrice } from '@/lib/utils';
import CouponInput from '@/components/cart/CouponInput';
import { couponsApi } from '@/lib/api';
import { MAX_COUPONS_DEFAULT, MAX_COUPONS_WITH_FIRST_ORDER, PREPAID_COUPON_CODE } from '@/stores/cart-store';
import type { Coupon } from 'shared';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli and Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const AVAILABLE_COUPONS = [
  { code: 'PREPAID5',  label: '5% off on prepaid orders',      color: '#FFF0D6', border: '#F5A623', text: '#A66A10' },
  { code: 'WELCOME10', label: '10% off for new customers',     color: '#F0FAF0', border: '#BBE0BB', text: '#2E6B2E' },
  { code: 'COMBO10',   label: '10% off on combo purchases',    color: '#EEF2FF', border: '#C7D2FE', text: '#4338CA' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  padding: '12px 14px',
  fontFamily: 'var(--font-manrope), sans-serif',
  fontSize: '14px',
  color: '#2C2417',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-manrope), sans-serif',
  fontSize: '12px',
  fontWeight: 600,
  color: '#5C4A32',
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: 'var(--font-bricolage), sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  color: '#2C2417',
  margin: '0 0 16px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(229,231,235,0.7)',
};

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, couponDiscounts, coupons, addCoupon, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pincode: '',
  });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [chipLoading, setChipLoading] = useState<string | null>(null);
  const [chipError, setChipError] = useState<{ code: string; msg: string } | null>(null);

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

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingTop: '7rem' }} />;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6 bg-[#FAF7F2]">
        <ShoppingBag size={64} className="text-[#E5E7EB]" />
        <h1 className="font-jakarta font-bold text-charcoal text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="btn-pill-orange">Browse Products</Link>
      </div>
    );
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const applyCode = async (code: string) => {
    if (coupons.some((c) => c.code === code)) return; // already applied
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
      // Stacking check
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

  const handlePay = async () => {
    if (!isFormValid) return;
    setPaying(true);
    setPayError('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
      const token = typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shippingAddress: {
            name:     form.name,
            phone:    form.phone,
            line1:    form.address1,
            line2:    form.address2,
            city:     form.city,
            state:    form.state,
            pincode:  form.pincode,
          },
          couponCodes: coupons.map((c) => c.code),
          email: form.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setPayError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setPayError('Could not reach payment server. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const afterDiscount = Math.max(0, subtotal - discount);
  const toFreeShipping = Math.max(0, 499 - afterDiscount);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingTop: '6rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Back */}
        <Link
          href="/cart"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-manrope), sans-serif', fontSize: '13px',
            color: '#8B7355', textDecoration: 'none', marginBottom: '24px',
          }}
        >
          <ArrowLeft size={14} /> Back to Cart
        </Link>

        <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '26px', color: '#2C2417', margin: '0 0 28px' }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="checkout-grid">

          {/* ── Left: Form ─────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Contact */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(229,231,235,0.8)', padding: '24px' }}>
              <h2 style={sectionHeadStyle}>Contact Information</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} placeholder="Rahul Sharma" value={form.name} onChange={set('name')} className="co-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className="co-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input style={inputStyle} type="tel" placeholder="9876543210" maxLength={10} value={form.phone} onChange={set('phone')} className="co-input" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(229,231,235,0.8)', padding: '24px' }}>
              <h2 style={sectionHeadStyle}>Shipping Address</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Address Line 1 *</label>
                  <input style={inputStyle} placeholder="Flat / House No., Building, Street" value={form.address1} onChange={set('address1')} className="co-input" />
                </div>
                <div>
                  <label style={labelStyle}>Address Line 2</label>
                  <input style={inputStyle} placeholder="Area, Colony, Landmark (optional)" value={form.address2} onChange={set('address2')} className="co-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="two-col">
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input style={inputStyle} placeholder="Mumbai" value={form.city} onChange={set('city')} className="co-input" />
                  </div>
                  <div>
                    <label style={labelStyle}>Pincode *</label>
                    <input style={inputStyle} placeholder="400001" maxLength={6} value={form.pincode} onChange={set('pincode')} className="co-input" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={form.state}
                      onChange={set('state')}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                      className="co-input"
                    >
                      <option value="">Select state…</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B7355', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Available coupons */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(229,231,235,0.8)', padding: '24px' }}>
              <h2 style={sectionHeadStyle}>Offers &amp; Coupons</h2>

              {/* Clickable offer chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {AVAILABLE_COUPONS.map((offer) => {
                  const isApplied = coupons.some((c) => c.code === offer.code);
                  const isLoading = chipLoading === offer.code;
                  const err = chipError?.code === offer.code ? chipError.msg : null;
                  return (
                    <div key={offer.code}>
                      <button
                        onClick={() => isApplied ? removeCoupon(offer.code) : applyCode(offer.code)}
                        disabled={isLoading}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isApplied ? offer.color : '#FAFAFA',
                          border: `1px ${isApplied ? 'solid' : 'dashed'} ${isApplied ? offer.border : '#D1D5DB'}`,
                          borderRadius: '10px', padding: '10px 14px',
                          cursor: isLoading ? 'wait' : 'pointer',
                          textAlign: 'left', transition: 'all 0.15s',
                          opacity: isLoading ? 0.6 : 1,
                        }}
                        className={`offer-chip ${isApplied ? 'applied' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Tag size={13} color={isApplied ? offer.text : '#9CA3AF'} />
                          <div>
                            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 700, fontSize: '13px', color: isApplied ? offer.text : '#374151', margin: 0, letterSpacing: '0.04em' }}>
                              {offer.code}
                            </p>
                            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: isApplied ? offer.text : '#6B7280', margin: 0 }}>
                              {offer.label}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', fontWeight: 600,
                          color: isApplied ? offer.text : '#9CA3AF',
                          background: isApplied ? 'white' : 'transparent',
                          border: isApplied ? `1px solid ${offer.border}` : 'none',
                          borderRadius: '999px', padding: isApplied ? '3px 10px' : '0',
                          whiteSpace: 'nowrap',
                        }}>
                          {isLoading ? '…' : isApplied ? '✓ Applied' : 'Tap to apply'}
                        </span>
                      </button>
                      {err && (
                        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: '#C4573A', margin: '4px 0 0 14px' }}>
                          {err}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <CouponInput />
            </div>
          </div>

          {/* ── Right: Order summary + pay ──────────────────────────────────────── */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(229,231,235,0.8)', padding: '24px', position: 'sticky', top: '110px' }}>
              <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '18px', color: '#2C2417', margin: '0 0 18px' }}>
                Order Summary
              </h2>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid rgba(229,231,235,0.6)', maxHeight: '220px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? 'default'}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '13px', color: '#5C4A32', flex: 1, lineHeight: 1.4 }}>
                      {item.product.name}
                      {item.variant && <span style={{ color: '#C4B39A' }}> · {item.variant.name}</span>}
                      <span style={{ color: '#C4B39A' }}> × {item.quantity}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '13px', fontWeight: 600, color: '#2C2417', whiteSpace: 'nowrap' }}>
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-manrope), sans-serif', fontSize: '14px', color: '#5C4A32' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscounts.map((cd) => (
                  <div key={cd.code} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-manrope), sans-serif', fontSize: '14px', color: '#4A8F4A', fontWeight: 600 }}>
                    <span>Coupon ({cd.code})</span>
                    <span>−{formatPrice(cd.amount)}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-manrope), sans-serif', fontSize: '14px', color: '#5C4A32' }}>
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#4A8F4A' : undefined, fontWeight: shipping === 0 ? 700 : undefined }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Free shipping nudge */}
              {toFreeShipping > 0 && (
                <div style={{ background: '#FFF9F0', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px' }}>
                  <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '12px', color: '#A66A10', margin: 0 }}>
                    Add {formatPrice(toFreeShipping)} more for free shipping!
                  </p>
                </div>
              )}

              {/* Total */}
              <div style={{ borderTop: '1px solid rgba(229,231,235,0.6)', paddingTop: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: '15px', color: '#2C2417' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '26px', color: '#2C2417' }}>{formatPrice(total)}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: '#C4B39A', textAlign: 'right', margin: '3px 0 0' }}>
                  Inclusive of all taxes
                </p>
              </div>

              {/* Error */}
              {payError && (
                <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '13px', color: '#C4573A', background: '#FDE8E3', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
                  {payError}
                </p>
              )}

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={!isFormValid || paying}
                style={{
                  width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
                  background: isFormValid ? '#5A3B8C' : '#E5E7EB',
                  color: isFormValid ? 'white' : '#9CA3AF',
                  fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '15px',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'background 0.2s', marginBottom: '10px',
                  opacity: paying ? 0.7 : 1,
                }}
                className="pay-btn"
              >
                {paying ? (
                  'Processing…'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.15"/>
                      <path d="M12 20C12 15.58 15.58 12 20 12C22.76 12 25.19 13.39 26.66 15.52L23.5 17.44C22.64 16.26 21.4 15.5 20 15.5C17.52 15.5 15.5 17.52 15.5 20C15.5 22.48 17.52 24.5 20 24.5C21.4 24.5 22.64 23.74 23.5 22.56L26.66 24.48C25.19 26.61 22.76 28 20 28C15.58 28 12 24.42 12 20Z" fill="white"/>
                    </svg>
                    Pay {formatPrice(total)} with PhonePe
                  </>
                )}
              </button>

              {!isFormValid && (
                <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: '#C4B39A', textAlign: 'center', margin: 0 }}>
                  Fill in all required fields to continue
                </p>
              )}

              <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '11px', color: '#C4B39A', textAlign: 'center', margin: '8px 0 0' }}>
                🔒 Secured by PhonePe · UPI · Cards · Net Banking
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr 360px !important; }
          .two-col { grid-template-columns: 1fr 1fr !important; }
        }
        .co-input:focus { border-color: #F5A623 !important; }
        .pay-btn:hover:not(:disabled) { background: #3D2870 !important; }
        .offer-chip:hover:not(:disabled):not(.applied) { background: #F5F5F5 !important; border-color: #C4B39A !important; }
        .offer-chip.applied:hover:not(:disabled) { filter: brightness(0.97); }
      `}</style>
    </div>
  );
}
