'use client';
import { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star } from 'lucide-react';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Bengaluru', rating: 5, text: 'The Western Ghats honey is unlike anything I\'ve ever tasted. Dark, complex, and absolutely pure. I\'ve tried many "raw" honeys but SUMOSTA is the real deal.' },
  { name: 'Rohan Mehta', location: 'Mumbai', rating: 5, text: 'Got the Connoisseur gift box for my parents and they loved every single variety. The honeycomb especially blew them away. Premium quality, beautiful packaging.' },
  { name: 'Ananya Krishnan', location: 'Chennai', rating: 5, text: 'The Turmeric Golden Honey spread is my morning ritual now. Stirred into warm milk, it\'s the most soothing thing. Reordering my 3rd jar.' },
  { name: 'Dev Patel', location: 'Hyderabad', rating: 5, text: 'Ordered the honey sticks for office use. Super convenient, and the quality is so much better than anything at the supermarket. The assorted pack is great.' },
  { name: 'Meera Nair', location: 'Kochi', rating: 5, text: 'Finally a honey brand that takes sourcing seriously. I love that each batch has an apiary location. The Wild Forest honey has a depth of flavour I didn\'t know honey could have.' },
];

export default function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section className="py-20 lg:py-32 bg-cream-warm overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 mb-10">
        <RevealOnScroll variant="fadeUp">
          <h2 className="font-clash text-charcoal font-bold text-center" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            What Our Customers Say
          </h2>
        </RevealOnScroll>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-5 pl-6 md:pl-12">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="min-w-[320px] md:min-w-[420px] bg-cream rounded-xl p-8 shadow-md shrink-0"
            >
              <span className="font-bespoke text-honey-200 text-5xl leading-none block mb-4">&ldquo;</span>
              <p className="font-satoshi text-bark text-base leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-honey-400 fill-honey-400" />
                ))}
              </div>
              <p className="font-satoshi text-charcoal font-semibold text-sm">{t.name}</p>
              <p className="font-satoshi text-earth-light text-xs">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
