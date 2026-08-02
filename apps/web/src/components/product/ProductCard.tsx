'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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

  const lowestVariant   = product.variants?.length ? product.variants[0] : null;
  const displayPrice    = lowestVariant ? product.price + lowestVariant.priceAdjust : product.price;
  const displayMrp      = lowestVariant && (lowestVariant as any).compareAtPriceAdjust != null
    ? (product.compareAtPrice ?? 0) + (lowestVariant as any).compareAtPriceAdjust
    : product.compareAtPrice;
  const hasDiscount     = displayMrp != null && displayMrp > displayPrice;
  const discountPct     = hasDiscount
    ? Math.round(100 - (displayPrice / displayMrp!) * 100)
    : null;
  const hasMultipleSizes = product.variants && product.variants.length > 1;

  return (
    <div className={`group flex flex-col h-full ${className ?? ''}`}>
      <Link href={`/product/${product.slug}`} className="flex flex-col h-full">

        {/* Image container */}
        <div
          className={`relative overflow-hidden rounded-xl bg-[#FDF6EC] ${
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
              className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-7xl select-none opacity-40">
              🍯
            </div>
          )}

          {/* Discount badge */}
          {discountPct && !isOutOfStock && (
            <div className="absolute top-3 left-3 bg-charcoal text-[#FFFDF8] font-jakarta text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded">
              -{discountPct}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#FFFDF8]/75 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="font-jakarta text-earth text-xs uppercase tracking-[0.14em]">
                Out of Stock
              </span>
            </div>
          )}

          {/* Hover: Add to Cart slide-up */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <div className="bg-charcoal/90 backdrop-blur-sm py-3 px-4 flex items-center justify-center gap-2">
                <ShoppingBag size={13} className="text-[#FFFDF8]" />
                <span className="font-jakarta text-[#FFFDF8] text-[12px] font-medium tracking-[0.08em]">
                  Add to Cart
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card body — left-aligned */}
        <div className="mt-4 flex flex-col gap-1 px-0.5 flex-1">

          {/* Category tag */}
          {product.category?.name && (
            <span className="font-jakarta text-[10px] uppercase tracking-[0.14em] text-earth-light">
              {product.category.name}
            </span>
          )}

          {/* Name */}
          <h3 className={`font-jakarta font-semibold text-charcoal group-hover:text-honey-600 transition-colors line-clamp-2 ${
            featured ? 'text-lg md:text-xl' : 'text-[15px]'
          }`}>
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {hasDiscount && (
              <span className="font-jakarta text-earth-light text-xs line-through">
                {formatPrice(displayMrp!)}
              </span>
            )}
            <span className="font-clash font-medium text-honey-500 text-base">
              {formatPrice(displayPrice)}
              {hasMultipleSizes && (
                <span className="font-jakarta text-earth text-[11px] font-normal ml-0.5">onwards</span>
              )}
            </span>
          </div>

        </div>
      </Link>
    </div>
  );
}
