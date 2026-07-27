'use client';
import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { STATIC_COMBOS } from '@/lib/content';
import { formatPrice } from '@/lib/utils';
import { Gift, ArrowRight } from 'lucide-react';

export default function ComboGifting() {
  return (
    <section className="section-padding bg-cream relative overflow-hidden" id="combo-gifting">
      {/* Background radial accent */}
      <div className="absolute right-0 bottom-1/4 w-80 h-80 bg-honey-200/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-3">
              Combo & Gifting Specials
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
              Curated Honey Bundles
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-satoshi text-bark text-base leading-relaxed">
              Beautifully packaged gift boxes and comb offers. Perfect for wellness gifting or personal indulgence.
            </p>
          </RevealOnScroll>
        </div>

        {/* Combos Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {STATIC_COMBOS.map((combo, idx) => {
            return (
              <RevealOnScroll key={combo.id} variant="fadeUp" delay={0.1 * idx}>
                <div className="bg-cream-warm border border-sand rounded-2xl overflow-hidden flex flex-col h-full group hover:border-honey-400 hover:shadow-honey transition-all duration-300">
                  
                  {/* Bundle Image / Graphic */}
                  <div className="relative aspect-[4/3] bg-cream p-6 flex items-center justify-center border-b border-sand/60 overflow-hidden">
                    <span className="absolute top-3 left-3 bg-honey-100 text-honey-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Exclusive Set
                    </span>

                    <div className="w-24 h-24 rounded-full bg-honey-100/70 flex items-center justify-center text-honey-500 text-4xl group-hover:scale-110 transition-transform duration-500">
                      <Gift size={44} className="text-honey-500" />
                    </div>
                  </div>

                  {/* Bundle Details */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-clash font-bold text-honey-600 text-xl">
                        {formatPrice(combo.price)}
                      </span>
                      {combo.compareAtPrice && (
                        <span className="font-satoshi text-earth-light text-xs line-through">
                          {formatPrice(combo.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-clash font-bold text-charcoal text-xl mb-3 group-hover:text-honey-600 transition-colors">
                      {combo.name}
                    </h3>

                    <p className="font-satoshi text-bark/80 text-xs sm:text-sm leading-relaxed mb-6 flex-1">
                      {combo.description}
                    </p>

                    <Link
                      href={`/shop/gift-boxes`}
                      className="btn-secondary w-full text-center text-xs py-3 group-hover:bg-honey-400 group-hover:text-midnight group-hover:border-honey-400 transition-colors"
                    >
                      <span>View Bundle Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
}
