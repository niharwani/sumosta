'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, ArrowRight, Building2, Gift, Package, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { couponsApi } from '@/lib/api';
import type { Coupon } from 'shared';
import { COMBOS, TIER_COLORS, type Combo } from '@/lib/gifting-combos';

export default function GiftingPage() {
  const router = useRouter();
  const { addItem, addCoupon, coupons, items: cartItems } = useCartStore();
  const [filter, setFilter] = useState<'All' | '5 Pack' | 'Quartet' | 'Trio' | 'Duo'>('All');
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded]   = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const visible = filter === 'All' ? COMBOS : COMBOS.filter((c) => c.tier === filter);

  const handleAddToCart = async (combo: Combo) => {
    setAdding(combo.id);
    for (const ci of combo.items) {
      const { product, variantIdx } = ci;
      const variant = variantIdx >= 0 ? product.variants?.[variantIdx] : null;
      addItem(
        product.id, variant?.id ?? null, 1,
        { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images, stock: product.stock },
        variant as any ?? null,
      );
    }
    // Apply COMBO10 only when combo has 2+ items OR is the 5-Pack bundle
    const shouldApplyCOMBO10 = combo.items.length > 1 || combo.tier === '5 Pack';
    if (shouldApplyCOMBO10 && !coupons.some((c) => c.code === 'COMBO10')) {
      try {
        const allItems = [...cartItems, ...combo.items.map((ci) => ({ product: ci.product, quantity: 1 }))];
        const res = await couponsApi.validate('COMBO10', combo.comboPrice, allItems.map((i) => ({ name: i.product.name, quantity: 1 })));
        if (res.valid && res.coupon) addCoupon(res.coupon as Coupon);
      } catch { /* silent */ }
    }
    setAdding(null);
    setAdded(combo.id);
    setTimeout(() => setAdded(null), 2500);
  };

  const handleBuyNow = async (combo: Combo) => {
    await handleAddToCart(combo);
    router.push('/checkout');
  };

  const tierDots = (tier: Combo['tier']) => {
    if (tier === 'Duo')     return '● ●';
    if (tier === 'Trio')    return '● ● ●';
    if (tier === 'Quartet') return '● ● ● ●';
    if (tier === '5 Pack')  return '● ● ● ● ●';
    return '';
  };

  return (
    <div style={{ background: '#FFFDF8', minHeight: '100vh', fontFamily: 'var(--font-manrope), sans-serif', color: '#2C2417' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1A150E 0%, #2C2417 60%, #3D3020 100%)',
        padding: '120px 24px 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5L55 20v30L30 55 5 50V20z\' fill=\'none\' stroke=\'%23F5A623\' stroke-width=\'1\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />

        <div style={{ position: 'relative', maxWidth: '1300px', margin: '0 auto' }}>

          {/* Center badge */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '999px', padding: '6px 16px' }}>
              <Building2 size={13} color="#F5A623" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#F5A623', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Corporate &amp; Premium Gifting</span>
            </div>
          </div>

          {/* 3-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '32px', alignItems: 'center' }} className="hero-grid">

            {/* Left: headline + text + badges */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFFDF8', margin: '0 0 16px', lineHeight: 1.15 }}>
                Gift India&apos;s Rarest<br />
                <span style={{ color: '#F5A623' }}>Wild Forest Honeys</span>
              </h1>
              <p style={{ fontSize: '15px', color: '#C4B39A', margin: '0 0 24px', lineHeight: 1.7, maxWidth: '440px' }}>
                Thoughtfully curated Duo, Trio, Quartet, and 5-Pack bundles — each sourced from untouched tribal reserves, NABL tested, and presented in premium packaging.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  { icon: <Check size={12}/>, text: 'COMBO10 auto-applied' },
                  { icon: <Package size={12}/>, text: 'Premium gift packaging' },
                  { icon: <Building2 size={12}/>, text: 'Bulk orders available' },
                ].map((b) => (
                  <div key={b.text} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,253,248,0.08)', border: '1px solid rgba(255,253,248,0.12)', borderRadius: '999px', padding: '7px 14px' }}>
                    <span style={{ color: '#F5A623' }}>{b.icon}</span>
                    <span style={{ fontSize: '12px', color: '#E5D5C0', fontWeight: 500 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: gift box illustration */}
            <div className="hero-center-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '160px', height: '160px',
                background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(245,166,35,0.04) 100%)',
                border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '8px',
                position: 'relative',
              }}>
                {/* Ribbon top */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '50%', background: 'linear-gradient(to bottom, #F5A623, rgba(245,166,35,0.3))' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, rgba(245,166,35,0.3), #F5A623, rgba(245,166,35,0.3))', transform: 'translateY(-50%)' }} />
                {/* Bow */}
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '28px', lineHeight: 1 }}>🎀</div>
                <span style={{ fontSize: '48px', lineHeight: 1, marginTop: '16px' }}>🎁</span>
                <span style={{ fontSize: '11px', color: '#C4B39A', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Premium</span>
              </div>
            </div>

            {/* Right: corporate orders CTA */}
            <div style={{
              background: 'rgba(255,253,248,0.05)',
              border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: '20px', padding: '28px 24px',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '999px', padding: '5px 14px', marginBottom: '14px' }}>
                <Building2 size={12} color="#F5A623" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F5A623', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Corporate Orders</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: '#FFFDF8', margin: '0 0 10px', lineHeight: 1.3 }}>
                Ordering for a team or event?
              </h2>
              <p style={{ fontSize: '13px', color: '#C4B39A', margin: '0 0 20px', lineHeight: 1.6 }}>
                Bulk Pricing, Customization, Co-Branding, personalized notes for corporate orders of 20+ units.
              </p>
              <Link
                href="/contact"
                className="corp-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#F5A623', color: '#1A150E', padding: '12px 22px',
                  borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Get a Bulk Quote <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,253,248,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #F0E6D3', padding: '14px 24px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {(['All', '5 Pack', 'Quartet', 'Trio', 'Duo'] as const).map((t) => {
            const active = filter === t;
            const tc = t !== 'All' ? TIER_COLORS[t] : null;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: '8px 20px', borderRadius: '999px', whiteSpace: 'nowrap', cursor: 'pointer',
                  border: active ? `1.5px solid ${tc?.border ?? '#F5A623'}` : '1.5px solid #F0E6D3',
                  background: active ? (tc?.bg ?? '#FFF0D6') : '#FFFDF8',
                  color: active ? (tc?.text ?? '#A66A10') : '#5C4A32',
                  fontWeight: active ? 700 : 500, fontSize: '13px', transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Combo list ───────────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '48px 24px 96px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {visible.map((combo) => {
            const tc = TIER_COLORS[combo.tier];
            const isAdding = adding === combo.id;
            const isAdded  = added  === combo.id;
            const save = combo.mrpPrice - combo.comboPrice;
            const displayImages = combo.items.slice(0, 4);

            return (
              <div
                key={combo.id}
                className="combo-card"
                style={{
                  background: 'white', borderRadius: '20px', border: '1px solid #EDE6DC',
                  overflow: 'hidden', display: 'grid', gridTemplateColumns: '60% 40%',
                  boxShadow: '0 2px 16px rgba(44,36,23,0.07)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
              >
                {/* ── Left: Image panel ────────────────────────────── */}
                <Link href={`/gifting/${combo.id}`} style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: `linear-gradient(160deg, ${combo.accent}1A 0%, ${combo.accentDark}28 100%)`,
                      height: '100%', minHeight: '300px',
                      display: 'grid',
                      gridTemplateColumns: displayImages.length <= 1 ? '1fr' : '1fr 1fr',
                      gridTemplateRows: displayImages.length <= 2 ? '1fr' : '1fr 1fr',
                      gap: '2px', position: 'relative',
                    }}
                  >
                    {displayImages.map((ci, idx) => {
                      const spanStyle = displayImages.length === 3 && idx === 0
                        ? { gridRow: '1 / 3' as const }
                        : {};
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative', background: `${combo.accent}10`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minHeight: '150px', ...spanStyle,
                          }}
                        >
                          {ci.product.images?.[0]?.url ? (
                            <Image
                              src={ci.product.images[0].url}
                              alt={ci.product.name}
                              fill
                              style={{ objectFit: 'contain', padding: '20px' }}
                              sizes="300px"
                            />
                          ) : (
                            <span style={{ fontSize: '48px' }}>🍯</span>
                          )}
                        </div>
                      );
                    })}
                    {combo.items.length > 4 && (
                      <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        background: combo.accent, color: 'white',
                        borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: 700,
                      }}>
                        +{combo.items.length - 4} more
                      </div>
                    )}
                    <div className="img-overlay" style={{
                      position: 'absolute', inset: 0,
                      background: `${combo.accentDark}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.25s ease',
                    }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        View Details <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* ── Right: Info panel ─────────────────────────────── */}
                <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: tc.bg, border: `1px solid ${tc.border}`,
                      color: tc.text, fontSize: '11px', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '999px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                      {tierDots(combo.tier)}&nbsp;{combo.tier}
                    </span>
                    {save > 0 && (
                      <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', border: '1px solid #FECACA' }}>
                        Save ₹{save}
                      </span>
                    )}
                  </div>

                  <div>
                    <Link href={`/gifting/${combo.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '20px', color: '#2C2417', margin: '0 0 4px', lineHeight: 1.25 }}>
                        {combo.name}
                      </h3>
                    </Link>
                    <p style={{ fontSize: '13.5px', color: '#8B7355', margin: 0, lineHeight: 1.55 }}>{combo.tagline}</p>
                  </div>

                  {/* Included product pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {combo.items.map((ci, i) => (
                      <div key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: `${combo.accent}0D`, border: `1px solid ${combo.accent}25`,
                        borderRadius: '6px', padding: '5px 9px',
                      }}>
                        {ci.product.images?.[0]?.url && (
                          <div style={{ width: '20px', height: '20px', position: 'relative', flexShrink: 0 }}>
                            <Image src={ci.product.images[0].url} alt={ci.label} fill style={{ objectFit: 'contain' }} sizes="20px" />
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2C2417', display: 'block', lineHeight: 1.2 }}>{ci.label}</span>
                          <span style={{ fontSize: '10px', color: combo.accent, fontWeight: 600 }}>{ci.origin}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {combo.benefits.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ color: combo.accent, flexShrink: 0 }}>{b.icon}</span>
                        <span style={{ fontSize: '12px', color: '#5C4A32' }}>{b.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Gift note */}
                  <div style={{ background: '#FFF9F0', border: '1px solid #FDECC8', borderRadius: '8px', padding: '8px 11px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Gift size={12} color="#A66A10" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#A66A10', fontWeight: 500 }}>{combo.giftNote}</span>
                  </div>

                  {/* Price + CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <div>
                      {combo.mrpPrice > combo.comboPrice && (
                        <span style={{ fontSize: '12px', color: '#C4B39A', textDecoration: 'line-through', display: 'block' }}>₹{combo.mrpPrice}</span>
                      )}
                      <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '24px', color: '#2C2417' }}>
                        ₹{combo.comboPrice}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8B7355', marginLeft: '5px' }}>
                        {combo.sizeLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAddToCart(combo)}
                        disabled={isAdding || isAdded}
                        style={{
                          padding: '10px 18px', borderRadius: '10px',
                          border: `1.5px solid ${combo.accent}`,
                          background: isAdded ? combo.accent : 'transparent',
                          color: isAdded ? 'white' : combo.accent,
                          fontWeight: 700, fontSize: '13px', cursor: isAdding ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          whiteSpace: 'nowrap', transition: 'all 0.2s',
                        }}
                      >
                        {isAdded ? <><Check size={14}/> Added</> : isAdding ? '…' : <><ShoppingBag size={14}/> Add to Cart</>}
                      </button>
                      <button
                        onClick={() => handleBuyNow(combo)}
                        disabled={isAdding}
                        className="buy-btn"
                        style={{
                          padding: '10px 18px', borderRadius: '10px',
                          border: 'none', background: combo.accent, color: 'white',
                          fontWeight: 700, fontSize: '13px', cursor: isAdding ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          whiteSpace: 'nowrap', transition: 'background 0.2s',
                        }}
                      >
                        {isAdding ? '…' : <>Buy Now <ArrowRight size={13}/></>}
                      </button>
                    </div>
                  </div>

                  {/* COMBO10 note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#4A8F4A', background: '#F0FAF0', border: '1px solid #BBE0BB', borderRadius: '4px', padding: '2px 7px' }}>COMBO10</span>
                    <span style={{ fontSize: '10.5px', color: '#8B7355' }}>10% off auto-applied at checkout</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .combo-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(44,36,23,0.13) !important; }
        .combo-card:hover .img-overlay { opacity: 1 !important; }
        .buy-btn:hover:not(:disabled) { filter: brightness(0.88); }
        .corp-cta:hover { background: #D4891A !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-center-img { display: none !important; }
        }
        @media (max-width: 700px) {
          .combo-card { grid-template-columns: 1fr !important; }
          .combo-card > a:first-child > div { min-height: 240px !important; }
        }
      `}</style>
    </div>
  );
}
