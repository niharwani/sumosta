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
  const [subTab, setSubTab]     = useState<'single' | 'trial'>('single');

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
    if (!data) {
      setAllProducts([]);
      return;
    }
    setAllProducts((prev) => (page === 1 ? data.products : [...prev, ...data.products]));
  }, [data, page]);

  useEffect(() => {
    setCategory(initialCategory ?? '');
  }, [initialCategory]);

  useEffect(() => {
    if (category !== 'raw-honey') {
      setSubTab('single');
    }
  }, [category]);

  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  const filteredProducts = allProducts.filter((p) => {
    if (category === 'raw-honey') {
      if (subTab === 'single') return p.id !== 'prod_trial_box_60g';
      if (subTab === 'trial')  return p.id === 'prod_trial_box_60g';
    }
    return true;
  });

  const hasMore = data ? page < data.totalPages : false;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E5E7EB]">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'px-4 py-1.5 rounded-full font-jakarta text-sm transition-colors border',
              !category
                ? 'bg-[#F97316] text-white border-[#F97316]'
                : 'border-[#E5E7EB] text-gray-700 hover:border-[#F97316]/50',
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'px-4 py-1.5 rounded-full font-jakarta text-sm transition-colors border',
                category === cat.slug
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'border-[#E5E7EB] text-gray-700 hover:border-[#F97316]/50',
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
          className="font-jakarta text-sm text-charcoal border border-[#E5E7EB] rounded-full px-4 py-1.5 bg-white focus:outline-none focus:border-[#F97316] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Sub-tabs under Raw Honey */}
      {category === 'raw-honey' && (
        <div className="flex gap-6 mb-8 border-b border-[#E5E7EB] pb-3 -mt-4">
          <button
            onClick={() => setSubTab('single')}
            className={cn(
              "font-jakarta text-sm pb-1.5 border-b-2 transition-all font-medium",
              subTab === 'single' ? "border-[#F97316] text-charcoal font-semibold" : "border-transparent text-gray-600 hover:text-charcoal"
            )}
          >
            Single Origin Jars
          </button>
          <button
            onClick={() => setSubTab('trial')}
            className={cn(
              "font-jakarta text-sm pb-1.5 border-b-2 transition-all font-medium",
              subTab === 'trial' ? "border-[#F97316] text-charcoal font-semibold" : "border-transparent text-gray-600 hover:text-charcoal"
            )}
          >
            5 Elements Trial Box
          </button>
        </div>
      )}

      {/* Grid */}
      {isFetching && filteredProducts.length === 0 ? (
        <div className="flex justify-center py-20">
          <HoneycombLoader size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <span className="text-6xl">🫙</span>
          <p className="font-jakarta font-bold text-charcoal text-2xl">No products found</p>
          <button
            onClick={() => { setCategory(''); setSort('featured'); }}
            className="font-jakarta text-[#F97316] text-sm underline hover:text-[#EA580C]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${sort}-${subTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
            >
              {filteredProducts.map((product, i) => (
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
                className="flex items-center gap-3 btn-pill-white disabled:opacity-60"
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
