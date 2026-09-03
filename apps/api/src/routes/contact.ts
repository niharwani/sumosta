import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { contactSchema } from '../lib/validators';
import { generateId } from '../lib/utils';
import { sendContactNotification, sendContactAck } from '../services/email';

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

  // Fire notification + ack emails. Do not block the response on email delivery —
  // the message is safely stored in D1 regardless.
  const apiKey     = c.env.RESEND_API_KEY;
  const supportTo  = c.env.SUPPORT_EMAIL;
  const fromNoReply = c.env.RESEND_FROM_NOREPLY || c.env.RESEND_FROM || 'SUMOSTA <no-reply@sumosta.com>';

  if (apiKey) {
    const payload = { name, email, phone: phone ?? null, subject: subject ?? null, message };

    if (supportTo) {
      c.executionCtx.waitUntil(
        sendContactNotification(payload, supportTo, apiKey, fromNoReply)
          .catch((err) => console.error('[Contact] admin notification failed:', err)),
      );
    } else {
      console.warn('[Contact] SUPPORT_EMAIL not configured — admin notification skipped');
    }

    c.executionCtx.waitUntil(
      sendContactAck(payload, apiKey, fromNoReply, supportTo || null)
        .catch((err) => console.error('[Contact] customer ack failed:', err)),
    );
  } else {
    console.warn('[Contact] RESEND_API_KEY not configured — emails skipped');
  }

  return c.json({
    success: true,
    data: { message: "Thanks for reaching out! We'll get back to you within 24 hours." },
  });
});

export default app;
