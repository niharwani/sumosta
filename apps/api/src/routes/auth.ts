import { Hono } from 'hono';
import type { Bindings } from '../index';
import { hashPassword, verifyPassword } from '../lib/hash';
import { signJwt, verifyJwt, generateRefreshToken } from '../lib/jwt';
import { generateId } from '../lib/utils';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../lib/validators';
import { authMiddleware } from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Bindings }>();

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── POST /api/auth/register ────────────────────────────────
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, phone, password } = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ? OR phone = ?'
  ).bind(email, phone).first();

  if (existing) {
    return c.json({ success: false, error: 'Email or phone already registered', code: 'DUPLICATE_USER' }, 409);
  }

  const id           = generateId('usr');
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, name, email, phone, passwordHash, 'customer').run();

  const accessToken   = await signJwt({ sub: id, email, role: 'customer' }, c.env.JWT_SECRET, '15m');
  const refreshToken  = generateRefreshToken();

  await c.env.KV_SESSIONS.put(`refresh:${id}:${refreshToken}`, id, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  return c.json({
    success: true,
    data: {
      user:         { id, name, email, phone, role: 'customer' },
      accessToken,
      refreshToken,
    },
  }, 201);
});

// ─── POST /api/auth/login ───────────────────────────────────
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, password_hash, role FROM users WHERE email = ? AND is_active = 1'
  ).bind(email).first<{ id: string; name: string; email: string; phone: string; password_hash: string; role: string }>();

  if (!user) {
    return c.json({ success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const accessToken  = await signJwt({ sub: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET, '15m');
  const refreshToken = generateRefreshToken();

  await c.env.KV_SESSIONS.put(`refresh:${user.id}:${refreshToken}`, user.id, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  return c.json({
    success: true,
    data: {
      user:         { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});

// ─── POST /api/auth/refresh ─────────────────────────────────
app.post('/refresh', async (c) => {
  const body = await c.req.json<{ refreshToken: string; userId: string }>();
  const { refreshToken, userId } = body;

  const storedId = await c.env.KV_SESSIONS.get(`refresh:${userId}:${refreshToken}`);
  if (!storedId || storedId !== userId) {
    return c.json({ success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' }, 401);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, role FROM users WHERE id = ? AND is_active = 1'
  ).bind(userId).first<{ id: string; email: string; role: string }>();

  if (!user) {
    return c.json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' }, 404);
  }

  const accessToken  = await signJwt({ sub: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET, '15m');
  const newRefresh   = generateRefreshToken();

  // Rotate refresh token
  await c.env.KV_SESSIONS.delete(`refresh:${userId}:${refreshToken}`);
  await c.env.KV_SESSIONS.put(`refresh:${userId}:${newRefresh}`, userId, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  return c.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
});

// ─── POST /api/auth/logout ──────────────────────────────────
app.post('/logout', async (c) => {
  const body = await c.req.json<{ refreshToken: string; userId: string }>().catch(() => null);
  if (body?.refreshToken && body?.userId) {
    await c.env.KV_SESSIONS.delete(`refresh:${body.userId}:${body.refreshToken}`);
  }
  return c.json({ success: true, data: null });
});

// ─── GET /api/auth/me ───────────────────────────────────────
app.get('/me', authMiddleware as any, async (c) => {
  const userId = (c as any).get('userId') as string;

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) {
    return c.json({ success: false, error: 'User not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true, data: user });
});

// ─── POST /api/auth/forgot-password ─────────────────────────
app.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');

  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();

  // Always return success to avoid email enumeration
  if (!user) {
    return c.json({ success: true, data: { message: 'If that email exists, a reset link was sent.' } });
  }

  const token   = generateRefreshToken();
  const expires = 60 * 60; // 1 hour

  await c.env.KV_SESSIONS.put(`reset:${user.id}:${token}`, user.id, {
    expirationTtl: expires,
  });

  // In production: send email via Resend with reset link
  // await sendPasswordResetEmail(email, token, c.env.RESEND_API_KEY, c.env.BASE_URL);

  return c.json({ success: true, data: { message: 'If that email exists, a reset link was sent.' } });
});

// ─── PATCH /api/auth/me — update profile ─────────────────────
app.patch('/me', authMiddleware as any, async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json<{ name?: string; phone?: string }>();

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (body.name) { fields.push('name = ?'); values.push(body.name); }
  if ('phone' in body) { fields.push('phone = ?'); values.push(body.phone ?? null); }

  if (fields.length === 1) {
    return c.json({ success: false, error: 'No fields to update', code: 'NO_UPDATE' }, 400);
  }

  values.push(userId);
  await c.env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role FROM users WHERE id = ?'
  ).bind(userId).first();

  return c.json({ success: true, data: user });
});

export default app;
