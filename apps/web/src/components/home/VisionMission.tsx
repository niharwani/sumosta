'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';

export default function VisionMission() {
  const { vision, mission, objective } = BRAND_CONTENT.visionMission;

  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* Vision Card */}
          <RevealOnScroll variant="fadeUp">
            <div className="bg-gradient-to-br from-cream-warm to-honey-50 border border-sand p-8 md:p-10 rounded-2xl h-full flex flex-col justify-between group hover:border-honey-300 transition-colors duration-300">
              <div>
                <div className="w-12 h-12 rounded-full bg-honey-100 flex items-center justify-center text-honey-500 mb-6 text-xl">
                  👁️‍🗨️
                </div>
                <h3 className="font-clash font-bold text-charcoal text-2xl mb-4">
                  Vision Statement
                </h3>
                <p className="font-bespoke italic text-bark text-lg leading-relaxed">
                  &ldquo;{vision}&rdquo;
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Mission Card */}
          <RevealOnScroll variant="fadeUp" delay={0.15}>
            <div className="bg-gradient-to-br from-cream-warm to-honey-50 border border-sand p-8 md:p-10 rounded-2xl h-full flex flex-col justify-between group hover:border-honey-300 transition-colors duration-300">
              <div>
                <div className="w-12 h-12 rounded-full bg-honey-100 flex items-center justify-center text-honey-500 mb-6 text-xl">
                  🎯
                </div>
                <h3 className="font-clash font-bold text-charcoal text-2xl mb-4">
                  Mission Statement
                </h3>
                <p className="font-satoshi text-bark text-base md:text-lg leading-relaxed">
                  {mission}
                </p>
              </div>
            </div>
          </RevealOnScroll>

        </div>

        {/* Core Objective Strip */}
        <RevealOnScroll variant="fadeUp" delay={0.25}>
          <div className="bg-midnight text-cream p-8 md:p-10 rounded-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 honeycomb-bg pointer-events-none opacity-[0.04]" />
            <span className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] block mb-3 font-semibold">
              Our Objective
            </span>
            <p className="font-satoshi text-honey-100 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              {objective}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
