'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { STATIC_PRODUCTS } from '@/lib/content';
import { formatPrice } from '@/lib/utils';
import { HONEY_EASE_OUT } from '@/lib/animations';

export default function ProductShowcase() {
  const reduce = useReducedMotion();
  const products = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon).slice(0, 8);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    loop: false,
    slidesToScroll: 1,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="py-20 md:py-28 bg-cream" id="collection">
      <div className="max-w-content mx-auto px-6 md:px-10 mb-10 md:mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2
              className="font-clash font-bold text-charcoal tracking-[-0.01em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}
            >
              The Collection
            </h2>
            <p className="font-bespoke italic text-earth text-lg md:text-xl mt-2">
              Taste the terroir
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canPrev}
              aria-label="Scroll to previous products"
              className="w-11 h-11 rounded-full border border-sand bg-cream flex items-center justify-center text-charcoal hover:border-honey-400 hover:bg-honey-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canNext}
              aria-label="Scroll to more products"
              className="w-11 h-11 rounded-full border border-sand bg-cream flex items-center justify-center text-charcoal hover:border-honey-400 hover:bg-honey-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight size={16} />
            </button>
            <Link
              href="/shop"
              className="ml-2 font-satoshi text-sm font-medium text-earth hover:text-charcoal inline-flex items-center gap-1.5"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Embla viewport */}
      <div
        ref={emblaRef}
        className="overflow-hidden"
        style={{
          paddingLeft: 'max(24px, calc((100vw - 1400px) / 2 + 40px))',
          paddingRight: 'max(24px, calc((100vw - 1400px) / 2 + 40px))',
        }}
      >
        <div className="flex gap-5 md:gap-6">
          {products.map((product, i) => {
            const primaryImage =
              product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url ?? null;
            const lowestVariant = product.variants?.length ? product.variants[0] : null;
            const displayPrice = lowestVariant
              ? product.price + lowestVariant.priceAdjust
              : product.price;
            const displayMrp =
              lowestVariant && lowestVariant.compareAtPriceAdjust != null
                ? (product.compareAtPrice ?? 0) + lowestVariant.compareAtPriceAdjust
                : product.compareAtPrice;
            const hasDiscount = displayMrp != null && displayMrp > displayPrice;

            return (
              <motion.div
                key={product.id}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : Math.min(i * 0.06, 0.36),
                  ease: HONEY_EASE_OUT,
                }}
                className="shrink-0"
                style={{ flex: '0 0 auto', width: 'clamp(240px, 28vw, 340px)' }}
              >
                <div className="group flex flex-col h-full">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative block overflow-hidden rounded-xl bg-cream-warm border border-sand/60"
                    style={{ aspectRatio: '3 / 4' }}
                  >
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.images?.[0]?.altText || product.name}
                        fill
                        sizes="(max-width: 768px) 70vw, 340px"
                        className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center font-satoshi text-earth-light text-xs uppercase tracking-widest">
                        {product.name}
                      </div>
                    )}

                    {/* Quick Add slide-up */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="bg-charcoal/95 backdrop-blur-sm py-3 px-4 flex items-center justify-center gap-2">
                        <Plus size={14} className="text-cream" />
                        <span className="font-satoshi text-cream text-[12px] font-medium tracking-wider uppercase">
                          Quick Add
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="mt-4 flex flex-col gap-1">
                    {product.category?.name && (
                      <span className="font-satoshi text-[10px] uppercase tracking-[0.16em] text-earth-light">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="font-satoshi font-semibold text-charcoal text-[15px] leading-snug line-clamp-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="hover:text-honey-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {hasDiscount && (
                        <span className="font-satoshi text-earth-light text-xs line-through">
                          {formatPrice(displayMrp!)}
                        </span>
                      )}
                      <span className="font-clash font-medium text-honey-500 text-base">
                        {formatPrice(displayPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
