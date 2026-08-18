'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, ShieldCheck, Thermometer, BadgeCheck, Globe } from 'lucide-react';
import { STATIC_PRODUCTS, BRAND_CONTENT } from '@/lib/content';
import { useProductImages, resolveProductImage } from '@/hooks/useProductImages';
import { useUIStore, type HeroTone } from '@/stores/ui-store';

const PRODUCTS = STATIC_PRODUCTS.filter(
  (p) => p.isActive && !p.comingSoon && p.slug !== '5-elements-collection',
);

const QUALITY_CLAIMS: { icon: React.ReactNode; text: string }[] = [
  { icon: <Leaf size={14} strokeWidth={2.2} />, text: '100% Raw & Un-processed' },
  { icon: <ShieldCheck size={14} strokeWidth={2.2} />, text: '100% Pure, No Additives' },
  { icon: <Thermometer size={14} strokeWidth={2.2} />, text: 'Un-heated, Minimally Filtered' },
  { icon: <BadgeCheck size={14} strokeWidth={2.2} />, text: 'NABL Lab Tested & NPOP APEDA Organic Certified' },
  { icon: <Globe size={14} strokeWidth={2.2} />, text: 'Ethically Sourced from Pristine Indian Reserves' },
];

// Copy is baked INTO the hero images (4800x2000, aspect 2.4:1). Rendered with
// object-fit: cover — small ~5% top/bottom crop on typical desktop viewports,
// but the composition is centered so text + jars survive. Each slide has a
// visible pill CTA overlaid on the side that matches where the copy sits.
const HERO_SLIDES: {
  id: number;
  image: string;
  imageMobile?: string;
  imageAlt: string;
  bg: string;
  objectPosition?: string;
  // Tone of the slide's background — drives Navbar text/icon color while the
  // hero is in view (light background → dark navbar text).
  tone: HeroTone;
  cta: { href: string; label: string; align: 'left' | 'right'; vAlign?: 'middle' | 'bottom'; bottom?: string };
}[] = [
  {
    id: 1,
    image: '/images/hero/hero1.webp',
    imageMobile: '/images/hero/hero1-mobile.png',
    imageAlt: 'SUMOSTA Organic Wild Forest Honey — Nothing added, nothing taken',
    bg: '#F3C577',
    tone: 'light',
    cta: { href: '/shop', label: 'Shop the Collection', align: 'left' },
  },
  {
    id: 2,
    image: '/images/hero/hero2.webp',
    imageMobile: '/images/hero/hero2-mobile.png',
    imageAlt: 'The 5 Elements Collection — five rare wild forest honeys',
    bg: '#241813',
    tone: 'dark',
    cta: { href: '/product/5-elements-collection', label: 'Shop the Collection', align: 'left' },
  },
  {
    id: 3,
    image: '/images/hero/hero3.webp',
    imageMobile: '/images/hero/hero3-mobile.png',
    // Preserve the top of this composition when cover cropping is required.
    objectPosition: 'center top',
    imageAlt: "Bloodseed Forest Honey — Nature's Blood Tonic",
    bg: '#A65432',
    tone: 'dark',
    // Bottom-right corner, tucked just below the baked trust badges
    cta: { href: '/product/bloodseed-forest-honey', label: 'Discover Bloodseed', align: 'right', bottom: '24px' },
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

export default function HomeContent() {
  const [loaded, setLoaded] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const dbImages = useProductImages();
  const setHeroTone = useUIStore((s) => s.setHeroTone);

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

  // Sync Navbar tone with the current hero slide, then reset when leaving the
  // page so other routes get the default dark palette back.
  useEffect(() => {
    setHeroTone(HERO_SLIDES[slideIndex].tone);
  }, [slideIndex, setHeroTone]);
  useEffect(() => {
    return () => setHeroTone('dark');
  }, [setHeroTone]);

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

      {/* ===== HERO — 3-SLIDE CAROUSEL =====
          Copy is baked INTO the images (4800x2000, aspect 2.4:1). Section is
          fixed 72vh, pulled up behind the fixed header via negative marginTop
          so the image starts at the very top of the viewport. Header (fixed
          on top) overlays the top ~100px of the image. */}
      <section
        className="sum-hero-section"
        style={{
          position: 'relative',
          width: '100%',
          height: '80vh',
          overflow: 'hidden',
          background: slide.bg,
          transition: 'background 0.8s ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Full-bleed hero images — stacked, cross-fade via opacity */}
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== slideIndex}
              style={{
                position: 'absolute', inset: 0, zIndex: 0,
                opacity: i === slideIndex ? 1 : 0,
                transition: 'opacity 0.9s ease',
                pointerEvents: 'none',
              }}
            >
              {s.imageMobile && (
                <div className="sum-hero-img sum-hero-img--mobile" style={{ position: 'absolute', inset: 0 }}>
                  <Image
                    src={s.imageMobile}
                    alt={s.imageAlt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              )}
              <div
                className={s.imageMobile ? 'sum-hero-img sum-hero-img--desktop' : 'sum-hero-img'}
                style={{ position: 'absolute', inset: 0 }}
              >
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  priority={i === 0 && !s.imageMobile}
                  sizes="100vw"
                  style={{ objectFit: 'cover', objectPosition: s.objectPosition ?? 'center' }}
                />
              </div>
            </div>
          ))}

          {/* Visible pill CTA — aligned per slide */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            <div style={{ maxWidth: '1400px', height: '100%', margin: '0 auto', padding: '0 clamp(20px, 4vw, 60px)', position: 'relative' }}>
              <Link
                key={`cta-${slide.id}`}
                href={slide.cta.href}
                aria-label={slide.cta.label}
                className={`sum-hero-cta${slide.imageMobile ? ' sum-hero-cta--mobile-center' : ''}`}
                style={{
                  position: 'absolute',
                  ...(slide.cta.vAlign === 'middle'
                    ? { top: '50%', transform: 'translateY(-50%)' }
                    : { bottom: slide.cta.bottom ?? 'clamp(40px, 8vh, 90px)' }),
                  ...(slide.cta.align === 'right'
                    ? { right: 'clamp(16px, 2vw, 32px)' }
                    : { left: 'clamp(20px, 4vw, 60px)' }),
                  pointerEvents: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#F5A623',
                  color: '#1A150E',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '14px 26px',
                  borderRadius: '999px',
                  boxShadow: '0 12px 34px rgba(245,166,35,0.35)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  transition: 'background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                {slide.cta.label} <span style={{ fontSize: '15px' }}>→</span>
              </Link>
            </div>
          </div>

          {/* Slide indicators + arrows */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 3 }}>
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
        </div>
      </section>

      {/* ===== BRAND STATEMENT (below hero) ===== */}
      <section style={{ background: '#FFF9F0', padding: 'clamp(28px,5vw,36px) 20px', borderTop: '1px solid #F0E6D3', borderBottom: '1px solid #F0E6D3' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, fontSize: 'clamp(0.9375rem,1.8vw,1.25rem)', color: '#5C4A32', lineHeight: 1.65, margin: 0 }}>
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
      <section style={{ padding: 'clamp(44px,7vw,60px) 0', background: '#FFFDF8', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px,4.5vw,40px)', gap: '16px', flexWrap: 'wrap' }}>
          <div data-reveal>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,5vw,4rem)', margin: 0, color: '#2C2417', letterSpacing: '-0.01em', lineHeight: 1.1 }}>The Collection</h2>
            <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: 'clamp(15px,1.6vw,19px)', color: '#8B7355', margin: '6px 0 0' }}>Taste the terroir</p>
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
            const imgSrc = resolveProductImage(dbImages, p.id, p.images?.[0]?.url);
            return (
            <div key={p.id} style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', background: '#FDF6EC', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '14px' }}>
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.images?.[0]?.altText ?? p.name}
                      fill
                      sizes="(max-width: 768px) 260px, 280px"
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  ) : (
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase', padding: '0 16px' }}>product photo<br />{p.name}</span>
                  )}
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
          <div style={{ padding: 'clamp(40px,7vw,64px) clamp(20px,5vw,32px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 16px' }}>Our Story</p>
            <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,4.2vw,3.4rem)', color: '#2C2417', margin: '0 0 20px', letterSpacing: '-0.01em', lineHeight: 1.15 }}>Born from the Hustle.<br />Perfected by Nature.</h2>
            <div style={{ fontSize: 'clamp(14px,1.6vw,16px)', lineHeight: 1.7, color: '#5C4A32' }}>
              <p style={{ margin: '0 0 14px' }}>As founders navigating modern life&apos;s high-stress rhythms, we craved something sweet that also looked out for us. We bypassed commercial supply chains and went deep into India&apos;s most remote forests — partnering with indigenous tribes to harvest honey exactly as nature intended.</p>
              <p style={{ margin: '0 0 24px' }}>Unprocessed, unfiltered, and alive with raw nutrients. This is SUMOSTA.</p>
            </div>
            <Link href="/about" style={{ fontWeight: 600, color: '#2C2417', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>Read Our Full Story <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* ===== BEEKEEPERS DARK SECTION ===== */}
      <section style={{ background: '#2C2417', padding: 0 }}>
        <div className="sum-founders-grid" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr' }}>
          {/* Text */}
          <div style={{ padding: 'clamp(48px,9vw,80px) clamp(20px,5vw,32px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: 2 }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F5A623', fontWeight: 700, margin: '0 0 18px' }}>The Beekeepers</p>
            <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: 'clamp(1.25rem,2.6vw,2.2rem)', color: '#FFF0D6', lineHeight: 1.35, margin: '0 0 24px' }}>
              &ldquo;We don&apos;t manage bees. We visit them, and take only what the forest can spare.&rdquo;
            </p>
            <p style={{ fontSize: 'clamp(14px,1.5vw,15px)', lineHeight: 1.7, color: '#C4B39A', margin: '0 0 8px', maxWidth: '440px' }}>
              Our network of 40+ traditional beekeeping families ventures deep into India&apos;s most remote and pristine forest reserves to harvest from colonies that have never known a commercial hive box.
            </p>
            <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: '#8B7355', margin: '20px 0 0' }}>— Third-generation apiary partners</p>
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
      <section style={{ padding: 'clamp(48px,8vw,72px) 24px', background: '#FFF9F0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: honeycombSvg, backgroundSize: '56px 100px', opacity: 0.04 }} />
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <h2 data-reveal style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,3.2rem)', color: '#2C2417', margin: '0 0 14px', lineHeight: 1.15 }}>Join the Colony</h2>
          <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', lineHeight: 1.55, color: '#8B7355', margin: '0 0 24px' }}>Get first access to new harvests, exclusive recipes, and 10% off your first order.</p>
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
      <section style={{ padding: 'clamp(48px,8vw,72px) 20px', background: '#1A150E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 'clamp(36px,6vw,64px)' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#F5A623', fontWeight: 700, margin: '0 0 14px' }}>The SUMOSTA Way</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,3.2rem)', color: '#FFFDF8', margin: '0 0 14px', lineHeight: 1.15 }}>
              Inspired by the Sumo.<br />Guided by Timeless Values.
            </h2>
            <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', color: '#C4B39A', maxWidth: '640px', margin: '0 auto', lineHeight: 1.65 }}>
              Most people see a Sumo. We see a mindset — built on balance, discipline, patience, and resilience. That mindset inspires every jar we make.
            </p>
          </div>

          {/* Vision + Mission cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: 'clamp(32px,5vw,48px)' }} className="sum-vm-grid">
            {[
              { label: 'Our Vision', text: BRAND_CONTENT.visionMission.vision, icon: '🌟' },
              { label: 'Our Mission', text: BRAND_CONTENT.visionMission.mission, icon: '🎯' },
              { label: 'Our Purpose', text: BRAND_CONTENT.visionMission.objective, icon: '💫' },
            ].map((item) => (
              <div key={item.label} style={{ background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(139,115,85,0.25)', borderRadius: '16px', padding: 'clamp(20px,4vw,28px) clamp(20px,4vw,32px)' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F5A623', fontWeight: 700, margin: '0 0 10px' }}>{item.icon}  {item.label}</p>
                <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 400, fontSize: 'clamp(0.9rem,1.6vw,1.1rem)', color: '#FFF0D6', lineHeight: 1.65, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Beliefs — 5 vertical cards side by side on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }} className="sum-beliefs-grid">
            {BRAND_CONTENT.philosophy.beliefs.map((b) => (
              <div
                key={b.title}
                className="sum-belief-card"
                style={{
                  background: 'rgba(255,253,248,0.03)',
                  border: '1px solid rgba(139,115,85,0.2)',
                  borderRadius: '14px',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <span
                  style={{
                    fontSize: '22px',
                    lineHeight: 1,
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(245,166,35,0.12)',
                    border: '1px solid rgba(245,166,35,0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#FFFDF8', margin: '0 0 6px', lineHeight: 1.35 }}>{b.title}</p>
                  <p style={{ fontSize: '13px', color: '#C4B39A', margin: 0, lineHeight: 1.55 }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* Hero pulls up behind the fixed header only on very wide viewports
           where the baked-in image copy has enough headroom. Below 1600px
           (incl. 125% zoom on 1080p), sit below the header so nothing gets
           clipped. */
        .sum-hero-section { margin-top: 0; }
        @media (min-width: 1600px) {
          .sum-hero-section { margin-top: calc(var(--header-height) * -1); }
        }

        /* Responsive hero image swap — slides that ship a portrait
           "hero*-mobile.png" hide the landscape variant on phones. */
        .sum-hero-img--mobile { display: none; }
        @media (max-width: 767px) {
          .sum-hero-img--desktop { display: none; }
          .sum-hero-img--mobile  { display: block; }

          /* Mobile --header-height now matches the real 64px navbar (the
             announcement bar is hidden md:flex), so no pull-up is needed —
             the calc resolves to 0 and the hero sits flush under the navbar. */
          .sum-hero-section {
            margin-top: calc((var(--header-height) - 64px) * -1) !important;
            height: calc(100vh - 64px) !important;
            height: calc(100dvh - 64px) !important;
          }

          /* Portrait mobile hero has its safe zone dead-center bottom, so
             center the CTA horizontally and tighten it so "SHOP THE
             COLLECTION" fits on a single line at 375px. */
          .sum-hero-cta--mobile-center {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            bottom: clamp(72px, 11vh, 110px) !important;
            padding: 13px 24px !important;
            font-size: 11.5px !important;
            letter-spacing: 0.08em !important;
            white-space: nowrap !important;
            gap: 8px !important;
          }
          .sum-hero-cta--mobile-center > span { font-size: 13px !important; }
        }

        /* ===== DESKTOP ===== */
        @media (min-width: 1024px) {
          .sum-hero-grid       { gap: 40px !important; padding: 32px 24px 72px !important; }
          .sum-story-grid      { grid-template-columns: 1fr 1fr !important; min-height: 560px; }
          .sum-founders-grid   { grid-template-columns: 1fr 1fr !important; }
          .sum-vm-grid         { grid-template-columns: repeat(3,1fr) !important; }
          .sum-beliefs-grid    { grid-template-columns: repeat(5,1fr) !important; }
          /* At 5-col width, horizontal card layout gets cramped — revert to stacked. */
          .sum-belief-card     { flex-direction: column !important; align-items: flex-start !important; padding: 28px 22px !important; gap: 16px !important; }
          .sum-belief-card > span { width: 52px !important; height: 52px !important; font-size: 30px !important; border-radius: 12px !important; }
        }

        /* ===== TABLET ===== */
        @media (min-width: 640px) and (max-width: 1023px) {
          .sum-beliefs-grid    { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 1023px) {
          .sum-hero-grid     { padding: 20px 28px 68px !important; gap: 18px !important; }
          .sum-hero-text     { align-items: center; display: flex; flex-direction: column; text-align: center; }
          .sum-hero-body     { font-size: 14px !important; line-height: 1.55 !important; max-width: 340px !important; margin: 0 auto 18px !important; }
          .sum-hero-ctas     { justify-content: center !important; }
          .sum-hero-overlay  { background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.4) 100%) !important; }
        }
        @media (max-width: 639px) {
          .sum-beliefs-grid  { grid-template-columns: 1fr !important; }
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
        @keyframes sum-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
