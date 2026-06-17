'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from 'shared';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id, null, 1, product);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      className={cn('group relative', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-warm mb-3">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">🍯</span>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-terracotta text-white text-xs font-satoshi font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-cream/70 flex items-center justify-center">
              <span className="font-satoshi text-earth text-sm font-medium">Out of Stock</span>
            </div>
          )}

          {/* Quick add overlay */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-satoshi text-sm font-semibold transition-colors',
                added
                  ? 'bg-sage text-white'
                  : 'bg-honey-400 text-midnight hover:bg-honey-500',
              )}
            >
              <ShoppingBag size={14} />
              {added ? 'Added ✓' : 'Quick Add'}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div>
          <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-satoshi text-charcoal font-medium text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="text-honey-400 fill-honey-400" />
              <span className="font-satoshi text-earth text-xs">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-satoshi text-honey-500 font-semibold text-sm">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="font-satoshi text-earth-light text-xs line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
