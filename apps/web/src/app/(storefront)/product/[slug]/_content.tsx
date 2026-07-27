'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';

export default function ProductContent({ slug }: { slug: string }) {

  const product = STATIC_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const combo = !product ? STATIC_COMBOS.find((c) => c.slug === slug) ?? null : null;

  const [activeVariant, setActiveVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const { addItem, openCart } = useCartStore();
  const addTimeout = useRef<ReturnType<typeof setTimeout>>();

  const variants = product?.variants ?? (combo as any)?.variants ?? [];
  const basePrice = product?.price ?? combo?.price ?? 0;
  const currentPrice = variants.length > 0
    ? basePrice + (variants[activeVariant]?.priceAdjust ?? 0)
    : basePrice;
  const compareAt = product?.compareAtPrice ?? combo?.compareAtPrice ?? null;

  useEffect(() => {
    const onScroll = () => {
      setStickyVisible(window.scrollY > 520);
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('revealed');
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (added || (!product && !combo)) return;
    const itemId = product?.id ?? combo?.id ?? '';
    const itemSlug = slug;
    const itemName = product?.name ?? combo?.name ?? '';
    const variantName = variants[activeVariant]?.name ?? '';
    addItem(
      itemId,
      variantName,
      qty,
      { id: itemId, name: itemName, slug: itemSlug, price: currentPrice, images: [], stock: product?.stock ?? 99 },
    );
    setAdded(true);
    clearTimeout(addTimeout.current);
    addTimeout.current = setTimeout(() => {
      setAdded(false);
      openCart();
    }, 1800);
  }, [added, activeVariant, qty, currentPrice, addItem, openCart, product, combo, variants, slug]);

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

  if (!product && !combo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFDF8', fontFamily: 'var(--font-manrope), sans-serif', gap: '16px' }}>
        <p style={{ fontSize: '20px', fontWeight: 700, color: '#2C2417' }}>Product not found.</p>
        <Link href="/shop" style={{ color: '#F5A623', fontWeight: 600, textDecoration: 'none' }}>← Back to Shop</Link>
      </div>
    );
  }

  const name = product?.name ?? combo?.name ?? '';
  const categoryName = product?.category?.name ?? 'Gift Box';
  const shortDesc = product?.shortDescription ?? combo?.description ?? '';
  const description = product?.description ?? combo?.description ?? '';
  const sourcingHighlights = product?.sourcingHighlights ?? null;
  const faqs = product?.faqs ?? [];
  const batchCert = product?.batchCertificate ?? null;
  const nutritionalBenefits = product?.nutritionalBenefits ?? [];
  const howToUse = (product as any)?.howToUse as string[] | undefined;
  const ingredients = (product as any)?.ingredients as string | undefined;
  const trustBadges = (product as any)?.trustBadges as string[] | undefined;
  const benefitsLabel = ((combo as any)?.benefitsLabel as string | undefined) ?? 'Why It Works';
  const benefitsBody = (combo as any)?.benefitsBody as string | string[] | undefined;

  const ACCORDION: { title: string; body: string | string[] }[] = [
    { title: 'Description', body: description },
    ...(benefitsBody !== undefined
      ? [{ title: benefitsLabel, body: benefitsBody }]
      : nutritionalBenefits.length > 0
      ? [{ title: benefitsLabel, body: nutritionalBenefits }]
      : []),
    ...(ingredients ? [{ title: 'Ingredients & Nutrition', body: ingredients }] : []),
    { title: 'Shipping & Returns', body: 'Ships in 2–4 business days. Free shipping on orders over ₹499. 7-day returns on unopened jars.' },
    ...(howToUse && howToUse.length > 0 ? [{ title: 'How to Use', body: howToUse }] : []),
  ];

  // Related: other active products, excluding current
  const related = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon && p.slug !== slug).slice(0, 4);

  return (
    <div style={{ background: '#FFFDF8', fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif', color: '#2C2417', minHeight: '100vh' }}>

      {/* Sticky add-to-cart bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80, background: 'rgba(255,253,248,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #F0E6D3', boxShadow: '0 -4px 20px rgba(44,36,23,0.08)', transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.35s cubic-bezier(0.25,0.1,0.25,1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#2C2417', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <p style={{ fontSize: '12px', color: '#D4891A', fontWeight: 700, margin: '2px 0 0' }}>₹{currentPrice}{variants[activeVariant] ? <span style={{ color: '#8B7355', fontWeight: 500 }}> / {variants[activeVariant].name}</span> : ''}</p>
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
          {name}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="sum-pdp-grid">
          {/* Gallery */}
          <div>
            <div style={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 16px,#FFF9F0 16px,#FFF9F0 32px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '12px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase' }}>product photo<br />{name}</span>
            </div>
          </div>

          {/* Product info */}
          <div>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C4B39A', margin: '0 0 10px' }}>{categoryName}</p>
            <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#2C2417', margin: '0 0 14px' }}>{name}</h1>
            <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '28px', color: '#D4891A', margin: '0 0 20px' }}>
              ₹{currentPrice}
              {compareAt && compareAt > currentPrice && (
                <span style={{ fontSize: '15px', color: '#C4B39A', textDecoration: 'line-through', fontWeight: 500, marginLeft: '10px' }}>₹{compareAt}</span>
              )}
            </p>
            {shortDesc && (
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#5C4A32', margin: '0 0 28px', maxWidth: '480px' }}>{shortDesc}</p>
            )}

            {/* Variant selector */}
            {variants.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#2C2417', margin: '0 0 10px' }}>Size</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {variants.map((v: any, i: number) => {
                    const active = activeVariant === i;
                    const varPrice = basePrice + v.priceAdjust;
                    return (
                      <button key={v.id} onClick={() => setActiveVariant(i)} style={{ padding: '10px 22px', borderRadius: '8px', border: active ? '2px solid #F5A623' : '1px solid #F0E6D3', background: active ? '#FFF9F0' : '#FFFDF8', color: active ? '#D4891A' : '#5C4A32', fontWeight: active ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        {v.name} — ₹{varPrice}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
              {(trustBadges ?? ['Raw & Unfiltered', 'NABL Lab Tested', 'Free Shipping ₹499+']).map((badge) => (
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
                    <div style={{ overflow: 'hidden', maxHeight: open ? '1200px' : '0', transition: 'max-height 0.5s cubic-bezier(0.25,0.1,0.25,1)' }}>
                      {Array.isArray(a.body) ? (
                        <ul style={{ paddingLeft: '18px', margin: '0 0 16px', fontSize: '14px', lineHeight: 1.7, color: '#5C4A32' }}>
                          {(a.body as string[]).map((item, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>)}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#5C4A32', margin: '0 0 16px' }}>{a.body as string}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing highlights */}
      {sourcingHighlights && (
        <section style={{ padding: '64px 24px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: '#2C2417', margin: '0 0 28px' }}>Where It Comes From</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }} className="sum-sourcing-grid">
            {[
              { label: 'Forest', value: sourcingHighlights.forestName },
              { label: 'Location', value: sourcingHighlights.location },
              { label: 'Harvested By', value: sourcingHighlights.harvestedBy },
              { label: 'Bee Species', value: sourcingHighlights.beeSpecies },
            ].map((item) => (
              <div key={item.label} style={{ background: '#FFF9F0', border: '1px solid #F0E6D3', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4B39A', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C2417', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section style={{ padding: '0 24px 64px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: '#2C2417', margin: '0 0 20px' }}>Questions About This Honey</h2>
          <div style={{ borderTop: '1px solid #F0E6D3' }}>
            {faqs.map((faq, i) => {
              const open = openAccordion === ACCORDION.length + i;
              return (
                <div key={i} style={{ borderBottom: '1px solid #F0E6D3' }}>
                  <button onClick={() => setOpenAccordion((prev) => (prev === ACCORDION.length + i ? null : ACCORDION.length + i))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#2C2417', paddingRight: '16px' }}>{faq.question}</span>
                    <span style={{ fontSize: '18px', color: '#8B7355', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'inline-block' }}>›</span>
                  </button>
                  <div style={{ overflow: 'hidden', maxHeight: open ? '300px' : '0', transition: 'max-height 0.35s cubic-bezier(0.25,0.1,0.25,1)' }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#5C4A32', margin: '0 0 16px' }}>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lab certificate */}
      {batchCert && (
        <section style={{ padding: '0 24px 64px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: '#2C2417', margin: '0 0 8px' }}>NABL Lab Certificate</h2>
          <p style={{ fontSize: '13px', color: '#8B7355', margin: '0 0 20px' }}>Batch {batchCert.batchNo} · Tested by {batchCert.nablLab}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#FFF0D6' }}>
                  {['Parameter', 'Result', 'FSSAI Limit', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#2C2417', borderBottom: '2px solid #F0E6D3', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batchCert.parameters.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#FFFDF8' : '#FFF9F0' }}>
                    <td style={{ padding: '10px 14px', color: '#2C2417', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '10px 14px', color: '#5C4A32' }}>{p.result}</td>
                    <td style={{ padding: '10px 14px', color: '#8B7355' }}>{p.fssaiLimit}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: p.status === 'Pass' ? '#E8F0E4' : '#FDE8E3', color: p.status === 'Pass' ? '#3A6B2A' : '#C4573A' }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ padding: '64px 0 96px', maxWidth: '1400px', margin: '0 auto', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#2C2417', margin: '0 0 32px', padding: '0 24px' }}>You Might Also Like</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '0 24px 12px', scrollbarWidth: 'none' }}>
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} data-reveal style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0, textDecoration: 'none' }}>
                <div style={{ aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 14px,#FFF9F0 14px,#FFF9F0 28px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', color: '#8B7355', textTransform: 'uppercase', padding: '0 12px' }}>{p.name}</span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#2C2417', margin: '0 0 4px' }}>{p.name}</h3>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#D4891A', margin: 0 }}>₹{p.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .sum-pdp-grid { grid-template-columns: 1fr 1fr !important; }
          .sum-sourcing-grid { grid-template-columns: repeat(4,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
