'use client';
import { useRef } from 'react';
import { useMotionValue, useSpring, type SpringOptions } from 'framer-motion';

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig: SpringOptions = { stiffness: 100, damping: 20, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handlers = {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    },
    onMouseLeave: () => {
      x.set(0);
      y.set(0);
    },
  };

  return { ref, x: springX, y: springY, handlers };
}
