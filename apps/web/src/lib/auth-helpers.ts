/**
 * Shared helpers for the customer-facing auth flow.
 *
 * These helpers are used by /auth/login, /auth/register, and /auth/google-callback
 * to keep behaviour identical across every entry point.
 */

import { cartApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';

// ============================================================
// Guest → server cart merge (runs after any successful login)
// ============================================================

/**
 * After a successful login, push each item from the guest (local) cart to the
 * server-side cart. Failures are swallowed (best-effort) so a broken cart
 * merge never blocks the sign-in flow.
 */
export async function mergeGuestCart(): Promise<void> {
  const items = useCartStore.getState().items;
  if (!items || items.length === 0) return;

  for (const item of items) {
    try {
      await cartApi.addItem({
        productId: item.productId,
        variantId: item.variantId ?? undefined,
        quantity:  item.quantity,
      });
    } catch (err) {
      // Cart merge failure must never block login — surface to console only.
      // eslint-disable-next-line no-console
      console.warn('[auth] guest-cart merge failed for item', item.productId, err);
    }
  }
}

// ============================================================
// Safe redirect / `next` param whitelist
// ============================================================

const SAFE_NEXT_PREFIXES = [
  '/account',
  '/checkout',
  '/cart',
  '/product/',
  '/shop',
  '/track',
];

/**
 * Validate a `?next=` redirect target against a whitelist.
 *
 * Allowed:  `/`, `/account`, `/account/...`, `/checkout`, `/cart`,
 *           `/product/...`, `/shop`, `/track`
 * Rejected: anything under `/api`, `/admin`, or an absolute URL / open redirect.
 *
 * Falls back to `defaultPath` (default `/account/orders`).
 */
export function resolveSafeNext(
  next: string | null | undefined,
  defaultPath: string = '/account/orders',
): string {
  if (!next) return defaultPath;

  // Reject absolute URLs and protocol-relative URLs.
  if (!next.startsWith('/') || next.startsWith('//')) return defaultPath;

  // Reject explicitly-blocked prefixes.
  if (next.startsWith('/api/') || next === '/api') return defaultPath;
  if (next.startsWith('/admin/') || next === '/admin') return defaultPath;

  // Root is fine.
  if (next === '/') return next;

  // Anything that matches the whitelist is fine.
  const isWhitelisted = SAFE_NEXT_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`) || next.startsWith(`${prefix}?`),
  );

  return isWhitelisted ? next : defaultPath;
}

// ============================================================
// Password-strength meter (shared by /register and /reset-password)
// ============================================================

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  score:   0 | 1 | 2 | 3 | 4;   // 0 = empty, 4 = strong
  label:   PasswordStrength;
  message: string;
}

/**
 * Very small heuristic strength meter. Not a security control — the server
 * enforces the real rules — this exists purely for user feedback.
 */
export function scorePassword(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: 'empty', message: '' };
  }

  let score = 0;
  if (password.length >= 8)  score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  // Clamp to 1..4 once we have any characters at all.
  const clamped = Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;

  if (clamped <= 1) return { score: 1, label: 'weak',   message: 'Weak — try 8+ characters with a mix of cases.' };
  if (clamped === 2) return { score: 2, label: 'weak',   message: 'Weak — add numbers, symbols, or more length.' };
  if (clamped === 3) return { score: 3, label: 'medium', message: 'Medium — good, add a symbol or make it longer.' };
  return { score: 4, label: 'strong', message: 'Strong password.' };
}
