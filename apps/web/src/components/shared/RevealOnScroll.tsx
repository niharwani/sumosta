'use client';
import { useAnimeReveal } from '@/hooks/useAnimeReveal';
import { cn } from '@/lib/utils';

type VariantMap = {
  fadeUp: 'fadeUp';
  fadeIn: 'fadeIn';
  scaleIn: 'scaleIn';
  slideInLeft: 'slideLeft';
  slideInRight: 'slideRight';
};

const mapVariant: Record<string, 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight'> = {
  fadeUp: 'fadeUp',
  fadeIn: 'fadeIn',
  scaleIn: 'scaleIn',
  slideInLeft: 'slideLeft',
  slideInRight: 'slideRight',
};

interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: keyof VariantMap;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function RevealOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 800,
  className,
  once = true,
}: RevealOnScrollProps) {
  const animeVariant = mapVariant[variant] || 'fadeUp';
  const ref = useAnimeReveal<HTMLDivElement>({
    variant: animeVariant,
    delay: delay * 1000, // convert seconds to ms
    duration,
    once,
  });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
