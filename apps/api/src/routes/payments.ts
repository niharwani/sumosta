import { Hono } from 'hono';
import type { Bindings } from '../index';
import { PhonePeService } from '../services/phonepe';
import { sendOrderConfirmation } from '../services/email';

const app = new Hono<{ Bindings: Bindings }>();

function getPhonePeService(env: Bindings): PhonePeService {
  const baseUrl = env.PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  return new PhonePeService(
    env.PHONEPE_MERCHANT_ID,
    env.PHONEPE_SALT_KEY,
    env.PHONEPE_SALT_INDEX,
    baseUrl,
  );
}

// ─── POST /api/payments/phonepe/callback ─────────────────────
// S2S callback from PhonePe — MUST always return 200
app.post('/phonepe/callback', async (c) => {
  let rawBody: string;
  try {
    rawBody = await c.req.text();
  } catch {
    return c.text('OK', 200);
  }

  const xVerify = c.req.header('X-VERIFY') ?? '';

  // Parse the incoming JSON to get the base64 response field
  let base64Response: string;
  try {
    const parsed = JSON.parse(rawBody) as { response?: string };
    base64Response = parsed.response ?? '';
  } catch {
    console.error('[PhonePe Callback] Invalid JSON body');
    return c.text('OK', 200);
  }

  // Verify checksum
  const svc = getPhonePeService(c.env);
  const valid = await svc.verifyCallback(xVerify, base64Response);
  if (!valid) {
    console.error('[PhonePe Callback] Checksum mismatch — ignoring');
    return c.text('OK', 200);
  }

  // Decode base64 response
  let decoded: {
    merchantTransactionId?: string;
    transactionId?:         string;
    code?:                  string;
    state?:                 string;
  };
  try {
    decoded = JSON.parse(atob(base64Response));
  } catch {
    console.error('[PhonePe Callback] Failed to decode base64 response');
    return c.text('OK', 200);
  }

  const { merchantTransactionId, transactionId, code, state } = decoded;
  if (!merchantTransactionId) {
    return c.text('OK', 200);
  }

  // Find order — idempotency: if already confirmed, bail early
  const order = await c.env.DB.prepare(`
    SELECT id, user_id, guest_email, order_number,
           payment_status, total,
           shipping_name, shipping_address_line1, shipping_address_line2,
           shipping_city, shipping_state, shipping_pincode,
           subtotal, discount, shipping_amount, tax, coupon_code,
           estimated_delivery_date
    FROM orders
    WHERE phonepe_merchant_txn_id = ?
  `).bind(merchantTransactionId)
    .first<{
      id: string; user_id: string | null; guest_email: string | null;
      order_number: string; payment_status: string; total: number;
      shipping_name: string; shipping_address_line1: string;
      shipping_address_line2: string | null; shipping_city: string;
      shipping_state: string; shipping_pincode: string;
      subtotal: number; discount: number; shipping_amount: number;
      tax: number; coupon_code: string | null;
      estimated_delivery_date: string | null;
    }>();

  if (!order) {
    console.error('[PhonePe Callback] Order not found for txn:', merchantTransactionId);
    return c.text('OK', 200);
  }

  // Already processed — idempotency guard
  if (order.payment_status === 'captured') {
    return c.text('OK', 200);
  }

  const isSuccess = code === 'PAYMENT_SUCCESS' || state === 'COMPLETED';

  if (isSuccess) {
    // Update order: confirmed + captured
    await c.env.DB.prepare(`
      UPDATE orders
      SET payment_status = 'captured', status = 'confirmed',
          phonepe_txn_id = ?, paid_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(transactionId ?? null, order.id).run();

    // Deduct stock for each order item
    const items = await c.env.DB.prepare(
      'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
    ).bind(order.id).all<{ product_id: string; variant_id: string | null; quantity: number }>();

    const stockUpdates = items.results.map((item) => {
      if (item.variant_id) {
        return c.env.DB.prepare(
          'UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?',
        ).bind(item.quantity, item.variant_id);
      }
      return c.env.DB.prepare(
        'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?',
      ).bind(item.quantity, item.product_id);
    });

    if (stockUpdates.length > 0) {
      await c.env.DB.batch(stockUpdates);
    }

    // Send confirmation email (best-effort)
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
          id:                   order.id,
          orderNumber:          order.order_number,
          guestEmail:           order.guest_email,
          userEmail:            userEmail,
          shippingName:         order.shipping_name,
          shippingAddressLine1: order.shipping_address_line1,
          shippingAddressLine2: order.shipping_address_line2,
          shippingCity:         order.shipping_city,
          shippingState:        order.shipping_state,
          shippingPincode:      order.shipping_pincode,
          subtotal:             order.subtotal,
          discount:             order.discount,
          shippingAmount:       order.shipping_amount,
          tax:                  order.tax,
          total:                order.total,
          couponCode:           order.coupon_code,
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
      console.error('[PhonePe Callback] Email send failed:', emailErr);
    }
  } else {
    // Payment failed or cancelled
    await c.env.DB.prepare(`
      UPDATE orders
      SET payment_status = 'failed', updated_at = datetime('now')
      WHERE id = ?
    `).bind(order.id).run();
  }

  return c.text('OK', 200);
});

// ─── GET /api/payments/phonepe/redirect ──────────────────────
// Browser redirect after payment — check status and redirect user
app.get('/phonepe/redirect', async (c) => {
  const merchantTransactionId = c.req.query('merchantTransactionId');
  const orderId               = c.req.query('orderId');

  if (!merchantTransactionId && !orderId) {
    return c.redirect(`${c.env.BASE_URL}/payment-failed`);
  }

  // Look up order
  let order: { id: string; payment_status: string; order_number: string } | null = null;

  if (orderId) {
    order = await c.env.DB.prepare(
      'SELECT id, payment_status, order_number FROM orders WHERE id = ?',
    ).bind(orderId).first<{ id: string; payment_status: string; order_number: string }>();
  } else if (merchantTransactionId) {
    order = await c.env.DB.prepare(
      'SELECT id, payment_status, order_number FROM orders WHERE phonepe_merchant_txn_id = ?',
    ).bind(merchantTransactionId).first<{ id: string; payment_status: string; order_number: string }>();
  }

  if (!order) {
    return c.redirect(`${c.env.BASE_URL}/payment-failed`);
  }

  // If callback already processed this — redirect immediately
  if (order.payment_status === 'captured') {
    return c.redirect(`${c.env.BASE_URL}/order-confirmation/${order.id}`);
  }
  if (order.payment_status === 'failed') {
    return c.redirect(`${c.env.BASE_URL}/payment-failed?orderId=${order.id}`);
  }

  // Poll PhonePe for fresh status (callback may not have arrived yet)
  if (merchantTransactionId) {
    try {
      const svc    = getPhonePeService(c.env);
      const status = await svc.checkStatus(merchantTransactionId) as {
        success?: boolean; code?: string; data?: { state?: string };
      };

      const isSuccess =
        status.success === true ||
        status.code === 'PAYMENT_SUCCESS' ||
        status.data?.state === 'COMPLETED';

      if (isSuccess) {
        // Trigger same logic as callback (update order if not yet done)
        if (order.payment_status !== 'captured') {
          await c.env.DB.prepare(`
            UPDATE orders
            SET payment_status = 'captured', status = 'confirmed',
                paid_at = datetime('now'), updated_at = datetime('now')
            WHERE id = ?
          `).bind(order.id).run();
        }
        return c.redirect(`${c.env.BASE_URL}/order-confirmation/${order.id}`);
      }
    } catch (err) {
      console.error('[PhonePe Redirect] Status check failed:', err);
    }
  }

  return c.redirect(`${c.env.BASE_URL}/payment-failed?orderId=${order.id}`);
});

export default app;
