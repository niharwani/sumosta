'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Beaker,
  Check,
  ChevronRight,
  Download,
  Droplet,
  Dumbbell,
  FileText,
  Gem,
  Leaf,
  Minus,
  Moon,
  Package,
  Plus,
  ShoppingBag,
  Shield,
  Sparkles,
  Star,
  Sunrise,
  type LucideIcon,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';
import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';
import { useProductImages, resolveProductImage } from '@/hooks/useProductImages';
import { useProductBySlug } from '@/hooks/useProductBySlug';
import { tracker } from '@/lib/tracker';
import { formatPrice } from '@/lib/utils';
import { HONEY_EASE_OUT } from '@/lib/animations';
import { priceForVariant, mrpForVariant } from '@/lib/gifting-combos';
import ProductGallery from '@/components/product/ProductGallery';
import ReviewSection from '@/components/product/ReviewSection';

// Deterministic pseudo-random pick for related products so a given slug always
// picks the same shuffled subset (no CLS, but different across pages).
function pickRelated<T>(list: T[], slug: string, n: number): T[] {
  if (list.length <= n) return list;
  const seed = slug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const start = seed % list.length;
  const out: T[] = [];
  for (let i = 0; i < n && i < list.length; i++) {
    out.push(list[(start + i * 3) % list.length]);
  }
  return out;
}

// Pick a lucide icon for a benefit / how-to bullet — intentional, small set.
function getBenefitIcon(text: string): LucideIcon {
  const t = text.toLowerCase();
  if (/(gut|digest|stomach|microbiome|probiotic)/.test(t)) return Leaf;
  if (/(energy|fuel|metabol|blood sugar|glycaemic|glycemic)/.test(t)) return Sparkles;
  if (/(sleep|bedtime|rest|relax)/.test(t)) return Moon;
  if (/(respiratory|throat|lung|seasonal)/.test(t)) return Droplet;
  if (/(skin|moistur|humect|face)/.test(t)) return Sparkles;
  if (/(immun|defense|antimicrob|antibacter|propolis)/.test(t)) return Shield;
  if (/(antioxidant|phenol|polyphen|orac|enzyme|cellular)/.test(t)) return Beaker;
  if (/(iron|blood|hematic|hemato|mineral|magnesium|potassium|copper)/.test(t)) return Dumbbell;
  if (/(rare|premium|luxury|gem)/.test(t)) return Gem;
  return Leaf;
}

function getHowToUseIcon(text: string): LucideIcon {
  const t = text.toLowerCase();
  if (/(morning|wak|first thing|empty stomach|sunrise)/.test(t)) return Sunrise;
  if (/(evening|bedtime|night|sleep|wind-down)/.test(t)) return Moon;
  if (/(skin|face|topical|mask)/.test(t)) return Sparkles;
  if (/(tea|herbal|infus|kadha|tulsi|coffee|espresso|matcha|latte)/.test(t)) return Droplet;
  return Leaf;
}

export default function ProductContent({ slug }: { slug: string }) {
  const product = STATIC_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const combo = !product ? STATIC_COMBOS.find((c) => c.slug === slug) ?? null : null;

  const dbImages = useProductImages();
  const d1Product = useProductBySlug(slug);
  const [activeVariant, setActiveVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const { isAuthenticated } = useAuth();

  const { addItem } = useCartStore();
  const addTimeout = useRef<ReturnType<typeof setTimeout>>();

  const variants = product?.variants ?? (combo as any)?.variants ?? [];
  const basePrice = product?.price ?? combo?.price ?? 0;
  const currentPrice =
    variants.length > 0
      ? basePrice + (variants[activeVariant]?.priceAdjust ?? 0)
      : basePrice;
  const baseCompareAt = product?.compareAtPrice ?? combo?.compareAtPrice ?? null;
  const variantCompareAtAdj =
    variants.length > 0
      ? ((variants[activeVariant] as any)?.compareAtPriceAdjust ?? null)
      : null;
  const compareAt =
    variantCompareAtAdj != null && baseCompareAt != null
      ? baseCompareAt + variantCompareAtAdj
      : baseCompareAt;
  const savePercent =
    compareAt && compareAt > currentPrice
      ? Math.round(((compareAt - currentPrice) / compareAt) * 100)
      : null;

  // Stock: prefer D1 authoritative value once loaded; fall back to static-catalog
  // stock while D1 hydrates; treat only an *explicit zero* as out of stock so
  // static-only products (not yet seeded in D1) don't get disabled.
  const d1Stock       = (d1Product as { stock?: number } | null | undefined)?.stock;
  const staticStock   = product?.stock;
  const currentVariant = variants[activeVariant];
  const variantStock  = currentVariant?.stock;
  const resolvedStock: number | null =
    typeof variantStock === 'number' ? variantStock
    : typeof d1Stock     === 'number' ? d1Stock
    : typeof staticStock === 'number' ? staticStock
    : null;
  const outOfStock = resolvedStock === 0;

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The sticky Add-to-Cart bar is `position: fixed`, so it overlays whatever
  // sits at the bottom of the scrollable page — including the Footer's
  // copyright line. Reserve body padding for its height (68px mobile / 76px
  // desktop + 4px breathing room) so scrolling all the way down clears it.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (stickyVisible) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '';
    }
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [stickyVisible]);

  // Fire product_view once per slug
  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    const name = product?.name ?? combo?.name;
    if (!name || viewedRef.current === slug) return;
    viewedRef.current = slug;
    tracker?.track('product_view', {
      productId: product?.id ?? combo?.id,
      productName: name,
      price: basePrice,
      category: product?.category?.slug ?? 'gift-boxes',
    });
  }, [slug, product, combo, basePrice]);

  const handleAddToCart = useCallback(() => {
    if (added || outOfStock || (!product && !combo)) return;
    const itemId = product?.id ?? combo?.id ?? '';
    const itemSlug = slug;
    const itemName = product?.name ?? combo?.name ?? '';
    const variant = variants[activeVariant] ?? null;
    addItem(
      itemId,
      variant?.id ?? null,
      qty,
      {
        id: itemId,
        name: itemName,
        slug: itemSlug,
        price: basePrice,
        images: product?.images ?? [],
        stock: resolvedStock ?? undefined,
      } as Parameters<typeof addItem>[3],
      variant,
    );
    setAdded(true);
    clearTimeout(addTimeout.current);
    addTimeout.current = setTimeout(() => setAdded(false), 1800);
  }, [added, outOfStock, resolvedStock, activeVariant, qty, basePrice, addItem, product, combo, variants, slug]);

  const toggleAccordion = (i: number) => setOpenAccordion((prev) => (prev === i ? null : i));

  if (!product && !combo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4 px-6 text-center">
        <p className="font-clash font-bold text-charcoal text-2xl">Product not found.</p>
        <Link href="/shop" className="font-satoshi font-semibold text-honey-500 hover:text-honey-600">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const name = product?.name ?? combo?.name ?? '';
  const categoryName = product?.category?.name ?? 'Gift Box';
  const description = product?.description ?? combo?.description ?? '';
  const shortDescription = (product as any)?.shortDescription;
  const sourcingHighlights = product?.sourcingHighlights ?? null;
  const faqs = product?.faqs ?? [];
  const nutritionalBenefits = product?.nutritionalBenefits ?? [];
  const howToUse = (product as any)?.howToUse as string[] | undefined;
  const ingredients = (product as any)?.ingredients as string | undefined;
  const trustBadges = (product as any)?.trustBadges as string[] | undefined;
  const batchCertificate = (product as any)?.batchCertificate as
    | {
        batchNo: string;
        testingDate: string;
        expiryDate: string;
        nablLab: string;
        certificateNo: string;
        pdfUrl?: string;
      }
    | undefined;
  const benefitsBody = (combo as any)?.benefitsBody as string | string[] | undefined;
  const averageRating = product?.averageRating ?? null;
  const reviewCount = product?.reviewCount ?? 0;

  const ACCORDION: { title: string; body: string | string[] }[] = [
    { title: 'Description', body: description },
    ...(benefitsBody !== undefined
      ? [{ title: 'Benefits', body: benefitsBody }]
      : nutritionalBenefits.length > 0
      ? [{ title: 'Benefits', body: nutritionalBenefits }]
      : []),
    ...(ingredients ? [{ title: 'Ingredients & Nutrition', body: ingredients }] : []),
    ...(howToUse && howToUse.length > 0 ? [{ title: 'How to Use', body: howToUse }] : []),
  ];

  const relatedPool = STATIC_PRODUCTS.filter(
    (p) => p.isActive && !p.comingSoon && p.slug !== slug,
  );
  const related = pickRelated(relatedPool, slug, 4);

  // Prefer full D1 image list (all uploaded images, in sort order) once loaded.
  // While D1 is still loading, fall back to the static primary image so first paint is fast.
  const galleryImages = (() => {
    const d1Images = d1Product.product?.images ?? [];
    if (d1Product.loaded && d1Images.length > 0) return d1Images;
    return (product?.images ?? []).map((img) => ({
      ...img,
      url: resolveProductImage(dbImages, product?.id ?? '', img.url) ?? img.url,
    }));
  })();

  // Map the selected variant to its matching gallery image. Uploaded 2nd image = 500g,
  // 1st = 250g, so match size tokens (500g/250g/1kg/…) in the URL or alt text first;
  // fall back to using variant position as the image index.
  const variantImageIndex = useMemo(() => {
    if (variants.length === 0 || galleryImages.length === 0) return 0;
    const name = String(variants[activeVariant]?.name ?? '').toLowerCase();
    const sizeMatch = name.match(/\d+\s?(kg|g|ml|l)\b/);
    if (sizeMatch) {
      const token = sizeMatch[0].replace(/\s+/g, '');
      const hit = galleryImages.findIndex((img) => {
        const url = (img.url ?? '').toLowerCase();
        const alt = (img.altText ?? '').toLowerCase();
        return url.includes(token) || alt.includes(token);
      });
      if (hit >= 0) return hit;
    }
    return Math.min(activeVariant, galleryImages.length - 1);
  }, [activeVariant, variants, galleryImages]);

  // JSON-LD Product schema
  const jsonLd = useMemo(() => {
    const url = typeof window !== 'undefined'
      ? window.location.href
      : `https://sumosta.com/product/${slug}`;
    const image = product?.images?.[0]?.url ?? (combo as any)?.image ?? undefined;
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name,
      image: image ? [image] : undefined,
      description: shortDescription || description,
      sku: product?.sku,
      brand: { '@type': 'Brand', name: 'SUMOSTA' },
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'INR',
        price: currentPrice.toFixed(2),
        availability:
          (product?.stock ?? 99) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    };
    if (averageRating && reviewCount > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount,
      };
    }
    return JSON.stringify(schema);
  }, [name, product, combo, shortDescription, description, currentPrice, averageRating, reviewCount, slug]);

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* Sticky add-to-cart bar (no auto-open cart) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-cream border-t border-sand shadow-lg transition-transform duration-300 ease-out ${
          stickyVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-content mx-auto px-5 md:px-8 h-[68px] md:h-[76px] flex items-center justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <p className="font-satoshi text-charcoal text-sm font-bold truncate">{name}</p>
            <p className="font-satoshi text-honey-500 text-xs font-bold">
              {formatPrice(currentPrice)}
              {variants[activeVariant] && (
                <span className="text-earth font-medium"> / {variants[activeVariant].name}</span>
              )}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={added || outOfStock}
            className={`inline-flex items-center justify-center gap-2 font-satoshi font-semibold text-sm px-6 py-3 rounded-full transition-colors min-h-[44px] ${
              outOfStock
                ? 'bg-sand text-earth-light cursor-not-allowed'
                : added
                ? 'bg-sage text-cream cursor-default'
                : 'bg-honey-500 hover:bg-honey-600 text-cream'
            }`}
          >
            {outOfStock ? (
              'Out of stock'
            ) : added ? (
              <>
                <Check size={16} aria-hidden /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product layout */}
      <section className="max-w-content mx-auto px-5 md:px-8 pt-4 md:pt-12">
        <nav aria-label="Breadcrumb" className="mb-5 md:mb-8">
          <ol className="flex items-center gap-1.5 font-satoshi text-xs text-earth-light">
            <li><Link href="/" className="hover:text-honey-500 transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/shop" className="hover:text-honey-500 transition-colors">Shop</Link></li>
            <li aria-hidden>/</li>
            <li className="text-earth">{name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">
          {/* Gallery */}
          <div>
            {galleryImages.length > 0 ? (
              <ProductGallery
                images={galleryImages}
                productName={name}
                activeIndex={variantImageIndex}
              />
            ) : (
              <div className="relative aspect-square rounded-xl bg-cream-warm border border-sand flex items-center justify-center">
                <span className="font-satoshi text-xs uppercase tracking-[0.08em] text-earth-light">
                  {name}
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="font-satoshi text-[11px] uppercase tracking-[0.14em] text-earth-light mb-2.5">
              {categoryName}
            </p>
            <h1 className="font-clash font-extrabold text-charcoal text-3xl md:text-[2.6rem] leading-tight mb-4">
              {name}
            </h1>

            {/* Rating & review count */}
            {(averageRating || reviewCount > 0) && (
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 mb-5 group"
                aria-label={`${averageRating ?? ''} out of 5 from ${reviewCount} reviews`}
              >
                <div className="flex gap-0.5" aria-hidden>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s <= Math.round(averageRating ?? 0)
                          ? 'text-honey-400 fill-honey-400'
                          : 'text-sand fill-sand'
                      }
                    />
                  ))}
                </div>
                <span className="font-satoshi text-charcoal text-sm font-semibold">
                  {(averageRating ?? 0).toFixed(1)}
                </span>
                <span className="font-satoshi text-earth text-sm group-hover:text-honey-500 transition-colors">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </a>
            )}

            {/* Price row */}
            <div className="flex items-baseline gap-3 flex-wrap mb-6">
              <span className="font-clash font-extrabold text-honey-500 text-3xl md:text-4xl">
                {formatPrice(currentPrice)}
              </span>
              {compareAt && compareAt > currentPrice && (
                <>
                  <span className="font-satoshi text-earth-light text-base line-through font-medium">
                    MRP {formatPrice(compareAt)}
                  </span>
                  <span className="bg-terracotta text-cream font-satoshi text-[11px] font-bold px-2.5 py-1 rounded-full">
                    SAVE {savePercent}%
                  </span>
                </>
              )}
            </div>

            {/* Source details */}
            {sourcingHighlights && (
              <div className="bg-honey-50 border border-honey-200 rounded-xl px-5 py-4 mb-6">
                <p className="font-satoshi text-honey-500 text-[11px] uppercase tracking-[0.12em] font-bold mb-3">
                  Source Details
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Source', value: sourcingHighlights.forestName },
                    { label: 'Location', value: sourcingHighlights.location },
                    { label: 'Harvested By', value: sourcingHighlights.harvestedBy },
                    { label: 'Bee Species', value: sourcingHighlights.beeSpecies },
                    ...(sourcingHighlights.tasteProfile
                      ? [{ label: 'Taste Profile', value: sourcingHighlights.tasteProfile }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <span className="font-satoshi text-earth-light text-[10px] uppercase tracking-[0.08em] font-semibold">
                        {item.label}
                      </span>
                      <span className="font-satoshi text-charcoal text-[13px] font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(trustBadges ?? ['100% Raw & Unfiltered', 'NABL Lab Tested', 'No Additives']).map(
                (badge) => (
                  <span
                    key={badge}
                    className="font-satoshi text-bark text-[11px] font-semibold uppercase tracking-[0.06em] bg-sand px-2.5 py-1 rounded"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>

            {/* Variant selector */}
            {variants.length > 0 && (
              <div className="mb-5">
                <p className="font-satoshi text-charcoal text-sm font-bold mb-2.5">Size</p>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v: any, i: number) => {
                    const active = activeVariant === i;
                    const varPrice = basePrice + v.priceAdjust;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setActiveVariant(i)}
                        aria-pressed={active}
                        className={`px-5 py-2.5 rounded-lg text-sm font-satoshi transition-all min-h-[44px] ${
                          active
                            ? 'border-2 border-honey-400 bg-honey-50 text-honey-500 font-bold'
                            : 'border border-sand bg-cream text-bark hover:border-honey-400 font-medium'
                        }`}
                      >
                        {v.name} — {formatPrice(varPrice)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3.5 mb-7">
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
                onClick={handleAddToCart}
                disabled={added || outOfStock}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-satoshi font-semibold text-[15px] px-7 py-3.5 rounded-lg transition-all min-h-[44px] ${
                  outOfStock
                    ? 'bg-sand text-earth-light cursor-not-allowed'
                    : added
                    ? 'bg-sage text-cream cursor-default'
                    : 'bg-honey-500 hover:bg-honey-600 text-cream shadow-honey'
                }`}
              >
                {outOfStock ? (
                  'Out of stock'
                ) : added ? (
                  <>
                    <Check size={16} aria-hidden /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} aria-hidden /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Accordion */}
            <div className="border-t border-sand">
              {ACCORDION.map((a, i) => {
                const open = openAccordion === i;
                const isBenefits = a.title === 'Benefits';
                const isHowToUse = a.title === 'How to Use';
                const panelId = `accordion-panel-${i}`;
                const buttonId = `accordion-button-${i}`;
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
                          {(a.body as string[]).map((item, idx) => {
                            const Icon = isBenefits
                              ? getBenefitIcon(item)
                              : isHowToUse
                              ? getHowToUseIcon(item)
                              : Leaf;
                            return (
                              <div key={idx} className="flex gap-3 items-start">
                                <Icon
                                  size={16}
                                  aria-hidden
                                  className="text-honey-500 shrink-0 mt-0.5"
                                />
                                <span className="font-satoshi text-bark text-sm leading-relaxed">
                                  {isHowToUse && item.includes(':') ? (
                                    <>
                                      <strong className="text-charcoal font-bold">
                                        {item.substring(0, item.indexOf(':'))}
                                      </strong>
                                      {item.substring(item.indexOf(':'))}
                                    </>
                                  ) : (
                                    item
                                  )}
                                </span>
                              </div>
                            );
                          })}
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

            {/* Lab Test Report — one-tap link to the NABL-certified PDF */}
            {batchCertificate?.pdfUrl && (
              <a
                href={batchCertificate.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 group flex items-center gap-3 w-full rounded-2xl border border-sand bg-cream-warm hover:border-honey-400 hover:bg-honey-50 px-5 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
              >
                <div className="w-10 h-10 rounded-full bg-honey-100 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-honey-600" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-honey-600 m-0">
                    NABL Lab Test Report
                  </p>
                  <p className="font-satoshi text-charcoal text-sm font-semibold m-0 mt-0.5">
                    View lab test report
                  </p>
                </div>
                <Download
                  size={18}
                  className="text-earth group-hover:text-honey-600 shrink-0 transition-colors"
                  aria-hidden
                />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {product && (
        <section className="max-w-content mx-auto px-6 md:px-8 pt-16">
          <ReviewSection
            productId={product.id}
            reviews={[]}
            averageRating={averageRating ?? undefined}
            reviewCount={reviewCount ?? undefined}
          />
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="max-w-content mx-auto px-6 md:px-8 pt-16">
          <h2 className="font-clash font-extrabold text-charcoal text-2xl md:text-3xl mb-5">
            Questions About This Honey
          </h2>
          <div className="border-t border-sand">
            {faqs.map((faq, i) => {
              const idx = ACCORDION.length + i;
              const open = openAccordion === idx;
              const panelId = `faq-panel-${i}`;
              const buttonId = `faq-button-${i}`;
              return (
                <div key={i} className="border-b border-sand">
                  <button
                    id={buttonId}
                    onClick={() => setOpenAccordion((prev) => (prev === idx ? null : idx))}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="w-full flex items-center justify-between py-4 text-left min-h-[44px]"
                  >
                    <span className="font-satoshi font-bold text-sm text-charcoal pr-4">
                      {faq.question}
                    </span>
                    <ChevronRight
                      size={16}
                      aria-hidden
                      className={`text-earth shrink-0 transition-transform duration-300 ${
                        open ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    style={{ maxHeight: open ? '400px' : '0' }}
                    className="overflow-hidden transition-[max-height] duration-300 ease-out"
                  >
                    <p className="font-satoshi text-bark text-sm leading-relaxed mb-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-content mx-auto pt-16 pb-24 overflow-hidden">
          <h2 className="font-clash font-extrabold text-charcoal text-2xl md:text-3xl mb-6 px-6 md:px-8">
            You Might Also Like
          </h2>
          <div className="flex gap-5 overflow-x-auto scrollbar-none px-6 md:px-8 pb-3">
            {related.map((p, idx) => {
              const src = resolveProductImage(dbImages, p.id, p.images?.[0]?.url);
              // Display 250g pricing where a 250g variant exists (variants[0]),
              // matching the 250g product photography in this section. Falls
              // back to the base price for products without variants.
              const has250 = (p.variants?.length ?? 0) > 0;
              const displayPrice = has250 ? priceForVariant(p as any, 0) : p.price;
              const displayMrp   = has250 ? mrpForVariant(p as any, 0)   : (p.compareAtPrice ?? p.price);
              return (
                <motion.div
                  key={p.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : idx * 0.06,
                    ease: HONEY_EASE_OUT,
                  }}
                  className="min-w-[260px] max-w-[260px] shrink-0"
                >
                  <Link href={`/product/${p.slug}`} className="block group">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream-warm border border-sand mb-3">
                      {src ? (
                        <Image
                          src={src}
                          alt={p.images?.[0]?.altText || p.name}
                          fill
                          sizes="260px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-earth-light">
                          <Package size={40} strokeWidth={1.25} aria-hidden />
                        </div>
                      )}
                    </div>
                    <h3 className="font-satoshi text-sm font-semibold text-charcoal mb-1 group-hover:text-honey-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-clash text-honey-500 text-sm font-semibold">
                        {formatPrice(displayPrice)}
                      </span>
                      {displayMrp > displayPrice && (
                        <span className="font-satoshi text-earth-light text-xs line-through">
                          {formatPrice(displayMrp)}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
