'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '@/lib/api';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/constants';
import ProductCard from './ProductCard';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { cn } from '@/lib/utils';
import type { Product } from 'shared';

interface ProductGridProps {
  initialCategory?: string;
  initialSort?: string;
  initialSearch?: string;
}

export default function ProductGrid({ initialCategory, initialSort = 'featured', initialSearch }: ProductGridProps) {
  const [category, setCategory] = useState(initialCategory ?? '');
  const [sort, setSort]         = useState(initialSort);
  const [page, setPage]         = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: ['products', category, sort, page],
    queryFn:  () =>
      productsApi.list({
        category: category || undefined,
        sort,
        page,
        limit: 12,
      }),
  });

  useEffect(() => {
    if (!data) return;
    setAllProducts((prev) => (page === 1 ? data.products : [...prev, ...data.products]));
  }, [data, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [category, sort]);

  const hasMore = data ? page < data.totalPages : false;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-sand">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'px-4 py-1.5 rounded-full font-satoshi text-sm transition-colors border',
              !category
                ? 'bg-honey-400 text-midnight border-honey-400'
                : 'border-sand text-bark hover:border-honey-300',
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'px-4 py-1.5 rounded-full font-satoshi text-sm transition-colors border',
                category === cat.slug
                  ? 'bg-honey-400 text-midnight border-honey-400'
                  : 'border-sand text-bark hover:border-honey-300',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="font-satoshi text-sm text-bark border border-sand rounded-md px-3 py-1.5 bg-cream focus:outline-none focus:border-honey-400 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isFetching && page === 1 ? (
        <div className="flex justify-center py-20">
          <HoneycombLoader size="lg" />
        </div>
      ) : allProducts.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <span className="text-6xl">🫙</span>
          <p className="font-clash text-charcoal text-2xl">No products found</p>
          <button
            onClick={() => { setCategory(''); setSort('featured'); }}
            className="font-satoshi text-honey-500 text-sm underline hover:text-honey-600"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${sort}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
            >
              {allProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i % 12} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="flex items-center gap-3 font-satoshi text-bark border border-sand px-8 py-3 rounded-md hover:border-honey-400 transition-colors disabled:opacity-60"
              >
                {isFetching ? <HoneycombLoader size="sm" /> : null}
                {isFetching ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
