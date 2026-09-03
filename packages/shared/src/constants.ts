export const FREE_SHIPPING_THRESHOLD = 500;
export const TAX_RATE = 0.05; // 5% GST on food items

// Handling fee applied to Cash-on-Delivery orders. Client + server MUST both
// import this — do NOT hard-code the number anywhere else, or the displayed
// checkout total drifts from the amount actually charged.
export const COD_HANDLING_FEE = 69;

// Standard shipping charged when the order is below FREE_SHIPPING_THRESHOLD.
export const STANDARD_SHIPPING_FEE = 69;

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
