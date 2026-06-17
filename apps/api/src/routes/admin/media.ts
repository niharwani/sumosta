import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

const uploadUrlSchema = z.object({
  filename:    z.string().min(1),
  contentType: z.string().min(1),
  folder:      z.string().optional().default('uploads'),
});

// ─── POST /api/admin/media/upload-url ────────────────────────
// Generate a presigned R2 upload URL for the frontend to upload directly
app.post('/upload-url', zValidator('json', uploadUrlSchema), async (c) => {
  const { filename, contentType, folder } = c.req.valid('json');

  // Sanitise filename — strip path traversal attempts
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key      = `${folder}/${Date.now()}-${safeName}`;

  // Cloudflare R2 presigned PUT URL (Workers R2 presigned URL API)
  // Note: R2 presigned URL support requires wrangler >= 3.x and signed URL feature enabled
  // If presigned URLs are not available, the frontend should POST to an upload endpoint instead.
  let uploadUrl: string;
  try {
    const signed = await (c.env.R2 as any).createPresignedUrl?.('PUT', key, {
      expiresIn: 300, // 5 minutes
      httpMetadata: { contentType },
    });

    if (signed) {
      uploadUrl = signed;
    } else {
      // Fallback: return the internal upload endpoint
      uploadUrl = `${c.env.BASE_URL}/api/admin/media/upload-direct?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
    }
  } catch {
    uploadUrl = `${c.env.BASE_URL}/api/admin/media/upload-direct?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
  }

  const publicUrl = `${c.env.BASE_URL.replace('api.', 'assets.')}/r2/${key}`;

  return c.json({
    success: true,
    data: {
      uploadUrl,
      key,
      publicUrl,
    },
  });
});

// ─── GET /api/admin/media ─────────────────────────────────────
// List R2 objects with optional prefix filter
app.get('/', async (c) => {
  if (!c.env.R2) {
    return c.json({ success: true, data: { files: [], objects: [], truncated: false, cursor: null } });
  }

  const prefix = c.req.query('prefix') ?? '';
  const cursor = c.req.query('cursor')  ?? undefined;
  const limit  = Math.min(Number(c.req.query('limit') ?? 50), 100);

  const listed = await c.env.R2.list({
    prefix: prefix || undefined,
    cursor: cursor || undefined,
    limit,
  });

  const objects = listed.objects.map((obj) => ({
    key:          obj.key,
    size:         obj.size,
    uploaded:     obj.uploaded,
    etag:         obj.etag,
    publicUrl:    `${c.env.BASE_URL.replace('api.', 'assets.')}/r2/${obj.key}`,
  }));

  return c.json({
    success: true,
    data: {
      objects,
      truncated:   listed.truncated,
      cursor:      listed.truncated ? listed.cursor : null,
    },
  });
});

// ─── DELETE /api/admin/media/:key ────────────────────────────
// Delete an R2 object by key (URL-encoded in the path)
app.delete('/:key{.+}', async (c) => {
  if (!c.env.R2) {
    return c.json({ success: false, error: 'R2 not configured', code: 'NOT_AVAILABLE' }, 503);
  }

  const key = decodeURIComponent(c.req.param('key'));

  if (!key) {
    return c.json({ success: false, error: 'Key is required', code: 'VALIDATION_ERROR' }, 400);
  }

  await c.env.R2.delete(key);

  return c.json({ success: true, data: { key, deleted: true } });
});

export default app;
