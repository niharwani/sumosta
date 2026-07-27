import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { analyticsEventSchema } from '../lib/validators';
import { generateId } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// ─── POST /api/analytics/event ───────────────────────────────
app.post('/event', zValidator('json', analyticsEventSchema), async (c) => {
  const { events } = c.req.valid('json');

  // Write to Analytics Engine (primary store)
  for (const event of events) {
    try {
      c.env.ANALYTICS?.writeDataPoint({
        blobs:   [event.eventType, event.pageUrl, event.sessionId, event.referrer ?? ''],
        doubles: [event.timestamp],
        indexes: [event.eventType],
      });
    } catch (err) {
      console.error('[Analytics] writeDataPoint failed:', err);
    }
  }

  // Batch insert to D1 as backup (fire-and-forget, don't block response)
  const now = new Date().toISOString();
  const inserts = events.map((event) =>
    c.env.DB.prepare(`
      INSERT INTO analytics_events (id, event_type, event_data, page_url, session_id, referrer, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      generateId('evt'),
      event.eventType,
      JSON.stringify(event.eventData),
      event.pageUrl,
      event.sessionId,
      event.referrer ?? null,
      now,
    ),
  );

  // Best-effort — don't fail the request if D1 insert fails
  c.executionCtx?.waitUntil(
    c.env.DB.batch(inserts).catch((err: unknown) =>
      console.error('[Analytics] D1 batch insert failed:', err),
    ),
  );

  return c.json({ success: true, data: { received: events.length } });
});

export default app;
