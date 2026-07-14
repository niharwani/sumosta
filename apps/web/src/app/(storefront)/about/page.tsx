'use client';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import GoldenDivider from '@/components/shared/GoldenDivider';
import { animateCounter } from '@/lib/anime-presets';
import Image from 'next/image';

const STATS = [
  { value: 5, label: 'Forest Ecosystems', suffix: '+' },
  { value: 0, label: 'Additives Used', suffix: '' },
  { value: 100, label: 'Traceable', suffix: '%' },
  { value: 5, label: 'Rare Honeys', suffix: '' },
];

const STORY_SECTIONS = [
  {
    eyebrow: 'THE PROBLEM',
    headline: 'The Sweet Tooth & The Corporate Toll',
    body: `Being founders hailing from the Gujarati and Marwari families, a deep love for food and an inherent sweet tooth are practically woven into our DNA. But as we plunged into the high-stress rhythms of modern corporate life & entrepreneurship, that love for flavor hit a wall. Trapped in endless workdays, we defaulted to quick fixes: processed snacks loaded with refined sugars. Before long, the toll caught up with us in the form of stubborn gut health issues and chronic fatigue. As lifelong foodies, we completely refused a life of joyless, cardboard-tasting dietary restrictions. We wanted an "indulgence that cares."`,
    image: '/images/brand/origin.png',
    imageAlt: 'The modern hustle - a moment of pause with raw honey',
    imageRight: false,
  },
  {
    eyebrow: 'THE INSPIRATION',
    headline: 'The Sumo Inspiration: Fueling True Strength',
    body: `That search for balance led us to an unexpected inspiration: the ancient philosophy of the Sumo. True Sumos are masters of unyielding power, absolute mental calm, and flawless ritualistic discipline. They don’t starve their bodies with restrictive, empty "zero-calorie" diets; they build their resilience through nutrient-dense fueling to conquer high-stress daily challenges. We realized that is exactly what the modern hustle required—not restriction, but powerful, intentional nourishment.`,
    image: '/images/brand/hero.png',
    imageAlt: 'Sumo inspiration - strength and balance',
    imageRight: true,
  },
  {
    eyebrow: 'THE REALITY',
    headline: 'The Supermarket Illusion vs. Wild Reality',
    body: `To find this ultimate ancestral fuel, we turned to honey. But what we found on supermarket shelves shocked us. Most commercial honey is industrially dead—heavily heated, stripped of live enzymes, and stretched with hidden sugar syrups. We realized most consumers are entirely unaware that authentic, raw wild forest honey even exists. They have never experienced the complex flavors and superior medicinal benefits of honey left completely untouched by industrial factories.`,
    image: '/images/brand/purity.png',
    imageAlt: 'Raw honeycomb - nature untouched by industrial factories',
    imageRight: false,
  },
  {
    eyebrow: 'THE MISSION',
    headline: 'Sourcing From India\'s Untamed Ecosystems',
    body: `We bypassed commercial supply chains and went straight into the wild. Our quest took us deep into the most remote micro-regions and pristine forests of India. Partnering with indigenous bee-foragers who have lived in harmony with these lands for generations, we harvested honey exactly as nature intended it: unprocessed, unfiltered, and alive with raw nutrients.`,
    image: '/images/brand/sourcing.png',
    imageAlt: 'Tribal honey gatherer climbing a forest canopy tree',
    imageRight: true,
  },
  {
    eyebrow: 'THE BREAKTHROUGH',
    headline: 'The Birth of a Daily Ritual',
    body: `We brought these wild forest honeys into our own lives, turning them into a daily ritual—a mindful spoonful for morning power and a soothing reset after a chaotic boardroom day. The results were life-changing. Our gut health restored itself, our energy stabilized, and our sweet cravings were deeply satisfied without a single drop of guilt.

SUMOSTA was born to bring that exact breakthrough straight to your dining table. We did the hard work of traversing remote forests and ensuring rigorous, batch-wise lab verification so you can focus entirely on the pure joy of your daily wellness ritual.

Welcome to SUMOSTA. Welcome to Indulgence that Cares.`,
    image: '/images/brand/category-honey.png',
    imageAlt: 'A daily wellness ritual of raw honey',
    imageRight: false,
  },
];

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current && counterRef.current) {
        triggered.current = true;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          counterRef.current.textContent = `${value.toLocaleString('en-IN')}${suffix}`;
        } else {
          import('animejs').then((mod) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const animeLib = (mod.default ?? mod) as any;
            animateCounter(animeLib, counterRef.current!, value);
            if (suffix) {
              setTimeout(() => {
                if (counterRef.current) counterRef.current.textContent = `${value.toLocaleString('en-IN')}${suffix}`;
              }, 2100);
            }
          });
        }
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, suffix]);

  return (
    <div ref={containerRef} className="text-center">
      <div className="font-clash font-bold text-honey-400 mb-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
        <span ref={counterRef}>0</span>
      </div>
      <p className="font-satoshi text-earth text-sm uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] bg-midnight overflow-hidden">
        <Image
          src="/images/brand/hero.png"
          alt="Pristine Indian forest canopy at golden hour"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/30 via-transparent to-midnight/60" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-satoshi text-honey-300 text-sm uppercase tracking-[0.2em] mb-4">Our Story</p>
            <h1 className="font-clash text-cream font-bold" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 1.1 }}>
              Born from the Hustle.<br />Perfected by Nature.
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Story Sections */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        {STORY_SECTIONS.map((section, i) => (
          <div key={i}>
            <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center py-16 ${i > 0 ? 'border-t border-sand' : ''}`}>
              <RevealOnScroll variant={section.imageRight ? 'slideInLeft' : 'slideInRight'}>
                <div className={`order-1 ${section.imageRight ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-honey-100 relative">
                    <Image
                      src={section.image}
                      alt={section.imageAlt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll variant={section.imageRight ? 'slideInRight' : 'slideInLeft'}>
                <div className={`order-2 ${section.imageRight ? 'md:order-1' : 'md:order-2'}`}>
                  <p className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.15em] mb-4">{section.eyebrow}</p>
                  <h2 className="font-clash text-charcoal font-bold mb-6" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                    {section.headline}
                  </h2>
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} className={`font-satoshi text-bark leading-relaxed ${j > 0 ? 'mt-4' : ''}`}>
                      {para}
                    </p>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </div>
        ))}
      </div>

      {/* Meet the Founders */}
      <section className="bg-cream-warm border-t border-b border-sand py-24 px-6 relative overflow-hidden" id="founders">
        {/* Soft radial backdrops */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-honey-100/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-honey-200/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <RevealOnScroll variant="fadeUp">
              <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-3 font-bold">
                Meet the Founders
              </span>
            </RevealOnScroll>
            <RevealOnScroll variant="fadeUp" delay={0.1}>
              <h2 className="font-clash text-charcoal font-bold mb-4 text-3xl md:text-4xl">
                Meet the Heavyweights Behind the Honey.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll variant="fadeUp" delay={0.2}>
              <p className="font-satoshi text-bark text-sm max-w-2xl mx-auto leading-relaxed">
                When a Gujarati and a Marwari team up to launch a food brand, two things are absolutely guaranteed: the numbers will always balance, and the food will always taste phenomenal. We stepped into the SUMOSTA ring to prove that you can conquer the modern daily hustle without giving up the joy of eating.
              </p>
            </RevealOnScroll>
          </div>

          {/* Founders Grid */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Founder 1: Yatin */}
            <RevealOnScroll variant="slideInLeft">
              <div className="bg-cream border border-sand p-8 rounded-2xl shadow-honey flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-honey-200 shadow-md mb-4 bg-honey-50">
                  <Image
                    src="/images/brand/yatin.jpg"
                    alt="Yatin Narechania"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-clash font-bold text-charcoal text-xl mb-1 mt-4">Yatin Narechania</h3>
                <p className="font-satoshi text-honey-600 text-xs uppercase tracking-wider mb-6 font-semibold">
                  Founder & CEO | The Brain of SUMOSTA
                </p>
                <div className="w-full space-y-4 font-satoshi text-bark text-sm leading-relaxed text-justify">
                  <p>
                    <strong>The Sumo Stance:</strong> Handling the heavy lifting behind Strategy, Product Development, and Finance.
                  </p>
                  <p>
                    <strong>The Profile:</strong> If SUMOSTA were a perfectly balanced recipe, Yatin is the master chef holding the measuring spoons. As the strategic brain, he is the one who refuses to compromise on lab-tested purity, obsesses over product formulations, and ensures our unit economics are as clean as our ingredient labels (a classic Gujarati superpower). He channels the true Sumo mindset by bringing absolute calm, focus, and structural vision to our product roadmap.
                  </p>
                  <p className="text-xs text-honey-600 font-semibold bg-honey-50 px-3 py-2 rounded-lg border border-honey-100 mt-2 leading-relaxed">
                    💡 <strong>Fueled By:</strong> A morning ritual of raw wild forest honey and big strategic visions.
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Founder 2: Rishabh */}
            <RevealOnScroll variant="slideInRight">
              <div className="bg-cream border border-sand p-8 rounded-2xl shadow-honey flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-honey-200 shadow-md mb-4 bg-honey-50">
                  <Image
                    src="/images/brand/rishabh.png"
                    alt="Rishabh Makharia"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-clash font-bold text-charcoal text-xl mb-1 mt-4">Rishabh Makharia</h3>
                <p className="font-satoshi text-honey-600 text-xs uppercase tracking-wider mb-6 font-semibold">
                  Co-Founder & COO | The Soul of SUMOSTA
                </p>
                <div className="w-full space-y-4 font-satoshi text-bark text-sm leading-relaxed text-justify">
                  <p>
                    <strong>The Sumo Stance:</strong> Dominating the ring in Business Operations, Logistics, and Sales.
                  </p>
                  <p>
                    <strong>The Profile:</strong> If Yatin is the blueprint, Rishabh is the engine that drives it forward. As the living soul of the brand, Rishabh turns grand ideas into reality, manages the wild logistics of sourcing from India's most remote forests, and makes sure a jar of SUMOSTA lands seamlessly on your dining table. With an inherent Marwari drive for relentless hustle and relationship-building, he’s the energetic force making sure our "indulgence that cares" reaches every corner of the country.
                  </p>
                  <p className="text-xs text-honey-600 font-semibold bg-honey-50 px-3 py-2 rounded-lg border border-honey-100 mt-2 leading-relaxed">
                    ⚡ <strong>Fueled By:</strong> Pure adrenaline, unstoppable sales hustle, and a guilt-free sweet tooth.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Footer Quote */}
          <div className="mt-16 text-center bg-cream border border-sand p-8 rounded-2xl max-w-3xl mx-auto shadow-sm">
            <p className="font-bespoke italic text-charcoal text-lg md:text-xl leading-relaxed">
              &ldquo;We don't just run the company; we are our own biggest customers. We built SUMOSTA because our own sweet teeth demanded an indulgence that actually looks out for our health. Welcome to the ring!&rdquo;
            </p>
            <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider mt-4 font-semibold">
              — Yatin & Rishabh
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Beliefs */}
      <div className="bg-midnight py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <RevealOnScroll variant="fadeUp">
            <p className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] text-center mb-4">Our Beliefs</p>
            <h2 className="font-clash text-cream font-bold text-center mb-12" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              What Guides Everything We Create
            </h2>
          </RevealOnScroll>
          <div className="grid gap-6">
            {[
              { icon: '✦', text: 'Wellness should be enjoyable, never a compromise.' },
              { icon: '✦', text: 'Small daily rituals create lasting wellbeing.' },
              { icon: '✦', text: 'Nature, in its most authentic form, knows best.' },
              { icon: '✦', text: 'Balance is more powerful than extremes.' },
              { icon: '✦', text: 'Every indulgence has the potential to become an act of care.' },
            ].map((belief, i) => (
              <RevealOnScroll key={i} variant="fadeUp" delay={i * 0.1}>
                <div className="flex items-start gap-4 bg-charcoal/40 rounded-xl px-6 py-5 border border-bark/20">
                  <span className="text-honey-400 text-lg mt-0.5">{belief.icon}</span>
                  <p className="font-satoshi text-cream/90 text-base leading-relaxed">{belief.text}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* Pull Quote */}
      <div className="bg-cream-warm py-20 px-6">
        <RevealOnScroll variant="fadeIn">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-bespoke italic text-honey-500 text-5xl mb-4">&quot;</p>
            <p className="font-bespoke italic text-charcoal leading-relaxed" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              We believe wellbeing isn&apos;t created through restriction or perfection. It grows through simple choices made consistently, products crafted thoughtfully, and everyday moments that nourish both body and mind.
            </p>
            <p className="font-satoshi text-earth text-sm mt-6">— SUMOSTA Philosophy</p>
          </div>
        </RevealOnScroll>
      </div>

      {/* Stats */}
      <div className="py-20 px-6">
        <RevealOnScroll variant="fadeUp">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <GoldenDivider />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <StatCounter key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
