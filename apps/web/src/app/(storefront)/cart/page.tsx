'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Lock, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { HONEY_EASE_OUT } from '@/lib/animations';
import CouponInput from '@/components/cart/CouponInput';

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    itemCount,
    couponDiscounts,
    updateQuantity,
    removeItem,
  } = useCartStore();

  // Prevent SSR/hydration mismatch — cart is pure client state
  const [mounted, setMounted] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    productId: string;
    variantId?: string | null;
    name: string;
  } | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen bg-cream" />;
  }

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] bg-cream flex flex-col items-center justify-center gap-6 text-center px-6 py-20">
        <ShoppingBag size={72} strokeWidth={1} className="text-earth-light" aria-hidden />
        <div>
          <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-2">
            Your cart is empty
          </h1>
          <p className="font-satoshi text-earth text-sm md:text-base m-0">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ─── Amount needed for free shipping ────────────────────────────────────────
  const afterDiscount = Math.max(0, subtotal - discount);
  const toFreeShipping = Math.max(0, 499 - afterDiscount);

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-8 pb-24">
        {/* Header */}
        <header className="mb-7">
          <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-1">
            My Cart
          </h1>
          <p className="font-satoshi text-earth text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </header>

        {/* Grid: items + summary */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* Items column */}
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.variantId ?? 'default'}`}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -100 }}
                  transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
                  className="bg-cream-warm rounded-2xl border border-sand p-5 flex gap-4 items-start"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative min-w-[88px] w-[88px] h-[88px] rounded-xl overflow-hidden bg-cream block"
                    aria-label={`View ${item.product.name}`}
                  >
                    {item.product.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-light">
                        <Package size={32} strokeWidth={1.25} aria-hidden />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + remove */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-satoshi font-semibold text-[15px] text-charcoal hover:text-honey-600 transition-colors truncate flex-1"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() =>
                          setConfirmRemove({
                            productId: item.productId,
                            variantId: item.variantId,
                            name: item.product.name,
                          })
                        }
                        aria-label={`Remove ${item.product.name}`}
                        className="bg-transparent border border-sand rounded-lg p-2 flex items-center justify-center text-earth-light hover:text-terracotta hover:border-terracotta/30 transition-colors min-w-[36px] min-h-[36px] shrink-0"
                      >
                        <Trash2 size={13} aria-hidden />
                      </button>
                    </div>

                    {/* Variant */}
                    {item.variant && (
                      <p className="font-satoshi text-xs text-earth mb-1.5">
                        {item.variant.name}
                      </p>
                    )}

                    {/* Price */}
                    <p className="font-satoshi font-bold text-sm text-honey-500 mb-3">
                      {formatPrice(item.unitPrice)}
                    </p>

                    {/* Qty + line total */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-sand rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-bark hover:bg-sand/40 transition-colors"
                        >
                          <Minus size={12} aria-hidden />
                        </button>
                        <span
                          aria-live="polite"
                          className="px-3 font-satoshi font-bold text-sm text-charcoal min-w-[28px] text-center select-none"
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-bark hover:bg-sand/40 transition-colors"
                        >
                          <Plus size={12} aria-hidden />
                        </button>
                      </div>
                      <span className="font-satoshi font-bold text-base text-charcoal">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-satoshi text-sm text-earth hover:text-honey-500 transition-colors py-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary column */}
          <div>
            <div className="bg-cream-warm rounded-2xl border border-sand p-6 sticky top-[calc(var(--header-height)+1rem)]">
              <h2 className="font-clash font-bold text-charcoal text-lg mb-5">Order Summary</h2>

              {/* Coupon input */}
              <div className="mb-5 pb-5 border-b border-sand">
                <CouponInput />
              </div>

              {/* Line items */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscounts.map((cd) => (
                  <div
                    key={cd.code}
                    className="flex justify-between font-satoshi text-sm text-sage font-semibold"
                  >
                    <span>Discount ({cd.code})</span>
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
                <div className="bg-honey-50 border border-honey-200 rounded-lg px-3.5 py-2.5 mb-4">
                  <p className="font-satoshi text-xs text-honey-600 m-0">
                    Add {formatPrice(toFreeShipping)} more for free shipping.
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-sand pt-4 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="font-satoshi font-semibold text-[15px] text-charcoal">Total</span>
                  <span className="font-clash font-bold text-2xl text-charcoal">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="font-satoshi text-[11px] text-earth-light text-right mt-1">
                  Taxes included
                </p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-[15px] px-6 py-3.5 rounded-full transition-colors mb-3 min-h-[44px]"
              >
                Proceed to Checkout
                <ArrowRight size={16} aria-hidden />
              </Link>

              {/* Trust note */}
              <p className="font-satoshi text-[11px] text-earth-light text-center m-0 inline-flex items-center justify-center gap-1.5 w-full">
                <Lock size={11} aria-hidden /> Secure checkout · Free returns within 7 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remove confirm dialog */}
      <Dialog.Root
        open={confirmRemove !== null}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-midnight/60 backdrop-blur-sm z-[90] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[calc(100%-2rem)] max-w-md bg-cream rounded-2xl border border-sand shadow-lg p-6 focus:outline-none">
            <Dialog.Title className="font-clash font-bold text-charcoal text-xl mb-2">
              Remove item?
            </Dialog.Title>
            <Dialog.Description className="font-satoshi text-bark text-sm mb-6">
              Remove <span className="font-semibold text-charcoal">{confirmRemove?.name}</span> from your cart?
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="inline-flex items-center justify-center bg-cream border border-sand hover:border-earth-light text-charcoal font-satoshi font-semibold text-sm px-5 py-2.5 rounded-full transition-colors min-h-[44px]">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  if (confirmRemove) {
                    removeItem(confirmRemove.productId, confirmRemove.variantId);
                    setConfirmRemove(null);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-terracotta hover:bg-terracotta/90 text-cream font-satoshi font-semibold text-sm px-5 py-2.5 rounded-full transition-colors min-h-[44px]"
              >
                <Trash2 size={14} aria-hidden /> Remove
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
