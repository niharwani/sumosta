'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import CouponInput from '@/components/cart/CouponInput';

export default function CartPage() {
  const { items, subtotal, discount, shipping, total, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <ShoppingBag size={64} className="text-sand" />
        <h1 className="font-clash text-charcoal text-3xl font-bold">Your cart is empty</h1>
        <p className="font-satoshi text-earth text-base">Add some honey to get started.</p>
        <Link href="/shop" className="bg-honey-400 text-midnight font-satoshi font-semibold px-8 py-3.5 rounded-md hover:bg-honey-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <h1 className="font-clash text-charcoal font-bold text-4xl mb-10">Your Cart</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          {/* Cart items */}
          <div>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-5 py-6 border-b border-sand"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-cream-warm shrink-0">
                    {item.product.images?.[0]?.url && (
                      <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link href={`/product/${item.product.slug}`} className="font-satoshi text-charcoal font-medium text-sm hover:text-honey-500">
                          {item.product.name}
                        </Link>
                        {item.variant && <p className="font-satoshi text-earth-light text-xs">{item.variant.name}</p>}
                      </div>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="text-earth-light hover:text-terracotta transition-colors shrink-0">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty */}
                      <div className="flex items-center border border-sand rounded-md overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="px-3 py-2 text-bark hover:text-charcoal transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-2 font-satoshi text-sm text-charcoal min-w-[36px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="px-3 py-2 text-bark hover:text-charcoal transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-satoshi text-charcoal font-semibold text-sm">{formatPrice(item.lineTotal)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="bg-cream-warm rounded-xl p-6 h-fit sticky top-24">
            <h2 className="font-clash text-charcoal font-bold text-xl mb-6">Order Summary</h2>

            <CouponInput />

            <div className="flex flex-col gap-3 mt-6 mb-6">
              <div className="flex justify-between font-satoshi text-sm text-bark">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-satoshi text-sm text-sage">
                  <span>Discount</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-satoshi text-sm text-bark">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-sage font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-clash text-charcoal text-lg font-semibold border-t border-sand pt-3">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block bg-honey-400 text-midnight font-satoshi font-semibold text-sm px-6 py-4 rounded-md hover:bg-honey-500 transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
            {shipping > 0 && (
              <p className="font-satoshi text-earth-light text-xs text-center mt-3">
                Add {formatPrice(500 - subtotal + discount)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
