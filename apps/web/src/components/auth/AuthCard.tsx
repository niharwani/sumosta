'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HONEY_EASE_OUT } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  /** Card title, rendered in Clash Display. */
  title: string;
  /** Optional supporting copy shown below the title. */
  subtitle?: string;
  /** Optional back-link. Rendered above the card if supplied. */
  back?: { href: string; label: string };
  /** Card body — form(s), banners, footer link, etc. */
  children: React.ReactNode;
  /** Extra classes for the outer container (rarely needed). */
  className?: string;
  /** Max-width preset for the inner column. Defaults to `md`. */
  size?: 'sm' | 'md';
}

/**
 * Shared shell used by every customer auth page. Wraps content in the design
 * system's cream/warm-honey card treatment and applies the standard
 * fade-up entrance (respecting `prefers-reduced-motion`).
 */
export function AuthCard({
  title,
  subtitle,
  back,
  children,
  className,
  size = 'md',
}: AuthCardProps) {
  const reduce = useReducedMotion();

  const initial = reduce ? undefined : { opacity: 0, y: 24 };
  const animate = reduce ? undefined : { opacity: 1, y: 0 };
  const transition = reduce
    ? undefined
    : { duration: 0.6, ease: HONEY_EASE_OUT };

  const maxWidth = size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <div className={cn('min-h-screen bg-[--cream] flex items-center justify-center px-6 py-20', className)}>
      <div className={cn('w-full', maxWidth)}>
        {back ? (
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 font-satoshi text-[--earth] text-sm hover:text-[--charcoal] transition-colors mb-6"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}

        <div className="text-center mb-8">
          <h1 className="font-clash font-semibold text-[--charcoal] text-3xl md:text-4xl mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="font-satoshi text-[--earth] text-sm md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <motion.div
          initial={initial}
          animate={animate}
          transition={transition}
          className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-8 shadow-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthCard;
