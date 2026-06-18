'use client';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import ProductCard from '@/components/product/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function ProductShowcase() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    dragFree: true,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/products?sort=featured&limit=8`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.products ?? json.products ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-20 lg:py-32 bg-cream overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
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

      {/* Skeleton loading */}
      {isLoading && (
        <div className="flex gap-5 pl-6 md:pl-8 lg:pl-12 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px] shrink-0">
              <div className="aspect-[3/4] rounded-lg skeleton mb-3" />
              <div className="h-3 skeleton rounded mb-2 w-3/4" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Carousel */}
      {!isLoading && products.length > 0 && (
        <div ref={emblaRef} className="overflow-hidden pl-6 md:pl-8 lg:pl-12">
          <div className="flex gap-5">
            {products.map((product: any, i: number) => (
              <div key={product.id} className="min-w-[280px] md:min-w-[320px] shrink-0">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — shown when API has no products yet */}
      {!isLoading && products.length === 0 && (
        <div className="pl-6 md:pl-8 lg:pl-12 pr-6">
          <div className="flex gap-5 overflow-hidden">
            {['Western Ghats Raw Honey', 'Himalayan Wild Honey', 'Honey Sticks Pack', 'Cinnamon Honey Spread'].map((name, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] shrink-0">
                <div
                  className="aspect-[3/4] rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, #FFF0D6 0%, #FFE0A8 50%, #FFCC66 100%)` }}
                >
                  <span className="font-clash font-bold text-honey-600/30 text-6xl select-none">
                    {['🍯', '🌿', '🍬', '✨'][i]}
                  </span>
                </div>
                <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider mb-1">Raw Honey</p>
                <h3 className="font-satoshi text-charcoal font-medium text-sm mb-1">{name}</h3>
                <span className="font-satoshi text-honey-500 font-semibold text-sm">from ₹499</span>
              </div>
            ))}
          </div>
          <p className="font-satoshi text-earth-light text-xs mt-4">
            Products load from the live API — seed the database to see real products here.
          </p>
        </div>
      )}
    </section>
  );
}
