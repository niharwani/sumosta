'use client';
import { useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from 'shared';

interface ProductShowcaseProps {
  products: Product[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    dragFree: true,
  });

  return (
    <section className="py-20 lg:py-32 bg-cream overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <RevealOnScroll variant="fadeUp">
              <h2 className="font-clash text-charcoal font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                The Collection
              </h2>
            </RevealOnScroll>
            <RevealOnScroll variant="fadeUp" delay={0.1}>
              <p className="font-bespoke italic text-earth text-lg mt-1">Taste the terroir</p>
            </RevealOnScroll>
          </div>

          <div className="hidden md:flex gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-bark hover:border-honey-400 hover:text-honey-400 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-bark hover:border-honey-400 hover:text-honey-400 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden pl-6 md:pl-8 lg:pl-12">
        <div className="flex gap-5">
          {products.map((product, i) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[320px]">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
