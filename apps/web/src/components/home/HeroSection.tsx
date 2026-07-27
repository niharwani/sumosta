'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroJar from '@/components/home/HeroJar';

export default function HeroSection() {
  const jarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    import('animejs').then(({ default: anime }) => {
      // Gentle float — honey jar
      anime({
        targets: jarRef.current,
        translateY: ['-10px', '10px'],
        duration: 4000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true,
      });

      // Stagger in the headline lines
      anime({
        targets: '.hero-line',
        opacity: [0, 1],
        translateY: [40, 0],
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        duration: 900,
        delay: anime.stagger(120, { start: 100 }),
      });

      // Fade in supporting content
      anime({
        targets: '.hero-sub',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        duration: 800,
        delay: 600,
      });
    });
  }, []);

  return (
    <section className="relative bg-[#FFFDF8] overflow-hidden min-h-[92vh] flex items-center">

      {/* Subtle honeycomb bg pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url('/images/textures/honeycomb.svg')", backgroundSize: '120px' }}
      />

      {/* Warm vignette at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FFF0D6]/30 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-content mx-auto px-6 md:px-10 py-16 md:py-24">

        {/* ── Eyebrow ── */}
        <div className="hero-line opacity-0 flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-honey-500" />
          <span className="font-jakarta text-[11px] uppercase tracking-[0.2em] text-earth">
            Single-origin · Raw · Unprocessed
          </span>
        </div>

        {/* ── Typography composition ── */}
        <div className="relative">

          {/* Line 1 — Bespoke Serif italic accent */}
          <div className="hero-line opacity-0">
            <span className="font-bespoke italic text-honey-500 text-[clamp(1.75rem,3.5vw,3rem)] leading-none block mb-1 md:mb-2">
              Nature's
            </span>
          </div>

          {/* Line 2 — GOLDEN (massive Clash Display) with floating jar inside */}
          <div className="hero-line opacity-0 relative">
            <h1
              className="font-clash font-bold text-charcoal leading-[0.82] tracking-[-0.02em] select-none"
              style={{ fontSize: 'clamp(5rem, 14vw, 12rem)' }}
            >
              GOLDEN
            </h1>

            {/* Honey jar — floats inside the typographic field, overlapping the letters */}
            <div
              ref={jarRef}
              className="absolute pointer-events-none"
              style={{
                right: 'clamp(-2rem, 2vw, 4rem)',
                top:  'clamp(-4rem, -6vw, -8rem)',
                width: 'clamp(180px, 26vw, 420px)',
                zIndex: 10,
              }}
            >
              <HeroJar />
            </div>
          </div>

          {/* Line 3 — PROMISE (offset right) */}
          <div className="hero-line opacity-0 flex justify-end md:justify-end">
            <h1
              className="font-clash font-bold text-charcoal leading-[0.82] tracking-[-0.02em] select-none"
              style={{ fontSize: 'clamp(4rem, 11vw, 9.5rem)' }}
            >
              PROMISE
            </h1>
          </div>
        </div>

        {/* ── Supporting content ── */}
        <div className="hero-sub opacity-0 mt-10 md:mt-14 flex flex-col sm:flex-row items-start sm:items-end gap-8 sm:gap-16">

          {/* Description */}
          <p className="font-jakarta text-bark text-base md:text-lg leading-relaxed max-w-xs">
            Raw honey sourced from India's wildest apiaries — Western Ghats, Sundarbans, Himalayan foothills.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-5 shrink-0">
            <Link href="/shop" className="btn-honey">
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="font-jakarta text-[13px] tracking-wide text-earth hover:text-charcoal transition-colors flex items-center gap-1.5 group"
            >
              Our Story
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>

        {/* ── Scroll cue ── */}
        <div className="hero-sub opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
          <span className="font-jakarta text-[10px] uppercase tracking-[0.18em] text-earth-light">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-earth-light to-transparent" />
        </div>

      </div>
    </section>
  );
}
