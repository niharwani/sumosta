import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin ──────────────────────────────────────────
app.get('/', async (c) => {
  const now          = new Date();
  const todayStr     = now.toISOString().split('T')[0];

  const yesterday    = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const monthStart   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Revenue & orders per period (parameterized — no string concat for user data)
  const [
    today,
    yesterdayStats,
    thisMonth,
    recentOrders,
    lowStock,
    topProducts,
    revenueChartRaw,
    todayVisitors,
    yesterdayVisitors,
  ] = await Promise.all([
    // Today revenue/orders/aov
    c.env.DB.prepare(`
      SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as orders, COALESCE(AVG(total),0) as aov
      FROM orders WHERE payment_status='captured' AND date(created_at)=?
    `).bind(todayStr).first<{ revenue: number; orders: number; aov: number }>(),

    // Yesterday revenue/orders/aov
    c.env.DB.prepare(`
      SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as orders, COALESCE(AVG(total),0) as aov
      FROM orders WHERE payment_status='captured' AND date(created_at)=?
    `).bind(yesterdayStr).first<{ revenue: number; orders: number; aov: number }>(),

    // This month
    c.env.DB.prepare(`
      SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as orders, COALESCE(AVG(total),0) as aov
      FROM orders WHERE payment_status='captured' AND date(created_at)>=?
    `).bind(monthStart).first<{ revenue: number; orders: number; aov: number }>(),

    // Recent 10 orders
    c.env.DB.prepare(`
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total, o.created_at, o.shipping_name
      FROM orders o ORDER BY o.created_at DESC LIMIT 10
    `).all(),

    // Low stock products
    c.env.DB.prepare(`
      SELECT id, name, slug, stock, low_stock_threshold
      FROM products WHERE stock <= low_stock_threshold AND is_active=1 ORDER BY stock ASC LIMIT 10
    `).all(),

    // Top 5 products by revenue this month
    c.env.DB.prepare(`
      SELECT oi.product_id, oi.product_name as name,
             SUM(oi.line_total) as revenue, SUM(oi.quantity) as units
      FROM order_items oi JOIN orders o ON o.id=oi.order_id
      WHERE o.payment_status='captured' AND date(o.created_at)>=?
      GROUP BY oi.product_id, oi.product_name ORDER BY revenue DESC LIMIT 5
    `).bind(monthStart).all(),

    // Revenue chart — last 30 days
    c.env.DB.prepare(`
      SELECT date(created_at) as date, COALESCE(SUM(total),0) as revenue, COUNT(*) as orders
      FROM orders WHERE payment_status='captured'
        AND date(created_at)>=? AND date(created_at)<=?
      GROUP BY date(created_at) ORDER BY date ASC
    `).bind(thirtyDaysAgoStr, todayStr).all(),

    // Today's unique visitors
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT session_id) as visitors FROM analytics_events
      WHERE event_type='page_view' AND date(created_at)=?
    `).bind(todayStr).first<{ visitors: number }>(),

    // Yesterday's unique visitors
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT session_id) as visitors FROM analytics_events
      WHERE event_type='page_view' AND date(created_at)=?
    `).bind(yesterdayStr).first<{ visitors: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      today:            { ...(today   ?? { revenue: 0, orders: 0, aov: 0 }), visitors: todayVisitors?.visitors ?? 0 },
      yesterday:        { ...(yesterdayStats ?? { revenue: 0, orders: 0, aov: 0 }), visitors: yesterdayVisitors?.visitors ?? 0 },
      thisMonth:        thisMonth ?? { revenue: 0, orders: 0, aov: 0 },
      recentOrders:     recentOrders.results,
      lowStockProducts: lowStock.results,
      topProducts:      topProducts.results,
      revenueChart:     revenueChartRaw.results,
    },
  });
});

export default app;
