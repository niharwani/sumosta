// ============================================================
// Razorpay Payment Service
// Uses Web Crypto API — compatible with Cloudflare Workers
// Docs: https://razorpay.com/docs/api/orders/
// ============================================================

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

interface CreateOrderResponse {
  id:        string;
  entity:    'order';
  amount:    number;
  amount_paid: number;
  amount_due:  number;
  currency:  string;
  receipt:   string | null;
  status:    'created' | 'attempted' | 'paid';
  attempts:  number;
  notes?:    Record<string, string>;
  created_at: number;
}

interface RazorpayErrorResponse {
  error: {
    code:        string;
    description: string;
    source?:     string;
    step?:       string;
    reason?:     string;
    metadata?:   unknown;
  };
}

async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Constant-time string compare to avoid timing attacks on signature verification.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export class RazorpayService {
  constructor(
    private keyId:     string,
    private keySecret: string,
  ) {}

  // ── Create an Order (server-side) — returns Razorpay order to pass to Checkout
  async createOrder(params: {
    amount:   number;                        // INR rupees (converted to paise here)
    currency?: string;                       // default INR
    receipt:  string;                        // <= 40 chars, our internal ref
    notes?:   Record<string, string>;
  }): Promise<CreateOrderResponse> {
    const amountPaise = Math.round(params.amount * 100);
    if (amountPaise < 100) {
      throw new Error('Amount must be at least 100 paise (₹1)');
    }

    const body = {
      amount:   amountPaise,
      currency: params.currency ?? 'INR',
      receipt:  params.receipt.slice(0, 40),
      notes:    params.notes ?? {},
    };

    const authHeader = 'Basic ' + btoa(`${this.keyId}:${this.keySecret}`);
    const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = (await res.json()) as RazorpayErrorResponse;
        msg = err.error?.description || err.error?.code || msg;
      } catch { /* fallthrough */ }
      throw new Error(`Razorpay order create failed: ${msg}`);
    }

    return (await res.json()) as CreateOrderResponse;
  }

  // ── Verify payment signature returned by Razorpay Checkout to the browser.
  // Algorithm: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, keySecret)
  async verifyPaymentSignature(params: {
    razorpayOrderId:   string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<boolean> {
    const expected = await hmacSha256Hex(
      this.keySecret,
      `${params.razorpayOrderId}|${params.razorpayPaymentId}`,
    );
    return timingSafeEqual(expected, params.razorpaySignature);
  }

  // ── Verify webhook signature (X-Razorpay-Signature) — same HMAC but over the raw body
  // with the webhook secret (NOT the API key secret).
  async verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): Promise<boolean> {
    const expected = await hmacSha256Hex(webhookSecret, rawBody);
    return timingSafeEqual(expected, signature);
  }
}
