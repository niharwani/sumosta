'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const HEXAGONS = [
  { cx: 50, cy: 28 },
  { cx: 72, cy: 40 },
  { cx: 72, cy: 64 },
  { cx: 50, cy: 76 },
  { cx: 28, cy: 64 },
  { cx: 28, cy: 40 },
  { cx: 50, cy: 52 }, // center
];

const sizeMap = { sm: 32, md: 48, lg: 64 };

interface HoneycombLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function HoneycombLoader({ size = 'md', className }: HoneycombLoaderProps) {
  const px = sizeMap[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      className={cn(className)}
    >
      {HEXAGONS.map((h, i) => (
        <motion.polygon
          key={i}
          points={hexPoints(h.cx, h.cy, 12)}
          fill="#F5A623"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}
