import { z } from 'zod';

// ============================================================
// AUTH
// ============================================================

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  phone:    z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ============================================================
// ADDRESS
// ============================================================

export const addressSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  phone:        z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, 'City is required'),
  state:        z.string().min(2, 'State is required'),
  pincode:      z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault:    z.boolean().optional(),
});

// ============================================================
// CHECKOUT
// ============================================================

export const checkoutSchema = z.object({
  email:           z.string().email('Invalid email address'),
  phone:           z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  shippingAddress: addressSchema,
  couponCode:      z.string().optional(),
});

// ============================================================
// PRODUCT (admin)
// ============================================================

export const productSchema = z.object({
  name:             z.string().min(2, 'Product name is required'),
  slug:             z.string().min(2, 'Slug is required'),
  sku:              z.string().min(1, 'SKU is required'),
  categoryId:       z.string().min(1, 'Category is required'),
  shortDescription: z.string().max(200, 'Max 200 characters').optional().default(''),
  description:      z.string().optional().default(''),
  price:            z.number().positive('Price must be positive'),
  compareAtPrice:   z.number().positive().nullable().optional(),
  costPrice:        z.number().positive().nullable().optional(),
  stock:            z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight:           z.number().positive().nullable().optional(),
  tags:             z.array(z.string()).default([]),
  isFeatured:       z.boolean().default(false),
  isActive:         z.boolean().default(true),
  metaTitle:        z.string().max(60).nullable().optional(),
  metaDescription:  z.string().max(160).nullable().optional(),
});

// ============================================================
// REVIEW
// ============================================================

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().min(2).max(100),
  body:      z.string().min(10).max(2000),
});

// ============================================================
// COUPON (admin)
// ============================================================

export const couponSchema = z.object({
  code:             z.string().min(3).max(20).toUpperCase(),
  type:             z.enum(['percentage', 'fixed']),
  value:            z.number().positive(),
  minOrderAmount:   z.number().positive().nullable().optional(),
  maxUsage:         z.number().int().positive().nullable().optional(),
  isFirstOrderOnly: z.boolean().default(false),
  isActive:         z.boolean().default(true),
  expiresAt:        z.string().datetime().nullable().optional(),
});

// ============================================================
// CONTACT
// ============================================================

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name is required'),
  email:   z.string().email('Invalid email'),
  phone:   z.string().regex(/^\d{10}$/).optional(),
  subject: z.string().min(3).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// ============================================================
// NEWSLETTER
// ============================================================

export const newsletterSchema = z.object({
  email:  z.string().email('Invalid email address'),
  source: z.string().optional(),
});

// ============================================================
// ANALYTICS EVENT
// ============================================================

export const analyticsEventSchema = z.object({
  events: z.array(z.object({
    eventType: z.string(),
    eventData: z.record(z.unknown()),
    pageUrl:   z.string(),
    sessionId: z.string(),
    timestamp: z.number(),
    referrer:  z.string().optional(),
  })),
});

export type RegisterInput       = z.infer<typeof registerSchema>;
export type LoginInput          = z.infer<typeof loginSchema>;
export type AddressInput        = z.infer<typeof addressSchema>;
export type CheckoutInput       = z.infer<typeof checkoutSchema>;
export type ProductInput        = z.infer<typeof productSchema>;
export type ReviewInput         = z.infer<typeof reviewSchema>;
export type CouponInput         = z.infer<typeof couponSchema>;
export type ContactInput        = z.infer<typeof contactSchema>;
export type NewsletterInput     = z.infer<typeof newsletterSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
