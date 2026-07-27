import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin/abandonment ──────────────────────────────
// Returns sessions that added items to cart but never completed a purchase.
// Uses analytics_events table as the data source.
app.get('/', async (c) => {
  const period = c.req.query('period') ?? '7d';
  const limit  = Number(c.req.query('limit') ?? 50);

  const now = new Date();
  const daysBack = period === '30d' ? 30 : period === '14d' ? 14 : 7;
  const since = new Date(now);
  since.setDate(since.getDate() - daysBack);
  const sinceStr = since.toISOString().split('T')[0];

  // Sessions that added to cart but never purchased
  const [abandoned, stats] = await Promise.all([
    c.env.DB.prepare(`
      SELECT
        ae.session_id,
        MAX(ae.created_at)  as last_activity,
        COUNT(ae.id)        as add_to_cart_events,
        GROUP_CONCAT(ae.event_data, '|||') as events_json,
        MAX(CASE WHEN checkout.session_id IS NOT NULL THEN 1 ELSE 0 END) as reached_checkout
      FROM analytics_events ae
      LEFT JOIN (
        SELECT DISTINCT session_id FROM analytics_events
        WHERE event_type = 'purchase'
      ) purchased ON purchased.session_id = ae.session_id
      LEFT JOIN (
        SELECT DISTINCT session_id FROM analytics_events
        WHERE event_type = 'begin_checkout'
      ) checkout ON checkout.session_id = ae.session_id
      WHERE ae.event_type = 'add_to_cart'
        AND date(ae.created_at) >= ?
        AND purchased.session_id IS NULL
      GROUP BY ae.session_id
      ORDER BY last_activity DESC
      LIMIT ?
    `).bind(sinceStr, limit).all(),

    c.env.DB.prepare(`
      SELECT
        COUNT(DISTINCT atc.session_id) as total_abandoned,
        COUNT(DISTINCT co.session_id)  as abandoned_at_checkout
      FROM (
        SELECT DISTINCT session_id FROM analytics_events
        WHERE event_type = 'add_to_cart' AND date(created_at) >= ?
      ) atc
      LEFT JOIN (
        SELECT DISTINCT session_id FROM analytics_events WHERE event_type = 'purchase'
      ) pur ON pur.session_id = atc.session_id
      LEFT JOIN (
        SELECT DISTINCT session_id FROM analytics_events WHERE event_type = 'begin_checkout'
      ) co ON co.session_id = atc.session_id
      WHERE pur.session_id IS NULL
    `).bind(sinceStr).first<{ total_abandoned: number; abandoned_at_checkout: number }>(),
  ]);

  // Parse event_data to extract last product added
  const rows = abandoned.results.map((row: any) => {
    let lastProduct: string | null = null;
    let estimatedValue = 0;

    try {
      const chunks: string[] = (row.events_json ?? '').split('|||');
      const parsed = chunks
        .map((s: string) => { try { return JSON.parse(s); } catch { return null; } })
        .filter(Boolean);

      // Use the last add_to_cart event's product name
      const last = parsed[parsed.length - 1];
      if (last?.productName) lastProduct = last.productName;

      // Rough cart value: sum of price*qty from all add events
      parsed.forEach((ev: any) => {
        if (ev?.price && ev?.quantity) {
          estimatedValue += ev.price * ev.quantity;
        } else if (ev?.price) {
          estimatedValue += ev.price;
        }
      });
    } catch { /* ignore parse errors */ }

    return {
      session_id:        row.session_id,
      last_activity:     row.last_activity,
      add_to_cart_count: row.add_to_cart_events,
      reached_checkout:  row.reached_checkout === 1,
      last_product:      lastProduct,
      estimated_value:   Math.round(estimatedValue),
    };
  });

  // Total add-to-cart sessions in period (for rate calc)
  const totalAtc = await c.env.DB.prepare(`
    SELECT COUNT(DISTINCT session_id) as count FROM analytics_events
    WHERE event_type = 'add_to_cart' AND date(created_at) >= ?
  `).bind(sinceStr).first<{ count: number }>();

  const abandonmentRate = (totalAtc?.count ?? 0) > 0
    ? Math.round(((stats?.total_abandoned ?? 0) / (totalAtc?.count ?? 1)) * 100 * 10) / 10
    : 0;

  return c.json({
    success: true,
    data: {
      period: sinceStr,
      abandonedCarts:      rows,
      totalAbandoned:      stats?.total_abandoned ?? 0,
      abandonedAtCheckout: stats?.abandoned_at_checkout ?? 0,
      abandonmentRate,
      totalAddToCartSessions: totalAtc?.count ?? 0,
    },
  });
});

export default app;
