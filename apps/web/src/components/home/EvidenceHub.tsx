'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';

export default function EvidenceHub() {
  const { headline, body, standard, features } = BRAND_CONTENT.evidenceHub;

  return (
    <section className="py-24 bg-white border-y border-[#E5E7EB] relative overflow-hidden" id="evidence-hub">
      <div className="absolute inset-0 honeycomb-bg pointer-events-none opacity-[0.02]" />

      <div className="max-w-3xl mx-auto px-6 md:px-10 relative z-10 text-center flex flex-col items-center">

        <RevealOnScroll variant="fadeUp">
          <span className="font-jakarta text-red-600 text-xs uppercase tracking-[0.22em] block mb-4 font-semibold text-center">
            Evidence Hub
          </span>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.1}>
          <h2 className="font-jakarta font-bold text-charcoal mb-6 text-3xl md:text-4xl leading-tight text-center">
            {headline}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.2}>
          <p className="font-jakarta text-gray-700 text-base leading-relaxed mb-8 text-center">
            {body}
          </p>
        </RevealOnScroll>

        {/* Standard Quote */}
        <RevealOnScroll variant="fadeUp" delay={0.3}>
          <div className="border-l-2 border-[#F97316] pl-4 py-1 italic font-jakarta text-[#F97316] text-lg mb-8 text-center max-w-xl mx-auto">
            {standard}
          </div>
        </RevealOnScroll>

        {/* Micro Pillars of Proof */}
        <div className="grid md:grid-cols-3 gap-6 text-center mt-4 w-full">
          {features.map((feat, i) => (
            <RevealOnScroll key={feat.title} variant="fadeUp" delay={0.35 + i * 0.08}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl mt-0.5">{feat.icon}</span>
                <div>
                  <h4 className="font-jakarta font-semibold text-charcoal text-sm">{feat.title}</h4>
                  <p className="font-jakarta text-gray-600 text-xs mt-1">{feat.desc}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
