import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin/customers ────────────────────────────────
app.get('/', async (c) => {
  const page   = Number(c.req.query('page')   ?? 1);
  const limit  = Number(c.req.query('limit')  ?? 20);
  const search = c.req.query('search') ?? '';
  const offset = (page - 1) * limit;

  const conditions: string[] = ["u.role = 'customer'"];
  const bind: (string | number)[] = [];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    bind.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.payment_status = 'captured' THEN o.total ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      ${where}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bind, limit, offset).all(),
    c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM users u ${where}
    `).bind(...bind).first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      customers:  rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── GET /api/admin/customers/:id ───────────────────────────
app.get('/:id', async (c) => {
  const customerId = c.req.param('id');

  const customer = await c.env.DB.prepare(`
    SELECT
      u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(CASE WHEN o.payment_status = 'captured' THEN o.total ELSE 0 END), 0) as total_spent,
      COALESCE(AVG(CASE WHEN o.payment_status = 'captured' THEN o.total ELSE NULL END), 0) as avg_order_value
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.id = ?
    GROUP BY u.id
  `).bind(customerId).first();

  if (!customer) {
    return c.json({ success: false, error: 'Customer not found', code: 'NOT_FOUND' }, 404);
  }

  const [orders, addresses] = await Promise.all([
    c.env.DB.prepare(`
      SELECT id, order_number, status, payment_status, total, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(customerId).all(),
    c.env.DB.prepare(`
      SELECT id, name, phone, address_line1, city, state, pincode, is_default
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).bind(customerId).all(),
  ]);

  return c.json({
    success: true,
    data: {
      ...customer,
      orders:    orders.results,
      addresses: addresses.results,
    },
  });
});

export default app;
