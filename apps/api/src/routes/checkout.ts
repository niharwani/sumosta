import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { setCookie } from 'hono/cookie';
import type { Bindings } from '../index';
import { verifyJwt, signJwt, generateRefreshToken } from '../lib/jwt';
import { generateId, generateOrderNumber, calcShipping, calcTax, hasQualifyingPriorOrder, isCombo10Eligible, isKnownNonServiceablePincode } from '../lib/utils';
import { verifyTurnstileToken } from '../lib/turnstile';
import { sendOrderConfirmation } from '../services/email';
import { automateShipmentForOrder } from '../services/shipment-automation';
import { generateInvoicePdf, toBase64 } from '../services/invoice';
import { getOrCreateInvoiceNumber } from '../services/invoice-numbering';

// Passwordless guest accounts get an "unusable" bcrypt-shaped hash so no
// plaintext password can ever match. They set a real password via reset
// flow or sign in via OTP once we roll that out.
const UNUSABLE_PASSWORD_HASH = '!' + Array.from({ length: 59 }, () =>
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
    Math.floor(Math.random() * 62),
  ),
).join('');

const REFRESH_TOKEN_TTL   = 7 * 24 * 60 * 60;
const REFRESH_COOKIE_NAME = 'sumosta_rt';

function isProdEnv(baseUrl: string): boolean {
  return baseUrl.startsWith('https://');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setRefreshCookie(c: any, token: string): void {
  const isProd = isProdEnv(c.env.BASE_URL as string);
  setCookie(c, REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'None' : 'Lax',
    path:     '/',
    maxAge:   REFRESH_TOKEN_TTL,
  });
}

// ============================================================
// POST /api/checkout — Cash-on-Delivery order placement
// ------------------------------------------------------------
// Guest-friendly. If a valid JWT is present the order is linked
// to the user; otherwise it's stored as a guest order via
// guest_email.
// COD fee (₹69) is added to the total on the server so the
// client can't spoof it away.
// ============================================================

type AppEnv = {
  Bindings: Bindings;
  Variables: Record<string, never>;
};

const app = new Hono<AppEnv>();

// ── Constants — import shared so client + server never drift ─
import { COD_HANDLING_FEE } from 'shared';
const PREPAID_COUPON_CODE  = 'PREPAID5';
const FALLBACK_CATEGORY_ID = 'cat_raw_honey';

// ── Schemas ──────────────────────────────────────────────────
const shippingSchema = z.object({
  name:    z.string().min(2),
  phone:   z.string().regex(/^\d{10}$/),
  line1:   z.string().min(5),
  line2:   z.string().optional().nullable(),
  city:    z.string().min(2),
  state:   z.string().min(2),
  // Indian PIN codes start with 1–8; reject 000000 / 999999 and similar.
  pincode: z.string().regex(/^[1-8]\d{5}$/),
});

const cartItemSchema = z.object({
  productId:   z.string().min(1),
  variantId:   z.string().min(1).nullable().optional(),
  quantity:    z.number().int().min(1).max(50),
  unitPrice:   z.number().positive().optional(),
  productName: z.string().min(1).optional(),
  // Client-supplied image URL — used only if the DB lookup returns no
  // primary image (e.g. static-catalog products defined in content.ts
  // and never synced to D1). Accept relative paths ("/images/...") or
  // HTTPS URLs; anything else is dropped rather than trusted.
  productImage: z.string().max(500).optional().nullable(),
});

const codCheckoutSchema = z.object({
  // Email is optional now — the phone-verified checkout flow doesn't
  // collect it. Legacy long-form checkout still sends it. When absent,
  // we skip the confirmation email and use phone as the sole identifier.
  email:           z.string().email().optional().nullable(),
  shippingAddress: shippingSchema,
  couponCodes:     z.array(z.string()).optional().default([]),
  paymentMethod:   z.literal('cod'),
  items:           z.array(cartItemSchema).min(1, 'Cart is empty'),
  // Cloudflare Turnstile widget token. Enforced only when
  // TURNSTILE_SECRET_KEY is configured; verified below.
  turnstileToken:  z.string().optional().nullable(),
});

// Best-effort user extraction. Never rejects.
async function resolveOptionalUser(
  authHeader: string | undefined,
  jwtSecret: string,
): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyJwt(authHeader.slice(7), jwtSecret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

// Accept a client-supplied product image URL only if it looks like an
// in-app static path ("/...") or an HTTPS URL. Anything else is dropped
// — we shouldn't be storing untrusted schemes (data:, javascript:) in
// order records that get rendered in emails and account pages.
function sanitiseClientImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 500) return null;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (trimmed.startsWith('https://')) return trimmed;
  return null;
}

interface ResolvedItem {
  productId:   string;
  variantId:   string | null;
  quantity:    number;
  unitPrice:   number;
  productName: string;
  variantName: string | null;
  sku:         string;
  imageUrl:    string | null;
  fromFallback: boolean;
}

app.post(
  '/',
  zValidator('json', codCheckoutSchema),
  async (c) => {
    const { email: rawEmail, shippingAddress, couponCodes, items, turnstileToken } = c.req.valid('json');
    const email = rawEmail?.trim() || null;

    // Bot protection — verify the Turnstile token when the secret is set.
    // When the secret is empty (widget not yet configured) verification is
    // skipped so checkout stays usable.
    const ipHeader = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? null;
    const turnstile = await verifyTurnstileToken(c.env.TURNSTILE_SECRET_KEY, turnstileToken, ipHeader);
    if (!turnstile.ok) {
      return c.json({
        success: false,
        error:   turnstile.error ?? 'Bot-protection check failed.',
        code:    turnstile.code ?? 'TURNSTILE_FAILED',
      }, 400);
    }

    // Hard block for pincodes we can't fulfill (Andaman & Nicobar, Lakshadweep).
    // Matches the guard in /api/shipping/serviceability so a buyer can't slip
    // past the frontend gate by hitting the endpoint directly.
    if (isKnownNonServiceablePincode(shippingAddress.pincode)) {
      return c.json({
        success: false,
        error:   'We\'re unable to ship to this pincode yet. Please try a different delivery address.',
        code:    'SHIPPING_NON_SERVICEABLE',
      }, 400);
    }

    // 1. Optional user resolution — guest orders are welcome
    const rawUserId = await resolveOptionalUser(c.req.header('Authorization'), c.env.JWT_SECRET);
    let userId: string | null = null;
    if (rawUserId) {
      const exists = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?')
        .bind(rawUserId).first<{ id: string }>();
      if (exists) userId = rawUserId;
    }
    // Track whether the request came in already-authenticated so we know
    // whether to mint tokens for a fresh auto-created account.
    const camWithSession = userId !== null;

    // If the request is anonymous but the supplied email OR phone already
    // belongs to a registered account, block the order and tell the client
    // to sign in first. This prevents someone from silently attaching a new
    // order (with their own shipping address) to another user's account.
    // With email now optional we only match against whichever fields the
    // client actually supplied.
    if (!camWithSession) {
      const conflict = email
        ? await c.env.DB.prepare(
            'SELECT email, phone FROM users WHERE (email = ? OR phone = ?) AND is_active = 1 LIMIT 1',
          ).bind(email, shippingAddress.phone).first<{ email: string; phone: string }>()
        : await c.env.DB.prepare(
            'SELECT email, phone FROM users WHERE phone = ? AND is_active = 1 LIMIT 1',
          ).bind(shippingAddress.phone).first<{ email: string; phone: string }>();

      if (conflict) {
        const field: 'email' | 'phone' =
          email && conflict.email.toLowerCase() === email.toLowerCase() ? 'email' : 'phone';
        return c.json(
          {
            success: false,
            code:    'ACCOUNT_EXISTS',
            error:   field === 'email'
              ? 'This email is already registered. Please sign in and try again.'
              : 'This phone number is already registered. Please sign in and try again.',
            field,
          },
          409,
        );
      }
    }

    // 2. Resolve items against D1 (server is source of truth for prices)
    const resolved: ResolvedItem[] = [];
    for (const it of items) {
      let variantId = it.variantId ?? null;
      let row = variantId
        ? await c.env.DB.prepare(`
            SELECT pv.id AS variant_id, pv.stock, p.stock AS product_stock,
                   (p.price + pv.price_adjust) AS price,
                   pv.sku AS variant_sku, pv.name AS variant_name,
                   p.name, p.sku AS product_sku, pi.url AS image_url
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE pv.id = ? AND p.id = ? AND p.is_active = 1
          `).bind(variantId, it.productId)
            .first<{
              variant_id: string;
              stock: number; product_stock: number;
              price: number; variant_sku: string | null; variant_name: string | null;
              name: string; product_sku: string | null; image_url: string | null;
            }>()
        : await c.env.DB.prepare(`
            SELECT p.stock, p.price, p.name, p.sku AS product_sku, pi.url AS image_url
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.id = ? AND p.is_active = 1
          `).bind(it.productId)
            .first<{
              stock: number; price: number; name: string;
              product_sku: string | null; image_url: string | null;
            }>();

      // Static-catalog fallback: static frontend variant IDs like
      // `var_wf_250g` don't match D1's real ids. If the exact variant
      // match failed but productId is a real D1 product, look up by size
      // token. D1's price still wins — TC-041 protection intact.
      if (!row && variantId) {
        const sizeMatch = variantId.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|x\d+g)$/i)
          ?? (it.productName ?? '').match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l)/i);
        if (sizeMatch) {
          const token = `${sizeMatch[1]}${sizeMatch[2]}`.toLowerCase();
          const remapped = await c.env.DB.prepare(`
            SELECT pv.id AS variant_id, pv.stock, p.stock AS product_stock,
                   (p.price + pv.price_adjust) AS price,
                   pv.sku AS variant_sku, pv.name AS variant_name,
                   p.name, p.sku AS product_sku, pi.url AS image_url
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.id = ? AND p.is_active = 1
              AND LOWER(REPLACE(pv.name, ' ', '')) LIKE ?
          `).bind(it.productId, `%${token}%`)
            .first<{
              variant_id: string; stock: number; product_stock: number;
              price: number; variant_sku: string | null; variant_name: string | null;
              name: string; product_sku: string | null; image_url: string | null;
            }>();
          if (remapped) {
            console.warn(`[checkout/cod] remapped stale variant ${variantId} → ${remapped.variant_id} via size token "${token}"`);
            row = remapped;
            variantId = remapped.variant_id;
          }
        }
      }

      if (!row) {
        console.warn(`[checkout/cod] rejecting unknown product/variant ${it.productId}/${it.variantId ?? 'none'}`);
        return c.json({
          success: false,
          error:   'One or more items in your cart are no longer available. Please refresh your cart and try again.',
          code:    'PRODUCT_NOT_FOUND',
        }, 404);
      }

      // Product-level stock acts as a kill-switch for the whole SKU family
      // — if the admin zeroes it out, no variant order should go through
      // even when the variant still has stock. Matches TC-040 expectation.
      const parentStock = (row as { product_stock?: number }).product_stock;
      if (variantId && typeof parentStock === 'number' && parentStock <= 0) {
        return c.json({
          success: false,
          error:   `Insufficient stock for "${row.name}" (0 available)`,
          code:    'INSUFFICIENT_STOCK',
        }, 409);
      }
      if (row.stock < it.quantity) {
        return c.json({
          success: false,
          error:   `Insufficient stock for "${row.name}" (${row.stock} available)`,
          code:    'INSUFFICIENT_STOCK',
        }, 409);
      }

      const variantRow = row as { variant_sku?: string | null; variant_name?: string | null };
      resolved.push({
        productId:   it.productId,
        variantId,
        quantity:    it.quantity,
        unitPrice:   row.price,
        productName: row.name,
        variantName: variantRow.variant_name ?? null,
        // Prefer variant SKU when present (variant-level fulfillment), then
        // product SKU, then productId as a last resort. This is what the
        // invoice PDF's "SKU" column ends up showing.
        sku:         variantRow.variant_sku ?? row.product_sku ?? it.productId,
        // DB is authoritative; fall back to client image only if no
        // primary image is set on the product (JOIN returned null).
        imageUrl:    row.image_url ?? sanitiseClientImageUrl(it.productImage),
        fromFallback: false,
      });
    }

    // 3. Stub-insert fallback products so order_items FK holds
    const stubInserts = resolved
      .filter((r) => r.fromFallback)
      .map((r) =>
        c.env.DB.prepare(`
          INSERT OR IGNORE INTO products (
            id, name, slug, sku, category_id, short_description, description,
            price, stock, is_active
          ) VALUES (?, ?, ?, ?, ?, '', '', ?, 0, 0)
        `).bind(
          r.productId, r.productName, r.productId, r.productId,
          FALLBACK_CATEGORY_ID, r.unitPrice,
        ),
      );
    if (stubInserts.length) await c.env.DB.batch(stubInserts);

    const subtotal = Math.round(
      resolved.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100,
    ) / 100;

    // 4. Apply coupons — reject PREPAID5 on COD orders (prepaid-only offer).
    // First-order-only coupons (WELCOME10) require an authenticated user with
    // no prior qualifying order — matched against `is_first_order_only` on the
    // coupon row so the client can't bypass the /validate check.
    let discount = 0;
    const appliedCoupons: { id: string; code: string }[] = [];
    let firstOrderChecked = false;
    let userIsEligibleForFirstOrder = false;
    for (const rawCode of couponCodes) {
      const code = rawCode.toUpperCase();
      // PREPAID5 is prepaid-only. On COD, tell the client to drop it so they
      // see the honest total rather than the amount they thought they'd pay.
      if (code === PREPAID_COUPON_CODE) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: `${code} only applies to prepaid orders. Remove it or choose Pay Online.`,
        }, 409);
      }

      const coupon = await c.env.DB.prepare(`
        SELECT id, code, type, value, min_order_amount, max_usage, usage_count,
               is_first_order_only, expires_at
        FROM coupons
        WHERE code = ? AND is_active = 1
      `).bind(code).first<{
        id: string; code: string; type: 'percentage' | 'fixed';
        value: number; min_order_amount: number | null;
        max_usage: number | null; usage_count: number;
        is_first_order_only: number; expires_at: string | null;
      }>();

      if (!coupon) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: `Coupon ${code} is no longer valid. Remove it and try again.`,
        }, 409);
      }

      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: `${code} needs a minimum order of ₹${coupon.min_order_amount}.`,
        }, 409);
      }
      if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: `${code} has reached its usage limit.`,
        }, 409);
      }
      if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: `${code} has expired.`,
        }, 409);
      }

      if (coupon.is_first_order_only) {
        if (!userId) {
          return c.json({
            success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
            error: `${code} is for signed-in first-time customers. Please sign in or remove the coupon.`,
          }, 409);
        }
        if (!firstOrderChecked) {
          userIsEligibleForFirstOrder = !(await hasQualifyingPriorOrder(c.env.DB, userId));
          firstOrderChecked = true;
        }
        if (!userIsEligibleForFirstOrder) {
          return c.json({
            success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
            error: `${code} is for first-time customers only.`,
          }, 409);
        }
      }

      // COMBO10 must not stack on the 5 Elements Collection (client rule).
      if (code === 'COMBO10' && !isCombo10Eligible(
        resolved.map((r) => ({ productId: r.productId, name: r.productName, quantity: r.quantity })),
      )) {
        return c.json({
          success: false, code: 'COUPON_INELIGIBLE', couponCode: code,
          error: 'COMBO10 applies to combo/gift products (Duo, Trio, Pack) or 2+ eligible items.',
        }, 409);
      }

      const amount = coupon.type === 'percentage'
        ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
        : Math.min(coupon.value, subtotal);
      discount += amount;
      appliedCoupons.push({ id: coupon.id, code: coupon.code });
    }
    discount = Math.min(discount, subtotal);

    // 5. Compute totals (server is source of truth). COD fee is added on top.
    // Shipping qualifies on the pre-coupon subtotal (order value) so coupons
    // never push a customer out of the free-shipping tier.
    const shipping = calcShipping(subtotal);
    const tax      = calcTax(subtotal - discount);
    const total    = Math.round((subtotal - discount + shipping + tax + COD_HANDLING_FEE) * 100) / 100;

    if (total < 1) {
      return c.json({ success: false, error: 'Order total is below the minimum (₹1)', code: 'AMOUNT_TOO_LOW' }, 400);
    }

    // 6. Persist the order
    const orderId       = generateId('ord');
    const orderNumber   = generateOrderNumber();
    const estimatedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const couponSummary = appliedCoupons.map((cp) => cp.code).join(',') || null;

    await c.env.DB.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, guest_email, status, payment_status, payment_method,
        shipping_name, shipping_phone,
        shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_pincode,
        subtotal, discount, shipping_amount, tax, total,
        coupon_code, estimated_delivery_date
      ) VALUES (?, ?, ?, ?, 'confirmed', 'pending', 'cod', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, orderNumber, userId, email,
      shippingAddress.name, shippingAddress.phone,
      shippingAddress.line1, shippingAddress.line2 ?? null,
      shippingAddress.city, shippingAddress.state, shippingAddress.pincode,
      subtotal, discount, shipping + COD_HANDLING_FEE, tax, total,
      couponSummary, estimatedDate,
    ).run();

    // 7. Insert order items — real sku + variant_name so the invoice PDF
    // renders the same identifiers the admin panel shows (previously the
    // productId was written into the sku column, garbling every invoice).
    const itemInserts = resolved.map((item) =>
      c.env.DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, variant_name, sku, quantity, unit_price, line_total, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        generateId('oi'), orderId, item.productId, item.variantId ?? null,
        item.productName, item.variantName ?? null, item.sku,
        item.quantity, item.unitPrice,
        Math.round(item.unitPrice * item.quantity * 100) / 100,
        item.imageUrl ?? null,
      ),
    );
    await c.env.DB.batch(itemInserts);

    // 7a. Deduct stock. COD orders commit as `confirmed` immediately (no
    // gateway to wait on), so we reserve inventory now — otherwise two COD
    // buyers can each grab the last unit and only ship one.
    // Uses stock-guarded UPDATE so oversell fails cleanly (changes === 0).
    for (const item of resolved) {
      if (item.fromFallback) continue; // static-catalog stubs have no real stock
      const res = item.variantId
        ? await c.env.DB.prepare(
            'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
          ).bind(item.quantity, item.variantId, item.quantity).run()
        : await c.env.DB.prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          ).bind(item.quantity, item.productId, item.quantity).run();
      if (res.meta.changes === 0) {
        console.error('[checkout/cod] oversold — no stock deducted for', item.productName, 'order', orderId);
      }
    }

    // 8. Bump coupon usage
    for (const applied of appliedCoupons) {
      await c.env.DB.prepare(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?',
      ).bind(applied.id).run();
    }

    // 9. Best-effort order-confirmation email — don't block the response on failure.
    // Skipped entirely when no email was supplied (phone-verified checkout flow).
    if (email && c.env.RESEND_API_KEY) {
      const emailItems = resolved.map((r) => ({
        productName: r.productName,
        variantName: r.variantName,
        sku:         r.sku,
        quantity:    r.quantity,
        unitPrice:   r.unitPrice,
        lineTotal:   Math.round(r.unitPrice * r.quantity * 100) / 100,
      }));

      // Generate PDF invoice for attachment. Failing to render must not block the email.
      let invoiceAttachment: { filename: string; content: string }[] | undefined;
      try {
        const invoiceNumber = await getOrCreateInvoiceNumber(c.env, orderId);
        const pdfBytes = await generateInvoicePdf({
          invoiceNumber,
          sellerLegalName:    c.env.SELLER_LEGAL_NAME    || null,
          sellerGstin:        c.env.SELLER_GSTIN         || null,
          sellerAddressBlock: c.env.SELLER_ADDRESS_BLOCK || null,
          sellerState:        c.env.SELLER_STATE         || null,
          sellerEmail:        c.env.SELLER_EMAIL         || null,
          placeOfSupply:      shippingAddress.state,
          orderNumber,
          createdAt:            new Date().toISOString(),
          paymentStatus:        'pending',
          paymentMethod:        'cod',
          couponCode:           couponSummary,
          trackingNumber:       null,
          shippingName:         shippingAddress.name,
          shippingPhone:        shippingAddress.phone,
          shippingEmail:        email,
          shippingAddressLine1: shippingAddress.line1,
          shippingAddressLine2: shippingAddress.line2 ?? null,
          shippingCity:         shippingAddress.city,
          shippingState:        shippingAddress.state,
          shippingPincode:      shippingAddress.pincode,
          subtotal,
          discount,
          shippingAmount:       shipping + COD_HANDLING_FEE,
          total,
          items: emailItems,
        });
        invoiceAttachment = [{
          filename: `Invoice-${orderNumber}.pdf`,
          content:  toBase64(pdfBytes),
        }];
      } catch (err) {
        console.warn('[checkout/cod] invoice PDF generation failed', err);
      }

      try {
        await sendOrderConfirmation(
          {
            id:                    orderId,
            orderNumber,
            guestEmail:            userId ? null : email,
            userEmail:             userId ? email : null,
            shippingName:          shippingAddress.name,
            shippingAddressLine1:  shippingAddress.line1,
            shippingAddressLine2:  shippingAddress.line2 ?? null,
            shippingCity:          shippingAddress.city,
            shippingState:         shippingAddress.state,
            shippingPincode:       shippingAddress.pincode,
            subtotal,
            discount,
            shippingAmount:        shipping + COD_HANDLING_FEE,
            tax,
            total,
            couponCode:            couponSummary,
            estimatedDeliveryDate: estimatedDate,
            items:                 emailItems,
          },
          c.env.RESEND_API_KEY,
          c.env.RESEND_FROM_ORDERS || c.env.RESEND_FROM,
          c.env.SUPPORT_EMAIL || null,
          invoiceAttachment,
        );
      } catch (err) {
        console.warn('[checkout/cod] confirmation email failed', err);
      }
    }

    // 10. Auto-create a passwordless customer account for guest checkouts,
    // then sign them in so the "View Order" CTA on the confirmation page
    // (which links to /account/orders/{id}) actually works.
    // Behaviour:
    //   - If an account with this email already exists → link the order to
    //     that user but do NOT auto-sign-in (security: we don't know the
    //     buyer really owns that account, only that they knew the email).
    //   - Otherwise → create a new passwordless user. They can set a
    //     password later via forgot-password, or sign in via OTP once we
    //     ship that flow.
    let issuedSession: { user: { id: string; name: string; email: string; phone: string; role: string }; accessToken: string; refreshToken: string } | null = null;

    // Only auto-create/link accounts for guest orders that supplied an email.
    // Phone-verified checkouts already have `camWithSession=true` so they
    // never enter this block. Legacy-form guests without an email stay
    // truly guest — the order tracking flow will find them by phone.
    if (!camWithSession && email) {
      try {
        const existing = await c.env.DB.prepare(
          'SELECT id, name, email, phone, role FROM users WHERE email = ? AND is_active = 1',
        ).bind(email).first<{ id: string; name: string; email: string; phone: string; role: string }>();

        if (existing) {
          // Link the order to the existing account, don't hand out a session.
          await c.env.DB.prepare('UPDATE orders SET user_id = ? WHERE id = ?')
            .bind(existing.id, orderId).run();
          userId = existing.id;
        } else {
          // Try creating a new passwordless account with the shipping details.
          const newId = generateId('usr');
          const displayName = shippingAddress.name;
          const displayPhone = shippingAddress.phone;

          try {
            await c.env.DB.prepare(
              'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            ).bind(newId, displayName, email, displayPhone, UNUSABLE_PASSWORD_HASH, 'customer').run();
          } catch (err) {
            // Phone unique constraint likely — retry with a synthetic phone so the account still gets created.
            console.warn('[checkout/cod] user insert failed (likely phone conflict), retrying with synthetic phone', err);
            await c.env.DB.prepare(
              'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            ).bind(newId, displayName, email, `guest:${newId}`, UNUSABLE_PASSWORD_HASH, 'customer').run();
          }

          // Link the order + mint a session
          await c.env.DB.prepare('UPDATE orders SET user_id = ? WHERE id = ?')
            .bind(newId, orderId).run();
          userId = newId;

          const accessToken  = await signJwt(
            { sub: newId, email, role: 'customer' },
            c.env.JWT_SECRET,
            '15m',
          );
          const refreshToken = generateRefreshToken();
          await c.env.KV_SESSIONS.put(`refresh:${newId}:${refreshToken}`, newId, {
            expirationTtl: REFRESH_TOKEN_TTL,
          });
          await c.env.KV_SESSIONS.put(`rt_lookup:${refreshToken}`, newId, {
            expirationTtl: REFRESH_TOKEN_TTL,
          });
          setRefreshCookie(c, refreshToken);

          issuedSession = {
            user: { id: newId, name: displayName, email, phone: displayPhone, role: 'customer' },
            accessToken,
            refreshToken,
          };
        }
      } catch (err) {
        // Never block the order response on account-creation issues.
        console.warn('[checkout/cod] auto-account creation failed, continuing as guest', err);
      }
    }

    // 11. Clear KV cart if authenticated (guest carts live in the browser)
    if (userId) {
      await c.env.KV_CACHE.delete(`cart:user:${userId}`);
    }

    // 12. Fire off Shiprocket automation without blocking the response.
    // Failures are logged and stashed on the order row for admin retry.
    c.executionCtx.waitUntil(
      automateShipmentForOrder(c.env, orderId).catch((err) => {
        console.error('[checkout/cod] shipment automation crashed for', orderId, err);
      }),
    );

    return c.json({
      success: true,
      data: {
        orderId,
        orderNumber,
        total,
        paymentMethod: 'cod',
        // Fresh session for auto-created guest accounts. Older clients that
        // don't know about these fields simply ignore them.
        ...(issuedSession
          ? {
              user:         issuedSession.user,
              accessToken:  issuedSession.accessToken,
              refreshToken: issuedSession.refreshToken,
            }
          : {}),
      },
    });
  },
);

export default app;
