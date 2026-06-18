import Link from 'next/link';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

export default function BrandStoryStrip() {
  return (
    <section className="py-20 lg:py-0 bg-cream-warm overflow-hidden">
      <div className="max-w-content mx-auto lg:grid lg:grid-cols-2 lg:min-h-[580px]">

        {/* ── Left: Textural amber panel ── */}
        <div className="relative h-72 lg:h-auto bg-honey-500 overflow-hidden">
          {/* Honeycomb texture at higher opacity — this IS the visual */}
          <div className="absolute inset-0 honeycomb-bg" style={{ opacity: 0.18 }} />

          {/* Large centered hexagon outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 220"
              className="w-64 h-72 text-honey-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.35"
            >
              <polygon points="100,10 186,55 186,165 100,210 14,165 14,55" />
              <polygon points="100,35 165,70 165,150 100,185 35,150 35,70" />
              <polygon points="100,60 144,86 144,138 100,164 56,138 56,86" />
            </svg>
          </div>

          {/* Editorial text overlay */}
          <div className="absolute inset-0 flex items-end p-8 lg:p-10">
            <p
              className="font-clash font-bold text-honey-200/30 leading-none select-none"
              style={{ fontSize: 'clamp(4rem, 10vw, 7rem)' }}
            >
              PURE
            </p>
          </div>
        </div>

        {/* ── Right: Text ── */}
        <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 lg:py-20">
          <RevealOnScroll variant="fadeUp">
            <p className="font-satoshi uppercase tracking-[0.15em] text-honey-400 text-xs font-semibold mb-4">
              Our Story
            </p>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl md:text-4xl mb-6">
              From Wild Hives to Your Table
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <div className="font-satoshi text-bark text-base leading-relaxed space-y-4 mb-8">
              <p>
                SUMOSTA sources single-origin honey from wild bee colonies across the Western Ghats, Sundarbans, and Himalayan foothills. Each batch is raw, unprocessed, and traceable to its apiary.
              </p>
              <p>
                We work directly with traditional beekeepers who have managed these hives for generations. No middlemen, no compromises — just pure honey the way nature intended.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <Link
              href="/about"
              className="font-satoshi text-charcoal font-medium inline-flex items-center gap-2 hover:text-honey-500 transition-colors group"
            >
              Learn More
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
