import { Hono } from 'hono';
import type { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const cached = await c.env.KV_CACHE.get('categories:all');
  if (cached) return c.json(JSON.parse(cached));

  const result = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all();

  const data = { success: true, data: result.results };
  await c.env.KV_CACHE.put('categories:all', JSON.stringify(data), { expirationTtl: 3600 });
  return c.json(data);
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const category = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE slug = ?'
  ).bind(slug).first();

  if (!category) {
    return c.json({ success: false, error: 'Category not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ success: true, data: category });
});

export default app;
