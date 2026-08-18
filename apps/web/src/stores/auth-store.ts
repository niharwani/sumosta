import { create } from 'zustand';
import type { User } from 'shared';
import { authApi, ApiError } from '@/lib/api';

const USER_ID_KEY       = 'sumosta_user_id';
const REFRESH_TOKEN_KEY = 'sumosta_refresh_token';

interface AuthState {
  user:          User | null;
  accessToken:   string | null;   // in-memory only
  refreshToken:  string | null;   // in-memory only (cookie is source of truth)
  isLoading:     boolean;
  isInitialized: boolean;
}

interface AuthActions {
  login:      (user: User, accessToken: string, refreshToken: string) => void;
  logout:     () => Promise<void>;
  setUser:    (user: User) => void;
  setTokens:  (accessToken: string, refreshToken: string) => void;
  initAuth:   () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user:          null,
  accessToken:   null,
  refreshToken:  null,
  isLoading:     false,
  isInitialized: false,

  // ─── login ─────────────────────────────────────────────────────────
  // The refresh cookie is our primary session mechanism, but browsers that
  // block third-party cookies (Safari ITP, Firefox strict mode, Chrome's
  // upcoming 3P cookie phase-out) will silently drop it since the frontend
  // (.pages.dev) and API (.workers.dev) live on different eTLD+1s. As a
  // fallback we persist the raw refresh token in localStorage so /refresh
  // can still find it via the request body. The cookie is preferred at
  // the API side; localStorage is only used when the cookie isn't sent.
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ID_KEY, user.id);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({ user, accessToken, refreshToken });
  },

  // ─── logout ────────────────────────────────────────────────────────
  logout: async () => {
    try {
      // Best-effort: revoke refresh token server-side (and clear cookie)
      await authApi.logout().catch(() => { /* swallow — always clear locally */ });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      set({ user: null, accessToken: null, refreshToken: null });
    }
  },

  setUser: (user) => set({ user }),

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

  // ─── initAuth ──────────────────────────────────────────────────────
  // Runs once on app mount. Uses the httpOnly refresh cookie (sent
  // automatically) to obtain a fresh access token + user profile.
  initAuth: async () => {
    if (typeof window === 'undefined') return;

    if (get().isInitialized) return;

    const storedUserId       = localStorage.getItem(USER_ID_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedUserId) {
      set({ isInitialized: true });
      return;
    }

    // Hydrate the in-memory refresh token from localStorage so /refresh
    // can send it in the body when the httpOnly cookie is blocked (Safari
    // and other third-party-cookie-blocking browsers).
    if (storedRefreshToken) {
      set({ refreshToken: storedRefreshToken });
    }

    set({ isLoading: true });

    // Bound the /refresh call so a hung network never leaves the app stuck
    // on the "Loading your account..." loader.
    const REFRESH_TIMEOUT_MS = 8000;

    try {
      const session = await Promise.race([
        authApi.refresh(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('refresh_timeout')), REFRESH_TIMEOUT_MS),
        ),
      ]);
      // eslint-disable-next-line no-console
      console.info('[auth] initAuth: refresh ok', { userId: session?.user?.id });
      // Backend rotates the refresh token on every /refresh. Persist the
      // rotated value so the next reload still has a usable fallback.
      if (typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
      }
      set({
        user:         session.user,
        accessToken:  session.accessToken,
        refreshToken: session.refreshToken,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[auth] initAuth: refresh failed', err);
      // On definitive auth failure OR timeout, clear the persisted session so
      // the account guard can redirect to /auth/login. Pure network errors
      // (offline, DNS glitch) leave the id in place so we can retry on next mount.
      const isDefinitiveAuthFail =
        (err instanceof ApiError && (err.status === 401 || err.status === 400 || err.status === 404)) ||
        (err instanceof Error && err.message === 'refresh_timeout');
      if (isDefinitiveAuthFail) {
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        set({ user: null, accessToken: null, refreshToken: null });
      }
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
