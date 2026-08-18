import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import type { Bindings } from '../index';
import { hashPassword, verifyPassword } from '../lib/hash';
import { signJwt, generateRefreshToken } from '../lib/jwt';
import { generateId } from '../lib/utils';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../lib/validators';
import { authMiddleware } from '../middleware/auth';
import { sendPasswordReset } from '../services/email';
import { verifyFirebaseIdToken } from '../lib/firebase';

// Passwordless account marker — same convention as guest checkout.
const UNUSABLE_PASSWORD_HASH = '!' + Array.from({ length: 59 }, () =>
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
    Math.floor(Math.random() * 62),
  ),
).join('');

// ─── Local Zod schemas (kept inside route to respect file scope) ──────
const resetPasswordSchema = z.object({
  token:    z.string().min(10, 'Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
});

const updateProfileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number').optional(),
});

const sessionExchangeSchema = z.object({
  code: z.string().min(10, 'Invalid session code'),
});

const firebasePhoneVerifySchema = z.object({
  idToken: z.string().min(20, 'Missing Firebase ID token'),
});

type AuthVariables = {
  userId: string;
  userRole: string;
  userEmail: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const REFRESH_TOKEN_TTL   = 7 * 24 * 60 * 60;  // 7 days (seconds)
const REFRESH_COOKIE_NAME = 'sumosta_rt';
const RESET_TOKEN_TTL     = 30 * 60;           // 30 minutes (seconds)

// ─── Cookie helpers ───────────────────────────────────────────────────
function isProdEnv(baseUrl: string): boolean {
  return baseUrl.startsWith('https://');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setRefreshCookie(c: any, token: string): void {
  const isProd = isProdEnv(c.env.BASE_URL as string);
  setCookie(c, REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   isProd,
    // Frontend (.pages.dev / sumosta.com) and API (.workers.dev) are cross-site,
    // so cookies MUST be SameSite=None+Secure to survive XHR calls like /refresh.
    // Falls back to Lax for localhost dev where cross-site issues don't apply.
    sameSite: isProd ? 'None' : 'Lax',
    path:     '/',
    maxAge:   REFRESH_TOKEN_TTL,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clearRefreshCookie(c: any): void {
  const isProd = isProdEnv(c.env.BASE_URL as string);
  deleteCookie(c, REFRESH_COOKIE_NAME, {
    path:     '/',
    secure:   isProd,
    sameSite: isProd ? 'None' : 'Lax',
  });
}

// ─── Rate-limit helper for login attempts ─────────────────────────────
async function checkLoginRateLimit(
  kv: KVNamespace,
  email: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `login_attempts:${email.toLowerCase()}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= 5) {
    // KV TTL ~ 15 minutes; approximate retry-after with 900s
    return { allowed: false, retryAfter: 15 * 60 };
  }
  return { allowed: true };
}

async function recordFailedLogin(kv: KVNamespace, email: string): Promise<void> {
  const key = `login_attempts:${email.toLowerCase()}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  await kv.put(key, String(count + 1), { expirationTtl: 15 * 60 });
}

async function clearFailedLogins(kv: KVNamespace, email: string): Promise<void> {
  await kv.delete(`login_attempts:${email.toLowerCase()}`);
}

// ─── Invalidate all refresh tokens for a user ─────────────────────────
async function invalidateAllRefreshTokens(kv: KVNamespace, userId: string): Promise<void> {
  const listed = await kv.list({ prefix: `refresh:${userId}:` });
  await Promise.all(listed.keys.map((k) => kv.delete(k.name)));
}

// ─── Small random delay (100-300ms) to blunt timing attacks ───────────
async function timingJitter(): Promise<void> {
  const ms = 100 + Math.floor(Math.random() * 200);
  await new Promise((r) => setTimeout(r, ms));
}

// ─── Decode JWT payload WITHOUT verifying signature (for userId hint) ─
function decodeJwtPayloadUnsafe(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ============================================================
// POST /api/auth/register
// ============================================================
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, phone, password } = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ? OR phone = ?'
  ).bind(email, phone).first();

  if (existing) {
    return c.json(
      { success: false, error: 'Email or phone already registered', code: 'DUPLICATE_USER' },
      409,
    );
  }

  const id           = generateId('usr');
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, name, email, phone, passwordHash, 'customer').run();

  const accessToken  = await signJwt(
    { sub: id, email, role: 'customer' },
    c.env.JWT_SECRET,
    '15m',
  );
  const refreshToken = generateRefreshToken();

  await c.env.KV_SESSIONS.put(`refresh:${id}:${refreshToken}`, id, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  setRefreshCookie(c, refreshToken);

  return c.json({
    success: true,
    data: {
      user:         { id, name, email, phone, role: 'customer' },
      accessToken,
      refreshToken,
    },
  }, 201);
});

// ============================================================
// POST /api/auth/login
// ============================================================
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // Per-account rate limit BEFORE lookup (also protects enumeration timing)
  const gate = await checkLoginRateLimit(c.env.KV_SESSIONS, email);
  if (!gate.allowed) {
    c.header('Retry-After', String(gate.retryAfter ?? 900));
    return c.json(
      { success: false, error: 'Too many failed attempts. Please try again later.', code: 'RATE_LIMITED' },
      429,
    );
  }

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, password_hash, role FROM users WHERE email = ? AND is_active = 1'
  ).bind(email).first<{
    id: string; name: string; email: string; phone: string; password_hash: string; role: string;
  }>();

  if (!user) {
    await recordFailedLogin(c.env.KV_SESSIONS, email);
    return c.json(
      { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      401,
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await recordFailedLogin(c.env.KV_SESSIONS, email);
    return c.json(
      { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      401,
    );
  }

  await clearFailedLogins(c.env.KV_SESSIONS, email);

  const isAdmin      = user.role === 'admin' || user.role === 'superadmin';
  const accessToken  = await signJwt(
    { sub: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET,
    isAdmin ? '8h' : '15m',
  );
  const refreshToken = generateRefreshToken();

  await c.env.KV_SESSIONS.put(`refresh:${user.id}:${refreshToken}`, user.id, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  setRefreshCookie(c, refreshToken);

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
});

// ============================================================
// POST /api/auth/refresh
// Reads refresh token from httpOnly cookie (preferred) or body (fallback).
// No O(N) KV scan: userId is derived from the refresh JWT... except our
// refresh tokens are opaque random strings, not JWTs. We keep index by
// composite key `refresh:{userId}:{token}` — client must supply userId
// in body when the cookie is missing.
// ============================================================
app.post('/refresh', async (c) => {
  // Body is optional in the cookie flow
  const body = await c.req.json<{ refreshToken?: string; userId?: string }>()
    .catch(() => ({} as { refreshToken?: string; userId?: string }));

  const cookieToken  = getCookie(c, REFRESH_COOKIE_NAME);
  const refreshToken = cookieToken ?? body.refreshToken;

  if (!refreshToken) {
    return c.json(
      { success: false, error: 'Missing refresh token', code: 'MISSING_TOKEN' },
      401,
    );
  }

  // Resolve userId — prefer body hint, fall back to persisted mapping via KV list.
  // The cookie-only flow needs a way to map the opaque token → userId without
  // scanning. We store a secondary index `rt_lookup:{token}` → userId.
  let userId = body.userId;
  if (!userId) {
    userId = (await c.env.KV_SESSIONS.get(`rt_lookup:${refreshToken}`)) ?? undefined;
  }

  if (!userId) {
    // Fallback: last-resort list scan (only executed when both cookie and lookup are stale)
    const listed = await c.env.KV_SESSIONS.list({ prefix: `refresh:` });
    const match  = listed.keys.find((k) => k.name.endsWith(`:${refreshToken}`));
    if (!match) {
      clearRefreshCookie(c);
      return c.json(
        { success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' },
        401,
      );
    }
    userId = match.name.split(':')[1];
  }

  const storedId = await c.env.KV_SESSIONS.get(`refresh:${userId}:${refreshToken}`);
  if (!storedId || storedId !== userId) {
    clearRefreshCookie(c);
    return c.json(
      { success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' },
      401,
    );
  }

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role FROM users WHERE id = ? AND is_active = 1'
  ).bind(userId).first<{
    id: string; name: string; email: string; phone: string; role: string;
  }>();

  if (!user) {
    clearRefreshCookie(c);
    return c.json(
      { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
      404,
    );
  }

  const isAdmin     = user.role === 'admin' || user.role === 'superadmin';
  const accessToken = await signJwt(
    { sub: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET,
    isAdmin ? '8h' : '15m',
  );
  const newRefresh  = generateRefreshToken();

  // Rotate: delete old, write new (+ lookup index)
  await c.env.KV_SESSIONS.delete(`refresh:${userId}:${refreshToken}`);
  await c.env.KV_SESSIONS.delete(`rt_lookup:${refreshToken}`);
  await c.env.KV_SESSIONS.put(`refresh:${userId}:${newRefresh}`, userId, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });
  await c.env.KV_SESSIONS.put(`rt_lookup:${newRefresh}`, userId, {
    expirationTtl: REFRESH_TOKEN_TTL,
  });

  setRefreshCookie(c, newRefresh);

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role,
      },
      accessToken,
      refreshToken: newRefresh,
    },
  });
});

// ============================================================
// POST /api/auth/logout
// ============================================================
app.post('/logout', async (c) => {
  const body = await c.req.json<{ refreshToken?: string; userId?: string }>()
    .catch(() => ({} as { refreshToken?: string; userId?: string }));

  const cookieToken  = getCookie(c, REFRESH_COOKIE_NAME);
  const refreshToken = cookieToken ?? body.refreshToken;

  if (refreshToken) {
    let userId = body.userId ?? (await c.env.KV_SESSIONS.get(`rt_lookup:${refreshToken}`)) ?? undefined;
    if (!userId) {
      // Best-effort scan
      const listed = await c.env.KV_SESSIONS.list({ prefix: `refresh:` });
      const match  = listed.keys.find((k) => k.name.endsWith(`:${refreshToken}`));
      if (match) userId = match.name.split(':')[1];
    }
    if (userId) {
      await c.env.KV_SESSIONS.delete(`refresh:${userId}:${refreshToken}`);
    }
    await c.env.KV_SESSIONS.delete(`rt_lookup:${refreshToken}`);
  }

  clearRefreshCookie(c);
  return c.json({ success: true, data: null });
});

// ============================================================
// GET /api/auth/me
// ============================================================
app.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) {
    return c.json({ success: false, error: 'User not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true, data: user });
});

// ============================================================
// PATCH /api/auth/me — update profile
// ============================================================
app.patch('/me', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const body   = c.req.valid('json');

  if (!body.name && body.phone === undefined) {
    return c.json({ success: false, error: 'No fields to update', code: 'NO_UPDATE' }, 400);
  }

  // Phone uniqueness check
  if (body.phone) {
    const conflict = await c.env.DB.prepare(
      'SELECT id FROM users WHERE phone = ? AND id != ?'
    ).bind(body.phone, userId).first();
    if (conflict) {
      return c.json(
        { success: false, error: 'Phone number already in use', code: 'PHONE_TAKEN' },
        409,
      );
    }
  }

  const fields: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (body.name) { fields.push('name = ?'); values.push(body.name); }
  if (body.phone !== undefined) { fields.push('phone = ?'); values.push(body.phone); }

  values.push(userId);
  await c.env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role FROM users WHERE id = ?'
  ).bind(userId).first();

  return c.json({ success: true, data: { user } });
});

// ============================================================
// PATCH /api/auth/me/password — change password (authed)
// ============================================================
app.patch('/me/password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
  const userId = c.get('userId');
  const { currentPassword, newPassword } = c.req.valid('json');

  const row = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?'
  ).bind(userId).first<{ password_hash: string }>();

  if (!row) {
    return c.json({ success: false, error: 'User not found', code: 'NOT_FOUND' }, 404);
  }

  const ok = await verifyPassword(currentPassword, row.password_hash);
  if (!ok) {
    return c.json(
      { success: false, error: 'Current password is incorrect', code: 'INVALID_PASSWORD' },
      401,
    );
  }

  const newHash = await hashPassword(newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(newHash, userId).run();

  // Invalidate every refresh token for this user (force re-login elsewhere)
  await invalidateAllRefreshTokens(c.env.KV_SESSIONS, userId);

  return c.json({ success: true, data: { success: true } });
});

// ============================================================
// POST /api/auth/forgot-password
// ============================================================
app.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');

  // Rate-limit per email: 3 / hour
  const rateKey = `forgot_rate:${email.toLowerCase()}`;
  const rawCount = await c.env.KV_SESSIONS.get(rateKey);
  const count    = rawCount ? parseInt(rawCount, 10) : 0;
  if (count >= 3) {
    await timingJitter();
    return c.json({
      success: true,
      data: { message: 'If that email exists, a reset link was sent.' },
    });
  }
  await c.env.KV_SESSIONS.put(rateKey, String(count + 1), { expirationTtl: 60 * 60 });

  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first<{ id: string }>();

  // Always return success (prevent enumeration)
  if (!user) {
    await timingJitter();
    return c.json({
      success: true,
      data: { message: 'If that email exists, a reset link was sent.' },
    });
  }

  const token = generateRefreshToken();
  await c.env.KV_SESSIONS.put(`reset:${token}`, user.id, { expirationTtl: RESET_TOKEN_TTL });

  const resetUrl = `${c.env.BASE_URL}/auth/reset-password/${token}`;

  if (c.env.RESEND_API_KEY) {
    // Fire and forget; log failures but do not surface
    c.executionCtx.waitUntil(
      sendPasswordReset(
        email,
        resetUrl,
        c.env.RESEND_API_KEY,
        c.env.RESEND_FROM_NOREPLY || c.env.RESEND_FROM || 'SUMOSTA <no-reply@sumosta.com>',
        c.env.SUPPORT_EMAIL || null,
      ).catch((err) => console.error('[Auth] sendPasswordReset failed:', err)),
    );
  } else {
    console.warn('[Auth] RESEND_API_KEY missing — password reset email not sent. URL:', resetUrl);
  }

  await timingJitter();
  return c.json({
    success: true,
    data: { message: 'If that email exists, a reset link was sent.' },
  });
});

// ============================================================
// POST /api/auth/reset-password
// ============================================================
app.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json');

  const userId = await c.env.KV_SESSIONS.get(`reset:${token}`);
  if (!userId) {
    return c.json(
      { success: false, error: 'Invalid or expired reset token', code: 'INVALID_TOKEN' },
      400,
    );
  }

  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE id = ? AND is_active = 1'
  ).bind(userId).first<{ id: string }>();

  if (!user) {
    await c.env.KV_SESSIONS.delete(`reset:${token}`);
    return c.json(
      { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
      400,
    );
  }

  const newHash = await hashPassword(password);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(newHash, userId).run();

  // Delete the reset token AND invalidate any existing refresh tokens
  await c.env.KV_SESSIONS.delete(`reset:${token}`);
  await invalidateAllRefreshTokens(c.env.KV_SESSIONS, userId);

  return c.json({ success: true, data: { success: true } });
});

// ============================================================
// POST /api/auth/session-exchange
// Consumes a one-time OAuth handoff code (produced by /google/callback)
// and returns a proper session. The code is deleted on read.
// ============================================================
app.post('/session-exchange', zValidator('json', sessionExchangeSchema), async (c) => {
  const { code } = c.req.valid('json');

  const key     = `oauth_exchange:${code}`;
  const payload = await c.env.KV_SESSIONS.get(key);

  if (!payload) {
    return c.json(
      { success: false, error: 'Invalid or expired exchange code', code: 'INVALID_CODE' },
      400,
    );
  }

  // Delete immediately — one-time use
  await c.env.KV_SESSIONS.delete(key);

  let parsed: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string; phone: string; role: string };
  };
  try {
    parsed = JSON.parse(payload);
  } catch {
    return c.json(
      { success: false, error: 'Corrupt exchange payload', code: 'INVALID_CODE' },
      400,
    );
  }

  setRefreshCookie(c, parsed.refreshToken);

  return c.json({
    success: true,
    data: {
      user:         parsed.user,
      accessToken:  parsed.accessToken,
      refreshToken: parsed.refreshToken,
    },
  });
});

// ============================================================
// POST /api/auth/firebase-phone/verify
// ------------------------------------------------------------
// Hybrid phone-OTP flow: the client completes phone verification
// with Firebase Auth, then hands us the resulting Firebase ID token.
// We verify it against Google's JWKS, pull the phone_number claim,
// then either sign in an existing user with that phone or create a
// new passwordless account — and issue OUR normal access/refresh
// tokens so the rest of the app behaves identically to email login.
// ============================================================
app.post(
  '/firebase-phone/verify',
  zValidator('json', firebasePhoneVerifySchema),
  async (c) => {
    const { idToken } = c.req.valid('json');

    if (!c.env.FIREBASE_PROJECT_ID) {
      return c.json(
        { success: false, error: 'Phone sign-in is not configured', code: 'FIREBASE_NOT_CONFIGURED' },
        503,
      );
    }

    let claims;
    try {
      claims = await verifyFirebaseIdToken(idToken, c.env.FIREBASE_PROJECT_ID);
    } catch (err) {
      console.warn('[firebase-phone/verify] invalid id token', err);
      return c.json(
        { success: false, error: 'Invalid or expired verification. Please try again.', code: 'INVALID_TOKEN' },
        401,
      );
    }

    if (claims.firebase?.sign_in_provider !== 'phone') {
      return c.json(
        { success: false, error: 'Token is not a phone-verification token', code: 'WRONG_PROVIDER' },
        400,
      );
    }
    const e164 = claims.phone_number;
    if (!e164) {
      return c.json(
        { success: false, error: 'Phone number missing from verification', code: 'MISSING_PHONE' },
        400,
      );
    }

    // Firebase gives us E.164 (e.g. "+919876543210"). Our DB stores 10-digit
    // Indian numbers today. Normalise to 10 digits for lookup / storage.
    const local10 = e164.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(local10)) {
      return c.json(
        { success: false, error: 'Only Indian mobile numbers are supported right now', code: 'UNSUPPORTED_PHONE' },
        400,
      );
    }

    // Look up existing user by phone.
    let user = await c.env.DB.prepare(
      'SELECT id, name, email, phone, role FROM users WHERE phone = ? AND is_active = 1',
    ).bind(local10).first<{ id: string; name: string; email: string; phone: string; role: string }>();

    if (!user) {
      // Create a passwordless account. Email is required by schema so we
      // fabricate a placeholder the user can replace later from the profile page.
      const newId = generateId('usr');
      const placeholderEmail = `phone-${local10}@sumosta.local`;
      const displayName      = `User ${local10.slice(-4)}`;

      try {
        await c.env.DB.prepare(
          'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        ).bind(newId, displayName, placeholderEmail, local10, UNUSABLE_PASSWORD_HASH, 'customer').run();
      } catch (err) {
        // Email placeholder collision (same 10-digit tail existed once, was deleted, etc.) — retry once with a randomised email.
        const fallbackEmail = `phone-${local10}-${newId.slice(-6)}@sumosta.local`;
        console.warn('[firebase-phone/verify] user insert retry with fallback email', err);
        await c.env.DB.prepare(
          'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        ).bind(newId, displayName, fallbackEmail, local10, UNUSABLE_PASSWORD_HASH, 'customer').run();
      }

      user = { id: newId, name: displayName, email: placeholderEmail, phone: local10, role: 'customer' };
    }

    // Issue our own session — identical shape to /login and /register.
    const accessToken  = await signJwt(
      { sub: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      '15m',
    );
    const refreshToken = generateRefreshToken();

    await c.env.KV_SESSIONS.put(`refresh:${user.id}:${refreshToken}`, user.id, {
      expirationTtl: REFRESH_TOKEN_TTL,
    });
    await c.env.KV_SESSIONS.put(`rt_lookup:${refreshToken}`, user.id, {
      expirationTtl: REFRESH_TOKEN_TTL,
    });
    setRefreshCookie(c, refreshToken);

    return c.json({
      success: true,
      data: {
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          phone: user.phone,
          role:  user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  },
);

export default app;
