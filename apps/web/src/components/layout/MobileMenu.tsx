'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { NAV_LINKS } from '@/lib/constants';

export default function MobileMenu() {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount, openCart } = useCartStore();
  const { user } = useAuthStore();

  const handleCartClick = () => {
    closeMobileMenu();
    openCart();
  };

  if (!isMobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeMobileMenu}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(26,21,14,0.52)',
          animation: 'sum-mob-fade 0.22s ease both',
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
          width: 'min(340px, 90vw)',
          background: '#FFFDF8',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 50px rgba(26,21,14,0.14)',
          animation: 'sum-mob-slide 0.3s cubic-bezier(0.25,0.1,0.25,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid #F0E6D3',
          flexShrink: 0,
        }}>
          <Link
            href="/"
            onClick={closeMobileMenu}
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 800, fontSize: '20px',
              color: '#2C2417', letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            SUMOSTA
          </Link>
          <button
            onClick={closeMobileMenu}
            aria-label="Close menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '28px', color: '#5C4A32', lineHeight: 1,
              padding: '2px 6px', borderRadius: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '15px 24px',
                  borderBottom: '1px solid #F0E6D3',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: active ? 700 : 500,
                  fontSize: '21px',
                  color: active ? '#2C2417' : '#5C4A32',
                  background: active ? 'rgba(245,166,35,0.05)' : 'transparent',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >
                {link.label}
                <span style={{ fontSize: '16px', opacity: active ? 0.8 : 0.3, color: active ? '#D4891A' : '#5C4A32' }}>→</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0E6D3', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          {/* Cart button */}
          <button
            onClick={handleCartClick}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%',
              background: '#FFF0D6', border: '1px solid #FFCC66',
              borderRadius: '8px', padding: '13px 18px',
              cursor: 'pointer', color: '#2C2417',
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 600, fontSize: '14px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} strokeWidth={2} />
              Cart
            </span>
            {itemCount > 0 && (
              <span style={{
                background: '#F5A623', color: '#1A150E',
                fontSize: '11px', fontWeight: 700,
                padding: '2px 8px', borderRadius: '999px',
              }}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* Account */}
          {user ? (
            <Link
              href="/account/orders"
              onClick={closeMobileMenu}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 0',
                textDecoration: 'none', color: '#5C4A32',
                fontSize: '14px', fontWeight: 500,
                fontFamily: 'var(--font-manrope), sans-serif',
              }}
            >
              <span style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(212,137,26,0.12)', color: '#D4891A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-bricolage), sans-serif',
                fontWeight: 700, fontSize: '13px', flexShrink: 0,
              }}>
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
              My Account
            </Link>
          ) : (
            <Link
              href="/auth/login"
              onClick={closeMobileMenu}
              style={{
                display: 'block', textAlign: 'center',
                background: '#2C2417', color: '#FFFDF8',
                fontWeight: 700, fontSize: '14px',
                padding: '13px 24px', borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'var(--font-bricolage), sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes sum-mob-fade  { from { opacity: 0; }          to { opacity: 1; } }
        @keyframes sum-mob-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
