'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, ArrowRight, ArrowLeft, Building2, Gift, Leaf, MapPin, FlaskConical, Shield } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { couponsApi } from '@/lib/api';
import type { Coupon } from 'shared';
import { COMBOS, TIER_COLORS } from '@/lib/gifting-combos';

export default function ComboDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const combo = COMBOS.find((c) => c.id === id);

  const { addItem, addCoupon, coupons, items: cartItems } = useCartStore();
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!combo) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'var(--font-manrope), sans-serif' }}>
        <span style={{ fontSize: '48px' }}>🍯</span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2C2417', margin: 0 }}>Bundle not found</h1>
        <Link href="/gifting" style={{ color: '#D4891A', fontWeight: 600, fontSize: '14px' }}>← Back to Gift Combos</Link>
      </div>
    );
  }

  const allImages = combo.items.flatMap((ci) => ci.product.images ?? []).filter(Boolean);
  const displayImg = allImages[activeImg] ?? null;
  const save = combo.mrpPrice - combo.comboPrice;
  const tc = TIER_COLORS[combo.tier];

  const handleAddToCart = async () => {
    setAdding(true);
    for (const ci of combo.items) {
      const { product, variantIdx } = ci;
      const variant = variantIdx >= 0 ? product.variants?.[variantIdx] : null;
      addItem(
        product.id, variant?.id ?? null, 1,
        { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images, stock: product.stock },
        variant as any ?? null,
      );
    }
    const shouldApplyCOMBO10 = combo.items.length > 1 || combo.tier === '5 Pack';
    if (shouldApplyCOMBO10 && !coupons.some((c) => c.code === 'COMBO10')) {
      try {
        const allItems = [...cartItems, ...combo.items.map((ci) => ({ product: ci.product, quantity: 1 }))];
        const res = await couponsApi.validate('COMBO10', combo.comboPrice, allItems.map((i) => ({ name: i.product.name, quantity: 1 })));
        if (res.valid && res.coupon) addCoupon(res.coupon as Coupon);
      } catch { /* silent */ }
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div style={{ background: '#FFFDF8', minHeight: '100vh', fontFamily: 'var(--font-manrope), sans-serif', color: '#2C2417' }}>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '110px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8B7355' }}>
          <Link href="/" style={{ color: '#8B7355', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/gifting" style={{ color: '#8B7355', textDecoration: 'none' }}>Gift Combos</Link>
          <span>/</span>
          <span style={{ color: '#2C2417', fontWeight: 500 }}>{combo.name}</span>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>

          {/* ── Left: Gallery ──────────────────────────────────────────── */}
          <div>
            {/* Main image */}
            <div style={{
              background: `linear-gradient(145deg, ${combo.accent}12 0%, ${combo.accentDark}1E 100%)`,
              borderRadius: '20px', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden',
              border: '1px solid #EDE6DC',
            }}>
              {displayImg ? (
                <Image
                  src={displayImg.url}
                  alt={displayImg.altText ?? combo.name}
                  fill
                  style={{ objectFit: 'contain', padding: '32px' }}
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <span style={{ fontSize: '80px' }}>🍯</span>
                </div>
              )}
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: tc.bg, border: `1px solid ${tc.border}`,
                  color: tc.text, fontSize: '11px', fontWeight: 700,
                  padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {combo.tier}
                </span>
              </div>
              {save > 0 && (
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <span style={{ background: '#B91C1C', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                    Save ₹{save}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: '68px', height: '68px', borderRadius: '10px', flexShrink: 0,
                      border: activeImg === i ? `2px solid ${combo.accent}` : '2px solid #EDE6DC',
                      background: '#FFFDF8', padding: '6px', cursor: 'pointer',
                      position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s',
                    }}
                  >
                    <Image src={img.url} alt={img.altText ?? ''} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="68px" />
                  </button>
                ))}
              </div>
            )}

            {/* What's included */}
            <div style={{ marginTop: '28px', background: 'white', borderRadius: '16px', border: '1px solid #EDE6DC', padding: '20px 22px' }}>
              <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '15px', color: '#2C2417', margin: '0 0 14px' }}>
                What's Included
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {combo.items.map((ci, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                      background: `${combo.accent}10`, border: `1px solid ${combo.accent}20`,
                      position: 'relative', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ci.product.images?.[0]?.url ? (
                        <Image src={ci.product.images[0].url} alt={ci.product.name} fill style={{ objectFit: 'contain', padding: '5px' }} sizes="44px" />
                      ) : (
                        <span style={{ fontSize: '22px' }}>🍯</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', color: '#2C2417', margin: 0, lineHeight: 1.3 }}>{ci.label}</p>
                      <p style={{ fontSize: '12px', color: '#8B7355', margin: '2px 0 0' }}>
                        <span style={{ color: combo.accent, fontWeight: 600 }}>{ci.origin}</span> · {ci.flavor}
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#8B7355', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {ci.variantIdx === -1 ? '5 × 70g' : ci.variantIdx === 0 ? '250g' : '500g'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Info ────────────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link
              href="/gifting"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#8B7355', textDecoration: 'none', fontWeight: 500 }}
            >
              <ArrowLeft size={13} /> All Gift Combos
            </Link>

            <div>
              <h1 style={{
                fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800,
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#2C2417', margin: '0 0 8px', lineHeight: 1.2,
              }}>
                {combo.name}
              </h1>
              <p style={{ fontSize: '15px', color: '#5C4A32', lineHeight: 1.65, margin: 0 }}>{combo.tagline}</p>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '32px', color: '#2C2417' }}>
                ₹{combo.comboPrice}
              </span>
              {combo.mrpPrice > combo.comboPrice && (
                <span style={{ fontSize: '18px', color: '#C4B39A', textDecoration: 'line-through' }}>₹{combo.mrpPrice}</span>
              )}
              <span style={{ fontSize: '13px', color: '#8B7355' }}>
                {combo.sizeLabel}
              </span>
            </div>

            {/* COMBO10 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FAF0', border: '1px solid #BBE0BB', borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2E6B2E', background: 'white', border: '1px solid #BBE0BB', borderRadius: '4px', padding: '2px 7px', whiteSpace: 'nowrap' }}>COMBO10</span>
              <span style={{ fontSize: '13px', color: '#2E6B2E', fontWeight: 500 }}>10% off auto-applied at checkout</span>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddToCart}
                disabled={adding || added}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: '12px',
                  border: `2px solid ${combo.accent}`,
                  background: added ? combo.accent : 'transparent',
                  color: added ? 'white' : combo.accent,
                  fontWeight: 700, fontSize: '14px', cursor: adding ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'all 0.2s',
                }}
              >
                {added ? <><Check size={15}/> Added to Cart</> : adding ? '…' : <><ShoppingBag size={15}/> Add to Cart</>}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="buy-now-detail"
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: '12px',
                  border: 'none', background: combo.accent, color: 'white',
                  fontWeight: 700, fontSize: '14px', cursor: adding ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'filter 0.2s',
                }}
              >
                {adding ? '…' : <>Buy Now <ArrowRight size={14}/></>}
              </button>
            </div>

            {/* Benefits */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #EDE6DC', padding: '18px 20px' }}>
              <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '14px', color: '#2C2417', margin: '0 0 12px' }}>Why This Bundle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {combo.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${combo.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: combo.accent }}>{b.icon}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#5C4A32' }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift note */}
            <div style={{ background: '#FFF9F0', border: '1px solid #FDECC8', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
              <Gift size={14} color="#A66A10" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#A66A10', margin: '0 0 3px' }}>Perfect As A Gift</p>
                <p style={{ fontSize: '13px', color: '#8B7355', margin: 0 }}>{combo.giftNote}</p>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { icon: <FlaskConical size={12}/>, label: 'NABL Tested' },
                { icon: <Shield size={12}/>, label: '100% Raw & Pure' },
                { icon: <Leaf size={12}/>, label: 'NPOP Organic' },
                { icon: <MapPin size={12}/>, label: 'Single Origin' },
              ].map((badge) => (
                <div key={badge.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#F7F3EE', border: '1px solid #EDE6DC',
                  borderRadius: '6px', padding: '5px 10px',
                }}>
                  <span style={{ color: '#8B7355' }}>{badge.icon}</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#5C4A32' }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Corporate CTA ─────────────────────────────────────────────── */}
        <div style={{
          marginTop: '72px',
          background: 'linear-gradient(135deg, #1A150E 0%, #2C2417 100%)',
          borderRadius: '20px', padding: '40px 36px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '999px', padding: '4px 12px', marginBottom: '12px' }}>
              <Building2 size={11} color="#F5A623" />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#F5A623', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Corporate Orders</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#FFFDF8', margin: '0 0 6px' }}>Need 10 or more?</h2>
            <p style={{ fontSize: '13.5px', color: '#C4B39A', margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
              Bulk pricing, custom branding, and personalised notes available for corporate orders.
            </p>
          </div>
          <Link
            href="/contact"
            className="corp-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#F5A623', color: '#1A150E', padding: '13px 24px',
              borderRadius: '10px', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            Get a Bulk Quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <style>{`
        .buy-now-detail:hover:not(:disabled) { filter: brightness(0.88); }
        .corp-cta:hover { background: #D4891A !important; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .detail-grid > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  );
}
