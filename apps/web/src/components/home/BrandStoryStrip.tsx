import Link from 'next/link';
import ParallaxImage from '@/components/shared/ParallaxImage';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

export default function BrandStoryStrip() {
  return (
    <section className="py-20 lg:py-0 bg-cream-warm overflow-hidden">
      <div className="max-w-content mx-auto lg:grid lg:grid-cols-2 lg:min-h-[600px]">
        {/* Image */}
        <div className="relative h-72 lg:h-auto">
          <ParallaxImage
            src="/images/brand/honey-pour.jpg"
            alt="Honey being poured in golden light"
            className="absolute inset-0"
            speed={0.12}
          />
        </div>

        {/* Text */}
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
