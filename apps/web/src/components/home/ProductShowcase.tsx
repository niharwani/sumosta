'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { STATIC_PRODUCTS } from '@/lib/content';

export default function ProductShowcase() {
  const products = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon);
  const featured = products[0];
  const rest     = products.slice(1, 5);

  return (
    <section className="py-20 md:py-28 bg-[#FDF6EC]" id="collection">
      <div className="max-w-content mx-auto px-6 md:px-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12 md:mb-16">
          <div>
            <span className="block font-jakarta text-[11px] uppercase tracking-[0.2em] text-earth mb-3">
              The Collection
            </span>
            <h2 className="font-clash font-bold text-charcoal text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] tracking-tight">
              Our Natural Honey
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden md:inline-flex items-center gap-2 font-jakarta text-[13px] tracking-wide text-earth hover:text-charcoal transition-colors"
          >
            View all products
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Editorial grid:
            Desktop: 1 featured (2 cols) on left + 2×2 grid on right
            Mobile:  single column stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">

          {/* Featured card — spans 1 extra row on large screens */}
          {featured && (
            <div className="md:col-span-1 lg:col-span-1 lg:row-span-2">
              <ProductCard product={featured} featured index={0} className="h-full" />
            </div>
          )}

          {/* Standard cards */}
          {rest.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i + 1} />
          ))}
        </div>

        {/* Mobile "view all" */}
        <div className="mt-10 flex md:hidden justify-center">
          <Link href="/shop" className="btn-outline inline-flex items-center gap-2">
            View all products
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
