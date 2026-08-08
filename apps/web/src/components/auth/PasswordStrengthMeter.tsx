'use client';

import { scorePassword } from '@/lib/auth-helpers';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

/**
 * A compact 4-segment strength meter shown beneath a new-password input.
 * Uses the shared `scorePassword()` heuristic — safe for weak/medium/strong
 * user feedback (not a security control).
 */
export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score, label, message } = scorePassword(password);

  if (score === 0) return null;

  const segmentColors: string[] = [
    score >= 1 ? colorFor(label) : 'bg-[--sand]',
    score >= 2 ? colorFor(label) : 'bg-[--sand]',
    score >= 3 ? colorFor(label) : 'bg-[--sand]',
    score >= 4 ? colorFor(label) : 'bg-[--sand]',
  ];

  return (
    <div className={cn('mt-2', className)} aria-live="polite">
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score}>
        {segmentColors.map((cls, i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', cls)} />
        ))}
      </div>
      <p className="mt-1 font-satoshi text-xs text-[--earth]">{message}</p>
    </div>
  );
}

function colorFor(label: 'empty' | 'weak' | 'medium' | 'strong'): string {
  switch (label) {
    case 'weak':   return 'bg-[--terracotta]';
    case 'medium': return 'bg-[--honey-300]';
    case 'strong': return 'bg-[--sage]';
    default:       return 'bg-[--sand]';
  }
}

export default PasswordStrengthMeter;
