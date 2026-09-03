import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware);

const SETTINGS_KEY = 'site:settings';
const SETTINGS_TTL = 60 * 60; // Cache for 1 hour

// Default settings shape
export interface DefaultPackage {
  length: number;   // cm
  breadth: number;  // cm
  height: number;   // cm  — also used as the max stack height per box
  weight: number;   // grams (per-parcel base weight, added on top of item weight)
}

export interface SiteSettings {
  // General
  siteName:              string;
  tagline:               string;
  supportEmail:          string;
  supportPhone:          string;
  announcementBar:       string;
  announcementBarActive: boolean;
  maintenanceMode:       boolean;
  socialLinks: {
    instagram: string;
    facebook:  string;
    twitter:   string;
    youtube:   string;
  };
  seo: {
    metaTitle:       string;
    metaDescription: string;
    ogImage:         string;
  };

  // Shipping
  freeShippingThreshold: number;
  defaultShippingRate:   number;
  taxRate:               number;
  pickupLocation:        string;      // Shiprocket pickup nickname
  defaultPackage:        DefaultPackage;
}

const DEFAULT_PACKAGE: DefaultPackage = {
  length: 15,
  breadth: 12,
  height: 30,   // 30 cm box height cap — jars stack to this then overflow
  weight: 100,  // 100 g packaging overhead
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName:              'SUMOSTA',
  tagline:               "Nature's Golden Promise",
  supportEmail:          'support@sumosta.com',
  supportPhone:          '',
  announcementBar:       'Free delivery on orders above ₹499 | Use WELCOME10 for 10% off your first order',
  announcementBarActive: true,
  maintenanceMode:       false,
  socialLinks: {
    instagram: 'https://instagram.com/sumosta',
    facebook:  '',
    twitter:   '',
    youtube:   '',
  },
  seo: {
    metaTitle:       'SUMOSTA — Pure Wild Forest Honey',
    metaDescription: "Single-origin wild forest honeys from India's most pristine ecosystems. NPOP & APEDA certified, cold-extracted, and completely unprocessed.",
    ogImage:         '/og-image.jpg',
  },
  freeShippingThreshold: 499,
  defaultShippingRate:   49,
  taxRate:               5,
  pickupLocation:        'Primary',
  defaultPackage:        DEFAULT_PACKAGE,
};

// ─── Zod schemas — one per endpoint ──────────────────────────
const generalSchema = z.object({
  siteName:              z.string().min(1).optional(),
  tagline:               z.string().optional(),
  supportEmail:          z.string().email().optional(),
  supportPhone:          z.string().optional(),
  announcementBar:       z.string().optional(),
  announcementBarActive: z.boolean().optional(),
  maintenanceMode:       z.boolean().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook:  z.string().optional(),
    twitter:   z.string().optional(),
    youtube:   z.string().optional(),
  }).optional(),
  seo: z.object({
    metaTitle:       z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage:         z.string().optional(),
  }).optional(),
}).partial();

const defaultPackageSchema = z.object({
  length:  z.number().min(1).max(200),
  breadth: z.number().min(1).max(200),
  height:  z.number().min(1).max(200),
  weight:  z.number().min(1).max(50_000),
});

const shippingSchema = z.object({
  freeShippingThreshold: z.number().min(0).optional(),
  defaultShippingRate:   z.number().min(0).optional(),
  taxRate:               z.number().min(0).max(100).optional(),
  pickupLocation:        z.string().min(1).optional(),
  defaultPackage:        defaultPackageSchema.optional(),
}).partial();

// Notifications — stub for now; accepted body is empty.
const notificationsSchema = z.object({}).partial();

// ─── Helpers ─────────────────────────────────────────────────
async function loadSettings(env: Bindings): Promise<SiteSettings> {
  const cached = await env.KV_CACHE.get(SETTINGS_KEY);
  if (!cached) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(cached) as Partial<SiteSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      socialLinks:    { ...DEFAULT_SETTINGS.socialLinks,    ...(parsed.socialLinks    ?? {}) },
      seo:            { ...DEFAULT_SETTINGS.seo,            ...(parsed.seo            ?? {}) },
      defaultPackage: { ...DEFAULT_SETTINGS.defaultPackage, ...(parsed.defaultPackage ?? {}) },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function persistSettings(env: Bindings, settings: SiteSettings): Promise<void> {
  await env.KV_CACHE.put(SETTINGS_KEY, JSON.stringify(settings), {
    expirationTtl: SETTINGS_TTL,
  });
}

// ─── GET /api/admin/settings ─────────────────────────────────
app.get('/', async (c) => {
  const settings = await loadSettings(c.env);
  return c.json({ success: true, data: settings });
});

// ─── PUT /api/admin/settings/general ─────────────────────────
app.put('/general', zValidator('json', generalSchema), async (c) => {
  const body = c.req.valid('json');
  const current = await loadSettings(c.env);

  const merged: SiteSettings = {
    ...current,
    ...body,
    socialLinks: { ...current.socialLinks, ...(body.socialLinks ?? {}) },
    seo:         { ...current.seo,         ...(body.seo         ?? {}) },
  };

  await persistSettings(c.env, merged);
  return c.json({ success: true, data: merged });
});

// ─── PUT /api/admin/settings/shipping ────────────────────────
app.put('/shipping', zValidator('json', shippingSchema), async (c) => {
  const body = c.req.valid('json');
  const current = await loadSettings(c.env);

  const merged: SiteSettings = {
    ...current,
    ...body,
    defaultPackage: {
      ...current.defaultPackage,
      ...(body.defaultPackage ?? {}),
    },
  };

  await persistSettings(c.env, merged);
  return c.json({ success: true, data: merged });
});

// ─── PUT /api/admin/settings/notifications ───────────────────
// Stub for future notification preferences (email templates, SMS on/off,
// etc.). Accepts an empty body today so the endpoint exists.
app.put('/notifications', zValidator('json', notificationsSchema), async (c) => {
  const current = await loadSettings(c.env);
  return c.json({ success: true, data: current });
});

export default app;
