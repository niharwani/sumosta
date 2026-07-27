'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STATIC_PRODUCTS } from '@/lib/content';

const PRODUCTS = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon);

const PROCESS_STEPS = [
  { num: '01', title: 'Sourced Wild', body: 'Our beekeepers locate wild colonies in protected forest reserves — the Western Ghats, Sundarbans, and Himalayan foothills.', image: '/images/home/sourced-wild.jpg' },
  { num: '02', title: 'Harvested with Care', body: 'Traditional harvesting methods ensure colonies are never disturbed beyond what they can sustain.', image: '/images/home/harvested-with-care.jpg' },
  { num: '03', title: 'Tested for Purity', body: 'Every batch is cold-extracted and sent to certified labs for purity testing before it leaves the apiary.', image: '/images/home/tested-for-purity.jpg' },
  { num: '04', title: 'Sealed for You', body: 'Filled in small batches into glass jars, sealed immediately to preserve enzymes, aroma, and the full terroir of each apiary.', image: '/images/home/sealed-for-you.jpg' },
];

const FACTS = [
  { num: '01', text: 'A single bee visits up to 5,000 flowers in one day.', detail: 'A forager leaves the hive dozens of times a day, working one type of flower per trip so the pollen she carries stays pure enough to fertilize the next bloom.', proof: 'Entomologists track this with harmonic radar tags on foraging bees and by counting pollen loads on workers as they return to the hive.' },
  { num: '02', text: 'It takes 12 worker bees their whole lives to make one tablespoon of honey.', detail: 'A worker bee lives about six weeks, and only the final third of that life is spent foraging outside the hive.', proof: 'Beekeepers calculate this from measured nectar yield per foraging trip (~40mg) against the limited number of trips a worker completes in six weeks.' },
  { num: '03', text: 'Edible honey has been found preserved in 3,000-year-old tombs.', detail: 'Honey\'s low moisture, high acidity, and natural hydrogen peroxide make it one of the only foods that essentially never spoils when sealed properly.', proof: 'Sealed jars of honey recovered from ancient Egyptian tombs, including Tutankhamun\'s, were found still preserved and edible thousands of years later.' },
  { num: '04', text: 'Bees dance in figure-eights to tell hive-mates where the flowers are.', detail: 'The "waggle dance" encodes both direction and distance: the angle relative to the sun points toward the flowers, and the waggle run length tells the distance.', proof: 'Zoologist Karl von Frisch decoded the waggle dance through decades of observation — work that earned him a share of the Nobel Prize in Physiology or Medicine.' },
  { num: '05', text: 'One healthy hive can yield 25–30kg of surplus honey a year.', detail: 'A colony stores far more honey than it needs to survive winter. Responsible beekeepers only ever take the sustainable surplus.', proof: 'Beekeepers weigh hive supers before and after a season\'s nectar flow; the difference between total stores and what the colony needs to overwinter is the surplus.' },
  { num: '06', text: 'Honey\'s color and flavor depend entirely on which flowers the bees visited.', detail: 'A single-origin honey tastes the way it does because of the specific plants in bloom near the hive at harvest time.', proof: 'Palynologists (pollen analysts) can identify a honey\'s floral origin by examining the microscopic pollen grains suspended within it.' },
  { num: '07', text: 'A queen bee can lay up to 2,000 eggs in a single day.', detail: 'At the height of spring, a queen can lay more than her own body weight in eggs every day, driving the rapid population growth a colony needs before the main nectar flow.', proof: 'Apiarists confirm egg-laying rates by counting capped brood cells across hive frames during routine inspections through the spring buildup.' },
];

const HEX_POSITIONS: [number, number][] = [[0, 0], [70, -121], [140, 0], [70, 121], [-70, 121], [-140, 0], [-70, -121]];

const HEX_LOADER = [
  { left: 'calc(50% - 20px)', top: 'calc(50% - 23px)', delay: '0s' },
  { left: 'calc(50% + 0px)',  top: 'calc(50% - 58px)', delay: '.08s' },
  { left: 'calc(50% + 20px)', top: 'calc(50% - 23px)', delay: '.16s' },
  { left: 'calc(50% + 0px)',  top: 'calc(50% + 12px)', delay: '.24s' },
  { left: 'calc(50% - 40px)', top: 'calc(50% + 12px)', delay: '.32s' },
  { left: 'calc(50% - 60px)', top: 'calc(50% - 23px)', delay: '.4s' },
  { left: 'calc(50% - 40px)', top: 'calc(50% - 58px)', delay: '.48s' },
];

// Burst element data: positions as % of 16:9 container, displacement offsets, rotation, animation delay
const HERO_BURSTS: { src: string; l: string; t: string; w: string; h: string; dx: number; dy: number; rot?: string; delay: string; dropShadow?: boolean }[] = [
  { src: '/images/home/hero-dipper.png',           l: '2.84%',  t: '12.15%', w: '33.63%', h: '51.26%', dx: 31.95,  dy: 15.73,  rot: '-12deg', delay: '0.55s', dropShadow: true },
  { src: '/images/home/hero-honeycomb-top.png',    l: '62.74%', t: '0%',     w: '20.03%', h: '37.21%', dx: -21.15, dy: 34.90,  rot: '10deg',  delay: '0.65s', dropShadow: true },
  { src: '/images/home/hero-honeycomb-bottom.png', l: '23.24%', t: '71.35%', w: '15.93%', h: '27.79%', dx: 20.40,  dy: -31.73, rot: '-8deg',  delay: '0.7s',  dropShadow: true },
  { src: '/images/home/hero-bee-top.png',          l: '29.94%', t: '8.06%',  w: '9.03%',  h: '14.46%', dx: 17.15,  dy: 38.22,                 delay: '0.9s'  },
  { src: '/images/home/hero-bee-left.png',         l: '15.33%', t: '56.41%', w: '9.33%',  h: '13.93%', dx: 31.60,  dy: -9.87,                 delay: '0.98s' },
  { src: '/images/home/hero-bee-right.png',        l: '78.84%', t: '41.30%', w: '6.03%',  h: '15.88%', dx: -30.25, dy: 4.27,                  delay: '1.02s' },
  { src: '/images/home/hero-drop-top.png',         l: '57.33%', t: '3.44%',  w: '3.73%',  h: '6.28%',  dx: -7.60,  dy: 46.93,                 delay: '0.78s' },
  { src: '/images/home/hero-drop-pair.png',        l: '69.94%', t: '67.62%', w: '9.33%',  h: '14.99%', dx: -23.00, dy: -21.60,                delay: '0.82s' },
  { src: '/images/home/hero-drop-mid-right.png',   l: '76.23%', t: '41.66%', w: '3.23%',  h: '5.75%',  dx: -26.25, dy: 8.98,                  delay: '0.75s' },
  { src: '/images/home/hero-drop-mid-left.png',    l: '19.33%', t: '80.06%', w: '2.93%',  h: '5.04%',  dx: 30.80,  dy: -29.07,                delay: '0.86s' },
  { src: '/images/home/hero-drop-bottom.png',      l: '41.13%', t: '89.30%', w: '4.03%',  h: '7.17%',  dx: 8.45,   dy: -39.38,                delay: '0.9s'  },
];

const honeycombSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E")`;
const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`;

export default function HomeContent() {
  const [loaded, setLoaded] = useState(false);
  const [openFact, setOpenFact] = useState(0);
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const processSectionRef  = useRef<HTMLElement>(null);
  const processTrackRef    = useRef<HTMLDivElement>(null);
  const processBarRef      = useRef<HTMLDivElement>(null);
  const processImagesRef   = useRef<HTMLDivElement>(null);
  const cursorRef          = useRef<HTMLDivElement>(null);
  const carouselRef        = useRef<HTMLDivElement>(null);

  const scrollCarousel = useCallback((dir: 'prev' | 'next') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'next' ? 300 : -300, behavior: 'smooth' });
  }, []);

  // Page loader
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  // [data-reveal] IntersectionObserver
  useEffect(() => {
    if (!loaded) return;
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loaded]);

  // Scroll-driven process section + background image crossfade
  useEffect(() => {
    const onScroll = () => {
      const section    = processSectionRef.current;
      const track      = processTrackRef.current;
      const bar        = processBarRef.current;
      const imagesWrap = processImagesRef.current;
      if (!section || !track) return;
      const rect     = section.getBoundingClientRect();
      const total    = rect.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      track.style.transform = `translateX(-${progress * 75}%)`;
      if (bar) bar.style.transform = `scaleX(${progress})`;
      if (imagesWrap) {
        const n = imagesWrap.children.length;
        const cur = progress * (n - 1);
        for (let i = 0; i < n; i++) {
          (imagesWrap.children[i] as HTMLElement).style.opacity = String(Math.max(0, 1 - Math.abs(cur - i)));
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Custom cursor (desktop only)
  useEffect(() => {
    const dot = cursorRef.current;
    if (!dot || window.matchMedia('(pointer: coarse)').matches) return;
    let mx = -100, my = -100, cx = -100, cy = -100;
    let raf: number;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);
    const loop = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      dot.style.transform = `translate(${cx - 5}px,${cy - 5}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onOver = (e: MouseEvent) => { if ((e.target as Element).closest('a,button')) { dot.style.width = '32px'; dot.style.height = '32px'; } };
    const onOut  = (e: MouseEvent) => { if ((e.target as Element).closest('a,button')) { dot.style.width = '10px'; dot.style.height = '10px'; } };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  const handleNewsletter = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSuccess(true);
  }, []);

  const activeFact = FACTS[openFact] ?? FACTS[0];

  return (
    <>
      {/* ===== PAGE LOADER ===== */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#FFFDF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: loaded ? 0 : 1, pointerEvents: loaded ? 'none' : 'auto', transition: 'opacity .6s ease' }}>
        <div style={{ position: 'relative', width: '140px', height: '130px' }}>
          {HEX_LOADER.map((h, i) => (
            <span key={i} style={{ position: 'absolute', left: h.left, top: h.top, width: '40px', height: '46px', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', background: '#F5A623', animation: `sum-pulse-gold 1.2s ease-in-out infinite`, animationDelay: h.delay }} />
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', color: '#8B7355', fontSize: '14px', letterSpacing: '0.02em', margin: 0 }}>
          Nature&apos;s Golden Promise
        </p>
      </div>

      {/* ===== CUSTOM CURSOR ===== */}
      <div ref={cursorRef} style={{ position: 'fixed', top: 0, left: 0, width: '10px', height: '10px', background: '#F5A623', borderRadius: '999px', pointerEvents: 'none', zIndex: 9999, transform: 'translate(-100px,-100px)', transition: 'width .25s ease, height .25s ease' }} />

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'radial-gradient(120% 100% at 15% 15%,#FFFDF8 0%,#FFF9F0 45%,#FFF0D6 100%)', paddingTop: '88px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: honeycombSvg, backgroundSize: '56px 100px', opacity: 0.04, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.5, pointerEvents: 'none', backgroundImage: noiseSvg }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 160px rgba(26,21,14,0.06)' }} />

        <div className="sum-hero-grid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'center', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>

          {/* Left — headline + CTAs */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #FFCC66', borderRadius: '999px', padding: '6px 14px', marginBottom: '20px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#F5A623', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A66A10', fontWeight: 700 }}>Single-Origin · Wild Sourced · Unprocessed</span>
            </div>
            <h1 style={{ margin: '0 0 20px', lineHeight: 0.96 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: 'clamp(2.4rem,6.2vw,5.2rem)', color: '#F5A623' }}>Nature&apos;s</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.9rem,7.8vw,6.8rem)', color: '#2C2417', letterSpacing: '-0.01em' }}>Golden Promise</span>
            </h1>
            <p className="sum-hero-body" style={{ fontSize: '16px', lineHeight: 1.7, color: '#8B7355', maxWidth: '480px', margin: '0 0 28px' }}>
              Raw, unprocessed honey sourced from India&apos;s wildest apiaries. From hive to home, nothing added, nothing taken.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '15px', padding: '15px 28px', borderRadius: '8px', boxShadow: '0 12px 34px rgba(245,166,35,0.35)', textDecoration: 'none', fontFamily: 'var(--font-bricolage), sans-serif' }}>
                Shop Collection <span>→</span>
              </Link>
              <Link href="/about" style={{ color: '#5C4A32', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                Our Story <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right — image burst composition */}
          <div className="sum-hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* ambient glow + decorative rings */}
            <div style={{ position: 'absolute', width: '78%', height: '66%', borderRadius: '999px', background: '#FFE0A8', opacity: 0.6, filter: 'blur(60px)' }} />
            <div className="animate-sum-spin-slow sum-hero-ring-1" style={{ position: 'absolute', width: '340px', height: '340px', borderRadius: '999px', border: '1px solid rgba(212,137,26,0.25)' }} />
            <div className="sum-hero-ring-2" style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '999px', border: '1px dashed rgba(212,137,26,0.18)' }} />
            <div style={{ position: 'absolute', bottom: '4%', width: '160px', height: '28px', borderRadius: '999px', background: 'radial-gradient(closest-side,rgba(26,21,14,0.18),transparent)' }} />

            {/* Image composition container — 16:9 aspect, cqw/cqh burst offsets relative to this */}
            <div className="sum-hero-comp" style={{ position: 'relative', width: '63.75vw', maxWidth: '1200px', aspectRatio: '16/9', containerType: 'size' } as React.CSSProperties}>

              {/* Honey jar — drops in */}
              <div style={{ position: 'absolute', left: '33.24%', top: '18.02%', width: '36.73%', height: '70.99%', zIndex: 2, animation: 'sum-jar-drop 0.9s cubic-bezier(0.22,1,0.36,1) both' }}>
                <Image
                  src="/images/home/hero-jar.png"
                  fill
                  alt="SUMOSTA honey jar"
                  priority
                  sizes="(max-width:1024px) 37vw, 441px"
                  style={{ objectFit: 'contain', filter: 'drop-shadow(0 18px 24px rgba(44,36,23,0.28))' }}
                />
              </div>

              {/* Burst elements — fly in from displaced positions */}
              {HERO_BURSTS.map((b, i) => (
                <div
                  key={i}
                  className="sum-burst-item"
                  style={{
                    left: b.l, top: b.t, width: b.w, height: b.h,
                    '--dx': String(b.dx),
                    '--dy': String(b.dy),
                    ...(b.rot ? { '--rot': b.rot } : {}),
                    animationDelay: b.delay,
                    ...(b.dropShadow ? { filter: 'drop-shadow(0 10px 14px rgba(44,36,23,0.18))' } : {}),
                  } as React.CSSProperties}
                >
                  <Image
                    src={b.src}
                    fill
                    alt=""
                    sizes="(max-width:1024px) 20vw, 240px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section style={{ background: '#FDF6EC', padding: '28px 24px', borderTop: '1px solid #F0E6D3', borderBottom: '1px solid #F0E6D3' }}>
        <div className="sum-trust-grid" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px', textAlign: 'center' }}>
          {['Raw & Unfiltered', 'Lab‑Tested Purity', 'Traceable to Apiary', 'Free Shipping ₹500+'].map((t) => (
            <span key={t} style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', color: '#5C4A32', textTransform: 'uppercase' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div style={{ background: '#FFF0D6', padding: '14px 0', overflow: 'hidden' }}>
        <div className="animate-sum-marquee" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[0, 1].map((i) => (
            <span key={i} style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, color: '#F5A623', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0 24px' }}>
              RAW HONEY • WILD SOURCED • UNPROCESSED • SINGLE ORIGIN • WESTERN GHATS • SUNDARBANS • HIMALAYAN • PURE NATURE •
            </span>
          ))}
        </div>
      </div>

      {/* ===== PRODUCT SHOWCASE ===== */}
      <section style={{ padding: '96px 0', background: '#FFFDF8', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
          <div data-reveal>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem,5vw,4rem)', margin: 0, color: '#2C2417', letterSpacing: '-0.01em' }}>The Collection</h2>
            <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: '19px', color: '#8B7355', margin: '6px 0 0' }}>Taste the terroir</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => scrollCarousel('prev')} aria-label="Scroll left" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #F0E6D3', background: '#FFFDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A32', fontSize: '16px', transition: 'border-color 0.2s, background 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F5A623'; (e.currentTarget as HTMLButtonElement).style.background = '#FFF0D6'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F0E6D3'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFDF8'; }}>←</button>
            <button onClick={() => scrollCarousel('next')} aria-label="Scroll right" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #F0E6D3', background: '#FFFDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A32', fontSize: '16px', transition: 'border-color 0.2s, background 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F5A623'; (e.currentTarget as HTMLButtonElement).style.background = '#FFF0D6'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#F0E6D3'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFDF8'; }}>→</button>
            <Link href="/shop" style={{ fontWeight: 600, fontSize: '14px', color: '#5C4A32', textDecoration: 'none' }}>View all →</Link>
          </div>
        </div>
        <div ref={carouselRef} className="sum-noscroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingLeft: 'max(24px, calc((100vw - 1400px) / 2 + 24px))', paddingBottom: '12px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', scrollPaddingLeft: 'max(24px, calc((100vw - 1400px) / 2 + 24px))' }}>
          {PRODUCTS.map((p) => (
            <div key={p.id} style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 14px,#FFF9F0 14px,#FFF9F0 28px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '14px' }}>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase', padding: '0 16px' }}>product photo<br />{p.name}</span>
                </div>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4B39A', margin: '0 0 4px' }}>{p.category?.name ?? ''}</p>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#2C2417', margin: '0 0 6px' }}>{p.name}</h3>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#D4891A', margin: 0 }}>₹{p.price}</p>
              </Link>
            </div>
          ))}
          <div style={{ minWidth: '48px', flexShrink: 0 }} aria-hidden />
        </div>
      </section>

      {/* ===== GOLDEN DIVIDER ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '8px 0 32px' }}>
        <span style={{ width: '64px', height: '1px', background: '#F0E6D3' }} />
        <span style={{ width: '6px', height: '6px', background: '#F5A623', transform: 'rotate(45deg)' }} />
        <span style={{ width: '64px', height: '1px', background: '#F0E6D3' }} />
      </div>

      {/* ===== STORY SECTION ===== */}
      <section style={{ background: '#FDF6EC' }}>
        <div className="sum-story-grid" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
          {/* Image */}
          <div style={{ position: 'relative', minHeight: '320px', background: '#D4891A', overflow: 'hidden' }}>
            <Image
              src="/images/home/story-beekeeper.jpg"
              fill
              alt="Beekeeper harvesting wild honeycomb"
              sizes="(min-width:1024px) 50vw, 100vw"
              style={{ objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(26,21,14,0.45),rgba(26,21,14,0) 55%)' }} />
          </div>
          {/* Text */}
          <div style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 16px' }}>Our Story</p>
            <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.2rem,4.2vw,3.4rem)', color: '#2C2417', margin: '0 0 22px', letterSpacing: '-0.01em' }}>From Wild Hives to Your Table</h2>
            <div style={{ fontSize: '16px', lineHeight: 1.75, color: '#5C4A32' }}>
              <p style={{ margin: '0 0 16px' }}>SUMOSTA sources single-origin honey from wild bee colonies across the Western Ghats, Sundarbans, and Himalayan foothills. Each batch is raw, unprocessed, and traceable to its apiary.</p>
              <p style={{ margin: '0 0 28px' }}>We work directly with traditional beekeepers who have managed these hives for generations. No middlemen, no compromises — just pure honey the way nature intended.</p>
            </div>
            <Link href="/about" style={{ fontWeight: 600, color: '#2C2417', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>Learn More <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* ===== BEEKEEPERS DARK SECTION ===== */}
      <section style={{ background: '#2C2417', padding: 0 }}>
        <div className="sum-founders-grid" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr' }}>
          {/* Text */}
          <div style={{ padding: '80px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: 2 }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F5A623', fontWeight: 700, margin: '0 0 20px' }}>The Beekeepers</p>
            <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', color: '#FFF0D6', lineHeight: 1.4, margin: '0 0 28px' }}>
              &ldquo;We don&apos;t manage bees. We visit them, and take only what the forest can spare.&rdquo;
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#C4B39A', margin: '0 0 8px', maxWidth: '440px' }}>
              Our network of 40+ traditional beekeeping families climbs cliff faces in the Western Ghats and wades into Sundarbans mangroves to harvest from colonies that have never known a commercial hive box.
            </p>
            <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: '#8B7355', margin: '24px 0 0' }}>— Third-generation apiary partners, Western Ghats</p>
          </div>
          {/* Image */}
          <div style={{ position: 'relative', minHeight: '340px', overflow: 'hidden', order: 1 }}>
            <Image
              src="/images/home/beekeepers-hive.jpg"
              fill
              alt="Wild honeybee hive hanging from a tree branch"
              sizes="(min-width:1024px) 50vw, 100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ===== PROCESS — DESKTOP (scroll-driven horizontal with background images) ===== */}
      <section ref={processSectionRef} className="sum-process-desktop" style={{ position: 'relative', height: '400vh', background: '#2C2417', display: 'none' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#2C2417', display: 'flex', flexDirection: 'column' }}>
          {/* Noise overlay */}
          <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.4, pointerEvents: 'none', zIndex: 1, backgroundImage: noiseSvg }} />

          {/* Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(139,115,85,0.3)', zIndex: 2 }}>
            <div ref={processBarRef} style={{ height: '100%', background: '#F5A623', transformOrigin: 'left', transform: 'scaleX(0)' }} />
          </div>

          {/* Background images — crossfade driven by scroll */}
          <div ref={processImagesRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0, transition: 'opacity .5s ease' }}>
                <Image
                  src={step.image}
                  fill
                  alt=""
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(44,36,23,0.92) 0%,rgba(44,36,23,0.75) 45%,rgba(44,36,23,0.35) 100%),linear-gradient(180deg,rgba(44,36,23,0.6) 0px,rgba(44,36,23,0) 260px)' }} />
              </div>
            ))}
          </div>

          {/* Section heading */}
          <div style={{ position: 'relative', zIndex: 2, padding: '140px 64px 0' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#F5A623', margin: '0 0 10px', fontWeight: 700 }}>The Process</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '46px', color: '#FFFDF8', margin: 0 }}>How we do it</h2>
          </div>

          {/* Horizontally scrolling step panels */}
          <div ref={processTrackRef} style={{ display: 'flex', position: 'absolute', top: '180px', left: 0, zIndex: 2, willChange: 'transform', transition: 'transform 0.05s linear' }}>
            {PROCESS_STEPS.map((step) => (
              <div key={step.num} style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 96px', flexShrink: 0, boxSizing: 'border-box' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
                  <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '38px', color: '#FFFDF8', margin: '0 0 16px' }}>{step.title}</h3>
                  <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#C4B39A', margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS — MOBILE (vertical) ===== */}
      <section className="sum-process-mobile" style={{ padding: '80px 24px', background: '#2C2417' }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#F5A623', margin: '0 0 10px', fontWeight: 700 }}>The Process</p>
        <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '34px', color: '#FFFDF8', margin: '0 0 32px' }}>How we do it</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {PROCESS_STEPS.map((step) => (
            <div key={step.num} style={{ borderLeft: '2px solid #7A4D0B', paddingLeft: '20px' }}>
              <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '13px', color: '#F5A623' }}>{step.num}</span>
              <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '22px', color: '#FFFDF8', margin: '6px 0 8px' }}>{step.title}</h3>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#C4B39A', margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HIVE FACTS ===== */}
      <section style={{ padding: '96px 24px', background: '#FFFDF8' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 16px', textAlign: 'center' }}>Did You Know</p>
          <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#2C2417', margin: '0 0 48px', letterSpacing: '-0.01em', textAlign: 'center' }}>The Hive at Work</h2>

          <div className="sum-hive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'start' }}>
            {/* Fact detail card */}
            <div className="sum-hive-card" style={{ background: '#FDF6EC', borderRadius: '16px', padding: '32px', boxSizing: 'border-box', position: 'sticky', top: '130px', alignSelf: 'start', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '12px', color: '#D4891A', letterSpacing: '0.1em' }}>{activeFact.num}</span>
              <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem,2vw,1.45rem)', color: '#2C2417', margin: '10px 0 14px', lineHeight: 1.25 }}>{activeFact.text}</h3>
              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#5C4A32', margin: '0 0 18px' }}>{activeFact.detail}</p>
              <div style={{ borderTop: '1px solid #F0E6D3', paddingTop: '14px' }}>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7C9A6E', fontWeight: 700, margin: '0 0 6px' }}>The Evidence</p>
                <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: '#8B7355', margin: 0 }}>{activeFact.proof}</p>
              </div>
            </div>

            {/* Hexagon grid — desktop only */}
            <div className="sum-hex-canvas">
              <div style={{ position: 'relative', width: '420px', height: '440px', margin: '0 auto' }}>
                {FACTS.map((f, i) => {
                  const pos = HEX_POSITIONS[i] ?? [0, 0];
                  const isOpen = openFact === i;
                  return (
                    <div key={f.num} style={{ position: 'absolute', left: `calc(50% + ${pos[0] - 70}px)`, top: `calc(50% + ${pos[1] - 81}px)`, width: '140px', height: '162px', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', background: '#FFFDF8', padding: '3px', boxSizing: 'border-box', transition: 'transform .35s ease', transform: isOpen ? 'scale(1.08)' : 'scale(1)', zIndex: isOpen ? 2 : 1 }}>
                      <button
                        onClick={() => setOpenFact(i)}
                        style={{ width: '100%', height: '100%', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', background: isOpen ? '#F5A623' : '#FFF0D6', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .35s ease' }}
                      >
                        <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '20px', color: isOpen ? '#1A150E' : '#D4891A', transition: 'color .25s ease' }}>{f.num}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fact selector — mobile only */}
            <div className="sum-hex-mobile" style={{ display: 'none' }}>
              <p style={{ fontSize: '12px', color: '#C4B39A', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px', fontWeight: 600 }}>Tap a fact to explore</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {FACTS.map((f, i) => {
                  const isOpen = openFact === i;
                  return (
                    <button
                      key={f.num}
                      onClick={() => setOpenFact(i)}
                      style={{
                        width: '54px', height: '54px',
                        borderRadius: '50%',
                        background: isOpen ? '#F5A623' : '#FFF0D6',
                        border: `2px solid ${isOpen ? '#D4891A' : '#F0E6D3'}`,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-bricolage), sans-serif',
                        fontWeight: 700, fontSize: '14px',
                        color: isOpen ? '#1A150E' : '#D4891A',
                        transition: 'all .25s ease',
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {f.num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section style={{ padding: '96px 24px', background: '#FFF9F0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: honeycombSvg, backgroundSize: '56px 100px', opacity: 0.04 }} />
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: '#2C2417', margin: '0 0 16px' }}>Join the Colony</h2>
          <p style={{ fontSize: '16px', color: '#8B7355', margin: '0 0 32px' }}>Get first access to new harvests, exclusive recipes, and 10% off your first order.</p>
          {newsletterSuccess ? (
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#7C9A6E', margin: 0 }}>Welcome to the colony! Check your inbox.</p>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ flex: 1, minWidth: '220px', padding: '14px 18px', borderRadius: '8px', border: '1px solid #F0E6D3', background: '#FFFDF8', fontSize: '14px', color: '#2C2417', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '14px', padding: '14px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-bricolage), sans-serif' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        /* ===== DESKTOP ===== */
        @media (min-width: 1024px) {
          .sum-hero-grid       { grid-template-columns: 1.1fr 0.9fr !important; gap: 48px !important; padding: 64px 24px !important; }
          .sum-hero-visual     { height: 500px !important; }
          .sum-hero-comp       { width: 63.75vw !important; }
          .sum-story-grid      { grid-template-columns: 1fr 1fr !important; min-height: 560px; }
          .sum-trust-grid      { grid-template-columns: repeat(4,1fr) !important; }
          .sum-process-desktop { display: block !important; }
          .sum-process-mobile  { display: none !important; }
          .sum-founders-grid   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 900px) {
          .sum-hive-grid  { grid-template-columns: 0.85fr 1.15fr !important; }
          .sum-hex-canvas { display: block !important; }
          .sum-hex-mobile { display: none !important; }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 1023px) {
          .sum-hero-visual { height: auto !important; min-height: 240px; padding: 12px 0 28px; }
          .sum-hero-comp   { width: min(88vw, 500px) !important; }
          .sum-hero-ring-1 { width: 200px !important; height: 200px !important; }
          .sum-hero-ring-2 { width: 160px !important; height: 160px !important; }
          .sum-hero-body   { font-size: 15px !important; }
        }
        @media (max-width: 899px) {
          .sum-hive-card  { position: static !important; }
          .sum-hex-canvas { display: none !important; }
          .sum-hex-mobile { display: block !important; }
        }
        @media (max-width: 639px) {
          .sum-hero-comp { width: 92vw !important; }
        }

        .sum-noscroll::-webkit-scrollbar { display: none; }
        @media (hover: none), (pointer: coarse) {
          .sum-cursor-dot { display: none !important; }
        }
      `}</style>
    </>
  );
}
