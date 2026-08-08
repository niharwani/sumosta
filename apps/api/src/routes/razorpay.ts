import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { verifyJwt } from '../lib/jwt';
import { RazorpayService } from '../services/razorpay';
import { generateId, generateOrderNumber, calcShipping, calcTax } from '../lib/utils';
import { sendOrderConfirmation } from '../services/email';

// ── Resolved-from-DB item (never trusts client-supplied price) ─
interface ResolvedItem {
  productId:   string;
  variantId:   string | null;
  quantity:    number;
  unitPrice:   number;      // from D1 or client fallback
  productName: string;
  imageUrl:    string | null;
  fromFallback: boolean;    // true when the product wasn't in D1
}

// Fallback category id — must exist in D1 (see categories table).
const FALLBACK_CATEGORY_ID = 'cat_raw_honey';

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; userRole: string; userEmail: string };
};

const app = new Hono<AppEnv>();

// ── Request schemas — kept permissive to match the frontend payload today.
const shippingSchema = z.object({
  name:    z.string().min(2),
  phone:   z.string().regex(/^\d{10}$/),
  line1:   z.string().min(5),
  line2:   z.string().optional().nullable(),
  city:    z.string().min(2),
  state:   z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
});

const cartItemSchema = z.object({
  productId:   z.string().min(1),
  variantId:   z.string().min(1).nullable().optional(),
  quantity:    z.number().int().min(1).max(50),
  // Fallback fields used ONLY when the product isn't in D1 (static frontend catalog).
  // TODO: once the D1 catalog is fully seeded from content.ts, drop these and enforce
  // D1-authoritative pricing everywhere. In the meantime, DO NOT switch to rzp_live_*
  // without seeding first — a tampered client could send a lower unitPrice.
  unitPrice:   z.number().positive().optional(),
  productName: z.string().min(1).optional(),
});

const createOrderSchema = z.object({
  email:           z.string().email(),
  shippingAddress: shippingSchema,
  couponCodes:     z.array(z.string()).optional().default([]),
  items:           z.array(cartItemSchema).min(1, 'Cart is empty'),
});

const verifySchema = z.object({
  orderId:             z.string().min(1),
  razorpay_order_id:   z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature:  z.string().min(1),
});

function getService(env: Bindings): RazorpayService {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  return new RazorpayService(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
}

// Best-effort user extraction: if a valid JWT is present, use it; otherwise the
// request is treated as a guest checkout. Never rejects.
async function resolveOptionalUser(
  authHeader: string | undefined,
  jwtSecret: string,
): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyJwt(authHeader.slice(7), jwtSecret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

// ─── POST /api/payments/razorpay/create-order ────────────────
// Validates cart + coupons, creates a pending order in D1, calls Razorpay
// to create their order, returns everything the browser needs to open Checkout.
app.post(
  '/create-order',
  zValidator('json', createOrderSchema, (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path?.join('.') || 'field';
      return c.json({
        success: false,
        error:   `${field}: ${first?.message ?? 'invalid'}`,
        code:    'VALIDATION_ERROR',
        issues:  result.error.issues,
      }, 400);
    }
  }),
  async (c) => {
    const rawUserId = await resolveOptionalUser(c.req.header('Authorization'), c.env.JWT_SECRET);
    const body      = c.req.valid('json');
    const { email, shippingAddress, couponCodes, items } = body;

    try {
    // Verify the JWT-derived user actually exists in D1 (avoid FK failure on orders.user_id).
    let userId: string | null = null;
    if (rawUserId) {
      const exists = await c.env.DB.prepare('SELECT 1 FROM users WHERE id = ?')
        .bind(rawUserId).first();
      if (exists) userId = rawUserId;
      else console.warn(`[razorpay] JWT userId ${rawUserId} not in users table — treating as guest`);
    }
    // 1. Resolve each cart item against D1 — this is the source of truth for
    //    both stock and price. Client-supplied prices are ignored.
    const resolved: ResolvedItem[] = [];
    for (const it of items) {
      const variantId = it.variantId ?? null;

      const row = variantId
        ? await c.env.DB.prepare(`
            SELECT pv.stock, (p.price + pv.price_adjust) AS price, p.name,
                   pi.url AS image_url
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE pv.id = ? AND p.id = ? AND p.is_active = 1
          `).bind(variantId, it.productId)
            .first<{ stock: number; price: number; name: string; image_url: string | null }>()
        : await c.env.DB.prepare(`
            SELECT p.stock, p.price, p.name, pi.url AS image_url
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.id = ? AND p.is_active = 1
          `).bind(it.productId)
            .first<{ stock: number; price: number; name: string; image_url: string | null }>();

      if (!row) {
        // Fallback: accept client-supplied price/name (see cartItemSchema comment).
        if (typeof it.unitPrice === 'number' && it.productName) {
          console.warn(`[razorpay] product ${it.productId} not in D1 — using client-supplied price/name`);
          resolved.push({
            productId:   it.productId,
            variantId:   null,       // stub product has no variants; null keeps FK happy
            quantity:    it.quantity,
            unitPrice:   it.unitPrice,
            productName: it.productName,
            imageUrl:    null,
            fromFallback: true,
          });
          continue;
        }
        return c.json({
          success: false,
          error:   `Product ${it.productId} not found or inactive`,
          code:    'PRODUCT_NOT_FOUND',
        }, 404);
      }

      if (row.stock < it.quantity) {
        return c.json({
          success: false,
          error:   `Insufficient stock for "${row.name}" (${row.stock} available)`,
          code:    'INSUFFICIENT_STOCK',
        }, 409);
      }

      resolved.push({
        productId:   it.productId,
        variantId,
        quantity:    it.quantity,
        unitPrice:   row.price,
        productName: row.name,
        imageUrl:    row.image_url,
        fromFallback: false,
      });
    }

    // For fallback items, insert stub product rows so the FK from order_items is satisfied.
    // Marked is_active = 0 to keep them out of shop listings.
    const stubInserts = resolved
      .filter((r) => r.fromFallback)
      .map((r) =>
        c.env.DB.prepare(`
          INSERT OR IGNORE INTO products (
            id, name, slug, sku, category_id, short_description, description,
            price, stock, is_active
          ) VALUES (?, ?, ?, ?, ?, '', '', ?, 0, 0)
        `).bind(
          r.productId,
          r.productName,
          r.productId,      // slug = productId (unique)
          r.productId,      // sku  = productId (unique)
          FALLBACK_CATEGORY_ID,
          r.unitPrice,
        ),
      );
    if (stubInserts.length) await c.env.DB.batch(stubInserts);

    const cart = {
      items:    resolved,
      subtotal: Math.round(
        resolved.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100,
      ) / 100,
    };

    // 3. Apply coupons (accepts an array from the frontend to match current cart-store behavior)
    let discount = 0;
    const appliedCoupons: { id: string; code: string }[] = [];
    const subtotal = cart.subtotal;

    for (const rawCode of couponCodes) {
      const code = rawCode.toUpperCase();
      const coupon = await c.env.DB.prepare(`
        SELECT id, code, type, value, min_order_amount, max_usage, usage_count, expires_at
        FROM coupons
        WHERE code = ? AND is_active = 1
      `).bind(code).first<{
        id: string; code: string; type: 'percentage' | 'fixed';
        value: number; min_order_amount: number | null;
        max_usage: number | null; usage_count: number; expires_at: string | null;
      }>();
      if (!coupon) continue;

      const valid =
        (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) &&
        (!coupon.max_usage        || coupon.usage_count < coupon.max_usage) &&
        (!coupon.expires_at       || new Date(coupon.expires_at) > new Date());
      if (!valid) continue;

      const amount = coupon.type === 'percentage'
        ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
        : Math.min(coupon.value, subtotal);
      discount += amount;
      appliedCoupons.push({ id: coupon.id, code: coupon.code });
    }
    discount = Math.min(discount, subtotal);

    // 4. Compute totals (server is source of truth)
    const shipping = calcShipping(subtotal - discount);
    const tax      = calcTax(subtotal - discount);
    const total    = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    if (total < 1) {
      return c.json({ success: false, error: 'Order total is below the minimum (₹1)', code: 'AMOUNT_TOO_LOW' }, 400);
    }

    // 5. Persist a pending order
    const orderId       = generateId('ord');
    const orderNumber   = generateOrderNumber();
    const estimatedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const couponSummary = appliedCoupons.map((c) => c.code).join(',') || null;

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
      orderId, orderNumber, userId, email,
      shippingAddress.name, shippingAddress.phone,
      shippingAddress.line1, shippingAddress.line2 ?? null,
      shippingAddress.city, shippingAddress.state, shippingAddress.pincode,
      subtotal, discount, shipping, tax, total,
      couponSummary, estimatedDate,
    ).run();

    // 6. Insert order items
    const itemInserts = cart.items.map((item) =>
      c.env.DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, line_total, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        generateId('oi'), orderId, item.productId, item.variantId ?? null,
        item.productName, item.productId, item.quantity, item.unitPrice,
        Math.round(item.unitPrice * item.quantity * 100) / 100,
        item.imageUrl ?? null,
      ),
    );
    await c.env.DB.batch(itemInserts);

    // 7. Create the Razorpay order
    let razorpayOrder;
    try {
      const svc = getService(c.env);
      razorpayOrder = await svc.createOrder({
        amount:   total,
        currency: 'INR',
        receipt:  orderNumber,
        notes:    { orderId, userId: userId ?? 'guest', email },
      });
    } catch (err) {
      // Roll back the order so the user can retry cleanly
      await c.env.DB.prepare('DELETE FROM order_items WHERE order_id = ?').bind(orderId).run();
      await c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      console.error('[Razorpay] create-order failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const isAuth = /401|unauthor/i.test(msg);
      return c.json({
        success: false,
        error:   'Payment gateway unavailable. Please try again.',
        detail:  msg,
        code:    isAuth ? 'GATEWAY_AUTH_ERROR' : 'GATEWAY_ERROR',
      }, isAuth ? 401 : 502);
    }

    // 8. Store the Razorpay order id on our order.
    //    NOTE: coupon usage_count is bumped in /verify — see comment below.
    await c.env.DB.prepare(
      'UPDATE orders SET razorpay_order_id = ? WHERE id = ?',
    ).bind(razorpayOrder.id, orderId).run();

    return c.json({
      success: true,
      data: {
        orderId,
        orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount:          razorpayOrder.amount,     // paise
        currency:        razorpayOrder.currency,
        keyId:           c.env.RAZORPAY_KEY_ID,     // safe: publishable key
        total,                                       // rupees, for display
      },
    });
    } catch (err) {
      // Surface the actual error to the client — global handler would swallow it as 500.
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[razorpay create-order] uncaught:', err);
      return c.json({
        success: false,
        error:   `Server error: ${msg}`,
        code:    'INTERNAL_ERROR',
      }, 500);
    }
  },
);

// ─── POST /api/payments/razorpay/verify ──────────────────────
// Called by the browser after Razorpay Checkout returns a payment_id + signature.
app.post(
  '/verify',
  zValidator('json', verifySchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: 'Missing required fields', code: 'INVALID_PAYLOAD' }, 400);
    }
  }),
  async (c) => {
    const userId = await resolveOptionalUser(c.req.header('Authorization'), c.env.JWT_SECRET);
    const body   = c.req.valid('json');

    // 1. Look up our order and confirm ownership
    const order = await c.env.DB.prepare(`
      SELECT id, user_id, guest_email, order_number, payment_status, total, razorpay_order_id,
             shipping_name, shipping_address_line1, shipping_address_line2,
             shipping_city, shipping_state, shipping_pincode,
             subtotal, discount, shipping_amount, tax, coupon_code, estimated_delivery_date
      FROM orders
      WHERE id = ?
    `).bind(body.orderId).first<{
      id: string; user_id: string | null; guest_email: string | null;
      order_number: string; payment_status: string; total: number; razorpay_order_id: string | null;
      shipping_name: string; shipping_address_line1: string; shipping_address_line2: string | null;
      shipping_city: string; shipping_state: string; shipping_pincode: string;
      subtotal: number; discount: number; shipping_amount: number; tax: number;
      coupon_code: string | null; estimated_delivery_date: string | null;
    }>();

    if (!order) {
      return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
    }
    // If the caller is authenticated AND the order has an owner, they must match.
    // For guest orders (user_id null) or unauthenticated retries, we rely on the
    // razorpay_order_id + HMAC signature as the proof-of-payment guard below.
    if (order.user_id && userId && order.user_id !== userId) {
      return c.json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }, 403);
    }
    if (order.razorpay_order_id !== body.razorpay_order_id) {
      return c.json({ success: false, error: 'Order id mismatch', code: 'ORDER_MISMATCH' }, 400);
    }

    // Idempotency: if already captured, just tell the client success
    if (order.payment_status === 'captured') {
      return c.json({ success: true, data: { orderId: order.id, orderNumber: order.order_number, alreadyCaptured: true } });
    }

    // 2. Verify signature
    const svc = getService(c.env);
    const valid = await svc.verifyPaymentSignature({
      razorpayOrderId:   body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpaySignature: body.razorpay_signature,
    });

    if (!valid) {
      await c.env.DB.prepare(`
        UPDATE orders SET payment_status = 'failed', updated_at = datetime('now') WHERE id = ?
      `).bind(order.id).run();
      return c.json({ success: false, error: 'Signature mismatch', code: 'SIGNATURE_MISMATCH' }, 400);
    }

    // 3. Mark paid + store payment id/signature
    await c.env.DB.prepare(`
      UPDATE orders
      SET payment_status = 'captured', status = 'confirmed',
          razorpay_payment_id = ?, razorpay_signature = ?,
          paid_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.razorpay_payment_id, body.razorpay_signature, order.id).run();

    // 4. Deduct stock
    const items = await c.env.DB.prepare(
      'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
    ).bind(order.id).all<{ product_id: string; variant_id: string | null; quantity: number }>();

    const stockUpdates = items.results.map((item) =>
      item.variant_id
        ? c.env.DB.prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?')
            .bind(item.quantity, item.variant_id)
        : c.env.DB.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')
            .bind(item.quantity, item.product_id),
    );
    if (stockUpdates.length) await c.env.DB.batch(stockUpdates);

    // 5. Clear KV cart if the user is authenticated (guest carts live only in the browser)
    if (userId) {
      await c.env.KV_CACHE.delete(`cart:user:${userId}`);
    }

    // 5b. Bump coupon usage_count now that payment succeeded (avoids inflating
    //     the count when payment fails or is abandoned).
    if (order.coupon_code) {
      const codes = order.coupon_code.split(',').map((c) => c.trim()).filter(Boolean);
      for (const code of codes) {
        await c.env.DB.prepare(
          'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?',
        ).bind(code).run();
      }
    }

    // 6. Confirmation email (best-effort)
    try {
      const userEmail = order.user_id
        ? await c.env.DB.prepare('SELECT email FROM users WHERE id = ?')
            .bind(order.user_id).first<{ email: string }>().then((r) => r?.email ?? null)
        : null;

      const orderItems = await c.env.DB.prepare(
        'SELECT product_name, variant_name, quantity, unit_price, line_total FROM order_items WHERE order_id = ?',
      ).bind(order.id).all<{
        product_name: string; variant_name: string | null;
        quantity: number; unit_price: number; line_total: number;
      }>();

      await sendOrderConfirmation(
        {
          id:                    order.id,
          orderNumber:           order.order_number,
          guestEmail:            order.guest_email,
          userEmail,
          shippingName:          order.shipping_name,
          shippingAddressLine1:  order.shipping_address_line1,
          shippingAddressLine2:  order.shipping_address_line2,
          shippingCity:          order.shipping_city,
          shippingState:         order.shipping_state,
          shippingPincode:       order.shipping_pincode,
          subtotal:              order.subtotal,
          discount:              order.discount,
          shippingAmount:        order.shipping_amount,
          tax:                   order.tax,
          total:                 order.total,
          couponCode:            order.coupon_code,
          estimatedDeliveryDate: order.estimated_delivery_date,
          items: orderItems.results.map((i) => ({
            productName: i.product_name,
            variantName: i.variant_name,
            quantity:    i.quantity,
            unitPrice:   i.unit_price,
            lineTotal:   i.line_total,
          })),
        },
        c.env.RESEND_API_KEY,
      );
    } catch (emailErr) {
      console.error('[Razorpay verify] email send failed:', emailErr);
    }

    return c.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.order_number },
    });
  },
);

export default app;
