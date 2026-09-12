import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index';

// Rate limiting writes to KV on every accounted request, which trivially burns
// through the free-tier 1k-writes/day quota. To stay inside quota while still
// protecting sensitive endpoints, we ONLY rate-limit expensive/abusable paths:
// mutations (POST/PUT/DELETE), auth, checkout, contact, analytics ingestion.
// Plain GET reads (products, categories, cart poll, tracking) are excluded —
// they're cached by KV_CACHE / D1 and don't need per-request write accounting.
const ALWAYS_RATE_LIMIT_PREFIXES = [
  '/api/auth',
  '/api/analytics',
  '/api/checkout',
  '/api/contact',
  '/api/newsletter',
];

export const rateLimitMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const path = new URL(c.req.url).pathname;
  const method = c.req.method;

  // Webhooks (Razorpay, Shiprocket, etc.) come from a small set of provider IPs
  // and are signature-verified — rate-limiting them just creates missed events.
  if (path.includes('/webhook')) {
    await next();
    return;
  }

  const isMutation   = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  const isSensitive  = ALWAYS_RATE_LIMIT_PREFIXES.some((p) => path.startsWith(p));

  if (!isMutation && !isSensitive) {
    await next();
    return;
  }

  const limit = path.startsWith('/api/auth') ? 20
    : path.startsWith('/api/analytics') ? 60
    : 120;

  const windowSec = 60;
  const key = `rate:${ip}:${path.split('/')[2] ?? 'root'}`;

  try {
    const current = await c.env.KV_CACHE.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= limit) {
      return c.json({ success: false, error: 'Too many requests', code: 'RATE_LIMITED' }, 429);
    }

    await c.env.KV_CACHE.put(key, String(count + 1), { expirationTtl: windowSec });
  } catch {
    // If KV fails, allow the request through
  }

  await next();
};
