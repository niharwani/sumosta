import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { sendCartRecovery, type CartRecoveryItem } from '../../services/email';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

interface EventRow {
  session_id:          string;
  user_id:             string | null;
  last_activity:       string;
  add_to_cart_events:  number;
  events_json:         string | null;
  identify_json:       string | null;
  reached_checkout:    number;
}

interface CartLineFromEvent {
  productId?:   string;
  variantId?:   string | null;
  productName?: string;
  price?:       number;
  quantity?:    number;
}

interface AbandonedCartRow {
  session_id:       string;
  user_id:          string | null;
  email:            string | null;
  phone:            string | null;
  name:             string | null;
  last_activity:    string;
  add_to_cart_count: number;
  reached_checkout: boolean;
  last_product:     string | null;
  cart_value:       number;
  items_count:      number;
  items:            CartLineFromEvent[];
  recovery_sent_at: string | null;
}

const RECOVERY_KV_PREFIX = 'recovery:sent:';
const RECOVERY_TTL       = 60 * 60 * 24 * 60; // 60 days

/**
 * Parse a session's add_to_cart events into a de-duplicated cart snapshot,
 * where later events with the same productId/variantId supersede earlier ones
 * on quantity (mirrors the client-side cart behavior of merging duplicates).
 */
function parseCartFromEvents(eventsJson: string | null): {
  items: CartLineFromEvent[];
  cartValue: number;
  itemsCount: number;
  lastProduct: string | null;
} {
  if (!eventsJson) return { items: [], cartValue: 0, itemsCount: 0, lastProduct: null };
  const chunks = eventsJson.split('|||');
  const parsed: CartLineFromEvent[] = [];
  for (const chunk of chunks) {
    try {
      const obj = JSON.parse(chunk);
      if (obj && typeof obj === 'object') parsed.push(obj as CartLineFromEvent);
    } catch { /* ignore */ }
  }

  // Merge duplicates by productId+variantId. Sum quantities across events.
  const byKey = new Map<string, CartLineFromEvent & { quantity: number; price: number }>();
  for (const p of parsed) {
    if (!p.productId) continue;
    const key = `${p.productId}::${p.variantId ?? ''}`;
    const existing = byKey.get(key);
    const qty = Number.isFinite(p.quantity) ? Number(p.quantity) : 1;
    const price = Number.isFinite(p.price) ? Number(p.price) : 0;
    if (existing) {
      existing.quantity += qty;
      if (price > 0) existing.price = price;   // keep latest known price
      if (p.productName) existing.productName = p.productName;
    } else {
      byKey.set(key, {
        productId:   p.productId,
        variantId:   p.variantId ?? null,
        productName: p.productName ?? 'Unknown item',
        price,
        quantity:    qty,
      });
    }
  }

  const items = Array.from(byKey.values());
  const cartValue  = items.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);
  const itemsCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const lastProduct = parsed.length > 0
    ? (parsed[parsed.length - 1].productName ?? null)
    : null;

  return {
    items,
    cartValue: Math.round(cartValue * 100) / 100,
    itemsCount,
    lastProduct,
  };
}

/** Extract email + phone + name from the most recent identify event (if any). */
function parseIdentity(identifyJson: string | null): {
  email: string | null;
  phone: string | null;
  name:  string | null;
} {
  if (!identifyJson) return { email: null, phone: null, name: null };
  const chunks = identifyJson.split('|||').filter(Boolean);
  // Iterate newest → oldest to prefer the most recent identifiers.
  for (let i = chunks.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(chunks[i]);
      if (obj && typeof obj === 'object') {
        const email = typeof obj.email === 'string' && obj.email.trim() ? obj.email.trim() : null;
        const phone = typeof obj.phone === 'string' && obj.phone.trim() ? obj.phone.trim() : null;
        const name  = typeof obj.name  === 'string' && obj.name.trim()  ? obj.name.trim()  : null;
        if (email || phone) return { email, phone, name };
      }
    } catch { /* ignore */ }
  }
  return { email: null, phone: null, name: null };
}

async function loadRecoverySentMap(
  kv: KVNamespace,
  sessionIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(sessionIds.map(async (sid) => {
    const raw = await kv.get(`${RECOVERY_KV_PREFIX}${sid}`);
    if (raw) map.set(sid, raw);
  }));
  return map;
}

// ─── GET /api/admin/abandonment ──────────────────────────────
// Returns sessions that added items to cart but never completed a purchase.
// Enriched with email/phone/user data pulled from identify events + users.
app.get('/', async (c) => {
  const period = c.req.query('period') ?? '7d';
  const limit  = Number(c.req.query('limit') ?? 50);

  const now = new Date();
  const daysBack = period === '30d' ? 30 : period === '14d' ? 14 : 7;
  const since = new Date(now);
  since.setDate(since.getDate() - daysBack);
  const sinceStr = since.toISOString().split('T')[0];

  const abandonedRes = await c.env.DB.prepare(`
    SELECT
      ae.session_id,
      MAX(ae.user_id) as user_id,
      MAX(ae.created_at) as last_activity,
      SUM(CASE WHEN ae.event_type = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_cart_events,
      GROUP_CONCAT(CASE WHEN ae.event_type = 'add_to_cart' THEN ae.event_data END, '|||') as events_json,
      GROUP_CONCAT(CASE WHEN ae.event_type = 'identify'    THEN ae.event_data END, '|||') as identify_json,
      MAX(CASE WHEN checkout.session_id IS NOT NULL THEN 1 ELSE 0 END) as reached_checkout
    FROM analytics_events ae
    LEFT JOIN (
      SELECT DISTINCT session_id FROM analytics_events WHERE event_type = 'purchase'
    ) purchased ON purchased.session_id = ae.session_id
    LEFT JOIN (
      SELECT DISTINCT session_id FROM analytics_events WHERE event_type = 'begin_checkout'
    ) checkout ON checkout.session_id = ae.session_id
    WHERE ae.session_id IN (
      SELECT DISTINCT session_id FROM analytics_events
      WHERE event_type = 'add_to_cart'
        AND date(created_at) >= ?
    )
    AND purchased.session_id IS NULL
    AND date(ae.created_at) >= ?
    GROUP BY ae.session_id
    ORDER BY last_activity DESC
    LIMIT ?
  `).bind(sinceStr, sinceStr, limit).all<EventRow>();

  const abandonedRows = abandonedRes.results ?? [];
  const sessionIds    = abandonedRows.map((r) => r.session_id);
  const userIds       = Array.from(new Set(
    abandonedRows.map((r) => r.user_id).filter((v): v is string => Boolean(v)),
  ));

  // Fetch user contacts in one query
  const usersMap = new Map<string, { email: string; phone: string; name: string }>();
  if (userIds.length > 0) {
    const placeholders = userIds.map(() => '?').join(',');
    const usersRes = await c.env.DB.prepare(
      `SELECT id, email, phone, name FROM users WHERE id IN (${placeholders})`,
    ).bind(...userIds).all<{ id: string; email: string; phone: string; name: string }>();
    for (const u of usersRes.results ?? []) {
      usersMap.set(u.id, { email: u.email, phone: u.phone, name: u.name });
    }
  }

  // Fetch recovery-sent timestamps from KV
  const recoveryMap = await loadRecoverySentMap(c.env.KV_CACHE, sessionIds);

  const rows: AbandonedCartRow[] = abandonedRows.map((row) => {
    const cart  = parseCartFromEvents(row.events_json);
    const ident = parseIdentity(row.identify_json);
    const user  = row.user_id ? usersMap.get(row.user_id) ?? null : null;

    return {
      session_id:        row.session_id,
      user_id:           row.user_id ?? null,
      email:             user?.email ?? ident.email ?? null,
      phone:             user?.phone ?? ident.phone ?? null,
      name:              user?.name  ?? ident.name  ?? null,
      last_activity:     row.last_activity,
      add_to_cart_count: row.add_to_cart_events,
      reached_checkout:  row.reached_checkout === 1,
      last_product:      cart.lastProduct,
      cart_value:        cart.cartValue,
      items_count:       cart.itemsCount,
      items:             cart.items,
      recovery_sent_at:  recoveryMap.get(row.session_id) ?? null,
    };
  });

  // Aggregate stats across the same period
  const stats = await c.env.DB.prepare(`
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
  `).bind(sinceStr).first<{ total_abandoned: number; abandoned_at_checkout: number }>();

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
      abandonedCarts:         rows,
      totalAbandoned:         stats?.total_abandoned ?? 0,
      abandonedAtCheckout:    stats?.abandoned_at_checkout ?? 0,
      abandonmentRate,
      totalAddToCartSessions: totalAtc?.count ?? 0,
    },
  });
});

// ─── POST /api/admin/abandonment/:sessionId/recover ──────────
// Sends a cart-recovery email to the identified email for this session and
// records a KV timestamp so the admin UI can show "Sent [when]".
app.post('/:sessionId/recover', async (c) => {
  const sessionId = c.req.param('sessionId');
  if (!sessionId) {
    return c.json({ success: false, error: 'sessionId is required', code: 'BAD_REQUEST' }, 400);
  }

  // Re-query the same session data so we can build the email server-side.
  const daysBack = 60; // widen window when recovering — session may be older than the list filter
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const sinceStr = since.toISOString().split('T')[0];

  const row = await c.env.DB.prepare(`
    SELECT
      ae.session_id,
      MAX(ae.user_id) as user_id,
      MAX(ae.created_at) as last_activity,
      SUM(CASE WHEN ae.event_type = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_cart_events,
      GROUP_CONCAT(CASE WHEN ae.event_type = 'add_to_cart' THEN ae.event_data END, '|||') as events_json,
      GROUP_CONCAT(CASE WHEN ae.event_type = 'identify'    THEN ae.event_data END, '|||') as identify_json,
      0 as reached_checkout
    FROM analytics_events ae
    WHERE ae.session_id = ?
      AND date(ae.created_at) >= ?
    GROUP BY ae.session_id
  `).bind(sessionId, sinceStr).first<EventRow>();

  if (!row) {
    return c.json({ success: false, error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }

  const cart  = parseCartFromEvents(row.events_json);
  const ident = parseIdentity(row.identify_json);

  // Resolve recipient identity
  let email: string | null = ident.email;
  let name:  string | null = ident.name;
  if (row.user_id) {
    const u = await c.env.DB.prepare(
      'SELECT email, name, phone FROM users WHERE id = ?',
    ).bind(row.user_id).first<{ email: string; name: string; phone: string }>();
    if (u) {
      email = email ?? u.email;
      name  = name  ?? u.name;
    }
  }

  if (!email) {
    return c.json(
      { success: false, error: 'No email on record for this session', code: 'NO_EMAIL' },
      400,
    );
  }

  if (cart.items.length === 0) {
    return c.json(
      { success: false, error: 'No cart items on record for this session', code: 'EMPTY_CART' },
      400,
    );
  }

  const emailItems: CartRecoveryItem[] = cart.items.map((it) => ({
    productName: it.productName ?? 'Item',
    variantName: null,
    quantity:    it.quantity ?? 1,
    unitPrice:   it.price ?? 0,
    lineTotal:   (it.price ?? 0) * (it.quantity ?? 1),
  }));

  const baseUrl   = (c.env.BASE_URL ?? '').replace(/\/$/, '');
  const resumeUrl = `${baseUrl}/cart?resume=${encodeURIComponent(sessionId)}`;

  const sent = await sendCartRecovery(
    {
      email,
      name,
      items:     emailItems,
      cartTotal: cart.cartValue,
      resumeUrl,
    },
    c.env.RESEND_API_KEY,
    c.env.RESEND_FROM_ORDERS ?? c.env.RESEND_FROM,
    c.env.SUPPORT_EMAIL ?? null,
  );

  if (!sent) {
    return c.json(
      { success: false, error: 'Email delivery failed', code: 'EMAIL_FAILED' },
      502,
    );
  }

  const sentAt = new Date().toISOString();
  await c.env.KV_CACHE.put(
    `${RECOVERY_KV_PREFIX}${sessionId}`,
    sentAt,
    { expirationTtl: RECOVERY_TTL },
  );

  return c.json({
    success: true,
    data: { sessionId, email, sentAt, resumeUrl },
  });
});

export default app;
