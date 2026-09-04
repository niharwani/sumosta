import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { verifyJwt } from '../lib/jwt';
import { hasQualifyingPriorOrder } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

const validateSchema = z.object({
  code:      z.string().min(1),
  cartTotal: z.number().positive(),
  cartItems: z.array(z.object({ name: z.string(), quantity: z.number().int().positive() })).optional(),
});

const COMBO_KEYWORDS = ['duo', 'trio', 'pack', 'combo', 'gift', 'bundle', 'collection', 'set'];

function isComboEligible(items: { name: string; quantity: number }[]): boolean {
  if (items.length >= 2) return true;
  return items.some((i) => COMBO_KEYWORDS.some((kw) => i.name.toLowerCase().includes(kw)));
}

// ─── POST /api/coupons/validate ──────────────────────────────
app.post('/validate', zValidator('json', validateSchema), async (c) => {
  const { code, cartTotal, cartItems } = c.req.valid('json');

  const coupon = await c.env.DB.prepare(`
    SELECT id, code, type, value, min_order_amount, max_usage, usage_count,
           is_first_order_only, is_active, expires_at
    FROM coupons
    WHERE code = ? AND is_active = 1
  `).bind(code.toUpperCase())
    .first<{
      id: string; code: string; type: 'percentage' | 'fixed';
      value: number; min_order_amount: number | null; max_usage: number | null;
      usage_count: number; is_first_order_only: number; is_active: number;
      expires_at: string | null;
    }>();

  if (!coupon) {
    return c.json({ success: true, data: { valid: false, error: 'Invalid or expired coupon code' } });
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return c.json({ success: true, data: { valid: false, error: 'This coupon has expired' } });
  }

  // Check usage limit
  if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
    return c.json({ success: true, data: { valid: false, error: 'Coupon has reached its usage limit' } });
  }

  // Check minimum order amount
  if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
    return c.json({
      success: true,
      data: {
        valid: false,
        error: `Minimum order of ₹${coupon.min_order_amount} required for ${coupon.code}`,
      },
    });
  }

  // Combo-only check
  if (coupon.code === 'COMBO10') {
    const items = cartItems ?? [];
    if (!isComboEligible(items)) {
      return c.json({
        success: true,
        data: {
          valid: false,
          error: 'COMBO10 applies to 2+ products or combo/gift products (Duo, Trio, Pack, etc.)',
        },
      });
    }
  }

  // First-order-only check — requires authenticated user with no prior paid orders
  if (coupon.is_first_order_only) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({
        success: true,
        data: { valid: false, error: 'Please log in to use this coupon' },
      });
    }

    let userId: string;
    try {
      const payload = await verifyJwt(authHeader.slice(7), c.env.JWT_SECRET);
      userId = payload.sub as string;
    } catch {
      return c.json({
        success: true,
        data: { valid: false, error: 'Please log in to use this coupon' },
      });
    }

    if (await hasQualifyingPriorOrder(c.env.DB, userId)) {
      return c.json({
        success: true,
        data: { valid: false, error: `${coupon.code} is for first-time customers only` },
      });
    }
  }

  const discount =
    coupon.type === 'percentage'
      ? Math.round((cartTotal * coupon.value) / 100)
      : Math.min(coupon.value, cartTotal);

  return c.json({
    success: true,
    data: {
      valid: true,
      discount,
      coupon: {
        id:               coupon.id,
        code:             coupon.code,
        type:             coupon.type,
        value:            coupon.value,
        minOrderAmount:   coupon.min_order_amount,
        maxUsage:         coupon.max_usage,
        usageCount:       coupon.usage_count,
        isFirstOrderOnly: coupon.is_first_order_only === 1,
        isActive:         true,
        expiresAt:        coupon.expires_at,
      },
    },
  });
});

// ─── GET /api/coupons/first-order-eligible ───────────────────
// Cheap probe so the storefront can decide whether to advertise the
// first-order discount (WELCOME10) to a signed-in user. Guests get
// `eligible: true` since we don't know their order history.
app.get('/first-order-eligible', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: true, data: { eligible: true, reason: 'guest' } });
  }

  let userId: string;
  try {
    const payload = await verifyJwt(authHeader.slice(7), c.env.JWT_SECRET);
    userId = payload.sub as string;
  } catch {
    return c.json({ success: true, data: { eligible: true, reason: 'guest' } });
  }

  const eligible = !(await hasQualifyingPriorOrder(c.env.DB, userId));
  return c.json({
    success: true,
    data: { eligible, reason: eligible ? 'new_customer' : 'returning_customer' },
  });
});

export default app;
