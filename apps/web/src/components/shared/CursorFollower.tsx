'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function CursorFollower() {
  const isTouchDevice = useMediaQuery('(hover: none)');
  const [label, setLabel] = useState('');
  const [expanded, setExpanded] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const x = useSpring(mx, { stiffness: 200, damping: 28 });
  const y = useSpring(my, { stiffness: 200, damping: 28 });

  useEffect(() => {
    if (isTouchDevice) return;

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cursor-text]');
      if (target) {
        setLabel(target.getAttribute('data-cursor-text') ?? '');
        setExpanded(true);
      } else if ((e.target as HTMLElement).closest('a, button, [role="button"]')) {
        setLabel('');
        setExpanded(true);
      } else {
        setExpanded(false);
        setLabel('');
      }
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
    };
  }, [isTouchDevice, mx, my]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center rounded-full mix-blend-difference"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        backgroundColor: '#F5A623',
      }}
      animate={{
        width:  expanded ? 48 : 8,
        height: expanded ? 48 : 8,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {expanded && label && (
        <span className="text-midnight text-[9px] font-satoshi font-bold uppercase tracking-widest">
          {label}
        </span>
      )}
    </motion.div>
  );
}
