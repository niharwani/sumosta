'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-terracotta-light rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl">⚠️</span>
        </div>

        <p className="font-satoshi text-terracotta text-xs uppercase tracking-[0.2em] mb-3">Something went wrong</p>
        <h1 className="font-clash text-charcoal font-bold text-3xl mb-4">
          A sticky situation
        </h1>
        <p className="font-satoshi text-earth leading-relaxed mb-8">
          We encountered an unexpected error. Our team has been notified. Please try again, or contact us if the issue persists.
        </p>

        {error.digest && (
          <p className="font-satoshi text-earth-light text-xs mb-6">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-sand hover:border-honey-300 text-bark font-satoshi font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="text-honey-500 hover:text-honey-600 font-satoshi font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
