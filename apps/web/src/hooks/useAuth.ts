import { useAuthStore } from '@/stores/auth-store';
import type { User } from 'shared';

export function useAuth() {
  const user          = useAuthStore((s) => s.user);
  const accessToken   = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading     = useAuthStore((s) => s.isLoading);
  const login         = useAuthStore((s) => s.login);
  const logout        = useAuthStore((s) => s.logout);
  const setUser       = useAuthStore((s) => s.setUser);

  return {
    user,
    accessToken,
    isAuthenticated: user !== null,
    isInitialized,
    isLoading,
    login,
    logout,
    updateUser: (u: User) => setUser(u),
  };
}
