'use client';
import { Suspense, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { staggerContainer } from '@/lib/animations';
import { useDebounce } from '@/hooks/useDebounce';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 300);
  const searchId = useId();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { data: { products: [], total: 0 } };
      const res = await fetch(
        `${API}/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=24`,
      );
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  const products = data?.data?.products ?? [];
  const hasQuery = debouncedQuery.trim().length > 0;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set('q', query);
    else params.delete('q');
    router.replace(`/search?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 bg-cream">
      <div className="max-w-xl mx-auto mb-12">
        <label htmlFor={searchId} className="sr-only">Search products</label>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-light pointer-events-none"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for honey, sticks, spreads..."
            autoFocus
            className="w-full border border-sand rounded-full pl-12 pr-12 py-4 font-satoshi text-charcoal text-base bg-cream focus:outline-none focus:border-honey-400 focus-visible:ring-2 focus-visible:ring-honey-400 transition-colors shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-light hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!hasQuery ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="font-satoshi text-bark text-lg">
              Start typing to search our collection
            </p>
          </motion.div>
        ) : isLoading || isFetching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-20"
          >
            <HoneycombLoader size="lg" />
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="font-clash font-bold text-charcoal text-2xl mb-3">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </p>
            <p className="font-satoshi text-bark">
              Try a different search term or browse our collection
            </p>
            <Link
              href="/shop"
              className="inline-block mt-6 font-satoshi font-semibold text-sm text-honey-600 hover:text-honey-500 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
            >
              Browse all products →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            role="region"
            aria-live="polite"
          >
            <p className="font-satoshi text-bark text-sm mb-6">
              {data?.data?.total ?? products.length} results for &ldquo;{debouncedQuery}&rdquo;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <HoneycombLoader size="lg" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
