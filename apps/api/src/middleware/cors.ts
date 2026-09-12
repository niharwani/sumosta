import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowed = [
      'https://sumosta.com',
      'https://www.sumosta.com',
      // Root Cloudflare Pages alias (production). Without this the
      // dot-suffix check below misses it and browsers block calls from
      // the production deployment (leading dot is required for
      // subdomain matches — master, per-commit preview URLs).
      'https://sumosta-web.pages.dev',
      'http://localhost:3000',
    ];
    if (allowed.includes(origin)) return origin;
    if (origin?.endsWith('.sumosta-web.pages.dev')) return origin;
    return 'https://sumosta.com';
  },
  allowMethods:  ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders:  ['Content-Type', 'Authorization', 'X-Session-ID'],
  exposeHeaders: ['X-Total-Count'],
  credentials:   true,
  // Short cache while we're stabilising origin allow-lists. Bump back to
  // 86400 once the sumosta.com cutover is complete and the allow-list
  // stops changing.
  maxAge:        60,
});
