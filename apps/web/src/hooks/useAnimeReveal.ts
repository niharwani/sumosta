'use client';
import { useEffect, useRef, useCallback } from 'react';

type RevealVariant = 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'staggerUp';

interface UseAnimeRevealOptions {
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  staggerDelay?: number;
  staggerSelector?: string;
}

const VARIANT_CONFIG: Record<RevealVariant, object> = {
  fadeUp: {
    opacity: [0, 1],
    translateY: [50, 0],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
  },
  fadeIn: {
    opacity: [0, 1],
    easing: 'cubicBezier(0.25, 0.1, 0.25, 1)',
  },
  scaleIn: {
    opacity: [0, 1],
    scale: [0.92, 1],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
  },
  slideLeft: {
    opacity: [0, 1],
    translateX: [-60, 0],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
  },
  slideRight: {
    opacity: [0, 1],
    translateX: [60, 0],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
  },
  staggerUp: {
    opacity: [0, 1],
    translateY: [40, 0],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
  },
};

export function useAnimeReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseAnimeRevealOptions = {},
) {
  const {
    variant = 'fadeUp',
    delay = 0,
    duration = 800,
    threshold = 0.15,
    once = true,
    staggerDelay = 80,
    staggerSelector,
  } = options;

  const ref = useRef<T>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (!ref.current) return;

    const prefersReduced =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (prefersReduced) {
      // Just show elements immediately
      ref.current.style.opacity = '1';
      if (staggerSelector) {
        ref.current.querySelectorAll(staggerSelector).forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
      }
      return;
    }

    import('animejs').then(({ default: anime }) => {
      if (!ref.current) return;

      const config = VARIANT_CONFIG[variant];
      const targets =
        variant === 'staggerUp' && staggerSelector
          ? ref.current.querySelectorAll(staggerSelector)
          : ref.current;

      anime({
        targets,
        ...config,
        duration,
        delay:
          variant === 'staggerUp' && staggerSelector
            ? anime.stagger(staggerDelay, { start: delay })
            : delay,
      });
    });
  }, [variant, delay, duration, staggerDelay, staggerSelector]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = '0';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          hasAnimated.current = true;
          animate();
          if (once) observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, animate]);

  return ref;
}
