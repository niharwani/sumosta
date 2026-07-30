'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STORY_CHAPTERS = [
  {
    number: '01',
    eyebrow: 'THE SWEET TOOTH & THE CORPORATE TOLL',
    headline: 'Born from the Hustle.\nPerfected by Nature.',
    paragraphs: [
      "Two founders. One Gujarati, one Marwari. Both with an intense love of sugar, a corporate grind eating them alive, and a growing realisation that the sweet things in life were slowly working against them.",
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
    image: '/images/products/wild-forest-1.png',
    imageAlt: 'SUMOSTA wild forest honey jar — your daily ritual',
  },
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
    <div style={{ background: '#FFFDF8', fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif', color: '#2C2417', minHeight: '100vh' }}>

      {/* Dark hero */}
      <div style={{ position: 'relative', height: '60vh', minHeight: '420px', background: '#1A150E', overflow: 'hidden', marginTop: 0 }}>
        <Image
          src="/images/home/about-hero-honeycomb.jpg"
          fill
          alt="Dark honeycomb close-up"
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,21,14,0.35), rgba(26,21,14,0.2) 45%, rgba(26,21,14,0.75))' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', paddingTop: '108px' }}>
          <div data-reveal>
            <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#FFCC66', fontWeight: 700, margin: '0 0 16px' }}>Our Story</p>
            <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.2rem,6vw,4.5rem)', lineHeight: 1.1, color: '#FFFDF8', margin: 0 }}>
              Born from the Hustle.<br />Perfected by Nature.
            </h1>
          </div>
        </div>
      </div>

      {/* Story chapters */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 24px' }}>
        {STORY_CHAPTERS.map((ch, i) => (
          <div
            key={i}
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', marginBottom: i < STORY_CHAPTERS.length - 1 ? '96px' : 0 }}
            className="sum-story-row"
          >
            <div data-reveal style={{ order: ch.imageRight ? 2 : 1 }}>
              <div style={{ aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <Image
                  src={ch.image}
                  fill
                  alt={ch.imageAlt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div data-reveal style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', order: ch.imageRight ? 1 : 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '48px', color: '#F0E6D3', lineHeight: 1 }}>{ch.number}</span>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: 0 }}>{ch.eyebrow}</p>
              </div>
              <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: '#2C2417', margin: '0 0 24px', whiteSpace: 'pre-line' }}>{ch.headline}</h2>
              {ch.paragraphs.map((para, pi) => (
                <p key={pi} style={{ fontSize: '15px', lineHeight: 1.8, color: '#5C4A32', margin: pi < ch.paragraphs.length - 1 ? '0 0 16px' : 0 }}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pull quote — compact */}
      <div style={{ background: '#FDF6EC', padding: '48px 24px' }}>
        <div data-reveal style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#D4891A', fontSize: '48px', lineHeight: 1, margin: '0 0 8px', fontWeight: 700 }}>&ldquo;</p>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, color: '#2C2417', fontSize: 'clamp(1.05rem,2vw,1.35rem)', lineHeight: 1.7, margin: 0 }}>
            Honey is the only food that never spoils. Egyptian honey found in 3,000-year-old tombs was still perfectly edible. We believe honey that&apos;s been processed, heated, and stripped of its life deserves a different name entirely.
          </p>
          <p style={{ fontSize: '13px', color: '#8B7355', margin: '16px 0 0', fontWeight: 600 }}>— SUMOSTA Founders</p>
        </div>
      </div>

      {/* Founders */}
      <div style={{ background: '#FFFDF8', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 16px' }}>Meet the Founders</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: '#2C2417', margin: '0 0 20px' }}>Meet the Heavyweights Behind the Honey.</h2>
            <p style={{ fontSize: '16px', color: '#5C4A32', maxWidth: '680px', margin: '0 auto', lineHeight: 1.75 }}>When a Gujarati and a Marwari team up to launch a food brand, two things are absolutely guaranteed: the numbers will always balance, and the food will always taste phenomenal. We stepped into the SUMOSTA ring to prove that you can conquer the modern daily hustle without giving up the joy of eating.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="sum-founders-grid">
            {FOUNDERS.map((f) => (
              <div key={f.name} data-reveal style={{ background: '#FDF6EC', borderRadius: '20px', border: '1px solid #F0E6D3', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '999px', overflow: 'hidden', flexShrink: 0, border: '2px solid #F5A623', position: 'relative', background: '#FFE0A8' }}>
                    <Image src={f.image} fill alt={f.name} sizes="80px" style={{ objectFit: f.imageFit, objectPosition: f.imagePosition }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontSize: '20px', fontWeight: 800, color: '#2C2417', margin: '0 0 2px' }}>{f.name}</h3>
                    <p style={{ fontSize: '13px', color: '#D4891A', fontWeight: 700, margin: '0 0 2px' }}>{f.title}</p>
                    <span style={{ display: 'inline-block', background: '#FFF0D6', color: '#A66A10', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>{f.badge}</span>
                  </div>
                </div>
                <div style={{ background: '#FFFDF8', borderRadius: '10px', padding: '14px 18px', borderLeft: '3px solid #F5A623' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#D4891A', fontWeight: 700, margin: '0 0 4px' }}>The Sumo Stance</p>
                  <p style={{ fontSize: '14px', color: '#5C4A32', margin: 0, lineHeight: 1.6 }}>{f.stance}</p>
                </div>
                <p style={{ fontSize: '15px', color: '#5C4A32', lineHeight: 1.8, margin: 0 }}>{f.profile}</p>
                <p style={{ fontSize: '13px', color: '#8B7355', margin: 0 }}>
                  <span style={{ fontWeight: 700, color: '#2C2417' }}>Fueled By: </span>{f.fueledBy}
                </p>
              </div>
            ))}
          </div>

          <div data-reveal style={{ textAlign: 'center', marginTop: '56px', padding: '40px 24px', background: '#2C2417', borderRadius: '20px' }}>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, fontSize: 'clamp(1rem,1.8vw,1.25rem)', color: '#FFFDF8', lineHeight: 1.75, maxWidth: '700px', margin: '0 auto' }}>
              &ldquo;We don&apos;t just run the company; we are our own biggest customers. We built SUMOSTA because our own sweet teeth demanded an indulgence that actually looks out for our health. Welcome to the ring!&rdquo;
            </p>
            <p style={{ fontSize: '13px', color: '#F5A623', margin: '20px 0 0', fontWeight: 600 }}>— Yatin &amp; Rishabh, Co-Founders</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#2C2417', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#FFFDF8', margin: '0 0 20px' }}>Ready to taste the difference?</h2>
        <p style={{ fontSize: '16px', color: '#C4B39A', margin: '0 0 32px' }}>Explore our collection of raw, single-origin honeys.</p>
        <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '15px', padding: '17px 34px', borderRadius: '8px', boxShadow: '0 12px 34px rgba(245,166,35,0.35)', textDecoration: 'none', fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Shop the Collection →
        </Link>
      </div>

      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        [data-reveal].revealed { opacity: 1; transform: none; }
        @media (min-width: 768px) {
          .sum-founders-grid { grid-template-columns: repeat(2,1fr) !important; }
          .sum-story-row { grid-template-columns: 1fr 1fr !important; gap: 64px !important; }
        }
      `}</style>
    </div>
  );
}
