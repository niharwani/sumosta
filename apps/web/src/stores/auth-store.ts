import { create } from 'zustand';
import type { User } from 'shared';

const ACCESS_KEY = 'sumosta_access_token';
const REFRESH_KEY = 'sumosta_refresh_token';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,

  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },

  setUser: (user) => set({ user }),

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    set({ accessToken, refreshToken });
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const storedAccess = localStorage.getItem(ACCESS_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_KEY);

    if (!storedAccess && !storedRefresh) return;

    set({ isLoading: true });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedAccess}` },
      });

      if (res.ok) {
        const { data } = await res.json();
        set({ user: data, accessToken: storedAccess, refreshToken: storedRefresh });
      } else if (storedRefresh) {
        // Attempt silent refresh
        const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        if (refreshRes.ok) {
          const { data } = await refreshRes.json();
          get().login(data.user, data.accessToken, data.refreshToken);
        } else {
          get().logout();
        }
      } else {
        get().logout();
      }
    } catch {
      // Network failure — keep stored tokens, retry later
    } finally {
      set({ isLoading: false });
    }
  },
}));
