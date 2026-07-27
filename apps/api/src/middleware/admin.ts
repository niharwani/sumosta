import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index';
import { verifyJwt } from '../lib/jwt';

type AdminVars = {
  userId:    string;
  userRole:  string;
  userEmail: string;
};

export const adminMiddleware: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AdminVars;
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Authentication required', code: 'UNAUTHORIZED' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    const role = payload.role as string;

    if (!['admin', 'superadmin'].includes(role)) {
      return c.json({ success: false, error: 'Admin access required', code: 'FORBIDDEN' }, 403);
    }

    c.set('userId',    payload.sub as string);
    c.set('userRole',  role);
    c.set('userEmail', payload.email as string);
    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401);
  }
};
