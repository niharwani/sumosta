// Admin-side auth helpers.
// The admin panel stores access + refresh tokens in localStorage (unlike
// the customer flow, which keeps the access token in memory only).
// These helpers give admin pages a way to make authenticated requests
// with automatic /api/auth/refresh on 401, and to redirect to the admin
// login when the session is definitively unusable.

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const ACCESS_KEY  = 'sumosta_access_token';
const REFRESH_KEY = 'sumosta_refresh_token';
const USER_ID_KEY = 'sumosta_user_id';

function readAccess(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

function readRefresh(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function writeSession(access: string, refresh: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

// Shared refresh promise so concurrent 401s only trigger one /refresh call.
let refreshInflight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (refreshInflight) return refreshInflight;
  const token = readRefresh();
  if (!token) return null;
  refreshInflight = (async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ refreshToken: token }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const newAccess  = json?.data?.accessToken as string | undefined;
      const newRefresh = json?.data?.refreshToken as string | undefined;
      const userId     = json?.data?.user?.id as string | undefined;
      if (!newAccess || !newRefresh) return null;
      writeSession(newAccess, newRefresh, userId);
      return newAccess;
    } catch {
      return null;
    } finally {
      queueMicrotask(() => { refreshInflight = null; });
    }
  })();
  return refreshInflight;
}

interface AdminFetchInit extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  /** Skip 401 auto-refresh — used internally by refresh itself. */
  _skipAuthRetry?: boolean;
}

/**
 * fetch() wrapper for admin API calls. Sets the Authorization header from
 * localStorage, and on 401 attempts /api/auth/refresh once before retrying.
 * If the refresh call fails, clears the session and dispatches a
 * `sumosta:admin-auth-expired` event that AdminAuthGuard listens for.
 */
export async function adminFetch(url: string, init: AdminFetchInit = {}): Promise<Response> {
  const { _skipAuthRetry, headers: initHeaders, ...rest } = init;

  const build = (): Record<string, string> => {
    const h: Record<string, string> = {};
    // For multipart/form-data uploads we MUST NOT set Content-Type — the
    // browser needs to generate its own boundary. Only default to JSON
    // when the caller isn't handing us a FormData body.
    if (!(rest.body instanceof FormData)) {
      h['Content-Type'] = 'application/json';
    }
    const token = readAccess();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return { ...h, ...(initHeaders ?? {}) };
  };

  const doFetch = () =>
    fetch(url, {
      ...rest,
      credentials: 'include',
      headers:     build(),
    });

  let res = await doFetch();

  if (res.status === 401 && !_skipAuthRetry) {
    const newToken = await doRefresh();
    if (!newToken) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sumosta:admin-auth-expired'));
      }
      return res; // return original 401 so callers can react if they want
    }
    res = await doFetch();
  }

  return res;
}

/** Convenience wrapper that parses JSON and returns the `data` payload. */
export async function adminJson<T = unknown>(
  url: string,
  init: AdminFetchInit = {},
): Promise<T> {
  const res = await adminFetch(url, init);
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    const err = new Error(json?.error ?? `Request failed (${res.status})`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = res.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).code   = json?.code;
    throw err;
  }
  return (json?.data ?? json) as T;
}

/**
 * Proactively validate the current admin session by calling /api/auth/me.
 * Returns the user object on success, null on failure (already cleared).
 * Used by AdminAuthGuard on mount before rendering the panel.
 */
export async function validateAdminSession(): Promise<{
  id: string; email: string; name: string; role: string;
} | null> {
  const token = readAccess();
  if (!token) return null;

  const res = await adminFetch(`${API}/api/auth/me`);
  if (!res.ok) return null;
  const json = await res.json();
  const user = json?.data;
  if (!user) return null;
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    clearSession();
    return null;
  }
  return user;
}

export { clearSession as clearAdminSession, writeSession as writeAdminSession };
