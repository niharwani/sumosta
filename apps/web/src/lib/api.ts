const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, ...rest } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) search.set(k, String(v));
    }
    if (search.size > 0) url += `?${search.toString()}`;
  }

  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('sumosta_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const sessionId =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('sumosta_session') ?? '')
      : '';

  if (sessionId) headers['X-Session-ID'] = sessionId;

  const response = await fetch(url, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> | undefined) },
    body:    body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new ApiError(
      (data as any).code ?? 'UNKNOWN',
      (data as any).error ?? 'An error occurred',
      response.status,
    );
  }

  return data.data as T;
}

// ============================================================
// PRODUCTS
// ============================================================
import { STATIC_PRODUCTS, STATIC_CATEGORIES, MOCK_REVIEWS, STATIC_COMBOS, type BatchCertificate } from './content';
import type { Product, Category } from 'shared';

// Formatted combos as virtual products to support shop page category filters
const COMBO_PRODUCTS_MAPPED: (Product & {
  comingSoon?: boolean;
  sourcingStory?: string;
  nutritionalBenefits?: string[];
  batchCertificate?: BatchCertificate;
})[] = STATIC_COMBOS.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  sku: c.id,
  categoryId: 'gift-boxes',
  category: {
    id: 'gift-boxes',
    name: 'Gift Boxes & Combos',
    slug: 'gift-boxes',
    description: 'SUMOSTA curated forest honey combinations and gifting sets.',
    imageUrl: null,
    sortOrder: 5,
  },
  shortDescription: c.description,
  description: c.description,
  price: c.price,
  compareAtPrice: c.compareAtPrice,
  costPrice: null,
  stock: 50,
  lowStockThreshold: 2,
  weight: 1500,
  tags: ['combo', 'gifting', 'giftbox', 'organic'],
  isFeatured: true,
  isActive: true,
  metaTitle: c.name,
  metaDescription: c.description,
  images: [
    {
      id: `img_${c.id}`,
      url: c.image,
      altText: c.name,
      sortOrder: 1,
      isPrimary: true,
    },
  ],
  variants: c.variants ?? [],
  averageRating: 4.8,
  reviewCount: 15,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
  comingSoon: false,
  batchCertificate: undefined,
  sourcingStory: 'A beautifully packaged curation of our finest wild forest honeys. Perfect for gifting wellness to loved ones.',
  nutritionalBenefits: [
    'Verifiably pure wild honey assortments.',
    'Packaged in organic premium gift settings.',
    'Provides diverse nutritional profiles in one set.'
  ],
}));

export const productsApi = {
  list: async (params?: {
    category?: string;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 100));

    // Combine standard products and virtual combo products
    let list = [...STATIC_PRODUCTS, ...COMBO_PRODUCTS_MAPPED];

    // Filter by Category
    if (params?.category) {
      const cat = params.category;
      if (cat === 'raw-honey') {
        list = list.filter((p) => p.category?.slug === 'raw-honey');
      } else if (cat === 'honey-sticks') {
        // Map Honey Sticks to Proprietary Superfoods infusion category
        list = list.filter((p) => p.category?.slug === 'superfoods');
      } else if (cat === 'honey-spreads') {
        // Map Honey Spreads to Spreads category
        list = list.filter((p) => p.category?.slug === 'spreads');
      } else if (cat === 'gift-boxes') {
        list = list.filter((p) => p.categoryId === 'gift-boxes');
      } else {
        list = list.filter((p) => p.category?.slug === cat || p.categoryId === cat);
      }
    }

    // Filter by Search
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort
    const sort = params?.sort ?? 'featured';
    if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured - show active/featured first
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // Pagination
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
      page,
      totalPages,
    };
  },

  get: async (slug: string) => {
    await new Promise((r) => setTimeout(r, 50));
    const all = [...STATIC_PRODUCTS, ...COMBO_PRODUCTS_MAPPED];
    const product = all.find((p) => p.slug === slug || p.id === slug);
    if (!product) {
      throw new ApiError('NOT_FOUND', 'Product not found', 404);
    }
    // Attach reviews
    const reviews = MOCK_REVIEWS[product.id] ?? [];
    return {
      ...product,
      reviews,
      relatedProducts: all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4)
    };
  },
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesApi = {
  list: async () => {
    await new Promise((r) => setTimeout(r, 50));
    return Object.values(STATIC_CATEGORIES);
  },
  get: async (slug: string) => {
    await new Promise((r) => setTimeout(r, 50));
    const cat = STATIC_CATEGORIES[slug] || Object.values(STATIC_CATEGORIES).find(c => c.id === slug);
    if (!cat) throw new ApiError('NOT_FOUND', 'Category not found', 404);
    return cat;
  },
};

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    request<{ user: any; accessToken: string; refreshToken: string }>('/api/auth/register', {
      method: 'POST',
      body:   data,
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: any; accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body:   data,
    }),

  me: () => request<any>('/api/auth/me'),

  logout: (data: { userId: string; refreshToken: string }) =>
    request<null>('/api/auth/logout', { method: 'POST', body: data }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body:   { email },
    }),

  refresh: (data: { userId: string; refreshToken: string }) =>
    request<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body:   data,
    }),
};

// ============================================================
// CART
// ============================================================
export const cartApi = {
  get: () => request<any>('/api/cart'),

  addItem: (data: { productId: string; variantId?: string; quantity: number }) =>
    request<any>('/api/cart/items', { method: 'POST', body: data }),

  removeItem: (productId: string, variantId?: string) =>
    request<any>(`/api/cart/items/${productId}${variantId ? `?variantId=${variantId}` : ''}`, {
      method: 'DELETE',
    }),
};

export const checkoutApi = {
  create: async (data: {
    email: string;
    phone: string;
    shippingAddress: any;
    couponCode?: string;
  }) => {
    // Simulate payment gateway connection
    await new Promise((r) => setTimeout(r, 1500));
    
    // Generate a mock order reference
    const orderId = 'SMS-' + Math.floor(100000 + Math.random() * 900000);
    return {
      orderId,
      paymentUrl: `/order-confirmation/${orderId}/?email=${encodeURIComponent(data.email)}`,
      merchantTransactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
    };
  },
};

// ============================================================
// ORDERS
// ============================================================
export const ordersApi = {
  list:   (params?: { page?: number; limit?: number }) =>
    request<any>('/api/orders', { params: params as any }),
  get:    (id: string) => request<any>(`/api/orders/${id}`),
};

// ============================================================
// REVIEWS
// ============================================================
export const reviewsApi = {
  list: (productId: string) =>
    request<any[]>('/api/reviews', { params: { productId } }),

  create: (data: { productId: string; rating: number; title: string; body: string }) =>
    request<any>('/api/reviews', { method: 'POST', body: data }),
};

export const couponsApi = {
  validate: async (code: string, cartTotal: number) => {
    await new Promise((r) => setTimeout(r, 150));
    const c = code.toUpperCase();

    if (c === 'WELCOME10') {
      if (cartTotal < 499) {
        return { valid: false, error: 'Minimum order amount for WELCOME10 is ₹499' };
      }
      const discount = Math.round(cartTotal * 0.1);
      return {
        valid: true,
        discount,
        coupon: { id: 'coup_w10', code: 'WELCOME10', type: 'percentage' as const, value: 10, minOrderAmount: 499, maxUsage: null, usageCount: 0, isFirstOrderOnly: true, isActive: true, expiresAt: null },
      };
    }

    if (c === 'COMBO10') {
      if (cartTotal < 499) {
        return { valid: false, error: 'Minimum order amount for COMBO10 is ₹499' };
      }
      const discount = Math.round(cartTotal * 0.1);
      return {
        valid: true,
        discount,
        coupon: { id: 'coup_c10', code: 'COMBO10', type: 'percentage' as const, value: 10, minOrderAmount: 499, maxUsage: null, usageCount: 0, isFirstOrderOnly: false, isActive: true, expiresAt: null },
      };
    }

    if (c === 'PREPAID5') {
      if (cartTotal < 299) {
        return { valid: false, error: 'Minimum order amount for PREPAID5 is ₹299' };
      }
      const discount = Math.round(cartTotal * 0.05);
      return {
        valid: true,
        discount,
        coupon: { id: 'coup_p5', code: 'PREPAID5', type: 'percentage' as const, value: 5, minOrderAmount: 299, maxUsage: null, usageCount: 0, isFirstOrderOnly: false, isActive: true, expiresAt: null },
      };
    }

    if (c === 'FREE49') {
      if (cartTotal < 299) {
        return { valid: false, error: 'Minimum order amount for FREE49 is ₹299' };
      }
      return {
        valid: true,
        discount: 49,
        coupon: { id: 'coup_49', code: 'FREE49', type: 'fixed' as const, value: 49, minOrderAmount: 299, maxUsage: null, usageCount: 0, isFirstOrderOnly: false, isActive: true, expiresAt: null },
      };
    }

    return { valid: false, error: 'Invalid coupon code. Try WELCOME10 or COMBO10!' };
  },
};

// ============================================================
// NEWSLETTER
// ============================================================
export const newsletterApi = {
  subscribe: (email: string, source?: string) =>
    request<{ message: string }>('/api/newsletter', {
      method: 'POST',
      body:   { email, source },
    }),
};

// ============================================================
// CONTACT
// ============================================================
export const contactApi = {
  send: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ message: string }>('/api/contact', { method: 'POST', body: data }),
};

// ============================================================
// ANALYTICS
// ============================================================
export const analyticsApi = {
  track: (events: any[]) =>
    request<null>('/api/analytics/event', {
      method: 'POST',
      body:   { events },
    }),
};

export { ApiError };
