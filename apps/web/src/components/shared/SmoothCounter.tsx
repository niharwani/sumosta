'use client';
import { useEffect, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

interface SmoothCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function SmoothCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  className,
}: SmoothCounterProps) {
  const { ref, inView } = useInView(0.5, true);
  const spanRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      if (spanRef.current) spanRef.current.textContent = value.toLocaleString('en-IN');
      return;
    }

    import('animejs').then(({ default: anime }) => {
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: value,
        duration,
        easing: 'cubicBezier(0.25, 0.1, 0.25, 1.0)',
        update: () => {
          if (spanRef.current) {
            spanRef.current.textContent = `${prefix}${Math.round(obj.val).toLocaleString('en-IN')}${suffix}`;
          }
        },
      });
    });
  }, [inView, value, prefix, suffix, duration]);

  return (
    <span ref={ref as any} className={className}>
      <span ref={spanRef}>{prefix}0{suffix}</span>
    </span>
  );
}
