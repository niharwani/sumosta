'use client';
import { motion } from 'framer-motion';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  className?: string;
  children: React.ReactNode;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.3,
  ...rest
}: MagneticButtonProps) {
  const isTouchDevice = useMediaQuery('(hover: none)');
  const { ref, x, y, handlers } = useMagnetic(strength);

  if (isTouchDevice) {
    return (
      <button className={cn(className)} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      className={cn(className)}
      style={{ x, y }}
      {...(handlers as any)}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
