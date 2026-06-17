import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { authMiddleware } from '../middleware/auth';
import { reviewSchema } from '../lib/validators';
import { generateId } from '../lib/utils';

type AppEnv = {
  Bindings: Bindings;
  Variables: { userId: string; userRole: string; userEmail: string };
};

const app = new Hono<AppEnv>();

// ─── GET /api/reviews?productId=xxx ─────────────────────────
app.get('/', async (c) => {
  const productId = c.req.query('productId');
  if (!productId) {
    return c.json({ success: false, error: 'productId query param required', code: 'VALIDATION_ERROR' }, 400);
  }

  const page   = Number(c.req.query('page')  ?? 1);
  const limit  = Number(c.req.query('limit') ?? 10);
  const offset = (page - 1) * limit;

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT r.id, r.rating, r.title, r.body, r.is_verified, r.created_at,
             u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(productId, limit, offset).all(),
    c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1',
    ).bind(productId).first<{ total: number }>(),
  ]);

  const total = countRow?.total ?? 0;

  return c.json({
    success: true,
    data: {
      reviews:    rows.results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── POST /api/reviews — create review (auth required) ──────
app.post('/', authMiddleware as any, zValidator('json', reviewSchema), async (c) => {
  const userId              = (c as any).get('userId') as string;
  const { productId, rating, title, body } = c.req.valid('json');

  // Verify product exists
  const product = await c.env.DB.prepare(
    'SELECT id FROM products WHERE id = ? AND is_active = 1',
  ).bind(productId).first();
  if (!product) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  // Check if user has already reviewed this product
  const existingReview = await c.env.DB.prepare(
    'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
  ).bind(productId, userId).first();
  if (existingReview) {
    return c.json({
      success: false,
      error:   'You have already reviewed this product',
      code:    'DUPLICATE_REVIEW',
    }, 409);
  }

  // Check if user has purchased this product (verified purchase badge)
  const hasPurchased = await c.env.DB.prepare(`
    SELECT oi.id FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'captured'
    LIMIT 1
  `).bind(userId, productId).first();

  const isVerified = hasPurchased ? 1 : 0;

  const reviewId = generateId('rev');

  await c.env.DB.prepare(`
    INSERT INTO reviews (id, product_id, user_id, rating, title, body, is_verified, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).bind(reviewId, productId, userId, rating, title, body, isVerified).run();

  return c.json({
    success: true,
    data:    {
      id:         reviewId,
      productId,
      userId,
      rating,
      title,
      body,
      isVerified: Boolean(isVerified),
      isApproved: false,
      message:    'Review submitted and pending approval.',
    },
  }, 201);
});

export default app;
