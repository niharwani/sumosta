'use client';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.div>
  );
}
