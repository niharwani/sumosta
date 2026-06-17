import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { contactSchema } from '../lib/validators';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// ─── POST /api/contact ───────────────────────────────────────
app.post('/', zValidator('json', contactSchema), async (c) => {
  const { name, email, phone, subject, message } = c.req.valid('json');

  const id  = generateId('msg');
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO contact_messages (id, name, email, phone, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, email, phone ?? null, subject ?? null, message, now).run();

  return c.json({
    success: true,
    data: { message: "Thanks for reaching out! We'll get back to you within 24 hours." },
  });
});

export default app;
