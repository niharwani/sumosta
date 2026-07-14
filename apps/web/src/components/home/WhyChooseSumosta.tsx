'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { ChevronDown } from 'lucide-react';

export default function WhyChooseSumosta() {
  const { title, subtitle, pillars } = BRAND_CONTENT.whyChooseUs;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-cream relative overflow-hidden" id="why-choose-us">
      {/* Background graphic elements */}
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-honey-100/30 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-4">
              Why Choose SUMOSTA
            </span>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {title}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-satoshi text-bark text-base leading-relaxed">
              {subtitle}
            </p>
          </RevealOnScroll>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <RevealOnScroll key={p.title} variant="fadeUp" delay={0.08 * idx}>
                <motion.div
                  layout
                  className="bg-cream-warm border border-sand p-6 md:p-8 rounded-2xl cursor-pointer hover:border-honey-400 hover:shadow-honey transition-all duration-300 relative overflow-hidden"
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-honey-100 flex items-center justify-center text-xl text-honey-600 shrink-0">
                      {p.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <h3 className="font-clash font-bold text-charcoal text-lg md:text-xl">
                          {p.title}
                        </h3>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-earth-light hover:text-honey-500"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </div>

                      <p className="font-bespoke italic text-honey-600 font-medium text-sm mb-2">
                        {p.short}
                      </p>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="font-satoshi text-bark text-sm leading-relaxed mt-4 pt-4 border-t border-sand">
                              {p.details}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isExpanded && (
                        <p className="font-satoshi text-earth-light text-xs mt-3 select-none flex items-center gap-1 group-hover:text-honey-500">
                          Click to expand details
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
}
