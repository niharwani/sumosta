import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

// ─── GET /api/admin ──────────────────────────────────────────
app.get('/', async (c) => {
  const now       = new Date();
  const todayStr  = now.toISOString().split('T')[0];           // YYYY-MM-DD

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // ── Revenue & orders per period ──────────────────────────────
  const periodQuery = (dateFilter: string) => c.env.DB.prepare(`
    SELECT
      COALESCE(SUM(total), 0)  as revenue,
      COUNT(*)                 as orders,
      COALESCE(AVG(total), 0)  as aov
    FROM orders
    WHERE payment_status = 'captured' AND ${dateFilter}
  `);

  const [today, yesterdayStats, thisMonth] = await Promise.all([
    periodQuery(`date(created_at) = '${todayStr}'`).first<{ revenue: number; orders: number; aov: number }>(),
    periodQuery(`date(created_at) = '${yesterdayStr}'`).first<{ revenue: number; orders: number; aov: number }>(),
    periodQuery(`date(created_at) >= '${monthStart}'`).first<{ revenue: number; orders: number; aov: number }>(),
  ]);

  // ── Recent 10 orders ─────────────────────────────────────────
  const recentOrders = await c.env.DB.prepare(`
    SELECT o.id, o.order_number, o.status, o.payment_status, o.total, o.created_at,
           o.shipping_name
    FROM orders o
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all();

  // ── Low stock products ────────────────────────────────────────
  const lowStock = await c.env.DB.prepare(`
    SELECT id, name, slug, stock, low_stock_threshold
    FROM products
    WHERE stock <= low_stock_threshold AND is_active = 1
    ORDER BY stock ASC
    LIMIT 10
  `).all();

  // ── Top 5 products by revenue this month ─────────────────────
  const topProducts = await c.env.DB.prepare(`
    SELECT oi.product_id, oi.product_name as name,
           SUM(oi.line_total) as revenue,
           SUM(oi.quantity)   as units
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'captured' AND date(o.created_at) >= ?
    GROUP BY oi.product_id, oi.product_name
    ORDER BY revenue DESC
    LIMIT 5
  `).bind(monthStart).all();

  return c.json({
    success: true,
    data: {
      today:            today   ?? { revenue: 0, orders: 0, aov: 0 },
      yesterday:        yesterdayStats ?? { revenue: 0, orders: 0, aov: 0 },
      thisMonth:        thisMonth ?? { revenue: 0, orders: 0, aov: 0 },
      recentOrders:     recentOrders.results,
      lowStockProducts: lowStock.results,
      topProducts:      topProducts.results,
    },
  });
});

export default app;
