'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { HONEY_EASE_OUT } from '@/lib/animations';
import CouponInput from '@/components/cart/CouponInput';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const FREE_SHIPPING_THRESHOLD = 499;

export default function CartDrawer() {
  const {
    isOpen,
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const asideRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [couponOpen, setCouponOpen] = useState(false);

  const remainingForFreeShipping = useMemo(
    () => Math.max(0, FREE_SHIPPING_THRESHOLD - Math.max(0, subtotal - discount)),
    [subtotal, discount],
  );
  const freeShippingProgress = useMemo(() => {
    if (subtotal - discount <= 0) return 0;
    return Math.min(100, Math.round(((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100));
  }, [subtotal, discount]);
  const qualifiesForFreeShipping = shipping === 0 && items.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    const focusables = asideRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    focusables?.[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCart();
        return;
      }
      if (e.key === 'Tab' && asideRef.current) {
        const nodes = Array.from(
          asideRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
        ).filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      const target = previousFocus.current;
      if (target && typeof target.focus === 'function') {
        queueMicrotask(() => target.focus());
      }
    };
  }, [isOpen, closeCart]);

  const slideTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: HONEY_EASE_OUT };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-midnight/50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={slideTransition}
            className="fixed top-0 right-0 bottom-0 z-[91] w-[min(420px,100%)] bg-cream font-satoshi flex flex-col shadow-[-8px_0_40px_rgba(26,21,14,0.12)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-earth/15">
              <h2
                id="cart-drawer-title"
                className="font-clash font-bold text-charcoal text-lg m-0"
              >
                Cart
                {itemCount > 0 && (
                  <span className="font-satoshi font-normal text-sm text-earth ml-2">
                    ({itemCount})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="p-1.5 rounded-md text-bark hover:text-honey-500 hover:bg-honey-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* Free shipping progress bar */}
            {items.length > 0 && (
              <div className="px-6 pt-4 pb-3 border-b border-earth/10 bg-cream-warm">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={14} strokeWidth={2} className="text-honey-500 shrink-0" aria-hidden="true" />
                  {qualifiesForFreeShipping ? (
                    <p className="font-satoshi text-xs font-semibold text-sage m-0">
                      You&apos;ve unlocked free shipping!
                    </p>
                  ) : (
                    <p className="font-satoshi text-xs text-bark m-0">
                      Add <span className="font-bold text-charcoal">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-semibold text-honey-500">free shipping</span>
                    </p>
                  )}
                </div>
                <div
                  className="h-1.5 rounded-full bg-sand overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={freeShippingProgress}
                  aria-label="Progress toward free shipping"
                >
                  <div
                    className="h-full bg-honey-400 transition-[width] duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="opacity-20 text-charcoal">
                    <ShoppingCart size={56} strokeWidth={1.2} />
                  </div>
                  <p className="text-earth text-[15px] m-0">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-block px-6 py-2.5 bg-honey-500 hover:bg-honey-600 text-cream rounded-md no-underline text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const key = `${item.productId}-${item.variantId ?? 'default'}`;
                  return (
                    <div key={key} className="flex gap-3 items-start">
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-warm shrink-0">
                        {item.product.images?.[0]?.url && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            sizes="64px"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal m-0 mb-0.5 truncate">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-earth m-0 mb-1.5">{item.variant.name}</p>
                        )}
                        <p className="text-[13px] font-semibold text-honey-500 m-0 mb-2">
                          {formatPrice(item.unitPrice)}
                        </p>

                        {/* Qty */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 border border-earth/30 rounded flex items-center justify-center text-bark hover:border-honey-400 hover:text-honey-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                          >
                            <Minus size={12} strokeWidth={2} />
                          </button>
                          <span className="text-[13px] font-semibold text-charcoal min-w-[20px] text-center" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 border border-earth/30 rounded flex items-center justify-center text-bark hover:border-honey-400 hover:text-honey-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                          >
                            <Plus size={12} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold text-charcoal">
                          {formatPrice(item.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          aria-label={`Remove ${item.product.name} from cart`}
                          className="p-1 rounded text-earth-light hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                        >
                          <X size={16} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-earth/15 px-6 py-5 flex flex-col gap-3">
                {/* Coupon input (collapsible) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCouponOpen((v) => !v)}
                    aria-expanded={couponOpen}
                    aria-controls="cart-drawer-coupon"
                    className="w-full flex items-center justify-between text-left text-[13px] text-bark hover:text-charcoal transition-colors font-satoshi font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm py-1"
                  >
                    <span>Have a coupon?</span>
                    {couponOpen ? (
                      <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                  {couponOpen && (
                    <div id="cart-drawer-coupon" className="mt-2">
                      <CouponInput />
                    </div>
                  )}
                </div>

                <div className="h-px bg-earth/15" aria-hidden="true" />

                <div className="flex justify-between text-sm text-bark">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-sage">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-bark">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-clash font-bold text-charcoal text-base pt-1">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-honey w-full"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block px-6 py-3 bg-transparent text-bark border border-earth/30 rounded-md no-underline text-sm font-medium text-center hover:text-charcoal hover:border-earth transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
