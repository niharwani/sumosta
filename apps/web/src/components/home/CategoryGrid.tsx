'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

const CATEGORIES = [
  { slug: 'honey-sticks',  label: 'Honey Sticks',  image: '/images/products/honey-sticks-classic.jpg',  span: 'lg:row-span-2' },
  { slug: 'raw-honey',     label: 'Raw Honey',      image: '/images/products/western-ghats-honey.jpg',  span: '' },
  { slug: 'honey-spreads', label: 'Honey Spreads',  image: '/images/products/cinnamon-honey-spread.jpg', span: '' },
  { slug: 'gift-boxes',    label: 'Gift Boxes',     image: '/images/products/essentials-gift-box.jpg',  span: 'lg:col-span-2' },
];

export default function CategoryGrid() {
  return (
    <section className="py-20 lg:py-32 bg-cream">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <RevealOnScroll variant="fadeUp">
          <h2 className="font-clash text-charcoal font-bold text-center mb-12" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Explore by Type
          </h2>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:grid-rows-2">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              className={cat.span}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/shop/${cat.slug}`}
                data-cursor-text="SHOP"
                className="group relative block rounded-xl overflow-hidden"
                style={{ minHeight: cat.span.includes('row-span-2') ? '480px' : '220px' }}
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent transition-opacity duration-300 group-hover:from-midnight/50" />

                {/* Golden border on hover */}
                <div className="absolute inset-0 rounded-xl ring-0 ring-honey-300 transition-all duration-300 group-hover:ring-2" />

                {/* Text */}
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="font-clash text-white font-semibold text-xl transition-transform duration-300 group-hover:-translate-y-1">
                    {cat.label}
                  </h3>
                  <p className="font-satoshi text-honey-300 text-sm mt-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Shop →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
