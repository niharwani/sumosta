'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { NAV_LINKS } from '@/lib/constants';

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCartStore();
  const { user } = useAuthStore();
  const { openMobileMenu } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const frosted = !isHome || scrolled;

  return (
    <div
      className={
        'transition-[background,box-shadow] duration-300 ' +
        (frosted
          ? 'bg-cream/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent shadow-none')
      }
    >
      <div className="max-w-content mx-auto px-5 flex items-center justify-between gap-6 h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-col shrink-0 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
          aria-label="SUMOSTA — Home"
        >
          <span className="font-clash font-bold text-charcoal text-[20px] leading-none tracking-[0.02em]">
            SUMOSTA
          </span>
          <span className="font-bespoke italic text-charcoal text-[10px] font-bold leading-none tracking-[0.06em] mt-[2px]">
            indulgence that cares
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="sum-desktop-nav hidden lg:flex gap-7 items-center flex-1 justify-center"
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'font-satoshi text-[14px] whitespace-nowrap transition-colors duration-200 ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm px-1 py-0.5 ' +
                  (active
                    ? 'text-charcoal font-semibold'
                    : 'text-bark hover:text-honey-500 font-medium')
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: search + account + cart + hamburger */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search icon */}
          <Link
            href="/search"
            aria-label="Search products"
            className="p-1.5 rounded-md text-bark hover:text-honey-500 hover:bg-honey-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 flex items-center justify-center"
          >
            <Search size={20} strokeWidth={1.8} />
          </Link>

          {/* Account — desktop only, reserve space to avoid layout shift */}
          <div className="hidden lg:flex items-center justify-center min-w-[40px] h-[34px]">
            {mounted ? (
              user ? (
                <Link
                  href="/account/orders"
                  aria-label={`My Account — ${user.name ?? 'Signed in'}`}
                  title={user.name ?? 'My Account'}
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-honey-500/10 text-honey-500 hover:bg-honey-500/20 transition-colors font-clash font-bold text-[14px] no-underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                >
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  aria-label="Sign in to your account"
                  className="inline-flex items-center gap-1.5 font-satoshi text-[13px] text-bark hover:text-honey-500 transition-colors font-medium whitespace-nowrap no-underline px-2 py-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                >
                  <User size={16} strokeWidth={1.8} />
                  Sign In
                </Link>
              )
            ) : null}
          </div>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            aria-label={mounted && itemCount > 0 ? `Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Open cart'}
            className="relative p-1.5 rounded-md text-bark hover:text-honey-500 hover:bg-honey-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 flex items-center justify-center"
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            {mounted && itemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-0 right-0 bg-honey-500 text-cream text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center leading-none px-[2px]"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={openMobileMenu}
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            className="sum-hamburger flex lg:hidden flex-col justify-center items-start gap-[5px] py-[7px] px-[5px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 group"
          >
            <span className="block w-[22px] h-[2px] rounded bg-bark group-hover:bg-honey-500 transition-colors" />
            <span className="block w-[22px] h-[2px] rounded bg-bark group-hover:bg-honey-500 transition-colors" />
            <span className="block w-[14px] h-[2px] rounded bg-bark group-hover:bg-honey-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
