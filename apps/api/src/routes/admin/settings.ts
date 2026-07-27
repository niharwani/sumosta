import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings } from '../../index';
import { adminMiddleware } from '../../middleware/admin';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', adminMiddleware as any);

const SETTINGS_KEY = 'site:settings';
const SETTINGS_TTL = 60 * 60; // Cache for 1 hour

// Default settings shape
interface SiteSettings {
  siteName:              string;
  tagline:               string;
  supportEmail:          string;
  supportPhone:          string;
  announcementBar:       string;
  announcementBarActive: boolean;
  freeShippingThreshold: number;
  defaultShippingRate:   number;
  taxRate:               number;
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
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName:              'SUMOSTA',
  tagline:               "Nature's Golden Promise",
  supportEmail:          'support@sumosta.com',
  supportPhone:          '',
  announcementBar:       'Free delivery on orders above ₹499 | Use WELCOME10 for 10% off your first order',
  announcementBarActive: true,
  freeShippingThreshold: 499,
  defaultShippingRate:   49,
  taxRate:               5,
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
};

const settingsSchema = z.object({
  siteName:              z.string().min(1).optional(),
  tagline:               z.string().optional(),
  supportEmail:          z.string().email().optional(),
  supportPhone:          z.string().optional(),
  announcementBar:       z.string().optional(),
  announcementBarActive: z.boolean().optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  defaultShippingRate:   z.number().min(0).optional(),
  taxRate:               z.number().min(0).max(100).optional(),
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

// ─── GET /api/admin/settings ─────────────────────────────────
app.get('/', async (c) => {
  const cached = await c.env.KV_CACHE.get(SETTINGS_KEY);
  const settings: SiteSettings = cached
    ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) }
    : DEFAULT_SETTINGS;

  return c.json({ success: true, data: settings });
});

// ─── PUT /api/admin/settings ─────────────────────────────────
app.put('/', zValidator('json', settingsSchema), async (c) => {
  const body = c.req.valid('json');

  // Load existing settings to merge
  const cached  = await c.env.KV_CACHE.get(SETTINGS_KEY);
  const current = cached
    ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) }
    : { ...DEFAULT_SETTINGS };

  // Deep-merge social links and SEO
  const merged: SiteSettings = {
    ...current,
    ...body,
    socialLinks: { ...current.socialLinks, ...(body.socialLinks ?? {}) },
    seo:         { ...current.seo,         ...(body.seo         ?? {}) },
  };

  await c.env.KV_CACHE.put(SETTINGS_KEY, JSON.stringify(merged), {
    expirationTtl: SETTINGS_TTL,
  });

  return c.json({ success: true, data: merged });
});

export default app;
