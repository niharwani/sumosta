'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

const NAV_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'Shop',         href: '/shop' },
  { label: 'Gift Boxes',   href: '/shop/gift-boxes' },
  { label: 'Our Story',    href: '/about' },
  { label: 'Evidence Hub', href: '/evidence-hub' },
];

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
      style={{
        background: frosted ? 'rgba(255,253,248,0.95)' : 'transparent',
        backdropFilter: frosted ? 'blur(10px)' : 'none',
        boxShadow: frosted ? '0 1px 3px rgba(44,36,23,0.06)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            color: '#2C2417',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}>
            SUMOSTA
          </span>
          <span style={{
            fontFamily: 'var(--font-instrument), serif',
            fontStyle: 'italic',
            fontSize: '10px',
            color: '#8B7355',
            letterSpacing: '0.06em',
            marginTop: '2px',
            lineHeight: 1,
          }}>
            indulgence that cares
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{ display: 'none', gap: '28px', alignItems: 'center', flex: 1, justifyContent: 'center' }}
          className="sum-desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '14px',
                  color: active ? '#2C2417' : '#5C4A32',
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'color 0.25s ease',
                  fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: account + cart + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Account — desktop only */}
          {mounted && (
            user ? (
              <Link
                href="/account/orders"
                aria-label="My Account"
                title={user.name ?? 'My Account'}
                className="navbar-account-avatar sum-desktop-only"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(212,137,26,0.12)',
                  color: '#D4891A',
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'background 0.2s ease',
                }}
              >
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="navbar-signin-link sum-desktop-only"
                style={{
                  fontSize: '13px',
                  color: '#5C4A32',
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
              >
                Sign In
              </Link>
            )
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="navbar-cart-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5C4A32',
              position: 'relative',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            {mounted && itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  background: '#F5A623',
                  color: '#1A150E',
                  fontSize: '9px',
                  fontWeight: 700,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '0 2px',
                }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="sum-hamburger"
            onClick={openMobileMenu}
            aria-label="Open navigation menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '7px 5px',
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '5px',
              borderRadius: '6px',
            }}
          >
            <span style={{ width: '22px', height: '2px', background: '#5C4A32', display: 'block', borderRadius: '2px' }} />
            <span style={{ width: '22px', height: '2px', background: '#5C4A32', display: 'block', borderRadius: '2px' }} />
            <span style={{ width: '14px', height: '2px', background: '#5C4A32', display: 'block', borderRadius: '2px' }} />
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .sum-desktop-nav  { display: flex !important; }
          .sum-hamburger    { display: none !important; }
          .sum-desktop-only { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .sum-hamburger    { display: flex !important; }
          .sum-desktop-only { display: none !important; }
        }
        .navbar-account-avatar:hover { background: rgba(212,137,26,0.2) !important; }
        .navbar-signin-link:hover { color: #D4891A !important; }
        .navbar-cart-btn:hover { color: #D4891A !important; background: rgba(212,137,26,0.08) !important; }
        .sum-hamburger:hover span { background: #D4891A !important; }
      `}</style>
    </div>
  );
}
