import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index';

export const analyticsMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const start = Date.now();
  await next();
  const latency = Date.now() - start;

  try {
    if (c.env.ANALYTICS) {
      c.env.ANALYTICS.writeDataPoint({
        blobs:   [c.req.method, new URL(c.req.url).pathname, String(c.res.status)],
        doubles: [latency],
        indexes: [c.req.header('CF-Connecting-IP') ?? 'unknown'],
      });
    }
  } catch {
    // Never let analytics failures block the response
  }
};
