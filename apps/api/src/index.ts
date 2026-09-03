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
import razorpayRoute    from './routes/razorpay';
import analyticsRoute   from './routes/analytics';
import contactRoute     from './routes/contact';
import newsletterRoute  from './routes/newsletter';
import addressesRoute   from './routes/addresses';
import shippingRoute    from './routes/shipping';

import googleAuthRoute       from './routes/google-auth';

import adminDashboardRoute   from './routes/admin/dashboard';
import adminProductsRoute    from './routes/admin/products';
import adminOrdersRoute      from './routes/admin/orders';
import adminCustomersRoute   from './routes/admin/customers';
import adminCouponsRoute     from './routes/admin/coupons';
import adminReviewsRoute     from './routes/admin/reviews';
import adminAnalyticsRoute   from './routes/admin/analytics';
import adminMediaRoute       from './routes/admin/media';
import adminSettingsRoute    from './routes/admin/settings';
import adminMarketingRoute   from './routes/admin/marketing';
import adminAbandonmentRoute from './routes/admin/abandonment';
import adminShippingRoute    from './routes/admin/shipping';

export type Bindings = {
  DB:                   D1Database;
  R2:                   R2Bucket | undefined;
  KV_SESSIONS:          KVNamespace;
  KV_CACHE:             KVNamespace;
  ANALYTICS:            AnalyticsEngineDataset | undefined;
  RAZORPAY_KEY_ID:      string;
  RAZORPAY_KEY_SECRET:  string;
  RAZORPAY_WEBHOOK_SECRET: string;
  JWT_SECRET:           string;
  REFRESH_TOKEN_SECRET: string;
  RESEND_API_KEY:       string;
  BASE_URL:             string;
  WORKER_URL:           string;
  GOOGLE_CLIENT_ID:     string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_FROM:          string;
  RESEND_FROM_ORDERS:   string;   // e.g. "SUMOSTA Orders <orders@sumosta.com>"
  RESEND_FROM_NOREPLY:  string;   // e.g. "SUMOSTA <no-reply@sumosta.com>"
  SUPPORT_EMAIL:        string;   // reply-to inbox for transactional email
  FIREBASE_PROJECT_ID:  string;
  SHIPROCKET_EMAIL:          string;
  SHIPROCKET_PASSWORD:       string;
  SHIPROCKET_PICKUP_LOCATION: string;
  SHIPROCKET_WEBHOOK_TOKEN:   string;

  // GST / invoice-legal identity. Empty values → generator falls back to
  // the historic hardcoded "raw honey · bengaluru, in" line and stamps the
  // PDF with a "(Draft — GSTIN pending)" note next to TAX INVOICE. Populate
  // before going live so every invoice is a compliant tax invoice.
  SELLER_LEGAL_NAME:    string;
  SELLER_GSTIN:         string;
  SELLER_ADDRESS_BLOCK: string;  // multi-line, \n separated
  SELLER_STATE:         string;  // matched against shipping state to choose CGST/SGST vs IGST
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
app.route('/api/auth',        authRoute);
app.route('/api/auth/google', googleAuthRoute);
app.route('/api/cart',       cartRoute);
app.route('/api/checkout',   checkoutRoute);
app.route('/api/orders',     ordersRoute);
app.route('/api/reviews',    reviewsRoute);
app.route('/api/coupons',    couponsRoute);
app.route('/api/razorpay',   razorpayRoute);
app.route('/api/analytics',  analyticsRoute);
app.route('/api/contact',    contactRoute);
app.route('/api/newsletter', newsletterRoute);
app.route('/api/addresses',  addressesRoute);
app.route('/api/shipping',   shippingRoute);

// ============================================================
// PUBLIC MEDIA SERVING (R2 → browser)
// ============================================================
app.get('/api/media/:key{.+}', async (c) => {
  if (!c.env.R2) return c.json({ error: 'Not available' }, 503);
  const key = c.req.param('key');
  const obj = await c.env.R2.get(key);
  if (!obj) return c.json({ error: 'Not found' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
});

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
app.route('/api/admin/marketing',          adminMarketingRoute);
app.route('/api/admin/abandonment',        adminAbandonmentRoute);
app.route('/api/admin/shipping',           adminShippingRoute);

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
