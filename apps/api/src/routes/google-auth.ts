import { Hono } from 'hono';
import type { Bindings } from '../index';
import { signJwt, generateRefreshToken } from '../lib/jwt';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

// GET /api/auth/google — redirect to Google's consent screen
app.get('/', (c) => {
  const workerUrl = c.env.WORKER_URL || c.env.BASE_URL;
  const params = new URLSearchParams({
    client_id:     c.env.GOOGLE_CLIENT_ID,
    redirect_uri:  `${workerUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// GET /api/auth/google/callback — handle Google's redirect back
app.get('/callback', async (c) => {
  const code  = c.req.query('code');
  const error = c.req.query('error');

  if (error || !code) {
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_cancelled`);
  }

  try {
    const workerUrl = c.env.WORKER_URL || c.env.BASE_URL;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${workerUrl}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json<{
      id_token?: string;
      access_token?: string;
      error?: string;
      error_description?: string;
    }>();

    if (tokens.error || !tokens.id_token) {
      console.error('[Google OAuth] Token exchange failed:', tokens.error, tokens.error_description);
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
    }

    // Decode the id_token JWT payload (we trust Google's signature — token came directly from their server)
    const parts = tokens.id_token.split('.');
    if (parts.length !== 3) {
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
    }

    // Pad base64url to standard base64 before decoding
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(
      parts[1].length + (4 - (parts[1].length % 4)) % 4, '='
    );
    const { sub: googleId, email, name } = JSON.parse(atob(padded)) as {
      sub: string;
      email: string;
      name: string;
    };

    if (!googleId || !email) {
      return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
    }

    // Find existing user by google_id or email
    let user = await c.env.DB.prepare(
      'SELECT id, name, email, role FROM users WHERE google_id = ? OR email = ?'
    ).bind(googleId, email).first<{ id: string; name: string; email: string; role: string }>();

    if (!user) {
      // New user — create account (no password_hash needed for Google users)
      const id = generateId('usr');
      await c.env.DB.prepare(
        'INSERT INTO users (id, name, email, google_id, role) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, name ?? email.split('@')[0], email, googleId, 'customer').run();
      user = { id, name: name ?? email.split('@')[0], email, role: 'customer' };
    } else {
      // Existing email/password user — link their Google account
      await c.env.DB.prepare(
        'UPDATE users SET google_id = ? WHERE id = ? AND google_id IS NULL'
      ).bind(googleId, user.id).run();
    }

    // Issue our own JWT + refresh token
    const accessToken  = await signJwt(
      { sub: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      '15m',
    );
    const refreshToken = generateRefreshToken();

    await c.env.KV_SESSIONS.put(
      `refresh:${user.id}:${refreshToken}`,
      user.id,
      { expirationTtl: REFRESH_TOKEN_TTL },
    );

    // Redirect to frontend with tokens in query params (picked up by the callback page)
    const redirectParams = new URLSearchParams({
      accessToken,
      refreshToken,
      userId:    user.id,
      userName:  user.name,
      userEmail: user.email,
      userRole:  user.role,
    });

    return c.redirect(`${c.env.BASE_URL}/auth/google-callback?${redirectParams}`);
  } catch (err) {
    console.error('[Google OAuth] Unexpected error:', err);
    return c.redirect(`${c.env.BASE_URL}/auth/login?error=google_failed`);
  }
});

export default app;
