'use client';
import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const checkRef = useRef<SVGPathElement>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Clear shopping cart on checkout success
    clearCart();

    if (!checkRef.current) return;
    import('animejs').then(({ default: anime }) => {
      anime({
        targets: checkRef.current,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'cubicBezier(0.65, 0, 0.35, 1)',
        duration: 800,
        delay: 300,
      });
    });
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 text-center py-20">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-8"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            ref={checkRef}
            d="M8 20 L17 29 L32 12"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h1 className="font-jakarta font-black text-charcoal text-4xl mb-3">Order Confirmed!</h1>
        <p className="font-jakarta text-gray-600 text-base mb-2">
          Your order <span className="font-semibold text-charcoal">{id}</span> has been placed.
        </p>
        <p className="font-jakarta text-gray-400 text-sm mb-10">
          You&apos;ll receive a confirmation email shortly with tracking details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/orders" className="btn-pill-orange">
            Track Order
          </Link>
          <Link href="/shop" className="btn-pill-white">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
