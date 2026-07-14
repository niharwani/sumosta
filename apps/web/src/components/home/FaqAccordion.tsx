'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { STATIC_FAQS } from '@/lib/content';
import { Plus, Minus } from 'lucide-react';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-cream relative overflow-hidden" id="faq">
      {/* Decorative accent */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-honey-100/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-4">
              Frequently Asked Questions
            </span>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold mb-4 text-3xl md:text-4xl">
              Queries & Clarity
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-satoshi text-bark text-sm leading-relaxed max-w-lg mx-auto">
              Everything you need to know about our raw harvesting, crystallization, and NABL certifications.
            </p>
          </RevealOnScroll>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {STATIC_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <RevealOnScroll key={faq.question} variant="fadeUp" delay={0.05 * idx}>
                <div className="bg-cream-warm border border-sand rounded-xl overflow-hidden transition-all duration-300">
                  
                  {/* Trigger */}
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex items-center justify-between w-full p-5 text-left font-clash text-charcoal font-semibold text-base transition-colors hover:text-honey-600 gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className="text-earth-light shrink-0 p-1 bg-white border border-sand rounded-full">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {/* Panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="p-5 pt-0 border-t border-sand/40 font-satoshi text-bark text-sm leading-relaxed text-justify">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
}
