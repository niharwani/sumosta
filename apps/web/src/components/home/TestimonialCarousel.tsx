'use client';
import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { HONEY_EASE_OUT } from '@/lib/animations';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Bengaluru',
    rating: 5,
    text: 'The Western Ghats honey is unlike anything I\'ve ever tasted. Dark, complex, and absolutely pure. I\'ve tried many "raw" honeys but SUMOSTA is the real deal.',
  },
  {
    name: 'Rohan Mehta',
    location: 'Mumbai',
    rating: 5,
    text: 'Got a gift box for my parents and they loved every variety. The packaging is premium and the quality speaks for itself. Already reordering.',
  },
  {
    name: 'Ananya Krishnan',
    location: 'Chennai',
    rating: 5,
    text: 'A spoonful of the raw honey stirred into warm water — this is my morning ritual now. Most soothing thing. On my third jar.',
  },
  {
    name: 'Dev Patel',
    location: 'Hyderabad',
    rating: 5,
    text: 'Ordered for office use. Super convenient, quality is so much better than anything on the supermarket shelf.',
  },
  {
    name: 'Meera Nair',
    location: 'Kochi',
    rating: 5,
    text: 'Finally a honey brand that takes sourcing seriously. Each batch has an apiary location. Depth of flavour I didn\'t know honey could have.',
  },
];

export default function TestimonialCarousel() {
  const reduce = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi || paused || reduce) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi, paused, reduce]);

  return (
    <section className="py-20 lg:py-28 bg-cream-warm overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 mb-10 md:mb-12 text-center">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: HONEY_EASE_OUT }}
          className="font-clash font-bold text-charcoal tracking-[-0.01em]"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}
        >
          What Our Customers Say
        </motion.h2>
      </div>

      <div
        ref={emblaRef}
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex gap-5 md:gap-6 px-6 md:px-12">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="shrink-0 bg-cream rounded-xl p-8 md:p-10 shadow-md flex flex-col"
              style={{ minWidth: '300px', width: 'clamp(300px, 40vw, 460px)' }}
            >
              <span
                aria-hidden
                className="font-bespoke italic text-honey-200 leading-none block mb-4"
                style={{ fontSize: '4rem' }}
              >
                &ldquo;
              </span>
              <p className="font-satoshi text-bark text-base leading-relaxed mb-6 flex-1">
                {t.text}
              </p>
              <div className="flex items-center gap-1 mb-3" aria-label={`${t.rating} out of 5 stars`}>
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
