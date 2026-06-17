'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';

interface AnimatedTextProps {
  text: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  splitBy?: 'char' | 'word';
}

export default function AnimatedText({
  text,
  tag: Tag = 'h2',
  className,
  delay = 0,
  splitBy = 'char',
}: AnimatedTextProps) {
  const { ref, inView } = useInView(0.3, true);
  const animated = useRef(false);

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!inView || animated.current || prefersReduced) return;
    animated.current = true;

    import('animejs').then(({ default: anime }) => {
      const container = ref.current;
      if (!container) return;
      anime({
        targets: container.querySelectorAll('.anim-unit'),
        opacity: [0, 1],
        translateY: [40, 0],
        easing: 'cubicBezier(0.25, 0.1, 0.25, 1.0)',
        duration: 800,
        delay: anime.stagger(splitBy === 'char' ? 25 : 60, { start: delay }),
      });
    });
  }, [inView, delay, splitBy, prefersReduced, ref]);

  const units =
    splitBy === 'char'
      ? text.split('').map((ch, i) => (
          <span key={i} className="anim-unit inline-block" style={{ opacity: prefersReduced ? 1 : 0 }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))
      : text.split(' ').map((word, i) => (
          <span key={i} className="anim-unit inline-block mr-[0.25em]" style={{ opacity: prefersReduced ? 1 : 0 }}>
            {word}
          </span>
        ));

  return (
    <Tag ref={ref as any} className={cn(className)}>
      {units}
    </Tag>
  );
}
