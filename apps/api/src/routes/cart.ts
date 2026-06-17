import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../index';
import { verifyJwt } from '../lib/jwt';

// ── Types ───────────────────────────────────────────────────

interface CartItemKV {
  productId:   string;
  variantId:   string | null;
  quantity:    number;
  unitPrice:   number;
  productName: string;
  imageUrl:    string | null;
}

interface CartKV {
  items:    CartItemKV[];
  subtotal: number;
}

// ── Helpers ─────────────────────────────────────────────────

const CART_TTL = 7 * 24 * 60 * 60; // 7 days

function calcSubtotal(items: CartItemKV[]): number {
  return Math.round(
    items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100,
  ) / 100;
}

/** Resolve the KV cart key — user cart if authenticated, session cart otherwise. */
async function resolveCartKey(c: {
  req: { header: (name: string) => string | undefined };
  env: Bindings;
}): Promise<string> {
  const auth = c.req.header('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = await verifyJwt(auth.slice(7), c.env.JWT_SECRET);
      return `cart:user:${payload.sub as string}`;
    } catch {
      // Fall through to session cart
    }
  }
  const sessionId = c.req.header('X-Session-ID') ?? 'anonymous';
  return `cart:session:${sessionId}`;
}

async function getCart(key: string, kv: KVNamespace): Promise<CartKV> {
  const raw = await kv.get(key);
  if (!raw) return { items: [], subtotal: 0 };
  return JSON.parse(raw) as CartKV;
}

async function saveCart(key: string, cart: CartKV, kv: KVNamespace): Promise<void> {
  await kv.put(key, JSON.stringify(cart), { expirationTtl: CART_TTL });
}

// ── Schemas ─────────────────────────────────────────────────

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity:  z.number().int().min(1).max(50),
});

// ── App ─────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Bindings }>();

// ─── POST /api/cart/items — add or update an item ──────────
app.post('/items', zValidator('json', addItemSchema), async (c) => {
  const { productId, variantId = null, quantity } = c.req.valid('json');

  // 1. Validate product + stock
  let stockRow: { stock: number; price: number; name: string; image_url: string | null } | null;

  if (variantId) {
    stockRow = await c.env.DB.prepare(`
      SELECT pv.stock, (p.price + pv.price_adjust) as price, p.name,
             pi.url as image_url
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      WHERE pv.id = ? AND p.id = ? AND p.is_active = 1
    `).bind(variantId, productId)
      .first<{ stock: number; price: number; name: string; image_url: string | null }>();
  } else {
    stockRow = await c.env.DB.prepare(`
      SELECT p.stock, p.price, p.name, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
      WHERE p.id = ? AND p.is_active = 1
    `).bind(productId)
      .first<{ stock: number; price: number; name: string; image_url: string | null }>();
  }

  if (!stockRow) {
    return c.json({ success: false, error: 'Product not found', code: 'NOT_FOUND' }, 404);
  }

  if (stockRow.stock < quantity) {
    return c.json({
      success: false,
      error:   `Only ${stockRow.stock} unit(s) available`,
      code:    'INSUFFICIENT_STOCK',
    }, 409);
  }

  // 2. Load & mutate cart
  const key  = await resolveCartKey(c);
  const cart = await getCart(key, c.env.KV_CACHE);

  const idx = cart.items.findIndex(
    (i) => i.productId === productId && i.variantId === variantId,
  );

  if (idx >= 0) {
    // Update quantity — clamp to available stock
    const newQty = Math.min(cart.items[idx].quantity + quantity, stockRow.stock);
    cart.items[idx].quantity = newQty;
  } else {
    cart.items.push({
      productId,
      variantId: variantId ?? null,
      quantity,
      unitPrice:   stockRow.price,
      productName: stockRow.name,
      imageUrl:    stockRow.image_url,
    });
  }

  cart.subtotal = calcSubtotal(cart.items);
  await saveCart(key, cart, c.env.KV_CACHE);

  return c.json({ success: true, data: cart });
});

// ─── GET /api/cart — retrieve current cart ─────────────────
app.get('/', async (c) => {
  const key  = await resolveCartKey(c);
  const cart = await getCart(key, c.env.KV_CACHE);
  return c.json({ success: true, data: cart });
});

// ─── DELETE /api/cart/items/:productId — remove item ───────
app.delete('/items/:productId', async (c) => {
  const productId = c.req.param('productId');
  const variantId = c.req.query('variantId') ?? null;

  const key  = await resolveCartKey(c);
  const cart = await getCart(key, c.env.KV_CACHE);

  const before = cart.items.length;
  cart.items = cart.items.filter(
    (i) => !(i.productId === productId && i.variantId === variantId),
  );

  if (cart.items.length === before) {
    return c.json({ success: false, error: 'Item not found in cart', code: 'NOT_FOUND' }, 404);
  }

  cart.subtotal = calcSubtotal(cart.items);
  await saveCart(key, cart, c.env.KV_CACHE);

  return c.json({ success: true, data: cart });
});

// ─── DELETE /api/cart — clear entire cart ──────────────────
app.delete('/', async (c) => {
  const key = await resolveCartKey(c);
  await c.env.KV_CACHE.delete(key);
  return c.json({ success: true, data: { items: [], subtotal: 0 } });
});

export default app;
