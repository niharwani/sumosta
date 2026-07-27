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
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl">⚠️</span>
        </div>

        <p className="font-jakarta text-red-600 text-xs uppercase tracking-[0.2em] mb-3">Something went wrong</p>
        <h1 className="font-jakarta font-black text-charcoal text-3xl mb-4">
          A sticky situation
        </h1>
        <p className="font-jakarta text-gray-600 leading-relaxed mb-8">
          We encountered an unexpected error. Our team has been notified. Please try again, or contact us if the issue persists.
        </p>

        {error.digest && (
          <p className="font-jakarta text-gray-400 text-xs mb-6">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-pill-orange">
            Try Again
          </button>
          <Link href="/" className="btn-pill-white">
            Go Home
          </Link>
          <Link
            href="/contact"
            className="font-jakarta text-[#F97316] hover:text-[#EA580C] font-semibold text-sm px-6 py-3 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
