'use client';
import { cn } from '@/lib/utils';

export default function GoldenDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center my-8 w-full px-4', className)}>
      <div className="h-px bg-honey-300 w-full max-w-[200px]" />
    </div>
  );
}

