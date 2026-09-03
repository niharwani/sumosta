// ============================================================
// Shiprocket API wrapper
// ------------------------------------------------------------
// Docs: https://apidocs.shiprocket.in
// Auth tokens are cached in KV (9-day TTL — Shiprocket's are valid
// for 10 days; the safety margin avoids a request racing an expiry).
// A 401 from any call transparently forces a re-login and retries once.
// ============================================================

const SHIPROCKET_BASE       = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_KV_KEY          = 'shiprocket:auth_token:v1';
const TOKEN_TTL_SEC         = 9 * 24 * 60 * 60;   // 9 days
const PICKUP_PINCODE_KV_KEY = 'shiprocket:pickup_pincode:v1';
const PICKUP_PINCODE_TTL    = 12 * 60 * 60;       // 12 hours

// ---- Types ------------------------------------------------------

export interface ShiprocketServiceabilityCourier {
  courier_company_id: number;
  courier_name:       string;
  freight_charge:     number;
  cod_charges:        number;
  estimated_delivery_days: string;
  rate:               number;
  is_surface:         number;
  cod:                0 | 1;
}

export interface ShiprocketServiceability {
  serviceable:      boolean;
  cod_available:    boolean;
  prepaid_available: boolean;
  recommended:      ShiprocketServiceabilityCourier | null;
  couriers:         ShiprocketServiceabilityCourier[];
  etd_days:         number | null;   // recommended courier's ETD
}

export interface ShiprocketAdhocOrderInput {
  order_id:        string;              // our order_number (must be unique)
  order_date:      string;              // "YYYY-MM-DD HH:mm"
  pickup_location: string;              // nickname
  billing_customer_name: string;
  billing_last_name:     string;
  billing_address:       string;
  billing_address_2?:    string | null;
  billing_city:          string;
  billing_pincode:       string;
  billing_state:         string;
  billing_country:       string;
  billing_email:         string;
  billing_phone:         string;
  shipping_is_billing:   boolean;
  order_items: Array<{
    name:          string;
    sku:           string;
    units:         number;
    selling_price: number;
    discount?:     number;
    tax?:          number;
    hsn?:          number;
  }>;
  payment_method:      'Prepaid' | 'COD';
  sub_total:           number;
  length:              number;   // cm
  breadth:             number;   // cm
  height:              number;   // cm
  weight:              number;   // kg
  shipping_charges?:   number;
  total_discount?:     number;
}

export interface ShiprocketAdhocOrderResponse {
  order_id:     number;   // Shiprocket's internal order id
  shipment_id:  number;
  status:       string;
  status_code:  number;
  onboarding_completed_now?: number;
  awb_code?:    string | null;
  courier_company_id?: number | null;
  courier_name?: string | null;
}

export interface ShiprocketAssignAwbResponse {
  awb_assign_status: number;
  response?: {
    data?: {
      awb_code:           string;
      courier_company_id: number;
      courier_name:       string;
      cod:                number;
      order_id:           number;
      shipment_id:        number;
    };
  };
  message?: string;
}

export interface ShiprocketTrackActivity {
  date:     string;
  status:   string;
  activity: string;
  location: string;
}

export interface ShiprocketPickupAddress {
  id?:              number;
  pickup_location:  string;   // nickname — matches SHIPROCKET_PICKUP_LOCATION
  name?:            string;
  email?:           string;
  phone?:           string | number;
  address?:         string;
  address_2?:       string;
  city?:            string;
  state?:           string;
  country?:         string;
  pin_code:         string | number;
  status?:          number;
}

export interface ShiprocketTrackData {
  track_status:      number;                    // 1 = success
  shipment_status:   number;
  shipment_track:    Array<{
    id:                     number;
    awb_code:               string;
    courier_company_id:     number;
    courier_name:           string;
    current_status:         string;
    delivered_to:           string;
    destination:            string;
    origin:                 string;
    edd:                    string | null;
  }>;
  shipment_track_activities: ShiprocketTrackActivity[];
  track_url?: string;
  etd?:       string;
}

// ---- Client -----------------------------------------------------

interface Env {
  KV_CACHE:            KVNamespace;
  SHIPROCKET_EMAIL:    string;
  SHIPROCKET_PASSWORD: string;
}

export function isShiprocketConfigured(env: {
  SHIPROCKET_EMAIL?: string;
  SHIPROCKET_PASSWORD?: string;
}): boolean {
  return !!(env.SHIPROCKET_EMAIL && env.SHIPROCKET_PASSWORD);
}

export class ShiprocketService {
  constructor(private env: Env) {}

  // ── Auth ────────────────────────────────────────────────
  private async login(): Promise<string> {
    const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email:    this.env.SHIPROCKET_EMAIL,
        password: this.env.SHIPROCKET_PASSWORD,
      }),
    });

    const body = await res.json() as { token?: string; message?: string };
    if (!res.ok || !body.token) {
      throw new Error(`Shiprocket login failed (${res.status}): ${body.message ?? 'no token'}`);
    }

    await this.env.KV_CACHE.put(TOKEN_KV_KEY, body.token, { expirationTtl: TOKEN_TTL_SEC });
    return body.token;
  }

  private async getToken(force = false): Promise<string> {
    if (!force) {
      const cached = await this.env.KV_CACHE.get(TOKEN_KV_KEY);
      if (cached) return cached;
    }
    return this.login();
  }

  // Wraps fetch with auth + one-shot retry on 401.
  private async request<T>(
    method: 'GET' | 'POST',
    path:   string,
    body?:  unknown,
  ): Promise<T> {
    const attempt = async (token: string): Promise<Response> => {
      return fetch(`${SHIPROCKET_BASE}${path}`, {
        method,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    };

    let token = await this.getToken();
    let res   = await attempt(token);

    if (res.status === 401) {
      token = await this.getToken(true);
      res   = await attempt(token);
    }

    const text = await res.text();
    let json: unknown;
    try { json = text ? JSON.parse(text) : {}; }
    catch { throw new Error(`Shiprocket ${path}: non-JSON response (${res.status})`); }

    if (!res.ok) {
      const message = (json as { message?: string; error?: string })?.message
                   ?? (json as { message?: string; error?: string })?.error
                   ?? `HTTP ${res.status}`;
      throw new Error(`Shiprocket ${path}: ${message}`);
    }

    return json as T;
  }

  // ── Serviceability ──────────────────────────────────────
  async checkServiceability(input: {
    pickupPincode:   string;
    deliveryPincode: string;
    weightKg:        number;
    cod:             boolean;
    declaredValue?:  number;
  }): Promise<ShiprocketServiceability> {
    const params = new URLSearchParams({
      pickup_postcode:   input.pickupPincode,
      delivery_postcode: input.deliveryPincode,
      weight:            input.weightKg.toString(),
      cod:               input.cod ? '1' : '0',
    });
    if (input.declaredValue !== undefined) {
      params.set('declared_value', input.declaredValue.toString());
    }

    const raw = await this.request<{
      status?: number;
      data?: {
        available_courier_companies?: ShiprocketServiceabilityCourier[];
        recommended_courier_company_id?: number;
      };
    }>('GET', `/courier/serviceability/?${params.toString()}`);

    const couriers = raw.data?.available_courier_companies ?? [];
    const recommendedId = raw.data?.recommended_courier_company_id;
    const recommended =
      couriers.find((c) => c.courier_company_id === recommendedId)
      ?? couriers[0]
      ?? null;

    return {
      serviceable:      couriers.length > 0,
      cod_available:    couriers.some((c) => c.cod === 1),
      prepaid_available: couriers.some((c) => c.cod === 0 || c.cod === 1),
      recommended,
      couriers,
      etd_days: recommended
        ? Number.parseInt(recommended.estimated_delivery_days, 10) || null
        : null,
    };
  }

  // ── Create adhoc order ──────────────────────────────────
  async createAdhocOrder(input: ShiprocketAdhocOrderInput): Promise<ShiprocketAdhocOrderResponse> {
    return this.request<ShiprocketAdhocOrderResponse>(
      'POST', '/orders/create/adhoc', input,
    );
  }

  // ── Assign AWB ──────────────────────────────────────────
  // If courierId is omitted, Shiprocket picks the recommended courier.
  async assignAwb(shipmentId: number, courierId?: number): Promise<ShiprocketAssignAwbResponse> {
    const body: Record<string, unknown> = { shipment_id: shipmentId };
    if (courierId) body.courier_id = courierId;
    return this.request<ShiprocketAssignAwbResponse>(
      'POST', '/courier/assign/awb', body,
    );
  }

  // ── Request pickup ──────────────────────────────────────
  async requestPickup(shipmentIds: number[]): Promise<{ pickup_status?: number; response?: unknown }> {
    return this.request<{ pickup_status?: number; response?: unknown }>(
      'POST', '/courier/generate/pickup', { shipment_id: shipmentIds },
    );
  }

  // ── Tracking ────────────────────────────────────────────
  async trackByAwb(awb: string): Promise<ShiprocketTrackData | null> {
    const raw = await this.request<{
      tracking_data?: ShiprocketTrackData & { error?: string };
    }>('GET', `/courier/track/awb/${encodeURIComponent(awb)}`);

    const data = raw.tracking_data;
    if (!data || (data as { error?: string }).error) return null;
    if (!data.shipment_track || data.shipment_track.length === 0) return null;
    return data;
  }

  async trackByShipmentId(shipmentId: number): Promise<ShiprocketTrackData | null> {
    const raw = await this.request<{
      tracking_data?: ShiprocketTrackData & { error?: string };
    }>('GET', `/courier/track/shipment/${shipmentId}`);
    const data = raw.tracking_data;
    if (!data || (data as { error?: string }).error) return null;
    if (!data.shipment_track || data.shipment_track.length === 0) return null;
    return data;
  }

  // ── Pickup address lookup ───────────────────────────────
  // Fetches the pincode of a saved pickup address by nickname. Cached in
  // KV so we don't hit Shiprocket on every serviceability call.
  async getPickupPincode(nickname: string): Promise<string | null> {
    const cacheKey = `${PICKUP_PINCODE_KV_KEY}:${nickname}`;
    const cached = await this.env.KV_CACHE.get(cacheKey);
    if (cached) return cached;

    const list = await this.listPickupLocations();
    const addr = list.find(
      (a) => a.pickup_location?.trim().toLowerCase() === nickname.trim().toLowerCase(),
    );
    if (!addr) return null;

    const pincode = String(addr.pin_code);
    await this.env.KV_CACHE.put(cacheKey, pincode, { expirationTtl: PICKUP_PINCODE_TTL });
    return pincode;
  }

  // Full list of saved pickup addresses. Not cached — admin refresh is
  // an explicit action.
  async listPickupLocations(): Promise<ShiprocketPickupAddress[]> {
    const raw = await this.request<{
      data?: {
        shipping_address?: ShiprocketPickupAddress[];
      };
    }>('GET', '/settings/company/pickup');
    return raw.data?.shipping_address ?? [];
  }

  // Verifies credentials by attempting a fresh login. Returns the token
  // issued time on success so the admin can see when auth last worked.
  async testConnection(): Promise<{ ok: true; authenticatedAt: string } | { ok: false; error: string }> {
    try {
      await this.login();
      return { ok: true, authenticatedAt: new Date().toISOString() };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Cancel ─────────────────────────────────────────────
  async cancelShipment(awbCodes: string[]): Promise<unknown> {
    return this.request<unknown>(
      'POST', '/orders/cancel/shipment/awbs', { awbs: awbCodes },
    );
  }

  async cancelOrder(orderIds: number[]): Promise<unknown> {
    return this.request<unknown>(
      'POST', '/orders/cancel', { ids: orderIds },
    );
  }
}
