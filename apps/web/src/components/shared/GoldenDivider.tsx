'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Thin golden line with a decorative honey drip in the middle.
 * The drip strokes draw themselves in on scroll.
 */
export default function GoldenDivider({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn('flex items-center justify-center w-full my-8 md:my-12 px-6', className)}
      aria-hidden
    >
      <div className="flex items-center justify-center gap-4 w-full max-w-[280px]">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-honey-300 to-honey-300" />

        <motion.svg
          width="14"
          height="20"
          viewBox="0 0 14 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Drip stroke */}
          <motion.path
            d="M7 1 C 7 6, 4 8, 4 12 C 4 15.5, 5.5 17.5, 7 17.5 C 8.5 17.5, 10 15.5, 10 12 C 10 8, 7 6, 7 1 Z"
            stroke="#F5A623"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Drip fill dot */}
          <circle cx="7" cy="14" r="2.4" fill="#F5A623" />
        </motion.svg>

        <span className="flex-1 h-px bg-gradient-to-l from-transparent via-honey-300 to-honey-300" />
      </div>
    </div>
  );
}
