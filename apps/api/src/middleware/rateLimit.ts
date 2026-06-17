import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index';

export const rateLimitMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const path = new URL(c.req.url).pathname;

  // Stricter limit on analytics and auth endpoints
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
