'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Package, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from 'shared';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
  /** If true, shows a larger, more prominent "featured" treatment */
  featured?: boolean;
}

export default function ProductCard({ product, index = 0, className, featured = false }: ProductCardProps) {
  const isOutOfStock  = product.stock === 0;
  const primaryImage  = product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url;
  const addItem       = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const lowestVariant   = product.variants?.length ? product.variants[0] : null;
  const displayPrice    = lowestVariant ? product.price + lowestVariant.priceAdjust : product.price;
  const displayMrp      = lowestVariant && (lowestVariant as any).compareAtPriceAdjust != null
    ? (product.compareAtPrice ?? 0) + (lowestVariant as any).compareAtPriceAdjust
    : product.compareAtPrice;
  const hasDiscount     = displayMrp != null && displayMrp > displayPrice;
  const discountPct     = hasDiscount
    ? Math.round(100 - (displayPrice / displayMrp!) * 100)
    : null;
  const hasMultipleSizes = (product.variants && product.variants.length > 1) ?? false;

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock || added) return;
      addItem(
        product.id,
        lowestVariant?.id ?? null,
        1,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images ?? [],
          stock: product.stock,
        },
        lowestVariant,
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    },
    [addItem, added, isOutOfStock, lowestVariant, product],
  );

  return (
    <div className={`group flex flex-col h-full ${className ?? ''}`}>
      <Link href={`/product/${product.slug}`} className="flex flex-col h-full">

        {/* Image container */}
        <div
          className={`relative overflow-hidden rounded-xl bg-cream-warm ${
            featured ? 'aspect-[4/5]' : 'aspect-[3/4]'
          }`}
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes={
                featured
                  ? '(max-width: 768px) 100vw, 50vw'
                  : '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
              }
              className="object-contain p-6 transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-earth-light select-none">
              <Package size={48} strokeWidth={1.25} aria-hidden />
            </div>
          )}

          {/* Discount badge */}
          {discountPct && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-charcoal text-cream font-satoshi text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded">
              -{discountPct}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-cream/75 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="font-satoshi text-earth text-xs uppercase tracking-[0.14em]">
                Out of Stock
              </span>
            </div>
          )}

          {/* Hover: Quick Add slide-up */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={added ? `${product.name} added` : `Quick add ${product.name} to cart`}
                className="w-full bg-honey-500 hover:bg-honey-600 text-cream py-3 px-4 flex items-center justify-center gap-2 min-h-[44px] transition-colors"
              >
                {added ? (
                  <>
                    <Check size={14} aria-hidden />
                    <span className="font-satoshi text-[12px] font-semibold tracking-[0.06em]">
                      Added
                    </span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} aria-hidden />
                    <span className="font-satoshi text-[12px] font-semibold tracking-[0.06em]">
                      Quick Add
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Card body — left-aligned */}
        <div className="mt-4 flex flex-col gap-1 px-0.5 flex-1">

          {/* Category tag */}
          {product.category?.name && (
            <span className="font-satoshi text-[10px] uppercase tracking-[0.14em] text-earth-light">
              {product.category.name}
            </span>
          )}

          {/* Name */}
          <h3 className={`font-satoshi font-semibold text-charcoal group-hover:text-honey-600 transition-colors line-clamp-2 ${
            featured ? 'text-lg md:text-xl' : 'text-[15px]'
          }`}>
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {hasDiscount && (
              <span className="font-satoshi text-earth-light text-xs line-through">
                {formatPrice(displayMrp!)}
              </span>
            )}
            <span className="font-clash font-medium text-honey-500 text-base">
              {formatPrice(displayPrice)}
              {hasMultipleSizes && (
                <span className="font-satoshi text-earth text-[11px] font-normal ml-0.5">onwards</span>
              )}
            </span>
          </div>

        </div>
      </Link>
    </div>
  );
}
