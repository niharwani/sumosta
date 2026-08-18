'use client';
import Link from 'next/link';
import Image from 'next/image';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { ArrowRight } from 'lucide-react';

export default function BrandStoryStrip() {
  const { title, paragraphs } = BRAND_CONTENT.story;

  return (
    <section className="bg-cream-warm overflow-hidden border-y border-sand">
      <div className="max-w-content mx-auto lg:grid lg:grid-cols-12 min-h-[600px]">

        {/* ── Left Image Panel ── */}
        <div className="lg:col-span-5 relative h-80 lg:h-auto overflow-hidden">
          <Image
            src="/images/brand/sourcing.png"
            alt="Wild forest honey sourcing"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-midnight/20 to-transparent" />

          {/* Watermark typography overlay */}
          <div className="absolute inset-0 flex items-end p-8 lg:p-12">
            <div>
              <span className="font-satoshi text-honey-400 text-xs uppercase tracking-widest font-bold block mb-1">
                Authentic Sourcing
              </span>
              <p className="font-clash font-bold text-cream text-2xl sm:text-3xl leading-tight">
                Deep in India&apos;s Wildest Forests
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Text Content ── */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-3">
              Our Story
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl leading-tight mb-6">
              {title}
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <div className="font-satoshi text-bark text-sm sm:text-base leading-relaxed space-y-4 mb-8 max-h-[360px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-honey-300">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.3}>
            <Link
              href="/about"
              className="btn-secondary group inline-self-start"
            >
              <span>Read Full Story</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </RevealOnScroll>
        </div>

      </div>
    </section>
  );
}
