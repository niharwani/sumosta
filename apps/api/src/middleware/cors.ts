import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowed = [
      'https://sumosta.com',
      'https://www.sumosta.com',
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
  maxAge:        86400,
});
