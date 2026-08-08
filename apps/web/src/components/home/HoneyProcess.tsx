'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Leaf, HandHeart, FlaskConical, Package } from 'lucide-react';
import { HONEY_EASE_OUT } from '@/lib/animations';

const STEPS = [
  {
    num: '01',
    title: 'Sourced Wild',
    body: 'Our beekeepers locate wild colonies in protected forest reserves — Western Ghats, Saranda, Abujhmarh, Kandhamal, and Himalayan foothills. No commercial apiaries, no imported bees.',
    Icon: Leaf,
  },
  {
    num: '02',
    title: 'Harvested with Care',
    body: 'Traditional harvesting methods ensure colonies are never disturbed beyond what they can sustain. We take only the surplus — leaving the hive strong and healthy.',
    Icon: HandHeart,
  },
  {
    num: '03',
    title: 'Tested for Purity',
    body: 'Every batch is cold-extracted and sent to certified NABL labs. We check for antibiotics, heavy metals, moisture, and adulteration before bottling.',
    Icon: FlaskConical,
  },
  {
    num: '04',
    title: 'Sealed for You',
    body: 'Filled in small batches into glass jars, sealed immediately to preserve enzymes and aroma. Each jar carries a harvest date and apiary location.',
    Icon: Package,
  },
];

export default function HoneyProcess() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Horizontal scroll: 4 stages -> move -75% across the viewport as user scrolls the container.
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP — sticky horizontal-scroll experience
          ───────────────────────────────────────────── */}
      <section
        ref={containerRef}
        className="relative hidden lg:block"
        style={{ height: '360vh' }}
        aria-label="Our process"
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-charcoal flex flex-col">
          {/* Thin golden progress line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-earth/30 z-20">
            <motion.div
              className="h-full bg-honey-400 origin-left"
              style={{ scaleX: reduce ? 1 : scrollYProgress }}
            />
          </div>

          {/* Section eyebrow + title */}
          <div className="relative z-10 px-12 pt-24">
            <p className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] mb-3">
              The Process
            </p>
            <h2
              className="font-clash text-cream font-bold tracking-[-0.01em]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05 }}
            >
              From forest to jar
            </h2>
          </div>

          {/* Horizontal scroll rail */}
          <motion.div
            style={{ x: reduce ? '0%' : x }}
            className="flex absolute inset-x-0 bottom-0 top-56 will-change-transform"
          >
            {STEPS.map((step) => {
              const Icon = step.Icon;
              return (
                <div
                  key={step.num}
                  className="relative w-screen h-full flex flex-col justify-center px-24 shrink-0"
                >
                  {/* Watermark number */}
                  <span
                    aria-hidden
                    className="absolute right-16 top-1/2 -translate-y-1/2 font-clash font-bold text-honey-100/[0.07] select-none pointer-events-none leading-none"
                    style={{ fontSize: '20vw' }}
                  >
                    {step.num}
                  </span>

                  <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-honey-400/15 text-honey-300 mb-6">
                      <Icon size={26} strokeWidth={1.8} />
                    </span>
                    <p className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] mb-3">
                      Step {step.num}
                    </p>
                    <h3
                      className="font-clash text-cream font-bold mb-5 tracking-[-0.01em]"
                      style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)', lineHeight: 1.1 }}
                    >
                      {step.title}
                    </h3>
                    <p className="font-satoshi text-earth-light text-base md:text-lg leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Stage indicator (bottom center) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 font-satoshi text-earth-light text-xs uppercase tracking-[0.18em]">
            <span>01</span>
            <span className="relative block w-40 h-px bg-earth/40 overflow-hidden">
              <motion.span
                className="absolute inset-y-0 left-0 bg-honey-400"
                style={{ width: reduce ? '100%' : progressWidth }}
              />
            </span>
            <span>04</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          MOBILE — vertical stack of full-width cards
          ───────────────────────────────────────────── */}
      <section className="lg:hidden bg-charcoal py-16" aria-label="Our process">
        <div className="max-w-content mx-auto px-6">
          <p className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] mb-3">
            The Process
          </p>
          <h2
            className="font-clash text-cream font-bold tracking-[-0.01em] mb-10"
            style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)', lineHeight: 1.05 }}
          >
            From forest to jar
          </h2>

          <ol className="space-y-6">
            {STEPS.map((step, i) => {
              const Icon = step.Icon;
              return (
                <motion.li
                  key={step.num}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: reduce ? 0 : i * 0.08,
                    ease: HONEY_EASE_OUT,
                  }}
                  className="relative rounded-xl border border-honey-400/15 bg-honey-400/[0.03] p-6"
                >
                  <span
                    aria-hidden
                    className="absolute -top-4 -right-2 font-clash font-bold text-honey-400/15 select-none pointer-events-none leading-none"
                    style={{ fontSize: '5rem' }}
                  >
                    {step.num}
                  </span>
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-honey-400/15 text-honey-300 mb-4">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <h3 className="font-clash font-bold text-cream text-2xl mb-2 tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="font-satoshi text-earth-light text-sm leading-relaxed">
                    {step.body}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
