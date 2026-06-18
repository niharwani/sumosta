import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { productSchema } from '../../lib/validators';
import { generateId, slugify } from '../../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

const imageSchema = z.object({
  url:       z.string().url(),
  altText:   z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// ── Cache bust helper ────────────────────────────────────────
async function bustProductCache(kv: KVNamespace, slug?: string): Promise<void> {
  if (slug) {
    await kv.delete(`product:${slug}`);
  }
  // Bust list cache — pattern-delete not supported in KV, so delete known keys
  // The list cache uses hashed query keys; we clear a broad set by using KV list
  const listed = await kv.list({ prefix: 'products:' });
  await Promise.all(listed.keys.map((k) => kv.delete(k.name)));
}

// ─── GET /api/admin/products ─────────────────────────────────
app.get('/', async (c) => {
  const page     = Number(c.req.query('page')     ?? 1);
  const limit    = Number(c.req.query('limit')    ?? 20);
  const search   = c.req.query('search') ?? '';
  const category = c.req.query('category') ?? '';
  const offset   = (page - 1) * limit;

  let where  = 'WHERE 1=1';
  const bind: (string | number)[] = [];

  if (search) {
    where += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    bind.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    where += ' AND c.slug = ?';
    bind.push(category);
  }

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(`
      SELECT p.id, p.name, p.slug, p.sku, p.price, p.compare_at_price, p.stock,
             p.low_stock_threshold, p.is_active, p.is_featured, p.created_at,
             c.name as category_name,
             pi.url as primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...bind, limit, offset).all(),
    c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
    `).bind(...bind).first<{ total: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      products:   rows.results,
      total:      countRow?.total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit),
    },
  });
});

// ─── POST /api/admin/products ────────────────────────────────
app.post('/', zValidator('json', productSchema), async (c) => {
  const body = c.req.valid('json');
  const id   = generateId('prd');
  const slug = body.slug || slugify(body.name);
  const now  = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO products (
      id, name, slug, sku, category_id, short_description, description,
      price, compare_at_price, cost_price, stock, low_stock_threshold,
      weight, tags, is_featured, is_active,
      meta_title, meta_description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.name, slug, body.sku, body.categoryId,
    body.shortDescription, body.description,
    body.price, body.compareAtPrice ?? null, body.costPrice ?? null,
    body.stock, body.lowStockThreshold,
    body.weight ?? null, JSON.stringify(body.tags),
    body.isFeatured ? 1 : 0, body.isActive ? 1 : 0,
    body.metaTitle ?? null, body.metaDescription ?? null,
    now, now,
  ).run();

  await bustProductCache(c.env.KV_CACHE);

  return c.json({ success: true, data: { id, slug } }, 201);
});

// ─── GET /api/admin/products/:id ─────────────────────────────
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  const product = await c.env.DB.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `).bind(id).first<Record<string, unknown>>();

  if (!product) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  const [variantsResult, imagesResult] = await Promise.all([
    c.env.DB.prepare(`
      SELECT id, product_id, name, sku, price_adjustment, stock
      FROM product_variants WHERE product_id = ? ORDER BY id ASC
    `).bind(id).all(),
    c.env.DB.prepare(`
      SELECT id, url, alt_text, is_primary, sort_order
      FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC
    `).bind(id).all(),
  ]);

  return c.json({
    success: true,
    data: {
      ...product,
      images:   imagesResult.results,
      variants: variantsResult.results,
    },
  });
});

// ─── PATCH /api/admin/products/:id — partial update (e.g., toggle active) ───
app.patch('/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json<Record<string, unknown>>();

  const existing = await c.env.DB.prepare(
    'SELECT id, slug FROM products WHERE id = ?',
  ).bind(id).first<{ id: string; slug: string }>();

  if (!existing) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  const allowed = ['is_active', 'is_featured', 'stock', 'price'];
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (!fields.length) {
    return c.json({ success: false, error: 'No valid fields to update', code: 'NO_UPDATE' }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  await bustProductCache(c.env.KV_CACHE, existing.slug);

  return c.json({ success: true, data: { id } });
});

// ─── PUT /api/admin/products/:id ─────────────────────────────
app.put('/:id', zValidator('json', productSchema.partial()), async (c) => {
  const id   = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await c.env.DB.prepare(
    'SELECT id, slug FROM products WHERE id = ?',
  ).bind(id).first<{ id: string; slug: string }>();

  if (!existing) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const map: Record<string, string> = {
    name:             'name',
    slug:             'slug',
    sku:              'sku',
    categoryId:       'category_id',
    shortDescription: 'short_description',
    description:      'description',
    price:            'price',
    compareAtPrice:   'compare_at_price',
    costPrice:        'cost_price',
    stock:            'stock',
    lowStockThreshold:'low_stock_threshold',
    weight:           'weight',
    isFeatured:       'is_featured',
    isActive:         'is_active',
    metaTitle:        'meta_title',
    metaDescription:  'meta_description',
  };

  for (const [jsKey, sqlCol] of Object.entries(map)) {
    if (jsKey in body) {
      const val = (body as Record<string, unknown>)[jsKey];
      fields.push(`${sqlCol} = ?`);
      values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
    }
  }

  if ('tags' in body && body.tags) {
    fields.push('tags = ?');
    values.push(JSON.stringify(body.tags));
  }

  if (!fields.length) {
    return c.json({ success: false, error: 'No fields to update', code: 'NO_UPDATE' }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run();

  await bustProductCache(c.env.KV_CACHE, existing.slug);

  return c.json({ success: true, data: { id } });
});

// ─── DELETE /api/admin/products/:id — soft delete ────────────
app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id, slug FROM products WHERE id = ?',
  ).bind(id).first<{ id: string; slug: string }>();

  if (!existing) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
  ).bind(id).run();

  await bustProductCache(c.env.KV_CACHE, existing.slug);

  return c.json({ success: true, data: null });
});

// ─── POST /api/admin/products/:id/images ─────────────────────
app.post('/:id/images', zValidator('json', imageSchema), async (c) => {
  const productId = c.req.param('id');
  const { url, altText, isPrimary } = c.req.valid('json');

  const product = await c.env.DB.prepare('SELECT id, slug FROM products WHERE id = ?')
    .bind(productId).first<{ id: string; slug: string }>();

  if (!product) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  // If setting as primary, unset others
  if (isPrimary) {
    await c.env.DB.prepare(
      'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
    ).bind(productId).run();
  }

  const sortRow = await c.env.DB.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM product_images WHERE product_id = ?',
  ).bind(productId).first<{ next_order: number }>();

  const imageId = generateId('img');
  await c.env.DB.prepare(`
    INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    imageId, productId, url, altText ?? null,
    sortRow?.next_order ?? 0, isPrimary ? 1 : 0,
  ).run();

  await bustProductCache(c.env.KV_CACHE, product.slug);

  return c.json({ success: true, data: { id: imageId } }, 201);
});

// ─── DELETE /api/admin/products/:id/images/:imageId ──────────
app.delete('/:id/images/:imageId', async (c) => {
  const productId = c.req.param('id');
  const imageId   = c.req.param('imageId');

  const product = await c.env.DB.prepare('SELECT id, slug FROM products WHERE id = ?')
    .bind(productId).first<{ id: string; slug: string }>();

  if (!product) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  const deleted = await c.env.DB.prepare(
    'DELETE FROM product_images WHERE id = ? AND product_id = ?',
  ).bind(imageId, productId).run();

  if (!deleted.meta.changes) {
    return c.json({ success: false, error: 'Image not found', code: 'NOT_FOUND' }, 404);
  }

  await bustProductCache(c.env.KV_CACHE, product.slug);

  return c.json({ success: true, data: null });
});

// ─── PATCH /api/admin/products/:id/images/:imageId/primary ───
app.patch('/:id/images/:imageId/primary', async (c) => {
  const productId = c.req.param('id');
  const imageId   = c.req.param('imageId');

  const product = await c.env.DB.prepare('SELECT id, slug FROM products WHERE id = ?')
    .bind(productId).first<{ id: string; slug: string }>();
  if (!product) return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);

  await c.env.DB.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').bind(productId).run();
  await c.env.DB.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?').bind(imageId, productId).run();
  await bustProductCache(c.env.KV_CACHE, product.slug);

  return c.json({ success: true, data: null });
});

export default app;
