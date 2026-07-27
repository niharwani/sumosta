'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Shop',      href: '/shop' },
  { label: 'Gift Boxes', href: '/shop/gift-boxes' },
  { label: 'Our Story', href: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
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
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: '#2C2417',
            letterSpacing: '0.02em',
            textDecoration: 'none',
          }}
        >
          SUMOSTA
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: 'none',
            gap: '28px',
            alignItems: 'center',
          }}
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
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button
            onClick={openCart}
            aria-label="Open cart"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#5C4A32',
              position: 'relative',
              padding: 0,
            }}
          >
            🛍
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-9px',
                  background: '#F5A623',
                  color: '#1A150E',
                  fontSize: '9px',
                  fontWeight: 700,
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .sum-desktop-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
