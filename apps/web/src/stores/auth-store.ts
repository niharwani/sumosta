import { create } from 'zustand';
import type { User } from 'shared';
import { authApi, ApiError } from '@/lib/api';

const USER_ID_KEY = 'sumosta_user_id';

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
  // NOTE: refreshToken is held in memory as a fallback for the /refresh
  // endpoint when the httpOnly cookie is unavailable (e.g. cross-site
  // dev). It is intentionally NOT written to localStorage.
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ID_KEY, user.id);
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

    const storedUserId = localStorage.getItem(USER_ID_KEY);

    if (!storedUserId) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true });

    try {
      const session = await authApi.refresh();
      set({
        user:         session.user,
        accessToken:  session.accessToken,
        refreshToken: session.refreshToken,
      });
    } catch (err) {
      // Only wipe the persisted id on a definitive auth failure (401/400).
      // Network errors leave the id in place so we can retry later.
      if (err instanceof ApiError && (err.status === 401 || err.status === 400 || err.status === 404)) {
        localStorage.removeItem(USER_ID_KEY);
        set({ user: null, accessToken: null, refreshToken: null });
      }
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
