'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const ORIGINS = [
  {
    id: 'western-ghats',
    index: '01',
    name: 'Western Ghats',
    tagline: 'Lush & Floral',
    description: 'Sourced from bee colonies thriving among the ancient rainforests of the Sahyadris. Dense, complex, and deeply aromatic.',
    stat: '650m elevation',
    accent: '#C4820A',
    bg: '#FDF0D5',
    href: '/shop/raw-honey',
  },
  {
    id: 'sundarbans',
    index: '02',
    name: 'Sundarbans',
    tagline: 'Wild & Mangrove',
    description: "Wild colonies nesting in the world's largest mangrove delta. A rare, mineral-rich honey with salt-air character.",
    stat: 'Mangrove flora',
    accent: '#7C9A6E',
    bg: '#E8F0E4',
    href: '/shop/raw-honey',
  },
  {
    id: 'himalayan',
    index: '03',
    name: 'Himalayan',
    tagline: 'Pure & Alpine',
    description: 'Harvested at altitude from Cliff bees above 2000m. Crystallises naturally, with a clean, high-altitude purity.',
    stat: '2000m+ altitude',
    accent: '#8B7355',
    bg: '#F0E6D3',
    href: '/shop/raw-honey',
  },
];

export default function PopularTypes() {
  return (
    <section className="py-20 md:py-28 bg-[#FFFDF8]">
      <div className="max-w-content mx-auto px-6 md:px-10">

        {/* Section header — left aligned, editorial */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div>
            <span className="block font-jakarta text-[11px] uppercase tracking-[0.2em] text-earth mb-3">
              Where it comes from
            </span>
            <h2 className="font-clash font-bold text-charcoal text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] tracking-tight">
              Sourced from<br />
              <span className="font-bespoke italic font-normal text-honey-500">India's wild</span>
            </h2>
          </div>
          <p className="font-jakarta text-bark text-sm leading-relaxed max-w-xs md:text-right">
            Every batch is traceable to a specific apiary and harvest season. Zero mixing, zero blending.
          </p>
        </div>

        {/* Three origin cards — editorial, not identical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {ORIGINS.map((origin, i) => (
            <Link
              key={origin.id}
              href={origin.href}
              className={`group relative overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-lg flex flex-col ${
                i === 1 ? 'md:mt-8' : ''
              }`}
              style={{ background: origin.bg }}
            >
              {/* Large index number — watermark style */}
              <div
                className="absolute top-4 right-5 font-clash font-bold text-[5rem] md:text-[7rem] leading-none pointer-events-none select-none"
                style={{ color: origin.accent, opacity: 0.12 }}
              >
                {origin.index}
              </div>

              <div className="p-7 md:p-8 flex flex-col gap-6 flex-1">

                {/* Tag + index */}
                <div className="flex items-center justify-between">
                  <span
                    className="font-jakarta text-[10px] uppercase tracking-[0.18em] font-medium px-2.5 py-1 rounded-full"
                    style={{ color: origin.accent, background: `${origin.accent}18` }}
                  >
                    {origin.tagline}
                  </span>
                  <span className="font-jakarta text-[11px] text-earth" style={{ color: origin.accent }}>
                    {origin.index}
                  </span>
                </div>

                {/* Region name */}
                <div>
                  <h3 className="font-clash font-bold text-charcoal text-2xl md:text-[1.625rem] leading-tight mb-3 group-hover:text-honey-600 transition-colors">
                    {origin.name}
                  </h3>
                  <p className="font-jakarta text-bark text-[13px] leading-relaxed">
                    {origin.description}
                  </p>
                </div>

                {/* Bottom — stat + arrow */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: `${origin.accent}20` }}>
                  <span className="font-jakarta text-[11px] uppercase tracking-[0.12em]" style={{ color: origin.accent }}>
                    {origin.stat}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${origin.accent}15` }}
                  >
                    <ArrowUpRight size={14} style={{ color: origin.accent }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
