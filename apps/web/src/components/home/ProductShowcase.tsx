'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import ProductCard from '@/components/product/ProductCard';
import { STATIC_PRODUCTS } from '@/lib/content';

export default function ProductShowcase() {
  // Use static products that are active (current products, not coming soon)
  const products = STATIC_PRODUCTS.filter((p) => p.isActive && !p.comingSoon);

  return (
    <section className="py-20 lg:py-32 bg-cream overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <h2 className="font-clash text-charcoal font-bold text-center" style={{ fontSize: 'clamp(2.3rem, 4vw, 3.5rem)' }}>
              The Collection
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <p className="font-bespoke italic text-earth text-lg mt-1 text-center">Taste the terroir</p>
          </RevealOnScroll>
        </div>

        {/* Centered 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10 justify-center">
          {products.map((product, i) => (
            <div key={product.id} className="w-full shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
