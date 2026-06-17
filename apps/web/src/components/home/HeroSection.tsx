'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import MagneticButton from '@/components/shared/MagneticButton';

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

  const splitText = (text: string, baseDelay: number) =>
    text.split('').map((ch, i) => (
      <span key={`${text}-${i}`} className="hero-char inline-block" style={{ opacity: 0 }}>
        {ch === ' ' ? ' ' : ch}
      </span>
    ));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-cream via-honey-50 to-honey-100">
      {/* Honeycomb background pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-[0.03] pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 w-full grid lg:grid-cols-[3fr_2fr] gap-12 items-center py-24 lg:py-0">
        {/* Left: Text */}
        <div>
          <motion.p
            className="font-satoshi text-honey-500 text-sm uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Single-Origin &bull; Wild Sourced &bull; Unprocessed
          </motion.p>

          <div ref={titleRef} className="mb-6">
            <div className="font-bespoke italic text-honey-400 leading-none" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
              {splitText("Nature's", 0)}
            </div>
            <div className="font-clash font-bold text-charcoal leading-none" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
              {splitText('Golden', 0)}
            </div>
            <div className="font-clash font-bold text-charcoal leading-none" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
              {splitText('Promise', 0)}
            </div>
          </div>

          <motion.p
            className="font-satoshi text-earth text-base md:text-lg leading-relaxed max-w-xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            Raw, unprocessed honey sourced from India&rsquo;s wildest apiaries. From hive to home, nothing added, nothing taken.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4 }}
          >
            <Link
              href="/shop"
              data-cursor-text="SHOP"
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

        {/* Right: Product image */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Golden glow */}
          <div className="absolute inset-0 bg-honey-200 rounded-full blur-3xl opacity-40 scale-75" />

          <motion.div
            className="relative w-72 h-96 md:w-80 md:h-[480px]"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/images/products/western-ghats-honey.jpg"
              alt="SUMOSTA Western Ghats Raw Honey"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>
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
