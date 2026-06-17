import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { couponSchema } from '../../lib/validators';
import { generateId } from '../../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin/coupons ──────────────────────────────────
app.get('/', async (c) => {
  const page   = Number(c.req.query('page')  ?? 1);
  const limit  = Number(c.req.query('limit') ?? 20);
  const offset = (page - 1) * limit;

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT id, code, type, value, min_order_amount, max_usage, usage_count,
             is_first_order_only, is_active, expires_at, created_at
      FROM coupons
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all(),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM coupons')
      .first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      coupons:    rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── POST /api/admin/coupons ─────────────────────────────────
app.post('/', zValidator('json', couponSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM coupons WHERE code = ?',
  ).bind(body.code).first();

  if (existing) {
    return c.json({ success: false, error: 'Coupon code already exists', code: 'DUPLICATE_CODE' }, 409);
  }

  const id  = generateId('cpn');
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO coupons (
      id, code, type, value, min_order_amount, max_usage,
      is_first_order_only, is_active, expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.code, body.type, body.value,
    body.minOrderAmount ?? null,
    body.maxUsage ?? null,
    body.isFirstOrderOnly ? 1 : 0,
    body.isActive ? 1 : 0,
    body.expiresAt ?? null,
    now,
  ).run();

  return c.json({ success: true, data: { id, code: body.code } }, 201);
});

// ─── PUT /api/admin/coupons/:id ──────────────────────────────
app.put('/:id', zValidator('json', couponSchema.partial()), async (c) => {
  const id   = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare('SELECT id FROM coupons WHERE id = ?')
    .bind(id).first();
  if (!existing) {
    return c.json({ success: false, error: 'Coupon not found', code: 'NOT_FOUND' }, 404);
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, string> = {
    code:             'code',
    type:             'type',
    value:            'value',
    minOrderAmount:   'min_order_amount',
    maxUsage:         'max_usage',
    isFirstOrderOnly: 'is_first_order_only',
    isActive:         'is_active',
    expiresAt:        'expires_at',
  };

  for (const [jsKey, sqlCol] of Object.entries(fieldMap)) {
    if (jsKey in body) {
      const val = (body as Record<string, unknown>)[jsKey];
      fields.push(`${sqlCol} = ?`);
      values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
    }
  }

  if (!fields.length) {
    return c.json({ success: false, error: 'No fields to update', code: 'NO_UPDATE' }, 400);
  }

  values.push(id);
  await c.env.DB.prepare(
    `UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  return c.json({ success: true, data: { id } });
});

// ─── DELETE /api/admin/coupons/:id ───────────────────────────
app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM coupons WHERE id = ?')
    .bind(id).first();
  if (!existing) {
    return c.json({ success: false, error: 'Coupon not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();

  return c.json({ success: true, data: null });
});

export default app;
