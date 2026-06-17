import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { corsMiddleware }      from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { analyticsMiddleware } from './middleware/analytics';

import productsRoute    from './routes/products';
import categoriesRoute  from './routes/categories';
import authRoute        from './routes/auth';
import cartRoute        from './routes/cart';
import checkoutRoute    from './routes/checkout';
import ordersRoute      from './routes/orders';
import reviewsRoute     from './routes/reviews';
import couponsRoute     from './routes/coupons';
import paymentsRoute    from './routes/payments';
import analyticsRoute   from './routes/analytics';
import contactRoute     from './routes/contact';
import newsletterRoute  from './routes/newsletter';
import addressesRoute  from './routes/addresses';

import adminDashboardRoute  from './routes/admin/dashboard';
import adminProductsRoute   from './routes/admin/products';
import adminOrdersRoute     from './routes/admin/orders';
import adminCustomersRoute  from './routes/admin/customers';
import adminCouponsRoute    from './routes/admin/coupons';
import adminReviewsRoute    from './routes/admin/reviews';
import adminAnalyticsRoute  from './routes/admin/analytics';
import adminMediaRoute      from './routes/admin/media';
import adminSettingsRoute   from './routes/admin/settings';

export type Bindings = {
  DB:                  D1Database;
  R2:                  R2Bucket | undefined;
  KV_SESSIONS:         KVNamespace;
  KV_CACHE:            KVNamespace;
  ANALYTICS:           AnalyticsEngineDataset | undefined;
  PHONEPE_MERCHANT_ID: string;
  PHONEPE_SALT_KEY:    string;
  PHONEPE_SALT_INDEX:  string;
  PHONEPE_ENV:         string;
  JWT_SECRET:          string;
  REFRESH_TOKEN_SECRET: string;
  RESEND_API_KEY:      string;
  BASE_URL:            string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================
app.use('*', corsMiddleware);
app.use('*', logger());
app.use('*', rateLimitMiddleware);
app.use('*', analyticsMiddleware);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (c) => c.json({ ok: true, service: 'SUMOSTA API', version: '1.0.0' }));

// ============================================================
// PUBLIC ROUTES
// ============================================================
app.route('/api/products',   productsRoute);
app.route('/api/categories', categoriesRoute);
app.route('/api/auth',       authRoute);
app.route('/api/cart',       cartRoute);
app.route('/api/checkout',   checkoutRoute);
app.route('/api/orders',     ordersRoute);
app.route('/api/reviews',    reviewsRoute);
app.route('/api/coupons',    couponsRoute);
app.route('/api/payments',   paymentsRoute);
app.route('/api/analytics',  analyticsRoute);
app.route('/api/contact',    contactRoute);
app.route('/api/newsletter', newsletterRoute);
app.route('/api/addresses',  addressesRoute);

// ============================================================
// ADMIN ROUTES
// ============================================================
app.route('/api/admin',                    adminDashboardRoute);
app.route('/api/admin/products',           adminProductsRoute);
app.route('/api/admin/orders',             adminOrdersRoute);
app.route('/api/admin/customers',          adminCustomersRoute);
app.route('/api/admin/coupons',            adminCouponsRoute);
app.route('/api/admin/reviews',            adminReviewsRoute);
app.route('/api/admin/analytics',          adminAnalyticsRoute);
app.route('/api/admin/media',              adminMediaRoute);
app.route('/api/admin/settings',           adminSettingsRoute);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.onError((err, c) => {
  console.error('[API Error]', err);
  return c.json(
    { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
    500,
  );
});

app.notFound((c) =>
  c.json({ success: false, error: 'Not found', code: 'NOT_FOUND' }, 404),
);

export default app;
