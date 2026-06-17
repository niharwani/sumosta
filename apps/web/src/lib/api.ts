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
export const productsApi = {
  list: (params?: {
    category?: string;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => request<{ products: any[]; total: number; page: number; totalPages: number }>(
    '/api/products',
    { params: params as any },
  ),

  get: (slug: string) => request<any>(`/api/products/${slug}`),
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesApi = {
  list: () => request<any[]>('/api/categories'),
  get:  (slug: string) => request<any>(`/api/categories/${slug}`),
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

// ============================================================
// CHECKOUT
// ============================================================
export const checkoutApi = {
  create: (data: {
    email: string;
    phone: string;
    shippingAddress: any;
    couponCode?: string;
  }) =>
    request<{ orderId: string; paymentUrl: string; merchantTransactionId: string }>(
      '/api/checkout',
      { method: 'POST', body: data },
    ),
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

// ============================================================
// COUPONS
// ============================================================
export const couponsApi = {
  validate: (code: string, cartTotal: number) =>
    request<{ valid: boolean; discount?: number; coupon?: any; error?: string }>(
      '/api/coupons/validate',
      { method: 'POST', body: { code, cartTotal } },
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
