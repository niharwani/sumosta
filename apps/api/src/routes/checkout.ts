import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';
import { checkoutSchema } from '../lib/validators';
import { generateId, generateOrderNumber, calcShipping, calcTax } from '../lib/utils';
import { PhonePeService } from '../services/phonepe';

// ── Cart KV types (mirrors cart.ts) ─────────────────────────
interface CartItemKV {
  productId:   string;
  variantId:   string | null;
  quantity:    number;
  unitPrice:   number;
  productName: string;
  imageUrl:    string | null;
}
interface CartKV {
  items:    CartItemKV[];
  subtotal: number;
}

// ── Hono contexts ────────────────────────────────────────────

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; userRole: string; userEmail: string };
};

const app = new Hono<AppEnv>();

// ─── POST /api/checkout ──────────────────────────────────────
app.post(
  '/',
  authMiddleware as any,
  zValidator('json', checkoutSchema),
  async (c) => {
    const userId    = (c as any).get('userId') as string;
    const userEmail = (c as any).get('userEmail') as string;
    const body      = c.req.valid('json');
    const { email, phone, shippingAddress, couponCode } = body;

    // 1. Load cart from KV
    const cartKey = `cart:user:${userId}`;
    const cartRaw = await c.env.KV_CACHE.get(cartKey);
    if (!cartRaw) {
      return c.json({ success: false, error: 'Cart is empty', code: 'EMPTY_CART' }, 400);
    }
    const cart = JSON.parse(cartRaw) as CartKV;

    if (!cart.items.length) {
      return c.json({ success: false, error: 'Cart is empty', code: 'EMPTY_CART' }, 400);
    }

    // 2. Validate stock for every item
    for (const item of cart.items) {
      let available: number;
      if (item.variantId) {
        const row = await c.env.DB.prepare(
          'SELECT stock FROM product_variants WHERE id = ?',
        ).bind(item.variantId).first<{ stock: number }>();
        available = row?.stock ?? 0;
      } else {
        const row = await c.env.DB.prepare(
          'SELECT stock FROM products WHERE id = ? AND is_active = 1',
        ).bind(item.productId).first<{ stock: number }>();
        available = row?.stock ?? 0;
      }

      if (available < item.quantity) {
        return c.json({
          success: false,
          error:   `Insufficient stock for "${item.productName}" (${available} available)`,
          code:    'INSUFFICIENT_STOCK',
        }, 409);
      }
    }

    // 3. Apply coupon (if provided)
    let discount   = 0;
    let appliedCoupon: { id: string; code: string } | null = null;

    if (couponCode) {
      const coupon = await c.env.DB.prepare(`
        SELECT id, code, type, value, min_order_amount, max_usage, usage_count,
               is_first_order_only, expires_at
        FROM coupons
        WHERE code = ? AND is_active = 1
      `).bind(couponCode.toUpperCase())
        .first<{
          id: string; code: string; type: 'percentage' | 'fixed';
          value: number; min_order_amount: number | null; max_usage: number | null;
          usage_count: number; is_first_order_only: number; expires_at: string | null;
        }>();

      if (coupon) {
        const subtotal = cart.subtotal;
        const valid    =
          (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) &&
          (!coupon.max_usage        || coupon.usage_count < coupon.max_usage) &&
          (!coupon.expires_at       || new Date(coupon.expires_at) > new Date());

        if (valid) {
          discount = coupon.type === 'percentage'
            ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
            : Math.min(coupon.value, subtotal);
          appliedCoupon = { id: coupon.id, code: coupon.code };
        }
      }
    }

    // 4. Compute totals
    const subtotal       = cart.subtotal;
    const shipping       = calcShipping(subtotal - discount);
    const tax            = calcTax(subtotal - discount);
    const total          = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    // 5. Create order in D1
    const orderId         = generateId('ord');
    const orderNumber     = generateOrderNumber();
    const estimatedDate   = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]; // +5 days

    await c.env.DB.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, guest_email, status, payment_status,
        shipping_name, shipping_phone,
        shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_pincode,
        subtotal, discount, shipping_amount, tax, total,
        coupon_code, estimated_delivery_date
      ) VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, orderNumber, userId, null,
      shippingAddress.name, shippingAddress.phone,
      shippingAddress.addressLine1, shippingAddress.addressLine2 ?? null,
      shippingAddress.city, shippingAddress.state, shippingAddress.pincode,
      subtotal, discount, shipping, tax, total,
      appliedCoupon?.code ?? null,
      estimatedDate,
    ).run();

    // 6. Insert order items
    const itemInserts = cart.items.map((item) =>
      c.env.DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, line_total, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        generateId('oi'),
        orderId,
        item.productId,
        item.variantId ?? null,
        item.productName,
        item.productId, // use productId as fallback SKU — real SKU fetched if needed
        item.quantity,
        item.unitPrice,
        Math.round(item.unitPrice * item.quantity * 100) / 100,
        item.imageUrl ?? null,
      ),
    );
    await c.env.DB.batch(itemInserts);

    // 7. Increment coupon usage
    if (appliedCoupon) {
      await c.env.DB.prepare(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
      ).bind(appliedCoupon.id).run();
    }

    // 8. Initiate PhonePe payment
    const phonepeBaseUrl = c.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const svc = new PhonePeService(
      c.env.PHONEPE_MERCHANT_ID,
      c.env.PHONEPE_SALT_KEY,
      c.env.PHONEPE_SALT_INDEX,
      phonepeBaseUrl,
    );

    let merchantTransactionId: string;
    let paymentUrl: string;

    try {
      const result = await svc.initiatePayment({
        orderId,
        userId,
        amount:      total,
        redirectUrl: `${c.env.BASE_URL}/api/payments/phonepe/redirect?orderId=${orderId}`,
        callbackUrl: `${c.env.BASE_URL}/api/payments/phonepe/callback`,
      });
      merchantTransactionId = result.merchantTransactionId;
      paymentUrl            = result.paymentUrl;
    } catch (err) {
      // Roll back order on PhonePe failure
      await c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      console.error('[Checkout] PhonePe init failed:', err);
      return c.json({
        success: false,
        error:   'Payment gateway unavailable. Please try again.',
        code:    'PAYMENT_GATEWAY_ERROR',
      }, 502);
    }

    // 9. Store merchantTransactionId on order
    await c.env.DB.prepare(
      'UPDATE orders SET phonepe_merchant_txn_id = ? WHERE id = ?',
    ).bind(merchantTransactionId, orderId).run();

    // 10. Clear user cart
    await c.env.KV_CACHE.delete(cartKey);

    return c.json({
      success: true,
      data:    { orderId, orderNumber, paymentUrl, merchantTransactionId, total },
    });
  },
);

export default app;
