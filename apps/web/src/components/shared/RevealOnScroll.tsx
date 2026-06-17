'use client';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight } from '@/lib/animations';
import { cn } from '@/lib/utils';

const variants = { fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight };

interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  className?: string;
  once?: boolean;
}

export default function RevealOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  className,
  once = true,
}: RevealOnScrollProps) {
  const selected = variants[variant];
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={selected}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
