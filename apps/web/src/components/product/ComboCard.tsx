'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, ArrowRight, Gift, ChevronRight } from 'lucide-react';
import type { ProductImage } from 'shared';
import { useCartStore } from '@/stores/cart-store';
import { couponsApi } from '@/lib/api';
import type { Coupon } from 'shared';
import { TIER_COLORS, comboPriceAt, comboMrpAt, type Combo } from '@/lib/gifting-combos';
import { loadProduct, useProductBySlug } from '@/hooks/useProductBySlug';

// Admin uploads store the 250g bottle at sort_order 0 (primary) and the 500g
// bottle at sort_order 1 with "500g" in the filename or alt. Pick the right
// bottle photo for the currently-selected combo size.
function pickImageForVariant(images: ProductImage[], variantIdx: number): string {
  if (images.length === 0) return '';
  if (variantIdx === 1) {
    const hit = images.find((img) => {
      const url = (img.url ?? '').toLowerCase();
      const alt = (img.altText ?? '').toLowerCase();
      return url.includes('500g') || alt.includes('500g');
    });
    if (hit) return hit.url;
  }
  return images[0].url;
}

const tierDots = (tier: Combo['tier']) => {
  if (tier === 'Duo')     return '● ●';
  if (tier === 'Trio')    return '● ● ●';
  if (tier === 'Quartet') return '● ● ● ●';
  if (tier === '5 Pack')  return '● ● ● ● ●';
  return '';
};

interface Props {
  combo: Combo;
}

export default function ComboCard({ combo }: Props) {
  const router = useRouter();
  const { addItem, addCoupon, coupons, items: cartItems } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);
  const [sizeIdx, setSizeIdx] = useState(combo.defaultSizeIdx);

  const size = combo.sizes[sizeIdx];
  const tc = TIER_COLORS[combo.tier];
  const price = comboPriceAt(combo, sizeIdx);
  const mrp   = comboMrpAt(combo, sizeIdx);
  const save  = mrp - price;

  // Single-item combos (e.g. "5 Elements Collection") only carry one static image.
  // Pull the full D1 image list for that item so the card can render a rich grid.
  const singleItemSlug = combo.items.length === 1 ? combo.items[0].product.slug : null;
  const d1 = useProductBySlug(singleItemSlug);
  const d1Images = d1.product?.images ?? [];

  // For multi-item combos, fetch each item's D1 image list so the tiles + pills
  // render admin-uploaded photography instead of the legacy static PNGs.
  const [d1ImagesBySlug, setD1ImagesBySlug] = useState<Record<string, ProductImage[]>>({});
  useEffect(() => {
    if (combo.items.length <= 1) return;
    let cancelled = false;
    const slugs = Array.from(new Set(combo.items.map((ci) => ci.product.slug)));
    Promise.all(slugs.map((s) => loadProduct(s).then((r) => [s, r.product?.images ?? []] as const)))
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, ProductImage[]> = {};
        for (const [s, imgs] of entries) map[s] = imgs;
        setD1ImagesBySlug(map);
      });
    return () => { cancelled = true; };
  }, [combo]);

  const imageForItem = (slug: string, fallback?: string): string => {
    const d1 = d1ImagesBySlug[slug];
    if (d1 && d1.length > 0) return pickImageForVariant(d1, size.variantIdx);
    return fallback ?? '';
  };

  type Tile = { url: string; alt: string; objectPosition?: string };
  const displayTiles: Tile[] = (() => {
    if (combo.coverImages && combo.coverImages.length > 0) {
      return combo.coverImages.slice(0, 4);
    }
    if (singleItemSlug && d1Images.length > 0) {
      return d1Images.slice(0, 4).map((img) => ({
        url: img.url,
        alt: img.altText || combo.name,
      }));
    }
    return combo.items.slice(0, 4).map((ci) => ({
      url: imageForItem(ci.product.slug, ci.product.images?.[0]?.url),
      alt: ci.product.name,
    }));
  })();
  const totalTiles = combo.coverImages && combo.coverImages.length > 0
    ? combo.coverImages.length
    : singleItemSlug && d1Images.length > 0
      ? d1Images.length
      : combo.items.length;

  const addBundleToCart = async () => {
    setAdding(true);
    for (const ci of combo.items) {
      const { product } = ci;
      const variant = size.variantIdx >= 0 ? product.variants?.[size.variantIdx] : null;
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
        const res = await couponsApi.validate('COMBO10', price, allItems.map((i) => ({ name: i.product.name, quantity: 1 })));
        if (res.valid && res.coupon) addCoupon(res.coupon as Coupon);
      } catch { /* silent */ }
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = async () => {
    await addBundleToCart();
    router.push('/checkout');
  };

  return (
    <div
      className="combo-card"
      style={{
        background: 'white', borderRadius: '20px', border: '1px solid #EDE6DC',
        overflow: 'hidden', display: 'grid', gridTemplateColumns: '60% 40%',
        boxShadow: '0 2px 16px rgba(44,36,23,0.07)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Left: Image panel */}
      <Link href={`/gifting/${combo.id}`} style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            background: `linear-gradient(160deg, ${combo.accent}1A 0%, ${combo.accentDark}28 100%)`,
            height: '100%', minHeight: '300px',
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.max(1, displayTiles.length)}, 1fr)`,
            gridTemplateRows: '1fr',
            gap: '2px', position: 'relative',
          }}
        >
          {displayTiles.map((tile, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative', background: `${combo.accent}10`,
                overflow: 'hidden',
                minHeight: '150px',
              }}
            >
              {tile.url ? (
                <Image
                  src={tile.url}
                  alt={tile.alt}
                  fill
                  style={{ objectFit: 'cover', objectPosition: tile.objectPosition ?? 'center' }}
                  sizes={`(max-width: 700px) ${Math.floor(100 / displayTiles.length)}vw, ${Math.floor(600 / displayTiles.length)}px`}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🍯</div>
              )}
            </div>
          ))}
          {totalTiles > 4 && (
            <div style={{
              position: 'absolute', bottom: '10px', right: '10px',
              background: combo.accent, color: 'white',
              borderRadius: '999px', padding: '3px 9px', fontSize: '11px', fontWeight: 700,
            }}>
              +{totalTiles - 4} more
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

      {/* Right: Info panel */}
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
          {combo.items.map((ci, i) => {
            const pillImg = imageForItem(ci.product.slug, ci.product.images?.[0]?.url);
            return (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: `${combo.accent}0D`, border: `1px solid ${combo.accent}25`,
                borderRadius: '6px', padding: '5px 9px',
              }}>
                {pillImg && (
                  <div style={{ width: '20px', height: '20px', position: 'relative', flexShrink: 0 }}>
                    <Image src={pillImg} alt={ci.label} fill style={{ objectFit: 'contain' }} sizes="20px" />
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2C2417', display: 'block', lineHeight: 1.2 }}>{ci.label}</span>
                  <span style={{ fontSize: '10px', color: combo.accent, fontWeight: 600 }}>{ci.origin}</span>
                </div>
              </div>
            );
          })}
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

        {/* Size selector (only when combo offers more than one size) */}
        {combo.sizes.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B7355', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Size
            </span>
            <div style={{ display: 'inline-flex', border: `1px solid ${combo.accent}40`, borderRadius: '8px', overflow: 'hidden' }}>
              {combo.sizes.map((s, i) => {
                const active = i === sizeIdx;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSizeIdx(i)}
                    aria-pressed={active}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: active ? combo.accent : 'transparent',
                      color: active ? 'white' : combo.accent,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                  >
                    {s.perItemLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginTop: 'auto' }}>
          <div>
            {mrp > price && (
              <span style={{ fontSize: '12px', color: '#C4B39A', textDecoration: 'line-through', display: 'block' }}>₹{mrp}</span>
            )}
            <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '24px', color: '#2C2417' }}>
              ₹{price}
            </span>
            <span style={{ fontSize: '11px', color: '#8B7355', marginLeft: '5px' }}>
              {size.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={addBundleToCart}
              disabled={adding || added}
              style={{
                padding: '10px 18px', borderRadius: '10px',
                border: `1.5px solid ${combo.accent}`,
                background: added ? combo.accent : 'transparent',
                color: added ? 'white' : combo.accent,
                fontWeight: 700, fontSize: '13px', cursor: adding ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {added ? <><Check size={14}/> Added</> : adding ? '…' : <><ShoppingBag size={14}/> Add to Cart</>}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={adding}
              className="buy-btn"
              style={{
                padding: '10px 18px', borderRadius: '10px',
                border: 'none', background: combo.accent, color: 'white',
                fontWeight: 700, fontSize: '13px', cursor: adding ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap', transition: 'background 0.2s',
              }}
            >
              {adding ? '…' : <>Buy Now <ArrowRight size={13}/></>}
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
}
