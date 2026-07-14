'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Sourced Wild',
    body: 'Our beekeepers locate wild colonies in protected forest reserves — the Western Ghats, Saranda, Abujhmarh, Kandhamal, and Himalayan foothills. No commercial apiaries, no imported bees.',
    emoji: '🌿',
  },
  {
    num: '02',
    title: 'Harvested with Care',
    body: 'Traditional harvesting methods ensure colonies are never disturbed beyond what they can sustain. We take only the surplus — leaving the hive strong and healthy.',
    emoji: '🐝',
  },
  {
    num: '03',
    title: 'Tested for Purity',
    body: 'Every batch is cold-extracted and sent to certified NABL labs for purity testing. We check for antibiotics, heavy metals, and moisture content before bottling.',
    emoji: '🔬',
  },
  {
    num: '04',
    title: 'Sealed for You',
    body: 'Filled in small batches into glass jars, sealed immediately to preserve enzymes and aroma. Each jar carries a harvest date and apiary location.',
    emoji: '🫙',
  },
];

export default function HoneyProcess() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%']);

  return (
    <section ref={containerRef} className="relative hidden lg:block" style={{ height: '300vh' }}>
      {/* Sticky wrapper */}
      <div className="sticky top-0 h-screen overflow-hidden bg-charcoal flex flex-col">
        {/* Progress line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-earth/30 z-10">
          <motion.div
            className="h-full bg-honey-400 origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        </div>

        <div className="flex flex-col justify-center h-full px-12 mb-12">
          <p className="font-satoshi text-honey-400 text-xs uppercase tracking-[0.2em] mb-3">The Process</p>
          <h2 className="font-clash text-cream font-bold text-5xl mb-10">How we do it</h2>
        </div>

        {/* Horizontal scroll container */}
        <motion.div style={{ x }} className="flex gap-0 absolute top-32 left-0 will-change-transform">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative w-[100vw] h-[calc(100vh-8rem)] flex flex-col justify-center px-24 shrink-0"
            >
              {/* Large number watermark */}
              <span className="absolute top-1/2 right-20 -translate-y-1/2 font-clash font-bold text-earth/10 select-none pointer-events-none"
                style={{ fontSize: '20vw', lineHeight: 1 }}>
                {step.num}
              </span>

              <div className="relative z-10 max-w-lg">
                <span className="text-5xl mb-6 block">{step.emoji}</span>
                <h3 className="font-clash text-cream font-bold text-4xl mb-4">{step.title}</h3>
                <p className="font-satoshi text-earth-light text-lg leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
