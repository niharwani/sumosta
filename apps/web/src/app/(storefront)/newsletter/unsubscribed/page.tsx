import Link from 'next/link';

export const metadata = {
  title: 'Unsubscribed — SUMOSTA',
};

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-cream flex flex-col items-center justify-center gap-6 text-center px-6 py-20">
      <div>
        <h1 className="font-clash font-bold text-charcoal text-3xl md:text-4xl mb-2">
          You're unsubscribed
        </h1>
        <p className="font-satoshi text-earth text-sm md:text-base max-w-md">
          You won't hear from us again. If this was a mistake, you can resubscribe any time from the site footer.
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
