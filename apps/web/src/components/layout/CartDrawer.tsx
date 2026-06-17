'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { drawerVariants, overlayVariants } from '@/lib/animations';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { isOpen, items, itemCount, subtotal, shipping, total, closeCart, updateQuantity, removeItem } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream flex flex-col shadow-lg"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
              <h2 className="font-clash text-charcoal font-semibold text-lg">
                Your Cart {itemCount > 0 && <span className="text-earth-light font-satoshi text-sm font-normal">({itemCount})</span>}
              </h2>
              <button onClick={closeCart} className="text-bark hover:text-charcoal transition-colors" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-sand" />
                  <p className="font-satoshi text-earth text-base">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="bg-honey-400 text-midnight font-satoshi font-semibold text-sm px-6 py-3 rounded-md hover:bg-honey-500 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={`${item.productId}-${item.variantId}`}
                        layout
                        exit={{ x: -40, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 items-start"
                      >
                        {/* Image */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-warm shrink-0">
                          {item.product.images?.[0]?.url && (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-satoshi text-charcoal text-sm font-medium truncate">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-earth-light text-xs font-satoshi">{item.variant.name}</p>
                          )}
                          <p className="font-satoshi text-honey-500 text-sm font-semibold mt-1">
                            {formatPrice(item.unitPrice)}
                          </p>

                          {/* Qty */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                              className="w-6 h-6 rounded border border-sand flex items-center justify-center text-bark hover:border-honey-400 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-satoshi text-charcoal text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                              className="w-6 h-6 rounded border border-sand flex items-center justify-center text-bark hover:border-honey-400 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Line total + remove */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-satoshi text-charcoal text-sm font-semibold">
                            {formatPrice(item.lineTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-earth-light hover:text-terracotta transition-colors"
                            aria-label="Remove item"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 && (
              <div className="border-t border-sand px-6 py-5 flex flex-col gap-3">
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-satoshi text-sm text-bark">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-clash text-charcoal text-lg font-semibold border-t border-sand pt-3">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="bg-honey-400 text-midnight font-satoshi font-semibold text-sm px-6 py-3.5 rounded-md hover:bg-honey-500 transition-colors text-center"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="border border-sand text-bark font-satoshi text-sm px-6 py-3 rounded-md hover:border-honey-300 transition-colors text-center"
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
