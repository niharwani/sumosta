'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

const CATEGORIES = [
  {
    slug:     'raw-honey',
    label:    'Raw Forest Honey',
    sub:      'Single-origin wild jars',
    bg:       'from-bark to-midnight',
    textCol:  'text-honey-200',
    subCol:   'text-honey-400/70',
    arrowCol: 'text-honey-300',
    span:     'lg:row-span-2',
    minH:     '480px',
    comingSoon: false,
  },
  {
    slug:     'superfoods',
    label:    'Proprietary Superfoods',
    sub:      'Moringa Green & Golden Latte infusions',
    bg:       'from-sage via-sage-light/20 to-midnight',
    textCol:  'text-sage-light',
    subCol:   'text-sage-light/75',
    arrowCol: 'text-honey-300',
    span:     '',
    minH:     '230px',
    comingSoon: true,
  },
  {
    slug:     'spreads',
    label:    'Nuts & Seeds Spreads',
    sub:      'Naturally honey sweetened, zero palm oil',
    bg:       'from-terracotta to-midnight',
    textCol:  'text-terracotta-light',
    subCol:   'text-terracotta-light/75',
    arrowCol: 'text-honey-200',
    span:     '',
    minH:     '230px',
    comingSoon: true,
  },
  {
    slug:     'honey-nuts',
    label:    'Honey Soaked Nuts',
    sub:      'Whole premium walnuts & almonds in raw honey',
    bg:       'from-honey-600 to-honey-700',
    textCol:  'text-honey-100',
    subCol:   'text-honey-200/70',
    arrowCol: 'text-honey-200',
    span:     'lg:col-span-2',
    minH:     '230px',
    comingSoon: true,
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
 
                {/* Category background image (raw-honey only) */}
                {cat.slug === 'raw-honey' && (
                  <img
                    src="/images/brand/category-honey.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
                  />
                )}
 
                {/* Subtle brighten on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
 
                {/* Hover ring */}
                <div className="absolute inset-0 rounded-xl ring-0 ring-honey-300/50 group-hover:ring-1 transition-all duration-300" />
 
                {/* Coming soon badge */}
                {cat.comingSoon && (
                  <span className="absolute top-5 left-5 bg-honey-400/90 backdrop-blur-sm text-midnight text-[9px] font-bold font-satoshi uppercase tracking-wider px-2.5 py-1 rounded">
                    Coming Soon
                  </span>
                )}
 
                {/* Label block */}
                <div className="relative z-10">
                  <h3 className={`font-clash font-semibold text-xl mb-0.5 transition-transform duration-300 group-hover:-translate-y-1 ${cat.textCol}`}>
                    {cat.label}
                  </h3>
                  <p className={`font-satoshi text-xs mb-2 ${cat.subCol}`}>{cat.sub}</p>
                  <span className={`font-satoshi text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${cat.arrowCol}`}>
                    {cat.comingSoon ? 'Learn More →' : 'Shop →'}
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
