// ============================================================
// Cloudflare Turnstile — server-side token verification
// ------------------------------------------------------------
// Verifies a client-supplied Turnstile token against Cloudflare's
// siteverify endpoint. Returns:
//   { ok: true }              — token is valid, request may proceed
//   { ok: false, code, ... }  — reject the request with a clear code
//
// Fail-open policy: when `secretKey` is empty (Turnstile not yet
// configured), verification is skipped and { ok: true } is returned so
// checkout doesn't break while the widget is being set up. Once the
// secret is added via `wrangler secret put TURNSTILE_SECRET_KEY`, this
// starts enforcing on every checkout POST.
// ============================================================

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
  success:       boolean;
  'error-codes': string[];
  challenge_ts?: string;
  hostname?:     string;
  action?:       string;
  cdata?:        string;
}

export interface TurnstileResult {
  ok:    boolean;
  code?: string;
  error?: string;
}

export async function verifyTurnstileToken(
  secretKey: string | undefined,
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  // Not configured yet → fail-open. Log once so it's visible in Worker logs.
  if (!secretKey) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping bot verification');
    return { ok: true };
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, code: 'TURNSTILE_MISSING', error: 'Bot-protection token is required.' };
  }

  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res  = await fetch(SITEVERIFY_URL, { method: 'POST', body });
    const json = (await res.json()) as SiteverifyResponse;
    if (json.success) return { ok: true };
    console.warn('[turnstile] siteverify rejected', json['error-codes']);
    return { ok: false, code: 'TURNSTILE_FAILED', error: 'Bot-protection check failed. Please retry.' };
  } catch (err) {
    console.error('[turnstile] siteverify request errored', err);
    // Network failure → fail-open so a Cloudflare outage doesn't block real
    // buyers. The frontend still requires a token to enable the pay button,
    // so this only kicks in when both the browser AND the siteverify API are
    // uncooperative — extremely unlikely for genuine users.
    return { ok: true };
  }
}
