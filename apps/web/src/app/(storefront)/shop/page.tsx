import type { Metadata } from 'next';
import ProductGrid from '@/components/product/ProductGrid';

export const metadata: Metadata = {
  title: 'Shop All Honey Products',
  description: 'Browse SUMOSTA\'s full collection of raw, single-origin honey products.',
};

export default function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; page?: string; search?: string };
}) {
  return (
    <div className="min-h-screen bg-cream pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">The Collection</h1>
          <p className="font-satoshi text-earth text-sm">
            {searchParams.category
              ? `Filtered by: ${searchParams.category.replace('-', ' ')}`
              : 'All Products'}
          </p>
        </div>

        <ProductGrid
          initialCategory={searchParams.category}
          initialSort={searchParams.sort ?? 'featured'}
          initialSearch={searchParams.search}
        />
      </div>
    </div>
  );
}
