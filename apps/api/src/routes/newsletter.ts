import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import type { Bindings } from '../index';
import { newsletterSchema } from '../lib/validators';
import { generateId } from '../lib/utils';
import { sendNewsletterConfirmation, sendNewsletterWelcome } from '../services/email';

const app = new Hono<{ Bindings: Bindings }>();

// ─── POST /api/newsletter ────────────────────────────────────
// Double-opt-in: create/refresh a pending row and email a
// confirmation link. Subscription is only active after the user
// clicks the link (GET /confirm/:token).
app.post('/', zValidator('json', newsletterSchema), async (c) => {
  const { email, source } = c.req.valid('json');

  const apiKey     = c.env.RESEND_API_KEY;
  const baseUrl    = (c.env.BASE_URL ?? '').replace(/\/$/, '');
  const fromNoReply = c.env.RESEND_FROM_NOREPLY || c.env.RESEND_FROM || 'SUMOSTA <no-reply@sumosta.com>';

  const existing = await c.env.DB
    .prepare('SELECT id, is_active, confirm_token, unsubscribe_token FROM subscribers WHERE email = ?')
    .bind(email)
    .first<{ id: string; is_active: number; confirm_token: string | null; unsubscribe_token: string | null }>();

  const now = new Date().toISOString();

  if (existing) {
    // Already fully confirmed — succeed silently, don't spam another email.
    if (existing.is_active === 1) {
      return c.json({
        success: true,
        data: { message: "You're already subscribed. Watch your inbox for golden updates." },
      });
    }

    // Re-issue a fresh confirm token (invalidates any old link) and resend.
    const confirmToken     = nanoid(32);
    const unsubscribeToken = existing.unsubscribe_token ?? nanoid(32);

    await c.env.DB
      .prepare(
        'UPDATE subscribers SET confirm_token = ?, unsubscribe_token = ?, source = COALESCE(?, source) WHERE id = ?',
      )
      .bind(confirmToken, unsubscribeToken, source ?? null, existing.id)
      .run();

    if (apiKey && baseUrl) {
      const confirmUrl = `${baseUrl}/api/newsletter/confirm/${confirmToken}`;
      c.executionCtx.waitUntil(
        sendNewsletterConfirmation(email, confirmUrl, apiKey, fromNoReply)
          .catch((err) => console.error('[Newsletter] confirmation resend failed:', err)),
      );
    }

    return c.json({
      success: true,
      data: { message: 'Check your email to confirm your subscription.' },
    });
  }

  const id               = generateId('sub');
  const confirmToken     = nanoid(32);
  const unsubscribeToken = nanoid(32);

  await c.env.DB.prepare(`
    INSERT INTO subscribers
      (id, email, is_active, source, confirm_token, unsubscribe_token, created_at)
    VALUES (?, ?, 0, ?, ?, ?, ?)
  `).bind(id, email, source ?? 'website', confirmToken, unsubscribeToken, now).run();

  if (apiKey && baseUrl) {
    const confirmUrl = `${baseUrl}/api/newsletter/confirm/${confirmToken}`;
    c.executionCtx.waitUntil(
      sendNewsletterConfirmation(email, confirmUrl, apiKey, fromNoReply)
        .catch((err) => console.error('[Newsletter] confirmation send failed:', err)),
    );
  } else {
    console.warn('[Newsletter] RESEND_API_KEY or BASE_URL missing — confirmation email skipped');
  }

  return c.json(
    {
      success: true,
      data: { message: 'Check your email to confirm your subscription.' },
    },
    201,
  );
});

// ─── GET /api/newsletter/confirm/:token ──────────────────────
// Idempotent: repeated clicks after activation just redirect to
// the thank-you page without re-sending the welcome email.
app.get('/confirm/:token', async (c) => {
  const token   = c.req.param('token');
  const baseUrl = (c.env.BASE_URL ?? '').replace(/\/$/, '');

  const row = await c.env.DB
    .prepare(
      'SELECT id, email, is_active, unsubscribe_token FROM subscribers WHERE confirm_token = ?',
    )
    .bind(token)
    .first<{ id: string; email: string; is_active: number; unsubscribe_token: string | null }>();

  if (!row) {
    return c.redirect(`${baseUrl}/newsletter/confirmed?status=invalid`, 302);
  }

  if (row.is_active !== 1) {
    const unsubToken = row.unsubscribe_token ?? nanoid(32);

    await c.env.DB
      .prepare(
        "UPDATE subscribers SET is_active = 1, confirmed_at = datetime('now'), confirm_token = NULL, unsubscribe_token = ? WHERE id = ?",
      )
      .bind(unsubToken, row.id)
      .run();

    const apiKey      = c.env.RESEND_API_KEY;
    const fromNoReply = c.env.RESEND_FROM_NOREPLY || c.env.RESEND_FROM || 'SUMOSTA <no-reply@sumosta.com>';

    if (apiKey && baseUrl) {
      c.executionCtx.waitUntil(
        sendNewsletterWelcome(row.email, unsubToken, apiKey, baseUrl, fromNoReply)
          .catch((err) => console.error('[Newsletter] welcome email failed:', err)),
      );
    }
  }

  return c.redirect(`${baseUrl}/newsletter/confirmed`, 302);
});

// ─── GET /api/newsletter/unsubscribe/:token ──────────────────
// One-click unsubscribe. Accepts GET so RFC-8058 List-Unsubscribe
// mail clients can hit it directly without JS.
app.get('/unsubscribe/:token', async (c) => {
  const token   = c.req.param('token');
  const baseUrl = (c.env.BASE_URL ?? '').replace(/\/$/, '');

  const row = await c.env.DB
    .prepare('SELECT id FROM subscribers WHERE unsubscribe_token = ?')
    .bind(token)
    .first<{ id: string }>();

  if (row) {
    await c.env.DB
      .prepare('UPDATE subscribers SET is_active = 0 WHERE id = ?')
      .bind(row.id)
      .run();
  }

  return c.redirect(`${baseUrl}/newsletter/unsubscribed`, 302);
});

// ─── POST /api/newsletter/unsubscribe/:token ─────────────────
// RFC-8058 one-click unsubscribe (List-Unsubscribe-Post).
app.post('/unsubscribe/:token', async (c) => {
  const token = c.req.param('token');
  const row   = await c.env.DB
    .prepare('SELECT id FROM subscribers WHERE unsubscribe_token = ?')
    .bind(token)
    .first<{ id: string }>();

  if (row) {
    await c.env.DB
      .prepare('UPDATE subscribers SET is_active = 0 WHERE id = ?')
      .bind(row.id)
      .run();
  }

  return c.json({ success: true });
});

export default app;
