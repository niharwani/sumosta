import { nanoid } from 'nanoid';

export function generateId(prefix: string = ''): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'SUMO-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function calcShipping(subtotal: number): number {
  // Customer-facing rule: free delivery above ₹499, else flat ₹69.
  // Keep this in sync with apps/web/src/stores/cart-store.ts::computeDerived
  // and the marketing copy in AnnouncementBar / shipping policy / trust badges.
  return subtotal >= 499 ? 0 : 69;
}

export function calcTax(_subtotal: number): number {
  // SUMOSTA product prices are tax-inclusive (MRP) — no additional tax at
  // checkout. Keeping the function returning 0 so existing callers and the
  // orders.tax column don't need to be reworked; tax lines in the UI are
  // conditionally hidden when the value is 0.
  return 0;
}

// Whether a user has any previously placed order that "counts" as their first
// order for the purposes of first-order-only coupons like WELCOME10.
// Cancelled and payment-failed orders don't count — those are aborted attempts.
// Everything else (COD pending, prepaid captured, shipped, delivered, refunded)
// means the customer has already placed a real order and is no longer first-time.
export async function hasQualifyingPriorOrder(
  db: D1Database,
  userId: string,
): Promise<boolean> {
  const row = await db.prepare(`
    SELECT id FROM orders
    WHERE user_id = ?
      AND status != 'cancelled'
      AND payment_status != 'failed'
    LIMIT 1
  `).bind(userId).first<{ id: string }>();
  return row !== null;
}
