import type { MiddlewareHandler, Context } from 'hono';
import type { Bindings } from '../index';
import { verifyJwt } from '../lib/jwt';

type AuthVariables = {
  userId: string;
  userRole: string;
  userEmail: string;
};

export const authMiddleware: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AuthVariables;
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Authentication required', code: 'UNAUTHORIZED' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    c.set('userId',    payload.sub as string);
    c.set('userRole',  payload.role as string);
    c.set('userEmail', payload.email as string);
    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401);
  }
};
