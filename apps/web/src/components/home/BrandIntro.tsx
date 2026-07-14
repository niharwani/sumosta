'use client';
import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';

export default function BrandIntro() {
  const { headline, subHeadline, body, promise } = BRAND_CONTENT.hook;

  return (
    <section className="py-24 bg-cream-warm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-honey-100/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-honey-200/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-4">
              Core Purpose
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <p className="font-satoshi text-bark text-base md:text-lg leading-relaxed text-justify md:text-center mb-12">
              {body}
            </p>
          </RevealOnScroll>

          {/* Promise Highlight Card */}
          <RevealOnScroll variant="fadeUp" delay={0.4}>
            <motion.div 
              className="bg-cream border border-sand p-8 md:p-10 rounded-2xl shadow-honey relative overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-clash text-honey-600 font-bold uppercase tracking-widest text-xs block mb-3">
                The SUMOSTA Promise
              </span>
              <p className="font-satoshi text-charcoal text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                {promise}
              </p>
            </motion.div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
}
