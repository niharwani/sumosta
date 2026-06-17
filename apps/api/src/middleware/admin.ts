import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index';
import { authMiddleware } from './auth';

export const adminMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  await authMiddleware(c as any, async () => {});

  const role = (c as any).get('userRole') as string | undefined;

  if (!role || !['admin', 'superadmin'].includes(role)) {
    return c.json({ success: false, error: 'Admin access required', code: 'FORBIDDEN' }, 403);
  }

  await next();
};
