'use client';

import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { cn } from '@/lib/utils';

interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
}

/**
 * Primary CTA used on every auth page. Renders the design-system
 * honey button with a HoneycombLoader when in the loading state.
 */
export function AuthSubmitButton({
  loading,
  loadingLabel = 'Working…',
  disabled,
  className,
  children,
  ...rest
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cn(
        'w-full inline-flex items-center justify-center gap-2',
        'rounded-full px-6 py-3',
        'bg-[--honey-400] text-[--charcoal] font-satoshi font-semibold text-sm md:text-base',
        'hover:bg-[--honey-500] active:bg-[--honey-500] transition-colors',
        'shadow-[0_8px_30px_rgba(245,166,35,0.2)]',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] focus-visible:ring-offset-2 focus-visible:ring-offset-[--cream-warm]',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <span role="status" aria-label="Loading" className="inline-flex">
            <HoneycombLoader size="sm" />
          </span>
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AuthSubmitButton;
