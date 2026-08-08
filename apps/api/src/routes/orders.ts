import { Hono } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; userRole: string; userEmail: string };
};

const app = new Hono<AppEnv>();

// ─── GET /api/orders/:id/receipt — public receipt for order confirmation page ───
// Returns the full order data (items + address + totals) for the just-completed
// order without requiring auth, guarded by email match. Used by the post-payment
// screen for both logged-in and guest customers.
app.get('/:id/receipt', async (c) => {
  const orderId = c.req.param('id');
  const email   = c.req.query('email')?.trim().toLowerCase();

  if (!email) {
    return c.json({ success: false, error: 'Email is required to view this receipt', code: 'VALIDATION_ERROR' }, 400);
  }

  const order = await c.env.DB.prepare(`
    SELECT
      o.id, o.order_number, o.user_id, o.guest_email, o.status, o.payment_status,
      o.shipping_name, o.shipping_phone,
      o.shipping_address_line1, o.shipping_address_line2,
      o.shipping_city, o.shipping_state, o.shipping_pincode,
      o.subtotal, o.discount, o.shipping_amount, o.tax, o.total,
      o.coupon_code, o.tracking_number, o.tracking_url, o.estimated_delivery_date,
      o.paid_at, o.created_at
    FROM orders o
    WHERE o.id = ?
  `).bind(orderId).first<{
    id: string; user_id: string | null; guest_email: string | null;
  } & Record<string, unknown>>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  const guestMatch = order.guest_email && order.guest_email.toLowerCase() === email;
  let userMatch = false;
  if (order.user_id) {
    const user = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?')
      .bind(order.user_id).first<{ email: string }>();
    userMatch = !!user && user.email.toLowerCase() === email;
  }

  if (!guestMatch && !userMatch) {
    return c.json({ success: false, error: 'Receipt not available for this email', code: 'FORBIDDEN' }, 403);
  }

  const items = await c.env.DB.prepare(`
    SELECT id, product_id, variant_id, product_name, variant_name,
           sku, quantity, unit_price, line_total, image_url
    FROM order_items
    WHERE order_id = ?
  `).bind(orderId).all();

  return c.json({ success: true, data: { ...order, items: items.results } });
});

// ─── GET /api/orders/track — public order tracking ─────────────
app.get('/track', async (c) => {
  const orderNumber = c.req.query('orderNumber');
  const email = c.req.query('email');

  if (!orderNumber || !email) {
    return c.json({ success: false, error: 'Order number and email are required', code: 'VALIDATION_ERROR' }, 400);
  }

  const order = await c.env.DB.prepare(`
    SELECT
      o.id, o.order_number, o.status, o.payment_status,
      o.total, o.tracking_number, o.tracking_url,
      o.estimated_delivery_date, o.created_at,
      o.shipping_name, o.shipping_city, o.shipping_state
    FROM orders o
    WHERE o.order_number = ?
      AND (o.guest_email = ? OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = o.user_id AND u.email = ?
      ))
  `).bind(orderNumber, email, email).first();

  if (!order) {
    return c.json({ success: false, error: 'Order not found. Please check your order number and email.', code: 'NOT_FOUND' }, 404);
  }

  const items = await c.env.DB.prepare(`
    SELECT id, product_name, quantity, line_total as total
    FROM order_items WHERE order_id = ?
  `).bind((order as any).id).all();

  return c.json({ success: true, data: { ...order, items: items.results } });
});

// All subsequent order routes require authentication
app.use('*', authMiddleware as any);

// ─── GET /api/orders — list user's own orders ───────────────
const ALLOWED_STATUS = new Set([
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
]);

app.get('/', async (c) => {
  const userId       = (c as any).get('userId') as string;
  const page         = Number(c.req.query('page')  ?? 1);
  const limit        = Number(c.req.query('limit') ?? 10);
  const statusFilter = c.req.query('status');
  const offset       = (page - 1) * limit;

  const useStatus = statusFilter && ALLOWED_STATUS.has(statusFilter);
  const whereSql  = useStatus
    ? 'WHERE o.user_id = ? AND o.status = ?'
    : 'WHERE o.user_id = ?';
  const bindings: unknown[] = useStatus ? [userId, statusFilter] : [userId];

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        o.id, o.order_number, o.status, o.payment_status,
        o.total, o.coupon_code, o.tracking_number,
        o.estimated_delivery_date, o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${whereSql}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bindings, limit, offset).all(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM orders o ${whereSql}`,
    ).bind(...bindings).first<{ total: number }>(),
  ]);

  const total = countRow?.total ?? 0;

  return c.json({
    success: true,
    data: {
      orders:     rows.results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── GET /api/orders/:id — get single order ─────────────────
app.get('/:id', async (c) => {
  const userId  = (c as any).get('userId') as string;
  const role    = (c as any).get('userRole') as string;
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(`
    SELECT
      o.id, o.order_number, o.user_id, o.guest_email, o.status, o.payment_status,
      o.shipping_name, o.shipping_phone,
      o.shipping_address_line1, o.shipping_address_line2,
      o.shipping_city, o.shipping_state, o.shipping_pincode,
      o.subtotal, o.discount, o.shipping_amount, o.tax, o.total,
      o.coupon_code, o.tracking_number, o.tracking_url, o.estimated_delivery_date,
      o.paid_at, o.shipped_at, o.delivered_at, o.created_at, o.updated_at
    FROM orders o
    WHERE o.id = ?
  `).bind(orderId).first<{ user_id: string | null } & Record<string, unknown>>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  // Customers can only access their own orders; admins can access any
  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && order.user_id !== userId) {
    return c.json({ success: false, error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  const items = await c.env.DB.prepare(`
    SELECT id, product_id, variant_id, product_name, variant_name,
           sku, quantity, unit_price, line_total, image_url
    FROM order_items
    WHERE order_id = ?
  `).bind(orderId).all();

  return c.json({
    success: true,
    data:    { ...order, items: items.results },
  });
});

// ─── POST /api/orders/:id/cancel — customer self-cancel ─────
// Only allowed for orders that haven't shipped yet
const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed']);

app.post('/:id/cancel', async (c) => {
  const userId  = (c as any).get('userId') as string;
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(
    'SELECT id, user_id, status FROM orders WHERE id = ?',
  ).bind(orderId).first<{ id: string; user_id: string | null; status: string }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }
  if (order.user_id !== userId) {
    return c.json({ success: false, error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }
  if (!CANCELLABLE_STATUSES.has(order.status)) {
    return c.json(
      {
        success: false,
        error:   'This order can no longer be cancelled. Please contact support.',
        code:    'NOT_CANCELLABLE',
      },
      400,
    );
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
  ).bind('cancelled', now, orderId).run();

  return c.json({ success: true, data: { id: orderId } });
});

export default app;
