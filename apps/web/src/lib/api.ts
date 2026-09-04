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
  /** Skip 401 auto-refresh + retry (used by refresh() itself to avoid loops). */
  _skipAuthRetry?: boolean;
}

// ─── Access-token accessor (lazy import to sidestep circular deps) ────
function readAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // Dynamic require — the store lives in the same package
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('@/stores/auth-store');
    return useAuthStore.getState().accessToken ?? null;
  } catch {
    return null;
  }
}

function readUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('@/stores/auth-store');
    const state = useAuthStore.getState();
    return state.user?.id ?? localStorage.getItem('sumosta_user_id') ?? null;
  } catch {
    return null;
  }
}

function readRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('@/stores/auth-store');
    const inStore = useAuthStore.getState().refreshToken ?? null;
    if (inStore) return inStore;
  } catch {
    /* store unavailable, fall through */
  }
  // Fallback for the very first /refresh call after a hard reload, or when the
  // store hasn't hydrated yet — localStorage is written by auth-store on login.
  try {
    return localStorage.getItem('sumosta_refresh_token');
  } catch {
    return null;
  }
}

// ─── Deduped refresh promise (concurrent 401s share one refresh call) ─
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refreshPromise: Promise<any> | null = null;

function dispatchAuthExpired(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('sumosta:auth-expired'));
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, _skipAuthRetry, ...rest } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) search.set(k, String(v));
    }
    if (search.size > 0) url += `?${search.toString()}`;
  }

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = readAccessToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const doFetch = async (): Promise<Response> =>
    fetch(url, {
      ...rest,
      credentials: 'include', // send/receive httpOnly cookies (refresh token)
      headers: { ...buildHeaders(), ...(rest.headers as Record<string, string> | undefined) },
      body:    body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch();

  // ─── 401 auto-refresh + single retry ───────────────────────────────
  if (response.status === 401 && !_skipAuthRetry) {
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            return await authApi.refresh();
          } finally {
            // Clear on next tick so pending awaits still see this promise
            queueMicrotask(() => { refreshPromise = null; });
          }
        })();
      }
      const refreshed = await refreshPromise;

      // Update the store with the new session
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useAuthStore } = require('@/stores/auth-store');
        useAuthStore.getState().login(
          refreshed.user,
          refreshed.accessToken,
          refreshed.refreshToken,
        );
      } catch {
        /* store not available — proceed anyway */
      }

      // Retry the original request once
      response = await doFetch();
    } catch {
      dispatchAuthExpired();
      throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
    }
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const asRecord = (data ?? {}) as Record<string, unknown>;

  if (!response.ok || asRecord.success === false) {
    throw new ApiError(
      (asRecord.code as string) ?? 'UNKNOWN',
      (asRecord.error as string) ?? 'An error occurred',
      response.status,
    );
  }

  return (asRecord.data as T);
}

// ============================================================
// PRODUCTS
// ============================================================
import { STATIC_PRODUCTS, STATIC_CATEGORIES, MOCK_REVIEWS, STATIC_COMBOS, type BatchCertificate } from './content';
import type { Product } from 'shared';

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
import type { User } from 'shared';

export interface CheckoutAutofillAddress {
  id:             string;
  name:           string;
  phone:          string;
  address_line1:  string;
  address_line2:  string | null;
  city:           string;
  state:          string;
  pincode:        string;
  is_default:     number;
}

interface AuthSession {
  user:           User;
  accessToken:    string;
  refreshToken:   string;
  /** Populated only by /firebase-phone/verify — the user's default saved address. */
  defaultAddress?: CheckoutAutofillAddress | null;
}

export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    request<AuthSession>('/api/auth/register', {
      method: 'POST',
      body:   data,
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body:   data,
    }),

  me: () => request<User>('/api/auth/me'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    request<{ user: User }>('/api/auth/me', {
      method: 'PATCH',
      body:   data,
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: true }>('/api/auth/me/password', {
      method: 'PATCH',
      body:   data,
    }),

  logout: () => {
    const userId       = readUserId();
    const refreshToken = readRefreshToken();
    return request<null>('/api/auth/logout', {
      method: 'POST',
      body:   { userId, refreshToken },
      _skipAuthRetry: true,
    });
  },

  forgotPassword: (data: { email: string }) =>
    request<{ message: string } | { success: true }>('/api/auth/forgot-password', {
      method: 'POST',
      body:   data,
    }),

  resetPassword: (data: { token: string; password: string }) =>
    request<{ success: true }>('/api/auth/reset-password', {
      method: 'POST',
      body:   data,
    }),

  refresh: () => {
    const userId       = readUserId();
    const refreshToken = readRefreshToken();
    // Cookie is preferred; body is a fallback (works even when the
    // browser did not send the httpOnly cookie — e.g. cross-site dev)
    return request<AuthSession>('/api/auth/refresh', {
      method: 'POST',
      body:   { userId, refreshToken },
      _skipAuthRetry: true,
    });
  },

  exchangeSession: (data: { code: string }) =>
    request<AuthSession>('/api/auth/session-exchange', {
      method: 'POST',
      body:   data,
      _skipAuthRetry: true,
    }),

  firebasePhoneVerify: (data: { idToken: string }) =>
    request<AuthSession>('/api/auth/firebase-phone/verify', {
      method: 'POST',
      body:   data,
      _skipAuthRetry: true,
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
export interface TrackingActivity {
  date:     string;
  status:   string;
  activity: string;
  location: string;
}

export interface TrackingResponse {
  awb_code:        string | null;
  courier_name:    string | null;
  current_status:  string | null;
  edd:             string | null;
  tracking_url:    string | null;
  origin:          string | null;
  destination:     string | null;
  activities:      TrackingActivity[];
  awb_pending:     boolean;
}

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    request<{
      orders: any[];
      total: number;
      page: number;
      totalPages: number;
    }>('/api/orders', { params: params as Record<string, string | number | undefined> }),
  get: (id: string) => request<any>(`/api/orders/${id}`),
  cancel: (id: string) =>
    request<{ success: true }>(`/api/orders/${id}/cancel`, { method: 'POST' }),
  receipt: (id: string, email: string) =>
    request<any>(`/api/orders/${id}/receipt`, { params: { email } }),
  tracking: (id: string) =>
    request<TrackingResponse>(`/api/orders/${id}/tracking`),
  trackingByNumber: (orderNumber: string, email: string) =>
    request<TrackingResponse>('/api/orders/track/live', {
      params: { orderNumber, email },
    }),
};

// ============================================================
// ADDRESSES
// ============================================================
export interface Address {
  id:             string;
  user_id:        string;
  name:           string;
  phone:          string;
  address_line1:  string;
  address_line2:  string | null;
  city:           string;
  state:          string;
  pincode:        string;
  is_default:     number | boolean;
  created_at:     string;
}

export interface AddressInput {
  name:          string;
  phone:         string;
  addressLine1:  string;
  addressLine2?: string;
  city:          string;
  state:         string;
  pincode:       string;
  isDefault?:    boolean;
}

export const addressesApi = {
  list: () => request<Address[]>('/api/addresses'),
  create: (data: AddressInput) =>
    request<Address>('/api/addresses', { method: 'POST', body: data }),
  update: (id: string, data: AddressInput) =>
    request<Address>(`/api/addresses/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) =>
    request<{ success: true }>(`/api/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id: string) =>
    request<{ success: true }>(`/api/addresses/${id}/default`, { method: 'POST' }),
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
  validate: async (
    code: string,
    cartTotal: number,
    cartItems?: { name: string; quantity: number }[],
  ) => {
    try {
      return await request<{ valid: boolean; discount?: number; coupon?: any; error?: string }>(
        '/api/coupons/validate',
        { method: 'POST', body: { code: code.toUpperCase(), cartTotal, cartItems } },
      );
    } catch (err: any) {
      return { valid: false as const, error: err?.message ?? 'Failed to validate coupon' };
    }
  },

  firstOrderEligible: () =>
    request<{ eligible: boolean; reason: 'guest' | 'new_customer' | 'returning_customer' }>(
      '/api/coupons/first-order-eligible',
    ),
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
