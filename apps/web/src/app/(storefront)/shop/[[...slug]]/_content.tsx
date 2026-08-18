'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Package, ShoppingBag, X } from 'lucide-react';
import { STATIC_PRODUCTS } from '@/lib/content';
import { COMBOS, defaultComboPrice } from '@/lib/gifting-combos';
import ComboCard from '@/components/product/ComboCard';
import { useProductImages, resolveProductImage } from '@/hooks/useProductImages';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { HONEY_EASE_OUT } from '@/lib/animations';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

// The 5 Elements Collection is represented as a Combo — hide the standalone product card.
const ACTIVE_PRODUCTS = STATIC_PRODUCTS.filter(
  (p) => p.isActive && !p.comingSoon && p.slug !== '5-elements-collection',
);

// Categories aligned with CATEGORIES in lib/constants.ts (raw-honey, gift-boxes)
// and with STATIC_PRODUCTS.categoryId (cat_raw_honey, cat_gift_boxes).
const CATEGORIES = [
  { label: 'All',                   categoryId: null },
  { label: 'Raw Honey',             categoryId: 'cat_raw_honey' },
  { label: 'Gift Boxes & Combos',   categoryId: 'cat_gift_boxes' },
] as const;

const SLUG_TO_CATEGORY_ID: Record<string, string> = {
  'raw-honey': 'cat_raw_honey',
  'gift-boxes': 'cat_gift_boxes',
};

export default function ShopContent() {
  const params = useParams<{ slug?: string[] }>();
  const slugCatId = params.slug?.[0] ? SLUG_TO_CATEGORY_ID[params.slug[0]] ?? null : null;

  const [categoryId, setCategoryId] = useState<string | null>(slugCatId);
  const [sort, setSort] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [transitioning, setTransitioning] = useState(false);
  const [filterStuck, setFilterStuck] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const dbImages = useProductImages();
  const addItem = useCartStore((s) => s.addItem);
  const filterTimeout = useRef<ReturnType<typeof setTimeout>>();
  const reduce = useReducedMotion();

  useEffect(() => {
    // Data is static — brief skeleton for perceived weight then reveal
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setFilterStuck(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeCategory = useCallback((catId: string | null) => {
    setTransitioning(true);
    clearTimeout(filterTimeout.current);
    filterTimeout.current = setTimeout(() => {
      setCategoryId(catId);
      setTransitioning(false);
    }, 180);
  }, []);

  const showProducts = categoryId !== 'cat_gift_boxes';
  const showCombos   = categoryId === null || categoryId === 'cat_gift_boxes';

  const filtered = (() => {
    if (!showProducts) return [];
    let list = [...ACTIVE_PRODUCTS];
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  })();

  const visibleCombos = (() => {
    if (!showCombos) return [];
    const list = [...COMBOS];
    if (sort === 'price_asc')  list.sort((a, b) => defaultComboPrice(a) - defaultComboPrice(b));
    if (sort === 'price_desc') list.sort((a, b) => defaultComboPrice(b) - defaultComboPrice(a));
    return list;
  })();

  const totalCount = filtered.length + visibleCombos.length;

  const activeCat = CATEGORIES.find((c) => c.categoryId === categoryId);
  const activeLabel = activeCat && activeCat.categoryId ? activeCat.label : '';

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent, p: (typeof ACTIVE_PRODUCTS)[number]) => {
      e.preventDefault();
      e.stopPropagation();
      const variant = p.variants?.[0] ?? null;
      addItem(
        p.id,
        variant?.id ?? null,
        1,
        { id: p.id, name: p.name, slug: p.slug, price: p.price, images: p.images ?? [], stock: p.stock ?? 99 },
        variant,
      );
      setAddedId(p.id);
      setTimeout(() => setAddedId((prev) => (prev === p.id ? null : prev)), 1600);
    },
    [addItem],
  );

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      {/* Page header */}
      <section className="max-w-content mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-8 md:pb-10">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 font-satoshi text-xs text-earth-light">
            <li>
              <Link href="/" className="hover:text-honey-500 transition-colors">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-earth">Shop</li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-clash font-extrabold text-charcoal text-[1.75rem] md:text-5xl leading-tight mb-1.5">The Collection</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-bespoke italic text-earth text-sm md:text-lg m-0">
                Showing {totalCount} {totalCount === 1 ? 'item' : 'items'}{activeLabel ? ` in ${activeLabel}` : ''}
              </p>
              {activeLabel && (
                <button
                  onClick={() => changeCategory(null)}
                  className="inline-flex items-center gap-1.5 bg-honey-100 text-honey-600 font-satoshi text-xs font-bold px-3 py-1.5 rounded-full hover:bg-honey-200 transition-colors min-h-[32px]"
                  aria-label={`Clear ${activeLabel} filter`}
                >
                  {activeLabel} <X size={12} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div
        className={`sticky top-[var(--header-height)] z-40 bg-cream border-b border-sand transition-shadow duration-300 ${
          filterStuck ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-content mx-auto px-5 md:px-8 py-2.5 md:py-3 flex flex-wrap items-center justify-between gap-2 md:gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = cat.categoryId === categoryId;
              return (
                <button
                  key={cat.label}
                  onClick={() => changeCategory(cat.categoryId)}
                  aria-pressed={active}
                  className={`px-4 py-2 rounded-full text-sm font-satoshi transition-all whitespace-nowrap min-h-[44px] border ${
                    active
                      ? 'bg-honey-400 text-charcoal border-honey-400 font-bold'
                      : 'bg-cream text-bark border-sand hover:border-honey-400 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <label htmlFor="shop-sort" className="sr-only">Sort products</label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="appearance-none pr-9 pl-4 py-2 rounded-lg border border-sand bg-cream text-bark text-sm font-satoshi font-semibold cursor-pointer focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-400/30 transition-all min-h-[44px]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-earth text-[10px] pointer-events-none">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section className="max-w-content mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-16 md:pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <HoneycombLoader size="lg" />
          </div>
        ) : totalCount > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${categoryId ?? 'all'}-${sort}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: transitioning ? 0 : 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
              className="flex flex-col gap-14"
            >
              {filtered.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p, idx) => {
                const hovered = hoveredId === p.id;
                const added = addedId === p.id;
                const v0 = p.variants?.[0];
                const sp = v0 ? p.price + v0.priceAdjust : p.price;
                const mrp = v0 && (v0 as any).compareAtPriceAdjust != null
                  ? (p.compareAtPrice ?? 0) + (v0 as any).compareAtPriceAdjust
                  : p.compareAtPrice;
                const src = resolveProductImage(dbImages, p.id, p.images?.[0]?.url);
                return (
                  <motion.div
                    key={p.id}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: reduce ? 0 : Math.min(idx * 0.04, 0.28),
                      ease: HONEY_EASE_OUT,
                    }}
                  >
                    <Link
                      href={`/product/${p.slug}`}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="block group"
                    >
                      <div
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-cream-warm border border-sand mb-3 transition-all duration-500 ease-out ${
                          hovered ? 'shadow-honey scale-[1.02]' : ''
                        }`}
                      >
                        {p.compareAtPrice && (
                          <span className="absolute top-2.5 right-2.5 z-10 bg-terracotta text-terracotta-light font-satoshi text-[10px] font-bold px-2 py-0.5 rounded">
                            SALE
                          </span>
                        )}
                        {src ? (
                          <Image
                            src={src}
                            alt={p.images?.[0]?.altText || p.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-earth-light">
                            <Package size={40} strokeWidth={1.25} aria-hidden />
                          </div>
                        )}
                        {/* Quick Add */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, p)}
                          aria-label={added ? `${p.name} added` : `Quick add ${p.name} to cart`}
                          className={`absolute inset-x-0 bottom-0 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi text-xs font-bold py-3 flex items-center justify-center gap-2 transition-transform duration-300 ease-out min-h-[44px] ${
                            hovered ? 'translate-y-0' : 'translate-y-full'
                          }`}
                        >
                          {added ? (
                            <>
                              <Check size={13} aria-hidden />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} aria-hidden />
                              <span>Quick Add</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-satoshi text-[10px] uppercase tracking-[0.14em] text-earth-light mb-1">
                        {p.category?.name ?? ''}
                      </p>
                      <h3 className="font-satoshi text-[15px] font-semibold text-charcoal mb-1.5 group-hover:text-honey-600 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {mrp && mrp > sp && (
                          <span className="font-satoshi text-xs text-earth-light line-through">
                            {formatPrice(mrp)}
                          </span>
                        )}
                        <span className="font-clash font-medium text-honey-500 text-base">
                          {formatPrice(sp)}
                          {p.variants && p.variants.length > 1 && (
                            <span className="font-satoshi text-earth text-[11px] font-normal ml-0.5">
                              onwards
                            </span>
                          )}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
                </div>
              )}

              {visibleCombos.length > 0 && (
                <div>
                  {filtered.length > 0 && (
                    <div className="mb-8">
                      <h2 className="font-clash font-extrabold text-charcoal text-2xl md:text-3xl m-0 mb-1">Curated Bundles & Combos</h2>
                      <p className="font-bespoke italic text-earth text-sm md:text-base m-0">
                        Duo, Trio, Quartet & 5-Pack — save more when you bundle
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-6">
                    {visibleCombos.map((combo, idx) => (
                      <motion.div
                        key={combo.id}
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: reduce ? 0 : Math.min(idx * 0.05, 0.3),
                          ease: HONEY_EASE_OUT,
                        }}
                      >
                        <ComboCard combo={combo} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-cream-warm flex items-center justify-center text-earth-light">
              <Package size={40} strokeWidth={1.25} aria-hidden />
            </div>
            <h3 className="font-clash font-bold text-charcoal text-2xl m-0">No products found</h3>
            <p className="font-satoshi text-earth text-sm m-0">
              Try a different category or clear your filters.
            </p>
            <button
              onClick={() => changeCategory(null)}
              className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold text-sm px-6 py-2.5 rounded-full transition-colors min-h-[44px]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
