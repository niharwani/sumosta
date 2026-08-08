'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Visible label — always associated with the input via `htmlFor`. */
  label: string;
  /** Optional supporting hint rendered under the input when no error is set. */
  hint?: string;
  /** Error text; when supplied, replaces `hint` and gets `role="alert"`. */
  error?: string;
  /** Override the auto-generated id (needed when a parent already owns one). */
  id?: string;
}

/**
 * Shared text/email/password/tel input used across every auth page.
 *
 * - Always associates label + input via matching id/htmlFor
 * - Wires error text via aria-describedby / role=alert
 * - Uses the design-system focus ring (--honey-400) and cream surfaces
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, hint, error, id: idProp, className, ...inputProps },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? `auth-field-${autoId}`;
  const describedById = error || hint ? `${id}-desc` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-satoshi text-[--charcoal] text-sm font-medium mb-1.5"
      >
        {label}
      </label>

      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-3 font-satoshi text-sm text-[--charcoal] placeholder:text-[--earth-light]',
          'transition-colors outline-none',
          'focus:ring-2 focus:ring-[--honey-400] focus:border-[--honey-400]',
          error
            ? 'border-[--terracotta] focus:border-[--terracotta] focus:ring-[--terracotta]'
            : 'border-[--sand]',
          className,
        )}
        {...inputProps}
      />

      {error ? (
        <p
          id={describedById}
          role="alert"
          className="mt-1.5 font-satoshi text-[--terracotta] text-xs"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={describedById}
          className="mt-1.5 font-satoshi text-[--earth] text-xs"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default AuthField;
