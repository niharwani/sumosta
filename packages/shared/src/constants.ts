export const FREE_SHIPPING_THRESHOLD = 500;
export const TAX_RATE = 0.05; // 5% GST on food items

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'captured',
  'failed',
  'refunded',
] as const;
