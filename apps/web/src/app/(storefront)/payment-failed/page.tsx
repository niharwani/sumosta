'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center py-20">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <XCircle size={72} className="text-terracotta mx-auto" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h1 className="font-clash text-charcoal font-bold text-4xl mb-3">Payment Failed</h1>
        <p className="font-satoshi text-earth text-base mb-2">
          Your payment could not be processed. Your cart has been saved.
        </p>
        <p className="font-satoshi text-earth-light text-sm mb-10">
          Please try again or contact us at hello@sumosta.com if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="bg-honey-400 text-midnight font-satoshi font-semibold px-8 py-3.5 rounded-md hover:bg-honey-500 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/contact"
            className="border border-sand text-bark font-satoshi font-semibold px-8 py-3.5 rounded-md hover:border-honey-300 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
