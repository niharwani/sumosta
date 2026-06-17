import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ── Date range helper ────────────────────────────────────────
function getDateRange(period: string, startDate?: string, endDate?: string) {
  if (period === 'custom' && startDate && endDate) {
    return { start: startDate, end: endDate };
  }

  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: string;

  const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  start = d.toISOString().split('T')[0];

  return { start, end };
}

function getPreviousRange(start: string, end: string) {
  const s  = new Date(start);
  const e  = new Date(end);
  const ms = e.getTime() - s.getTime();
  const prevEnd   = new Date(s.getTime() - 1).toISOString().split('T')[0];
  const prevStart = new Date(s.getTime() - ms - 1).toISOString().split('T')[0];
  return { start: prevStart, end: prevEnd };
}

function changePct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// ─── GET /api/admin/analytics/overview ───────────────────────
app.get('/overview', async (c) => {
  const period    = c.req.query('period')    ?? '30d';
  const startDate = c.req.query('startDate') ?? '';
  const endDate   = c.req.query('endDate')   ?? '';

  const { start, end } = getDateRange(period, startDate, endDate);
  const prev           = getPreviousRange(start, end);

  const kpiQuery = (s: string, e: string) =>
    c.env.DB.prepare(`
      SELECT
        COALESCE(SUM(total), 0)                 as revenue,
        COUNT(*)                                as orders,
        COALESCE(AVG(total), 0)                 as aov
      FROM orders
      WHERE payment_status = 'captured'
        AND date(created_at) >= ? AND date(created_at) <= ?
    `).bind(s, e).first<{ revenue: number; orders: number; aov: number }>();

  const [current, previous] = await Promise.all([
    kpiQuery(start, end),
    kpiQuery(prev.start, prev.end),
  ]);

  const cur = current  ?? { revenue: 0, orders: 0, aov: 0 };
  const pre = previous ?? { revenue: 0, orders: 0, aov: 0 };

  // Daily revenue chart
  const revenueChart = await c.env.DB.prepare(`
    SELECT date(created_at) as date,
           COALESCE(SUM(total), 0) as revenue,
           COUNT(*) as orders
    FROM orders
    WHERE payment_status = 'captured'
      AND date(created_at) >= ? AND date(created_at) <= ?
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).bind(start, end).all();

  // Events from D1 (backup store)
  const visitorQuery = (s: string, e: string) =>
    c.env.DB.prepare(`
      SELECT
        COUNT(DISTINCT session_id) as visitors,
        COUNT(*)                   as pageviews
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND date(created_at) >= ? AND date(created_at) <= ?
    `).bind(s, e).first<{ visitors: number; pageviews: number }>();

  const [curVisitors, preVisitors] = await Promise.all([
    visitorQuery(start, end),
    visitorQuery(prev.start, prev.end),
  ]);

  const cv = curVisitors ?? { visitors: 0, pageviews: 0 };
  const pv = preVisitors ?? { visitors: 0, pageviews: 0 };

  const conversionRate     = cv.visitors > 0 ? (cur.orders / cv.visitors) * 100 : 0;
  const prevConversionRate = pv.visitors > 0 ? (pre.orders / pv.visitors) * 100 : 0;

  return c.json({
    success: true,
    data: {
      period: { start, end },
      revenue:        { current: cur.revenue,  previous: pre.revenue,  changePct: changePct(cur.revenue,  pre.revenue)  },
      orders:         { current: cur.orders,   previous: pre.orders,   changePct: changePct(cur.orders,   pre.orders)   },
      aov:            { current: cur.aov,      previous: pre.aov,      changePct: changePct(cur.aov,      pre.aov)      },
      visitors:       { current: cv.visitors,  previous: pv.visitors,  changePct: changePct(cv.visitors,  pv.visitors)  },
      conversionRate: { current: conversionRate, previous: prevConversionRate, changePct: changePct(conversionRate, prevConversionRate) },
      revenueChart:   revenueChart.results,
    },
  });
});

// ─── GET /api/admin/analytics/sales ──────────────────────────
app.get('/sales', async (c) => {
  const period = c.req.query('period') ?? '30d';
  const { start, end } = getDateRange(period);

  const [byCategory, byStatus, topProducts] = await Promise.all([
    c.env.DB.prepare(`
      SELECT cat.name as category,
             COALESCE(SUM(oi.line_total), 0) as revenue,
             SUM(oi.quantity) as units
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN categories cat ON cat.id = p.category_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status = 'captured'
        AND date(o.created_at) >= ? AND date(o.created_at) <= ?
      GROUP BY cat.id, cat.name
      ORDER BY revenue DESC
    `).bind(start, end).all(),

    c.env.DB.prepare(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE date(created_at) >= ? AND date(created_at) <= ?
      GROUP BY status
    `).bind(start, end).all(),

    c.env.DB.prepare(`
      SELECT oi.product_name as name, oi.product_id,
             SUM(oi.line_total) as revenue, SUM(oi.quantity) as units
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status = 'captured'
        AND date(o.created_at) >= ? AND date(o.created_at) <= ?
      GROUP BY oi.product_id, oi.product_name
      ORDER BY revenue DESC
      LIMIT 10
    `).bind(start, end).all(),
  ]);

  return c.json({
    success: true,
    data: {
      period:      { start, end },
      byCategory:  byCategory.results,
      byStatus:    byStatus.results,
      topProducts: topProducts.results,
    },
  });
});

// ─── GET /api/admin/analytics/traffic ────────────────────────
app.get('/traffic', async (c) => {
  const period = c.req.query('period') ?? '30d';
  const { start, end } = getDateRange(period);

  const [dailyTraffic, topPages] = await Promise.all([
    c.env.DB.prepare(`
      SELECT date(created_at) as date,
             COUNT(DISTINCT session_id) as visitors,
             COUNT(*) as pageviews
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND date(created_at) >= ? AND date(created_at) <= ?
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).bind(start, end).all(),

    c.env.DB.prepare(`
      SELECT page_url,
             COUNT(DISTINCT session_id) as visitors,
             COUNT(*) as pageviews
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND date(created_at) >= ? AND date(created_at) <= ?
      GROUP BY page_url
      ORDER BY pageviews DESC
      LIMIT 20
    `).bind(start, end).all(),
  ]);

  return c.json({
    success: true,
    data: {
      period:       { start, end },
      dailyTraffic: dailyTraffic.results,
      topPages:     topPages.results,
    },
  });
});

// ─── GET /api/admin/analytics/funnel ─────────────────────────
app.get('/funnel', async (c) => {
  const period = c.req.query('period') ?? '30d';
  const { start, end } = getDateRange(period);

  const eventCountQuery = (eventType: string) =>
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM analytics_events
      WHERE event_type = ?
        AND date(created_at) >= ? AND date(created_at) <= ?
    `).bind(eventType, start, end).first<{ count: number }>();

  const [visitors, productViews, addToCarts, checkoutsStarted, purchases] = await Promise.all([
    eventCountQuery('page_view'),
    eventCountQuery('product_view'),
    eventCountQuery('add_to_cart'),
    eventCountQuery('begin_checkout'),
    eventCountQuery('purchase'),
  ]);

  const v  = visitors?.count      ?? 0;
  const pv = productViews?.count  ?? 0;
  const ac = addToCarts?.count    ?? 0;
  const cs = checkoutsStarted?.count ?? 0;
  const p  = purchases?.count     ?? 0;

  const pct = (n: number) => v > 0 ? Math.round((n / v) * 1000) / 10 : 0;

  const cartAbandonmentRate     = ac > 0 ? Math.round(((ac - p) / ac) * 1000) / 10 : 0;
  const checkoutAbandonmentRate = cs > 0 ? Math.round(((cs - p) / cs) * 1000) / 10 : 0;

  return c.json({
    success: true,
    data: {
      period: { start, end },
      funnel: [
        { step: 'Visitors',          count: v,  pct: 100 },
        { step: 'Product Views',     count: pv, pct: pct(pv) },
        { step: 'Add to Cart',       count: ac, pct: pct(ac) },
        { step: 'Checkout Started',  count: cs, pct: pct(cs) },
        { step: 'Purchase',          count: p,  pct: pct(p)  },
      ],
      cartAbandonmentRate,
      checkoutAbandonmentRate,
    },
  });
});

export default app;
