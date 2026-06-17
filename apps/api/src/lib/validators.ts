// Re-export shared validators + add API-specific ones
export * from 'shared';

import { z } from 'zod';

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  sort:     z.enum(['featured', 'newest', 'price_asc', 'price_desc']).default('featured'),
  search:   z.string().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(12),
});
