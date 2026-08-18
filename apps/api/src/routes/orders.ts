import { Hono } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';
import { ShiprocketService, isShiprocketConfigured, type ShiprocketTrackData } from '../services/shiprocket';

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
      o.payment_method,
      o.shipping_name, o.shipping_phone,
      o.shipping_address_line1, o.shipping_address_line2,
      o.shipping_city, o.shipping_state, o.shipping_pincode,
      o.subtotal, o.discount, o.shipping_amount, o.tax, o.total,
      o.coupon_code, o.tracking_number, o.tracking_url, o.estimated_delivery_date,
      o.awb_code, o.courier_name, o.shipment_status,
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
      o.id, o.order_number, o.status, o.payment_status, o.payment_method,
      o.total, o.tracking_number, o.tracking_url,
      o.estimated_delivery_date, o.created_at,
      o.awb_code, o.courier_name, o.shipment_status,
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

// Public live tracking (order_number + email verified). Returns real-time
// Shiprocket checkpoints for the /track page and post-purchase screens.
app.get('/track/live', async (c) => {
  const orderNumber = c.req.query('orderNumber');
  const email = c.req.query('email');
  if (!orderNumber || !email) {
    return c.json({ success: false, error: 'Order number and email are required', code: 'VALIDATION_ERROR' }, 400);
  }

  const order = await c.env.DB.prepare(`
    SELECT o.id, o.awb_code, o.tracking_url, o.courier_name, o.shipment_status
    FROM orders o
    WHERE o.order_number = ?
      AND (o.guest_email = ? OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = o.user_id AND u.email = ?
      ))
  `).bind(orderNumber, email, email).first<{
    id: string; awb_code: string | null; tracking_url: string | null;
    courier_name: string | null; shipment_status: string | null;
  }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true, data: await fetchTrackingForOrder(c.env, order) });
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
      o.payment_method,
      o.shipping_name, o.shipping_phone,
      o.shipping_address_line1, o.shipping_address_line2,
      o.shipping_city, o.shipping_state, o.shipping_pincode,
      o.subtotal, o.discount, o.shipping_amount, o.tax, o.total,
      o.coupon_code, o.tracking_number, o.tracking_url, o.estimated_delivery_date,
      o.awb_code, o.courier_name, o.courier_company_id,
      o.shipment_status, o.shipment_status_updated_at, o.shipment_last_error,
      o.shiprocket_order_id, o.shiprocket_shipment_id,
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

// ─── GET /api/orders/:id/tracking — live tracking from Shiprocket ───
// Public (email-verified for guest orders, session for authed). Cached
// in KV for 5 minutes so we don't hammer Shiprocket when a customer
// leaves the tab open.
const TRACKING_CACHE_TTL = 5 * 60;

interface TrackingResponse {
  awb_code:        string | null;
  courier_name:    string | null;
  current_status:  string | null;
  edd:             string | null;
  tracking_url:    string | null;
  origin:          string | null;
  destination:     string | null;
  activities: Array<{
    date:     string;
    status:   string;
    activity: string;
    location: string;
  }>;
}

function shapeTracking(data: ShiprocketTrackData, fallbackUrl: string | null): TrackingResponse {
  const t = data.shipment_track[0];
  return {
    awb_code:       t?.awb_code ?? null,
    courier_name:   t?.courier_name ?? null,
    current_status: t?.current_status ?? null,
    edd:            t?.edd ?? null,
    tracking_url:   data.track_url ?? fallbackUrl,
    origin:         t?.origin ?? null,
    destination:    t?.destination ?? null,
    activities:     (data.shipment_track_activities ?? []).map((a) => ({
      date:     a.date,
      status:   a.status,
      activity: a.activity,
      location: a.location,
    })),
  };
}

// Auth-scoped variant — used by the order detail page for signed-in users
// (Note: this handler runs AFTER `app.use('*', authMiddleware)` above, so
// the request always has a valid userId.)
app.get('/:id/tracking', async (c) => {
  const userId  = (c as any).get('userId') as string;
  const role    = (c as any).get('userRole') as string;
  const orderId = c.req.param('id');

  const order = await c.env.DB.prepare(`
    SELECT o.id, o.user_id, o.awb_code, o.tracking_url, o.courier_name, o.shipment_status
    FROM orders o
    WHERE o.id = ?
  `).bind(orderId).first<{
    id: string; user_id: string | null;
    awb_code: string | null; tracking_url: string | null;
    courier_name: string | null; shipment_status: string | null;
  }>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found', code: 'NOT_FOUND' }, 404);
  }
  const isAdmin = ['admin', 'superadmin'].includes(role);
  if (!isAdmin && order.user_id !== userId) {
    return c.json({ success: false, error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  return c.json({ success: true, data: await fetchTrackingForOrder(c.env, order) });
});

async function fetchTrackingForOrder(
  env: Bindings,
  order: {
    id: string; awb_code: string | null; tracking_url: string | null;
    courier_name: string | null; shipment_status: string | null;
  },
): Promise<TrackingResponse & { awb_pending: boolean }> {
  // No AWB yet — shipment is still being created (or automation failed).
  if (!order.awb_code) {
    return {
      awb_code:       null,
      courier_name:   order.courier_name,
      current_status: order.shipment_status ?? 'Preparing shipment',
      edd:            null,
      tracking_url:   order.tracking_url,
      origin:         null,
      destination:    null,
      activities:     [],
      awb_pending:    true,
    };
  }

  const cacheKey = `track:awb:${order.awb_code}`;
  const cached = await env.KV_CACHE.get(cacheKey);
  if (cached) {
    try {
      return { ...(JSON.parse(cached) as TrackingResponse), awb_pending: false };
    } catch { /* re-fetch */ }
  }

  if (!isShiprocketConfigured(env)) {
    return {
      awb_code:       order.awb_code,
      courier_name:   order.courier_name,
      current_status: order.shipment_status ?? 'In transit',
      edd:            null,
      tracking_url:   order.tracking_url,
      origin:         null,
      destination:    null,
      activities:     [],
      awb_pending:    false,
    };
  }

  try {
    const sr   = new ShiprocketService(env);
    const data = await sr.trackByAwb(order.awb_code);
    if (!data) {
      // Shiprocket hasn't picked up the AWB in their tracking system yet.
      return {
        awb_code:       order.awb_code,
        courier_name:   order.courier_name,
        current_status: order.shipment_status ?? 'Awaiting pickup',
        edd:            null,
        tracking_url:   order.tracking_url,
        origin:         null,
        destination:    null,
        activities:     [],
        awb_pending:    false,
      };
    }

    const shaped = shapeTracking(data, order.tracking_url);
    await env.KV_CACHE.put(cacheKey, JSON.stringify(shaped), {
      expirationTtl: TRACKING_CACHE_TTL,
    });

    // Sync latest status back to the order row so admin UI and list views
    // reflect the current state without needing a Shiprocket call.
    if (shaped.current_status) {
      const statusUpper = shaped.current_status.toUpperCase();
      const localStatus =
        statusUpper.includes('DELIVERED') ? 'delivered'
        : statusUpper.includes('OUT FOR DELIVERY') || statusUpper.includes('IN TRANSIT')
          || statusUpper.includes('PICKED') || statusUpper.includes('SHIPPED') ? 'shipped'
        : null;

      const updates: string[] = ['shipment_status = ?', 'shipment_status_updated_at = datetime(\'now\')'];
      const bindings: unknown[] = [shaped.current_status];
      if (localStatus === 'delivered') {
        updates.push('status = ?', 'delivered_at = COALESCE(delivered_at, datetime(\'now\'))');
        bindings.push('delivered');
      } else if (localStatus === 'shipped') {
        updates.push('status = ?', 'shipped_at = COALESCE(shipped_at, datetime(\'now\'))');
        bindings.push('shipped');
      }
      bindings.push(order.id);

      await env.DB.prepare(
        `UPDATE orders SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      ).bind(...bindings).run();
    }

    return { ...shaped, awb_pending: false };
  } catch (err) {
    console.error('[orders/tracking] Shiprocket lookup failed for', order.awb_code, err);
    return {
      awb_code:       order.awb_code,
      courier_name:   order.courier_name,
      current_status: order.shipment_status ?? 'Tracking unavailable',
      edd:            null,
      tracking_url:   order.tracking_url,
      origin:         null,
      destination:    null,
      activities:     [],
      awb_pending:    false,
    };
  }
}

export default app;
