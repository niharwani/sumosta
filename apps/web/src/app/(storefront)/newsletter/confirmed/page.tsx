'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const invalid = searchParams?.get('status') === 'invalid';

  if (invalid) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height))] bg-cream flex flex-col items-center justify-center gap-6 text-center px-6 py-20">
        <div>
          <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-2">
            This link has expired
          </h1>
          <p className="font-satoshi text-earth text-sm md:text-base max-w-md">
            Confirmation links are single-use and time out after 24 hours. Subscribe again to get a fresh link.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-cream flex flex-col items-center justify-center gap-6 text-center px-6 py-20">
      <div>
        <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-2">
          You&apos;re in
        </h1>
        <p className="font-satoshi text-earth text-sm md:text-base max-w-md">
          Your subscription is confirmed. Check your inbox for a 10% off welcome code.
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-8 py-3 rounded-full transition-colors min-h-[44px]"
      >
        Browse products
      </Link>
    </div>
  );
}

export default function NewsletterConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ConfirmedContent />
    </Suspense>
  );
}
