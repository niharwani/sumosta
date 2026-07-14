'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { STATIC_COMBOS } from '@/lib/content';

export default function ComboGifting() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden" id="combo-gifting">
      {/* Background radial accent */}
      <div className="absolute right-0 bottom-1/4 w-80 h-80 bg-honey-200/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.22em] block mb-4">
              Combo & Gifting Specials
            </span>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Curated Honey Bundles
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-satoshi text-bark text-base leading-relaxed">
              Beautifully packaged gift boxes and comb offers. Perfect for high-wellness gifting or personal indulgence.
            </p>
          </RevealOnScroll>
        </div>

        {/* Combos Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {STATIC_COMBOS.map((combo, idx) => {
            return (
              <RevealOnScroll key={combo.id} variant="fadeUp" delay={0.1 * idx}>
                <div className="bg-cream-warm border border-sand rounded-2xl overflow-hidden flex flex-col h-full group hover:border-honey-400 hover:shadow-honey transition-all duration-300">
                  
                  {/* Bundle Image */}
                  <div className="relative aspect-[4/3] bg-cream overflow-hidden">
                    {/* Fallback box with honey motif if image file isn't uploaded */}
                    <div className="absolute inset-0 bg-gradient-to-br from-honey-100 to-honey-300 flex items-center justify-center">
                      <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">🎁</span>
                    </div>
                  </div>

                  {/* Bundle Details */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <span className="font-satoshi text-[10px] text-earth-light uppercase tracking-widest font-bold mb-1">
                      Exclusive Set
                    </span>
                    <h3 className="font-clash font-bold text-charcoal text-xl mb-3 group-hover:text-honey-600 transition-colors">
                      {combo.name}
                    </h3>
                    <p className="font-satoshi text-bark text-sm leading-relaxed mb-6 flex-1 text-justify">
                      {combo.description}
                    </p>
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
