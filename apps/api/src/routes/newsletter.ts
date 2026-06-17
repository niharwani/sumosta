import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { newsletterSchema } from '../lib/validators';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// ─── POST /api/newsletter ────────────────────────────────────
app.post('/', zValidator('json', newsletterSchema), async (c) => {
  const { email, source } = c.req.valid('json');

  // Check for existing subscriber (return success even if already subscribed)
  const existing = await c.env.DB.prepare(
    'SELECT id, is_active FROM subscribers WHERE email = ?',
  ).bind(email).first<{ id: string; is_active: number }>();

  if (existing) {
    // Re-activate if previously unsubscribed
    if (!existing.is_active) {
      await c.env.DB.prepare(
        'UPDATE subscribers SET is_active = 1 WHERE id = ?',
      ).bind(existing.id).run();
    }
    return c.json({
      success: true,
      data: { message: "You're subscribed! Expect golden updates in your inbox." },
    });
  }

  const id  = generateId('sub');
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO subscribers (id, email, source, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(id, email, source ?? 'website', now).run();

  return c.json({
    success: true,
    data: { message: "You're subscribed! Expect golden updates in your inbox." },
  }, 201);
});

export default app;
