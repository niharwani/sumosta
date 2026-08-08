'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SmoothCounter from '@/components/shared/SmoothCounter';

const STORY_CHAPTERS = [
  {
    number: '01',
    eyebrow: 'THE SWEET TOOTH & THE CORPORATE TOLL',
    headline: 'Born from the Hustle.\nPerfected by Nature.',
    paragraphs: [
      'Two founders. One Gujarati, one Marwari. Both with an intense love of sugar, a corporate grind eating them alive, and a growing realisation that the sweet things in life were slowly working against them.',
      'Yatin and Rishabh met in the trenches of the startup world — long hours, late nights, and more processed snacks than either would like to admit. Like millions of urban Indians, they were consuming honey from supermarket shelves, assuming it was doing them good. It wasn\'t.',
    ],
    imageRight: false,
    image: '/images/home/story-bees-flower.jpg',
    imageAlt: 'Wild honeybee on flower',
  },
  {
    number: '02',
    eyebrow: 'THE SUMO INSPIRATION',
    headline: 'Strength through\nwhat you eat.',
    paragraphs: [
      'Sumo wrestlers — the pinnacle of controlled power and disciplined mass — have historically consumed raw honey as a staple of their diet. Not processed sugar syrups. Not industrial blends. Raw, wild honey, exactly as it comes from the hive.',
      'That image stuck. Here were athletes at the apex of physical performance, fuelling themselves with something ancient, unprocessed, and honest. If raw honey was good enough for sumo champions, it was good enough to build a brand around.',
    ],
    imageRight: true,
    image: '/images/home/story-wild-hives.jpg',
    imageAlt: 'Sumo-inspired strength through natural food',
  },
  {
    number: '03',
    eyebrow: 'THE SUPERMARKET ILLUSION VS WILD REALITY',
    headline: 'What you think\nyou\'re buying.',
    paragraphs: [
      'Most commercial honey is a ghost of what honey should be — heated past 40°C (destroying enzymes and antioxidants), ultra-filtered (stripping pollen and traceability), often blended, sometimes adulterated with corn syrup. It\'s shelf-stable, photogenic, and nutritionally hollow.',
      'Wild raw honey from forest apiaries is fundamentally different. It\'s alive with pollen, propolis, beeswax traces, and a full complement of enzymes. It crystallises naturally (a sign of purity). It has a distinct terroir — the forest, the flowers, the altitude all leave their signature in every jar.',
    ],
    imageRight: false,
    image: '/images/home/story-raw-honey.jpg',
    imageAlt: 'Raw honey comparison',
  },
  {
    number: '04',
    eyebrow: 'SOURCING FROM INDIA\'S UNTAMED ECOSYSTEMS',
    headline: 'Five forests.\nFive honeys.',
    paragraphs: [
      'India is home to some of the world\'s most biodiverse forests — and the honeys produced within them are unlike anything found on supermarket shelves. SUMOSTA sources exclusively from wild and semi-wild apiaries across these ecosystems, working directly with traditional beekeepers and forest-dwelling communities who have harvested honey for generations.',
      'From the rare Dammer bees of the pristine Nagaland forests to the Bloodseed forests of Abujhmarh, Chhattisgarh, every honey in our range is single-origin, traceable, and harvested in small batches. We pay above-market rates. We never adulterate. We never compromise.',
    ],
    imageRight: true,
    image: '/images/home/about-hero-honeycomb.jpg',
    imageAlt: 'Indian forest ecosystem',
  },
  {
    number: '05',
    eyebrow: 'THE BIRTH OF A DAILY RITUAL',
    headline: 'Welcome to\nSUMOSTA.',
    paragraphs: [
      'SUMOSTA was built for people who refuse to compromise — who want to indulge, but want that indulgence to work for them, not against them. We believe that eating well shouldn\'t mean eating joylessly. That sweetness can be guilt-free when it\'s honest.',
      'Every jar we ship is NABL lab tested, NPOP APEDA organic certified, and traceable back to its specific apiary and harvest batch. From hive to home, nothing is added. Nothing is taken away. Just honey, exactly as nature made it.',
    ],
    imageRight: false,
    image: '/images/products/wild-forest-250-hero.png',
    imageAlt: 'SUMOSTA wild forest honey jar — your daily ritual',
  },
];

const STATS = [
  { value: 5000, suffix: '+', label: 'Happy Customers' },
  { value: 12,   suffix: '',  label: 'Wild Apiaries' },
  { value: 0,    suffix: '',  label: 'Additives Ever',  static: 'Zero' },
  { value: 100,  suffix: '%', label: 'Traceable' },
];

const FOUNDERS = [
  {
    name: 'Yatin Narechania',
    title: 'Founder & CEO',
    badge: 'The Brain of SUMOSTA',
    image: '/images/brand/yatin.jpg',
    imageFit: 'cover' as const,
    imagePosition: 'center 20%',
    stance: 'Handling the heavy lifting behind Strategy, Product Development, and Finance.',
    profile: 'If SUMOSTA were a perfectly balanced recipe, Yatin is the master chef holding the measuring spoons. As the strategic brain, he refuses to compromise on lab-tested purity, obsesses over product formulations, and ensures unit economics are as clean as the ingredient labels — a classic Gujarati superpower. He channels the true Sumo mindset by bringing absolute calm, focus, and structural vision to the product roadmap.',
    fueledBy: 'A morning ritual of raw wild forest honey and big strategic visions.',
  },
  {
    name: 'Rishabh Makharia',
    title: 'Co-Founder & COO',
    badge: 'The Soul of SUMOSTA',
    image: '/images/brand/rishabh.png',
    imageFit: 'cover' as const,
    imagePosition: 'center top',
    stance: 'Dominating the ring in Business Operations, Logistics, and Sales.',
    profile: 'If Yatin is the blueprint, Rishabh is the engine that drives it forward. As the living soul of the brand, Rishabh turns grand ideas into reality, manages the wild logistics of sourcing from India\'s most remote forests, and makes sure a jar of SUMOSTA lands seamlessly on your dining table. With an inherent Marwari drive for relentless hustle and relationship-building, he\'s the energetic force making sure our "indulgence that cares" reaches every corner of the country.',
    fueledBy: 'Pure adrenaline, unstoppable sales hustle, and a guilt-free sweet tooth.',
  },
];

export default function AboutPage() {
  useEffect(() => {
    const reveal = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add('revealed');
        }
      });
    };
    window.addEventListener('scroll', reveal, { passive: true });
    reveal();
    return () => window.removeEventListener('scroll', reveal);
  }, []);

  return (
    <div className="bg-cream text-charcoal font-satoshi min-h-screen">

      {/* Dark hero */}
      <section className="relative h-[60vh] min-h-[420px] bg-midnight overflow-hidden">
        <Image
          src="/images/home/about-hero-honeycomb.jpg"
          fill
          alt="Dark honeycomb close-up"
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: 'linear-gradient(to bottom, rgba(26,21,14,0.35), rgba(26,21,14,0.2) 45%, rgba(26,21,14,0.75))' }}
        />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div data-reveal>
            <p className="font-satoshi uppercase tracking-[0.2em] text-honey-300 font-bold text-[13px] mb-4">
              Our Story
            </p>
            <h1 className="font-clash font-extrabold text-cream leading-[1.1] m-0" style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}>
              Born from the Hustle.<br />Perfected by Nature.
            </h1>
          </div>
        </div>
      </section>

      {/* Story chapters */}
      <div className="max-w-content mx-auto px-6 py-20">
        {STORY_CHAPTERS.map((ch, i) => (
          <div
            key={i}
            className={`sum-story-row grid grid-cols-1 gap-10 ${
              i < STORY_CHAPTERS.length - 1 ? 'mb-24' : ''
            }`}
          >
            <div data-reveal style={{ order: ch.imageRight ? 2 : 1 }}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={ch.image}
                  fill
                  alt={ch.imageAlt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div
              data-reveal
              className="flex flex-col justify-center"
              style={{ order: ch.imageRight ? 1 : 2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-clash font-extrabold text-sand text-5xl leading-none">
                  {ch.number}
                </span>
                <p className="font-satoshi uppercase tracking-[0.15em] text-honey-500 font-bold text-[11px] m-0">
                  {ch.eyebrow}
                </p>
              </div>
              <h2
                className="font-clash font-extrabold text-charcoal mb-6 whitespace-pre-line"
                style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)' }}
              >
                {ch.headline}
              </h2>
              {ch.paragraphs.map((para, pi) => (
                <p
                  key={pi}
                  className={`font-satoshi text-[15px] leading-[1.8] text-bark ${
                    pi < ch.paragraphs.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats counter section */}
      <section aria-labelledby="stats-heading" className="bg-cream-warm border-y border-sand py-16 px-6">
        <div className="max-w-content mx-auto">
          <h2 id="stats-heading" className="sr-only">By the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} data-reveal className="flex flex-col items-center">
                {stat.static ? (
                  <span className="font-clash font-extrabold text-4xl md:text-5xl text-honey-500 leading-none">
                    {stat.static}
                  </span>
                ) : (
                  <SmoothCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    className="font-clash font-extrabold text-4xl md:text-5xl text-honey-500 leading-none"
                  />
                )}
                <p className="font-satoshi text-sm text-earth mt-3 uppercase tracking-[0.08em] font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote — compact */}
      <div className="bg-cream-warm px-6 py-12">
        <div data-reveal className="max-w-[760px] mx-auto text-center">
          <p className="font-bespoke text-honey-500 text-5xl leading-none mb-2 font-bold" aria-hidden="true">
            &ldquo;
          </p>
          <p
            className="font-bespoke italic text-charcoal leading-[1.7] m-0"
            style={{ fontSize: 'clamp(1.05rem,2vw,1.35rem)' }}
          >
            Honey is the only food that never spoils. Egyptian honey found in 3,000-year-old tombs was still perfectly edible. We believe honey that&apos;s been processed, heated, and stripped of its life deserves a different name entirely.
          </p>
          <p className="font-satoshi text-[13px] text-earth mt-4 font-semibold">
            — SUMOSTA Founders
          </p>
        </div>
      </div>

      {/* Founders */}
      <div className="bg-cream py-20 px-6">
        <div className="max-w-content mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="font-satoshi uppercase tracking-[0.15em] text-honey-500 font-bold text-xs mb-4">
              Meet the Founders
            </p>
            <h2
              className="font-clash font-extrabold text-charcoal mb-5"
              style={{ fontSize: 'clamp(2rem,4vw,3.2rem)' }}
            >
              Meet the Heavyweights Behind the Honey.
            </h2>
            <p className="font-satoshi text-base text-bark max-w-[680px] mx-auto leading-[1.75]">
              When a Gujarati and a Marwari team up to launch a food brand, two things are absolutely guaranteed: the numbers will always balance, and the food will always taste phenomenal. We stepped into the SUMOSTA ring to prove that you can conquer the modern daily hustle without giving up the joy of eating.
            </p>
          </div>

          <div className="sum-founders-grid grid grid-cols-1 gap-8 items-stretch auto-rows-fr">
            {FOUNDERS.map((f) => (
              <div
                key={f.name}
                data-reveal
                className="bg-cream-warm rounded-[20px] border border-sand p-10 flex flex-col gap-5 h-full"
              >
                <div className="flex items-center gap-5">
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-honey-400 bg-honey-200"
                  >
                    <Image
                      src={f.image}
                      fill
                      alt={f.name}
                      sizes="80px"
                      style={{ objectFit: f.imageFit, objectPosition: f.imagePosition }}
                    />
                  </div>
                  <div>
                    <h3 className="font-clash font-extrabold text-charcoal text-xl mb-0.5">
                      {f.name}
                    </h3>
                    <p className="font-satoshi text-[13px] text-honey-500 font-bold mb-0.5">
                      {f.title}
                    </p>
                    <span className="inline-block bg-honey-100 text-honey-600 font-satoshi text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-[0.05em]">
                      {f.badge}
                    </span>
                  </div>
                </div>
                <div className="bg-cream rounded-lg px-4 py-3 border-l-[3px] border-honey-400">
                  <p className="font-satoshi uppercase tracking-[0.12em] text-honey-500 font-bold text-[11px] mb-1">
                    The Sumo Stance
                  </p>
                  <p className="font-satoshi text-sm text-bark leading-[1.6] m-0">{f.stance}</p>
                </div>
                <p className="font-satoshi text-[15px] text-bark leading-[1.8] m-0">{f.profile}</p>
                <p className="font-satoshi text-[13px] text-earth m-0 mt-auto">
                  <span className="font-bold text-charcoal">Fueled By: </span>
                  {f.fueledBy}
                </p>
              </div>
            ))}
          </div>

          <div
            data-reveal
            className="text-center mt-14 px-6 py-10 bg-charcoal rounded-[20px]"
          >
            <p
              className="font-bespoke italic text-cream leading-[1.75] max-w-[700px] mx-auto m-0"
              style={{ fontSize: 'clamp(1rem,1.8vw,1.25rem)' }}
            >
              &ldquo;We don&apos;t just run the company; we are our own biggest customers. We built SUMOSTA because our own sweet teeth demanded an indulgence that actually looks out for our health. Welcome to the ring!&rdquo;
            </p>
            <p className="font-satoshi text-[13px] text-honey-400 mt-5 font-semibold">
              — Yatin &amp; Rishabh, Co-Founders
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-charcoal py-20 px-6 text-center">
        <h2
          className="font-clash font-extrabold text-cream mb-5"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}
        >
          Ready to taste the difference?
        </h2>
        <p className="font-satoshi text-base text-earth-light mb-8">
          Explore our collection of raw, single-origin honeys.
        </p>
        <Link
          href="/shop"
          className="btn-honey inline-flex items-center gap-2.5"
        >
          Shop the Collection →
        </Link>
      </div>

      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        [data-reveal].revealed { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; transition: none; }
        }
        @media (min-width: 768px) {
          .sum-founders-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sum-story-row { grid-template-columns: 1fr 1fr !important; gap: 64px !important; }
        }
      `}</style>
    </div>
  );
}
