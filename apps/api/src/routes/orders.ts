import { Hono } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; userRole: string; userEmail: string };
};

const app = new Hono<AppEnv>();

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
app.get('/', async (c) => {
  const userId = (c as any).get('userId') as string;
  const page   = Number(c.req.query('page')  ?? 1);
  const limit  = Number(c.req.query('limit') ?? 10);
  const offset = (page - 1) * limit;

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        o.id, o.order_number, o.status, o.payment_status,
        o.total, o.coupon_code, o.tracking_number,
        o.estimated_delivery_date, o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all(),
    c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
    ).bind(userId).first<{ total: number }>(),
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
      o.coupon_code, o.tracking_number, o.estimated_delivery_date,
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

export default app;
