import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Honey jar illustration */}
        <div className="relative mx-auto mb-8 w-32 h-40">
          <svg viewBox="0 0 128 160" fill="none" className="w-full h-full">
            {/* Jar body */}
            <rect x="24" y="50" width="80" height="90" rx="8" fill="#FFF0D6" stroke="#F5A623" strokeWidth="2"/>
            {/* Jar neck */}
            <rect x="34" y="34" width="60" height="20" rx="4" fill="#FFE0A8" stroke="#F5A623" strokeWidth="2"/>
            {/* Lid */}
            <rect x="28" y="26" width="72" height="12" rx="4" fill="#F5A623"/>
            {/* Honey level */}
            <rect x="26" y="100" width="76" height="38" rx="0 0 6 6" fill="#F5A623" opacity="0.4"/>
            {/* Label */}
            <rect x="36" y="68" width="56" height="36" rx="4" fill="white" opacity="0.7"/>
            {/* Bee */}
            <text x="64" y="91" textAnchor="middle" fontSize="20">🍯</text>
            {/* Drip */}
            <path d="M64 140 Q64 155 64 155" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.2em] mb-3">404</p>
        <h1 className="font-clash text-charcoal font-bold text-4xl mb-4">
          This page seems to have dripped away
        </h1>
        <p className="font-satoshi text-earth leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Let us help you find what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="border border-sand hover:border-honey-300 text-bark font-satoshi font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Browse Products
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
