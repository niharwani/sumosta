'use client';
import Link from 'next/link';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { ShieldCheck, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND_CONTENT } from '@/lib/content';

export default function EvidenceHubHighlight() {
  const { headline, body, standard } = BRAND_CONTENT.evidenceHub;

  return (
    <section className="section-padding bg-cream-warm border-y border-sand relative overflow-hidden" id="evidence-hub-highlight">
      {/* Background honeycomb texture */}
      <div className="absolute inset-0 honeycomb-bg pointer-events-none opacity-[0.02]" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Block: Narrative */}
          <div className="lg:col-span-6">
            <RevealOnScroll variant="fadeUp">
              <span className="font-satoshi text-terracotta text-xs uppercase tracking-[0.25em] block mb-3 font-bold">
                Evidence Hub
              </span>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.1}>
              <h2 className="font-clash text-charcoal font-bold mb-6 text-3xl sm:text-4xl leading-tight">
                {headline}
              </h2>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.2}>
              <p className="font-satoshi text-bark text-base leading-relaxed mb-6">
                {body}
              </p>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.3}>
              <div className="border-l-3 border-honey-400 pl-4 py-2 italic font-bespoke text-honey-700 text-sm sm:text-base mb-8 bg-honey-50/50 rounded-r-lg">
                <strong>{standard}</strong>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Block: Core Pillars Cards */}
          <div className="lg:col-span-6 space-y-4">
            {[
              {
                title: 'Batch-Wise COAs',
                desc: 'Verify the exact chemical profile and moisture purity markers of your specific jar batch.',
                icon: FileText,
                color: 'bg-honey-100 text-honey-700 border-honey-300/50'
              },
              {
                title: 'Government-Accredited Lab Reports',
                desc: 'View independent NABL laboratory breakdowns confirming zero adulteration or syrup addition.',
                icon: ShieldCheck,
                color: 'bg-sage-light text-sage border-sage/30'
              },
              {
                title: 'Gold-Standard Certification',
                desc: "Direct traceability verified under India's strict NPOP APEDA organic standards.",
                icon: CheckCircle2,
                color: 'bg-terracotta-light text-terracotta border-terracotta/30'
              }
            ].map((pillar, i) => {
              const IconComp = pillar.icon;
              return (
                <RevealOnScroll key={pillar.title} variant="slideInRight" delay={0.1 * i}>
                  <div className="bg-cream border border-sand p-6 rounded-2xl flex gap-4 hover:border-honey-400 transition-all shadow-xs hover:shadow-md">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${pillar.color}`}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3 className="font-clash font-bold text-charcoal text-base">{pillar.title}</h3>
                      <p className="font-satoshi text-bark/80 text-xs sm:text-sm leading-relaxed mt-1">{pillar.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}

            <RevealOnScroll variant="fadeUp" delay={0.4} className="pt-4">
              <Link
                href="/evidence-hub"
                className="btn-primary w-full sm:w-auto text-center"
              >
                <span>Access Interactive Evidence Hub</span>
                <ArrowRight size={16} />
              </Link>
            </RevealOnScroll>
          </div>

        </div>
      </div>
    </section>
  );
}
