'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HONEY_EASE_OUT } from '@/lib/animations';

/**
 * Only render categories that actually filter real products on /shop.
 * See lib/api.ts `productsApi.list` — the valid filterable slugs are
 * `raw-honey` and `gift-boxes`. Anything else would land on an empty page.
 *
 * We render three cards from these two categories: the tall hero
 * (raw honey origins), a standard card (a second raw honey angle),
 * and a wide card (gift boxes).
 */
const CATEGORIES = [
  {
    slug: 'raw-honey',
    label: 'Raw Forest Honey',
    tagline: 'Single-origin wild jars from India\'s pristine reserves',
    image: '/images/brand/category-honey.png',
    span: 'sm:col-span-1 sm:row-span-2',
    minH: '480px',
    cta: 'Shop Raw Honey',
  },
  {
    slug: 'raw-honey',
    label: 'Explore All Origins',
    tagline: 'Western Ghats, Saranda, Abujhmarh, Kandhamal & more',
    image: '/images/home/story-wild-hives.jpg',
    span: '',
    minH: '230px',
    cta: 'Discover Terroirs',
  },
  {
    slug: 'gift-boxes',
    label: 'Gift Boxes & Combos',
    tagline: 'Curated collections for those who deserve nature\'s best',
    image: '/images/home/story-beekeeper.jpg',
    span: 'sm:col-span-2',
    minH: '230px',
    cta: 'Shop Gift Boxes',
  },
] as const;

export default function CategoryGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: HONEY_EASE_OUT }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className="font-clash font-bold text-charcoal tracking-[-0.01em]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}
          >
            Explore by Type
          </h2>
          <p className="font-bespoke italic text-earth mt-2 text-lg">
            Two categories, one obsession — purity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 sm:grid-rows-2">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={`${cat.slug}-${i}`}
              className={cat.span}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: reduce ? 0 : i * 0.08,
                ease: HONEY_EASE_OUT,
              }}
            >
              <Link
                href={`/shop/${cat.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl p-6 md:p-8 h-full"
                style={{ minHeight: cat.minH }}
              >
                {/* Full-bleed image */}
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                />

                {/* Bottom gradient overlay (dark, ~40% height) */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-midnight/85 via-midnight/50 to-transparent" />
                {/* Slight lift on hover */}
                <div className="absolute inset-0 bg-honey-400/0 group-hover:bg-honey-400/10 transition-colors duration-500" />
                {/* Golden ring on hover */}
                <div className="absolute inset-0 rounded-xl ring-0 ring-honey-400/0 group-hover:ring-1 group-hover:ring-honey-400/60 transition-all duration-300" />

                {/* Label */}
                <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-clash font-bold text-cream text-2xl md:text-3xl leading-tight mb-1">
                    {cat.label}
                  </h3>
                  <p className="font-satoshi text-cream/85 text-sm mb-3 max-w-md">
                    {cat.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-satoshi text-sm text-honey-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.cta}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
