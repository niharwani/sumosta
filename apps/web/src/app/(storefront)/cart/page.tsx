'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import CouponInput from '@/components/cart/CouponInput';

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    itemCount,
    coupon,
    updateQuantity,
    removeItem,
  } = useCartStore();

  // Prevent SSR/hydration mismatch — cart is pure client state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingTop: '7rem' }} />;
  }

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FAF7F2',
          paddingTop: '7rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          textAlign: 'center',
          padding: '7rem 24px 80px',
        }}
      >
        <div style={{ fontSize: '72px', opacity: 0.12, lineHeight: 1 }}>
          <ShoppingBag size={72} strokeWidth={1} color="#2C2417" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 700,
              fontSize: '26px',
              color: '#2C2417',
              margin: '0 0 8px',
            }}
          >
            Your cart is empty
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-manrope), sans-serif',
              color: '#8B7355',
              fontSize: '14px',
              margin: 0,
            }}
          >
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link href="/shop" className="btn-pill-orange">
          Browse Products
        </Link>
      </div>
    );
  }

  // ─── Amount needed for free shipping ────────────────────────────────────────
  const afterDiscount = Math.max(0, subtotal - discount);
  const toFreeShipping = Math.max(0, 499 - afterDiscount);

  // ─── Full cart ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingTop: '7rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 700,
              fontSize: '28px',
              color: '#2C2417',
              margin: '0 0 4px',
            }}
          >
            My Cart
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-manrope), sans-serif',
              color: '#8B7355',
              fontSize: '14px',
              margin: 0,
            }}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Grid: items + summary */}
        <div className="cart-page-grid">

          {/* ─── Items column ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid rgba(229,231,235,0.8)',
                  padding: '20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.product.slug}`}
                  style={{
                    position: 'relative',
                    width: '88px',
                    height: '88px',
                    minWidth: '88px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#FDF6EC',
                    display: 'block',
                    textDecoration: 'none',
                  }}
                >
                  {item.product.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="88px"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        opacity: 0.25,
                      }}
                    >
                      🍯
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name + remove */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <Link
                      href={`/product/${item.product.slug}`}
                      style={{
                        fontFamily: 'var(--font-manrope), sans-serif',
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#2C2417',
                        textDecoration: 'none',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      aria-label={`Remove ${item.product.name}`}
                      className="cart-remove-btn"
                      style={{
                        background: 'none',
                        border: '1px solid rgba(229,231,235,0.8)',
                        cursor: 'pointer',
                        color: '#C4B39A',
                        borderRadius: '8px',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'color 0.2s, border-color 0.2s',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Variant */}
                  {item.variant && (
                    <p
                      style={{
                        fontFamily: 'var(--font-manrope), sans-serif',
                        fontSize: '12px',
                        color: '#8B7355',
                        margin: '0 0 6px',
                      }}
                    >
                      {item.variant.name}
                    </p>
                  )}

                  {/* Price */}
                  <p
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#D4891A',
                      margin: '0 0 12px',
                    }}
                  >
                    {formatPrice(item.unitPrice)}
                  </p>

                  {/* Qty controls + line total */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid rgba(139,115,85,0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        width: 'fit-content',
                      }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#5C4A32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        className="qty-btn"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        style={{
                          padding: '0 10px',
                          fontFamily: 'var(--font-manrope), sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#2C2417',
                          minWidth: '28px',
                          textAlign: 'center',
                          userSelect: 'none',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#5C4A32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        className="qty-btn"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-manrope), sans-serif',
                        fontWeight: 700,
                        fontSize: '16px',
                        color: '#2C2417',
                      }}
                    >
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping link */}
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-manrope), sans-serif',
                fontSize: '13px',
                color: '#8B7355',
                textDecoration: 'none',
                padding: '4px 0',
                transition: 'color 0.2s',
              }}
              className="continue-shopping-link"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ─── Summary column ───────────────────────────────────────────────── */}
          <div>
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                border: '1px solid rgba(229,231,235,0.8)',
                padding: '24px',
                position: 'sticky',
                top: '120px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#2C2417',
                  margin: '0 0 20px',
                }}
              >
                Order Summary
              </h2>

              {/* Coupon input */}
              <div
                style={{
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(229,231,235,0.6)',
                }}
              >
                <CouponInput />
              </div>

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-manrope), sans-serif',
                    fontSize: '14px',
                    color: '#5C4A32',
                  }}
                >
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {coupon && discount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontSize: '14px',
                      color: '#7C9A6E',
                      fontWeight: 600,
                    }}
                  >
                    <span>Discount ({coupon.code})</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-manrope), sans-serif',
                    fontSize: '14px',
                    color: '#5C4A32',
                  }}
                >
                  <span>Shipping</span>
                  <span
                    style={{
                      color: shipping === 0 ? '#7C9A6E' : undefined,
                      fontWeight: shipping === 0 ? 700 : undefined,
                    }}
                  >
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Free shipping nudge */}
              {toFreeShipping > 0 && (
                <div
                  style={{
                    background: '#FFF9F0',
                    border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontSize: '12px',
                      color: '#A66A10',
                      margin: 0,
                    }}
                  >
                    Add {formatPrice(toFreeShipping)} more for free shipping!
                  </p>
                </div>
              )}

              {/* Total */}
              <div
                style={{
                  borderTop: '1px solid rgba(229,231,235,0.6)',
                  paddingTop: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#2C2417',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-bricolage), sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      color: '#2C2417',
                    }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope), sans-serif',
                    fontSize: '11px',
                    color: '#C4B39A',
                    textAlign: 'right',
                    margin: '4px 0 0',
                  }}
                >
                  Taxes included
                </p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '15px 24px',
                  background: '#D4891A',
                  color: '#FFFDF8',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '0.02em',
                  marginBottom: '12px',
                  transition: 'background 0.2s ease',
                  boxSizing: 'border-box',
                }}
                className="checkout-cta"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>

              {/* Trust note */}
              <p
                style={{
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontSize: '11px',
                  color: '#C4B39A',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                🔒 Secure checkout • Free returns within 7 days
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .cart-page-grid {
            grid-template-columns: 1fr 360px;
          }
        }
        .cart-remove-btn:hover {
          color: #C4573A !important;
          border-color: rgba(196,87,58,0.3) !important;
        }
        .qty-btn:hover {
          background: rgba(139,115,85,0.06) !important;
        }
        .checkout-cta:hover {
          background: #A66A10 !important;
        }
        .continue-shopping-link:hover {
          color: #D4891A !important;
        }
      `}</style>
    </div>
  );
}
