'use client';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import GoldenDivider from '@/components/shared/GoldenDivider';
import { animateCounter } from '@/lib/anime-presets';

const STATS = [
  { value: 5000, label: 'Happy Customers', suffix: '+' },
  { value: 12, label: 'Wild Apiaries', suffix: '' },
  { value: 0, label: 'Additives', suffix: '' },
  { value: 100, label: 'Traceable', suffix: '%' },
];

const STORY_SECTIONS = [
  {
    eyebrow: 'OUR ORIGIN',
    headline: 'Born from a Love of Pure Honey',
    body: `SUMOSTA began with a simple conviction: honey in its natural state is one of nature's most perfect foods. Our founders, having grown up near the forests of the Western Ghats, watched as commercial honey became increasingly processed, heated, and adulterated. They set out to change that.

The name SUMOSTA derives from the Sanskrit root for sweetness — and our mission is to preserve it, exactly as nature intended.`,
    image: '/images/brand/origin.jpg',
    imageAlt: 'Wild honeybees on a comb in the Western Ghats forest',
    imageRight: false,
  },
  {
    eyebrow: 'HOW WE SOURCE',
    headline: 'From Wild Hives, Across India\'s Most Remote Forests',
    body: `We work directly with traditional beekeepers and forest tribes across three distinct ecosystems — the Western Ghats, the Sundarbans mangroves, and the Himalayan foothills. Each ecosystem produces honey with its own distinctive terroir, flavor profile, and medicinal properties.

Our beekeepers are not industrialists. They are custodians — families who have harvested honey from the same forests for generations. We pay them above market rates and ensure their livelihoods are protected.`,
    image: '/images/brand/sourcing.jpg',
    imageAlt: 'A beekeeper in traditional clothing harvesting honeycomb',
    imageRight: true,
  },
  {
    eyebrow: 'OUR PROMISE',
    headline: 'Raw, Unprocessed, and Fully Traceable',
    body: `Every jar of SUMOSTA honey is raw — never heated above hive temperature, never ultra-filtered. This preserves the pollen, enzymes, and antioxidants that make honey genuinely beneficial.

We test every batch at a third-party FSSAI-approved laboratory for purity, moisture content, and adulteration markers. The batch ID on every jar can be traced back to its specific apiary and harvest month.`,
    image: '/images/brand/purity.jpg',
    imageAlt: 'Laboratory testing of honey for purity',
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/brand/hero.jpg)',
            opacity: 0.5,
          }}
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
              Nature's Golden<br />Promise
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
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-honey-100">
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
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

      {/* Pull Quote */}
      <div className="bg-cream-warm py-20 px-6">
        <RevealOnScroll variant="fadeIn">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-bespoke italic text-honey-500 text-5xl mb-4">"</p>
            <p className="font-bespoke italic text-charcoal leading-relaxed" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              Honey is the only food that never spoils. Egyptian honey found in 3,000-year-old tombs was still perfectly edible. We believe honey that's been processed, heated, and stripped of its life deserves a different name entirely.
            </p>
            <p className="font-satoshi text-earth text-sm mt-6">— SUMOSTA Founders</p>
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

      {/* Team */}
      <div className="bg-cream-warm py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <RevealOnScroll variant="fadeUp">
            <div className="text-center mb-12">
              <h2 className="font-clash text-charcoal font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                The People Behind the Hive
              </h2>
              <p className="font-satoshi text-earth mt-4 max-w-xl mx-auto">
                A small, passionate team of food scientists, foragers, and storytellers — united by an obsession with purity.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: 'Arjun Nair', role: 'Co-founder & Head of Sourcing', bio: 'Former wildlife researcher. Has hiked every trail in the Western Ghats twice.' },
              { name: 'Priya Menon', role: 'Co-founder & CEO', bio: 'Food scientist turned entrepreneur. Believes the best product is no product at all — just nature.' },
              { name: 'Rahul Sharma', role: 'Head of Quality', bio: '15 years in food safety. Has rejected more honey than he has approved, and proud of it.' },
            ].map((member) => (
              <RevealOnScroll key={member.name} variant="fadeUp">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-honey-200 mx-auto mb-4 flex items-center justify-center">
                    <span className="font-clash text-honey-600 font-bold text-2xl">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-satoshi text-charcoal font-semibold">{member.name}</h3>
                  <p className="font-satoshi text-honey-500 text-sm mt-0.5">{member.role}</p>
                  <p className="font-satoshi text-earth text-sm mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
