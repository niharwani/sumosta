import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

export default function BrandStoryStrip() {
  return (
    <section className="py-20 lg:py-0 bg-cream-warm overflow-hidden">
      <div className="max-w-content mx-auto lg:grid lg:grid-cols-2 lg:min-h-[580px]">

        {/* ── Left: Image panel ── */}
        <div className="relative h-72 lg:h-auto overflow-hidden">
          <Image
            src="/images/brand/sourcing.png"
            alt="Wild forest honey sourcing from pristine Indian forests"
            fill
            className="object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 to-transparent" />

          {/* Editorial text overlay */}
          <div className="absolute inset-0 flex items-end p-8 lg:p-10">
            <p
              className="font-clash font-bold text-cream/20 leading-none select-none"
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
              Born from the Hustle.<br />Perfected by Nature.
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <div className="font-satoshi text-bark text-sm md:text-base leading-relaxed space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-honey-300">
              <p>
                Being founders hailing from the Gujarati and Marwari families, a deep love for food and an inherent sweet tooth are practically woven into our DNA. But as we plunged into the high-stress rhythms of modern corporate life &amp; entrepreneurship, that love for flavor hit a wall. Trapped in endless workdays, we defaulted to quick fixes: processed snacks loaded with refined sugars. Before long, the toll caught up with us in the form of stubborn gut health issues and chronic fatigue. As lifelong foodies, we completely refused a life of joyless, cardboard-tasting dietary restrictions. We wanted an &quot;indulgence that cares.&quot;
              </p>
              <p>
                That search for balance led us to an unexpected inspiration: the ancient philosophy of the Sumo. True Sumos are masters of unyielding power, absolute mental calm, and flawless ritualistic discipline. They don&rsquo;t starve their bodies with restrictive, empty &quot;zero-calorie&quot; diets; they build their resilience through nutrient-dense fueling to conquer high-stress daily challenges. We realized that is exactly what the modern hustle required—not restriction, but powerful, intentional nourishment.
              </p>
              <p>
                To find this ultimate ancestral fuel, we turned to honey. But what we found on supermarket shelves shocked us. Most commercial honey is industrially dead—heavily heated, stripped of live enzymes, and stretched with hidden sugar syrups. We realized most consumers are entirely unaware that authentic, raw wild forest honey even exists. They have never experienced the complex flavors and superior medicinal benefits of honey left completely untouched by industrial factories.
              </p>
              <p>
                We bypassed commercial supply chains and went straight into the wild. Our quest took us deep into the most remote micro-regions and pristine forests of India. Partnering with indigenous bee-foragers who have lived in harmony with these lands for generations, we harvested honey exactly as nature intended it: unprocessed, unfiltered, and alive with raw nutrients.
              </p>
              <p>
                We brought these wild forest honeys into our own lives, turning them into a daily ritual—a mindful spoonful for morning power and a soothing reset after a chaotic boardroom day. The results were life-changing. Our gut health restored itself, our energy stabilized, and our sweet cravings were deeply satisfied without a single drop of guilt.
              </p>
              <p>
                SUMOSTA was born to bring that exact breakthrough straight to your dining table. We did the hard work of traversing remote forests and ensuring rigorous, batch-wise lab verification so you can focus entirely on the pure joy of your daily wellness ritual. Welcome to SUMOSTA. Welcome to Indulgence that Cares.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <Link
              href="/about"
              className="font-satoshi text-charcoal font-medium inline-flex items-center gap-2 hover:text-honey-500 transition-colors group"
            >
              Read Our Full Story
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
