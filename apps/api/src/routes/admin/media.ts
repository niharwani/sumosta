import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── POST /api/admin/media/upload ────────────────────────────
// Receive a file (multipart/form-data), store in R2, return public URL
app.post('/upload', async (c) => {
  if (!c.env.R2) {
    return c.json({ success: false, error: 'Storage not configured', code: 'NOT_AVAILABLE' }, 503);
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string | null) ?? 'products';

  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: 'No file provided', code: 'VALIDATION_ERROR' }, 400);
  }

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_SIZE) {
    return c.json({ success: false, error: 'File too large (max 20 MB)', code: 'FILE_TOO_LARGE' }, 413);
  }

  const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm','video/quicktime'];
  if (!allowed.includes(file.type)) {
    return c.json({ success: false, error: 'Unsupported file type', code: 'UNSUPPORTED_TYPE' }, 415);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${Date.now()}-${safeName}`;

  await c.env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  });

  const workerUrl = c.env.WORKER_URL ?? c.env.BASE_URL;
  const publicUrl = `${workerUrl}/api/media/${key}`;

  return c.json({ success: true, data: { key, publicUrl, contentType: file.type, size: file.size } }, 201);
});

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
    uploadUrl = `${c.env.WORKER_URL ?? c.env.BASE_URL}/api/admin/media/upload-direct?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
  }

  const workerUrl = c.env.WORKER_URL ?? c.env.BASE_URL;
  const publicUrl = `${workerUrl}/api/media/${key}`;

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

  const workerUrl = c.env.WORKER_URL ?? c.env.BASE_URL;
  const files = listed.objects.map((obj) => ({
    key:          obj.key,
    size:         obj.size,
    uploaded:     obj.uploaded,
    etag:         obj.etag,
    publicUrl:    `${workerUrl}/api/media/${obj.key}`,
  }));

  return c.json({
    success: true,
    data: {
      files,
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
