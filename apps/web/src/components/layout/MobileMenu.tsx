'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, X, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useUIStore } from '@/stores/ui-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { NAV_LINKS } from '@/lib/constants';
import { HONEY_EASE_OUT } from '@/lib/animations';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function MobileMenu() {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount, openCart } = useCartStore();
  const { user } = useAuthStore();
  const asideRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleCartClick = () => {
    closeMobileMenu();
    openCart();
  };

  // Handle open/close side-effects: capture prior focus, ESC key, focus trap, body scroll lock.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    const el = asideRef.current;
    // Focus the first focusable element in the drawer
    const focusables = el?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    const first = focusables?.[0];
    if (first) first.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileMenu();
        return;
      }
      if (e.key === 'Tab' && asideRef.current) {
        const nodes = Array.from(
          asideRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
        ).filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null);
        if (nodes.length === 0) return;
        const firstNode = nodes[0];
        const lastNode = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === firstNode) {
          e.preventDefault();
          lastNode.focus();
        } else if (!e.shiftKey && document.activeElement === lastNode) {
          e.preventDefault();
          firstNode.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus after close animation
      const target = previousFocus.current;
      if (target && typeof target.focus === 'function') {
        // Small microtask so DOM has settled
        queueMicrotask(() => target.focus());
      }
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  const slideTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: HONEY_EASE_OUT };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-[200] bg-midnight/60"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={slideTransition}
            className="fixed top-0 right-0 bottom-0 z-[201] w-[min(340px,90vw)] bg-cream flex flex-col shadow-[-10px_0_50px_rgba(26,21,14,0.14)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-[18px] border-b border-sand shrink-0">
              <Link
                id="mobile-menu-title"
                href="/"
                onClick={closeMobileMenu}
                className="font-clash font-extrabold text-charcoal text-[20px] tracking-[0.02em] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
              >
                SUMOSTA
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="p-1.5 rounded-md text-bark hover:text-honey-500 hover:bg-honey-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
              >
                <X size={22} strokeWidth={1.8} />
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile primary" className="flex-1 py-2 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'flex items-center justify-between px-6 py-[15px] border-b border-sand no-underline font-clash text-[21px] transition-colors focus-visible:outline-none focus-visible:bg-honey-500/10 ' +
                      (active
                        ? 'font-bold text-charcoal bg-honey-500/5'
                        : 'font-medium text-bark hover:text-charcoal hover:bg-honey-500/5')
                    }
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={
                        'text-[16px] ' +
                        (active ? 'opacity-80 text-honey-500' : 'opacity-30 text-bark')
                      }
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick actions */}
            <div className="px-6 py-4 border-t border-sand flex flex-col gap-3 shrink-0">
              {/* Cart button */}
              <button
                type="button"
                onClick={handleCartClick}
                className="flex items-center justify-between w-full bg-honey-100 border border-honey-300 rounded-lg px-[18px] py-[13px] text-charcoal font-clash font-semibold text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={16} strokeWidth={2} />
                  Cart
                </span>
                {itemCount > 0 && (
                  <span className="bg-honey-500 text-cream text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {/* Account */}
              {user ? (
                <Link
                  href="/account/orders"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5 py-3 no-underline text-bark font-satoshi text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                >
                  <span className="w-8 h-8 rounded-full bg-honey-500/10 text-honey-500 flex items-center justify-center font-clash font-bold text-[13px] shrink-0">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </span>
                  My Account
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 text-center bg-honey-400 hover:bg-honey-500 transition-colors text-charcoal font-clash font-bold text-[14px] px-6 py-[13px] rounded-lg no-underline tracking-[0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-600"
                >
                  <User size={16} strokeWidth={2} />
                  Sign In
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
