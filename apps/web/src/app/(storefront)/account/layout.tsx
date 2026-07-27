'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const NAV = [
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized, logout } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth/login');
    }
  }, [user, isInitialized, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Waiting for initAuth to complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(245,166,35,0.2)',
              borderTopColor: '#F5A623',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', color: '#8B7355', fontSize: '14px' }}>
            Loading...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Redirect in progress — render nothing
  if (!user) return null;

  return (
    <div
      style={{ background: '#FAF7F2', minHeight: '100vh', paddingTop: '7rem' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid rgba(229,231,235,0.8)',
                padding: '20px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(245,166,35,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-bricolage), sans-serif',
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#D4891A',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#2C2417',
                  margin: '0 0 2px',
                }}
              >
                {user.name ?? 'My Account'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-manrope), sans-serif',
                  fontSize: '12px',
                  color: '#8B7355',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </p>
            </div>

            <nav
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid rgba(229,231,235,0.8)',
                overflow: 'hidden',
              }}
            >
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3.5 text-sm transition-colors border-b last:border-0',
                      active
                        ? 'bg-amber-50 text-[#D4891A] font-semibold border-amber-100'
                        : 'text-[#5C4A32] hover:bg-[#FAF7F2] border-[rgba(229,231,235,0.6)]',
                    )}
                    style={{ fontFamily: 'var(--font-manrope), sans-serif', textDecoration: 'none' }}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-[#8B7355] hover:text-red-600 hover:bg-red-50 transition-colors"
                style={{ fontFamily: 'var(--font-manrope), sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
