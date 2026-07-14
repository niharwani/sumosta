'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !titleRef.current) return;

    import('animejs').then(({ default: anime }) => {
      anime({
        targets: titleRef.current!.querySelectorAll('.hero-char'),
        opacity:    [0, 1],
        translateY: [60, 0],
        rotateX:    [90, 0],
        easing:     'cubicBezier(0.16, 1, 0.3, 1)',
        duration:   900,
        delay:      anime.stagger(28, { start: 400 }),
      });
    });
  }, []);

  const splitText = (text: string) =>
    text.split('').map((ch, i) => (
      <span key={`${text}-${i}`} className="hero-char inline-block" style={{ opacity: 0 }}>
        {ch === ' ' ? ' ' : ch}
      </span>
    ));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/hero-bg.png"
          alt="Pristine forest background"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-cream via-cream/80 to-transparent" />
      </div>

      {/* Honeycomb background pattern */}
      <div className="absolute inset-0 honeycomb-bg pointer-events-none z-10" style={{ opacity: 0.035 }} />

      <div className="relative z-10 max-w-content mx-auto px-6 md:px-8 lg:px-12 w-full grid lg:grid-cols-2 gap-8 items-center py-28 lg:py-0">

        {/* ── Left: Text ── */}
        <div>
          <motion.div
            className="font-satoshi uppercase tracking-[0.22em] mb-6 text-sm flex items-center gap-1.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="font-extrabold text-charcoal text-base">SUMOSTA</span>
            <span className="text-bark font-bold">&bull;</span>
            <span className="font-extrabold text-bark text-base">INDULGENCE THAT CARES</span>
          </motion.div>

          <div ref={titleRef} className="mb-7 leading-[1.0] flex flex-col">
            <div
              className="font-clash font-bold text-charcoal"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)' }}
            >
              {splitText("Indulgence")}
            </div>
            <div
              className="font-clash font-bold text-honey-500 my-2"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              {splitText("≠")}
            </div>
            <div
              className="font-bespoke italic text-bark"
              style={{ fontSize: 'clamp(3.2rem, 7vw, 6rem)' }}
            >
              {splitText("Guilt")}
            </div>
          </div>

          <motion.p
            className="font-satoshi text-earth text-base md:text-lg leading-relaxed max-w-lg mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            Zero refined sugars. Zero filler chemicals. 100% pure, nutrient-dense joy. Raw forest honey sourced from India&apos;s wildest reserves.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4 }}
          >
            <Link
              href="/shop"
              className="bg-honey-400 text-midnight font-satoshi font-semibold px-8 py-4 rounded-md hover:bg-honey-500 transition-colors shadow-honey"
            >
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="font-satoshi text-bark font-medium flex items-center gap-2 hover:text-charcoal transition-colors group"
            >
              Our Story
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>

        {/* ── Right: Premium Typographic Origin Showcase ── */}
        <motion.div
          className="relative flex items-center justify-center w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Soft radial backdrop */}
          <div
            className="absolute rounded-full blur-3xl bg-honey-200/40 opacity-40 pointer-events-none"
            style={{ width: '80%', height: '80%', top: '10%', left: '10%' }}
          />

          <div className="relative z-10 w-full max-w-md bg-cream border border-sand/80 p-8 md:p-10 rounded-2xl shadow-honey">
            <span className="font-satoshi text-honey-600 text-[10px] uppercase tracking-[0.25em] font-semibold block mb-2">
              Authentic & Pure
            </span>
            <h3 className="font-clash font-bold text-charcoal text-2xl mb-6">
              Purity Highlights
            </h3>

            <div className="space-y-6 font-satoshi">
              {[
                { name: 'Raw & Authentic', note: 'Unheated, unfiltered, preserving all natural enzymes and pollen.', color: 'border-honey-400' },
                { name: 'Unprocessed', note: '100% pure honey, straight from the hive with nothing added and nothing taken.', color: 'border-sage/60' },
                { name: 'Single-Source', note: 'Sourced from India\'s untouched landscapes and pristine forests.', color: 'border-terracotta/60' }
              ].map((origin) => (
                <div key={origin.name} className="flex gap-4 items-start">
                  <div className={`w-1 h-10 border-l-2 ${origin.color} mt-1`} />
                  <div>
                    <h4 className="font-clash font-bold text-charcoal text-sm">
                      {origin.name}
                    </h4>
                    <p className="text-bark text-[12px] mt-1 leading-relaxed">{origin.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="font-satoshi text-earth-light text-xs uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} className="text-earth-light" />
        </motion.div>
      </motion.div>
    </section>
  );
}
