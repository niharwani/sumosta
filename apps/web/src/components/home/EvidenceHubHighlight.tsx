'use client';
import Link from 'next/link';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function EvidenceHubHighlight() {
  return (
    <section className="py-24 bg-cream-warm border-y border-sand relative overflow-hidden" id="evidence-hub-highlight">
      {/* Background honeycomb texture */}
      <div className="absolute inset-0 honeycomb-bg pointer-events-none opacity-[0.02]" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Block: Narrative */}
          <div className="lg:col-span-6">
            <RevealOnScroll variant="fadeUp">
              <span className="font-satoshi text-terracotta text-xs uppercase tracking-[0.22em] block mb-4 font-semibold">
                Evidence Hub
              </span>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.1}>
              <h2 className="font-clash text-charcoal font-bold mb-6 text-3xl md:text-4xl leading-tight">
                In a world of marketing claims, we choose scientific proof.
              </h2>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.2}>
              <div className="font-satoshi text-bark text-base leading-relaxed space-y-4 mb-8">
                <p>
                  The honey industry is filled with secrets — industrial heat-processing that kills live enzymes, mass blending, and hidden sugar syrups. We chose a different path.
                </p>
                <p>
                  We don't just tell you our honey is pure, raw, and organic. We prove it. Every SKU we launch is backed by verifiable data that you can access anytime.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="fadeUp" delay={0.3}>
              <div className="border-l-2 border-honey-400 pl-4 py-1 italic font-bespoke text-honey-600 text-sm mb-8">
                <strong>The SUMOSTA Standard:</strong> If we can’t prove its purity in a lab, it doesn’t make it to your kitchen.
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Block: Core Pillars Cards */}
          <div className="lg:col-span-6 space-y-4">
            {[
              {
                title: 'Batch-Wise COAs',
                desc: 'Verify the exact chemical profile and purity markers of your specific batch.',
                icon: FileText,
                color: 'bg-honey-50 text-honey-700'
              },
              {
                title: 'Government-Accredited Lab Reports',
                desc: 'View independent laboratory breakdowns confirming zero adulteration.',
                icon: ShieldCheck,
                color: 'bg-sage-light/20 text-sage'
              },
              {
                title: 'Gold-Standard Certification',
                desc: "Direct traceability verified under India's strict NPOP APEDA organic frameworks.",
                icon: CheckCircle2,
                color: 'bg-terracotta-light/20 text-terracotta'
              }
            ].map((pillar, i) => {
              const IconComp = pillar.icon;
              return (
                <RevealOnScroll key={pillar.title} variant="fadeUp" delay={0.1 * i}>
                  <div className="bg-cream border border-sand p-6 rounded-xl flex gap-4 hover:border-honey-300 transition-colors shadow-sm">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base ${pillar.color}`}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h4 className="font-clash font-bold text-charcoal text-sm">{pillar.title}</h4>
                      <p className="font-satoshi text-bark text-xs leading-relaxed mt-1">{pillar.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}

            <RevealOnScroll variant="fadeUp" delay={0.4} className="pt-4">
              <Link
                href="/evidence-hub"
                className="bg-midnight hover:bg-honey-500 hover:text-midnight text-cream font-satoshi font-semibold text-xs px-6 py-3.5 rounded-lg inline-flex items-center gap-2 transition-all shadow-sm"
              >
                🔬 Access the interactive Evidence Hub &rarr;
              </Link>
            </RevealOnScroll>
          </div>

        </div>
      </div>
    </section>
  );
}
