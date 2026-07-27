import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Honey jar illustration */}
        <div className="relative mx-auto mb-8 w-32 h-40">
          <svg viewBox="0 0 128 160" fill="none" className="w-full h-full">
            {/* Jar body */}
            <rect x="24" y="50" width="80" height="90" rx="8" fill="#FFF0D6" stroke="#F97316" strokeWidth="2"/>
            {/* Jar neck */}
            <rect x="34" y="34" width="60" height="20" rx="4" fill="#FFE0A8" stroke="#F97316" strokeWidth="2"/>
            {/* Lid */}
            <rect x="28" y="26" width="72" height="12" rx="4" fill="#F97316"/>
            {/* Honey level */}
            <rect x="26" y="100" width="76" height="38" rx="0 0 6 6" fill="#F97316" opacity="0.4"/>
            {/* Label */}
            <rect x="36" y="68" width="56" height="36" rx="4" fill="white" opacity="0.7"/>
            {/* Bee */}
            <text x="64" y="91" textAnchor="middle" fontSize="20">🍯</text>
            {/* Drip */}
            <path d="M64 140 Q64 155 64 155" stroke="#F97316" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="font-jakarta text-[#F97316] text-xs uppercase tracking-[0.2em] mb-3">404</p>
        <h1 className="font-jakarta font-black text-charcoal text-4xl mb-4">
          This page seems to have dripped away
        </h1>
        <p className="font-jakarta text-gray-600 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help you find what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-pill-orange">
            Go Home
          </Link>
          <Link href="/shop" className="btn-pill-white">
            Browse Products
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
