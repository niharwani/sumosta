import { nanoid } from 'nanoid';

// Best-effort KV put that logs and swallows quota-exceeded / transient errors
// instead of 500-ing the whole request. Use for cache writes AND for session
// writes where the caller already has the auth data in memory — degrading
// gracefully is better than blocking login when KV writes are throttled.
export async function safeKvPut(
  kv: KVNamespace,
  key: string,
  value: string,
  options: KVNamespacePutOptions,
  label: string,
): Promise<boolean> {
  try {
    await kv.put(key, value, options);
    return true;
  } catch (err) {
    console.warn(`[${label}] KV put failed for key=${key}`, err);
    return false;
  }
}

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

// Indian PIN codes we know we can't fulfill from our current pickup network.
// Runs as a floor of correctness before Shiprocket serviceability so the
// buyer can't slip past even when the API fail-opens (missing pickup config,
// Shiprocket outage). Extend cautiously — false positives block real orders.
//   744xxx — Andaman & Nicobar Islands (all)
//   682551–682559 — Lakshadweep atolls (Kavaratti, Agatti, Minicoy, etc.)
export function isKnownNonServiceablePincode(pincode: string): boolean {
  if (/^744\d{3}$/.test(pincode)) return true;
  if (/^68255[1-9]$/.test(pincode)) return true;
  return false;
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

// COMBO10 combo-eligibility.
// The 5 Elements Collection (`prod_trial_box_60g`, "The 5 Elements Collection")
// is a single low-priced SKU containing 5×70g tasting jars — client explicitly
// excluded it from COMBO10 stacking. Match by product id AND by name so cart
// items sent from the storefront (which only carry `name`+`quantity`) are
// caught too.
const COMBO10_EXCLUDED_PRODUCT_IDS = new Set<string>(['prod_trial_box_60g']);
const COMBO10_EXCLUDED_NAME_RX = /5\s*elements\s*collection/i;
const COMBO10_KEYWORDS = ['duo', 'trio', 'pack', 'combo', 'gift', 'bundle', 'set', 'quartet'];

export interface Combo10EligibilityItem {
  productId?: string;
  name: string;
  quantity: number;
}

export function isCombo10Eligible(items: Combo10EligibilityItem[]): boolean {
  const eligible = items.filter((i) => {
    if (i.productId && COMBO10_EXCLUDED_PRODUCT_IDS.has(i.productId)) return false;
    if (COMBO10_EXCLUDED_NAME_RX.test(i.name)) return false;
    return true;
  });
  if (eligible.length === 0) return false;
  const totalQty = eligible.reduce((s, i) => s + i.quantity, 0);
  if (totalQty >= 2) return true;
  return eligible.some((i) =>
    COMBO10_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw)),
  );
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
