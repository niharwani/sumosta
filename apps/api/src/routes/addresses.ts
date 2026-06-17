import { Hono } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../lib/utils';

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string };
};

const app = new Hono<AppEnv>();

app.use('*', authMiddleware as any);

// ─── GET /api/addresses ─────────────────────────────────────
app.get('/', async (c) => {
  const userId = (c as any).get('userId') as string;

  const rows = await c.env.DB.prepare(`
    SELECT id, name, phone, address_line1, address_line2,
           city, state, pincode, is_default, created_at
    FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, created_at DESC
  `).bind(userId).all();

  return c.json({ success: true, data: rows.results });
});

// ─── POST /api/addresses ────────────────────────────────────
app.post('/', async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json<{
    name: string; phone: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; pincode: string; isDefault?: boolean;
  }>();

  const id = generateId('adr');
  const now = new Date().toISOString();

  if (body.isDefault) {
    await c.env.DB.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').bind(userId).run();
  }

  // First address is automatically default
  const count = await c.env.DB.prepare('SELECT COUNT(*) as n FROM addresses WHERE user_id = ?')
    .bind(userId).first<{ n: number }>();
  const isDefault = body.isDefault || (count?.n ?? 0) === 0 ? 1 : 0;

  await c.env.DB.prepare(`
    INSERT INTO addresses (id, user_id, name, phone, address_line1, address_line2,
                           city, state, pincode, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, userId, body.name, body.phone, body.addressLine1, body.addressLine2 ?? null,
    body.city, body.state, body.pincode, isDefault, now,
  ).run();

  return c.json({ success: true, data: { id } }, 201);
});

// ─── PUT /api/addresses/:id ──────────────────────────────────
app.put('/:id', async (c) => {
  const userId = (c as any).get('userId') as string;
  const id = c.req.param('id');
  const body = await c.req.json<{
    name: string; phone: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; pincode: string;
  }>();

  const existing = await c.env.DB.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?')
    .bind(id, userId).first();

  if (!existing) {
    return c.json({ success: false, error: 'Address not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE addresses
    SET name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
        city = ?, state = ?, pincode = ?
    WHERE id = ? AND user_id = ?
  `).bind(
    body.name, body.phone, body.addressLine1, body.addressLine2 ?? null,
    body.city, body.state, body.pincode, id, userId,
  ).run();

  return c.json({ success: true, data: { id } });
});

// ─── DELETE /api/addresses/:id ───────────────────────────────
app.delete('/:id', async (c) => {
  const userId = (c as any).get('userId') as string;
  const id = c.req.param('id');

  const result = await c.env.DB.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?')
    .bind(id, userId).run();

  if (!result.meta.changes) {
    return c.json({ success: false, error: 'Address not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true, data: null });
});

// ─── POST /api/addresses/:id/default ────────────────────────
app.post('/:id/default', async (c) => {
  const userId = (c as any).get('userId') as string;
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?')
    .bind(id, userId).first();

  if (!existing) {
    return c.json({ success: false, error: 'Address not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').bind(userId),
    c.env.DB.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').bind(id),
  ]);

  return c.json({ success: true, data: { id } });
});

export default app;
