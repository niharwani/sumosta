import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { generateId } from '../../lib/utils';
import { PhonePeService } from '../../services/phonepe';
import { sendOrderShipped, sendOrderDelivered } from '../../services/email';
import { automateShipmentForOrder } from '../../services/shipment-automation';
import { ShiprocketService, isShiprocketConfigured } from '../../services/shiprocket';

const app = new Hono<{ Bindings: Bindings }>();

// Fire a shipped/delivered email based on the new status. Best-effort; never
// blocks the admin response.
async function notifyOrderStatusChange(
  env: Bindings,
  orderId: string,
  newStatus: string,
): Promise<void> {
  if (newStatus !== 'shipped' && newStatus !== 'delivered') return;

  const order = await env.DB.prepare(`
    SELECT o.order_number, o.guest_email, o.shipping_name,
           o.tracking_number, o.tracking_url, o.estimated_delivery_date,
           u.email as user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
  `).bind(orderId).first<{
    order_number: string; guest_email: string | null; shipping_name: string;
    tracking_number: string | null; tracking_url: string | null;
    estimated_delivery_date: string | null; user_email: string | null;
  }>();

  if (!order) return;
  const recipient = order.guest_email ?? order.user_email;
  if (!recipient) {
    console.warn(`[Admin/Orders] No recipient for ${newStatus} email on order ${orderId}`);
    return;
  }
  if (!env.RESEND_API_KEY) return;

  try {
    const payload = {
      orderNumber:     order.order_number,
      recipientEmail:  recipient,
      shippingName:    order.shipping_name,
      trackingNumber:  order.tracking_number,
      trackingUrl:     order.tracking_url,
      estimatedDate:   order.estimated_delivery_date,
    };
    const fromAddr = env.RESEND_FROM_ORDERS || env.RESEND_FROM || undefined;
    const replyTo  = env.SUPPORT_EMAIL || null;
    if (newStatus === 'shipped') {
      await sendOrderShipped(payload, env.RESEND_API_KEY, fromAddr, replyTo);
    } else {
      await sendOrderDelivered(payload, env.RESEND_API_KEY, fromAddr, replyTo);
    }
  } catch (err) {
    console.error(`[Admin/Orders] ${newStatus} email failed:`, err);
  }
}

app.use('*', adminMiddleware as any);

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
] as const;

const statusUpdateSchema = z.object({
  status:         z.enum(ORDER_STATUSES).optional(),
  trackingNumber: z.string().optional(),
  note:           z.string().optional(),
});

const refundSchema = z.object({
  amount: z.number().positive().optional(), // partial refund support; defaults to full
  reason: z.string().min(3).max(200),
});

// ─── GET /api/admin/orders ───────────────────────────────────
app.get('/', async (c) => {
  const page          = Number(c.req.query('page')           ?? 1);
  const limit         = Number(c.req.query('limit')          ?? 20);
  const status        = c.req.query('status')        ?? '';
  const paymentStatus = c.req.query('payment_status') ?? '';
  const search        = c.req.query('search')        ?? '';
  const startDate     = c.req.query('startDate')     ?? '';
  const endDate       = c.req.query('endDate')       ?? '';
  const offset        = (page - 1) * limit;

  const conditions: string[] = [];
  const bind: (string | number)[] = [];

  if (status) {
    conditions.push('o.status = ?');
    bind.push(status);
  }
  if (paymentStatus) {
    conditions.push('o.payment_status = ?');
    bind.push(paymentStatus);
  }
  if (search) {
    conditions.push('(o.order_number LIKE ? OR o.shipping_name LIKE ?)');
    bind.push(`%${search}%`, `%${search}%`);
  }
  if (startDate) {
    conditions.push("date(o.created_at) >= ?");
    bind.push(startDate);
  }
  if (endDate) {
    conditions.push("date(o.created_at) <= ?");
    bind.push(endDate);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        o.id, o.order_number, o.status, o.payment_status, o.total,
        o.shipping_name, o.shipping_city, o.shipping_state,
        o.tracking_number, o.coupon_code, o.created_at,
        u.email as user_email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${where}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bind, limit, offset).all(),
    c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM orders o ${where}
    `).bind(...bind).first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      orders:     rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── GET /api/admin/orders/:id ───────────────────────────────
app.get('/:id', async (c) => {
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(`
    SELECT o.*,
           u.name  as user_name,
           u.email as user_email,
           u.phone as user_phone
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
  `).bind(orderId).first();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  const items = await c.env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?',
  ).bind(orderId).all();

  const logs = await c.env.DB.prepare(`
    SELECT al.action, al.details, al.created_at, u.name as admin_name
    FROM admin_logs al
    JOIN users u ON u.id = al.admin_id
    WHERE al.entity_type = 'order' AND al.entity_id = ?
    ORDER BY al.created_at DESC
  `).bind(orderId).all();

  return c.json({
    success: true,
    data:    { ...order, items: items.results, logs: logs.results },
  });
});

// ─── PATCH /api/admin/orders/:id — simple status update alias ──
app.patch('/:id', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json<{ status?: string; tracking_number?: string }>();
  const adminId = (c as any).get('userId') as string;

  const order = await c.env.DB.prepare('SELECT id FROM orders WHERE id = ?').bind(orderId).first();
  if (!order) return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (body.status) {
    fields.push('status = ?');
    values.push(body.status);
    if (body.status === 'shipped') fields.push("shipped_at = datetime('now')");
    if (body.status === 'delivered') fields.push("delivered_at = datetime('now')");
  }
  if (body.tracking_number !== undefined) {
    fields.push('tracking_number = ?');
    values.push(body.tracking_number);
  }

  values.push(orderId);
  await c.env.DB.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

  await c.env.DB.prepare(
    `INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, 'order', ?, ?)`
  ).bind(generateId('log'), adminId, `update:${body.status ?? 'tracking'}`, orderId, JSON.stringify(body)).run();

  if (body.status) {
    await notifyOrderStatusChange(c.env, orderId, body.status);
  }

  return c.json({ success: true, data: { id: orderId } });
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────
app.patch('/:id/status', zValidator('json', statusUpdateSchema), async (c) => {
  const orderId  = c.req.param('id');
  const adminId  = (c as any).get('userId') as string;
  const { status, trackingNumber, note } = c.req.valid('json');

  const order = await c.env.DB.prepare(
    'SELECT id, status FROM orders WHERE id = ?',
  ).bind(orderId).first<{ id: string; status: string }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[]  = [];

  if (status) {
    fields.push('status = ?');
    values.push(status);

    // Set timestamp fields based on status transitions
    if (status === 'shipped') {
      fields.push("shipped_at = datetime('now')");
    } else if (status === 'delivered') {
      fields.push("delivered_at = datetime('now')");
    }
  }

  if (trackingNumber !== undefined) {
    fields.push('tracking_number = ?');
    values.push(trackingNumber);
  }

  values.push(orderId);

  await c.env.DB.prepare(
    `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  // Log to admin_logs
  await c.env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, 'order', ?, ?)
  `).bind(
    generateId('log'),
    adminId,
    `status_update:${status ?? 'tracking_update'}`,
    orderId,
    JSON.stringify({ from: order.status, to: status, trackingNumber, note }),
  ).run();

  if (status) {
    await notifyOrderStatusChange(c.env, orderId, status);
  }

  return c.json({ success: true, data: { id: orderId, status, trackingNumber } });
});

// ─── POST /api/admin/orders/:id/refund ───────────────────────
app.post('/:id/refund', zValidator('json', refundSchema), async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;
  const { amount, reason } = c.req.valid('json');

  const order = await c.env.DB.prepare(
    'SELECT id, total, payment_status, phonepe_merchant_txn_id FROM orders WHERE id = ?',
  ).bind(orderId).first<{
    id: string; total: number; payment_status: string;
    phonepe_merchant_txn_id: string | null;
  }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  if (order.payment_status !== 'captured') {
    return c.json({
      success: false,
      error:   'Cannot refund an order that has not been captured',
      code:    'INVALID_STATE',
    }, 400);
  }

  if (!order.phonepe_merchant_txn_id) {
    return c.json({
      success: false,
      error:   'No PhonePe transaction ID found for this order',
      code:    'NO_TXN_ID',
    }, 400);
  }

  const refundAmount = amount ?? order.total;

  const baseUrl = c.env.PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const svc = new PhonePeService(
    c.env.PHONEPE_MERCHANT_ID,
    c.env.PHONEPE_SALT_KEY,
    c.env.PHONEPE_SALT_INDEX,
    baseUrl,
  );

  let refundResult: unknown;
  try {
    refundResult = await svc.initiateRefund({
      originalTransactionId: order.phonepe_merchant_txn_id,
      amount:                refundAmount,
    });
  } catch (err) {
    console.error('[Admin/Orders] Refund failed:', err);
    return c.json({
      success: false,
      error:   'Refund initiation failed. Please try again.',
      code:    'REFUND_ERROR',
    }, 502);
  }

  // Update order status
  await c.env.DB.prepare(`
    UPDATE orders
    SET payment_status = 'refunded', status = 'refunded', updated_at = datetime('now')
    WHERE id = ?
  `).bind(orderId).run();

  // Log it
  await c.env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'refund', 'order', ?, ?)
  `).bind(
    generateId('log'),
    adminId,
    orderId,
    JSON.stringify({ amount: refundAmount, reason, refundResult }),
  ).run();

  return c.json({ success: true, data: { orderId, refundAmount, refundResult } });
});

// ─── POST /api/admin/orders/:id/shipment/retry ──────────────────
// Re-runs shipment automation for orders where the auto-shipment failed
// (or was never triggered because Shiprocket wasn't configured at the time).
// Idempotent — skips create if a shipment already exists, just tries to
// (re)assign the AWB and request pickup.
app.post('/:id/shipment/retry', async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;

  const order = await c.env.DB.prepare(
    'SELECT id FROM orders WHERE id = ?',
  ).bind(orderId).first<{ id: string }>();
  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  if (!isShiprocketConfigured(c.env)) {
    return c.json({
      success: false,
      error:   'Shiprocket is not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD as secrets.',
      code:    'NOT_CONFIGURED',
    }, 400);
  }

  // If the AWB already exists, wipe it first so automation attempts a fresh assign.
  // (Shipment id stays — Shiprocket keeps a 1:1 mapping to our order_number.)
  await c.env.DB.prepare(`
    UPDATE orders
    SET awb_code = NULL, tracking_number = NULL, tracking_url = NULL,
        shipment_last_error = NULL, updated_at = datetime('now')
    WHERE id = ?
  `).bind(orderId).run();

  const result = await automateShipmentForOrder(c.env, orderId);

  await c.env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'shipment_retry', 'order', ?, ?)
  `).bind(generateId('log'), adminId, orderId, JSON.stringify(result)).run();

  if (!result.ok) {
    return c.json({
      success: false,
      error:   result.reason ?? 'Shipment retry failed',
      code:    'SHIPMENT_FAILED',
    }, 502);
  }

  return c.json({ success: true, data: result });
});

// ─── POST /api/admin/orders/:id/shipment/cancel ─────────────────
// Cancels a Shiprocket shipment (AWB and order). Order status stays as-is
// so admin can still refund/refuse independently.
app.post('/:id/shipment/cancel', async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;

  const order = await c.env.DB.prepare(`
    SELECT id, awb_code, shiprocket_order_id
    FROM orders WHERE id = ?
  `).bind(orderId).first<{
    id: string; awb_code: string | null; shiprocket_order_id: number | null;
  }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }
  if (!order.awb_code && !order.shiprocket_order_id) {
    return c.json({
      success: false,
      error:   'This order has no active shipment to cancel.',
      code:    'NO_SHIPMENT',
    }, 400);
  }
  if (!isShiprocketConfigured(c.env)) {
    return c.json({
      success: false,
      error:   'Shiprocket is not configured.',
      code:    'NOT_CONFIGURED',
    }, 400);
  }

  const sr = new ShiprocketService(c.env);
  const errors: string[] = [];

  if (order.awb_code) {
    try { await sr.cancelShipment([order.awb_code]); }
    catch (err) { errors.push(`awb: ${(err as Error).message}`); }
  }
  if (order.shiprocket_order_id) {
    try { await sr.cancelOrder([order.shiprocket_order_id]); }
    catch (err) { errors.push(`order: ${(err as Error).message}`); }
  }

  await c.env.DB.prepare(`
    UPDATE orders
    SET awb_code = NULL, tracking_number = NULL, tracking_url = NULL,
        courier_name = NULL, courier_company_id = NULL,
        shiprocket_shipment_id = NULL, shiprocket_order_id = NULL,
        shipment_status = 'CANCELLED', shipment_status_updated_at = datetime('now'),
        shipment_last_error = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(errors.length ? errors.join('; ').slice(0, 500) : null, orderId).run();

  await c.env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'shipment_cancel', 'order', ?, ?)
  `).bind(generateId('log'), adminId, orderId, JSON.stringify({ errors })).run();

  return c.json({ success: true, data: { orderId, errors } });
});

export default app;
