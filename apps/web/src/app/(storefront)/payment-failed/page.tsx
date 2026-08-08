'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { HONEY_EASE_OUT } from '@/lib/animations';

export default function PaymentFailedPage() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center py-20">
      <motion.div
        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: HONEY_EASE_OUT }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-terracotta-light mx-auto flex items-center justify-center">
          <XCircle size={40} className="text-terracotta" strokeWidth={2} />
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: HONEY_EASE_OUT }}
      >
        <h1 className="font-clash font-bold text-charcoal text-4xl mb-3">
          Payment Failed
        </h1>
        <p className="font-satoshi text-bark text-base mb-2 max-w-md mx-auto">
          Your payment could not be processed. Your cart has been saved so you can retry safely.
        </p>
        <p className="font-satoshi text-earth text-sm mb-10 max-w-md mx-auto">
          Please try again or contact us at{' '}
          <a href="mailto:hello@sumosta.com" className="text-honey-500 hover:text-honey-600 underline">
            hello@sumosta.com
          </a>{' '}
          if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
          >
            Try Again
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-cream border border-sand hover:border-earth-light text-charcoal font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
