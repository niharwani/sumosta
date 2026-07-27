'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STORY_SECTIONS = [
  {
    eyebrow: 'OUR ORIGIN',
    headline: 'Born from a Love of Pure Honey',
    imageRight: false,
    imageAlt: 'Wild honeybee pollinating a flower',
    image: '/images/home/story-bees-flower.jpg',
    paragraphs: [
      'SUMOSTA began with a simple conviction: honey in its natural state is one of nature\'s most perfect foods. Our founders, having grown up near the forests of the Western Ghats, watched as commercial honey became increasingly processed, heated, and adulterated. They set out to change that.',
      'The name SUMOSTA derives from the Sanskrit root for sweetness — and our mission is to preserve it, exactly as nature intended.',
    ],
  },
  {
    eyebrow: 'HOW WE SOURCE',
    headline: "From Wild Hives, Across India's Most Remote Forests",
    imageRight: true,
    imageAlt: 'Beekeeper inspecting honeycomb frame',
    image: '/images/home/story-wild-hives.jpg',
    paragraphs: [
      'We work directly with traditional beekeepers and forest tribes across three distinct ecosystems — the Western Ghats, the Sundarbans mangroves, and the Himalayan foothills. Each ecosystem produces honey with its own distinctive terroir, flavor profile, and medicinal properties.',
      'Our beekeepers are not industrialists. They are custodians — families who have harvested honey from the same forests for generations. We pay them above market rates and ensure their livelihoods are protected.',
    ],
  },
  {
    eyebrow: 'OUR PROMISE',
    headline: 'Raw, Unprocessed, and Fully Traceable',
    imageRight: false,
    imageAlt: 'Honey dripping from a dipper — raw and unfiltered',
    image: '/images/home/story-raw-honey.jpg',
    paragraphs: [
      'Every jar of SUMOSTA honey is raw — never heated above hive temperature, never ultra-filtered. This preserves the pollen, enzymes, and antioxidants that make honey genuinely beneficial.',
      'We test every batch at a third-party FSSAI-approved laboratory for purity, moisture content, and adulteration markers. The batch ID on every jar can be traced back to its specific apiary and harvest month.',
    ],
  },
];

const STATS = [
  { value: 12, suffix: '', label: 'Wild Apiaries' },
  { value: 0, suffix: '', label: 'Additives' },
  { value: 100, suffix: '%', label: 'Traceable' },
];

const TEAM = [
  { name: 'Arjun Nair', role: 'Co-founder & Head of Sourcing', bio: 'Former wildlife researcher. Has hiked every trail in the Western Ghats twice.', initials: 'AN' },
  { name: 'Priya Menon', role: 'Co-founder & CEO', bio: 'Food scientist turned entrepreneur. Believes the best product is no product at all — just nature.', initials: 'PM' },
  { name: 'Rahul Sharma', role: 'Head of Quality', bio: '15 years in food safety. Has rejected more honey than he has approved, and proud of it.', initials: 'RS' },
];

export default function AboutPage() {
  const [statDisplays, setStatDisplays] = useState(STATS.map(() => '0'));
  const [statsTriggered, setStatsTriggered] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Reveal on scroll
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

  // Stats count-up
  useEffect(() => {
    if (statsTriggered) return;
    const el = statsRef.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85) {
        setStatsTriggered(true);
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const ease = 1 - Math.pow(1 - t, 3);
          setStatDisplays(STATS.map((s) => Math.round(s.value * ease) + s.suffix));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        window.removeEventListener('scroll', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [statsTriggered]);

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
            <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.6rem,7vw,5.5rem)', lineHeight: 1.08, color: '#FFFDF8', margin: 0 }}>
              Nature&apos;s Golden<br />Promise
            </h1>
          </div>
        </div>
      </div>

      {/* Story sections */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 24px' }}>
        {STORY_SECTIONS.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', marginBottom: i < STORY_SECTIONS.length - 1 ? '80px' : 0 }} className="sum-story-row">
            <div data-reveal style={{ order: s.imageRight ? 2 : 1 }}>
              <div style={{ aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <Image
                  src={s.image}
                  fill
                  alt={s.imageAlt}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div data-reveal style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', order: s.imageRight ? 1 : 2 }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 16px' }}>{s.eyebrow}</p>
              <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: '#2C2417', margin: '0 0 24px' }}>{s.headline}</h2>
              {s.paragraphs.map((para, pi) => (
                <p key={pi} style={{ fontSize: '15px', lineHeight: 1.8, color: '#5C4A32', margin: pi < s.paragraphs.length - 1 ? '0 0 16px' : 0 }}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pull quote */}
      <div style={{ background: '#FDF6EC', padding: '96px 24px' }}>
        <div data-reveal style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', color: '#D4891A', fontSize: '56px', lineHeight: 1, margin: '0 0 12px' }}>&ldquo;</p>
          <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', color: '#2C2417', fontSize: 'clamp(1.2rem,2.4vw,1.7rem)', lineHeight: 1.6, margin: 0 }}>
            Honey is the only food that never spoils. Egyptian honey found in 3,000-year-old tombs was still perfectly edible. We believe honey that&apos;s been processed, heated, and stripped of its life deserves a different name entirely.
          </p>
          <p style={{ fontSize: '13px', color: '#8B7355', margin: '24px 0 0' }}>— SUMOSTA Founders</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Golden divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '56px' }}>
            <span style={{ width: '64px', height: '1px', background: '#F0E6D3' }} />
            <span style={{ width: '6px', height: '6px', background: '#F5A623', transform: 'rotate(45deg)' }} />
            <span style={{ width: '64px', height: '1px', background: '#F0E6D3' }} />
          </div>
          <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px' }} className="sum-stats-grid">
            {STATS.map((st, i) => (
              <div key={st.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, color: '#F5A623', fontSize: 'clamp(2.2rem,4.5vw,3.8rem)', margin: '0 0 8px' }}>
                  {statDisplays[i]}
                </div>
                <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B7355', margin: 0 }}>{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ background: '#FDF6EC', padding: '96px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: '#2C2417', margin: '0 0 16px' }}>The People Behind the Hive</h2>
            <p style={{ fontSize: '15px', color: '#8B7355', maxWidth: '520px', margin: '0 auto' }}>A small, passionate team of food scientists, foragers, and storytellers — united by an obsession with purity.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }} className="sum-team-grid">
            {TEAM.map((m) => (
              <div key={m.name} data-reveal style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '999px', background: '#FFE0A8', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, color: '#A66A10', fontSize: '24px' }}>{m.initials}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2417', margin: '0 0 2px' }}>{m.name}</h3>
                <p style={{ fontSize: '13px', color: '#D4891A', fontWeight: 600, margin: '0 0 12px' }}>{m.role}</p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#8B7355', margin: '0 auto', maxWidth: '280px' }}>{m.bio}</p>
              </div>
            ))}
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
        @media (min-width: 768px) {
          .sum-team-grid { grid-template-columns: repeat(3,1fr) !important; }
          .sum-story-row { grid-template-columns: 1fr 1fr !important; gap: 64px !important; }
        }
      `}</style>
    </div>
  );
}
