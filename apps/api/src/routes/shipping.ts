// ============================================================
// Public shipping helpers used by the checkout page
// ------------------------------------------------------------
// GET /api/shipping/serviceability?pincode=XXXXXX&weight=1.2&cod=1
// Returns whether the pincode is deliverable, whether COD is offered
// there, the cheapest courier's rate, and the ETD (in days).
// ============================================================

import { Hono } from 'hono';
import type { Bindings } from '../index';
import { ShiprocketService, isShiprocketConfigured } from '../services/shiprocket';
import { sendOrderShipped, sendOrderDelivered } from '../services/email';
import { recordOrderStatusHistory } from '../lib/order-history';

const app = new Hono<{ Bindings: Bindings }>();

// Response is cached in KV for 6h keyed by pincode+cod so we don't hammer
// Shiprocket during a checkout browsing session.
const CACHE_TTL_SEC = 6 * 60 * 60;

interface CachedServiceability {
  serviceable:      boolean;
  cod_available:    boolean;
  prepaid_available: boolean;
  etd_days:         number | null;
  courier_name:     string | null;
  freight_charge:   number | null;
}

app.get('/serviceability', async (c) => {
  const pincode = (c.req.query('pincode') ?? '').trim();
  const weight  = Number(c.req.query('weight') ?? '0.5');
  const cod     = c.req.query('cod') === '1';

  if (!/^\d{6}$/.test(pincode)) {
    return c.json({
      success: false,
      error:   'Invalid pincode',
      code:    'INVALID_PINCODE',
    }, 400);
  }

  // Missing credentials → fail open so checkout still works. Serviceable=true
  // for prepaid, cod_available=true — we'll catch invalid pincodes at pickup.
  if (!isShiprocketConfigured(c.env)) {
    return c.json({
      success: true,
      data: {
        serviceable:      true,
        cod_available:    true,
        prepaid_available: true,
        etd_days:         5,
        courier_name:     null,
        freight_charge:   null,
        source:           'fallback',
      },
    });
  }

  const cacheKey = `svc:${pincode}:${cod ? '1' : '0'}:${weight.toFixed(2)}`;
  const cached = await c.env.KV_CACHE.get(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CachedServiceability;
      return c.json({ success: true, data: { ...parsed, source: 'cache' } });
    } catch {
      // fall through and re-fetch
    }
  }

  try {
    const sr = new ShiprocketService(c.env);
    const pickupPincode = await sr.getPickupPincode(c.env.SHIPROCKET_PICKUP_LOCATION);
    if (!pickupPincode) {
      // Config error — fail open so orders aren't blocked; admin sees this in logs.
      console.error('[shipping/serviceability] pickup pincode not found for nickname', c.env.SHIPROCKET_PICKUP_LOCATION);
      return c.json({
        success: true,
        data: {
          serviceable:      true,
          cod_available:    true,
          prepaid_available: true,
          etd_days:         5,
          courier_name:     null,
          freight_charge:   null,
          source:           'no_pickup',
        },
      });
    }

    // We always ask for both prepaid and cod availability so the frontend
    // can toggle the COD option without a second request.
    const [prepaid, codResult] = await Promise.all([
      sr.checkServiceability({
        pickupPincode,
        deliveryPincode: pincode,
        weightKg:        weight,
        cod:             false,
      }),
      sr.checkServiceability({
        pickupPincode,
        deliveryPincode: pincode,
        weightKg:        weight,
        cod:             true,
      }),
    ]);

    const response: CachedServiceability = {
      serviceable:      prepaid.serviceable || codResult.serviceable,
      cod_available:    codResult.serviceable && codResult.couriers.some((c) => c.cod === 1),
      prepaid_available: prepaid.serviceable,
      etd_days:         prepaid.etd_days ?? codResult.etd_days,
      courier_name:     prepaid.recommended?.courier_name ?? codResult.recommended?.courier_name ?? null,
      freight_charge:   prepaid.recommended?.rate ?? codResult.recommended?.rate ?? null,
    };

    await c.env.KV_CACHE.put(cacheKey, JSON.stringify(response), {
      expirationTtl: CACHE_TTL_SEC,
    });

    return c.json({ success: true, data: { ...response, source: 'live' } });
  } catch (err) {
    console.error('[shipping/serviceability] Shiprocket call failed', err);
    // Fail open — checkout should not be blocked by a Shiprocket outage.
    return c.json({
      success: true,
      data: {
        serviceable:      true,
        cod_available:    true,
        prepaid_available: true,
        etd_days:         5,
        courier_name:     null,
        freight_charge:   null,
        source:           'error',
      },
    });
  }
});

// ============================================================
// POST /api/shipping/webhook — Shiprocket status webhook
// ------------------------------------------------------------
// Configured in Shiprocket Panel → Settings → Webhooks with:
//   URL       = https://<worker-host>/api/shipping/webhook
//   Auth Type = x-api-key
//   Token     = SHIPROCKET_WEBHOOK_TOKEN (shared secret)
//
// Shiprocket fires this on every checkpoint update. We:
//   1. Verify the shared secret in the x-api-key header
//   2. Find the local order by AWB (fallback: order_number)
//   3. Update shipment_status + local order status (shipped/delivered)
//   4. Invalidate the KV tracking cache so customer sees fresh data
// Always returns 200 so Shiprocket doesn't retry-storm us on our bugs.
// ============================================================

interface ShiprocketWebhookScan {
  date:              string;
  activity:          string;
  location:          string;
  'sr-status':       string;
  'sr-status-label'?: string;
}

interface ShiprocketWebhookPayload {
  awb?:                 string;
  order_id?:            string | number;   // our order_number (they call it "order_id")
  channel_order_id?:    string | number;   // alt name in some versions
  current_status?:      string;
  current_status_id?:   number;
  shipment_status?:     number | string;
  courier_name?:        string;
  current_timestamp?:   string;
  etd?:                 string;
  scans?:               ShiprocketWebhookScan[];
}

// Maps Shiprocket status text → our internal order.status transition.
// Only shipped/delivered/cancelled/refunded flip our status; everything else
// just updates `shipment_status` for display without changing top-level state.
function mapToLocalStatus(
  status: string | undefined,
): 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s.includes('DELIVERED')) return 'delivered';
  // Reverse-to-origin, lost, damaged, and cancelled shipments become
  // top-level failures so the admin timeline + customer email reflect
  // reality. "RTO" is the umbrella for return-to-origin flows.
  if (
    s.includes('LOST')     ||
    s.includes('DAMAGED')  ||
    s.includes('RTO')      ||    // "RTO INITIATED", "RTO DELIVERED", "RTO IN TRANSIT"
    s.includes('REACHED WAREHOUSE') // some couriers use this for RTO landing
  ) {
    return 'refunded';
  }
  if (s.includes('CANCELLED') || s.includes('CANCELED')) {
    return 'cancelled';
  }
  // "PICKUP GENERATED" / "PICKUP SCHEDULED" deliberately do NOT flip
  // status yet — the parcel is still with us.
  if (
    s.includes('OUT FOR DELIVERY') ||
    s.includes('IN TRANSIT')       ||
    s.includes('SHIPPED')          ||
    s.includes('PICKED UP')
  ) {
    return 'shipped';
  }
  return null;
}

app.post('/webhook', async (c) => {
  // 1. Auth — constant-time-ish check on the shared secret
  const provided = c.req.header('x-api-key') ?? '';
  const expected = c.env.SHIPROCKET_WEBHOOK_TOKEN ?? '';
  if (!expected) {
    console.error('[shipping/webhook] SHIPROCKET_WEBHOOK_TOKEN not configured');
    return c.json({ ok: true }, 200);   // 200 avoids Shiprocket retries while we fix config
  }
  if (provided !== expected) {
    console.warn('[shipping/webhook] token mismatch — ignoring');
    return c.json({ ok: true }, 200);
  }

  // 2. Parse payload — tolerate junk
  let payload: ShiprocketWebhookPayload;
  try {
    payload = await c.req.json();
  } catch {
    console.error('[shipping/webhook] non-JSON body');
    return c.json({ ok: true }, 200);
  }

  const awb          = payload.awb?.toString().trim();
  const orderNumber  = payload.order_id?.toString().trim() ?? payload.channel_order_id?.toString().trim();
  const currentText  = payload.current_status?.toString();

  if (!awb && !orderNumber) {
    console.warn('[shipping/webhook] payload missing awb + order_id, ignoring');
    return c.json({ ok: true }, 200);
  }

  // 3. Find the local order — prefer AWB (unique), fall back to order_number.
  //    Pull recipient fields too so we can fire the shipped/delivered email
  //    on a transition without a second query.
  const order = awb
    ? await c.env.DB.prepare(`
        SELECT o.id, o.awb_code, o.status, o.order_number,
               o.shipping_name, o.guest_email, o.tracking_number, o.tracking_url,
               o.estimated_delivery_date, o.courier_name,
               u.email AS user_email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.awb_code = ? LIMIT 1
      `).bind(awb).first<{
        id: string; awb_code: string | null; status: string; order_number: string;
        shipping_name: string; guest_email: string | null;
        tracking_number: string | null; tracking_url: string | null;
        estimated_delivery_date: string | null; courier_name: string | null;
        user_email: string | null;
      }>()
    : await c.env.DB.prepare(`
        SELECT o.id, o.awb_code, o.status, o.order_number,
               o.shipping_name, o.guest_email, o.tracking_number, o.tracking_url,
               o.estimated_delivery_date, o.courier_name,
               u.email AS user_email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.order_number = ? LIMIT 1
      `).bind(orderNumber!).first<{
        id: string; awb_code: string | null; status: string; order_number: string;
        shipping_name: string; guest_email: string | null;
        tracking_number: string | null; tracking_url: string | null;
        estimated_delivery_date: string | null; courier_name: string | null;
        user_email: string | null;
      }>();

  if (!order) {
    console.warn('[shipping/webhook] no local order found for', { awb, orderNumber });
    return c.json({ ok: true }, 200);
  }

  // 4. Build the UPDATE dynamically — only touch fields the payload carries.
  //    Track whether this webhook is causing a shipped/delivered transition;
  //    those trigger a one-shot customer email below.
  const localStatus = mapToLocalStatus(currentText);
  const sets: string[] = ["updated_at = datetime('now')"];
  const binds: unknown[] = [];
  let transitionedTo: 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null = null;

  if (currentText) {
    sets.push('shipment_status = ?', "shipment_status_updated_at = datetime('now')");
    binds.push(currentText);
  }
  if (payload.courier_name) {
    sets.push('courier_name = ?');
    binds.push(payload.courier_name);
  }
  if (localStatus === 'delivered' && order.status !== 'delivered') {
    sets.push('status = ?', "delivered_at = COALESCE(delivered_at, datetime('now'))");
    binds.push('delivered');
    transitionedTo = 'delivered';
  } else if (localStatus === 'shipped' && order.status !== 'shipped' && order.status !== 'delivered') {
    sets.push('status = ?', "shipped_at = COALESCE(shipped_at, datetime('now'))");
    binds.push('shipped');
    transitionedTo = 'shipped';
  } else if (
    (localStatus === 'cancelled' || localStatus === 'refunded') &&
    order.status !== localStatus &&
    order.status !== 'delivered'   // do not downgrade delivered orders
  ) {
    sets.push('status = ?');
    binds.push(localStatus);
    transitionedTo = localStatus;
  }

  if (binds.length > 0) {
    binds.push(order.id);
    await c.env.DB.prepare(
      `UPDATE orders SET ${sets.join(', ')} WHERE id = ?`,
    ).bind(...binds).run();
  }

  // 4a. Record the transition in order_status_history. Only fires when the
  //     top-level order.status actually flipped (guarded by the check above),
  //     so repeat IN TRANSIT pings don't spam the timeline.
  if (transitionedTo) {
    await recordOrderStatusHistory(
      c.env,
      order.id,
      order.status,
      transitionedTo,
      null,
      `Shiprocket: ${currentText ?? transitionedTo}`,
    );
  }

  // 5. Invalidate the tracking cache — next customer fetch pulls fresh data
  if (order.awb_code) {
    await c.env.KV_CACHE.delete(`track:awb:${order.awb_code}`);
  }

  // 6. Fire the customer email on a real transition. Guarded by the
  //    order.status check above so repeat webhooks for the same phase
  //    (Shiprocket sends many "IN TRANSIT" pings) don't spam the inbox.
  //    Runs via waitUntil so the webhook always returns 200 quickly.
  if (transitionedTo && c.env.RESEND_API_KEY) {
    const recipient = order.guest_email ?? order.user_email;
    if (recipient) {
      const emailPayload = {
        orderNumber:     order.order_number,
        recipientEmail:  recipient,
        shippingName:    order.shipping_name,
        trackingNumber:  order.tracking_number ?? awb ?? null,
        trackingUrl:     order.tracking_url,
        courier:         payload.courier_name ?? order.courier_name,
        estimatedDate:   payload.etd ?? order.estimated_delivery_date,
      };
      const fromAddr = c.env.RESEND_FROM_ORDERS || c.env.RESEND_FROM || undefined;
      const replyTo  = c.env.SUPPORT_EMAIL || null;
      const send = transitionedTo === 'delivered'
        ? sendOrderDelivered(emailPayload, c.env.RESEND_API_KEY, fromAddr, replyTo)
        : sendOrderShipped(emailPayload,   c.env.RESEND_API_KEY, fromAddr, replyTo);
      c.executionCtx.waitUntil(
        send.catch((err) => console.error('[shipping/webhook] status email failed', err)),
      );
    } else {
      console.log('[shipping/webhook] no recipient email for order', order.order_number, '— skipping', transitionedTo, 'notification');
    }
  }

  return c.json({ ok: true }, 200);
});

export default app;
