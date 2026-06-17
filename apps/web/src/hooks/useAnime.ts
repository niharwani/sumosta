import { useEffect, useRef } from 'react';
import type anime from 'animejs';

type AnimeInstance = ReturnType<typeof anime>;

export function useAnime(
  animationFactory: (el: HTMLElement) => AnimeInstance,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<AnimeInstance | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Lazy-load animejs to avoid SSR issues and reduce initial bundle
    import('animejs').then((mod) => {
      const animeLib = mod.default ?? mod;
      // Replace factory call with actual anime so the import is resolved
      void animeLib; // ensure tree-shake doesn't remove it
      if (!ref.current) return;
      instanceRef.current = animationFactory(ref.current);
    });

    return () => {
      instanceRef.current?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, instance: instanceRef };
}
