'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TRUST_BADGES } from '@/lib/constants';
import type { Product, ProductVariant } from 'shared';

const ACCORDION_ITEMS = [
  { key: 'description',  label: 'Overview & Description' },
  { key: 'ingredients',  label: 'Ingredients & Nutrition' },
  { key: 'benefits',     label: 'Product Benefits' },
  { key: 'howto',        label: 'How to Use' },
];

export default function ProductInfo({ product }: { product: Product }) {
  const [selectedVariant, setVariant] = useState<ProductVariant | null>(null);
  const [openAccordion, setOpen]     = useState<string | null>(null);

  const sourcingHighlights = (product as any).sourcingHighlights;
  const productFaqs = (product as any).faqs;

  return (
    <div>
      {/* Category */}
      <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider mb-2">
        {product.category?.name}
      </p>

      {/* Name */}
      <h1 className="font-clash text-charcoal font-bold text-3xl md:text-4xl mb-3">
        {product.name}
      </h1>

      {/* Short description */}
      <p className="font-satoshi text-bark text-sm leading-relaxed mb-5">{product.shortDescription}</p>

      {/* Sourcing Highlights */}
      {sourcingHighlights && (
        <div className="bg-cream-warm border border-sand rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-xs font-satoshi text-bark">
          <div>
            <span className="text-earth-light block uppercase tracking-wider text-[9px] font-bold mb-0.5">Forest Sourced</span>
            <span className="font-semibold text-charcoal">{sourcingHighlights.forestName}</span>
          </div>
          <div>
            <span className="text-earth-light block uppercase tracking-wider text-[9px] font-bold mb-0.5">Location</span>
            <span className="font-semibold text-charcoal">{sourcingHighlights.location}</span>
          </div>
          <div>
            <span className="text-earth-light block uppercase tracking-wider text-[9px] font-bold mb-0.5">Harvested By</span>
            <span className="font-semibold text-charcoal">{sourcingHighlights.harvestedBy}</span>
          </div>
          <div>
            <span className="text-earth-light block uppercase tracking-wider text-[9px] font-bold mb-0.5">Bee Species</span>
            <span className="font-semibold text-charcoal">{sourcingHighlights.beeSpecies}</span>
          </div>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-5">
          <p className="font-satoshi text-charcoal text-xs font-semibold uppercase tracking-wider mb-2">Size / Variant</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVariant(null)}
              className={`px-4 py-2 rounded-md border text-sm font-satoshi transition-colors ${!selectedVariant ? 'border-honey-400 bg-honey-50 text-honey-600' : 'border-sand text-bark hover:border-honey-300'}`}
            >
              Default
            </button>
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                className={`px-4 py-2 rounded-md border text-sm font-satoshi transition-colors ${selectedVariant?.id === v.id ? 'border-honey-400 bg-honey-50 text-honey-600' : 'border-sand text-bark hover:border-honey-300'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 py-4 border-y border-sand mb-6">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5">
            <span className="text-base">{badge.icon}</span>
            <span className="font-satoshi text-earth text-xs">{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Accordion */}
      <div className="flex flex-col divide-y divide-sand">
        {ACCORDION_ITEMS.map((item) => (
          <div key={item.key}>
            <button
              onClick={() => setOpen(openAccordion === item.key ? null : item.key)}
              className="flex items-center justify-between w-full py-4 font-satoshi text-charcoal text-sm font-medium hover:text-honey-500 transition-colors"
            >
              {item.label}
              <ChevronDown
                size={16}
                className={`text-earth-light transition-transform duration-300 ${openAccordion === item.key ? 'rotate-180' : ''}`}
              />
            </button>
            {openAccordion === item.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pb-4 font-satoshi text-bark text-sm leading-relaxed overflow-hidden text-justify"
              >
                {item.key === 'description' && <p>{product.description}</p>}
                {item.key === 'ingredients' && <p>{(product as any).ingredients || '100% pure raw honey. No additives, preservatives, or artificial flavors. Lab tested for purity and quality.'}</p>}
                {item.key === 'benefits' && (
                  <ul className="space-y-2 pl-2">
                    {((product as any).nutritionalBenefits || [
                      '100% raw, unheated, unfiltered single-origin forest extraction.',
                      'Contains active anti-microbial components and natural plant pollen.',
                      'Packed with trace mineral elements including iron, copper, and magnesium.',
                      'Zero corn-syrups, zero chemical residues, and zero sugar-feeding.'
                    ]).map((benefit: string, index: number) => (
                      <li key={index} className="flex gap-2 items-start">
                        <span className="text-honey-500 shrink-0">✔</span>
                        <p className="font-satoshi text-bark text-sm leading-relaxed">{benefit}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {item.key === 'howto' && <p>Use as a spread on toast, stir into warm beverages, drizzle over yogurt or desserts, or enjoy by the spoonful. Store at room temperature. Crystallization is natural and does not affect quality.</p>}
              </motion.div>
            )}
          </div>
        ))}

        {/* Product FAQs */}
        {productFaqs && productFaqs.length > 0 && (
          <div>
            <button
              onClick={() => setOpen(openAccordion === 'product_faqs' ? null : 'product_faqs')}
              className="flex items-center justify-between w-full py-4 font-satoshi text-charcoal text-sm font-medium hover:text-honey-500 transition-colors"
            >
              <span>Product FAQs</span>
              <ChevronDown
                size={16}
                className={`text-earth-light transition-transform duration-300 ${openAccordion === 'product_faqs' ? 'rotate-180' : ''}`}
              />
            </button>
            {openAccordion === 'product_faqs' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pb-4 font-satoshi text-bark text-sm leading-relaxed space-y-4 overflow-hidden"
              >
                {productFaqs.map((faq: any, idx: number) => (
                  <div key={idx} className="space-y-1.5 mt-2">
                    <p className="font-semibold text-charcoal">Q: {faq.question}</p>
                    <p className="text-bark pl-4 text-justify">{faq.answer}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
