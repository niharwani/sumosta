'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

function ShopContent() {
  const params = useParams<{ slug?: string[] }>();
  const category = params.slug?.[0] ?? '';

  // Get human-readable title and subtitle depending on the category slug
  let title = 'The Collection';
  let subtitle = 'All Products';

  if (category === 'raw-honey') {
    title = 'Raw Forest Honeys';
    subtitle = '100% raw, unpasteurized forest honeys sourced from protected reserves across India.';
  } else if (category === 'honey-sticks') {
    title = 'Honey Sticks & Infusions';
    subtitle = 'Active raw honey whipped with bio-active superfoods for wellness on the go.';
  } else if (category === 'honey-spreads') {
    title = 'Nuts & Seeds Spreads';
    subtitle = 'Creamy spreads naturally sweetened with raw honey & jaggery, with zero palm oil.';
  } else if (category === 'gift-boxes') {
    title = 'Gifting & Combo Sets';
    subtitle = 'Curated combinations of our finest forest honeys in beautiful premium gift settings.';
  }

  return (
    <div className="min-h-screen bg-cream pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">{title}</h1>
          <p className="font-satoshi text-earth text-sm max-w-2xl">{subtitle}</p>
        </div>
        <ProductGrid initialCategory={category || undefined} />
      </div>
    </div>
  );
}

export default function ShopPageContent() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
