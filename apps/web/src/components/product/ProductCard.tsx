'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from 'shared';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      className={cn('group relative flex flex-col', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/product/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Image Box */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FCFAF6] border border-sand/70 p-6 flex items-center justify-center group-hover:border-honey-300 group-hover:shadow-honey transition-all duration-300">
          
          {/* Sourcing/Tag Overlay */}
          <span className="absolute top-3 left-3 bg-honey-400/90 text-midnight text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest select-none shadow-sm">
            100% Pure
          </span>

          {/* Weight Badge Overlay */}
          <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-sand/40 text-[9px] text-bark px-2.5 py-0.5 rounded-md uppercase font-bold tracking-wider select-none shadow-sm">
            {product.weight ? `${product.weight}g` : 'Glass Jar'}
          </span>

          {/* Product Image */}
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
              alt={product.name}
              className="max-h-full max-w-full object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <span className="text-6xl select-none transition-transform duration-300 group-hover:scale-110">
              🍯
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-cream/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="font-satoshi text-bark text-xs font-bold uppercase tracking-wider bg-white border border-sand/80 px-3 py-1 rounded-md shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 flex-1 flex flex-col">
          <p className="font-satoshi text-honey-600 text-[10px] uppercase tracking-[0.15em] font-semibold mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-clash text-charcoal font-bold text-sm md:text-base line-clamp-2 leading-snug group-hover:text-honey-600 transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
