'use client';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';

export default function Philosophy() {
  const { title, subtitle, description, beliefs } = BRAND_CONTENT.philosophy;

  return (
    <section className="py-24 bg-cream-warm relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-honey-200/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-4">
              Brand Philosophy
            </span>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {title}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-bespoke italic text-honey-500 text-xl mb-6">
              {subtitle}
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <p className="font-satoshi text-bark text-base leading-relaxed">
              {description}
            </p>
          </RevealOnScroll>
        </div>

        {/* 5 Beliefs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {beliefs.map((b, i) => (
            <RevealOnScroll key={b.title} variant="fadeUp" delay={0.1 + i * 0.08}>
              <motion.div
                className="bg-cream border border-sand p-6 rounded-xl h-full flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-honey-300 transition-all duration-300 group"
                whileHover={{ y: -6 }}
              >
                <div className="w-14 h-14 rounded-full bg-honey-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-honey-100 transition-colors duration-300">
                  {b.icon}
                </div>
                <h3 className="font-clash font-semibold text-charcoal text-sm mb-2">
                  {b.title}
                </h3>
                <p className="font-satoshi text-bark text-xs leading-relaxed">
                  {b.description}
                </p>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
