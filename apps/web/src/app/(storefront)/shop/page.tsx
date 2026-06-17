'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const sort = searchParams.get('sort') ?? 'featured';
  const search = searchParams.get('search') ?? undefined;

  return (
    <div className="min-h-screen bg-cream pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">The Collection</h1>
          <p className="font-satoshi text-earth text-sm">
            {category ? `Filtered by: ${category.replace('-', ' ')}` : 'All Products'}
          </p>
        </div>
        <ProductGrid initialCategory={category} initialSort={sort} initialSearch={search} />
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
