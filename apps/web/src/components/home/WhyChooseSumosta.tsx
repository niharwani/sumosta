'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { ChevronDown, Sparkles, ShieldCheck, Leaf, Zap } from 'lucide-react';

const ICON_MAP = [Sparkles, ShieldCheck, Leaf, Zap];

export default function WhyChooseSumosta() {
  const { title, subtitle, pillars } = BRAND_CONTENT.whyChooseUs;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // first item open by default

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="section-padding bg-cream relative overflow-hidden" id="why-choose-us">
      {/* Background Soft Glow */}
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-honey-100/30 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-3">
              Why Choose SUMOSTA
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
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
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {pillars.map((p, idx) => {
            const isExpanded = expandedIndex === idx;
            const IconComp = ICON_MAP[idx % ICON_MAP.length];

            return (
              <RevealOnScroll key={p.title} variant="fadeUp" delay={0.08 * idx}>
                <motion.div
                  layout
                  className={`bg-cream-warm border p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isExpanded 
                      ? 'border-honey-400 shadow-honey bg-cream' 
                      : 'border-sand hover:border-honey-300 hover:shadow-sm'
                  }`}
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-honey-100/80 border border-honey-200 flex items-center justify-center text-honey-600 shrink-0">
                      <IconComp size={22} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <h3 className="font-clash font-bold text-charcoal text-lg sm:text-xl">
                          {p.title}
                        </h3>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-earth-light hover:text-honey-600 p-1"
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </div>

                      <p className="font-bespoke italic text-honey-600 font-semibold text-xs sm:text-sm mb-2">
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
                            <p className="font-satoshi text-bark text-sm leading-relaxed mt-3 pt-3 border-t border-sand/60">
                              {p.details}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
