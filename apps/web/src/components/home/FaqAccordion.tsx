'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { STATIC_FAQS } from '@/lib/content';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-28 bg-[#FDF6EC]" id="faq">
      <div className="max-w-content mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="block font-jakarta text-[11px] uppercase tracking-[0.2em] text-earth mb-3">
            Got questions?
          </span>
          <h2 className="font-clash font-bold text-charcoal text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] tracking-tight">
            Frequently asked
          </h2>
        </div>

        {/* Accordion — max-width for readability */}
        <div className="max-w-2xl space-y-2">
          {STATIC_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.question}
                className={`rounded-lg border transition-colors duration-200 ${
                  isOpen
                    ? 'bg-[#FFFDF8] border-sand'
                    : 'bg-[#FFFDF8]/60 border-transparent hover:border-sand'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left gap-4"
                >
                  <span className={`font-jakarta font-semibold text-[14px] transition-colors ${
                    isOpen ? 'text-charcoal' : 'text-bark hover:text-charcoal'
                  }`}>
                    {faq.question}
                  </span>
                  <span className={`shrink-0 transition-colors ${isOpen ? 'text-honey-500' : 'text-earth-light'}`}>
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 font-jakarta text-bark text-[13px] leading-relaxed border-t border-sand">
                        <div className="pt-4">{faq.answer}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
