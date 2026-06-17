import { Hono } from 'hono';
import type { Bindings } from '../index';
import { productQuerySchema } from '../lib/validators';
import { zValidator } from '@hono/zod-validator';
import { hashString } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

const CACHE_TTL = 300; // 5 minutes

// ─── GET /api/products ──────────────────────────────────────
app.get('/', zValidator('query', productQuerySchema), async (c) => {
  const { category, sort, search, page, limit } = c.req.valid('query');
  const cacheKey = `products:${hashString(JSON.stringify({ category, sort, search, page, limit }))}`;

  const cached = await c.env.KV_CACHE.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.is_active = 1';
  const params: (string | number)[] = [];

  if (category) {
    whereClause += ' AND c.slug = ?';
    params.push(category);
  }

  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.short_description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const orderMap: Record<string, string> = {
    featured:   'p.is_featured DESC, p.created_at DESC',
    newest:     'p.created_at DESC',
    price_asc:  'p.price ASC',
    price_desc: 'p.price DESC',
  };
  const orderClause = orderMap[sort] ?? 'p.is_featured DESC, p.created_at DESC';

  const query = `
    SELECT
      p.id, p.name, p.slug, p.sku, p.price, p.compare_at_price, p.stock,
      p.short_description, p.is_featured, p.tags, p.created_at,
      c.id as category_id, c.name as category_name, c.slug as category_slug,
      pi.url as primary_image, pi.alt_text as primary_image_alt,
      COALESCE(AVG(r.rating), 0) as average_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = 1
    ${whereClause}
    GROUP BY p.id
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;

  const [products, countRow] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, limit, offset).all(),
    c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>(),
  ]);

  const total = countRow?.total ?? 0;
  const data = {
    success: true,
    data: {
      products: products.results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: CACHE_TTL });
  return c.json(data);
});

// ─── GET /api/products/:slug ─────────────────────────────────
app.get('/:slug', async (c) => {
  const slug     = c.req.param('slug');
  const cacheKey = `product:${slug}`;

  const cached = await c.env.KV_CACHE.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  const product = await c.env.DB.prepare(`
    SELECT
      p.*, c.id as category_id, c.name as category_name, c.slug as category_slug,
      COALESCE(AVG(r.rating), 0) as average_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = 1
    WHERE p.slug = ? AND p.is_active = 1
    GROUP BY p.id
  `).bind(slug).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  const [images, variants, reviews, related] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC')
      .bind((product as any).id).all(),
    c.env.DB.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC')
      .bind((product as any).id).all(),
    c.env.DB.prepare(`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC LIMIT 10
    `).bind((product as any).id).all(),
    c.env.DB.prepare(`
      SELECT p.id, p.name, p.slug, p.price, p.compare_at_price,
             pi.url as primary_image
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      LIMIT 4
    `).bind((product as any).category_id, (product as any).id).all(),
  ]);

  const fullProduct = {
    ...product,
    images:          images.results,
    variants:        variants.results,
    reviews:         reviews.results,
    relatedProducts: related.results,
  };

  const data = { success: true, data: fullProduct };
  await c.env.KV_CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: CACHE_TTL });
  return c.json(data);
});

export default app;
