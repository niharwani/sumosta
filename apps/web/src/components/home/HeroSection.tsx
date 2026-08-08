'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import HeroJar from '@/components/home/HeroJar';
import AnimatedText from '@/components/shared/AnimatedText';
import { HONEY_EASE_OUT } from '@/lib/animations';

export default function HeroSection() {
  const reduce = useReducedMotion();

  const floatAnimation = reduce
    ? {}
    : { y: [-10, 10, -10] };

  const floatTransition = reduce
    ? undefined
    : { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <section
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        minHeight: 'calc(100vh - var(--header-height))',
        background:
          'linear-gradient(135deg, var(--cream) 0%, var(--honey-50) 55%, var(--honey-100) 100%)',
      }}
      aria-label="SUMOSTA — Nature's Golden Promise"
    >
      {/* Subtle honeycomb texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: '56px 100px',
        }}
      />

      <div className="relative w-full max-w-content mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          {/* ── LEFT (60%) — Headline stack ── */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: HONEY_EASE_OUT }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <span className="block w-8 h-px bg-honey-500" />
              <span className="font-satoshi text-[11px] uppercase tracking-[0.2em] text-earth">
                Single-origin · Raw · Unprocessed
              </span>
            </motion.div>

            {/* Headline: "Nature's" italic serif + "Golden" + "Promise" display */}
            <div className="relative">
              <div
                className="mb-1"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
              >
                <AnimatedText
                  text="Nature's"
                  tag="span"
                  className="font-bespoke italic text-honey-400 block leading-[0.9]"
                  splitBy="char"
                />
              </div>

              <div style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
                <AnimatedText
                  text="Golden"
                  tag="h1"
                  delay={200}
                  className="font-clash font-bold text-charcoal leading-[0.9] tracking-[-0.02em]"
                  splitBy="char"
                />
              </div>

              <div style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
                <AnimatedText
                  text="Promise."
                  tag="span"
                  delay={400}
                  className="font-clash font-bold text-charcoal leading-[0.9] tracking-[-0.02em] block"
                  splitBy="char"
                />
              </div>
            </div>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: HONEY_EASE_OUT }}
              className="font-satoshi text-earth text-base md:text-lg leading-relaxed max-w-md mt-8 mb-8"
            >
              Raw, unprocessed honey sourced from India&apos;s wildest apiaries. From hive to home,
              nothing added, nothing taken.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: HONEY_EASE_OUT }}
              className="flex flex-wrap items-center gap-5"
            >
              <Link href="/shop" className="btn-honey">
                Shop Collection
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="group font-satoshi text-sm font-medium text-charcoal hover:text-honey-600 transition-colors inline-flex items-center gap-2"
              >
                Our Story
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT (40%) — HeroJar with float animation ── */}
          <div className="relative flex items-center justify-center min-h-[360px] lg:min-h-[520px]">
            {/* Ambient honey glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(245,166,35,0.25), rgba(245,166,35,0) 70%)',
                filter: 'blur(20px)',
              }}
            />
            <motion.div
              className="relative w-[240px] sm:w-[300px] lg:w-[380px] xl:w-[420px]"
              animate={floatAnimation}
              transition={floatTransition}
            >
              <HeroJar />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-earth-light pointer-events-none"
      >
        <span className="font-satoshi text-[10px] uppercase tracking-[0.18em]">
          Scroll to explore
        </span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} strokeWidth={1.5} />
        </motion.span>
      </motion.div>
    </section>
  );
}
