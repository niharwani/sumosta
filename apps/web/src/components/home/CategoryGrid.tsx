'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

const CATEGORIES = [
  {
    slug:     'honey-sticks',
    label:    'Honey Sticks',
    sub:      'Individual & packs',
    bg:       'from-honey-400 via-honey-500 to-honey-600',
    textCol:  'text-midnight',
    subCol:   'text-midnight/60',
    arrowCol: 'text-midnight',
    span:     'lg:row-span-2',
    minH:     '480px',
    glyph: (
      <svg viewBox="0 0 60 160" className="w-12 h-36 opacity-[0.18]" fill="currentColor">
        <rect x="24" y="0"  width="12" height="160" rx="6" />
        <rect x="0"  y="60" width="60" height="40"  rx="20" fillOpacity="0.5" />
      </svg>
    ),
  },
  {
    slug:     'raw-honey',
    label:    'Raw Honey',
    sub:      'Single-origin jars',
    bg:       'from-charcoal to-midnight',
    textCol:  'text-honey-200',
    subCol:   'text-honey-400/70',
    arrowCol: 'text-honey-300',
    span:     '',
    minH:     '220px',
    glyph: (
      <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-[0.14]" fill="currentColor">
        <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" />
      </svg>
    ),
  },
  {
    slug:     'honey-spreads',
    label:    'Honey Spreads',
    sub:      'Cinnamon, vanilla & more',
    bg:       'from-honey-600 to-honey-700',
    textCol:  'text-honey-100',
    subCol:   'text-honey-200/70',
    arrowCol: 'text-honey-200',
    span:     '',
    minH:     '220px',
    glyph: (
      <svg viewBox="0 0 80 60" className="w-20 h-14 opacity-[0.18]" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M 8 50 Q 20 16 40 26 Q 58 36 70 8" />
        <path d="M 8 58 Q 28 34 50 44 Q 64 50 72 28" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    slug:     'gift-boxes',
    label:    'Gift Boxes',
    sub:      'Curated collections',
    bg:       'from-midnight via-bark/60 to-midnight',
    textCol:  'text-honey-300',
    subCol:   'text-honey-400/60',
    arrowCol: 'text-honey-300',
    span:     'lg:col-span-2',
    minH:     '220px',
    glyph: (
      <svg viewBox="0 0 120 80" className="w-28 h-20 opacity-[0.12]" fill="currentColor">
        <rect x="10" y="30" width="100" height="50" rx="4" />
        <rect x="10" y="18" width="100" height="14" rx="3" />
        <rect x="54" y="8"  width="12"  height="72" rx="6" />
        <ellipse cx="60" cy="12" rx="20" ry="10" />
      </svg>
    ),
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-20 lg:py-32 bg-cream">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <RevealOnScroll variant="fadeUp">
          <h2
            className="font-clash text-charcoal font-bold text-center mb-12"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
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
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/shop/${cat.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl p-6"
                style={{ minHeight: cat.minH, display: 'flex' }}
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg}`} />

                {/* Subtle brighten on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />

                {/* Decorative glyph */}
                <div className={`absolute top-5 right-5 ${cat.textCol} pointer-events-none select-none`}>
                  {cat.glyph}
                </div>

                {/* Hover ring */}
                <div className="absolute inset-0 rounded-xl ring-0 ring-honey-300/50 group-hover:ring-1 transition-all duration-300" />

                {/* Label block */}
                <div className="relative z-10">
                  <h3 className={`font-clash font-semibold text-xl mb-0.5 transition-transform duration-300 group-hover:-translate-y-1 ${cat.textCol}`}>
                    {cat.label}
                  </h3>
                  <p className={`font-satoshi text-xs mb-2 ${cat.subCol}`}>{cat.sub}</p>
                  <span className={`font-satoshi text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${cat.arrowCol}`}>
                    Shop →
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
