'use client';
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
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside>
          <div className="bg-cream-warm rounded-2xl border border-sand p-6 mb-4">
            <div className="w-12 h-12 rounded-full bg-honey-200 flex items-center justify-center mb-3">
              <span className="font-clash text-honey-600 font-bold text-lg">
                {user?.name?.charAt(0) ?? 'U'}
              </span>
            </div>
            <p className="font-satoshi text-charcoal font-semibold text-sm">{user?.name ?? 'My Account'}</p>
            <p className="font-satoshi text-earth text-xs mt-0.5">{user?.email}</p>
          </div>

          <nav className="bg-white rounded-2xl border border-sand overflow-hidden">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3.5 font-satoshi text-sm transition-colors border-b border-sand last:border-0',
                    active
                      ? 'text-honey-600 bg-honey-50 font-semibold'
                      : 'text-bark hover:bg-cream-warm'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 font-satoshi text-sm text-earth hover:text-terracotta hover:bg-terracotta-light transition-colors"
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
  );
}
