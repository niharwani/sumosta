// ============================================================
// Admin shipping status + pickup lookups
// ------------------------------------------------------------
// Used by the admin shipping settings page to:
//   1. Verify Shiprocket credentials are working (test-connection button)
//   2. Fetch the live list of saved pickup addresses so the admin
//      can pick a nickname from a dropdown instead of typing it.
// ============================================================

import { Hono } from 'hono';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';
import { ShiprocketService, isShiprocketConfigured } from '../../services/shiprocket';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware);

const LAST_AUTH_KV_KEY = 'shiprocket:last_auth_at:v1';

// ─── GET /api/admin/shipping/status ──────────────────────────
// Pings Shiprocket auth. Response:
//   { configured, connected, email, pickupLocation, lastAuthenticatedAt, error? }
app.get('/status', async (c) => {
  const email          = c.env.SHIPROCKET_EMAIL || '';
  const pickupLocation = c.env.SHIPROCKET_PICKUP_LOCATION || '';

  if (!isShiprocketConfigured(c.env)) {
    return c.json({
      success: true,
      data: {
        configured:            false,
        connected:             false,
        email:                 '',
        pickupLocation,
        lastAuthenticatedAt:   null,
        error:                 'SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD not set',
      },
    });
  }

  const sr     = new ShiprocketService(c.env);
  const result = await sr.testConnection();

  let lastAuthenticatedAt: string | null = null;
  if (result.ok) {
    lastAuthenticatedAt = result.authenticatedAt;
    await c.env.KV_CACHE.put(LAST_AUTH_KV_KEY, lastAuthenticatedAt);
  } else {
    lastAuthenticatedAt = await c.env.KV_CACHE.get(LAST_AUTH_KV_KEY);
  }

  return c.json({
    success: true,
    data: {
      configured:          true,
      connected:           result.ok,
      email,
      pickupLocation,
      lastAuthenticatedAt,
      error:               result.ok ? null : result.error,
    },
  });
});

// ─── GET /api/admin/shipping/pickup-locations ────────────────
// Returns the list of pickup addresses saved in Shiprocket.
app.get('/pickup-locations', async (c) => {
  if (!isShiprocketConfigured(c.env)) {
    return c.json({
      success: false,
      error:   'Shiprocket not configured',
      code:    'SHIPROCKET_NOT_CONFIGURED',
    }, 400);
  }

  try {
    const sr   = new ShiprocketService(c.env);
    const list = await sr.listPickupLocations();

    // Return only fields the admin UI cares about.
    const data = list.map((a) => ({
      nickname: a.pickup_location,
      name:     a.name       ?? '',
      city:     a.city       ?? '',
      state:    a.state      ?? '',
      pincode:  String(a.pin_code ?? ''),
      phone:    a.phone ? String(a.phone) : '',
    }));

    return c.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch pickup locations';
    return c.json({ success: false, error: message, code: 'SHIPROCKET_ERROR' }, 502);
  }
});

export default app;
