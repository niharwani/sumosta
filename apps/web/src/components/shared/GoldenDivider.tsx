'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GoldenDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center my-8', className)}>
      <motion.svg
        width="200"
        height="24"
        viewBox="0 0 200 24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.line
          x1="0" y1="12" x2="80" y2="12"
          stroke="#F5A623" strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* honey drip teardrop */}
        <motion.path
          d="M100 4 C100 4, 108 12, 108 16 C108 20.4 104.4 24 100 24 C95.6 24 92 20.4 92 16 C92 12 100 4 100 4Z"
          fill="#F5A623"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '100px 12px' }}
        />
        <motion.line
          x1="120" y1="12" x2="200" y2="12"
          stroke="#F5A623" strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>
    </div>
  );
}
