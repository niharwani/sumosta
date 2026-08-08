import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Honey jar illustration */}
        <div className="relative mx-auto mb-8 w-32 h-40" aria-hidden="true">
          <svg viewBox="0 0 128 160" fill="none" className="w-full h-full">
            {/* Jar body */}
            <rect
              x="24"
              y="50"
              width="80"
              height="90"
              rx="8"
              fill="var(--honey-100)"
              stroke="var(--honey-400)"
              strokeWidth="2"
            />
            {/* Jar neck */}
            <rect
              x="34"
              y="34"
              width="60"
              height="20"
              rx="4"
              fill="var(--honey-200)"
              stroke="var(--honey-400)"
              strokeWidth="2"
            />
            {/* Lid */}
            <rect x="28" y="26" width="72" height="12" rx="4" fill="var(--honey-400)" />
            {/* Honey level */}
            <rect x="26" y="100" width="76" height="38" rx="4" fill="var(--honey-400)" opacity="0.4" />
            {/* Label */}
            <rect
              x="36"
              y="68"
              width="56"
              height="36"
              rx="4"
              fill="var(--cream)"
              opacity="0.85"
            />
            {/* Small hexagon glyph on label */}
            <polygon
              points="64,76 74,82 74,94 64,100 54,94 54,82"
              fill="none"
              stroke="var(--honey-500)"
              strokeWidth="1.8"
            />
            {/* Drip */}
            <path
              d="M64 140 Q64 155 64 155"
              stroke="var(--honey-400)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="font-clash text-honey-500 text-sm uppercase tracking-[0.2em] mb-3 font-bold">
          404
        </p>
        <h1 className="font-clash font-black text-charcoal text-4xl mb-4">
          This page seems to have dripped away
        </h1>
        <p className="font-satoshi text-earth leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help you find what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/" className="btn-honey">
            Go Home
          </Link>
          <Link href="/shop" className="btn-pill-white">
            Browse Products
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
