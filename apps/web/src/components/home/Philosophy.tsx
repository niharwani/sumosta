'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { Compass, Clock, Leaf, Scale, Heart } from 'lucide-react';

const BELIEF_ICONS = [Leaf, Clock, Compass, Scale, Heart];

export default function Philosophy() {
  const { title, subtitle, description, beliefs } = BRAND_CONTENT.philosophy;

  return (
    <section className="section-padding bg-cream-warm relative overflow-hidden">
      {/* Background Soft Shape */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-honey-200/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-3">
              Brand Philosophy
            </span>
          </RevealOnScroll>
          
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-3">
              {title}
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-bespoke italic text-honey-600 text-lg sm:text-xl font-medium mb-4">
              &ldquo;{subtitle}&rdquo;
            </p>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <p className="font-satoshi text-bark text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </RevealOnScroll>
        </div>

        {/* 5 Beliefs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {beliefs.map((b, i) => {
            const IconComp = BELIEF_ICONS[i % BELIEF_ICONS.length];
            return (
              <RevealOnScroll key={b.title} variant="fadeUp" delay={0.1 + i * 0.08}>
                <div className="bg-cream border border-sand p-6 rounded-2xl h-full flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-honey-400 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-honey-100/80 flex items-center justify-center text-honey-600 mb-4 group-hover:bg-honey-400 group-hover:text-midnight transition-colors">
                    <IconComp size={20} />
                  </div>
                  <h3 className="font-clash font-bold text-charcoal text-sm sm:text-base mb-2">
                    {b.title}
                  </h3>
                  <p className="font-satoshi text-bark/80 text-xs leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
}
