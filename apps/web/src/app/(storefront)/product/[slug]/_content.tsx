'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';

const PRODUCT_NAME = 'Western Ghats Raw Honey';
const PRODUCT_CATEGORY = 'Raw Honey';
const BASE_PRICE = 599;
const THUMBS = ['front', 'label', 'texture', 'lifestyle'];
const SIZES = [
  { name: '500g', price: 599 },
  { name: '1kg', price: 999 },
];
const ACCORDION = [
  { title: 'Description', body: 'Harvested from wild Apis dorsata and Apis cerana colonies across the Western Ghats. Cold-extracted, gravity-filtered, never heated above hive temperature.' },
  { title: 'Ingredients & Nutrition', body: '100% raw honey. No additives, no sugar syrup. Per 100g: 304 kcal, 82g carbohydrates, 0g fat, 0g protein.' },
  { title: 'Shipping & Returns', body: 'Ships in 2–4 business days. Free shipping on orders over ₹500. 7-day returns on unopened jars.' },
  { title: 'How to Use', body: 'Best enjoyed on warm (not hot) toast, stirred into tea below 60°C, or straight off the spoon.' },
];
const RELATED = [
  { id: 2, name: 'Himalayan Wild Honey', price: 699 },
  { id: 3, name: 'Sundarbans Mangrove Honey', price: 549 },
  { id: 10, name: 'Raw Honeycomb Piece', price: 799 },
  { id: 11, name: 'The Essentials Gift Box', price: 1499 },
];

export default function ProductContent() {
  const [activeThumb, setActiveThumb] = useState('front');
  const [activeSize, setActiveSize] = useState('500g');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const { addItem, openCart } = useCartStore();
  const addTimeout = useRef<ReturnType<typeof setTimeout>>();

  const currentPrice = SIZES.find((s) => s.name === activeSize)?.price ?? BASE_PRICE;

  // Sticky bar on scroll past 520px
  useEffect(() => {
    const onScroll = () => {
      setStickyVisible(window.scrollY > 520);
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add('revealed');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (added) return;
    addItem(
      'western-ghats-raw-honey',
      activeSize,
      qty,
      { id: 'western-ghats-raw-honey', name: PRODUCT_NAME, slug: 'western-ghats-raw-honey', price: currentPrice, images: [], stock: 100 },
    );
    setAdded(true);
    clearTimeout(addTimeout.current);
    addTimeout.current = setTimeout(() => {
      setAdded(false);
      openCart();
    }, 1800);
  }, [added, activeSize, qty, currentPrice, addItem, openCart]);

  const toggleAccordion = (i: number) => setOpenAccordion((prev) => (prev === i ? null : i));

  const addBtnStyle: React.CSSProperties = {
    flex: 1,
    padding: '14px 28px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    fontWeight: 700,
    cursor: added ? 'default' : 'pointer',
    background: added ? '#7C9A6E' : '#F5A623',
    color: added ? '#FFFDF8' : '#1A150E',
    transition: 'background 0.3s ease, transform 0.2s ease',
    fontFamily: 'var(--font-bricolage), sans-serif',
    letterSpacing: '0.01em',
  };

  return (
    <div style={{ background: '#FFFDF8', fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif', color: '#2C2417', minHeight: '100vh' }}>

      {/* Lightbox */}
      {lightboxOpen && (
        <div onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,21,14,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '24px', right: '28px', background: 'none', border: 'none', fontSize: '28px', color: '#FFFDF8', cursor: 'pointer' }}>✕</button>
          <div style={{ width: 'min(80vw,640px)', height: 'min(80vw,640px)', borderRadius: '16px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 16px,#FFF9F0 16px,#FFF9F0 32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '14px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase' }}>product photo — {PRODUCT_NAME} — {activeThumb} (zoomed)</span>
          </div>
        </div>
      )}

      {/* Sticky add-to-cart bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80, background: 'rgba(255,253,248,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #F0E6D3', boxShadow: '0 -4px 20px rgba(44,36,23,0.08)', transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.35s cubic-bezier(0.25,0.1,0.25,1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#2C2417', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PRODUCT_NAME}</p>
            <p style={{ fontSize: '12px', color: '#D4891A', fontWeight: 700, margin: '2px 0 0' }}>₹{currentPrice} <span style={{ color: '#8B7355', fontWeight: 500 }}>/ {activeSize}</span></p>
          </div>
          <button onClick={handleAddToCart} style={{ ...addBtnStyle, flex: 'none', padding: '12px 28px', fontSize: '14px' }}>
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product layout */}
      <section style={{ padding: '150px 24px 0', maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ fontSize: '13px', color: '#C4B39A', margin: '0 0 32px' }}>
          <Link href="/" style={{ color: '#C4B39A', textDecoration: 'none' }}>Home</Link> /{' '}
          <Link href="/shop" style={{ color: '#C4B39A', textDecoration: 'none' }}>Shop</Link> /{' '}
          {PRODUCT_NAME}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="sum-pdp-grid">
          {/* Gallery */}
          <div>
            <div
              onClick={() => setLightboxOpen(true)}
              style={{ cursor: 'zoom-in', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 16px,#FFF9F0 16px,#FFF9F0 32px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '14px', position: 'relative' }}
            >
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '12px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase' }}>product photo<br />{PRODUCT_NAME} — {activeThumb}</span>
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(26,21,14,0.55)', color: '#FFFDF8', fontSize: '11px', padding: '6px 10px', borderRadius: '999px' }}>Click to zoom</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '2px', scrollbarWidth: 'none' }}>
              {THUMBS.map((th) => {
                const active = activeThumb === th;
                return (
                  <button key={th} onClick={() => setActiveThumb(th)} style={{ flexShrink: 0, width: '72px', height: '72px', borderRadius: '8px', border: active ? '2px solid #F5A623' : '1px solid #F0E6D3', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 8px,#FFF9F0 8px,#FFF9F0 16px)', cursor: 'pointer', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize', color: active ? '#D4891A' : '#8B7355', transition: 'border-color 0.2s ease' }}>
                    {th}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product info */}
          <div>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C4B39A', margin: '0 0 10px' }}>{PRODUCT_CATEGORY}</p>
            <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#2C2417', margin: '0 0 14px' }}>{PRODUCT_NAME}</h1>
            <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '28px', color: '#D4891A', margin: '0 0 20px' }}>
              ₹{currentPrice} <span style={{ fontSize: '15px', color: '#C4B39A', textDecoration: 'line-through', fontWeight: 500 }}>₹{Math.round(currentPrice * 1.33)}</span>
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#5C4A32', margin: '0 0 28px', maxWidth: '480px' }}>
              Single-origin raw honey harvested from wild colonies deep in the Western Ghats. Unfiltered, unheated, and bottled within days of harvest to preserve every enzyme and aroma note.
            </p>

            {/* Size selector */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#2C2417', margin: '0 0 10px' }}>Size</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SIZES.map((sz) => {
                  const active = activeSize === sz.name;
                  return (
                    <button key={sz.name} onClick={() => setActiveSize(sz.name)} style={{ padding: '10px 22px', borderRadius: '8px', border: active ? '2px solid #F5A623' : '1px solid #F0E6D3', background: active ? '#FFF9F0' : '#FFFDF8', color: active ? '#D4891A' : '#5C4A32', fontWeight: active ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      {sz.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #F0E6D3', borderRadius: '8px' }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: '40px', height: '44px', background: 'none', border: 'none', fontSize: '16px', color: '#5C4A32', cursor: 'pointer' }}>−</button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} style={{ width: '40px', height: '44px', background: 'none', border: 'none', fontSize: '16px', color: '#5C4A32', cursor: 'pointer' }}>+</button>
              </div>
              <button onClick={handleAddToCart} style={addBtnStyle}>
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid #F0E6D3', marginBottom: '24px' }}>
              {['Raw & Unfiltered', 'Lab‑Tested Purity', 'Free Shipping ₹500+'].map((badge) => (
                <span key={badge} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5C4A32', fontWeight: 600 }}>{badge}</span>
              ))}
            </div>

            {/* Accordion */}
            <div style={{ borderTop: '1px solid #F0E6D3' }}>
              {ACCORDION.map((a, i) => {
                const open = openAccordion === i;
                return (
                  <div key={a.title} style={{ borderBottom: '1px solid #F0E6D3' }}>
                    <button onClick={() => toggleAccordion(i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#2C2417' }}>{a.title}</span>
                      <span style={{ fontSize: '18px', color: '#8B7355', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'inline-block' }}>›</span>
                    </button>
                    <div style={{ overflow: 'hidden', maxHeight: open ? '200px' : '0', transition: 'max-height 0.35s cubic-bezier(0.25,0.1,0.25,1)' }}>
                      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#5C4A32', margin: '0 0 16px' }}>{a.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section style={{ padding: '96px 0', maxWidth: '1400px', margin: '0 auto', overflow: 'hidden' }}>
        <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#2C2417', margin: '0 0 32px', padding: '0 24px' }}>You Might Also Like</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '0 24px 12px', scrollbarWidth: 'none' }}>
          {RELATED.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} data-reveal style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0, textDecoration: 'none' }}>
              <div style={{ aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 14px,#FFF9F0 14px,#FFF9F0 28px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', color: '#8B7355', textTransform: 'uppercase', padding: '0 12px' }}>product photo<br />{p.name}</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#2C2417', margin: '0 0 4px' }}>{p.name}</h3>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#D4891A', margin: 0 }}>₹{p.price}</p>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (min-width: 1024px) {
          .sum-pdp-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
