import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin/marketing/subscribers ────────────────────
app.get('/subscribers', async (c) => {
  const page    = Number(c.req.query('page')    ?? 1);
  const limit   = Number(c.req.query('limit')   ?? 50);
  const search  = c.req.query('search') ?? '';
  const status  = c.req.query('status') ?? ''; // 'active' | 'inactive' | ''
  const offset  = (page - 1) * limit;

  const conditions: string[] = [];
  const bind: (string | number)[] = [];

  if (search) {
    conditions.push('email LIKE ?');
    bind.push(`%${search}%`);
  }
  if (status === 'active')   { conditions.push('is_active = 1'); }
  if (status === 'inactive') { conditions.push('is_active = 0'); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows, countRow, stats] = await Promise.all([
    c.env.DB.prepare(`
      SELECT id, email, source, is_active, created_at
      FROM subscribers ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bind, limit, offset).all(),

    c.env.DB.prepare(`SELECT COUNT(*) as total FROM subscribers ${where}`)
      .bind(...bind).first<{ total: number }>(),

    c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM subscribers
    `).first<{ total: number; active: number; inactive: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      subscribers: rows.results,
      total:       countRow?.total ?? 0,
      page,
      limit,
      totalPages:  Math.ceil((countRow?.total ?? 0) / limit),
      stats:       stats ?? { total: 0, active: 0, inactive: 0 },
    },
  });
});

// ─── PATCH /api/admin/marketing/subscribers/:id ───────────────
app.patch('/subscribers/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json<{ is_active?: boolean }>().catch(() => ({} as { is_active?: boolean }));

  const existing = await c.env.DB.prepare('SELECT id FROM subscribers WHERE id = ?')
    .bind(id).first();
  if (!existing) {
    return c.json({ success: false, error: 'Subscriber not found', code: 'NOT_FOUND' }, 404);
  }

  if (body.is_active !== undefined) {
    await c.env.DB.prepare('UPDATE subscribers SET is_active = ? WHERE id = ?')
      .bind(body.is_active ? 1 : 0, id).run();
  }

  return c.json({ success: true, data: { id } });
});

// ─── DELETE /api/admin/marketing/subscribers/:id ──────────────
app.delete('/subscribers/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM subscribers WHERE id = ?')
    .bind(id).first();
  if (!existing) {
    return c.json({ success: false, error: 'Subscriber not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();

  return c.json({ success: true, data: null });
});

// ─── GET /api/admin/marketing/contact-messages ────────────────
app.get('/contact-messages', async (c) => {
  const page    = Number(c.req.query('page')  ?? 1);
  const limit   = Number(c.req.query('limit') ?? 20);
  const unread  = c.req.query('unread');
  const offset  = (page - 1) * limit;

  const where = unread === '1' ? 'WHERE is_read = 0' : '';

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT id, name, email, phone, subject, message, is_read, created_at
      FROM contact_messages ${where}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).bind(limit, offset).all(),
    c.env.DB.prepare(`SELECT COUNT(*) as total FROM contact_messages ${where}`)
      .first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      messages:   rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── PATCH /api/admin/marketing/contact-messages/:id/read ─────
app.patch('/contact-messages/:id/read', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?')
    .bind(id).run();
  return c.json({ success: true, data: { id } });
});

export default app;
