'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, ShieldCheck, Thermometer, BadgeCheck, Globe } from 'lucide-react';
import { STATIC_PRODUCTS, BRAND_CONTENT } from '@/lib/content';

const PRODUCTS = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon);

const QUALITY_CLAIMS: { icon: React.ReactNode; text: string }[] = [
  { icon: <Leaf size={14} strokeWidth={2.2} />, text: '100% Raw & Un-processed' },
  { icon: <ShieldCheck size={14} strokeWidth={2.2} />, text: '100% Pure, No Additives' },
  { icon: <Thermometer size={14} strokeWidth={2.2} />, text: 'Un-heated, Minimally Filtered' },
  { icon: <BadgeCheck size={14} strokeWidth={2.2} />, text: 'NABL Lab Tested & NPOP APEDA Organic Certified' },
  { icon: <Globe size={14} strokeWidth={2.2} />, text: 'Ethically Sourced from Pristine Indian Reserves' },
];

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'From Hive to Home',
    headline: 'Nothing added,\nnothing taken.',
    subtext: 'Raw, unprocessed wild forest honey from India\'s most pristine ecosystems. NABL tested, NPOP APEDA certified.',
    cta: { label: 'Shop Collection', href: '/shop' },
    bg: 'radial-gradient(120% 100% at 15% 15%,#FFFDF8 0%,#FFF9F0 45%,#FFF0D6 100%)',
    accent: '#F5A623',
  },
  {
    id: 2,
    eyebrow: 'The 5 Elements Collection',
    headline: 'Taste the\nWhole Forest.',
    subtext: 'Can\'t decide on one? Experience all 5 of our rare wild forest honeys in one premium collection — five terroirs, one extraordinary set.',
    cta: { label: 'Shop the 5 Elements Collection', href: '/product/5-elements-collection' },
    bg: 'radial-gradient(120% 100% at 85% 15%,#FFFDF8 0%,#FFF9F0 45%,#FFF0D6 100%)',
    accent: '#D4891A',
  },
  {
    id: 3,
    eyebrow: 'Curated Wellness Bundles',
    headline: 'Monsoon-Proof\nyour immunity.',
    subtext: 'Whether you need advanced cellular defense or deep daily mineral recovery — find your targeted wellness pack.',
    cta: { label: 'Explore Curated Bundles', href: '/shop/gift-boxes' },
    bg: 'radial-gradient(120% 100% at 50% 0%,#FFFDF8 0%,#FFF9F0 45%,#FFF0D6 100%)',
    accent: '#A66A10',
  },
];

const HEX_LOADER = [
  { left: 'calc(50% - 20px)', top: 'calc(50% - 23px)', delay: '0s' },
  { left: 'calc(50% + 0px)',  top: 'calc(50% - 58px)', delay: '.08s' },
  { left: 'calc(50% + 20px)', top: 'calc(50% - 23px)', delay: '.16s' },
  { left: 'calc(50% + 0px)',  top: 'calc(50% + 12px)', delay: '.24s' },
  { left: 'calc(50% - 40px)', top: 'calc(50% + 12px)', delay: '.32s' },
  { left: 'calc(50% - 60px)', top: 'calc(50% - 23px)', delay: '.4s' },
  { left: 'calc(50% - 40px)', top: 'calc(50% - 58px)', delay: '.48s' },
];

const honeycombSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E")`;
const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`;

export default function HomeContent() {
  const [loaded, setLoaded] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const cursorRef    = useRef<HTMLDivElement>(null);
  const carouselRef  = useRef<HTMLDivElement>(null);
  const slideTimer   = useRef<ReturnType<typeof setInterval>>();

  const scrollCarousel = useCallback((dir: 'prev' | 'next') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'next' ? 300 : -300, behavior: 'smooth' });
  }, []);

  const goToSlide = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    setSlideDir(dir);
    setSlideIndex(idx);
  }, []);

  // Page loader
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance hero slides every 5s
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
      setSlideDir('next');
    }, 5000);
    return () => clearInterval(slideTimer.current);
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

  const slide = HERO_SLIDES[slideIndex];

  return (
    <>
      {/* ===== PAGE LOADER ===== */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#FFFDF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: loaded ? 0 : 1, pointerEvents: loaded ? 'none' : 'auto', transition: 'opacity .6s ease' }}>
        <div style={{ position: 'relative', width: '140px', height: '130px' }}>
          {HEX_LOADER.map((h, i) => (
            <span key={i} style={{ position: 'absolute', left: h.left, top: h.top, width: '40px', height: '46px', clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', background: '#F5A623', animation: `sum-pulse-gold 1.2s ease-in-out infinite`, animationDelay: h.delay }} />
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, color: '#2C2417', fontSize: '14px', letterSpacing: '0.04em', margin: 0 }}>
          Indulgence that cares
        </p>
      </div>

      {/* ===== CUSTOM CURSOR ===== */}
      <div ref={cursorRef} style={{ position: 'fixed', top: 0, left: 0, width: '10px', height: '10px', background: '#F5A623', borderRadius: '999px', pointerEvents: 'none', zIndex: 9999, transform: 'translate(-100px,-100px)', transition: 'width .25s ease, height .25s ease' }} />

      {/* ===== HERO — 3-SLIDE CAROUSEL ===== */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background: slide.bg,
          transition: 'background 0.8s ease',
          paddingTop: '88px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Texture overlays */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: honeycombSvg, backgroundSize: '56px 100px', opacity: 0.04, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.5, pointerEvents: 'none', backgroundImage: noiseSvg }} />

        {/* Slide content */}
        <div
          className="sum-hero-grid"
          style={{
            maxWidth: '1400px', margin: '0 auto', padding: '48px 24px 80px',
            width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: '32px',
            alignItems: 'center', position: 'relative', zIndex: 1, boxSizing: 'border-box',
            flex: 1,
          }}
        >
          {/* Text side */}
          <div className="sum-hero-text" key={slide.id} style={{ animation: 'sum-slide-in 0.6s cubic-bezier(0.25,0.1,0.25,1) both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #FFCC66', borderRadius: '999px', padding: '6px 16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A66A10', fontWeight: 700 }}>{slide.eyebrow}</span>
            </div>
            <h1 style={{ margin: '0 0 20px', lineHeight: 1.05 }}>
              {slide.headline.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block', fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.9rem,7.8vw,6.2rem)', color: '#2C2417', letterSpacing: '-0.01em' }}>{line}</span>
              ))}
            </h1>
            <p className="sum-hero-body" style={{ fontSize: '16px', lineHeight: 1.7, color: '#8B7355', maxWidth: '520px', margin: '0 0 32px' }}>
              {slide.subtext}
            </p>
            <div className="sum-hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                href={slide.cta.href}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '15px', padding: '15px 28px', borderRadius: '8px', boxShadow: '0 12px 34px rgba(245,166,35,0.35)', textDecoration: 'none', fontFamily: 'var(--font-bricolage), sans-serif' }}
              >
                {slide.cta.label} <span>→</span>
              </Link>
              <Link href="/about" style={{ color: '#5C4A32', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                Our Story <span>→</span>
              </Link>
            </div>
          </div>

          {/* Visual side (placeholder / jar image area) */}
          <div className="sum-hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
            <div style={{ position: 'absolute', width: '78%', height: '66%', borderRadius: '999px', background: '#FFE0A8', opacity: 0.5, filter: 'blur(60px)' }} />
            {/* Jar placeholder — swap with real image when available */}
            <div style={{ position: 'relative', width: '260px', height: '320px', background: 'linear-gradient(135deg,#FFF9F0,#FFE0A8)', borderRadius: '16px', border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 48px rgba(44,36,23,0.12)', animation: 'sum-jar-float 4s ease-in-out infinite' }}>
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍯</div>
                <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '14px', color: '#2C2417', margin: '0 0 4px' }}>SUMOSTA</p>
                <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: '12px', color: '#8B7355', margin: 0 }}>Wild Forest Honey</p>
                <p style={{ fontSize: '10px', color: '#C4B39A', margin: '8px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Golden Lid · Glass Jar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators + arrows */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 2 }}>
          <button
            onClick={() => { clearInterval(slideTimer.current); goToSlide((slideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length, 'prev'); }}
            aria-label="Previous slide"
            style={{ background: 'rgba(255,253,248,0.7)', border: '1px solid #F0E6D3', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A32' }}
          >‹</button>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(slideTimer.current); goToSlide(i, i > slideIndex ? 'next' : 'prev'); }}
              aria-label={`Go to slide ${i + 1}`}
              style={{ width: i === slideIndex ? '28px' : '8px', height: '8px', borderRadius: '999px', background: i === slideIndex ? '#F5A623' : 'rgba(245,166,35,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }}
            />
          ))}
          <button
            onClick={() => { clearInterval(slideTimer.current); goToSlide((slideIndex + 1) % HERO_SLIDES.length, 'next'); }}
            aria-label="Next slide"
            style={{ background: 'rgba(255,253,248,0.7)', border: '1px solid #F0E6D3', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A32' }}
          >›</button>
        </div>
      </section>

      {/* ===== BRAND STATEMENT (below hero) ===== */}
      <section style={{ background: '#FFF9F0', padding: '36px 24px', borderTop: '1px solid #F0E6D3', borderBottom: '1px solid #F0E6D3' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, fontSize: 'clamp(1rem,1.8vw,1.25rem)', color: '#5C4A32', lineHeight: 1.8, margin: 0 }}>
            At SUMOSTA, we believe sweetness should do more than delight. That&apos;s why we&apos;re introducing raw, unprocessed honeys from India&apos;s pristine forests — not as something you reach for only when you&apos;re unwell, but as a <strong style={{ color: '#2C2417', fontWeight: 700 }}>delicious daily indulgence that cares.</strong>
          </p>
        </div>
      </section>

      {/* ===== QUALITY CLAIMS MARQUEE ===== */}
      <div style={{ background: '#D4891A', padding: '13px 0', overflow: 'hidden', borderBottom: '1px solid #A66A10' }}>
        <div className="animate-sum-marquee" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[0, 1].map((r) =>
            QUALITY_CLAIMS.map((claim, i) => (
              <span key={`${r}-${i}`} style={{ fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif', fontWeight: 600, color: '#FFFDF8', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 24px', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                {claim.icon}
                {claim.text}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ===== PRODUCT SHOWCASE ===== */}
      <section style={{ padding: '60px 0', background: '#FFFDF8', overflow: 'hidden' }}>
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
          {PRODUCTS.map((p) => {
            // Show 250g (smallest) variant price if available — more attractive for cost-conscious buyers
            const smallVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
            const displayPrice = smallVariant ? p.price + (smallVariant as any).priceAdjust : p.price;
            const displayMrp = smallVariant && (smallVariant as any).compareAtPriceAdjust != null
              ? (p.compareAtPrice ?? 0) + (smallVariant as any).compareAtPriceAdjust
              : (p.compareAtPrice && p.variants && p.variants.length > 0 ? null : p.compareAtPrice);
            const displaySave = displayMrp && displayMrp > displayPrice
              ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
              : null;
            const sizeLabel = smallVariant ? (smallVariant as any).name : null;
            return (
            <div key={p.id} style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 14px,#FFF9F0 14px,#FFF9F0 28px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '14px' }}>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase', padding: '0 16px' }}>product photo<br />{p.name}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#2C2417', margin: '0 0 6px' }}>{p.name}</h3>
                {sizeLabel && <p style={{ fontSize: '11px', color: '#8B7355', margin: '0 0 6px' }}>{sizeLabel}</p>}
                {/* MRP strikethrough + Selling price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {displayMrp && displayMrp > displayPrice && (
                    <span style={{ fontSize: '13px', color: '#C4B39A', textDecoration: 'line-through' }}>₹{displayMrp}</span>
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#D4891A' }}>
                    ₹{displayPrice}
                    {p.variants && p.variants.length > 1 && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#8B7355', marginLeft: '3px' }}>onwards</span>
                    )}
                  </span>
                  {displaySave && (
                    <span style={{ fontSize: '10px', background: '#FFF0D6', color: '#A66A10', borderRadius: '4px', padding: '2px 6px', fontWeight: 700 }}>
                      SAVE {displaySave}%
                    </span>
                  )}
                </div>
              </Link>
            </div>
            );
          })}
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
            <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2.2rem,4.2vw,3.4rem)', color: '#2C2417', margin: '0 0 22px', letterSpacing: '-0.01em' }}>Born from the Hustle.<br />Perfected by Nature.</h2>
            <div style={{ fontSize: '16px', lineHeight: 1.75, color: '#5C4A32' }}>
              <p style={{ margin: '0 0 16px' }}>As founders navigating modern life&apos;s high-stress rhythms, we craved something sweet that also looked out for us. We bypassed commercial supply chains and went deep into India&apos;s most remote forests — partnering with indigenous tribes to harvest honey exactly as nature intended.</p>
              <p style={{ margin: '0 0 28px' }}>Unprocessed, unfiltered, and alive with raw nutrients. This is SUMOSTA.</p>
            </div>
            <Link href="/about" style={{ fontWeight: 600, color: '#2C2417', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>Read Our Full Story <span>→</span></Link>
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
              Our network of 40+ traditional beekeeping families ventures deep into India&apos;s most remote and pristine forest reserves to harvest from colonies that have never known a commercial hive box.
            </p>
            <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: '#8B7355', margin: '24px 0 0' }}>— Third-generation apiary partners</p>
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

      {/* ===== NEWSLETTER ===== */}
      <section style={{ padding: '72px 24px', background: '#FFF9F0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
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

      {/* ===== VISION / MISSION / PHILOSOPHY ===== */}
      <section style={{ padding: '72px 24px', background: '#1A150E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#F5A623', fontWeight: 700, margin: '0 0 16px' }}>The SUMOSTA Way</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3.2rem)', color: '#FFFDF8', margin: '0 0 16px' }}>
              Inspired by the Sumo.<br />Guided by Timeless Values.
            </h2>
            <p style={{ fontSize: '16px', color: '#C4B39A', maxWidth: '640px', margin: '0 auto', lineHeight: 1.75 }}>
              Most people see a Sumo. We see a mindset — built on balance, discipline, patience, and resilience. That mindset inspires every jar we make.
            </p>
          </div>

          {/* Vision + Mission cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '48px' }} className="sum-vm-grid">
            {[
              { label: 'Our Vision', text: BRAND_CONTENT.visionMission.vision, icon: '🌟' },
              { label: 'Our Mission', text: BRAND_CONTENT.visionMission.mission, icon: '🎯' },
              { label: 'Our Purpose', text: BRAND_CONTENT.visionMission.objective, icon: '💫' },
            ].map((item) => (
              <div key={item.label} style={{ background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(139,115,85,0.25)', borderRadius: '16px', padding: '28px 32px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F5A623', fontWeight: 700, margin: '0 0 12px' }}>{item.icon}  {item.label}</p>
                <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 400, fontSize: 'clamp(0.95rem,1.6vw,1.1rem)', color: '#FFF0D6', lineHeight: 1.7, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Beliefs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }} className="sum-beliefs-grid">
            {BRAND_CONTENT.philosophy.beliefs.map((b) => (
              <div key={b.title} style={{ background: 'rgba(255,253,248,0.03)', border: '1px solid rgba(139,115,85,0.2)', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#FFFDF8', margin: '0 0 6px' }}>{b.title}</p>
                  <p style={{ fontSize: '13px', color: '#C4B39A', margin: 0, lineHeight: 1.6 }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* ===== DESKTOP ===== */
        @media (min-width: 1024px) {
          .sum-hero-grid       { grid-template-columns: 1.1fr 0.9fr !important; gap: 48px !important; padding: 64px 24px 80px !important; }
          .sum-hero-visual     { height: 520px !important; }
          .sum-story-grid      { grid-template-columns: 1fr 1fr !important; min-height: 560px; }
          .sum-founders-grid   { grid-template-columns: 1fr 1fr !important; }
          .sum-vm-grid         { grid-template-columns: repeat(3,1fr) !important; }
          .sum-beliefs-grid    { grid-template-columns: repeat(3,1fr) !important; }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 1023px) {
          .sum-hero-visual  { display: none !important; }
          .sum-hero-grid    { padding: 32px 28px 80px !important; }
          .sum-hero-text    { align-items: center; display: flex; flex-direction: column; text-align: center; }
          .sum-hero-body    { font-size: 15px !important; max-width: 340px !important; margin-left: auto !important; margin-right: auto !important; }
          .sum-hero-ctas    { justify-content: center !important; }
        }
        @media (max-width: 640px) {
          .sum-beliefs-grid { grid-template-columns: 1fr !important; }
        }

        .sum-noscroll::-webkit-scrollbar { display: none; }

        @keyframes sum-slide-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sum-jar-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}
