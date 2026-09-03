import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { generateId } from '../../lib/utils';
import { sendOrderShipped, sendOrderDelivered } from '../../services/email';
import { automateShipmentForOrder } from '../../services/shipment-automation';
import { ShiprocketService, isShiprocketConfigured } from '../../services/shiprocket';
import { RazorpayService } from '../../services/razorpay';
import { generateInvoicePdf } from '../../services/invoice';
import { getOrCreateInvoiceNumber } from '../../services/invoice-numbering';
import { recordOrderStatusHistory } from '../../lib/order-history';

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

// Must match the DB constraint on orders.status. Rejecting arbitrary strings
// here is the guard rail — never expand this without an accompanying
// migration + UI update.
export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

// Statuses at which stock has already been decremented (Razorpay success path
// or COD checkout). Transitioning out of these into cancelled/refunded means
// we owe the customer their stock back.
const STOCK_DEDUCTED_STATUSES: readonly string[] = [
  'confirmed', 'processing', 'shipped', 'delivered',
];

const statusPatchSchema = z.object({
  status:         z.enum(ORDER_STATUSES).optional(),
  trackingNumber: z.string().optional(),
  tracking_number: z.string().optional(),
  note:           z.string().optional(),
});

// ── Shared helpers ─────────────────────────────────────────────

// Reverse the stock deduction from order_items back onto products/variants.
// Idempotent via the orders.stock_restored flag — the caller must have
// verified stock_restored = 0 before invoking. Returns true on success.
async function restoreOrderStock(
  env: Bindings,
  orderId: string,
): Promise<boolean> {
  const items = await env.DB.prepare(
    'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
  ).bind(orderId).all<{
    product_id: string; variant_id: string | null; quantity: number;
  }>();

  if (!items.results.length) {
    // No line items — mark restored anyway so we don't loop back trying.
    await env.DB.prepare(
      "UPDATE orders SET stock_restored = 1, updated_at = datetime('now') WHERE id = ?",
    ).bind(orderId).run();
    return true;
  }

  const stmts = items.results.map((item) =>
    item.variant_id
      ? env.DB.prepare(
          'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
        ).bind(item.quantity, item.variant_id)
      : env.DB.prepare(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
        ).bind(item.quantity, item.product_id),
  );

  // Flip the guard flag in the same batch so a concurrent request can't
  // double-restore between the read and the writes.
  stmts.push(
    env.DB.prepare(
      "UPDATE orders SET stock_restored = 1, updated_at = datetime('now') WHERE id = ? AND stock_restored = 0",
    ).bind(orderId),
  );

  try {
    await env.DB.batch(stmts);
    return true;
  } catch (err) {
    console.error('[Admin/Orders] stock restore batch failed for', orderId, err);
    return false;
  }
}

// Given the transition we're about to apply, decide whether stock needs to
// be restored on this order right now. Considers COD orders paid enough to
// have been deducted at checkout time.
function shouldRestoreStock(params: {
  currentStatus: string;
  nextStatus: string;
  paymentMethod: string | null;
  paymentStatus: string;
  stockAlreadyRestored: boolean;
}): boolean {
  if (params.stockAlreadyRestored) return false;
  if (params.nextStatus !== 'cancelled' && params.nextStatus !== 'refunded') return false;

  // Razorpay/prepaid: stock was deducted when payment was captured.
  if (STOCK_DEDUCTED_STATUSES.includes(params.currentStatus)) return true;

  // COD: stock is deducted at checkout even while payment_status is 'pending'.
  if (
    params.paymentMethod === 'cod' &&
    params.currentStatus !== 'pending' &&
    params.currentStatus !== 'cancelled' &&
    params.currentStatus !== 'refunded'
  ) {
    return true;
  }

  return false;
}

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

// ─── GET /api/admin/orders/:id/history ───────────────────────
// Full status-transition timeline for the admin detail page.
app.get('/:id/history', async (c) => {
  const orderId = c.req.param('id');

  const rows = await c.env.DB.prepare(`
    SELECT h.id, h.from_status, h.to_status, h.changed_at, h.note,
           h.changed_by, u.name AS changed_by_name
    FROM order_status_history h
    LEFT JOIN users u ON u.id = h.changed_by
    WHERE h.order_id = ?
    ORDER BY h.changed_at ASC
  `).bind(orderId).all<{
    id: string; from_status: string | null; to_status: string;
    changed_at: string; note: string | null;
    changed_by: string | null; changed_by_name: string | null;
  }>();

  return c.json({ success: true, data: rows.results });
});

// Shared handler for both PATCH endpoints. Both `PATCH /:id` and
// `PATCH /:id/status` exist for historical reasons — the UI hits the former,
// some scripts hit the latter. Keep behaviour identical: Zod-validated status
// enum, stock restore on cancel/refund, history row, admin log, notify.
async function applyStatusPatch(
  env: Bindings,
  orderId: string,
  adminId: string,
  input: { status?: OrderStatus; trackingNumber?: string; note?: string },
): Promise<{ status: number; body: unknown }> {
  const order = await env.DB.prepare(`
    SELECT id, status, payment_status, payment_method, stock_restored
    FROM orders WHERE id = ?
  `).bind(orderId).first<{
    id: string; status: string;
    payment_status: string; payment_method: string | null;
    stock_restored: number;
  }>();

  if (!order) {
    return { status: 404, body: { success: false, error: 'Order not found', code: 'NOT_FOUND' } };
  }

  const nextStatus = input.status;

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[]  = [];

  if (nextStatus) {
    fields.push('status = ?');
    values.push(nextStatus);
    if (nextStatus === 'shipped') fields.push("shipped_at = COALESCE(shipped_at, datetime('now'))");
    if (nextStatus === 'delivered') fields.push("delivered_at = COALESCE(delivered_at, datetime('now'))");
  }
  if (input.trackingNumber !== undefined) {
    fields.push('tracking_number = ?');
    values.push(input.trackingNumber);
  }

  values.push(orderId);
  await env.DB.prepare(
    `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  // If this transition takes us into cancelled/refunded from a
  // stock-deducted state, push the stock back onto products/variants
  // exactly once (guarded by orders.stock_restored).
  let stockRestored = false;
  if (nextStatus && shouldRestoreStock({
    currentStatus:        order.status,
    nextStatus,
    paymentMethod:        order.payment_method,
    paymentStatus:        order.payment_status,
    stockAlreadyRestored: order.stock_restored === 1,
  })) {
    stockRestored = await restoreOrderStock(env, orderId);
  }

  await env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, 'order', ?, ?)
  `).bind(
    generateId('log'),
    adminId,
    `status_update:${nextStatus ?? 'tracking_update'}`,
    orderId,
    JSON.stringify({
      from: order.status,
      to:   nextStatus,
      trackingNumber: input.trackingNumber,
      note: input.note,
      stockRestored,
    }),
  ).run();

  if (nextStatus && nextStatus !== order.status) {
    await recordOrderStatusHistory(
      env, orderId, order.status, nextStatus, adminId, input.note ?? null,
    );
  }

  if (nextStatus) {
    await notifyOrderStatusChange(env, orderId, nextStatus);
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        id:             orderId,
        status:         nextStatus ?? order.status,
        trackingNumber: input.trackingNumber,
        stockRestored,
      },
    },
  };
}

// ─── PATCH /api/admin/orders/:id — simple status update alias ──
app.patch('/:id', zValidator('json', statusPatchSchema, (result, c) => {
  if (!result.success) {
    const first = result.error.issues[0];
    return c.json({
      success: false,
      error:   first?.message ?? 'Invalid status payload',
      code:    'VALIDATION_ERROR',
    }, 400);
  }
}), async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;
  const body    = c.req.valid('json');

  const { status, trackingNumber: bodyTracking, tracking_number: snakeTracking, note } = body;
  const trackingNumber = bodyTracking ?? snakeTracking;

  const result = await applyStatusPatch(c.env, orderId, adminId, { status, trackingNumber, note });
  return c.json(result.body, result.status as 200 | 400 | 404);
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────
app.patch('/:id/status', zValidator('json', statusPatchSchema, (result, c) => {
  if (!result.success) {
    const first = result.error.issues[0];
    return c.json({
      success: false,
      error:   first?.message ?? 'Invalid status payload',
      code:    'VALIDATION_ERROR',
    }, 400);
  }
}), async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;
  const body    = c.req.valid('json');

  const { status, trackingNumber: bodyTracking, tracking_number: snakeTracking, note } = body;
  const trackingNumber = bodyTracking ?? snakeTracking;

  const result = await applyStatusPatch(c.env, orderId, adminId, { status, trackingNumber, note });
  return c.json(result.body, result.status as 200 | 400 | 404);
});

// ─── GET /api/admin/orders/:id/invoice.pdf ───────────────────
// Admin-authenticated PDF invoice download. No email verification —
// admin is trusted via JWT + role check applied at the top of this router.
app.get('/:id/invoice.pdf', async (c) => {
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(`
    SELECT o.id, o.order_number, o.guest_email,
           o.payment_status, o.payment_method,
           o.shipping_name, o.shipping_phone,
           o.shipping_address_line1, o.shipping_address_line2,
           o.shipping_city, o.shipping_state, o.shipping_pincode,
           o.subtotal, o.discount, o.shipping_amount, o.total,
           o.coupon_code, o.tracking_number, o.created_at,
           u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
  `).bind(orderId).first<{
    id: string; order_number: string; guest_email: string | null;
    payment_status: string; payment_method: string | null;
    shipping_name: string; shipping_phone: string | null;
    shipping_address_line1: string; shipping_address_line2: string | null;
    shipping_city: string; shipping_state: string; shipping_pincode: string;
    subtotal: number; discount: number; shipping_amount: number; total: number;
    coupon_code: string | null; tracking_number: string | null;
    created_at: string | null; user_email: string | null;
  }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  const items = await c.env.DB.prepare(`
    SELECT product_name, variant_name, sku, quantity, unit_price, line_total
    FROM order_items WHERE order_id = ?
  `).bind(orderId).all<{
    product_name: string; variant_name: string | null; sku: string | null;
    quantity: number; unit_price: number; line_total: number;
  }>();

  const invoiceNumber = await getOrCreateInvoiceNumber(c.env, orderId);
  const pdfBytes = await generateInvoicePdf({
    invoiceNumber,
    sellerLegalName:    c.env.SELLER_LEGAL_NAME    || null,
    sellerGstin:        c.env.SELLER_GSTIN         || null,
    sellerAddressBlock: c.env.SELLER_ADDRESS_BLOCK || null,
    sellerState:        c.env.SELLER_STATE         || null,
    placeOfSupply:      order.shipping_state,
    orderNumber:          order.order_number,
    createdAt:            order.created_at ?? new Date().toISOString(),
    paymentStatus:        order.payment_status,
    paymentMethod:        order.payment_method,
    couponCode:           order.coupon_code,
    trackingNumber:       order.tracking_number,
    shippingName:         order.shipping_name,
    shippingPhone:        order.shipping_phone,
    shippingEmail:        order.guest_email ?? order.user_email,
    shippingAddressLine1: order.shipping_address_line1,
    shippingAddressLine2: order.shipping_address_line2,
    shippingCity:         order.shipping_city,
    shippingState:        order.shipping_state,
    shippingPincode:      order.shipping_pincode,
    subtotal:             order.subtotal,
    discount:             order.discount,
    shippingAmount:       order.shipping_amount,
    total:                order.total,
    items: items.results.map((i) => ({
      productName: i.product_name,
      variantName: i.variant_name,
      sku:         i.sku,
      quantity:    i.quantity,
      unitPrice:   i.unit_price,
      lineTotal:   i.line_total,
    })),
  });

  return new Response(pdfBytes as unknown as ArrayBuffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${order.order_number}.pdf"`,
      'Cache-Control':       'private, max-age=0, no-store',
    },
  });
});

// ─── POST /api/admin/orders/:id/refund ───────────────────────
// Refunds a Razorpay-captured payment. Full refund by default; pass
// `amount` for a partial. Only razorpay-paid orders can be refunded here
// (COD refunds happen manually / offline). Marks the order refunded on
// success. Idempotency: retrying with the same order id + amount within
// 24h returns the same Razorpay refund thanks to our order-scoped key.
const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().min(3).max(200),
});

app.post('/:id/refund', zValidator('json', refundSchema), async (c) => {
  const orderId = c.req.param('id');
  const adminId = (c as any).get('userId') as string;
  const { amount, reason } = c.req.valid('json');

  const order = await c.env.DB.prepare(`
    SELECT id, status, total, payment_status, payment_method,
           razorpay_payment_id, stock_restored
    FROM orders WHERE id = ?
  `).bind(orderId).first<{
    id: string; status: string; total: number; payment_status: string;
    payment_method: string | null; razorpay_payment_id: string | null;
    stock_restored: number;
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
  if (order.payment_method !== 'razorpay' || !order.razorpay_payment_id) {
    return c.json({
      success: false,
      error:   'Only Razorpay-paid orders can be refunded from the panel. Handle COD refunds manually.',
      code:    'UNSUPPORTED_METHOD',
    }, 400);
  }

  const refundAmount = amount ?? order.total;

  const svc = new RazorpayService(c.env.RAZORPAY_KEY_ID, c.env.RAZORPAY_KEY_SECRET);
  let refundResult: unknown;
  try {
    refundResult = await svc.refundPayment({
      paymentId:      order.razorpay_payment_id,
      amount:         amount, // undefined = full refund
      notes:          { orderId, reason },
      idempotencyKey: `refund:${orderId}:${refundAmount.toFixed(2)}`,
    });
  } catch (err) {
    console.error('[Admin/Orders] Refund failed:', err);
    return c.json({
      success: false,
      error:   err instanceof Error ? err.message : 'Refund initiation failed',
      code:    'REFUND_ERROR',
    }, 502);
  }

  const isFullRefund = amount === undefined || Math.abs(amount - order.total) < 0.01;
  const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
  const newOrderStatus: OrderStatus | undefined = isFullRefund ? 'refunded' : undefined;

  const setClauses = ["payment_status = ?", "updated_at = datetime('now')"];
  const binds: unknown[] = [newPaymentStatus];
  if (newOrderStatus) {
    setClauses.push('status = ?');
    binds.push(newOrderStatus);
  }
  binds.push(orderId);
  await c.env.DB.prepare(
    `UPDATE orders SET ${setClauses.join(', ')} WHERE id = ?`,
  ).bind(...binds).run();

  // Full refunds restore stock (once). Partial refunds leave stock alone —
  // the customer typically keeps the product for a partial.
  let stockRestored = false;
  if (newOrderStatus && shouldRestoreStock({
    currentStatus:        order.status,
    nextStatus:           newOrderStatus,
    paymentMethod:        order.payment_method,
    paymentStatus:        order.payment_status,
    stockAlreadyRestored: order.stock_restored === 1,
  })) {
    stockRestored = await restoreOrderStock(c.env, orderId);
  }

  await c.env.DB.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id, details)
    VALUES (?, ?, 'refund', 'order', ?, ?)
  `).bind(
    generateId('log'),
    adminId,
    orderId,
    JSON.stringify({ amount: refundAmount, reason, refundResult, stockRestored }),
  ).run();

  if (newOrderStatus && newOrderStatus !== order.status) {
    await recordOrderStatusHistory(
      c.env, orderId, order.status, newOrderStatus, adminId,
      `Refund: ${reason}`,
    );
  }

  return c.json({ success: true, data: { orderId, refundAmount, refundResult, stockRestored } });
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
