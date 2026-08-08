'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { HONEY_EASE_OUT } from '@/lib/animations';

export default function BrandStoryStrip() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // Gentle parallax (0.85x — image moves slower than scroll)
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);

  return (
    <section
      ref={sectionRef}
      className="bg-cream-warm overflow-hidden border-y border-sand"
    >
      <div className="max-w-content mx-auto lg:grid lg:grid-cols-2 min-h-[520px]">
        {/* ── LEFT — Image with parallax ── */}
        <div className="relative h-72 lg:h-auto overflow-hidden">
          <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[8%] -bottom-[8%]">
            <Image
              src="/images/brand/sourcing.png"
              alt="Golden honey being poured from a wooden dipper"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent" />
        </div>

        {/* ── RIGHT — Text ── */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: HONEY_EASE_OUT }}
            className="font-satoshi text-honey-600 text-[11px] font-bold uppercase tracking-[0.25em] mb-4"
          >
            Our Story
          </motion.span>

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.08, ease: HONEY_EASE_OUT }}
            className="font-clash font-bold text-charcoal tracking-[-0.01em] leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)' }}
          >
            From Wild Hives to Your Table
          </motion.h2>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.16, ease: HONEY_EASE_OUT }}
            className="font-satoshi text-bark text-base leading-relaxed space-y-4 mb-8 max-w-lg"
          >
            <p>
              We source raw, unprocessed honey from wild bee colonies across the Western Ghats,
              Sundarbans mangroves, and Himalayan foothills — partnering with indigenous
              beekeeping families who have harvested these forests for generations.
            </p>
            <p>
              Every jar is traceable to a single apiary, cold-extracted, and lab-tested for purity
              before it reaches you. Nothing added. Nothing taken.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.24, ease: HONEY_EASE_OUT }}
          >
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 font-satoshi text-sm font-semibold text-charcoal hover:text-honey-600 transition-colors"
            >
              Learn More
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
