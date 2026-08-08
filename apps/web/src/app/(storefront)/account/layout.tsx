'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { User, Package, MapPin, Lock, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { HONEY_EASE_OUT } from '@/lib/animations';

const NAV = [
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/security', label: 'Password & Security', icon: Lock },
] as const;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized, logout } = useAuthStore();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname ?? '/account/orders')}`);
    }
  }, [user, isInitialized, router, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      router.push(
        `/auth/login?next=${encodeURIComponent(pathname ?? '/account/orders')}&error=session_expired`,
      );
    };
    window.addEventListener('sumosta:auth-expired', handler);
    return () => window.removeEventListener('sumosta:auth-expired', handler);
  }, [router, pathname]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Non-blocking: still clear local state and redirect
    } finally {
      logout();
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      router.push('/auth/login');
    }
  };

  // Waiting for initAuth to complete
  if (!isInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[--cream]"
        role="status"
        aria-label="Loading your account"
      >
        <div className="flex flex-col items-center gap-4">
          <HoneycombLoader size="lg" />
          <p className="font-satoshi text-[--earth] text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  // Redirect in progress — render nothing
  if (!user) return null;

  return (
    <div className="bg-[--cream] min-h-screen pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-10">
          {/* Sidebar */}
          <aside className="md:sticky md:top-28 md:self-start">
            {/* User card */}
            <div className="hidden md:block bg-[--cream-warm] rounded-2xl border border-[--sand] p-5 mb-3">
              <div className="w-11 h-11 rounded-full bg-[--honey-100] flex items-center justify-center mb-3">
                <span className="font-clash font-bold text-lg text-[--honey-600]">
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <p className="font-satoshi font-semibold text-sm text-[--charcoal] leading-tight m-0">
                {user.name ?? 'My Account'}
              </p>
              <p
                className="font-satoshi text-xs text-[--earth] mt-0.5 truncate"
                title={user.email}
              >
                {user.email}
              </p>
            </div>

            {/* Desktop nav */}
            <nav
              aria-label="Account navigation"
              className="hidden md:block bg-[--cream-warm] rounded-2xl border border-[--sand] overflow-hidden"
            >
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (pathname?.startsWith(href + '/') ?? false);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'font-satoshi flex items-center gap-3 px-5 py-3.5 text-sm transition-colors border-b last:border-0 min-h-[44px]',
                      active
                        ? 'bg-[--honey-100] text-[--honey-600] font-semibold border-[--sand]'
                        : 'text-[--bark] hover:bg-[--honey-50] border-[--sand] focus-visible:bg-[--honey-50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]',
                    )}
                  >
                    <Icon size={16} aria-hidden />
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(true)}
                aria-label="Sign out of your account"
                className="w-full font-satoshi flex items-center gap-3 px-5 py-3.5 text-sm text-[--earth] hover:text-[--terracotta] hover:bg-[--terracotta-light] transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
              >
                <LogOut size={16} aria-hidden />
                Sign Out
              </button>
            </nav>

            {/* Mobile nav — horizontal scrollable pills */}
            <nav
              aria-label="Account navigation"
              className="md:hidden -mx-6 px-6 mb-4"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (pathname?.startsWith(href + '/') ?? false);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'font-satoshi flex items-center gap-2 px-4 py-2.5 rounded-full text-sm whitespace-nowrap border transition-colors snap-start min-h-[44px]',
                        active
                          ? 'bg-[--honey-400] text-[--charcoal] border-[--honey-400] font-semibold'
                          : 'bg-[--cream-warm] text-[--bark] border-[--sand]',
                      )}
                    >
                      <Icon size={14} aria-hidden />
                      {label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setConfirmLogoutOpen(true)}
                  aria-label="Sign out of your account"
                  className="font-satoshi flex items-center gap-2 px-4 py-2.5 rounded-full text-sm whitespace-nowrap border border-[--sand] bg-[--cream-warm] text-[--earth] min-h-[44px]"
                >
                  <LogOut size={14} aria-hidden />
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog.Root open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <AnimatePresence>
          {confirmLogoutOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-[--overlay]"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                aria-describedby="logout-desc"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-[--cream-warm] border border-[--sand] rounded-2xl p-6 shadow-[0_12px_40px_rgba(44,36,23,0.16)]"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.96 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0, scale: 1 }
                      : { opacity: 0, scale: 0.98 }
                  }
                  transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
                >
                  <Dialog.Title className="font-clash text-xl text-[--charcoal] m-0">
                    Sign out?
                  </Dialog.Title>
                  <Dialog.Description
                    id="logout-desc"
                    className="font-satoshi text-sm text-[--bark] mt-2"
                  >
                    You&apos;ll need to sign back in to view your orders and account details.
                  </Dialog.Description>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        disabled={loggingOut}
                        className="flex-1 font-satoshi text-sm font-semibold text-[--bark] border border-[--sand] rounded-full px-5 py-2.5 min-h-[44px] hover:bg-[--cream] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={handleConfirmLogout}
                      disabled={loggingOut}
                      className="flex-1 inline-flex items-center justify-center gap-2 font-satoshi text-sm font-semibold text-[--charcoal] bg-[--honey-400] hover:bg-[--honey-500] rounded-full px-5 py-2.5 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors disabled:opacity-60"
                    >
                      {loggingOut ? <HoneycombLoader size="sm" /> : null}
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close dialog"
                      className="absolute top-3 right-3 p-2 text-[--earth] hover:text-[--charcoal] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded-full"
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      {/* Small helper: hide scrollbar on mobile nav */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
