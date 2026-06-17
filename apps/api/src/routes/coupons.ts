import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

const validateSchema = z.object({
  code:      z.string().min(1),
  cartTotal: z.number().positive(),
});

// ─── POST /api/coupons/validate ──────────────────────────────
app.post('/validate', zValidator('json', validateSchema), async (c) => {
  const { code, cartTotal } = c.req.valid('json');

  const coupon = await c.env.DB.prepare(`
    SELECT id, code, type, value, min_order_amount, max_usage, usage_count,
           is_first_order_only, expires_at
    FROM coupons
    WHERE code = ? AND is_active = 1
  `).bind(code.toUpperCase())
    .first<{
      id: string; code: string; type: 'percentage' | 'fixed';
      value: number; min_order_amount: number | null; max_usage: number | null;
      usage_count: number; is_first_order_only: number; expires_at: string | null;
    }>();

  if (!coupon) {
    return c.json({ success: true, data: { valid: false, error: 'Invalid or expired coupon code' } });
  }

  // Check minimum order amount
  if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
    return c.json({
      success: true,
      data: {
        valid: false,
        error: `Minimum order of ₹${coupon.min_order_amount} required for this coupon`,
      },
    });
  }

  // Check usage limit
  if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
    return c.json({ success: true, data: { valid: false, error: 'Coupon has reached its usage limit' } });
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return c.json({ success: true, data: { valid: false, error: 'Coupon has expired' } });
  }

  const discount = coupon.type === 'percentage'
    ? Math.round(cartTotal * (coupon.value / 100) * 100) / 100
    : Math.min(coupon.value, cartTotal);

  return c.json({
    success: true,
    data: {
      valid:    true,
      discount,
      coupon: {
        id:    coupon.id,
        code:  coupon.code,
        type:  coupon.type,
        value: coupon.value,
      },
    },
  });
});

export default app;
