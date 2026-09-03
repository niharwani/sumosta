import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { setCookie } from 'hono/cookie';
import type { Bindings } from '../index';
import { verifyJwt, signJwt, generateRefreshToken } from '../lib/jwt';
import { generateId, generateOrderNumber, calcShipping, calcTax, hasQualifyingPriorOrder } from '../lib/utils';
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
  pincode: z.string().regex(/^\d{6}$/),
});

const cartItemSchema = z.object({
  productId:   z.string().min(1),
  variantId:   z.string().min(1).nullable().optional(),
  quantity:    z.number().int().min(1).max(50),
  unitPrice:   z.number().positive().optional(),
  productName: z.string().min(1).optional(),
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

interface ResolvedItem {
  productId:   string;
  variantId:   string | null;
  quantity:    number;
  unitPrice:   number;
  productName: string;
  imageUrl:    string | null;
  fromFallback: boolean;
}

app.post(
  '/',
  zValidator('json', codCheckoutSchema),
  async (c) => {
    const { email: rawEmail, shippingAddress, couponCodes, items } = c.req.valid('json');
    const email = rawEmail?.trim() || null;

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
      const variantId = it.variantId ?? null;
      const row = variantId
        ? await c.env.DB.prepare(`
            SELECT pv.stock, pv.price, p.name, pi.url AS image_url
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE pv.id = ? AND p.id = ? AND p.is_active = 1
          `).bind(variantId, it.productId)
            .first<{ stock: number; price: number; name: string; image_url: string | null }>()
        : await c.env.DB.prepare(`
            SELECT p.stock, p.price, p.name, pi.url AS image_url
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.id = ? AND p.is_active = 1
          `).bind(it.productId)
            .first<{ stock: number; price: number; name: string; image_url: string | null }>();

      if (!row) {
        // Fallback: accept client-supplied price/name for static-catalog products
        if (typeof it.unitPrice === 'number' && it.productName) {
          resolved.push({
            productId:   it.productId,
            variantId:   null,
            quantity:    it.quantity,
            unitPrice:   it.unitPrice,
            productName: it.productName,
            imageUrl:    null,
            fromFallback: true,
          });
          continue;
        }
        return c.json({
          success: false,
          error:   `Product ${it.productId} not found or inactive`,
          code:    'PRODUCT_NOT_FOUND',
        }, 404);
      }

      if (row.stock < it.quantity) {
        return c.json({
          success: false,
          error:   `Insufficient stock for "${row.name}" (${row.stock} available)`,
          code:    'INSUFFICIENT_STOCK',
        }, 409);
      }

      resolved.push({
        productId:   it.productId,
        variantId,
        quantity:    it.quantity,
        unitPrice:   row.price,
        productName: row.name,
        imageUrl:    row.image_url,
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

      const amount = coupon.type === 'percentage'
        ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
        : Math.min(coupon.value, subtotal);
      discount += amount;
      appliedCoupons.push({ id: coupon.id, code: coupon.code });
    }
    discount = Math.min(discount, subtotal);

    // 5. Compute totals (server is source of truth). COD fee is added on top.
    const shipping = calcShipping(subtotal - discount);
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

    // 7. Insert order items
    const itemInserts = resolved.map((item) =>
      c.env.DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, line_total, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        generateId('oi'), orderId, item.productId, item.variantId ?? null,
        item.productName, item.productId, item.quantity, item.unitPrice,
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
        variantName: null,
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
          items: emailItems.map((i) => ({ ...i, sku: null })),
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
