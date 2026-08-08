'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

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
        <div
          className="w-20 h-20 bg-terracotta-light rounded-full flex items-center justify-center mx-auto mb-8"
          aria-hidden="true"
        >
          <AlertTriangle size={32} className="text-terracotta" strokeWidth={1.8} />
        </div>

        <p className="font-satoshi text-terracotta text-xs uppercase tracking-[0.2em] mb-3 font-bold">
          Something went wrong
        </p>
        <h1 className="font-clash font-black text-charcoal text-3xl mb-2">
          A sticky situation
        </h1>
        <p className="font-bespoke italic text-earth mb-6">
          Even the best hives have a rough day.
        </p>
        <p className="font-satoshi text-bark leading-relaxed mb-8">
          We encountered an unexpected error. Our team has been notified. Please try again, or contact us if the issue persists.
        </p>

        {error.digest && (
          <p className="font-satoshi text-earth-light text-xs mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button type="button" onClick={reset} className="btn-honey">
            Try Again
          </button>
          <Link href="/" className="btn-pill-white">
            Go Home
          </Link>
          <Link
            href="/contact"
            className="font-satoshi text-honey-600 hover:text-honey-500 font-semibold text-sm px-6 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
