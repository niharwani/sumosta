// ============================================================
// Shipment automation
// ------------------------------------------------------------
// Single entry point used by every "order was successfully placed"
// code path (Razorpay verify, PhonePe callback, COD checkout). It:
//   1. Loads order + items + product dimensions from D1
//   2. Creates the Shiprocket order
//   3. Assigns an AWB (auto-picks recommended courier)
//   4. Requests pickup
//   5. Persists all identifiers back to D1
// Everything is best-effort — failures never surface to the customer,
// they're logged and stashed in `orders.shipment_last_error` so admins
// can hit "Retry shipment" from the order detail page.
// ============================================================

import { ShiprocketService, isShiprocketConfigured, type ShiprocketAdhocOrderInput } from './shiprocket';

interface Env {
  DB:                        D1Database;
  KV_CACHE:                  KVNamespace;
  SHIPROCKET_EMAIL:          string;
  SHIPROCKET_PASSWORD:       string;
  SHIPROCKET_PICKUP_LOCATION: string;
  SUPPORT_EMAIL?:            string;
}

interface OrderRow {
  id:                       string;
  order_number:             string;
  guest_email:              string | null;
  user_id:                  string | null;
  status:                   string;
  payment_method:           string | null;
  shipping_name:            string;
  shipping_phone:           string;
  shipping_address_line1:   string;
  shipping_address_line2:   string | null;
  shipping_city:            string;
  shipping_state:           string;
  shipping_pincode:         string;
  subtotal:                 number;
  discount:                 number;
  shipping_amount:          number;
  total:                    number;
  created_at:               string;
  shiprocket_shipment_id:   number | null;
  awb_code:                 string | null;
}

interface ItemRow {
  product_id:  string;
  product_name: string;
  sku:         string | null;
  quantity:    number;
  unit_price:  number;
  weight:      number | null;
  length_cm:   number | null;
  width_cm:    number | null;
  height_cm:   number | null;
}

// Default package dims / weight when a product's row is missing values.
// Sized conservatively for a honey jar — client will override once real
// per-SKU dimensions land in the DB.
const DEFAULT_WEIGHT_KG  = 0.55;
const DEFAULT_LENGTH_CM  = 15;
const DEFAULT_WIDTH_CM   = 12;
const DEFAULT_HEIGHT_CM  = 10;

// Total volumetric contribution of a set of items. We approximate the
// outer package as the bounding box of the largest item and extend the
// longest dimension by the number of items (things are stacked). Not
// perfect but good enough for Shiprocket's rate cap; overshooting cost
// is preferable to undershooting weight and getting rejected at pickup.
function computePackage(items: ItemRow[]): {
  weight: number; length: number; breadth: number; height: number;
} {
  let totalWeight = 0;
  let maxL = 0, maxW = 0, maxH = 0;
  let stackedUnits = 0;

  for (const it of items) {
    const w = (it.weight ?? DEFAULT_WEIGHT_KG) * it.quantity;
    totalWeight += w;
    maxL = Math.max(maxL, it.length_cm ?? DEFAULT_LENGTH_CM);
    maxW = Math.max(maxW, it.width_cm  ?? DEFAULT_WIDTH_CM);
    maxH = Math.max(maxH, it.height_cm ?? DEFAULT_HEIGHT_CM);
    stackedUnits += it.quantity;
  }

  // Stack on the height axis for extra units. If there's only 1 unit total,
  // the bounding box is just that item. Above 1, add height per extra unit.
  const stackedHeight = maxH * Math.max(1, stackedUnits);

  return {
    weight:  Math.max(0.1, Math.round(totalWeight * 100) / 100),
    length:  Math.max(1, Math.round(maxL)),
    breadth: Math.max(1, Math.round(maxW)),
    height:  Math.max(1, Math.round(stackedHeight)),
  };
}

// Split full name into first + last for Shiprocket's required fields.
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '.' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

// Format a UTC ISO datetime as "YYYY-MM-DD HH:mm" in IST — Shiprocket
// interprets order_date in India Standard Time regardless of format.
function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  // IST = UTC+5:30
  const ist = new Date(d.getTime() + (5 * 60 + 30) * 60 * 1000);
  const yyyy = ist.getUTCFullYear();
  const mm   = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(ist.getUTCDate()).padStart(2, '0');
  const hh   = String(ist.getUTCHours()).padStart(2, '0');
  const mi   = String(ist.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

async function loadOrder(db: D1Database, orderId: string): Promise<OrderRow | null> {
  return db.prepare(`
    SELECT id, order_number, guest_email, user_id, status, payment_method,
           shipping_name, shipping_phone,
           shipping_address_line1, shipping_address_line2,
           shipping_city, shipping_state, shipping_pincode,
           subtotal, discount, shipping_amount, total, created_at,
           shiprocket_shipment_id, awb_code
    FROM orders
    WHERE id = ?
  `).bind(orderId).first<OrderRow>();
}

async function loadItems(db: D1Database, orderId: string): Promise<ItemRow[]> {
  const res = await db.prepare(`
    SELECT oi.product_id, oi.product_name, oi.sku, oi.quantity, oi.unit_price,
           p.weight, p.length_cm, p.width_cm, p.height_cm
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).bind(orderId).all<ItemRow>();
  return res.results ?? [];
}

async function markError(db: D1Database, orderId: string, err: string): Promise<void> {
  await db.prepare(`
    UPDATE orders
    SET shipment_last_error = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(err.slice(0, 500), orderId).run();
}

export interface AutomationResult {
  ok:      boolean;
  reason?: string;
  awb?:    string | null;
  courier?: string | null;
}

// The one-and-only function to call after a successful order placement.
// Guaranteed to not throw — errors are logged and captured on the order row.
export async function automateShipmentForOrder(
  env:     Env,
  orderId: string,
): Promise<AutomationResult> {
  try {
    if (!isShiprocketConfigured(env)) {
      console.warn('[shipment-automation] Shiprocket not configured, skipping order', orderId);
      return { ok: false, reason: 'not_configured' };
    }

    const order = await loadOrder(env.DB, orderId);
    if (!order) {
      console.error('[shipment-automation] order not found', orderId);
      return { ok: false, reason: 'order_not_found' };
    }

    // Idempotency — don't create a duplicate Shiprocket order if we already
    // did. If the AWB is missing but the shipment exists, we still try to
    // (re)assign it below.
    if (order.awb_code) {
      return { ok: true, reason: 'already_shipped', awb: order.awb_code };
    }

    const items = await loadItems(env.DB, orderId);
    if (items.length === 0) {
      const msg = 'no order items';
      await markError(env.DB, orderId, msg);
      return { ok: false, reason: msg };
    }

    const pkg  = computePackage(items);
    const name = splitName(order.shipping_name);

    // Recover buyer email. For guest orders it's on the order row; for
    // authed orders we need to look it up.
    let buyerEmail = order.guest_email;
    if (!buyerEmail && order.user_id) {
      const u = await env.DB.prepare('SELECT email FROM users WHERE id = ?')
        .bind(order.user_id).first<{ email: string }>();
      buyerEmail = u?.email ?? null;
    }
    if (!buyerEmail) {
      buyerEmail = env.SUPPORT_EMAIL ?? 'no-reply@sumosta.com';
    }

    const paymentMode: 'Prepaid' | 'COD' =
      order.payment_method === 'cod' ? 'COD' : 'Prepaid';

    const sr = new ShiprocketService(env);

    // 1) Create adhoc order
    const createInput: ShiprocketAdhocOrderInput = {
      order_id:        order.order_number,
      order_date:      formatOrderDate(order.created_at),
      pickup_location: env.SHIPROCKET_PICKUP_LOCATION,
      billing_customer_name: name.first,
      billing_last_name:     name.last,
      billing_address:       order.shipping_address_line1,
      billing_address_2:     order.shipping_address_line2,
      billing_city:          order.shipping_city,
      billing_pincode:       order.shipping_pincode,
      billing_state:         order.shipping_state,
      billing_country:       'India',
      billing_email:         buyerEmail,
      billing_phone:         order.shipping_phone,
      shipping_is_billing:   true,
      order_items: items.map((it) => ({
        name:          it.product_name,
        sku:           it.sku || it.product_id,
        units:         it.quantity,
        selling_price: it.unit_price,
      })),
      payment_method:  paymentMode,
      sub_total:       order.subtotal,
      length:          pkg.length,
      breadth:         pkg.breadth,
      height:          pkg.height,
      weight:          pkg.weight,
      shipping_charges: order.shipping_amount,
      total_discount:   order.discount,
    };

    let shipmentId = order.shiprocket_shipment_id;
    let shiprocketOrderId: number | null = null;

    if (!shipmentId) {
      const created = await sr.createAdhocOrder(createInput);
      if (!created.shipment_id) {
        const msg = `create failed: ${created.status ?? 'unknown'}`;
        await markError(env.DB, orderId, msg);
        return { ok: false, reason: msg };
      }
      shipmentId       = created.shipment_id;
      shiprocketOrderId = created.order_id;

      await env.DB.prepare(`
        UPDATE orders
        SET shiprocket_order_id = ?, shiprocket_shipment_id = ?,
            shipment_status = 'NEW', shipment_status_updated_at = datetime('now'),
            shipment_last_error = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).bind(shiprocketOrderId, shipmentId, orderId).run();
    }

    // 2) Assign AWB (Shiprocket picks recommended courier when we omit it)
    const awbRes = await sr.assignAwb(shipmentId);
    const awbData = awbRes.response?.data;
    if (!awbData?.awb_code) {
      const msg = `awb assign failed: ${awbRes.message ?? 'no awb returned'}`;
      await markError(env.DB, orderId, msg);
      return { ok: false, reason: msg };
    }

    const trackingUrl = `https://shiprocket.co/tracking/${encodeURIComponent(awbData.awb_code)}`;

    await env.DB.prepare(`
      UPDATE orders
      SET awb_code = ?, courier_name = ?, courier_company_id = ?,
          tracking_number = ?, tracking_url = ?,
          shipment_status = 'READY TO SHIP',
          shipment_status_updated_at = datetime('now'),
          shipment_last_error = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      awbData.awb_code,
      awbData.courier_name,
      awbData.courier_company_id,
      awbData.awb_code,
      trackingUrl,
      orderId,
    ).run();

    // 3) Request pickup — non-fatal if it fails, we can retry from admin
    try {
      await sr.requestPickup([shipmentId]);
      await env.DB.prepare(`
        UPDATE orders
        SET shipment_status = 'PICKUP SCHEDULED',
            shipment_status_updated_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(orderId).run();
    } catch (pickupErr) {
      console.warn('[shipment-automation] pickup request failed for', orderId, pickupErr);
      // Don't overwrite awb success; just record the pickup issue.
      await markError(env.DB, orderId, `pickup: ${(pickupErr as Error).message}`);
    }

    return { ok: true, awb: awbData.awb_code, courier: awbData.courier_name };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[shipment-automation] failed for', orderId, msg);
    try { await markError(env.DB, orderId, msg); } catch { /* swallow */ }
    return { ok: false, reason: msg };
  }
}
