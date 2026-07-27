import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin/reviews ──────────────────────────────────
app.get('/', async (c) => {
  const page     = Number(c.req.query('page')    ?? 1);
  const limit    = Number(c.req.query('limit')   ?? 20);
  const approved = c.req.query('approved'); // '0' | '1' | undefined (all)
  const offset   = (page - 1) * limit;

  const conditions: string[] = [];
  const bind: (string | number)[] = [];

  if (approved !== undefined) {
    conditions.push('r.is_approved = ?');
    bind.push(Number(approved));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        r.id, r.rating, r.title, r.body, r.is_verified, r.is_approved, r.created_at,
        u.id as user_id, u.name as user_name, u.email as user_email,
        p.id as product_id, p.name as product_name, p.slug as product_slug
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN products p ON p.id = r.product_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bind, limit, offset).all(),
    c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM reviews r ${where}
    `).bind(...bind).first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      reviews:    rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── PATCH /api/admin/reviews/:id ────────────────────────────
app.patch('/:id', async (c) => {
  const reviewId = c.req.param('id');
  const body     = await c.req.json<{ is_approved?: boolean }>().catch(() => ({} as { is_approved?: boolean }));

  const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE id = ?')
    .bind(reviewId).first();
  if (!existing) {
    return c.json({ success: false, error: 'Review not found', code: 'NOT_FOUND' }, 404);
  }

  if (body.is_approved !== undefined) {
    await c.env.DB.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?')
      .bind(body.is_approved ? 1 : 0, reviewId).run();
  }

  return c.json({ success: true, data: { id: reviewId, is_approved: body.is_approved } });
});

// ─── PATCH /api/admin/reviews/:id/approve ────────────────────
app.patch('/:id/approve', async (c) => {
  const reviewId = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE id = ?')
    .bind(reviewId).first();
  if (!existing) {
    return c.json({ success: false, error: 'Review not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare('UPDATE reviews SET is_approved = 1 WHERE id = ?')
    .bind(reviewId).run();

  return c.json({ success: true, data: { id: reviewId, isApproved: true } });
});

// ─── DELETE /api/admin/reviews/:id ───────────────────────────
app.delete('/:id', async (c) => {
  const reviewId = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE id = ?')
    .bind(reviewId).first();
  if (!existing) {
    return c.json({ success: false, error: 'Review not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(reviewId).run();

  return c.json({ success: true, data: null });
});

export default app;
