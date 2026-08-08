'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Instagram } from 'lucide-react';

import HeroSection from '@/components/home/HeroSection';
import MarqueeBanner from '@/components/home/MarqueeBanner';
import ProductShowcase from '@/components/home/ProductShowcase';
import BrandStoryStrip from '@/components/home/BrandStoryStrip';
import CategoryGrid from '@/components/home/CategoryGrid';
import HoneyProcess from '@/components/home/HoneyProcess';
import TestimonialCarousel from '@/components/home/TestimonialCarousel';
import NewsletterSection from '@/components/home/NewsletterSection';
import GoldenDivider from '@/components/shared/GoldenDivider';
import { HONEY_EASE_OUT } from '@/lib/animations';

const SOCIAL_IMAGES = [
  { src: '/images/home/story-raw-honey.jpg',    alt: 'Raw honey being poured from a wooden dipper' },
  { src: '/images/home/sourced-wild.jpg',       alt: 'Wild forest sourcing landscape' },
  { src: '/images/home/harvested-with-care.jpg', alt: 'Traditional beekeeper harvesting honeycomb' },
  { src: '/images/home/story-beekeeper.jpg',    alt: 'Beekeeper family in the forest' },
  { src: '/images/home/story-bees-flower.jpg',  alt: 'Bee foraging on a wildflower' },
  { src: '/images/home/sealed-for-you.jpg',     alt: 'Glass jars sealed and labelled' },
];

export default function HomeContent() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* 1. HERO */}
      <HeroSection />

      {/* 2. MARQUEE */}
      <MarqueeBanner />

      {/* 3. FEATURED PRODUCTS */}
      <ProductShowcase />

      <GoldenDivider />

      {/* 4. BRAND STORY STRIP */}
      <BrandStoryStrip />

      {/* 5. CATEGORY GRID */}
      <CategoryGrid />

      {/* 6. PROCESS — signature horizontal scroll */}
      <HoneyProcess />

      {/* 7. TESTIMONIALS */}
      <TestimonialCarousel />

      <GoldenDivider />

      {/* 8. INSTAGRAM / SOCIAL PROOF */}
      <section className="py-20 md:py-24 bg-cream">
        <div className="max-w-content mx-auto px-6 md:px-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: HONEY_EASE_OUT }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14"
          >
            <div>
              <h2
                className="font-clash font-bold text-charcoal tracking-[-0.01em]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}
              >
                Follow the Hive
              </h2>
              <p className="font-bespoke italic text-earth mt-2 text-lg">
                Scenes from the forest, moments in the kitchen
              </p>
            </div>
            <a
              href="https://instagram.com/sumosta"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-satoshi text-sm font-medium text-charcoal hover:text-honey-600 transition-colors self-start md:self-auto"
            >
              <Instagram size={16} />
              @sumosta
            </a>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {SOCIAL_IMAGES.map((img, i) => (
              <motion.a
                key={img.src}
                href="https://instagram.com/sumosta"
                target="_blank"
                rel="noopener noreferrer"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: reduce ? 0 : Math.min(i * 0.05, 0.3),
                  ease: HONEY_EASE_OUT,
                }}
                className="group relative aspect-square overflow-hidden rounded-lg bg-cream-warm"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-honey-500/0 group-hover:bg-honey-500/60 transition-colors duration-300 flex items-center justify-center">
                  <Instagram
                    size={26}
                    className="text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER */}
      <NewsletterSection />

      {/* Footer is rendered by the storefront layout — do not duplicate here. */}
    </>
  );
}
