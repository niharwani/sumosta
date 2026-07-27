'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { Sparkles, Heart, ShieldCheck } from 'lucide-react';

export default function BrandIntro() {
  const { body, promise } = BRAND_CONTENT.hook;
  const { vision, mission } = BRAND_CONTENT.visionMission;

  return (
    <section className="section-padding bg-cream-warm relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-honey-200/30 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-honey-100/40 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-3">
              Our Core Purpose
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-8">
              Indulgence Should Look Out For You
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <p className="font-satoshi text-bark text-base sm:text-lg leading-relaxed text-justify md:text-center mb-12">
              {body}
            </p>
          </RevealOnScroll>

          {/* Promise Highlight Card */}
          <RevealOnScroll variant="scaleIn" delay={0.3}>
            <div className="bg-cream border border-sand p-8 sm:p-10 rounded-2xl shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-honey-300 via-honey-400 to-honey-300" />
              
              <div className="inline-flex items-center gap-2 text-honey-600 text-xs uppercase tracking-widest font-bold mb-3">
                <Sparkles size={14} />
                <span>The SUMOSTA Promise</span>
              </div>
              
              <p className="font-satoshi text-charcoal text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                &ldquo;{promise}&rdquo;
              </p>
            </div>
          </RevealOnScroll>

          {/* Vision & Mission Side-by-Side Pill Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mt-12 text-left">
            <RevealOnScroll variant="slideInLeft" delay={0.4}>
              <div className="bg-cream/80 border border-sand p-6 rounded-xl h-full flex flex-col justify-between hover:border-honey-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-honey-100 flex items-center justify-center text-honey-600">
                    <Heart size={16} />
                  </div>
                  <h3 className="font-clash font-bold text-charcoal text-base">Our Vision</h3>
                </div>
                <p className="font-bespoke italic text-bark text-sm leading-relaxed">
                  &ldquo;{vision}&rdquo;
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="slideInRight" delay={0.4}>
              <div className="bg-cream/80 border border-sand p-6 rounded-xl h-full flex flex-col justify-between hover:border-honey-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-honey-100 flex items-center justify-center text-honey-600">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="font-clash font-bold text-charcoal text-base">Our Mission</h3>
                </div>
                <p className="font-satoshi text-bark text-xs sm:text-sm leading-relaxed">
                  {mission}
                </p>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </div>
    </section>
  );
}
