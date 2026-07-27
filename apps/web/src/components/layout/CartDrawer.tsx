'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { isOpen, items, itemCount, subtotal, shipping, closeCart, updateQuantity, removeItem } =
    useCartStore();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(26,21,14,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          width: 'min(420px, 100%)',
          background: '#FFFDF8',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.25,0.1,0.25,1)',
          boxShadow: '-8px 0 40px rgba(26,21,14,0.12)',
          fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(139,115,85,0.15)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '18px', color: '#2C2417', margin: 0 }}>
            Cart
            {itemCount > 0 && (
              <span style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 400, fontSize: '14px', color: '#8B7355', marginLeft: '8px' }}>
                ({itemCount})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#5C4A32', lineHeight: 1, padding: '4px' }}
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.2 }}>🛍</div>
              <p style={{ color: '#8B7355', fontSize: '15px', margin: 0 }}>Your cart is empty</p>
              <Link
                href="/shop"
                onClick={closeCart}
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: '#D4891A',
                  color: '#FFFDF8',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                {/* Image */}
                <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: '#FDF6EC', flexShrink: 0 }}>
                  {item.product.images?.[0]?.url && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2417', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name}
                  </p>
                  {item.variant && (
                    <p style={{ fontSize: '12px', color: '#8B7355', margin: '0 0 6px' }}>{item.variant.name}</p>
                  )}
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#D4891A', margin: '0 0 8px' }}>
                    {formatPrice(item.unitPrice)}
                  </p>

                  {/* Qty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      style={{ width: '24px', height: '24px', border: '1px solid rgba(139,115,85,0.3)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#5C4A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#2C2417', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      style={{ width: '24px', height: '24px', border: '1px solid rgba(139,115,85,0.3)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#5C4A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Line total + remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#2C2417' }}>
                    {formatPrice(item.lineTotal)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    aria-label="Remove item"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#C4B39A', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(139,115,85,0.15)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5C4A32' }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#5C4A32' }}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? '#7C9A6E' : undefined, fontWeight: shipping === 0 ? 600 : undefined }}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                style={{
                  display: 'block',
                  padding: '14px 24px',
                  background: '#D4891A',
                  color: '#FFFDF8',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-bricolage), sans-serif',
                }}
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#5C4A32',
                  border: '1px solid rgba(139,115,85,0.3)',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
