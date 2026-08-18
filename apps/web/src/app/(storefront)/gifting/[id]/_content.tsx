'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Gift,
  Leaf,
  MapPin,
  Minus,
  Package,
  Plus,
  Shield,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import type { ProductImage } from 'shared';
import { useCartStore } from '@/stores/cart-store';
import { couponsApi } from '@/lib/api';
import type { Coupon } from 'shared';
import { COMBOS, TIER_COLORS, comboPriceAt, comboMrpAt } from '@/lib/gifting-combos';
import ProductGallery from '@/components/product/ProductGallery';
import { loadProduct } from '@/hooks/useProductBySlug';
import { formatPrice } from '@/lib/utils';

export default function ComboDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const combo = COMBOS.find((c) => c.id === id);

  const { addItem, addCoupon, coupons, items: cartItems } = useCartStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [sizeIdx, setSizeIdx] = useState(combo?.defaultSizeIdx ?? 0);
  const addTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Fetch full D1 image lists for every item in this combo so the gallery
  // and the "What's Inside" panel render admin-uploaded images, not static.
  const [d1ImagesBySlug, setD1ImagesBySlug] = useState<Record<string, ProductImage[]>>({});
  useEffect(() => {
    if (!combo) return;
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

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!combo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4 px-6 text-center">
        <p className="font-clash font-bold text-charcoal text-2xl">Bundle not found.</p>
        <Link href="/shop/gift-boxes" className="font-satoshi font-semibold text-honey-500 hover:text-honey-600">
          ← Back to Combos
        </Link>
      </div>
    );
  }

  const tc = TIER_COLORS[combo.tier];
  const size = combo.sizes[sizeIdx] ?? combo.sizes[combo.defaultSizeIdx];
  const price = comboPriceAt(combo, sizeIdx);
  const mrp   = comboMrpAt(combo, sizeIdx);
  const save  = mrp - price;
  const savePercent = mrp > price ? Math.round((save / mrp) * 100) : null;

  // Feed the shared ProductGallery. Prefer D1 (admin-uploaded) images per item;
  // fall back to the single static image while D1 is loading or empty. For
  // multi-item combos we show only the primary shot per product (matched to
  // the currently-selected size) so the gallery stays curated and swapping
  // sizes surfaces the correct bottle photography.
  const pickForVariant = (images: ProductImage[], variantIdx: number): ProductImage | null => {
    if (images.length === 0) return null;
    if (variantIdx === 1) {
      const hit = images.find((img) => {
        const url = (img.url ?? '').toLowerCase();
        const alt = (img.altText ?? '').toLowerCase();
        return url.includes('500g') || alt.includes('500g');
      });
      if (hit) return hit;
    }
    return images[0];
  };
  const imagesForItem = (ci: (typeof combo.items)[number]): ProductImage[] => {
    const d1 = d1ImagesBySlug[ci.product.slug];
    if (d1 && d1.length > 0) {
      if (combo.items.length === 1) return d1;
      const hit = pickForVariant(d1, size.variantIdx);
      return hit ? [hit] : [];
    }
    const staticImgs = (ci.product.images ?? []) as ProductImage[];
    if (combo.items.length === 1) return staticImgs;
    const hit = pickForVariant(staticImgs, size.variantIdx);
    return hit ? [hit] : [];
  };
  const overrideGallery: ProductImage[] = combo.coverImages?.map((c, i) => ({
    id: `combo-cover-${i}`,
    url: c.url,
    altText: c.alt,
    sortOrder: i,
    isPrimary: i === 0,
  })) ?? [];
  const galleryImages: ProductImage[] = [
    ...(overrideGallery.length > 0
      ? overrideGallery
      : combo.items.flatMap((ci) => imagesForItem(ci)).filter(Boolean)),
    {
      id: 'combo-six-ways',
      url: 'https://sumosta-api.sumosta-dev.workers.dev/api/media/products/1786469410812-5.png',
      altText: 'Six natural ways to enjoy SUMOSTA honey',
      sortOrder: 999,
      isPrimary: false,
    },
  ];

  const perItemSizeLabel = (variantIdx: number) =>
    variantIdx === -1 ? '5 × 70g' : variantIdx === 0 ? '250g' : '500g';

  const addBundleToCart = useCallback(async () => {
    if (adding || added) return;
    setAdding(true);
    for (const ci of combo.items) {
      const { product } = ci;
      const variant = size.variantIdx >= 0 ? product.variants?.[size.variantIdx] : null;
      addItem(
        product.id,
        variant?.id ?? null,
        qty,
        { id: product.id, name: product.name, slug: product.slug, price: product.price, images: product.images, stock: product.stock },
        variant as any ?? null,
      );
    }
    const shouldApplyCOMBO10 = combo.items.length > 1 || combo.tier === '5 Pack';
    if (shouldApplyCOMBO10 && !coupons.some((c) => c.code === 'COMBO10')) {
      try {
        const allItems = [...cartItems, ...combo.items.map((ci) => ({ product: ci.product, quantity: 1 }))];
        const res = await couponsApi.validate(
          'COMBO10',
          price,
          allItems.map((i) => ({ name: i.product.name, quantity: 1 })),
        );
        if (res.valid && res.coupon) addCoupon(res.coupon as Coupon);
      } catch { /* silent */ }
    }
    setAdding(false);
    setAdded(true);
    clearTimeout(addTimeout.current);
    addTimeout.current = setTimeout(() => setAdded(false), 1800);
  }, [adding, added, combo, qty, size.variantIdx, price, addItem, addCoupon, coupons, cartItems]);

  const handleBuyNow = useCallback(async () => {
    await addBundleToCart();
    router.push('/checkout');
  }, [addBundleToCart, router]);

  const toggleAccordion = (i: number) => setOpenAccordion((prev) => (prev === i ? null : i));

  const ACCORDION: { title: string; body: string | string[] }[] = [
    {
      title: 'What\'s Included',
      body: combo.items.map(
        (ci) => `${ci.label} · ${ci.origin} · ${perItemSizeLabel(size.variantIdx)} — ${ci.flavor}`,
      ),
    },
    { title: 'Why This Bundle', body: combo.benefits.map((b) => b.text) },
    { title: 'Perfect As A Gift', body: combo.giftNote },
  ];


  return (
    <div className="bg-cream text-charcoal min-h-screen">
      {/* Sticky bottom add-to-cart bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-t border-sand shadow-lg transition-transform duration-300 ease-out ${
          stickyVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-content mx-auto px-6 md:px-8 h-[76px] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-satoshi text-charcoal text-sm font-bold truncate">{combo.name}</p>
            <p className="font-satoshi text-honey-500 text-xs font-bold">
              {formatPrice(price)}
              <span className="text-earth font-medium"> · {size.label}</span>
            </p>
          </div>
          <button
            onClick={addBundleToCart}
            disabled={added || adding}
            className={`inline-flex items-center justify-center gap-2 font-satoshi font-semibold text-sm px-6 py-3 rounded-full transition-colors min-h-[44px] ${
              added
                ? 'bg-sage text-cream cursor-default'
                : 'bg-honey-500 hover:bg-honey-600 text-cream'
            }`}
          >
            {added ? (
              <><Check size={16} aria-hidden /> Added</>
            ) : (
              <><ShoppingBag size={16} aria-hidden /> Add Bundle</>
            )}
          </button>
        </div>
      </div>

      {/* Product layout */}
      <section className="max-w-content mx-auto px-6 md:px-8 pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 font-satoshi text-xs text-earth-light">
            <li><Link href="/" className="hover:text-honey-500 transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/shop/gift-boxes" className="hover:text-honey-500 transition-colors">Combos</Link></li>
            <li aria-hidden>/</li>
            <li className="text-earth">{combo.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery + What's Included */}
          <div>
            {galleryImages.length > 0 ? (
              <ProductGallery images={galleryImages} productName={combo.name} />
            ) : (
              <div className="relative aspect-square rounded-xl bg-cream-warm border border-sand flex items-center justify-center">
                <span className="font-satoshi text-xs uppercase tracking-[0.08em] text-earth-light">
                  {combo.name}
                </span>
              </div>
            )}

            {/* What's Included */}
            <div className="mt-6 bg-cream-warm border border-sand rounded-xl px-5 py-5">
              <p className="font-satoshi text-honey-500 text-[11px] uppercase tracking-[0.12em] font-bold mb-4">
                What's Inside — {size.label}
              </p>
              <div className="flex flex-col gap-3">
                {combo.items.map((ci, i) => {
                  const d1Item = d1ImagesBySlug[ci.product.slug] ?? [];
                  const staticItem = (ci.product.images ?? []) as ProductImage[];
                  const pickedD1 = d1Item.length > 0 ? pickForVariant(d1Item, size.variantIdx) : null;
                  const pickedStatic = staticItem.length > 0 ? pickForVariant(staticItem, size.variantIdx) : null;
                  const itemImgUrl = pickedD1?.url ?? pickedStatic?.url ?? null;
                  return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-sand bg-cream shrink-0">
                      {itemImgUrl ? (
                        <Image
                          src={itemImgUrl}
                          alt={ci.product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-earth-light">
                          <Package size={18} strokeWidth={1.4} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-satoshi text-charcoal text-sm font-semibold m-0 truncate">
                        {ci.label}
                      </p>
                      <p className="font-satoshi text-earth text-xs m-0 mt-0.5 truncate">
                        <span className="font-semibold text-honey-500">{ci.origin}</span> · {ci.flavor}
                      </p>
                    </div>
                    <span className="font-satoshi text-earth text-xs font-medium shrink-0">
                      {perItemSizeLabel(size.variantIdx)}
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Tier eyebrow */}
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="inline-flex items-center gap-1.5 font-satoshi text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border"
                style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}
              >
                {combo.tier}
              </span>
              <span className="font-satoshi text-[11px] uppercase tracking-[0.14em] text-earth-light">
                Curated Bundle
              </span>
            </div>

            {/* Title */}
            <h1 className="font-clash font-extrabold text-charcoal text-3xl md:text-[2.6rem] leading-tight mb-3">
              {combo.name}
            </h1>

            {/* Tagline */}
            <p className="font-bespoke italic text-earth text-base md:text-lg m-0 mb-6">
              {combo.tagline}
            </p>

            {/* Size selector (only when combo offers more than one size) */}
            {combo.sizes.length > 1 && (
              <div className="flex items-center gap-3 mb-5">
                <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-earth-light">
                  Jar Size
                </span>
                <div className="inline-flex rounded-lg overflow-hidden border border-sand">
                  {combo.sizes.map((s, i) => {
                    const active = i === sizeIdx;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSizeIdx(i)}
                        aria-pressed={active}
                        className={`px-4 py-2 font-satoshi text-sm font-bold transition-colors ${
                          active
                            ? 'bg-honey-500 text-cream'
                            : 'bg-transparent text-honey-600 hover:bg-honey-50'
                        }`}
                      >
                        {s.perItemLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price row */}
            <div className="flex items-baseline gap-3 flex-wrap mb-5">
              <span className="font-clash font-extrabold text-honey-500 text-3xl md:text-4xl">
                {formatPrice(price)}
              </span>
              {save > 0 && (
                <>
                  <span className="font-satoshi text-earth-light text-base line-through font-medium">
                    MRP {formatPrice(mrp)}
                  </span>
                  {savePercent && (
                    <span className="bg-terracotta text-cream font-satoshi text-[11px] font-bold px-2.5 py-1 rounded-full">
                      SAVE {savePercent}%
                    </span>
                  )}
                </>
              )}
              <span className="font-satoshi text-earth text-sm">/ {size.label}</span>
            </div>

            {/* COMBO10 callout */}
            <div className="bg-sage-light border border-sage/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5">
              <span className="font-satoshi text-[11px] font-bold text-sage bg-cream border border-sage/40 rounded px-2 py-0.5">
                COMBO10
              </span>
              <span className="font-satoshi text-sage text-sm font-medium">
                10% off auto-applied at checkout
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: <Shield size={12} aria-hidden />, label: '100% Raw & Pure' },
                { icon: <Sparkles size={12} aria-hidden />, label: 'NABL Tested' },
                { icon: <Leaf size={12} aria-hidden />, label: 'NPOP Organic' },
                { icon: <MapPin size={12} aria-hidden />, label: 'Single Origin' },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 font-satoshi text-bark text-[11px] font-semibold uppercase tracking-[0.06em] bg-sand px-2.5 py-1 rounded"
                >
                  {badge.icon}
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Qty + CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-7">
              <div className="flex items-center border border-sand rounded-lg">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-bark hover:text-charcoal transition-colors"
                >
                  <Minus size={16} aria-hidden />
                </button>
                <span
                  aria-live="polite"
                  className="w-10 text-center font-satoshi font-bold text-sm text-charcoal"
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center text-bark hover:text-charcoal transition-colors"
                >
                  <Plus size={16} aria-hidden />
                </button>
              </div>
              <button
                onClick={addBundleToCart}
                disabled={added || adding}
                className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 font-satoshi font-semibold text-[15px] px-6 py-3.5 rounded-lg transition-all min-h-[44px] border-2 ${
                  added
                    ? 'bg-sage text-cream border-sage cursor-default'
                    : 'bg-transparent text-honey-600 border-honey-500 hover:bg-honey-50'
                }`}
              >
                {added ? (
                  <><Check size={16} aria-hidden /> Added</>
                ) : adding ? (
                  '…'
                ) : (
                  <><ShoppingBag size={16} aria-hidden /> Add to Cart</>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 font-satoshi font-semibold text-[15px] px-6 py-3.5 rounded-lg transition-all min-h-[44px] bg-honey-500 hover:bg-honey-600 text-cream shadow-honey"
              >
                {adding ? '…' : <>Buy Now <ArrowRight size={15} aria-hidden /></>}
              </button>
            </div>

            {/* Gift note */}
            <div className="bg-honey-50 border border-honey-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
              <Gift size={16} className="text-honey-600 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-satoshi text-honey-600 text-[11px] uppercase tracking-[0.12em] font-bold m-0 mb-1">
                  Perfect As A Gift
                </p>
                <p className="font-satoshi text-bark text-sm leading-relaxed m-0">
                  {combo.giftNote}
                </p>
              </div>
            </div>

            {/* Accordion — mirrors PDP */}
            <div className="border-t border-sand">
              {ACCORDION.map((a, i) => {
                const open = openAccordion === i;
                const panelId = `combo-accordion-panel-${i}`;
                const buttonId = `combo-accordion-button-${i}`;
                return (
                  <div key={a.title} className="border-b border-sand">
                    <button
                      id={buttonId}
                      onClick={() => toggleAccordion(i)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between py-4 text-left min-h-[44px]"
                    >
                      <span className="font-satoshi font-bold text-sm text-charcoal">{a.title}</span>
                      <ChevronRight
                        size={16}
                        aria-hidden
                        className={`text-earth transition-transform duration-300 ease-out ${
                          open ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      style={{ maxHeight: open ? '1400px' : '0' }}
                      className="overflow-hidden transition-[max-height] duration-500 ease-out"
                    >
                      {Array.isArray(a.body) ? (
                        <div className="mb-4 flex flex-col gap-2.5">
                          {(a.body as string[]).map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <Leaf
                                size={16}
                                aria-hidden
                                className="text-honey-500 shrink-0 mt-0.5"
                              />
                              <span className="font-satoshi text-bark text-sm leading-relaxed">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-satoshi text-bark text-sm leading-relaxed mb-4">
                          {a.body as string}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Corporate CTA — dark section */}
        <div className="mt-16 md:mt-20 mb-20 md:mb-28 bg-midnight rounded-2xl px-8 md:px-10 py-9 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 bg-honey-500/15 border border-honey-500/30 rounded-full px-3 py-1 mb-3">
              <Building2 size={12} className="text-honey-400" aria-hidden />
              <span className="font-satoshi text-honey-400 text-[10px] font-bold uppercase tracking-[0.12em]">
                Corporate Orders
              </span>
            </span>
            <h2 className="font-clash font-bold text-cream text-2xl md:text-[1.75rem] leading-tight m-0 mb-1.5">
              Need 10 or more?
            </h2>
            <p className="font-satoshi text-earth-light text-sm md:text-[15px] leading-relaxed m-0 max-w-xl">
              Bulk pricing, custom branding, and personalised notes available for corporate orders.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-honey-500 hover:bg-honey-600 text-charcoal font-satoshi font-bold text-sm px-6 py-3 rounded-lg transition-colors shrink-0"
          >
            Get a Bulk Quote <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </section>

    </div>
  );
}
