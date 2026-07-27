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
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside>
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5E7EB] p-6 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <span className="font-jakarta text-[#F97316] font-bold text-lg">
                {user?.name?.charAt(0) ?? 'U'}
              </span>
            </div>
            <p className="font-jakarta text-charcoal font-semibold text-sm">{user?.name ?? 'My Account'}</p>
            <p className="font-jakarta text-gray-600 text-xs mt-0.5">{user?.email}</p>
          </div>

          <nav className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3.5 font-jakarta text-sm transition-colors border-b border-[#E5E7EB] last:border-0',
                    active
                      ? 'text-[#F97316] bg-orange-50 font-semibold'
                      : 'text-gray-700 hover:bg-[#FAF7F2]'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 font-jakarta text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
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
