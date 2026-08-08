import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Bindings } from '../index';
import { signJwt, generateRefreshToken } from '../lib/jwt';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

const REFRESH_TOKEN_TTL   = 7 * 24 * 60 * 60;   // 7 days
const OAUTH_STATE_COOKIE  = 'oauth_state';
const OAUTH_STATE_TTL     = 10 * 60;             // 10 minutes
const OAUTH_EXCHANGE_TTL  = 60;                  // 60 seconds — one-time handoff

// Only these paths are allowed as post-login redirect targets.
function sanitizeNextPath(next: string | undefined): string {
  const fallback = '/account/orders';
  if (!next || typeof next !== 'string') return fallback;

  // Must be a relative path
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;

  // Whitelist
  const allowedExact   = ['/', '/checkout', '/cart', '/shop'];
  const allowedPrefix  = ['/account/', '/product/', '/shop/'];

  if (allowedExact.includes(next)) return next;
  if (allowedPrefix.some((p) => next.startsWith(p))) return next;

  return fallback;
}

function isProdEnv(baseUrl: string): boolean {
  return baseUrl.startsWith('https://');
}

// ─── Random state (URL-safe) ──────────────────────────────────────────
function generateState(): string {
  // Two crypto.randomUUID() concatenated → 64 hex chars of entropy
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
}

// ─── Decode base64url JWT payload (unverified — trusted because id_token
//     is fetched over TLS directly from Google's token endpoint) ───────
function decodeIdToken(token: string): Record<string, unknown> | null {
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
// GET /api/auth/google — start the OAuth dance
// ============================================================
app.get('/', (c) => {
  const workerUrl = c.env.WORKER_URL || c.env.BASE_URL;
  const rawNext   = c.req.query('next');
  const next      = sanitizeNextPath(rawNext);
  const state     = generateState();

  const cookiePayload = JSON.stringify({ state, next });
  setCookie(c, OAUTH_STATE_COOKIE, cookiePayload, {
    httpOnly: true,
    secure:   isProdEnv(c.env.BASE_URL),
    sameSite: 'Lax',
    path:     '/',
    maxAge:   OAUTH_STATE_TTL,
  });

  const params = new URLSearchParams({
    client_id:     c.env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${workerUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
    state,
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ============================================================
// GET /api/auth/google/callback
// ============================================================
app.get('/callback', async (c) => {
  const code       = c.req.query('code');
  const oauthError = c.req.query('error');
  const stateParam = c.req.query('state');

  // Always clear the state cookie once we've entered the callback
  const stateCookieRaw = getCookie(c, OAUTH_STATE_COOKIE);
  deleteCookie(c, OAUTH_STATE_COOKIE, {
    path:   '/',
    secure: isProdEnv(c.env.BASE_URL),
  });

  // ── Handle user-cancelled or Google-side errors ──
  if (oauthError === 'access_denied') {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_cancelled`);
  }
  if (oauthError || !code) {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
  }

  // ── Validate state (CSRF protection) ──
  if (!stateCookieRaw) {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_invalid`);
  }

  let stateCookie: { state?: string; next?: string };
  try {
    stateCookie = JSON.parse(stateCookieRaw);
  } catch {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_invalid`);
  }

  if (!stateCookie.state || !stateParam || stateCookie.state !== stateParam) {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_invalid`);
  }

  const nextPath = sanitizeNextPath(stateCookie.next);

  try {
    const workerUrl = c.env.WORKER_URL || c.env.BASE_URL;

    // ── Exchange authorization code for tokens ──
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${workerUrl}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json<{
      id_token?:        string;
      access_token?:    string;
      error?:           string;
      error_description?: string;
    }>();

    if (tokens.error || !tokens.id_token) {
      console.error('[Google OAuth] Token exchange failed:', tokens.error, tokens.error_description);
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
    }

    // ── Decode + validate id_token payload ──
    const payload = decodeIdToken(tokens.id_token);
    if (!payload) {
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_invalid`);
    }

    const iss           = payload.iss as string | undefined;
    const aud           = payload.aud as string | undefined;
    const exp           = payload.exp as number | undefined;
    const emailVerified = payload.email_verified as boolean | undefined;
    const googleId      = payload.sub as string | undefined;
    const email         = payload.email as string | undefined;
    const name          = payload.name as string | undefined;

    const nowSec = Math.floor(Date.now() / 1000);

    const validIss   = iss === 'https://accounts.google.com' || iss === 'accounts.google.com';
    const validAud   = aud === c.env.GOOGLE_CLIENT_ID;
    const notExpired = typeof exp === 'number' && exp > nowSec;

    if (!validIss || !validAud || !notExpired || emailVerified !== true || !googleId || !email) {
      console.error('[Google OAuth] id_token validation failed', {
        validIss, validAud, notExpired, emailVerified, hasSub: !!googleId, hasEmail: !!email,
      });
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_invalid`);
    }

    // ── Find or create user ──
    let user = await c.env.DB.prepare(
      'SELECT id, name, email, phone, role FROM users WHERE google_id = ? OR email = ?'
    ).bind(googleId, email).first<{
      id: string; name: string; email: string; phone: string; role: string;
    }>();

    if (!user) {
      const id           = generateId('usr');
      const displayName  = name ?? email.split('@')[0];
      const googlePhone  = `google:${googleId}`;
      await c.env.DB.prepare(
        'INSERT INTO users (id, name, email, phone, password_hash, google_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, displayName, email, googlePhone, '', googleId, 'customer').run();
      user = { id, name: displayName, email, phone: googlePhone, role: 'customer' };
    } else {
      // Link Google to existing password user (only if not already linked)
      // Do NOT touch phone on subsequent logins.
      await c.env.DB.prepare(
        'UPDATE users SET google_id = ? WHERE id = ? AND google_id IS NULL'
      ).bind(googleId, user.id).run();
    }

    // ── Mint access + refresh + store in KV ──
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
    await c.env.KV_SESSIONS.put(`rt_lookup:${refreshToken}`, user.id, {
      expirationTtl: REFRESH_TOKEN_TTL,
    });

    // ── Mint one-time exchange code (60s) ──
    const exchangeCode = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
    const exchangePayload = JSON.stringify({
      userId: user.id,
      accessToken,
      refreshToken,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });

    await c.env.KV_SESSIONS.put(`oauth_exchange:${exchangeCode}`, exchangePayload, {
      expirationTtl: OAUTH_EXCHANGE_TTL,
    });

    const params = new URLSearchParams({
      code: exchangeCode,
      next: nextPath,
    });

    return c.redirect(`${c.env.BASE_URL}/auth/google-callback?${params}`);
  } catch (err) {
    console.error('[Google OAuth] Unexpected error:', err);
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
  }
});

export default app;
